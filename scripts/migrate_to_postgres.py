import sqlite3
import psycopg2
import sys

sys.stdout.reconfigure(encoding='utf-8')

SQLITE_PATH = 'data/akhu_talabalar_prod_backup.db'
PG_HOST = '192.168.1.2'
PG_PORT = 5432
PG_DB = 'akhu_rating'
PG_USER = 'akhu_admin'
PG_PASS = 'AkhuAdmin2026!'

print("Connecting to SQLite and PostgreSQL...")
s_conn = sqlite3.connect(SQLITE_PATH)
s_conn.row_factory = sqlite3.Row
s_cur = s_conn.cursor()

p_conn = psycopg2.connect(
    host=PG_HOST,
    port=PG_PORT,
    dbname=PG_DB,
    user=PG_USER,
    password=PG_PASS
)
p_cur = p_conn.cursor()

# 1. CREATE POSTGRESQL TABLES
DDL = """
-- 1. TALABALAR (student)
CREATE TABLE IF NOT EXISTS student (
    id TEXT PRIMARY KEY,
    external_id TEXT UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    group_code TEXT NOT NULL,
    program_code TEXT NOT NULL,
    level TEXT NOT NULL CHECK(level IN ('bak', 'mag')),
    course INTEGER NOT NULL CHECK(course IN (1, 2, 3, 4)),
    gender TEXT NOT NULL CHECK(gender IN ('m', 'f')),
    email TEXT,
    phone TEXT,
    tutor_id TEXT,
    telegram_user_id TEXT UNIQUE,
    photo_url TEXT,
    photo_consent INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'left')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- 2. XODIMLAR (staff_user)
CREATE TABLE IF NOT EXISTS staff_user (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    sso_subject TEXT,
    roles TEXT NOT NULL,
    twofa_enabled INTEGER NOT NULL DEFAULT 0,
    active INTEGER NOT NULL DEFAULT 1,
    password_hash TEXT,
    telegram_user_id TEXT,
    phone TEXT,
    photo_url TEXT,
    telegram_username TEXT,
    telegram_phone TEXT,
    bot_started_at TEXT,
    bot_status TEXT DEFAULT 'not_started',
    last_active_at TEXT,
    last_notification_at TEXT,
    created_at TEXT NOT NULL
);

-- 3. TYUTOR QAMROVI (tutor_group)
CREATE TABLE IF NOT EXISTS tutor_group (
    tutor_id TEXT NOT NULL,
    group_code TEXT NOT NULL,
    PRIMARY KEY (tutor_id, group_code),
    FOREIGN KEY (tutor_id) REFERENCES staff_user(id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- 4. KATALOG SOHALARI (catalog_category)
CREATE TABLE IF NOT EXISTS catalog_category (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    approver_role TEXT NOT NULL,
    color TEXT NOT NULL,
    sort INTEGER NOT NULL DEFAULT 0
);

-- 5. KATALOG BANDLARI (catalog_item)
CREATE TABLE IF NOT EXISTS catalog_item (
    id TEXT NOT NULL,
    category_id TEXT NOT NULL,
    name TEXT NOT NULL,
    base_points INTEGER,
    is_scale INTEGER NOT NULL DEFAULT 0,
    is_auto INTEGER NOT NULL DEFAULT 0,
    approver_role TEXT,
    evidence_hint TEXT,
    limit_rule TEXT,
    version_from INTEGER NOT NULL DEFAULT 1,
    version_to INTEGER,
    archived INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (id, version_from),
    FOREIGN KEY (category_id) REFERENCES catalog_category(id)
);

-- 6. MUSOBAQA SHKALASI (scale_matrix)
CREATE TABLE IF NOT EXISTS scale_matrix (
    level TEXT NOT NULL,
    role TEXT NOT NULL,
    points INTEGER NOT NULL,
    PRIMARY KEY (level, role)
);

-- 7. BALL YOZUVI (point_entry)
CREATE TABLE IF NOT EXISTS point_entry (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    item_id TEXT NOT NULL,
    item_version INTEGER NOT NULL DEFAULT 1,
    category_id TEXT NOT NULL,
    base_points INTEGER,
    points INTEGER NOT NULL,
    scale_level TEXT,
    scale_role TEXT,
    note TEXT,
    event_date TEXT NOT NULL,
    evidence_file_id TEXT,
    evidence_url TEXT,
    source TEXT NOT NULL CHECK(source IN ('tutor', 'qr', 'import', 'system')),
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('pending', 'pending_pv', 'approved', 'rejected', 'cancelled', 'revoked')),
    approver_role TEXT NOT NULL,
    approved_by TEXT,
    approved_at TEXT,
    pv_by TEXT,
    pv_at TEXT,
    reject_reason_code TEXT,
    reject_note TEXT,
    event_id TEXT,
    import_batch_id TEXT,
    season_id TEXT NOT NULL,
    resubmitted_from_id TEXT,
    FOREIGN KEY (student_id) REFERENCES student(id)
);

-- 8. BALL YOZUVI TARIXI (point_entry_history)
CREATE TABLE IF NOT EXISTS point_entry_history (
    id SERIAL PRIMARY KEY,
    entry_id TEXT NOT NULL,
    from_status TEXT,
    to_status TEXT NOT NULL,
    by_user TEXT NOT NULL,
    at TEXT NOT NULL,
    reason TEXT,
    FOREIGN KEY (entry_id) REFERENCES point_entry(id) ON DELETE CASCADE
);

-- 9. E'TIROZ (appeal)
CREATE TABLE IF NOT EXISTS appeal (
    id TEXT PRIMARY KEY,
    entry_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'accepted', 'declined')),
    decided_by TEXT,
    decided_at TEXT,
    decision_note TEXT,
    FOREIGN KEY (entry_id) REFERENCES point_entry(id),
    FOREIGN KEY (student_id) REFERENCES student(id)
);

-- 10. TADBIR (event)
CREATE TABLE IF NOT EXISTS event (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    starts_at TEXT NOT NULL,
    ends_at TEXT NOT NULL,
    place TEXT NOT NULL,
    organizer_unit TEXT NOT NULL,
    category_id TEXT NOT NULL,
    level TEXT NOT NULL,
    points INTEGER NOT NULL,
    capacity INTEGER,
    requires_registration INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'published' CHECK(status IN ('draft', 'published', 'closed', 'cancelled')),
    qr_secret TEXT NOT NULL,
    qr_refresh_seconds INTEGER NOT NULL DEFAULT 5,
    attendance_open_minutes_before INTEGER NOT NULL DEFAULT 5,
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL
);

-- 11. TADBIRGA RO'YXAT (event_registration)
CREATE TABLE IF NOT EXISTS event_registration (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    registered_at TEXT NOT NULL,
    waitlist_pos INTEGER,
    no_show INTEGER NOT NULL DEFAULT 0,
    UNIQUE (event_id, student_id),
    FOREIGN KEY (event_id) REFERENCES event(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE
);

-- 12. CHECK-IN (checkin)
CREATE TABLE IF NOT EXISTS checkin (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    at TEXT NOT NULL,
    mode TEXT NOT NULL CHECK(mode IN ('event_qr', 'student_qr')),
    scanned_by TEXT,
    device_hint TEXT,
    entry_id TEXT,
    UNIQUE (event_id, student_id),
    FOREIGN KEY (event_id) REFERENCES event(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE,
    FOREIGN KEY (entry_id) REFERENCES point_entry(id) ON DELETE SET NULL
);

-- 13. HAFTANING YULDUZLARI (weekly_stars)
CREATE TABLE IF NOT EXISTS weekly_stars (
    week_start TEXT PRIMARY KEY,
    payload TEXT NOT NULL,
    published_at TEXT NOT NULL,
    telegram_message_id TEXT
);

-- 14. MAVSUM (season)
CREATE TABLE IF NOT EXISTS season (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    starts_on TEXT NOT NULL,
    ends_on TEXT NOT NULL,
    is_current INTEGER NOT NULL DEFAULT 0
);

-- 15. TIZIM SOZLAMALARI (setting)
CREATE TABLE IF NOT EXISTS setting (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_by TEXT,
    updated_at TEXT NOT NULL
);

-- 16. AUDIT JURNALI (audit_log)
CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    at TEXT NOT NULL,
    actor_id TEXT NOT NULL,
    actor_role TEXT,
    action TEXT NOT NULL,
    object_type TEXT NOT NULL,
    object_id TEXT,
    before TEXT,
    after TEXT,
    ip TEXT,
    user_agent TEXT
);

-- 17. IMPORT PAKETI (import_batch)
CREATE TABLE IF NOT EXISTS import_batch (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK(type IN ('students', 'gpa', 'attendance')),
    file_name TEXT NOT NULL,
    rows INTEGER NOT NULL DEFAULT 0,
    created INTEGER NOT NULL DEFAULT 0,
    updated INTEGER NOT NULL DEFAULT 0,
    errors TEXT,
    by_user TEXT NOT NULL,
    at TEXT NOT NULL
);

-- 18. BILDIRISHNOMALAR (notification)
CREATE TABLE IF NOT EXISTS notification (
    id SERIAL PRIMARY KEY,
    recipient_type TEXT NOT NULL CHECK(recipient_type IN ('student', 'staff')),
    recipient_id TEXT NOT NULL,
    template TEXT NOT NULL,
    payload TEXT NOT NULL,
    sent_at TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'sent', 'failed'))
);

-- 19. TALABA HISOBLANGAN BALLARI (student_score)
CREATE TABLE IF NOT EXISTS student_score (
    student_id TEXT PRIMARY KEY,
    total INTEGER NOT NULL DEFAULT 0,
    season INTEGER NOT NULL DEFAULT 0,
    week_cur INTEGER NOT NULL DEFAULT 0,
    week_prev INTEGER NOT NULL DEFAULT 0,
    by_category TEXT NOT NULL,
    events_count INTEGER NOT NULL DEFAULT 0,
    last_point_at TEXT,
    rank_cohort INTEGER NOT NULL DEFAULT 1,
    is_passive INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE
);

-- 20. TELEGRAM BOT FOYDALANUVCHILARI (telegram_bot_user)
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

-- 21. TELEGRAM BOT AMALLAR JURNALI (telegram_bot_log)
CREATE TABLE IF NOT EXISTS telegram_bot_log (
    id SERIAL PRIMARY KEY,
    telegram_user_id TEXT NOT NULL,
    student_id TEXT,
    action_type TEXT NOT NULL,
    details TEXT,
    created_at TEXT NOT NULL
);

-- 22. XODIM BILDIRISHNOMA TARIXI (staff_notification_log)
CREATE TABLE IF NOT EXISTS staff_notification_log (
    id SERIAL PRIMARY KEY,
    staff_id TEXT NOT NULL,
    telegram_user_id TEXT,
    notification_type TEXT NOT NULL,
    title TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'sent',
    error_message TEXT,
    sent_at TEXT NOT NULL,
    FOREIGN KEY (staff_id) REFERENCES staff_user(id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- INDEKSLAR
CREATE INDEX IF NOT EXISTS idx_point_entry_student_status ON point_entry(student_id, status);
CREATE INDEX IF NOT EXISTS idx_point_entry_approver_status ON point_entry(approver_role, status, created_at);
CREATE INDEX IF NOT EXISTS idx_point_entry_approved_at ON point_entry(approved_at);
CREATE INDEX IF NOT EXISTS idx_point_entry_student_item_date ON point_entry(student_id, item_id, event_date);
CREATE INDEX IF NOT EXISTS idx_bot_log_user ON telegram_bot_log(telegram_user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_bot_log_created ON telegram_bot_log(created_at);
CREATE INDEX IF NOT EXISTS idx_staff_notif_staff ON staff_notification_log(staff_id, sent_at);
CREATE INDEX IF NOT EXISTS idx_staff_notif_sent ON staff_notification_log(sent_at);
"""

print("Creating tables in PostgreSQL...")
p_cur.execute(DDL)
p_conn.commit()
print("PostgreSQL tables and indexes created successfully!")

# Tables in dependency order
TABLES_ORDER = [
    'season',
    'setting',
    'scale_matrix',
    'catalog_category',
    'catalog_item',
    'staff_user',
    'tutor_group',
    'staff_notification_log',
    'student',
    'student_score',
    'telegram_bot_user',
    'telegram_bot_log',
    'event',
    'event_registration',
    'point_entry',
    'point_entry_history',
    'checkin',
    'appeal',
    'weekly_stars',
    'import_batch',
    'notification',
    'audit_log'
]

# Truncate tables in reverse order to ensure clean fresh sync
print("\nTruncating PostgreSQL tables for clean sync...")
for tbl in reversed(TABLES_ORDER):
    p_cur.execute(f'TRUNCATE TABLE "{tbl}" CASCADE;')
p_conn.commit()
print("PostgreSQL tables truncated cleanly!")

# Serial sequence tables
SERIAL_TABLES = {
    'point_entry_history': 'point_entry_history_id_seq',
    'audit_log': 'audit_log_id_seq',
    'telegram_bot_log': 'telegram_bot_log_id_seq',
    'staff_notification_log': 'staff_notification_log_id_seq',
    'notification': 'notification_id_seq'
}

print("\n=== MIGRATING DATA TABLE BY TABLE ===")

for tbl in TABLES_ORDER:
    # 1. Get column names from SQLite
    s_cur.execute(f"PRAGMA table_info({tbl})")
    cols_info = s_cur.fetchall()
    if not cols_info:
        print(f"[-] Table {tbl} does not exist in SQLite, skipping.")
        continue
    
    col_names = [c[1] for c in cols_info]
    
    # 2. Fetch all rows from SQLite
    s_cur.execute(f"SELECT * FROM {tbl}")
    rows = s_cur.fetchall()
    
    # 3. Insert into PostgreSQL
    if rows:
        col_list = ', '.join([f'"{c}"' for c in col_names])
        placeholders = ', '.join(['%s'] * len(col_names))
        insert_sql = f'INSERT INTO "{tbl}" ({col_list}) VALUES ({placeholders}) ON CONFLICT DO NOTHING'
        
        row_tuples = [tuple(r) for r in rows]
        p_cur.executemany(insert_sql, row_tuples)
        p_conn.commit()
    
    # 4. Check counts
    p_cur.execute(f'SELECT COUNT(*) FROM "{tbl}"')
    pg_count = p_cur.fetchone()[0]
    
    print(f"[+] {tbl.ljust(25)} : SQLite = {len(rows):4d} | PostgreSQL = {pg_count:4d} {'[OK]' if len(rows) == pg_count else '[CHECK]'}")
    
    # 5. Fix sequence for serial tables
    if tbl in SERIAL_TABLES and rows:
        seq_name = SERIAL_TABLES[tbl]
        p_cur.execute(f'SELECT COALESCE(MAX(id), 1) FROM "{tbl}"')
        max_id = p_cur.fetchone()[0]
        p_cur.execute(f"SELECT setval('{seq_name}', %s)", (max_id,))
        p_conn.commit()

print("\n=== VERIFYING INTEGRITY IN POSTGRESQL ===")
# Verify student count
p_cur.execute("SELECT COUNT(*) FROM student")
students_count = p_cur.fetchone()[0]
print(f"Total students in Postgres: {students_count} (Must be 201)")

# Verify sample student
p_cur.execute("SELECT id, first_name, last_name, group_code, photo_url FROM student LIMIT 3")
sample_students = p_cur.fetchall()
print("Sample students in Postgres:")
for s in sample_students:
    print("  ", s)

# Verify staff users and passwords
p_cur.execute("SELECT id, full_name, email, roles, length(password_hash) as pass_len FROM staff_user")
sample_staff = p_cur.fetchall()
print("Staff users in Postgres:")
for st in sample_staff:
    print("  ", st)

p_conn.close()
s_conn.close()
print("\nMigration completed successfully!")
