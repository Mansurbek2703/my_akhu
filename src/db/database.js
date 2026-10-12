const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const config = require('../config');

// Ensure data folder exists
const dataDir = path.dirname(config.dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Ensure uploads folder exists
if (!fs.existsSync(config.uploadDir)) {
  fs.mkdirSync(config.uploadDir, { recursive: true });
}

const db = new Database(config.dbPath);

// Enable WAL mode for high concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize schema
function initSchema() {
  const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  db.exec(schemaSql);

    // Migration: ensure telegram_user_id exists on staff_user
    try {
      const cols = db.pragma('table_info(staff_user)').map(c => c.name);
      if (!cols.includes('telegram_user_id')) {
        db.exec('ALTER TABLE staff_user ADD COLUMN telegram_user_id TEXT;');
      }
      if (!cols.includes('phone')) {
        db.exec('ALTER TABLE staff_user ADD COLUMN phone TEXT;');
      }
      if (!cols.includes('photo_url')) {
        db.exec('ALTER TABLE staff_user ADD COLUMN photo_url TEXT;');
      }
    } catch (e) {}

    // Migration: ensure photo_url exists on student
    try {
      const cols = db.pragma('table_info(student)').map(c => c.name);
      if (!cols.includes('photo_url')) {
        db.exec('ALTER TABLE student ADD COLUMN photo_url TEXT;');
      }
    } catch (e) {}

    // Migration: ensure qr_refresh_seconds and attendance_open_minutes_before exist on event
    try {
      const cols = db.pragma('table_info(event)').map(c => c.name);
      if (!cols.includes('qr_refresh_seconds')) {
        db.exec('ALTER TABLE event ADD COLUMN qr_refresh_seconds INTEGER DEFAULT 5;');
      }
      if (!cols.includes('attendance_open_minutes_before')) {
        db.exec('ALTER TABLE event ADD COLUMN attendance_open_minutes_before INTEGER DEFAULT 5;');
      }
      // Anti-fraud: event QR kodi har doim qat'iy 5 soniyada yangilanishi shart
      db.exec('UPDATE event SET qr_refresh_seconds = 5;');
      db.exec('UPDATE event SET attendance_open_minutes_before = 5 WHERE attendance_open_minutes_before IS NULL;');
    } catch (e) {}

    // Migration: ensure telegram_bot_user and telegram_bot_log exist
    try {
      db.exec(`
        CREATE TABLE IF NOT EXISTS telegram_bot_user (
          telegram_user_id TEXT PRIMARY KEY,
          username TEXT,
          first_name TEXT,
          last_name TEXT,
          phone TEXT,
          student_id TEXT,
          started_at TEXT NOT NULL,
          last_seen_at TEXT NOT NULL,
          actions_count INTEGER NOT NULL DEFAULT 1,
          FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE SET NULL
        );
        CREATE TABLE IF NOT EXISTS telegram_bot_log (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          telegram_user_id TEXT NOT NULL,
          student_id TEXT,
          action_type TEXT NOT NULL,
          details TEXT,
          created_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_bot_log_user ON telegram_bot_log(telegram_user_id, created_at);
        CREATE INDEX IF NOT EXISTS idx_bot_log_created ON telegram_bot_log(created_at);
      `);

      // Avval bog'langan talabalarni bot userlar ro'yxatiga avtomatik qo'shish
      const linkedStudents = db.prepare(`SELECT id, first_name, last_name, phone, telegram_user_id, updated_at FROM student WHERE telegram_user_id IS NOT NULL`).all();
      const insertBotUser = db.prepare(`
        INSERT OR IGNORE INTO telegram_bot_user (telegram_user_id, first_name, last_name, phone, student_id, started_at, last_seen_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      for (const s of linkedStudents) {
        insertBotUser.run(String(s.telegram_user_id), s.first_name, s.last_name, s.phone, s.id, s.updated_at || new Date().toISOString(), s.updated_at || new Date().toISOString());
      }
    } catch (e) {}

    // Avtomatik sinxronizatsiya: talabalarning tutor_id sini tutor_group bo'yicha to'g'rilash
    try {
      db.exec(`
        UPDATE student
        SET tutor_id = (SELECT tg.tutor_id FROM tutor_group tg WHERE tg.group_code = student.group_code LIMIT 1)
        WHERE group_code IN (SELECT group_code FROM tutor_group);

        UPDATE student
        SET tutor_id = NULL
        WHERE tutor_id IS NOT NULL 
          AND (
            group_code IS NULL
            OR group_code NOT IN (
              SELECT tg.group_code FROM tutor_group tg WHERE tg.tutor_id = student.tutor_id
            )
          );
      `);
    } catch (e) {}
  }

module.exports = {
  db,
  initSchema
};
