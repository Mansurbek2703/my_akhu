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
    } catch (e) {}

    // Migration: ensure photo_url exists on student
    try {
      const cols = db.pragma('table_info(student)').map(c => c.name);
      if (!cols.includes('photo_url')) {
        db.exec('ALTER TABLE student ADD COLUMN photo_url TEXT;');
      }
    } catch (e) {}
  }

module.exports = {
  db,
  initSchema
};
