const { db } = require('../src/db/database');
const { recalculateStudentScores } = require('../src/services/ratingService');

async function resetAllScores() {
  console.log('--- BALLARNI TO\'LIQ NOLGA TUSHIRISH (PRODUCTION LAUNCH) ---');

  // 1. Point entries va tarixini tozalash
  db.prepare('DELETE FROM point_entry_history').run();
  db.prepare('DELETE FROM point_entry').run();
  db.prepare('DELETE FROM weekly_stars').run();

  // 2. Event va checkin bog'liqlarini tozalash
  try { db.prepare('DELETE FROM checkin').run(); } catch (e) {}
  try { db.prepare('DELETE FROM event_registration').run(); } catch (e) {}
  try { db.prepare('UPDATE event SET lead_rewarded = 0').run(); } catch (e) {}

  // 3. student_score ni to'liq nolga tushirish
  db.prepare(`
    UPDATE student_score 
    SET total = 0, season = 0, week_cur = 0, week_prev = 0, 
        by_category = '{}', events_count = 0, last_point_at = NULL, rank_cohort = 1, is_passive = 1,
        updated_at = ?
  `).run(new Date().toISOString());

  // 4. Qayta hisoblash
  recalculateStudentScores();

  // 5. Natijani tekshirish
  const totalPoints = db.prepare('SELECT count(*) as c FROM point_entry').get().c;
  const scoreStats = db.prepare('SELECT sum(total) as s_total, sum(season) as s_season, count(*) as c FROM student_score').get();
  const starsCount = db.prepare('SELECT count(*) as c FROM weekly_stars').get().c;

  console.log(`[SUCCESS] Barcha ballar nolga tushirildi!`);
  console.log(`  - point_entry soni: ${totalPoints}`);
  console.log(`  - Jami talabalar: ${scoreStats.c}`);
  console.log(`  - Talabalar umumiy bali (sum total): ${scoreStats.s_total || 0}`);
  console.log(`  - Talabalar mavsumiy bali (sum season): ${scoreStats.s_season || 0}`);
  console.log(`  - weekly_stars soni: ${starsCount}`);
}

resetAllScores().catch(console.error).finally(() => process.exit(0));
