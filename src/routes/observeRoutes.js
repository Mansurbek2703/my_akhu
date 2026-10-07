const express = require('express');
const router = express.Router();
const { db } = require('../db/database');
const { getRatingList, calculateWeeklyStars } = require('../services/ratingService');
const { calculateRiskFlags, getLateApprovals } = require('../services/cronService');

/**
 * GET /api/observe/dashboard
 * K-01: Bosh sahifa kuzatuv ma'lumotlari
 */
router.get('/dashboard', (req, res) => {
  // 1. Asosiy ko'rsatkichlar
  const totalStudents = db.prepare(`SELECT COUNT(*) as c FROM student WHERE status = 'active'`).get().c;
  const activeStudents = db.prepare(`SELECT COUNT(*) as c FROM student_score WHERE season >= 30`).get().c;
  const activeRatio = totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0;

  const totalSeasonPoints = db.prepare(`SELECT COALESCE(SUM(season), 0) as s FROM student_score`).get().s;
  const pendingApprovalsCount = db.prepare(`SELECT COUNT(*) as c FROM point_entry WHERE status IN ('pending', 'pending_pv')`).get().c;

  const approvedCount = db.prepare(`SELECT COUNT(*) as c FROM point_entry WHERE status = 'approved'`).get().c;
  const allEntriesCount = db.prepare(`SELECT COUNT(*) as c FROM point_entry`).get().c;
  const approvedRatio = allEntriesCount > 0 ? Math.round((approvedCount / allEntriesCount) * 100) : 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayEventsCount = db.prepare(`SELECT COUNT(*) as c FROM event WHERE starts_at LIKE ?`).get(`${todayStr}%`).c;

  // 2. Haftaning yulduzlari
  const weeklyStarsRow = db.prepare(`SELECT payload FROM weekly_stars ORDER BY week_start DESC LIMIT 1`).get();
  const weeklyStars = weeklyStarsRow ? JSON.parse(weeklyStarsRow.payload) : calculateWeeklyStars();

  // 3. Sohalar bo'yicha yig'indi ballar
  const categories = db.prepare(`
    SELECT cc.id, cc.name, cc.color, COALESCE(SUM(pe.points), 0) as total_points
    FROM catalog_category cc
    LEFT JOIN point_entry pe ON cc.id = pe.category_id AND pe.status = 'approved'
    GROUP BY cc.id
    ORDER BY cc.sort ASC
  `).all();

  // 4. TOP 10 Bakalavriat & Magistratura
  const { list: topBak } = getRatingList({ level: 'bak', limit: 10 });
  const { list: topMag } = getRatingList({ level: 'mag', limit: 10 });

  // 5. Tyutorlar statistikasi
  const tutors = db.prepare(`
    SELECT su.id, su.full_name,
           (SELECT COUNT(*) FROM student WHERE tutor_id = su.id AND status = 'active') as student_count,
           (SELECT COUNT(*) FROM point_entry WHERE created_by = su.id AND status = 'approved') as approved_entries,
           (SELECT COALESCE(SUM(points), 0) FROM point_entry WHERE created_by = su.id AND status = 'approved') as points_given
    FROM staff_user su
    WHERE su.roles LIKE '%tutor%'
  `).all();

  // 6. Audit lentasi (oxirgi 15 ta)
  const auditLogs = db.prepare(`
    SELECT al.*, su.full_name as actor_name
    FROM audit_log al
    LEFT JOIN staff_user su ON al.actor_id = su.id
    ORDER BY al.id DESC
    LIMIT 15
  `).all();

  // 7. E'tibor talab qiladigan holatlar
  const riskFlags = calculateRiskFlags();
  const lateApprovals = getLateApprovals();

  res.json({
    metrics: {
      total_students: totalStudents,
      active_ratio: activeRatio,
      total_season_points: totalSeasonPoints,
      pending_approvals: pendingApprovalsCount,
      approved_ratio: approvedRatio,
      today_events: todayEventsCount
    },
    weekly_stars: weeklyStars,
    categories,
    top_bak: topBak,
    top_mag: topMag,
    tutors,
    audit_logs: auditLogs,
    attention_required: {
      late_approvals_count: lateApprovals.length,
      late_approvals: lateApprovals.slice(0, 5),
      risk_flags: riskFlags
    }
  });
});

/**
 * GET /api/observe/students
 * K-02: Talabalar katalogi va qidiruv
 */
router.get('/students', (req, res) => {
  const { level, course, program, group, tutor_id, gender, is_passive, search, page = 1, limit = 25 } = req.query;

  let whereClauses = ["st.status = 'active'"];
  let params = [];

  if (level) { whereClauses.push('st.level = ?'); params.push(level); }
  if (course) { whereClauses.push('st.course = ?'); params.push(Number(course)); }
  if (program) { whereClauses.push('st.program_code = ?'); params.push(program); }
  if (group) { whereClauses.push('st.group_code = ?'); params.push(group); }
  if (tutor_id) { whereClauses.push('st.tutor_id = ?'); params.push(tutor_id); }
  if (gender) { whereClauses.push('st.gender = ?'); params.push(gender); }
  if (is_passive !== undefined) { whereClauses.push('sc.is_passive = ?'); params.push(Number(is_passive)); }

  if (search) {
    whereClauses.push('(st.first_name LIKE ? OR st.last_name LIKE ? OR st.external_id LIKE ?)');
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const offset = (Number(page) - 1) * Number(limit);

  const sql = `
    SELECT st.*, sc.total, sc.season, sc.week_cur, sc.rank_cohort, sc.events_count, sc.is_passive,
           su.full_name as tutor_name
    FROM student st
    LEFT JOIN student_score sc ON st.id = sc.student_id
    LEFT JOIN staff_user su ON st.tutor_id = su.id
    WHERE ${whereClauses.join(' AND ')}
    ORDER BY sc.season DESC
    LIMIT ? OFFSET ?
  `;

  params.push(Number(limit), offset);
  const students = db.prepare(sql).all(...params);

  const countSql = `
    SELECT COUNT(*) as cnt
    FROM student st
    LEFT JOIN student_score sc ON st.id = sc.student_id
    WHERE ${whereClauses.join(' AND ')}
  `;
  const total = db.prepare(countSql).get(...params.slice(0, -2)).cnt;

  res.json({
    students,
    total,
    page: Number(page),
    total_pages: Math.ceil(total / Number(limit))
  });
});

/**
 * GET /api/observe/students/:id
 * Talaba to'liq kartasi (ballar, sohalar, yozuvlar tarixi)
 */
router.get('/students/:id', (req, res) => {
  const student = db.prepare(`
    SELECT st.*, su.full_name as tutor_name, su.email as tutor_email
    FROM student st
    LEFT JOIN staff_user su ON st.tutor_id = su.id
    WHERE st.id = ?
  `).get(req.params.id);

  if (!student) return res.status(404).json({ error: 'Talaba topilmadi' });

  const score = db.prepare(`SELECT * FROM student_score WHERE student_id = ?`).get(req.params.id);
  const entries = db.prepare(`
    SELECT pe.*, ci.name as item_name, cc.name as category_name, cc.color as category_color,
           su.full_name as creator_name
    FROM point_entry pe
    JOIN catalog_item ci ON pe.item_id = ci.id
    JOIN catalog_category cc ON pe.category_id = cc.id
    LEFT JOIN staff_user su ON pe.created_by = su.id
    WHERE pe.student_id = ?
    ORDER BY pe.created_at DESC
  `).all(req.params.id);

  res.json({ student, score, entries });
});

/**
 * GET /api/observe/rating
 * K-03: TOP 50 va kesim o'rtachalari
 */
router.get('/rating', (req, res) => {
  const { period = 'season', level = 'bak' } = req.query;
  const { list, total_count, avg_season } = getRatingList({ period, level, limit: 50 });

  // Kesim o'rtachalari (guruhlar bo'yicha)
  const groupAverages = db.prepare(`
    SELECT st.group_code, AVG(sc.season) as avg_score, COUNT(st.id) as count
    FROM student st
    JOIN student_score sc ON st.id = sc.student_id
    WHERE st.level = ? AND st.status = 'active'
    GROUP BY st.group_code
    ORDER BY avg_score DESC
  `).all(level);

  res.json({
    top_50: list,
    total_students: total_count,
    cohort_avg: avg_season,
    group_averages: groupAverages
  });
});

/**
 * GET /api/observe/catalog
 * K-04: Ball katalogi (faqat ko'rish)
 */
router.get('/catalog', (req, res) => {
  const categories = db.prepare(`SELECT * FROM catalog_category ORDER BY sort ASC`).all();
  const items = db.prepare(`SELECT * FROM catalog_item WHERE archived = 0 ORDER BY category_id, id ASC`).all();
  const scale = db.prepare(`SELECT * FROM scale_matrix`).all();

  res.json({ categories, items, scale });
});

module.exports = router;
