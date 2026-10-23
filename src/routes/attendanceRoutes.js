const express = require('express');
const router = express.Router();
const { db } = require('../db/database');
const config = require('../config');
const {
  testHikCentralConnection,
  syncCampusAttendance,
  getCampusAttendanceSummary,
  getCampusAttendanceList,
  getStudentAttendanceHistory
} = require('../services/hikcentralService');

// Xodimlarni autentifikatsiya qilish
function authenticateStaff(req, res, next) {
  const userId = req.headers['x-user-id'] || req.query.user_id;
  if (!userId) {
    return res.status(401).json({ error: "Avtorizatsiyadan o'tilmagan. Iltimos, tizimga kiring." });
  }

  if (userId === 'superadmin') {
    req.staffUser = { id: 'superadmin', full_name: 'Superadmin', roles: ['superadmin'] };
    return next();
  }

  const user = db.prepare(`SELECT * FROM staff_user WHERE id = ? AND active = 1`).get(userId);
  if (!user) {
    return res.status(401).json({ error: "Foydalanuvchi topilmadi yoki hisob faol emas." });
  }

  let roles = [];
  try { roles = JSON.parse(user.roles); } catch (e) { roles = [user.roles]; }
  req.staffUser = { ...user, roles };
  next();
}

router.use(authenticateStaff);

/**
 * GET /api/attendance/summary
 * Tanlangan sana yoki bugungi kunlik davomat statistikasi
 */
router.get('/summary', (req, res) => {
  try {
    const date = req.query.date || null;
    const summary = getCampusAttendanceSummary(date);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/attendance/daily
 * Talabalarning kunlik kirish-chiqish va davomat ro'yxati
 */
router.get('/daily', (req, res) => {
  try {
    const { date, group_code, status, search, page, limit } = req.query;
    const result = getCampusAttendanceList({
      date,
      group_code,
      status,
      search,
      page: parseInt(page || '1', 10),
      limit: parseInt(limit || '50', 10)
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/attendance/student/:id
 * Bitta talabaning to'liq kirish-chiqish tarixi
 */
router.get('/student/:id', (req, res) => {
  try {
    const data = getStudentAttendanceHistory(req.params.id, parseInt(req.query.days || '30', 10));
    if (!data) {
      return res.status(404).json({ error: "Talaba topilmadi" });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/attendance/sync
 * HikCentral serveridan yangi kirish-chiqish voqealarini tortib sinxronlash
 */
router.post('/sync', async (req, res) => {
  try {
    const date = req.body.date || null;
    const result = await syncCampusAttendance(date);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: `Sinxronizatsiya xatosi: ${err.message}` });
  }
});

/**
 * GET /api/attendance/status
 * HikCentral serveriga ulanish va sozlamalar holati
 */
router.get('/status', async (req, res) => {
  try {
    const status = await testHikCentralConnection();
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
