const express = require('express');
const router = express.Router();
const { db } = require('../db/database');
const { createPointEntries, resubmitEntry, cancelEntry } = require('../services/pointService');
const { notifyStudent } = require('../services/telegramService');
const { buildStudentSearch } = require('../utils/searchHelper');

// Staff auth middleware (Tyutor va Superadmin)
function authenticateStaff(req, res, next) {
  const userId = req.headers['x-user-id'] || req.query.user_id;
  if (!userId) return res.status(401).json({ error: "Avtorizatsiyadan o'tilmagan. Iltimos, login va parol orqali tizimga kiring." });

  if (userId === 'superadmin') {
    req.staffUser = { id: 'superadmin', full_name: 'Superadmin', roles: ['superadmin'] };
    return next();
  }

  const user = db.prepare(`SELECT * FROM staff_user WHERE id = ? AND active = 1`).get(userId);
  if (!user) return res.status(401).json({ error: "Foydalanuvchi topilmadi yoki hisob faol emas." });

  let roles = [];
  try { roles = JSON.parse(user.roles); } catch (e) { roles = [user.roles]; }
  if (!roles.includes('tutor') && !roles.includes('superadmin')) {
    return res.status(403).json({ error: 'Faqat tyutorlar uchun ruxsat berilgan' });
  }

  req.staffUser = { ...user, roles };
  next();
}

/**
 * GET /api/tutor/summary
 * T-01: Dashboard metrikalari
 */
router.get('/summary', authenticateStaff, (req, res) => {
  const tutorId = req.staffUser.id;

  // Guruhlarni olish
  const groups = db.prepare(`SELECT group_code FROM tutor_group WHERE tutor_id = ?`).all(tutorId).map(g => g.group_code);

  let studentFilter;
  let params = [];
  if (groups.length > 0) {
    studentFilter = `(st.tutor_id = ? OR st.group_code IN (${groups.map(() => '?').join(',')}))`;
    params.push(tutorId, ...groups);
  } else {
    studentFilter = `st.tutor_id = ?`;
    params.push(tutorId);
  }

  // Talabalar umumiy soni
  const students = db.prepare(`
    SELECT st.*, sc.total, sc.season, sc.week_cur, sc.is_passive
    FROM student st
    LEFT JOIN student_score sc ON st.id = sc.student_id
    WHERE ${studentFilter} AND st.status = 'active'
  `).all(...params);

  // Guruhlar ro'yxatini to'liq shakllantirish (tutor_group + talabalar guruhlari)
  const allGroups = Array.from(new Set([...groups, ...students.map(s => s.group_code).filter(Boolean)])).sort();

  const totalStudents = students.length;
  const activeStudents = students.filter(s => (s.season || 0) >= 30).length;
  const activeRatio = totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0;
  const passiveList = students.filter(s => s.is_passive === 1);

  // Bugungi limit (R-06: 60 ta)
  const todayStart = new Date().toISOString().split('T')[0];
  const todayEntriesCount = db.prepare(`
    SELECT COUNT(*) as cnt FROM point_entry
    WHERE created_by = ? AND created_at >= ?
  `).get(tutorId, `${todayStart}T00:00:00`).cnt;

  // Yozuvlar holatlari bo'yicha
  const statusStats = db.prepare(`
    SELECT status, COUNT(*) as cnt FROM point_entry
    WHERE created_by = ?
    GROUP BY status
  `).all(tutorId);

  const statuses = { pending: 0, pending_pv: 0, approved: 0, rejected: 0, cancelled: 0, revoked: 0 };
  for (const s of statusStats) statuses[s.status] = s.cnt;

  res.json({
    total_students: totalStudents,
    active_students: activeStudents,
    active_ratio: activeRatio,
    passive_students_count: passiveList.length,
    today_limit: {
      used: todayEntriesCount,
      max: 60,
      remaining: Math.max(0, 60 - todayEntriesCount)
    },
    entries_stats: statuses,
    groups: allGroups
  });
});

/**
 * GET /api/tutor/students
 * T-05: Tyutorning o'z talabalari ro'yxati (100% biriktirilgan talabalar)
 */
router.get('/students', authenticateStaff, (req, res) => {
  const tutorId = req.staffUser.id;
  const { group, search } = req.query;

  const groups = db.prepare(`SELECT group_code FROM tutor_group WHERE tutor_id = ?`).all(tutorId).map(g => g.group_code);

  let whereClauses = [];
  let params = [];

  if (groups.length > 0) {
    whereClauses.push(`(st.tutor_id = ? OR st.group_code IN (${groups.map(() => '?').join(',')}))`);
    params.push(tutorId, ...groups);
  } else {
    whereClauses.push('st.tutor_id = ?');
    params.push(tutorId);
  }

  whereClauses.push("st.status = 'active'");

  if (group) {
    whereClauses.push('st.group_code = ?');
    params.push(group);
  }

  if (search && search.trim()) {
    const searchRes = buildStudentSearch(search, 'st');
    if (searchRes.clauses.length > 0) {
      whereClauses.push(...searchRes.clauses);
      params.push(...searchRes.params);
    }
  }

  const sql = `
    SELECT st.*, sc.total, sc.season, sc.week_cur, sc.rank_cohort, sc.events_count, sc.is_passive
    FROM student st
    LEFT JOIN student_score sc ON st.id = sc.student_id
    WHERE ${whereClauses.join(' AND ')}
    ORDER BY sc.season DESC, st.last_name ASC
  `;

  const list = db.prepare(sql).all(...params);
  const allGroups = Array.from(new Set([...groups, ...list.map(s => s.group_code).filter(Boolean)])).sort();

  res.json({ students: list, available_groups: allGroups });
});

/**
 * GET /api/tutor/students/:id
 * Tyutor talaba ma'lumotlarini to'liq ko'rishi
 */
router.get('/students/:id', authenticateStaff, (req, res) => {
  const tutorId = req.staffUser.id;
  const student = db.prepare(`
    SELECT st.*, su.full_name as tutor_name, sc.total, sc.season, sc.week_cur, sc.rank_cohort, sc.events_count
    FROM student st
    LEFT JOIN staff_user su ON st.tutor_id = su.id
    LEFT JOIN student_score sc ON st.id = sc.student_id
    WHERE st.id = ? OR st.external_id = ?
  `).get(req.params.id, req.params.id);

  if (!student) return res.status(404).json({ error: 'Talaba topilmadi' });

  // Huquqni tekshirish
  const groups = db.prepare(`SELECT group_code FROM tutor_group WHERE tutor_id = ?`).all(tutorId).map(g => g.group_code);
  const isOwner = (student.tutor_id === tutorId || (student.group_code && groups.includes(student.group_code)));

  if (!isOwner && !req.staffUser.roles.includes('superadmin')) {
    return res.status(403).json({ error: 'Siz faqat o\'zingizga biriktirilgan talabalarni ko\'rishingiz mumkin' });
  }

  const entries = db.prepare(`
    SELECT pe.*, ci.name as catalog_title, su.full_name as creator_name
    FROM point_entry pe
    LEFT JOIN catalog_item ci ON pe.item_id = ci.id
    LEFT JOIN staff_user su ON pe.created_by = su.id
    WHERE pe.student_id = ?
    ORDER BY pe.created_at DESC
  `).all(student.id);

  res.json({ student, history: entries });
});

/**
 * PUT /api/tutor/students/:id
 * Tyutor o'ziga biriktirilgan talaba ma'lumotlarini 100% tahrirlashi
 */
router.put('/students/:id', authenticateStaff, (req, res) => {
  try {
    const studentId = req.params.id;
    const tutorId = req.staffUser.id;

    const student = db.prepare('SELECT * FROM student WHERE id = ?').get(studentId);
    if (!student) return res.status(404).json({ error: 'Talaba topilmadi' });

    const groups = db.prepare(`SELECT group_code FROM tutor_group WHERE tutor_id = ?`).all(tutorId).map(g => g.group_code);
    const isOwner = (student.tutor_id === tutorId || (student.group_code && groups.includes(student.group_code)));

    if (!isOwner && !req.staffUser.roles.includes('superadmin')) {
      return res.status(403).json({ error: 'Siz faqat o\'zingizga biriktirilgan talabalarni tahrirlashingiz mumkin' });
    }

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
      photo_url,
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
          email = COALESCE(?, email),
          phone = COALESCE(?, phone),
          photo_url = COALESCE(?, photo_url),
          status = COALESCE(?, status),
          updated_at = ?
      WHERE id = ?
    `).run(
      external_id !== undefined ? String(external_id).trim() : student.external_id,
      first_name !== undefined ? first_name.trim() : student.first_name,
      last_name !== undefined ? last_name.trim() : student.last_name,
      group_code !== undefined ? group_code.trim() : student.group_code,
      program_code !== undefined ? program_code.trim() : student.program_code,
      level !== undefined ? level : student.level,
      course !== undefined ? Number(course) : student.course,
      gender !== undefined ? gender : student.gender,
      email !== undefined ? email.trim() : student.email,
      phone !== undefined ? phone.trim() : student.phone,
      photo_url !== undefined ? photo_url : student.photo_url,
      status !== undefined ? status : student.status,
      now,
      studentId
    );

    const updated = db.prepare('SELECT * FROM student WHERE id = ?').get(studentId);
    res.json({ success: true, student: updated, message: "Talaba ma'lumotlari muvaffaqiyatli saqlandi!" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


/**
 * POST /api/tutor/entries
 * T-02: Ball kiritish (bittalab yoki guruh bo'yicha ommaviy)
 */
router.post('/entries', authenticateStaff, (req, res) => {
  try {
    const {
      student_ids,
      item_id,
      points,
      scale_level,
      scale_role,
      event_date,
      note,
      evidence_file_id,
      evidence_url
    } = req.body;

    if (!student_ids || !Array.isArray(student_ids) || student_ids.length === 0) {
      return res.status(400).json({ error: 'Kamida bitta talaba tanlanishi shart' });
    }

    if (!item_id || points === undefined || !event_date) {
      return res.status(400).json({ error: 'Band, ball va sana to\'ldirilishi shart' });
    }

    let finalEvidenceUrl = evidence_url || null;
    let finalEvidenceFileId = evidence_file_id || null;
    if (finalEvidenceFileId && !finalEvidenceUrl) {
      finalEvidenceUrl = `/api/files/${finalEvidenceFileId}`;
    }
    if (finalEvidenceUrl && !finalEvidenceFileId && finalEvidenceUrl.includes('/api/files/')) {
      finalEvidenceFileId = finalEvidenceUrl.split('/api/files/')[1].split('?')[0];
    }

    const createdIds = createPointEntries({
      student_ids,
      item_id,
      points: Number(points),
      scale_level,
      scale_role,
      event_date,
      note,
      evidence_file_id: finalEvidenceFileId,
      evidence_url: finalEvidenceUrl,
      creator_user: req.staffUser,
      ip: req.ip || '127.0.0.1'
    });

    // Telegram orqali talabaga N-02 bildirishnoma yuborish
    const item = db.prepare(`SELECT name FROM catalog_item WHERE id = ?`).get(item_id);
    for (const sid of student_ids) {
      notifyStudent(sid, 'N-02', {
        points,
        item_name: item ? item.name : item_id,
        dept_name: 'Mas\'ul bo\'lim'
      });
    }

    res.json({
      success: true,
      created_count: createdIds.length,
      entry_ids: createdIds,
      message: `${createdIds.length} ta talabaga ball yozuvi kiritildi va tasdiqqa yuborildi`
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/tutor/entries
 * T-04: Tyutor kiritgan barcha yozuvlar
 */
router.get('/entries', authenticateStaff, (req, res) => {
  const tutorId = req.staffUser.id;
  const { status, student_id } = req.query;

  let where = ['pe.created_by = ?'];
  let params = [tutorId];

  if (status) {
    where.push('pe.status = ?');
    params.push(status);
  }

  if (student_id) {
    where.push('pe.student_id = ?');
    params.push(student_id);
  }

  const sql = `
    SELECT pe.*, st.first_name, st.last_name, st.group_code, ci.name as item_name, cc.name as category_name, cc.color as category_color,
           su.full_name as approver_name
    FROM point_entry pe
    JOIN student st ON pe.student_id = st.id
    JOIN catalog_item ci ON pe.item_id = ci.id
    JOIN catalog_category cc ON pe.category_id = cc.id
    LEFT JOIN staff_user su ON pe.approved_by = su.id
    WHERE ${where.join(' AND ')}
    ORDER BY pe.created_at DESC
  `;

  const list = db.prepare(sql).all(...params);
  res.json({ entries: list });
});

/**
 * POST /api/tutor/entries/:id/resubmit
 * T-04 & R-08: Rad etilgan yozuvni 30 kunda to'g'rilab qayta yuborish
 */
router.post('/entries/:id/resubmit', authenticateStaff, (req, res) => {
  try {
    const { points, note, evidence_file_id, evidence_url } = req.body;
    const result = resubmitEntry(
      req.params.id,
      req.staffUser,
      { points: points !== undefined ? Number(points) : undefined, note, evidence_file_id, evidence_url },
      req.ip || '127.0.0.1'
    );
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/tutor/entries/:id/cancel
 * T-04: Pending yozuvni bekor qilish
 */
router.post('/entries/:id/cancel', authenticateStaff, (req, res) => {
  try {
    const result = cancelEntry(req.params.id, req.staffUser, req.ip || '127.0.0.1');
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/tutor/students/:id/remind
 * N-08: Passiv talabaga Telegram eslatma yuborish
 */
router.post('/students/:id/remind', authenticateStaff, (req, res) => {
  try {
    notifyStudent(req.params.id, 'N-08', {
      tutor_name: req.staffUser.full_name
    });
    res.json({ success: true, message: 'Talabaga Telegram orqali eslatma yuborildi' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
