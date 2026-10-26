/**
 * LMS (Moodle) Service — lms.akhu.uz integratsiyasi
 * 
 * Token: c7ece056fdfa85c667e92d943c0bfc94
 * Web Service funksiyalari:
 *   - core_calendar_get_calendar_events (Dars jadvallari / Timetable)
 *   - mod_attendance_get_sessions (Davomat mashg'ulotlari)
 *   - mod_attendance_get_session (Talabalarning dars davomati loglari)
 */

const https = require('https');
const { db } = require('../db/database');

const MOODLE_CONFIG = {
  token: 'c7ece056fdfa85c667e92d943c0bfc94',
  baseUrl: 'https://lms.akhu.uz/webservice/rest/server.php',
  timeout: 15000,
  knownCourses: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 39],
  knownAttendanceIds: [50, 51, 52, 53, 54, 55, 56, 57, 58, 61, 62, 64, 65, 66, 67, 68, 69, 70, 71, 73, 74, 75, 77, 78, 79, 80, 81, 82, 83, 84, 88, 89, 90, 91, 93]
};

let isSyncing = false;
let lastSyncResult = null;

/**
 * Moodle Web Service chaqiruvi
 */
function callMoodle(fn, params = {}) {
  const query = new URLSearchParams({
    wstoken: MOODLE_CONFIG.token,
    wsfunction: fn,
    moodlewsrestformat: 'json',
    ...params
  }).toString();

  return new Promise((resolve, reject) => {
    const req = https.get(MOODLE_CONFIG.baseUrl + '?' + query, { timeout: MOODLE_CONFIG.timeout }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          resolve(null);
        }
      });
    });

    req.on('error', err => {
      console.error(`[LMS] API call error (${fn}):`, err.message);
      resolve(null);
    });

    req.on('timeout', () => {
      req.destroy();
      console.error(`[LMS] API call timeout (${fn})`);
      resolve(null);
    });
  });
}

/**
 * Ismni solishtirish uchun normallashtirish (transliteratsiya va suffikslarni tozalash)
 */
function normalizeName(str) {
  if (!str) return '';
  return str.toLowerCase()
    .replace(/['`’‘ʻʼ\- \uFFFD]/g, '')
    .replace(/h/g, 'x')
    .replace(/q/g, 'k')
    .replace(/g'/g, 'g')
    .replace(/o'/g, 'o')
    .replace(/yev$/g, 'ev')
    .replace(/yeva$/g, 'eva')
    .replace(/(bek|jon|xon|boy|oy)$/g, '')
    .trim();
}

/**
 * Dars izohidan o'qituvchi va xonani ajratib olish
 */
function extractTeacherAndRoom(desc) {
  let teacher = null;
  let room = null;
  if (!desc) return { teacher, room };

  const lines = desc.replace(/<[^>]+>/g, '\n').replace(/\r/g, '').split('\n').map(l => l.trim()).filter(Boolean);
  for (const line of lines) {
    if (/prof|dr\.|o'qituvchi|teacher|assistent/i.test(line)) {
      teacher = line;
    } else if (/hall|room|xona|auditoriya|lab|bino/i.test(line)) {
      room = line;
    } else if (!teacher && lines.length === 1) {
      teacher = line;
    } else if (teacher && !room) {
      room = line;
    }
  }
  return { teacher, room };
}

/**
 * Timestampdan vaqt satrini olish (masalan "09:00 - 11:00")
 */
function formatTimeStr(timestart, duration) {
  const start = new Date(timestart * 1000);
  const end = new Date((timestart + duration) * 1000);

  const sh = String(start.getUTCHours()).padStart(2, '0');
  const sm = String(start.getUTCMinutes()).padStart(2, '0');
  const eh = String(end.getUTCHours()).padStart(2, '0');
  const em = String(end.getUTCMinutes()).padStart(2, '0');

  return `${sh}:${sm} - ${eh}:${em}`;
}

/**
 * Timestampdan hafta kunini olish (1 = Dushanba ... 7 = Yakshanba)
 */
function getWeekdayNumber(timestart) {
  const d = new Date(timestart * 1000);
  const day = d.getUTCDay();
  return day === 0 ? 7 : day;
}

/**
 * Barcha dars jadvallari va kalendar voqealarini sinxronlash
 */
async function syncTimetable() {
  console.log('[LMS] Dars jadvallari sinxronlanmoqda...');
  const params = {
    'options[timestart]': '1759000000', // 2025-yil sentyabrdan
    'options[timeend]': '1800000000'    // 2027-yilgacha
  };
  MOODLE_CONFIG.knownCourses.forEach((id, idx) => {
    params[`events[courseids][${idx}]`] = id;
  });

  const res = await callMoodle('core_calendar_get_calendar_events', params);
  if (!res || !res.events || !Array.isArray(res.events)) {
    console.warn('[LMS] Kalendar voqealari topilmadi yoki xatolik yuz berdi');
    return { count: 0 };
  }

  const nowIso = new Date().toISOString();
  let inserted = 0;
  const courseMap = {};

  const insertCourse = db.prepare(`
    INSERT INTO lms_course (id, code, name, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT (id) DO UPDATE SET
      code = EXCLUDED.code,
      name = EXCLUDED.name,
      updated_at = EXCLUDED.updated_at
  `);

  const insertTt = db.prepare(`
    INSERT INTO lms_timetable (
      id, event_id, course_id, subject_code, subject_name,
      teacher_name, room, timestart, timeduration, timestart_iso,
      timeend_iso, weekday, time_str, event_type, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT (event_id) DO UPDATE SET
      course_id = EXCLUDED.course_id,
      subject_code = EXCLUDED.subject_code,
      subject_name = EXCLUDED.subject_name,
      teacher_name = EXCLUDED.teacher_name,
      room = EXCLUDED.room,
      timestart = EXCLUDED.timestart,
      timeduration = EXCLUDED.timeduration,
      timestart_iso = EXCLUDED.timestart_iso,
      timeend_iso = EXCLUDED.timeend_iso,
      weekday = EXCLUDED.weekday,
      time_str = EXCLUDED.time_str,
      event_type = EXCLUDED.event_type
  `);

  for (const ev of res.events) {
    if (ev.eventtype !== 'course') continue;

    const eventId = ev.id;
    const courseId = ev.courseid;
    const rawName = String(ev.name || '').trim();
    const parts = rawName.split(/[-–—]/);
    const subjectCode = parts[0] ? parts[0].trim() : '';
    const subjectName = parts.length > 1 ? parts.slice(1).join(' - ').trim() : rawName;

    const { teacher, room } = extractTeacherAndRoom(ev.description);
    const timestart = ev.timestart;
    const timeduration = ev.timeduration || 7200;
    const timestartIso = new Date(timestart * 1000).toISOString();
    const timeendIso = new Date((timestart + timeduration) * 1000).toISOString();
    const weekday = getWeekdayNumber(timestart);
    const timeStr = formatTimeStr(timestart, timeduration);

    if (!courseMap[courseId]) {
      courseMap[courseId] = { code: subjectCode, name: subjectName || rawName };
      insertCourse.run(courseId, subjectCode, subjectName || rawName, nowIso);
    }

    insertTt.run(
      `tt_${eventId}`,
      eventId,
      courseId,
      subjectCode,
      rawName,
      teacher,
      room,
      timestart,
      timeduration,
      timestartIso,
      timeendIso,
      weekday,
      timeStr,
      ev.eventtype || 'course',
      nowIso
    );
    inserted++;
  }

  console.log(`[LMS] Jami ${inserted} ta dars jadvali yozuvi saqlandi.`);
  return { count: inserted, courses: Object.keys(courseMap).length };
}

/**
 * Moodle talabalarini mahalliy talabalar jadvali bilan moslashtirish
 */
function matchStudentWithDb(moodleUser, dbStudents) {
  if (!moodleUser) return null;

  // 1. Agar moodle_id allaqachon bog'langan bo'lsa
  const byMoodleId = dbStudents.find(s => s.moodle_id && s.moodle_id === moodleUser.id);
  if (byMoodleId) return byMoodleId;

  const mFn = normalizeName(moodleUser.firstname);
  const mLn = normalizeName(moodleUser.lastname);

  // 2. Aniq moslik (First + Last yoki Last + First)
  for (const s of dbStudents) {
    const sFn = normalizeName(s.first_name);
    const sLn = normalizeName(s.last_name);

    if ((sFn === mFn && sLn === mLn) || (sFn === mLn && sLn === mFn)) {
      return s;
    }
  }

  // 3. Qisman moslik (boshlang'ich 4 harf bo'yicha)
  for (const s of dbStudents) {
    const sFn = normalizeName(s.first_name);
    const sLn = normalizeName(s.last_name);

    if (sFn.length >= 4 && mFn.length >= 4 && sLn.length >= 4 && mLn.length >= 4) {
      if (sFn.startsWith(mFn.substring(0, 4)) && sLn.startsWith(mLn.substring(0, 4))) {
        return s;
      }
      if (sFn.startsWith(mLn.substring(0, 4)) && sLn.startsWith(mFn.substring(0, 4))) {
        return s;
      }
    }
  }

  return null;
}

/**
 * Barcha davomat mashg'ulotlari va talabalar davomatini sinxronlash
 */
async function syncAttendance() {
  console.log('[LMS] Davomat mashg\'ulotlari sinxronlanmoqda...');
  const dbStudents = db.prepare(`SELECT id, external_id, first_name, last_name, moodle_id FROM student`).all();
  const nowIso = new Date().toISOString();

  const insertSession = db.prepare(`
    INSERT INTO lms_attendance_session (
      id, session_id, attendance_id, course_id, course_name,
      sessdate, sessdate_iso, duration, lasttaken, lasttaken_iso,
      description, total_enrolled, present_count, late_count,
      excused_count, absent_count, attendance_rate, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT (session_id) DO UPDATE SET
      course_id = EXCLUDED.course_id,
      course_name = EXCLUDED.course_name,
      sessdate = EXCLUDED.sessdate,
      sessdate_iso = EXCLUDED.sessdate_iso,
      duration = EXCLUDED.duration,
      lasttaken = EXCLUDED.lasttaken,
      lasttaken_iso = EXCLUDED.lasttaken_iso,
      description = EXCLUDED.description,
      total_enrolled = EXCLUDED.total_enrolled,
      present_count = EXCLUDED.present_count,
      late_count = EXCLUDED.late_count,
      excused_count = EXCLUDED.excused_count,
      absent_count = EXCLUDED.absent_count,
      attendance_rate = EXCLUDED.attendance_rate,
      updated_at = EXCLUDED.updated_at
  `);

  const insertStudentAtt = db.prepare(`
    INSERT INTO lms_student_attendance (
      id, session_id, attendance_id, course_id, course_name,
      moodle_student_id, student_id, student_name, status, status_label,
      points, remarks, sessdate, sessdate_iso, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT (session_id, moodle_student_id) DO UPDATE SET
      student_id = EXCLUDED.student_id,
      student_name = EXCLUDED.student_name,
      status = EXCLUDED.status,
      status_label = EXCLUDED.status_label,
      points = EXCLUDED.points,
      remarks = EXCLUDED.remarks,
      sessdate = EXCLUDED.sessdate,
      sessdate_iso = EXCLUDED.sessdate_iso
  `);

  const insertEnrollment = db.prepare(`
    INSERT INTO lms_course_enrollment (course_id, moodle_student_id, student_id, created_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT (course_id, moodle_student_id) DO UPDATE SET
      student_id = EXCLUDED.student_id
  `);

  const updateStudentMoodleId = db.prepare(`
    UPDATE student SET moodle_id = ? WHERE id = ? AND moodle_id IS NULL
  `);

  // Kurs nomlari lug'ati
  const courses = db.prepare(`SELECT id, code, name FROM lms_course`).all();
  const courseNameMap = {};
  for (const c of courses) {
    courseNameMap[c.id] = c.name;
  }

  let totalSessionsSynced = 0;
  let totalStudentAttRecords = 0;
  let matchedStudentsCount = new Set();

  for (const aid of MOODLE_CONFIG.knownAttendanceIds) {
    const sessions = await callMoodle('mod_attendance_get_sessions', { attendanceid: aid });
    if (!Array.isArray(sessions) || sessions.length === 0) continue;

    for (const sess of sessions) {
      const sessionId = sess.id;
      // Dars ma'lumotlarini olish
      const sDetail = await callMoodle('mod_attendance_get_session', { sessionid: sessionId });
      if (!sDetail) continue;

      const courseId = sDetail.courseid || 0;
      const courseName = courseNameMap[courseId] || `Kurs ${courseId}`;
      const sessdate = sDetail.sessdate;
      const sessdateIso = new Date(sessdate * 1000).toISOString();
      const duration = sDetail.duration || 7200;
      const lasttaken = sDetail.lasttaken || null;
      const lasttakenIso = lasttaken ? new Date(lasttaken * 1000).toISOString() : null;
      const desc = sDetail.description ? String(sDetail.description).replace(/<[^>]+>/g, '').trim() : '';

      // Statuslar xaritasi (P: Present, L: Late, E: Excused, A: Absent)
      const statusMap = {};
      if (Array.isArray(sDetail.statuses)) {
        for (const st of sDetail.statuses) {
          statusMap[String(st.id)] = {
            acronym: st.acronym || 'P',
            description: st.description || 'Present',
            grade: st.grade || 0
          };
        }
      }

      // Talabalar ro'yxati va davomati
      const users = Array.isArray(sDetail.users) ? sDetail.users : [];
      const logs = Array.isArray(sDetail.attendance_log) ? sDetail.attendance_log : [];
      const userLogMap = {};
      for (const log of logs) {
        userLogMap[log.studentid] = log;
      }

      let pCount = 0;
      let lCount = 0;
      let eCount = 0;
      let aCount = 0;

      for (const u of users) {
        const moodleUid = u.id;
        const fullName = `${u.firstname || ''} ${u.lastname || ''}`.trim();
        const matched = matchStudentWithDb(u, dbStudents);
        const localStudentId = matched ? matched.id : null;

        if (matched) {
          matchedStudentsCount.add(matched.id);
          if (!matched.moodle_id) {
            updateStudentMoodleId.run(moodleUid, matched.id);
            matched.moodle_id = moodleUid;
          }
        }

        // Kursga a'zolikni yozib qo'yish
        insertEnrollment.run(courseId, moodleUid, localStudentId, nowIso);

        // Talaba davomati
        const log = userLogMap[moodleUid];
        let status = 'A';
        let statusLabel = 'Absent';
        let points = 0;
        let remarks = '';

        if (log) {
          const stInfo = statusMap[String(log.statusid)] || { acronym: 'P', description: 'Present', grade: 2 };
          status = stInfo.acronym;
          statusLabel = stInfo.description;
          points = stInfo.grade;
          remarks = log.remarks || '';
        } else if (!lasttaken) {
          // Dars hali o'tkazilmagan bo'lsa
          status = 'PENDING';
          statusLabel = 'Rejalashtirilgan';
        }

        if (status === 'P') pCount++;
        else if (status === 'L') lCount++;
        else if (status === 'E') eCount++;
        else if (status === 'A') aCount++;

        insertStudentAtt.run(
          `att_${sessionId}_${moodleUid}`,
          sessionId,
          aid,
          courseId,
          courseName,
          moodleUid,
          localStudentId,
          fullName,
          status,
          statusLabel,
          points,
          remarks,
          sessdate,
          sessdateIso,
          nowIso
        );
        totalStudentAttRecords++;
      }

      const totalEnrolled = users.length;
      const attended = pCount + eCount + (lCount * 0.5);
      const rate = totalEnrolled > 0 && lasttaken ? Math.round((attended / totalEnrolled) * 1000) / 10 : 0.0;

      insertSession.run(
        `sess_${sessionId}`,
        sessionId,
        aid,
        courseId,
        courseName,
        sessdate,
        sessdateIso,
        duration,
        lasttaken,
        lasttakenIso,
        desc,
        totalEnrolled,
        pCount,
        lCount,
        eCount,
        aCount,
        rate,
        nowIso,
        nowIso
      );
      totalSessionsSynced++;
    }
  }

  console.log(`[LMS] Davomat sinxronlandi: ${totalSessionsSynced} ta dars, ${totalStudentAttRecords} ta talaba yozuvi, ${matchedStudentsCount.size} ta talaba moslashtirildi.`);
  return {
    sessions: totalSessionsSynced,
    attendanceRecords: totalStudentAttRecords,
    matchedStudents: matchedStudentsCount.size
  };
}

/**
 * To'liq sinxronizatsiya
 */
async function syncAll() {
  if (isSyncing) {
    return { success: false, message: 'Sinxronizatsiya allaqachon bajarilmoqda' };
  }

  isSyncing = true;
  const startTime = Date.now();
  console.log('====================================================');
  console.log('🔄 [LMS] Moodle lms.akhu.uz bilan to\'liq sinxronizatsiya boshlandi...');

  try {
    const ttRes = await syncTimetable();
    const attRes = await syncAttendance();
    const durationMs = Date.now() - startTime;

    lastSyncResult = {
      success: true,
      durationMs,
      timetable: ttRes,
      attendance: attRes,
      syncedAt: new Date().toISOString()
    };

    console.log(`✅ [LMS] Sinxronizatsiya muvaffaqiyatli yakunlandi (${durationMs}ms)!`);
    console.log('====================================================');
    return lastSyncResult;
  } catch (err) {
    console.error('❌ [LMS] Sinxronizatsiya xatosi:', err);
    lastSyncResult = {
      success: false,
      error: err.message,
      syncedAt: new Date().toISOString()
    };
    return lastSyncResult;
  } finally {
    isSyncing = false;
  }
}

/**
 * Talaba uchun Dars Jadvalini olish (Mini App)
 */
function getStudentTimetable(studentId) {
  const student = db.prepare(`SELECT * FROM student WHERE id = ? OR external_id = ?`).get(studentId, studentId);
  if (!student) return { error: 'Talaba topilmadi' };

  // Talaba yozilgan kurslar
  let enrolledCourses = [];
  if (student.moodle_id) {
    enrolledCourses = db.prepare(`
      SELECT DISTINCT course_id FROM lms_course_enrollment WHERE moodle_student_id = ?
    `).all(student.moodle_id).map(r => r.course_id);
  }

  if (enrolledCourses.length === 0) {
    // Agar aniq a'zolik topilmasa, talabaning dars davomati bor kurslarini olamiz
    enrolledCourses = db.prepare(`
      SELECT DISTINCT course_id FROM lms_student_attendance WHERE student_id = ?
    `).all(student.id).map(r => r.course_id);
  }

  let timetableQuery = `
    SELECT * FROM lms_timetable 
    ORDER BY weekday ASC, timestart ASC
  `;
  let timetableEvents = [];

  if (enrolledCourses.length > 0) {
    const placeholders = enrolledCourses.map(() => '?').join(',');
    timetableEvents = db.prepare(`
      SELECT * FROM lms_timetable 
      WHERE course_id IN (${placeholders})
      ORDER BY weekday ASC, timestart ASC
    `).all(...enrolledCourses);
  } else {
    // Default hamma darslar
    timetableEvents = db.prepare(timetableQuery).all();
  }

  // Hafta kunlari bo'yicha guruhlash (1 = Dushanba ... 6 = Shanba)
  const weekdaysMap = {
    1: { day: 1, name: 'Dushanba', lessons: [] },
    2: { day: 2, name: 'Seshanba', lessons: [] },
    3: { day: 3, name: 'Chorshanba', lessons: [] },
    4: { day: 4, name: 'Payshanba', lessons: [] },
    5: { day: 5, name: 'Juma', lessons: [] },
    6: { day: 6, name: 'Shanba', lessons: [] }
  };

  const now = new Date();
  const currentDay = now.getUTCDay() === 0 ? 7 : now.getUTCDay();

  // Distinct dars mashg'ulotlarini ajratish (takrorlanuvchi haftalarni bitta shablon sifatida ko'rsatish)
  const seenClassKeys = new Set();

  for (const ev of timetableEvents) {
    const key = `${ev.weekday}_${ev.course_id}_${ev.time_str}`;
    if (!seenClassKeys.has(key)) {
      seenClassKeys.add(key);
      if (weekdaysMap[ev.weekday]) {
        weekdaysMap[ev.weekday].lessons.push({
          id: ev.id,
          event_id: ev.event_id,
          course_id: ev.course_id,
          subject_code: ev.subject_code,
          subject_name: ev.subject_name,
          teacher_name: ev.teacher_name || 'Belgilanmagan',
          room: ev.room || 'Xona ko\'rsatilmagan',
          time_str: ev.time_str,
          is_today: ev.weekday === currentDay
        });
      }
    }
  }

  const todayClasses = weekdaysMap[currentDay] ? weekdaysMap[currentDay].lessons : [];

  return {
    student: {
      id: student.id,
      name: `${student.first_name} ${student.last_name}`,
      group_code: student.group_code,
      moodle_id: student.moodle_id
    },
    current_weekday: currentDay,
    today_classes: todayClasses,
    weekly_schedule: Object.values(weekdaysMap)
  };
}

/**
 * Talaba uchun Dars Davomati ma'lumotlarini olish (Mini App)
 */
function getStudentAttendance(studentId) {
  const student = db.prepare(`SELECT * FROM student WHERE id = ? OR external_id = ?`).get(studentId, studentId);
  if (!student) return { error: 'Talaba topilmadi' };

  let attendances = [];
  if (student.moodle_id) {
    attendances = db.prepare(`
      SELECT sa.*, s.duration, s.description as session_desc, s.lasttaken_iso
      FROM lms_student_attendance sa
      JOIN lms_attendance_session s ON sa.session_id = s.session_id
      WHERE (sa.moodle_student_id = ? OR sa.student_id = ?) AND s.lasttaken IS NOT NULL
      ORDER BY sa.sessdate DESC
    `).all(student.moodle_id, student.id);
  } else {
    attendances = db.prepare(`
      SELECT sa.*, s.duration, s.description as session_desc, s.lasttaken_iso
      FROM lms_student_attendance sa
      JOIN lms_attendance_session s ON sa.session_id = s.session_id
      WHERE sa.student_id = ? AND s.lasttaken IS NOT NULL
      ORDER BY sa.sessdate DESC
    `).all(student.id);
  }

  let presentCount = 0;
  let lateCount = 0;
  let excusedCount = 0;
  let absentCount = 0;
  const subjectsMap = {};

  for (const att of attendances) {
    if (att.status === 'P') presentCount++;
    else if (att.status === 'L') lateCount++;
    else if (att.status === 'E') excusedCount++;
    else if (att.status === 'A') absentCount++;

    const cName = att.course_name || `Kurs ${att.course_id}`;
    if (!subjectsMap[cName]) {
      subjectsMap[cName] = {
        course_name: cName,
        course_id: att.course_id,
        total: 0,
        present: 0,
        late: 0,
        excused: 0,
        absent: 0,
        rate: 0
      };
    }
    const s = subjectsMap[cName];
    s.total++;
    if (att.status === 'P') s.present++;
    else if (att.status === 'L') s.late++;
    else if (att.status === 'E') s.excused++;
    else if (att.status === 'A') s.absent++;
  }

  // Har bir fan bo'yicha foizlarni hisoblash
  const subjects = Object.values(subjectsMap).map(s => {
    const attended = s.present + s.excused + (s.late * 0.5);
    s.rate = s.total > 0 ? Math.round((attended / s.total) * 1000) / 10 : 0;
    return s;
  }).sort((a, b) => b.total - a.total);

  const totalSessions = attendances.length;
  const totalAttended = presentCount + excusedCount + (lateCount * 0.5);
  const overallRate = totalSessions > 0 ? Math.round((totalAttended / totalSessions) * 1000) / 10 : 0.0;

  return {
    student: {
      id: student.id,
      name: `${student.first_name} ${student.last_name}`,
      group_code: student.group_code,
      moodle_id: student.moodle_id
    },
    summary: {
      total_sessions: totalSessions,
      present_count: presentCount,
      late_count: lateCount,
      excused_count: excusedCount,
      absent_count: absentCount,
      overall_rate: overallRate
    },
    subjects,
    recent_sessions: attendances.slice(0, 30).map(a => ({
      id: a.id,
      session_id: a.session_id,
      course_id: a.course_id,
      course_name: a.course_name,
      sessdate: a.sessdate,
      sessdate_iso: a.sessdate_iso,
      status: a.status,
      status_label: a.status === 'P' ? 'Bor (Present)' : (a.status === 'L' ? 'Kech (Late)' : (a.status === 'E' ? 'Sababli (Excused)' : 'Kelmadi (Absent)')),
      remarks: a.remarks
    }))
  };
}

/**
 * my.akhu.uz Admin / Monitoring uchun umumiy statistika va monitoring ma'lumotlari
 */
function getAdminLmsOverview(filters = {}) {
  // 1. KPI kartalari
  const totalTimetable = db.prepare(`SELECT COUNT(*) as c FROM lms_timetable`).get().c;
  const totalCourses = db.prepare(`SELECT COUNT(*) as c FROM lms_course`).get().c;
  const totalSessions = db.prepare(`SELECT COUNT(*) as c FROM lms_attendance_session`).get().c;
  const takenSessions = db.prepare(`SELECT COUNT(*) as c FROM lms_attendance_session WHERE lasttaken IS NOT NULL`).get().c;

  // Umumiy davomat foizi
  const attStats = db.prepare(`
    SELECT 
      SUM(present_count) as p,
      SUM(late_count) as l,
      SUM(excused_count) as e,
      SUM(absent_count) as a,
      SUM(total_enrolled) as total
    FROM lms_attendance_session 
    WHERE lasttaken IS NOT NULL
  `).get();

  const p = Number(attStats.p || 0);
  const l = Number(attStats.l || 0);
  const e = Number(attStats.e || 0);
  const total = Number(attStats.total || 0);
  const overallRate = total > 0 ? Math.round(((p + e + (l * 0.5)) / total) * 1000) / 10 : 0.0;

  // Bugungi darslar
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySessions = db.prepare(`
    SELECT * FROM lms_attendance_session 
    WHERE sessdate_iso LIKE ?
    ORDER BY sessdate ASC
  `).all(`${todayStr}%`);

  // Fanlar kesimidagi davomat reytingi
  const coursesRanking = db.prepare(`
    SELECT 
      course_name,
      COUNT(*) as sessions_count,
      SUM(total_enrolled) as total_enrolled,
      SUM(present_count) as present,
      SUM(late_count) as late,
      SUM(absent_count) as absent,
      AVG(attendance_rate) as avg_rate
    FROM lms_attendance_session
    WHERE lasttaken IS NOT NULL AND course_name IS NOT NULL
    GROUP BY course_name
    ORDER BY avg_rate DESC
  `).all().map(r => ({
    course_name: r.course_name,
    sessions_count: Number(r.sessions_count),
    present: Number(r.present),
    absent: Number(r.absent),
    late: Number(r.late),
    avg_rate: Math.round(Number(r.avg_rate) * 10) / 10
  }));

  // So'nggi darslar ro'yxati
  const recentSessions = db.prepare(`
    SELECT * FROM lms_attendance_session
    WHERE lasttaken IS NOT NULL
    ORDER BY sessdate DESC
    LIMIT 25
  `).all();

  return {
    kpis: {
      total_timetable: totalTimetable,
      total_courses: totalCourses,
      total_sessions: totalSessions,
      taken_sessions: takenSessions,
      overall_rate: overallRate,
      present_count: p,
      absent_count: Number(attStats.a || 0),
      late_count: l
    },
    today: {
      date: todayStr,
      count: todaySessions.length,
      sessions: todaySessions
    },
    courses_ranking: coursesRanking,
    recent_sessions: recentSessions,
    last_sync: lastSyncResult
  };
}

/**
 * Admin: Talabalar davomati monitoringi ro'yxati
 */
function getAdminLmsStudents(search = '', groupCode = '', limit = 100) {
  let query = `
    SELECT 
      st.id, st.external_id, st.first_name, st.last_name, st.group_code, st.moodle_id,
      COUNT(sa.id) as total_classes,
      SUM(CASE WHEN sa.status = 'P' THEN 1 ELSE 0 END) as present_count,
      SUM(CASE WHEN sa.status = 'L' THEN 1 ELSE 0 END) as late_count,
      SUM(CASE WHEN sa.status = 'E' THEN 1 ELSE 0 END) as excused_count,
      SUM(CASE WHEN sa.status = 'A' THEN 1 ELSE 0 END) as absent_count
    FROM student st
    LEFT JOIN lms_student_attendance sa ON (sa.student_id = st.id OR sa.moodle_student_id = st.moodle_id)
    WHERE st.status = 'active'
  `;

  const params = [];

  if (groupCode) {
    query += ` AND st.group_code = ?`;
    params.push(groupCode);
  }

  if (search) {
    query += ` AND (st.first_name ILIKE ? OR st.last_name ILIKE ? OR st.external_id ILIKE ?)`;
    const s = `%${search}%`;
    params.push(s, s, s);
  }

  query += `
    GROUP BY st.id, st.external_id, st.first_name, st.last_name, st.group_code, st.moodle_id
    ORDER BY total_classes DESC, present_count DESC
    LIMIT ?
  `;
  params.push(Number(limit));

  const list = db.prepare(query).all(...params).map(st => {
    const total = Number(st.total_classes);
    const p = Number(st.present_count);
    const l = Number(st.late_count);
    const e = Number(st.excused_count);
    const a = Number(st.absent_count);
    const attended = p + e + (l * 0.5);
    const rate = total > 0 ? Math.round((attended / total) * 1000) / 10 : 0.0;

    return {
      id: st.id,
      external_id: st.external_id,
      full_name: `${st.first_name} ${st.last_name}`,
      group_code: st.group_code,
      moodle_id: st.moodle_id,
      total_classes: total,
      present_count: p,
      late_count: l,
      excused_count: e,
      absent_count: a,
      attendance_rate: rate
    };
  });

  return { students: list };
}

/**
 * Admin: Bitta dars sessiyasining to'liq talabalar davomatini olish
 */
function getAdminSessionDetails(sessionId) {
  const session = db.prepare(`SELECT * FROM lms_attendance_session WHERE session_id = ?`).get(sessionId);
  if (!session) return { error: 'Dars sessiyasi topilmadi' };

  const students = db.prepare(`
    SELECT sa.*, st.group_code, st.photo_url
    FROM lms_student_attendance sa
    LEFT JOIN student st ON sa.student_id = st.id
    WHERE sa.session_id = ?
    ORDER BY sa.student_name ASC
  `).all(sessionId);

  return { session, students };
}

/**
 * Fon rejimida davriy sinxronlash croni (Har 30 daqiqada)
 */
function startLmsSyncCron() {
  console.log('[LMS] Avtomatik Moodle sinxronlash croni faollashtirildi (Har 30 daqiqada).');

  // Birinchi sinxronlashni server ishga tushgandan 10 soniya o'tib bajarish
  setTimeout(() => {
    syncAll().catch(e => console.error('[LMS] Boshlang\'ich sinxronlashda xatolik:', e.message));
  }, 10000);

  // Har 30 daqiqada bir marta yangilab turish
  setInterval(() => {
    syncAll().catch(e => console.error('[LMS] Davriy sinxronlashda xatolik:', e.message));
  }, 30 * 60 * 1000);
}

module.exports = {
  syncAll,
  syncTimetable,
  syncAttendance,
  getStudentTimetable,
  getStudentAttendance,
  getAdminLmsOverview,
  getAdminLmsStudents,
  getAdminSessionDetails,
  startLmsSyncCron
};
