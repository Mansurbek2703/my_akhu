const express = require('express');
const router = express.Router();
const { db } = require('../db/database');
const { approveEntry, rejectEntry, revokeEntry, decideAppeal } = require('../services/pointService');
const { notifyStudent } = require('../services/telegramService');
const { importGpaTop20, importAttendance100 } = require('../services/importService');
const { calculateRiskFlags, getLateApprovals, getRandomAuditSample } = require('../services/cronService');

function authenticateStaff(req, res, next) {
  const userId = req.headers['x-user-id'] || 'dep_yb';
  const user = db.prepare(`SELECT * FROM staff_user WHERE id = ? AND active = 1`).get(userId);
  if (!user) return res.status(401).json({ error: 'Foydalanuvchi topilmadi' });

  user.roles = JSON.parse(user.roles);
  req.staffUser = user;
  next();
}

/**
 * GET /api/approvals
 * B-01: Tasdiq navbati
 */
router.get('/', authenticateStaff, (req, res) => {
  const { role, category, late } = req.query;
  const user = req.staffUser;

  let whereClauses = [];
  let params = [];

  // Prorektor bo'lsa pending_pv va approver_role='prorektor' ni ko'radi
  if (user.roles.includes('prorektor')) {
    whereClauses.push("(pe.status = 'pending_pv' OR (pe.status = 'pending' AND pe.approver_role = 'prorektor'))");
  } else if (user.roles.includes('superadmin')) {
    whereClauses.push("pe.status IN ('pending', 'pending_pv')");
  } else {
    // Muayyan bo'lim xodimi
    const userRole = role || user.roles[0];
    whereClauses.push("pe.status = 'pending' AND pe.approver_role = ?");
    params.push(userRole);
  }

  if (category) {
    whereClauses.push('pe.category_id = ?');
    params.push(category);
  }

  // Late filtri: 3 kundan oshganlar
  if (late === '1' || late === 'true') {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    whereClauses.push('pe.created_at <= ?');
    params.push(threeDaysAgo);
  }

  const sql = `
    SELECT pe.*, st.first_name, st.last_name, st.group_code, st.phone, st.email,
           sc.season as student_season_score, sc.total as student_total_score,
           ci.name as item_name, ci.base_points as item_base_points, ci.evidence_hint,
           cc.name as category_name, cc.color as category_color,
           su.full_name as creator_name
    FROM point_entry pe
    JOIN student st ON pe.student_id = st.id
    LEFT JOIN student_score sc ON st.id = sc.student_id
    JOIN catalog_item ci ON pe.item_id = ci.id
    JOIN catalog_category cc ON pe.category_id = cc.id
    LEFT JOIN staff_user su ON pe.created_by = su.id
    WHERE ${whereClauses.join(' AND ')}
    ORDER BY pe.created_at ASC
  `;

  const rows = db.prepare(sql).all(...params);

  // Har bir qatorda kutish kunlari va pog'onadan farqini hisoblash
  const now = new Date();
  const list = rows.map(r => {
    const waitDays = Math.floor((now - new Date(r.created_at)) / (1000 * 60 * 60 * 24));
    const isLate = waitDays >= 3;
    const diffFromBase = r.item_base_points !== null ? r.points - r.item_base_points : 0;

    return {
      ...r,
      wait_days: waitDays,
      is_late: isLate,
      diff_from_base: diffFromBase
    };
  });

  res.json({ entries: list, count: list.length });
});

/**
 * POST /api/approvals/:id/approve
 * B-01: Tasdiqlash
 */
router.post('/:id/approve', authenticateStaff, (req, res) => {
  try {
    const result = approveEntry(req.params.id, req.staffUser, req.ip || '127.0.0.1');

    // Talabaga bildirishnoma (N-01)
    if (result.status === 'approved') {
      const entry = db.prepare(`SELECT pe.*, ci.name as item_name, cc.name as category_name, su.full_name as tutor_name FROM point_entry pe JOIN catalog_item ci ON pe.item_id = ci.id JOIN catalog_category cc ON pe.category_id = cc.id LEFT JOIN staff_user su ON pe.created_by = su.id WHERE pe.id = ?`).get(req.params.id);
      if (entry) {
        notifyStudent(entry.student_id, 'N-01', {
          points: entry.points,
          item_name: entry.item_name,
          category_name: entry.category_name,
          tutor_name: entry.tutor_name,
          dept_name: req.staffUser.full_name
        });
      }
    }

    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/approvals/:id/reject
 * B-02: Rad etish
 */
router.post('/:id/reject', authenticateStaff, (req, res) => {
  try {
    const { reason_code, reject_note } = req.body;
    const result = rejectEntry(req.params.id, req.staffUser, { reason_code, reject_note }, req.ip || '127.0.0.1');

    // Talabaga N-03 bildirishnoma
    const entry = db.prepare(`SELECT pe.*, ci.name as item_name FROM point_entry pe JOIN catalog_item ci ON pe.item_id = ci.id WHERE pe.id = ?`).get(req.params.id);
    if (entry) {
      notifyStudent(entry.student_id, 'N-03', {
        item_name: entry.item_name,
        points: entry.points,
        reason: `${reason_code}: ${reject_note || ''}`
      });
    }

    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/approvals/bulk-approve
 * B-03: Ommaviy tasdiqlash (max 50 ta)
 */
router.post('/bulk-approve', authenticateStaff, (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Tasdiqlash uchun yozuvlar tanlanmagan' });
  }

  if (ids.length > 50) {
    return res.status(400).json({ error: 'Bir vaqtning o\'zida ko\'pi bilan 50 ta yozuv tasdiqlanishi mumkin (B-03)' });
  }

  const results = [];
  const errors = [];

  for (const id of ids) {
    try {
      const resItem = approveEntry(id, req.staffUser, req.ip || '127.0.0.1');
      results.push({ id, status: resItem.status });
    } catch (err) {
      errors.push({ id, error: err.message });
    }
  }

  res.json({
    approved_count: results.length,
    failed_count: errors.length,
    results,
    errors
  });
});

/**
 * POST /api/approvals/:id/revoke
 * R-11, AT-23: Prorektor tomonidan tasdiqlangan yozuvni bekor qilish
 */
router.post('/:id/revoke', authenticateStaff, (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ error: 'Qaytarib olish sababi majburiy' });
    const result = revokeEntry(req.params.id, req.staffUser, reason, req.ip || '127.0.0.1');
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/approvals/appeals
 * P-05: E'tirozlar ro'yxati
 */
router.get('/appeals', authenticateStaff, (req, res) => {
  const appeals = db.prepare(`
    SELECT ap.*, st.first_name, st.last_name, st.group_code,
           pe.points, pe.item_id, ci.name as item_name, pe.reject_reason_code, pe.reject_note,
           cc.name as category_name
    FROM appeal ap
    JOIN student st ON ap.student_id = st.id
    JOIN point_entry pe ON ap.entry_id = pe.id
    JOIN catalog_item ci ON pe.item_id = ci.id
    JOIN catalog_category cc ON pe.category_id = cc.id
    ORDER BY ap.created_at DESC
  `).all();

  res.json({ appeals });
});

/**
 * POST /api/approvals/appeals/:id/decide
 * P-05: E'tirozni qanoatlantirish yoki rad etish
 */
router.post('/appeals/:id/decide', authenticateStaff, (req, res) => {
  try {
    const { accept, decision_note } = req.body;
    const result = decideAppeal(req.params.id, req.staffUser, { accept: !!accept, decision_note }, req.ip || '127.0.0.1');
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/approvals/prorektor-metrics
 * P-01, P-02, P-06: Prorektor nazorat ko'rsatkichlari
 */
router.get('/prorektor-metrics', authenticateStaff, (req, res) => {
  const pendingPvCount = db.prepare(`SELECT COUNT(*) as c FROM point_entry WHERE status = 'pending_pv'`).get().c;
  const lateCount = db.prepare(`
    SELECT COUNT(*) as c FROM point_entry
    WHERE status IN ('pending', 'pending_pv') AND created_at <= ?
  `).get(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()).c;

  const openAppealsCount = db.prepare(`SELECT COUNT(*) as c FROM appeal WHERE status = 'open'`).get().c;
  const riskFlags = calculateRiskFlags();
  const randomAuditSample = getRandomAuditSample();

  res.json({
    pending_pv_count: pendingPvCount,
    late_approvals_count: lateCount,
    open_appeals_count: openAppealsCount,
    risk_flags: riskFlags,
    random_audit_sample: randomAuditSample
  });
});

/**
 * POST /api/approvals/import/gpa
 * B-06: O'quv bo'limi GPA TOP 20 yuklash
 */
router.post('/import/gpa', authenticateStaff, (req, res) => {
  try {
    const { rows, file_name } = req.body;
    if (!rows || !Array.isArray(rows)) return res.status(400).json({ error: 'Qatorlar ro\'yxati talab qilinadi' });

    const result = importGpaTop20(rows, req.staffUser, { fileName: file_name || 'gpa_upload.xlsx' });
    res.json({ success: true, ...result, message: `${result.count} ta talabaga GPA TOP 20 ballari yozildi` });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/approvals/import/attendance
 * B-06: 100% davomat ro'yxatini yuklash (+10 ball)
 */
router.post('/import/attendance', authenticateStaff, (req, res) => {
  try {
    const { student_ids, file_name } = req.body;
    if (!student_ids || !Array.isArray(student_ids)) return res.status(400).json({ error: 'Talabalar ro\'yxati talab qilinadi' });

    const result = importAttendance100(student_ids, req.staffUser, { fileName: file_name || 'attendance_upload.xlsx' });
    res.json({ success: true, ...result, message: `${result.count} ta talabaga 100% davomat ballari yozildi` });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/approvals/statistics
 * B-05: Bo'lim statistikasi
 */
router.get('/statistics', authenticateStaff, (req, res) => {
  const role = req.query.role || req.staffUser.roles[0];

  const totalEntries = db.prepare(`SELECT COUNT(*) as c FROM point_entry WHERE approver_role = ?`).get(role).c;
  const approvedEntries = db.prepare(`SELECT COUNT(*) as c FROM point_entry WHERE approver_role = ? AND status = 'approved'`).get(role).c;
  const rejectedEntries = db.prepare(`SELECT COUNT(*) as c FROM point_entry WHERE approver_role = ? AND status = 'rejected'`).get(role).c;
  const pendingEntries = db.prepare(`SELECT COUNT(*) as c FROM point_entry WHERE approver_role = ? AND status = 'pending'`).get(role).c;

  // Rad sabablari taqsimoti
  const rejectReasons = db.prepare(`
    SELECT reject_reason_code, COUNT(*) as cnt
    FROM point_entry
    WHERE approver_role = ? AND status = 'rejected' AND reject_reason_code IS NOT NULL
    GROUP BY reject_reason_code
  `).all(role);

  // Tyutorlar bo'yicha jadval
  const tutorStats = db.prepare(`
    SELECT pe.created_by as tutor_id, su.full_name as tutor_name,
           COUNT(*) as total,
           SUM(CASE WHEN pe.status = 'approved' THEN 1 ELSE 0 END) as approved,
           SUM(CASE WHEN pe.status = 'rejected' THEN 1 ELSE 0 END) as rejected
    FROM point_entry pe
    LEFT JOIN staff_user su ON pe.created_by = su.id
    WHERE pe.approver_role = ?
    GROUP BY pe.created_by
  `).all(role);

  res.json({
    total: totalEntries,
    approved: approvedEntries,
    rejected: rejectedEntries,
    pending: pendingEntries,
    reject_reasons: rejectReasons,
    tutors: tutorStats
  });
});

module.exports = router;
