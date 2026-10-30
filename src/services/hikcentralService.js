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
      timeout: 3000,
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
      reject(new Error(`HikCentral serveriga ulanish vaqti tugadi (Timeout 3s: ${cfg.host})`));
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

let cachedPersonMapping = null;
let lastPersonMappingFetch = 0;

/**
 * Xodimlar va talabalar ro'yxatini xotiraga yuklash (personId -> personCode / Passport ID)
 */
async function fetchHikPersonMapping(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedPersonMapping && (now - lastPersonMappingFetch < 3600000)) {
    return cachedPersonMapping;
  }

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

  cachedPersonMapping = { personIdToPassport, personIdToName };
  lastPersonMappingFetch = now;
  return cachedPersonMapping;
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

  let doors = [];
  let personIdToPassport = new Map();
  let personIdToName = new Map();

  try {
    // 1. Turniketlar ro'yxatini aniqlash
    doors = await fetchDoorList();

    // 2. HikCentral personId -> Pasport ID mappingini olish
    const mapRes = await fetchHikPersonMapping();
    personIdToPassport = mapRes.personIdToPassport;
    personIdToName = mapRes.personIdToName;
    console.log(`[HikCentral] HikCentral xodimlar/talabalar xaritasi yuklandi: ${personIdToPassport.size} nafar`);
  } catch (netErr) {
    console.warn(`[HikCentral] Serverga ulanib bo'lmadi (offline/timeout): ${netErr.message}`);
    return {
      success: false,
      offline: true,
      date: dateStr,
      totalEvents: 0,
      studentsPresent: 0,
      message: `HikCentral serveri hozirda nofaol (${netErr.message}). Turniket serveri uchun VPN (Tailscale) yoqilgan bo'lishi kerak. Lokal davomat ma'lumotlari saqlandi.`
    };
  }

  const doorIndexCodes = doors.map(d => d.doorIndexCode.toString());

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

  try {
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
} catch (eventsErr) {
  console.warn(`[HikCentral] Voqealarni tortib olishda xatolik: ${eventsErr.message}`);
  if (totalProcessed === 0) {
    return {
      success: false,
      offline: true,
      date: dateStr,
      totalEvents: 0,
      studentsPresent: 0,
      message: `HikCentral voqealari yuklanmadi (${eventsErr.message}). Lokal ma'lumotlar saqlandi.`
    };
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
      s.moodle_id,
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

  // LMS Timetable bilan solishtirish (har bir talaba uchun)
  const d = new Date(dateStr + "T12:00:00Z");
  const weekday = d.getUTCDay() === 0 ? 7 : d.getUTCDay();

  let ttTodayMap = {};
  try {
    const ttToday = db.prepare(`
      SELECT DISTINCT course_id, subject_code, subject_name, teacher_name, room, time_str, timestart_iso, timeend_iso
      FROM lms_timetable
      WHERE weekday = ? AND timestart >= 1788220800 AND course_id NOT IN (2, 3, 4, 5, 6, 9, 11, 12, 14, 15)
    `).all(weekday);
    for (const tt of ttToday) {
      if (!ttTodayMap[tt.course_id]) ttTodayMap[tt.course_id] = [];
      if (!ttTodayMap[tt.course_id].some(x => x.time_str === tt.time_str)) {
        ttTodayMap[tt.course_id].push(tt);
      }
    }
  } catch (e) {
    // timetable bo'lmasa xatosiz davom etish
  }

  const enrichedList = list.map(st => {
    let courseIds = [];
    try {
      if (st.moodle_id) {
        courseIds = db.prepare(`
          SELECT DISTINCT course_id FROM lms_course_enrollment WHERE moodle_student_id = ?
        `).all(st.moodle_id).map(r => r.course_id);
      }
      if (courseIds.length === 0) {
        courseIds = db.prepare(`
          SELECT DISTINCT course_id FROM lms_student_attendance WHERE student_id = ? OR moodle_student_id = ?
        `).all(st.student_id, st.moodle_id || -1).map(r => r.course_id);
      }
    } catch(e) {}

    let studentLessons = [];
    for (const cId of courseIds) {
      if (ttTodayMap[cId]) {
        studentLessons.push(...ttTodayMap[cId]);
      }
    }

    const seen = new Set();
    const distinctLessons = [];
    for (const l of studentLessons) {
      const key = `${l.course_id}_${l.time_str}`;
      if (!seen.has(key)) {
        seen.add(key);
        distinctLessons.push(l);
      }
    }

    const hasTurniketEntry = Boolean(st.first_in_at);
    let ttStatus = 'no_class';
    let ttBadgeText = "Darsi yo'q";
    let ttBadgeColor = 'neutral';

    if (distinctLessons.length > 0) {
      if (hasTurniketEntry) {
        ttStatus = 'verified';
        ttBadgeText = `Binoda (${distinctLessons.length} dars)`;
        ttBadgeColor = 'success';
      } else {
        ttStatus = 'absent';
        ttBadgeText = `Turniketda yo'q (${distinctLessons.length} dars)`;
        ttBadgeColor = 'danger';
      }
    } else {
      if (hasTurniketEntry) {
        ttStatus = 'in_campus_no_class';
        ttBadgeText = "Binoda (Darsi yo'q)";
        ttBadgeColor = 'info';
      }
    }

    return {
      ...st,
      timetable_info: {
        weekday,
        class_count: distinctLessons.length,
        status: ttStatus,
        badge_text: ttBadgeText,
        badge_color: ttBadgeColor,
        lessons: distinctLessons.map(l => ({
          subject: l.subject_name || l.subject_code,
          code: l.subject_code,
          time: l.time_str,
          room: l.room || 'Xona ko\'rsatilmagan',
          teacher: l.teacher_name || 'O\'qituvchi belgilanmagan'
        }))
      }
    };
  });

  return {
    date: dateStr,
    total: parseInt(total, 10),
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    totalPages: Math.ceil(total / limit),
    list: enrichedList
  };
}

/**
 * Individual talaba uchun LMS dars jadvali va turniket solishtiruvi (Cross-Verification)
 */
function getStudentLmsCrosscheck(studentId, date = null) {
  const dateStr = date || new Date().toISOString().slice(0, 10);
  const d = new Date(dateStr + "T12:00:00Z");
  const weekday = d.getUTCDay() === 0 ? 7 : d.getUTCDay();
  const weekdayNames = {
    1: 'Dushanba',
    2: 'Seshanba',
    3: 'Chorshanba',
    4: 'Payshanba',
    5: 'Juma',
    6: 'Shanba',
    7: 'Yakshanba'
  };

  const student = db.prepare(`
    SELECT id, external_id as passport_id, first_name, last_name, group_code, course, phone, photo_url, moodle_id
    FROM student
    WHERE id = ? OR external_id = ?
  `).get(studentId, studentId);

  if (!student) return null;

  // 1. Campus attendance
  const campus = db.prepare(`
    SELECT * FROM campus_attendance WHERE student_id = ? AND date = ?
  `).get(student.id, dateStr);

  let rawEvents = [];
  if (campus && campus.raw_events) {
    try {
      rawEvents = JSON.parse(campus.raw_events);
    } catch(e) {}
  }

  // 2. Enrolled courses
  let courseIds = [];
  try {
    if (student.moodle_id) {
      courseIds = db.prepare(`
        SELECT DISTINCT course_id FROM lms_course_enrollment WHERE moodle_student_id = ?
      `).all(student.moodle_id).map(r => r.course_id);
    }
    if (courseIds.length === 0) {
      courseIds = db.prepare(`
        SELECT DISTINCT course_id FROM lms_student_attendance WHERE student_id = ? OR moodle_student_id = ?
      `).all(student.id, student.moodle_id || -1).map(r => r.course_id);
    }
  } catch(e) {}

  // 3. Timetable on this weekday
  let rawLessons = [];
  if (courseIds.length > 0) {
    const ph = courseIds.map(() => '?').join(',');
    rawLessons = db.prepare(`
      SELECT DISTINCT course_id, subject_code, subject_name, teacher_name, room, time_str, timestart_iso, timeend_iso
      FROM lms_timetable
      WHERE course_id IN (${ph}) AND weekday = ? AND timestart >= 1788220800 AND course_id NOT IN (2, 3, 4, 5, 6, 9, 11, 12, 14, 15)
      ORDER BY timestart_iso ASC
    `).all(...courseIds, weekday);
  }

  const seenKeys = new Set();
  const distinctLessons = [];
  for (const l of rawLessons) {
    const key = `${l.course_id}_${l.time_str}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      distinctLessons.push(l);
    }
  }

  // 4. LMS Recorded attendance on this date
  let lmsSessions = [];
  try {
    lmsSessions = db.prepare(`
      SELECT sa.*, s.duration, s.description as session_desc, s.lasttaken_iso
      FROM lms_student_attendance sa
      JOIN lms_attendance_session s ON sa.session_id = s.session_id
      WHERE (sa.moodle_student_id = ? OR sa.student_id = ?) AND sa.sessdate_iso LIKE ?
      ORDER BY sa.sessdate ASC
    `).all(student.moodle_id || -1, student.id, dateStr + '%');
  } catch(e) {}

  // 5. Cross-check
  const hasTurniketEntry = Boolean(campus && campus.first_in_at);
  const isInCampusNow = campus ? (campus.in_count > campus.out_count) : false;

  const verifiedLessons = distinctLessons.map(l => {
    const lmsRec = lmsSessions.find(s => s.course_id === l.course_id);
    const lmsStatus = lmsRec ? lmsRec.status : null;
    const lmsStatusLabel = lmsRec ? lmsRec.status_label : 'Qayd etilmagan';

    const inBuilding = hasTurniketEntry;

    let verdict = 'ok';
    let verdictText = 'Tasdiqlangan';
    let verdictColor = '#16A34A';

    if (lmsStatus === 'P') {
      if (inBuilding) {
        verdict = 'verified';
        verdictText = '✅ 100% Mos keladi (LMS: Kelgan, Turniket: Binoda)';
        verdictColor = '#16A34A';
      } else {
        verdict = 'suspicious';
        verdictText = '⚠️ Shubhali: LMSda "Kelgan", lekin Turniketda yo\'q!';
        verdictColor = '#DC2626';
      }
    } else if (lmsStatus === 'A') {
      if (inBuilding) {
        verdict = 'in_campus_not_in_class';
        verdictText = 'ℹ️ Binoda bo\'lgan, lekin LMSda "Kelmadi" qo\'yilgan';
        verdictColor = '#EA580C';
      } else {
        verdict = 'absent_confirmed';
        verdictText = '❌ Darsda ham, binoda ham bo\'lmagan (Mos keladi)';
        verdictColor = '#64748B';
      }
    } else {
      if (inBuilding) {
        verdict = 'in_campus_no_lms';
        verdictText = '🏢 Bino hududida bo\'lgan (LMSda davomat olinmagan)';
        verdictColor = '#2563EB';
      } else {
        verdict = 'not_in_campus';
        verdictText = 'Turniketdan o\'tmagan';
        verdictColor = '#94A3B8';
      }
    }

    return {
      subject_name: l.subject_name || l.subject_code,
      subject: l.subject_name || l.subject_code,
      subject_code: l.subject_code,
      teacher_name: l.teacher_name || 'Belgilanmagan',
      teacher: l.teacher_name || 'Belgilanmagan',
      room: l.room || 'Xona ko\'rsatilmagan',
      time_str: l.time_str,
      in_building: inBuilding,
      in_building_during_class: inBuilding,
      lms_status: lmsStatus,
      lms_status_label: lmsStatusLabel,
      verdict,
      audit_verdict: verdict.toUpperCase(),
      verdict_text: verdictText,
      verdict_color: verdictColor
    };
  });

  return {
    student,
    date: dateStr,
    weekday,
    weekday_name: weekdayNames[weekday] || '',
    turniket: {
      has_entry: hasTurniketEntry,
      first_in_at: campus ? campus.first_in_at : null,
      last_out_at: campus ? campus.last_out_at : null,
      in_count: campus ? campus.in_count : 0,
      out_count: campus ? campus.out_count : 0,
      is_in_campus: isInCampusNow,
      status: campus ? campus.status : 'absent',
      raw_events: rawEvents
    },
    total_classes: verifiedLessons.length,
    lessons_count: verifiedLessons.length,
    lessons: verifiedLessons,
    lms_sessions_count: lmsSessions.length
  };
}

/**
 * Butun universitet bo'yicha LMS va Turniket moslik tahlili (Audit)
 */
function getLmsTurniketAudit(date = null) {
  const dateStr = date || new Date().toISOString().slice(0, 10);
  const d = new Date(dateStr + "T12:00:00Z");
  const weekday = d.getUTCDay() === 0 ? 7 : d.getUTCDay();

  const students = db.prepare(`SELECT id, external_id, first_name, last_name, group_code, moodle_id FROM student WHERE status = 'active'`).all();
  const campusRecords = db.prepare(`SELECT student_id, first_in_at, last_out_at, in_count, out_count FROM campus_attendance WHERE date = ?`).all(dateStr);
  const campusMap = new Map(campusRecords.map(c => [c.student_id, c]));

  const lmsRecords = db.prepare(`
    SELECT sa.student_id, sa.moodle_student_id, sa.status, sa.status_label, sa.course_id, c.name as course_name
    FROM lms_student_attendance sa
    LEFT JOIN lms_course c ON sa.course_id = c.id
    WHERE sa.sessdate_iso LIKE ?
  `).all(dateStr + '%');

  const lmsPresentMap = new Map();
  for (const r of lmsRecords) {
    if (r.status === 'P' || r.status === 'L') {
      if (r.student_id) lmsPresentMap.set(r.student_id, r);
      if (r.moodle_student_id) lmsPresentMap.set(`m_${r.moodle_student_id}`, r);
    }
  }

  let totalStudents = students.length;
  let inCampusCount = 0;
  let verifiedMatches = 0;
  let suspiciousLmsCount = 0;
  let inCampusNotClassCount = 0;
  const discrepancies = [];

  for (const st of students) {
    const inCampus = campusMap.has(st.id);
    if (inCampus) inCampusCount++;

    const lmsRec = lmsPresentMap.get(st.id) || (st.moodle_id ? lmsPresentMap.get(`m_${st.moodle_id}`) : null);
    const isLmsPresent = Boolean(lmsRec);

    if (isLmsPresent) {
      if (inCampus) {
        verifiedMatches++;
      } else {
        suspiciousLmsCount++;
        discrepancies.push({
          student_id: st.id,
          student_name: `${st.last_name || ''} ${st.first_name || ''}`.trim(),
          group_code: st.group_code || '-',
          subject: lmsRec.course_name || 'LMS Kurs',
          time_str: 'Dars vaqti',
          lms_status: lmsRec.status_label || 'Present',
          in_building_during_class: false,
          verdict: 'SUSPICIOUS_PRESENT',
          details: "LMS tizimida 'Present' belgilangan, ammo turniketda universitetga kirish qayd etilmagan"
        });
      }
    } else if (inCampus) {
      inCampusNotClassCount++;
    }
  }

  const reliabilityRate = (verifiedMatches + suspiciousLmsCount) > 0 
    ? Math.round((verifiedMatches / (verifiedMatches + suspiciousLmsCount)) * 100) 
    : 100;

  return {
    date: dateStr,
    weekday,
    total_students: totalStudents,
    students_with_turniket: inCampusCount,
    in_campus_turniket: inCampusCount,
    verified_matches: verifiedMatches,
    suspicious_count: suspiciousLmsCount,
    suspicious_lms: suspiciousLmsCount,
    in_campus_without_lms: inCampusNotClassCount,
    reliability_rate: reliabilityRate,
    reliability_percentage: reliabilityRate,
    discrepancies
  };
}

/**
 * Chuqur Mutanosiblik Tahlili (Turniket va LMS Davomat Mutanosibligi)
 * @param {Object} filters { date, category, group_code, course, search }
 */
function getDeepCrossAudit(filters = {}) {
  const dateStr = filters.date || new Date().toISOString().slice(0, 10);
  const selectedCategory = filters.category || 'all';
  const groupCodeFilter = filters.group_code || '';
  const courseFilter = filters.course ? Number(filters.course) : null;
  const searchFilter = (filters.search || '').trim().toLowerCase();

  const d = new Date(dateStr + "T12:00:00Z");
  const weekday = d.getUTCDay() === 0 ? 7 : d.getUTCDay();
  const weekdayNames = {
    1: 'Dushanba', 2: 'Seshanba', 3: 'Chorshanba', 4: 'Payshanba', 5: 'Juma', 6: 'Shanba', 7: 'Yakshanba'
  };

  // 1. All active students
  const students = db.prepare(`
    SELECT id, external_id, first_name, last_name, group_code, course, phone, photo_url, moodle_id
    FROM student
    WHERE status = 'active'
    ORDER BY group_code ASC, last_name ASC
  `).all();

  // 2. Campus attendance on date
  const campusRecords = db.prepare(`SELECT * FROM campus_attendance WHERE date = ?`).all(dateStr);
  const campusMap = new Map(campusRecords.map(c => [c.student_id, c]));

  // 3. LMS student attendance on date
  const lmsRecords = db.prepare(`
    SELECT sa.*, c.name as course_name
    FROM lms_student_attendance sa
    LEFT JOIN lms_course c ON sa.course_id = c.id
    WHERE sa.sessdate_iso LIKE ?
  `).all(dateStr + '%');

  const lmsMap = new Map();
  for (const r of lmsRecords) {
    if (r.student_id) lmsMap.set(r.student_id, r);
    if (r.moodle_student_id) lmsMap.set(`m_${r.moodle_student_id}`, r);
  }

  // 4. Timetable on weekday (deduplicated by course_id and time_str) - faqat 2026/2027 o'quv yili
  const rawTimetable = db.prepare(`
    SELECT course_id, subject_code, subject_name, teacher_name, room, time_str, timestart_iso
    FROM lms_timetable
    WHERE weekday = ? AND timestart >= 1788220800 AND course_id NOT IN (2, 3, 4, 5, 6, 9, 11, 12, 14, 15)
  `).all(weekday);

  const ttMap = {};
  for (const item of rawTimetable) {
    if (!ttMap[item.course_id]) ttMap[item.course_id] = [];
    if (!ttMap[item.course_id].some(x => x.time_str === item.time_str)) {
      ttMap[item.course_id].push(item);
    }
  }

  // 5. Course enrollments
  let enrollments = [];
  try {
    enrollments = db.prepare(`SELECT moodle_student_id, course_id FROM lms_course_enrollment`).all();
  } catch (e) {}
  const studentCoursesMap = {};
  for (const e of enrollments) {
    if (!studentCoursesMap[e.moodle_student_id]) studentCoursesMap[e.moodle_student_id] = new Set();
    studentCoursesMap[e.moodle_student_id].add(e.course_id);
  }

  let totalStudents = students.length;
  let inCampusCount = 0;
  let suspiciousCount = 0;
  let inCampusSkippedCount = 0;
  let verifiedCount = 0;
  let bothAbsentCount = 0;

  const groupStatsMap = {};
  const courseStatsMap = {};
  const evaluatedStudents = [];

  for (const st of students) {
    const campus = campusMap.get(st.id);
    const hasTurniket = Boolean(campus && campus.first_in_at);
    if (hasTurniket) inCampusCount++;

    // Group stats accumulation
    const gCode = st.group_code || 'Boshqa';
    if (!groupStatsMap[gCode]) {
      groupStatsMap[gCode] = { group_code: gCode, course: st.course || 1, total: 0, in_campus: 0 };
    }
    groupStatsMap[gCode].total++;
    if (hasTurniket) groupStatsMap[gCode].in_campus++;

    // Course stats accumulation
    const cNum = Number(st.course) || 1;
    if (!courseStatsMap[cNum]) {
      courseStatsMap[cNum] = { course: cNum, course_name: `${cNum}-kurs`, total: 0, in_campus: 0 };
    }
    courseStatsMap[cNum].total++;
    if (hasTurniket) courseStatsMap[cNum].in_campus++;

    // LMS attendance for this student
    const lms = lmsMap.get(st.id) || (st.moodle_id ? lmsMap.get(`m_${st.moodle_id}`) : null);
    const isLmsPresent = lms && (lms.status === 'P' || lms.status === 'L');
    const isLmsAbsent = lms && lms.status === 'A';

    // Student lessons for today
    const enrolledCourseIds = st.moodle_id && studentCoursesMap[st.moodle_id] 
      ? Array.from(studentCoursesMap[st.moodle_id]) 
      : [];
    const lessons = [];
    for (const cId of enrolledCourseIds) {
      if (ttMap[cId]) {
        lessons.push(...ttMap[cId]);
      }
    }

    // Determine category
    let category = 'no_class';
    let categoryLabel = 'Darsi yo\'q';
    let categoryBadge = 'neutral';
    let verdictDetails = '';

    if (!hasTurniket && isLmsPresent) {
      category = 'suspicious_present';
      categoryLabel = '⚠️ Shubhali (Binoda yo\'q, darsda bor)';
      categoryBadge = 'danger';
      verdictDetails = 'LMS tizimida qatnashgan (Present) belgilangan, ammo turniketda universitetga kirish umuman qayd etilmagan!';
      suspiciousCount++;
    } else if (hasTurniket && isLmsAbsent) {
      category = 'in_campus_skipped';
      categoryLabel = '🚶 Binoda bor, lekin darsga kirmagan';
      categoryBadge = 'warning';
      verdictDetails = 'Talaba universitet hududiga kirgan, biroq LMS dars davomatida "Kelmadi" (Absent) deb qayd etilgan.';
      inCampusSkippedCount++;
    } else if (hasTurniket && isLmsPresent) {
      category = 'verified_present';
      categoryLabel = '✅ 100% Tasdiqlangan (Haqiqiy)';
      categoryBadge = 'success';
      verdictDetails = 'Talaba turniketdan kirgan va dars mashg\'ulotida to\'liq qatnashgan.';
      verifiedCount++;
    } else if (!hasTurniket && (isLmsAbsent || lessons.length > 0)) {
      category = 'both_absent';
      categoryLabel = '❌ Kelmagan (Binoda ham, darsda ham yo\'q)';
      categoryBadge = 'secondary';
      verdictDetails = 'Talaba universitetga ham kelmagan va darsda ham qatnashmagan.';
      bothAbsentCount++;
    } else if (hasTurniket) {
      category = 'verified_present';
      categoryLabel = '🏢 Binoda (Darsi qayd etilmagan)';
      categoryBadge = 'info';
      verdictDetails = 'Talaba universitet hududida bo\'lgan.';
      verifiedCount++;
    }

    evaluatedStudents.push({
      student_id: st.id,
      first_name: st.first_name,
      last_name: st.last_name,
      full_name: `${st.last_name || ''} ${st.first_name || ''}`.trim(),
      group_code: st.group_code || '-',
      course: st.course || 1,
      phone: st.phone || '',
      photo_url: st.photo_url || null,
      moodle_id: st.moodle_id,
      turniket: {
        has_entry: hasTurniket,
        first_in: campus ? campus.first_in_at : null,
        last_out: campus ? campus.last_out_at : null,
        in_count: campus ? campus.in_count : 0,
        out_count: campus ? campus.out_count : 0,
        is_in_campus: campus ? (campus.in_count > campus.out_count) : false
      },
      lms: {
        has_record: Boolean(lms),
        status: lms ? lms.status : null,
        status_label: lms ? (lms.status_label || (lms.status === 'P' ? 'Present' : (lms.status === 'L' ? 'Late' : (lms.status === 'A' ? 'Absent' : 'Excused')))) : 'Kiritilmagan',
        course_name: lms ? lms.course_name : null,
        remarks: lms ? lms.remarks : null
      },
      lessons: lessons.map(l => ({
        subject: l.subject_name || l.subject_code,
        teacher: l.teacher_name || 'Ustoz ko\'rsatilmagan',
        room: l.room || 'Xona ko\'rsatilmagan',
        time_str: l.time_str
      })),
      category,
      category_label: categoryLabel,
      category_badge: categoryBadge,
      verdict_details: verdictDetails
    });
  }

  // Group rankings
  const groupRankings = Object.values(groupStatsMap).map(g => ({
    group_code: g.group_code,
    course: g.course,
    total_students: g.total,
    in_campus_count: g.in_campus,
    rate: g.total > 0 ? Math.round((g.in_campus / g.total) * 100) : 0
  })).sort((a, b) => b.rate - a.rate);

  // Bachelor courses breakdown
  const bachelorCourses = Object.values(courseStatsMap).map(c => ({
    course: c.course,
    course_name: c.course_name,
    total_students: c.total,
    in_campus: c.in_campus,
    rate: c.total > 0 ? Math.round((c.in_campus / c.total) * 100) : 0
  })).sort((a, b) => a.course - b.course);

  // Filter students list based on query
  let filteredList = evaluatedStudents;
  if (selectedCategory !== 'all') {
    filteredList = filteredList.filter(s => s.category === selectedCategory);
  }
  if (groupCodeFilter) {
    filteredList = filteredList.filter(s => s.group_code === groupCodeFilter);
  }
  if (courseFilter) {
    filteredList = filteredList.filter(s => Number(s.course) === courseFilter);
  }
  if (searchFilter) {
    filteredList = filteredList.filter(s => 
      s.full_name.toLowerCase().includes(searchFilter) ||
      (s.group_code && s.group_code.toLowerCase().includes(searchFilter)) ||
      (s.phone && s.phone.includes(searchFilter))
    );
  }

  const universityRate = totalStudents > 0 ? Math.round((inCampusCount / totalStudents) * 100) : 0;
  const reliabilityRate = (verifiedCount + suspiciousCount) > 0
    ? Math.round((verifiedCount / (verifiedCount + suspiciousCount)) * 100)
    : 100;

  return {
    date: dateStr,
    weekday,
    weekday_name: weekdayNames[weekday] || '',
    summary: {
      total_students: totalStudents,
      in_campus_count: inCampusCount,
      university_attendance_rate: universityRate,
      reliability_rate: reliabilityRate,
      bachelor_courses: bachelorCourses,
      top_groups: groupRankings.slice(0, 3),
      bottom_groups: groupRankings.slice(-3)
    },
    counts: {
      all: evaluatedStudents.length,
      suspicious_present: suspiciousCount,
      in_campus_skipped: inCampusSkippedCount,
      both_absent: bothAbsentCount,
      verified_present: verifiedCount
    },
    students: filteredList
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

  const todayStr = new Date().toISOString().slice(0, 10);
  const latestLogDirection = logs.length > 0 ? logs[0].direction : null;

  const enrichedRecords = records.map((r, idx) => {
    let isIn = (r.in_count > r.out_count);
    if (r.date === todayStr && latestLogDirection) {
      isIn = (latestLogDirection === 'in');
    }
    return {
      ...r,
      is_in_campus: isIn
    };
  });

  return {
    student,
    history: enrichedRecords,
    logs,
    is_currently_in_campus: (latestLogDirection === 'in') || ((records[0]?.in_count || 0) > (records[0]?.out_count || 0))
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

/**
 * Tizimdagi xodimlarning rasmlarini HikCentral turniket serveridan yuklab olib profillarini to'ldirish
 * @param {string|null} specificStaffId - Bitta xodim uchun yoki butun xodimlar uchun null
 * @param {boolean} forceAll - Agar true bo'lsa, mavjud rasmlarni ham qayta yuklaydi
 */
async function syncStaffPhotos(specificStaffId = null, forceAll = false) {
  const cfg = getHikConfig();
  if (!cfg || !cfg.enabled) {
    return { success: false, error: "HikCentral o'chirilgan (disabled)" };
  }

  console.log(`[HikCentral] Xodimlar rasmlarini turniket serverdan sinxronlash boshlandi... (ID: ${specificStaffId || 'BARCHA'}, Force: ${forceAll})`);

  // 1. Bazadagi xodimlarni olish
  let staffList = [];
  if (specificStaffId) {
    const single = db.prepare('SELECT id, full_name, passport_id, photo_url FROM staff_user WHERE id = ?').get(specificStaffId);
    if (!single) {
      return { success: false, error: "Xodim topilmadi: " + specificStaffId };
    }
    staffList = [single];
  } else {
    staffList = db.prepare('SELECT id, full_name, passport_id, photo_url FROM staff_user').all();
  }

  if (!staffList || staffList.length === 0) {
    return { success: true, message: "Xodimlar topilmadi", downloadedCount: 0, total: 0 };
  }

  const uploadDir = config.uploadDir || path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // 2. Qaysi xodimlarga rasm kerakligini aniqlash
  const staffNeedingPhoto = [];
  for (const s of staffList) {
    let needsPhoto = forceAll;
    if (!needsPhoto) {
      if (!s.photo_url) {
        needsPhoto = true;
      } else {
        const localFileName = s.photo_url.replace(/^\/api\/files\//, '');
        const fullLocalPath = path.join(uploadDir, localFileName);
        if (!fs.existsSync(fullLocalPath) || fs.statSync(fullLocalPath).size === 0) {
          needsPhoto = true;
        }
      }
    }
    if (needsPhoto) {
      staffNeedingPhoto.push(s);
    }
  }

  console.log(`[HikCentral] Jami xodimlar: ${staffList.length}, Rasmi yuklanishi kerak bo'lganlar: ${staffNeedingPhoto.length}`);

  if (staffNeedingPhoto.length === 0) {
    return {
      success: true,
      message: "Barcha xodimlarning rasmlari diskda to'liq va yaroqli holatda mavjud.",
      total: staffList.length,
      downloadedCount: 0,
      failedCount: 0,
      updatedStaff: []
    };
  }

  // 3. Xodimlarni pasporti bo'yicha indekslash
  const staffByPassport = new Map();
  for (const s of staffNeedingPhoto) {
    const norm = normalizePassport(s.passport_id || s.id);
    if (norm) {
      staffByPassport.set(norm, s);
    }
  }

  // 4. HikCentral personList dan qidirish
  let pageNo = 1;
  const pageSize = 100;
  let hasMore = true;
  const matchedStaff = [];

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
        if (normPass && staffByPassport.has(normPass)) {
          const staffMember = staffByPassport.get(normPass);
          const picUri = p.personPhoto ? p.personPhoto.picUri : null;
          if (picUri) {
            matchedStaff.push({
              staff: staffMember,
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

  console.log(`[HikCentral] Turniket serverida ${matchedStaff.length} nafar xodimning rasmi topildi.`);

  // 5. Rasmlarni yuklab olish va saqlash
  let downloadedCount = 0;
  let failedCount = 0;
  const updatedStaff = [];

  for (const item of matchedStaff) {
    const { staff, personId, picUri } = item;
    try {
      const picResult = await downloadPersonPicture(personId, picUri);
      if (picResult.success && picResult.buffer) {
        const filename = `avatar_staff_${staff.id}_turniket${picResult.ext || '.jpg'}`;
        const savePath = path.join(uploadDir, filename);
        fs.writeFileSync(savePath, picResult.buffer);

        const photoUrl = `/api/files/${filename}`;
        const nowIso = new Date().toISOString();

        db.prepare('UPDATE staff_user SET photo_url = ? WHERE id = ?').run(photoUrl, staff.id);

        downloadedCount++;
        updatedStaff.push({
          staff_id: staff.id,
          name: staff.full_name,
          passport_id: staff.passport_id,
          photo_url: photoUrl,
          size_bytes: picResult.size
        });
        console.log(`[HikCentral] Xodim rasmi saqlandi: ${staff.full_name} (${staff.passport_id}) -> ${photoUrl}`);
      } else {
        console.warn(`[HikCentral] Xodim rasmi yuklanmadi (${staff.full_name}):`, picResult.error);
        failedCount++;
      }
    } catch (dlErr) {
      console.error(`[HikCentral] Xodim rasmini yuklashda xatolik (${staff.full_name}):`, dlErr.message);
      failedCount++;
    }

    await new Promise(resolve => setTimeout(resolve, 80));
  }

  const syncFinishIso = new Date().toISOString();
  try {
    db.prepare(`
      INSERT INTO setting (key, value, updated_by, updated_at)
      VALUES ('last_staff_photos_sync_at', ?, 'system', ?)
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at
    `).run(syncFinishIso, syncFinishIso);
  } catch (settingErr) {}

  console.log(`[HikCentral] Xodimlar rasmlari sinxronizatsiyasi yakunlandi: ${downloadedCount} ta yangilandi, ${failedCount} ta xato.`);

  return {
    success: true,
    total: staffList.length,
    needingCount: staffNeedingPhoto.length,
    downloadedCount,
    failedCount,
    updatedStaff
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
  syncStaffPhotos,
  syncCampusAttendance,
  getCampusAttendanceSummary,
  getCampusAttendanceList,
  getStudentAttendanceHistory,
  getStudentLmsCrosscheck,
  getLmsTurniketAudit,
  getDeepCrossAudit
};

