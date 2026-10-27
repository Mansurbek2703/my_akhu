const express = require('express');
const router = express.Router();
const { db } = require('../db/database');
const config = require('../config');
const {
  syncAll,
  getAdminLmsOverview,
  getAdminLmsStudents,
  getAdminSessionDetails,
  getLmsGroupsRanking
} = require('../services/lmsService');

// Middleware: Faqat tizimga kirgan xodimlar, registrator, superadmin yoki observer
function authenticateStaff(req, res, next) {
  const tvToken = req.query.token || req.headers['x-tv-token'];
  if (tvToken && tvToken === config.secrets.tvToken) {
    req.staffUser = { id: 'tv_display', roles: ['observer'] };
    return next();
  }

  const userId = req.headers['x-user-id'] || req.query.user_id;
  if (!userId) {
    return res.status(401).json({ error: "Avtorizatsiyadan o'tilmagan. Iltimos, tizimga kiring." });
  }

  if (userId === 'superadmin') {
    req.staffUser = { id: 'superadmin', full_name: 'Superadmin', roles: ['superadmin'] };
    return next();
  }

  const user = db.prepare(`SELECT * FROM staff_user WHERE (LOWER(id) = LOWER(?) OR LOWER(COALESCE(passport_id, '')) = LOWER(?)) AND active = 1`).get(userId, userId);
  if (!user) {
    return res.status(401).json({ error: "Foydalanuvchi topilmadi yoki hisob faol emas." });
  }

  let roles = [];
  try { roles = JSON.parse(user.roles); } catch (e) { roles = [user.roles]; }
  let permissions = [];
  try { permissions = JSON.parse(user.permissions || '[]'); } catch (e) { permissions = []; }

  req.staffUser = { ...user, roles, permissions };
  next();
}

router.use(authenticateStaff);

/**
 * GET /api/lms/overview
 * Asosiy monitoring va KPI ko'rsatkichlari
 */
router.get('/overview', (req, res) => {
  try {
    const data = getAdminLmsOverview(req.query);
    res.json(data);
  } catch (err) {
    console.error('LMS Overview error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/lms/timetable
 * Dars jadvallari ro'yxati (Hafta kunlari, fanlar, o'qituvchilar bo'yicha filter)
 */
router.get('/timetable', (req, res) => {
  try {
    const { weekday, course_id, group, search, date } = req.query;
    // Faqat joriy 2026-2027 o'quv yili (2026-09-01 dan keyin) va faol kurslar
    let query = `SELECT * FROM lms_timetable WHERE timestart >= 1788220800 AND course_id NOT IN (2, 3, 4, 5, 6, 9, 11, 12, 14, 15)`;
    const params = [];

    if (date) {
      const startOfDay = Math.floor(new Date(`${date}T00:00:00+05:00`).getTime() / 1000);
      const endOfDay = Math.floor(new Date(`${date}T23:59:59+05:00`).getTime() / 1000);
      query += ` AND timestart >= ? AND timestart <= ?`;
      params.push(startOfDay, endOfDay);
    }
    if (weekday) {
      query += ` AND weekday = ?`;
      params.push(Number(weekday));
    }
    if (course_id) {
      query += ` AND course_id = ?`;
      params.push(Number(course_id));
    }
    if (group) {
      query += ` AND (group_code = ? OR group_name ILIKE ?)`;
      params.push(group, `%${group}%`);
    }
    if (search) {
      query += ` AND (subject_name ILIKE ? OR teacher_name ILIKE ? OR room ILIKE ? OR group_name ILIKE ?)`;
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    query += ` ORDER BY weekday ASC, timestart ASC`;
    const timetable = db.prepare(query).all(...params);

    // Hafta kunlari bo'yicha guruhlash (har bir dars vaqti, fan, xona va guruhi bo'yicha takrorlanmas darslar)
    const weekdays = {
      1: { name: 'Dushanba', lessons: [] },
      2: { name: 'Seshanba', lessons: [] },
      3: { name: 'Chorshanba', lessons: [] },
      4: { name: 'Payshanba', lessons: [] },
      5: { name: 'Juma', lessons: [] },
      6: { name: 'Shanba', lessons: [] }
    };

    const distinctKeys = new Set();
    for (const item of timetable) {
      const key = `${item.weekday}_${item.time_str}_${item.subject_code}_${item.group_code || ''}_${item.room || ''}`;
      if (!distinctKeys.has(key)) {
        distinctKeys.add(key);
        if (weekdays[item.weekday]) {
          weekdays[item.weekday].lessons.push(item);
        }
      }
    }

    // Bugun va ertangi kunning aniq darslari (Asia/Tashkent vaqti)
    const todayDateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tashkent' }).format(new Date());
    const tomorrowObj = new Date(Date.now() + 24 * 3600 * 1000);
    const tomorrowDateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tashkent' }).format(tomorrowObj);

    const todayStart = Math.floor(new Date(`${todayDateStr}T00:00:00+05:00`).getTime() / 1000);
    const todayEnd = Math.floor(new Date(`${todayDateStr}T23:59:59+05:00`).getTime() / 1000);
    const tomorrowStart = Math.floor(new Date(`${tomorrowDateStr}T00:00:00+05:00`).getTime() / 1000);
    const tomorrowEnd = Math.floor(new Date(`${tomorrowDateStr}T23:59:59+05:00`).getTime() / 1000);

    const todayLessons = db.prepare(`
      SELECT * FROM lms_timetable
      WHERE timestart >= ? AND timestart <= ? AND course_id NOT IN (2, 3, 4, 5, 6, 9, 11, 12, 14, 15)
      ORDER BY timestart ASC
    `).all(todayStart, todayEnd);

    const tomorrowLessons = db.prepare(`
      SELECT * FROM lms_timetable
      WHERE timestart >= ? AND timestart <= ? AND course_id NOT IN (2, 3, 4, 5, 6, 9, 11, 12, 14, 15)
      ORDER BY timestart ASC
    `).all(tomorrowStart, tomorrowEnd);

    res.json({
      success: true,
      current_academic_year: '2026-2027 (Fall 26/27)',
      today: {
        date: todayDateStr,
        weekday: new Intl.DateTimeFormat('uz-UZ', { timeZone: 'Asia/Tashkent', weekday: 'long' }).format(new Date()),
        count: todayLessons.length,
        lessons: todayLessons
      },
      tomorrow: {
        date: tomorrowDateStr,
        weekday: new Intl.DateTimeFormat('uz-UZ', { timeZone: 'Asia/Tashkent', weekday: 'long' }).format(tomorrowObj),
        count: tomorrowLessons.length,
        lessons: tomorrowLessons
      },
      timetable,
      grouped_by_weekday: Object.entries(weekdays).map(([day, val]) => ({
        weekday: Number(day),
        name: val.name,
        lessons: val.lessons
      }))
    });
  } catch (err) {
    console.error('LMS Timetable error:', err);
    res.status(500).json({ error: err.message });
  }
});


/**
 * GET /api/lms/sessions
 * Dars mashg'ulotlari (Sessions) ro'yxati
 */
router.get('/sessions', (req, res) => {
  try {
    const { date, course_id, page = 1, limit = 50 } = req.query;
    let query = `SELECT * FROM lms_attendance_session WHERE 1=1`;
    const params = [];

    if (date) {
      query += ` AND sessdate_iso LIKE ?`;
      params.push(`${date}%`);
    }
    if (course_id) {
      query += ` AND course_id = ?`;
      params.push(Number(course_id));
    }

    query += ` ORDER BY sessdate DESC`;
    const offset = (Number(page) - 1) * Number(limit);
    query += ` LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    const sessions = db.prepare(query).all(...params);
    res.json({ sessions });
  } catch (err) {
    console.error('LMS Sessions error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/lms/sessions/:id
 * Bitta dars sessiyasidagi talabalar davomati
 */
router.get('/sessions/:id', (req, res) => {
  try {
    const data = getAdminSessionDetails(Number(req.params.id));
    if (data.error) return res.status(404).json(data);
    res.json(data);
  } catch (err) {
    console.error('LMS Session details error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/lms/students
 * Talabalar kesimida LMS davomat monitoringi
 */
router.get('/students', (req, res) => {
  try {
    const { search, group, limit } = req.query;
    const data = getAdminLmsStudents(search, group, limit);
    res.json(data);
  } catch (err) {
    console.error('LMS Students error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/lms/groups-ranking
 * Guruhlar kesimida davomat reytingi
 */
router.get('/groups-ranking', (req, res) => {
  try {
    const { date, period } = req.query;
    const ranking = getLmsGroupsRanking(date, period);
    res.json({ success: true, ranking });
  } catch (err) {
    console.error('LMS groups ranking error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/lms/sync
 * Moodle bilan qo'lda sinxronlashni ishga tushirish
 */
router.post('/sync', async (req, res) => {
  try {
    const result = await syncAll();
    res.json(result);
  } catch (err) {
    console.error('LMS manual sync error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
