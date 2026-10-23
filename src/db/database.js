const fs = require('fs');
const path = require('path');
const config = require('../config');
const { PgDatabase } = require('./pgAdapter');

// Ensure data folder exists
const dataDir = path.dirname(config.dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Ensure uploads folder exists
if (!fs.existsSync(config.uploadDir)) {
  fs.mkdirSync(config.uploadDir, { recursive: true });
}

let db;
let isPostgres = false;

if (config.usePostgres) {
  try {
    const pgConnString = process.env.DATABASE_URL || 
      `postgres://${config.pg.user}:${encodeURIComponent(config.pg.password)}@${config.pg.host}:${config.pg.port}/${config.pg.database}`;
    
    db = new PgDatabase(pgConnString);
    isPostgres = true;
    console.log(`[DB] PostgreSQL bazasiga muvaffaqiyatli ulandi: ${config.pg.host}:${config.pg.port}/${config.pg.database}`);
  } catch (err) {
    console.error(`[DB] PostgreSQL ulanishida xatolik (${err.message}). SQLite bazasiga o'tilmoqda.`);
    const Database = require('better-sqlite3');
    db = new Database(config.dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    isPostgres = false;
  }
} else {
  const Database = require('better-sqlite3');
  db = new Database(config.dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  isPostgres = false;
}

// Initialize schema
function initSchema() {
  if (isPostgres) {
    initPostgresSchema();
  } else {
    initSqliteSchema();
  }
}

function initPostgresSchema() {
  try {
    // Migration: ensure telegram columns exist on staff_user
    db.exec(`
      ALTER TABLE staff_user ADD COLUMN IF NOT EXISTS passport_id TEXT;
      ALTER TABLE staff_user ADD COLUMN IF NOT EXISTS telegram_user_id TEXT;
      ALTER TABLE staff_user ADD COLUMN IF NOT EXISTS phone TEXT;
      ALTER TABLE staff_user ADD COLUMN IF NOT EXISTS photo_url TEXT;
      ALTER TABLE staff_user ADD COLUMN IF NOT EXISTS passport_id TEXT;
      ALTER TABLE staff_user ADD COLUMN IF NOT EXISTS telegram_username TEXT;
      ALTER TABLE staff_user ADD COLUMN IF NOT EXISTS telegram_phone TEXT;
      ALTER TABLE staff_user ADD COLUMN IF NOT EXISTS bot_started_at TEXT;
      ALTER TABLE staff_user ADD COLUMN IF NOT EXISTS bot_status TEXT DEFAULT 'not_started';
      ALTER TABLE staff_user ADD COLUMN IF NOT EXISTS last_active_at TEXT;
      ALTER TABLE staff_user ADD COLUMN IF NOT EXISTS last_notification_at TEXT;
      UPDATE staff_user SET bot_status = 'active', bot_started_at = COALESCE(bot_started_at, TO_CHAR(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"')) WHERE id = 'superadmin' AND telegram_user_id IS NOT NULL;
    `);

    // Migration: ensure photo_url exists on student
    db.exec(`ALTER TABLE student ADD COLUMN IF NOT EXISTS photo_url TEXT;`);

    // Migration: ensure qr_refresh_seconds, attendance_open_minutes_before, photo_url, image_url exist on event
    db.exec(`
      ALTER TABLE event ADD COLUMN IF NOT EXISTS qr_refresh_seconds INTEGER DEFAULT 5;
      ALTER TABLE event ADD COLUMN IF NOT EXISTS attendance_open_minutes_before INTEGER DEFAULT 5;
      ALTER TABLE event ADD COLUMN IF NOT EXISTS photo_url TEXT;
      ALTER TABLE event ADD COLUMN IF NOT EXISTS image_url TEXT;
      UPDATE event SET qr_refresh_seconds = 5;
      UPDATE event SET attendance_open_minutes_before = 5 WHERE attendance_open_minutes_before IS NULL;
    `);

    // Avtomatik sinxronizatsiya: talabalarning tutor_id sini tutor_group bo'yicha to'g'rilash
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

      -- Campus Attendance & Access Control Logs
      CREATE TABLE IF NOT EXISTS campus_attendance (
          id TEXT PRIMARY KEY,
          student_id TEXT NOT NULL,
          passport_id TEXT NOT NULL,
          date TEXT NOT NULL,
          first_in_at TEXT,
          last_out_at TEXT,
          in_count INTEGER NOT NULL DEFAULT 0,
          out_count INTEGER NOT NULL DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'present' CHECK(status IN ('present', 'late', 'absent')),
          raw_events TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          UNIQUE (student_id, date),
          FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_campus_attendance_date ON campus_attendance(date);
      CREATE INDEX IF NOT EXISTS idx_campus_attendance_student ON campus_attendance(student_id, date);
      CREATE INDEX IF NOT EXISTS idx_campus_attendance_passport ON campus_attendance(passport_id, date);

      CREATE TABLE IF NOT EXISTS access_control_log (
          id TEXT PRIMARY KEY,
          student_id TEXT,
          passport_id TEXT NOT NULL,
          person_name TEXT,
          event_time TEXT NOT NULL,
          direction TEXT NOT NULL CHECK(direction IN ('in', 'out', 'unknown')),
          door_name TEXT,
          device_name TEXT,
          card_no TEXT,
          raw_payload TEXT,
          created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_access_log_passport ON access_control_log(passport_id, event_time);
      CREATE INDEX IF NOT EXISTS idx_access_log_student ON access_control_log(student_id, event_time);
      CREATE INDEX IF NOT EXISTS idx_access_log_time ON access_control_log(event_time);
    `);
  } catch (err) {
    console.error('[DB] PostgreSQL initSchema warning:', err.message);
  }
}

function initSqliteSchema() {
  const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  db.exec(schemaSql);

  // Migration: ensure telegram columns exist on staff_user
  try {
    const cols = db.pragma('table_info(staff_user)').map(c => c.name);
    if (!cols.includes('passport_id')) {
      db.exec('ALTER TABLE staff_user ADD COLUMN passport_id TEXT;');
    }
    if (!cols.includes('telegram_user_id')) {
      db.exec('ALTER TABLE staff_user ADD COLUMN telegram_user_id TEXT;');
    }
    if (!cols.includes('phone')) {
      db.exec('ALTER TABLE staff_user ADD COLUMN phone TEXT;');
    }
    if (!cols.includes('photo_url')) {
      db.exec('ALTER TABLE staff_user ADD COLUMN photo_url TEXT;');
    }
    if (!cols.includes('telegram_username')) {
      db.exec('ALTER TABLE staff_user ADD COLUMN telegram_username TEXT;');
    }
    if (!cols.includes('telegram_phone')) {
      db.exec('ALTER TABLE staff_user ADD COLUMN telegram_phone TEXT;');
    }
    if (!cols.includes('bot_started_at')) {
      db.exec('ALTER TABLE staff_user ADD COLUMN bot_started_at TEXT;');
    }
    if (!cols.includes('bot_status')) {
      db.exec("ALTER TABLE staff_user ADD COLUMN bot_status TEXT DEFAULT 'not_started';");
    }
    if (!cols.includes('last_active_at')) {
      db.exec('ALTER TABLE staff_user ADD COLUMN last_active_at TEXT;');
    }
    if (!cols.includes('last_notification_at')) {
      db.exec('ALTER TABLE staff_user ADD COLUMN last_notification_at TEXT;');
    }

    db.exec("UPDATE staff_user SET bot_status = 'active', bot_started_at = COALESCE(bot_started_at, datetime('now')) WHERE id = 'superadmin' AND telegram_user_id IS NOT NULL;");
  } catch (e) {}

  // Migration: ensure staff_notification_log exists
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS staff_notification_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        staff_id TEXT NOT NULL,
        telegram_user_id TEXT,
        notification_type TEXT NOT NULL,
        title TEXT,
        message TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'sent',
        error_message TEXT,
        sent_at TEXT NOT NULL,
        FOREIGN KEY (staff_id) REFERENCES staff_user(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_staff_notif_staff ON staff_notification_log(staff_id, sent_at);
      CREATE INDEX IF NOT EXISTS idx_staff_notif_sent ON staff_notification_log(sent_at);
    `);
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
    if (!cols.includes('photo_url')) {
      db.exec('ALTER TABLE event ADD COLUMN photo_url TEXT;');
    }
    if (!cols.includes('image_url')) {
      db.exec('ALTER TABLE event ADD COLUMN image_url TEXT;');
    }
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

    const linkedStudents = db.prepare(`SELECT id, first_name, last_name, phone, telegram_user_id, updated_at FROM student WHERE telegram_user_id IS NOT NULL`).all();
    const insertBotUser = db.prepare(`
      INSERT OR IGNORE INTO telegram_bot_user (telegram_user_id, first_name, last_name, phone, student_id, started_at, last_seen_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const s of linkedStudents) {
      insertBotUser.run(String(s.telegram_user_id), s.first_name, s.last_name, s.phone, s.id, s.updated_at || new Date().toISOString(), s.updated_at || new Date().toISOString());
    }
  } catch (e) {}

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

// Avtomatik ravishda sxema va migratsiyalarni ishga tushirish
try {
  initSchema();
} catch (e) {
  console.error('[DB] initSchema xatolik:', e.message);
}

module.exports = {
  db,
  isPostgres,
  initSchema
};
