const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const xlsx = require('xlsx');

const { db } = require('../db/database');
const config = require('../config');
const { logAudit } = require('../services/pointService');
const { importStudentsBatch } = require('../services/importService');
const { recalculateStudentScores } = require('../services/ratingService');

// Multer upload sozlamasi (Excel va CSV uchun)
const uploadDir = config.uploadDir || path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `import_${Date.now()}_${crypto.randomBytes(6).toString('hex')}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }
});

// Middleware: Faqat Superadmin
function authenticateSuperadmin(req, res, next) {
  const userId = req.headers['x-user-id'] || 'superadmin';
  const user = db.prepare(`SELECT * FROM staff_user WHERE id = ? AND active = 1`).get(userId);
  if (!user) return res.status(401).json({ error: 'Foydalanuvchi topilmadi' });

  const roles = JSON.parse(user.roles);
  if (!roles.includes('superadmin')) {
    return res.status(403).json({ error: 'Faqat Superadmin roli uchun ruxsat berilgan' });
  }

  req.staffUser = { ...user, roles };
  next();
}

// Middleware: Superadmin YOKI Registrator (dep_ob)
function authenticateSuperadminOrRegistrator(req, res, next) {
  const userId = req.headers['x-user-id'] || 'superadmin';
  const user = db.prepare(`SELECT * FROM staff_user WHERE id = ? AND active = 1`).get(userId);
  if (!user) return res.status(401).json({ error: 'Foydalanuvchi topilmadi' });

  const roles = JSON.parse(user.roles);
  if (!roles.includes('superadmin') && !roles.includes('dep_ob')) {
    return res.status(403).json({ error: 'Faqat Superadmin yoki Registrator (O\'quv bo\'limi) uchun ruxsat berilgan' });
  }

  req.staffUser = { ...user, roles };
  next();
}

/**
 * POST /api/admin/login
 * Sodda login va parol orqali xodimlar va superadmin uchun kirish
 */
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username) return res.status(400).json({ error: 'Login kiritilishi shart' });

  const u = String(username).toLowerCase().trim();
  const p = String(password || '').toLowerCase().trim();

  // 1. Superadmin (Mansurbek Qazaqov)
  if (['admin', 'superadmin', '1202082857', 'mansurbek', 'superadmin@akhu.uz'].includes(u)) {
    if (['admin', 'admin123', 'admin2026', 'sshtelnet27032004!', 'akhu2026!'].includes(p)) {
      return res.json({
        success: true,
        user: {
          id: 'superadmin',
          full_name: 'Mansurbek Qazaqov (Superadmin)',
          roles: ['superadmin'],
          email: 'superadmin@akhu.uz'
        }
      });
    } else {
      return res.status(401).json({ error: 'Parol noto\'g\'ri' });
    }
  }

  // 2. Tyutorlar
  if (u === 'tutor1' || u === 'tutor_1') {
    if (['tutor123', 'admin', 'admin123', 'akhu2026!'].includes(p)) {
      return res.json({
        success: true,
        user: { id: 'tutor_1', full_name: 'Jasur Mahmudov (Tyutor 1)', roles: ['tutor'], email: 'tutor1@akhu.uz' }
      });
    }
  }
  if (u === 'tutor2' || u === 'tutor_2') {
    if (['tutor123', 'admin', 'admin123', 'akhu2026!'].includes(p)) {
      return res.json({
        success: true,
        user: { id: 'tutor_2', full_name: 'Aziza Qodirova (Tyutor 2)', roles: ['tutor'], email: 'tutor2@akhu.uz' }
      });
    }
  }
  if (u === 'tutor3' || u === 'tutor_3') {
    if (['tutor123', 'admin', 'admin123', 'akhu2026!'].includes(p)) {
      return res.json({
        success: true,
        user: { id: 'tutor_3', full_name: 'Bobur Alimov (Tyutor 3)', roles: ['tutor'], email: 'tutor3@akhu.uz' }
      });
    }
  }

  // 3. Prorektor
  if (u === 'prorektor') {
    if (['pro123', 'admin', 'admin123', 'akhu2026!'].includes(p)) {
      return res.json({
        success: true,
        user: { id: 'prorektor', full_name: 'Prof. Alisher Vohidov (Yoshlar bo\'yicha prorektor)', roles: ['prorektor'], email: 'prorektor@akhu.uz' }
      });
    }
  }

  // 4. Bo'limlar
  const depts = ['dep_yb', 'dep_mb', 'dep_ob', 'dep_ib', 'dep_sb', 'dep_pb'];
  if (depts.includes(u)) {
    if (['dep123', 'admin', 'admin123', 'akhu2026!'].includes(p)) {
      const user = db.prepare(`SELECT * FROM staff_user WHERE id = ?`).get(u);
      return res.json({
        success: true,
        user: { id: u, full_name: user ? user.full_name : u, roles: [u], email: user ? user.email : `${u}@akhu.uz` }
      });
    }
  }

  // 5. Kuzatuvchi
  if (u === 'observer') {
    if (['observer123', 'admin', 'admin123', 'akhu2026!'].includes(p)) {
      return res.json({
        success: true,
        user: { id: 'observer', full_name: 'Universitet Kuzatuv Kengashi / Rektorat', roles: ['observer'], email: 'observer@akhu.uz' }
      });
    }
  }

  return res.status(401).json({ error: 'Login yoki parol noto\'g\'ri' });
});

// ====================================================================
// TALABALAR BOSHQARUVI (REGISTRATOR VA SUPERADMIN)
// ====================================================================

/**
 * GET /api/admin/students
 * Talabalar ro'yxati (filtrlash, qidiruv)
 */
router.get('/students', authenticateSuperadminOrRegistrator, (req, res) => {
  const { search, status, group, level, course, limit = 100, offset = 0 } = req.query;

  let where = [];
  let params = [];

  if (status) {
    where.push('st.status = ?');
    params.push(status);
  }
  if (group) {
    where.push('st.group_code = ?');
    params.push(group);
  }
  if (level) {
    where.push('st.level = ?');
    params.push(level);
  }
  if (course) {
    where.push('st.course = ?');
    params.push(Number(course));
  }
  if (search) {
    where.push('(st.first_name LIKE ? OR st.last_name LIKE ? OR st.external_id LIKE ? OR st.group_code LIKE ? OR st.phone LIKE ?)');
    const q = `%${search}%`;
    params.push(q, q, q, q, q);
  }

  const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

  const sql = `
    SELECT st.*, su.full_name as tutor_name, sc.total, sc.season, sc.rank_cohort
    FROM student st
    LEFT JOIN staff_user su ON st.tutor_id = su.id
    LEFT JOIN student_score sc ON st.id = sc.student_id
    ${whereClause}
    ORDER BY st.created_at DESC
    LIMIT ? OFFSET ?
  `;

  const students = db.prepare(sql).all(...params, Number(limit), Number(offset));
  const total = db.prepare(`SELECT COUNT(*) as c FROM student st ${whereClause}`).get(...params).c;

  res.json({ students, total });
});

/**
 * POST /api/admin/students
 * Yangi talaba qo'shish (qo'lda kiritish)
 */
router.post('/students', authenticateSuperadminOrRegistrator, (req, res) => {
  try {
    const {
      external_id,
      first_name,
      last_name,
      group_code,
      program_code,
      level = 'bak',
      course = 1,
      gender = 'm',
      email,
      phone,
      tutor_id
    } = req.body;

    if (!external_id || !first_name || !last_name || !group_code) {
      return res.status(400).json({ error: 'ID, Ism, Familiya va Guruh to\'ldirilishi shart' });
    }

    // Unikallikni tekshirish
    const exists = db.prepare(`SELECT id FROM student WHERE external_id = ?`).get(external_id);
    if (exists) {
      return res.status(400).json({ error: `Ushbu talaba ID (${external_id}) allaqachon mavjud` });
    }

    const studentId = 'std_' + crypto.randomBytes(6).toString('hex');
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO student (
        id, external_id, first_name, last_name, group_code, program_code,
        level, course, gender, email, phone, tutor_id, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)
    `).run(
      studentId,
      String(external_id),
      first_name,
      last_name,
      group_code,
      program_code || 'IT',
      level,
      Number(course) || 1,
      gender,
      email || null,
      phone || null,
      tutor_id || null,
      now,
      now
    );

    // Boshlang'ich score yozuvi yaratish
    db.prepare(`
      INSERT OR IGNORE INTO student_score (
        student_id, total, season, week_cur, week_prev, by_category, events_count, updated_at
      ) VALUES (?, 0, 0, 0, 0, '{}', 0, ?)
    `).run(studentId, now);

    logAudit({
      actor_id: req.staffUser.id,
      actor_role: req.staffUser.roles[0],
      action: 'CREATE_STUDENT',
      object_type: 'student',
      object_id: studentId,
      after: { external_id, first_name, last_name, group_code },
      ip: req.ip || '127.0.0.1'
    });

    res.json({ success: true, student_id: studentId, message: 'Talaba muvaffaqiyatli qo\'shildi' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * PUT /api/admin/students/:id
 * Talaba ma'lumotlarini tahrirlash
 */
router.put('/students/:id', authenticateSuperadminOrRegistrator, (req, res) => {
  try {
    const student = db.prepare(`SELECT * FROM student WHERE id = ?`).get(req.params.id);
    if (!student) return res.status(404).json({ error: 'Talaba topilmadi' });

    const {
      external_id,
      first_name,
      last_name,
      group_code,
      program_code,
      level,
      course,
      gender,
      email,
      phone,
      tutor_id,
      status
    } = req.body;

    const now = new Date().toISOString();

    db.prepare(`
      UPDATE student
      SET external_id = COALESCE(?, external_id),
          first_name = COALESCE(?, first_name),
          last_name = COALESCE(?, last_name),
          group_code = COALESCE(?, group_code),
          program_code = COALESCE(?, program_code),
          level = COALESCE(?, level),
          course = COALESCE(?, course),
          gender = COALESCE(?, gender),
          email = ?,
          phone = ?,
          tutor_id = ?,
          status = COALESCE(?, status),
          updated_at = ?
      WHERE id = ?
    `).run(
      external_id !== undefined ? String(external_id) : student.external_id,
      first_name !== undefined ? first_name : student.first_name,
      last_name !== undefined ? last_name : student.last_name,
      group_code !== undefined ? group_code : student.group_code,
      program_code !== undefined ? program_code : student.program_code,
      level !== undefined ? level : student.level,
      course !== undefined ? Number(course) : student.course,
      gender !== undefined ? gender : student.gender,
      email !== undefined ? email : student.email,
      phone !== undefined ? phone : student.phone,
      tutor_id !== undefined ? tutor_id : student.tutor_id,
      status !== undefined ? status : student.status,
      now,
      req.params.id
    );

    logAudit({
      actor_id: req.staffUser.id,
      actor_role: req.staffUser.roles[0],
      action: 'UPDATE_STUDENT',
      object_type: 'student',
      object_id: req.params.id,
      before: student,
      after: req.body,
      ip: req.ip || '127.0.0.1'
    });

    res.json({ success: true, message: 'Talaba ma\'lumotlari yangilandi' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/admin/students/:id/status
 * Talaba holatini o'zgartirish (active / left)
 */
router.post('/students/:id/status', authenticateSuperadminOrRegistrator, (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'left'].includes(status)) {
      return res.status(400).json({ error: 'Holat faqat "active" yoki "left" bo\'lishi kerak' });
    }

    const now = new Date().toISOString();
    db.prepare(`UPDATE student SET status = ?, updated_at = ? WHERE id = ?`).run(status, now, req.params.id);

    recalculateStudentScores();

    res.json({ success: true, message: `Talaba holati "${status}" ga o'zgartirildi` });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/admin/import/students
 * Excel (.xlsx, .xls, .csv) fayl yuklash va talabalar ro'yxatini import qilish
 */
router.post('/import/students', authenticateSuperadminOrRegistrator, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Excel yoki CSV fayl tanlanmagan' });
    }

    const filePath = req.file.path;
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const rawRows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (!rawRows || rawRows.length === 0) {
      try { fs.unlinkSync(filePath); } catch (e) {}
      return res.status(400).json({ error: 'Faylda ma\'lumotlar topilmadi' });
    }

    // Ustunlarni normallashtirish (o'zbek va inglizcha sarlavhalarga moslash)
    const normalizedRows = rawRows.map(r => {
      const getVal = (...keys) => {
        for (const k of keys) {
          if (r[k] !== undefined && r[k] !== null && String(r[k]).trim() !== '') return String(r[k]).trim();
        }
        return '';
      };

      const extId = getVal('external_id', 'ID', 'Id', 'id', 'student_id', 'Talaba ID', 'talaba_id');
      const fn = getVal('first_name', 'Ism', 'ism', 'name', 'FirstName');
      const ln = getVal('last_name', 'Familiya', 'familiya', 'surname', 'LastName');
      const gr = getVal('group_code', 'Guruh', 'guruh', 'group', 'Group');
      const pr = getVal('program_code', 'Yonalish', 'yo\'nalish', 'program', 'Fakultet') || 'Dasturiy injiniring';
      const lvl = getVal('level', 'Bosqich', 'bosqich', 'Daraja').toLowerCase().startsWith('m') ? 'mag' : 'bak';
      const cr = parseInt(getVal('course', 'Kurs', 'kurs'), 10) || 1;
      const gen = getVal('gender', 'Jins', 'jins').toLowerCase().startsWith('f') || getVal('gender', 'Jins').toLowerCase().startsWith('a') ? 'f' : 'm';
      const em = getVal('email', 'Email', 'pochta');
      const ph = getVal('phone', 'Telefon', 'telefon', 'tel');

      return {
        external_id: extId,
        first_name: fn,
        last_name: ln,
        group_code: gr,
        program_code: pr,
        level: lvl,
        course: cr,
        gender: gen,
        email: em,
        phone: ph
      };
    }).filter(r => r.external_id && r.first_name && r.last_name);

    if (normalizedRows.length === 0) {
      try { fs.unlinkSync(filePath); } catch (e) {}
      return res.status(400).json({ error: 'Fayldagi qatorlar formati mos kelmadi. Kerakli ustunlar: external_id, first_name, last_name, group_code' });
    }

    const result = importStudentsBatch(normalizedRows, {
      fileName: req.file.originalname,
      byUser: req.staffUser.id
    });

    try { fs.unlinkSync(filePath); } catch (e) {}

    res.json({
      success: true,
      ...result,
      message: `Import muvaffaqiyatli yakunlandi! Yangi talabalar: ${result.created}, Yangilanganlar: ${result.updated}`
    });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    res.status(400).json({ error: `Import xatosi: ${err.message}` });
  }
});

/**
 * GET /api/admin/students/template
 * Namuna Excel shablonini yuklab olish
 */
router.get('/students/template', authenticateSuperadminOrRegistrator, (req, res) => {
  const sampleData = [
    {
      'external_id': 'AKHU-2026-101',
      'first_name': 'Jasurbek',
      'last_name': 'Alimov',
      'group_code': '210-21',
      'program_code': 'Dasturiy injiniring',
      'level': 'bak',
      'course': 2,
      'gender': 'm',
      'email': 'jasur@student.akhu.uz',
      'phone': '+998901234567'
    },
    {
      'external_id': 'AKHU-2026-102',
      'first_name': 'Madinabonu',
      'last_name': 'Qosimova',
      'group_code': '210-21',
      'program_code': 'Dasturiy injiniring',
      'level': 'bak',
      'course': 2,
      'gender': 'f',
      'email': 'madina@student.akhu.uz',
      'phone': '+998907654321'
    },
    {
      'external_id': 'AKHU-2026-103',
      'first_name': 'Sardor',
      'last_name': 'Shamsiyev',
      'group_code': 'M-101',
      'program_code': 'Sun\'iy intellekt',
      'level': 'mag',
      'course': 1,
      'gender': 'm',
      'email': 'sardor@student.akhu.uz',
      'phone': '+998935554433'
    }
  ];

  const ws = xlsx.utils.json_to_sheet(sampleData);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, 'Talabalar');
  const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="talabalar_import_shablon.xlsx"');
  res.send(buffer);
});

// ====================================================================
// XODIMLAR VA ROLLAR BOSHQARUVI (SUPERADMIN FULL ACCESS)
// ====================================================================

/**
 * GET /api/admin/roles-list
 * Tizimdagi barcha rollar va funksionalliklar ma'lumotnomasi
 */
router.get('/roles-list', authenticateSuperadmin, (req, res) => {
  const roles = [
    { id: 'superadmin', name: 'Superadmin (IT Markazi)', desc: 'Tizimni to\'liq boshqarish, xodimlar va sozlamalar' },
    { id: 'prorektor', name: 'Yoshlar bo\'yicha Prorektor', desc: '25+ ballik yutuqlar, -30 jarimalar (PV tasdiq), apellyatsiyalar va xavflar' },
    { id: 'dep_yb', name: 'Yoshlar bilan ishlash bo\'limi', desc: 'Ijtimoiy, Sport, Liderlik sohalarini tasdiqlash, tadbirlar yaratish' },
    { id: 'dep_mb', name: 'Ma\'naviyat va ma\'rifat bo\'limi', desc: 'Ma\'naviy-ma\'rifiy, Madaniyat va san\'at sohalarini tasdiqlash, tadbirlar' },
    { id: 'dep_ob', name: 'O\'quv bo\'limi (Registrator)', desc: 'Talabalar importi, GPA va Davomat importi, Akademik soha tasdig\'i' },
    { id: 'dep_ib', name: 'Ilmiy tadqiqotlar bo\'limi', desc: 'Ilmiy maqolalar, konferensiyalar, grantlar va to\'garaklar tasdig\'i' },
    { id: 'dep_sb', name: 'Sanoat bilan hamkorlik bo\'limi', desc: 'Startaplar, Hackathonlar, innovatsion ko\'rgazmalar tasdig\'i' },
    { id: 'dep_pb', name: 'Matbuot xizmati (PR va Media)', desc: 'OAV va ijtimoiy tarmoqlardagi materiallarni tekshirish va tasdiqlash' },
    { id: 'tutor', name: 'Tyutor', desc: 'Biriktirilgan guruh talabalariga ball kiritish, dalil yuklash va monitoring' },
    { id: 'observer', name: 'Universitet Kuzatuvchisi (Rektorat)', desc: 'Faqat monitoring va statistika ko\'rish, TV rejimini yoqish' }
  ];
  res.json({ roles });
});

/**
 * GET /api/admin/users
 * Barcha xodimlar ro'yxati (biriktirilgan guruhlari bilan)
 */
router.get('/users', authenticateSuperadmin, (req, res) => {
  const users = db.prepare(`SELECT * FROM staff_user ORDER BY created_at DESC`).all();

  const parsed = users.map(u => {
    let roles = [];
    try { roles = JSON.parse(u.roles); } catch (e) { roles = [u.roles]; }

    // Agar tyutor bo'lsa guruhlarini olish
    const groups = db.prepare(`SELECT group_code FROM tutor_group WHERE tutor_id = ?`).all(u.id).map(g => g.group_code);

    return {
      ...u,
      roles,
      groups,
      password_hash: undefined // maxfiy
    };
  });

  res.json({ users: parsed });
});

/**
 * POST /api/admin/users
 * Superadmin tomonidan yangi xodim qo'shish va rollar biriktirish
 */
router.post('/users', authenticateSuperadmin, (req, res) => {
  try {
    const {
      id,
      full_name,
      email,
      roles = [],
      groups = [],
      telegram_user_id,
      password = 'admin'
    } = req.body;

    if (!full_name || !email) {
      return res.status(400).json({ error: 'Ism-familiya va email majburiy' });
    }

    const userId = id ? String(id).trim() : 'staff_' + crypto.randomBytes(5).toString('hex');

    // Email mavjudligini tekshirish
    const existing = db.prepare(`SELECT id FROM staff_user WHERE email = ? OR id = ?`).get(email, userId);
    if (existing) {
      return res.status(400).json({ error: 'Ushbu email yoki ID allaqachon mavjud' });
    }

    const now = new Date().toISOString();
    const passHash = bcrypt.hashSync(password, 8);

    db.transaction(() => {
      // 1. staff_user jadvaliga yozish
      db.prepare(`
        INSERT INTO staff_user (
          id, full_name, email, sso_subject, roles, twofa_enabled, active, password_hash, telegram_user_id, created_at
        ) VALUES (?, ?, ?, ?, ?, 0, 1, ?, ?, ?)
      `).run(
        userId,
        full_name,
        email,
        `sso_${userId}`,
        JSON.stringify(roles),
        passHash,
        telegram_user_id || null,
        now
      );

      // 2. Agar tyutor roli bo'lsa guruhlarini yozish
      if (roles.includes('tutor') && Array.isArray(groups)) {
        const stmtGroup = db.prepare(`INSERT OR REPLACE INTO tutor_group (tutor_id, group_code) VALUES (?, ?)`);
        for (const g of groups) {
          if (String(g).trim()) stmtGroup.run(userId, String(g).trim());
        }
      }

      logAudit({
        actor_id: req.staffUser.id,
        actor_role: 'superadmin',
        action: 'CREATE_STAFF_USER',
        object_type: 'staff_user',
        object_id: userId,
        after: { full_name, email, roles, groups },
        ip: req.ip || '127.0.0.1'
      });
    })();

    res.json({ success: true, user_id: userId, message: 'Yangi xodim muvaffaqiyatli qo\'shildi' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * PUT /api/admin/users/:id
 * Xodim ma'lumotlarini, rollarini va guruhlarini tahrirlash (Superadmin Full Access)
 */
router.put('/users/:id', authenticateSuperadmin, (req, res) => {
  try {
    const user = db.prepare(`SELECT * FROM staff_user WHERE id = ?`).get(req.params.id);
    if (!user) return res.status(404).json({ error: 'Xodim topilmadi' });

    const {
      full_name,
      email,
      roles,
      groups,
      telegram_user_id,
      active,
      password
    } = req.body;

    db.transaction(() => {
      // Yangi parol bo'lsa yangilash
      let passHash = user.password_hash;
      if (password && String(password).trim().length > 0) {
        passHash = bcrypt.hashSync(String(password).trim(), 8);
      }

      const updatedRoles = roles !== undefined ? JSON.stringify(roles) : user.roles;
      const updatedActive = active !== undefined ? (active ? 1 : 0) : user.active;

      db.prepare(`
        UPDATE staff_user
        SET full_name = COALESCE(?, full_name),
          email = COALESCE(?, email),
          roles = ?,
          telegram_user_id = ?,
          active = ?,
          password_hash = ?
        WHERE id = ?
      `).run(
        full_name,
        email,
        updatedRoles,
        telegram_user_id !== undefined ? telegram_user_id : user.telegram_user_id,
        updatedActive,
        passHash,
        req.params.id
      );

      // Tyutor guruhlarini yangilash
      if (groups !== undefined && Array.isArray(groups)) {
        db.prepare(`DELETE FROM tutor_group WHERE tutor_id = ?`).run(req.params.id);
        const stmtGroup = db.prepare(`INSERT INTO tutor_group (tutor_id, group_code) VALUES (?, ?)`);
        for (const g of groups) {
          if (String(g).trim()) stmtGroup.run(req.params.id, String(g).trim());
        }
      }

      logAudit({
        actor_id: req.staffUser.id,
        actor_role: 'superadmin',
        action: 'UPDATE_STAFF_USER',
        object_type: 'staff_user',
        object_id: req.params.id,
        before: { full_name: user.full_name, roles: user.roles, active: user.active },
        after: req.body,
        ip: req.ip || '127.0.0.1'
      });
    })();

    res.json({ success: true, message: 'Xodim ma\'lumotlari va rollari yangilandi' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * DELETE /api/admin/users/:id
 * Xodimni o'chirish yoki nofaol qilish
 */
router.delete('/users/:id', authenticateSuperadmin, (req, res) => {
  try {
    if (req.params.id === 'superadmin') {
      return res.status(400).json({ error: 'Asosiy superadmin hisobini o\'chirib bo\'lmaydi' });
    }

    db.prepare(`UPDATE staff_user SET active = 0 WHERE id = ?`).run(req.params.id);

    logAudit({
      actor_id: req.staffUser.id,
      actor_role: 'superadmin',
      action: 'DEACTIVATE_STAFF_USER',
      object_type: 'staff_user',
      object_id: req.params.id,
      ip: req.ip || '127.0.0.1'
    });

    res.json({ success: true, message: 'Xodim hisobi nofaol qilindi' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ====================================================================
// KATALOG, SOZLAMALAR VA AUDIT (SUPERADMIN)
// ====================================================================

/**
 * GET /api/admin/catalog
 */
router.get('/catalog', authenticateSuperadmin, (req, res) => {
  const categories = db.prepare(`SELECT * FROM catalog_category ORDER BY sort ASC`).all();
  const items = db.prepare(`SELECT * FROM catalog_item WHERE archived = 0 ORDER BY category_id, id ASC`).all();
  const scale = db.prepare(`SELECT * FROM scale_matrix`).all();
  res.json({ categories, items, scale });
});

/**
 * PUT /api/admin/catalog/item/:id
 */
router.put('/catalog/item/:id', authenticateSuperadmin, (req, res) => {
  try {
    const { name, base_points, approver_role, evidence_hint, limit_rule } = req.body;
    const currentItem = db.prepare(`
      SELECT * FROM catalog_item WHERE id = ? AND archived = 0 ORDER BY version_from DESC LIMIT 1
    `).get(req.params.id);

    if (!currentItem) return res.status(404).json({ error: 'Katalog bandi topilmadi' });

    const newVersion = (currentItem.version_from || 1) + 1;

    db.transaction(() => {
      db.prepare(`UPDATE catalog_item SET version_to = ? WHERE id = ? AND version_from = ?`).run(
        newVersion - 1,
        currentItem.id,
        currentItem.version_from
      );

      db.prepare(`
        INSERT INTO catalog_item (
          id, category_id, name, base_points, is_scale, is_auto, approver_role,
          evidence_hint, limit_rule, version_from, version_to, archived
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, 0)
      `).run(
        currentItem.id,
        currentItem.category_id,
        name !== undefined ? name : currentItem.name,
        base_points !== undefined ? Number(base_points) : currentItem.base_points,
        currentItem.is_scale,
        currentItem.is_auto,
        approver_role !== undefined ? approver_role : currentItem.approver_role,
        evidence_hint !== undefined ? evidence_hint : currentItem.evidence_hint,
        limit_rule !== undefined ? JSON.stringify(limit_rule) : currentItem.limit_rule,
        newVersion
      );

      logAudit({
        actor_id: req.staffUser.id,
        actor_role: 'superadmin',
        action: 'UPDATE_CATALOG_ITEM',
        object_type: 'catalog_item',
        object_id: currentItem.id,
        before: { base_points: currentItem.base_points, version: currentItem.version_from },
        after: { base_points, version: newVersion },
        ip: req.ip || '127.0.0.1'
      });
    })();

    res.json({ success: true, new_version: newVersion, message: `Band yangilandi (v${newVersion})` });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/admin/settings
 */
router.get('/settings', authenticateSuperadmin, (req, res) => {
  const settings = db.prepare(`SELECT * FROM setting`).all();
  const map = {};
  for (const s of settings) {
    try { map[s.key] = JSON.parse(s.value); } catch (e) { map[s.key] = s.value; }
  }
  res.json({ settings: map });
});

/**
 * PUT /api/admin/settings
 */
router.put('/settings', authenticateSuperadmin, (req, res) => {
  try {
    const updates = req.body;
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO setting (key, value, updated_by, updated_at)
      VALUES (?, ?, ?, ?)
    `);

    db.transaction(() => {
      for (const [key, val] of Object.entries(updates)) {
        stmt.run(key, JSON.stringify(val), req.staffUser.id, now);
      }
      logAudit({
        actor_id: req.staffUser.id,
        actor_role: 'superadmin',
        action: 'UPDATE_SETTINGS',
        object_type: 'setting',
        object_id: 'all',
        after: updates,
        ip: req.ip || '127.0.0.1'
      });
    })();

    res.json({ success: true, message: 'Sozlamalar saqlandi' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/admin/audit
 */
router.get('/audit', authenticateSuperadmin, (req, res) => {
  const { action, actor_id, limit = 50, offset = 0 } = req.query;

  let where = [];
  let params = [];

  if (action) { where.push('action = ?'); params.push(action); }
  if (actor_id) { where.push('actor_id = ?'); params.push(actor_id); }

  const whereStr = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

  const logs = db.prepare(`
    SELECT * FROM audit_log
    ${whereStr}
    ORDER BY id DESC
    LIMIT ? OFFSET ?
  `).all(...params, Number(limit), Number(offset));

  const total = db.prepare(`SELECT COUNT(*) as c FROM audit_log ${whereStr}`).get(...params).c;

  res.json({ logs, total });
});

/**
 * GET /api/admin/integrations
 */
router.get('/integrations', authenticateSuperadmin, (req, res) => {
  const lastImport = db.prepare(`SELECT * FROM import_batch ORDER BY at DESC LIMIT 1`).get();
  const totalStudents = db.prepare(`SELECT COUNT(*) as c FROM student`).get().c;
  const activeStudents = db.prepare(`SELECT COUNT(*) as c FROM student WHERE status = 'active'`).get().c;
  const telegramLinked = db.prepare(`SELECT COUNT(*) as c FROM student WHERE telegram_user_id IS NOT NULL`).get().c;

  res.json({
    registrator_sync: {
      status: 'active',
      last_batch: lastImport,
      total_students: totalStudents,
      active_students: activeStudents
    },
    telegram_bot: {
      status: 'active',
      bot_username: 'akhu_talabalar_bot',
      linked_students: telegramLinked,
      linked_ratio: totalStudents > 0 ? Math.round((telegramLinked / totalStudents) * 100) : 0
    }
  });
});

module.exports = router;
