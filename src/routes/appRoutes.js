const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { db } = require('../db/database');
const config = require('../config');
const { verifyTelegramInitData, linkStudentTelegramAccount } = require('../services/telegramService');
const { checkinEventQr, generateStudentQrDataUrl, registerForEvent } = require('../services/qrService');
const { submitAppeal, awardWelcomeBonus } = require('../services/pointService');
const { getRatingList } = require('../services/ratingService');

// Auth middleware for Student Mini App
function authenticateStudent(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Avtorizatsiya talab qilinadi' });
  }

  const token = authHeader.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, config.secrets.jwt);
    if (!decoded.student_id) {
      return res.status(403).json({ error: 'Faqat talabalar uchun' });
    }
    req.studentId = decoded.student_id;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Token yaroqsiz yoki eskirgan' });
  }
}

/**
 * GET /api/app/demo-students
 * Mini Appda haqiqiy talabalarni tanlash uchun ro'yxat
 */
router.get('/demo-students', (req, res) => {
  try {
    const list = db.prepare(`
      SELECT id, external_id, first_name, last_name, group_code, program_code, course 
      FROM student 
      WHERE status = 'active' 
      ORDER BY first_name ASC 
      LIMIT 60
    `).all();
    res.json({ students: list });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * POST /api/app/auth
 * Telegram initData orqali yoki test talaba ID orqali kirish
 */
router.post('/auth', (req, res) => {
  const { initData, test_student_id, phone } = req.body;

  // 1. Agar test talaba ID berilsa (yoki to'g'ridan-to'g'ri ko'rish uchun)
  if (test_student_id) {
    let student = db.prepare(`SELECT * FROM student WHERE id = ? OR external_id = ?`).get(test_student_id, test_student_id);
    if (!student) {
      // Bazadagi birinchi faol talabaga fallback qilish
      student = db.prepare(`SELECT * FROM student WHERE status = 'active' ORDER BY id ASC LIMIT 1`).get();
    }
    if (!student) return res.status(404).json({ error: 'Talabalar bazasi bo\'sh' });

    const token = jwt.sign({ student_id: student.id }, config.secrets.jwt, { expiresIn: '7d' });
    awardWelcomeBonus(student.id);
    return res.json({ token, student });
  }

  // 2. Telegram WebApp initData orqali
  if (initData) {
    const tgUser = verifyTelegramInitData(initData);
    if (!tgUser) {
      return res.status(401).json({ error: 'Telegram ma\'lumotlari haqiqiy emas' });
    }

    const student = db.prepare(`SELECT * FROM student WHERE telegram_user_id = ? AND status = 'active'`).get(String(tgUser.id));
    if (student) {
      const token = jwt.sign({ student_id: student.id }, config.secrets.jwt, { expiresIn: '7d' });
      awardWelcomeBonus(student.id);
      return res.json({ token, student });
    } else {
      // Talaba raqamini Registrator bilan bog'lash talab qilinadi (M-01)
      return res.json({
        need_phone: true,
        telegram_user: tgUser,
        message: 'Iltimos, telefon raqamingizni yuborib profilingizni tasdiqlang'
      });
    }
  }

  // 3. Telefon raqami yuborilganda
  if (phone) {
    const result = linkStudentTelegramAccount(req.body.telegram_user_id || '999999', phone);
    if (result.success) {
      const token = jwt.sign({ student_id: result.student.id }, config.secrets.jwt, { expiresIn: '7d' });
      awardWelcomeBonus(result.student.id);
      return res.json({ token, student: result.student, message: result.message });
    } else {
      return res.status(400).json({ error: result.message });
    }
  }

  // 4. Default fallback: birinchi faol talaba
  const fallbackStudent = db.prepare(`SELECT * FROM student WHERE status = 'active' ORDER BY id ASC LIMIT 1`).get();
  if (fallbackStudent) {
    const token = jwt.sign({ student_id: fallbackStudent.id }, config.secrets.jwt, { expiresIn: '7d' });
    awardWelcomeBonus(fallbackStudent.id);
    return res.json({ token, student: fallbackStudent });
  }

  return res.status(400).json({ error: 'Talaba topilmadi' });
});

/**
 * GET /api/app/me
 * Talabaning shaxsiy ma'lumotlari, ballari, o'rni, sohalar, tyutor
 */
router.get('/me', authenticateStudent, (req, res) => {
  // Talabaning ilk kirish bonusi (+5 ball) mavjudligini ta'minlash
  awardWelcomeBonus(req.studentId);

  const student = db.prepare(`
    SELECT st.*, su.full_name as tutor_name, su.email as tutor_email, su.telegram_user_id as tutor_tg
    FROM student st
    LEFT JOIN staff_user su ON st.tutor_id = su.id
    WHERE st.id = ?
  `).get(req.studentId);

  if (!student) return res.status(404).json({ error: 'Talaba topilmadi' });

  const score = db.prepare(`SELECT * FROM student_score WHERE student_id = ?`).get(req.studentId) || {
    total: 0,
    season: 0,
    week_cur: 0,
    week_prev: 0,
    by_category: '{}',
    rank_cohort: 1,
    events_count: 0
  };

  const byCategory = typeof score.by_category === 'string' ? JSON.parse(score.by_category) : (score.by_category || {});

  // Kategoriyalar ro'yxatini nomlari va ranglari bilan qo'shish
  const categories = db.prepare(`SELECT * FROM catalog_category ORDER BY sort ASC`).all().map(c => ({
    id: c.id,
    name: c.name,
    color: c.color,
    points: byCategory[c.id] || 0
  }));

  const scorePayload = {
    total: score.total || 0,
    season: score.season || 0,
    week_cur: score.week_cur || 0,
    week_prev: score.week_prev || 0,
    rank_cohort: score.rank_cohort || 1,
    rank: score.rank_cohort || 1,
    events_count: score.events_count || 0,
    categories
  };

  // Oxirgi ball yozuvlari (Tarix va Dashboard uchun)
  const recentEntries = db.prepare(`
    SELECT pe.*, COALESCE(pe.note, ci.name, 'Faollik bali') as item_name,
           COALESCE(cc.name, 'Umumiy') as category_name, COALESCE(cc.color, '#3B82F6') as category_color,
           su_c.full_name as creator_name, su_a.full_name as approver_name
    FROM point_entry pe
    LEFT JOIN catalog_item ci ON pe.item_id = ci.id
    LEFT JOIN catalog_category cc ON pe.category_id = cc.id
    LEFT JOIN staff_user su_c ON pe.created_by = su_c.id
    LEFT JOIN staff_user su_a ON pe.approved_by = su_a.id
    WHERE pe.student_id = ?
    ORDER BY pe.created_at DESC
    LIMIT 30
  `).all(req.studentId);

  res.json({
    student: {
      id: student.id,
      external_id: student.external_id,
      first_name: student.first_name,
      last_name: student.last_name,
      group_code: student.group_code,
      program_code: student.program_code,
      level: student.level,
      course: student.course,
      phone: student.phone,
      email: student.email,
      photo_url: student.photo_url || null,
      tutor_name: student.tutor_name || 'Biriktirilmagan',
      tutor: {
        name: student.tutor_name || 'Biriktirilmagan',
        email: student.tutor_email,
        tg: student.tutor_tg
      }
    },
    score: scorePayload,
    scores: scorePayload,
    categories,
    recent_entries: recentEntries,
    entries: recentEntries
  });
});

/**
 * GET /api/app/entries?days=90
 * Ball yozuvlari tarixi
 */
router.get('/entries', authenticateStudent, (req, res) => {
  const days = Number(req.query.days) || 90;
  const sinceIso = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const entries = db.prepare(`
    SELECT pe.*, COALESCE(pe.note, ci.name, 'Faollik bali') as item_name,
           COALESCE(cc.name, 'Umumiy') as category_name, COALESCE(cc.color, '#3B82F6') as category_color,
           su_c.full_name as creator_name, su_a.full_name as approver_name
    FROM point_entry pe
    LEFT JOIN catalog_item ci ON pe.item_id = ci.id
    LEFT JOIN catalog_category cc ON pe.category_id = cc.id
    LEFT JOIN staff_user su_c ON pe.created_by = su_c.id
    LEFT JOIN staff_user su_a ON pe.approved_by = su_a.id
    WHERE pe.student_id = ? AND (pe.created_at >= ? OR pe.created_at IS NULL)
    ORDER BY pe.created_at DESC
  `).all(req.studentId, sinceIso);

  // E'tiroz berish mumkinligini aniqlash (3 kunlik muddat)
  const now = new Date();
  const list = entries.map(e => {
    let canAppeal = false;
    if (e.status === 'rejected' || e.status === 'revoked') {
      const daysDiff = (now - new Date(e.created_at)) / (1000 * 60 * 60 * 24);
      if (daysDiff <= 3) {
        // Avval e'tiroz berilganligini tekshirish
        const appeal = db.prepare(`SELECT id, status FROM appeal WHERE entry_id = ?`).get(e.id);
        canAppeal = !appeal;
      }
    }
    return {
      ...e,
      can_appeal: canAppeal
    };
  });

  res.json({ entries: list });
});

/**
 * POST /api/app/entries/:id/appeal
 * Rad etilgan yoki bekor qilingan yozuvga e'tiroz berish (R-09, AT-09)
 */
router.post('/entries/:id/appeal', authenticateStudent, (req, res) => {
  try {
    const { text } = req.body;
    const ip = req.ip || '127.0.0.1';
    const result = submitAppeal(req.studentId, req.params.id, text, ip);
    res.json({ success: true, ...result, message: 'E\'tirozingiz qabul qilindi va Prorektorga yuborildi' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/app/rating
 * Reyting ro'yxati (kesimlar va davrlar bo'yicha)
 * X-02: Boshqa talabalarning faqat ism, guruh, ball ko'rinadi!
 */
router.get('/rating', authenticateStudent, (req, res) => {
  const { period = 'season', scope = 'level' } = req.query;

  const student = db.prepare(`SELECT * FROM student WHERE id = ?`).get(req.studentId);
  const myScore = db.prepare(`SELECT * FROM student_score WHERE student_id = ?`).get(req.studentId);

  let filters = { period, level: student.level };

  if (scope === 'course') filters.course = student.course;
  if (scope === 'program') filters.program = student.program_code;
  if (scope === 'group') filters.group = student.group_code;
  if (scope === 'tutor') filters.tutor_id = student.tutor_id;
  if (scope === 'gender') filters.gender = student.gender;

  const { list, total_count, avg_season } = getRatingList({ ...filters, limit: 30 });

  // X-02: Faqat ruxsat berilgan maydonlar
  const sanitizedList = list.map(item => ({
    id: item.id,
    first_name: item.first_name,
    last_name: item.last_name,
    group_code: item.group_code,
    level: item.level,
    course: item.course,
    rank: item.rank,
    score: item.score,
    is_me: item.id === req.studentId
  }));

  // Talabaning o'z o'rni
  const myPositionInScope = sanitizedList.find(s => s.id === req.studentId) || {
    id: student.id,
    first_name: student.first_name,
    last_name: student.last_name,
    group_code: student.group_code,
    rank: myScore ? myScore.rank_cohort : 1,
    score: myScore ? (period === 'week' ? myScore.week_cur : (period === 'total' ? myScore.total : myScore.season)) : 0,
    is_me: true
  };

  res.json({
    scope,
    period,
    my_position: myPositionInScope,
    total_students: total_count,
    group_average: avg_season,
    top_students: sanitizedList
  });
});

/**
 * GET /api/app/events
 * Tadbirlar ro'yxati (bugun, yaqin, o'tgan)
 */
router.get('/events', authenticateStudent, (req, res) => {
  const status = req.query.status || 'today';
  const todayStr = new Date().toISOString().split('T')[0];

  let query = '';
  let params = [];

  if (status === 'today') {
    query = `SELECT * FROM event WHERE starts_at LIKE ? AND status = 'published' ORDER BY starts_at ASC`;
    params = [`${todayStr}%`];
  } else if (status === 'upcoming') {
    query = `SELECT * FROM event WHERE starts_at > ? AND status = 'published' ORDER BY starts_at ASC`;
    params = [`${todayStr}T23:59:59`];
  } else {
    // past
    query = `SELECT * FROM event WHERE ends_at < ? ORDER BY ends_at DESC LIMIT 20`;
    params = [`${todayStr}T00:00:00`];
  }

  const events = db.prepare(query).all(...params);

  // Talabaning ishtirok va ro'yxatdan o'tganlik holatini tekshirish
  const enriched = events.map(ev => {
    const reg = db.prepare(`SELECT * FROM event_registration WHERE event_id = ? AND student_id = ?`).get(ev.id, req.studentId);
    const chk = db.prepare(`SELECT * FROM checkin WHERE event_id = ? AND student_id = ?`).get(ev.id, req.studentId);

    return {
      ...ev,
      is_registered: !!reg,
      waitlist_pos: reg ? reg.waitlist_pos : null,
      is_checked_in: !!chk
    };
  });

  res.json({ events: enriched });
});

/**
 * POST /api/app/events/:id/register
 * Tadbirga ro'yxatdan o'tish
 */
router.post('/events/:id/register', authenticateStudent, (req, res) => {
  try {
    const result = registerForEvent(req.studentId, req.params.id);
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

/**
 * POST /api/app/checkin
 * Talaba tomonidan tadbir QR kodini o'qiganda check-in
 */
router.post('/checkin', authenticateStudent, (req, res) => {
  try {
    const { qr_payload, device_hint } = req.body;
    const ip = req.ip || '127.0.0.1';
    const result = checkinEventQr(req.studentId, qr_payload, { deviceHint: device_hint, ip });
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

/**
 * GET /api/app/my-qr va /api/app/qr
 * Talabaning o'z dinamik QR kodi (tashkilotchi skanerlashi uchun)
 */
router.get(['/my-qr', '/qr'], authenticateStudent, async (req, res) => {
  try {
    const result = await generateStudentQrDataUrl(req.studentId);
    res.json({
      ...result,
      qr_data_url: result.dataUrl,
      qr_code: result.dataUrl
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /api/app/export
 * X-09: Talaba o'z ballarini JSON formatda yuklab olishi
 */
router.get('/export', authenticateStudent, (req, res) => {
  const student = db.prepare(`SELECT * FROM student WHERE id = ?`).get(req.studentId);
  const entries = db.prepare(`SELECT * FROM point_entry WHERE student_id = ? ORDER BY created_at DESC`).all(req.studentId);
  const score = db.prepare(`SELECT * FROM student_score WHERE student_id = ?`).get(req.studentId);

  res.setHeader('Content-Disposition', `attachment; filename="akhu_portfolio_${student.external_id || student.id}.json"`);
  res.setHeader('Content-Type', 'application/json');
  res.json({
    student,
    score,
    entries,
    exported_at: new Date().toISOString()
  });
});

module.exports = router;
