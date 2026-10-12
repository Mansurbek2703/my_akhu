const { db } = require('../db/database');

/**
 * Haftaning boshlanishi va tugashini topish (Dushanba 00:00 - Yakshanba 23:59:59)
 */
function getWeekBounds(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  // Monday is 1, Sunday is 0 -> difference to get to Monday
  const diffToMonday = (day === 0 ? -6 : 1) - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  // Previous week
  const prevMonday = new Date(monday);
  prevMonday.setDate(monday.getDate() - 7);
  const prevSunday = new Date(sunday);
  prevSunday.setDate(sunday.getDate() - 7);

  return {
    curMondayStr: monday.toISOString(),
    curSundayStr: sunday.toISOString(),
    prevMondayStr: prevMonday.toISOString(),
    prevSundayStr: prevSunday.toISOString(),
    weekStartIso: monday.toISOString().split('T')[0],
    prevWeekStartIso: prevMonday.toISOString().split('T')[0]
  };
}

/**
 * Barcha talabalar ballarini hisoblash va student_score kesh jadvaliga yozish
 */
function recalculateStudentScores() {
  const { curMondayStr, prevMondayStr, curSundayStr } = getWeekBounds();
  const currentSeason = db.prepare(`SELECT * FROM season WHERE is_current = 1 LIMIT 1`).get();
  const seasonStart = currentSeason ? currentSeason.starts_on : '2026-09-01';
  const seasonEnd = currentSeason ? currentSeason.ends_on : '2027-06-30';

  const students = db.prepare(`SELECT * FROM student WHERE status = 'active'`).all();
  const now = new Date().toISOString();

  const upsertScore = db.prepare(`
    INSERT OR REPLACE INTO student_score (
      student_id, total, season, week_cur, week_prev, by_category, events_count, last_point_at, rank_cohort, is_passive, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const studentDataList = [];

  for (const st of students) {
    // 1. Total (Barcha approved yozuvlar yig'indisi, manfiylar bilan, kamida 0)
    const totalRow = db.prepare(`
      SELECT COALESCE(SUM(points), 0) as s, MAX(approved_at) as last_at
      FROM point_entry
      WHERE student_id = ? AND status = 'approved'
    `).get(st.id);
    const total = Math.max(0, totalRow.s || 0);
    const lastPointAt = totalRow.last_at || null;

    // 2. Season (Mavsum doirasida approved_at)
    const seasonRow = db.prepare(`
      SELECT COALESCE(SUM(points), 0) as s
      FROM point_entry
      WHERE student_id = ? AND status = 'approved' AND approved_at >= ? AND approved_at <= ?
    `).get(st.id, `${seasonStart}T00:00:00`, `${seasonEnd}T23:59:59`);
    const season = Math.max(0, seasonRow.s || 0);

    // 3. Week current (Dushanba 00:00 dan)
    const weekCurRow = db.prepare(`
      SELECT COALESCE(SUM(points), 0) as s
      FROM point_entry
      WHERE student_id = ? AND status = 'approved' AND approved_at >= ?
    `).get(st.id, curMondayStr);
    const weekCur = Math.max(0, weekCurRow.s || 0);

    // 4. Week prev (O'tgan hafta dushanba-yakshanba)
    const weekPrevRow = db.prepare(`
      SELECT COALESCE(SUM(points), 0) as s
      FROM point_entry
      WHERE student_id = ? AND status = 'approved' AND approved_at >= ? AND approved_at <= ?
    `).get(st.id, prevMondayStr, curMondayStr);
    const weekPrev = Math.max(0, weekPrevRow.s || 0);

    // 5. Sohalar bo'yicha (by_category)
    const catRows = db.prepare(`
      SELECT category_id, COALESCE(SUM(points), 0) as s
      FROM point_entry
      WHERE student_id = ? AND status = 'approved' AND approved_at >= ? AND approved_at <= ?
      GROUP BY category_id
    `).all(st.id, `${seasonStart}T00:00:00`, `${seasonEnd}T23:59:59`);

    const byCat = {};
    for (let i = 1; i <= 9; i++) byCat[String(i)] = 0;
    for (const r of catRows) {
      byCat[String(r.category_id)] = r.s;
    }

    // 6. Qatnashgan tadbirlar soni
    const evRow = db.prepare(`
      SELECT COUNT(*) as c FROM checkin WHERE student_id = ?
    `).get(st.id);
    const eventsCount = evRow.c || 0;

    // 7. Passiv belgi: faqat oxirgi ballidan 30+ kun o'tgan bo'lsa
    let isPassive = 0;
    if (lastPointAt) {
      const daysDiff = (new Date() - new Date(lastPointAt)) / (1000 * 60 * 60 * 24);
      if (daysDiff >= 30) isPassive = 1;
    }

    studentDataList.push({
      student_id: st.id,
      level: st.level,
      total,
      season,
      weekCur,
      weekPrev,
      byCat,
      eventsCount,
      lastPointAt,
      isPassive
    });
  }

  // Kohortalar (bak / mag) bo'yicha o'rinlarni hisoblash
  const cohortGroups = { bak: [], mag: [] };
  for (const item of studentDataList) {
    if (cohortGroups[item.level]) {
      cohortGroups[item.level].push(item);
    }
  }

  for (const level of ['bak', 'mag']) {
    // season bo'yicha kamayish tartibida
    cohortGroups[level].sort((a, b) => b.season - a.season);
    let rank = 1;
    for (let i = 0; i < cohortGroups[level].length; i++) {
      if (i > 0 && cohortGroups[level][i].season < cohortGroups[level][i - 1].season) {
        rank = i + 1;
      }
      cohortGroups[level][i].rank_cohort = rank;
    }
  }

  // Bazaga yozish
  const transaction = db.transaction((list) => {
    for (const s of list) {
      upsertScore.run(
        s.student_id,
        s.total,
        s.season,
        s.weekCur,
        s.weekPrev,
        JSON.stringify(s.byCat),
        s.eventsCount,
        s.lastPointAt,
        s.rank_cohort,
        s.isPassive,
        now
      );
    }
  });

  transaction(studentDataList);
  return studentDataList;
}

/**
 * Reyting ro'yxatini olish (kesimlar va davr bo'yicha)
 */
function getRatingList({ period = 'season', level = null, course = null, program = null, group = null, tutor_id = null, gender = null, limit = 50, offset = 0 } = {}) {
  let sortColumn = 'sc.season';
  if (period === 'week') sortColumn = 'sc.week_cur';
  if (period === 'total') sortColumn = 'sc.total';

  let whereClauses = ["st.status = 'active'"];
  let params = [];

  if (level && level !== 'all' && level !== 'barchasi') {
    whereClauses.push('st.level = ?');
    params.push(level);
  }
  if (course) {
    whereClauses.push('st.course = ?');
    params.push(Number(course));
  }
  if (program) {
    whereClauses.push('st.program_code = ?');
    params.push(program);
  }
  if (group) {
    whereClauses.push('st.group_code = ?');
    params.push(group);
  }
  if (tutor_id) {
    whereClauses.push('st.tutor_id = ?');
    params.push(tutor_id);
  }
  if (gender) {
    whereClauses.push('st.gender = ?');
    params.push(gender);
  }

  const whereStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const sql = `
    SELECT 
      st.id, st.external_id, st.first_name, st.last_name, st.photo_url, st.group_code, st.program_code, st.level, st.course, st.gender,
      sc.total, sc.season, sc.week_cur, sc.week_prev, sc.rank_cohort, sc.by_category, sc.events_count, sc.is_passive
    FROM student st
    JOIN student_score sc ON st.id = sc.student_id
    ${whereStr}
    ORDER BY ${sortColumn} DESC, sc.season DESC, sc.total DESC, st.last_name ASC
    LIMIT ? OFFSET ?
  `;

  params.push(limit, offset);
  const rows = db.prepare(sql).all(...params);

  // Kesim ichida alohida rank hisoblash
  let currentRank = offset + 1;
  const list = rows.map((r, idx) => {
    const scoreVal = period === 'week' ? r.week_cur : (period === 'total' ? r.total : r.season);
    if (idx > 0) {
      const prevScoreVal = period === 'week' ? rows[idx - 1].week_cur : (period === 'total' ? rows[idx - 1].total : rows[idx - 1].season);
      if (scoreVal < prevScoreVal) {
        currentRank = offset + idx + 1;
      }
    }
    return {
      ...r,
      by_category: typeof r.by_category === 'string' ? JSON.parse(r.by_category) : r.by_category,
      rank: currentRank,
      score: scoreVal
    };
  });

  const countSql = `
    SELECT COUNT(*) as total_count, AVG(sc.season) as avg_season
    FROM student st
    JOIN student_score sc ON st.id = sc.student_id
    ${whereStr}
  `;
  const meta = db.prepare(countSql).get(...params.slice(0, -2));

  return {
    list,
    total_count: meta.total_count || 0,
    avg_season: Math.round((meta.avg_season || 0) * 10) / 10
  };
}

/**
 * TX 7.2: Haftaning yulduzlarini hisoblash (Har dushanba avtomatik)
 * Qoida: Bir talaba bir haftada faqat bitta kartada!
 */
function calculateWeeklyStars() {
  const { prevWeekStartIso } = getWeekBounds();
  recalculateStudentScores();

  // Barcha talabalar ballari (joriy hafta, o'tgan hafta va mavsum) bo'yicha saralangan
  const candidateStudents = db.prepare(`
    SELECT st.*, sc.week_prev, sc.week_cur, sc.season, sc.total, sc.by_category
    FROM student st
    JOIN student_score sc ON st.id = sc.student_id
    WHERE st.status = 'active'
    ORDER BY 
      (CASE WHEN sc.week_cur > 0 THEN sc.week_cur ELSE (CASE WHEN sc.week_prev > 0 THEN sc.week_prev ELSE sc.season END) END) DESC,
      sc.season DESC,
      sc.total DESC
  `).all();

  const usedStudentIds = new Set();
  const pickCandidate = (filterFn) => {
    for (const c of candidateStudents) {
      if (!usedStudentIds.has(c.id) && filterFn(c)) {
        usedStudentIds.add(c.id);
        const starScore = c.week_cur > 0 ? c.week_cur : (c.week_prev > 0 ? c.week_prev : c.season);
        return {
          id: c.id,
          first_name: c.first_name,
          last_name: c.last_name,
          photo_url: c.photo_url || null,
          group_code: c.group_code,
          score: starScore,
          week_points: starScore,
          season: c.season,
          gender: c.gender,
          level: c.level,
          course: c.course
        };
      }
    }
    return null;
  };

  // 1. Haftaning talabasi (eng katta ballga ega bo'lgan talaba)
  const hero = pickCandidate((c) => (c.week_cur > 0 || c.week_prev > 0 || c.season > 0)) || pickCandidate(() => true);

  // 2. Eng faol qiz bola (jins = f)
  const girl = pickCandidate((c) => c.gender === 'f' && (c.week_cur > 0 || c.week_prev > 0 || c.season > 0)) || pickCandidate((c) => c.gender === 'f');

  // 3. Eng faol o'g'il bola (jins = m)
  const boy = pickCandidate((c) => c.gender === 'm' && (c.week_cur > 0 || c.week_prev > 0 || c.season > 0)) || pickCandidate((c) => c.gender === 'm');

  // 4. Kurslar bo'yicha:
  const c1 = pickCandidate((c) => c.level === 'bak' && c.course === 1);
  const c2 = pickCandidate((c) => c.level === 'bak' && c.course === 2);
  const cMag = pickCandidate((c) => c.level === 'mag');

  // 5. Haftaning guruhi: o'rtacha balli eng yuqori guruh
  const groupStats = db.prepare(`
    SELECT st.group_code, 
           COALESCE(ROUND(AVG(CASE WHEN sc.week_cur > 0 THEN sc.week_cur ELSE sc.season END), 1), 0) as avg_score, 
           COALESCE(SUM(CASE WHEN sc.week_cur > 0 THEN sc.week_cur ELSE sc.season END), 0) as sum_score, 
           COUNT(st.id) as cnt
    FROM student st
    JOIN student_score sc ON st.id = sc.student_id
    WHERE st.status = 'active'
    GROUP BY st.group_code
    ORDER BY avg_score DESC, sum_score DESC
    LIMIT 1
  `).get();

  // 6. Sohalar bo'yicha 6 ta yetakchi (oldingilar chiqarilgan)
  const categoriesList = [
    { id: '1', title: 'Ijtimoiy faollik' },
    { id: '2', title: 'Ma\'naviy-ma\'rifiy' },
    { id: '3', title: 'Akademik' },
    { id: '4', title: 'Ilmiy va innovatsion' },
    { id: '5', title: 'Sport' },
    { id: '6', title: 'Madaniyat va san\'at' }
  ];

  const categoryStars = [];
  for (const cat of categoriesList) {
    const star = pickCandidate((c) => {
      const cats = typeof c.by_category === 'string' ? JSON.parse(c.by_category) : c.by_category;
      return cats && (cats[cat.id] || 0) > 0;
    }) || pickCandidate(() => true);

    if (star) {
      categoryStars.push({
        category_id: cat.id,
        category_name: cat.title,
        ...star
      });
    }
  }

  const payload = {
    week_start: prevWeekStartIso,
    calculated_at: new Date().toISOString(),
    hero: hero || (candidateStudents[0] ? { ...candidateStudents[0], score: candidateStudents[0].season, week_points: candidateStudents[0].season } : null),
    girl: girl || (candidateStudents.find(c => c.gender === 'f') ? { ...candidateStudents.find(c => c.gender === 'f'), score: 0, week_points: 0 } : null),
    boy: boy || (candidateStudents.find(c => c.gender === 'm') ? { ...candidateStudents.find(c => c.gender === 'm'), score: 0, week_points: 0 } : null),
    courses: {
      c1: c1 || (candidateStudents.find(c => c.course === 1) ? { ...candidateStudents.find(c => c.course === 1), score: 0 } : null),
      c2: c2 || (candidateStudents.find(c => c.course === 2) ? { ...candidateStudents.find(c => c.course === 2), score: 0 } : null),
      cMag: cMag || (candidateStudents.find(c => c.level === 'mag') ? { ...candidateStudents.find(c => c.level === 'mag'), score: 0 } : null)
    },
    top_group: groupStats || { group_code: '—', avg_score: 0, sum_score: 0, cnt: 0 },
    top_club: { name: 'IT & Robotics Club', organizer: 'dep_yb', events_count: 3 },
    categories: categoryStars
  };

  const insertWeekly = db.prepare(`
    INSERT OR REPLACE INTO weekly_stars (week_start, payload, published_at, telegram_message_id)
    VALUES (?, ?, ?, ?)
  `);
  insertWeekly.run(prevWeekStartIso, JSON.stringify(payload), new Date().toISOString(), null);

  return payload;
}

module.exports = {
  getWeekBounds,
  recalculateStudentScores,
  getRatingList,
  calculateWeeklyStars
};
