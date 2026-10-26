const express = require('express');
const router = express.Router();
const { db } = require('../db/database');
const config = require('../config');
const {
  syncAll,
  getAdminLmsOverview,
  getAdminLmsStudents,
  getAdminSessionDetails
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
    const { weekday, course_id, search } = req.query;
    let query = `SELECT * FROM lms_timetable WHERE 1=1`;
    const params = [];

    if (weekday) {
      query += ` AND weekday = ?`;
      params.push(Number(weekday));
    }
    if (course_id) {
      query += ` AND course_id = ?`;
      params.push(Number(course_id));
    }
    if (search) {
      query += ` AND (subject_name ILIKE ? OR teacher_name ILIKE ? OR room ILIKE ?)`;
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    query += ` ORDER BY weekday ASC, timestart ASC`;
    const timetable = db.prepare(query).all(...params);

    // Hafta kunlari bo'yicha guruhlash
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
      const key = `${item.weekday}_${item.course_id}_${item.time_str}_${item.subject_name}`;
      if (!distinctKeys.has(key)) {
        distinctKeys.add(key);
        if (weekdays[item.weekday]) {
          weekdays[item.weekday].lessons.push(item);
        }
      }
    }

    res.json({
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
