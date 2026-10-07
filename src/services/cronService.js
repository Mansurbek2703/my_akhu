const { db } = require('../db/database');
const { recalculateStudentScores, calculateWeeklyStars } = require('./ratingService');
const { notifyStaffDept, sendTelegramMessage } = require('./telegramService');
const config = require('../config');

/**
 * P-02: Konsentratsiya va "Bir manba" xavf indikatorlarini hisoblash
 */
function calculateRiskFlags() {
  const flags = {
    tutor_concentration: [],
    student_single_source: []
  };

  // 1. Tyutor konsentratsiyasi: Tyutor kiritgan ballarning top 5 talabasiga to'g'ri kelgan ulushi > 40%
  const tutors = db.prepare(`SELECT * FROM staff_user WHERE roles LIKE '%tutor%'`).all();

  for (const t of tutors) {
    const studentSums = db.prepare(`
      SELECT student_id, SUM(points) as pts
      FROM point_entry
      WHERE created_by = ? AND status = 'approved' AND source = 'tutor'
      GROUP BY student_id
      ORDER BY pts DESC
    `).all(t.id);

    const totalPoints = studentSums.reduce((sum, r) => sum + r.pts, 0);
    if (totalPoints > 50 && studentSums.length > 5) {
      const top5Points = studentSums.slice(0, 5).reduce((sum, r) => sum + r.pts, 0);
      const ratio = Math.round((top5Points / totalPoints) * 100);

      if (ratio > 40) {
        flags.tutor_concentration.push({
          tutor_id: t.id,
          tutor_name: t.full_name,
          ratio,
          top5Points,
          totalPoints,
          reason: `Tyutor ballarining ${ratio}% ulushi 5 nafar talabaga to'g'ri kelgan (limit: 40%)`
        });
      }
    }
  }

  // 2. Talaba "Bir manba" indikatori: Talaba ballining > 70% bitta banddan (QR dan tashqari)
  const students = db.prepare(`SELECT * FROM student WHERE status = 'active'`).all();

  for (const st of students) {
    const itemSums = db.prepare(`
      SELECT item_id, SUM(points) as pts
      FROM point_entry
      WHERE student_id = ? AND status = 'approved' AND source != 'qr'
      GROUP BY item_id
      ORDER BY pts DESC
    `).all(st.id);

    const totalManual = itemSums.reduce((sum, r) => sum + r.pts, 0);
    if (totalManual >= 30 && itemSums.length > 0) {
      const topItem = itemSums[0];
      const ratio = Math.round((topItem.pts / totalManual) * 100);

      if (ratio > 70) {
        const itemInfo = db.prepare(`SELECT name FROM catalog_item WHERE id = ?`).get(topItem.item_id);
        flags.student_single_source.push({
          student_id: st.id,
          student_name: `${st.first_name} ${st.last_name}`,
          group_code: st.group_code,
          item_id: topItem.item_id,
          item_name: itemInfo ? itemInfo.name : topItem.item_id,
          ratio,
          itemPoints: topItem.pts,
          totalPoints: totalManual,
          reason: `Talaba ballarining ${ratio}% qismi bitta banddan (${itemInfo ? itemInfo.name : topItem.item_id}) olingan`
        });
      }
    }
  }

  return flags;
}

/**
 * R-07 & P-01: Kechikkan tasdiqlar tekshiruvi (3 ish kunidan oshganlar)
 */
function getLateApprovals() {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

  const lateEntries = db.prepare(`
    SELECT pe.*, st.first_name, st.last_name, st.group_code, su.full_name as tutor_name, ci.name as item_name
    FROM point_entry pe
    JOIN student st ON pe.student_id = st.id
    LEFT JOIN staff_user su ON pe.created_by = su.id
    JOIN catalog_item ci ON pe.item_id = ci.id
    WHERE pe.status IN ('pending', 'pending_pv') AND pe.created_at <= ?
    ORDER BY pe.created_at ASC
  `).all(threeDaysAgo);

  return lateEntries;
}

/**
 * P-06: Oylik tasodifiy tekshiruv (5% approved yozuvlar, kamida 20 ta)
 */
function getRandomAuditSample() {
  const lastMonthStart = new Date();
  lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
  const startIso = lastMonthStart.toISOString();

  const totalApproved = db.prepare(`
    SELECT COUNT(*) as cnt FROM point_entry
    WHERE status = 'approved' AND approved_at >= ?
  `).get(startIso).cnt;

  const sampleSize = Math.max(20, Math.ceil(totalApproved * 0.05));

  const sample = db.prepare(`
    SELECT pe.*, st.first_name, st.last_name, st.group_code, ci.name as item_name, su.full_name as tutor_name
    FROM point_entry pe
    JOIN student st ON pe.student_id = st.id
    JOIN catalog_item ci ON pe.item_id = ci.id
    LEFT JOIN staff_user su ON pe.created_by = su.id
    WHERE pe.status = 'approved' AND pe.approved_at >= ?
    ORDER BY RANDOM()
    LIMIT ?
  `).all(startIso, sampleSize);

  return sample;
}

/**
 * Q-07: Ro'yxatdan o'tib kelmagan talabalarga j2 (-3 ball) avtomatik yozish
 */
function processEventNoShows() {
  const now = new Date();
  const pastEvents = db.prepare(`
    SELECT * FROM event
    WHERE requires_registration = 1 AND capacity IS NOT NULL AND ends_at <= ? AND status = 'published'
  `).all(new Date(now.getTime() - 30 * 60 * 1000).toISOString());

  const currentSeason = db.prepare(`SELECT * FROM season WHERE is_current = 1 LIMIT 1`).get() || { id: '2026-2027' };
  const currentMonthStart = `${now.toISOString().slice(0, 7)}-01T00:00:00`;

  for (const ev of pastEvents) {
    const unverifiedRegistrations = db.prepare(`
      SELECT er.* FROM event_registration er
      LEFT JOIN checkin chk ON er.event_id = chk.event_id AND er.student_id = chk.student_id
      WHERE er.event_id = ? AND chk.id IS NULL AND er.no_show = 0
    `).all(ev.id);

    for (const reg of unverifiedRegistrations) {
      // Mark as no-show
      db.prepare(`UPDATE event_registration SET no_show = 1 WHERE id = ?`).run(reg.id);

      // Shu oy ichidagi no-show lar soni
      const noShowCount = db.prepare(`
        SELECT COUNT(*) as cnt FROM event_registration er
        JOIN event e ON er.event_id = e.id
        WHERE er.student_id = ? AND er.no_show = 1 AND er.registered_at >= ?
      `).get(reg.student_id, currentMonthStart).cnt;

      // 2-martadan boshlab j2 (-3 ball) yoziladi
      if (noShowCount >= 2) {
        const entryId = 'pe_ns_' + Math.random().toString(36).substring(2, 9);
        const nowIso = now.toISOString();

        db.prepare(`
          INSERT INTO point_entry (
            id, student_id, item_id, item_version, category_id, base_points, points,
            note, event_date, source, created_by, created_at, status, approver_role,
            approved_by, approved_at, event_id, season_id
          ) VALUES (?, ?, 'j2', 1, '9', -3, -3, ?, ?, 'system', 'system', ?, 'approved', 'prorektor', 'system', ?, ?, ?)
        `).run(
          entryId,
          reg.student_id,
          `Tadbirga ro'yxatdan o'tib kelmaslik (oyda ${noShowCount}-marta): ${ev.title}`,
          nowIso.split('T')[0],
          nowIso,
          nowIso,
          ev.id,
          currentSeason.id
        );
      }
    }
  }

  recalculateStudentScores();
}

/**
 * Cron scheduler ishga tushirish (har 5 daqiqada kesh, har soatda tekshiruvlar)
 */
function initBackgroundJobs() {
  console.log('Background cron jobs boshlandi...');

  // Dastlabki hisoblash
  recalculateStudentScores();

  // Har 5 daqiqada keshni yangilash
  setInterval(() => {
    try {
      recalculateStudentScores();
    } catch (e) {
      console.error('Kesh yangilashda xatolik:', e.message);
    }
  }, 5 * 60 * 1000);

  // Har 10 daqiqada no-show tekshiruvi
  setInterval(() => {
    try {
      processEventNoShows();
    } catch (e) {
      console.error('No-show tekshirishda xatolik:', e.message);
    }
  }, 10 * 60 * 1000);
}

module.exports = {
  calculateRiskFlags,
  getLateApprovals,
  getRandomAuditSample,
  processEventNoShows,
  initBackgroundJobs
};
