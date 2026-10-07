const express = require('express');
const router = express.Router();
const { db } = require('../db/database');
const { createPointEntries, resubmitEntry, cancelEntry } = require('../services/pointService');
const { notifyStudent } = require('../services/telegramService');

// Staff auth middleware
function authenticateStaff(req, res, next) {
  const userId = req.headers['x-user-id'] || 'tutor_1'; // default demo tutor
  const user = db.prepare(`SELECT * FROM staff_user WHERE id = ? AND active = 1`).get(userId);
  if (!user) return res.status(401).json({ error: 'Foydalanuvchi topilmadi' });

  user.roles = JSON.parse(user.roles);
  req.staffUser = user;
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

  let studentFilter = `(st.tutor_id = ?`;
  let params = [tutorId];
  if (groups.length > 0) {
    studentFilter += ` OR st.group_code IN (${groups.map(() => '?').join(',')}))`;
    params.push(...groups);
  } else {
    studentFilter += `)`;
  }

  // Talabalar umumiy soni
  const students = db.prepare(`
    SELECT st.*, sc.total, sc.season, sc.week_cur, sc.is_passive
    FROM student st
    LEFT JOIN student_score sc ON st.id = sc.student_id
    WHERE ${studentFilter} AND st.status = 'active'
  `).all(...params);

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
    groups
  });
});

/**
 * GET /api/tutor/students
 * T-05: Tyutorning o'z talabalari ro'yxati (jadval)
 */
router.get('/students', authenticateStaff, (req, res) => {
  const tutorId = req.staffUser.id;
  const { group, search } = req.query;

  const groups = db.prepare(`SELECT group_code FROM tutor_group WHERE tutor_id = ?`).all(tutorId).map(g => g.group_code);

  let whereClauses = [`(st.tutor_id = ?`];
  let params = [tutorId];
  if (groups.length > 0) {
    whereClauses[0] += ` OR st.group_code IN (${groups.map(() => '?').join(',')}))`;
    params.push(...groups);
  } else {
    whereClauses[0] += `)`;
  }

  whereClauses.push("st.status = 'active'");

  if (group) {
    whereClauses.push('st.group_code = ?');
    params.push(group);
  }

  if (search) {
    whereClauses.push('(st.first_name LIKE ? OR st.last_name LIKE ? OR st.external_id LIKE ?)');
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const sql = `
    SELECT st.*, sc.total, sc.season, sc.week_cur, sc.rank_cohort, sc.events_count, sc.is_passive
    FROM student st
    LEFT JOIN student_score sc ON st.id = sc.student_id
    WHERE ${whereClauses.join(' AND ')}
    ORDER BY sc.season DESC, st.last_name ASC
  `;

  const list = db.prepare(sql).all(...params);
  res.json({ students: list, available_groups: groups });
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

    const createdIds = createPointEntries({
      student_ids,
      item_id,
      points: Number(points),
      scale_level,
      scale_role,
      event_date,
      note,
      evidence_file_id,
      evidence_url,
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
