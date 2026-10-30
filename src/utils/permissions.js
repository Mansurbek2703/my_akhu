/**
 * AKHU Talabalar Tizimi - Granular Huquq va Ruxsatlar Tizimi (RBAC / ABAC Permissions)
 * Rollarga bog'lanmagan holda har bir amalni alohida berish yoki olib qo'yish imkoniyati
 */

const PERMISSION_CATEGORIES = [
  {
    category: "Talabalar Boshqaruvi",
    icon: "users",
    color: "#2563EB",
    permissions: [
      { id: "students_view", name: "Talabalar ro'yxatini ko'rish", desc: "Talabalar bazasini ko'rish, qidirish va profillarini ochish" },
      { id: "students_create", name: "Yangi talaba qo'shish", desc: "Bitta talabani qo'lda ro'yxatga olish" },
      { id: "students_edit", name: "Talaba ma'lumotlarini tahrirlash", desc: "Talaba ismi, guruhi, bosqichi, rasmi va telefonini o'zgartirish" },
      { id: "students_delete", name: "Talabani o'chirish / arxivlash", desc: "Talabani tizimdan chiqarish yoki nofaol qilish" },
      { id: "students_import_excel", name: "Talabalarni Exceldan yuklash", desc: "Talabalar ro'yxatini Excel/CSV orqali ommaviy import qilish" },
      { id: "students_import_gpa", name: "GPA va davomat importi", desc: "GPA va davomat ballarini Exceldan kiritish" },
      { id: "students_export_zip", name: "Rasmlarni ZIP yuklab olish", desc: "Talabalar fotosuratlarini ZIP arxivda yuklab olish" },
      { id: "students_sync_turniket_photos", name: "Turniket rasmlarini to'ldirish", desc: "Turniket serverdan rasmsiz talabalar rasmlarini yuklab to'ldirish" }
    ]
  },
  {
    category: "Davomat & Turniket (Face ID)",
    icon: "door",
    color: "#059669",
    permissions: [
      { id: "attendance_view", name: "Davomatni ko'rish", desc: "Kunlik kampus turniket davomati va holatlarni ko'rish" },
      { id: "attendance_sync", name: "Turniketni sinxronlash", desc: "HikCentral serveridan yangi voqealarni qo'lda yangilash" },
      { id: "attendance_export_excel", name: "Davomatni Excelga eksport", desc: "Kunlik davomat hisobotlarini Excel formatida yuklab olish" },
      { id: "attendance_view_history", name: "Talaba davomat tarixi", desc: "Har bir talabaning kirish-chiqish vaqtlarini batafsil ko'rish" }
    ]
  },
  {
    category: "Ballar & Baholash (Rating)",
    icon: "award",
    color: "#D97706",
    permissions: [
      { id: "points_enter", name: "Talabalarga ball kiritish", desc: "Mezonlar bo'yicha talabalarga ball kiritish" },
      { id: "points_approve_dept", name: "Bo'lim tasdig'i", desc: "Bo'lim arizalarini ko'rib chiqish va tasdiqlash" },
      { id: "points_approve_prorektor", name: "Prorektor tasdig'i", desc: "Yakuniy prorektor darajasidagi tasdiqlar" },
      { id: "points_history_view", name: "Ballar tarixini ko'rish", desc: "Barcha kiritilgan ballar va dalillar jurnalini ko'rish" },
      { id: "points_recalculate", name: "Reytingni qayta hisoblash", desc: "Keshni va talabalar ballarini yangilash" }
    ]
  },
  {
    category: "Tadbirlar & QR Monitoring",
    icon: "calendar",
    color: "#7C3AED",
    permissions: [
      { id: "events_view", name: "Tadbirlarni ko'rish", desc: "Universitet tadbirlari ro'yxatini ko'rish" },
      { id: "events_create", name: "Yangi tadbir yaratish", desc: "Tadbir, joyi, vaqti va mezonlarini belgilash" },
      { id: "events_edit", name: "Tadbirni tahrirlash", desc: "Tadbir vaqtini o'zgartirish, bekor qilish yoki yakunlash" },
      { id: "events_qr_manage", name: "Dinamik QR kod boshqaruvi", desc: "Tadbir uchun jonli QR kodni ko'rsatish va monitoring" },
      { id: "events_view_registrations", name: "Ro'yxatdan o'tganlar nazorati", desc: "Tadbirga ro'yxatdan o'tgan va kelgan talabalar ro'yxati" }
    ]
  },
  {
    category: "Tyutorlar & Guruhlar",
    icon: "briefcase",
    color: "#0284C7",
    permissions: [
      { id: "tutor_my_students", name: "O'z guruh talabalari", desc: "Tyutor kabinetidan o'z talabalarini boshqarish" },
      { id: "tutor_assign_groups", name: "Guruhlarni taqsimlash", desc: "Tyutorlarga akademik guruhlarni biriktirish" },
      { id: "tutor_enter_points", name: "Tyutor ballari", desc: "Tyutor sifatida talabaga oylik ball qo'yish" }
    ]
  },
  {
    category: "Xodimlar Boshqaruvi",
    icon: "userCheck",
    color: "#BE185D",
    permissions: [
      { id: "staff_view", name: "Xodimlarni ko'rish", desc: "Tizim xodimlari ro'yxati va aloqa ma'lumotlarini ko'rish" },
      { id: "staff_create", name: "Yangi xodim qo'shish", desc: "Tizimga yangi mas'ul xodim biriktirish" },
      { id: "staff_edit", name: "Xodimni tahrirlash", desc: "Xodim ismi, lavozimi, pasport ID va parolini yangilash" },
      { id: "staff_permissions", name: "Huquqlar & Ruxsatlar berish", desc: "Xodimga alohida ruxsatlarni belgilash yoki olib qo'yish" },
      { id: "staff_status_toggle", name: "Faollikni boshqarish", desc: "Xodimni bloklash yoki qayta faollashtirish" }
    ]
  },
  {
    category: "Tizim Sozlamalari & Audit",
    icon: "settings",
    color: "#475569",
    permissions: [
      { id: "settings_seasons", name: "Mavsumlar va semestrlar", desc: "O'quv yili va mavsumlarni sozlash" },
      { id: "settings_catalog", name: "Ball mezonlari katalogi", desc: "Katalog bandlari va mezonlar qiymatlarini tahrirlash" },
      { id: "settings_hikcentral", name: "Turniket sozlamalari", desc: "HikCentral server IP, AppKey va ulanish parametrlari" },
      { id: "settings_telegram", name: "Telegram bot boshqaruvi", desc: "Bot tokeni, kanallar va xabarnomalar" },
      { id: "settings_tv_display", name: "TV Ekran boshqaruvi", desc: "Katta ekran TV tokeni va ko'rsatish sozlamalari" },
      { id: "settings_audit_logs", name: "Audit jurnalini ko'rish", desc: "Tizimdagi barcha harakatlar tarixi va xavfsizlik nazorati" },
      { id: "settings_risk_monitoring", name: "Xavf va monitoring tahlili", desc: "Konsentratsiya va shubhali ballar monitoringi" }
    ]
  },
  {
    category: "Rahbariyat & Tahlil",
    icon: "barChart",
    color: "#0891B2",
    permissions: [
      { id: "observe_analytics", name: "Umumiy tahlil & Reyting", desc: "Fakultet, yo'nalish va guruhlar bo'yicha umumiy statistika" },
      { id: "observe_tv_screen", name: "TV Ekraniga kirish", desc: "Katta ekran reyting va davomat jadvalini ko'rish" }
    ]
  }
];

// Barcha ruxsat ID lari ro'yxati
const ALL_PERMISSIONS = PERMISSION_CATEGORIES.flatMap(c => c.permissions.map(p => p.id));

// Standart rollar uchun tavsiya etiladigan bazaviy ruxsatlar
const ROLE_DEFAULT_PERMISSIONS = {
  superadmin: ALL_PERMISSIONS,
  dep_ob: [
    'students_view', 'students_create', 'students_edit', 'students_import_excel', 
    'students_import_gpa', 'students_export_zip', 'students_sync_turniket_photos', 
    'attendance_view', 'attendance_export_excel', 'observe_analytics'
  ],
  tutor: [
    'tutor_my_students', 'tutor_enter_points', 'attendance_view', 
    'attendance_view_history', 'events_view'
  ],
  prorektor: [
    'points_approve_prorektor', 'points_history_view', 'observe_analytics', 
    'observe_tv_screen', 'settings_audit_logs', 'settings_risk_monitoring', 
    'attendance_view', 'events_view'
  ],
  kengash: [
    'points_approve_dept', 'points_enter', 'events_view', 'events_create', 'attendance_view'
  ],
  dep_atm: [
    'attendance_view', 'attendance_view_history', 'events_view', 'events_create', 'events_edit', 'events_qr_manage',
    'observe_analytics', 'observe_tv_screen', 'settings_audit_logs', 'settings_bot_manage', 'students_view'
  ],
  dep_xb: [
    'attendance_view', 'attendance_view_history', 'observe_analytics', 'events_view'
  ],
  dep_iy: [
    'attendance_view', 'observe_analytics', 'events_view', 'points_approve_dept', 'points_enter'
  ]
};

/**
 * Xodimning amaldagi (effective) barcha ruxsatlarini olish
 * (Rol bo'yicha standart ruxsatlar + Xodimga shaxsan berilgan alohida ruxsatlar)
 */
function getEffectiveUserPermissions(user) {
  if (!user) return [];
  if (user.id === 'superadmin') return ALL_PERMISSIONS;

  let roles = [];
  try {
    roles = Array.isArray(user.roles) ? user.roles : JSON.parse(user.roles || '[]');
  } catch (e) {
    roles = user.roles ? [user.roles] : [];
  }

  if (roles.includes('superadmin')) return ALL_PERMISSIONS;

  let explicitPerms = [];
  try {
    explicitPerms = Array.isArray(user.permissions) ? user.permissions : JSON.parse(user.permissions || '[]');
  } catch (e) {
    explicitPerms = [];
  }

  const permSet = new Set(explicitPerms);

  // Rol bo'yicha standart ruxsatlarni qo'shish
  for (const r of roles) {
    if (ROLE_DEFAULT_PERMISSIONS[r]) {
      ROLE_DEFAULT_PERMISSIONS[r].forEach(p => permSet.add(p));
    }
    // dep_ bilan boshlangan bo'limlar (masalan: dep_yb, dep_mb, dep_ib...)
    if (r && r.startsWith('dep_')) {
      ['points_enter', 'points_approve_dept', 'events_view', 'events_create', 'events_edit', 'events_qr_manage', 'attendance_view'].forEach(p => permSet.add(p));
    }
  }

  return Array.from(permSet);
}

/**
 * Xodimda muayyan ruxsat mavjudligini tekshirish
 */
function userHasPermission(user, permissionId) {
  if (!user) return false;
  if (user.id === 'superadmin') return true;

  let roles = [];
  try {
    roles = Array.isArray(user.roles) ? user.roles : JSON.parse(user.roles || '[]');
  } catch (e) {
    roles = user.roles ? [user.roles] : [];
  }

  if (roles.includes('superadmin')) return true;

  const effective = getEffectiveUserPermissions(user);
  return effective.includes(permissionId);
}

module.exports = {
  PERMISSION_CATEGORIES,
  ALL_PERMISSIONS,
  ROLE_DEFAULT_PERMISSIONS,
  getEffectiveUserPermissions,
  userHasPermission
};
