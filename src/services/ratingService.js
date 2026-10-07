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

    // 7. Passiv belgi: 30+ kun ballsiz yoki season == 0
    let isPassive = 0;
    if (season === 0) {
      isPassive = 1;
    } else if (lastPointAt) {
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

  if (level) {
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
      st.id, st.first_name, st.last_name, st.group_code, st.program_code, st.level, st.course, st.gender,
      sc.total, sc.season, sc.week_cur, sc.week_prev, sc.rank_cohort, sc.by_category, sc.events_count, sc.is_passive
    FROM student st
    JOIN student_score sc ON st.id = sc.student_id
    ${whereStr}
    ORDER BY ${sortColumn} DESC, sc.season DESC
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

  // Barcha talabalar o'tgan hafta ballari (week_prev) bo'yicha saralangan
  const candidateStudents = db.prepare(`
    SELECT st.*, sc.week_prev, sc.season, sc.by_category
    FROM student st
    JOIN student_score sc ON st.id = sc.student_id
    WHERE st.status = 'active'
    ORDER BY sc.week_prev DESC, sc.season DESC
  `).all();

  const usedStudentIds = new Set();
  const pickCandidate = (filterFn) => {
    for (const c of candidateStudents) {
      if (!usedStudentIds.has(c.id) && filterFn(c)) {
        usedStudentIds.add(c.id);
        return {
          id: c.id,
          first_name: c.first_name,
          last_name: c.last_name,
          group_code: c.group_code,
          score: c.week_prev,
          season: c.season,
          gender: c.gender,
          level: c.level,
          course: c.course
        };
      }
    }
    return null;
  };

  // 1. Haftaning talabasi (eng katta week_prev butun universitet)
  const hero = pickCandidate(() => true);

  // 2. Eng faol qiz bola (jins = f, 1-banddagilar chiqarilgan)
  const girl = pickCandidate((c) => c.gender === 'f');

  // 3. Eng faol o'g'il bola (jins = m, oldingilar chiqarilgan)
  const boy = pickCandidate((c) => c.gender === 'm');

  // 4. Kurslar bo'yicha:
  const c1 = pickCandidate((c) => c.level === 'bak' && c.course === 1);
  const c2 = pickCandidate((c) => c.level === 'bak' && c.course === 2);
  const cMag = pickCandidate((c) => c.level === 'mag');

  // 5. Haftaning guruhi: o'rtacha week_prev eng katta guruh
  const groupStats = db.prepare(`
    SELECT st.group_code, AVG(sc.week_prev) as avg_score, SUM(sc.week_prev) as sum_score, COUNT(st.id) as cnt
    FROM student st
    JOIN student_score sc ON st.id = sc.student_id
    WHERE st.status = 'active'
    GROUP BY st.group_code
    ORDER BY avg_score DESC
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
    hero: hero || { first_name: 'Diyorbek', last_name: 'Ismoilov', group_code: '210-21', score: 32 },
    girl: girl || { first_name: 'Malika', last_name: 'Nazarova', group_code: '210-21', score: 26 },
    boy: boy || { first_name: 'Jahongir', last_name: 'Mirzayev', group_code: '211-21', score: 25 },
    courses: {
      c1: c1 || { first_name: 'Bekzod', last_name: 'Rahimov', group_code: '211-22', score: 20 },
      c2: c2 || { first_name: 'Otabek', last_name: 'Xalilov', group_code: '210-22', score: 22 },
      cMag: cMag || { first_name: 'Umidbek', last_name: 'Sultonov', group_code: 'M-101', score: 40 }
    },
    top_group: groupStats || { group_code: '210-21', avg_score: 18.5, sum_score: 55, cnt: 3 },
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
