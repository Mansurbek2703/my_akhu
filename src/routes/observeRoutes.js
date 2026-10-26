const express = require('express');
const router = express.Router();
const { db } = require('../db/database');
const { getRatingList, calculateWeeklyStars } = require('../services/ratingService');
const { calculateRiskFlags, getLateApprovals } = require('../services/cronService');
const config = require('../config');

// Qat'iy avtorizatsiya middleware: Faqat tizimga kirgan xodimlar yoki to'g'ri TV tokeni
function authenticateStaffOrTv(req, res, next) {
  const tvToken = req.query.token || req.headers['x-tv-token'];
  if (tvToken && tvToken === config.secrets.tvToken) {
    req.staffUser = { id: 'tv_display', roles: ['observer'] };
    return next();
  }

  const userId = req.headers['x-user-id'] || req.query.user_id;
  if (!userId) {
    return res.status(401).json({ error: "Avtorizatsiyadan o'tilmagan. Iltimos, login va parol orqali tizimga kiring." });
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

router.use(authenticateStaffOrTv);

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
  let rawStars = weeklyStarsRow ? JSON.parse(weeklyStarsRow.payload) : null;
  if (!rawStars || ((!rawStars.hero?.score && !rawStars.hero?.week_points) && totalSeasonPoints > 0)) {
    rawStars = calculateWeeklyStars();
  }

  const formatStar = (s) => {
    if (!s) return null;
    let freshPhoto = s.photo_url || null;
    let freshName = (s.student_name || `${s.first_name || ''} ${s.last_name || ''}`).trim();
    let freshGroup = s.group_code || '—';
    let freshGender = s.gender;

    if (s.id) {
      try {
        const st = db.prepare('SELECT first_name, last_name, photo_url, group_code, gender FROM student WHERE id = ?').get(s.id);
        if (st) {
          if (st.photo_url) freshPhoto = st.photo_url;
          freshName = `${st.first_name} ${st.last_name}`.trim();
          if (st.group_code) freshGroup = st.group_code;
          if (st.gender) freshGender = st.gender;
        }
      } catch (e) {}
    }

    return {
      ...s,
      student_name: freshName || 'Aniqlanmoqda',
      photo_url: freshPhoto,
      week_points: s.week_points !== undefined ? s.week_points : (s.score !== undefined ? s.score : (s.week_cur || 0)),
      group_code: freshGroup,
      gender: freshGender
    };
  };

  const weeklyStars = {
    ...rawStars,
    hero: formatStar(rawStars?.hero),
    girl: formatStar(rawStars?.girl),
    boy: formatStar(rawStars?.boy)
  };

  // 3. Sohalar bo'yicha yig'indi ballar
  const categories = db.prepare(`
    SELECT cc.id, cc.name, cc.color, COALESCE(SUM(pe.points), 0) as total_points
    FROM catalog_category cc
    LEFT JOIN point_entry pe ON cc.id = pe.category_id AND pe.status = 'approved'
    GROUP BY cc.id, cc.name, cc.color, cc.sort
    ORDER BY cc.sort ASC
  `).all();

  // 4. TOP 10 Bakalavriat & Magistratura & Barchasi (Faxriy doska)
  const { list: topBak } = getRatingList({ level: 'bak', limit: 10 });
  const { list: topMag } = getRatingList({ level: 'mag', limit: 10 });
  const { list: topOverall } = getRatingList({ level: null, limit: 10 });

  // 5. Guruhlar reytingi (O'rtacha ball va faollik)
  const topGroups = db.prepare(`
    SELECT st.group_code, st.program_code,
           COUNT(st.id) as students_count,
           COALESCE(ROUND(AVG(sc.season), 1), 0) as avg_score,
           COALESCE(SUM(sc.season), 0) as total_score
    FROM student st
    LEFT JOIN student_score sc ON st.id = sc.student_id
    WHERE st.status = 'active'
    GROUP BY st.group_code, st.program_code
    ORDER BY avg_score DESC, total_score DESC
    LIMIT 10
  `).all();

  // 6. Tyutorlar statistikasi
  const tutors = db.prepare(`
    SELECT su.id, su.full_name,
           (SELECT COUNT(*) FROM student WHERE tutor_id = su.id AND status = 'active') as student_count,
           (SELECT COUNT(*) FROM point_entry WHERE created_by = su.id AND status = 'approved') as approved_entries,
           (SELECT COALESCE(SUM(points), 0) FROM point_entry WHERE created_by = su.id AND status = 'approved') as points_given
    FROM staff_user su
    WHERE su.roles LIKE '%tutor%'
  `).all();

  // 7. Audit lentasi (oxirgi 15 ta)
  const auditLogs = db.prepare(`
    SELECT al.*, su.full_name as actor_name
    FROM audit_log al
    LEFT JOIN staff_user su ON al.actor_id = su.id
    ORDER BY al.id DESC
    LIMIT 15
  `).all();

  // 8. E'tibor talab qiladigan holatlar
  const riskFlags = calculateRiskFlags();
  const lateApprovals = getLateApprovals();

  res.json({
    metrics: {
      total_students: totalStudents,
      active_ratio: activeRatio,
      total_season_points: totalSeasonPoints,
      pending_approvals: pendingApprovalsCount,
      approved_ratio: approvedRatio,
      today_events: todayEventsCount,
      top_group: topGroups[0]?.group_code || '—'
    },
    weekly_stars: weeklyStars,
    categories,
    top_overall: topOverall,
    top_bak: topBak,
    top_mag: topMag,
    top_groups: topGroups,
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

  if (search && search.trim()) {
    const searchRes = buildStudentSearch(search, 'st');
    if (searchRes.clauses.length > 0) {
      whereClauses.push(...searchRes.clauses);
      params.push(...searchRes.params);
    }
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
 * K-03: TOP 10 va kesim o'rtachalari (Yetakchilar Faxriy Doskasi)
 */
router.get('/rating', (req, res) => {
  const { period = 'season', level = 'all' } = req.query;
  const filterLevel = (!level || level === 'all' || level === 'barchasi') ? null : level;
  // Ochiq monitoring: Faqat Top 10 yetakchilar ko'rsatiladi (barcha talabalar emas)
  const { list, total_count, avg_season } = getRatingList({ period, level: filterLevel, limit: 10 });

  // Kesim o'rtachalari (guruhlar bo'yicha)
  const whereClauses = ["st.status = 'active'"];
  const groupParams = [];
  if (filterLevel) {
    whereClauses.push("st.level = ?");
    groupParams.push(filterLevel);
  }

  const groupAverages = db.prepare(`
    SELECT st.group_code, st.program_code,
           COUNT(st.id) as count,
           COALESCE(ROUND(AVG(sc.season), 1), 0) as avg_score,
           COALESCE(SUM(sc.season), 0) as total_score
    FROM student st
    LEFT JOIN student_score sc ON st.id = sc.student_id
    WHERE ${whereClauses.join(' AND ')}
    GROUP BY st.group_code, st.program_code
    ORDER BY avg_score DESC, total_score DESC
    LIMIT 15
  `).all(...groupParams);

  res.json({
    list: (list || []).slice(0, 10),
    top_10: (list || []).slice(0, 10),
    top_50: (list || []).slice(0, 10),
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
  const items = db.prepare(`
    SELECT ci.*, cc.name as category_name, cc.color as category_color
    FROM catalog_item ci
    LEFT JOIN catalog_category cc ON ci.category_id = cc.id
    WHERE ci.archived = 0
      AND ci.version_from = (
        SELECT MAX(ci2.version_from) FROM catalog_item ci2 WHERE ci2.id = ci.id AND ci2.archived = 0
      )
    ORDER BY ci.category_id, ci.id ASC
  `).all();
  const scale = db.prepare(`SELECT * FROM scale_matrix`).all();

  res.json({ categories, items, scale });
});

module.exports = router;
