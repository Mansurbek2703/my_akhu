const express = require('express');
const router = express.Router();
const xlsx = require('xlsx');
const { db } = require('../db/database');
const config = require('../config');
const {
  testHikCentralConnection,
  syncCampusAttendance,
  syncMissingStudentPhotos,
  getCampusAttendanceSummary,
  getCampusAttendanceList,
  getStudentAttendanceHistory,
  getStudentLmsCrosscheck,
  getLmsTurniketAudit,
  getDeepCrossAudit
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
 * GET /api/attendance/export-excel
 * Filtrlangan davomat ro'yxatini to'liq Excel fayl qilib yuklab olish
 */
router.get('/export-excel', (req, res) => {
  try {
    const { date, group_code, status, search } = req.query;
    const dateStr = date || new Date().toISOString().slice(0, 10);
    const result = getCampusAttendanceList({
      date: dateStr,
      group_code,
      status,
      search,
      page: 1,
      limit: 10000 // barcha yozuvlar
    });

    const statusLabels = {
      '': 'Barcha_Talabalar',
      'present': 'Kelganlar',
      'late': 'Kechikkanlar',
      'in_campus': 'Hozir_Binoda',
      'absent': 'Kelmaganlar'
    };
    const currentLabel = statusLabels[status || ''] || 'Davomat';

    const formatTime = (iso) => {
      if (!iso) return '-';
      try {
        return new Date(iso).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      } catch(e) {
        return iso.slice(11, 19);
      }
    };

    const excelData = (result.list || []).map((s, idx) => {
      let holat = 'Kelmagan';
      if (s.attendance_status === 'present') holat = 'Kelgan (vaqtida)';
      if (s.attendance_status === 'late') holat = 'Kechikkan (09:15 dan keyin)';
      if (s.is_in_campus) holat += ' [Hozir binoda]';

      return {
        '№': idx + 1,
        'Familiya va Ismi': `${s.last_name || ''} ${s.first_name || ''}`.trim(),
        'Akademik Guruh': s.group_code || '-',
        'Kurs': s.course ? `${s.course}-kurs` : '-',
        'Pasport ID': s.passport_id || '-',
        'Telefon': s.phone || '-',
        'Sana': dateStr,
        'Universitetga Kirdi': formatTime(s.first_in_at),
        'Universitetdan Chiqdi': s.is_in_campus ? 'Hozir binoda' : formatTime(s.last_out_at),
        'Kirishlar soni': s.in_count,
        'Chiqishlar soni': s.out_count,
        'Holati': holat
      };
    });

    const ws = xlsx.utils.json_to_sheet(excelData);
    ws['!cols'] = [
      { wch: 6 },
      { wch: 30 },
      { wch: 16 },
      { wch: 10 },
      { wch: 15 },
      { wch: 18 },
      { wch: 12 },
      { wch: 20 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 26 }
    ];

    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, currentLabel.slice(0, 31));
    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

    const filename = `davomat_${currentLabel}_${dateStr}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: `Excel eksport xatosi: ${err.message}` });
  }
});

/**
 * GET /api/attendance/live-alerts
 * Superadmin va mas'ullar uchun saytda jonli bildirishnomalar (oxirgi turniket loglari)
 */
router.get('/live-alerts', (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '15', 10);
    const logs = db.prepare(`
      SELECT 
        l.id,
        l.student_id,
        l.passport_id,
        l.person_name,
        l.event_time,
        l.direction,
        l.door_name,
        s.group_code,
        s.photo_url
      FROM access_control_log l
      LEFT JOIN student s ON l.student_id = s.id
      ORDER BY l.event_time DESC
      LIMIT ?
    `).all(limit);

    res.json({
      timestamp: new Date().toISOString(),
      alerts: logs
    });
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

/**
 * POST /api/attendance/sync-photos
 * Tizimda rasmi mavjud bo'lmagan talabalarning rasmlarini HikCentral turniket serveridan yuklab to'ldirish
 */
router.post('/sync-photos', async (req, res) => {
  try {
    const result = await syncMissingStudentPhotos();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: `Rasmlarni sinxronlash xatosi: ${err.message}` });
  }
});

/**
 * GET /api/attendance/student-lms-crosscheck
 * Bitta talaba uchun LMS dars jadvali va turniket moslik tahlili
 */
router.get('/student-lms-crosscheck', (req, res) => {
  try {
    const { student_id, date } = req.query;
    if (!student_id) {
      return res.status(400).json({ error: "student_id parametri talab qilinadi" });
    }
    const result = getStudentLmsCrosscheck(student_id, date);
    if (!result) {
      return res.status(404).json({ error: "Talaba topilmadi" });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/attendance/lms-turniket-audit
 * Butun universitet bo'yicha LMS va Turniket moslik tahlili
 */
router.get('/lms-turniket-audit', (req, res) => {
  try {
    const { date } = req.query;
    const result = getLmsTurniketAudit(date);
    res.json({ success: true, data: result, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/attendance/cross-audit-deep
 * Turniket va LMS davomati mutanosibligi chuqur auditi (4 ta toifa, reytinglar, statistikalar)
 */
router.get('/cross-audit-deep', (req, res) => {
  try {
    const { date, category, group_code, course, search } = req.query;
    const result = getDeepCrossAudit({ date, category, group_code, course, search });
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('Cross-audit-deep error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/attendance/export-cross-audit-excel
 * Mutanosiblik hisobotini Excel (.xlsx) formatida yuklab olish
 */
router.get('/export-cross-audit-excel', (req, res) => {
  try {
    const { date, category, group_code, course, search } = req.query;
    const dateStr = date || new Date().toISOString().slice(0, 10);
    const result = getDeepCrossAudit({ date: dateStr, category, group_code, course, search });

    const formatTime = (iso) => {
      if (!iso) return '-';
      try {
        return new Date(iso).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      } catch(e) {
        return iso.slice(11, 19);
      }
    };

    const excelData = (result.students || []).map((s, idx) => {
      const lessonsStr = (s.lessons || []).map(l => `${l.subject} (${l.time_str || ''})`).join('; ') || 'Dars jadvalida yo\'q';
      const turniketStr = s.turniket.has_entry
        ? `Kirdi: ${formatTime(s.turniket.first_in)}${s.turniket.is_in_campus ? ' [Binoda]' : ' Chiqdi: ' + formatTime(s.turniket.last_out)}`
        : 'Turniketdan o\'tmagan';

      return {
        '№': idx + 1,
        'Talaba F.I.SH.': s.full_name,
        'Guruh': s.group_code || '-',
        'Kurs': s.course ? `${s.course}-kurs` : '-',
        'Telefon': s.phone || '-',
        'Sana': dateStr,
        'Bugungi Darslar (LMS)': lessonsStr,
        'LMS (Moodle) Davomat': s.lms.status_label,
        'Turniket (Face ID)': turniketStr,
        'Mutanosiblik Xulosasi': s.category_label,
        'Izoh': s.verdict_details
      };
    });

    const ws = xlsx.utils.json_to_sheet(excelData);
    ws['!cols'] = [
      { wch: 6 },
      { wch: 30 },
      { wch: 14 },
      { wch: 10 },
      { wch: 16 },
      { wch: 14 },
      { wch: 40 },
      { wch: 22 },
      { wch: 30 },
      { wch: 36 },
      { wch: 45 }
    ];

    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Mutanosiblik_Audit');
    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

    const filename = `mutanosiblik_audit_${dateStr}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    res.send(buffer);
  } catch (err) {
    console.error('Export cross-audit error:', err);
    res.status(500).json({ error: `Excel eksport xatosi: ${err.message}` });
  }
});

module.exports = router;
