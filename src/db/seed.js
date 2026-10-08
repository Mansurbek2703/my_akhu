const { db, initSchema } = require('./database');
const bcrypt = require('bcryptjs');

function seedDatabase() {
  initSchema();

  const now = new Date().toISOString();
  const currentSeasonId = '2026-2027';

  // 1. MAVSUM
  const insertSeason = db.prepare(`
    INSERT OR REPLACE INTO season (id, name, starts_on, ends_on, is_current)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertSeason.run(currentSeasonId, '2026/2027 o\'quv yili', '2026-09-01', '2027-06-30', 1);

  // 2. SOZLAMALAR (settings)
  const insertSetting = db.prepare(`
    INSERT OR REPLACE INTO setting (key, value, updated_by, updated_at)
    VALUES (?, ?, ?, ?)
  `);
  const defaultSettings = [
    { key: 'pogona_margin_pct', value: JSON.stringify(20) }, // R-02 ±20%
    { key: 'evidence_threshold', value: JSON.stringify(10) }, // R-04 > 10 ball dalil majburiy
    { key: 'prorektor_threshold', value: JSON.stringify(25) }, // R-05 >= 25 yoki < 0
    { key: 'daily_tutor_entry_limit', value: JSON.stringify(60) }, // R-06 kunlik 60
    { key: 'monthly_student_manual_limit', value: JSON.stringify(60) }, // R-06 oylik 60 ball
    { key: 'late_approval_days', value: JSON.stringify(3) }, // R-07 3 ish kuni
    { key: 'appeal_window_days', value: JSON.stringify(3) }, // R-09 3 kun
    { key: 'resubmit_window_days', value: JSON.stringify(30) }, // R-08 30 kun
    { key: 'passive_days_threshold', value: JSON.stringify(30) }, // 30 kun ballsiz
    { key: 'concentration_pct_threshold', value: JSON.stringify(40) }, // 40% top 5 ga
    { key: 'single_source_pct_threshold', value: JSON.stringify(70) }, // 70% bitta banddan
    { key: 'event_window_before_min', value: JSON.stringify(15) }, // Q-03
    { key: 'event_window_after_min', value: JSON.stringify(30) },  // Q-03
    { key: 'welcome_points', value: JSON.stringify(5) }, // M-01 +5 kirish balli
    { key: 'tv_refresh_sec', value: JSON.stringify(9) },
    { key: 'qr_refresh_sec', value: JSON.stringify(60) },
    { key: 'qr_tolerance_sec', value: JSON.stringify(90) }
  ];
  for (const s of defaultSettings) {
    insertSetting.run(s.key, s.value, 'system', now);
  }

  // 3. SOHALAR (catalog_category)
  const insertCategory = db.prepare(`
    INSERT OR REPLACE INTO catalog_category (id, name, approver_role, color, sort)
    VALUES (?, ?, ?, ?, ?)
  `);
  const categories = [
    { id: '1', name: 'Ijtimoiy faollik', approver_role: 'dep_yb', color: '#3B82F6', sort: 1 },
    { id: '2', name: 'Ma\'naviy-ma\'rifiy', approver_role: 'dep_mb', color: '#8B5CF6', sort: 2 },
    { id: '3', name: 'Akademik', approver_role: 'dep_ob', color: '#10B981', sort: 3 },
    { id: '4', name: 'Ilmiy va innovatsion', approver_role: 'dep_ib', color: '#F59E0B', sort: 4 },
    { id: '5', name: 'Sport', approver_role: 'dep_yb', color: '#EF4444', sort: 5 },
    { id: '6', name: 'Madaniyat va san\'at', approver_role: 'dep_mb', color: '#EC4899', sort: 6 },
    { id: '7', name: 'PR va media', approver_role: 'dep_pb', color: '#06B6D4', sort: 7 },
    { id: '8', name: 'Liderlik va jamoat tashkilotlari', approver_role: 'dep_yb', color: '#6366F1', sort: 8 },
    { id: '9', name: 'Ayirmalar', approver_role: 'prorektor', color: '#64748B', sort: 9 }
  ];
  for (const c of categories) {
    insertCategory.run(c.id, c.name, c.approver_role, c.color, c.sort);
  }

  // 4. SHKALA MATRITSASI (scale_matrix) - 12 qator
  const insertScale = db.prepare(`
    INSERT OR REPLACE INTO scale_matrix (level, role, points)
    VALUES (?, ?, ?)
  `);
  const scales = [
    { level: 'universitet', role: 'ishtirok', points: 5 },
    { level: 'universitet', role: 'sovrindor', points: 10 },
    { level: 'universitet', role: 'golib', points: 15 },
    { level: 'viloyat', role: 'ishtirok', points: 8 },
    { level: 'viloyat', role: 'sovrindor', points: 15 },
    { level: 'viloyat', role: 'golib', points: 20 },
    { level: 'respublika', role: 'ishtirok', points: 15 },
    { level: 'respublika', role: 'sovrindor', points: 30 },
    { level: 'respublika', role: 'golib', points: 40 },
    { level: 'xalqaro', role: 'ishtirok', points: 25 },
    { level: 'xalqaro', role: 'sovrindor', points: 50 },
    { level: 'xalqaro', role: 'golib', points: 60 }
  ];
  for (const sc of scales) {
    insertScale.run(sc.level, sc.role, sc.points);
  }

  // 5. KATALOG BANDLARI (catalog_item) - v1.0
  const insertItem = db.prepare(`
    INSERT OR REPLACE INTO catalog_item (
      id, category_id, name, base_points, is_scale, is_auto, approver_role, evidence_hint, limit_rule, version_from, version_to, archived
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const catalogItems = [
    // 0 - Tizim kiritishi
    { id: 'i0', category_id: '1', name: 'Bot orqali tizimga birinchi kirish bonusi', base_points: 5, is_scale: 0, is_auto: 1, approver_role: null, evidence_hint: 'Avtomatik', limit_rule: JSON.stringify({ once_lifetime: true }) },

    // 1 - Ijtimoiy faollik (dep_yb)
    { id: 'i1', category_id: '1', name: 'Universitet tadbirida ishtirok (QR)', base_points: 5, is_scale: 0, is_auto: 1, approver_role: 'dep_yb', evidence_hint: null, limit_rule: null },
    { id: 'i2', category_id: '1', name: 'Klub / guruh darajasidagi tadbirda ishtirok (QR)', base_points: 3, is_scale: 0, is_auto: 1, approver_role: 'dep_yb', evidence_hint: null, limit_rule: null },
    { id: 'i3', category_id: '1', name: 'Tadbir tashkiliy guruhida (kamida 3 soat ish)', base_points: 10, is_scale: 0, is_auto: 0, approver_role: 'dep_yb', evidence_hint: 'Tashkilotchi ro\'yxati', limit_rule: null },
    { id: 'i4', category_id: '1', name: 'Volontyorlik — yarim kun (4 soatgacha)', base_points: 8, is_scale: 0, is_auto: 0, approver_role: 'dep_yb', evidence_hint: 'Tashkilot tasdig\'i, foto', limit_rule: null },
    { id: 'i5', category_id: '1', name: 'Volontyorlik — to\'liq kun', base_points: 15, is_scale: 0, is_auto: 0, approver_role: 'dep_yb', evidence_hint: 'Tashkilot tasdig\'i, foto', limit_rule: null },
    { id: 'i6', category_id: '1', name: 'Universitet tadbirini o\'zi tashkil etdi — 30+ ishtirokchi', base_points: 20, is_scale: 0, is_auto: 0, approver_role: 'dep_yb', evidence_hint: 'Reja, hisobot, foto', limit_rule: null },
    { id: 'i7', category_id: '1', name: 'Universitet tadbirini o\'zi tashkil etdi — 100+ ishtirokchi', base_points: 30, is_scale: 0, is_auto: 0, approver_role: 'dep_yb', evidence_hint: 'Reja, hisobot, foto', limit_rule: null },
    { id: 'i8', category_id: '1', name: 'Qabul kampaniyasi / ochiq eshiklar kuni volontyori (kun)', base_points: 10, is_scale: 0, is_auto: 0, approver_role: 'dep_yb', evidence_hint: 'Qabul bo\'limi ro\'yxati', limit_rule: null },
    { id: 'i9', category_id: '1', name: 'Qon donorligi', base_points: 10, is_scale: 0, is_auto: 0, approver_role: 'dep_yb', evidence_hint: 'Tibbiy ma\'lumotnoma', limit_rule: null },

    // 2 - Ma'naviy-ma'rifiy (dep_mb)
    { id: 'm1', category_id: '2', name: 'Ma\'naviyat soati, ma\'rifiy uchrashuv ishtiroki (QR)', base_points: 3, is_scale: 0, is_auto: 1, approver_role: 'dep_mb', evidence_hint: null, limit_rule: null },
    { id: 'm2', category_id: '2', name: 'Ma\'rifiy tadbirda chiqish: ma\'ruza, taqdimot, she\'r, sahna', base_points: 10, is_scale: 0, is_auto: 0, approver_role: 'dep_mb', evidence_hint: 'Dastur, foto', limit_rule: null },
    { id: 'm3', category_id: '2', name: 'Ma\'naviy-ma\'rifiy tadbir tashkiloti (universitet)', base_points: 15, is_scale: 0, is_auto: 0, approver_role: 'dep_mb', evidence_hint: 'Reja, hisobot', limit_rule: null },
    { id: 'm4', category_id: '2', name: 'Mahalla, hokimlik, Yoshlar agentligi tadbirida ishtirok', base_points: 10, is_scale: 0, is_auto: 0, approver_role: 'dep_mb', evidence_hint: 'Rasmiy tasdiq', limit_rule: null },
    { id: 'm5', category_id: '2', name: 'Kitobxonlik: kitob taqdimoti / insho tanlovi ishtiroki', base_points: 5, is_scale: 0, is_auto: 0, approver_role: 'dep_mb', evidence_hint: 'Ish nusxasi', limit_rule: null },
    { id: 'm6', category_id: '2', name: '"Yosh kitobxon" va shu kabi tanlovlar', base_points: null, is_scale: 1, is_auto: 0, approver_role: 'dep_mb', evidence_hint: 'Diplom / bayonnoma', limit_rule: null },

    // 3 - Akademik (dep_ob)
    { id: 'a1', category_id: '3', name: 'Semestr GPA TOP 20 (yo\'nalishda)', base_points: null, is_scale: 0, is_auto: 1, approver_role: 'dep_ob', evidence_hint: 'Registrator GPA eksporti', limit_rule: JSON.stringify({ per_semester: 1 }) },
    { id: 'a2', category_id: '3', name: 'Semestr davomida 100% davomat', base_points: 10, is_scale: 0, is_auto: 1, approver_role: 'dep_ob', evidence_hint: 'Registrator davomat eksporti', limit_rule: JSON.stringify({ per_semester: 1 }) },
    { id: 'a3', category_id: '3', name: 'Fan olimpiadasi', base_points: null, is_scale: 1, is_auto: 0, approver_role: 'dep_ob', evidence_hint: 'Diplom / bayonnoma', limit_rule: null },
    { id: 'a4', category_id: '3', name: 'Til sertifikati — B2 / IELTS 6.5 (yangi daraja)', base_points: 15, is_scale: 0, is_auto: 0, approver_role: 'dep_ob', evidence_hint: 'Sertifikat nusxasi', limit_rule: JSON.stringify({ once_per_level: true }) },
    { id: 'a5', category_id: '3', name: 'Til sertifikati — C1 / IELTS 7.5+ (yangi daraja)', base_points: 25, is_scale: 0, is_auto: 0, approver_role: 'dep_ob', evidence_hint: 'Sertifikat nusxasi', limit_rule: JSON.stringify({ once_per_level: true }) },
    { id: 'a6', category_id: '3', name: 'Boshqa til (nemis, xitoy, koreys, rus) — B2/C1', base_points: 15, is_scale: 0, is_auto: 0, approver_role: 'dep_ob', evidence_hint: 'Sertifikat', limit_rule: null },
    { id: 'a7', category_id: '3', name: 'Onlayn kurs sertifikati (yo\'nalishga oid, ≥ 20 soat)', base_points: 5, is_scale: 0, is_auto: 0, approver_role: 'dep_ob', evidence_hint: 'Sertifikat havolasi', limit_rule: null },
    { id: 'a8', category_id: '3', name: 'Professional sertifikat (Cisco, Google, AWS va h.k.)', base_points: 15, is_scale: 0, is_auto: 0, approver_role: 'dep_ob', evidence_hint: 'Sertifikat', limit_rule: null },
    { id: 'a9', category_id: '3', name: 'Peer tutoring — tengdoshlarga o\'qitish (semestrda ≥ 8 soat)', base_points: 10, is_scale: 0, is_auto: 0, approver_role: 'dep_ob', evidence_hint: 'Kafedra tasdig\'i', limit_rule: JSON.stringify({ per_semester: 1 }) },

    // 4 - Ilmiy va innovatsion (dep_ib va dep_sb)
    { id: 's1', category_id: '4', name: 'Ilmiy to\'garakda faol a\'zolik (semestr)', base_points: 5, is_scale: 0, is_auto: 0, approver_role: 'dep_ib', evidence_hint: 'Rahbar tasdig\'i', limit_rule: JSON.stringify({ per_semester: 1 }) },
    { id: 's2', category_id: '4', name: 'Konferensiya ma\'ruzasi — universitet', base_points: 5, is_scale: 0, is_auto: 0, approver_role: 'dep_ib', evidence_hint: 'Dastur, sertifikat', limit_rule: null },
    { id: 's3', category_id: '4', name: 'Konferensiya ma\'ruzasi — respublika', base_points: 10, is_scale: 0, is_auto: 0, approver_role: 'dep_ib', evidence_hint: 'Dastur, sertifikat', limit_rule: null },
    { id: 's4', category_id: '4', name: 'Konferensiya ma\'ruzasi — xalqaro', base_points: 15, is_scale: 0, is_auto: 0, approver_role: 'dep_ib', evidence_hint: 'Dastur, sertifikat', limit_rule: null },
    { id: 's5', category_id: '4', name: 'Maqola — OAK jurnali (hammualliflar teng bo\'linadi)', base_points: 20, is_scale: 0, is_auto: 0, approver_role: 'dep_ib', evidence_hint: 'Nashr havolasi / PDF', limit_rule: null },
    { id: 's6', category_id: '4', name: 'Maqola — Scopus / WoS (hammualliflar teng bo\'linadi)', base_points: 40, is_scale: 0, is_auto: 0, approver_role: 'dep_ib', evidence_hint: 'DOI havolasi', limit_rule: null },
    { id: 's7', category_id: '4', name: 'Startap loyihasi ro\'yxatdan o\'tdi (jamoa, g\'oya)', base_points: 5, is_scale: 0, is_auto: 0, approver_role: 'dep_sb', evidence_hint: 'Loyiha pasporti', limit_rule: null },
    { id: 's8', category_id: '4', name: 'Startap — MVP ko\'rsatildi', base_points: 15, is_scale: 0, is_auto: 0, approver_role: 'dep_sb', evidence_hint: 'Demo havola, video', limit_rule: null },
    { id: 's9', category_id: '4', name: 'Startap — tayyor mahsulot / birinchi mijoz', base_points: 30, is_scale: 0, is_auto: 0, approver_role: 'dep_sb', evidence_hint: 'Shartnoma / havola', limit_rule: null },
    { id: 's10', category_id: '4', name: 'Hackathon, startap tanlovi, innovatsiya ko\'rgazmasi', base_points: null, is_scale: 1, is_auto: 0, approver_role: 'dep_sb', evidence_hint: 'Diplom / sertifikat', limit_rule: null },
    { id: 's11', category_id: '4', name: 'Talabalar granti yutildi', base_points: 30, is_scale: 0, is_auto: 0, approver_role: 'dep_ib', evidence_hint: 'Buyruq / xat', limit_rule: null },
    { id: 's12', category_id: '4', name: 'Patent, dasturiy mahsulot guvohnomasi', base_points: 30, is_scale: 0, is_auto: 0, approver_role: 'dep_ib', evidence_hint: 'Guvohnoma nusxasi', limit_rule: null },

    // 5 - Sport (dep_yb)
    { id: 'p1', category_id: '5', name: 'Universitet ichki musobaqasi ishtiroki (QR)', base_points: 5, is_scale: 0, is_auto: 1, approver_role: 'dep_yb', evidence_hint: null, limit_rule: null },
    { id: 'p2', category_id: '5', name: 'Terma jamoa a\'zosi — semestr (mashg\'ulotlarning ≥ 70%)', base_points: 10, is_scale: 0, is_auto: 0, approver_role: 'dep_yb', evidence_hint: 'Murabbiy tasdig\'i', limit_rule: JSON.stringify({ per_semester: 1 }) },
    { id: 'p3', category_id: '5', name: '"Alpomish va Barchinoy" me\'yorlarini topshirdi', base_points: 10, is_scale: 0, is_auto: 0, approver_role: 'dep_yb', evidence_hint: 'Bayonnoma', limit_rule: null },
    { id: 'p4', category_id: '5', name: 'Viloyat, respublika, universiada, xalqaro musobaqalar', base_points: null, is_scale: 1, is_auto: 0, approver_role: 'dep_yb', evidence_hint: 'Diplom / bayonnoma', limit_rule: null },

    // 6 - Madaniyat va san'at (dep_mb)
    { id: 'c1', category_id: '6', name: 'Badiiy havaskorlik tadbirida sahnada chiqish', base_points: 10, is_scale: 0, is_auto: 0, approver_role: 'dep_mb', evidence_hint: 'Dastur, foto', limit_rule: null },
    { id: 'c2', category_id: '6', name: 'Ijodiy to\'garak (teatr, vokal, raqs) faol a\'zolik (semestr)', base_points: 5, is_scale: 0, is_auto: 0, approver_role: 'dep_mb', evidence_hint: 'Rahbar tasdig\'i', limit_rule: JSON.stringify({ per_semester: 1 }) },
    { id: 'c3', category_id: '6', name: 'Universitet jamoasi tarkibida — Zakovat, debat, KVN (semestr)', base_points: 10, is_scale: 0, is_auto: 0, approver_role: 'dep_mb', evidence_hint: 'Jamoa ro\'yxati', limit_rule: JSON.stringify({ per_semester: 1 }) },
    { id: 'c4', category_id: '6', name: 'Zakovat, "Talabalar bahori", debat, ko\'rik-tanlovlar', base_points: null, is_scale: 1, is_auto: 0, approver_role: 'dep_mb', evidence_hint: 'Diplom / bayonnoma', limit_rule: null },

    // 7 - PR va media (dep_pb)
    { id: 'r1', category_id: '7', name: 'Universitet haqida post/reel — rasmiy sahifada yoki ≥ 1000 ko\'rish', base_points: 5, is_scale: 0, is_auto: 0, approver_role: 'dep_pb', evidence_hint: 'Havola', limit_rule: JSON.stringify({ per_month: 2 }) },
    { id: 'r2', category_id: '7', name: 'Tadbirni yoritish: foto / video rasmiy sahifaga topshirildi', base_points: 8, is_scale: 0, is_auto: 0, approver_role: 'dep_pb', evidence_hint: 'Havola / fayl', limit_rule: null },
    { id: 'r3', category_id: '7', name: 'OAV, TV, radio, yirik blogda universitet haqida chiqish', base_points: 15, is_scale: 0, is_auto: 0, approver_role: 'dep_pb', evidence_hint: 'Havola / efir yozuvi', limit_rule: null },
    { id: 'r4', category_id: '7', name: 'Universitet media jamoasida doimiy ish (semestr)', base_points: 15, is_scale: 0, is_auto: 0, approver_role: 'dep_pb', evidence_hint: 'Matbuot xizmati tasdig\'i', limit_rule: JSON.stringify({ per_semester: 1 }) },

    // 8 - Liderlik va jamoat tashkilotlari (dep_yb)
    { id: 'l1', category_id: '8', name: 'Klub faol a\'zosi (uchrashuvlarning ≥ 60%) — semestr', base_points: 10, is_scale: 0, is_auto: 0, approver_role: 'dep_yb', evidence_hint: 'Klub rahbari ro\'yxati', limit_rule: JSON.stringify({ per_semester: 1 }) },
    { id: 'l2', category_id: '8', name: 'Klub rahbari (semestrda ≥ 6 tadbir)', base_points: 15, is_scale: 0, is_auto: 0, approver_role: 'dep_yb', evidence_hint: 'Tadbirlar ro\'yxati', limit_rule: JSON.stringify({ per_semester: 1 }) },
    { id: 'l3', category_id: '8', name: 'Guruh sardori — semestr', base_points: 10, is_scale: 0, is_auto: 0, approver_role: 'dep_yb', evidence_hint: 'Tyutor bahosi', limit_rule: JSON.stringify({ per_semester: 1 }) },
    { id: 'l4', category_id: '8', name: 'Yotoqxona qavat sardori — semestr', base_points: 10, is_scale: 0, is_auto: 0, approver_role: 'dep_yb', evidence_hint: 'Yotoqxona mudiri tasdig\'i', limit_rule: JSON.stringify({ per_semester: 1 }) },
    { id: 'l5', category_id: '8', name: 'Talabalar kengashi a\'zosi (KPI bajarilganda) — semestr', base_points: 15, is_scale: 0, is_auto: 0, approver_role: 'dep_yb', evidence_hint: 'Kengash hisoboti', limit_rule: JSON.stringify({ per_semester: 1 }) },
    { id: 'l6', category_id: '8', name: 'Talabalar kengashi vaziri — semestr', base_points: 20, is_scale: 0, is_auto: 0, approver_role: 'dep_yb', evidence_hint: 'Kengash hisoboti', limit_rule: JSON.stringify({ per_semester: 1 }) },
    { id: 'l7', category_id: '8', name: 'Talabalar kengashi prezidenti — semestr', base_points: 30, is_scale: 0, is_auto: 0, approver_role: 'dep_yb', evidence_hint: 'Kengash hisoboti', limit_rule: JSON.stringify({ per_semester: 1 }) },

    // 9 - Ayirmalar (prorektor)
    { id: 'j1', category_id: '9', name: 'Qoidabuzarlik — buyruq / intizom komissiyasi bayonnomasi bilan', base_points: -30, is_scale: 0, is_auto: 0, approver_role: 'prorektor', evidence_hint: 'Rektor buyrug\'i (majburiy)', limit_rule: null },
    { id: 'j2', category_id: '9', name: 'Ro\'yxatdan o\'tib tadbirga kelmaslik (oyda 2-martadan boshlab)', base_points: -3, is_scale: 0, is_auto: 1, approver_role: 'prorektor', evidence_hint: 'Tizim audit xulosasi', limit_rule: null },
    { id: 'j3', category_id: '9', name: 'Soxta dalil, QR ni boshqaga berish', base_points: -10, is_scale: 0, is_auto: 0, approver_role: 'prorektor', evidence_hint: 'Tekshiruv dalolatnomasi', limit_rule: null }
  ];

  for (const item of catalogItems) {
    insertItem.run(
      item.id,
      item.category_id,
      item.name,
      item.base_points,
      item.is_scale,
      item.is_auto,
      item.approver_role,
      item.evidence_hint,
      item.limit_rule,
      1,
      null,
      0
    );
  }

  // 6. XODIMLAR (staff_user) & ROLLAR
  const passHash = bcrypt.hashSync('akhu2026!', 8);
  const insertStaff = db.prepare(`
    INSERT OR REPLACE INTO staff_user (id, full_name, email, sso_subject, roles, twofa_enabled, active, password_hash, telegram_user_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const staffList = [
    { id: 'tutor_1', full_name: 'Jasur Mahmudov (Tyutor 1)', email: 'tutor1@akhu.uz', roles: ['tutor'], groups: ['210-21', '210-22', '210-23', 'ADMIN-01'] },
    { id: 'tutor_2', full_name: 'Aziza Qodirova (Tyutor 2)', email: 'tutor2@akhu.uz', roles: ['tutor'], groups: ['211-21', '211-22'] },
    { id: 'tutor_3', full_name: 'Bobur Alimov (Tyutor 3)', email: 'tutor3@akhu.uz', roles: ['tutor'], groups: ['310-21', '310-22', 'M-101'] },
    { id: 'dep_yb', full_name: 'Sardorbek Ergashev (Yoshlar bo\'limi)', email: 'yoshlar@akhu.uz', roles: ['dep_yb'] },
    { id: 'dep_mb', full_name: 'Nodira Salimova (Ma\'naviyat bo\'limi)', email: 'manaviyat@akhu.uz', roles: ['dep_mb'] },
    { id: 'dep_ob', full_name: 'Farrux Tursunov (O\'quv bo\'limi / Registrator)', email: 'oquv@akhu.uz', roles: ['dep_ob'] },
    { id: 'dep_ib', full_name: 'Dr. Rustam Karimov (Ilmiy bo\'lim)', email: 'ilmiy@akhu.uz', roles: ['dep_ib'] },
    { id: 'dep_sb', full_name: 'Kamola Oripova (Sanoat bilan hamkorlik bo\'limi)', email: 'sanoat@akhu.uz', roles: ['dep_sb'] },
    { id: 'dep_pb', full_name: 'Dilshod Rahmatov (Matbuot xizmati / PR)', email: 'pr@akhu.uz', roles: ['dep_pb'] },
    { id: 'prorektor', full_name: 'Prof. Alisher Vohidov (Yoshlar bo\'yicha prorektor)', email: 'prorektor@akhu.uz', roles: ['prorektor'], twofa: 1 },
    { id: 'observer', full_name: 'Universitet Kuzatuv Kengashi / Rektorat', email: 'observer@akhu.uz', roles: ['observer'] },
    { id: 'superadmin', full_name: 'Mansurbek Qazaqov (Superadmin)', email: 'superadmin@akhu.uz', roles: ['superadmin'], twofa: 1, tg: '1202082857' }
  ];

  const insertTutorGroup = db.prepare(`
    INSERT OR REPLACE INTO tutor_group (tutor_id, group_code) VALUES (?, ?)
  `);

  for (const s of staffList) {
    insertStaff.run(
      s.id,
      s.full_name,
      s.email,
      `sso_${s.id}`,
      JSON.stringify(s.roles),
      s.twofa ? 1 : 0,
      1,
      passHash,
      s.tg || null,
      now
    );
    if (s.groups) {
      for (const g of s.groups) {
        insertTutorGroup.run(s.id, g);
      }
    }
  }

  // FMC guruhlarini tyutorlarga biriktirish
  const fmcGroups = [
    { tutor_id: 'tutor_1', group: 'FMC01' },
    { tutor_id: 'tutor_1', group: 'FMC02' },
    { tutor_id: 'tutor_1', group: 'FMC03' },
    { tutor_id: 'tutor_2', group: 'FMC04' },
    { tutor_id: 'tutor_2', group: 'FMC05' }
  ];
  for (const fg of fmcGroups) {
    insertTutorGroup.run(fg.tutor_id, fg.group);
  }

  // 7. NAMUNAVIY TALABALAR - Haqiqiy talabalar Excel orqali import qilinadi (mock o'chirildi)

  // 8. TADBIRLAR (event)
  const insertEvent = db.prepare(`
    INSERT OR REPLACE INTO event (
      id, title, starts_at, ends_at, place, organizer_unit, category_id, level, points, capacity, requires_registration, status, qr_secret, created_by, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const today = new Date().toISOString().split('T')[0];
  const events = [
    {
      id: 'ev_01',
      title: 'Al-Xorazmiy avlodlari: IT Karyera forumi 2026',
      starts_at: `${today}T10:00:00`,
      ends_at: `${today}T16:00:00`,
      place: 'Universitet Bosh binosi, Aktlar zali',
      organizer_unit: 'dep_yb',
      category_id: '1',
      level: 'universitet',
      points: 5,
      capacity: 250,
      requires_registration: 1,
      qr_secret: 'event_qr_secret_ev_01_akhu'
    },
    {
      id: 'ev_02',
      title: 'Zakovat intellektual o\'yini: Kuzgi chempionat 1-tur',
      starts_at: `${today}T15:30:00`,
      ends_at: `${today}T18:00:00`,
      place: 'Kutubxona Katta o\'quv zali',
      organizer_unit: 'dep_mb',
      category_id: '6',
      level: 'universitet',
      points: 5,
      capacity: 100,
      requires_registration: 0,
      qr_secret: 'event_qr_secret_ev_02_zakovat'
    },
    {
      id: 'ev_03',
      title: 'AKHU AI Hackathon 2026: Sun\'iy intellekt amaliyoti',
      starts_at: '2026-10-15T09:00:00',
      ends_at: '2026-10-16T18:00:00',
      place: 'IT Park inkubatsiya markazi',
      organizer_unit: 'dep_sb',
      category_id: '4',
      level: 'respublika',
      points: 15,
      capacity: 60,
      requires_registration: 1,
      qr_secret: 'event_qr_secret_ev_03_hackathon'
    }
  ];

  for (const ev of events) {
    insertEvent.run(
      ev.id, ev.title, ev.starts_at, ev.ends_at, ev.place, ev.organizer_unit, ev.category_id, ev.level, ev.points, ev.capacity, ev.requires_registration, 'published', ev.qr_secret, 'dep_yb', now
    );
  }

  // 9. BALL YOZUVLARI - Haqiqiy talabalar uchun arizalar va ballar tizim orqali kiritiladi (mock o'chirildi)

  // Audit log seed
  const insertAudit = db.prepare(`
    INSERT INTO audit_log (at, actor_id, actor_role, action, object_type, object_id, before, after, ip, user_agent)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertAudit.run(now, 'system', 'system', 'SEED_INIT', 'database', 'init', null, JSON.stringify({ message: 'Tizim dastlabki ma\'lumotlar bilan to\'ldirildi' }), '127.0.0.1', 'Node-Seed');

  console.log('AKHU Talabalar tizimi ma\'lumotlar bazasi muvaffaqiyatli seed qilindi!');
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
