const https = require('https');
const http = require('http');
const crypto = require('crypto');
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
      message: res.msg || 'Ulanish muvaffaqiyatli'
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
 * Xodimlar va talabalar ro'yxatini olish (Passport ID bilan)
 */
async function fetchHikPersonList(pageNo = 1, pageSize = 100) {
  try {
    const res = await makeHikRequest('/artemis/api/resource/v1/person/personList', { pageNo, pageSize });
    if (res && res.data && Array.isArray(res.data.list)) {
      return res.data;
    }
    // Fallback v2
    const res2 = await makeHikRequest('/artemis/api/resource/v2/person/personList', { pageNo, pageSize });
    if (res2 && res2.data && Array.isArray(res2.data.list)) {
      return res2.data;
    }
    return res.data || { list: [], total: 0 };
  } catch (err) {
    console.error('[HikCentral] fetchHikPersonList error:', err.message);
    throw err;
  }
}

/**
 * Turniket/Face ID kirish-chiqish voqealarini olish
 * @param {Object} params { startTime, endTime, pageNo, pageSize }
 */
async function fetchDoorEvents({ startTime, endTime, pageNo = 1, pageSize = 200 }) {
  try {
    const payload = {
      pageNo,
      pageSize,
      startTime: startTime || new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
      endTime: endTime || new Date(new Date().setHours(23, 59, 59, 999)).toISOString()
    };

    const res = await makeHikRequest('/artemis/api/acs/v1/door/events', payload);
    if (res && res.data && Array.isArray(res.data.list)) {
      return res.data;
    }
    // Fallback v2
    const res2 = await makeHikRequest('/artemis/api/acs/v2/door/events', payload);
    if (res2 && res2.data && Array.isArray(res2.data.list)) {
      return res2.data;
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
  // inAndOutType: 1=In, 0=Out, or string
  if (event.inAndOutType === 1 || event.inAndOutType === '1' || event.direction === 'in') return 'in';
  if (event.inAndOutType === 0 || event.inAndOutType === '0' || event.direction === 'out') return 'out';
  
  const doorName = (event.doorName || event.deviceName || '').toLowerCase();
  if (doorName.includes('kirish') || doorName.includes('in') || doorName.includes('entry')) return 'in';
  if (doorName.includes('chiqish') || doorName.includes('out') || doorName.includes('exit')) return 'out';
  
  return 'in'; // standart holatda kirish
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

  let pageNo = 1;
  const pageSize = 200;
  let totalProcessed = 0;
  let hasMore = true;

  // Barcha talabalarning pasport ID larini xotiraga yuklash (tezkor qidirish uchun)
  const students = db.prepare('SELECT id, external_id, first_name, last_name, group_code FROM student').all();
  const studentByPassport = new Map();
  for (const s of students) {
    const norm = normalizePassport(s.external_id);
    if (norm) {
      studentByPassport.set(norm, s);
    }
  }

  // Talabalar bo'yicha kunlik voqealar yig'indisi
  const dailyStudentEvents = new Map(); // studentId -> { student, events: [] }

  while (hasMore) {
    const eventData = await fetchDoorEvents({ startTime, endTime, pageNo, pageSize });
    const list = eventData.list || [];
    if (list.length === 0) {
      hasMore = false;
      break;
    }

    for (const evt of list) {
      // HikCentral passport / certificate field
      const rawPassport = evt.certificateNo || evt.jobNo || evt.certNo || evt.personId || '';
      const normPassport = normalizePassport(rawPassport);
      const student = studentByPassport.get(normPassport);

      const direction = resolveDirection(evt);
      const eventTime = evt.eventTime || evt.time || new Date().toISOString();
      const eventId = evt.eventId || evt.eventIndexCode || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      // access_control_log jadvaliga yozish
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
          evt.personName || (student ? `${student.first_name} ${student.last_name}` : null),
          eventTime,
          direction,
          evt.doorName || null,
          evt.deviceName || null,
          evt.cardNo || null,
          JSON.stringify(evt),
          new Date().toISOString()
        );
      } catch (logErr) {
        // Agar id takrorlangan bo'lsa e'tiborsiz qoldiramiz
      }

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

    if (list.length < pageSize) {
      hasMore = false;
    } else {
      pageNo++;
    }
  }

  // Endi har bir talabaning kunlik birinchi kirishi va oxirgi chiqishini hisoblash
  let updatedAttendanceCount = 0;
  const nowIso = new Date().toISOString();

  for (const [studentId, data] of dailyStudentEvents.entries()) {
    // Vaqt bo'yicha tartiblash
    data.events.sort((a, b) => new Date(a.time) - new Date(b.time));

    const inEvents = data.events.filter(e => e.direction === 'in');
    const outEvents = data.events.filter(e => e.direction === 'out');

    const firstIn = inEvents.length > 0 ? inEvents[0].time : (data.events[0]?.time || null);
    const lastOut = outEvents.length > 0 ? outEvents[outEvents.length - 1].time : null;

    const inCount = inEvents.length;
    const outCount = outEvents.length;

    // Statusni aniqlash: Agar 09:15 dan kech kelgan bo'lsa 'late', aks holda 'present'
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

  const presentCount = attStats.total_present || 0;
  const lateCount = attStats.total_late || 0;
  const inCampusCount = attStats.currently_in_campus || 0;
  const absentCount = Math.max(0, totalStudents - presentCount);

  return {
    date: dateStr,
    totalStudents,
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
    total,
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

module.exports = {
  getHikConfig,
  makeHikRequest,
  testHikCentralConnection,
  fetchHikPersonList,
  fetchDoorEvents,
  syncCampusAttendance,
  getCampusAttendanceSummary,
  getCampusAttendanceList,
  getStudentAttendanceHistory
};
