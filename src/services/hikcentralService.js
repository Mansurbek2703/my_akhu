const https = require('https');
const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const config = require('../config');
const { db } = require('../db/database');

/**
 * HikCentral Artemis OpenAPI Service
 * Universitet Face ID va turniket orqali kirish-chiqish va davomatni boshqarish
 */

// HikCentral sozlamalari
function getHikConfig() {
  return config.hikcentral || {
    enabled: true,
    host: 'https://172.20.20.8',
    appKey: '35525590',
    appSecret: 'KkW8WbxTG5X6S9bSN3BU',
    verifySsl: false
  };
}

/**
 * Artemis HMAC-SHA256 imzolash va so'rov yuborish
 */
function makeHikRequest(apiPath, payload = null, method = 'POST') {
  return new Promise((resolve, reject) => {
    const cfg = getHikConfig();
    const urlObj = new URL(cfg.host + apiPath);
    const isHttps = urlObj.protocol === 'https:';

    const timestamp = Date.now().toString();
    const accept = 'application/json';
    const contentType = 'application/json;charset=UTF-8';

    // String to Sign formati:
    // HTTP_METHOD\nAccept\nContent-Type\nx-ca-key:...\nx-ca-timestamp:...\nPath
    const headersToSign = `x-ca-key:${cfg.appKey}\nx-ca-timestamp:${timestamp}`;
    const stringToSign = `${method}\n${accept}\n${contentType}\n${headersToSign}\n${apiPath}`;

    const signature = crypto
      .createHmac('sha256', cfg.appSecret)
      .update(stringToSign, 'utf8')
      .digest('base64');

    const bodyData = payload ? JSON.stringify(payload) : '';

    const options = {
      protocol: urlObj.protocol,
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Accept': accept,
        'Content-Type': contentType,
        'X-Ca-Key': cfg.appKey,
        'X-Ca-Timestamp': timestamp,
        'X-Ca-Signature': signature,
        'X-Ca-Signature-Headers': 'x-ca-key,x-ca-timestamp',
        'Content-Length': Buffer.byteLength(bodyData)
      },
      timeout: 10000,
      rejectUnauthorized: cfg.verifySsl === true
    };

    const client = isHttps ? https : http;
    const req = client.request(options, (res) => {
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(rawData);
          resolve(parsed);
        } catch (e) {
          resolve({ code: 'RAW', statusCode: res.statusCode, raw: rawData });
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`HikCentral serveriga ulanish vaqti tugadi (Timeout 10s: ${cfg.host})`));
    });

    req.on('error', (err) => {
      reject(new Error(`HikCentral tarmoq xatoligi: ${err.message}`));
    });

    if (bodyData) {
      req.write(bodyData);
    }
    req.end();
  });
}

/**
 * HikCentral serveriga ulanishni tekshirish
 */
async function testHikCentralConnection() {
  const cfg = getHikConfig();
  try {
    const res = await makeHikRequest('/artemis/api/resource/v1/person/personList', { pageNo: 1, pageSize: 1 });
    return {
      success: true,
      host: cfg.host,
      appKey: cfg.appKey,
      responseCode: res.code,
      message: res.msg || 'Ulanish muvaffaqiyatli',
      totalPersons: (res.data && res.data.total) ? res.data.total : 0
    };
  } catch (err) {
    return {
      success: false,
      host: cfg.host,
      appKey: cfg.appKey,
      error: err.message
    };
  }
}

/**
 * Universitetdagi barcha turniket eshiklari ro'yxatini olish
 */
async function fetchDoorList() {
  try {
    const res = await makeHikRequest('/artemis/api/resource/v1/acsDoor/acsDoorList', { pageNo: 1, pageSize: 100 });
    if (res && res.data && Array.isArray(res.data.list)) {
      return res.data.list;
    }
    return [
      { doorIndexCode: "1", doorName: "Turniket_Kirish1" },
      { doorIndexCode: "4", doorName: "Turniket_kirish2_Door_1" },
      { doorIndexCode: "2", doorName: "Turniket_chiqish1_Door_1" },
      { doorIndexCode: "3", doorName: "Turniket_chiqish2_Door_1" }
    ];
  } catch (err) {
    console.warn('[HikCentral] fetchDoorList warning, using fallback turnstiles:', err.message);
    return [
      { doorIndexCode: "1", doorName: "Turniket_Kirish1" },
      { doorIndexCode: "4", doorName: "Turniket_kirish2_Door_1" },
      { doorIndexCode: "2", doorName: "Turniket_chiqish1_Door_1" },
      { doorIndexCode: "3", doorName: "Turniket_chiqish2_Door_1" }
    ];
  }
}

/**
 * Xodimlar va talabalar ro'yxatini xotiraga yuklash (personId -> personCode / Passport ID)
 */
async function fetchHikPersonMapping() {
  const personIdToPassport = new Map();
  const personIdToName = new Map();
  let pageNo = 1;
  const pageSize = 100;
  let hasMore = true;

  while (hasMore) {
    const res = await makeHikRequest('/artemis/api/resource/v1/person/personList', { pageNo, pageSize });
    if (res && res.data && Array.isArray(res.data.list)) {
      const list = res.data.list;
      for (const p of list) {
        const passport = normalizePassport(p.personCode || p.certificateNo || '');
        if (p.personId) {
          personIdToPassport.set(p.personId.toString(), passport);
          personIdToName.set(p.personId.toString(), p.personName || '');
        }
      }
      if (list.length < pageSize || (res.data.total && pageNo * pageSize >= res.data.total)) {
        hasMore = false;
      } else {
        pageNo++;
      }
    } else {
      hasMore = false;
    }
  }

  return { personIdToPassport, personIdToName };
}

/**
 * Turniket/Face ID kirish-chiqish voqealarini olish
 */
async function fetchDoorEvents({ startTime, endTime, pageNo = 1, pageSize = 200, doorIndexCodes = null }) {
  try {
    const doors = doorIndexCodes && doorIndexCodes.length > 0 
      ? doorIndexCodes 
      : ["1", "2", "3", "4"];

    const payload = {
      pageNo,
      pageSize,
      startTime,
      endTime,
      doorIndexCodes: doors,
      eventType: 196893 // Legal card / face authentication passed
    };

    const res = await makeHikRequest('/artemis/api/acs/v1/door/events', payload);
    if (res && res.data && Array.isArray(res.data.list)) {
      return res.data;
    }
    return res.data || { list: [], total: 0 };
  } catch (err) {
    console.error('[HikCentral] fetchDoorEvents error:', err.message);
    throw err;
  }
}

/**
 * Pasport ID sini tozalash va standartlashtirish (Masalan: "ad 1234567" -> "AD1234567")
 */
function normalizePassport(passport) {
  if (!passport) return '';
  return passport.toString().toUpperCase().replace(/[^A-Z0-9]/g, '').trim();
}

/**
 * Voqea yo'nalishini aniqlash ('in' yoki 'out')
 */
function resolveDirection(event) {
  const doorName = (event.doorName || '').toLowerCase();
  const code = (event.doorIndexCode || '').toString();

  if (doorName.includes('chiqish') || code === '2' || code === '3') {
    return 'out';
  }
  if (doorName.includes('kirish') || code === '1' || code === '4') {
    return 'in';
  }

  if (event.checkInAndOutType === 1 || event.checkInAndOutType === '1') return 'in';
  if (event.checkInAndOutType === 0 || event.checkInAndOutType === '0') return 'out';

  return 'in';
}

/**
 * Tanlangan sana yoki bugun uchun HikCentral-dan davomat va kirish-chiqishni sinxronlashtirish
 * @param {string} targetDate - 'YYYY-MM-DD'
 */
async function syncCampusAttendance(targetDate = null) {
  const dateStr = targetDate || new Date().toISOString().slice(0, 10);
  const startTime = `${dateStr}T00:00:00+05:00`;
  const endTime = `${dateStr}T23:59:59+05:00`;

  console.log(`[HikCentral] Sinxronizatsiya boshlandi: sana ${dateStr} (${startTime} - ${endTime})`);

  // 1. Turniketlar ro'yxatini aniqlash
  const doors = await fetchDoorList();
  const doorIndexCodes = doors.map(d => d.doorIndexCode.toString());

  // 2. HikCentral personId -> Pasport ID mappingini olish
  const { personIdToPassport, personIdToName } = await fetchHikPersonMapping();
  console.log(`[HikCentral] HikCentral xodimlar/talabalar xaritasi yuklandi: ${personIdToPassport.size} nafar`);

  // 3. Bazadagi talabalarni pasport bo'yicha indekslash
  const students = db.prepare('SELECT id, external_id, first_name, last_name, group_code FROM student').all();
  const studentByPassport = new Map();
  for (const s of students) {
    const norm = normalizePassport(s.external_id);
    if (norm) {
      studentByPassport.set(norm, s);
    }
  }

  // 4. Turniket o'tish voqealarini sahifama-sahifa tortib olish
  let pageNo = 1;
  const pageSize = 200;
  let totalProcessed = 0;
  let hasMore = true;

  const dailyStudentEvents = new Map(); // studentId -> { student, passport, events: [] }

  while (hasMore) {
    const eventData = await fetchDoorEvents({
      startTime,
      endTime,
      pageNo,
      pageSize,
      doorIndexCodes
    });

    const list = eventData.list || [];
    if (list.length === 0) {
      hasMore = false;
      break;
    }

    for (const evt of list) {
      const pid = evt.personId ? evt.personId.toString() : '';
      const normPassport = personIdToPassport.get(pid) || normalizePassport(evt.personCode || evt.certificateNo || '');
      const student = studentByPassport.get(normPassport);

      const direction = resolveDirection(evt);
      const eventTime = evt.eventTime || evt.deviceTime || new Date().toISOString();
      const eventId = evt.eventId || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      // access_control_log ga yozish
      try {
        db.prepare(`
          INSERT INTO access_control_log (
            id, student_id, passport_id, person_name, event_time, direction, door_name, device_name, card_no, raw_payload, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT (id) DO NOTHING
        `).run(
          eventId,
          student ? student.id : null,
          normPassport || 'UNKNOWN',
          evt.personName || personIdToName.get(pid) || (student ? `${student.first_name} ${student.last_name}` : null),
          eventTime,
          direction,
          evt.doorName || null,
          evt.readerName || null,
          evt.cardNo || null,
          JSON.stringify(evt),
          new Date().toISOString()
        );
      } catch (logErr) {}

      if (student) {
        if (!dailyStudentEvents.has(student.id)) {
          dailyStudentEvents.set(student.id, {
            student,
            passport: normPassport,
            events: []
          });
        }
        dailyStudentEvents.get(student.id).events.push({
          time: eventTime,
          direction: direction,
          door: evt.doorName || ''
        });
      }
      totalProcessed++;
    }

    if (list.length < pageSize || (eventData.total && pageNo * pageSize >= eventData.total)) {
      hasMore = false;
    } else {
      pageNo++;
    }
  }

  // 5. Har bir talabaning kunlik birinchi kirishi va oxirgi chiqishini hisoblab saqlash
  let updatedAttendanceCount = 0;
  const nowIso = new Date().toISOString();

  for (const [studentId, data] of dailyStudentEvents.entries()) {
    data.events.sort((a, b) => new Date(a.time) - new Date(b.time));

    const inEvents = data.events.filter(e => e.direction === 'in');
    const outEvents = data.events.filter(e => e.direction === 'out');

    const firstIn = inEvents.length > 0 ? inEvents[0].time : (data.events[0]?.time || null);
    const lastOut = outEvents.length > 0 ? outEvents[outEvents.length - 1].time : null;

    const inCount = inEvents.length;
    const outCount = outEvents.length;

    // Status: 09:15 dan kech kelgan bo'lsa 'late', aks holda 'present'
    let status = 'present';
    if (firstIn) {
      const inDate = new Date(firstIn);
      const hours = inDate.getHours();
      const minutes = inDate.getMinutes();
      if (hours > 9 || (hours === 9 && minutes > 15)) {
        status = 'late';
      }
    }

    const attendanceId = `att_${dateStr}_${studentId}`;

    db.prepare(`
      INSERT INTO campus_attendance (
        id, student_id, passport_id, date, first_in_at, last_out_at, in_count, out_count, status, raw_events, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (student_id, date) DO UPDATE SET
        first_in_at = EXCLUDED.first_in_at,
        last_out_at = EXCLUDED.last_out_at,
        in_count = EXCLUDED.in_count,
        out_count = EXCLUDED.out_count,
        status = EXCLUDED.status,
        raw_events = EXCLUDED.raw_events,
        updated_at = EXCLUDED.updated_at
    `).run(
      attendanceId,
      studentId,
      data.passport,
      dateStr,
      firstIn,
      lastOut,
      inCount,
      outCount,
      status,
      JSON.stringify(data.events),
      nowIso,
      nowIso
    );

    updatedAttendanceCount++;
  }

  console.log(`[HikCentral] Sinxronizatsiya yakunlandi: ${totalProcessed} ta voqea qayta ishlandi, ${updatedAttendanceCount} ta talaba davomati yangilandi.`);
  return {
    success: true,
    date: dateStr,
    totalEvents: totalProcessed,
    studentsPresent: updatedAttendanceCount
  };
}

/**
 * Bugungi yoki tanlangan kundagi umumiy davomat statistikasi
 */
function getCampusAttendanceSummary(targetDate = null) {
  const dateStr = targetDate || new Date().toISOString().slice(0, 10);

  const totalStudents = db.prepare("SELECT COUNT(*) as c FROM student WHERE status = 'active'").get().c;
  
  const attStats = db.prepare(`
    SELECT 
      COUNT(*) as total_present,
      SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as total_late,
      SUM(CASE WHEN in_count > out_count THEN 1 ELSE 0 END) as currently_in_campus
    FROM campus_attendance
    WHERE date = ?
  `).get(dateStr);

  const presentCount = parseInt((attStats && attStats.total_present) || 0, 10);
  const lateCount = parseInt((attStats && attStats.total_late) || 0, 10);
  const inCampusCount = parseInt((attStats && attStats.currently_in_campus) || 0, 10);
  const absentCount = Math.max(0, parseInt(totalStudents, 10) - presentCount);

  return {
    date: dateStr,
    totalStudents: parseInt(totalStudents, 10),
    presentCount,
    lateCount,
    absentCount,
    inCampusCount,
    attendanceRate: totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0
  };
}

/**
 * Kunlik talabalar ro'yxati va ularning kirish-chiqish holati
 */
function getCampusAttendanceList({ date = null, group_code = null, status = null, search = '', page = 1, limit = 50 }) {
  const dateStr = date || new Date().toISOString().slice(0, 10);
  const offset = (Math.max(1, page) - 1) * limit;

  let whereClauses = ["s.status = 'active'"];
  let params = [dateStr];

  if (group_code) {
    whereClauses.push('s.group_code = ?');
    params.push(group_code);
  }

  if (status === 'present') {
    whereClauses.push("ca.status IN ('present', 'late')");
  } else if (status === 'late') {
    whereClauses.push("ca.status = 'late'");
  } else if (status === 'absent') {
    whereClauses.push('ca.id IS NULL');
  } else if (status === 'in_campus') {
    whereClauses.push('ca.in_count > ca.out_count');
  }

  if (search) {
    const sTerm = `%${search.trim().toLowerCase()}%`;
    whereClauses.push('(LOWER(s.first_name) LIKE ? OR LOWER(s.last_name) LIKE ? OR LOWER(s.external_id) LIKE ? OR LOWER(s.group_code) LIKE ?)');
    params.push(sTerm, sTerm, sTerm, sTerm);
  }

  const whereSql = whereClauses.join(' AND ');

  const countQuery = `
    SELECT COUNT(*) as total
    FROM student s
    LEFT JOIN campus_attendance ca ON ca.student_id = s.id AND ca.date = ?
    WHERE ${whereSql}
  `;
  const total = db.prepare(countQuery).get(...params).total;

  const dataQuery = `
    SELECT 
      s.id as student_id,
      s.external_id as passport_id,
      s.first_name,
      s.last_name,
      s.group_code,
      s.course,
      s.phone,
      s.photo_url,
      ca.date,
      ca.first_in_at,
      ca.last_out_at,
      COALESCE(ca.in_count, 0) as in_count,
      COALESCE(ca.out_count, 0) as out_count,
      CASE 
        WHEN ca.id IS NULL THEN 'absent'
        ELSE ca.status
      END as attendance_status,
      CASE 
        WHEN ca.in_count > ca.out_count THEN 1 
        ELSE 0 
      END as is_in_campus
    FROM student s
    LEFT JOIN campus_attendance ca ON ca.student_id = s.id AND ca.date = ?
    WHERE ${whereSql}
    ORDER BY 
      CASE WHEN ca.first_in_at IS NOT NULL THEN 0 ELSE 1 END,
      ca.first_in_at ASC,
      s.group_code ASC,
      s.last_name ASC
    LIMIT ? OFFSET ?
  `;

  const list = db.prepare(dataQuery).all(...params, limit, offset);

  return {
    date: dateStr,
    total: parseInt(total, 10),
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    totalPages: Math.ceil(total / limit),
    list
  };
}

/**
 * Bitta talabaning to'liq kirish-chiqish va davomat tarixi
 */
function getStudentAttendanceHistory(studentId, days = 30) {
  const student = db.prepare('SELECT id, external_id, first_name, last_name, group_code, photo_url FROM student WHERE id = ?').get(studentId);
  if (!student) return null;

  const records = db.prepare(`
    SELECT date, first_in_at, last_out_at, in_count, out_count, status, raw_events
    FROM campus_attendance
    WHERE student_id = ?
    ORDER BY date DESC
    LIMIT ?
  `).all(studentId, days);

  const logs = db.prepare(`
    SELECT id, event_time, direction, door_name, device_name
    FROM access_control_log
    WHERE student_id = ?
    ORDER BY event_time DESC
    LIMIT 100
  `).all(studentId);

  return {
    student,
    history: records,
    logs
  };
}

/**
 * HikCentral serveridan shaxs rasmini yuklab olish (Artemis OpenAPI)
 * @param {string|number} personId 
 * @param {string} picUri 
 */
async function downloadPersonPicture(personId, picUri) {
  if (!personId || !picUri) {
    return { success: false, error: "personId yoki picUri ko'rsatilmadi" };
  }

  try {
    const res = await makeHikRequest('/artemis/api/resource/v1/person/picture_data', {
      personId: personId.toString(),
      picUri: picUri.toString()
    });

    const rawData = (res && res.raw) || (res && typeof res.data === 'string' ? res.data : null);
    if (!rawData || typeof rawData !== 'string') {
      return { success: false, error: `Rasm ma'lumoti topilmadi (${res ? res.code || res.statusCode : 'Noma\'lum javob'})` };
    }

    const matches = rawData.match(/^data:image\/([A-Za-z-+]+);base64,(.+)$/);
    let ext = '.jpg';
    let buffer = null;

    if (matches && matches.length === 3) {
      const mime = matches[1].toLowerCase();
      if (mime === 'png') ext = '.png';
      else if (mime === 'webp') ext = '.webp';
      else ext = '.jpg';
      buffer = Buffer.from(matches[2], 'base64');
    } else if (rawData.startsWith('data:image/')) {
      const b64 = rawData.replace(/^data:image\/\w+;base64,/, '');
      buffer = Buffer.from(b64, 'base64');
      ext = '.jpg';
    } else {
      buffer = Buffer.from(rawData, 'base64');
      ext = '.jpg';
    }

    if (!buffer || buffer.length === 0) {
      return { success: false, error: "Rasm buferi bo'sh" };
    }

    return {
      success: true,
      buffer,
      ext,
      size: buffer.length
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Tizimda rasmi mavjud bo'lmagan talabalarning rasmlarini HikCentral turniket serveridan yuklab olib to'ldirish
 */
async function syncMissingStudentPhotos() {
  const cfg = getHikConfig();
  if (!cfg || !cfg.enabled) {
    return { success: false, error: "HikCentral o'chirilgan (disabled)" };
  }

  console.log('[HikCentral] Rasmlari yo\'q talabalarni turniket serverdan sinxronlash boshlandi...');

  // 1. Bazadagi rasmi yo'q talabalar ro'yxatini olish
  const missingStudents = db.prepare(`
    SELECT id, first_name, last_name, external_id, photo_url 
    FROM student 
    WHERE photo_url IS NULL OR photo_url = ''
  `).all();

  if (!missingStudents || missingStudents.length === 0) {
    console.log('[HikCentral] Rasmi mavjud bo\'lmagan talabalar yo\'q. Barcha talabalarda rasm mavjud.');
    const nowIso = new Date().toISOString();
    try {
      db.prepare(`
        INSERT INTO setting (key, value, updated_by, updated_at)
        VALUES ('last_student_photos_sync_at', ?, 'system', ?)
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at
      `).run(nowIso, nowIso);
    } catch (e) {}
    return {
      success: true,
      message: "Barcha talabalarda rasm mavjud",
      totalMissing: 0,
      downloadedCount: 0,
      updatedStudents: []
    };
  }

  console.log(`[HikCentral] Tizimda ${missingStudents.length} nafar talabada rasm yo'q.`);

  // 2. Talabalarni pasport raqami bo'yicha indekslash
  const studentByPassport = new Map();
  for (const st of missingStudents) {
    const norm = normalizePassport(st.external_id);
    if (norm) {
      studentByPassport.set(norm, st);
    }
  }

  // 3. HikCentral Artemis serveridan barcha xodim va talabalarni sahifama-sahifa olish
  let pageNo = 1;
  const pageSize = 100;
  let hasMore = true;
  const matchedPersons = [];

  while (hasMore) {
    let res;
    try {
      res = await makeHikRequest('/artemis/api/resource/v1/person/personList', { pageNo, pageSize });
    } catch (apiErr) {
      console.error(`[HikCentral] personList olishda xatolik (sahifa ${pageNo}):`, apiErr.message);
      break;
    }

    if (res && res.data && Array.isArray(res.data.list)) {
      const list = res.data.list;
      for (const p of list) {
        const normPass = normalizePassport(p.personCode || p.certificateNo || '');
        if (normPass && studentByPassport.has(normPass)) {
          const student = studentByPassport.get(normPass);
          const picUri = p.personPhoto ? p.personPhoto.picUri : null;
          if (picUri) {
            matchedPersons.push({
              student,
              personId: p.personId,
              picUri,
              personName: p.personName
            });
          }
        }
      }

      if (list.length < pageSize || (res.data.total && pageNo * pageSize >= res.data.total)) {
        hasMore = false;
      } else {
        pageNo++;
      }
    } else {
      hasMore = false;
    }
  }

  console.log(`[HikCentral] Turniket serverida ${matchedPersons.length} nafar talabaning rasmi topildi.`);

  // 4. Har bir talabaning rasmini yuklab olib bazaga saqlash
  const uploadDir = config.uploadDir || path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  let downloadedCount = 0;
  let failedCount = 0;
  const updatedStudents = [];

  for (const item of matchedPersons) {
    const { student, personId, picUri } = item;
    try {
      const picResult = await downloadPersonPicture(personId, picUri);
      if (picResult.success && picResult.buffer) {
        const filename = `avatar_${student.id}_${Date.now()}${picResult.ext}`;
        const savePath = path.join(uploadDir, filename);
        fs.writeFileSync(savePath, picResult.buffer);

        const photoUrl = `/api/files/${filename}`;
        const nowIso = new Date().toISOString();

        db.prepare('UPDATE student SET photo_url = ?, updated_at = ? WHERE id = ?').run(
          photoUrl,
          nowIso,
          student.id
        );

        downloadedCount++;
        updatedStudents.push({
          student_id: student.id,
          name: `${student.first_name} ${student.last_name}`,
          passport: student.external_id,
          photo_url: photoUrl,
          size_bytes: picResult.size
        });
        console.log(`[HikCentral] Talaba rasmi saqlandi: ${student.first_name} ${student.last_name} (${student.external_id}) -> ${photoUrl}`);
      } else {
        console.warn(`[HikCentral] Rasm yuklab olinmadi (${student.first_name} ${student.last_name}):`, picResult.error);
        failedCount++;
      }
    } catch (dlErr) {
      console.error(`[HikCentral] Talaba rasmini yuklashda xatolik (${student.first_name}):`, dlErr.message);
      failedCount++;
    }

    await new Promise(resolve => setTimeout(resolve, 150));
  }

  // 5. Oxirgi sinxronizatsiya vaqtini sozlamalar jadvaliga yozish
  const syncFinishIso = new Date().toISOString();
  try {
    db.prepare(`
      INSERT INTO setting (key, value, updated_by, updated_at)
      VALUES ('last_student_photos_sync_at', ?, 'system', ?)
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at
    `).run(syncFinishIso, syncFinishIso);
  } catch (settingErr) {
    console.warn('[HikCentral] last_student_photos_sync_at saqlashda ogohlantirish:', settingErr.message);
  }

  console.log(`[HikCentral] Rasmlar sinxronizatsiyasi yakunlandi: ${downloadedCount} ta yangilandi, ${failedCount} ta xato, jami rasm kutganlar: ${missingStudents.length}.`);

  return {
    success: true,
    totalMissing: missingStudents.length,
    downloadedCount,
    failedCount,
    updatedStudents
  };
}

module.exports = {
  getHikConfig,
  makeHikRequest,
  testHikCentralConnection,
  fetchDoorList,
  fetchHikPersonMapping,
  fetchDoorEvents,
  normalizePassport,
  downloadPersonPicture,
  syncMissingStudentPhotos,
  syncCampusAttendance,
  getCampusAttendanceSummary,
  getCampusAttendanceList,
  getStudentAttendanceHistory
};
