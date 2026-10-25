-- ====================================================================
-- AKHU TALABALAR TIZIMI - 1-BOSQICH MA'LUMOTLAR MODELI (PostgreSQL / SQLite mos)
-- ====================================================================

-- 1. TALABALAR JADVALI (student)
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

-- 2. XODIMLAR JADVALI (staff_user)
CREATE TABLE IF NOT EXISTS staff_user (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    sso_subject TEXT,
    roles TEXT NOT NULL, -- JSON array: ['tutor', 'dep_yb', 'dep_mb', 'dep_ob', 'dep_ib', 'dep_sb', 'dep_pb', 'prorektor', 'observer', 'superadmin']
    twofa_enabled INTEGER NOT NULL DEFAULT 0,
    active INTEGER NOT NULL DEFAULT 1,
    password_hash TEXT,
    passport_id TEXT,
    telegram_user_id TEXT,
    phone TEXT,
    photo_url TEXT,
    permissions TEXT DEFAULT '[]',
    created_at TEXT NOT NULL
);

-- 3. TYUTOR QAMROVI (tutor_group)
CREATE TABLE IF NOT EXISTS tutor_group (
    tutor_id TEXT NOT NULL,
    group_code TEXT NOT NULL,
    PRIMARY KEY (tutor_id, group_code),
    FOREIGN KEY (tutor_id) REFERENCES staff_user(id) ON DELETE CASCADE
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
    limit_rule TEXT, -- JSON: { per_month: 2, per_semester: 1, once_per_level: true, etc. }
    version_from INTEGER NOT NULL DEFAULT 1,
    version_to INTEGER,
    archived INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (id, version_from),
    FOREIGN KEY (category_id) REFERENCES catalog_category(id)
);

-- 6. MUSOBAQA SHKALASI (scale_matrix)
CREATE TABLE IF NOT EXISTS scale_matrix (
    level TEXT NOT NULL, -- universitet, viloyat, respublika, xalqaro
    role TEXT NOT NULL,  -- ishtirok, sovrindor, golib
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

-- Indekslar
CREATE INDEX IF NOT EXISTS idx_point_entry_student_status ON point_entry(student_id, status);
CREATE INDEX IF NOT EXISTS idx_point_entry_approver_status ON point_entry(approver_role, status, created_at);
CREATE INDEX IF NOT EXISTS idx_point_entry_approved_at ON point_entry(approved_at);
CREATE INDEX IF NOT EXISTS idx_point_entry_student_item_date ON point_entry(student_id, item_id, event_date);

-- 8. BALL YOZUVI TARIXI (point_entry_history)
CREATE TABLE IF NOT EXISTS point_entry_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    photo_url TEXT,
    image_url TEXT,
    category_id TEXT NOT NULL,
    level TEXT NOT NULL, -- klub (3), universitet (5), viloyat (8), respublika (15), xalqaro (25)
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
    week_start TEXT PRIMARY KEY, -- YYYY-MM-DD (dushanba)
    payload TEXT NOT NULL, -- JSON: { hero, girl, boy, courses, group, club, categories }
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
    value TEXT NOT NULL, -- JSON qiymat
    updated_by TEXT,
    updated_at TEXT NOT NULL
);

-- 16. AUDIT JURNALI (audit_log) - O'zgarmas, faqat INSERT
CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipient_type TEXT NOT NULL CHECK(recipient_type IN ('student', 'staff')),
    recipient_id TEXT NOT NULL,
    template TEXT NOT NULL,
    payload TEXT NOT NULL,
    sent_at TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'sent', 'failed'))
);

-- 19. TALABA HISOBLANGAN BALLARI KESHI (student_score)
CREATE TABLE IF NOT EXISTS student_score (
    student_id TEXT PRIMARY KEY,
    total INTEGER NOT NULL DEFAULT 0,
    season INTEGER NOT NULL DEFAULT 0,
    week_cur INTEGER NOT NULL DEFAULT 0,
    week_prev INTEGER NOT NULL DEFAULT 0,
    by_category TEXT NOT NULL, -- JSON: { "1": 15, "2": 10, ... }
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
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_user_id TEXT NOT NULL,
    student_id TEXT,
    action_type TEXT NOT NULL, -- 'start', 'share_contact', 'miniapp_open', 'qr_checkin', 'callback', etc.
    details TEXT,
    created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_bot_log_user ON telegram_bot_log(telegram_user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_bot_log_created ON telegram_bot_log(created_at);

-- 22. KAMPUSGA KIRISH-CHIQISH VA DAVOMAT (campus_attendance)
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

-- 23. TURNIKET / FACE ID EVENT JURNALI (access_control_log)
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


