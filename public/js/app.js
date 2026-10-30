// ====================================================================
// AKHU TALABALAR TIZIMI - ASOSIY BOSHQARUV VA KUZATUV SPA JS (app.js)
// ====================================================================

const AppState = {
  isLoggedIn: false,
  currentRole: null,
  currentPage: '',
  catalog: { categories: [], items: [], scale: [] },
  user: null
};

const ROLE_META = {
  'superadmin': { label: 'Superadmin', color: '#EF4444', bg: '#FEF2F2' },
  'prorektor': { label: 'Prorektor', color: '#8B5CF6', bg: '#F5F3FF' },
  'tutor': { label: 'Tyutor', color: '#10B981', bg: '#ECFDF5' },
  'dep_yb': { label: 'Yoshlar bo\'limi', color: '#3B82F6', bg: '#EFF6FF' },
  'dep_mb': { label: 'Ma\'naviyat bo\'limi', color: '#3B82F6', bg: '#EFF6FF' },
  'dep_ob': { label: 'O\'quv bo\'limi', color: '#3B82F6', bg: '#EFF6FF' },
  'dep_ib': { label: 'Ilmiy bo\'lim', color: '#3B82F6', bg: '#EFF6FF' },
  'dep_sb': { label: 'Sanoat hamkorlik', color: '#3B82F6', bg: '#EFF6FF' },
  'dep_pb': { label: 'Matbuot (PR)', color: '#3B82F6', bg: '#EFF6FF' },
  'dep_atm': { label: 'Axborot texnologiyalari markazi', color: '#0284C7', bg: '#E0F2FE' },
  'dep_xb': { label: 'Xo\'jalik bo\'limi', color: '#D97706', bg: '#FEF3C7' },
  'dep_iy': { label: 'Ish yurituvchi', color: '#7C3AED', bg: '#F5F3FF' },
  'staff': { label: 'Xodim', color: '#3B82F6', bg: '#EFF6FF' }
};

function formatApproverRole(role) {
  if (!role || role === '-') return '-';
  const roleNames = {
    'dep_yb': "Yoshlar bo'limi",
    'dep_mb': "Ma'naviyat bo'limi",
    'dep_ob': "O'quv bo'limi",
    'dep_ib': "Ilmiy bo'lim",
    'dep_sb': "Sanoat hamkorlik",
    'dep_pb': "Matbuot (PR)",
    'dep_atm': "Axborot texnologiyalari markazi",
    'dep_xb': "Xo'jalik bo'limi",
    'dep_iy': "Ish yurituvchi",
    'prorektor': "Prorektor",
    'tutor': "Tyutor",
    'superadmin': "Superadmin",
    'observer': "Kuzatuvchi"
  };
  return roleNames[role] || (ROLE_META[role] ? ROLE_META[role].label : role);
}

// ====================================================================
// RASMIY UNIVERSITET VEKTOR SVG BELGILARI (ICONS SYSTEM)
// ====================================================================
const ICONS = {
  plus: (s=16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
  users: (s=16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
  user: (s=16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
  userPlus: (s=16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>`,
  cap: (s=16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>`,
  upload: (s=16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>`,
  download: (s=16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`,
  fileSpreadsheet: (s=16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M8 13h8"></path><path d="M8 17h8"></path><path d="M12 9v12"></path></svg>`,
  edit: (s=16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,
  trash: (s=16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`,
  eye: (s=16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
  check: (s=16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
  checkCircle: (s=16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
  xCircle: (s=16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
  x: (s=16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
  shield: (s=16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
  settings: (s=16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
  trophy: (s=16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.45 1-1 1H7v4h10v-4h-2c-.55 0-1-.45-1-1v-2.34"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"></path></svg>`,
  star: (s=16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
  activity: (s=16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>`,
  zap: (s=16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
  clock: (s=16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
  calendar: (s=16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
  target: (s=16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="6" r="2"></circle><circle cx="12" cy="18" r="2"></circle></svg>`,
  search: (s=16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,
  filter: (s=16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>`,
  phone: (s=16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`,
  building: (s=16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="22.01"></line><line x1="15" y1="22" x2="15" y2="22.01"></line><line x1="9" y1="6" x2="9" y2="6.01"></line><line x1="15" y1="6" x2="15" y2="6.01"></line><line x1="9" y1="10" x2="9" y2="10.01"></line><line x1="15" y1="10" x2="15" y2="10.01"></line><line x1="9" y1="14" x2="9" y2="14.01"></line><line x1="15" y1="14" x2="15" y2="14.01"></line><line x1="9" y1="18" x2="9" y2="18.01"></line><line x1="15" y1="18" x2="15" y2="18.01"></line></svg>`,
  mapPin: (s=16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
  qrCode: (s=16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`,
  alertTriangle: (s=16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
  info: (s=16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
  fileText: (s=16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
  link: (s=16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`,
  pause: (s=16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`,
  play: (s=16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`,
  award: (s=16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>`,
  refresh: (s=16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>`,
  grid: (s=16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`,
  list: (s=16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>`,
  copy: (s=16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`,
  image: (s=16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`
};

function icon(name, size = 16) {
  return ICONS[name] ? ICONS[name](size) : '';
}



// API so'rov yuborish uchun yordamchi funksiya
async function apiFetch(endpoint, options = {}) {
  const currentUserId = (AppState.user && AppState.user.id) ? AppState.user.id : '';
  const headers = {
    'Content-Type': 'application/json',
    'x-user-id': currentUserId,
    ...(options.headers || {})
  };
  try {
    const res = await fetch(endpoint, { credentials: 'omit', ...options, headers });
    if (!res.ok) {
      if (res.status === 401) {
        logoutStaffUser(false);
        throw new Error("Sessiya muddati tugagan yoki ruxsat berilmagan. Qaytadan kiring.");
      }
      const err = await res.json().catch(() => ({ error: `Server xatosi: ${res.status}` }));
      throw new Error(err.error || `Xato yuz berdi (${res.status})`);
    }
    return await res.json();
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err);
    throw err;
  }
}

// Rollarga mos boshlang'ich sahifani aniqlash
function getDefaultPageForRoles(roles = []) {
  if (!roles || !Array.isArray(roles) || roles.length === 0) return 'staff-my-profile';
  if (roles.includes('superadmin')) return 'admin-students-manage';
  if (roles.includes('dep_ob')) return 'admin-students-manage';
  if (roles.includes('tutor')) return 'tutor-my-students';
  if (roles.includes('prorektor')) return 'dept-approvals';
  if (roles.some(r => r && r.startsWith('dep_'))) return 'dept-approvals';
  return 'staff-my-profile';
}

// Muayyan sahifa foydalanuvchi roliga ruxsat etilganmi?
function isPagePermittedForUser(pageName, userRoles = []) {
  if (!userRoles || userRoles.length === 0) return false;
  if (userRoles.includes('superadmin')) return true;

  // Barcha xodimlar shaxsiy profilini, davomatni va LMS monitoringni ko'ra oladi
  if (pageName === 'staff-my-profile' || pageName === 'campus-attendance-manage' || pageName === 'lms-monitoring') return true;

  // Tyutor kabineti
  if (pageName.startsWith('tutor-')) {
    return userRoles.includes('tutor');
  }

  // Talabalar boshqaruvi (Registrator va Superadmin)
  if (pageName === 'admin-students-manage' || pageName === 'dept-students-manage') {
    return userRoles.includes('dep_ob') || userRoles.includes('superadmin');
  }

  // Tadbirlar & QR (Faqat ruxsat berilgan bo'lim xodimlari, prorektor va superadmin)
  if (pageName === 'dept-events' || pageName === 'observe-events') {
    return userRoles.some(r => r && (r.startsWith('dep_') || r === 'prorektor' || r === 'superadmin'));
  }

  // Tasdiqlash & Ijro
  if (pageName === 'dept-approvals' || pageName === 'prorektor-queue' || pageName === 'prorektor-risks' || pageName === 'prorektor-appeals') {
    return userRoles.some(r => r && (r.startsWith('dep_') || r === 'prorektor' || r === 'superadmin'));
  }

  // Tizim sozlamalari, xodimlar boshqaruvi, audit
  if (pageName.startsWith('admin-')) {
    return userRoles.includes('superadmin');
  }

  // Rahbariyat monitoringi (Faqat Prorektor va Superadmin)
  if (pageName.startsWith('observe-')) {
    return userRoles.includes('prorektor') || userRoles.includes('superadmin');
  }

  return false;
}

// Boshlang'ich yuklash (DOM tayyor bo'lganda)
document.addEventListener('DOMContentLoaded', async () => {
  // Saqlangan tizim xodimi autentifikatsiyasini tekshirish
  const savedAuth = localStorage.getItem('akhu_auth_user');
  if (savedAuth) {
    try {
      const u = JSON.parse(savedAuth);
      if (u && u.id && u.roles && Array.isArray(u.roles) && u.roles.length > 0) {
        AppState.isLoggedIn = true;
        AppState.user = u;
        AppState.currentRole = u.roles[0] || 'staff';
      } else {
        localStorage.removeItem('akhu_auth_user');
      }
    } catch (e) {
      localStorage.removeItem('akhu_auth_user');
    }
  }

  initNavigation();
  initModals();
  initLoginForm();

  const loginScreen = document.getElementById('portal-login-screen');
  const appContainer = document.getElementById('app-container');

  // AGAR FOYDALANUVCHI TIZIMGA KIRMANGAN BO'LSA:
  // FAQAT LOGIN DARCHASI OCHILADI (BATAMOM OCHIQ MONITORING VA TV MODE YO'Q)
  if (!AppState.isLoggedIn || !AppState.user) {
    if (loginScreen) loginScreen.style.display = 'flex';
    if (appContainer) appContainer.style.display = 'none';
    const uInput = document.getElementById('portal-username');
    if (uInput) setTimeout(() => uInput.focus(), 80);
    return; // Orqa fonda hech qanday ma'lumot yuklanmaydi!
  }

  // AGAR TIZIMGA KIRILGAN BO'LSA:
  if (loginScreen) loginScreen.style.display = 'none';
  if (appContainer) appContainer.style.display = 'flex';

  updateAuthUI();
  updateSidebarPermissions();
  await loadCatalogData();
  initSuperadminNotifications();

  // Boshlang'ich sahifani aniqlash (Hash yoki roliga mos standart sahifa)
  const hashPage = (window.location.hash || '').replace(/^#/, '').trim();
  const savedPage = localStorage.getItem('akhu_current_page');
  let targetPage = hashPage || savedPage;

  if (!targetPage || !isPagePermittedForUser(targetPage, AppState.user.roles)) {
    targetPage = getDefaultPageForRoles(AppState.user.roles);
  }

  AppState.currentPage = targetPage;
  navigateTo(AppState.currentPage);

  // Hash o'zgarganda sahifani avtomatik almashtirish (Browser Back/Forward)
  window.addEventListener('hashchange', () => {
    const curHash = (window.location.hash || '').replace(/^#/, '').trim();
    if (curHash && curHash !== AppState.currentPage) {
      navigateTo(curHash);
    }
  });

  // Refresh tugmasi
  const refreshBtn = document.getElementById('btn-refresh-data');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      if (AppState.isLoggedIn && AppState.currentPage) {
        navigateTo(AppState.currentPage);
      }
    });
  }
});

// FOYDALANUVCHI STATUSI VA INTERFEYSINI YANGILASH
function updateAuthUI() {
  const loggedBox = document.getElementById('auth-logged-box');
  const topbarUser = document.getElementById('topbar-user-name');
  const topbarAvatarImg = document.getElementById('topbar-avatar-img');
  const topbarAvatarFallback = document.getElementById('topbar-avatar-fallback');
  const roleTag = document.getElementById('role-tag');
  const authUserDisplay = document.getElementById('auth-user-display');

  if (AppState.isLoggedIn && AppState.user) {
    if (loggedBox) loggedBox.style.display = 'inline-flex';
    const fullName = AppState.user.full_name || AppState.user.name || AppState.user.id;
    if (topbarUser) topbarUser.textContent = fullName;

    const initials = (fullName || '').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    if (AppState.user.photo_url && topbarAvatarImg) {
      topbarAvatarImg.src = AppState.user.photo_url;
      topbarAvatarImg.style.display = 'block';
      if (topbarAvatarFallback) topbarAvatarFallback.style.display = 'none';
    } else {
      if (topbarAvatarImg) topbarAvatarImg.style.display = 'none';
      if (topbarAvatarFallback) {
        topbarAvatarFallback.style.display = 'flex';
        topbarAvatarFallback.textContent = initials || '👤';
      }
    }

    const mainRole = (AppState.user.roles || [])[0] || 'staff';
    const meta = ROLE_META[mainRole] || { label: formatApproverRole(mainRole), color: '#3B82F6', bg: '#EFF6FF' };
    
    if (roleTag) {
      roleTag.textContent = meta.label;
      roleTag.style.color = meta.color;
      roleTag.style.background = meta.bg;
      roleTag.style.borderColor = meta.color + '40';
    }
    if (authUserDisplay) {
      authUserDisplay.textContent = fullName;
    }

    // Har bir login qilgan xodim uchun Katta Ekran (TV) ga to'liq ruxsat berish
    const tvUrl = `/tv?user_id=${encodeURIComponent(AppState.user.id)}`;
    const tvBtn1 = document.getElementById('sidebar-footer-tv-btn');
    const tvBtn2 = document.getElementById('topbar-tv-btn');
    if (tvBtn1) tvBtn1.href = tvUrl;
    if (tvBtn2) tvBtn2.href = tvUrl;
  }
}

// XODIMNING TIZIMDAN CHIQISHI (LOGOUT)
function logoutStaffUser(askConfirm = true) {
  if (askConfirm && !confirm("Haqiqatan ham tizimdan chiqmoqchimisiz?")) {
    return;
  }
  localStorage.removeItem('akhu_auth_user');
  localStorage.removeItem('akhu_current_page');
  AppState.isLoggedIn = false;
  AppState.currentRole = null;
  AppState.user = null;
  AppState.currentPage = '';

  const loginScreen = document.getElementById('portal-login-screen');
  const appContainer = document.getElementById('app-container');
  if (loginScreen) loginScreen.style.display = 'flex';
  if (appContainer) appContainer.style.display = 'none';

  const uInput = document.getElementById('portal-username');
  const pInput = document.getElementById('portal-password');
  const errBox = document.getElementById('portal-login-error');
  if (errBox) errBox.style.display = 'none';
  if (pInput) pInput.value = '';
  if (uInput) setTimeout(() => uInput.focus(), 50);

  try {
    history.replaceState(null, '', window.location.pathname);
  } catch (e) {}
}

window.logoutStaffUser = logoutStaffUser;

// ASOSIY LOGIN FORMASI VA PAROL TEKSHIRUVI
function initLoginForm() {
  const form = document.getElementById('portal-main-login-form');
  const togglePassBtn = document.getElementById('btn-toggle-password');
  const pInput = document.getElementById('portal-password');
  const eyeOpen = document.getElementById('icon-eye-open');
  const eyeClosed = document.getElementById('icon-eye-closed');

  if (togglePassBtn && pInput) {
    togglePassBtn.addEventListener('click', () => {
      const isPassword = pInput.type === 'password';
      pInput.type = isPassword ? 'text' : 'password';
      if (eyeOpen) eyeOpen.style.display = isPassword ? 'none' : 'block';
      if (eyeClosed) eyeClosed.style.display = isPassword ? 'block' : 'none';
    });
  }

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const usernameInput = document.getElementById('portal-username');
    const passwordInput = document.getElementById('portal-password');
    const errBox = document.getElementById('portal-login-error');
    const errText = document.getElementById('portal-login-error-text');
    const submitBtn = document.getElementById('btn-portal-submit');

    const username = usernameInput ? usernameInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value : '';

    if (!username || !password) {
      if (errBox && errText) {
        errText.textContent = "Login va parol kiritilishi shart!";
        errBox.style.display = 'flex';
      }
      return;
    }

    try {
      if (errBox) errBox.style.display = 'none';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="spinner" style="width:16px;height:16px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:6px;"></span> Kirilmoqda...`;
      }

      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login yoki parol noto'g'ri");

      AppState.isLoggedIn = true;
      AppState.user = {
        id: data.user.id,
        name: data.user.full_name,
        full_name: data.user.full_name,
        roles: data.user.roles || [],
        email: data.user.email,
        phone: data.user.phone || '',
        photo_url: data.user.photo_url || '',
        groups: data.user.groups || []
      };
      AppState.currentRole = (data.user.roles || [])[0] || 'staff';
      localStorage.setItem('akhu_auth_user', JSON.stringify(AppState.user));

      // UI ni almashtirish: login ekranini yopib, boshqaruv tizimini ko'rsatish
      const loginScreen = document.getElementById('portal-login-screen');
      const appContainer = document.getElementById('app-container');
      if (loginScreen) loginScreen.style.display = 'none';
      if (appContainer) appContainer.style.display = 'flex';

      updateAuthUI();
      updateSidebarPermissions();
      await loadCatalogData();
      initSuperadminNotifications();

      // Foydalanuvchi roliga mos bosh sahifaga yo'naltirish
      const target = getDefaultPageForRoles(AppState.user.roles);
      navigateTo(target);
    } catch (err) {
      if (errBox && errText) {
        errText.textContent = err.message || "Kirishda xatolik yuz berdi";
        errBox.style.display = 'flex';
      } else {
        alert(err.message);
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
          <span>Tizimga Kirish</span>
        `;
      }
    }
  });
}

function updateSidebarPermissions() {
  const sections = document.querySelectorAll('.nav-role-section');
  const userRoles = (AppState.isLoggedIn && AppState.user) ? (AppState.user.roles || []) : [];

  sections.forEach(el => {
    const forRole = el.getAttribute('data-for-role');
    let visible = false;

    if (AppState.isLoggedIn) {
      if (forRole === 'staff' || forRole === 'attendance') {
        visible = true; // Barcha xodimlar shaxsiy profilini va davomatni ko'radi
      } else if (userRoles.includes('superadmin')) {
        visible = true; // Superadmin barcha bo'limlarni ko'radi
      } else if (forRole === 'tutor' && userRoles.includes('tutor')) {
        visible = true;
      } else if (forRole === 'approver' && (userRoles.some(r => r && r.startsWith('dep_')) || userRoles.includes('prorektor'))) {
        visible = true;
      } else if (forRole === 'events' && (userRoles.includes('superadmin') || userRoles.includes('prorektor') || userRoles.some(r => r && r.startsWith('dep_')))) {
        visible = true;
      } else if (forRole === 'leadership' && (userRoles.includes('superadmin') || userRoles.includes('prorektor'))) {
        visible = true;
      } else if (forRole === 'students' && (userRoles.includes('dep_ob') || userRoles.includes('superadmin'))) {
        visible = true;
      } else if (forRole === 'dep_ob' && userRoles.includes('dep_ob')) {
        visible = true;
      } else if (forRole === 'prorektor' && userRoles.includes('prorektor')) {
        visible = true;
      } else if (forRole === 'superadmin' && userRoles.includes('superadmin')) {
        visible = true;
      }
    }

    el.style.display = visible ? '' : 'none';
  });

  // Agar bo'lim xodimi bo'lsa navbat sonini yuklash
  if (AppState.isLoggedIn && (userRoles.some(r => r && r.startsWith('dep_')) || userRoles.includes('prorektor') || userRoles.includes('superadmin'))) {
    checkPendingBadge();
  }
}

async function checkPendingBadge() {
  try {
    const res = await apiFetch('/api/approvals');
    const badge = document.getElementById('pending-badge');
    if (badge) {
      if (res.count > 0) {
        badge.textContent = res.count;
        badge.style.display = 'inline-block';
      } else {
        badge.style.display = 'none';
      }
    }
  } catch (e) {
    // Jim e'tiborsiz qoldirish
  }
}

// 2. NAVIGATSIYA VA ROUTING
const PAGE_SECTION_MAP = {
  'observe-dashboard': 'observe-dashboard',
  'observe-rating': 'observe-dashboard',
  'observe-catalog': 'observe-dashboard',
  'observe-students': 'observe-dashboard',

  'admin-students-manage': 'admin-students-manage',
  'dept-students-manage': 'admin-students-manage',

  'dept-events': 'dept-events',
  'observe-events': 'dept-events',

  'dept-approvals': 'dept-approvals',
  'prorektor-queue': 'dept-approvals',
  'prorektor-risks': 'dept-approvals',
  'prorektor-appeals': 'dept-approvals',

  'tutor-my-students': 'tutor-my-students',
  'tutor-add-points': 'tutor-my-students',
  'tutor-history': 'tutor-my-students',

  'admin-users-manage': 'admin-users-manage',
  'admin-staff-edit': 'admin-users-manage',
  'admin-catalog': 'admin-users-manage',
  'admin-audit': 'admin-users-manage',
  'admin-bot-monitoring': 'admin-users-manage',

  'campus-attendance-manage': 'campus-attendance-manage',
  'staff-my-profile': 'staff-my-profile',
  'lms-monitoring': 'lms-monitoring'
};

function renderModuleSubNav(pageName) {
  const sectionKey = PAGE_SECTION_MAP[pageName] || pageName;
  let tabs = [];
  let extraActions = '';

  if (sectionKey === 'observe-dashboard') {
    tabs = [
      { id: 'observe-dashboard', label: 'Asosiy Ko\'rsatkichlar & Tahlil' },
      { id: 'observe-rating', label: 'Yetakchilar Faxriy Doskasi' },
      { id: 'observe-catalog', label: 'Ball Nizomi & Mezonlar' }
    ];
  } else if (sectionKey === 'admin-students-manage') {
    tabs = [];
  } else if (sectionKey === 'dept-events') {
    tabs = [
      { id: 'dept-events', label: 'Barcha Tadbirlar' }
    ];
    if (AppState.isLoggedIn) {
      extraActions = `
        <div class="module-nav-actions">
          <button class="btn btn-primary btn-sm" onclick="openCreateEventModal()" style="display:inline-flex; align-items:center; gap:6px;">
            ${icon('calendar', 14)} <span>+ Yangi Tadbir Qo'shish</span>
          </button>
          <button class="btn btn-outline btn-sm" onclick="showStudentCheckinModal()" style="display:inline-flex; align-items:center; gap:6px; border-color:#3B82F6; color:#2563EB; background:#EFF6FF;">
            ${icon('qrCode', 14)} <span>Talaba QR Check-in</span>
          </button>
        </div>
      `;
    }
  } else if (sectionKey === 'dept-approvals') {
    tabs = [
      { id: 'dept-approvals', label: 'Tasdiq Navbati' },
      { id: 'prorektor-queue', label: 'Prorektor 25+ / -30' },
      { id: 'prorektor-risks', label: 'Xavf va Monitoring' },
      { id: 'prorektor-appeals', label: 'E\'tirozlar (Apellyatsiya)' }
    ];
  } else if (sectionKey === 'tutor-my-students') {
    tabs = [
      { id: 'tutor-my-students', label: 'Mening Talabalarim' },
      { id: 'tutor-add-points', label: 'Ball Kiritish' },
      { id: 'tutor-history', label: 'Kiritilgan Yozuvlar' }
    ];
  } else if (sectionKey === 'admin-users-manage') {
    tabs = [
      { id: 'admin-users-manage', label: 'Xodimlar va Rollar' },
      { id: 'admin-catalog', label: 'Katalog Sozlamalari' },
      { id: 'admin-audit', label: 'Audit Jurnali' },
      { id: 'admin-bot-monitoring', label: '🤖 Bot Monitoringi' }
    ];
    if (pageName === 'admin-staff-edit') {
      tabs.push({ id: 'admin-staff-edit', label: '✏️ Xodimni Tahrirlash' });
    }
  } else if (sectionKey === 'campus-attendance-manage') {
    tabs = [
      { id: 'campus-attendance-manage', label: 'Jonli Davomat & Turniket' }
    ];
  } else if (sectionKey === 'staff-my-profile') {
    tabs = [
      { id: 'staff-my-profile', label: 'Shaxsiy Profil' }
    ];
  } else if (sectionKey === 'lms-monitoring') {
    tabs = [
      { id: 'lms-monitoring', label: '📚 LMS Darslar & Davomat Monitoringi' }
    ];
    extraActions = `
      <div class="module-nav-actions">
        <button class="btn btn-primary btn-sm" onclick="syncLmsManually()" id="btn-sync-lms-main" style="display:inline-flex; align-items:center; gap:6px;">
          ${icon('refresh', 14)} <span>🔄 LMS dan yangilash</span>
        </button>
      </div>
    `;
  }

  if (tabs.length <= 1 && !extraActions) return '';

  return `
    <div class="module-subnav-bar">
      <div class="module-nav-pills">
        ${tabs.map(t => `
          <button class="module-nav-pill ${t.id === pageName ? 'active' : ''}" onclick="navigateTo('${t.id}')">
            ${t.label}
          </button>
        `).join('')}
      </div>
      ${extraActions}
    </div>
  `;
}

function initNavigation() {
  document.querySelectorAll('.sidebar-nav a.nav-item').forEach(link => {
    link.addEventListener('click', (e) => {
      const page = link.getAttribute('data-page');
      if (page) {
        e.preventDefault();
        navigateTo(page);
      }
    });
  });
}

function navigateTo(pageName) {
  // Hash query parametrlarni ajratib olish (masalan: admin-staff-edit?id=tyutor2026)
  if (pageName && pageName.includes('?')) {
    const [baseName, qStr] = pageName.split('?');
    try {
      const sp = new URLSearchParams(qStr);
      if (sp.get('id')) {
        AppState.editingStaffId = sp.get('id');
      }
    } catch (e) {}
    pageName = baseName;
  }

  // Qat'iy himoya: Tizimga kirmagan bo'lsa darhol login darchasiga o'tkazish
  if (!AppState.isLoggedIn || !AppState.user) {
    logoutStaffUser(false);
    return;
  }

  // Ruxsat tekshiruvi: Agar sahifa foydalanuvchi roliga ruxsat etilmagan bo'lsa, uning asosiy sahifasiga yo'naltirish
  const userRoles = AppState.user.roles || [];
  if (!isPagePermittedForUser(pageName, userRoles)) {
    pageName = getDefaultPageForRoles(userRoles);
  }

  AppState.currentPage = pageName;
  localStorage.setItem('akhu_current_page', pageName);
  try {
    if (window.location.hash !== '#' + pageName) {
      history.replaceState(null, '', '#' + pageName);
    }
  } catch (e) {}

  const parentNav = PAGE_SECTION_MAP[pageName] || pageName;
  document.querySelectorAll('.sidebar-nav a.nav-item').forEach(link => {
    if (link.getAttribute('data-page') === parentNav) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  const pageTitle = document.getElementById('current-page-title');
  const pageDesc = document.getElementById('current-page-desc');
  const contentArea = document.getElementById('app-content-area');

  const subNavHtml = renderModuleSubNav(pageName);
  contentArea.innerHTML = subNavHtml + '<div id="module-page-container"><div class="loading-state"><div class="spinner"></div><p>Ma\'lumotlar yuklanmoqda...</p></div></div>';
  const targetContainer = document.getElementById('module-page-container');

  switch (pageName) {
    case 'observe-dashboard':
      pageTitle.textContent = 'Kuzatuv Paneli';
      pageDesc.textContent = 'Universitet talabalari faolligi va reyting ko\'rsatkichlari';
      renderObserveDashboard(targetContainer);
      break;
    case 'observe-rating':
      pageTitle.textContent = 'Yetakchilar Faxriy Doskasi';
      pageDesc.textContent = 'Universitet eng faol talabalari va akademik guruhlar reytingi';
      renderObserveRating(targetContainer);
      break;
    case 'observe-students':
      pageTitle.textContent = 'Talabalar Katalogi';
      pageDesc.textContent = 'Universitetdagi barcha faol talabalar va shaxsiy profillar';
      renderObserveStudents(targetContainer);
      break;
    case 'observe-events':
    case 'dept-events':
      pageTitle.textContent = 'Tadbirlar & QR Kodlar';
      pageDesc.textContent = 'Universitet miqyosidagi tadbirlar, ishtirokchilar va check-in';
      renderDeptEvents(targetContainer);
      break;
    case 'observe-catalog':
      pageTitle.textContent = 'Ball Katalogi v1.0';
      pageDesc.textContent = 'Ball berish qoidalari, sohalar, shkala va limitlar';
      renderObserveCatalog(targetContainer);
      break;
    case 'tutor-my-students':
      pageTitle.textContent = 'Mening Talabalarim';
      pageDesc.textContent = 'Tyutor guruhlaridagi talabalar faolligi va passivlik monitoringi';
      renderTutorStudents(targetContainer);
      break;
    case 'tutor-add-points':
      pageTitle.textContent = 'Ball Kiritish';
      pageDesc.textContent = 'Talabalarga dalil asosida ball kiritish (R-01, R-02, R-04)';
      renderTutorAddPoints(targetContainer);
      break;
    case 'tutor-history':
      pageTitle.textContent = 'Kiritgan Yozuvlarim';
      pageDesc.textContent = 'Holatlar (kutilmoqda, tasdiqlandi, rad etildi) va qayta topshirish';
      renderTutorHistory(targetContainer);
      break;
    case 'dept-approvals':
      pageTitle.textContent = 'Tasdiq Navbati (Approval Queue)';
      pageDesc.textContent = 'Bo\'lim arizalarini tekshirish, tasdiqlash yoki rad etish (B-01)';
      renderDeptApprovals(targetContainer);
      break;
    case 'dept-students-manage':
      pageTitle.textContent = 'Talabalar Ro\'yxati & Import (Registrator)';
      pageDesc.textContent = 'Talabalarni ro\'yxatga olish, Excel import, yangi talaba qo\'shish va tahrirlash';
      renderStudentsManagement(targetContainer, 'Registrator');
      break;
    case 'dept-gpa-import':
      navigateTo('admin-students-manage');
      break;
    case 'admin-students-manage':
      pageTitle.textContent = 'Talabalar Boshqaruvi & Import (Superadmin)';
      pageDesc.textContent = 'Barcha talabalar bazasi, ommaviy Excel import, yangi talaba qo\'shish va tahrirlash';
      renderStudentsManagement(targetContainer, 'Superadmin');
      break;
    case 'admin-users-manage':
      pageTitle.textContent = 'Xodimlar & Rollar Boshqaruvi (Superadmin Full Access)';
      pageDesc.textContent = 'Xodimlarni ro\'yxatdan o\'tkazish, ixtiyoriy rollarni biriktirish yoki olib tashlash';
      renderStaffUsersManagement(targetContainer);
      break;
    case 'admin-staff-edit':
      pageTitle.textContent = "Xodimni Tahrirlash & Ruxsatlar Boshqaruvi";
      pageDesc.textContent = "Xodim profili, biriktirilgan rollar va granular funksional ruxsatlarni sozlash";
      renderStaffEditPage(targetContainer, AppState.editingStaffId);
      break;
    case 'prorektor-queue':
      pageTitle.textContent = 'Prorektor Nazorati — 2-bosqich Tasdiq (PV)';
      pageDesc.textContent = '25+ ballik yutuqlar va -30 jarimalar bo\'yicha yakuniy qaror';
      renderProrektorQueue(targetContainer);
      break;
    case 'prorektor-risks':
      pageTitle.textContent = 'Xavf & Konsentratsiya Indikatorlari';
      pageDesc.textContent = 'Tyutor konsentratsiyasi (>40%) va talaba bir manba (>70%) tahlili';
      renderProrektorRisks(targetContainer);
      break;
    case 'prorektor-appeals':
      pageTitle.textContent = 'E\'tirozlar & Apellyatsiyalar';
      pageDesc.textContent = 'Talabalarning rad etilgan yozuvlar bo\'yicha shikoyatlari';
      renderProrektorAppeals(targetContainer);
      break;
    case 'admin-catalog':
      pageTitle.textContent = 'Katalog Sozlamalari (Superadmin)';
      pageDesc.textContent = 'Katalog bandlarini o\'zgartirish va versiyalash (S-01, AT-21)';
      renderAdminCatalog(targetContainer);
      break;
    case 'admin-audit':
      pageTitle.textContent = 'Tizim Audit Jurnali (X-05)';
      pageDesc.textContent = 'O\'zgarmas harakatlar tarixi: kim, qachon, nima qildi va IP manzili';
      renderAdminAudit(targetContainer);
      break;
    case 'admin-bot-monitoring':
      pageTitle.textContent = '🤖 Telegram Bot Monitoringi & Faollik Tizimi';
      pageDesc.textContent = 'Botda start bosganlar, kim, qachon va nima qilgani bo\'yicha jonli monitoring';
      renderBotMonitoring(targetContainer);
      break;
    case 'staff-my-profile':
      pageTitle.textContent = 'Mening Shaxsiy Profilim';
      pageDesc.textContent = 'Xodim ma\'lumotlari, fotosurat va hisob xavfsizligi';
      renderStaffProfile(targetContainer);
      break;
    case 'campus-attendance-manage':
    case 'lms-monitoring':
    case 'lms-attendance-unified':
      pageTitle.textContent = 'Darslar & Davomat Tizimi';
      pageDesc.textContent = 'LMS dars jadvali, kunlik/haftalik/oylik davomat, guruhlar reytingi, turniket va davomat mutanosibligi auditi';
      renderUnifiedAttendance(targetContainer);
      break;
    default:
      targetContainer.innerHTML = `<div class="card"><p>Sahifa topilmadi: ${pageName}</p></div>`;
  }
}

// 3. KATALOGNI YUKLASH
async function loadCatalogData() {
  try {
    const res = await apiFetch('/api/observe/catalog');
    AppState.catalog = res;
  } catch (err) {
    console.error('Katalog yuklanmadi', err);
  }
}

// -------------------------------------------------------------
// SAHIFA: KUZATUV DASHBOARDI
// -------------------------------------------------------------
// -------------------------------------------------------------
// SAHIFA: KUZATUV DASHBOARDI (OCHIQ MONITORING)
// -------------------------------------------------------------
async function renderObserveDashboard(container) {
  try {
    const data = await apiFetch('/api/observe/dashboard');
    const m = data.metrics || {};
    const ws = data.weekly_stars || {};
    const topOverall = data.top_overall || [];
    const topBak = data.top_bak || [];
    const topMag = data.top_mag || [];
    const topHall = (topOverall.length > 0) ? topOverall : (topBak.length > 0 ? topBak : topMag);
    const topGroups = data.top_groups || [];
    const categories = data.categories || [];

    // Haftaning yulduzlari xavfsiz qiymatlari (undefined bo'lishini oldini olish)
    const heroName = (ws.hero?.student_name || `${ws.hero?.first_name || ''} ${ws.hero?.last_name || ''}`).trim() || 'Aniqlanmoqda';
    const heroPoints = ws.hero?.week_points ?? ws.hero?.score ?? ws.hero?.week_cur ?? 0;
    const heroGroup = ws.hero?.group_code || '—';

    const girlName = (ws.girl?.student_name || `${ws.girl?.first_name || ''} ${ws.girl?.last_name || ''}`).trim() || 'Aniqlanmoqda';
    const girlPoints = ws.girl?.week_points ?? ws.girl?.score ?? ws.girl?.week_cur ?? 0;
    const girlGroup = ws.girl?.group_code || '—';

    const boyName = (ws.boy?.student_name || `${ws.boy?.first_name || ''} ${ws.boy?.last_name || ''}`).trim() || 'Aniqlanmoqda';
    const boyPoints = ws.boy?.week_points ?? ws.boy?.score ?? ws.boy?.week_cur ?? 0;
    const boyGroup = ws.boy?.group_code || '—';

    // Podium HTML generator
    function buildPodiumHtml(list) {
      if (!list || list.length === 0) {
        return `<div class="p-4 text-center text-muted" style="background:#F8FAFC; border-radius:12px;">Hozircha reyting ballari hisoblanmoqda...</div>`;
      }
      const p1 = list[0];
      const p2 = list[1];
      const p3 = list[2];
      const rest = list.slice(3, 10);

      function renderPodiumMini(p, rank) {
        if (!p) {
          return `
            <div class="podium-card rank-${rank}" style="opacity:0.5;">
              <div class="podium-medal">${rank === 1 ? '🥇' : (rank === 2 ? '🥈' : '🥉')}</div>
              <div class="podium-name">—</div>
              <div class="podium-score">0 <span>ball</span></div>
            </div>
          `;
        }
        const initials = `${(p.first_name || '').charAt(0)}${(p.last_name || '').charAt(0)}`.toUpperCase() || 'ST';
        const medal = rank === 1 ? '🥇' : (rank === 2 ? '🥈' : '🥉');
        const levelText = p.level === 'mag' ? 'Magistr' : 'Bakalavr';

        return `
          <div class="podium-card rank-${rank}">
            <div class="podium-photo-box">
              ${p.photo_url ? `
                <img src="${p.photo_url}" alt="${p.first_name}" class="podium-photo-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                <div class="podium-photo-placeholder" style="display:none;">${initials}</div>
              ` : `
                <div class="podium-photo-placeholder">${initials}</div>
              `}
              <div class="podium-badge-medal">${medal}</div>
            </div>
            <div class="podium-name" ${rank === 1 ? 'style="font-size:17px;"' : ''} title="${p.first_name} ${p.last_name}">${p.first_name} ${p.last_name}</div>
            <div style="display:flex; justify-content:center; gap:4px; margin:4px 0 6px;">
              <span class="podium-group" ${rank === 1 ? 'style="background:#FEF3C7; color:#92400E; font-weight:700;"' : ''}>${p.group_code || '—'}</span>
              <span class="badge" style="background:#F1F5F9; color:#475569; font-size:10.5px; padding:2px 6px; border-radius:8px;">${levelText}</span>
            </div>
            <div class="podium-score" ${rank === 1 ? 'style="font-size:22px; color:#D97706;"' : ''}>${p.season || p.total || 0} <span>ball</span></div>
            <div style="font-size:11px; font-weight:700; color:${rank === 1 ? '#B45309' : (rank === 2 ? '#64748B' : '#9A3412')}; margin-top:4px;">
              ${rank === 1 ? '🏆 1-o\'rin (Oltin)' : (rank === 2 ? '2-o\'rin (Kumush)' : '3-o\'rin (Bronza)')}
            </div>
          </div>
        `;
      }

      return `
        <div class="observe-podium-grid">
          ${renderPodiumMini(p2, 2)}
          ${renderPodiumMini(p1, 1)}
          ${renderPodiumMini(p3, 3)}
        </div>

        <!-- 4-10 O'RINLAR -->
        ${rest.length > 0 ? `
          <div style="margin-top: 14px;">
            <div style="font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">
              Top 4 – 10 Yetakchilar Safi
            </div>
            ${rest.map((s, idx) => {
              const inits = `${(s.first_name || '').charAt(0)}${(s.last_name || '').charAt(0)}`.toUpperCase();
              return `
                <div class="leader-item-row" style="display:flex; justify-content:space-between; align-items:center; padding:8px 12px; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; margin-bottom:6px;">
                  <div style="display:flex; align-items:center; gap:10px;">
                    <span class="leader-rank-badge" style="font-weight:800; color:#475569; width:26px;">#${idx + 4}</span>
                    <div style="width:34px; height:34px; border-radius:50%; overflow:hidden; flex-shrink:0;">
                      ${s.photo_url ? `
                        <img src="${s.photo_url}" alt="${s.first_name}" style="width:100%; height:100%; object-fit:cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                        <div style="width:100%; height:100%; background:#EFF6FF; color:#2563EB; display:none; align-items:center; justify-content:center; font-weight:700; font-size:12px;">${inits}</div>
                      ` : `
                        <div style="width:100%; height:100%; background:#EFF6FF; color:#2563EB; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:12px;">${inits}</div>
                      `}
                    </div>
                    <div>
                      <strong style="color:#0F172A; font-size:13.5px;">${s.first_name} ${s.last_name}</strong>
                      <div style="font-size:11.5px; color:#64748B;">${s.program_code || 'Universitet'} • ${s.level === 'mag' ? 'Magistr' : 'Bakalavr'}</div>
                    </div>
                  </div>
                  <div style="display:flex; align-items:center; gap:8px;">
                    <span class="badge badge-light" style="font-size:11.5px; padding:3px 8px; font-weight:700;">${s.group_code || '—'}</span>
                    <strong style="color:#2563EB; font-size:14px;">${s.season || s.total || 0} ball</strong>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        ` : ''}
      `;
    }

    let html = `
      <!-- INSTITUTIONAL HERO BANNER -->
      <div class="observe-hero-banner">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
          <div>
            <div style="display:inline-flex; align-items:center; gap:8px; background:rgba(255,255,255,0.12); padding:4px 12px; border-radius:20px; font-size:12px; font-weight:700; margin-bottom:8px; border:1px solid rgba(255,255,255,0.15);">
              🏛️ AL-XORAZMIY UNIVERSITETI • OCHIQ MONITORING PORTALI
            </div>
            <h2 style="font-size:22px; font-weight:800; margin:0 0 6px; letter-spacing:-0.5px;">Talabalar Faolligi va Yutuqlari Tahlili</h2>
            <p style="margin:0; font-size:13px; color:#94A3B8; max-width:680px;">
              Universitet talabalarining darsdan tashqari faoliyati, ilmiy-innovatsion tashabbuslari, sport va jamoat ishlaridagi yutuqlari bo'yicha rasmiy ochiq statistikasi.
            </p>
          </div>
          <div style="display:flex; gap:10px; align-items:center;">
            <span class="badge" style="background:rgba(16,185,129,0.2); color:#34D399; border:1px solid #10B981; font-weight:700; padding:6px 14px; font-size:12px; border-radius:20px;">
              🟢 Jonli Hisob-kitob
            </span>
            <button class="btn btn-sm" onclick="navigateTo('observe-catalog')" style="background:#FFFFFF; color:#0F172A; border:1px solid #E2E8F0; font-size:12px; font-weight:700; padding:6px 16px; border-radius:20px; display:inline-flex; align-items:center; gap:8px; cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.12); transition:all 0.15s ease;" onmouseenter="this.style.background='#F8FAFC'" onmouseleave="this.style.background='#FFFFFF'">
              <span style="color:#2563EB; display:inline-flex;">${icon('book', 14)}</span>
              <span style="color:#0F172A;">Mezonlar Nizomi</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ASOSIY KPI KO'RSATKICHLAR -->
      <div class="metrics-grid mb-4">
        <div class="stat-card">
          <div class="stat-icon" style="background:#EFF6FF; color:#2563EB;">${icon('users', 20)}</div>
          <div class="stat-data">
            <span class="stat-label">Jami Talabalar</span>
            <h3 class="stat-val">${m.total_students || 0} nafar</h3>
            <span class="stat-sub">Faollik qamrovi: <strong>${m.active_ratio || 0}%</strong></span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background:#FEF3C7; color:#D97706;">${icon('zap', 20)}</div>
          <div class="stat-data">
            <span class="stat-label">Mavsum Ballari</span>
            <h3 class="stat-val">${(m.total_season_points || 0).toLocaleString()} ball</h3>
            <span class="stat-sub">Tasdiqlanish: <strong>${m.approved_ratio || 0}%</strong></span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background:#F0FDF4; color:#16A34A;">${icon('trophy', 20)}</div>
          <div class="stat-data">
            <span class="stat-label">Yetakchi Guruh</span>
            <h3 class="stat-val">${m.top_group || '—'}</h3>
            <span class="stat-sub">Akademik yetakchilik</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background:#F5F3FF; color:#7C3AED;">${icon('target', 20)}</div>
          <div class="stat-data">
            <span class="stat-label">Tadbirlar & Loyihalar</span>
            <h3 class="stat-val">${m.today_events || 0} ta o'tkazildi</h3>
            <span class="stat-sub">QR check-in faol</span>
          </div>
        </div>
      </div>

      <!-- HAFTANING YULDUZLARI (WEEKLY STARS) -->
      <div class="card mb-4" style="background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); color: white; border: 1px solid rgba(251, 191, 36, 0.25); box-shadow: 0 10px 25px rgba(0,0,0,0.15);">
        <div class="card-header" style="border-bottom: 1px solid rgba(255,255,255,0.1); padding: 16px 20px;">
          <div>
            <h3 style="color: #FBBF24; display: flex; align-items: center; gap: 8px; font-size:16px;">
              <span style="color:#D97706;">${icon('star', 16)}</span> HAFTANING ENG FAOL YULDUZLARI
            </h3>
            <span style="font-size: 12px; color: #94A3B8;">Avtomatlashgan haftalik ballar bo'yicha e'tirof etilgan liderlar</span>
          </div>
          <span class="badge" style="background: rgba(245, 158, 11, 0.2); color: #FBBF24; border: 1px solid #F59E0B; font-weight:700;">Joriy Hafta</span>
        </div>
        <div class="card-body" style="padding: 20px;">
          <div class="grid grid-3">
            <div class="weekly-star-card" style="border-left: 4px solid #F59E0B; border: 1px solid rgba(245, 158, 11, 0.25);">
              ${ws.hero?.photo_url ? `
                <img src="${ws.hero.photo_url}" alt="${heroName}" class="weekly-star-avatar" style="border: 2px solid #F59E0B;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                <div class="weekly-star-fallback" style="display:none; background:#FEF3C7; color:#92400E;">${(ws.hero.first_name || 'H').charAt(0)}</div>
              ` : `
                <div class="weekly-star-fallback" style="background:#FEF3C7; color:#92400E; border: 2px solid #FDE68A;">${(ws.hero?.first_name || 'H').charAt(0)}</div>
              `}
              <div style="flex:1; min-width:0;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                  <span style="font-size: 11px; text-transform: uppercase; color: #F59E0B; font-weight: 800; letter-spacing:0.5px;">👑 Hafta Qahramoni</span>
                  <span class="badge" style="background:rgba(245,158,11,0.25); color:#FDE68A; font-size:11px;">+${heroPoints} ball</span>
                </div>
                <h4 style="font-size: 16px; margin: 0 0 2px; font-weight:700; color:#FFFFFF; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${heroName}">${heroName}</h4>
                <p style="font-size: 12px; color: #94A3B8; margin:0;">Guruh: <strong style="color:#F1F5F9;">${heroGroup}</strong></p>
              </div>
            </div>

            <div class="weekly-star-card" style="border-left: 4px solid #EC4899; border: 1px solid rgba(236, 72, 153, 0.25);">
              ${ws.girl?.photo_url ? `
                <img src="${ws.girl.photo_url}" alt="${girlName}" class="weekly-star-avatar" style="border: 2px solid #EC4899;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                <div class="weekly-star-fallback" style="display:none; background:#FCE7F3; color:#BE185D;">${(ws.girl.first_name || 'Q').charAt(0)}</div>
              ` : `
                <div class="weekly-star-fallback" style="background:#FCE7F3; color:#BE185D; border: 2px solid #FBCFE8;">${(ws.girl?.first_name || 'Q').charAt(0)}</div>
              `}
              <div style="flex:1; min-width:0;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                  <span style="font-size: 11px; text-transform: uppercase; color: #EC4899; font-weight: 800; letter-spacing:0.5px;">🌸 Eng Faol Qiz</span>
                  <span class="badge" style="background:rgba(236,72,153,0.25); color:#FBCFE8; font-size:11px;">+${girlPoints} ball</span>
                </div>
                <h4 style="font-size: 16px; margin: 0 0 2px; font-weight:700; color:#FFFFFF; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${girlName}">${girlName}</h4>
                <p style="font-size: 12px; color: #94A3B8; margin:0;">Guruh: <strong style="color:#F1F5F9;">${girlGroup}</strong></p>
              </div>
            </div>

            <div class="weekly-star-card" style="border-left: 4px solid #3B82F6; border: 1px solid rgba(59, 130, 246, 0.25);">
              ${ws.boy?.photo_url ? `
                <img src="${ws.boy.photo_url}" alt="${boyName}" class="weekly-star-avatar" style="border: 2px solid #3B82F6;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                <div class="weekly-star-fallback" style="display:none; background:#EFF6FF; color:#1D4ED8;">${(ws.boy.first_name || 'Y').charAt(0)}</div>
              ` : `
                <div class="weekly-star-fallback" style="background:#EFF6FF; color:#1D4ED8; border: 2px solid #BFDBFE;">${(ws.boy?.first_name || 'Y').charAt(0)}</div>
              `}
              <div style="flex:1; min-width:0;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                  <span style="font-size: 11px; text-transform: uppercase; color: #3B82F6; font-weight: 800; letter-spacing:0.5px;">⚡ Eng Faol Yigit</span>
                  <span class="badge" style="background:rgba(59,130,246,0.25); color:#BFDBFE; font-size:11px;">+${boyPoints} ball</span>
                </div>
                <h4 style="font-size: 16px; margin: 0 0 2px; font-weight:700; color:#FFFFFF; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${boyName}">${boyName}</h4>
                <p style="font-size: 12px; color: #94A3B8; margin:0;">Guruh: <strong style="color:#F1F5F9;">${boyGroup}</strong></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- IKKITA ASOSIY BLOK: TOP 10 YETAKCHILAR & GURUHLAR STANDINGI -->
      <div class="grid grid-2 mb-4">
        <!-- TOP 10 LIDERLAR PODIUMI -->
        <div class="card">
          <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <h3 style="display:flex; align-items:center; gap:8px;">
                <span style="color:#D97706;">${icon('trophy', 16)}</span> Top 10 Yetakchilar Faxriy Doskasi
              </h3>
              <span style="font-size:12px; color:#64748B;">Universitet miqyosida eng yuqori natijalar</span>
            </div>
            <button class="btn btn-outline btn-sm" onclick="navigateTo('observe-rating')">Batafsil Reyting →</button>
          </div>
          <div class="card-body">
            ${buildPodiumHtml(topHall)}
            <div style="margin-top: 16px; padding-top: 12px; border-top: 1px dashed #E2E8F0; font-size: 12px; color: #64748B; display: flex; align-items: center; gap: 6px;">
              🛡️ Ochiq monitoring faqat eng yuqori natija ko'rsatgan Top 10 yetakchilar shaxsiy e'tirofini aks ettiradi.
            </div>
          </div>
        </div>

        <!-- GURUHLAR VA YO'NALISHLAR REYTINGI -->
        <div class="card" style="box-shadow: 0 4px 18px rgba(0,0,0,0.04); border: 1px solid #E2E8F0; border-radius: 16px; overflow: hidden;">
          <div class="card-header" style="display:flex; justify-content:space-between; align-items:center; background:#F8FAFC; padding: 16px 20px; border-bottom: 1px solid #E2E8F0;">
            <div>
              <h3 style="display:flex; align-items:center; gap:8px; margin:0 0 3px; font-size:15px; font-weight:700; color:#0F172A;">
                <span style="color:#2563EB;">${icon('shield', 16)}</span> Akademik Guruhlar Reytingi
              </h3>
              <span style="font-size:12px; color:#64748B;">Universitet guruhlarining o'rtacha ko'rsatkichi</span>
            </div>
            <span class="badge" style="background:#EFF6FF; color:#2563EB; border:1px solid #BFDBFE; font-weight:700; font-size:11.5px; padding:4px 10px; border-radius:12px;">Top 10 Guruh</span>
          </div>
          <div class="card-body p-0">
            ${topGroups.length > 0 ? `
              <div class="table-responsive">
                <table class="table observe-table" style="margin-bottom:0; width:100%;">
                  <thead>
                    <tr style="background:#F8FAFC;">
                      <th style="width: 70px; text-align:center;">O'rin</th>
                      <th>Guruh Kodi</th>
                      <th>Ta'lim Yo'nalishi</th>
                      <th style="text-align:center;">Talabalar Soni</th>
                      <th style="text-align:right;">O'rtacha Ball</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${topGroups.map((g, idx) => {
                      const isTop3 = idx < 3;
                      return `
                        <tr style="${isTop3 ? 'background:#FCFDFE;' : ''}">
                          <td style="text-align:center;">
                            <span class="rank-badge ${idx === 0 ? 'rank-1' : (idx === 1 ? 'rank-2' : (idx === 2 ? 'rank-3' : ''))}">
                              ${idx === 0 ? '🥇' : (idx === 1 ? '🥈' : (idx === 2 ? '🥉' : idx + 1))}
                            </span>
                          </td>
                          <td>
                            <span class="group-code-pill" style="font-weight:800; font-size:12.5px; color:#0F172A; padding:4px 10px;">${g.group_code}</span>
                          </td>
                          <td style="font-size:13px; color:#334155; font-weight:500;">${g.program_code || 'IT'}</td>
                          <td style="text-align:center;">
                            <span class="badge" style="background:#F1F5F9; color:#475569; font-weight:700; font-size:12px; padding:4px 10px; border-radius:12px;">
                              ${g.students_count} nafar
                            </span>
                          </td>
                          <td style="text-align:right;">
                            <span class="score-pill-blue">${g.avg_score} ball</span>
                          </td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            ` : `
              <div class="p-4 text-center text-muted">Guruhlar statistikasi hisoblanmoqda...</div>
            `}
          </div>
        </div>
      </div>

      <!-- FAOLIYAT SOHALARI TAQSIMOTI -->
      <div class="card mb-4">
        <div class="card-header">
          <h3><span style="color:#2563EB;">${icon('activity', 16)}</span> Talabalar Faoliyati Yo'nalishlari Bo'yicha Taqsimot</h3>
          <span style="font-size: 12px; color: var(--text-muted);">Universitet bo'yicha jami tasdiqlangan ballar balansi</span>
        </div>
        <div class="card-body">
          <div class="grid grid-3">
            ${categories.map(c => `
              <div style="background:#F8FAFC; border:1px solid #E2E8F0; padding:16px; border-radius:12px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                  <strong style="color:${c.color || '#3B82F6'}; font-size:13px;">● ${c.name}</strong>
                  <span class="badge badge-light" style="font-weight:700;">${c.total_points || 0} ball</span>
                </div>
                <div style="height:6px; background:#E2E8F0; border-radius:3px; overflow:hidden;">
                  <div style="height:100%; width:${Math.min(100, Math.round(((c.total_points || 0) / (m.total_season_points || 1)) * 100))}%; background:${c.color || '#3B82F6'};"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<div class="card"><p class="text-danger">Dashboard ma'lumotlarini yuklashda xatolik: ${err.message}</p></div>`;
  }
}

// -------------------------------------------------------------
// SAHIFA: YETAKCHILAR FAXRIY DOSKASI (OCHIQ REYTING)
// -------------------------------------------------------------
async function renderObserveRating(container) {
  let currentLevel = 'all'; // Default: Barchasi (Universitet umumiy yetakchilari)

  async function loadData() {
    container.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Yetakchilar ko\'rsatkichlari yuklanmoqda...</p></div>';

    try {
      const data = await apiFetch(`/api/observe/rating?level=${currentLevel}`);
      const list = data.list || data.top_10 || [];
      const groups = data.group_averages || [];

      function buildPodium(items) {
        if (!items || items.length === 0) {
          return '<div class="p-4 text-center text-muted" style="background:#F8FAFC; border-radius:12px; margin-bottom:24px;">Joriy bosqich bo\'yicha reyting hisoblanmoqda...</div>';
        }
        const p1 = items[0];
        const p2 = items[1];
        const p3 = items[2];

        function renderCard(p, rank) {
          if (!p) {
            return `
              <div class="podium-card rank-${rank}" style="opacity:0.5;">
                <div class="podium-medal">${rank === 1 ? '🥇' : (rank === 2 ? '🥈' : '🥉')}</div>
                <div class="podium-name">—</div>
                <div class="podium-score">0 <span>ball</span></div>
                <div style="font-size:11px; color:#64748B; margin-top:4px;">${rank}-o'rin</div>
              </div>
            `;
          }

          const initials = `${(p.first_name || '').charAt(0)}${(p.last_name || '').charAt(0)}`.toUpperCase() || 'ST';
          const medal = rank === 1 ? '🥇' : (rank === 2 ? '🥈' : '🥉');
          const rankTitle = rank === 1 ? '🏆 1-o\'rin (Oltin Lider)' : (rank === 2 ? '🥈 2-o\'rin (Kumush)' : '🥉 3-o\'rin (Bronza)');
          const levelText = p.level === 'mag' ? 'Magistratura' : 'Bakalavriyat';

          return `
            <div class="podium-card rank-${rank}">
              <div class="podium-photo-box">
                ${p.photo_url ? `
                  <img src="${p.photo_url}" alt="${p.first_name}" class="podium-photo-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                  <div class="podium-photo-placeholder" style="display:none;">${initials}</div>
                ` : `
                  <div class="podium-photo-placeholder">${initials}</div>
                `}
                <div class="podium-badge-medal">${medal}</div>
              </div>
              <div class="podium-name" ${rank === 1 ? 'style="font-size:18px;"' : ''} title="${p.first_name} ${p.last_name}">
                ${p.first_name} ${p.last_name}
              </div>
              <div style="display:flex; justify-content:center; gap:6px; margin:4px 0 8px; flex-wrap:wrap;">
                <span class="podium-group" ${rank === 1 ? 'style="background:#FEF3C7; color:#92400E; font-weight:700;"' : ''}>${p.group_code || '—'}</span>
                <span class="badge" style="background:#F1F5F9; color:#475569; font-size:11px; padding:3px 8px; border-radius:10px;">${levelText}</span>
              </div>
              <div class="podium-score" ${rank === 1 ? 'style="font-size:24px; color:#D97706;"' : ''}>
                ${p.season || p.total || 0} <span>ball</span>
              </div>
              <div style="font-size:11.5px; font-weight:700; margin-top:6px; color:${rank === 1 ? '#B45309' : (rank === 2 ? '#475569' : '#9A3412')};">
                ${rankTitle}
              </div>
            </div>
          `;
        }

        return `
          <div class="observe-podium-grid">
            ${renderCard(p2, 2)}
            ${renderCard(p1, 1)}
            ${renderCard(p3, 3)}
          </div>
        `;
      }

      let html = `
        <!-- HEADER -->
        <div class="observe-hero-banner" style="margin-bottom:20px;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px;">
            <div>
              <div style="display:inline-flex; align-items:center; gap:6px; background:rgba(255,255,255,0.12); padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; margin-bottom:6px;">
                🏆 UNIVERSITET FAXRIY DOSKASI
              </div>
              <h2 style="font-size:20px; font-weight:800; margin:0 0 4px;">Top 10 Yetakchilar va Guruhlar Standigi</h2>
              <p style="margin:0; font-size:13px; color:#94A3B8;">
                Eng yuqori shaxsiy faollik ko'rsatkichiga erishgan yetakchi talabalar va akademik guruhlar ligasi.
              </p>
            </div>
            <!-- LEVEL TOGGLE -->
            <div style="display:flex; gap:6px; background:rgba(255,255,255,0.08); padding:4px; border-radius:10px; border:1px solid rgba(255,255,255,0.15);">
              <button class="btn btn-sm" id="btn-toggle-all" style="padding:6px 14px; font-size:12px; font-weight:700; border-radius:8px; border:none; cursor:pointer; transition:all 0.15s ease; ${currentLevel === 'all' ? 'background:#2563EB; color:#FFFFFF;' : 'background:rgba(255,255,255,0.1); color:#E2E8F0;'}">
                🏆 Barchasi
              </button>
              <button class="btn btn-sm" id="btn-toggle-bak" style="padding:6px 14px; font-size:12px; font-weight:700; border-radius:8px; border:none; cursor:pointer; transition:all 0.15s ease; ${currentLevel === 'bak' ? 'background:#2563EB; color:#FFFFFF;' : 'background:rgba(255,255,255,0.1); color:#E2E8F0;'}">
                Bakalavriyat
              </button>
              <button class="btn btn-sm" id="btn-toggle-mag" style="padding:6px 14px; font-size:12px; font-weight:700; border-radius:8px; border:none; cursor:pointer; transition:all 0.15s ease; ${currentLevel === 'mag' ? 'background:#2563EB; color:#FFFFFF;' : 'background:rgba(255,255,255,0.1); color:#E2E8F0;'}">
                Magistratura
              </button>
            </div>
          </div>
        </div>

        <!-- PODIUM -->
        ${buildPodium(list)}

        <!-- TOP 10 JADVALI -->
        <div class="card mb-4" style="box-shadow: 0 4px 18px rgba(0,0,0,0.04); border: 1px solid #E2E8F0; border-radius: 16px; overflow: hidden;">
          <div class="card-header" style="display:flex; justify-content:space-between; align-items:center; background:#F8FAFC; padding: 16px 20px; border-bottom: 1px solid #E2E8F0;">
            <div>
              <h3 style="font-size:15px; margin:0 0 3px; font-weight:700; color:#0F172A; display:flex; align-items:center; gap:8px;">
                <span>🏆</span> ${currentLevel === 'all' ? 'Universitet Bo\'yicha (Umumiy)' : (currentLevel === 'bak' ? 'Bakalavriyat' : 'Magistratura')} — Top 10 Yetakchilar Safi
              </h3>
              <span style="font-size:12px; color:#64748B;">Mavsumiy jamg'arilgan eng yuqori e'tirof ballari</span>
            </div>
            <span class="badge" style="background:#EFF6FF; color:#2563EB; border:1px solid #BFDBFE; font-weight:700; font-size:11.5px; padding:4px 10px; border-radius:12px;">Top 10 Lider</span>
          </div>
          <div class="card-body p-0">
            ${list.length > 0 ? `
              <div class="table-responsive">
                <table class="table observe-table" style="margin-bottom:0; width:100%;">
                  <thead>
                    <tr style="background:#F8FAFC;">
                      <th style="width: 70px; text-align:center;">O'rin</th>
                      <th>Talaba F.I.Sh</th>
                      <th>Akademik Guruh</th>
                      <th>Ta'lim Yo'nalishi & Bosqich</th>
                      <th style="text-align:right;">Mavsumiy Ball</th>
                      <th style="text-align:right;">Jami Jamg'arma</th>
                      <th style="text-align:right;">Haftalik</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${list.map((s, idx) => {
                      const initials = `${(s.first_name || '').charAt(0)}${(s.last_name || '').charAt(0)}`.toUpperCase();
                      const isTop3 = idx < 3;
                      const levelTitle = s.level === 'mag' ? 'Magistratura' : 'Bakalavriyat';
                      return `
                        <tr style="${isTop3 ? 'background:#FCFDFE;' : ''}">
                          <td style="text-align:center;">
                            <span class="rank-badge ${idx === 0 ? 'rank-1' : (idx === 1 ? 'rank-2' : (idx === 2 ? 'rank-3' : ''))}">
                              ${idx === 0 ? '🥇' : (idx === 1 ? '🥈' : (idx === 2 ? '🥉' : idx + 1))}
                            </span>
                          </td>
                          <td>
                            <div style="display:flex; align-items:center; gap:12px;">
                              <div style="width:38px; height:38px; border-radius:50%; overflow:hidden; flex-shrink:0;">
                                ${s.photo_url ? `
                                  <img src="${s.photo_url}" alt="${s.first_name}" style="width:100%; height:100%; object-fit:cover; border:2px solid ${isTop3 ? (idx===0?'#F59E0B':(idx===1?'#94A3B8':'#D97706')) : '#E2E8F0'}; border-radius:50%;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                                  <div style="width:100%; height:100%; border-radius:50%; background:#EFF6FF; color:#2563EB; display:none; align-items:center; justify-content:center; font-weight:700; font-size:13px; border:1.5px solid #DBEAFE;">${initials || 'ST'}</div>
                                ` : `
                                  <div style="width:100%; height:100%; border-radius:50%; background:${idx === 0 ? '#FEF3C7' : (idx === 1 ? '#F1F5F9' : (idx === 2 ? '#FFEDD5' : '#EFF6FF'))}; color:${idx === 0 ? '#92400E' : (idx === 1 ? '#334155' : (idx === 2 ? '#9A3412' : '#2563EB'))}; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:13px; border:1.5px solid ${idx === 0 ? '#FDE68A' : (idx === 1 ? '#E2E8F0' : (idx === 2 ? '#FED7AA' : '#DBEAFE'))};">${initials || 'ST'}</div>
                                `}
                              </div>
                              <div>
                                <div style="font-weight:700; color:#0F172A; font-size:13.5px; letter-spacing:-0.2px;">
                                  ${s.first_name} ${s.last_name}
                                </div>
                                <div style="font-size:11.5px; color:#64748B; margin-top:2px;">
                                  ID: <span style="font-weight:600; color:#475569;">${s.external_id || '-'}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span class="group-code-pill" style="font-weight:700; font-size:12.5px;">${s.group_code || '—'}</span>
                          </td>
                          <td>
                            <div style="font-size:13px; color:#1E293B; font-weight:600;">${s.program_code || 'IT'}</div>
                            <div style="font-size:11.5px; color:#64748B; margin-top:2px; display:flex; gap:4px; align-items:center;">
                              <span class="badge badge-course" style="font-size:11px; padding:2px 7px;">${s.course || 1}-kurs</span>
                              <span class="badge" style="background:#F1F5F9; color:#475569; font-size:10.5px; padding:2px 6px;">${levelTitle}</span>
                            </div>
                          </td>
                          <td style="text-align:right;">
                            <span class="score-pill-blue" style="font-size:13.5px; padding:4px 13px;">${s.season || 0} ball</span>
                          </td>
                          <td style="text-align:right;">
                            <strong style="color:#0F172A; font-size:13.5px;">${s.total || 0} ball</strong>
                          </td>
                          <td style="text-align:right;">
                            <span class="score-pill-green" style="font-size:12px; padding:3px 9px;">+${s.week_cur || 0}</span>
                          </td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            ` : `
              <div class="p-4 text-center text-muted">Yetakchilar ro'yxati hisoblanmoqda...</div>
            `}
          </div>
        </div>

        <!-- GURUHLAR LIGASI -->
        <div class="card mb-4" style="box-shadow: 0 4px 18px rgba(0,0,0,0.04); border: 1px solid #E2E8F0; border-radius: 16px; overflow: hidden;">
          <div class="card-header" style="background:#F8FAFC; padding: 16px 20px; border-bottom: 1px solid #E2E8F0;">
            <h3 style="font-size:15px; margin:0 0 3px; font-weight:700; color:#0F172A; display:flex; align-items:center; gap:8px;">
              <span>🏢</span> Akademik Guruhlar O'rtasidagi Musobaqa Jadvali
            </h3>
            <span style="font-size:12px; color:#64748B;">Guruhdagi talabalar o'rtacha balli va jami jamg'armasi</span>
          </div>
          <div class="card-body p-0">
            ${groups.length > 0 ? `
              <div class="table-responsive">
                <table class="table observe-table" style="margin-bottom:0; width:100%;">
                  <thead>
                    <tr style="background:#F8FAFC;">
                      <th style="width: 70px; text-align:center;">O'rin</th>
                      <th>Guruh Kodi</th>
                      <th>Ta'lim Yo'nalishi</th>
                      <th style="text-align:center;">Talabalar Soni</th>
                      <th style="text-align:right;">O'rtacha Ball</th>
                      <th style="text-align:right;">Jami Ball</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${groups.map((g, idx) => {
                      const isTop3 = idx < 3;
                      return `
                        <tr style="${isTop3 ? 'background:#FCFDFE;' : ''}">
                          <td style="text-align:center;">
                            <span class="rank-badge ${idx === 0 ? 'rank-1' : (idx === 1 ? 'rank-2' : (idx === 2 ? 'rank-3' : ''))}">
                              ${idx === 0 ? '🥇' : (idx === 1 ? '🥈' : (idx === 2 ? '🥉' : idx + 1))}
                            </span>
                          </td>
                          <td>
                            <span class="group-code-pill" style="font-weight:800; font-size:13px; color:#0F172A; padding:4px 12px;">${g.group_code}</span>
                          </td>
                          <td style="font-size:13.5px; color:#334155; font-weight:600;">${g.program_code || 'IT'}</td>
                          <td style="text-align:center;">
                            <span class="badge" style="background:#F1F5F9; color:#475569; font-weight:700; font-size:12px; padding:4px 11px; border-radius:12px;">
                              ${g.count || 0} nafar
                            </span>
                          </td>
                          <td style="text-align:right;">
                            <span class="score-pill-blue" style="font-size:13px; font-weight:800;">${g.avg_score || 0} ball</span>
                          </td>
                          <td style="text-align:right;">
                            <strong style="color:#0F172A; font-size:13.5px;">${g.total_score || 0} ball</strong>
                          </td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            ` : `
              <div class="p-4 text-center text-muted">Guruhlar statistikasi hisoblanmoqda...</div>
            `}
          </div>
        </div>

        <!-- MAXFIYLIK VA RASMIY ME'YOR BILDIRISHNOMASI -->
        <div class="alert-box mb-4" style="background:#EFF6FF; border:1px solid #BFDBFE; padding:16px 20px; border-radius:12px; display:flex; align-items:flex-start; gap:12px;">
          <div style="color:#2563EB; font-size:20px; line-height:1;">🛡️</div>
          <div>
            <h4 style="margin:0 0 4px; font-size:14px; color:#1E40AF; font-weight:700;">Rasmiy Ochiq Monitoring Nizomi</h4>
            <p style="margin:0; font-size:13px; color:#1E3A8A; line-height:1.5;">
              Universitet ochiq monitoringi talabalar shaxsiy ma'lumotlarini himoya qilish va sog'lom raqobatni rag'batlantirish maqsadida faqat eng yuqori natija ko'rsatgan 10 nafar talaba va akademik guruhlar reytingini taqdim etadi. Barcha talabalar o'z shaxsiy ballari va reytinglarini Talaba Mini App orqali kuzatib boradilar.
            </p>
          </div>
        </div>
      `;

      container.innerHTML = html;

      // Event listenerlar
      document.getElementById('btn-toggle-all')?.addEventListener('click', () => {
        currentLevel = 'all';
        loadData();
      });
      document.getElementById('btn-toggle-bak')?.addEventListener('click', () => {
        currentLevel = 'bak';
        loadData();
      });
      document.getElementById('btn-toggle-mag')?.addEventListener('click', () => {
        currentLevel = 'mag';
        loadData();
      });

    } catch (err) {
      container.innerHTML = `<div class="card"><p class="text-danger">Ma'lumotlarni yuklashda xatolik: ${err.message}</p></div>`;
    }
  }

  loadData();
}

// -------------------------------------------------------------
// SAHIFA: TALABALAR KATALOGI (K-02)
// -------------------------------------------------------------
// -------------------------------------------------------------
// SAHIFA: TALABALAR RO'YXATI (KUZATUV & KATALOG)
// -------------------------------------------------------------
let observeStudentsState = {
  search: '',
  group: '',
  course: '',
  gender: '',
  page: 1,
  limit: 50,
  total: 0,
  students: []
};

async function renderObserveStudents(container) {
  container.innerHTML = `
    <!-- HERO BANNER -->
    <div class="admin-hero-card" style="margin-bottom: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
        <div>
          <div class="admin-hero-title">
            <span style="color: #60A5FA;">${icon('users', 22)}</span>
            <span>Talabalar Katalogi & Reyting Ro'yxati</span>
          </div>
          <p class="admin-hero-desc">
            Universitetning barcha talabalari to'liq ro'yxati, guruhlar, joriy mavsum ballari va faollik ko'rsatkichlari.
            Ixtiyoriy talaba satri ustiga bosib batafsil profilini ko'rishingiz mumkin.
          </p>
        </div>
      </div>
    </div>

    <!-- QIDIRUV VA FILTRLAR -->
    <div class="admin-toolbar">
      <div class="admin-search-box">
        ${icon('search', 16)}
        <input type="text" id="obs-students-search" class="admin-search-input" placeholder="Ism, familiya, ID, guruh yoki telefon bo'yicha qidiruv...">
      </div>
      <div class="admin-filters-group">
        <select id="obs-students-course" class="admin-filter-select">
          <option value="">Barcha kurslar</option>
          <option value="1">1-kurs</option>
          <option value="2">2-kurs</option>
          <option value="3">3-kurs</option>
          <option value="4">4-kurs</option>
        </select>
        <select id="obs-students-gender" class="admin-filter-select">
          <option value="">Barcha jinslar</option>
          <option value="m">Erkak</option>
          <option value="f">Ayol</option>
        </select>
        <button class="btn btn-outline btn-sm" onclick="resetObserveStudentFilters()" style="display: inline-flex; align-items: center; gap: 4px;">
          ${icon('refresh', 13)} Tozalash
        </button>
      </div>
    </div>

    <!-- JADVAL KARTASI -->
    <div class="card">
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 130px;">Talaba ID</th>
              <th>Talaba (F.I.Sh)</th>
              <th>Guruh & Yo'nalish</th>
              <th>Kurs</th>
              <th>Telefon Raqami</th>
              <th>Telegram</th>
              <th>Mavsum Balli</th>
              <th>Jami Ball</th>
              <th style="text-align: right; width: 100px;">Profil</th>
            </tr>
          </thead>
          <tbody id="obs-students-table-body">
            <tr>
              <td colspan="9" style="text-align: center; padding: 40px; color: var(--text-muted);">
                <div class="spinner" style="margin-bottom: 8px;"></div>
                <p>Talabalar ro'yxati yuklanmoqda...</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- PAGINATION -->
      <div class="pagination-bar" id="obs-students-pagination-bar">
        <span id="obs-students-page-info">0 ta ma'lumot</span>
        <div style="display: flex; gap: 8px; align-items: center;">
          <button class="btn btn-outline btn-sm" id="btn-obs-prev" onclick="prevObsStudentPage()" disabled>Oldingi</button>
          <span id="obs-students-page-num" style="font-weight: 600; padding: 0 6px;">1</span>
          <button class="btn btn-outline btn-sm" id="btn-obs-next" onclick="nextObsStudentPage()" disabled>Keyingi</button>
        </div>
      </div>
    </div>
  `;

  // Search input debounce
  const sInput = document.getElementById('obs-students-search');
  let timer;
  sInput.addEventListener('input', (e) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      observeStudentsState.search = e.target.value.trim();
      observeStudentsState.page = 1;
      loadObserveStudentsList();
    }, 350);
  });

  document.getElementById('obs-students-course').addEventListener('change', (e) => {
    observeStudentsState.course = e.target.value;
    observeStudentsState.page = 1;
    loadObserveStudentsList();
  });

  document.getElementById('obs-students-gender').addEventListener('change', (e) => {
    observeStudentsState.gender = e.target.value;
    observeStudentsState.page = 1;
    loadObserveStudentsList();
  });

  await loadObserveStudentsList();
}

function resetObserveStudentFilters() {
  observeStudentsState.search = '';
  observeStudentsState.course = '';
  observeStudentsState.gender = '';
  observeStudentsState.page = 1;

  const s = document.getElementById('obs-students-search');
  if (s) s.value = '';
  const c = document.getElementById('obs-students-course');
  if (c) c.value = '';
  const g = document.getElementById('obs-students-gender');
  if (g) g.value = '';

  loadObserveStudentsList();
}

function prevObsStudentPage() {
  if (observeStudentsState.page > 1) {
    observeStudentsState.page--;
    loadObserveStudentsList();
  }
}

function nextObsStudentPage() {
  const maxPage = Math.ceil(observeStudentsState.total / observeStudentsState.limit);
  if (observeStudentsState.page < maxPage) {
    observeStudentsState.page++;
    loadObserveStudentsList();
  }
}

async function loadObserveStudentsList() {
  const tbody = document.getElementById('obs-students-table-body');
  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="9" style="text-align: center; padding: 40px; color: var(--text-muted);">
        <div class="spinner" style="margin-bottom: 8px;"></div>
        <p>Ma'lumotlar yangilanmoqda...</p>
      </td>
    </tr>
  `;

  try {
    const params = new URLSearchParams({
      page: observeStudentsState.page,
      limit: observeStudentsState.limit
    });
    if (observeStudentsState.search) params.append('search', observeStudentsState.search);
    if (observeStudentsState.course) params.append('course', observeStudentsState.course);
    if (observeStudentsState.gender) params.append('gender', observeStudentsState.gender);

    const res = await apiFetch(`/api/observe/students?${params.toString()}`);
    const students = res.students || [];
    observeStudentsState.total = res.total || 0;
    observeStudentsState.students = students;

    // Pagination info
    const startIdx = observeStudentsState.total === 0 ? 0 : (observeStudentsState.page - 1) * observeStudentsState.limit + 1;
    const endIdx = Math.min(observeStudentsState.page * observeStudentsState.limit, observeStudentsState.total);
    const maxPage = Math.ceil(observeStudentsState.total / observeStudentsState.limit) || 1;

    const pageInfo = document.getElementById('obs-students-page-info');
    const pageNum = document.getElementById('obs-students-page-num');
    const btnPrev = document.getElementById('btn-obs-prev');
    const btnNext = document.getElementById('btn-obs-next');

    if (pageInfo) pageInfo.textContent = `${startIdx}-${endIdx} dan ${observeStudentsState.total} ta`;
    if (pageNum) pageNum.textContent = `${observeStudentsState.page} / ${maxPage}`;
    if (btnPrev) btnPrev.disabled = observeStudentsState.page <= 1;
    if (btnNext) btnNext.disabled = observeStudentsState.page >= maxPage;

    if (students.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; padding: 48px; color: var(--text-muted);">
            <div style="font-size: 32px; color: #94A3B8; margin-bottom: 8px;">${icon('users', 32)}</div>
            <p style="font-size: 14px; font-weight: 600; color: var(--text-main);">Talabalar topilmadi</p>
            <p style="font-size: 12px; margin-top: 4px;">Qidiruv parametrlarini o'zgartirib ko'ring.</p>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = students.map(s => {
      const isFemale = s.gender === 'female' || s.gender === 'f';
      const initials = `${(s.first_name || '').charAt(0)}${(s.last_name || '').charAt(0)}`.toUpperCase();
      const photoHtml = s.photo_url
        ? `<img src="${s.photo_url}" class="avatar-badge" style="object-fit: cover; border: 1px solid #CBD5E1; width: 34px; height: 34px; border-radius: 50%;" alt="${s.first_name}">`
        : `<span class="avatar-badge ${isFemale ? 'female' : ''}">${initials || 'ST'}</span>`;

      return `
        <tr class="student-table-row" onclick="showStudentDetailsModal('${s.id}')" style="cursor: pointer;" title="Batafsil profilni ko'rish uchun bosing">
          <td>
            <span class="badge badge-group">${s.external_id || '-'}</span>
          </td>
          <td>
            <div class="table-student-name">
              ${photoHtml}
              <div>
                <div style="font-weight: 600; color: var(--text-main); font-size: 13px;">${s.first_name} ${s.last_name}</div>
                <div class="table-sub-text">${s.email || 'Email biriktirilmagan'}</div>
              </div>
            </div>
          </td>
          <td>
            <div style="font-weight: 600; font-size: 12px;">${s.group_code || '-'}</div>
            <div class="table-sub-text">${s.program_code || 'IT'}</div>
          </td>
          <td>
            <span class="badge badge-course">${s.course || 1}-kurs</span>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 6px; font-size: 12px;">
              <span style="color: #64748B;">${icon('phone', 12)}</span>
              <span>${s.phone || '-'}</span>
            </div>
          </td>
          <td>
            ${s.telegram_user_id
              ? `<span class="status-badge badge-active">${icon('checkCircle', 12)} Ulangan</span>`
              : `<span class="status-badge badge-neutral">${icon('xCircle', 12)} Ulanmagan</span>`}
          </td>
          <td>
            <strong style="color: #2563EB; font-size: 13.5px;">${s.season || 0}</strong> <span style="font-size: 11px; color: var(--text-muted);">ball</span>
          </td>
          <td>
            <span style="font-weight: 600; font-size: 12.5px; color: var(--text-main);">${s.total || 0}</span>
          </td>
          <td style="text-align: right;" onclick="event.stopPropagation()">
            <button class="btn btn-outline btn-sm" onclick="showStudentDetailsModal('${s.id}')" style="display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; font-size: 11.5px;">
              ${icon('eye', 13)} Profil
            </button>
          </td>
        </tr>
      `;
    }).join('');

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 24px; color: var(--danger);">Xatolik: ${err.message}</td></tr>`;
  }
}


// -------------------------------------------------------------
// SAHIFA: TADBIRLAR & QR (B-04, Q-10)
// -------------------------------------------------------------
async function renderObserveEvents(container) {
  try {
    const data = await apiFetch('/api/events');
    const events = data.events || [];

    let html = `
      <div class="grid grid-2">
        ${events.map(ev => `
          <div class="card mb-3">
            <div class="card-header">
              <div>
                <span class="badge" style="background: ${ev.category_color}20; color: ${ev.category_color}; border: 1px solid ${ev.category_color};">
                  ${ev.category_name}
                </span>
                <h3 style="margin-top: 6px; font-size: 16px;">${ev.title}</h3>
              </div>
              <span class="badge badge-primary" style="font-size: 14px;">+${ev.points} ball</span>
            </div>
            <div class="card-body">
              <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 8px;">
                ${icon('mapPin', 13)} <strong>Joy:</strong> ${ev.place} &nbsp;|&nbsp; 
                ${icon('building', 13)} <strong>Tashkilotchi:</strong> ${ev.organizer_unit}
              </p>
              <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 12px;">
                ${icon('clock', 13)} <strong>Boshlanish:</strong> ${new Date(ev.starts_at).toLocaleString('uz-UZ')}
              </p>
              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); padding-top: 12px;">
                <span style="font-size: 12px; color: var(--text-muted);">
                  Check-in: <strong>${ev.checkins_count || 0}</strong> nafar
                  ${ev.capacity ? `/ ${ev.capacity} ta o'rin` : ''}
                </span>
                <button class="btn btn-outline btn-sm" onclick="showEventQrModal('${ev.id}')">
                  ${icon('qrCode', 14)} QR Kodni Ko'rish
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<div class="card"><p class="text-danger">${err.message}</p></div>`;
  }
}

// -------------------------------------------------------------
// -------------------------------------------------------------
// SAHIFA: BALL KATALOGI v1.0 (RASMIY MEZONLAR VA SHKALA)
// -------------------------------------------------------------
let observeCatalogState = {
  search: '',
  categoryId: '',
  categories: [],
  items: [],
  scale: []
};

async function renderObserveCatalog(container) {
  try {
    const data = await apiFetch('/api/observe/catalog');
    observeCatalogState.categories = data.categories || [];
    observeCatalogState.items = data.items || [];
    observeCatalogState.scale = data.scale || [];

    const categories = observeCatalogState.categories;
    const scale = observeCatalogState.scale;

    container.innerHTML = `
      <!-- HERO BANNER -->
      <div class="admin-hero-card" style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
          <div>
            <div class="admin-hero-title">
              <span style="color: #60A5FA;">${icon('fileText', 22)}</span>
              <span>Al-Xorazmiy Universiteti Talabalar Faolligi Ball Katalogi (v1.0)</span>
            </div>
            <p class="admin-hero-desc">
              Talabalarning ilmiy, madaniy, sport, jamoat va akademik yutuqlarini baholash mezonlari, 
              ball shkalasi va tasdiqlovchi mas'ul bo'limlar ro'yxati.
            </p>
          </div>
        </div>
      </div>

      <!-- SOHALAR (KATEGORIYALAR) KARTALARI -->
      <div class="card mb-4">
        <div class="card-header" style="background: #F8FAFC; border-bottom: 1px solid var(--border-light);">
          <h3 style="font-size: 15px; font-weight: 700; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
            ${icon('building', 16)} Faoliyat Sohalari (Kategoriyalar - 9 ta yo'nalish)
          </h3>
        </div>
        <div class="card-body">
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px;">
            ${categories.map(c => {
              const catItemsCount = observeCatalogState.items.filter(it => it.category_id === c.id).length;
              return `
                <div style="border: 1px solid var(--border-light); border-left: 4px solid ${c.color || '#2563EB'}; border-radius: var(--radius-md); padding: 14px; background: #FFFFFF; box-shadow: var(--shadow-sm);">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                    <h4 style="font-size: 14px; font-weight: 700; color: var(--text-main); margin: 0;">${c.name}</h4>
                    <span class="badge" style="background: ${c.color || '#2563EB'}15; color: ${c.color || '#2563EB'}; font-size: 11px; font-weight: 700;">#${c.id}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; font-size: 12px; color: var(--text-secondary);">
                    <span>Mas'ul: <strong>${formatApproverRole(c.approver_role) || 'Rektorat'}</strong></span>
                    <span class="badge badge-light" style="font-size: 11px;">${catItemsCount} ta mezon</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- MUSOBAQALAR VA TANLOVLAR SHKALASI MATRIX -->
      <div class="card mb-4">
        <div class="card-header" style="background: #F8FAFC; border-bottom: 1px solid var(--border-light);">
          <h3 style="font-size: 15px; font-weight: 700; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
            ${icon('trophy', 16)} Musobaqalar, Tanlovlar va Konkurslar Shkalasi (Matrix)
          </h3>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 180px;">Daraja (Level)</th>
                <th>Ishtirokchi (Nominal)</th>
                <th>Sovrindor (2-3 o'rin)</th>
                <th>G'olib (1-o'rin)</th>
              </tr>
            </thead>
            <tbody>
              ${['universitet', 'viloyat', 'respublika', 'xalqaro'].map(lvl => {
                const isht = scale.find(s => s.level === lvl && s.role === 'ishtirok')?.points || 0;
                const sovr = scale.find(s => s.level === lvl && s.role === 'sovrindor')?.points || 0;
                const gol = scale.find(s => s.level === lvl && s.role === 'golib')?.points || 0;
                let lvlLabel = lvl.toUpperCase();
                let lvlColor = '#475569';
                if (lvl === 'universitet') lvlColor = '#2563EB';
                else if (lvl === 'viloyat') lvlColor = '#D97706';
                else if (lvl === 'respublika') lvlColor = '#059669';
                else if (lvl === 'xalqaro') lvlColor = '#7C3AED';

                return `
                  <tr>
                    <td>
                      <span class="badge" style="background: ${lvlColor}15; color: ${lvlColor}; border: 1px solid ${lvlColor}30; font-size: 12px; font-weight: 700;">
                        ${lvlLabel}
                      </span>
                    </td>
                    <td>
                      <div style="font-weight: 700; color: var(--text-main); font-size: 13px;">+${isht} ball</div>
                      <div class="table-sub-text">±20% koridor: ${Math.round(isht*0.8)} - ${Math.round(isht*1.2)} ball</div>
                    </td>
                    <td>
                      <div style="font-weight: 700; color: #D97706; font-size: 13px;">+${sovr} ball</div>
                      <div class="table-sub-text">±20% koridor: ${Math.round(sovr*0.8)} - ${Math.round(sovr*1.2)} ball</div>
                    </td>
                    <td>
                      <div style="font-weight: 700; color: #059669; font-size: 13px;">+${gol} ball</div>
                      <div class="table-sub-text">±20% koridor: ${Math.round(gol*0.8)} - ${Math.round(gol*1.2)} ball</div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- KATALOG BANDLARI RO'YXATI -->
      <div class="card">
        <div class="card-header" style="background: #F8FAFC; border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <h3 style="font-size: 15px; font-weight: 700; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
            ${icon('fileSpreadsheet', 16)} Katalog Bandlari va Mezonlar Ro'yxati (${observeCatalogState.items.length} ta mezon)
          </h3>
          <div style="display: flex; gap: 10px; align-items: center;">
            <select id="obs-catalog-filter-cat" class="form-select" style="width: auto; font-size: 12px; padding: 6px 10px;">
              <option value="">Barcha sohalar</option>
              ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
            </select>
            <input type="text" id="obs-catalog-filter-search" class="form-control" placeholder="Mezon nomi bo'yicha..." style="font-size: 12px; padding: 6px 10px; width: 200px;">
          </div>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 70px;">ID</th>
                <th>Soha / Kategoriya</th>
                <th>Mezon (Band Nomi)</th>
                <th>Baza Balli</th>
                <th>Turi</th>
                <th>Dalil Talabi</th>
                <th>Tasdiqlovchi Bo'lim</th>
              </tr>
            </thead>
            <tbody id="obs-catalog-table-body">
              <!-- Dynamically populated -->
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Filter events
    document.getElementById('obs-catalog-filter-cat').addEventListener('change', (e) => {
      observeCatalogState.categoryId = e.target.value;
      renderObserveCatalogTable();
    });

    document.getElementById('obs-catalog-filter-search').addEventListener('input', (e) => {
      observeCatalogState.search = e.target.value.trim().toLowerCase();
      renderObserveCatalogTable();
    });

    renderObserveCatalogTable();

  } catch (err) {
    container.innerHTML = `<div class="card"><p class="text-danger">${err.message}</p></div>`;
  }
}

function renderObserveCatalogTable() {
  const tbody = document.getElementById('obs-catalog-table-body');
  if (!tbody) return;

  let filtered = observeCatalogState.items;
  if (observeCatalogState.categoryId) {
    filtered = filtered.filter(it => String(it.category_id) === String(observeCatalogState.categoryId));
  }
  if (observeCatalogState.search) {
    const q = observeCatalogState.search;
    filtered = filtered.filter(it => (it.name || '').toLowerCase().includes(q));
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 32px; color: var(--text-muted);">Mezonlar topilmadi</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(it => {
    const catColor = it.category_color || '#2563EB';
    const catName = it.category_name || `Kategoriya #${it.category_id}`;

    return `
      <tr>
        <td><span class="badge badge-group">#${it.id}</span></td>
        <td>
          <span class="badge" style="background: ${catColor}15; color: ${catColor}; border: 1px solid ${catColor}30; font-weight: 600;">
            ${catName}
          </span>
        </td>
        <td>
          <div style="font-weight: 600; color: var(--text-main); font-size: 13px;">${it.name}</div>
        </td>
        <td>
          ${it.is_scale 
            ? `<span class="badge badge-course" style="font-weight: 700;">Shkala bo'yicha</span>` 
            : (it.base_points !== null ? `<span style="font-weight: 700; color: #2563EB; font-size: 13px;">+${it.base_points} ball</span>` : '-')}
        </td>
        <td>
          ${it.is_auto 
            ? '<span class="badge badge-active">Avtomatik</span>' 
            : (it.is_scale ? '<span class="badge badge-warning">Musobaqa</span>' : '<span class="badge badge-neutral">Arizaviy</span>')}
        </td>
        <td>
          <span style="font-size: 11.5px; color: var(--text-secondary);">${it.evidence_hint || 'Majburiy emas'}</span>
        </td>
        <td>
          <span class="badge badge-group" style="font-weight: 600;">${formatApproverRole(it.approver_role)}</span>
        </td>
      </tr>
    `;
  }).join('');
}


// -------------------------------------------------------------
// SAHIFA: TYUTORNING TALABALARI (T-01, T-05)
// -------------------------------------------------------------
window.tutorStudentsCache = [];

async function renderTutorStudents(container) {
  try {
    const summary = await apiFetch('/api/tutor/summary');
    const studRes = await apiFetch('/api/tutor/students');
    const students = studRes.students || [];
    window.tutorStudentsCache = students;

    let html = `
      <div class="metrics-grid mb-4">
        <div class="stat-card">
          <div class="stat-icon" style="background:#EFF6FF; color:#2563EB;">${icon('users', 20)}</div>
          <div class="stat-data">
            <span class="stat-label">Guruh Talabalari</span>
            <h3 class="stat-val">${summary.total_students} nafar</h3>
            <span class="stat-sub">Guruhlar: ${(summary.groups || []).join(', ') || '-'}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background:#ECFDF5; color:#059669;">${icon('checkCircle', 20)}</div>
          <div class="stat-data">
            <span class="stat-label">Faol Talabalar (30+)</span>
            <h3 class="stat-val">${summary.active_students} nafar</h3>
            <span class="stat-sub">Ulush: ${summary.active_ratio}%</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background:#FEF3C7; color:#D97706;">${icon('fileText', 20)}</div>
          <div class="stat-data">
            <span class="stat-label">Bugungi Limit (R-06)</span>
            <h3 class="stat-val">${summary.today_limit.used} / ${summary.today_limit.max}</h3>
            <span class="stat-sub">Qolgan ruxsat: <strong>${summary.today_limit.remaining} ta</strong></span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background:#FEF2F2; color:#DC2626;">${icon('clock', 20)}</div>
          <div class="stat-data">
            <span class="stat-label">Passiv Talabalar</span>
            <h3 class="stat-val">${summary.passive_students_count} nafar</h3>
            <span class="stat-sub text-danger">14 kundan beri harakatsiz</span>
          </div>
        </div>
      </div>

      <!-- Qidiruv va Filtrlar paneli -->
      <div class="admin-toolbar mb-3" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; background: white; padding: 12px 18px; border-radius: var(--radius-md); border: 1px solid var(--border-light); box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
        <div style="display: flex; align-items: center; gap: 10px; flex: 1; max-width: 360px;">
          <div class="admin-search-box" style="width: 100%;">
            ${icon('search', 16)}
            <input type="text" id="tutor-student-search" class="admin-search-input" placeholder="F.I.Sh yoki Talaba ID bo'yicha qidiruv..." oninput="handleTutorStudentFilter()">
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
          <select id="tutor-group-filter" class="form-select form-select-sm" onchange="handleTutorStudentFilter()" style="min-width: 130px; font-size: 13px;">
            <option value="">Barcha guruhlar</option>
            ${(summary.groups || []).map(g => `<option value="${g}">${g}</option>`).join('')}
          </select>
          <select id="tutor-status-filter" class="form-select form-select-sm" onchange="handleTutorStudentFilter()" style="min-width: 130px; font-size: 13px;">
            <option value="">Barcha holatlar</option>
            <option value="active">Faol talabalar</option>
            <option value="passive">Passiv talabalar</option>
          </select>
          <button class="btn btn-primary btn-sm" onclick="navigateTo('tutor-add-points')" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px;">
            ${icon('userPlus', 14)} <span>Ball Kiritish</span>
          </button>
        </div>
      </div>

      <div style="margin-bottom: 10px; font-size: 12px; color: var(--text-muted); display: flex; align-items: center; gap: 6px;">
        <span style="color: var(--color-primary);">${icon('info', 14)}</span>
        <span>Talabaning ballar tarixi va batafsil profilini ko'rish uchun uning qatoriga bosing</span>
      </div>

      <div class="card" style="box-shadow: var(--shadow-sm); border: 1px solid var(--border-light);">
        <div class="table-responsive">
          <table class="data-table" id="tutor-students-table">
            <thead>
              <tr>
                <th style="width: 45px; text-align: center;">#</th>
                <th>Talaba F.I.Sh</th>
                <th style="width: 110px;">Guruh</th>
                <th>Kurs & Yo'nalish</th>
                <th style="width: 120px;">Mavsumiy Ball</th>
                <th style="width: 100px;">Joriy Hafta</th>
                <th style="width: 100px;">Holati</th>
                <th style="width: 150px; text-align: center;">Amallar</th>
              </tr>
            </thead>
            <tbody id="tutor-students-tbody">
              ${renderTutorTableRowsHtml(students)}
            </tbody>
          </table>
        </div>
      </div>
    `;
    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<div class="card"><p class="text-danger">${err.message}</p></div>`;
  }
}

function renderTutorTableRowsHtml(list) {
  if (!list || list.length === 0) {
    return `
      <tr>
        <td colspan="8" style="text-align: center; padding: 36px; color: var(--text-muted);">
          Talabalar topilmadi
        </td>
      </tr>
    `;
  }

  return list.map((s, idx) => {
    const rawFullName = `${s.first_name || ''} ${s.last_name || ''}`.trim();
    const initials = `${(s.first_name || 'T').charAt(0)}${(s.last_name || '').charAt(0)}`.toUpperCase();
    const isFemale = s.gender === 'female' || s.gender === 'f';
    const isPassive = Boolean(s.is_passive);

    const avatarHtml = s.photo_url
      ? `<img src="${s.photo_url}" class="avatar-badge" style="object-fit: cover; width: 34px; height: 34px; border-radius: 50%; border: 1px solid var(--border-light);" alt="${s.first_name}" onerror="this.outerHTML='<span class=\\'avatar-badge ${isFemale ? 'female' : ''}\\'>${initials}</span>'">`
      : `<span class="avatar-badge ${isFemale ? 'female' : ''}" style="width: 34px; height: 34px; font-size: 13px;">${initials}</span>`;

    return `
      <tr class="tutor-table-row" onclick="showStudentModal('${s.id}')" style="cursor: pointer; transition: background-color 0.15s ease;" title="Tarix va ma'lumotlarni ko'rish uchun bosing">
        <td style="text-align: center; color: var(--text-muted); font-size: 12px; font-weight: 500;">${idx + 1}</td>
        <td>
          <div style="display: flex; align-items: center; gap: 10px;">
            ${avatarHtml}
            <div>
              <div style="font-weight: 600; color: var(--text-main); font-size: 13.5px; line-height: 1.3;">${rawFullName}</div>
              <div style="font-size: 11.5px; color: var(--text-muted); font-family: monospace;">${s.external_id || s.id}</div>
            </div>
          </div>
        </td>
        <td><span class="badge badge-group">${s.group_code || '-'}</span></td>
        <td>
          <div style="font-size: 12.5px; color: var(--text-main); font-weight: 500;">${s.course ? `${s.course}-kurs` : '-'}</div>
          <div style="font-size: 11px; color: var(--text-muted);">${s.program_code || ''}</div>
        </td>
        <td>
          <span style="font-weight: 700; color: #2563EB; font-size: 14px;">${s.season || 0}</span>
          <span style="font-size: 11.5px; color: var(--text-muted);"> ball</span>
        </td>
        <td>
          <span style="font-weight: 600; color: ${(s.week_cur || 0) > 0 ? '#059669' : 'var(--text-muted)'}; font-size: 13px;">
            ${(s.week_cur || 0) > 0 ? `+${s.week_cur}` : '0'}
          </span>
        </td>
        <td>
          ${isPassive 
            ? `<span class="status-badge" style="background: #FEF3C7; color: #B45309; border: 1px solid #FDE68A;">Passiv</span>` 
            : `<span class="status-badge badge-active">Faol</span>`}
        </td>
        <td style="text-align: center;" onclick="event.stopPropagation()">
          <div style="display: inline-flex; align-items: center; gap: 6px;">
            <button class="btn btn-sm btn-outline" onclick="showStudentModal('${s.id}')" title="Batafsil ko'rish" style="padding: 4px 8px; font-size: 12px; display: inline-flex; align-items: center; gap: 4px;">
              ${icon('eye', 13)}
            </button>
            <button class="btn btn-sm btn-primary" onclick="showEditStudentModal('${s.id}')" title="Talabani tahrirlash" style="padding: 4px 10px; font-size: 12px; display: inline-flex; align-items: center; gap: 4px; background: #2563EB; border-color: #2563EB;">
              ${icon('edit', 13)} <span>Tahrirlash</span>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function handleTutorStudentFilter() {
  const q = (document.getElementById('tutor-student-search')?.value || '').trim().toLowerCase();
  const group = document.getElementById('tutor-group-filter')?.value || '';
  const status = document.getElementById('tutor-status-filter')?.value || '';

  let list = window.tutorStudentsCache || [];

  if (q) {
    list = list.filter(s => 
      `${s.first_name || ''} ${s.last_name || ''}`.toLowerCase().includes(q) ||
      (s.external_id || '').toLowerCase().includes(q) ||
      (s.phone || '').includes(q)
    );
  }

  if (group) {
    list = list.filter(s => s.group_code === group);
  }

  if (status === 'active') {
    list = list.filter(s => !s.is_passive);
  } else if (status === 'passive') {
    list = list.filter(s => s.is_passive);
  }

  const tbody = document.getElementById('tutor-students-tbody');
  if (tbody) {
    tbody.innerHTML = renderTutorTableRowsHtml(list);
  }
}

// -------------------------------------------------------------
// DALIL HUJJATLARI PREVIEW YORDAMCHISI (THUMBNAIL & LINK)
// -------------------------------------------------------------
function renderEvidenceThumbnailHtml(url, originalName) {
  if (!url) return '';
  const cleanUrl = String(url).trim();
  const isImage = (/\.(jpg|jpeg|png|webp|gif)($|\?)/i.test(cleanUrl) || cleanUrl.startsWith('data:image/'));
  const isPdf = /\.pdf($|\?)/i.test(cleanUrl);
  const displayName = originalName || cleanUrl.split('/').pop().split('?')[0] || 'Hujjat fayli';

  if (isImage) {
    return `
      <div style="display: flex; align-items: center; gap: 12px; margin-top: 6px; padding: 8px 12px; background: #F8FAFC; border: 1px solid #CBD5E1; border-radius: 8px;">
        <a href="${cleanUrl}" target="_blank" title="Kattalashtirib ko'rish" style="display: block; flex-shrink: 0;">
          <img src="${cleanUrl}" style="width: 58px; height: 58px; object-fit: cover; border-radius: 6px; border: 1px solid #94A3B8; box-shadow: 0 1px 4px rgba(0,0,0,0.1);" alt="Dalil fotosurati">
        </a>
        <div style="flex: 1; min-width: 0;">
          <div style="font-weight: 600; font-size: 13px; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${displayName}">${displayName}</div>
          <div style="font-size: 11px; color: var(--text-muted);">Dalil fotosurati / skanerlangan rasm</div>
          <a href="${cleanUrl}" target="_blank" class="btn btn-outline btn-sm" style="margin-top: 5px; padding: 2px 8px; font-size: 11.5px; display: inline-flex; align-items: center; gap: 4px; background: white; color: #2563EB; border-color: #93C5FD;">
            ${icon('eye', 12)} To'liq ochish
          </a>
        </div>
      </div>
    `;
  }

  if (isPdf) {
    return `
      <div style="display: flex; align-items: center; gap: 12px; margin-top: 6px; padding: 8px 12px; background: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px;">
        <div style="width: 48px; height: 48px; border-radius: 6px; background: #FEE2E2; border: 1px solid #FCA5A5; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0;">
          📄
        </div>
        <div style="flex: 1; min-width: 0;">
          <div style="font-weight: 600; font-size: 13px; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${displayName}">${displayName}</div>
          <div style="font-size: 11px; color: #DC2626; font-weight: 500;">PDF Hujjat</div>
          <a href="${cleanUrl}" target="_blank" class="btn btn-outline btn-sm" style="margin-top: 5px; padding: 2px 8px; font-size: 11.5px; display: inline-flex; align-items: center; gap: 4px; background: white; color: #DC2626; border-color: #FCA5A5;">
            ${icon('externalLink', 12)} PDF Hujjatni Ochish
          </a>
        </div>
      </div>
    `;
  }

  return `
    <div style="margin-top: 6px; padding: 8px 12px; background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px; display: flex; align-items: center; gap: 8px;">
      ${icon('link', 14)}
      <div style="flex: 1; min-width: 0;">
        <div style="font-size: 11px; color: var(--text-muted); font-weight: 500;">Tashqi dalil havolasi:</div>
        <a href="${cleanUrl}" target="_blank" style="color: #2563EB; font-size: 12.5px; word-break: break-all; font-weight: 600; text-decoration: underline;">
          ${cleanUrl}
        </a>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// SAHIFA: TYUTOR BALL KIRITISH (R-01, R-02, R-04, R-06)
// -------------------------------------------------------------
async function renderTutorAddPoints(container) {
  try {
    const studRes = await apiFetch('/api/tutor/students');
    const students = studRes.students || [];
    const catRes = await apiFetch('/api/observe/catalog');
    const items = (catRes.items || []).filter(i => !i.is_auto);
    const groups = studRes.available_groups || Array.from(new Set(students.map(s => s.group_code).filter(Boolean))).sort();

    const selectedStudentIds = new Set();
    let currentUploadedFile = null; // { url, file_id, name, size }

    let html = `
      <div class="card" style="max-width: 820px; margin: 0 auto; box-shadow: 0 4px 16px rgba(0,0,0,0.06); border-radius: 12px;">
        <div class="card-header" style="border-bottom: 1px solid var(--border-light); padding: 18px 24px;">
          <div>
            <h3 style="font-size: 18px; font-weight: 700; color: var(--text-main); margin-bottom: 4px;">Talabalarga Ball Kiritish Formasi</h3>
            <span style="font-size: 12.5px; color: var(--text-muted);">Qulay qidiruv orqali talabalarni tanlang va dalil bilan tasdiqqa yuboring (R-01, R-04)</span>
          </div>
        </div>
        <div class="card-body" style="padding: 24px;">
          <form id="tutor-entry-form">
            <!-- 1. TALABALARNI TANLASH BO'LIMI -->
            <div style="background: #F8FAFC; border: 1px solid var(--border-light); border-radius: 10px; padding: 16px; margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
                <label class="form-label" style="font-weight: 700; font-size: 13.5px; margin: 0; display: flex; align-items: center; gap: 8px;">
                  <span>Talabalarni tanlang:</span>
                  <span id="selected-students-count-badge" class="badge" style="background: #E2E8F0; color: #475569; font-size: 12px; padding: 3px 8px; border-radius: 20px;">0 ta tanlandi</span>
                </label>
                <div style="display: flex; gap: 6px;">
                  <button type="button" class="btn btn-outline btn-sm" id="btn-select-all-students" style="font-size: 11.5px; padding: 3px 10px; background: white;">
                    ✓ Barchasini tanlash
                  </button>
                  <button type="button" class="btn btn-outline btn-sm" id="btn-clear-selected-students" style="font-size: 11.5px; padding: 3px 10px; background: white; color: var(--text-muted);">
                    ✕ Tozalash
                  </button>
                </div>
              </div>

              <!-- Qidiruv va Guruh filtri -->
              <div style="display: flex; gap: 10px; margin-bottom: 10px; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 220px; position: relative;">
                  <input type="text" id="entry-student-search" class="form-control" placeholder="🔍 F.I.Sh, Talaba ID yoki guruh bo'yicha qidirish..." style="font-size: 13px; padding-left: 12px;">
                </div>
                <div style="min-width: 150px;">
                  <select id="entry-student-group-filter" class="form-select" style="font-size: 13px;">
                    <option value="">Barcha guruhlar (${students.length} nafar)</option>
                    ${groups.map(g => `<option value="${g}">${g} guruhi</option>`).join('')}
                  </select>
                </div>
              </div>

              <!-- Tanlangan talabalar mini-chips paneli -->
              <div id="selected-students-chips-wrap" style="display: none; margin-bottom: 10px; padding: 8px 10px; background: white; border: 1px dashed #93C5FD; border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <span id="chips-summary-text" style="font-size: 11.5px; font-weight: 600; color: #1E40AF;">Tanlangan talabalar:</span>
                  <button type="button" id="btn-clear-chips" style="background:none; border:none; color:#DC2626; font-size:11px; cursor:pointer; font-weight:500;">Hammasini tozalash</button>
                </div>
                <div id="selected-students-chips-list" style="display: flex; flex-wrap: wrap; gap: 6px; max-height: 80px; overflow-y: auto;"></div>
              </div>

              <!-- Talabalar ro'yxati -->
              <div id="entry-students-list-container" style="max-height: 240px; overflow-y: auto; background: white; border: 1px solid var(--border); border-radius: 8px; padding: 6px;">
                <!-- Dinamik chiqariladi -->
              </div>
            </div>

            <!-- 2. KATALOG BANDINI TANLASH -->
            <div class="form-group mb-3">
              <label class="form-label" style="font-weight: 600;">Katalog bandi *</label>
              <select id="entry-item-id" class="form-select" required style="font-size: 13.5px;">
                <option value="">-- Bandni tanlang --</option>
                ${items.map(it => `
                  <option value="${it.id}" data-scale="${it.is_scale}" data-base="${it.base_points}" data-hint="${it.evidence_hint || ''}">
                    [${it.category_name}] ${it.name} ${it.base_points !== null ? `(${it.base_points} ball)` : '(Shkala)'}
                  </option>
                `).join('')}
              </select>
            </div>

            <!-- 3. SHKALA BO'LSA: DARAJA VA ROL -->
            <div id="scale-fields-box" class="grid grid-2 mb-3" style="display: none; gap: 12px;">
              <div class="form-group">
                <label class="form-label" style="font-weight: 600;">Musobaqa Darajasi:</label>
                <select id="entry-scale-level" class="form-select">
                  <option value="universitet">Universitet</option>
                  <option value="viloyat">Viloyat</option>
                  <option value="respublika">Respublika</option>
                  <option value="xalqaro">Xalqaro</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" style="font-weight: 600;">Egallangan o'rin (Rol):</label>
                <select id="entry-scale-role" class="form-select">
                  <option value="ishtirok">Ishtirok</option>
                  <option value="sovrindor">Sovrindor (2-3 o'rin)</option>
                  <option value="golib">G'olib (1-o'rin)</option>
                </select>
              </div>
            </div>

            <!-- 4. BALL MIQDORI VA SANA -->
            <div class="grid grid-2 mb-3" style="gap: 12px;">
              <div class="form-group">
                <label class="form-label" style="font-weight: 600;">
                  Ball miqdori * <span id="points-range-hint" style="color: #2563EB; font-size: 12px; font-weight: normal;"></span>
                </label>
                <input type="number" id="entry-points" class="form-control" required placeholder="Masalan: 10">
              </div>
              <div class="form-group">
                <label class="form-label" style="font-weight: 600;">Tadbir / Faollik sanasi *</label>
                <input type="date" id="entry-date" class="form-control" value="${new Date().toISOString().split('T')[0]}" required>
              </div>
            </div>

            <!-- 5. IZOH / ASOS -->
            <div class="form-group mb-3">
              <label class="form-label" style="font-weight: 600;">Izoh / Asos (Ball mazmuni):</label>
              <textarea id="entry-note" class="form-control" rows="2" placeholder="Masalan: 'Universitet shaxmat turnirida 1-o'rinni egalladi'"></textarea>
            </div>

            <!-- 6. DALIL HUJJATI: FAYL YUKLASH VA HAVOLA -->
            <div class="form-group mb-4" style="background: #F8FAFC; border: 1px solid var(--border-light); border-radius: 10px; padding: 14px;">
              <label class="form-label" style="font-weight: 700; font-size: 13.5px; margin-bottom: 2px;">
                Dalil Hujjati / Fayl / Havola <span style="font-weight: normal; color: var(--text-muted); font-size: 11.5px;">(|ball| > 10 bo'lsa majburiy - R-04)</span>
              </label>
              <small id="evidence-hint-text" style="color: #2563EB; display: block; margin-bottom: 10px; font-size: 12px; font-weight: 500;"></small>

              <div class="grid grid-2" style="gap: 12px;">
                <!-- Fayl yuklash -->
                <div>
                  <label class="form-label" style="font-size: 12px; font-weight: 600; margin-bottom: 4px;">📁 Kompyuterdan fayl yuklash:</label>
                  <input type="file" id="entry-file-input" accept=".pdf,image/png,image/jpeg,image/jpg" style="display: none;">
                  <button type="button" id="btn-trigger-file-upload" class="btn btn-outline btn-sm w-100" style="display: flex; align-items: center; justify-content: center; gap: 6px; padding: 8px 12px; background: white; border: 1.5px dashed #93C5FD; color: #1D4ED8; font-weight: 600; font-size: 12px;">
                    ${icon('upload', 14)} <span id="upload-btn-text">Fayl tanlash (Rasm yoki PDF)</span>
                  </button>
                  <small class="text-muted" style="font-size: 10.5px; display: block; margin-top: 3px;">JPG, PNG, PDF (max 10MB)</small>
                </div>

                <!-- Havola kiritish -->
                <div>
                  <label class="form-label" style="font-size: 12px; font-weight: 600; margin-bottom: 4px;">🔗 Yoki tashqi havola (link):</label>
                  <input type="url" id="entry-evidence-url" class="form-control" placeholder="https://drive.google.com/... yoki havola" style="font-size: 12.5px; padding: 7px 10px;">
                  <small class="text-muted" style="font-size: 10.5px; display: block; margin-top: 3px;">Google Drive, veb-sahifa yoki boshqa link</small>
                </div>
              </div>

              <!-- Yuklangan fayl Details (kichik ko'rinib turishi) -->
              <div id="uploaded-file-details-box" style="display: none; margin-top: 10px; padding: 10px 12px; background: white; border: 1px solid #BFDBFE; border-radius: 8px;"></div>
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%; padding: 12px; font-size: 15px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px;">
              ${icon('check', 16)} <span>Ball Yozuvini Yuborish (Tasdiqqa)</span>
            </button>
          </form>
        </div>
      </div>
    `;
    container.innerHTML = html;

    // Dinamik shkala va oraliq ko'rsatish
    const itemSelect = document.getElementById('entry-item-id');
    const scaleBox = document.getElementById('scale-fields-box');
    const pointsInput = document.getElementById('entry-points');
    const rangeHint = document.getElementById('points-range-hint');
    const hintText = document.getElementById('evidence-hint-text');

    itemSelect.addEventListener('change', updateRangeHint);
    document.getElementById('entry-scale-level').addEventListener('change', updateRangeHint);
    document.getElementById('entry-scale-role').addEventListener('change', updateRangeHint);

    function updateRangeHint() {
      const selected = itemSelect.selectedOptions[0];
      if (!selected || !selected.value) return;

      const isScale = selected.getAttribute('data-scale') === '1';
      const basePoints = selected.getAttribute('data-base');
      hintText.textContent = selected.getAttribute('data-hint') || '';

      if (isScale) {
        scaleBox.style.display = 'grid';
        const level = document.getElementById('entry-scale-level').value;
        const role = document.getElementById('entry-scale-role').value;
        const matrix = catRes.scale || [];
        const found = matrix.find(s => s.level === level && s.role === role);
        if (found) {
          const bp = found.points;
          const minP = Math.round(bp * 0.8);
          const maxP = Math.round(bp * 1.2);
          rangeHint.textContent = `(Baza: ${bp}, ruxsat: [${minP} ... ${maxP}])`;
          pointsInput.value = bp;
        }
      } else {
        scaleBox.style.display = 'none';
        if (basePoints && basePoints !== 'null') {
          const bp = Number(basePoints);
          const minP = Math.round(bp * 0.8);
          const maxP = Math.round(bp * 1.2);
          rangeHint.textContent = `(Baza: ${bp}, ruxsat: [${minP} ... ${maxP}])`;
          pointsInput.value = bp;
        } else {
          rangeHint.textContent = '';
        }
      }
    }

    // Fayl yuklash boshqaruvi
    const fileInput = document.getElementById('entry-file-input');
    const triggerBtn = document.getElementById('btn-trigger-file-upload');
    const uploadBtnText = document.getElementById('upload-btn-text');
    const fileDetailsBox = document.getElementById('uploaded-file-details-box');

    triggerBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', async () => {
      const file = fileInput.files[0];
      if (!file) return;

      if (file.size > 10 * 1024 * 1024) {
        alert("Fayl hajmi 10 MB dan oshmasligi kerak!");
        fileInput.value = '';
        return;
      }

      uploadBtnText.textContent = "Yuklanmoqda...";
      triggerBtn.disabled = true;

      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/files', {
          method: 'POST',
          headers: { 'x-user-id': AppState.user.id },
          body: formData
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Fayl yuklashda xatolik yuz berdi');

        currentUploadedFile = {
          url: data.url,
          file_id: data.file_id,
          name: file.name,
          size: file.size
        };

        uploadBtnText.textContent = "Boshqa fayl tanlash";
        triggerBtn.disabled = false;
        renderUploadedFileDetails();
      } catch (err) {
        uploadBtnText.textContent = "Fayl tanlash (Rasm yoki PDF)";
        triggerBtn.disabled = false;
        alert("Fayl yuklashda xatolik: " + err.message);
      }
    });

    function renderUploadedFileDetails() {
      if (!currentUploadedFile) {
        fileDetailsBox.style.display = 'none';
        fileDetailsBox.innerHTML = '';
        return;
      }

      const isImage = (/\.(jpg|jpeg|png|webp)$/i.test(currentUploadedFile.name) || currentUploadedFile.url.match(/\.(jpg|jpeg|png|webp)/i));
      const sizeKb = Math.round(currentUploadedFile.size / 1024);

      fileDetailsBox.style.display = 'block';
      fileDetailsBox.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          ${isImage ? `
            <a href="${currentUploadedFile.url}" target="_blank" title="Kattalashtirib ko'rish" style="display: block; flex-shrink: 0;">
              <img src="${currentUploadedFile.url}" style="width: 52px; height: 52px; object-fit: cover; border-radius: 6px; border: 1px solid #CBD5E1; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            </a>
          ` : `
            <div style="width: 44px; height: 44px; border-radius: 6px; background: #FEF2F2; border: 1px solid #FECACA; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0;">
              📄
            </div>
          `}
          <div style="flex: 1; min-width: 0;">
            <div style="font-weight: 600; font-size: 12.5px; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${currentUploadedFile.name}">
              ${currentUploadedFile.name}
            </div>
            <div style="font-size: 11px; color: #059669; font-weight: 500;">
              ✓ Muvaffaqiyatli yuklandi (${sizeKb} KB)
            </div>
            <div style="display: flex; gap: 10px; margin-top: 3px;">
              <a href="${currentUploadedFile.url}" target="_blank" style="font-size: 11.5px; color: #2563EB; font-weight: 600;">
                ${isImage ? 'Kattalashtirib ko\'rish' : 'PDF ni ochish'}
              </a>
              <button type="button" id="btn-remove-evidence-file" style="background: none; border: none; color: #DC2626; font-size: 11.5px; cursor: pointer; padding: 0; font-weight: 500;">
                ✕ O'chirish
              </button>
            </div>
          </div>
        </div>
      `;

      document.getElementById('btn-remove-evidence-file')?.addEventListener('click', () => {
        currentUploadedFile = null;
        fileInput.value = '';
        uploadBtnText.textContent = "Fayl tanlash (Rasm yoki PDF)";
        renderUploadedFileDetails();
      });
    }

    // Talabalarni saralash va tanlash boshqaruvi
    const searchInput = document.getElementById('entry-student-search');
    const groupFilter = document.getElementById('entry-student-group-filter');
    const listContainer = document.getElementById('entry-students-list-container');
    const countBadge = document.getElementById('selected-students-count-badge');
    const chipsWrap = document.getElementById('selected-students-chips-wrap');
    const chipsList = document.getElementById('selected-students-chips-list');
    const chipsSummary = document.getElementById('chips-summary-text');

    function getFilteredStudents() {
      const q = (searchInput.value || '').trim().toLowerCase();
      const g = groupFilter.value;
      return students.filter(s => {
        const matchesGroup = !g || s.group_code === g;
        if (!matchesGroup) return false;
        if (!q) return true;
        const name = `${s.first_name || ''} ${s.last_name || ''}`.toLowerCase();
        const ext = (s.external_id || '').toLowerCase();
        const grp = (s.group_code || '').toLowerCase();
        return name.includes(q) || ext.includes(q) || grp.includes(q);
      });
    }

    function renderStudentsList() {
      const filtered = getFilteredStudents();
      if (filtered.length === 0) {
        listContainer.innerHTML = `<div style="text-align: center; padding: 24px; color: var(--text-muted); font-size: 13px;">Qidiruv bo'yicha talaba topilmadi</div>`;
        return;
      }

      listContainer.innerHTML = filtered.map(s => {
        const isSelected = selectedStudentIds.has(s.id);
        const isFemale = s.gender === 'female' || s.gender === 'f';
        const initials = `${(s.first_name || '').charAt(0)}${(s.last_name || '').charAt(0)}`.toUpperCase();
        const avatarHtml = s.photo_url
          ? `<img src="${s.photo_url}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; flex-shrink: 0; border: 1px solid #CBD5E1;">`
          : `<span class="avatar-badge ${isFemale ? 'female' : ''}" style="width: 32px; height: 32px; font-size: 11px; flex-shrink: 0;">${initials}</span>`;

        return `
          <div class="entry-student-item" data-id="${s.id}" style="display: flex; align-items: center; gap: 10px; padding: 7px 10px; border-radius: 8px; margin-bottom: 4px; cursor: pointer; transition: all 0.15s ease; border: 1.5px solid ${isSelected ? '#2563EB' : '#F1F5F9'}; background: ${isSelected ? '#EFF6FF' : '#FFFFFF'};">
            <input type="checkbox" class="student-item-cb" value="${s.id}" ${isSelected ? 'checked' : ''} style="width: 16px; height: 16px; accent-color: #2563EB; cursor: pointer; pointer-events: none;">
            ${avatarHtml}
            <div style="flex: 1; min-width: 0;">
              <div style="font-weight: 600; font-size: 13px; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${s.first_name} ${s.last_name}
              </div>
              <div style="display: flex; align-items: center; gap: 6px; margin-top: 1px;">
                <span class="badge badge-group" style="font-size: 10px; padding: 1px 5px;">${s.group_code || '-'}</span>
                <span style="font-family: monospace; font-size: 10.5px; color: var(--text-muted);">${s.external_id || s.id}</span>
                ${s.course ? `<span style="font-size: 10.5px; color: var(--text-muted);">${s.course}-kurs</span>` : ''}
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    function updateSelectionUI() {
      const count = selectedStudentIds.size;
      countBadge.textContent = `${count} ta tanlandi`;
      if (count > 0) {
        countBadge.className = 'badge badge-primary';
        chipsWrap.style.display = 'block';
        chipsSummary.textContent = `Tanlangan talabalar (${count} nafar):`;
        const selectedList = students.filter(s => selectedStudentIds.has(s.id));
        chipsList.innerHTML = selectedList.map(s => `
          <span style="display: inline-flex; align-items: center; gap: 5px; background: #DBEAFE; color: #1E40AF; padding: 2px 8px; border-radius: 12px; font-size: 11.5px; font-weight: 500;">
            ${s.first_name} ${s.last_name} (${s.group_code})
            <span class="chip-remove-btn" data-id="${s.id}" style="cursor: pointer; font-weight: 700; margin-left: 2px; color: #1E40AF;" title="O'chirish">✕</span>
          </span>
        `).join('');
      } else {
        countBadge.className = 'badge badge-secondary';
        chipsWrap.style.display = 'none';
        chipsList.innerHTML = '';
      }
      renderStudentsList();
    }

    listContainer.addEventListener('click', (e) => {
      const item = e.target.closest('.entry-student-item');
      if (!item) return;
      const id = item.getAttribute('data-id');
      if (selectedStudentIds.has(id)) {
        selectedStudentIds.delete(id);
      } else {
        selectedStudentIds.add(id);
      }
      updateSelectionUI();
    });

    chipsList.addEventListener('click', (e) => {
      const btn = e.target.closest('.chip-remove-btn');
      if (!btn) return;
      const id = btn.getAttribute('data-id');
      selectedStudentIds.delete(id);
      updateSelectionUI();
    });

    document.getElementById('btn-clear-chips')?.addEventListener('click', () => {
      selectedStudentIds.clear();
      updateSelectionUI();
    });

    document.getElementById('btn-select-all-students').addEventListener('click', () => {
      const filtered = getFilteredStudents();
      filtered.forEach(s => selectedStudentIds.add(s.id));
      updateSelectionUI();
    });

    document.getElementById('btn-clear-selected-students').addEventListener('click', () => {
      selectedStudentIds.clear();
      updateSelectionUI();
    });

    searchInput.addEventListener('input', () => renderStudentsList());
    groupFilter.addEventListener('change', () => renderStudentsList());

    // Dastlabki render
    renderStudentsList();

    // Form topshirish
    document.getElementById('tutor-entry-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const studentIds = Array.from(selectedStudentIds);

      if (studentIds.length === 0) {
        alert('Iltimos, kamida bitta talabani tanlang!');
        return;
      }

      const itemId = itemSelect.value;
      if (!itemId) {
        alert('Iltimos, katalog bandini tanlang!');
        return;
      }

      const points = Number(pointsInput.value);
      const isScale = itemSelect.selectedOptions[0].getAttribute('data-scale') === '1';
      const date = document.getElementById('entry-date').value;
      const note = document.getElementById('entry-note').value;
      
      const uploadedUrl = currentUploadedFile ? currentUploadedFile.url : null;
      const uploadedFileId = currentUploadedFile ? currentUploadedFile.file_id : null;
      const manualUrl = (document.getElementById('entry-evidence-url')?.value || '').trim();

      const evidenceUrl = uploadedUrl || (manualUrl ? manualUrl : null);
      const evidenceFileId = uploadedFileId || null;

      // R-04 tekshiruvi: |ball| > 10 bo'lsa dalil majburiy
      if (Math.abs(points) > 10 && !evidenceUrl && !evidenceFileId) {
        alert('Ball 10 dan yuqori bo\'lgani sababli dalil fayli yuklash yoki havola kiritish majburiy (R-04)');
        return;
      }

      const submitBtn = document.querySelector('#tutor-entry-form button[type="submit"]');
      const originalBtnHtml = submitBtn ? submitBtn.innerHTML : null;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Yuborilmoqda...</span>`;
      }

      try {
        const payload = {
          student_ids: studentIds,
          item_id: itemId,
          points,
          scale_level: isScale ? document.getElementById('entry-scale-level').value : null,
          scale_role: isScale ? document.getElementById('entry-scale-role').value : null,
          event_date: date,
          note: note ? note.trim() : null,
          evidence_file_id: evidenceFileId,
          evidence_url: evidenceUrl
        };

        const res = await apiFetch('/api/tutor/entries', {
          method: 'POST',
          body: JSON.stringify(payload)
        });

        navigateTo('tutor-history');
      } catch (err) {
        if (submitBtn && originalBtnHtml) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }
        alert(`Xatolik: ${err.message}`);
      }
    });

  } catch (err) {
    container.innerHTML = `<div class="card"><p class="text-danger">${err.message}</p></div>`;
  }
}

// -------------------------------------------------------------
// SAHIFA: TYUTOR KIRITGAN YOZUVLARI (T-04)
// -------------------------------------------------------------
async function renderTutorHistory(container) {
  try {
    const data = await apiFetch('/api/tutor/entries');
    const entries = data.entries || [];

    let html = `
      <div class="card">
        <div class="card-header">
          <h3>Mening Kiritgan Yozuvlarim Tarixi</h3>
          <span style="font-size: 12px; color: var(--text-muted);">Jami: ${entries.length} ta yozuv</span>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Sana</th>
                  <th>Talaba</th>
                  <th>Band / Faollik</th>
                  <th>Ball</th>
                  <th>Holati</th>
                  <th style="text-align: right;">Amallar</th>
                </tr>
              </thead>
              <tbody>
                ${entries.map(e => `
                  <tr>
                    <td><small>${e.event_date}</small></td>
                    <td><strong>${e.first_name} ${e.last_name}</strong> (${e.group_code})</td>
                    <td>
                      <div>${e.item_name}</div>
                      ${(e.evidence_url || e.evidence_file_id) ? `
                        <a href="${e.evidence_url || `/api/files/${e.evidence_file_id}`}" target="_blank" style="font-size: 11px; color: #2563EB; display: inline-flex; align-items: center; gap: 3px; margin-top: 2px;">
                          ${icon('link', 11)} <span>Dalil hujjati</span>
                        </a>
                      ` : ''}
                    </td>
                    <td><strong style="color: ${e.points > 0 ? '#059669' : '#DC2626'};">${e.points > 0 ? '+' : ''}${e.points}</strong></td>
                    <td>
                      <span class="status-badge status-${e.status}">
                        ${e.status === 'approved' ? 'Tasdiqlangan' : 
                          e.status === 'pending' ? 'Kutilmoqda' : 
                          e.status === 'pending_pv' ? 'Prorektor navbatida' : 
                          e.status === 'rejected' ? 'Rad etilgan' : e.status}
                      </span>
                    </td>
                    <td style="text-align: right;">
                      ${e.status === 'pending' ? `
                        <button class="btn btn-outline btn-sm text-danger" onclick="cancelTutorEntry('${e.id}')">Bekor qilish</button>
                      ` : ''}
                      ${e.status === 'rejected' ? `
                        <button class="btn btn-primary btn-sm" onclick="showResubmitModal('${e.id}')">Qayta yuborish</button>
                      ` : ''}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<div class="card"><p class="text-danger">${err.message}</p></div>`;
  }
}

async function cancelTutorEntry(id) {
  if (!confirm('Haqiqatan ham ushbu yozuvni bekor qilmoqchimisiz?')) return;
  try {
    await apiFetch(`/api/tutor/entries/${id}/cancel`, { method: 'POST' });
    alert('Yozuv bekor qilindi');
    navigateTo('tutor-history');
  } catch (e) {
    alert(e.message);
  }
}

// -------------------------------------------------------------
// SAHIFA: TASDIQ NAVBATI (APPROVAL QUEUE) - B-01
// -------------------------------------------------------------
async function renderDeptApprovals(container) {
  try {
    const data = await apiFetch('/api/approvals');
    const entries = data.entries || [];

    let html = `
      <div class="card mb-3">
        <div class="card-header">
          <h3>Tasdiqlash Navbati (${entries.length} ta kutayotgan ariza)</h3>
          <span style="font-size: 12px; color: var(--text-muted);">Bo'lim xodimi vakolatidagi arizalar</span>
        </div>
      </div>

      ${entries.length === 0 ? `
        <div class="card p-5 text-center">
          <p style="font-size: 16px; color: var(--text-muted);"><div style="text-align:center; padding:32px; color:var(--text-muted);">${icon('checkCircle', 36)}<p style="margin-top:10px; font-weight:600; font-size:14px;">Hozircha tasdiqlash uchun kutayotgan arizalar mavjud emas</p></div></p>
        </div>
      ` : `
        <div class="grid grid-1">
          ${entries.map(e => `
            <div class="card mb-3" style="${e.is_late ? 'border-left: 5px solid #EF4444;' : ''}">
              <div class="card-header">
                <div>
                  <span class="badge" style="background: ${e.category_color}20; color: ${e.category_color}; border: 1px solid ${e.category_color};">
                    ${e.category_name}
                  </span>
                  <h3 style="margin-top: 6px; font-size: 17px;">${e.item_name}</h3>
                  <span style="font-size: 12px; color: var(--text-muted);">
                    Talaba: <strong>${e.first_name} ${e.last_name}</strong> (${e.group_code}) • Tyutor: ${e.creator_name || '-'}
                  </span>
                </div>
                <div style="text-align: right;">
                  <span style="font-size: 20px; font-weight: 800; color: #2563EB;">+${e.points} ball</span>
                  ${e.is_late ? `<div class="badge badge-danger" style="display: block; margin-top: 4px;">Kechikkan: ${e.wait_days} kun</div>` : ''}
                </div>
              </div>

              <div class="card-body">
                <p style="font-size: 13px; margin-bottom: 8px;">
                  ${icon('calendar', 13)} <strong>Sana:</strong> ${e.event_date} &nbsp;|&nbsp; 
                  ${icon('fileText', 13)} <strong>Izoh / Mazmuni:</strong> ${e.note || 'Ko\'rsatilmagan'}
                </p>
                ${(e.evidence_url || e.evidence_file_id) ? `
                  <div style="margin-bottom: 12px;">
                    <div style="font-size: 12px; font-weight: 600; color: var(--text-muted); margin-bottom: 2px; display: flex; align-items: center; gap: 4px;">
                      ${icon('fileText', 12)} <span>Dalil Hujjati / Fayli:</span>
                    </div>
                    ${renderEvidenceThumbnailHtml(e.evidence_url || `/api/files/${e.evidence_file_id}`)}
                  </div>
                ` : ''}

                <div style="display: flex; gap: 8px; justify-content: flex-end; border-top: 1px solid var(--border); padding-top: 12px;">
                  <button class="btn btn-outline text-danger btn-sm" onclick="showRejectModal('${e.id}')">
                    ${icon('x', 13)} Rad Etish
                  </button>
                  <button class="btn btn-success btn-sm" onclick="approveEntryAction('${e.id}')">
                    ${icon('check', 13)} Tasdiqlash
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    `;
    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<div class="card"><p class="text-danger">${err.message}</p></div>`;
  }
}

async function approveEntryAction(id) {
  try {
    const res = await apiFetch(`/api/approvals/${id}/approve`, { method: 'POST' });
    alert(res.message);
    navigateTo('dept-approvals');
    checkPendingBadge();
  } catch (e) {
    alert(`Xato: ${e.message}`);
  }
}

function showRejectModal(id) {
  const modalBody = document.getElementById('modal-body');
  const modalTitle = document.getElementById('modal-title');
  const modalFooter = document.getElementById('modal-footer');

  modalTitle.innerHTML = `<span style="color:#DC2626; display:flex; align-items:center; gap:6px;">⚠️ Arizani Rad Etish</span>`;
  modalBody.innerHTML = `
    <div class="form-group mb-3">
      <label class="form-label" style="font-weight:700;">Rad etish sababi toifasi *:</label>
      <select id="reject-reason-code" class="form-control" style="font-weight:600;">
        <option value="evidence_missing">Dalil hujjati mavjud emas</option>
        <option value="fake_evidence">Dalil asossiz yoki soxta</option>
        <option value="wrong_item">Noto'g'ri katalog bandi tanlangan</option>
        <option value="wrong_level">Musobaqa darajasi noto'g'ri ko'rsatilgan</option>
        <option value="limit_exceeded">Ushbu band bo'yicha limit tugagan</option>
        <option value="other">Boshqa sabab</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label" style="font-weight:700; color:#DC2626;">Batafsil izoh (Majburiy) *:</label>
      <textarea id="reject-note-text" class="form-control" rows="3" placeholder="Rad etish sababini aniq va to'liq yozing (Talaba va tyutorga ko'rinadi)..." required style="border-color:#FCA5A5; font-size:13.5px;"></textarea>
      <small style="color:#64748B; font-size:11.5px; margin-top:4px; display:block;">
        ⚠️ Talaba va tyutor arizaning nima sababdan rad etilganini bilishi va tuzatishi uchun izoh yozish shart.
      </small>
    </div>
  `;

  modalFooter.innerHTML = `
    <button class="btn btn-outline" onclick="closeModal()">Bekor qilish</button>
    <button class="btn btn-danger" onclick="submitReject('${id}')" style="display:inline-flex; align-items:center; gap:6px; font-weight:700;">
      Rad Etishni Tasdiqlash
    </button>
  `;

  openModal();
}

async function submitReject(id) {
  const code = document.getElementById('reject-reason-code')?.value;
  const noteEl = document.getElementById('reject-note-text');
  const note = (noteEl?.value || '').trim();

  if (!note || note.length < 5) {
    alert("Iltimos, rad etish sababini batafsil izohlab yozing (kamida 5 ta belgi kiritilishi shart)!");
    if (noteEl) noteEl.focus();
    return;
  }

  try {
    await apiFetch(`/api/approvals/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason_code: code, reject_note: note, note: note })
    });
    closeModal();
    alert('Ariza muvaffaqiyatli rad etildi va kiritilgan izoh talaba hamda tyutorga yuborildi.');
    if (AppState.currentPage === 'prorektor-queue') {
      renderProrektorQueue(document.getElementById('module-page-container') || document.getElementById('app-content-area'));
    } else {
      navigateTo('dept-approvals');
    }
    checkPendingBadge();
  } catch (e) {
    alert(e.message);
  }
}

// -------------------------------------------------------------
// SAHIFA: TADBIR YARATISH (B-04)
// -------------------------------------------------------------
// SAHIFA: TADBIRLAR VA QR BOSHQARUVI (2 XIL USULDA QR CHECK-IN)
// -------------------------------------------------------------
async function renderDeptEvents(container) {
  try {
    const data = await apiFetch('/api/events');
    const events = data.events || [];

    const isStaffOrAdmin = AppState.isLoggedIn && (
      (AppState.user.user_type === 'staff') ||
      (AppState.user.roles && (
        AppState.user.roles.includes('superadmin') ||
        AppState.user.roles.includes('prorektor') ||
        AppState.user.roles.includes('staff') ||
        AppState.user.roles.includes('organizer') ||
        AppState.user.roles.includes('tutor') ||
        AppState.user.roles.some(r => r.startsWith('dep_'))
      )) ||
      (AppState.user.permissions && (
        AppState.user.permissions.includes('events_create') ||
        AppState.user.permissions.includes('events_view')
      ))
    );

    const userRoles = (AppState.user && AppState.user.roles) || [];
    const isSuperadmin = userRoles.includes('superadmin');
    const isXb = isSuperadmin || userRoles.includes('dep_xb');
    const isAtm = isSuperadmin || userRoles.includes('dep_atm');
    const isOb = isSuperadmin || userRoles.includes('dep_ob');
    const isIy = isSuperadmin || userRoles.includes('dep_iy');

    let html = `
      <div class="admin-hero-card" style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
          <div>
            <div class="admin-hero-title">
              <span style="color: #60A5FA;">${icon('calendar', 22)}</span>
              <span>Universitet Tadbirlari, 4 Bo'lim Kelishuvi & QR Check-in</span>
            </div>
            <p class="admin-hero-desc">
              Har bir xodim tadbir tashabbusi bilan chiqa oladi. Tadbir sanasi va moddiy-texnik ta'minoti 4 ta bo'lim (Xo'jalik, ATM, O'quv, Ish yurituvchi) tomonidan kelishilib, rasman tasdiqlangach talabalarga e'lon qilinadi va tashabbuskor talabaga avtomatik ball beriladi.
            </p>
          </div>
          ${isStaffOrAdmin ? `
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button class="btn btn-primary" onclick="openCreateEventModal()" style="display: inline-flex; align-items: center; gap: 6px;">
                ${icon('calendar', 15)} <span>+ Yangi Tadbir Uyushtirish</span>
              </button>
              <button class="btn btn-outline" onclick="showStudentCheckinModal()" style="display: inline-flex; align-items: center; gap: 6px; background: #FFFFFF;">
                ${icon('qrCode', 15)} <span>📷 Talaba QR Skanerlash</span>
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    if (events.length === 0) {
      html += `
        <div class="card" style="text-align: center; padding: 48px 24px; border-radius: var(--radius-xl);">
          <div style="font-size: 40px; margin-bottom: 12px; color: #3B82F6;">${icon('calendar', 42)}</div>
          <h3 style="margin-bottom: 8px;">Hozircha tizimda tadbirlar mavjud emas</h3>
          <p style="color: var(--text-muted); max-width: 500px; margin: 0 auto 20px; font-size: 13.5px; line-height: 1.5;">
            Universitet talabalari uchun yangi tadbir uyushtiring. Bo'limlar kelishuvidan so'ng talabalar uchun QR kodlar faollashadi.
          </p>
          ${isStaffOrAdmin ? `
            <div style="display: flex; justify-content: center; gap: 10px;">
              <button class="btn btn-primary" onclick="openCreateEventModal()">
                ${icon('calendar', 15)} + Yangi Tadbir Uyushtirish
              </button>
            </div>
          ` : ''}
        </div>
      `;
    } else {
      html += `
        <style>
          .events-cards-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 20px;
          }
          @media (max-width: 1380px) {
            .events-cards-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            }
          }
          @media (max-width: 880px) {
            .events-cards-grid {
              grid-template-columns: 1fr !important;
            }
          }
        </style>
        <div class="events-cards-grid">
          ${events.map(ev => {
            const startsFormatted = new Date(ev.starts_at).toLocaleString('uz-UZ', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            const endsFormatted = new Date(ev.ends_at).toLocaleString('uz-UZ', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            const isEnded = new Date() > new Date(ev.ends_at);
            const isCreator = (ev.created_by === AppState.user.id || ev.organizer_unit === AppState.user.id);
            const canManage = isStaffOrAdmin && (isSuperadmin || isCreator);
            const canEdit = canManage && !isEnded;
            const attOpenMin = ev.attendance_open_minutes_before ?? 5;
            const isPublished = (ev.status === 'published' || !ev.status);
            const isPendingAgreement = (ev.status === 'pending_agreement');
            const imgSrc = ev.photo_url || ev.image_url;

            // Bo'limlar status helperi
            const renderDeptBadge = (title, iconEmoji, status, note, by) => {
              let bg = '#FEF3C7', color = '#B45309', label = 'Kutilmoqda';
              if (status === 'agreed' || status === 'approved') {
                bg = '#ECFDF5'; color = '#059669'; label = 'Kelishildi';
              } else if (status === 'rejected') {
                bg = '#FEF2F2'; color = '#DC2626'; label = 'E\'tiroz';
              }
              const tooltip = note ? `${title}: ${label} (${note} - ${by || ''})` : `${title}: ${label}`;
              return `
                <div style="background:${bg}; color:${color}; border-radius:6px; padding:4px 7px; font-size:11px; font-weight:700; display:flex; align-items:center; gap:4px; border:1px solid rgba(0,0,0,0.06);" title="${tooltip}">
                  <span>${iconEmoji}</span> <span>${title}:</span> <span>${label}</span>
                </div>
              `;
            };

            return `
              <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); overflow: hidden; ${isEnded ? 'opacity: 0.92; border-color: #E2E8F0;' : ''}">
                <div>
                  <!-- BANNER HEADER (16:9 STANDART PROPORSIYA, AMBIENT BLUR FON + TO'LIQ MARKAZIY BANNER) -->
                  ${imgSrc ? `
                    <div style="height: 200px; width: 100%; position: relative; overflow: hidden; background: #0B0F19; display: flex; align-items: center; justify-content: center; border-bottom: 1px solid rgba(255,255,255,0.08);">
                      <div style="position: absolute; inset: -15px; background-image: url('${imgSrc}'); background-size: cover; background-position: center; filter: blur(20px); opacity: 0.40; transform: scale(1.15);"></div>
                      <img src="${imgSrc}" alt="${ev.title}" style="position: relative; max-height: 100%; max-width: 100%; width: 100%; height: 100%; object-fit: contain; z-index: 2; display: block;" onerror="this.parentElement.style.display='none';">
                      <div style="position: absolute; top: 8px; right: 8px; z-index: 3; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(4px); color: #E2E8F0; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.15);">
                        16:9
                      </div>
                    </div>
                  ` : `
                    <div style="height: 105px; width: 100%; background: linear-gradient(135deg, ${ev.category_color || '#3B82F6'}25 0%, #0F172A 100%); display: flex; align-items: center; justify-content: space-between; padding: 18px 22px; border-bottom: 1px solid rgba(255,255,255,0.06);">
                      <div>
                        <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700; color: ${ev.category_color || '#60A5FA'};">
                          ${ev.category_name || 'Universitet Tadbiri'}
                        </span>
                        <div style="font-weight: 800; color: #F8FAFC; font-size: 14.5px; margin-top: 4px;">
                          ${ev.level ? ev.level.toUpperCase() + ' DARAJALI TADBIR' : 'RASMIY UNIVERSITET TADBIRI'}
                        </div>
                      </div>
                      <div style="width: 42px; height: 42px; border-radius: 10px; background: rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; font-size: 20px;">
                        📅
                      </div>
                    </div>
                  `}

                  <div class="card-header" style="border-bottom: 1px solid var(--border-light); padding-bottom: 12px;">
                    <div>
                      <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
                        <span class="badge" style="background: ${ev.category_color}20; color: ${ev.category_color}; border: 1px solid ${ev.category_color}40; font-weight: 600;">
                          ${ev.category_name}
                        </span>
                        ${isPendingAgreement ? `
                          <span class="badge" style="background: #FEF3C7; color: #D97706; border: 1px solid #FCD34D; font-size: 11px; font-weight: 700;">
                            ⏳ 4 Bo'lim Kelishuvi Kutilmoqda
                          </span>
                        ` : isEnded ? `
                          <span class="badge" style="background: #FEE2E2; color: #DC2626; border: 1px solid #FCA5A5; font-size: 11px; font-weight: 700;">⚠️ Yakunlangan (Davomat yopiq)</span>
                        ` : `
                          <span class="badge" style="background: #ECFDF5; color: #059669; border: 1px solid #A7F3D0; font-size: 11px; font-weight: 600;">⏱️ Davomat: ${attOpenMin} daq oldin</span>
                        `}
                      </div>
                      <h3 style="margin-top: 8px; font-size: 16px; font-weight: 700; color: var(--text-main); line-height: 1.35;">${ev.title}</h3>
                    </div>
                    <span class="badge badge-primary" style="font-size: 13px; font-weight: 700; padding: 4px 10px;">+${ev.points} ball</span>
                  </div>

                  <div class="card-body" style="padding: 14px 18px;">
                    <!-- ASOSIY TASHABBUSKOR TALABA / XODIM BLOKI -->
                    ${ev.lead_type === 'student' && ev.lead_name ? `
                      <div style="background: #EFF6FF; border: 1px dashed #93C5FD; border-radius: 8px; padding: 8px 12px; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 6px;">
                        <span style="font-size: 12px; color: #1E40AF; font-weight: 600; display: inline-flex; align-items: center; gap: 5px;">
                          <span>🎯</span> <strong>Asosiy Tashabbuskor:</strong> ${ev.lead_name} ${ev.lead_group ? `(${ev.lead_group})` : ''}
                        </span>
                        <span class="badge" style="background: #2563EB; color: white; font-weight: 700; font-size: 11px;">
                          +${ev.lead_points || 20} tashabbuskorlik bali
                        </span>
                      </div>
                    ` : (ev.lead_name && ev.lead_name !== ev.organizer_unit) ? `
                      <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 6px 12px; margin-bottom: 12px; font-size: 12px; color: #475569;">
                        <strong>Asosiy Tashabbuskor:</strong> ${ev.lead_name}
                      </div>
                    ` : ''}

                    <!-- 4 TA BO'LIM KELISHUVI GRIDI -->
                    <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 10px 12px; margin-bottom: 12px;">
                      <div style="font-size: 11.5px; font-weight: 700; color: #334155; margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between;">
                        <span>📋 4 Ta Bo'lim Kelishuvi & Tasdig'i:</span>
                        ${isPendingAgreement ? `<span style="color:#D97706; font-size:10.5px; font-weight:600;">Jarayonda</span>` : `<span style="color:#059669; font-size:10.5px; font-weight:600;">✓ Tasdiqlangan</span>`}
                      </div>
                      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 6px;">
                        ${renderDeptBadge('Xo\'jalik', '🏢', ev.agreement_xb_status, ev.agreement_xb_note, ev.agreement_xb_by)}
                        ${renderDeptBadge('ATM (IT)', '💻', ev.agreement_atm_status, ev.agreement_atm_note, ev.agreement_atm_by)}
                        ${renderDeptBadge('O\'quv', '📚', ev.agreement_ob_status, ev.agreement_ob_note, ev.agreement_ob_by)}
                        ${renderDeptBadge('Ish yurituvchi', '📑', ev.approval_final_status || (ev.status === 'published' ? 'approved' : 'pending'), ev.approval_final_note, ev.approved_by)}
                      </div>
                    </div>

                    <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                      ${icon('mapPin', 14)} <span><strong>O'tkazilish joyi:</strong> ${ev.place}</span>
                    </p>
                    <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                      ${icon('clock', 14)} <span><strong>Vaqti:</strong> ${startsFormatted} &mdash; ${endsFormatted}</span>
                    </p>
                    <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
                      ${icon('building', 14)} <span><strong>Tashkilotchi:</strong> ${ev.organizer_unit}</span>
                    </p>
                    <div style="background: #F8FAFC; border-radius: 8px; padding: 7px 12px; display: flex; justify-content: space-between; align-items: center; font-size: 12.5px;">
                      <span style="color: var(--text-secondary);">Qabul qilingan talabalar:</span>
                      <span style="font-weight: 700; color: #1E293B;">${ev.checkins_count || 0} nafar ${ev.capacity ? `/ ${ev.capacity} ta o'rin` : ''}</span>
                    </div>

                    <!-- BO'LIM KELISHUV TUGMALARI -->
                    ${isPendingAgreement ? `
                      <div style="margin-top: 12px; padding-top: 10px; border-top: 1px dashed #E2E8F0; display: flex; flex-wrap: wrap; gap: 6px;">
                        ${isXb && ev.agreement_xb_status !== 'agreed' ? `
                          <button class="btn btn-sm btn-outline" onclick="openEventAgreementModal('${ev.id}', 'xb')" style="background:#FEF3C7; color:#B45309; border-color:#FCD34D; font-weight:700;">
                            🏢 Xo'jalik: Kelishish
                          </button>
                        ` : ''}
                        ${isAtm && ev.agreement_atm_status !== 'agreed' ? `
                          <button class="btn btn-sm btn-outline" onclick="openEventAgreementModal('${ev.id}', 'atm')" style="background:#E0F2FE; color:#0369A1; border-color:#BAE6FD; font-weight:700;">
                            💻 ATM: Kelishish
                          </button>
                        ` : ''}
                        ${isOb && ev.agreement_ob_status !== 'agreed' ? `
                          <button class="btn btn-sm btn-outline" onclick="openEventAgreementModal('${ev.id}', 'ob')" style="background:#F0FDF4; color:#15803D; border-color:#BBF7D0; font-weight:700;">
                            📚 O'quv: Kelishish
                          </button>
                        ` : ''}
                        ${isIy ? `
                          <button class="btn btn-sm btn-primary" onclick="openFinalEventApproveModal('${ev.id}')" style="background:#4F46E5; border-color:#4F46E5; font-weight:700;">
                            📑 Ish Yurituvchi: Tasdiqlash
                          </button>
                        ` : ''}
                      </div>
                    ` : ''}
                  </div>
                </div>

                <div class="card-footer" style="background: #FAFAFA; border-top: 1px solid var(--border-light); padding: 10px 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                  <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                    ${isPublished && !isEnded ? `
                      <button class="btn btn-outline btn-sm" onclick="showEventQrModal('${ev.id}')" title="1-Usul: Jonli Tadbir QR kodini chiqarish (talaba skanerlaydi, har 5s yangilanadi)" style="display: inline-flex; align-items: center; gap: 5px;">
                        ${icon('qrCode', 13)} <span>Tadbir QR (5s Dinamik)</span>
                      </button>
                      ${isStaffOrAdmin ? `
                        <button class="btn btn-primary btn-sm" onclick="showStudentCheckinModal('${ev.id}')" title="2-Usul: Talaba QR kodini yoki ID raqamini skanerlab ball berish" style="display: inline-flex; align-items: center; gap: 5px;">
                          ${icon('checkCircle', 13)} <span>Qabul Qilish</span>
                        </button>
                      ` : ''}
                    ` : isPendingAgreement ? `
                      <span style="font-size: 11.5px; color: #D97706; font-weight: 700; background: #FEF3C7; padding: 4px 8px; border-radius: 6px;">
                        ⏳ 4 Bo'lim tasdiqlagach QR kodlar ochiladi
                      </span>
                    ` : `
                      <span style="font-size: 12px; color: #94A3B8; font-weight: 600; padding: 4px 6px;">Tadbir vaqti tugagan</span>
                    `}
                  </div>
                  <div style="display: flex; gap: 6px; align-items: center;">
                    <button class="btn btn-outline btn-sm" onclick="showEventParticipantsModal('${ev.id}')" title="Ishtirokchilar ro'yxati">
                      ${icon('users', 13)}
                    </button>
                    ${canEdit ? `
                      <button class="btn btn-outline btn-sm" onclick="openEditEventModal('${ev.id}')" title="Tadbirni tahrirlash (Vaqti tugaguncha tahrirlash mumkin)" style="color: #2563EB; border-color: #BFDBFE; display: inline-flex; align-items: center; gap: 4px;">
                        ${icon('edit', 13)} <span>Tahrirlash</span>
                      </button>
                    ` : ''}
                    ${canManage ? `
                      <button class="btn btn-outline btn-sm text-danger" onclick="deleteEvent('${ev.id}')" title="Tadbirni o'chirish" style="border-color: #FECACA;">
                        ${icon('trash', 13)}
                      </button>
                    ` : ''}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<div class="card"><p class="text-danger">${err.message}</p></div>`;
  }
}

// ====================================================================
// MAXSUS KALENDAR VA GORIZONTAL VAQT SCROLLER (O'TA SODDA & JAHON STANDARTI)
// ====================================================================

const eventDtState = {
  '': {
    selectedDate: null,
    selectedStartTime: null,
    selectedEndTime: null,
    durationMinutes: 60,
    calYear: new Date().getFullYear(),
    calMonth: new Date().getMonth(),
    confirmed: false
  },
  'edit_': {
    selectedDate: null,
    selectedStartTime: null,
    selectedEndTime: null,
    durationMinutes: 60,
    calYear: new Date().getFullYear(),
    calMonth: new Date().getMonth(),
    confirmed: false
  }
};

function initEventDateTimeControls(prefix = '', initialStartsAt = null, initialEndsAt = null) {
  const now = new Date();
  const st = eventDtState[prefix] || (eventDtState[prefix] = {});

  if (initialStartsAt && initialEndsAt) {
    const sDate = new Date(initialStartsAt);
    const eDate = new Date(initialEndsAt);
    st.selectedDate = `${sDate.getFullYear()}-${String(sDate.getMonth() + 1).padStart(2, '0')}-${String(sDate.getDate()).padStart(2, '0')}`;
    st.selectedStartTime = `${String(sDate.getHours()).padStart(2, '0')}:${String(sDate.getMinutes()).padStart(2, '0')}`;
    st.selectedEndTime = `${String(eDate.getHours()).padStart(2, '0')}:${String(eDate.getMinutes()).padStart(2, '0')}`;
    st.calYear = sDate.getFullYear();
    st.calMonth = sDate.getMonth();
    st.durationMinutes = Math.max(15, Math.round((eDate - sDate) / (60 * 1000)));
  } else {
    // Default: Bugun, hozirdan kamida 15 daqiqa keyin
    const defaultStart = new Date(now.getTime() + 15 * 60 * 1000);
    defaultStart.setMinutes(Math.ceil(defaultStart.getMinutes() / 5) * 5);
    const defaultEnd = new Date(defaultStart.getTime() + 60 * 60 * 1000);

    st.selectedDate = `${defaultStart.getFullYear()}-${String(defaultStart.getMonth() + 1).padStart(2, '0')}-${String(defaultStart.getDate()).padStart(2, '0')}`;
    st.selectedStartTime = `${String(defaultStart.getHours()).padStart(2, '0')}:${String(defaultStart.getMinutes()).padStart(2, '0')}`;
    st.selectedEndTime = `${String(defaultEnd.getHours()).padStart(2, '0')}:${String(defaultEnd.getMinutes()).padStart(2, '0')}`;
    st.calYear = now.getFullYear();
    st.calMonth = now.getMonth();
    st.durationMinutes = 60;
  }
  st.confirmed = true;

  renderEventCalendar(prefix);
  renderEventStartTimeTrack(prefix);
  renderEventEndTimeTrack(prefix);
  updateEventDateTimeSummary(prefix);
}

function renderEventCalendar(prefix = '') {
  const container = document.getElementById(`${prefix}cal-container`);
  if (!container) return;

  const st = eventDtState[prefix];
  const now = new Date();
  const todayDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const monthNames = [
    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
    'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
  ];

  const year = st.calYear;
  const month = st.calMonth;

  // Birinchi kun (0=Du, 6=Ya)
  const firstDayObj = new Date(year, month, 1);
  let firstDayIndex = firstDayObj.getDay() - 1;
  if (firstDayIndex === -1) firstDayIndex = 6;

  const totalDays = new Date(year, month + 1, 0).getDate();
  const isCurrentMonthOrPast = (year < now.getFullYear()) || (year === now.getFullYear() && month <= now.getMonth());

  let daysHtml = '';
  for (let i = 0; i < firstDayIndex; i++) {
    daysHtml += `<div class="cal-day-cell" style="background:transparent; cursor:default;"></div>`;
  }

  for (let day = 1; day <= totalDays; day++) {
    const dayDate = new Date(year, month, day);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const isToday = (dateStr === todayDateStr);
    const isPast = (dayDate < new Date(now.getFullYear(), now.getMonth(), now.getDate()));
    const isSelected = (dateStr === st.selectedDate);

    if (isPast) {
      daysHtml += `<div class="cal-day-cell disabled" title="Bugundan oldingi sanalarni tanlash mumkin emas">${day}</div>`;
    } else {
      let classes = ['cal-day-cell'];
      if (isToday) classes.push('today');
      if (isSelected) classes.push('selected');
      daysHtml += `
        <div class="${classes.join(' ')}" onclick="selectEventCalendarDate('${dateStr}', '${prefix}')" title="${dateStr}">
          ${day}
        </div>
      `;
    }
  }

  container.innerHTML = `
    <div class="custom-calendar-header">
      <button type="button" class="custom-calendar-nav-btn" onclick="changeEventCalendarMonth(-1, '${prefix}')" ${isCurrentMonthOrPast ? 'disabled style="opacity:0.3; cursor:not-allowed;"' : ''}>
        &larr;
      </button>
      <div class="custom-calendar-title">
        📅 ${monthNames[month]} ${year}
      </div>
      <button type="button" class="custom-calendar-nav-btn" onclick="changeEventCalendarMonth(1, '${prefix}')">
        &rarr;
      </button>
    </div>
    <div class="custom-calendar-weekdays">
      <span>Du</span><span>Se</span><span>Ch</span><span>Pa</span><span>Ju</span><span>Sh</span><span style="color:#DC2626;">Ya</span>
    </div>
    <div class="custom-calendar-days-grid">
      ${daysHtml}
    </div>
  `;
}

function changeEventCalendarMonth(delta, prefix = '') {
  const st = eventDtState[prefix];
  const now = new Date();
  let newMonth = st.calMonth + delta;
  let newYear = st.calYear;

  if (newMonth < 0) {
    newMonth = 11;
    newYear -= 1;
  } else if (newMonth > 11) {
    newMonth = 0;
    newYear += 1;
  }

  if (newYear < now.getFullYear() || (newYear === now.getFullYear() && newMonth < now.getMonth())) {
    return;
  }

  st.calMonth = newMonth;
  st.calYear = newYear;
  renderEventCalendar(prefix);
}

function selectEventCalendarDate(dateStr, prefix = '') {
  const st = eventDtState[prefix];
  st.selectedDate = dateStr;

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  if (dateStr === todayStr) {
    const minStartMs = now.getTime() + 10 * 60 * 1000;
    const currentStartDt = new Date(`${dateStr}T${st.selectedStartTime}:00`);
    if (currentStartDt.getTime() < minStartMs) {
      const newStartDt = new Date(minStartMs + 5 * 60 * 1000);
      newStartDt.setMinutes(Math.ceil(newStartDt.getMinutes() / 5) * 5);
      st.selectedStartTime = `${String(newStartDt.getHours()).padStart(2, '0')}:${String(newStartDt.getMinutes()).padStart(2, '0')}`;
      recalcEndTime(prefix);
    }
  }

  renderEventCalendar(prefix);
  renderEventStartTimeTrack(prefix);
  renderEventEndTimeTrack(prefix);
  updateEventDateTimeSummary(prefix);
}

function setEventQuickDate(type, prefix = '') {
  const now = new Date();
  let target = new Date();
  if (type === 'today') {
    target = now;
  } else if (type === 'tomorrow') {
    target.setDate(now.getDate() + 1);
  } else if (type === 'afterTomorrow') {
    target.setDate(now.getDate() + 2);
  }

  const dateStr = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`;
  const st = eventDtState[prefix];
  st.calYear = target.getFullYear();
  st.calMonth = target.getMonth();
  selectEventCalendarDate(dateStr, prefix);

  document.querySelectorAll(`.${prefix}date-quick-btn`).forEach(b => b.classList.remove('btn-primary'));
  const clicked = document.getElementById(`${prefix}date-btn-${type}`);
  if (clicked) clicked.classList.add('btn-primary');
}

function renderEventStartTimeTrack(prefix = '') {
  const track = document.getElementById(`${prefix}start-time-track`);
  if (!track) return;

  const st = eventDtState[prefix];
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const isToday = (st.selectedDate === todayStr);
  const minStartMs = now.getTime() + 10 * 60 * 1000;

  let pillsHtml = '';
  for (let h = 7; h <= 23; h++) {
    for (let m = 0; m < 60; m += 15) {
      const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      let isDisabled = false;

      if (isToday) {
        const slotDt = new Date(`${st.selectedDate}T${timeStr}:00`);
        if (slotDt.getTime() < minStartMs) {
          isDisabled = true;
        }
      }

      const isSelected = (timeStr === st.selectedStartTime);

      if (isDisabled) {
        pillsHtml += `<button type="button" class="time-pill disabled" title="Hozirdan kamida 10 daqiqa keyin bo'lishi shart">${timeStr}</button>`;
      } else {
        pillsHtml += `
          <button type="button" id="${prefix}start-pill-${timeStr.replace(':', '-')}" class="time-pill ${isSelected ? 'active' : ''}" onclick="selectEventStartTime('${timeStr}', '${prefix}')">
            ${timeStr}
          </button>
        `;
      }
    }
  }

  track.innerHTML = pillsHtml;

  setTimeout(() => {
    const activePill = track.querySelector('.time-pill.active');
    if (activePill) {
      activePill.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, 50);
}

function selectEventStartTime(timeStr, prefix = '') {
  const st = eventDtState[prefix];
  st.selectedStartTime = timeStr;
  recalcEndTime(prefix);

  renderEventStartTimeTrack(prefix);
  renderEventEndTimeTrack(prefix);
  updateEventDateTimeSummary(prefix);
}

function recalcEndTime(prefix = '') {
  const st = eventDtState[prefix];
  if (!st.selectedDate || !st.selectedStartTime) return;

  const startDt = new Date(`${st.selectedDate}T${st.selectedStartTime}:00`);
  const endDt = new Date(startDt.getTime() + (st.durationMinutes || 60) * 60 * 1000);
  st.selectedEndTime = `${String(endDt.getHours()).padStart(2, '0')}:${String(endDt.getMinutes()).padStart(2, '0')}`;
}

function renderEventEndTimeTrack(prefix = '') {
  const track = document.getElementById(`${prefix}end-time-track`);
  if (!track) return;

  const st = eventDtState[prefix];
  if (!st.selectedStartTime) return;

  const [startH, startM] = st.selectedStartTime.split(':').map(Number);
  const startTotalMinutes = startH * 60 + startM;

  const durations = [
    { mins: 30, label: '30 daq' },
    { mins: 45, label: '45 daq' },
    { mins: 60, label: '1 soat (Standart)' },
    { mins: 90, label: '1.5 soat' },
    { mins: 120, label: '2 soat' },
    { mins: 180, label: '3 soat' }
  ];

  let pillsHtml = `
    <div style="display: flex; gap: 6px; padding-right: 8px; border-right: 1.5px solid #CBD5E1; margin-right: 4px; flex-shrink: 0;">
  `;

  durations.forEach(d => {
    const isAct = (st.durationMinutes === d.mins);
    pillsHtml += `
      <button type="button" class="time-pill ${isAct ? 'active' : ''}" style="background: ${isAct ? '#2563EB' : '#F1F5F9'}; font-family: inherit; font-size: 12px;" onclick="selectEventDuration(${d.mins}, '${prefix}')">
        ⏱️ ${d.label}
      </button>
    `;
  });
  pillsHtml += `</div>`;

  for (let offset = 15; offset <= 360; offset += 15) {
    const endTotalMinutes = startTotalMinutes + offset;
    const endH = Math.floor(endTotalMinutes / 60) % 24;
    const endM = endTotalMinutes % 60;
    const timeStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

    const isSelected = (timeStr === st.selectedEndTime);

    pillsHtml += `
      <button type="button" class="time-pill ${isSelected ? 'active' : ''}" onclick="selectEventEndTime('${timeStr}', ${offset}, '${prefix}')">
        ${timeStr}
      </button>
    `;
  }

  track.innerHTML = pillsHtml;

  setTimeout(() => {
    const activePill = track.querySelector('.time-pill.active');
    if (activePill) {
      activePill.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, 50);
}

function selectEventDuration(mins, prefix = '') {
  const st = eventDtState[prefix];
  st.durationMinutes = mins;
  recalcEndTime(prefix);

  renderEventEndTimeTrack(prefix);
  updateEventDateTimeSummary(prefix);
}

function selectEventEndTime(timeStr, offsetMinutes, prefix = '') {
  const st = eventDtState[prefix];
  st.selectedEndTime = timeStr;
  st.durationMinutes = offsetMinutes;

  renderEventEndTimeTrack(prefix);
  updateEventDateTimeSummary(prefix);
}

function confirmEventDateTime(prefix = '') {
  const res = updateEventDateTimeSummary(prefix);
  if (res.valid) {
    eventDtState[prefix].confirmed = true;
    const summaryBox = document.getElementById(`${prefix}ev-datetime-summary`);
    if (summaryBox) {
      summaryBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      summaryBox.style.transform = 'scale(1.02)';
      setTimeout(() => summaryBox.style.transform = 'scale(1)', 200);
    }
  } else {
    alert(res.error || "Iltimos, sana va vaqtni to'g'ri belgilang!");
  }
}

function updateEventDateTimeSummary(prefix = '') {
  const st = eventDtState[prefix] || {};
  const summaryEl = document.getElementById(`${prefix}ev-datetime-summary`);
  if (!summaryEl) return { valid: false };

  if (!st.selectedDate || !st.selectedStartTime || !st.selectedEndTime) {
    summaryEl.style.background = '#FEF2F2';
    summaryEl.style.border = '1px solid #FECACA';
    summaryEl.style.color = '#DC2626';
    summaryEl.innerHTML = `⚠️ Iltimos, sana va vaqtlarni to'liq belgilang!`;
    return { valid: false, error: "Iltimos, sana va vaqtlarni to'liq belgilang!" };
  }

  const d = new Date(st.selectedDate);
  const monthNames = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
  const dayNames = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
  const dateFormatted = `${dayNames[d.getDay()]}, ${d.getDate()}-${monthNames[d.getMonth()]}, ${d.getFullYear()}`;

  const now = new Date();
  const startsAt = new Date(`${st.selectedDate}T${st.selectedStartTime}:00`);
  let endsAt = new Date(`${st.selectedDate}T${st.selectedEndTime}:00`);
  if (endsAt <= startsAt) {
    endsAt = new Date(endsAt.getTime() + 24 * 60 * 60 * 1000);
  }

  const minStartMs = now.getTime() + 10 * 60 * 1000;
  const durationMs = endsAt.getTime() - startsAt.getTime();
  const durHours = Math.floor(durationMs / (60 * 60 * 1000));
  const durMins = Math.floor((durationMs % (60 * 60 * 1000)) / (60 * 1000));
  let durStr = '';
  if (durHours > 0) durStr += `${durHours} soat `;
  if (durMins > 0) durStr += `${durMins} daqiqa`;
  if (!durStr) durStr = '0 daqiqa';

  // 1. Qoida: kamida 10 daqiqa keyin bo'lishi kerak
  if (startsAt.getTime() < minStartMs) {
    const minStartDt = new Date(minStartMs);
    const minStartStr = `${String(minStartDt.getHours()).padStart(2, '0')}:${String(minStartDt.getMinutes()).padStart(2, '0')}`;
    summaryEl.style.background = '#FEF2F2';
    summaryEl.style.border = '1.5px solid #FECACA';
    summaryEl.style.color = '#B91C1C';
    summaryEl.innerHTML = `
      <div style="display:flex; align-items:flex-start; gap:8px;">
        <span style="font-size:20px;">🚫</span>
        <div>
          <strong>Boshlanish vaqti juda erta!</strong> Tadbir boshlanishi hozirgi vaqtdan <strong>kamida 10 daqiqa keyin</strong> bo'lishi shart.<br>
          <span style="font-size:12px;">Hozirgi vaqt: ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')} &bull; Eng erta boshlanish vaqti: <strong>${minStartStr}</strong></span>
        </div>
      </div>
    `;
    return { valid: false, error: `Tadbir boshlanish vaqti hozirdan kamida 10 daqiqa keyin bo'lishi kerak (eng ertasi: ${minStartStr})` };
  }

  // 2. Qoida: tugash vaqti boshlanishidan keyin bo'lishi kerak
  if (durationMs <= 0) {
    summaryEl.style.background = '#FEF2F2';
    summaryEl.style.border = '1.5px solid #FECACA';
    summaryEl.style.color = '#B91C1C';
    summaryEl.innerHTML = `🚫 <strong>Tugash vaqti boshlanish vaqtidan keyin bo'lishi shart!</strong>`;
    return { valid: false, error: "Tugash vaqti boshlanishidan keyin bo'lishi shart!" };
  }

  // Muvaffaqiyatli xulosa
  summaryEl.style.background = '#ECFDF5';
  summaryEl.style.border = '1.5px solid #A7F3D0';
  summaryEl.style.color = '#065F46';
  summaryEl.innerHTML = `
    <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px;">
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:20px;">✅</span>
        <div>
          <div style="font-weight:800; font-size:14px; color:#065F46;">
            ${dateFormatted} | ${st.selectedStartTime} &mdash; ${st.selectedEndTime}
          </div>
          <span style="font-size:12px; color:#047857;">Davomiyligi: <strong>${durStr}</strong> &bull; Boshlanishiga <strong>${Math.round((startsAt - now)/(60*1000))} daqiqa</strong> qoldi.</span>
        </div>
      </div>
      <button type="button" class="btn btn-sm btn-primary" onclick="confirmEventDateTime('${prefix}')" style="background:#059669; border-color:#059669; padding:5px 12px; font-weight:700;">
        ✓ OK (Tasdiqlash)
      </button>
    </div>
  `;

  return {
    valid: true,
    starts_at: startsAt.toISOString(),
    ends_at: endsAt.toISOString()
  };
}

// KPI dan tadbirlarni qo'lda darhol sinxronlash
async function syncKpiEventsManually() {
  const btns = [document.getElementById('btn-sync-kpi-events'), document.getElementById('btn-sync-kpi-events-main')].filter(Boolean);
  btns.forEach(b => {
    b.disabled = true;
    b.innerHTML = `<span>⏳ Sinxronlanmoqda...</span>`;
  });

  try {
    const res = await apiFetch('/api/events/sync-kpi', { method: 'POST' });
    if (res && res.success) {
      showToast(`✅ KPI dan muvaffaqiyatli sinxronlandi: ${res.total_from_kpi || 0} ta tadbir olindi (Yangi: ${res.inserted || 0}, Yangilandi: ${res.updated || 0})`, 'success');
      await renderDeptEvents();
    } else {
      showToast(`Xatolik: ${(res && res.error) || 'Sinxronlab bo\'lmadi'}`, 'error');
    }
  } catch (err) {
    showToast(`Sinxronlashda xatolik: ${err.message}`, 'error');
  } finally {
    btns.forEach(b => {
      b.disabled = false;
      b.innerHTML = `${icon('refresh', 14)} <span>🔄 KPI dan sinxronlash</span>`;
    });
  }
}
window.syncKpiEventsManually = syncKpiEventsManually;

// ====================================================================
// TADBIK YARATISH, ASOSIY TASHABBUSKOR TALABA & 4 TA BO'LIM KELISHUVI
// ====================================================================

let createEventLeadState = {
  type: 'self', // 'self' | 'student' | 'staff'
  selectedLead: null,
  points: 20
};

function onEventLeadTypeChange(val) {
  createEventLeadState.type = val;
  createEventLeadState.selectedLead = null;
  const searchWrap = document.getElementById('ev-lead-search-wrap');
  const studentPointsWrap = document.getElementById('ev-lead-points-wrap');
  const selectedDisplay = document.getElementById('ev-lead-selected-display');
  const resultsBox = document.getElementById('ev-lead-results');

  if (resultsBox) resultsBox.innerHTML = '';
  if (selectedDisplay) selectedDisplay.style.display = 'none';

  if (val === 'self') {
    if (searchWrap) searchWrap.style.display = 'none';
    if (studentPointsWrap) studentPointsWrap.style.display = 'none';
  } else if (val === 'student') {
    if (searchWrap) {
      searchWrap.style.display = 'block';
      const input = document.getElementById('ev-lead-search-input');
      if (input) {
        input.placeholder = "Talaba F.I.Sh, guruhi yoki ID bo'yicha qidiring...";
        input.value = '';
      }
    }
    if (studentPointsWrap) studentPointsWrap.style.display = 'block';
  } else if (val === 'staff') {
    if (searchWrap) {
      searchWrap.style.display = 'block';
      const input = document.getElementById('ev-lead-search-input');
      if (input) {
        input.placeholder = "Xodim F.I.Sh yoki logini bo'yicha qidiring...";
        input.value = '';
      }
    }
    if (studentPointsWrap) studentPointsWrap.style.display = 'none';
  }
}

let eventLeadSearchTimer = null;
async function onEventLeadSearchInput(query) {
  clearTimeout(eventLeadSearchTimer);
  const q = (query || '').trim();
  const resultsBox = document.getElementById('ev-lead-results');
  if (!resultsBox) return;

  if (q.length < 2) {
    resultsBox.innerHTML = '';
    return;
  }

  eventLeadSearchTimer = setTimeout(async () => {
    try {
      resultsBox.innerHTML = `<div style="padding:8px 12px; font-size:12px; color:#64748B;">Qidirilmoqda...</div>`;
      const data = await apiFetch(`/api/events/search-leads?q=${encodeURIComponent(q)}`);
      const list = createEventLeadState.type === 'student' ? (data.students || []) : (data.staff || []);

      if (list.length === 0) {
        resultsBox.innerHTML = `<div style="padding:8px 12px; font-size:12px; color:#DC2626;">Topilmadi</div>`;
        return;
      }

      resultsBox.innerHTML = list.slice(0, 7).map(item => `
        <div class="lead-search-item" onclick="selectEventLeadItem('${item.id}', '${item.type}', '${item.name.replace(/'/g, "\\'")}', '${(item.group || '').replace(/'/g, "\\'")}')" style="padding:8px 12px; border-bottom:1px solid #F1F5F9; cursor:pointer; font-size:12.5px; transition:background 0.15s ease;" onmouseover="this.style.background='#F8FAFC'" onmouseout="this.style.background='transparent'">
          <div style="font-weight:700; color:#1E293B;">${item.name}</div>
          <div style="font-size:11px; color:#64748B;">
            ${item.group ? `Guruh: <strong>${item.group}</strong> &bull; ` : ''} ID: ${item.id}
          </div>
        </div>
      `).join('');
    } catch (e) {
      resultsBox.innerHTML = `<div style="padding:8px 12px; font-size:12px; color:#DC2626;">${e.message}</div>`;
    }
  }, 250);
}

function selectEventLeadItem(id, type, name, group) {
  createEventLeadState.selectedLead = { id, type, name, group };
  const resultsBox = document.getElementById('ev-lead-results');
  if (resultsBox) resultsBox.innerHTML = '';

  const selectedDisplay = document.getElementById('ev-lead-selected-display');
  if (selectedDisplay) {
    selectedDisplay.style.display = 'block';
    selectedDisplay.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:space-between; background:#ECFDF5; border:1.5px solid #A7F3D0; border-radius:8px; padding:8px 12px;">
        <div>
          <span style="font-size:11px; font-weight:700; color:#059669; text-transform:uppercase;">Tanlangan Tashabbuskor:</span>
          <div style="font-weight:800; color:#065F46; font-size:13.5px;">${name}</div>
          <div style="font-size:11.5px; color:#047857;">${group ? `Guruhi: ${group} &bull; ` : ''}ID: ${id}</div>
        </div>
        <button type="button" class="btn btn-sm btn-outline text-danger" onclick="clearSelectedEventLead()" style="padding:3px 8px; font-size:11px;">✕ Bekor qilish</button>
      </div>
    `;
  }
}

function clearSelectedEventLead() {
  createEventLeadState.selectedLead = null;
  const selectedDisplay = document.getElementById('ev-lead-selected-display');
  if (selectedDisplay) {
    selectedDisplay.style.display = 'none';
    selectedDisplay.innerHTML = '';
  }
  const input = document.getElementById('ev-lead-search-input');
  if (input) {
    input.value = '';
    input.focus();
  }
}

// Yangi Tadbir Yaratish Modali
async function openCreateEventModal() {
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalFooter = document.getElementById('modal-footer');

  createEventLeadState = {
    type: 'self',
    selectedLead: null,
    points: 20
  };

  modalTitle.innerHTML = `<span style="display: flex; align-items: center; gap: 8px;">${icon('calendar', 18)} Yangi Tadbir Uyushtirish (4 Bo'lim Kelishuvi)</span>`;

  let categories = [];
  try {
    const catRes = await apiFetch('/api/observe/catalog');
    categories = catRes.categories || [];
  } catch (e) {
    categories = [];
  }

  modalBody.innerHTML = `
    <form id="dept-create-event-form" onsubmit="event.preventDefault(); submitCreateEvent();">
      <div class="form-group mb-3">
        <label class="form-label" style="font-weight:700;">Tadbir Nomi *</label>
        <input type="text" id="ev-title" class="form-control" placeholder="Masalan: 'AKHU AI Hackathon 2026' yoki 'Zakovat Intellektual Turniri'" required style="font-size: 14.5px; font-weight: 600;">
      </div>

      <!-- SANA VA VAQT BOSHQARUVI (MAXSUS KALENDAR & GORIZONTAL SCROLLER) -->
      <div style="background: #F8FAFC; border: 2px solid #E2E8F0; border-radius: 14px; padding: 14px; margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <label style="font-weight: 800; font-size: 13.5px; color: #0F172A; display: flex; align-items: center; gap: 6px; margin: 0;">
            📅 Tadbir Sanasi va Vaqti (Sodda & Xatosiz) *
          </label>
          <span style="font-size: 11px; background: #DBEAFE; color: #1E40AF; padding: 3px 8px; border-radius: 6px; font-weight: 700;">Kamida +10 daqiqa keyin</span>
        </div>

        <div style="margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 12px; font-weight: 700; color: #334155;">1. Tadbir kuni (O'tgan kunlar tanlanmaydi):</span>
            <div style="display: flex; gap: 4px;">
              <button type="button" id="date-btn-today" class="btn btn-sm btn-outline date-quick-btn btn-primary" onclick="setEventQuickDate('today', '')" style="font-size: 11px; padding: 2px 8px;">Bugun</button>
              <button type="button" id="date-btn-tomorrow" class="btn btn-sm btn-outline date-quick-btn" onclick="setEventQuickDate('tomorrow', '')" style="font-size: 11px; padding: 2px 8px;">Ertaga</button>
              <button type="button" id="date-btn-afterTomorrow" class="btn btn-sm btn-outline date-quick-btn" onclick="setEventQuickDate('afterTomorrow', '')" style="font-size: 11px; padding: 2px 8px;">Indinga</button>
            </div>
          </div>
          <div id="cal-container" class="custom-calendar-widget"></div>
        </div>

        <div class="time-scroll-track-wrapper">
          <div style="font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
            <span>⏰ 2. Boshlanish vaqti</span>
            <span style="font-size: 11px; color: #64748B; font-weight: normal;">(Gorizontal suring va tanlang):</span>
          </div>
          <div class="time-scroll-track" id="start-time-track"></div>
        </div>

        <div class="time-scroll-track-wrapper">
          <div style="font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
            <span>⌛ 3. Davomiyligi va Tugash vaqti</span>
            <span style="font-size: 11px; color: #64748B; font-weight: normal;">(Gorizontal suring va tanlang):</span>
          </div>
          <div class="time-scroll-track" id="end-time-track"></div>
        </div>

        <div id="ev-datetime-summary"></div>
      </div>

      <div class="form-group mb-3">
        <label class="form-label" style="font-weight:700;">O'tkazilish joyi (Bino / Zal / Auditoriya) *</label>
        <input type="text" id="ev-place" class="form-control" placeholder="Masalan: Bosh bino, 2-qavat Katta Aktlar Zali" required>
      </div>

      <!-- ASOSIY TASHABBUSKOR TANLOVI (TALABA / HODIM / O'ZIM) -->
      <div class="form-group mb-3" style="background: #F0FDF4; border: 1.5px solid #BBF7D0; border-radius: 12px; padding: 14px;">
        <label class="form-label" style="font-weight: 800; color: #166534; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
          <span>🎯</span> Asosiy Tashabbuskor (Tadbirni o'ylab topgan shaxs) *
        </label>
        <p style="font-size: 12px; color: #15803D; margin-bottom: 10px; line-height: 1.4;">
          Agar tadbir tashabbuskori <strong>talaba</strong> bo'lsa, uni belgilang. Ish yurituvchi tasdiqlaganidan keyin <strong>tizim ushbu talabaga avtomatik ravishda baholash mezonlari bo'yicha ball</strong> hisoblaydi!
        </p>

        <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 10px;">
          <label style="display:flex; align-items:center; gap:6px; cursor:pointer; font-weight:600; font-size:13px; color:#166534;">
            <input type="radio" name="ev_lead_type_radio" value="self" checked onchange="onEventLeadTypeChange(this.value)">
            Men o'zim (Tashkilotchi xodim)
          </label>
          <label style="display:flex; align-items:center; gap:6px; cursor:pointer; font-weight:700; font-size:13px; color:#15803D;">
            <input type="radio" name="ev_lead_type_radio" value="student" onchange="onEventLeadTypeChange(this.value)">
            ⭐ Talaba (Asosiy Tashabbuskor - Avtomatik Ball)
          </label>
          <label style="display:flex; align-items:center; gap:6px; cursor:pointer; font-weight:600; font-size:13px; color:#166534;">
            <input type="radio" name="ev_lead_type_radio" value="staff" onchange="onEventLeadTypeChange(this.value)">
            Boshqa xodim
          </label>
        </div>

        <!-- Talaba yoki Xodim qidiruv qismi -->
        <div id="ev-lead-search-wrap" style="display: none; position: relative; margin-bottom: 10px;">
          <input type="text" id="ev-lead-search-input" class="form-control" placeholder="Talaba F.I.Sh yoki ID bo'yicha qidiring..." oninput="onEventLeadSearchInput(this.value)" autocomplete="off">
          <div id="ev-lead-results" style="position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #CBD5E1; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); z-index: 50; max-height: 200px; overflow-y: auto;"></div>
        </div>

        <div id="ev-lead-selected-display" style="display: none; margin-bottom: 10px;"></div>

        <!-- Talaba uchun baholash mezonlari bo'yicha ball tanlash -->
        <div id="ev-lead-points-wrap" style="display: none; background: #FFFFFF; border: 1px solid #A7F3D0; border-radius: 8px; padding: 10px 12px;">
          <label class="form-label" style="font-weight: 700; color: #065F46; font-size: 12px; margin-bottom: 4px;">
            🏆 Talabaga beriladigan tashkilotchilik bali (Baholash mezoni bo'yicha):
          </label>
          <select id="ev-lead-points-select" class="form-control" style="font-weight:600; font-size:13px;" onchange="createEventLeadState.points = Number(this.value)">
            <option value="10">i3: 10 ball &mdash; Tadbir tashkiliy guruhida faoliyat</option>
            <option value="15">m3: 15 ball &mdash; Ma'naviy-ma'rifiy tadbir tashkiloti</option>
            <option value="20" selected>i6: 20 ball &mdash; Universitet tadbirini o'zi tashkil etdi (30+ ishtirokchi)</option>
            <option value="30">i7: 30 ball &mdash; Katta universitet tadbirini o'zi tashkil etdi (100+ ishtirokchi)</option>
          </select>
          <small style="color: #047857; font-size: 11px; display: block; margin-top: 4px;">
            ✓ Ushbu ball tadbir Ish yurituvchi tomonidan tasdiqlangach avtomatik ravishda talabaning hisobiga qo'shiladi.
          </small>
        </div>
      </div>

      <!-- 4 TA BO'LIMNING MODDIY-TEXNIK JARAYONLARI VA KELISHUVI -->
      <div class="form-group mb-3" style="background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 12px; padding: 14px;">
        <label class="form-label" style="font-weight: 800; color: #1E293B; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
          <span>📑</span> 4 Ta Bo'lim uchun Moddiy-Texnik Talablar va Jarayonlar
        </label>
        <p style="font-size: 12px; color: #64748B; margin-bottom: 10px;">
          Tadbir o'tkazish uchun bo'limlardan zarur bo'ladigan imkoniyatlarni ko'rsating (har bir bo'lim ko'rib chiqib kelishadi):
        </p>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div>
            <label style="font-size: 12px; font-weight: 700; color: #B45309; display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
              🏢 Xo'jalik bo'limi:
            </label>
            <input type="text" id="ev-note-xb" class="form-control" placeholder="Stol, stul, zal tayyorlash, moddiy baza bo'yicha talablar..." style="font-size: 12.5px;">
          </div>
          <div>
            <label style="font-size: 12px; font-weight: 700; color: #0284C7; display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
              💻 Axborot texnologiyalari markazi (ATM):
            </label>
            <input type="text" id="ev-note-atm" class="form-control" placeholder="Speaker, mikrofonlar soni, kompyuter/noutbuk, interaktiv panel, Wi-Fi..." style="font-size: 12.5px;">
          </div>
          <div>
            <label style="font-size: 12px; font-weight: 700; color: #16A34A; display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
              📚 O'quv bo'limi:
            </label>
            <input type="text" id="ev-note-ob" class="form-control" placeholder="Bo'sh xona/zal ajratish va dars jadvaliga xalaqit bermasligini kelishish..." style="font-size: 12.5px;">
          </div>
        </div>
      </div>

      <!-- TADBIK BANNERI (STANDART 16:9 PREVIEW VA O'LCHAMLAR) -->
      <div class="form-group mb-3" style="background: #F8FAFC; border: 1.5px dashed #CBD5E1; border-radius: 12px; padding: 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <label class="form-label" style="font-weight: 700; color: #1E293B; margin: 0; display: flex; align-items: center; gap: 6px;">
            🖼️ Tadbir Banneri / Rasmi (Standart 16:9 format)
          </label>
          <span style="font-size: 11px; background: #EFF6FF; color: #2563EB; font-weight: 800; padding: 3px 8px; border-radius: 6px; border: 1px solid #BFDBFE;">
            16:9 Standart
          </span>
        </div>
        <div style="font-size: 11.5px; color: #475569; margin-bottom: 10px; line-height: 1.5; background: #FFFFFF; border: 1px solid #E2E8F0; padding: 8px 12px; border-radius: 8px;">
          📌 <strong>Tavsiya etilgan aniq o'lcham:</strong> <b>1200 × 675 px</b> yoki <b>1280 × 720 px</b> (16:9 nisbatda, max 5 MB).
          <div style="color: #64748B; font-size: 11px; margin-top: 2px;">Ushbu rasm Telegram bot orqali barcha talabalarga bildirishnoma sifatida yuboriladi va Katta Ekran (TV) da sifatli ko'rinadi.</div>
        </div>

        <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px;">
          <input type="text" id="ev-photo-url" class="form-control" placeholder="Rasm URL manzili yoki quyidagi tugma orqali rasm yuklang..." oninput="handleEventPhotoUrlChange(this.value, 'ev-photo-preview', 'ev-photo-preview-wrap')" style="font-size: 13px;">
          <label class="btn btn-outline" style="white-space: nowrap; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; margin: 0; padding: 8px 14px; font-size: 12.5px; font-weight: 600;">
            📁 Rasm yuklash
            <input type="file" accept="image/*" style="display: none;" onchange="handleEventPhotoUpload(this, 'ev-photo-url', 'ev-photo-preview', 'ev-photo-preview-wrap')">
          </label>
        </div>

        <div id="ev-photo-preview-wrap" style="display: none; margin-top: 10px; border-radius: 10px; overflow: hidden; border: 1px solid #E2E8F0; height: 190px; background: #0B0F19; position: relative; text-align: center;">
          <img id="ev-photo-preview" src="" alt="Banner ko'rinishi" style="max-height: 100%; max-width: 100%; object-fit: contain; margin: 0 auto; display: block;">
          <button type="button" onclick="clearEventPhoto('ev-photo-url', 'ev-photo-preview', 'ev-photo-preview-wrap')" style="position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.7); color: white; border: none; border-radius: 6px; padding: 4px 8px; font-size: 11px; cursor: pointer;">✕ O'chirish</button>
        </div>
        <div id="ev-photo-preview-wrap-info" style="font-size: 11.5px; padding: 6px 10px; margin-top: 6px; border-radius: 6px; background: #F1F5F9; display: none;"></div>
      </div>

      <div class="grid grid-2 mb-3">
        <div class="form-group">
          <label class="form-label" style="font-weight:700;">Soha / Kategoriya *</label>
          <select id="ev-cat-id" class="form-control" required>
            ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" style="font-weight:700;">Miqyos / Daraja (Ball avtomatik) *</label>
          <select id="ev-level" class="form-control" required>
            <option value="klub">Klub miqyosida (+3 ball)</option>
            <option value="universitet" selected>Universitet miqyosida (+5 ball)</option>
            <option value="viloyat">Viloyat miqyosida (+8 ball)</option>
            <option value="respublika">Respublika miqyosida (+15 ball)</option>
            <option value="xalqaro">Xalqaro miqyosda (+25 ball)</option>
          </select>
        </div>
      </div>

      <div class="grid grid-2 mb-3">
        <div class="form-group">
          <label class="form-label">Maksimal sig'im (o'rinlar soni)</label>
          <input type="number" id="ev-capacity" class="form-control" placeholder="Cheksiz bo'lsa bo'sh qoldiring">
        </div>
        <div class="form-group" style="display: flex; align-items: center; padding-top: 24px;">
          <label style="cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 8px;">
            <input type="checkbox" id="ev-req-reg"> Oldindan ro'yxatdan o'tish majburiy
          </label>
        </div>
      </div>

      <div class="form-group mb-3" style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 12px 14px;">
        <label class="form-label" style="font-weight: 700; color: #1E293B; margin-bottom: 4px;">
          ⏱️ Davomat Boshlanish Vaqti (Attendance Window) *
        </label>
        <p style="font-size: 12px; color: #64748B; margin-bottom: 8px;">
          Default holatda davomat tadbirdan 5 daqiqa oldin boshlanadi:
        </p>
        <div style="display: flex; gap: 10px; align-items: center;">
          <input type="number" id="ev-att-open-minutes" class="form-control" min="0" max="180" value="5" style="max-width: 130px; font-weight: 700; font-size: 14px;">
          <span style="font-size: 13px; font-weight: 600; color: #334155;">daqiqa oldin boshlanadi</span>
        </div>
      </div>
    </form>
  `;

  modalFooter.innerHTML = `
    <button class="btn btn-outline" onclick="closeModal()">Bekor Qilish</button>
    <button class="btn btn-primary" onclick="submitCreateEvent()" style="display: inline-flex; align-items: center; gap: 6px; font-weight:700;">
      ${icon('check', 14)} Tadbirni Yaratish & 4 Bo'limga Kelishuvga Yuborish
    </button>
  `;

  openModal();
  initEventDateTimeControls('');
}

async function submitCreateEvent() {
  const title = document.getElementById('ev-title')?.value.trim();
  const place = document.getElementById('ev-place')?.value.trim();
  const category_id = document.getElementById('ev-cat-id')?.value;
  const level = document.getElementById('ev-level')?.value;
  const capacity = document.getElementById('ev-capacity')?.value;
  const req_reg = document.getElementById('ev-req-reg')?.checked;
  const att_open_val = document.getElementById('ev-att-open-minutes')?.value;

  if (!title || !place || !category_id || !level) {
    alert("Iltimos, barcha majburiy maydonlarni to'ldiring!");
    return;
  }

  const dtResult = updateEventDateTimeSummary('');
  if (!dtResult.valid) {
    alert(dtResult.error || "Tadbir sanasi va vaqtini to'g'ri belgilang!");
    return;
  }

  // Tashabbuskor tekshiruvi
  let leadType = createEventLeadState.type || 'self';
  let leadId = AppState.user.id;
  let leadName = AppState.user.full_name || AppState.user.username;
  let leadGroup = null;
  let leadPoints = 0;

  if (leadType === 'student') {
    if (!createEventLeadState.selectedLead) {
      alert("Iltimos, asosiy tashabbuskor bo'lgan talabani qidirib tanlang!");
      const inp = document.getElementById('ev-lead-search-input');
      if (inp) inp.focus();
      return;
    }
    leadId = createEventLeadState.selectedLead.id;
    leadName = createEventLeadState.selectedLead.name;
    leadGroup = createEventLeadState.selectedLead.group || null;
    const ptsSelect = document.getElementById('ev-lead-points-select');
    leadPoints = Number(ptsSelect ? ptsSelect.value : createEventLeadState.points) || 20;
  } else if (leadType === 'staff') {
    if (createEventLeadState.selectedLead) {
      leadId = createEventLeadState.selectedLead.id;
      leadName = createEventLeadState.selectedLead.name;
    }
  }

  const attOpenMinutes = Math.max(0, Number(att_open_val) || 5);
  const photo_url = document.getElementById('ev-photo-url')?.value.trim() || null;
  const noteXb = document.getElementById('ev-note-xb')?.value.trim() || null;
  const noteAtm = document.getElementById('ev-note-atm')?.value.trim() || null;
  const noteOb = document.getElementById('ev-note-ob')?.value.trim() || null;

  try {
    const payload = {
      title,
      starts_at: dtResult.starts_at,
      ends_at: dtResult.ends_at,
      place,
      photo_url,
      image_url: photo_url,
      organizer_unit: AppState.user.id || 'dep_yb',
      category_id,
      level,
      capacity: capacity ? Number(capacity) : null,
      requires_registration: Boolean(req_reg),
      attendance_open_minutes_before: attOpenMinutes,
      lead_type: leadType,
      lead_id: leadId,
      lead_name: leadName,
      lead_group: leadGroup,
      lead_points: leadPoints,
      agreement_xb_note: noteXb,
      agreement_atm_note: noteAtm,
      agreement_ob_note: noteOb
    };

    const res = await apiFetch('/api/events', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    closeModal();
    if (res.status === 'published') {
      alert(`🎉 Tadbir muvaffaqiyatli chop etildi (+${res.points} ball)!\nBarcha talabalarga Telegram bot orqali bildirishnoma yuborildi.`);
    } else {
      alert(`✅ Tadbir yaratildi!\n4 ta bo'limga (Xo'jalik, ATM, O'quv, Ish yurituvchi) kelishuv xabarnomalari yuborildi.\nIsh yurituvchi tasdiqlaganidan keyin tadbir e'lon qilinadi${leadType === 'student' ? ' va talabaga +' + leadPoints + ' ball avtomatik hisoblanadi.' : '.'}`);
    }

    renderDeptEvents(document.getElementById('module-page-container') || document.getElementById('app-content-area'));
  } catch (err) {
    alert(err.message);
  }
}

// 4 Ta Bo'lim Kelishuvi Modali (Xo'jalik, ATM, O'quv)
function openEventAgreementModal(eventId, deptCode) {
  const deptNames = {
    'xb': { name: 'Xo\'jalik Bo\'limi', icon: '🏢', role: 'stol, stul, zal, moddiy baza' },
    'atm': { name: 'Axborot Texnologiyalari Markazi (ATM)', icon: '💻', role: 'speaker, mikrofon, monitor, IT jihozlar' },
    'ob': { name: 'O\'quv Bo\'limi', icon: '📚', role: 'bo\'sh xona/zal ajratish va dars jadvali' }
  };
  const dInfo = deptNames[deptCode] || { name: 'Bo\'lim', icon: '📋', role: 'texnik jarayonlar' };

  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalFooter = document.getElementById('modal-footer');

  modalTitle.innerHTML = `<span style="display:flex; align-items:center; gap:8px;">${dInfo.icon} ${dInfo.name} &mdash; Tadbirni Kelishish</span>`;
  modalBody.innerHTML = `
    <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:12px 14px; margin-bottom:14px;">
      <p style="margin:0; font-size:13px; color:#334155; line-height:1.45;">
        Siz <strong>${dInfo.name}</strong> vakili sifatida ushbu tadbirning moddiy-texnik va tashkiliy jarayonlarini (<strong>${dInfo.role}</strong>) ko'rib chiqib, kelishuv berasiz yoki e'tiroz bilan rad etasiz.
      </p>
    </div>

    <div class="form-group mb-3">
      <label class="form-label" style="font-weight:700;">Kelishuv Qaroringiz *:</label>
      <select id="event-agree-status" class="form-control" style="font-weight:700;">
        <option value="agreed" selected>✅ Kelishildi (Moddiy-texnik imkoniyatlar mavjud, roziman)</option>
        <option value="rejected">❌ E'tiroz bilan rad etish (Zal band, jihozlar yetarli emas yoki boshqa sabab)</option>
      </select>
    </div>

    <div class="form-group">
      <label class="form-label" style="font-weight:700;">Izoh / Ta'minot bo'yicha ko'rsatma:</label>
      <textarea id="event-agree-note" class="form-control" rows="3" placeholder="Zal, jihozlar yoki e'tiroz sababini aniq yozing..."></textarea>
      <small style="color:#64748B; font-size:11.5px; margin-top:4px; display:block;">
        ⚠️ E'tiroz bildirilsa, rad etish sababi tadbir tashabbuskoriga ko'rsatiladi.
      </small>
    </div>
  `;

  modalFooter.innerHTML = `
    <button class="btn btn-outline" onclick="closeModal()">Bekor qilish</button>
    <button class="btn btn-primary" onclick="submitEventAgreement('${eventId}', '${deptCode}')" style="font-weight:700;">
      Qarorni Tasdiqlash
    </button>
  `;

  openModal();
}

async function submitEventAgreement(eventId, deptCode) {
  const status = document.getElementById('event-agree-status')?.value;
  const noteEl = document.getElementById('event-agree-note');
  const note = (noteEl?.value || '').trim();

  if (status === 'rejected' && (!note || note.length < 5)) {
    alert("Iltimos, rad etish sababini batafsil izohlab yozing (kamida 5 ta belgi)!");
    if (noteEl) noteEl.focus();
    return;
  }

  try {
    const res = await apiFetch(`/api/events/${eventId}/agree`, {
      method: 'POST',
      body: JSON.stringify({ dept: deptCode, status, note })
    });

    closeModal();
    alert(res.message || "Kelishuv qarori muvaffaqiyatli saqlandi!");
    renderDeptEvents(document.getElementById('module-page-container') || document.getElementById('app-content-area'));
  } catch (err) {
    alert(err.message);
  }
}

// Ish Yurituvchi Yakuniy Tasdiqlash Modali
function openFinalEventApproveModal(eventId) {
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalFooter = document.getElementById('modal-footer');

  modalTitle.innerHTML = `<span style="display:flex; align-items:center; gap:8px;">📑 Ish Yurituvchi &mdash; Tadbirni Yakuniy Tasdiqlash & Chop Etish</span>`;
  modalBody.innerHTML = `
    <div style="background:#EEF2FF; border:1px solid #C7D2FE; border-radius:10px; padding:12px 14px; margin-bottom:14px;">
      <p style="margin:0; font-size:13px; color:#3730A3; line-height:1.45;">
        Ushbu tadbir 3 ta bo'lim (Xo'jalik, ATM, O'quv) tomonidan ko'rib chiqilgan.<br>
        <strong>Ish yurituvchi tasdiqlashi bilan tadbir rasman e'lon qilinadi, talabalarga Telegram xabar yuboriladi va agar tashabbuskor talaba bo'lsa, unga avtomatik tashkilotchilik bali taqdim etiladi!</strong>
      </p>
    </div>

    <div class="form-group mb-3">
      <label class="form-label" style="font-weight:700;">Yakuniy Qaror *:</label>
      <select id="event-final-status" class="form-control" style="font-weight:700;">
        <option value="approved" selected>✓ Tasdiqlash va Rasman E'lon Qilish (Publish)</option>
        <option value="rejected">✗ Bekor qilish / Rad etish</option>
      </select>
    </div>

    <div class="form-group">
      <label class="form-label" style="font-weight:700;">Buyruq raqami yoki yakuniy izoh:</label>
      <textarea id="event-final-note" class="form-control" rows="2" placeholder="Masalan: 42-sonli ichki buyruq asosida tasdiqlandi..."></textarea>
    </div>
  `;

  modalFooter.innerHTML = `
    <button class="btn btn-outline" onclick="closeModal()">Bekor qilish</button>
    <button class="btn btn-primary" onclick="submitFinalEventApprove('${eventId}')" style="background:#4F46E5; border-color:#4F46E5; font-weight:700;">
      Yakuniy Tasdiqlash & Chop Etish
    </button>
  `;

  openModal();
}

async function submitFinalEventApprove(eventId) {
  const status = document.getElementById('event-final-status')?.value;
  const noteEl = document.getElementById('event-final-note');
  const note = (noteEl?.value || '').trim();

  try {
    const res = await apiFetch(`/api/events/${eventId}/final-approve`, {
      method: 'POST',
      body: JSON.stringify({ status, note })
    });

    closeModal();
    alert(res.message || "Tadbir muvaffaqiyatli tasdiqlandi va rasman chop etildi!");
    renderDeptEvents(document.getElementById('module-page-container') || document.getElementById('app-content-area'));
  } catch (err) {
    alert(err.message);
  }
}

window.openEventAgreementModal = openEventAgreementModal;
window.submitEventAgreement = submitEventAgreement;
window.openFinalEventApproveModal = openFinalEventApproveModal;
window.submitFinalEventApprove = submitFinalEventApprove;
window.onEventLeadTypeChange = onEventLeadTypeChange;
window.onEventLeadSearchInput = onEventLeadSearchInput;
window.selectEventLeadItem = selectEventLeadItem;
window.clearSelectedEventLead = clearSelectedEventLead;

// Tadbirni Tahrirlash Modali (Faqat yaratuvchi xodim va Superadmin, tadbir tugaguncha)
async function openEditEventModal(eventId) {
  try {
    const data = await apiFetch('/api/events');
    const event = (data.events || []).find(e => e.id === eventId);
    if (!event) {
      alert("Tadbir topilmadi!");
      return;
    }

    const now = new Date();
    const endsAt = new Date(event.ends_at);
    if (now > endsAt) {
      alert("Tadbir vaqti tugagan! Tadbir yakunlangandan keyin uni tahrirlash mumkin emas.");
      return;
    }

    const isCreator = (event.created_by === AppState.user.id || event.organizer_unit === AppState.user.id);
    const isSuperadmin = AppState.user.roles.includes('superadmin');
    if (!isCreator && !isSuperadmin) {
      alert("Faqat tadbirni yaratgan xodim va Superadmin tadbirni tahrirlashi mumkin!");
      return;
    }

    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalFooter = document.getElementById('modal-footer');

    modalTitle.innerHTML = `<span style="display: flex; align-items: center; gap: 8px;">${icon('edit', 18)} Tadbirni Tahrirlash</span>`;

    let categories = [];
    try {
      const catRes = await apiFetch('/api/observe/catalog');
      categories = catRes.categories || [];
    } catch (e) {
      categories = [];
    }

    const attOpen = event.attendance_open_minutes_before ?? 5;
    const safeTitle = (event.title || '').replace(/"/g, '&quot;');
    const safePlace = (event.place || '').replace(/"/g, '&quot;');

    modalBody.innerHTML = `
      <form id="dept-edit-event-form" onsubmit="event.preventDefault(); submitEditEvent('${eventId}');">
        <div class="form-group mb-3">
          <label class="form-label">Tadbir Nomi *</label>
          <input type="text" id="edit-ev-title" class="form-control" value="${safeTitle}" required style="font-size: 15px; font-weight: 600;">
        </div>

        <!-- SANA VA VAQT BOSHQARUVI (MAXSUS KALENDAR & GORIZONTAL SCROLLER) -->
        <div style="background: #F8FAFC; border: 2px solid #E2E8F0; border-radius: 14px; padding: 14px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <label style="font-weight: 800; font-size: 14px; color: #0F172A; display: flex; align-items: center; gap: 6px; margin: 0;">
              📅 Tadbir Sanasi va Vaqti (Sodda & Xatosiz) *
            </label>
          </div>

          <!-- 1. SANA (KALENDAR KO'RINISHI - O'TGAN KUNLAR BLOKLANGAN) -->
          <div style="margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 12px; font-weight: 700; color: #334155;">1. Tadbir kuni (O'tgan kunlar tanlanmaydi):</span>
              <div style="display: flex; gap: 4px;">
                <button type="button" id="edit_date-btn-today" class="btn btn-sm btn-outline edit_date-quick-btn" onclick="setEventQuickDate('today', 'edit_')" style="font-size: 11px; padding: 2px 8px;">Bugun</button>
                <button type="button" id="edit_date-btn-tomorrow" class="btn btn-sm btn-outline edit_date-quick-btn" onclick="setEventQuickDate('tomorrow', 'edit_')" style="font-size: 11px; padding: 2px 8px;">Ertaga</button>
                <button type="button" id="edit_date-btn-afterTomorrow" class="btn btn-sm btn-outline edit_date-quick-btn" onclick="setEventQuickDate('afterTomorrow', 'edit_')" style="font-size: 11px; padding: 2px 8px;">Indinga</button>
              </div>
            </div>
            <div id="edit_cal-container" class="custom-calendar-widget"></div>
          </div>

          <!-- 2. BOSHLANISH VAQTI (BITTA GORIZONTAL SATRDA SCROLL) -->
          <div class="time-scroll-track-wrapper">
            <div style="font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
              <span>⏰ 2. Boshlanish vaqti</span>
              <span style="font-size: 11px; color: #64748B; font-weight: normal;">(Gorizontal suring va tanlang):</span>
            </div>
            <div class="time-scroll-track" id="edit_start-time-track"></div>
          </div>

          <!-- 3. TUGASH VAQTI (BITTA GORIZONTAL SATRDA SCROLL) -->
          <div class="time-scroll-track-wrapper">
            <div style="font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
              <span>⌛ 3. Davomiyligi va Tugash vaqti</span>
              <span style="font-size: 11px; color: #64748B; font-weight: normal;">(Gorizontal suring va tanlang):</span>
            </div>
            <div class="time-scroll-track" id="edit_end-time-track"></div>
          </div>

          <!-- 4. TASDIQ XULOSASI VA OK TUGMASI -->
          <div id="edit_ev-datetime-summary"></div>
        </div>

        <div class="form-group mb-3">
          <label class="form-label">O'tkazilish joyi (Bino / Zal) *</label>
          <input type="text" id="edit-ev-place" class="form-control" value="${safePlace}" required>
        </div>

        <!-- TADBIK RASMI (BANNER) VA TAVSIYA ETILGAN O'LCHAM -->
        <div class="form-group mb-3" style="background: #F8FAFC; border: 1.5px dashed #CBD5E1; border-radius: 12px; padding: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <label class="form-label" style="font-weight: 700; color: #1E293B; margin: 0; display: flex; align-items: center; gap: 6px;">
              🖼️ Tadbir Rasmi / Banneri (TV va Ilova uchun)
            </label>
            <span style="font-size: 11px; background: #EFF6FF; color: #2563EB; font-weight: 700; padding: 3px 8px; border-radius: 6px; border: 1px solid #BFDBFE;">
              Recommended: 16:9
            </span>
          </div>
          <p style="font-size: 11.5px; color: #64748B; margin-bottom: 10px; line-height: 1.4;">
            📐 <strong>Tavsiya etilgan o'lcham:</strong> <strong>16:9 nisbatda</strong> (masalan, <strong>1200×675 px</strong> yoki <strong>800×450 px</strong>). TV ekranida va Talaba ilovasida to'liq mos va chiroyli chiqishi uchun sifatli gorizontal rasm yuklang.
          </p>

          <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px;">
            <input type="text" id="edit-ev-photo-url" class="form-control" value="${event.photo_url || event.image_url || ''}" placeholder="Rasm URL manzili yoki fayl tanlang..." oninput="handleEventPhotoUrlChange(this.value, 'edit-ev-photo-preview', 'edit-ev-photo-preview-wrap')" style="font-size: 13px;">
            <label class="btn btn-outline" style="white-space: nowrap; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; margin: 0; padding: 8px 14px; font-size: 12.5px;">
              📁 Fayl tanlash
              <input type="file" accept="image/*" style="display: none;" onchange="handleEventPhotoUpload(this, 'edit-ev-photo-url', 'edit-ev-photo-preview', 'edit-ev-photo-preview-wrap')">
            </label>
          </div>

          <div id="edit-ev-photo-preview-wrap" style="display: ${event.photo_url || event.image_url ? 'block' : 'none'}; margin-top: 10px; border-radius: 10px; overflow: hidden; border: 1px solid #E2E8F0; max-height: 200px; background: #0F172A; text-align: center; position: relative;">
            <img id="edit-ev-photo-preview" src="${event.photo_url || event.image_url || ''}" alt="Banner ko'rinishi" style="width: 100%; max-height: 200px; object-fit: cover; display: block;">
            <button type="button" onclick="clearEventPhoto('edit-ev-photo-url', 'edit-ev-photo-preview', 'edit-ev-photo-preview-wrap')" style="position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.65); color: white; border: none; border-radius: 6px; padding: 4px 8px; font-size: 11px; cursor: pointer;">✕ O'chirish</button>
          </div>
        </div>

        <div class="grid grid-2 mb-3">
          <div class="form-group">
            <label class="form-label">Soha / Kategoriya *</label>
            <select id="edit-ev-cat-id" class="form-control" required>
              ${categories.map(c => `<option value="${c.id}" ${c.id === event.category_id ? 'selected' : ''}>${c.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Miqyos / Daraja (Ball avtomatik) *</label>
            <select id="edit-ev-level" class="form-control" required>
              <option value="klub" ${event.level === 'klub' ? 'selected' : ''}>Klub miqyosida (+3 ball)</option>
              <option value="universitet" ${event.level === 'universitet' ? 'selected' : ''}>Universitet miqyosida (+5 ball)</option>
              <option value="viloyat" ${event.level === 'viloyat' ? 'selected' : ''}>Viloyat miqyosida (+8 ball)</option>
              <option value="respublika" ${event.level === 'respublika' ? 'selected' : ''}>Respublika miqyosida (+15 ball)</option>
              <option value="xalqaro" ${event.level === 'xalqaro' ? 'selected' : ''}>Xalqaro miqyosda (+25 ball)</option>
            </select>
          </div>
        </div>

        <div class="grid grid-2 mb-3">
          <div class="form-group">
            <label class="form-label">Maksimal sig'im (o'rinlar soni)</label>
            <input type="number" id="edit-ev-capacity" class="form-control" value="${event.capacity || ''}" placeholder="Cheksiz bo'lsa bo'sh qoldiring">
          </div>
          <div class="form-group" style="display: flex; align-items: center; padding-top: 24px;">
            <label style="cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 8px;">
              <input type="checkbox" id="edit-ev-req-reg" ${event.requires_registration ? 'checked' : ''}> Oldindan ro'yxatdan o'tish majburiy
            </label>
          </div>
        </div>

        <!-- DAVOMAT BOSHLANISH VAQTI SOZLAMASI -->
        <div class="form-group mb-3" style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 12px 14px;">
          <label class="form-label" style="font-weight: 700; color: #1E293B; margin-bottom: 4px;">
            ⏱️ Davomat Boshlanish Vaqti (Attendance Window) *
          </label>
          <div style="display: flex; gap: 10px; align-items: center;">
            <input type="number" id="edit-ev-att-open-minutes" class="form-control" min="0" max="180" value="${attOpen}" style="max-width: 130px; font-weight: 700; font-size: 14px;">
            <span style="font-size: 13px; font-weight: 600; color: #334155;">daqiqa oldin boshlanadi</span>
          </div>
        </div>
      </form>
    `;

    modalFooter.innerHTML = `
      <button class="btn btn-outline" onclick="closeModal()">Bekor Qilish</button>
      <button class="btn btn-primary" onclick="submitEditEvent('${eventId}')" style="display: inline-flex; align-items: center; gap: 6px;">
        ${icon('check', 14)} O'zgarishlarni Saqlash
      </button>
    `;

    openModal();
    initEventDateTimeControls('edit_', event.starts_at, event.ends_at);
  } catch (err) {
    alert("Xatolik: " + err.message);
  }
}

async function submitEditEvent(eventId) {
  const title = document.getElementById('edit-ev-title')?.value.trim();
  const place = document.getElementById('edit-ev-place')?.value.trim();
  const category_id = document.getElementById('edit-ev-cat-id')?.value;
  const level = document.getElementById('edit-ev-level')?.value;
  const capacity = document.getElementById('edit-ev-capacity')?.value;
  const req_reg = document.getElementById('edit-ev-req-reg')?.checked;
  const att_open_val = document.getElementById('edit-ev-att-open-minutes')?.value;

  if (!title || !place || !category_id || !level) {
    alert("Iltimos, barcha majburiy maydonlarni to'ldiring!");
    return;
  }

  const dtResult = updateEventDateTimeSummary('edit_');
  if (!dtResult.valid) {
    alert(dtResult.error || "Tadbir sanasi va vaqtini to'g'ri belgilang!");
    return;
  }

  const attOpenMinutes = Math.max(0, Number(att_open_val) || 5);

  try {
    const photo_url = document.getElementById('edit-ev-photo-url')?.value.trim() || null;

    const payload = {
      title,
      starts_at: dtResult.starts_at,
      ends_at: dtResult.ends_at,
      place,
      photo_url,
      image_url: photo_url,
      category_id,
      level,
      capacity: capacity ? Number(capacity) : null,
      requires_registration: Boolean(req_reg),
      attendance_open_minutes_before: attOpenMinutes
    };

    const res = await apiFetch(`/api/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });

    closeModal();
    showToast("Tadbir muvaffaqiyatli tahrirlandi!");
    renderDeptEvents(document.getElementById('module-page-container') || document.getElementById('app-content-area'));
  } catch (err) {
    showToast("Xatolik: " + err.message, 'error');
  }
}

async function handleEventPhotoUpload(fileInput, urlInputId, previewImgId, wrapId) {
  if (!fileInput.files || !fileInput.files[0]) return;
  const file = fileInput.files[0];
  const formData = new FormData();
  formData.append('file', file);
  try {
    const res = await fetch('/api/files', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Faylni yuklashda xatolik');
    const urlInput = document.getElementById(urlInputId);
    if (urlInput) urlInput.value = data.url;
    handleEventPhotoUrlChange(data.url, previewImgId, wrapId);
    showToast("Tadbir rasmi muvaffaqiyatli yuklandi!", "success");
  } catch (err) {
    alert("Rasm yuklashda xatolik: " + err.message);
  }
}

function handleEventPhotoUrlChange(url, previewImgId, wrapId) {
  const wrap = document.getElementById(wrapId);
  const preview = document.getElementById(previewImgId);
  const infoEl = document.getElementById(wrapId + '-info');
  if (!wrap || !preview) return;
  if (url && url.trim()) {
    preview.src = url.trim();
    preview.onload = () => {
      const w = preview.naturalWidth;
      const h = preview.naturalHeight;
      const ratio = (w / (h || 1)).toFixed(2);
      const is16by9 = (ratio >= 1.68 && ratio <= 1.88);
      if (infoEl) {
        infoEl.innerHTML = is16by9 
          ? `<span style="color: #059669; font-weight: 700;">✅ Standart O'lcham: ${w}×${h} px (${ratio}:1 — 16:9 formatga to'liq mos!). Telegram va Katta Ekran uchun ideal.</span>`
          : `<span style="color: #D97706; font-weight: 600;">📐 O'lcham: ${w}×${h} px (${ratio}:1). Rasm TV va Mini App ilovada eng sifatli ko'rinishi uchun 16:9 (masalan: 1200×675 px yoki 1280×720 px) tavsiya etiladi.</span>`;
        infoEl.style.display = 'block';
      }
    };
    wrap.style.display = 'block';
  } else {
    preview.src = '';
    wrap.style.display = 'none';
    if (infoEl) {
      infoEl.innerHTML = '';
      infoEl.style.display = 'none';
    }
  }
}

function clearEventPhoto(urlInputId, previewImgId, wrapId) {
  const urlInput = document.getElementById(urlInputId);
  if (urlInput) urlInput.value = '';
  handleEventPhotoUrlChange('', previewImgId, wrapId);
}

window.handleEventPhotoUpload = handleEventPhotoUpload;
window.handleEventPhotoUrlChange = handleEventPhotoUrlChange;
window.clearEventPhoto = clearEventPhoto;

// 2-USUL: Xodim Talabaning QR Kodini yoki ID sini skanerlab qabul qilishi
// ====================================================================
// 2-USUL: Xodim Talabaning QR Kodini Jonli Kamera yoki ID bilan Skanerlab Qabul Qilishi
// ====================================================================
window.staffHtml5QrScanner = null;
window.staffScanCooldown = false;
window.isStaffCameraRunning = false;

function playScannerSound(isSuccess = true) {
  const soundToggle = document.getElementById('staff-sound-toggle');
  if (soundToggle && !soundToggle.checked) return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    if (isSuccess) {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } else {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    }
  } catch (e) {}
}

async function stopStaffQrScanner() {
  if (window.staffHtml5QrScanner && window.isStaffCameraRunning) {
    try {
      await window.staffHtml5QrScanner.stop();
    } catch (e) {}
  }
  window.isStaffCameraRunning = false;
  const statusEl = document.getElementById('staff-scanner-status');
  const toggleBtn = document.getElementById('btn-toggle-camera');
  if (statusEl) {
    statusEl.textContent = '⏹️ Jonli kamera to\'xtatilgan';
    statusEl.style.color = 'var(--text-muted)';
  }
  if (toggleBtn) toggleBtn.innerHTML = `▶️ Kamerani Yoqish`;
}
window.stopStaffQrScanner = stopStaffQrScanner;

async function startStaffQrScanner() {
  const readerEl = document.getElementById('staff-qr-reader');
  const statusEl = document.getElementById('staff-scanner-status');
  const toggleBtn = document.getElementById('btn-toggle-camera');
  if (!readerEl) return;

  if (window.staffHtml5QrScanner && window.isStaffCameraRunning) {
    return;
  }

  try {
    if (statusEl) {
      statusEl.textContent = '📷 Jonli kamera ishga tushirilmoqda...';
      statusEl.style.color = '#2563EB';
    }

    if (!window.staffHtml5QrScanner && window.Html5Qrcode) {
      window.staffHtml5QrScanner = new Html5Qrcode('staff-qr-reader');
    }

    if (!window.staffHtml5QrScanner) {
      if (statusEl) statusEl.textContent = 'Kamera moduli topilmadi (brauzerni yangilang)';
      return;
    }

    await window.staffHtml5QrScanner.start(
      { facingMode: 'environment' },
      {
        fps: 15,
        qrbox: { width: 220, height: 220 },
        aspectRatio: 1.0
      },
      async (decodedText) => {
        await handleStaffScannedCode(decodedText);
      },
      () => {}
    );

    window.isStaffCameraRunning = true;
    if (statusEl) {
      statusEl.textContent = '🟢 Jonli skaner faol — navbatdagi talaba QR kodini ko\'rsating...';
      statusEl.style.color = '#059669';
    }
    if (toggleBtn) toggleBtn.innerHTML = `⏹️ Kamerani To'xtatish`;
  } catch (err) {
    console.error('Staff camera error:', err);
    window.isStaffCameraRunning = false;
    if (statusEl) {
      statusEl.textContent = '❌ Kamerani ochib bo\'lmadi (ruxsat berilmagan yoki HTTPS talab qilinadi).';
      statusEl.style.color = '#DC2626';
    }
    if (toggleBtn) toggleBtn.innerHTML = `▶️ Qayta Urinish`;
  }
}
window.startStaffQrScanner = startStaffQrScanner;

async function toggleStaffCamera() {
  if (window.isStaffCameraRunning) {
    await stopStaffQrScanner();
  } else {
    await startStaffQrScanner();
  }
}
window.toggleStaffCamera = toggleStaffCamera;

async function handleStaffScannedCode(code) {
  if (window.staffScanCooldown) return;
  window.staffScanCooldown = true;

  const eventId = document.getElementById('checkin-event-id')?.value;
  const flashEl = document.getElementById('staff-live-flash');
  const statusEl = document.getElementById('staff-scanner-status');

  if (!eventId) {
    window.staffScanCooldown = false;
    return;
  }

  if (statusEl) {
    statusEl.textContent = '⏳ Skanerlandi, ma\'lumot tekshirilmoqda...';
    statusEl.style.color = '#D97706';
  }

  try {
    const res = await apiFetch(`/api/events/${eventId}/checkin-student`, {
      method: 'POST',
      body: JSON.stringify({
        qr_payload: code,
        student_query: code
      })
    });

    playScannerSound(true);

    if (flashEl) {
      flashEl.style.display = 'block';
      flashEl.style.background = '#ECFDF5';
      flashEl.style.border = '1px solid #6EE7B7';
      flashEl.style.color = '#065F46';
      flashEl.innerHTML = `
        <div style="font-weight: 700; font-size: 14px;">✅ Muvaffaqiyatli qabul qilindi!</div>
        <div style="font-size: 13px; margin-top: 2px;">
          <strong>${res.student.first_name} ${res.student.last_name}</strong> (${res.student.group_code}) talabaga <strong>+${res.points} ball</strong> berildi!
        </div>
      `;
    }

    if (statusEl) {
      statusEl.textContent = `✅ ${res.student.first_name} ${res.student.last_name} qabul qilindi! Keyingi talaba...`;
      statusEl.style.color = '#059669';
    }

    loadEventRecentCheckins(eventId);

    // 1.5 soniyalik pauzadan keyin navbatdagi talabani skanerlashga tayyor
    setTimeout(() => {
      window.staffScanCooldown = false;
      if (statusEl && window.isStaffCameraRunning) {
        statusEl.textContent = '🟢 Jonli skaner faol — navbatdagi talaba QR kodini ko\'rsating...';
        statusEl.style.color = '#059669';
      }
    }, 1500);

  } catch (err) {
    playScannerSound(false);

    if (flashEl) {
      flashEl.style.display = 'block';
      flashEl.style.background = '#FEF2F2';
      flashEl.style.border = '1px solid #FCA5A5';
      flashEl.style.color = '#991B1B';
      flashEl.innerHTML = `<strong>⚠️ Ogohlantirish:</strong> ${err.message}`;
    }

    if (statusEl) {
      statusEl.textContent = `⚠️ Xatolik yuz berdi. Qayta urinib ko'ring...`;
      statusEl.style.color = '#DC2626';
    }

    // 1.8 soniyalik pauzadan keyin qayta skanerlashga tayyor
    setTimeout(() => {
      window.staffScanCooldown = false;
      if (statusEl && window.isStaffCameraRunning) {
        statusEl.textContent = '🟢 Jonli skaner faol — navbatdagi talaba QR kodini ko\'rsating...';
        statusEl.style.color = '#059669';
      }
    }, 1800);
  }
}
window.handleStaffScannedCode = handleStaffScannedCode;

function switchStaffCheckinMode(mode) {
  const camBox = document.getElementById('staff-camera-box');
  const manBox = document.getElementById('staff-manual-box');
  const tabCam = document.getElementById('btn-tab-scanner');
  const tabMan = document.getElementById('btn-tab-manual');

  if (mode === 'camera') {
    if (camBox) camBox.style.display = 'block';
    if (manBox) manBox.style.display = 'none';
    if (tabCam) {
      tabCam.classList.add('active', 'btn-primary');
      tabCam.classList.remove('btn-outline');
    }
    if (tabMan) {
      tabMan.classList.remove('active', 'btn-primary');
      tabMan.classList.add('btn-outline');
    }
    startStaffQrScanner();
  } else {
    stopStaffQrScanner();
    if (camBox) camBox.style.display = 'none';
    if (manBox) manBox.style.display = 'block';
    if (tabMan) {
      tabMan.classList.add('active', 'btn-primary');
      tabMan.classList.remove('btn-outline');
    }
    if (tabCam) {
      tabCam.classList.remove('active', 'btn-primary');
      tabCam.classList.add('btn-outline');
    }
    setTimeout(() => {
      document.getElementById('checkin-query-input')?.focus();
    }, 80);
  }
}
window.switchStaffCheckinMode = switchStaffCheckinMode;

async function showStudentCheckinModal(preselectedEventId = '') {
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalFooter = document.getElementById('modal-footer');

  modalTitle.innerHTML = `<span style="display: flex; align-items: center; gap: 8px;">${icon('qrCode', 18)} 2-USUL: Talabani Qabul Qilish (Operativ Jonli Check-in)</span>`;

  let events = [];
  try {
    const res = await apiFetch('/api/events');
    events = res.events || [];
  } catch (e) {
    events = [];
  }

  if (events.length === 0) {
    modalBody.innerHTML = `
      <div style="text-align: center; padding: 24px; color: var(--text-muted);">
        <p>Hozircha tizimda faol tadbirlar mavjud emas. Avval tadbir e'lon qiling.</p>
      </div>
    `;
    modalFooter.innerHTML = `<button class="btn btn-outline" onclick="closeModal()">Yopish</button>`;
    openModal();
    return;
  }

  modalBody.innerHTML = `
    <div class="form-group mb-3">
      <label class="form-label" style="font-weight: 700; font-size: 13px;">Qaysi tadbirga qabul qilinmoqda? *</label>
      <select id="checkin-event-id" class="form-control" style="font-weight: 600; font-size: 13.5px;" onchange="loadEventRecentCheckins(this.value)">
        ${events.map(ev => `
          <option value="${ev.id}" ${ev.id === preselectedEventId ? 'selected' : ''}>
            ${ev.title} (+${ev.points} ball) — ${ev.place}
          </option>
        `).join('')}
      </select>
    </div>

    <!-- USULNI TANLASH TABLARI -->
    <div style="display: flex; gap: 8px; margin-bottom: 14px;">
      <button type="button" id="btn-tab-scanner" class="btn btn-primary active" style="flex: 1; padding: 9px; font-weight: 600; display: inline-flex; align-items: center; justify-content: center; gap: 6px;" onclick="switchStaffCheckinMode('camera')">
        📷 Jonli Kamera Skaner (Operativ)
      </button>
      <button type="button" id="btn-tab-manual" class="btn btn-outline" style="flex: 1; padding: 9px; font-weight: 600; display: inline-flex; align-items: center; justify-content: center; gap: 6px;" onclick="switchStaffCheckinMode('manual')">
        ⌨️ Qo'lda / Qidiruv
      </button>
    </div>

    <!-- 1. JONLI KAMERA REJIMI -->
    <div id="staff-camera-box" style="margin-bottom: 14px;">
      <div style="position: relative; width: 100%; max-width: 440px; margin: 0 auto; background: #0B1120; border-radius: 14px; overflow: hidden; border: 2px solid #2563EB; box-shadow: 0 4px 20px rgba(37,99,235,0.25);">
        <div id="staff-qr-reader" style="width: 100%; min-height: 250px;"></div>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; max-width: 440px; margin-left: auto; margin-right: auto;">
        <span id="staff-scanner-status" style="font-size: 12px; font-weight: 600; color: #2563EB;">🟢 Kamera yuklanmoqda...</span>
        <div style="display: flex; gap: 10px; align-items: center;">
          <button type="button" class="btn btn-sm btn-outline" id="btn-toggle-camera" onclick="toggleStaffCamera()">⏹️ To'xtatish</button>
          <label style="display: inline-flex; align-items: center; gap: 4px; font-size: 12px; color: var(--text-secondary); cursor: pointer; margin: 0;">
            <input type="checkbox" id="staff-sound-toggle" checked style="cursor: pointer;"> 🔊 Ovoz
          </label>
        </div>
      </div>
    </div>

    <!-- 2. QO'LDA KIRITISH REJIMI -->
    <div id="staff-manual-box" style="display: none; margin-bottom: 14px;">
      <form id="checkin-student-form" onsubmit="handleStudentCheckinSubmit(event)">
        <div class="form-group mb-2">
          <label class="form-label" style="font-weight: 600;">Talaba QR kodi / ID raqami / Telefon *</label>
          <div style="display: flex; gap: 8px;">
            <input type="text" id="checkin-query-input" class="form-control" placeholder="STU:... yoki talaba ID, telefon" autocomplete="off" style="font-size: 14px; font-family: monospace;">
            <button type="submit" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 6px; white-space: nowrap;">
              ${icon('checkCircle', 15)} <span>Qabul Qilish</span>
            </button>
          </div>
        </div>
      </form>
    </div>

    <!-- TEZKOR NATIJA FLASHERI -->
    <div id="staff-live-flash" style="display: none; margin-bottom: 14px; border-radius: 8px; padding: 12px 14px;"></div>
    <div id="checkin-result-alert" style="display: none; margin-bottom: 14px;"></div>

    <!-- ISHTIROKCHILAR JADVALI -->
    <div style="border-top: 1px solid var(--border-light); padding-top: 14px; margin-top: 14px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <span style="font-weight: 700; font-size: 12.5px; color: var(--text-main);">Ushbu tadbirga qabul qilingan talabalar:</span>
        <span id="checkin-count-badge" class="badge badge-primary">0 nafar</span>
      </div>
      <div id="checkin-recent-table-box" style="max-height: 180px; overflow-y: auto; background: #F8FAFC; border-radius: 8px; border: 1px solid var(--border-light); padding: 8px;">
        <div style="text-align: center; color: var(--text-muted); font-size: 12px; padding: 12px;">Ishtirokchilar ro'yxati yuklanmoqda...</div>
      </div>
    </div>
  `;

  modalFooter.innerHTML = `
    <button class="btn btn-outline" onclick="closeModal()">Yopish</button>
  `;

  openModal();
  const chosenId = document.getElementById('checkin-event-id')?.value;
  if (chosenId) loadEventRecentCheckins(chosenId);

  // Standart bo'yicha jonli kamera rejimini yoqish
  setTimeout(() => {
    startStaffQrScanner();
  }, 120);
}

async function loadEventRecentCheckins(eventId) {
  const box = document.getElementById('checkin-recent-table-box');
  const badge = document.getElementById('checkin-count-badge');
  if (!box || !eventId) return;

  try {
    const res = await apiFetch(`/api/events/${eventId}/participants`);
    const list = res.participants || [];
    if (badge) badge.textContent = `${list.length} nafar`;

    if (list.length === 0) {
      box.innerHTML = `<div style="text-align: center; color: var(--text-muted); font-size: 12px; padding: 12px;">Hozircha hech kim qabul qilinmagan</div>`;
      return;
    }

    box.innerHTML = `
      <table class="table" style="font-size: 12px; margin: 0;">
        <thead>
          <tr>
            <th style="padding: 6px 8px;">Talaba</th>
            <th style="padding: 6px 8px;">Guruh</th>
            <th style="padding: 6px 8px;">Check-in Vaqti</th>
            <th style="padding: 6px 8px; text-align: right;">Ball</th>
          </tr>
        </thead>
        <tbody>
          ${list.slice(0, 15).map(p => `
            <tr>
              <td style="padding: 6px 8px; font-weight: 600;">${(p.first_name ? `${p.first_name} ${p.last_name || ''}` : (p.student_name || p.full_name || 'Talaba')).trim()}</td>
              <td style="padding: 6px 8px;"><span class="badge badge-group">${p.group_code || '-'}</span></td>
              <td style="padding: 6px 8px; color: var(--text-muted);">${(p.at || p.checked_in_at || p.created_at) ? new Date(p.at || p.checked_in_at || p.created_at).toLocaleTimeString('uz-UZ') : '-'}</td>
              <td style="padding: 6px 8px; text-align: right;"><span class="badge" style="background:#ECFDF5; color:#059669; font-weight:700;">+${p.points || 5}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (e) {
    box.innerHTML = `<div style="color: var(--danger); font-size: 12px; padding: 8px;">Xatolik: ${e.message}</div>`;
  }
}

async function handleStudentCheckinSubmit(event) {
  event.preventDefault();
  const eventId = document.getElementById('checkin-event-id')?.value;
  const inputEl = document.getElementById('checkin-query-input');
  const alertBox = document.getElementById('checkin-result-alert');
  const query = inputEl ? inputEl.value.trim() : '';

  if (!eventId || !query) return;

  try {
    if (alertBox) alertBox.style.display = 'none';

    const res = await apiFetch(`/api/events/${eventId}/checkin-student`, {
      method: 'POST',
      body: JSON.stringify({
        qr_payload: query,
        student_query: query
      })
    });

    if (alertBox) {
      alertBox.style.display = 'block';
      alertBox.style.background = '#ECFDF5';
      alertBox.style.border = '1px solid #6EE7B7';
      alertBox.style.color = '#065F46';
      alertBox.style.borderRadius = '8px';
      alertBox.style.padding = '12px 16px';
      alertBox.innerHTML = `
        <div style="font-weight: 700; font-size: 13.5px;">✅ Muvaffaqiyatli qabul qilindi!</div>
        <div style="font-size: 12.5px; margin-top: 2px;">
          <strong>${res.student.first_name} ${res.student.last_name}</strong> (${res.student.group_code}) talabaga <strong>+${res.points} ball</strong> berildi!
        </div>
      `;
    }

    inputEl.value = '';
    inputEl.focus();
    loadEventRecentCheckins(eventId);
    // Asosiy sahifani yangilash
    renderDeptEvents(document.getElementById('module-page-container') || document.getElementById('app-content-area'));
  } catch (err) {
    if (alertBox) {
      alertBox.style.display = 'block';
      alertBox.style.background = '#FEF2F2';
      alertBox.style.border = '1px solid #FCA5A5';
      alertBox.style.color = '#991B1B';
      alertBox.style.borderRadius = '8px';
      alertBox.style.padding = '12px 16px';
      alertBox.innerHTML = `<strong>Xatolik:</strong> ${err.message}`;
    }
    inputEl.select();
  }
}

// Tadbir Ishtirokchilari Modali
async function showEventParticipantsModal(eventId) {
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalFooter = document.getElementById('modal-footer');

  modalTitle.textContent = 'Tadbir Ishtirokchilari Ro\'yxati';
  modalBody.innerHTML = '<div class="spinner"></div>';
  modalFooter.innerHTML = '<button class="btn btn-outline" onclick="closeModal()">Yopish</button>';
  openModal();

  try {
    const res = await apiFetch(`/api/events/${eventId}/participants`);
    const list = res.participants || [];

    if (list.length === 0) {
      modalBody.innerHTML = `<div style="text-align: center; padding: 30px; color: var(--text-muted);"><p>Hozircha hech qanday talaba ushbu tadbirga qabul qilinmagan.</p></div>`;
      return;
    }

    modalBody.innerHTML = `
      <div style="margin-bottom: 12px; font-size: 13px; color: var(--text-secondary);">
        Jami qabul qilingan talabalar soni: <strong>${list.length} nafar</strong>
      </div>
      <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
        <table class="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Talaba F.I.Sh</th>
              <th>Guruh</th>
              <th>Check-in Vaqti</th>
              <th>Ball</th>
            </tr>
          </thead>
          <tbody>
            ${list.map((p, idx) => {
              const rawDate = p.checked_in_at || p.at || p.created_at;
              let timeStr = '-';
              if (rawDate) {
                const d = new Date(rawDate);
                if (!isNaN(d.getTime())) {
                  timeStr = d.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
                }
              }
              const stName = (p.student_name || p.full_name || (p.first_name ? `${p.first_name} ${p.last_name || ''}` : 'Talaba')).trim();
              return `
              <tr>
                <td>${idx + 1}</td>
                <td style="font-weight: 600;">${stName}</td>
                <td><span class="badge badge-group">${p.group_code || '-'}</span></td>
                <td style="color: var(--text-muted); font-size: 12px;">${timeStr}</td>
                <td><span class="badge" style="background:#ECFDF5; color:#059669; font-weight: 700;">+${p.points || 5}</span></td>
              </tr>
            `;}).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (e) {
    modalBody.innerHTML = `<p class="text-danger">${e.message}</p>`;
  }
}

// Tadbirni O'chirish
async function deleteEvent(eventId) {
  if (!confirm("Haqiqatan ham ushbu tadbirni o'chirmoqchimisiz? Barcha ro'yxatdan o'tganlar va check-in ma'lumotlari o'chiriladi.")) {
    return;
  }
  try {
    const res = await apiFetch(`/api/events/${eventId}`, { method: 'DELETE' });
    showToast(res.message || "Tadbir muvaffaqiyatli o'chirildi!");
    renderDeptEvents(document.getElementById('module-page-container') || document.getElementById('app-content-area'));
  } catch (err) {
    showToast(`Xatolik: ${err.message}`, 'error');
  }
}

// -------------------------------------------------------------
// SAHIFA: XODIMNING SHAXSIY PROFILI (staff-my-profile)
// -------------------------------------------------------------
async function renderStaffProfile(container) {
  try {
    const res = await apiFetch('/api/admin/profile/me');
    const user = res.user;

    const fullName = user.full_name || user.name || user.id;
    const initials = (fullName || '').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    const roles = user.roles || [];
    const groups = user.groups || [];

    const roleBadges = roles.map(r => {
      const meta = ROLE_META[r] || { label: r, color: '#3B82F6', bg: '#EFF6FF' };
      return `<span class="badge" style="background:${meta.bg}; color:${meta.color}; border:1px solid ${meta.color}40; font-weight:600; padding:4px 10px;">${meta.label}</span>`;
    }).join(' ') || '<span class="text-muted">Rol biriktirilmagan</span>';

    const groupBadges = groups.map(g => `<span class="badge badge-group">${g}</span>`).join(' ') || '<span style="color:#94A3B8; font-size:12px;">Guruhlar yo\'q</span>';

    container.innerHTML = `
      <div class="staff-profile-card">
        <!-- Hero Header -->
        <div class="staff-profile-header">
          <div class="staff-profile-avatar-wrap" id="profile-avatar-wrap">
            ${user.photo_url ? `
              <img src="${user.photo_url}" class="staff-profile-avatar-img" id="profile-hero-img" alt="Foto">
            ` : `
              <span class="staff-profile-avatar-fallback" id="profile-hero-fallback">${initials || '👤'}</span>
            `}
          </div>
          <div>
            <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 6px;">${fullName}</h2>
            <div style="font-size: 13px; opacity: 0.9; margin-bottom: 10px;">
              <span>@${user.username || user.id}</span> &nbsp;|&nbsp; <span>${user.email || 'Email kiritilmagan'}</span>
            </div>
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              ${roleBadges}
            </div>
          </div>
        </div>

        <!-- Form Body -->
        <div style="padding: 28px;">
          <form id="staff-profile-edit-form" onsubmit="handleStaffProfileSave(event)">
            <!-- 1. Shaxsiy ma'lumotlar -->
            <div class="grid grid-2 mb-3">
              <div class="form-group">
                <label class="form-label" style="font-weight: 600;">F.I.Sh (To'liq Ism Sharif) *</label>
                <input type="text" id="staff-profile-fullname" class="form-control" value="${user.full_name || ''}" required>
              </div>
              <div class="form-group">
                <label class="form-label" style="font-weight: 600;">Email Manzili *</label>
                <input type="email" id="staff-profile-email" class="form-control" value="${user.email || ''}">
              </div>
            </div>

            <div class="grid grid-2 mb-3">
              <div class="form-group">
                <label class="form-label" style="font-weight: 600;">Telefon Raqami</label>
                <input type="text" id="staff-profile-phone" class="form-control" value="${user.phone || ''}" placeholder="+998901234567">
              </div>
              <div class="form-group">
                <label class="form-label" style="font-weight: 600;">Telegram User ID (Xabarnomalar uchun)</label>
                <input type="text" id="staff-profile-tgid" class="form-control" value="${user.telegram_user_id || ''}" placeholder="masalan: 1202082857">
              </div>
            </div>

            <!-- 2. Parol o'zgartirish -->
            <div class="form-group mb-4" style="background: #F8FAFC; border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 14px;">
              <label class="form-label" style="font-weight: 600; margin-bottom: 4px;">Yangi Parol O'rnatish</label>
              <p style="font-size: 11.5px; color: var(--text-muted); margin-bottom: 8px;">Agar parolni o'zgartirishni istamasangiz, ushbu maydonni bo'sh qoldiring:</p>
              <input type="password" id="staff-profile-password" class="form-control" placeholder="Yangi parol (kamida 6 ta belgi)" style="max-width: 400px;">
            </div>

            <!-- 3. Biriktirilgan Rollar va Guruhlar (Faqat ko'rish uchun) -->
            <div class="grid grid-2 mb-4" style="background: #F1F5F9; border-radius: var(--radius-md); padding: 14px;">
              <div>
                <label style="font-size: 11.5px; color: #64748B; font-weight: 700; text-transform: uppercase;">Biriktirilgan Rollar:</label>
                <div style="margin-top: 6px;">${roleBadges}</div>
              </div>
              <div>
                <label style="font-size: 11.5px; color: #64748B; font-weight: 700; text-transform: uppercase;">Tyutor Guruhlari:</label>
                <div style="margin-top: 6px;">${groupBadges}</div>
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 10px;">
              <button type="submit" class="btn btn-primary" style="padding: 10px 24px; font-weight: 600; display: inline-flex; align-items: center; gap: 8px;">
                ${icon('check', 15)} <span>O'zgarishlarni Saqlash</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="card"><p class="text-danger">${err.message}</p></div>`;
  }
}

async function handleStaffProfileSave(event) {
  event.preventDefault();

  const full_name = document.getElementById('staff-profile-fullname')?.value.trim();
  const email = document.getElementById('staff-profile-email')?.value.trim();
  const phone = document.getElementById('staff-profile-phone')?.value.trim();
  const telegram_user_id = document.getElementById('staff-profile-tgid')?.value.trim();
  const password = document.getElementById('staff-profile-password')?.value;

  if (!full_name) {
    alert("F.I.Sh kiritilishi shart!");
    return;
  }

  try {
    const payload = {
      full_name,
      email,
      phone,
      telegram_user_id: telegram_user_id || null
    };
    if (password && String(password).trim().length > 0) {
      payload.password = String(password).trim();
    }

    const res = await apiFetch('/api/admin/profile/me', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });

    // AppState ni yangilash
    AppState.user.full_name = full_name;
    AppState.user.name = full_name;
    AppState.user.email = email;
    AppState.user.phone = phone;
    localStorage.setItem('akhu_auth_user', JSON.stringify(AppState.user));

    updateAuthUI();
    showToast("Profil ma'lumotlaringiz muvaffaqiyatli saqlandi!");
    renderStaffProfile(document.getElementById('module-page-container') || document.getElementById('app-content-area'));
  } catch (err) {
    showToast(`Xatolik: ${err.message}`, 'error');
  }
}

window.openCreateEventModal = openCreateEventModal;
window.submitCreateEvent = submitCreateEvent;
window.showStudentCheckinModal = showStudentCheckinModal;
window.handleStudentCheckinSubmit = handleStudentCheckinSubmit;
window.loadEventRecentCheckins = loadEventRecentCheckins;
window.showEventParticipantsModal = showEventParticipantsModal;
window.deleteEvent = deleteEvent;
window.handleStaffProfileSave = handleStaffProfileSave;

// -------------------------------------------------------------
// SAHIFA: GPA & DAVOMAT IMPORT (REGISTRATOR)
// -------------------------------------------------------------
// SAHIFA: GPA & DAVOMAT IMPORT (REGISTRATOR)
// -------------------------------------------------------------
async function renderGpaImport(container) {
  let html = `
    <div class="grid grid-2">
      <!-- GPA TOP 20% -->
      <div class="card">
        <div class="card-header">
          <h3>${icon('award', 16)} GPA Top 20% Talabalar Importi</h3>
        </div>
        <div class="card-body">
          <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">
            Semestr yakunida har bir guruhdagi GPA ko'rsatkichi yuqori 20% talabalarga avtomatik <strong>+20 ball</strong> beriladi.
          </p>
          <div class="form-group mb-3">
            <label class="form-label">Excel fayl tanlang (.xlsx, .xls):</label>
            <input type="file" id="gpa-file-input" class="form-control" accept=".xlsx,.xls">
          </div>
          <button id="btn-upload-gpa" class="btn btn-primary" style="width: 100%;">
            ${icon('upload', 14)} GPA Ma'lumotlarini Qayta Ishlash
          </button>
        </div>
      </div>

      <!-- 100% DAVOMAT -->
      <div class="card">
        <div class="card-header">
          <h3>${icon('clock', 16)} 100% Namunali Davomat Importi</h3>
        </div>
        <div class="card-body">
          <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">
            Semestr davomida sababsiz dars qoldirmagan va davomati 100% bo'lgan talabalarga <strong>+15 ball</strong> beriladi.
          </p>
          <div class="form-group mb-3">
            <label class="form-label">Excel fayl tanlang (.xlsx, .xls):</label>
            <input type="file" id="att-file-input" class="form-control" accept=".xlsx,.xls">
          </div>
          <button id="btn-upload-att" class="btn btn-primary" style="width: 100%;">
            ${icon('upload', 14)} Davomat Ma'lumotlarini Qayta Ishlash
          </button>
        </div>
      </div>
    </div>
  `;
  container.innerHTML = html;

  document.getElementById('btn-upload-gpa').addEventListener('click', async () => {
    const file = document.getElementById('gpa-file-input').files[0];
    if (!file) return alert('Iltimos, fayl tanlang!');
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/admin/import/gpa', {
        method: 'POST',
        headers: { 'x-user-id': AppState.user.id },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert(`Muvaffaqiyatli import qilindi! Yangilanganlar: ${data.created}`);
    } catch (e) {
      alert(`Xato: ${e.message}`);
    }
  });

  document.getElementById('btn-upload-att').addEventListener('click', async () => {
    const file = document.getElementById('att-file-input').files[0];
    if (!file) return alert('Iltimos, fayl tanlang!');
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/admin/import/attendance', {
        method: 'POST',
        headers: { 'x-user-id': AppState.user.id },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert(`Muvaffaqiyatli import qilindi! Yangilanganlar: ${data.created}`);
    } catch (e) {
      alert(`Xato: ${e.message}`);
    }
  });
}

// -------------------------------------------------------------
// SAHIFA: PROREKTOR 2-BOSQICH TASDIQ (PV)
// -------------------------------------------------------------
async function renderProrektorQueue(container) {
  try {
    const data = await apiFetch('/api/approvals');
    const entries = data.entries || [];

    let html = `
      <div class="card mb-3">
        <div class="card-header">
          <h3>Prorektor Ikkinchi Bosqich Tasdig'i (PV)</h3>
          <span style="font-size: 12px; color: var(--text-muted);">25+ ballik arizalar va -30 jarimalar</span>
        </div>
      </div>

      ${entries.length === 0 ? `
        <div class="card p-5 text-center">
          <p style="color: var(--text-muted);">Prorektor tasdig'iga o'tgan arizalar mavjud emas.</p>
        </div>
      ` : `
        <div class="grid grid-1">
          ${entries.map(e => `
            <div class="card mb-3" style="border-left: 5px solid #8B5CF6;">
              <div class="card-header">
                <div>
                  <span class="badge badge-warning">Prorektor Tasdig'i Talab Qilinadi</span>
                  <h3 style="margin-top: 6px; font-size: 17px;">${e.item_name}</h3>
                  <span style="font-size: 12px; color: var(--text-muted);">
                    Talaba: <strong>${e.first_name} ${e.last_name}</strong> (${e.group_code}) • Tyutor: ${e.creator_name || '-'}
                  </span>
                </div>
                <div style="font-size: 24px; font-weight: 800; color: ${e.points > 0 ? '#8B5CF6' : '#EF4444'};">
                  ${e.points > 0 ? '+' : ''}${e.points} ball
                </div>
              </div>

              <div class="card-body">
                <p style="font-size: 13px; margin-bottom: 8px;">
                  ${icon('calendar', 13)} <strong>Sana:</strong> ${e.event_date} &nbsp;|&nbsp; 
                  ${icon('fileText', 13)} <strong>Izoh:</strong> ${e.note || 'Ko\'rsatilmagan'}
                </p>
                ${e.evidence_url ? `
                  <p style="font-size: 13px; margin-bottom: 12px;">
                    ${icon('link', 13)} <strong>Dalil:</strong> <a href="${e.evidence_url}" target="_blank" style="color: #2563EB;">${e.evidence_url}</a>
                  </p>
                ` : ''}

                <div style="display: flex; gap: 8px; justify-content: flex-end; border-top: 1px solid var(--border); padding-top: 12px;">
                  <button class="btn btn-outline text-danger btn-sm" onclick="showRejectModal('${e.id}')">
                    ${icon('x', 13)} Rad Etish
                  </button>
                  <button class="btn btn-primary btn-sm" onclick="approveEntryAction('${e.id}')">
                    ${icon('checkCircle', 14)} Yakuniy Tasdiq (PV)
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    `;
    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<div class="card"><p class="text-danger">${err.message}</p></div>`;
  }
}

// -------------------------------------------------------------
// SAHIFA: PROREKTOR XAVF INDIKATORLARI (P-02)
// -------------------------------------------------------------
async function renderProrektorRisks(container) {
  try {
    const data = await apiFetch('/api/observe/dashboard');
    const flags = data.attention_required?.risk_flags || { tutor_concentration: [], student_single_source: [] };

    let html = `
      <div class="grid grid-2">
        <!-- 1. TYUTOR KONSENTRATSIYASI -->
        <div class="card">
          <div class="card-header">
            <h3>Tyutor Konsentratsiyasi Xavfi</h3>
            <span class="badge badge-warning">Limit: 40%</span>
          </div>
          <div class="card-body">
            <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 14px;">
              Tyutor bergan ballarning 40% dan ortig'i faqat 5 nafar talabaga to'g'ri kelsa xavf bayrog'i yoqiladi.
            </p>
            ${flags.tutor_concentration.length === 0 ? `
              <p class="text-success" style="font-size: 13px;">${icon('checkCircle', 13)} Tyutorlar bo'yicha og'ishlar aniqlanmadi.</p>
            ` : `
              <div class="table-responsive">
                <table class="table">
                  <thead>
                    <tr><th>Tyutor</th><th>Top 5 Ulushi</th><th>Holat</th></tr>
                  </thead>
                  <tbody>
                    ${flags.tutor_concentration.map(t => `
                      <tr>
                        <td><strong>${t.tutor_name}</strong></td>
                        <td><strong class="text-danger">${t.ratio}%</strong> (${t.top5Points} / ${t.totalPoints})</td>
                        <td><span class="badge badge-danger">Xavfli</span></td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `}
          </div>
        </div>

        <!-- 2. TALABA BIR MANBA -->
        <div class="card">
          <div class="card-header">
            <h3>Talaba "Bir Manba" Indikatori</h3>
            <span class="badge badge-warning">Limit: 70%</span>
          </div>
          <div class="card-body">
            <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 14px;">
              Talaba barcha ballarining 70% dan ortig'ini faqat bitta banddan olgan bo'lsa.
            </p>
            ${flags.student_single_source.length === 0 ? `
              <p class="text-success" style="font-size: 13px;">${icon('checkCircle', 13)} Bir manbaga bog'lanib qolgan talabalar yo'q.</p>
            ` : `
              <div class="table-responsive">
                <table class="table">
                  <thead>
                    <tr><th>Talaba</th><th>Band</th><th>Ulush</th></tr>
                  </thead>
                  <tbody>
                    ${flags.student_single_source.map(s => `
                      <tr>
                        <td><strong>${s.student_name}</strong> (${s.group_code})</td>
                        <td>${s.item_name}</td>
                        <td><strong class="text-warning">${s.ratio}%</strong> (${s.itemPoints} / ${s.totalPoints})</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `}
          </div>
        </div>
      </div>
    `;
    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<div class="card"><p class="text-danger">${err.message}</p></div>`;
  }
}

// -------------------------------------------------------------
// SAHIFA: APELLYATSIYALAR
// -------------------------------------------------------------
async function renderProrektorAppeals(container) {
  try {
    const data = await apiFetch('/api/approvals/appeals');
    const appeals = data.appeals || [];

    let html = `
      <div class="card mb-3">
        <div class="card-header">
          <h3>Talabalar E'tirozlari (Apellyatsiyalar)</h3>
          <span style="font-size: 12px; color: var(--text-muted);">Jami: ${appeals.length} ta e'tiroz</span>
        </div>
      </div>

      ${appeals.length === 0 ? `
        <div class="card p-5 text-center">
          <p style="color: var(--text-muted);">Ko'rib chiqilishi kerak bo'lgan ochiq apellyatsiyalar yo'q.</p>
        </div>
      ` : `
        <div class="grid grid-1">
          ${appeals.map(a => `
            <div class="card mb-3">
              <div class="card-header">
                <div>
                  <strong>${a.first_name} ${a.last_name}</strong> (${a.group_code})
                  <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
                    Yozuv: ${a.item_name} (${a.points} ball) • Holati: <span class="badge badge-warning">${a.status}</span>
                  </div>
                </div>
                <small>${new Date(a.created_at).toLocaleString('uz-UZ')}</small>
              </div>
              <div class="card-body">
                <p style="background: var(--bg-main); padding: 12px; border-radius: 8px; font-size: 14px; margin-bottom: 12px;">
                  <em>"${a.text}"</em>
                </p>
                <div style="display: flex; gap: 8px; justify-content: flex-end;">
                  <button class="btn btn-outline text-danger btn-sm" onclick="decideAppealAction('${a.id}', 'declined')">
                    Rad Etish
                  </button>
                  <button class="btn btn-success btn-sm" onclick="decideAppealAction('${a.id}', 'accepted')">
                    Qanoatlantirish (+Ball qaytariladi)
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    `;
    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<div class="card"><p class="text-danger">${err.message}</p></div>`;
  }
}

async function decideAppealAction(id, decision) {
  const note = prompt('Qaror sababi / izoh:');
  if (note === null) return;
  try {
    await apiFetch(`/api/approvals/appeals/${id}/decide`, {
      method: 'POST',
      body: JSON.stringify({ decision, note })
    });
    alert('Apellyatsiya bo\'yicha qaror qabul qilindi');
    navigateTo('prorektor-appeals');
  } catch (e) {
    alert(e.message);
  }
}

// -------------------------------------------------------------
// -------------------------------------------------------------
// SAHIFA: SUPERADMIN KATALOG SOZLAMALARI (AT-21, S-01)
// -------------------------------------------------------------
let adminCatalogState = {
  search: '',
  categoryId: '',
  items: [],
  categories: []
};

async function renderAdminCatalog(container) {
  try {
    const data = await apiFetch('/api/admin/catalog');
    adminCatalogState.items = data.items || [];
    adminCatalogState.categories = data.categories || [];

    const categories = adminCatalogState.categories;

    container.innerHTML = `
      <!-- HERO BANNER -->
      <div class="admin-hero-card" style="margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
          <div>
            <div class="admin-hero-title">
              <span style="color: #60A5FA;">${icon('settings', 22)}</span>
              <span>Ball Katalogi Sozlamalari & Mezonlar Boshqaruvi</span>
              <span class="badge" style="background: rgba(59, 130, 246, 0.2); color: #93C5FD; border: 1px solid rgba(59, 130, 246, 0.4); font-size: 11px;">Superadmin</span>
            </div>
            <p class="admin-hero-desc">
              Katalog mezonlarini qo'shish, tahrirlash yoki o'chirish. O'zgartirishlar to'g'ridan-to'g'ri yangilanishi yoki audit uchun yangi versiya sifatida saqlanishi mumkin.
            </p>
          </div>
          <div>
            <button class="btn btn-primary" onclick="showAddCatalogModal()" style="display:inline-flex; align-items:center; gap:8px; font-weight:600; padding:10px 18px; box-shadow: 0 4px 12px rgba(37,99,235,0.25);">
              ${icon('plus', 16)} Yangi Mezon Qo'shish
            </button>
          </div>
        </div>
      </div>

      <!-- TOOLBAR -->
      <div class="admin-toolbar" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; gap: 10px; align-items: center; flex: 1; min-width: 300px;">
          <div class="admin-search-box" style="flex: 1;">
            ${icon('search', 16)}
            <input type="text" id="admin-cat-search" class="admin-search-input" placeholder="Mezon nomi bo'yicha tezkor qidiruv...">
          </div>
          <select id="admin-cat-filter-cat" class="admin-filter-select" style="min-width: 180px;">
            <option value="">Barcha kategoriyalar</option>
            ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
          </select>
          <button class="btn btn-outline btn-sm" onclick="resetAdminCatalogFilters()" style="display:inline-flex; align-items:center; gap:4px; white-space: nowrap;">
            ${icon('refresh', 13)} Tozalash
          </button>
        </div>
      </div>

      <!-- DATA TABLE -->
      <div class="card">
        <div class="card-header" style="background: #F8FAFC; border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 12.5px; color: var(--text-secondary); font-weight: 600;">
            Maslahat: Mezonni tahrirlash uchun qatordan ixtiyoriy joyiga yoki "Tahrirlash" tugmasiga bosing.
          </span>
          <span class="badge badge-light" id="admin-cat-count-badge" style="font-size: 11.5px; font-weight: 600;">
            Jami: ${adminCatalogState.items.length} ta band
          </span>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 70px;">ID</th>
                <th>Kategoriya</th>
                <th>Mezon (Band Nomi)</th>
                <th>Baza Balli</th>
                <th>Versiya</th>
                <th>Tasdiqlovchi Rol</th>
                <th>Dalil Talabi</th>
                <th style="text-align: right; width: 110px;">Amallar</th>
              </tr>
            </thead>
            <tbody id="admin-cat-table-body">
              <!-- Dynamically populated -->
            </tbody>
          </table>
        </div>
      </div>
    `;

    document.getElementById('admin-cat-search').addEventListener('input', (e) => {
      adminCatalogState.search = e.target.value.trim().toLowerCase();
      renderAdminCatalogRows();
    });

    document.getElementById('admin-cat-filter-cat').addEventListener('change', (e) => {
      adminCatalogState.categoryId = e.target.value;
      renderAdminCatalogRows();
    });

    renderAdminCatalogRows();

  } catch (err) {
    container.innerHTML = `<div class="card"><p class="text-danger">${err.message}</p></div>`;
  }
}

function resetAdminCatalogFilters() {
  adminCatalogState.search = '';
  adminCatalogState.categoryId = '';
  const s = document.getElementById('admin-cat-search');
  if (s) s.value = '';
  const c = document.getElementById('admin-cat-filter-cat');
  if (c) c.value = '';
  renderAdminCatalogRows();
}

function renderAdminCatalogRows() {
  const tbody = document.getElementById('admin-cat-table-body');
  if (!tbody) return;

  let filtered = adminCatalogState.items;
  if (adminCatalogState.categoryId) {
    filtered = filtered.filter(it => String(it.category_id) === String(adminCatalogState.categoryId));
  }
  if (adminCatalogState.search) {
    const q = adminCatalogState.search;
    filtered = filtered.filter(it => (it.name || '').toLowerCase().includes(q));
  }

  const countBadge = document.getElementById('admin-cat-count-badge');
  if (countBadge) {
    countBadge.textContent = `${filtered.length} ta band`;
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 32px; color: var(--text-muted);">Mezonlar topilmadi</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(it => {
    const catColor = it.category_color || '#2563EB';
    const catName = it.category_name || `Kategoriya #${it.category_id}`;

    return `
      <tr class="student-table-row" onclick="showEditCatalogModal('${it.id}', ${it.version_from || 1})" style="cursor: pointer;" title="Tahrirlash uchun bosing">
        <td><span class="badge badge-group">#${it.id}</span></td>
        <td>
          <span class="badge" style="background: ${catColor}15; color: ${catColor}; border: 1px solid ${catColor}30; font-weight: 600;">
            ${catName}
          </span>
        </td>
        <td>
          <div style="font-weight: 600; color: var(--text-main); font-size: 13px;">${it.name}</div>
        </td>
        <td>
          ${it.is_scale 
            ? `<span class="badge badge-course" style="font-weight: 700;">Shkala bo'yicha</span>` 
            : (it.base_points !== null ? `<span style="font-weight: 700; color: #2563EB; font-size: 13px;">+${it.base_points} ball</span>` : '-')}
        </td>
        <td><span class="badge badge-neutral">v${it.version_from || 1}</span></td>
        <td><span class="badge badge-group" style="font-weight: 600;">${formatApproverRole(it.approver_role)}</span></td>
        <td><span style="font-size: 11.5px; color: var(--text-muted);">${it.evidence_hint || 'Majburiy emas'}</span></td>
        <td style="text-align: right;" onclick="event.stopPropagation();">
          <div style="display: flex; gap: 6px; justify-content: flex-end;">
            <button class="btn btn-outline btn-sm" onclick="showEditCatalogModal('${it.id}', ${it.version_from || 1})" title="Tahrirlash" style="padding: 4px 8px; font-size: 11px;">
              ${icon('edit', 14)}
            </button>
            <button class="btn btn-outline btn-sm text-danger" onclick="deleteCatalogItem('${it.id}', ${it.version_from || 1})" title="O'chirish" style="padding: 4px 8px; font-size: 11px; border-color: #FCA5A5;">
              ${icon('trash', 14)}
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function togglePointsInput(typeVal, inputId) {
  const inp = document.getElementById(inputId);
  if (!inp) return;
  if (typeVal === 'scale') {
    inp.disabled = true;
    inp.value = '';
  } else {
    inp.disabled = false;
    if (!inp.value || inp.value === '0') inp.value = '10';
  }
}

function showAddCatalogModal() {
  const categories = adminCatalogState.categories || [];
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalFooter = document.getElementById('modal-footer');

  modalTitle.innerHTML = `<span style="display:flex; align-items:center; gap:8px;">${icon('plus', 18)} Yangi Mezon Qo'shish</span>`;
  modalBody.innerHTML = `
    <form id="add-cat-form" onsubmit="event.preventDefault(); submitAddCatalogItem();">
      <div class="grid grid-2 mb-3">
        <div class="form-group">
          <label class="form-label">Band Kodi (ID) <small class="text-muted">(ixtiyoriy, masalan: i10, a7)</small></label>
          <input type="text" id="add-cat-id" class="form-control" placeholder="Avtomatik generatsiya qilinadi">
        </div>
        <div class="form-group">
          <label class="form-label">Soha / Kategoriya *</label>
          <select id="add-cat-category" class="form-select" required>
            ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="form-group mb-3">
        <label class="form-label">Mezon (Band Nomi) *</label>
        <textarea id="add-cat-name" class="form-control" rows="2" placeholder="Masalan: Respublika ilmiy maqolasi chop etildi" required></textarea>
      </div>

      <div class="grid grid-3 mb-3">
        <div class="form-group">
          <label class="form-label">Mezon Turi</label>
          <select id="add-cat-type" class="form-select" onchange="togglePointsInput(this.value, 'add-cat-points')">
            <option value="points" selected>Arizaviy (ball berish)</option>
            <option value="auto">Avtomatik (QR/Tizim)</option>
            <option value="scale">Musobaqa shkalasi bo'yicha</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Baza Balli</label>
          <input type="number" id="add-cat-points" class="form-control" value="10">
        </div>
        <div class="form-group">
          <label class="form-label">Tasdiqlovchi Mas'ul Bo'lim *</label>
          <select id="add-cat-role" class="form-select">
            <option value="dep_yb">Yoshlar bo'limi (dep_yb)</option>
            <option value="dep_mb">Ma'naviyat bo'limi (dep_mb)</option>
            <option value="dep_ob">O'quv bo'limi (dep_ob)</option>
            <option value="dep_ib">Ilmiy bo'lim (dep_ib)</option>
            <option value="dep_sb">Sanoat hamkorlik (dep_sb)</option>
            <option value="dep_pb">Matbuot (PR) (dep_pb)</option>
            <option value="dep_atm">Axborot texnologiyalari markazi (dep_atm)</option>
            <option value="dep_xb">Xo'jalik bo'limi (dep_xb)</option>
            <option value="dep_iy">Ish yurituvchi (dep_iy)</option>
            <option value="prorektor">Prorektor</option>
            <option value="tutor">Tyutor</option>
          </select>
        </div>
      </div>

      <div class="form-group mb-3">
        <label class="form-label">Dalil Talabi (Yo'riqnoma)</label>
        <input type="text" id="add-cat-evidence" class="form-control" placeholder="Masalan: Maqola havolasi yoki PDF nusxasi">
      </div>

      <div class="form-group mb-2">
        <label class="form-label">Limit Qoidasi</label>
        <input type="text" id="add-cat-limit" class="form-control" placeholder="Masalan: semestrda 2 marta">
      </div>
    </form>
  `;

  modalFooter.innerHTML = `
    <button class="btn btn-outline" onclick="closeModal()">Bekor Qilish</button>
    <button class="btn btn-primary" onclick="submitAddCatalogItem()" style="display:inline-flex; align-items:center; gap:6px;">
      ${icon('check', 14)} Mezonni Qo'shish
    </button>
  `;

  openModal();
}

async function submitAddCatalogItem() {
  const id = document.getElementById('add-cat-id')?.value.trim();
  const category_id = document.getElementById('add-cat-category')?.value;
  const name = document.getElementById('add-cat-name')?.value.trim();
  const type = document.getElementById('add-cat-type')?.value;
  const base_points = Number(document.getElementById('add-cat-points')?.value || 0);
  const approver_role = document.getElementById('add-cat-role')?.value;
  const evidence_hint = document.getElementById('add-cat-evidence')?.value.trim();
  const limit_rule = document.getElementById('add-cat-limit')?.value.trim();

  if (!name) {
    alert('Mezon (band nomi) kiritilishi shart!');
    return;
  }

  const is_scale = type === 'scale' ? 1 : 0;
  const is_auto = type === 'auto' ? 1 : 0;

  try {
    const res = await apiFetch('/api/admin/catalog/item', {
      method: 'POST',
      body: JSON.stringify({
        id: id || undefined,
        category_id,
        name,
        base_points: is_scale ? null : base_points,
        is_scale,
        is_auto,
        approver_role,
        evidence_hint,
        limit_rule
      })
    });
    closeModal();
    showToast(res.message || "Yangi mezon muvaffaqiyatli qo'shildi!");
    const refreshData = await apiFetch('/api/admin/catalog');
    adminCatalogState.items = refreshData.items || [];
    renderAdminCatalogRows();
  } catch (err) {
    showToast('Xatolik: ' + err.message, 'error');
  }
}

async function showEditCatalogModal(id, version_from) {
  const item = adminCatalogState.items.find(i => String(i.id) === String(id) && Number(i.version_from || 1) === Number(version_from || 1)) 
            || adminCatalogState.items.find(i => String(i.id) === String(id));
  if (!item) return;

  const categories = adminCatalogState.categories || [];
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalFooter = document.getElementById('modal-footer');

  modalTitle.innerHTML = `<span style="display:flex; align-items:center; gap:8px;">${icon('edit', 18)} Mezonni Tahrirlash: #${item.id} <span class="badge badge-neutral" style="font-size:11px;">v${item.version_from || 1}</span></span>`;
  modalBody.innerHTML = `
    <form id="edit-cat-form" onsubmit="event.preventDefault(); saveCatalogItem('${item.id}', ${item.version_from || 1});">
      <div class="grid grid-2 mb-3">
        <div class="form-group">
          <label class="form-label">Band Kodi (ID)</label>
          <input type="text" class="form-control" value="#${item.id}" disabled style="background:#F1F5F9; font-weight:600;">
        </div>
        <div class="form-group">
          <label class="form-label">Soha / Kategoriya *</label>
          <select id="edit-cat-category" class="form-select" required>
            ${categories.map(c => `<option value="${c.id}" ${String(c.id) === String(item.category_id) ? 'selected' : ''}>${c.name}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="form-group mb-3">
        <label class="form-label">Mezon (Band Nomi) *</label>
        <textarea id="edit-cat-name" class="form-control" rows="2" required>${item.name}</textarea>
      </div>

      <div class="grid grid-3 mb-3">
        <div class="form-group">
          <label class="form-label">Mezon Turi</label>
          <select id="edit-cat-type" class="form-select" onchange="togglePointsInput(this.value, 'edit-cat-points')">
            <option value="points" ${!item.is_scale && !item.is_auto ? 'selected' : ''}>Arizaviy (ball berish)</option>
            <option value="auto" ${item.is_auto ? 'selected' : ''}>Avtomatik (QR/Tizim)</option>
            <option value="scale" ${item.is_scale ? 'selected' : ''}>Musobaqa shkalasi bo'yicha</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Baza Balli</label>
          <input type="number" id="edit-cat-points" class="form-control" value="${item.base_points !== null ? item.base_points : 0}" ${item.is_scale ? 'disabled' : ''}>
        </div>
        <div class="form-group">
          <label class="form-label">Tasdiqlovchi Mas'ul Bo'lim *</label>
          <select id="edit-cat-role" class="form-select">
            <option value="dep_yb" ${item.approver_role === 'dep_yb' ? 'selected' : ''}>Yoshlar bo'limi (dep_yb)</option>
            <option value="dep_mb" ${item.approver_role === 'dep_mb' ? 'selected' : ''}>Ma'naviyat bo'limi (dep_mb)</option>
            <option value="dep_ob" ${item.approver_role === 'dep_ob' ? 'selected' : ''}>O'quv bo'limi (dep_ob)</option>
            <option value="dep_ib" ${item.approver_role === 'dep_ib' ? 'selected' : ''}>Ilmiy bo'lim (dep_ib)</option>
            <option value="dep_sb" ${item.approver_role === 'dep_sb' ? 'selected' : ''}>Sanoat hamkorlik (dep_sb)</option>
            <option value="dep_pb" ${item.approver_role === 'dep_pb' ? 'selected' : ''}>Matbuot (PR) (dep_pb)</option>
            <option value="dep_atm" ${item.approver_role === 'dep_atm' ? 'selected' : ''}>Axborot texnologiyalari markazi (dep_atm)</option>
            <option value="dep_xb" ${item.approver_role === 'dep_xb' ? 'selected' : ''}>Xo'jalik bo'limi (dep_xb)</option>
            <option value="dep_iy" ${item.approver_role === 'dep_iy' ? 'selected' : ''}>Ish yurituvchi (dep_iy)</option>
            <option value="prorektor" ${item.approver_role === 'prorektor' ? 'selected' : ''}>Prorektor</option>
            <option value="tutor" ${item.approver_role === 'tutor' ? 'selected' : ''}>Tyutor</option>
          </select>
        </div>
      </div>

      <div class="form-group mb-3">
        <label class="form-label">Dalil Talabi (Yo'riqnoma)</label>
        <input type="text" id="edit-cat-evidence" class="form-control" value="${item.evidence_hint || ''}">
      </div>

      <div class="form-group mb-3">
        <label class="form-label">Limit Qoidasi</label>
        <input type="text" id="edit-cat-limit" class="form-control" value="${item.limit_rule || ''}" placeholder="Masalan: semestrda 2 marta">
      </div>

      <div class="form-group mb-2" style="background: #F8FAFC; border: 1px solid var(--border-light); padding: 12px; border-radius: 8px;">
        <label class="form-label" style="font-weight: 600; margin-bottom: 6px;">Saqlash usuli</label>
        <div style="display: flex; gap: 20px; font-size: 13px;">
          <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
            <input type="radio" name="edit-cat-save-mode" value="update" checked>
            <span>To'g'ridan-to'g'ri yangilash (v${item.version_from || 1} ni tahrirlash)</span>
          </label>
          <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
            <input type="radio" name="edit-cat-save-mode" value="new_version">
            <span>Yangi versiya yaratish (v${(item.version_from || 1) + 1})</span>
          </label>
        </div>
      </div>
    </form>
  `;

  modalFooter.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
      <button class="btn btn-outline text-danger" onclick="deleteCatalogItem('${item.id}', ${item.version_from || 1})" style="border-color: #FCA5A5; display: inline-flex; align-items: center; gap: 6px;">
        ${icon('trash', 14)} Ushbu Mezonni O'chirish
      </button>
      <div style="display: flex; gap: 8px;">
        <button class="btn btn-outline" onclick="closeModal()">Bekor Qilish</button>
        <button class="btn btn-primary" onclick="saveCatalogItem('${item.id}', ${item.version_from || 1})" style="display:inline-flex; align-items:center; gap:6px;">
          ${icon('check', 14)} Saqlash
        </button>
      </div>
    </div>
  `;

  openModal();
}

async function saveCatalogItem(id, version_from) {
  const category_id = document.getElementById('edit-cat-category')?.value;
  const name = document.getElementById('edit-cat-name')?.value.trim();
  const type = document.getElementById('edit-cat-type')?.value;
  const base_points = Number(document.getElementById('edit-cat-points')?.value || 0);
  const approver_role = document.getElementById('edit-cat-role')?.value;
  const evidence_hint = document.getElementById('edit-cat-evidence')?.value.trim();
  const limit_rule = document.getElementById('edit-cat-limit')?.value.trim();
  const saveMode = document.querySelector('input[name="edit-cat-save-mode"]:checked')?.value || 'update';

  if (!name) {
    showToast('Band nomi kiritilishi shart!', 'warning');
    return;
  }

  const is_scale = type === 'scale' ? 1 : 0;
  const is_auto = type === 'auto' ? 1 : 0;

  try {
    const res = await apiFetch(`/api/admin/catalog/item/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        category_id,
        name,
        base_points: is_scale ? null : base_points,
        is_scale,
        is_auto,
        approver_role,
        evidence_hint,
        limit_rule,
        version_from,
        create_new_version: saveMode === 'new_version'
      })
    });
    closeModal();
    showToast(res.message || "Muvaffaqiyatli saqlandi!");
    const refreshData = await apiFetch('/api/admin/catalog');
    adminCatalogState.items = refreshData.items || [];
    renderAdminCatalogRows();
  } catch (e) {
    showToast('Xatolik: ' + e.message, 'error');
  }
}

async function deleteCatalogItem(id, version_from) {
  const item = adminCatalogState.items.find(i => String(i.id) === String(id) && Number(i.version_from || 1) === Number(version_from || 1))
            || adminCatalogState.items.find(i => String(i.id) === String(id));
  const itemName = item ? item.name : `#${id}`;

  if (!confirm(`Haqiqatan ham "${itemName}" (#${id}, v${version_from || 1}) mezonini tizimdan o'chirmoqchimisiz?`)) {
    return;
  }

  try {
    const res = await apiFetch(`/api/admin/catalog/item/${id}?version_from=${version_from || 1}`, {
      method: 'DELETE'
    });
    closeModal();
    showToast(res.message || "Mezon muvaffaqiyatli o'chirildi!");
    const refreshData = await apiFetch('/api/admin/catalog');
    adminCatalogState.items = refreshData.items || [];
    renderAdminCatalogRows();
  } catch (err) {
    showToast('Xatolik: ' + err.message, 'error');
  }
}


// -------------------------------------------------------------
// -------------------------------------------------------------
// SAHIFA: TO'LIQ AUDIT JURNALI (X-05) - ENTERPRISE AUDIT LOG
// -------------------------------------------------------------
let adminAuditState = {
  action: '',
  search: '',
  limit: 50,
  offset: 0,
  total: 0,
  logs: []
};

async function renderAdminAudit(container) {
  container.innerHTML = `
    <!-- HERO BANNER -->
    <div class="admin-hero-card" style="margin-bottom: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
        <div>
          <div class="admin-hero-title">
            <span style="color: #F87171;">${icon('shield', 22)}</span>
            <span>Tizim Xavfsizlik & Harakatlar Audit Jurnali (X-05)</span>
            <span class="badge" style="background: rgba(248, 113, 113, 0.2); color: #FCA5A5; border: 1px solid rgba(248, 113, 113, 0.4); font-size: 11px;">
              O'zgartirib bo'lmas xronologiya
            </span>
          </div>
          <p class="admin-hero-desc">
            Barcha ma'muriy, ball berish, tasdiqlash, rasm biriktirish va import operatsiyalari qaydnomasi. 
            Tafsilotlarni ko'rish uchun satr ustiga bosing.
          </p>
        </div>
      </div>
    </div>

    <!-- TOOLBAR -->
    <div class="admin-toolbar">
      <div class="admin-search-box">
        ${icon('search', 16)}
        <input type="text" id="audit-filter-search" class="admin-search-input" placeholder="Xodim, obyekt yoki IP manzil bo'yicha qidiruv...">
      </div>
      <div class="admin-filters-group">
        <select id="audit-filter-action" class="admin-filter-select">
          <option value="">Barcha harakatlar</option>
          <option value="IMPORT_STUDENTS">IMPORT_STUDENTS</option>
          <option value="CREATE_STUDENT">CREATE_STUDENT</option>
          <option value="UPDATE_STUDENT">UPDATE_STUDENT</option>
          <option value="UPDATE_STUDENT_PHOTO">UPDATE_STUDENT_PHOTO</option>
          <option value="CREATE_POINT_ENTRY">CREATE_POINT_ENTRY</option>
          <option value="APPROVE_POINT_ENTRY">APPROVE_POINT_ENTRY</option>
          <option value="REJECT_POINT_ENTRY">REJECT_POINT_ENTRY</option>
          <option value="CREATE_STAFF_USER">CREATE_STAFF_USER</option>
          <option value="UPDATE_STAFF_USER">UPDATE_STAFF_USER</option>
        </select>
        <button class="btn btn-outline btn-sm" onclick="resetAuditFilters()" style="display:inline-flex; align-items:center; gap:4px;">
          ${icon('refresh', 13)} Tozalash
        </button>
      </div>
    </div>

    <!-- DATA TABLE -->
    <div class="card">
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 150px;">Vaqt (Sana)</th>
              <th>Mas'ul Foydalanuvchi</th>
              <th>Harakat (Action)</th>
              <th>Obyekt</th>
              <th>IP Manzil</th>
              <th style="text-align: right; width: 100px;">Tafsilot</th>
            </tr>
          </thead>
          <tbody id="audit-table-body">
            <tr>
              <td colspan="6" style="text-align: center; padding: 40px; color: var(--text-muted);">
                <div class="spinner" style="margin-bottom: 8px;"></div>
                <p>Audit jurnali yuklanmoqda...</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- PAGINATION -->
      <div class="pagination-bar" id="audit-pagination-bar">
        <span id="audit-page-info">0 ta ma'lumot</span>
        <div style="display: flex; gap: 8px; align-items: center;">
          <button class="btn btn-outline btn-sm" id="btn-audit-prev" onclick="prevAuditPage()" disabled>Oldingi</button>
          <span id="audit-page-num" style="font-weight: 600; padding: 0 6px;">1</span>
          <button class="btn btn-outline btn-sm" id="btn-audit-next" onclick="nextAuditPage()" disabled>Keyingi</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('audit-filter-action').addEventListener('change', (e) => {
    adminAuditState.action = e.target.value;
    adminAuditState.offset = 0;
    loadAuditLogsList();
  });

  const aSearch = document.getElementById('audit-filter-search');
  let timer;
  aSearch.addEventListener('input', (e) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      adminAuditState.search = e.target.value.trim().toLowerCase();
      renderAuditRows();
    }, 300);
  });

  await loadAuditLogsList();
}

function resetAuditFilters() {
  adminAuditState.action = '';
  adminAuditState.search = '';
  adminAuditState.offset = 0;

  const a = document.getElementById('audit-filter-action');
  if (a) a.value = '';
  const s = document.getElementById('audit-filter-search');
  if (s) s.value = '';

  loadAuditLogsList();
}

function prevAuditPage() {
  if (adminAuditState.offset >= adminAuditState.limit) {
    adminAuditState.offset -= adminAuditState.limit;
    loadAuditLogsList();
  }
}

function nextAuditPage() {
  if (adminAuditState.offset + adminAuditState.limit < adminAuditState.total) {
    adminAuditState.offset += adminAuditState.limit;
    loadAuditLogsList();
  }
}

async function loadAuditLogsList() {
  const tbody = document.getElementById('audit-table-body');
  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="6" style="text-align: center; padding: 40px; color: var(--text-muted);">
        <div class="spinner" style="margin-bottom: 8px;"></div>
        <p>Ma'lumotlar yangilanmoqda...</p>
      </td>
    </tr>
  `;

  try {
    const params = new URLSearchParams({
      limit: adminAuditState.limit,
      offset: adminAuditState.offset
    });
    if (adminAuditState.action) params.append('action', adminAuditState.action);

    const res = await apiFetch(`/api/admin/audit?${params.toString()}`);
    adminAuditState.logs = res.logs || [];
    adminAuditState.total = res.total || 0;

    // Pagination
    const startIdx = adminAuditState.total === 0 ? 0 : adminAuditState.offset + 1;
    const endIdx = Math.min(adminAuditState.offset + adminAuditState.logs.length, adminAuditState.total);
    const pageNum = Math.floor(adminAuditState.offset / adminAuditState.limit) + 1;
    const maxPage = Math.ceil(adminAuditState.total / adminAuditState.limit) || 1;

    const pageInfo = document.getElementById('audit-page-info');
    const pageNumEl = document.getElementById('audit-page-num');
    const btnPrev = document.getElementById('btn-audit-prev');
    const btnNext = document.getElementById('btn-audit-next');

    if (pageInfo) pageInfo.textContent = `${startIdx}-${endIdx} dan ${adminAuditState.total} ta`;
    if (pageNumEl) pageNumEl.textContent = `${pageNum} / ${maxPage}`;
    if (btnPrev) btnPrev.disabled = adminAuditState.offset <= 0;
    if (btnNext) btnNext.disabled = endIdx >= adminAuditState.total;

    renderAuditRows();
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:24px; color:var(--danger);">Xatolik: ${err.message}</td></tr>`;
  }
}

function renderAuditRows() {
  const tbody = document.getElementById('audit-table-body');
  if (!tbody) return;

  let filtered = adminAuditState.logs;
  if (adminAuditState.search) {
    const q = adminAuditState.search;
    filtered = filtered.filter(l =>
      (l.actor_id || '').toLowerCase().includes(q) ||
      (l.actor_name || '').toLowerCase().includes(q) ||
      (l.object_type || '').toLowerCase().includes(q) ||
      (l.object_id || '').toLowerCase().includes(q) ||
      (l.ip || '').toLowerCase().includes(q)
    );
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 48px; color: var(--text-muted);">
          <div style="font-size: 32px; color: #94A3B8; margin-bottom: 8px;">${icon('shield', 32)}</div>
          <p style="font-weight: 600;">Audit yozuvlari topilmadi</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(l => {
    let actionBg = '#F1F5F9', actionColor = '#475569';
    if (l.action.includes('CREATE')) { actionBg = '#ECFDF5'; actionColor = '#059669'; }
    else if (l.action.includes('UPDATE')) { actionBg = '#EFF6FF'; actionColor = '#2563EB'; }
    else if (l.action.includes('PHOTO')) { actionBg = '#F5F3FF'; actionColor = '#7C3AED'; }
    else if (l.action.includes('IMPORT')) { actionBg = '#FFFBEB'; actionColor = '#D97706'; }
    else if (l.action.includes('DEACTIVATE') || l.action.includes('DELETE')) { actionBg = '#FEF2F2'; actionColor = '#DC2626'; }

    const dateStr = new Date(l.at).toLocaleString('uz-UZ', {
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'
    });

    return `
      <tr class="student-table-row" onclick="showAuditDetailModal(${l.id})" style="cursor: pointer;" title="Tafsilotlarni ko'rish uchun bosing">
        <td>
          <span style="font-family: monospace; font-size: 11.5px; color: var(--text-secondary);">${dateStr}</span>
        </td>
        <td>
          <div style="font-weight: 600; color: var(--text-main); font-size: 12.5px;">${l.actor_name || l.actor_id}</div>
          <div class="table-sub-text">${l.actor_role}</div>
        </td>
        <td>
          <span class="badge" style="background:${actionBg}; color:${actionColor}; border:1px solid ${actionColor}30; font-family: monospace; font-size: 11px; font-weight:700;">
            ${l.action}
          </span>
        </td>
        <td>
          <span class="badge badge-group" style="font-size: 11px;">${l.object_type}:${(l.object_id || '').substring(0, 16)}</span>
        </td>
        <td>
          <code style="font-size: 11px; color: #64748B;">${l.ip || '127.0.0.1'}</code>
        </td>
        <td style="text-align: right;" onclick="event.stopPropagation()">
          <button class="btn btn-outline btn-sm" onclick="showAuditDetailModal(${l.id})" style="font-size: 11.5px; padding: 2px 8px;">
            ${icon('eye', 13)} Ko'rish
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function showAuditDetailModal(logId) {
  const log = adminAuditState.logs.find(l => l.id === logId);
  if (!log) return;

  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalFooter = document.getElementById('modal-footer');

  modalTitle.innerHTML = `<span style="display:flex; align-items:center; gap:8px;">${icon('shield', 18)} Audit Tafsiloti #${log.id}</span>`;
  
  let beforeFormatted = '-';
  let afterFormatted = '-';
  try {
    if (log.before_data) beforeFormatted = JSON.stringify(JSON.parse(log.before_data), null, 2);
  } catch (e) { beforeFormatted = log.before_data || '-'; }

  try {
    if (log.after_data) afterFormatted = JSON.stringify(JSON.parse(log.after_data), null, 2);
  } catch (e) { afterFormatted = log.after_data || '-'; }

  modalBody.innerHTML = `
    <div class="grid grid-2 mb-3" style="font-size: 13px; background: #F8FAFC; padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--border-light);">
      <div>
        <p style="margin-bottom: 4px;"><strong>Vaqt:</strong> ${new Date(log.at).toLocaleString('uz-UZ')}</p>
        <p style="margin-bottom: 4px;"><strong>Foydalanuvchi:</strong> ${log.actor_name || log.actor_id} (${log.actor_role})</p>
        <p style="margin-bottom: 4px;"><strong>IP Manzil:</strong> ${log.ip}</p>
      </div>
      <div>
        <p style="margin-bottom: 4px;"><strong>Harakat:</strong> <span class="badge badge-group">${log.action}</span></p>
        <p style="margin-bottom: 4px;"><strong>Obyekt turi:</strong> ${log.object_type}</p>
        <p style="margin-bottom: 4px;"><strong>Obyekt ID:</strong> <code>${log.object_id}</code></p>
      </div>
    </div>

    ${log.after_data ? `
      <div class="form-group mb-2">
        <label class="form-label">O'zgarish / Kiritilgan ma'lumotlar (JSON):</label>
        <pre style="background: #0F172A; color: #38BDF8; padding: 14px; border-radius: var(--radius-md); font-size: 11.5px; max-height: 250px; overflow: auto;">${afterFormatted}</pre>
      </div>
    ` : ''}

    ${log.before_data ? `
      <div class="form-group mb-2">
        <label class="form-label">Oldingi holat (Before):</label>
        <pre style="background: #F1F5F9; color: #334155; padding: 12px; border-radius: var(--radius-md); font-size: 11.5px; max-height: 180px; overflow: auto;">${beforeFormatted}</pre>
      </div>
    ` : ''}
  `;

  modalFooter.innerHTML = `<button class="btn btn-outline" onclick="closeModal()">Yopish</button>`;
  openModal();
}

// ====================================================================
// SUPERADMIN: TELEGRAM BOT MONITORINGI VA FOYDALANUVCHILAR BOSHQARUVI
// ====================================================================

const botMonitoringState = {
  tab: 'users',
  userSearch: '',
  userStatus: '',
  logSearch: '',
  logAction: '',
  stats: null,
  users: [],
  logs: []
};

async function renderBotMonitoring(container) {
  container.innerHTML = `
    <!-- HERO BANNER -->
    <div class="admin-hero-card" style="margin-bottom: 20px; background: linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #172554 100%); border: 1px solid rgba(99, 102, 241, 0.3); box-shadow: 0 10px 25px -5px rgba(30, 27, 75, 0.4);">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
        <div>
          <div class="admin-hero-title">
            <span style="font-size: 24px;">🤖</span>
            <span style="background: linear-gradient(90deg, #FFFFFF, #93C5FD); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Telegram Bot Jonli Monitoringi & Faollik Tahlili</span>
            <span class="badge" style="background: rgba(34, 197, 94, 0.2); color: #86EFAC; border: 1px solid rgba(34, 197, 94, 0.4); font-size: 11px; font-weight: 700;">
              ● Real-time Audit
            </span>
          </div>
          <p class="admin-hero-desc" style="color: #CBD5E1;">
            Botda kim /start bosgan, qachon bosgan, talabalar bazasi bilan qanday bog'langan va bot ichida qanday amallar bajarganini to'liq nazorat qiling.
          </p>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-primary btn-sm" onclick="loadBotMonitoringData()" style="display: inline-flex; align-items: center; gap: 6px; background: #3B82F6; border: none; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35);">
            ${icon('refresh', 13)} <span>Yangilash</span>
          </button>
        </div>
      </div>
    </div>

    <!-- STATISTIKA KPI KARTALARI -->
    <div class="stats-grid" id="bot-stats-grid" style="margin-bottom: 24px;">
      <div class="stat-card" style="border-left: 4px solid #3B82F6;">
        <div class="stat-icon" style="background: #EFF6FF; color: #2563EB;">${icon('users', 22)}</div>
        <div class="stat-data">
          <span class="stat-label">Jami Start Bosganlar</span>
          <div class="stat-val" id="bm-stat-total" style="color: #1D4ED8;">-</div>
          <span class="stat-sub" id="bm-stat-total-sub">Bot obunachilari soni</span>
        </div>
      </div>
      <div class="stat-card" style="border-left: 4px solid #10B981;">
        <div class="stat-icon" style="background: #ECFDF5; color: #059669;">${icon('checkCircle', 22)}</div>
        <div class="stat-data">
          <span class="stat-label">Bog'langan Talabalar</span>
          <div class="stat-val" id="bm-stat-linked" style="color: #047857;">-</div>
          <span class="stat-sub" id="bm-stat-linked-sub">Reytingga ulangan</span>
        </div>
      </div>
      <div class="stat-card" style="border-left: 4px solid #F59E0B;">
        <div class="stat-icon" style="background: #FFFBEB; color: #D97706;">${icon('award', 22)}</div>
        <div class="stat-data">
          <span class="stat-label">Bog'lanmagan Mehmonlar</span>
          <div class="stat-val" id="bm-stat-unlinked" style="color: #B45309;">-</div>
          <span class="stat-sub">Raqamini ulamaganlar</span>
        </div>
      </div>
      <div class="stat-card" style="border-left: 4px solid #8B5CF6;">
        <div class="stat-icon" style="background: #F5F3FF; color: #7C3AED;">${icon('clock', 22)}</div>
        <div class="stat-data">
          <span class="stat-label">Bugun Faollar</span>
          <div class="stat-val" id="bm-stat-today" style="color: #6D28D9;">-</div>
          <span class="stat-sub">Kunlik faol foydalanuvchilar</span>
        </div>
      </div>
      <div class="stat-card" style="border-left: 4px solid #EC4899;">
        <div class="stat-icon" style="background: #FDF2F8; color: #DB2777;">${icon('fileText', 22)}</div>
        <div class="stat-data">
          <span class="stat-label">Jami Bot Amallari</span>
          <div class="stat-val" id="bm-stat-actions" style="color: #BE185D;">-</div>
          <span class="stat-sub">Qayd etilgan loglar soni</span>
        </div>
      </div>
    </div>

    <!-- TABS NAVBAR -->
    <div style="display: flex; gap: 8px; margin-bottom: 16px; border-bottom: 2px solid #E2E8F0; padding-bottom: 8px;">
      <button id="bm-tab-btn-users" class="btn btn-sm btn-primary" onclick="switchBotMonitoringTab('users')" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 700; border-radius: 8px;">
        ${icon('users', 14)} <span>Bot Foydalanuvchilari & Talabalar (<span id="bm-tab-count-users">0</span>)</span>
      </button>
      <button id="bm-tab-btn-logs" class="btn btn-sm btn-outline" onclick="switchBotMonitoringTab('logs')" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 700; border-radius: 8px;">
        ${icon('fileText', 14)} <span>Faoliyat Jurnali (Nima qilgan?) (<span id="bm-tab-count-logs">0</span>)</span>
      </button>
    </div>

    <!-- TAB 1: USERS SECTION -->
    <div id="bm-tab-content-users">
      <div class="admin-toolbar" style="margin-bottom: 16px;">
        <div class="admin-search-box">
          ${icon('search', 16)}
          <input type="text" id="bm-users-search" class="admin-search-input" placeholder="Ism, familiya, username, telefon, guruh yoki Telegram ID..." oninput="handleBotUsersSearch(event)">
        </div>
        <div class="admin-filters-group">
          <div style="display: flex; gap: 4px; background: #F1F5F9; padding: 3px; border-radius: 8px;">
            <button id="bm-btn-filter-all" class="btn btn-sm btn-primary" onclick="setBotUserStatusFilter('')" style="font-size: 12px; padding: 4px 10px;">Hammasi</button>
            <button id="bm-btn-filter-linked" class="btn btn-sm btn-outline" onclick="setBotUserStatusFilter('linked')" style="font-size: 12px; padding: 4px 10px;">Talabalar</button>
            <button id="bm-btn-filter-unlinked" class="btn btn-sm btn-outline" onclick="setBotUserStatusFilter('unlinked')" style="font-size: 12px; padding: 4px 10px;">Mehmonlar</button>
          </div>
          <button class="btn btn-outline btn-sm" onclick="resetBotUserFilters()" style="display:inline-flex; align-items:center; gap:4px;">
            ${icon('refresh', 13)} Tozalash
          </button>
        </div>
      </div>

      <div class="card">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 240px;">Telegram Foydalanuvchi</th>
                <th>Bog'langan Talaba (Profil)</th>
                <th style="width: 150px;">Guruh / Telefon</th>
                <th style="width: 170px;">Birinchi / Oxirgi Faollik</th>
                <th style="text-align: center; width: 110px;">Amallar</th>
                <th style="text-align: right; width: 120px;">Harakat</th>
              </tr>
            </thead>
            <tbody id="bm-users-table-body">
              <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: var(--text-muted);">
                  <div class="spinner" style="margin-bottom: 8px;"></div>
                  <p>Bot foydalanuvchilari yuklanmoqda...</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 2: LOGS SECTION -->
    <div id="bm-tab-content-logs" style="display: none;">
      <div class="admin-toolbar" style="margin-bottom: 16px;">
        <div class="admin-search-box">
          ${icon('search', 16)}
          <input type="text" id="bm-logs-search" class="admin-search-input" placeholder="Tafsilot, Telegram ID, ism yoki amal bo'yicha qidiruv..." oninput="handleBotLogsSearch(event)">
        </div>
        <div class="admin-filters-group">
          <select id="bm-logs-action-filter" class="admin-filter-select" onchange="handleBotLogsActionFilter(event)">
            <option value="">Barcha harakatlar</option>
            <option value="start">🚀 /start (Bot ishga tushirish)</option>
            <option value="share_contact">📱 Raqam ulashish (Bog'lanish)</option>
            <option value="callback_click">🔘 Tugma bosish (Menyu)</option>
            <option value="broadcast_event">📢 Yangi tadbir xabarnomasi</option>
            <option value="manual_message">💬 Xabar / Buyruq</option>
          </select>
          <button class="btn btn-outline btn-sm" onclick="resetBotLogFilters()" style="display:inline-flex; align-items:center; gap:4px;">
            ${icon('refresh', 13)} Tozalash
          </button>
        </div>
      </div>

      <div class="card">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 160px;">Vaqt (Aniq sana)</th>
                <th style="width: 220px;">Foydalanuvchi / Talaba</th>
                <th style="width: 160px;">Harakat Turi</th>
                <th>Tafsilotlar & Izoh</th>
                <th style="text-align: right; width: 100px;">Tafsilot</th>
              </tr>
            </thead>
            <tbody id="bm-logs-table-body">
              <tr>
                <td colspan="5" style="text-align: center; padding: 40px; color: var(--text-muted);">
                  <div class="spinner" style="margin-bottom: 8px;"></div>
                  <p>Bot jurnali yuklanmoqda...</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  await loadBotMonitoringData();
}

async function loadBotMonitoringData() {
  try {
    const stats = await apiFetch('/api/admin/bot-monitoring/stats');
    botMonitoringState.stats = stats;

    const elTotal = document.getElementById('bm-stat-total');
    const elTotalSub = document.getElementById('bm-stat-total-sub');
    const elLinked = document.getElementById('bm-stat-linked');
    const elLinkedSub = document.getElementById('bm-stat-linked-sub');
    const elUnlinked = document.getElementById('bm-stat-unlinked');
    const elToday = document.getElementById('bm-stat-today');
    const elActions = document.getElementById('bm-stat-actions');

    if (elTotal) elTotal.textContent = `${stats.total_started || 0} ta`;
    if (elTotalSub) elTotalSub.textContent = `Mehmonlar: ${stats.unlinked_guests || 0} ta`;
    if (elLinked) elLinked.textContent = `${stats.linked_students || 0} nafar`;
    if (elLinkedSub) elLinkedSub.textContent = `Qamrov: ${stats.coverage_ratio || 0}% (jami ${stats.total_students || 0})`;
    if (elUnlinked) elUnlinked.textContent = `${stats.unlinked_guests || 0} ta`;
    if (elToday) elToday.textContent = `${stats.today_active || 0} nafar`;
    if (elActions) elActions.textContent = `${stats.total_actions || 0} ta`;
  } catch (e) {
    console.error("Bot stats fetch failed:", e);
  }

  await Promise.all([
    loadBotUsers(),
    loadBotLogs()
  ]);
}

async function loadBotUsers() {
  const tbody = document.getElementById('bm-users-table-body');
  if (!tbody) return;

  try {
    const params = new URLSearchParams();
    if (botMonitoringState.userSearch) params.append('q', botMonitoringState.userSearch);
    if (botMonitoringState.userStatus) params.append('status', botMonitoringState.userStatus);

    const res = await apiFetch(`/api/admin/bot-monitoring/users?${params.toString()}`);
    botMonitoringState.users = res.users || [];

    const badgeUsersCount = document.getElementById('bm-tab-count-users');
    if (badgeUsersCount) badgeUsersCount.textContent = botMonitoringState.users.length;

    renderBotUsersRows();
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:24px; color:var(--danger);">Xatolik: ${err.message}</td></tr>`;
  }
}

function renderBotUsersRows() {
  const tbody = document.getElementById('bm-users-table-body');
  if (!tbody) return;

  const users = botMonitoringState.users || [];

  if (users.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 48px; color: var(--text-muted);">
          <div style="font-size: 32px; color: #94A3B8; margin-bottom: 8px;">🤖</div>
          <p style="font-weight: 600;">Foydalanuvchilar topilmadi</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = users.map(u => {
    const initial = (u.first_name || u.username || 'U').charAt(0).toUpperCase();
    const tgFullName = `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Noma\'lum';
    const isLinked = !!u.student_id;
    const studentFullName = isLinked ? `${u.st_first_name || ''} ${u.st_last_name || ''}`.trim() : null;

    const firstSeenStr = u.created_at ? new Date(u.created_at).toLocaleString('uz-UZ', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';
    const lastSeenStr = u.last_seen_at ? new Date(u.last_seen_at).toLocaleString('uz-UZ', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

    return `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 34px; height: 34px; border-radius: 50%; background: #EFF6FF; color: #2563EB; font-weight: 800; font-size: 13px; display: flex; align-items: center; justify-content: center; border: 1px solid #BFDBFE;">
              ${initial}
            </div>
            <div>
              <div style="font-weight: 700; color: var(--text-main); font-size: 13px;">${tgFullName}</div>
              <div style="font-size: 11.5px; color: #64748B; font-family: monospace;">
                ${u.username ? '@' + u.username : 'ID: ' + u.telegram_user_id}
              </div>
            </div>
          </div>
        </td>
        <td>
          ${isLinked ? `
            <div style="display: flex; align-items: center; gap: 6px;">
              <span class="badge" style="background: #ECFDF5; color: #059669; border: 1px solid #A7F3D0; font-size: 11px;">🎓 Talaba</span>
              <strong style="color: #0F172A; font-size: 13px;">${studentFullName}</strong>
            </div>
          ` : `
            <span class="badge" style="background: #FEF3C7; color: #B45309; border: 1px solid #FDE68A; font-size: 11px;">
              👤 Mehmon (Bog'lanmagan)
            </span>
          `}
        </td>
        <td>
          ${isLinked ? `
            <div>
              <span class="badge badge-group" style="font-size: 11px;">${u.st_group_code || '-'}</span>
              <div style="font-size: 11.5px; color: #64748B; margin-top: 2px;">${u.phone || u.st_phone || '-'}</div>
            </div>
          ` : `
            <span style="font-size: 12px; color: #94A3B8;">${u.phone || 'Raqam yo\'q'}</span>
          `}
        </td>
        <td>
          <div style="font-size: 12px; color: #334155;">
            <div><strong>1-start:</strong> ${firstSeenStr}</div>
            <div style="color: #64748B; font-size: 11.5px;"><strong>Oxirgi:</strong> ${lastSeenStr}</div>
          </div>
        </td>
        <td style="text-align: center;">
          <span class="badge" style="background: #F1F5F9; color: #334155; font-size: 12px; font-weight: 700;">
            ${u.total_logs_count || 0} ta
          </span>
        </td>
        <td style="text-align: right;">
          <button class="btn btn-outline btn-sm" onclick="filterLogsByUser('${u.telegram_user_id}')" style="font-size: 11.5px; padding: 3px 8px; border-color: #BFDBFE; color: #1D4ED8;" title="Ushbu foydalanuvchining barcha harakatlari tarixini ko'rish">
            ${icon('fileText', 12)} Tarixi
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

async function loadBotLogs() {
  const tbody = document.getElementById('bm-logs-table-body');
  if (!tbody) return;

  try {
    const params = new URLSearchParams();
    if (botMonitoringState.logSearch) params.append('q', botMonitoringState.logSearch);
    if (botMonitoringState.logAction) params.append('action_type', botMonitoringState.logAction);

    const res = await apiFetch(`/api/admin/bot-monitoring/logs?${params.toString()}`);
    botMonitoringState.logs = res.logs || [];

    const badgeLogsCount = document.getElementById('bm-tab-count-logs');
    if (badgeLogsCount) badgeLogsCount.textContent = botMonitoringState.logs.length;

    renderBotLogsRows();
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:24px; color:var(--danger);">Xatolik: ${err.message}</td></tr>`;
  }
}

function renderBotLogsRows() {
  const tbody = document.getElementById('bm-logs-table-body');
  if (!tbody) return;

  const logs = botMonitoringState.logs || [];

  if (logs.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 48px; color: var(--text-muted);">
          <div style="font-size: 32px; color: #94A3B8; margin-bottom: 8px;">📜</div>
          <p style="font-weight: 600;">Faoliyat jurnali topilmadi</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = logs.map(l => {
    const dateStr = l.created_at ? new Date(l.created_at).toLocaleString('uz-UZ', {
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'
    }) : '-';

    let actionBadge = `<span class="badge" style="background:#F1F5F9; color:#475569;">${l.action_type}</span>`;
    if (l.action_type === 'start') {
      actionBadge = `<span class="badge" style="background:#ECFDF5; color:#059669; border:1px solid #A7F3D0; font-weight:700;">🚀 /start bosildi</span>`;
    } else if (l.action_type === 'share_contact') {
      actionBadge = `<span class="badge" style="background:#EFF6FF; color:#1D4ED8; border:1px solid #BFDBFE; font-weight:700;">📱 Kontakt ulashdi</span>`;
    } else if (l.action_type === 'callback_click') {
      actionBadge = `<span class="badge" style="background:#F5F3FF; color:#7C3AED; border:1px solid #DDD6FE; font-weight:700;">🔘 Tugma bosildi</span>`;
    } else if (l.action_type === 'broadcast_event') {
      actionBadge = `<span class="badge" style="background:#FFFBEB; color:#D97706; border:1px solid #FDE68A; font-weight:700;">📢 Tadbir xabari</span>`;
    }

    const userName = `${l.tg_first_name || ''} ${l.tg_last_name || ''}`.trim() || (l.tg_username ? '@' + l.tg_username : 'ID: ' + l.telegram_user_id);
    const studentInfo = l.st_first_name ? `${l.st_first_name} ${l.st_last_name || ''} (${l.st_group_code || ''})` : null;

    return `
      <tr>
        <td>
          <span style="font-family: monospace; font-size: 11.5px; color: var(--text-secondary);">${dateStr}</span>
        </td>
        <td>
          <div style="font-weight: 700; color: #1E293B; font-size: 13px;">${userName}</div>
          <div style="font-size: 11px; color: #64748B;">
            ${studentInfo ? `<span style="color:#059669; font-weight:600;">🎓 ${studentInfo}</span>` : `<code>ID: ${l.telegram_user_id}</code>`}
          </div>
        </td>
        <td>${actionBadge}</td>
        <td>
          <div style="font-size: 12.5px; color: #334155; line-height: 1.4;">${l.details || '-'}</div>
        </td>
        <td style="text-align: right;">
          <button class="btn btn-outline btn-sm" onclick="showBotLogDetailModal(${l.id})" style="font-size: 11px; padding: 2px 8px;">
            ${icon('eye', 12)} Ko'rish
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function showBotLogDetailModal(logId) {
  const log = botMonitoringState.logs.find(l => l.id === logId);
  if (!log) return;

  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalFooter = document.getElementById('modal-footer');

  modalTitle.innerHTML = `<span style="display:flex; align-items:center; gap:8px;">🤖 Bot Harakat Qaydi #${log.id}</span>`;

  let metaFormatted = '-';
  try {
    if (log.meta) metaFormatted = JSON.stringify(JSON.parse(log.meta), null, 2);
  } catch (e) {
    metaFormatted = log.meta || '-';
  }

  modalBody.innerHTML = `
    <div class="grid grid-2 mb-3" style="font-size: 13px; background: #F8FAFC; padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--border-light);">
      <div>
        <p style="margin-bottom: 4px;"><strong>Vaqt:</strong> ${new Date(log.created_at).toLocaleString('uz-UZ')}</p>
        <p style="margin-bottom: 4px;"><strong>Telegram ID:</strong> <code>${log.telegram_user_id}</code></p>
        <p style="margin-bottom: 4px;"><strong>Foydalanuvchi:</strong> ${log.tg_first_name || ''} ${log.tg_last_name || ''} (@${log.tg_username || '-'})</p>
      </div>
      <div>
        <p style="margin-bottom: 4px;"><strong>Harakat Turi:</strong> <span class="badge badge-group">${log.action_type}</span></p>
        <p style="margin-bottom: 4px;"><strong>Talaba:</strong> ${log.st_first_name ? `${log.st_first_name} ${log.st_last_name || ''} (${log.st_group_code || ''})` : 'Bog\'lanmagan'}</p>
      </div>
    </div>

    <div class="form-group mb-3">
      <label class="form-label">Tafsilotlar:</label>
      <div style="background: #FFFFFF; border: 1px solid #E2E8F0; padding: 10px 14px; border-radius: 8px; font-size: 13px; color: #1E293B;">
        ${log.details || '-'}
      </div>
    </div>

    ${log.meta ? `
      <div class="form-group mb-2">
        <label class="form-label">Qo'shimcha Metadata (JSON):</label>
        <pre style="background: #0F172A; color: #38BDF8; padding: 12px; border-radius: var(--radius-md); font-size: 11.5px; max-height: 200px; overflow: auto;">${metaFormatted}</pre>
      </div>
    ` : ''}
  `;

  modalFooter.innerHTML = `<button class="btn btn-outline" onclick="closeModal()">Yopish</button>`;
  openModal();
}

function switchBotMonitoringTab(tab) {
  botMonitoringState.tab = tab;
  const btnUsers = document.getElementById('bm-tab-btn-users');
  const btnLogs = document.getElementById('bm-tab-btn-logs');
  const contentUsers = document.getElementById('bm-tab-content-users');
  const contentLogs = document.getElementById('bm-tab-content-logs');

  if (tab === 'users') {
    if (btnUsers) { btnUsers.classList.add('btn-primary'); btnUsers.classList.remove('btn-outline'); }
    if (btnLogs) { btnLogs.classList.remove('btn-primary'); btnLogs.classList.add('btn-outline'); }
    if (contentUsers) contentUsers.style.display = 'block';
    if (contentLogs) contentLogs.style.display = 'none';
  } else {
    if (btnLogs) { btnLogs.classList.add('btn-primary'); btnLogs.classList.remove('btn-outline'); }
    if (btnUsers) { btnUsers.classList.remove('btn-primary'); btnUsers.classList.add('btn-outline'); }
    if (contentLogs) contentLogs.style.display = 'block';
    if (contentUsers) contentUsers.style.display = 'none';
  }
}

let botUserSearchTimer;
function handleBotUsersSearch(event) {
  clearTimeout(botUserSearchTimer);
  botUserSearchTimer = setTimeout(() => {
    botMonitoringState.userSearch = event.target.value.trim();
    loadBotUsers();
  }, 300);
}

function setBotUserStatusFilter(status) {
  botMonitoringState.userStatus = status;
  const btnAll = document.getElementById('bm-btn-filter-all');
  const btnLinked = document.getElementById('bm-btn-filter-linked');
  const btnUnlinked = document.getElementById('bm-btn-filter-unlinked');

  [btnAll, btnLinked, btnUnlinked].forEach(b => {
    if (b) { b.classList.remove('btn-primary'); b.classList.add('btn-outline'); }
  });

  if (status === '' && btnAll) btnAll.classList.replace('btn-outline', 'btn-primary');
  else if (status === 'linked' && btnLinked) btnLinked.classList.replace('btn-outline', 'btn-primary');
  else if (status === 'unlinked' && btnUnlinked) btnUnlinked.classList.replace('btn-outline', 'btn-primary');

  loadBotUsers();
}

function resetBotUserFilters() {
  botMonitoringState.userSearch = '';
  botMonitoringState.userStatus = '';
  const searchInput = document.getElementById('bm-users-search');
  if (searchInput) searchInput.value = '';
  setBotUserStatusFilter('');
}

let botLogSearchTimer;
function handleBotLogsSearch(event) {
  clearTimeout(botLogSearchTimer);
  botLogSearchTimer = setTimeout(() => {
    botMonitoringState.logSearch = event.target.value.trim();
    loadBotLogs();
  }, 300);
}

function handleBotLogsActionFilter(event) {
  botMonitoringState.logAction = event.target.value;
  loadBotLogs();
}

function resetBotLogFilters() {
  botMonitoringState.logSearch = '';
  botMonitoringState.logAction = '';
  const searchInput = document.getElementById('bm-logs-search');
  const actionSelect = document.getElementById('bm-logs-action-filter');
  if (searchInput) searchInput.value = '';
  if (actionSelect) actionSelect.value = '';
  loadBotLogs();
}

function filterLogsByUser(telegramUserId) {
  switchBotMonitoringTab('logs');
  botMonitoringState.logSearch = telegramUserId;
  const searchInput = document.getElementById('bm-logs-search');
  if (searchInput) searchInput.value = telegramUserId;
  loadBotLogs();
}

window.renderBotMonitoring = renderBotMonitoring;
window.loadBotMonitoringData = loadBotMonitoringData;
window.switchBotMonitoringTab = switchBotMonitoringTab;
window.handleBotUsersSearch = handleBotUsersSearch;
window.setBotUserStatusFilter = setBotUserStatusFilter;
window.resetBotUserFilters = resetBotUserFilters;
window.handleBotLogsSearch = handleBotLogsSearch;
window.handleBotLogsActionFilter = handleBotLogsActionFilter;
window.resetBotLogFilters = resetBotLogFilters;
window.filterLogsByUser = filterLogsByUser;
window.showBotLogDetailModal = showBotLogDetailModal;

window.initEventDateTimeControls = initEventDateTimeControls;
window.renderEventCalendar = renderEventCalendar;
window.changeEventCalendarMonth = changeEventCalendarMonth;
window.selectEventCalendarDate = selectEventCalendarDate;
window.setEventQuickDate = setEventQuickDate;
window.renderEventStartTimeTrack = renderEventStartTimeTrack;
window.selectEventStartTime = selectEventStartTime;
window.renderEventEndTimeTrack = renderEventEndTimeTrack;
window.selectEventDuration = selectEventDuration;
window.selectEventEndTime = selectEventEndTime;
window.confirmEventDateTime = confirmEventDateTime;
window.updateEventDateTimeSummary = updateEventDateTimeSummary;

// -------------------------------------------------------------
// MODALLAR VA YORDAMCHI FUNKSIYALAR
// -------------------------------------------------------------
function initModals() {
  const modal = document.getElementById('common-modal');
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

function openModal() {
  const m = document.getElementById('common-modal');
  if (m) {
    m.classList.add('active');
    m.style.display = 'flex';
  }
}

function closeModal() {
  if (typeof window.stopStaffQrScanner === 'function') {
    try { window.stopStaffQrScanner(); } catch (e) {}
  }
  if (window.eventQrTimer) {
    clearInterval(window.eventQrTimer);
    window.eventQrTimer = null;
  }
  try {
    if (typeof window.currentModalPasteHandler === 'function') {
      window.removeEventListener('paste', window.currentModalPasteHandler);
      window.currentModalPasteHandler = null;
    }
  } catch (e) {}
  const m = document.getElementById('common-modal');
  if (m) {
    m.classList.remove('active');
    m.style.display = 'none';
  }
}

window.openModal = openModal;
window.closeModal = closeModal;

/**
 * Zamonaviy, sahifani muzlatmaydigan (non-blocking) bildirishnoma (Toast)
 */
function showToast(message, type = 'success', duration = 3000) {
  if (!message) return;
  let toastContainer = document.getElementById('app-toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'app-toast-container';
    toastContainer.style.cssText = 'position:fixed; bottom:24px; right:24px; z-index:999999; display:flex; flex-direction:column; gap:8px; pointer-events:none; max-width:420px;';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  const bg = type === 'error' ? '#EF4444' : type === 'warning' ? '#F59E0B' : type === 'info' ? '#2563EB' : '#10B981';
  const iconSym = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : type === 'info' ? '🔔' : '✅';
  toast.style.cssText = `background:${bg}; color:white; padding:12px 18px; border-radius:10px; font-size:13.5px; font-weight:500; box-shadow:0 10px 25px rgba(0,0,0,0.18); display:flex; align-items:center; gap:10px; pointer-events:auto; opacity:0; transform:translateY(12px); transition:all 0.25s cubic-bezier(0.16, 1, 0.3, 1);`;
  
  const iconSpan = document.createElement('span');
  iconSpan.style.fontSize = '16px';
  iconSpan.textContent = iconSym;
  
  const msgSpan = document.createElement('span');
  msgSpan.style.lineHeight = '1.4';
  msgSpan.textContent = String(message);
  
  toast.appendChild(iconSpan);
  toast.appendChild(msgSpan);
  toastContainer.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(12px)';
    setTimeout(() => {
      try { toast.remove(); } catch (e) {}
    }, 250);
  }, duration);
}
window.showToast = showToast;

// -------------------------------------------------------------
// SUPERADMIN UCHUN JONLI TURNIKET BILDIRISHNOMALARI (LIVE ALERTS)
// -------------------------------------------------------------
let turnstileAlertsInterval = null;
let lastSeenTurnstileEventId = null;

function playNotificationChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880.00, ctx.currentTime + 0.12); // A5
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch(e) {}
}

function initSuperadminNotifications() {
  if (turnstileAlertsInterval) {
    clearInterval(turnstileAlertsInterval);
    turnstileAlertsInterval = null;
  }

  // Faqat tizimga kirilgan va ruxsati bor xodimlar uchun
  if (!AppState.isLoggedIn || !AppState.user) return;
  const roles = AppState.user.roles || [];
  if (!roles.includes('superadmin') && AppState.user.id !== 'superadmin') return;

  // Dastlabki so'rov - eng so'nggi ID ni olib eskilari uchun darhol toast chiqarmaslik
  apiFetch('/api/attendance/live-alerts?limit=5')
    .then(data => {
      const alerts = data.alerts || [];
      if (alerts.length > 0) {
        lastSeenTurnstileEventId = alerts[0].id;
      }
    })
    .catch(() => {});

  // Har 30 soniyada yangi turniket voqealarini tekshirish
  turnstileAlertsInterval = setInterval(async () => {
    if (!AppState.isLoggedIn || !AppState.user) {
      clearInterval(turnstileAlertsInterval);
      return;
    }

    try {
      const data = await apiFetch('/api/attendance/live-alerts?limit=10');
      const alerts = data.alerts || [];
      if (!alerts.length) return;

      if (!lastSeenTurnstileEventId) {
        lastSeenTurnstileEventId = alerts[0].id;
        return;
      }

      // Faqat oxirgi tekshiruvdan keyin qo'shilgan yangi voqealar
      const newAlerts = [];
      for (const al of alerts) {
        if (al.id > lastSeenTurnstileEventId) {
          newAlerts.push(al);
        } else {
          break;
        }
      }

      if (newAlerts.length > 0) {
        lastSeenTurnstileEventId = alerts[0].id;

        // Bildirishnoma chiqarish (bir vaqtda ko'p bo'lsa maksimal 3 tasini)
        newAlerts.slice(0, 3).reverse().forEach(al => {
          const isKirish = al.direction === 'in';
          const dirText = isKirish ? '🟢 KIRDI' : '🔴 CHIQDI';
          const timeStr = al.event_time ? new Date(al.event_time).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '';
          const person = al.person_name || al.passport_id || 'Talaba';
          const group = al.group_code ? `(${al.group_code})` : '';
          const door = al.door_name || (isKirish ? 'Turniket Kirish' : 'Turniket Chiqish');

          showToast(`🔔 ${person} ${group} ${dirText} — ${door} [${timeStr}]`, 'info', 5500);
          playNotificationChime();
        });

        // Agar hozir Davomat sahifasida bo'lsa, jadvalni ham jimjit (silent) yangilab qo'yish
        if (AppState.currentPage === 'campus-attendance-manage' && document.getElementById('att-table-body')) {
          if (typeof loadAttendanceData === 'function') {
            loadAttendanceData(true);
          }
        }
      }
    } catch(e) {}
  }, 30000);
}

window.initSuperadminNotifications = initSuperadminNotifications;


// Talaba profil modalini ochish
async function showStudentModal(studentId) {
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalFooter = document.getElementById('modal-footer');

  modalTitle.textContent = 'Talaba Profili';
  modalBody.innerHTML = '<div class="spinner"></div>';
  modalFooter.innerHTML = '<button class="btn btn-outline" onclick="closeModal()">Yopish</button>';
  openModal();

  try {
    const data = await apiFetch(`/api/observe/students/${studentId}`);
    const st = data.student;
    const history = data.history || [];

    const isFemale = st.gender === 'female' || st.gender === 'f';
    const initials = `${(st.first_name || '').charAt(0)}${(st.last_name || '').charAt(0)}`.toUpperCase();
    const avatarHtml = st.photo_url
      ? `<img src="${st.photo_url}" style="width: 64px; height: 64px; border-radius: 50%; object-fit: cover; border: 2px solid #2563EB;" alt="${st.first_name}">`
      : `<span class="avatar-badge ${isFemale ? 'female' : ''}" style="width: 64px; height: 64px; font-size: 22px;">${initials}</span>`;

    modalTitle.textContent = `${st.first_name} ${st.last_name} (${st.group_code})`;
    modalBody.innerHTML = `
      <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px; padding-bottom: 14px; border-bottom: 1px solid var(--border-light);">
        <div style="position: relative; display: inline-block;">
          <div id="modal-student-avatar-wrap" onclick="document.getElementById('modal-student-photo-input').click()" style="cursor: pointer;" title="Rasmni almashtirish uchun bosing">
            ${avatarHtml}
          </div>
          <button type="button" onclick="document.getElementById('modal-student-photo-input').click()" style="position: absolute; bottom: -2px; right: -2px; background: #2563EB; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.25);" title="Rasmni almashtirish">
            ${icon('upload', 13)}
          </button>
          <input type="file" id="modal-student-photo-input" accept="image/*" style="display: none;" onchange="uploadStudentPhotoDirect('${st.id}', this)">
        </div>
        <div style="flex: 1;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; flex-wrap: wrap;">
            <div>
              <h4 style="font-size: 16px; font-weight: 700; margin-bottom: 4px; color: var(--text-main);">${st.first_name} ${st.last_name}</h4>
              <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
                <span class="badge badge-group">${st.external_id}</span>
                <span class="badge badge-course">${st.course}-kurs • ${st.group_code}</span>
              </div>
            </div>
            <div>
              <button class="btn btn-outline btn-sm" onclick="document.getElementById('modal-student-photo-input').click()" style="display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 600; padding: 5px 12px; border-color: #93C5FD; color: #1D4ED8; background: #EFF6FF;">
                ${icon('upload', 13)} <span>Rasmni Almashtirish</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="grid grid-2 mb-3">
        <div>
          <p><strong>Guruh:</strong> ${st.group_code}</p>
          <p><strong>Kurs:</strong> ${st.course}-kurs (${st.level === 'mag' ? 'Magistratura' : 'Bakalavriat'})</p>
          <p><strong>Yo'nalish:</strong> ${st.program_code}</p>
          <p><strong>Tyutor:</strong> ${st.tutor_name || 'Biriktirilmagan'}</p>
        </div>
        <div>
          <p><strong>Mavsum Balli:</strong> <strong style="color: #2563EB; font-size: 18px;">${st.season || 0}</strong></p>
          <p><strong>Jami Ball:</strong> <strong>${st.total || 0}</strong></p>
          <p><strong>Reytingdagi O'rni:</strong> <span class="badge badge-primary">#${st.rank_cohort || 1}</span></p>
          <p><strong>Telegram:</strong> ${st.telegram_user_id ? '<span class="text-success">Ulangan</span>' : '<span class="text-muted">Ulanmagan</span>'}</p>
        </div>
      </div>

      <h4 style="margin: 16px 0 8px; font-size: 15px;">Ball Yozuvlari Tarixi (${history.length} ta)</h4>
      <div style="max-height: 250px; overflow-y: auto;">
        <table class="table" style="font-size: 13px;">
          <thead>
            <tr><th>Sana</th><th>Faollik</th><th>Ball</th><th>Holat</th></tr>
          </thead>
          <tbody>
            ${history.map(h => `
              <tr>
                <td><small>${h.event_date}</small></td>
                <td>${h.item_name}</td>
                <td><strong>+${h.points}</strong></td>
                <td><span class="status-badge status-${h.status}">${h.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    modalFooter.innerHTML = `
      <button class="btn btn-primary" onclick="showEditStudentModal('${st.id}')" style="display:inline-flex; align-items:center; gap:6px;">
        ${icon('edit', 14)} <span>Tahrirlash</span>
      </button>
      <button class="btn btn-outline" onclick="closeModal()">Yopish</button>
    `;
  } catch (err) {
    modalBody.innerHTML = `<p class="text-danger">${err.message}</p>`;
  }
}

async function uploadStudentPhotoDirect(studentId, fileInput) {
  const file = fileInput.files[0];
  if (!file) return;

  const avatarWrap = document.getElementById('modal-student-avatar-wrap');
  if (avatarWrap) avatarWrap.style.opacity = '0.5';

  const formData = new FormData();
  formData.append('photo', file);

  try {
    const res = await fetch(`/api/admin/students/${studentId}/photo`, {
      method: 'POST',
      headers: {
        'x-user-id': AppState.user.id
      },
      body: formData
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Rasm yuklashda xatolik yuz berdi');

    alert("Talabaning fotosurati muvaffaqiyatli almashtirildi!");
    await showStudentModal(studentId);

    // Tyutor yoki admin jadvalini fon rejimida yangilash
    if (AppState.currentPage === 'tutor-students') {
      const studRes = await apiFetch('/api/tutor/students');
      window.tutorStudentsCache = studRes.students || [];
      const tbody = document.getElementById('tutor-students-tbody');
      if (tbody) tbody.innerHTML = renderTutorTableRowsHtml(window.tutorStudentsCache);
    } else if (typeof loadAdminStudentsList === 'function') {
      loadAdminStudentsList();
    }
  } catch (err) {
    if (avatarWrap) avatarWrap.style.opacity = '1';
    alert("Xatolik: " + err.message);
  }
}

// Tadbir QR kodini ko'rish (Dinamik yangilanish & Boshqariladigan interval)
window.eventQrTimer = null;
window.currentQrTtl = 5;
window.currentQrRemaining = 5;

async function showEventQrModal(eventId) {
  if (window.eventQrTimer) {
    clearInterval(window.eventQrTimer);
    window.eventQrTimer = null;
  }

  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalFooter = document.getElementById('modal-footer');

  modalTitle.textContent = '1-USUL: Jonli Tadbir QR Kodi (Anti-Fraud)';
  modalBody.innerHTML = '<div class="spinner"></div>';
  modalFooter.innerHTML = '<button class="btn btn-outline" onclick="closeModal()">Yopish</button>';
  openModal();

  try {
    const res = await apiFetch(`/api/events/${eventId}/qr`);
    const ttl = 5; // Xavfsizlik talabi: har doim qat'iy 5 soniya
    window.currentQrTtl = ttl;
    window.currentQrRemaining = ttl;
    const qrImg = res.qr_data_url || res.dataUrl;

    modalBody.innerHTML = `
      <div style="text-align: center; padding: 12px 16px;">
        <span class="badge badge-primary" style="font-size: 13px; font-weight: 700; padding: 4px 10px; margin-bottom: 6px;">1-USUL: UMUMIY TADBIR QR KODI (TALABA SKANERLAYDI)</span>
        <h3 style="margin: 8px 0 4px 0; font-size: 18px; font-weight: 700;">${res.title || 'Tadbir'}</h3>
        <p style="color: var(--text-muted); font-size: 12.5px; margin-bottom: 12px; max-width: 480px; margin-left: auto; margin-right: auto;">
          Talabalar Telegram Mini App dagi <strong>"📷 QR Check-in"</strong> orqali ushbu kodni skanerlab darhol <strong>+${res.points || 5} ball</strong> oladilar.
        </p>

        <!-- Dinamik Yangilanish va Anti-Fraud Paneli -->
        <div style="margin-bottom: 12px; background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 12px; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
          <div style="text-align: left;">
            <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #1E40AF; letter-spacing: 0.5px;">🛡️ Soxtalashtirishga Qarshi Himoya</div>
            <div style="font-size: 13px; font-weight: 700; color: #1E3A8A; margin-top: 1px;">
              Yangi kodga: <span id="event-qr-countdown" style="font-family: monospace; font-size: 16px; color: #2563EB;">5s</span> qoldi
            </div>
          </div>
          <!-- Qat'iy 5 soniyalik belgi (o'zgartirish taqiqlangan) -->
          <div style="display: flex; align-items: center; gap: 6px; background: #DBEAFE; padding: 6px 12px; border-radius: 8px; border: 1px solid #BFDBFE;">
            <span style="font-size: 12px; font-weight: 700; color: #1E40AF;">⏱️ Har 5 soniyada yangilanadi</span>
          </div>
        </div>

        <!-- Animated Progress Bar -->
        <div style="width: 100%; height: 6px; background: #E2E8F0; border-radius: 999px; overflow: hidden; margin-bottom: 14px;">
          <div id="event-qr-progress" style="width: 100%; height: 100%; background: #2563EB; transition: width 0.9s linear;"></div>
        </div>

        <!-- QR Kod Tasviri -->
        <div style="background: white; padding: 16px; display: inline-block; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 2px solid #E2E8F0;">
          <img id="event-live-qr-img" src="${qrImg}" alt="Tadbir QR Kod" style="width: 250px; height: 250px; display: block; margin: 0 auto; border-radius: 6px;">
        </div>

        <div id="event-qr-status-msg" style="margin-top: 12px; font-size: 12px; color: #475569; line-height: 1.45;">
          🔒 Skrinshot qilib boshqalarga yuborishning oldini olish uchun QR kod <strong>har 5 soniyada majburiy yangilanadi</strong>. Eski QR kodlar server tomonidan rad etiladi.
        </div>
      </div>
    `;

    modalFooter.innerHTML = `
      <button class="btn btn-primary" onclick="showStudentCheckinModal('${eventId}')" style="display:inline-flex; align-items:center; gap:6px;">
        ${icon('qrCode', 14)} <span>2-Usul: Talaba QR Skanerlash (Operativ)</span>
      </button>
      <button class="btn btn-outline" onclick="closeModal()">Yopish</button>
    `;

    startEventQrCountdown(eventId);

  } catch (e) {
    modalBody.innerHTML = `
      <div style="text-align: center; padding: 24px;">
        <div style="font-size: 32px; margin-bottom: 10px;">⚠️</div>
        <h4 style="color: #DC2626; margin-bottom: 8px;">QR Kod ochilmadi</h4>
        <p style="color: var(--text-muted); font-size: 13px;">${e.message}</p>
      </div>
    `;
  }
}

function startEventQrCountdown(eventId) {
  if (window.eventQrTimer) {
    clearInterval(window.eventQrTimer);
  }

  window.currentQrRemaining = 5;
  window.currentQrTtl = 5;

  window.eventQrTimer = setInterval(async () => {
    window.currentQrRemaining--;

    const countdownEl = document.getElementById('event-qr-countdown');
    const progressEl = document.getElementById('event-qr-progress');

    if (countdownEl) {
      countdownEl.textContent = `${Math.max(0, window.currentQrRemaining)}s`;
    }
    if (progressEl && window.currentQrTtl > 0) {
      const pct = (window.currentQrRemaining / window.currentQrTtl) * 100;
      progressEl.style.width = `${Math.max(0, Math.min(100, pct))}%`;
    }

    if (window.currentQrRemaining <= 0) {
      try {
        const fresh = await apiFetch(`/api/events/${eventId}/qr`);
        const imgEl = document.getElementById('event-live-qr-img');
        const newImg = fresh.qr_data_url || fresh.dataUrl;
        if (imgEl && newImg) imgEl.src = newImg;
      } catch (err) {
        console.warn('QR auto refresh error:', err);
        // Agar tadbir vaqti tugagan bo'lsa
        if (err.message && err.message.includes('tugagan')) {
          clearInterval(window.eventQrTimer);
          window.eventQrTimer = null;
          const statusMsg = document.getElementById('event-qr-status-msg');
          if (statusMsg) {
            statusMsg.textContent = '⚠️ Tadbir vaqti tugadi. Davomat tekshiruvi yakunlandi.';
            statusMsg.style.color = '#DC2626';
          }
        }
      }
      window.currentQrRemaining = 5;
      if (progressEl) progressEl.style.width = '100%';
    }
  }, 1000);
}

window.showEventQrModal = showEventQrModal;
window.openEditEventModal = openEditEventModal;
window.submitEditEvent = submitEditEvent;

// Qayta topshirish modali
function showResubmitModal(entryId) {
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalFooter = document.getElementById('modal-footer');

  modalTitle.textContent = 'Arizani Tuzatib Qayta Topshirish (Resubmit)';
  modalBody.innerHTML = `
    <div class="form-group mb-3">
      <label class="form-label">Tuzatilgan ball miqdori:</label>
      <input type="number" id="resubmit-points" class="form-control" required>
    </div>
    <div class="form-group mb-3">
      <label class="form-label">Yangi izoh / tushuntirish:</label>
      <textarea id="resubmit-note" class="form-control" rows="2" placeholder="Rad etish sababini bartaraf etganingizni yozing..."></textarea>
    </div>
    <div class="form-group">
      <label class="form-label">Yangi dalil fayli / havola:</label>
      <input type="url" id="resubmit-evidence-url" class="form-control" placeholder="https://...">
    </div>
  `;

  modalFooter.innerHTML = `
    <button class="btn btn-outline" onclick="closeModal()">Bekor qilish</button>
    <button class="btn btn-primary" onclick="submitResubmit('${entryId}')">Qayta Yuborish</button>
  `;

  openModal();
}

async function submitResubmit(entryId) {
  const points = Number(document.getElementById('resubmit-points').value);
  const note = document.getElementById('resubmit-note').value;
  const evidence_url = document.getElementById('resubmit-evidence-url').value;

  try {
    await apiFetch(`/api/tutor/entries/${entryId}/resubmit`, {
      method: 'POST',
      body: JSON.stringify({ points, note, evidence_url })
    });
    closeModal();
    alert('Ariza muvaffaqiyatli qayta topshirildi');
    navigateTo('tutor-history');
  } catch (e) {
    alert(e.message);
  }
}

// ====================================================================
// 8. TALABALAR BOSHQARUVI & EXCEL IMPORT (REGISTRATOR & SUPERADMIN)
// ====================================================================

const StudentMgmtState = {
  page: 1,
  limit: 20,
  q: '',
  group: '',
  status: '',
  totalPages: 1,
  totalStudents: 0
};


// ====================================================================
// SAHIFA: TALABALAR BOSHQARUVI & IMPORT (SUPERADMIN / REGISTRATOR)
// ====================================================================
let adminStudentsState = {
  search: '',
  group: '',
  level: '',
  course: '',
  gender: '',
  status: '',
  has_photo: '',
  viewMode: localStorage.getItem('akhu_students_view_mode') || 'list',
  limit: 48,
  offset: 0,
  total: 0,
  totalPhotos: 0,
  items: []
};

/**
 * Talaba rasmi uchun qat'iy standart fayl nomi: "first name+last name_ID.ext"
 * (Kamida ism yoki familiya bo'lishi shart, ID ixtiyoriy, rasm formati JPG/JPEG/PNG)
 */
function formatStudentPhotoFilename(st) {
  const sanitize = (s) => String(s || '').replace(/[\/\\:*?"<>|]/g, '').trim();
  const fn = sanitize(st.first_name);
  const ln = sanitize(st.last_name);
  const id = sanitize(st.external_id || st.id);

  let namePart = '';
  if (fn && ln) {
    namePart = `${fn}+${ln}`;
  } else if (fn) {
    namePart = fn;
  } else if (ln) {
    namePart = ln;
  } else {
    namePart = 'Talaba';
  }

  let baseName = id ? `${namePart}_${id}` : namePart;
  let ext = '.jpg';
  if (st.photo_url) {
    const match = st.photo_url.match(/\.(jpg|jpeg|png)$/i);
    if (match) {
      ext = match[0].toLowerCase();
    }
  }
  return `${baseName}${ext}`;
}

function pathExt(str) {
  const m = String(str || '').match(/\.([a-zA-Z0-9]+)$/);
  return m ? m[1].toUpperCase() : 'JPG';
}

function copyStudentPhotoName(name) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(name).then(() => {
      showToast(`Nusxalandi: "${name}"`, 'success', 2200);
    }).catch(() => {
      fallbackCopyText(name);
    });
  } else {
    fallbackCopyText(name);
  }
}

function fallbackCopyText(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
  showToast(`Nusxalandi: "${text}"`, 'success', 2200);
}

function setStudentsViewMode(mode) {
  adminStudentsState.viewMode = mode;
  try { localStorage.setItem('akhu_students_view_mode', mode); } catch (e) {}

  const btnCard = document.getElementById('view-toggle-card');
  const btnList = document.getElementById('view-toggle-list');
  const cardsContainer = document.getElementById('students-cards-view');
  const tableContainer = document.getElementById('students-table-view');

  if (btnCard) btnCard.classList.toggle('active', mode === 'card');
  if (btnList) btnList.classList.toggle('active', mode === 'list');

  if (cardsContainer) cardsContainer.style.display = mode === 'card' ? 'block' : 'none';
  if (tableContainer) tableContainer.style.display = mode === 'list' ? 'block' : 'none';

  if (adminStudentsState.items && adminStudentsState.items.length > 0) {
    if (mode === 'card') {
      renderAdminStudentsCards(adminStudentsState.items);
    } else {
      renderAdminStudentsTable(adminStudentsState.items);
    }
  }
}

function previewStudentPhoto(firstParam, secondParam, thirdParam) {
  let studentId = '';
  let photoUrl = '';
  let studentName = '';

  // Agar bitta parametr (studentId) uzatilgan bo'lsa
  if (!secondParam && !thirdParam) {
    studentId = firstParam;
  } else if (thirdParam) {
    studentId = thirdParam;
    photoUrl = firstParam;
    studentName = secondParam;
  } else {
    studentId = firstParam;
  }

  // Talabani keshdan topish
  let st = (adminStudentsState.items || []).find(s => String(s.id) === String(studentId) || String(s.external_id) === String(studentId));
  if (!st && window.tutorStudentsCache) {
    st = window.tutorStudentsCache.find(s => String(s.id) === String(studentId) || String(s.external_id) === String(studentId));
  }

  if (st) {
    studentId = st.id || studentId;
    photoUrl = st.photo_url || photoUrl;
    studentName = `${st.first_name || ''} ${st.last_name || ''}`.trim() || studentName;
  }

  if (!photoUrl) {
    showToast("Ushbu talabada fotosurat mavjud emas", "warning");
    return;
  }

  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalFooter = document.getElementById('modal-footer');

  modalTitle.innerHTML = `<span style="display:flex; align-items:center; gap:8px;">${icon('image', 18)} Talaba Fotosurati</span>`;
  modalBody.innerHTML = `
    <div style="text-align: center; padding: 4px;">
      <!-- Katta va bir xil standart freymda kesilmasdan ochiladigan rasm -->
      <div class="student-photo-frame-container">
        <img src="${photoUrl}" alt="${studentName}" class="student-photo-frame-img" loading="eager" title="Kattalashtirilgan rasm">
      </div>

      <!-- Talaba ma'lumotlari (Rasm fayl nomi butunlay olib tashlandi!) -->
      <div style="margin-top: 10px; margin-bottom: 4px;">
        <h3 style="font-size: 19px; font-weight: 800; color: var(--text-main); margin-bottom: 6px;">${studentName}</h3>
        <div style="display: flex; gap: 8px; justify-content: center; align-items: center; flex-wrap: wrap;">
          <span class="badge badge-group" style="font-size: 12px; padding: 4px 10px; font-weight: 700;">ID: ${st ? (st.external_id || studentId) : studentId}</span>
          ${(st && st.group_code) ? `<span class="badge" style="background:#EFF6FF; color:#2563EB; border:1px solid #BFDBFE; font-weight:700; font-size:12px; padding:4px 10px;">Guruh: ${st.group_code}</span>` : ''}
          ${(st && st.course) ? `<span class="badge badge-course" style="font-size:12px; padding:4px 10px;">${st.course}-kurs</span>` : ''}
          ${(st && st.level) ? `<span class="badge" style="background:#F5F3FF; color:#7C3AED; border:1px solid #DDD6FE; font-size:12px; padding:4px 10px; font-weight:700;">${st.level === 'mag' ? 'Magistratura' : 'Bakalavriat'}</span>` : ''}
        </div>
      </div>
    </div>
  `;
  modalFooter.innerHTML = `
    <button class="btn btn-outline" onclick="closeModal()">Yopish</button>
    <button class="btn btn-outline" onclick="showStudentDetailsModal('${studentId}')" style="display: inline-flex; align-items: center; gap: 6px;">
      ${icon('user', 14)} Talaba Profili
    </button>
    <button class="btn btn-primary" onclick="downloadSingleStudentPhoto('${studentId}')" style="display: inline-flex; align-items: center; gap: 6px;">
      ${icon('download', 14)} Fotosuratni Yuklab Olish
    </button>
    <a href="${photoUrl}" target="_blank" class="btn btn-outline" style="display: inline-flex; align-items: center; gap: 6px;" title="Asl o'lchamda alohida oynada ko'rish">
      ${icon('external', 14)} Asl Hajmda
    </a>
  `;
  openModal();
}

/**
 * Akademik Guruhlar Ro'yxati Modali (12 ta guruh monitoringi)
 */
async function openAcademicGroupsModal() {
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalFooter = document.getElementById('modal-footer');

  modalTitle.innerHTML = `<span style="display:flex; align-items:center; gap:8px;">${icon('building', 18)} Universitet Akademik Guruhlari</span>`;
  modalBody.innerHTML = `<div style="text-align:center; padding:36px;"><div class="spinner"></div><p style="margin-top:10px; color:#64748B;">Guruhlar ma'lumotlari yuklanmoqda...</p></div>`;
  modalFooter.innerHTML = `<button class="btn btn-outline" onclick="closeModal()">Yopish</button>`;
  openModal();

  try {
    const res = await apiFetch('/api/admin/groups-list');
    const groups = res.groups_summary || [];

    if (groups.length === 0) {
      modalBody.innerHTML = `<p style="text-align:center; padding:24px; color:#64748B;">Akademik guruhlar topilmadi.</p>`;
      return;
    }

    modalBody.innerHTML = `
      <div style="margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; padding: 2px 4px;">
        <span style="font-size: 13.5px; color: #475569; font-weight: 700;">Jami: <span style="color:#2563EB;">${groups.length} ta</span> akademik guruh</span>
        <button class="btn btn-sm btn-outline" onclick="filterByAcademicGroup('')" style="display: inline-flex; align-items: center; gap: 5px; font-weight: 600;">
          ${icon('refresh', 13)} Barcha Talabalarni Ko'rsatish
        </button>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; max-height: 60vh; overflow-y: auto; padding: 4px;">
        ${groups.map(g => {
          const total = Number(g.total_students) || 0;
          const photos = Number(g.photo_count) || 0;
          const percent = total > 0 ? Math.round((photos / total) * 100) : 0;
          const isMag = g.level === 'mag';
          return `
            <div class="academic-group-card">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <h4 style="font-size: 16px; font-weight: 800; color: #1E3A8A; margin: 0; letter-spacing: 0.5px;">${g.group_code}</h4>
                  <span class="badge" style="background:${isMag ? '#F5F3FF' : '#EFF6FF'}; color:${isMag ? '#7C3AED' : '#2563EB'}; border:1px solid ${isMag ? '#DDD6FE' : '#BFDBFE'}; font-size:11px; font-weight:700;">
                    ${isMag ? 'Magistratura' : 'Bakalavriat'} • ${g.course || 1}-kurs
                  </span>
                </div>
                <div style="font-size: 12.5px; color: #475569; margin-bottom: 4px;">
                  Talabalar soni: <strong style="color: #0F172A;">${total} nafar</strong>
                </div>
                <div style="font-size: 12px; color: #64748B; margin-bottom: 8px;">
                  Rasmli: <strong style="color: #16A34A;">${photos} ta (${percent}%)</strong>
                  ${g.tutor_name ? `<br><span style="font-size:11.5px; color:#6B7280; display:inline-block; margin-top:3px;">Tyutor: ${g.tutor_name}</span>` : ''}
                </div>
                <div style="height: 5px; background: #E2E8F0; border-radius: 3px; overflow: hidden; margin-bottom: 12px;">
                  <div style="width: ${percent}%; height: 100%; background: #10B981; border-radius: 3px;"></div>
                </div>
              </div>
              <button class="btn btn-sm btn-primary w-100" onclick="filterByAcademicGroup('${g.group_code}')" style="display: flex; justify-content: center; align-items: center; gap: 6px; font-weight: 600;">
                ${icon('search', 13)} <span>Guruh Talabalarini Ko'rish (${total})</span>
              </button>
            </div>
          `;
        }).join('')}
      </div>
    `;
  } catch (err) {
    modalBody.innerHTML = `<div class="alert alert-danger" style="margin:16px;">Guruhlar ro'yxatini yuklashda xatolik: ${err.message}</div>`;
  }
}

function filterByAcademicGroup(groupCode) {
  closeModal();
  const searchInput = document.getElementById('filter-student-search');
  if (searchInput) searchInput.value = groupCode;
  adminStudentsState.search = groupCode;
  adminStudentsState.offset = 0;
  loadAdminStudentsList();
}

function downloadSingleStudentPhoto(studentId) {
  const userId = (AppState.user && AppState.user.id) ? AppState.user.id : 'superadmin';
  window.open(`/api/admin/students/${encodeURIComponent(studentId)}/photo-download?user_id=${encodeURIComponent(userId)}`, '_blank');
}

async function downloadStudentsPhotosZip() {
  const btn = document.getElementById('btn-export-photos-zip');
  const originalHtml = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span style="display:inline-block;width:14px;height:14px;border:2px solid #fff;border-top-color:transparent;border-radius:50%;animation:spin 0.8s linear infinite;"></span> <span>ZIP arxiv tayyorlanmoqda...</span>`;
  }

  try {
    const params = new URLSearchParams();
    if (adminStudentsState.search) params.append('search', adminStudentsState.search);
    if (adminStudentsState.level) params.append('level', adminStudentsState.level);
    if (adminStudentsState.course) params.append('course', adminStudentsState.course);
    if (adminStudentsState.group) params.append('group', adminStudentsState.group);
    if (adminStudentsState.status) params.append('status', adminStudentsState.status);
    if (adminStudentsState.gender) params.append('gender', adminStudentsState.gender);

    const token = localStorage.getItem('akhu_auth_token') || '';
    const userId = (AppState.user && AppState.user.id) ? AppState.user.id : 'superadmin';

    const res = await fetch(`/api/admin/students/photos/export-zip?${params.toString()}`, {
      headers: {
        'x-user-id': userId,
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || 'Serverdan ZIP arxivni yuklab olishda xatolik yuz berdi');
    }

    let filename = 'talabalar_rasmlari.zip';
    const disp = res.headers.get('content-disposition');
    if (disp) {
      const match = disp.match(/filename=["']?([^"';]+)["']?/);
      if (match && match[1]) filename = match[1];
    }

    const totalPhotos = res.headers.get('x-total-photos') || 'Barcha';

    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(downloadUrl);

    showToast(`🎉 ${totalPhotos} ta talaba rasmlari ZIP arxiv ("${filename}") sifatida yuklab olindi!`, 'success', 3500);
  } catch (err) {
    showToast('Xatolik: ' + err.message, 'error', 4000);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalHtml;
    }
  }
}


async function renderStudentsManagement(container, roleTitle = 'Registrator') {
  container.innerHTML = `
    <!-- RASMIY SOHAVIY HERO BANNER -->
    <div class="admin-hero-card">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div style="max-width: 550px;">
          <div class="admin-hero-title">
            <span style="color: #60A5FA;">${icon('cap', 22)}</span>
            <span>Talabalar Reyestri & Boshqaruv Markazi</span>
            <span class="badge" style="background: rgba(59, 130, 246, 0.2); color: #93C5FD; border: 1px solid rgba(59, 130, 246, 0.4); font-size: 11px;">
              ${roleTitle}
            </span>
          </div>
          <p class="admin-hero-desc" style="margin-bottom: 0;">
            Al-Xorazmiy Universiteti talabalarining yagona rasmiy bazasi, fotosuratlari va akademik guruhlar monitoringi.
          </p>
        </div>

        <!-- JUDA KICHIK QILIB BIR BURCHAKKA JOYLASHTIRILGAN MINI METRIKALAR -->
        <div class="compact-metrics-box" id="students-compact-metrics-corner" title="Asosiy ko'rsatkichlar">
          <div class="compact-metric-item" title="Jami ro'yxatdagi talabalar">
            <span style="color: #93C5FD;">👥 Jami:</span>
            <strong id="stat-total-students" class="compact-metric-val">202</strong>
          </div>
          <div class="compact-metric-item" title="Ta'lim jarayonidagi faol talabalar">
            <span style="color: #86EFAC;">✅ Faol:</span>
            <strong id="stat-active-students" class="compact-metric-val">202</strong>
          </div>
          <div class="compact-metric-item" title="Fotosurati tizimda mavjud talabalar">
            <span style="color: #FDE047;">🖼️ Rasmli:</span>
            <strong id="stat-photos-students" class="compact-metric-val">202</strong>
          </div>
          <button class="btn-groups-summary" onclick="openAcademicGroupsModal()" title="Barcha 12 ta guruh ro'yxatini ko'rish uchun bosing">
            <span>🏢 Guruhlar:</span>
            <strong id="stat-groups-count">12 ta</strong>
            <span style="font-size: 10px; opacity: 0.85;">👁️</span>
          </button>
        </div>

        <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
          <a href="/api/admin/students/template" download="talabalar_import_shablon.xlsx" class="btn" style="background: #FFFFFF; color: #1E293B; border: 1px solid #CBD5E1; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; text-decoration: none; box-shadow: 0 1px 3px rgba(0,0,0,0.08); transition: background 0.15s ease;" onmouseover="this.style.background='#F1F5F9'" onmouseout="this.style.background='#FFFFFF'" title="Excel import uchun namunaviy shablon faylini yuklab olish">
            <span style="color: #2563EB; display: inline-flex; align-items: center;">${icon('download', 15)}</span>
            <span style="color: #1E293B;">Shablonni Yuklab Olish</span>
          </a>
          <button class="btn btn-primary" onclick="toggleImportPanel()" style="display: inline-flex; align-items: center; gap: 6px;">
            ${icon('fileSpreadsheet', 14)} <span>Excel Import</span>
          </button>
          <button class="btn btn-success" onclick="showCreateStudentModal()" style="display: inline-flex; align-items: center; gap: 6px; background: #059669; border-color: #059669;">
            ${icon('userPlus', 14)} <span>Yangi Talaba</span>
          </button>
          <button id="btn-sync-students-photos" class="btn btn-outline" onclick="triggerHikPhotosSync(this)" style="display: inline-flex; align-items: center; gap: 6px; border-color: #CBD5E1; color: #1E293B;" title="Turniket serveridan rasmi yo'q talabalarning rasmlarini yuklab to'ldirish">
            📸 <span>Turniket Rasmlari</span>
          </button>
        </div>
      </div>
    </div>

    <!-- EXCEL IMPORT PANEL (TOGGLEABLE) -->
    <div id="student-import-panel" class="card mb-4" style="display: none; border: 1px solid #BFDBFE; background: #F8FAFC; box-shadow: var(--shadow-sm);">
      <div class="card-header" style="background: #EFF6FF; border-bottom: 1px solid #DBEAFE; display: flex; justify-content: space-between; align-items: center;">
        <h3 style="font-size: 14px; color: #1E3A8A; font-weight: 700; display: flex; align-items: center; gap: 8px;">
          ${icon('upload', 16)} Talabalar Ro'yxatini Ommaviy Import Qilish (.xlsx / .xls / .csv)
        </h3>
        <button class="btn btn-outline btn-sm" onclick="toggleImportPanel()">Yopish</button>
      </div>
      <div class="card-body">
        <div style="display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 24px; align-items: start;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
              <p style="font-size: 12.5px; color: var(--text-secondary); margin: 0; font-weight: 600;">
                Excel fayldagi talab qilinadigan 8 ta ustun tartibi:
              </p>
              <a href="/api/admin/students/template" download="talabalar_import_shablon.xlsx" class="btn btn-sm btn-outline" style="background: white; color: #2563EB; border-color: #93C5FD; display: inline-flex; align-items: center; gap: 5px; font-weight: 600; text-decoration: none; padding: 4px 10px; font-size: 12px;">
                ${icon('download', 13)} <span>Namuna Shablon (.xlsx)</span>
              </a>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px; margin-bottom: 12px;">
              <div style="background: white; padding: 6px 10px; border-radius: 4px; border: 1px solid #E2E8F0;"><strong>1. ID</strong> (masalan, AE1126333)</div>
              <div style="background: white; padding: 6px 10px; border-radius: 4px; border: 1px solid #E2E8F0;"><strong>2. Ism</strong> (masalan, AYGUL)</div>
              <div style="background: white; padding: 6px 10px; border-radius: 4px; border: 1px solid #E2E8F0;"><strong>3. Familiya</strong> (SHADIMURATOVA)</div>
              <div style="background: white; padding: 6px 10px; border-radius: 4px; border: 1px solid #E2E8F0;"><strong>4. yo'nalishi</strong> (Sun'iy intellekt)</div>
              <div style="background: white; padding: 6px 10px; border-radius: 4px; border: 1px solid #E2E8F0;"><strong>5. guruh</strong> (masalan, FMC04)</div>
              <div style="background: white; padding: 6px 10px; border-radius: 4px; border: 1px solid #E2E8F0;"><strong>6. telefon raqami</strong> (+998...)</div>
              <div style="background: white; padding: 6px 10px; border-radius: 4px; border: 1px solid #E2E8F0;"><strong>7. jinsi</strong> (Ayol / Erkak)</div>
              <div style="background: white; padding: 6px 10px; border-radius: 4px; border: 1px solid #E2E8F0;"><strong>8. kursi</strong> (1, 2, 3, 4)</div>
            </div>
            <p style="font-size: 11.5px; color: #2563EB; display: flex; align-items: center; gap: 6px;">
              ${icon('info', 14)} <span>ID mavjud bo'lsa yangilanadi, yangilari esa avtomatik qo'shiladi va tegishli tyutor biriktiriladi.</span>
            </p>
          </div>

          <div style="background: white; padding: 18px; border-radius: var(--radius-md); border: 1px solid var(--border-light);">
            <div class="form-group mb-3">
              <label class="form-label">Excel / CSV faylini tanlang:</label>
              <input type="file" id="import-file-input" accept=".xlsx,.xls,.csv" class="form-control" style="padding: 8px;">
            </div>
            <button id="btn-do-import" class="btn btn-primary w-100" onclick="handleStudentExcelUpload()" style="display: flex; justify-content: center; align-items: center; gap: 8px;">
              ${icon('upload', 15)} <span>Importni Boshlash</span>
            </button>
            <div id="import-result-box" style="margin-top: 14px; display: none;"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- FILTR VA QIDIRUV BOSHQARUV PANELI -->
    <div class="admin-toolbar mb-3">
      <div class="admin-search-box">
        ${icon('search', 16)}
        <input type="text" id="filter-student-search" class="admin-search-input" placeholder="ID, F.I.Sh, guruh yoki telefon bo'yicha tezkor qidiruv...">
      </div>
      <div class="admin-filters-group">
        <select id="filter-student-level" class="admin-filter-select" title="Ta'lim bosqichi">
          <option value="">Barcha bosqichlar</option>
          <option value="bak">🎓 Bakalavriat (Bachelor)</option>
          <option value="mag">🔬 Magistratura (Master)</option>
        </select>
        <select id="filter-student-course" class="admin-filter-select" title="Kursi">
          <option value="">Barcha kurslar</option>
          <option value="1">1-kurs</option>
          <option value="2">2-kurs</option>
          <option value="3">3-kurs</option>
          <option value="4">4-kurs</option>
        </select>
        <select id="filter-student-photo" class="admin-filter-select" title="Rasm holati">
          <option value="">Barcha talabalar</option>
          <option value="1">🖼️ Faqat rasmlilar</option>
          <option value="0">⚠️ Rasmsiz talabalar</option>
        </select>
        <select id="filter-student-gender" class="admin-filter-select" title="Jinsi">
          <option value="">Barcha jinslar</option>
          <option value="m">Erkak (O'g'il bola)</option>
          <option value="f">Ayol (Qiz bola)</option>
        </select>
        <select id="filter-student-status" class="admin-filter-select" title="Talaba holati">
          <option value="">Barcha holatlar</option>
          <option value="active">Faol (Active)</option>
          <option value="left">Nofaol (Left)</option>
        </select>
        <button class="btn btn-outline btn-sm" onclick="resetStudentFilters()" title="Filtrlarni tozalash" style="display: inline-flex; align-items: center; gap: 4px;">
          ${icon('refresh', 13)} Tozalash
        </button>
      </div>
    </div>

    <!-- AMALLAR VA KO'RINISH REJIMI (CARD / LIST & ZIP YUKLAB OLISH) -->
    <div class="students-actions-row mb-3">
      <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
        <!-- JADVAL / KARTA REJIMI O'TKAZGICHI (JADVAL - DEFAULT, KARTA - IKKINCHI OPTION) -->
        <div class="view-mode-pill-box">
          <button id="view-toggle-list" class="btn-view-toggle ${adminStudentsState.viewMode === 'list' ? 'active' : ''}" onclick="setStudentsViewMode('list')" title="Talabalar ro'yxatini jadval ko'rinishida ko'rish">
            ${icon('list', 14)} <span>Jadval</span>
          </button>
          <button id="view-toggle-card" class="btn-view-toggle ${adminStudentsState.viewMode === 'card' ? 'active' : ''}" onclick="setStudentsViewMode('card')" title="Talabalar rasmlarini karta shaklida ko'rish">
            ${icon('grid', 14)} <span>Karta</span>
          </button>
        </div>
        <span id="students-filtered-summary" style="font-size: 13px; color: var(--text-secondary); font-weight: 600;">
          Yuklanmoqda...
        </span>
      </div>

      <!-- ZIP EXPORT TUGMASI (FILTR ASOSIDA VA BELGILANGAN STANDART NOM BILAN) -->
      <div style="display: flex; align-items: center; gap: 8px;">
        <button id="btn-export-photos-zip" class="btn btn-primary" onclick="downloadStudentsPhotosZip()" style="display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #1E40AF 0%, #2563EB 100%); border-color: #1E40AF; font-weight: 600; box-shadow: 0 2px 6px rgba(37,99,235,0.3); padding: 7px 16px;" title="Filtr asosida talabalar rasmlarini 'first name+last name_ID' formati bilan ZIP qilib yuklab olish">
          ${icon('download', 15)}
          <span>Rasmlarni ZIP (.zip) yuklab olish</span>
          <span id="zip-count-badge" class="badge" style="background: rgba(255,255,255,0.25); color: #FFFFFF; font-size: 11px; margin-left: 4px;">0</span>
        </button>
      </div>
    </div>

    <!-- 1. JADVAL KO'RINISHI CONTAINER (ASOSIY / DEFAULT) -->
    <div id="students-table-view" class="card" style="${adminStudentsState.viewMode === 'list' ? 'display: block;' : 'display: none;'}">
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 55px;">Rasm</th>
              <th style="width: 110px;">Talaba ID</th>
              <th>F.I.Sh</th>
              <th>Yo'nalish & Guruh</th>
              <th style="width: 115px;">Bosqich</th>
              <th>Kurs</th>
              <th>Telefon Raqami</th>
              <th>Ball</th>
              <th>Holati</th>
              <th style="text-align: right; width: 130px;">Amallar</th>
            </tr>
          </thead>
          <tbody id="admin-students-table-body">
            <tr>
              <td colspan="10" style="text-align: center; padding: 40px; color: var(--text-muted);">
                <div class="spinner" style="margin-bottom: 10px;"></div>
                <p>Talabalar ro'yxati yuklanmoqda...</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 2. KARTA KO'RINISHI CONTAINER (IKKINCHI OPTION) -->
    <div id="students-cards-view" style="${adminStudentsState.viewMode === 'card' ? 'display: block;' : 'display: none;'}">
      <div id="admin-students-cards-grid" class="students-cards-grid">
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
          <div class="spinner" style="margin-bottom: 10px;"></div>
          <p>Talabalar fotosuratlari yuklanmoqda...</p>
        </div>
      </div>
    </div>

    <!-- PAGINATION (CARD VA LIST VIEW UCHUN UMUMIY) -->
    <div id="students-pagination-bar-wrap" class="card" style="margin-top: 14px;"></div>
  `;

  // Filter hodisalarini ulash
  const searchInput = document.getElementById('filter-student-search');
  let searchTimer;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    const val = e.target.value.trim();
    if (!val && adminStudentsState.search) {
      adminStudentsState.search = '';
      adminStudentsState.offset = 0;
      loadAdminStudentsList();
      return;
    }
    searchTimer = setTimeout(() => {
      adminStudentsState.search = val;
      adminStudentsState.offset = 0;
      loadAdminStudentsList();
    }, 250);
  });
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      clearTimeout(searchTimer);
      adminStudentsState.search = e.target.value.trim();
      adminStudentsState.offset = 0;
      loadAdminStudentsList();
    }
  });

  document.getElementById('filter-student-level').addEventListener('change', (e) => {
    adminStudentsState.level = e.target.value;
    adminStudentsState.offset = 0;
    loadAdminStudentsList();
  });

  document.getElementById('filter-student-course').addEventListener('change', (e) => {
    adminStudentsState.course = e.target.value;
    adminStudentsState.offset = 0;
    loadAdminStudentsList();
  });

  document.getElementById('filter-student-photo').addEventListener('change', (e) => {
    adminStudentsState.has_photo = e.target.value;
    adminStudentsState.offset = 0;
    loadAdminStudentsList();
  });

  document.getElementById('filter-student-gender').addEventListener('change', (e) => {
    adminStudentsState.gender = e.target.value;
    adminStudentsState.offset = 0;
    loadAdminStudentsList();
  });

  document.getElementById('filter-student-status').addEventListener('change', (e) => {
    adminStudentsState.status = e.target.value;
    adminStudentsState.offset = 0;
    loadAdminStudentsList();
  });

  await loadAdminStudentsList();
}

function resetStudentFilters() {
  adminStudentsState.search = '';
  adminStudentsState.level = '';
  adminStudentsState.course = '';
  adminStudentsState.has_photo = '';
  adminStudentsState.gender = '';
  adminStudentsState.status = '';
  adminStudentsState.offset = 0;

  const s = document.getElementById('filter-student-search');
  if (s) s.value = '';
  const lvl = document.getElementById('filter-student-level');
  if (lvl) lvl.value = '';
  const c = document.getElementById('filter-student-course');
  if (c) c.value = '';
  const ph = document.getElementById('filter-student-photo');
  if (ph) ph.value = '';
  const g = document.getElementById('filter-student-gender');
  if (g) g.value = '';
  const st = document.getElementById('filter-student-status');
  if (st) st.value = '';

  loadAdminStudentsList();
}

function prevStudentPage() {
  if (adminStudentsState.offset >= adminStudentsState.limit) {
    adminStudentsState.offset -= adminStudentsState.limit;
    loadAdminStudentsList();
  }
}

function nextStudentPage() {
  if (adminStudentsState.offset + adminStudentsState.limit < adminStudentsState.total) {
    adminStudentsState.offset += adminStudentsState.limit;
    loadAdminStudentsList();
  }
}

function toggleImportPanel() {
  const panel = document.getElementById('student-import-panel');
  if (!panel) return;
  panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

async function loadAdminStudentsList() {
  const tbody = document.getElementById('admin-students-table-body');
  const cardsGrid = document.getElementById('admin-students-cards-grid');

  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="11" style="text-align: center; padding: 40px; color: var(--text-muted);">
          <div class="spinner" style="margin-bottom: 8px;"></div>
          <p>Ma'lumotlar yangilanmoqda...</p>
        </td>
      </tr>
    `;
  }
  if (cardsGrid) {
    cardsGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
        <div class="spinner" style="margin-bottom: 8px;"></div>
        <p>Talabalar fotosuratlari yuklanmoqda...</p>
      </div>
    `;
  }

  try {
    const params = new URLSearchParams({
      limit: adminStudentsState.limit,
      offset: adminStudentsState.offset
    });
    if (adminStudentsState.search) params.append('search', adminStudentsState.search);
    if (adminStudentsState.level) params.append('level', adminStudentsState.level);
    if (adminStudentsState.course) params.append('course', adminStudentsState.course);
    if (adminStudentsState.status) params.append('status', adminStudentsState.status);
    if (adminStudentsState.gender) params.append('gender', adminStudentsState.gender);
    if (adminStudentsState.has_photo !== '') params.append('has_photo', adminStudentsState.has_photo);

    const res = await apiFetch(`/api/admin/students?${params.toString()}`);
    let students = res.students || [];

    adminStudentsState.items = students;
    adminStudentsState.total = res.total || students.length;

    // Metrikalarni yangilash
    const statTotal = document.getElementById('stat-total-students');
    const statActive = document.getElementById('stat-active-students');
    const statPhotos = document.getElementById('stat-photos-students');
    const statGroups = document.getElementById('stat-groups-count');

    if (res.metrics) {
      if (statTotal) statTotal.textContent = res.metrics.total || 0;
      if (statActive) statActive.textContent = res.metrics.active || 0;
      if (statPhotos) statPhotos.textContent = res.metrics.photos || 0;
      if (statGroups) statGroups.textContent = res.metrics.groups || 0;
    } else {
      if (statTotal) statTotal.textContent = res.total || 0;
      if (statActive) statActive.textContent = res.total || 0;
      if (statPhotos) statPhotos.textContent = 198;
      if (statGroups) statGroups.textContent = 5;
    }

    // ZIP yuklash tugmasidagi sonni va xulosani yangilash
    const zipBadge = document.getElementById('zip-count-badge');
    const summaryText = document.getElementById('students-filtered-summary');
    const photoCountInPage = students.filter(s => Boolean(s.photo_url)).length;
    const totalPhotos = res.metrics ? (res.metrics.photos || 0) : photoCountInPage;

    if (zipBadge) {
      zipBadge.textContent = totalPhotos;
    }
    if (summaryText) {
      summaryText.textContent = `Jami: ${adminStudentsState.total} ta talaba (${totalPhotos} ta rasm)`;
    }

    // Render Cards va Table
    renderAdminStudentsCards(students);
    renderAdminStudentsTable(students);

    // Katta va qulay sahifalash (Pagination)
    renderStudentsPagination();

  } catch (err) {
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="11" style="text-align: center; padding: 24px; color: var(--danger);">
            Xatolik yuz berdi: ${err.message}
          </td>
        </tr>
      `;
    }
    if (cardsGrid) {
      cardsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 24px; color: var(--danger);">
          Xatolik yuz berdi: ${err.message}
        </div>
      `;
    }
  }
}

/**
 * Aniq, katta va qulay sahifalash (Pagination) komponenti
 */
function renderStudentsPagination() {
  const container = document.getElementById('students-pagination-bar-wrap');
  if (!container) return;

  const total = Number(adminStudentsState.total) || 0;
  const limit = Number(adminStudentsState.limit) || 48;
  const offset = Number(adminStudentsState.offset) || 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.min(totalPages, Math.floor(offset / limit) + 1);

  const startIdx = total === 0 ? 0 : offset + 1;
  const endIdx = Math.min(offset + limit, total);

  let pageButtonsHtml = '';
  const pages = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  pageButtonsHtml = pages.map(p => {
    if (p === '...') {
      return `<span style="padding: 6px 10px; color: #94A3B8; font-weight: 700;">...</span>`;
    }
    const isActive = p === currentPage;
    return `
      <button 
        class="btn-pagination-page ${isActive ? 'active' : ''}" 
        onclick="goToStudentPage(${p})"
        style="${isActive ? 'background: #2563EB; color: #FFFFFF; font-weight: 700; border: 1px solid #2563EB; box-shadow: 0 2px 6px rgba(37,99,235,0.35);' : 'background: #FFFFFF; color: #1E293B; border: 1px solid #CBD5E1;'}"
      >
        ${p}
      </button>
    `;
  }).join('');

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; padding: 14px 20px;">
      <!-- Chap: Ma'lumot va Sahifada nechta ko'rsatish tanlovi -->
      <div style="display: flex; align-items: center; gap: 14px; flex-wrap: wrap;">
        <span style="font-size: 13.5px; color: #475569; font-weight: 600;">
          Ko'rsatilmoqda: <strong style="color: #0F172A;">${startIdx}-${endIdx}</strong> / jami <strong style="color: #2563EB;">${total}</strong> ta talaba
        </span>
        <div style="display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; color: #64748B;">
          <span>Sahifada:</span>
          <select onchange="changeStudentsPerPage(this.value)" style="padding: 5px 10px; border: 1px solid #CBD5E1; border-radius: 6px; font-weight: 600; font-size: 12px; background: white; cursor: pointer;">
            <option value="24" ${limit === 24 ? 'selected' : ''}>24 tadan</option>
            <option value="48" ${limit === 48 ? 'selected' : ''}>48 tadan</option>
            <option value="96" ${limit === 96 ? 'selected' : ''}>96 tadan</option>
            <option value="200" ${limit >= 200 ? 'selected' : ''}>Barchasi (200+)</option>
          </select>
        </div>
      </div>

      <!-- O'ng: Sahifa raqamlari va Oldingi / Keyingi tugmalari -->
      <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
        <span style="font-size: 13px; font-weight: 700; color: #1E293B; margin-right: 6px; background: #F1F5F9; padding: 5px 12px; border-radius: 6px; border: 1px solid #E2E8F0;">
          Sahifa <span style="color: #2563EB;">${currentPage}</span> / ${totalPages} (Jami ${totalPages} sahifa)
        </span>

        <button 
          class="btn-pagination-nav" 
          onclick="prevStudentPage()" 
          ${currentPage <= 1 ? 'disabled style="opacity: 0.4; cursor: not-allowed;"' : ''}
          title="Oldingi sahifaga o'tish"
        >
          ◀ Oldingi
        </button>

        <div style="display: flex; gap: 4px; align-items: center;">
          ${pageButtonsHtml}
        </div>

        <button 
          class="btn-pagination-nav" 
          onclick="nextStudentPage()" 
          ${currentPage >= totalPages ? 'disabled style="opacity: 0.4; cursor: not-allowed;"' : ''}
          title="Keyingi sahifaga o'tish"
        >
          Keyingi ▶
        </button>
      </div>
    </div>
  `;
}

function goToStudentPage(pageNum) {
  const limit = adminStudentsState.limit || 48;
  adminStudentsState.offset = (pageNum - 1) * limit;
  loadAdminStudentsList();
  window.scrollTo({ top: 220, behavior: 'smooth' });
}

function changeStudentsPerPage(perPage) {
  adminStudentsState.limit = Number(perPage) || 48;
  adminStudentsState.offset = 0;
  loadAdminStudentsList();
}

function renderAdminStudentsCards(students) {
  const grid = document.getElementById('admin-students-cards-grid');
  if (!grid) return;

  if (students.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px; color: var(--text-muted); background: #FFFFFF; border-radius: 12px; border: 1px dashed #CBD5E1;">
        <div style="font-size: 36px; color: #94A3B8; margin-bottom: 10px;">${icon('users', 36)}</div>
        <p style="font-size: 15px; font-weight: 700; color: var(--text-main);">Talabalar topilmadi</p>
        <p style="font-size: 12.5px; margin-top: 4px;">Qidiruv yoki filtr mezonlarini o'zgartiring.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = students.map(st => {
    const isFemale = st.gender === 'female' || st.gender === 'f';
    const initials = `${(st.first_name || '').charAt(0)}${(st.last_name || '').charAt(0)}`.toUpperCase();
    const isActive = st.status === 'active';
    const isMag = st.level === 'mag';
    const levelBadgeHtml = isMag
      ? `<span class="badge" style="background:#FAF5FF; color:#6D28D9; border:1px solid #DDD6FE; font-weight:700; font-size:10.5px; padding:2px 6px; border-radius:4px;">Mag</span>`
      : `<span class="badge" style="background:#EFF6FF; color:#1D4ED8; border:1px solid #BFDBFE; font-weight:700; font-size:10.5px; padding:2px 6px; border-radius:4px;">Bak</span>`;
    
    const hasPhoto = Boolean(st.photo_url);

    return `
      <div class="student-photo-card" onclick="showStudentDetailsModal('${st.id}')">
        <!-- FOTOSURAT FREYMI: Bosilganda katta rasm xatosiz ochiladi -->
        <div class="student-card-photo-wrap" ${hasPhoto ? `onclick="event.stopPropagation(); previewStudentPhoto('${st.id}')" title="Kattalashtirib ko'rish uchun bosing"` : `onclick="event.stopPropagation(); showStudentDetailsModal('${st.id}')" title="Fotosurat biriktirish"`} style="cursor: pointer;">
          ${hasPhoto ? `
            <img src="${st.photo_url}" alt="${st.first_name || ''}" class="student-card-img" loading="lazy">
          ` : `
            <div class="student-card-no-photo">
              <span class="no-photo-initials ${isFemale ? 'female' : ''}">${initials || 'ST'}</span>
              <span class="no-photo-label">Fotosurat yo'q</span>
            </div>
          `}
          <div class="card-badges-top">
            ${levelBadgeHtml}
            <span class="badge badge-course" style="font-size: 10px; padding: 2px 6px; background:#0F172A; color:#FFF; font-weight:700;">${st.course || 1}-k</span>
          </div>
          <div class="card-badges-bottom">
            <span class="badge badge-group" style="font-size: 10.5px; padding: 2px 6px; background:#1E293B; color:#FFF; font-weight:700;">${st.group_code || '-'}</span>
            <span class="card-status-dot ${isActive ? 'active' : 'inactive'}" title="${isActive ? 'Faol' : 'Nofaol'}"></span>
          </div>
        </div>

        <div class="student-card-body">
          <div class="student-card-name" title="${st.first_name} ${st.last_name}">
            ${st.first_name} ${st.last_name}
          </div>
          <div class="student-card-id-row">
            <span class="student-id-pill">ID: <strong>${st.external_id || '-'}</strong></span>
            <span class="student-gender-pill ${isFemale ? 'female' : 'male'}">${isFemale ? 'Ayol' : 'Erkak'}</span>
          </div>

          <div class="student-card-meta">
            <div class="meta-item">
              <span class="meta-label">Tel:</span>
              <span class="meta-val" title="${st.phone || '-'}">${st.phone ? st.phone.replace('+998', '') : '-'}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Ball:</span>
              <span class="meta-val meta-score">${st.season || st.total || 0}</span>
            </div>
          </div>

          <div class="student-card-actions" onclick="event.stopPropagation()">
            ${hasPhoto ? `
              <button class="btn-card-action btn-action-primary" onclick="previewStudentPhoto('${st.id}')" title="Fotosuratni katta freymda ko'rish" style="flex: 1;">
                ${icon('image', 13)} <span>Rasm</span>
              </button>
              <button class="btn-card-action" onclick="downloadSingleStudentPhoto('${st.id}')" title="Fotosuratni yuklab olish" style="flex: 0 0 32px; padding: 4px; justify-content: center;">
                ${icon('download', 13)}
              </button>
            ` : `
              <button class="btn-card-action btn-action-primary" onclick="showStudentDetailsModal('${st.id}')" title="Fotosurat biriktirish" style="flex: 1;">
                ${icon('plus', 13)} <span>Rasm qo'shish</span>
              </button>
            `}
            <button class="btn-card-action" onclick="showEditStudentModal('${st.id}')" title="Talaba ma'lumotlarini tahrirlash" style="flex: 0 0 32px; padding: 4px; justify-content: center;">
              ${icon('edit', 14)}
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderAdminStudentsTable(students) {
  const tbody = document.getElementById('admin-students-table-body');
  if (!tbody) return;

  if (students.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align: center; padding: 48px; color: var(--text-muted);">
          <div style="font-size: 32px; color: #94A3B8; margin-bottom: 8px;">${icon('users', 32)}</div>
          <p style="font-size: 14px; font-weight: 600; color: var(--text-main);">Talabalar topilmadi</p>
          <p style="font-size: 12px; margin-top: 4px;">Qidiruv yoki filtr mezonlarini o'zgartiring.</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = students.map(st => {
    const isFemale = st.gender === 'female' || st.gender === 'f';
    const initials = `${(st.first_name || '').charAt(0)}${(st.last_name || '').charAt(0)}`.toUpperCase();
    const isActive = st.status === 'active';
    const isMag = st.level === 'mag';
    const levelBadgeHtml = isMag
      ? `<span class="badge" style="background:#F5F3FF; color:#7C3AED; border:1px solid #DDD6FE; font-weight:700; font-size:11.5px; padding:3px 8px; border-radius:6px;">Magistratura</span>`
      : `<span class="badge" style="background:#EFF6FF; color:#2563EB; border:1px solid #BFDBFE; font-weight:700; font-size:11.5px; padding:3px 8px; border-radius:6px;">Bakalavriat</span>`;
    
    const hasPhoto = Boolean(st.photo_url);

    const photoHtml = hasPhoto
      ? `<img src="${st.photo_url}" class="avatar-badge" style="object-fit: cover; border: 1.5px solid #3B82F6; width: 40px; height: 40px; border-radius: 8px; cursor: pointer; transition: transform 0.15s ease;" onclick="event.stopPropagation(); previewStudentPhoto('${st.id}')" alt="${st.first_name || ''}" title="Kattalashtirib ko'rish">`
      : `<span class="avatar-badge ${isFemale ? 'female' : ''}" style="width: 40px; height: 40px; border-radius: 8px;">${initials || 'ST'}</span>`;

    return `
      <tr class="student-table-row" onclick="showStudentDetailsModal('${st.id}')" style="cursor: pointer;" title="Profilni ko'rish uchun bosing">
        <td>
          ${photoHtml}
        </td>
        <td>
          <span class="badge badge-group" style="letter-spacing: 0.5px;">${st.external_id || '-'}</span>
        </td>
        <td>
          <div style="font-weight: 600; color: var(--text-main); font-size: 13px;">${st.first_name} ${st.last_name}</div>
          <div class="table-sub-text">${st.email || 'Email yo\'q'}</div>
        </td>
        <td>
          <div style="font-weight: 600; font-size: 12px;">${st.group_code || '-'}</div>
          <div class="table-sub-text">${st.program_code || 'IT'}</div>
        </td>
        <td>
          ${levelBadgeHtml}
        </td>
        <td>
          <span class="badge badge-course">${st.course || 1}-kurs</span>
        </td>
        <td>
          <div style="display: flex; align-items: center; gap: 6px; font-size: 12px;">
            <span style="color: #64748B;">${icon('phone', 12)}</span>
            <span>${st.phone || '-'}</span>
          </div>
        </td>
        <td>
          <div style="font-weight: 700; color: #1E3A8A; font-size: 13px;">${st.season || st.total || 0}</div>
          <div class="table-sub-text">Jami: ${st.total || 0}</div>
        </td>
        <td>
          <span class="status-badge ${isActive ? 'badge-active' : 'badge-inactive'}">
            ${isActive ? 'Faol' : 'Nofaol'}
          </span>
        </td>
        <td style="text-align: right;" onclick="event.stopPropagation()">
          <div style="display: inline-flex; gap: 4px; justify-content: flex-end;">
            ${hasPhoto ? `
              <button class="btn-action" onclick="downloadSingleStudentPhoto('${st.id}')" title="Rasmni yuklab olish">
                ${icon('download', 14)}
              </button>
            ` : ''}
            <button class="btn-action btn-action-primary" onclick="showEditStudentModal('${st.id}')" title="Tahrirlash">
              ${icon('edit', 14)}
            </button>
            <button class="btn-action ${isActive ? 'btn-action-warning' : 'btn-action-primary'}" onclick="toggleStudentStatus('${st.id}', '${st.status}')" title="${isActive ? 'Nofaol qilish' : 'Faollashtirish'}">
              ${isActive ? icon('pause', 13) : icon('play', 13)}
            </button>
            <button class="btn-action" onclick="showStudentDetailsModal('${st.id}')" title="Profilni ko'rish">
              ${icon('eye', 14)}
            </button>
            <button class="btn-action btn-action-danger" onclick="deleteStudentConfirm('${st.id}', '${st.first_name} ${st.last_name}')" title="O'chirish">
              ${icon('trash', 14)}
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// YANGI TALABA QO'SHISH MODALI
function showCreateStudentModal() {
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalFooter = document.getElementById('modal-footer');

  modalTitle.innerHTML = `<span style="display:flex; align-items:center; gap:8px;">${icon('userPlus', 18)} Yangi Talaba Qo'shish</span>`;
  modalBody.innerHTML = `
    <form id="create-student-form">
      <div class="grid grid-2 mb-3">
        <div class="form-group">
          <label class="form-label">Talaba ID (External ID) *</label>
          <input type="text" id="new-std-external-id" class="form-control" placeholder="Masalan: AE1126333" required>
        </div>
        <div class="form-group">
          <label class="form-label">Guruh Kodi *</label>
          <input type="text" id="new-std-group" class="form-control" placeholder="Masalan: FMC04" required>
        </div>
      </div>

      <div class="grid grid-2 mb-3">
        <div class="form-group">
          <label class="form-label">Ismi *</label>
          <input type="text" id="new-std-first-name" class="form-control" placeholder="Ismi" required>
        </div>
        <div class="form-group">
          <label class="form-label">Familiyasi *</label>
          <input type="text" id="new-std-last-name" class="form-control" placeholder="Familiyasi" required>
        </div>
      </div>

      <div class="grid grid-3 mb-3">
        <div class="form-group">
          <label class="form-label">Ta'lim Yo'nalishi</label>
          <input type="text" id="new-std-program" class="form-control" placeholder="Masalan: Sun'iy intellekt">
        </div>
        <div class="form-group">
          <label class="form-label">Ta'lim Bosqichi</label>
          <select id="new-std-level" class="form-select">
            <option value="bak">Bakalavriat</option>
            <option value="mag">Magistratura</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Kursi</label>
          <select id="new-std-course" class="form-select">
            <option value="1">1-kurs</option>
            <option value="2">2-kurs</option>
            <option value="3">3-kurs</option>
            <option value="4">4-kurs</option>
          </select>
        </div>
      </div>

      <div class="grid grid-2 mb-3">
        <div class="form-group">
          <label class="form-label">Jinsi</label>
          <select id="new-std-gender" class="form-select">
            <option value="m">Erkak (O'g'il bola)</option>
            <option value="f">Ayol (Qiz bola)</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Telefon Raqami</label>
          <input type="text" id="new-std-phone" class="form-control" placeholder="+998901234567 yoki 901234567">
        </div>
      </div>

      <div class="grid grid-2 mb-2">
        <div class="form-group">
          <label class="form-label">Email Manzili (Ixtiyoriy)</label>
          <input type="email" id="new-std-email" class="form-control" placeholder="student@akhu.uz">
        </div>
        <div class="form-group">
          <label class="form-label">Talaba Rasmi (Ixtiyoriy)</label>
          <input type="file" id="new-std-photo" accept="image/*" class="form-control" style="padding: 5px;">
        </div>
      </div>
    </form>
  `;

  modalFooter.innerHTML = `
    <button class="btn btn-outline" onclick="closeModal()">Bekor Qilish</button>
    <button class="btn btn-primary" onclick="handleCreateStudentSubmit()" style="display:inline-flex; align-items:center; gap:6px;">
      ${icon('check', 14)} Saqlash
    </button>
  `;

  openModal();
}

/**
 * Talaba telefon raqamini tozalash va standart formatga keltirish
 * 1. '+' bilan kiritilgan raqamlar (O'zbekiston yoki chet el): hech qanday affiks qo'shilmaydi, oraliq belgilar tozalanadi.
 * 2. 9 ta raqam (+ siz): O'zbekiston kodi +998 qo'shiladi.
 */
function normalizeStudentPhone(raw) {
  if (!raw) return '';
  const str = String(raw).trim();
  if (!str) return '';
  const startsWithPlus = str.startsWith('+');
  const digitsOnly = str.replace(/\D/g, '');
  if (!digitsOnly) return '';

  if (startsWithPlus) {
    return '+' + digitsOnly;
  }
  if (digitsOnly.length === 9) {
    return '+998' + digitsOnly;
  }
  if (digitsOnly.length === 12 && digitsOnly.startsWith('998')) {
    return '+' + digitsOnly;
  }
  if (digitsOnly.length > 9) {
    return '+' + digitsOnly;
  }
  return '+' + digitsOnly;
}

async function handleCreateStudentSubmit() {
  const external_id = document.getElementById('new-std-external-id')?.value.trim();
  const group_code = document.getElementById('new-std-group')?.value.trim();
  const first_name = document.getElementById('new-std-first-name')?.value.trim();
  const last_name = document.getElementById('new-std-last-name')?.value.trim();
  const program_code = document.getElementById('new-std-program')?.value.trim() || 'IT';
  const level = document.getElementById('new-std-level')?.value || 'bak';
  const course = Number(document.getElementById('new-std-course')?.value || 1);
  const gender = document.getElementById('new-std-gender')?.value || 'm';
  const rawPhone = document.getElementById('new-std-phone')?.value.trim();
  const phone = normalizeStudentPhone(rawPhone);
  const email = document.getElementById('new-std-email')?.value.trim();

  if (!external_id || !group_code || !first_name || !last_name) {
    showToast("Talaba ID, Guruh, Ism va Familiya to'ldirilishi shart!", "warning");
    return;
  }

  try {
    const res = await apiFetch('/api/admin/students', {
      method: 'POST',
      body: JSON.stringify({
        external_id, group_code, first_name, last_name,
        program_code, level, course, gender, phone, email
      })
    });

    const photoInput = document.getElementById('new-std-photo');
    if (photoInput && photoInput.files && photoInput.files.length > 0 && res.student_id) {
      const formData = new FormData();
      formData.append('photo', photoInput.files[0]);
      await fetch(`/api/admin/students/${res.student_id}/photo`, {
        method: 'POST',
        headers: { 'x-user-id': AppState.user.id },
        body: formData
      });
    }

    closeModal();
    showToast('Talaba muvaffaqiyatli saqlandi!');
    await loadAdminStudentsList();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// TAHRIRLASH MODALI
async function showEditStudentModal(studentId) {
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalFooter = document.getElementById('modal-footer');

  modalTitle.innerHTML = `<span style="display:flex; align-items:center; gap:8px;">${icon('edit', 18)} Talaba Ma'lumotlarini Tahrirlash</span>`;
  modalBody.innerHTML = `<div style="text-align:center; padding:30px;"><div class="spinner"></div><p style="margin-top:8px;">Yuklanmoqda...</p></div>`;
  modalFooter.innerHTML = `<button class="btn btn-outline" onclick="closeModal()">Yopish</button>`;
  openModal();

  try {
    // 1. Birinchi navbatda talabani xotiradan (cached items) topamiz
    let st = (adminStudentsState.items || []).find(s => String(s.id) === String(studentId) || String(s.external_id) === String(studentId));
    if (!st && window.tutorStudentsCache) {
      st = window.tutorStudentsCache.find(s => String(s.id) === String(studentId) || String(s.external_id) === String(studentId));
    }

    const isSuperadmin = Boolean(
      AppState.user && (
        AppState.user.id === 'superadmin' ||
        (Array.isArray(AppState.user.roles) && AppState.user.roles.includes('superadmin'))
      )
    );

    let tutors = [];
    if (isSuperadmin) {
      try {
        const tutRes = await apiFetch('/api/admin/tutors');
        tutors = tutRes.tutors || [];
      } catch(e) {
        console.warn('Tutors fetch warning:', e);
      }
    }

    // Serverdan yangilangan talaba ma'lumotlarini tortish
    try {
      const data = await apiFetch(`/api/admin/students/${encodeURIComponent(studentId)}`);
      if (data && data.student) {
        st = { ...(st || {}), ...data.student };
      }
    } catch (netErr) {
      console.warn('Serverdan talaba profilini yuklashda xatolik, keshdan foydalanilmoqda:', netErr);
      if (!st) {
        throw new Error("Talaba ma'lumotlarini yuklab bo'lmadi (" + netErr.message + ")");
      }
    }

    if (!st) {
      throw new Error("Talaba tizimda topilmadi");
    }

    const isFemale = st.gender === 'female' || st.gender === 'f';
    const initials = `${(st.first_name || '').charAt(0)}${(st.last_name || '').charAt(0)}`.toUpperCase();
    const avatarHtml = st.photo_url
      ? `<img src="${st.photo_url}" style="width: 56px; height: 56px; border-radius: 50%; object-fit: contain; background:#F1F5F9; border: 2px solid #2563EB;" alt="${st.first_name}">`
      : `<span class="avatar-badge ${isFemale ? 'female' : ''}" style="width: 56px; height: 56px; font-size: 20px;">${initials}</span>`;

    modalBody.innerHTML = `
      <form id="edit-student-form" onsubmit="event.preventDefault(); handleEditStudentSubmit('${st.id}');">
        <!-- Fotosurat yuklash / almashtirish -->
        <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 16px; padding: 12px; background: #F8FAFC; border-radius: 8px; border: 1px solid var(--border-light);">
          <div id="edit-std-photo-preview-wrap">
            ${avatarHtml}
          </div>
          <div style="flex: 1;">
            <label class="form-label" style="font-weight: 600; margin-bottom: 4px;">Talaba Fotosurati (Profil Rasmi)</label>
            <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
              <input type="file" id="edit-std-photo-file" accept="image/*" style="display: none;" onchange="handleStudentEditPhotoSelect('${st.id}', this)">
              <button type="button" class="btn btn-outline btn-sm" onclick="document.getElementById('edit-std-photo-file').click()" style="display: inline-flex; align-items: center; gap: 5px; background: white; font-size: 12px;">
                ${icon('upload', 13)} <span>Kompyuterdan Rasm Tanlash</span>
              </button>
              <input type="hidden" id="edit-std-photourl" value="${st.photo_url || ''}">
              ${st.photo_url ? `
                <button type="button" class="btn btn-outline btn-sm text-danger" onclick="removeStudentPhotoInEdit('${st.id}')" style="padding: 4px 8px; font-size: 11px; border-color: #FCA5A5;">
                  Rasmni O'chirish
                </button>
              ` : ''}
            </div>
            <small class="text-muted" style="font-size: 11px;">Rasm tanlanganda avtomatik ravishda yuklanadi</small>
          </div>
        </div>

        <div class="grid grid-2 mb-3">
          <div class="form-group">
            <label class="form-label">Talaba ID (External ID) *</label>
            <input type="text" id="edit-std-external-id" class="form-control" value="${st.external_id || ''}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Guruh Kodi *</label>
            <input type="text" id="edit-std-group" class="form-control" value="${st.group_code || ''}" required>
          </div>
        </div>

        <div class="grid grid-2 mb-3">
          <div class="form-group">
            <label class="form-label">Ismi *</label>
            <input type="text" id="edit-std-first-name" class="form-control" value="${st.first_name || ''}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Familiyasi *</label>
            <input type="text" id="edit-std-last-name" class="form-control" value="${st.last_name || ''}" required>
          </div>
        </div>

        <div class="grid grid-3 mb-3">
          <div class="form-group">
            <label class="form-label">Ta'lim Yo'nalishi</label>
            <input type="text" id="edit-std-program" class="form-control" value="${st.program_code || ''}">
          </div>
          <div class="form-group">
            <label class="form-label">Ta'lim Bosqichi</label>
            <select id="edit-std-level" class="form-select">
              <option value="bak" ${st.level !== 'mag' ? 'selected' : ''}>Bakalavriat</option>
              <option value="mag" ${st.level === 'mag' ? 'selected' : ''}>Magistratura</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Kursi</label>
            <select id="edit-std-course" class="form-select">
              <option value="1" ${st.course == 1 ? 'selected' : ''}>1-kurs</option>
              <option value="2" ${st.course == 2 ? 'selected' : ''}>2-kurs</option>
              <option value="3" ${st.course == 3 ? 'selected' : ''}>3-kurs</option>
              <option value="4" ${st.course == 4 ? 'selected' : ''}>4-kurs</option>
            </select>
          </div>
        </div>

        <div class="grid grid-2 mb-3">
          <div class="form-group">
            <label class="form-label">Jinsi</label>
            <select id="edit-std-gender" class="form-select">
              <option value="m" ${(st.gender === 'm' || st.gender === 'male') ? 'selected' : ''}>Erkak</option>
              <option value="f" ${(st.gender === 'f' || st.gender === 'female') ? 'selected' : ''}>Ayol</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Telefon Raqami</label>
            <input type="text" id="edit-std-phone" class="form-control" value="${st.phone || ''}" placeholder="+998901234567 yoki 901234567">
          </div>
        </div>

        <div class="grid grid-2 mb-3">
          <div class="form-group">
            <label class="form-label">Holati</label>
            <select id="edit-std-status" class="form-select">
              <option value="active" ${st.status === 'active' ? 'selected' : ''}>Faol (Active)</option>
              <option value="left" ${st.status === 'left' ? 'selected' : ''}>Nofaol (Left)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Email Manzili</label>
            <input type="email" id="edit-std-email" class="form-control" value="${st.email || ''}">
          </div>
        </div>

        ${isSuperadmin ? `
          <div class="form-group mb-3">
            <label class="form-label" style="font-weight: 600;">Biriktirilgan Tyutor (Mas'ul)</label>
            <select id="edit-std-tutor" class="form-select">
              <option value="">-- Tyutor biriktirilmagan --</option>
              ${tutors.map(t => `<option value="${t.id}" ${String(st.tutor_id) === String(t.id) ? 'selected' : ''}>${t.full_name} (${(t.groups || []).join(', ') || t.id})</option>`).join('')}
            </select>
          </div>
        ` : ''}
      </form>
    `;

    modalFooter.innerHTML = `
      <button class="btn btn-outline" onclick="closeModal()">Bekor Qilish</button>
      <button class="btn btn-primary" onclick="handleEditStudentSubmit('${st.id}')" style="display:inline-flex; align-items:center; gap:6px;">
        ${icon('check', 14)} Saqlash
      </button>
    `;

  } catch (err) {
    modalBody.innerHTML = `
      <div style="padding: 24px; text-align: center;">
        <div style="font-size: 32px; color: var(--danger); margin-bottom: 8px;">⚠️</div>
        <p style="font-size: 14px; font-weight: 700; color: var(--danger); margin-bottom: 4px;">Talaba ma'lumotlarini yuklashda xatolik yuz berdi</p>
        <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 14px;">${err.message}</p>
        <button class="btn btn-primary btn-sm" onclick="showEditStudentModal('${studentId}')" style="display: inline-flex; align-items: center; gap: 6px;">
          ${icon('refresh', 13)} Qayta Urinish
        </button>
      </div>
    `;
    modalFooter.innerHTML = `<button class="btn btn-outline" onclick="closeModal()">Yopish</button>`;
  }
}

async function handleStudentEditPhotoSelect(studentId, input) {
  const file = input.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('photo', file);

  try {
    const res = await fetch(`/api/admin/students/${encodeURIComponent(studentId)}/photo`, {
      method: 'POST',
      headers: { 'x-user-id': (AppState.user && AppState.user.id) ? AppState.user.id : 'superadmin' },
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Rasm yuklashda xatolik yuz berdi');

    const previewWrap = document.getElementById('edit-std-photo-preview-wrap');
    if (previewWrap && data.photo_url) {
      previewWrap.innerHTML = `<img src="${data.photo_url}" style="width: 56px; height: 56px; border-radius: 50%; object-fit: contain; background:#F1F5F9; border: 2px solid #2563EB;" alt="Foto">`;
    }
    const urlInp = document.getElementById('edit-std-photourl');
    if (urlInp) urlInp.value = data.photo_url;

    showToast("Fotosurat muvaffaqiyatli yuklandi!", "success");
  } catch (err) {
    showToast("Xatolik: " + err.message, "error");
  }
}

async function removeStudentPhotoInEdit(studentId) {
  if (!confirm("Talaba fotosuratini o'chirmoqchimisiz?")) return;
  try {
    const res = await fetch(`/api/admin/students/${encodeURIComponent(studentId)}/photo`, {
      method: 'DELETE',
      headers: { 'x-user-id': (AppState.user && AppState.user.id) ? AppState.user.id : 'superadmin' }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Rasmni o'chirishda xatolik");

    const previewWrap = document.getElementById('edit-std-photo-preview-wrap');
    if (previewWrap) {
      previewWrap.innerHTML = `<span class="avatar-badge" style="width: 56px; height: 56px; font-size: 20px;">👤</span>`;
    }
    const urlInp = document.getElementById('edit-std-photourl');
    if (urlInp) urlInp.value = '';
    showToast("Fotosurat olib tashlandi!", "info");
  } catch (err) {
    showToast("Xatolik: " + err.message, "error");
  }
}

async function handleEditStudentSubmit(studentId) {
  const external_id = document.getElementById('edit-std-external-id')?.value.trim();
  const group_code = document.getElementById('edit-std-group')?.value.trim();
  const first_name = document.getElementById('edit-std-first-name')?.value.trim();
  const last_name = document.getElementById('edit-std-last-name')?.value.trim();
  const program_code = document.getElementById('edit-std-program')?.value.trim();
  const level = document.getElementById('edit-std-level')?.value || 'bak';
  const course = Number(document.getElementById('edit-std-course')?.value || 1);
  const gender = document.getElementById('edit-std-gender')?.value;
  const rawPhone = document.getElementById('edit-std-phone')?.value.trim();
  const phone = normalizeStudentPhone(rawPhone);
  const email = document.getElementById('edit-std-email')?.value.trim();
  const status = document.getElementById('edit-std-status')?.value;
  const tutorSelectEl = document.getElementById('edit-std-tutor');
  const tutor_id = tutorSelectEl ? (tutorSelectEl.value || null) : undefined;
  const photo_url = document.getElementById('edit-std-photourl')?.value || undefined;

  const payload = {
    external_id, group_code, first_name, last_name,
    program_code, level, course, gender, phone, email, status, photo_url
  };
  if (tutor_id !== undefined) {
    payload.tutor_id = tutor_id;
  }

  const submitBtn = document.querySelector('#common-modal .modal-footer .btn-primary');
  const originalBtnHtml = submitBtn ? submitBtn.innerHTML : null;
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `Saqlanmoqda...`;
  }

  try {
    const res = await apiFetch(`/api/admin/students/${encodeURIComponent(studentId)}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });

    closeModal();
    showToast("Talaba ma'lumotlari muvaffaqiyatli saqlandi!", "success");

    // Local items cache ni darhol yangilash
    if (adminStudentsState.items) {
      const idx = adminStudentsState.items.findIndex(s => String(s.id) === String(studentId) || String(s.external_id) === String(studentId));
      if (idx !== -1) {
        adminStudentsState.items[idx] = {
          ...adminStudentsState.items[idx],
          ...payload,
          ...(res.student || {})
        };
        renderAdminStudentsCards(adminStudentsState.items);
        renderAdminStudentsTable(adminStudentsState.items);
      }
    }

    // Tyutor kabinetidagi talabalar ro'yxati ochiq bo'lsa darhol yangilash
    const tutorTbody = document.getElementById('tutor-students-tbody');
    if (tutorTbody) {
      try {
        const studRes = await apiFetch('/api/tutor/students');
        window.tutorStudentsCache = studRes.students || [];
        if (typeof handleTutorStudentFilter === 'function') {
          handleTutorStudentFilter();
        } else {
          tutorTbody.innerHTML = renderTutorTableRowsHtml(window.tutorStudentsCache);
        }
      } catch (e) {}
    }

    // Admin talabalar ro'yxati ochiq bo'lsa ro'yxatni serverdan yangilash
    if (typeof loadAdminStudentsList === 'function' && (document.getElementById('admin-students-cards-grid') || document.getElementById('admin-students-table-body'))) {
      try { await loadAdminStudentsList(); } catch (e) {}
    }
  } catch (err) {
    if (submitBtn && originalBtnHtml) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHtml;
    }
    showToast("Xatolik: " + err.message, "error");
  }
}

// TALABA HOLATINI O'ZGARTIRISH (TOGGLE)
async function toggleStudentStatus(studentId, currentStatus) {
  const newStatus = currentStatus === 'active' ? 'left' : 'active';
  const label = newStatus === 'active' ? 'faollashtirilsinmi' : 'nofaol qilinsinmi';

  if (!confirm(`Talaba holati ${label}?`)) return;

  try {
    await apiFetch(`/api/admin/students/${studentId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status: newStatus })
    });
    await loadAdminStudentsList();
  } catch (err) {
    alert(err.message);
  }
}

// TALABANI O'CHIRISH
async function deleteStudentConfirm(studentId, fullName) {
  if (!confirm(`Haqiqatan ham talaba "${fullName}" bazadan o'chirilsinmi?\nUning barcha ballari va yozuvlari tozalanadi!`)) {
    return;
  }

  try {
    await apiFetch(`/api/admin/students/${studentId}`, {
      method: 'DELETE'
    });
    alert("Talaba muvaffaqiyatli o'chirildi");
    await loadAdminStudentsList();
  } catch (err) {
    alert(err.message);
  }
}

// BARCHA TALABALARNI TOZALASH
async function handleClearAllStudents() {
  const confirmText = prompt('DIQQAT! Barcha talabalarni va ularning ballarini tozalash uchun "TOZALASH" deb yozing:');
  if (confirmText !== 'TOZALASH') {
    if (confirmText !== null) alert("Tasdiqlash so'zi noto'g'ri kiritildi. Operatsiya bekor qilindi.");
    return;
  }

  try {
    const res = await apiFetch('/api/admin/students/clear-all', {
      method: 'POST'
    });
    alert(res.message || 'Barcha talabalar bazasi tozalandi!');
    await loadAdminStudentsList();
  } catch (err) {
    alert(err.message);
  }
}

// TALABA BATAFSIL PROFILINI KO'RISH VA RASM BOSHQARUVI
let currentActiveStudentModalId = null;
window.currentModalPasteHandler = null;

async function showStudentDetailsModal(studentId) {
  currentActiveStudentModalId = studentId;
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalFooter = document.getElementById('modal-footer');

  // Avvalgi paste hodisasini tozalash
  if (window.currentModalPasteHandler) {
    window.removeEventListener('paste', window.currentModalPasteHandler);
    window.currentModalPasteHandler = null;
  }

  modalTitle.innerHTML = `<span style="display:flex; align-items:center; gap:8px;">${icon('user', 18)} Talaba Profili & Rasm Boshqaruvi</span>`;
  modalBody.innerHTML = `<div style="text-align:center; padding:30px;"><div class="spinner"></div><p style="margin-top:8px;">Yuklanmoqda...</p></div>`;
  modalFooter.innerHTML = `
    <button class="btn btn-outline" onclick="closeStudentModalCleanly()">Yopish</button>
    <button class="btn btn-primary" onclick="showEditStudentModal('${studentId}')" style="display:inline-flex; align-items:center; gap:6px;">
      ${icon('edit', 14)} Tahrirlash
    </button>
  `;
  openModal();

  try {
    const data = await apiFetch(`/api/admin/students/${studentId}`);
    const st = data.student;
    const entries = data.entries || [];

    const isFemale = st.gender === 'female' || st.gender === 'f';
    const initials = `${(st.first_name || '').charAt(0)}${(st.last_name || '').charAt(0)}`.toUpperCase();

    const avatarHtml = st.photo_url
      ? `<img id="detail-modal-avatar-img" src="${st.photo_url}" style="width: 76px; height: 76px; border-radius: 50%; object-fit: cover; border: 3px solid #2563EB; box-shadow: 0 4px 12px rgba(37,99,235,0.2);" alt="${st.first_name}">`
      : `<span id="detail-modal-avatar-placeholder" class="avatar-badge ${isFemale ? 'female' : ''}" style="width: 76px; height: 76px; font-size: 26px; border: 3px solid #DBEAFE;">${initials}</span>`;

    modalBody.innerHTML = `
      <!-- TALABA BOSHLANG'ICH BLOKI VA AVATAR -->
      <div style="display: flex; align-items: center; gap: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--border-light); margin-bottom: 16px;">
        <div id="detail-avatar-container" style="flex-shrink: 0;">
          ${avatarHtml}
        </div>
        <div style="flex: 1;">
          <h3 style="font-size: 18px; font-weight: 700; color: var(--text-main); margin-bottom: 5px;">${st.first_name} ${st.last_name}</h3>
          <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
            <span class="badge badge-group">${st.external_id}</span>
            <span class="badge" style="background:#EFF6FF; color:#2563EB; border:1px solid #BFDBFE; font-weight:700;">${st.level === 'mag' ? 'Magistratura' : 'Bakalavriat'}</span>
            <span class="badge badge-course">${st.course}-kurs • ${st.group_code}</span>
            <span class="status-badge ${st.status === 'active' ? 'badge-active' : 'badge-inactive'}">${st.status === 'active' ? 'Faol' : 'Nofaol'}</span>
          </div>
        </div>
      </div>

      <!-- RASM YUKLASH VA CTRL+V PASTE BLOKI -->
      <div class="card mb-3" style="background: #F8FAFC; border: 1px solid #DBEAFE; padding: 14px 16px; border-radius: var(--radius-md);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 13px; font-weight: 700; color: #1E3A8A; display: flex; align-items: center; gap: 6px;">
            ${icon('upload', 15)} Talaba Rasmini Biriktirish (Fayl yuklash yoki nusxalab tashlash)
          </span>
          <div id="photo-remove-btn-container">
            ${st.photo_url ? `
              <button class="btn btn-outline btn-sm" onclick="handleDeleteStudentPhoto('${st.id}')" style="color: #DC2626; border-color: #FECACA; font-size: 11.5px; padding: 3px 8px;">
                ${icon('trash', 12)} Rasmni O'chirish
              </button>
            ` : ''}
          </div>
        </div>
        
        <div id="student-photo-dropzone" class="upload-dropzone" style="padding: 16px 12px; background: #FFFFFF; border: 2px dashed #93C5FD; border-radius: 8px; cursor: pointer; text-align: center; transition: all 0.2s ease;">
          <div style="color: #2563EB; margin-bottom: 4px;">${icon('upload', 22)}</div>
          <div style="font-size: 12.5px; font-weight: 600; color: var(--text-main);">
            Faylni tanlang, sudrab tashlang yoki <span style="color: #2563EB; background: #EFF6FF; padding: 1px 6px; border-radius: 4px; border: 1px solid #BFDBFE;">Ctrl+V</span> bilan rasmni joylashtiring
          </div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
            JPG, PNG yoki WebP formatidagi rasm (maksimal 10MB)
          </div>
          <input type="file" id="modal-photo-file-input" accept="image/*" style="display: none;">
        </div>
        <div id="photo-upload-status" style="margin-top: 8px; display: none;"></div>
      </div>

      <!-- TALABA ASOSIY MA'LUMOTLARI -->
      <div class="grid grid-2 mb-3" style="font-size: 13px; background: white; padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--border-light);">
        <div>
          <p style="margin-bottom: 6px;"><strong>Yo'nalishi:</strong> ${st.program_code || '-'}</p>
          <p style="margin-bottom: 6px;"><strong>Tyutor:</strong> ${st.tutor_name || 'Biriktirilmagan'}</p>
          <p style="margin-bottom: 6px;"><strong>Jinsi:</strong> ${isFemale ? 'Ayol' : 'Erkak'}</p>
        </div>
        <div>
          <p style="margin-bottom: 6px;"><strong>Telefon:</strong> ${st.phone || '-'}</p>
          <p style="margin-bottom: 6px;"><strong>Telegram:</strong> ${st.telegram_user_id ? '<span class="text-success">Ulangan</span>' : '<span class="text-muted">Ulanmagan</span>'}</p>
          <p style="margin-bottom: 6px;"><strong>Mavsumiy Ball:</strong> <strong style="color: #2563EB; font-size: 16px;">${st.season || st.total || 0}</strong></p>
        </div>
      </div>

      <!-- BALLAR TARIXI -->
      <h4 style="font-size: 14px; font-weight: 700; margin: 16px 0 10px; color: var(--text-main);">
        Ballar va Faollik Tarixi (${entries.length} ta yozuv)
      </h4>
      <div style="max-height: 200px; overflow-y: auto;">
        ${entries.length === 0 ? '<p style="color:var(--text-muted); font-size:12px;">Hozircha ball yozuvlari mavjud emas.</p>' : `
          <table class="data-table" style="font-size: 12px;">
            <thead>
              <tr><th>Sana</th><th>Tadbir / Mezon</th><th>Ball</th><th>Holat</th></tr>
            </thead>
            <tbody>
              ${entries.map(e => `
                <tr>
                  <td>${e.event_date || (e.created_at || '').substring(0, 10)}</td>
                  <td>${e.catalog_title || '-'}</td>
                  <td><strong>+${e.points}</strong></td>
                  <td><span class="status-badge status-${e.status}">${e.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `}
      </div>
    `;

    // Dropzone hodisalari
    const dropzone = document.getElementById('student-photo-dropzone');
    const fileInput = document.getElementById('modal-photo-file-input');

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());

      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });
      dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          uploadStudentPhotoFile(studentId, e.dataTransfer.files[0]);
        }
      });

      fileInput.addEventListener('change', () => {
        if (fileInput.files && fileInput.files.length > 0) {
          uploadStudentPhotoFile(studentId, fileInput.files[0]);
        }
      });
    }

    // Clipboard Paste (Ctrl+V) hodisasi
    window.currentModalPasteHandler = (e) => {
      const items = (e.clipboardData || e.originalEvent?.clipboardData)?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            uploadStudentPhotoFile(studentId, file);
            break;
          }
        }
      }
    };
    window.addEventListener('paste', window.currentModalPasteHandler);

  } catch (err) {
    modalBody.innerHTML = `<p class="text-danger">${err.message}</p>`;
  }
}

function closeStudentModalCleanly() {
  if (window.currentModalPasteHandler) {
    window.removeEventListener('paste', window.currentModalPasteHandler);
    window.currentModalPasteHandler = null;
  }
  closeModal();
}

async function uploadStudentPhotoFile(studentId, file) {
  const statusEl = document.getElementById('photo-upload-status');
  if (statusEl) {
    statusEl.style.display = 'block';
    statusEl.innerHTML = `<div style="display:flex; align-items:center; gap:8px; color:#2563EB;"><div class="spinner"></div> Rasm yuklanmoqda...</div>`;
  }

  const formData = new FormData();
  formData.append('photo', file);

  try {
    const res = await fetch(`/api/admin/students/${studentId}/photo`, {
      method: 'POST',
      headers: {
        'x-user-id': AppState.user.id
      },
      body: formData
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Rasm yuklashda xatolik yuz berdi');

    if (statusEl) {
      statusEl.innerHTML = `<div style="color:#059669; font-weight:600;">${icon('checkCircle', 14)} Rasm muvaffaqiyatli saqlandi!</div>`;
    }

    // Avatar rasmini darhol yangilash
    const container = document.getElementById('detail-avatar-container');
    if (container && data.photo_url) {
      container.innerHTML = `<img id="detail-modal-avatar-img" src="${data.photo_url}?t=${Date.now()}" style="width: 76px; height: 76px; border-radius: 50%; object-fit: cover; border: 3px solid #2563EB; box-shadow: 0 4px 12px rgba(37,99,235,0.2);" alt="Talaba">`;
    }

    // O'chirish tugmasini ko'rsatish
    const removeBtnCont = document.getElementById('photo-remove-btn-container');
    if (removeBtnCont) {
      removeBtnCont.innerHTML = `
        <button class="btn btn-outline btn-sm" onclick="handleDeleteStudentPhoto('${studentId}')" style="color: #DC2626; border-color: #FECACA; font-size: 11.5px; padding: 3px 8px;">
          ${icon('trash', 12)} Rasmni O'chirish
        </button>
      `;
    }

    // Ro'yxatdagi jadvalni yangilash
    await loadAdminStudentsList();
  } catch (err) {
    if (statusEl) {
      statusEl.innerHTML = `<div style="color:#DC2626; font-weight:600;">Xatolik: ${err.message}</div>`;
    }
  }
}

async function handleDeleteStudentPhoto(studentId) {
  if (!confirm("Talaba rasmini o'chirishni xohlaysizmi?")) return;

  try {
    await apiFetch(`/api/admin/students/${studentId}/photo`, {
      method: 'DELETE'
    });

    // Avatarni dastlabki holatga qaytarish
    const container = document.getElementById('detail-avatar-container');
    if (container) {
      container.innerHTML = `<span class="avatar-badge" style="width: 76px; height: 76px; font-size: 26px; border: 3px solid #DBEAFE;">ST</span>`;
    }

    const removeBtnCont = document.getElementById('photo-remove-btn-container');
    if (removeBtnCont) removeBtnCont.innerHTML = '';

    const statusEl = document.getElementById('photo-upload-status');
    if (statusEl) {
      statusEl.style.display = 'block';
      statusEl.innerHTML = `<div style="color:#64748B;">Rasm o'chirildi.</div>`;
    }

    await loadAdminStudentsList();
  } catch (err) {
    alert(err.message);
  }
}

// EXCEL YUKLASH TUGMASI HODISASI
async function handleStudentExcelUpload() {
  const fileInput = document.getElementById('import-file-input');
  const resultBox = document.getElementById('import-result-box');
  const btn = document.getElementById('btn-do-import');

  if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
    alert('Iltimos, avval Excel yoki CSV faylini tanlang!');
    return;
  }

  const file = fileInput.files[0];
  const formData = new FormData();
  formData.append('file', file);

  btn.disabled = true;
  btn.innerHTML = `<div class="spinner"></div> <span>Import qilinmoqda...</span>`;
  resultBox.style.display = 'block';
  resultBox.innerHTML = `
    <div style="padding: 12px; background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: var(--radius-md); font-size: 13px; color: #1E3A8A;">
      Fayl serverda tahlil qilinmoqda, iltimos kuting...
    </div>
  `;

  try {
    const res = await fetch('/api/admin/import/students', {
      method: 'POST',
      headers: {
        'x-user-id': AppState.user.id
      },
      body: formData
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Import qilishda server xatosi yuz berdi');

    resultBox.innerHTML = `
      <div style="padding: 16px; background: #ECFDF5; border: 1px solid #A7F3D0; border-radius: var(--radius-md);">
        <h4 style="color: #065F46; margin-bottom: 6px; font-weight: 700; display:flex; align-items:center; gap:6px;">
          ${icon('checkCircle', 16)} ${data.message}
        </h4>
        <div style="font-size: 13px; color: #047857; line-height: 1.6;">
          <div>Jami o'qilgan qatorlar: <strong>${data.total_rows || 0}</strong></div>
          <div>Yangi qo'shilgan talabalar: <strong>${data.inserted || 0}</strong></div>
          <div>Yangilangan talabalar: <strong>${data.updated || 0}</strong></div>
          ${data.errors && data.errors.length > 0 ? `
            <div style="margin-top: 8px; color: #DC2626; font-size: 12px;">
              <strong>Ogohlantirishlar (${data.errors.length} ta):</strong>
              <ul style="padding-left: 18px; margin-top: 4px;">
                ${data.errors.slice(0, 5).map(e => `<li>${e}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    fileInput.value = '';
    await loadAdminStudentsList();
  } catch (err) {
    resultBox.innerHTML = `
      <div style="padding: 14px; background: #FEF2F2; border: 1px solid #FECACA; border-radius: var(--radius-md); font-size: 13px; color: #991B1B;">
        <strong>Xatolik yuz berdi:</strong> ${err.message}
      </div>
    `;
  } finally {
    btn.disabled = false;
    btn.innerHTML = `${icon('upload', 15)} <span>Importni Boshlash</span>`;
  }
}



// ====================================================================
// SAHIFA: XODIMLAR & ROLLAR BOSHQARUVI (SUPERADMIN FULL ACCESS)
// ====================================================================
let adminStaffState = {
  search: '',
  role: '',
  botStatus: '',
  users: []
};

async function renderStaffUsersManagement(container) {
  container.innerHTML = `
    <!-- HERO BANNER -->
    <div class="admin-hero-card">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px;">
        <div>
          <div class="admin-hero-title">
            <span style="color: #F87171;">${icon('shield', 22)}</span>
            <span>Universitet Xodimlari, Rollar & Telegram Bot Nazorati</span>
            <span class="badge" style="background: rgba(248, 113, 113, 0.2); color: #FCA5A5; border: 1px solid rgba(248, 113, 113, 0.4); font-size: 11px;">
              Superadmin Full Access
            </span>
          </div>
          <p class="admin-hero-desc">
            Barcha tizim foydalanuvchilari (Tyutorlar, Bo'lim xodimlari, Registratorlar, Prorektor) reyestri va Telegram bot holati.
            Har bir xodimning botga ulanishi (/start), xabarlarni o'qishi, mute holati va tizimda qilgan barcha amallarini to'liq nazorat qiling.
          </p>
        </div>
        <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
          <button class="btn btn-primary" onclick="showCreateStaffModal()" style="display: inline-flex; align-items: center; gap: 6px;">
            ${icon('userPlus', 14)} <span>Yangi Xodim Qo'shish</span>
          </button>
        </div>
      </div>
    </div>

    <!-- METRIKALAR (6 ta blok) -->
    <div class="metrics-grid mb-4" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap:12px;">
      <div class="stat-card">
        <div class="stat-icon" style="background:#EFF6FF; color:#2563EB;">${icon('users', 20)}</div>
        <div class="stat-data">
          <span class="stat-label">Jami Xodimlar</span>
          <h3 class="stat-val" id="stat-staff-total">-</h3>
          <span class="stat-sub">Barcha ro'yxatdagi</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#ECFDF5; color:#059669;">${icon('checkCircle', 20)}</div>
        <div class="stat-data">
          <span class="stat-label">Faol Xodimlar</span>
          <h3 class="stat-val" id="stat-staff-active">-</h3>
          <span class="stat-sub">Kirish ruxsati bor</span>
        </div>
      </div>
      <div class="stat-card" style="border-left: 3px solid #10B981;">
        <div class="stat-icon" style="background:#ECFDF5; color:#059669; font-size:16px;">🟢</div>
        <div class="stat-data">
          <span class="stat-label">Botda Faol</span>
          <h3 class="stat-val" id="stat-staff-tg-active" style="color:#059669;">-</h3>
          <span class="stat-sub">Start bosgan / Ulangan</span>
        </div>
      </div>
      <div class="stat-card" style="border-left: 3px solid #EF4444;">
        <div class="stat-icon" style="background:#FEF2F2; color:#DC2626; font-size:16px;">🔴</div>
        <div class="stat-data">
          <span class="stat-label">Mute / Bloklangan</span>
          <h3 class="stat-val" id="stat-staff-tg-blocked" style="color:#DC2626;">-</h3>
          <span class="stat-sub">Xabar yetib bormaydi</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#FEF3C7; color:#D97706;">${icon('cap', 20)}</div>
        <div class="stat-data">
          <span class="stat-label">Tyutorlar</span>
          <h3 class="stat-val" id="stat-staff-tutors">-</h3>
          <span class="stat-sub">Guruhlarga biriktirilgan</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#F3E8FF; color:#9333EA;">${icon('building', 20)}</div>
        <div class="stat-data">
          <span class="stat-label">Bo'lim Mas'ullari</span>
          <h3 class="stat-val" id="stat-staff-depts">-</h3>
          <span class="stat-sub">Tasdiqlovchi organlar</span>
        </div>
      </div>
    </div>

    <!-- TOOLBAR -->
    <div class="admin-toolbar">
      <div class="admin-search-box">
        ${icon('search', 16)}
        <input type="text" id="filter-staff-search" class="admin-search-input" placeholder="Ism, login, telefon yoki email bo'yicha qidiruv...">
      </div>
      <div class="admin-filters-group">
        <select id="filter-staff-role" class="admin-filter-select">
          <option value="">Barcha rollar</option>
          <option value="superadmin">Superadmin</option>
          <option value="prorektor">Prorektor</option>
          <option value="tutor">Tyutor</option>
          <option value="dep_yb">Yoshlar bo'limi</option>
          <option value="dep_ob">O'quv bo'limi</option>
          <option value="dep_mb">Ma'naviyat bo'limi</option>
          <option value="dep_ib">Ilmiy bo'lim</option>
          <option value="dep_sb">Sanoat hamkorlik</option>
          <option value="dep_pb">Matbuot (PR)</option>
          <option value="dep_atm">Axborot texnologiyalari markazi</option>
          <option value="dep_xb">Xo'jalik bo'limi</option>
          <option value="dep_iy">Ish yurituvchi</option>
          <option value="observer">Kuzatuvchi</option>
        </select>
        <select id="filter-staff-bot" class="admin-filter-select">
          <option value="">Barcha Telegram holatlari</option>
          <option value="active">🟢 Bot Faol (Start bosgan)</option>
          <option value="blocked">🔴 Mute / Bloklangan</option>
          <option value="not_started">⚪ Start bosmagan</option>
        </select>
        <button class="btn btn-outline btn-sm" onclick="resetStaffFilters()" title="Tozalash" style="display:inline-flex; align-items:center; gap:4px;">
          ${icon('refresh', 13)} Tozalash
        </button>
      </div>
    </div>

    <!-- DATA TABLE -->
    <div class="card">
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Xodim (F.I.Sh & Login)</th>
              <th>Biriktirilgan Rollar</th>
              <th>Tyutor Guruhlari</th>
              <th>Aloqa (Email / Tel)</th>
              <th>Telegram Bot Nazorati</th>
              <th>Tizim Holati</th>
              <th style="text-align: right; width: 150px;">Amallar</th>
            </tr>
          </thead>
          <tbody id="admin-staff-table-body">
            <tr>
              <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-muted);">
                <div class="spinner"></div>
                <p style="margin-top: 8px;">Xodimlar yuklanmoqda...</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Qidiruv va filtrlar
  const searchInput = document.getElementById('filter-staff-search');
  let searchTimer;
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        adminStaffState.search = e.target.value.trim().toLowerCase();
        renderStaffTableRows();
      }, 300);
    });
  }

  const roleSelect = document.getElementById('filter-staff-role');
  if (roleSelect) {
    roleSelect.addEventListener('change', (e) => {
      adminStaffState.role = e.target.value;
      renderStaffTableRows();
    });
  }

  const botSelect = document.getElementById('filter-staff-bot');
  if (botSelect) {
    botSelect.addEventListener('change', (e) => {
      adminStaffState.botStatus = e.target.value;
      renderStaffTableRows();
    });
  }

  await loadStaffUsersList();
}

function resetStaffFilters() {
  adminStaffState.search = '';
  adminStaffState.role = '';
  adminStaffState.botStatus = '';
  const s = document.getElementById('filter-staff-search');
  if (s) s.value = '';
  const r = document.getElementById('filter-staff-role');
  if (r) r.value = '';
  const b = document.getElementById('filter-staff-bot');
  if (b) b.value = '';
  renderStaffTableRows();
}

async function loadStaffUsersList() {
  try {
    const res = await apiFetch('/api/admin/users');
    const users = Array.isArray(res) ? res : (res.users || []);
    adminStaffState.users = Array.isArray(users) ? users : [];

    // Metrikalar
    const total = adminStaffState.users.length;
    const active = adminStaffState.users.filter(u => (u.is_active !== undefined ? Boolean(u.is_active) : (u.active === 1))).length;
    const tgActive = adminStaffState.users.filter(u => (u.bot_status === 'active') || (!u.bot_status && u.telegram_user_id)).length;
    const tgBlocked = adminStaffState.users.filter(u => u.bot_status === 'blocked' || u.bot_status === 'muted').length;
    const tutors = adminStaffState.users.filter(u => (u.roles || []).includes('tutor')).length;
    const depts = adminStaffState.users.filter(u => (u.roles || []).some(r => r.startsWith('dep_'))).length;

    const elTotal = document.getElementById('stat-staff-total');
    const elActive = document.getElementById('stat-staff-active');
    const elTgActive = document.getElementById('stat-staff-tg-active');
    const elTgBlocked = document.getElementById('stat-staff-tg-blocked');
    const elTutors = document.getElementById('stat-staff-tutors');
    const elDepts = document.getElementById('stat-staff-depts');

    if (elTotal) elTotal.textContent = total;
    if (elActive) elActive.textContent = active;
    if (elTgActive) elTgActive.textContent = tgActive;
    if (elTgBlocked) elTgBlocked.textContent = tgBlocked;
    if (elTutors) elTutors.textContent = tutors;
    if (elDepts) elDepts.textContent = depts;

    renderStaffTableRows();
  } catch (err) {
    const tbody = document.getElementById('admin-staff-table-body');
    if (tbody) tbody.innerHTML = `<tr><td colspan="7" class="text-danger" style="text-align:center; padding:20px;">${err.message}</td></tr>`;
  }
}

function renderStaffTableRows() {
  const tbody = document.getElementById('admin-staff-table-body');
  if (!tbody) return;

  let filtered = adminStaffState.users;

  if (adminStaffState.search) {
    const q = adminStaffState.search;
    filtered = filtered.filter(u =>
      (u.full_name || '').toLowerCase().includes(q) ||
      (u.username || '').toLowerCase().includes(q) ||
      (u.passport_id || '').toLowerCase().includes(q) ||
      (u.id || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.phone || '').toLowerCase().includes(q) ||
      (u.telegram_username || '').toLowerCase().includes(q)
    );
  }

  if (adminStaffState.role) {
    filtered = filtered.filter(u => (u.roles || []).includes(adminStaffState.role));
  }

  if (adminStaffState.botStatus) {
    filtered = filtered.filter(u => {
      const bStatus = u.bot_status || (u.telegram_user_id ? 'active' : 'not_started');
      if (adminStaffState.botStatus === 'active') return bStatus === 'active';
      if (adminStaffState.botStatus === 'blocked') return bStatus === 'blocked' || bStatus === 'muted';
      if (adminStaffState.botStatus === 'not_started') return bStatus === 'not_started' || (!u.bot_status && !u.telegram_user_id);
      return true;
    });
  }

  // Muhim: Biriktirilgan rollarga ega xodimlar (Superadmin, Prorektor, Bo'limlar, Tyutorlar) ro'yxatning eng yuqorisida chiqishi shart!
  const getStaffRoleWeight = (u) => {
    const roles = Array.isArray(u.roles) ? u.roles : [];
    if (roles.includes('superadmin')) return 1000;
    if (roles.includes('prorektor')) return 900;
    if (roles.some(r => r.startsWith('dep_'))) return 800;
    if (roles.includes('tutor')) return 700;
    if (roles.includes('observer')) return 600;
    if (roles.some(r => r && r !== 'staff' && r !== 'undefined')) return 500;
    return 0; // Faqat oddiy turniket xodimlari
  };

  filtered = [...filtered].sort((a, b) => {
    const weightDiff = getStaffRoleWeight(b) - getStaffRoleWeight(a);
    if (weightDiff !== 0) return weightDiff;
    return (a.full_name || '').localeCompare(b.full_name || '');
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-muted);">
          <div style="font-size: 28px; margin-bottom: 8px;">${icon('shield', 28)}</div>
          <p style="font-weight: 600;">Xodimlar topilmadi</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(u => {
    const initials = (u.full_name || '').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    const isActive = (u.is_active !== undefined) ? Boolean(u.is_active) : (u.active === 1);
    const groups = u.tutor_groups || u.groups || [];

    const validRoles = (u.roles || []).filter(r => r && r !== 'undefined');
    const roleBadges = validRoles.map(r => {
      let bg = '#F1F5F9', color = '#475569', label = r;
      if (r === 'superadmin') { bg = '#FEF2F2'; color = '#DC2626'; label = 'Superadmin'; }
      else if (r === 'prorektor') { bg = '#F5F3FF'; color = '#7C3AED'; label = 'Prorektor'; }
      else if (r === 'tutor') { bg = '#ECFDF5'; color = '#059669'; label = 'Tyutor'; }
      else if (r === 'dep_yb') { bg = '#EFF6FF'; color = '#2563EB'; label = 'Yoshlar bo\'limi'; }
      else if (r === 'dep_mb') { bg = '#FAF5FF'; color = '#9333EA'; label = 'Ma\'naviyat bo\'limi'; }
      else if (r === 'dep_ob') { bg = '#F0FDF4'; color = '#16A34A'; label = 'O\'quv bo\'limi'; }
      else if (r === 'dep_ib') { bg = '#FFFBEB'; color = '#D97706'; label = 'Ilmiy bo\'lim'; }
      else if (r === 'dep_sb') { bg = '#ECFEFF'; color = '#0891B2'; label = 'Sanoat hamkorlik'; }
      else if (r === 'dep_pb') { bg = '#FDF2F8'; color = '#DB2777'; label = 'Matbuot (PR)'; }
      else if (r === 'dep_atm') { bg = '#E0F2FE'; color = '#0284C7'; label = 'Axborot texnologiyalari markazi'; }
      else if (r === 'dep_xb') { bg = '#FEF3C7'; color = '#D97706'; label = 'Xo\'jalik bo\'limi'; }
      else if (r === 'dep_iy') { bg = '#F5F3FF'; color = '#7C3AED'; label = 'Ish yurituvchi'; }
      else if (r === 'observer') { bg = '#F8FAFC'; color = '#475569'; label = 'Kuzatuvchi (Rektorat)'; }
      return `<span class="badge" style="background:${bg}; color:${color}; margin-right:4px; margin-bottom:4px; border:1px solid rgba(0,0,0,0.08); font-weight: 600;">${label}</span>`;
    }).join('');

    const groupBadges = groups.map(g => `<span class="badge badge-group" style="margin-right:4px;">${g}</span>`).join('') || '<span style="color:#94A3B8; font-size:11px;">-</span>';

    // Telegram bot status badge
    let tgBadge = '';
    const bStatus = u.bot_status || (u.telegram_user_id ? 'active' : 'not_started');
    if (bStatus === 'active') {
      tgBadge = `
        <span class="badge" style="background:#ECFDF5; color:#059669; border:1px solid #A7F3D0; font-weight:700; display:inline-flex; align-items:center; gap:4px; font-size:11.5px;">
          <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#10B981;"></span> Bot Faol
        </span>
        <div style="font-size:11px; color:#475569; margin-top:3px;">
          ${u.telegram_username ? `<span style="color:#0284C7; font-weight:600;">@${u.telegram_username.replace(/^@/, '')}</span>` : (u.telegram_user_id ? `ID: <code>${u.telegram_user_id}</code>` : '')}
        </div>
      `;
    } else if (bStatus === 'blocked' || bStatus === 'muted') {
      tgBadge = `
        <span class="badge" style="background:#FEF2F2; color:#DC2626; border:1px solid #FECACA; font-weight:700; display:inline-flex; align-items:center; gap:4px; font-size:11.5px;">
          <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#EF4444;"></span> Mute / Blok
        </span>
        <div style="font-size:10.5px; color:#DC2626; margin-top:2px; font-weight:600;">
          ${u.telegram_username ? `@${u.telegram_username.replace(/^@/, '')}` : (u.telegram_user_id ? `ID: ${u.telegram_user_id}` : 'Bloklangan')}
        </div>
      `;
    } else {
      tgBadge = `
        <span class="badge" style="background:#F1F5F9; color:#64748B; border:1px solid #CBD5E1; font-weight:600; display:inline-flex; align-items:center; gap:4px; font-size:11.5px;">
          <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#94A3B8;"></span> ${u.telegram_user_id ? 'Start kutilmoqda' : 'Ulanmagan'}
        </span>
        <div style="font-size:10.5px; color:#64748B; margin-top:2px;">
          ${u.telegram_username ? `<span style="color:#0284C7; font-weight:600;">@${u.telegram_username.replace(/^@/, '')}</span>` : (u.telegram_user_id ? `ID: <code>${u.telegram_user_id}</code>` : 'Start bosmagan')}
        </div>
      `;
    }

    return `
      <tr>
        <td>
          <div class="table-student-name" style="cursor:pointer;" onclick="showStaffMonitoringModal('${u.id}')" title="Xodimning to'liq monitoringi, Telegram holati va doimiy arxivini ko'rish uchun bosing">
            ${u.photo_url ? `
              <img src="${u.photo_url}" class="avatar-badge" style="object-fit:cover; border-radius:50%; width:34px; height:34px; border:2px solid #3B82F6;" onerror="this.outerHTML='<span class=\\'avatar-badge\\'>${initials || 'X'}</span>'">
            ` : `
              <span class="avatar-badge">${initials || 'X'}</span>
            `}
            <div>
              <div style="font-weight: 700; color: #1E293B; font-size: 13px; display:flex; align-items:center; gap:6px;">
                <span>${u.full_name}</span>
                <span style="color:#2563EB; font-size:11px;" title="Monitoring">${icon('eye', 13)}</span>
              </div>
              <div class="table-sub-text" style="display:flex; align-items:center; flex-wrap:wrap; gap:5px; margin-top:2px;">
                <span>@${u.username || u.id}</span>
                ${u.passport_id ? `
                  <span style="background:#EFF6FF; color:#1D4ED8; border:1px solid #BFDBFE; font-size:10.5px; font-weight:700; padding:1px 6px; border-radius:4px;" title="Face ID / Turniket Pasport ID: ${u.passport_id}">
                    🪪 ${u.passport_id}
                  </span>
                ` : `
                  <span style="background:#F8FAFC; color:#94A3B8; border:1px dashed #CBD5E1; font-size:10px; padding:1px 5px; border-radius:4px;" title="Face ID monitoring uchun pasport ID kiritilmagan">
                    🪪 Pasport yo'q
                  </span>
                `}
              </div>
            </div>
          </div>
        </td>
        <td>
          <div style="display: flex; flex-wrap: wrap; max-width: 260px;">${roleBadges || '<span class="text-muted">Rollar biriktirilmagan</span>'}</div>
        </td>
        <td>${groupBadges}</td>
        <td>
          <div style="font-size: 12px; color: var(--text-main); font-weight:500;">${u.email || '-'}</div>
          <div class="table-sub-text">${u.phone || '<span style="color:#94A3B8;">Tel yo\'q</span>'}</div>
        </td>
        <td>
          ${tgBadge}
        </td>
        <td>
          <span class="status-badge ${isActive ? 'badge-active' : 'badge-inactive'}">
            ${isActive ? 'Faol' : 'Bloklangan'}
          </span>
        </td>
        <td style="text-align: right;">
          <div style="display: inline-flex; gap: 4px; justify-content: flex-end;">
            <button class="btn-action" style="background:#0284C7; color:white; border:1px solid #0369A1;" onclick="showStaffMonitoringModal('${u.id}')" title="Xodim Monitoringi, Bot holati va o'chmas faoliyat jurnali">
              ${icon('shield', 14)}
            </button>
            <button class="btn-action" style="background:#EFF6FF; color:#2563EB; border:1px solid #BFDBFE;" onclick="impersonateStaffUser('${u.id}')" title="Ushbu xodim nomidan tizimni tekshirish (Check / Kirish)">
              ${icon('eye', 14)}
            </button>
            <button class="btn-action btn-action-primary" onclick="openStaffEditPage('${u.id}')" title="Xodimni Tahrirlash & Huquqlar (Katta Sahifa)">
              ${icon('edit', 14)}
            </button>
            <button class="btn-action ${isActive ? 'btn-action-warning' : 'btn-action-primary'}" onclick="toggleStaffStatus('${u.id}', ${isActive ? 1 : 0})" title="${isActive ? 'Bloklash' : 'Faollashtirish'}">
              ${isActive ? icon('pause', 13) : icon('play', 13)}
            </button>
            <button class="btn-action btn-action-danger" onclick="deleteStaffUser('${u.id}')" title="O'chirish">
              ${icon('trash', 14)}
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// YANGI XODIM QO'SHISH
async function showCreateStaffModal() {
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalFooter = document.getElementById('modal-footer');

  modalTitle.innerHTML = `<span style="display:flex; align-items:center; gap:8px;">${icon('userPlus', 18)} Yangi Xodim Qo'shish</span>`;

  let rolesList = [];
  try {
    const rolesRes = await apiFetch('/api/admin/roles-list');
    rolesList = rolesRes.roles || [];
  } catch (e) {
    rolesList = [
      { key: 'superadmin', id: 'superadmin', name: 'Superadmin (IT Markazi)', desc: 'Tizimni to\'liq boshqarish va parametrlar' },
      { key: 'prorektor', id: 'prorektor', name: "Yoshlar bo'yicha Prorektor", desc: '25+ yutuqlar va -30 jarimalar tasdig\'i' },
      { key: 'dep_yb', id: 'dep_yb', name: "Yoshlar bilan ishlash bo'limi", desc: 'Ijtimoiy, Sport, Liderlik sohalari va tadbirlar' },
      { key: 'dep_ob', id: 'dep_ob', name: "O'quv bo'limi (Registrator)", desc: 'Talabalar, GPA, Davomat va Akademik soha' },
      { key: 'dep_mb', id: 'dep_mb', name: "Ma'naviyat va ma'rifat bo'limi", desc: 'Ma\'naviyat, san\'at va tadbirlar tasdig\'i' },
      { key: 'dep_ib', id: 'dep_ib', name: "Ilmiy tadqiqotlar bo'limi", desc: 'Ilmiy maqolalar, anjumanlar, grantlar' },
      { key: 'dep_sb', id: 'dep_sb', name: "Sanoat bilan hamkorlik", desc: 'Startaplar, Hackathonlar, ko\'rgazmalar' },
      { key: 'dep_pb', id: 'dep_pb', name: "Matbuot xizmati (PR)", desc: 'OAV va ijtimoiy tarmoqlar materiallari' },
      { key: 'dep_atm', id: 'dep_atm', name: "Axborot texnologiyalari markazi", desc: 'Axborot tizimlari, texnik ta\'minot va IT xizmatlari' },
      { key: 'dep_xb', id: 'dep_xb', name: "Xo'jalik bo'limi", desc: 'Xo\'jalik va moddiy-texnik ta\'minot, kampus infratuzilmasi' },
      { key: 'dep_iy', id: 'dep_iy', name: "Ish yurituvchi", desc: 'Hujjatlar aylanmasi, devonxona va ijro intizomi' },
      { key: 'tutor', id: 'tutor', name: 'Tyutor', desc: 'Talabalarga ball kiritish va monitoring' },
      { key: 'observer', id: 'observer', name: 'Kuzatuvchi (Rektorat)', desc: 'Monitoring va Katta ekran (TV)' }
    ];
  }

  let allGroups = [];
  try {
    const gRes = await apiFetch('/api/admin/groups-list');
    allGroups = gRes.groups || [];
  } catch (e) {
    allGroups = ['FMC01', 'FMC02', 'FMC03', 'FMC04', 'FMC05'];
  }

  modalBody.innerHTML = `
    <form id="create-staff-form">
      <!-- Foto qismi -->
      <div class="form-group mb-3">
        <label class="form-label" style="font-weight: 600;">Xodim Fotosurati (Profil Rasmi)</label>
        <div class="photo-uploader-box">
          <img id="create-staff-photo-preview" src="" class="photo-preview-thumb" style="display:none;" alt="Foto">
          <div style="flex: 1;">
            <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 6px;">
              <input type="file" id="create-staff-file-input" accept="image/*" style="display:none;" onchange="handleAdminStaffPhotoUpload(this, 'new-staff-photourl', 'create-staff-photo-preview')">
              <button type="button" class="btn btn-outline btn-sm" onclick="document.getElementById('create-staff-file-input').click()" style="display: inline-flex; align-items: center; gap: 5px; background: white;">
                ${icon('upload', 13)} <span>Kompyuterdan Rasm Tanlash</span>
              </button>
            </div>
            <input type="text" id="new-staff-photourl" class="form-control" placeholder="Yoki rasm havolasi (https://... yoki /api/files/...)" oninput="updateAdminStaffPhotoPreview(this.value, 'create-staff-photo-preview')">
          </div>
        </div>
      </div>

      <div class="grid grid-2 mb-3">
        <div class="form-group">
          <label class="form-label">Foydalanuvchi Nomi (Login) *</label>
          <input type="text" id="new-staff-username" class="form-control" placeholder="masalan: jasur_m" required>
        </div>
        <div class="form-group">
          <label class="form-label">Parol *</label>
          <input type="password" id="new-staff-password" class="form-control" placeholder="Kamida 6 ta belgi" required>
        </div>
      </div>

      <div class="form-group mb-3">
        <label class="form-label">F.I.Sh (To'liq ismi) *</label>
        <input type="text" id="new-staff-fullname" class="form-control" placeholder="Familiya Ism Sharif" required>
      </div>

      <div class="grid grid-3 mb-3" style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:10px;">
        <div class="form-group">
          <label class="form-label">Email</label>
          <input type="email" id="new-staff-email" class="form-control" placeholder="staff@akhu.uz">
        </div>
        <div class="form-group">
          <label class="form-label">Asosiy Telefon</label>
          <input type="text" id="new-staff-phone" class="form-control" placeholder="+998901234567">
        </div>
        <div class="form-group">
          <label class="form-label" style="font-weight:700; color:#1D4ED8;">🪪 Pasport ID (Turniket / Face ID)</label>
          <input type="text" id="new-staff-passport" class="form-control" placeholder="AD1234567" style="text-transform:uppercase; font-weight:700; color:#1E40AF; border-color:#93C5FD;">
          <small class="text-muted" style="font-size:11px;">Face ID monitoring va HikCentral uchun</small>
        </div>
      </div>

      <!-- Telegram ma'lumotlari -->
      <div class="grid grid-3 mb-3" style="display:grid; grid-template-columns: 1.1fr 1fr 1fr; gap:10px;">
        <div class="form-group">
          <label class="form-label" style="font-weight:600;">Telegram User ID</label>
          <input type="text" id="new-staff-tgid" class="form-control" placeholder="1202082857 (ixtiyoriy)" onblur="autoFetchTgUsername('new-staff-tgid', 'new-staff-tgusername', 'new-staff-tgid-status')">
          <div id="new-staff-tgid-status" style="font-size:11px; margin-top:3px; color:var(--text-muted);">Bo'sh bo'lsa, xodim botga /start bosganda avtomatik to'ldiriladi</div>
        </div>
        <div class="form-group">
          <label class="form-label">Telegram Username (@)</label>
          <div style="position:relative;">
            <span style="position:absolute; left:10px; top:8px; color:#94A3B8; font-weight:600;">@</span>
            <input type="text" id="new-staff-tgusername" class="form-control" style="padding-left:26px;" placeholder="username (ixtiyoriy)">
          </div>
          <small class="text-muted" style="font-size:11px;">Ixtiyoriy (avtomatik olinadi)</small>
        </div>
        <div class="form-group">
          <label class="form-label">Telegram Telefon Raqami</label>
          <input type="text" id="new-staff-tgphone" class="form-control" placeholder="+998901234567">
        </div>
      </div>

      <div class="form-group mb-3">
        <label class="form-label" style="font-weight: 700; color: var(--text-main);">Biriktiriladigan Rollar & Funksional Ruxsatlar (Tanlang):</label>
        <p style="font-size: 11.5px; color: var(--text-muted); margin-bottom: 8px;">Xodimga tizimda qaysi bo'lim va vakolatlar berilishini belgilang:</p>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; max-height: 240px; overflow-y: auto; background: #F8FAFC; padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--border-light);">
          ${rolesList.map(r => {
            const rKey = r.key || r.id;
            return `
              <div style="border: 1px solid #E2E8F0; border-radius: 8px; padding: 10px; background: white; display: flex; align-items: flex-start; gap: 10px; cursor: pointer;">
                <input type="checkbox" name="new-staff-roles-checkbox" value="${rKey}" id="create-role-${rKey}" style="margin-top: 3px; cursor: pointer;">
                <label for="create-role-${rKey}" style="cursor: pointer; margin: 0; width: 100%;">
                  <div style="font-weight: 600; font-size: 12.5px; color: var(--text-main);">${r.name}</div>
                  <div style="font-size: 11px; color: #64748B; line-height: 1.35; margin-top: 2px;">${r.desc || ''}</div>
                </label>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <div class="form-group mb-2">
        <label class="form-label" style="font-weight: 700; color: var(--text-main);">Tyutor Biriktirilgan Guruhlari (Select / Tanlang):</label>
        <p style="font-size: 11.5px; color: var(--text-muted); margin-bottom: 6px;">Tyutor roli tanlanganda tegishli guruhlarni belgilang:</p>
        <div style="display: flex; flex-wrap: wrap; gap: 8px; max-height: 120px; overflow-y: auto; background: #F8FAFC; padding: 10px; border-radius: 8px; border: 1px solid #E2E8F0;">
          ${allGroups.map(g => `
            <label style="cursor: pointer; display: inline-flex; align-items: center; gap: 6px; background: white; border: 1px solid #CBD5E1; padding: 5px 10px; border-radius: 6px; font-size: 12.5px; font-weight: 600; user-select: none;">
              <input type="checkbox" name="new-staff-groups-checkbox" value="${g}" onchange="this.parentElement.style.background = this.checked ? '#EFF6FF' : 'white'; this.parentElement.style.borderColor = this.checked ? '#3B82F6' : '#CBD5E1';">
              <span>${g}</span>
            </label>
          `).join('')}
        </div>
      </div>
    </form>
  `;

  modalFooter.innerHTML = `
    <button class="btn btn-outline" onclick="closeModal()">Bekor Qilish</button>
    <button class="btn btn-primary" onclick="handleCreateStaffSubmit()" style="display:inline-flex; align-items:center; gap:6px;">
      ${icon('check', 14)} Yaratish
    </button>
  `;

  openModal();
}

async function handleCreateStaffSubmit() {
  const username = document.getElementById('new-staff-username')?.value.trim();
  const password = document.getElementById('new-staff-password')?.value;
  const full_name = document.getElementById('new-staff-fullname')?.value.trim();
  const email = document.getElementById('new-staff-email')?.value.trim();
  const phone = document.getElementById('new-staff-phone')?.value.trim();
  const passport_id = document.getElementById('new-staff-passport')?.value.trim().toUpperCase() || null;
  const telegram_user_id = document.getElementById('new-staff-tgid')?.value.trim();
  const telegram_username = document.getElementById('new-staff-tgusername')?.value.trim();
  const telegram_phone = document.getElementById('new-staff-tgphone')?.value.trim();
  const photo_url = document.getElementById('new-staff-photourl')?.value.trim();

  const roles = Array.from(document.querySelectorAll(`input[name="new-staff-roles-checkbox"]:checked`))
    .map(cb => cb.value)
    .filter(r => r && r !== 'undefined');

  const tutor_groups = Array.from(document.querySelectorAll(`input[name="new-staff-groups-checkbox"]:checked`))
    .map(cb => cb.value.trim())
    .filter(Boolean);

  if (!username || !password || !full_name) {
    showToast("Login, Parol va F.I.Sh kiritilishi shart!", "warning");
    return;
  }

  if (roles.length === 0) {
    showToast("Kamida bitta rol tanlanishi shart!", "warning");
    return;
  }

  let cleanTgId = telegram_user_id || null;
  let cleanTgUsername = telegram_username ? telegram_username.replace(/^@/, '').trim() : null;
  if (cleanTgId) {
    if (cleanTgId.toLowerCase() === 'null' || cleanTgId.toLowerCase() === 'undefined' || cleanTgId === '') {
      cleanTgId = null;
    } else if (cleanTgId.startsWith('@') || /[^0-9]/.test(cleanTgId)) {
      if (!cleanTgUsername) cleanTgUsername = cleanTgId.replace(/^@/, '').trim();
      cleanTgId = null;
    }
  }
  if (cleanTgUsername) {
    if (cleanTgUsername.toLowerCase() === 'null' || cleanTgUsername.toLowerCase() === 'undefined' || cleanTgUsername === '') {
      cleanTgUsername = null;
    }
  }
  let cleanPhone = phone ? phone.replace(/[^0-9+]/g, '') : null;
  if (cleanPhone && !cleanPhone.startsWith('+') && cleanPhone.startsWith('998')) cleanPhone = '+' + cleanPhone;
  let cleanTgPhone = telegram_phone ? telegram_phone.replace(/[^0-9+]/g, '') : (cleanPhone || null);
  if (cleanTgPhone && !cleanTgPhone.startsWith('+') && cleanTgPhone.startsWith('998')) cleanTgPhone = '+' + cleanTgPhone;

  try {
    await apiFetch('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        username,
        password,
        full_name,
        passport_id,
        email,
        phone: cleanPhone,
        telegram_user_id: cleanTgId,
        telegram_username: cleanTgUsername,
        telegram_phone: cleanTgPhone,
        photo_url: photo_url || null,
        roles,
        tutor_groups,
        groups: tutor_groups
      })
    });

    closeModal();
    showToast('Xodim muvaffaqiyatli yaratildi!');
    await loadStaffUsersList();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// XODIMNI TAHRIRLASH (FULL PAGE REJIMIDA — CHIROYLI KATTA SAHIFA VA GRANULAR RUXSATLAR)
function openStaffEditPage(userId) {
  if (typeof closeModal === 'function') closeModal();
  AppState.editingStaffId = userId;
  try {
    history.pushState(null, '', '#admin-staff-edit?id=' + encodeURIComponent(userId));
  } catch(e) {}
  navigateTo('admin-staff-edit');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.openStaffEditPage = openStaffEditPage;

async function showEditStaffModal(userId) {
  openStaffEditPage(userId);
}
window.showEditStaffModal = showEditStaffModal;

// Barcha 34 ta ruxsatlar katalogi (Rollarga bog'lanmagan holda har bir funksiyani alohida berish)
const PERM_CATEGORIES_DATA = [
  {
    key: 'students',
    category: 'Talabalar Boshqaruvi',
    color: '#2563EB',
    bg: '#EFF6FF',
    icon: '👨‍🎓',
    permissions: [
      { id: 'students_view', name: "Talabalar ro'yxatini ko'rish", desc: "Talabalar bazasini ko'rish, qidirish va profillarini ochish" },
      { id: 'students_create', name: "Yangi talaba qo'shish", desc: "Bitta talabani qo'lda ro'yxatga olish" },
      { id: 'students_edit', name: "Talaba ma'lumotlarini tahrirlash", desc: "Talaba ismi, guruhi, bosqichi, rasmi va telefonini o'zgartirish" },
      { id: 'students_delete', name: "Talabani o'chirish / arxivlash", desc: "Talabani tizimdan chiqarish yoki nofaol qilish" },
      { id: 'students_import_excel', name: "Talabalarni Exceldan yuklash", desc: "Talabalar ro'yxatini Excel/CSV orqali ommaviy import qilish" },
      { id: 'students_import_gpa', name: "GPA va davomat importi", desc: "GPA va davomat ballarini Exceldan kiritish" },
      { id: 'students_export_zip', name: "Rasmlarni ZIP yuklab olish", desc: "Talabalar fotosuratlarini ZIP arxivda yuklab olish" },
      { id: 'students_sync_turniket_photos', name: "Turniket rasmlarini to'ldirish", desc: "Turniket serverdan rasmsiz talabalar rasmlarini yuklab to'ldirish" }
    ]
  },
  {
    key: 'attendance',
    category: 'Davomat & Turniket (Face ID)',
    color: '#059669',
    bg: '#F0FDF4',
    icon: '🚪',
    permissions: [
      { id: 'attendance_view', name: "Davomatni ko'rish", desc: "Kunlik kampus turniket davomati va holatlarni ko'rish" },
      { id: 'attendance_sync', name: "Turniketni sinxronlash", desc: "HikCentral serveridan yangi voqealarni qo'lda yangilash" },
      { id: 'attendance_export_excel', name: "Davomatni Excelga eksport", desc: "Kunlik davomat hisobotlarini Excel formatida yuklab olish" },
      { id: 'attendance_view_history', name: "Talaba davomat tarixi", desc: "Har bir talabaning kirish-chiqish vaqtlarini batafsil ko'rish" }
    ]
  },
  {
    key: 'points',
    category: 'Ballar & Baholash (Rating)',
    color: '#D97706',
    bg: '#FFFBEB',
    icon: '🏆',
    permissions: [
      { id: 'points_enter', name: "Talabalarga ball kiritish", desc: "Mezonlar bo'yicha talabalarga ball kiritish" },
      { id: 'points_approve_dept', name: "Bo'lim tasdig'i", desc: "Bo'lim arizalarini ko'rib chiqish va tasdiqlash" },
      { id: 'points_approve_prorektor', name: "Prorektor tasdig'i", desc: "Yakuniy prorektor darajasidagi tasdiqlar (PV)" },
      { id: 'points_history_view', name: "Ballar tarixini ko'rish", desc: "Barcha kiritilgan ballar va dalillar jurnalini ko'rish" },
      { id: 'points_recalculate', name: "Reytingni qayta hisoblash", desc: "Keshni va talabalar ballarini yangilash" }
    ]
  },
  {
    key: 'events',
    category: 'Tadbirlar & QR Monitoring',
    color: '#7C3AED',
    bg: '#F5F3FF',
    icon: '📅',
    permissions: [
      { id: 'events_view', name: "Tadbirlarni ko'rish", desc: "Universitet tadbirlari ro'yxatini ko'rish" },
      { id: 'events_create', name: "Yangi tadbir yaratish", desc: "Tadbir, joyi, vaqti va mezonlarini belgilash" },
      { id: 'events_edit', name: "Tadbirni tahrirlash", desc: "Tadbir vaqtini o'zgartirish, bekor qilish yoki yakunlash" },
      { id: 'events_qr_manage', name: "Dinamik QR kod boshqaruvi", desc: "Tadbir uchun jonli QR kodni ko'rsatish va monitoring" },
      { id: 'events_view_registrations', name: "Ro'yxatdan o'tganlar nazorati", desc: "Tadbirga ro'yxatdan o'tgan va kelgan talabalar ro'yxati" }
    ]
  },
  {
    key: 'tutor',
    category: 'Tyutorlar & Guruhlar',
    color: '#0284C7',
    bg: '#F0F9FF',
    icon: '👩‍🏫',
    permissions: [
      { id: 'tutor_my_students', name: "O'z guruh talabalari", desc: "Tyutor kabinetidan o'z talabalarini boshqarish" },
      { id: 'tutor_assign_groups', name: "Guruhlarni taqsimlash", desc: "Tyutorlarga akademik guruhlarni biriktirish" },
      { id: 'tutor_enter_points', name: "Tyutor ballari", desc: "Tyutor sifatida talabaga oylik ball qo'yish" }
    ]
  },
  {
    key: 'staff',
    category: 'Xodimlar Boshqaruvi',
    color: '#BE185D',
    bg: '#FDF2F8',
    icon: '👥',
    permissions: [
      { id: 'staff_view', name: "Xodimlarni ko'rish", desc: "Tizim xodimlari ro'yxati va aloqa ma'lumotlarini ko'rish" },
      { id: 'staff_create', name: "Yangi xodim qo'shish", desc: "Tizimga yangi mas'ul xodim biriktirish" },
      { id: 'staff_edit', name: "Xodimni tahrirlash", desc: "Xodim ismi, lavozimi, pasport ID va parolini yangilash" },
      { id: 'staff_permissions', name: "Huquqlar & Ruxsatlar berish", desc: "Xodimga alohida ruxsatlarni belgilash yoki olib qo'yish" },
      { id: 'staff_status_toggle', name: "Faollikni boshqarish", desc: "Xodimni bloklash yoki qayta faollashtirish" }
    ]
  },
  {
    key: 'settings',
    category: 'Tizim Sozlamalari & Audit',
    color: '#475569',
    bg: '#F8FAFC',
    icon: '⚙️',
    permissions: [
      { id: 'settings_seasons', name: "Mavsumlar va semestrlar", desc: "O'quv yili va mavsumlarni sozlash" },
      { id: 'settings_catalog', name: "Ball mezonlari katalogi", desc: "Katalog bandlari va mezonlar qiymatlarini tahrirlash" },
      { id: 'settings_hikcentral', name: "Turniket sozlamalari", desc: "HikCentral server IP, AppKey va ulanish parametrlari" },
      { id: 'settings_telegram', name: "Telegram bot boshqaruvi", desc: "Bot tokeni, kanallar va xabarnomalar" },
      { id: 'settings_tv_display', name: "TV Ekran boshqaruvi", desc: "Katta ekran TV tokeni va ko'rsatish sozlamalari" },
      { id: 'settings_audit_logs', name: "Audit jurnalini ko'rish", desc: "Tizimdagi barcha harakatlar tarixi va xavfsizlik nazorati" },
      { id: 'settings_risk_monitoring', name: "Xavf va monitoring tahlili", desc: "Konsentratsiya va shubhali ballar monitoringi" }
    ]
  },
  {
    key: 'observe',
    category: 'Rahbariyat & Tahlil',
    color: '#0891B2',
    bg: '#ECFEFF',
    icon: '📊',
    permissions: [
      { id: 'observe_analytics', name: "Umumiy tahlil & Reyting", desc: "Fakultet, yo'nalish va guruhlar bo'yicha umumiy statistika" },
      { id: 'observe_tv_screen', name: "TV Ekraniga kirish", desc: "Katta ekran reyting va davomat jadvalini ko'rish" }
    ]
  }
];

const ROLE_PERMISSIONS_PRESET = {
  superadmin: PERM_CATEGORIES_DATA.flatMap(c => c.permissions.map(p => p.id)),
  dep_ob: ['students_view', 'students_create', 'students_edit', 'students_import_excel', 'students_import_gpa', 'students_export_zip', 'students_sync_turniket_photos', 'attendance_view', 'attendance_export_excel', 'observe_analytics'],
  tutor: ['tutor_my_students', 'tutor_enter_points', 'attendance_view', 'attendance_view_history', 'events_view'],
  prorektor: ['points_approve_prorektor', 'points_history_view', 'observe_analytics', 'observe_tv_screen', 'settings_audit_logs', 'settings_risk_monitoring', 'attendance_view', 'events_view'],
  dep_atm: ['attendance_view', 'attendance_view_history', 'events_view', 'events_create', 'events_edit', 'events_qr_manage', 'observe_analytics', 'observe_tv_screen', 'settings_audit_logs', 'settings_bot_manage', 'students_view'],
  dep_xb: ['attendance_view', 'attendance_view_history', 'observe_analytics', 'events_view'],
  dep_iy: ['attendance_view', 'observe_analytics', 'events_view', 'points_approve_dept', 'points_enter'],
  observer: ['observe_analytics', 'observe_tv_screen', 'attendance_view', 'events_view']
};

async function renderStaffEditPage(container, targetUserId) {
  if (!targetUserId && AppState.editingStaffId) {
    targetUserId = AppState.editingStaffId;
  }

  // Agar URL dan yoki AppState dan ID topilmasa
  if (!targetUserId) {
    const hashId = (new URLSearchParams((window.location.hash || '').split('?')[1] || '')).get('id');
    if (hashId) targetUserId = hashId;
  }

  container.innerHTML = `
    <div class="loading-state" style="padding:60px 20px; text-align:center;">
      <div class="spinner"></div>
      <p style="margin-top:14px; font-weight:600; color:var(--text-secondary);">Xodim ma'lumotlari va ruxsatlari yuklanmoqda...</p>
    </div>
  `;

  let user = (adminStaffState.users || []).find(u => String(u.id) === String(targetUserId));
  if (!user) {
    try {
      const res = await apiFetch('/api/admin/users');
      adminStaffState.users = Array.isArray(res) ? res : (res.users || []);
      user = adminStaffState.users.find(u => String(u.id) === String(targetUserId));
    } catch (e) {}
  }

  if (!user) {
    container.innerHTML = `
      <div class="staff-card-panel" style="padding:48px 24px; text-align:center; max-width:540px; margin:40px auto;">
        <div style="font-size:48px; margin-bottom:12px;">⚠️</div>
        <h3 style="font-size:18px; font-weight:700; color:var(--text-main); margin-bottom:8px;">Xodim topilmadi</h3>
        <p style="color:var(--text-muted); font-size:13.5px; margin-bottom:20px;">Tanlangan "${targetUserId || ''}" ID li xodim mavjud emas yoki o'chirilgan.</p>
        <button type="button" class="btn btn-primary" onclick="navigateTo('admin-users-manage')">
          ${icon('arrowLeft', 14)} Xodimlar Ro'yxatiga Qaytish
        </button>
      </div>
    `;
    return;
  }

  const isActive = (user.is_active !== undefined) ? Boolean(user.is_active) : (user.active === 1);
  const userGroups = user.tutor_groups || user.groups || [];
  const currentRoles = (user.roles || []).filter(r => r && r !== 'undefined');

  let rolesList = [];
  try {
    const rolesRes = await apiFetch('/api/admin/roles-list');
    rolesList = rolesRes.roles || [];
  } catch (e) {
    rolesList = [
      { key: 'superadmin', id: 'superadmin', name: 'Superadmin (IT Markazi)', desc: 'Tizimni to\'liq boshqarish va parametrlar' },
      { key: 'prorektor', id: 'prorektor', name: "Yoshlar bo'yicha Prorektor", desc: '25+ yutuqlar va -30 jarimalar tasdig\'i' },
      { key: 'dep_yb', id: 'dep_yb', name: "Yoshlar bilan ishlash bo'limi", desc: 'Ijtimoiy, Sport, Liderlik sohalari va tadbirlar' },
      { key: 'dep_ob', id: 'dep_ob', name: "O'quv bo'limi (Registrator)", desc: 'Talabalar, GPA, Davomat va Akademik soha' },
      { key: 'dep_mb', id: 'dep_mb', name: "Ma'naviyat va ma'rifat bo'limi", desc: 'Ma\'naviyat, san\'at va tadbirlar tasdig\'i' },
      { key: 'dep_ib', id: 'dep_ib', name: "Ilmiy tadqiqotlar bo'limi", desc: 'Ilmiy maqolalar, anjumanlar, grantlar' },
      { key: 'dep_sb', id: 'dep_sb', name: "Sanoat bilan hamkorlik", desc: 'Startaplar, Hackathonlar, ko\'rgazmalar' },
      { key: 'dep_pb', id: 'dep_pb', name: "Matbuot xizmati (PR)", desc: 'OAV va ijtimoiy tarmoqlar materiallari' },
      { key: 'dep_atm', id: 'dep_atm', name: "Axborot texnologiyalari markazi", desc: 'Axborot tizimlari, texnik ta\'minot va IT xizmatlari' },
      { key: 'dep_xb', id: 'dep_xb', name: "Xo'jalik bo'limi", desc: 'Xo\'jalik va moddiy-texnik ta\'minot, kampus infratuzilmasi' },
      { key: 'dep_iy', id: 'dep_iy', name: "Ish yurituvchi", desc: 'Hujjatlar aylanmasi, devonxona va ijro intizomi' },
      { key: 'tutor', id: 'tutor', name: 'Tyutor', desc: 'Talabalarga ball kiritish va monitoring' },
      { key: 'observer', id: 'observer', name: 'Kuzatuvchi (Rektorat)', desc: 'Monitoring va Katta ekran (TV)' }
    ];
  }

  let allGroups = [];
  try {
    const gRes = await apiFetch('/api/admin/groups-list');
    allGroups = gRes.groups || [];
  } catch (e) {
    allGroups = ['FMC01', 'FMC02', 'FMC03', 'FMC04', 'FMC05', 'FDT01', 'MAI01', 'SAI01', 'SAI02', 'SDT01', 'SSE01', 'SSE02'];
  }

  // Mavjud ruxsatlar
  const userPerms = (() => {
    try {
      if (Array.isArray(user.permissions)) return user.permissions;
      if (typeof user.permissions === 'string') return JSON.parse(user.permissions || '[]');
      return [];
    } catch (e) { return []; }
  })();

  const allPermIds = PERM_CATEGORIES_DATA.flatMap(c => c.permissions.map(p => p.id));
  const activePermsCount = allPermIds.filter(pid => userPerms.includes(pid)).length;

  container.innerHTML = `
    <div class="staff-edit-page">
      <!-- TOP NAVIGATION & BREADCRUMB -->
      <div class="staff-edit-topbar">
        <div class="staff-edit-breadcrumb">
          <button type="button" class="staff-edit-back-btn" onclick="navigateTo('admin-users-manage')">
            ← Xodimlar ro'yxatiga qaytish
          </button>
          <span>/</span>
          <span style="font-weight:600; color:var(--text-main);">Xodimni Tahrirlash & Huquqlar: ${user.full_name}</span>
        </div>
        <div style="display:flex; gap:10px; align-items:center;">
          <button type="button" class="btn btn-outline" onclick="navigateTo('admin-users-manage')">
            Bekor Qilish
          </button>
          <button type="button" class="btn btn-primary" onclick="submitStaffEditPage('${user.id}')" style="display:inline-flex; align-items:center; gap:8px; font-weight:700;">
            💾 O'zgarishlarni Saqlash
          </button>
        </div>
      </div>

      <!-- HERO BANNER -->
      <div class="staff-edit-hero">
        <div class="staff-edit-hero-left">
          <div class="staff-edit-avatar-wrap" onclick="document.getElementById('edit-staff-file-input').click()" style="cursor:pointer;" title="Rasmni o'zgartirish uchun bosing">
            <img id="edit-staff-photo-preview" src="${user.photo_url || ''}" class="staff-edit-avatar-img" style="${user.photo_url ? '' : 'display:none;'}" alt="${user.full_name}">
            <div id="edit-staff-avatar-fallback" class="staff-edit-avatar-placeholder" style="${user.photo_url ? 'display:none;' : ''}">
              ${(user.full_name || 'U').charAt(0).toUpperCase()}
            </div>
          </div>
          <div class="staff-edit-hero-meta">
            <h2>${user.full_name}</h2>
            <div class="staff-edit-hero-badges">
              <span class="badge" style="background:rgba(255,255,255,0.2); color:#FFFFFF; font-size:12px; font-weight:600;">
                @${user.username || user.id}
              </span>
              <span class="badge" style="background:${isActive ? '#10B981' : '#EF4444'}; color:#FFFFFF; font-size:11.5px; font-weight:600;">
                ${isActive ? '🟢 Tizimda Faol' : '🔴 Bloklangan'}
              </span>
              ${user.bot_status === 'active' || user.telegram_user_id ? `
                <span class="badge" style="background:#0284C7; color:#FFFFFF; font-size:11.5px;">
                  🤖 Telegram Ulangan
                </span>
              ` : `
                <span class="badge" style="background:rgba(255,255,255,0.15); color:rgba(255,255,255,0.8); font-size:11.5px;">
                  🤖 Bot: Ulanmagan
                </span>
              `}
            </div>
          </div>
        </div>

        <div class="staff-edit-hero-stats">
          <div class="staff-edit-hero-stat-item">
            <div class="staff-edit-hero-stat-val" id="hero-perm-count" style="color:#60A5FA;">${activePermsCount} / ${allPermIds.length}</div>
            <div class="staff-edit-hero-stat-lbl">Alohida Ruxsatlar</div>
          </div>
          <div class="staff-edit-hero-stat-item" style="border-left:1px solid rgba(255,255,255,0.15); padding-left:16px;">
            <div class="staff-edit-hero-stat-val">${(userGroups || []).length} ta</div>
            <div class="staff-edit-hero-stat-lbl">Guruhlar</div>
          </div>
          <div class="staff-edit-hero-stat-item" style="border-left:1px solid rgba(255,255,255,0.15); padding-left:16px;">
            <div class="staff-edit-hero-stat-val">${user.audit_count || 0} ta</div>
            <div class="staff-edit-hero-stat-lbl">Audit Yozuvlari</div>
          </div>
        </div>
      </div>

      <!-- MAIN 2-COLUMN LAYOUT -->
      <form id="staff-edit-page-form" onsubmit="event.preventDefault(); submitStaffEditPage('${user.id}');">
        <div class="staff-edit-layout">

          <!-- LEFT COLUMN: PROFIL & ROLLAR (410px) -->
          <div class="staff-edit-col-left">

            <!-- KARTA 1: ASOSIY MA'LUMOTLAR -->
            <div class="staff-card-panel">
              <h3 class="staff-card-title">
                ${icon('user', 17)} <span>Shaxsiy Ma'lumotlar & Kirish</span>
              </h3>

              <!-- Fotosurat yuklash -->
              <div class="form-group mb-3">
                <label class="form-label" style="font-weight:600; font-size:13px;">Profil Fotosurati (Face ID Turniket)</label>
                <div style="display:flex; gap:10px; align-items:center;">
                  <input type="file" id="edit-staff-file-input" accept="image/*" style="display:none;" onchange="handleAdminStaffPhotoUpload(this, 'edit-staff-photourl', 'edit-staff-photo-preview')">
                  <button type="button" class="btn btn-outline btn-sm" onclick="document.getElementById('edit-staff-file-input').click()" style="display:inline-flex; align-items:center; gap:6px; font-weight:600; background:#F8FAFC;">
                    ${icon('upload', 13)} <span>Kompyuterdan Yuklash</span>
                  </button>
                  <span style="font-size:11px; color:var(--text-muted);">JPG / PNG (max 5MB)</span>
                </div>
                <input type="text" id="edit-staff-photourl" class="form-control" value="${user.photo_url || ''}" placeholder="Yoki rasm havolasi (https://...)" oninput="updateAdminStaffPhotoPreview(this.value, 'edit-staff-photo-preview')" style="margin-top:6px; font-size:12px;">
              </div>

              <!-- Login & F.I.Sh -->
              <div class="form-group mb-3">
                <label class="form-label" style="font-weight:600; font-size:13px;">Foydalanuvchi Nomi (Login) *</label>
                <input type="text" id="edit-staff-username" class="form-control" value="${user.username || user.id}" required placeholder="masalan: jasur_m">
                <small class="text-muted" style="font-size:11px;">Tizimga kirish logini (unikal bo'lishi shart)</small>
              </div>

              <div class="form-group mb-3">
                <label class="form-label" style="font-weight:600; font-size:13px;">To'liq F.I.Sh *</label>
                <input type="text" id="edit-staff-fullname" class="form-control" value="${user.full_name || ''}" required placeholder="Familiya Ism Sharif">
              </div>

              <!-- Pasport ID (Face ID turniket) -->
              <div class="form-group mb-3">
                <label class="form-label" style="font-weight:600; font-size:13px; color:#1E3A8A; display:flex; align-items:center; gap:6px;">
                  <span>🚪 Pasport ID / JSHSHIR (Face ID Turniket)</span>
                </label>
                <input type="text" id="edit-staff-passport" class="form-control" value="${user.passport_id || ''}" placeholder="Masalan: AA1234567 yoki 14 xonali JSHSHIR" style="text-transform:uppercase; font-family:monospace; font-weight:600; letter-spacing:0.5px;">
                <small class="text-muted" style="font-size:11px;">Kampus turniketidan xodimning kirish-chiqishini avtomatik tanish uchun</small>
              </div>

              <!-- Yangi Parol -->
              <div class="form-group mb-3">
                <label class="form-label" style="font-weight:600; font-size:13px;">Yangi Parol</label>
                <div style="display:flex; gap:6px;">
                  <input type="text" id="edit-staff-password" class="form-control" placeholder="Yangi parol (o'zgartirish uchun)">
                  <button type="button" class="btn btn-outline btn-sm" onclick="generateStaffPassword('edit-staff-password')" title="Yangi tasodifiy parol generatsiya qilish" style="padding:4px 10px; font-size:11.5px; white-space:nowrap; font-weight:600; background:#F8FAFC;">
                    Tasodifiy
                  </button>
                </div>
                <small class="text-muted" style="font-size:11px;">Parolni o'zgartirmaslik uchun bu maydonni bo'sh qoldiring</small>
              </div>

              <!-- Telefon & Email -->
              <div class="grid grid-2 mb-3" style="gap:8px;">
                <div class="form-group">
                  <label class="form-label" style="font-weight:600; font-size:12px;">Telefon</label>
                  <input type="text" id="edit-staff-phone" class="form-control" value="${user.phone || ''}" placeholder="+998901234567" style="font-size:12.5px;">
                </div>
                <div class="form-group">
                  <label class="form-label" style="font-weight:600; font-size:12px;">Email</label>
                  <input type="email" id="edit-staff-email" class="form-control" value="${user.email || ''}" placeholder="xodim@akhu.uz" style="font-size:12.5px;">
                </div>
              </div>

              <!-- Telegram ma'lumotlari -->
              <div style="background:#F0F9FF; border:1px solid #BAE6FD; border-radius:10px; padding:12px; margin-bottom:14px;">
                <label style="font-weight:700; color:#0369A1; font-size:12.5px; display:flex; align-items:center; gap:6px; margin-bottom:8px;">
                  <span>🤖 Telegram Bot Sozlamalari</span>
                </label>
                <div class="grid grid-2 mb-2" style="gap:8px;">
                  <div class="form-group">
                    <label class="form-label" style="font-size:11px; color:#0369A1; font-weight:600;">Telegram Chat ID</label>
                    <input type="text" id="edit-staff-tgid" class="form-control" value="${user.telegram_user_id || ''}" placeholder="123456789" style="font-size:12px; background:white;">
                  </div>
                  <div class="form-group">
                    <label class="form-label" style="font-size:11px; color:#0369A1; font-weight:600;">Telegram Username</label>
                    <input type="text" id="edit-staff-tgusername" class="form-control" value="${user.telegram_username ? '@' + user.telegram_username.replace(/^@/, '') : ''}" placeholder="@username" style="font-size:12px; background:white;">
                  </div>
                </div>
                <div class="grid grid-2" style="gap:8px;">
                  <div class="form-group">
                    <label class="form-label" style="font-size:11px; color:#0369A1; font-weight:600;">Telegram Telefon</label>
                    <input type="text" id="edit-staff-tgphone" class="form-control" value="${user.telegram_phone || user.phone || ''}" placeholder="+998901234567" style="font-size:12px; background:white;">
                  </div>
                  <div class="form-group">
                    <label class="form-label" style="font-size:11px; color:#0369A1; font-weight:600;">Bot Holati</label>
                    <select id="edit-staff-botstatus" class="form-control" style="font-size:12px; background:white;">
                      <option value="not_started" ${user.bot_status === 'not_started' ? 'selected' : ''}>⏳ Ulanmagan (/start bosmagan)</option>
                      <option value="active" ${user.bot_status === 'active' || (!user.bot_status && user.telegram_user_id) ? 'selected' : ''}>🟢 Faol (Xabarlar boradi)</option>
                      <option value="muted" ${user.bot_status === 'muted' ? 'selected' : ''}>🔇 Muted (Ovozsiz)</option>
                      <option value="blocked" ${user.bot_status === 'blocked' ? 'selected' : ''}>🔴 Bloklangan</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Tizimda faollik holati -->
              <div class="form-group" style="padding-top:6px; border-top:1px solid var(--border-light);">
                <label style="display:flex; align-items:center; gap:10px; cursor:pointer;">
                  <input type="checkbox" id="edit-staff-active" ${isActive ? 'checked' : ''} style="width:18px; height:18px; cursor:pointer; accent-color:#059669;">
                  <div>
                    <span style="font-weight:700; font-size:13.5px; color:var(--text-main);">Tizimda Faol (Kirishga ruxsat)</span>
                    <p style="font-size:11px; color:var(--text-muted); margin:0;">Belgilanmasa xodim tizimga kira olmaydi (bloklanadi)</p>
                  </div>
                </label>
              </div>
            </div>

            <!-- KARTA 2: ROLLAR -->
            <div class="staff-card-panel">
              <h3 class="staff-card-title">
                ${icon('shield', 17)} <span>Biriktirilgan Rollar (Bo'limlar)</span>
              </h3>
              <p style="font-size:11.5px; color:var(--text-muted); margin-bottom:12px; line-height:1.4;">
                Xodimga tegishli asosiy lavozim va bo'lim vakolatlarini belgilang:
              </p>
              <div style="display:flex; flex-direction:column; gap:8px;">
                ${rolesList.map(r => {
                  const rKey = r.key || r.id;
                  const isChecked = currentRoles.includes(rKey);
                  return `
                    <label style="display:flex; align-items:flex-start; gap:10px; padding:10px 12px; border-radius:8px; border:1.5px solid ${isChecked ? '#2563EB' : '#E2E8F0'}; background:${isChecked ? '#EFF6FF' : '#FFFFFF'}; cursor:pointer; transition:all 0.15s ease;">
                      <input type="checkbox" name="edit-staff-roles-checkbox" value="${rKey}" ${isChecked ? 'checked' : ''} onchange="this.parentElement.style.borderColor = this.checked ? '#2563EB' : '#E2E8F0'; this.parentElement.style.background = this.checked ? '#EFF6FF' : '#FFFFFF';" style="width:16px; height:16px; margin-top:2px; accent-color:#2563EB; cursor:pointer;">
                      <div style="flex:1;">
                        <div style="font-weight:700; font-size:12.5px; color:#0F172A;">${r.name}</div>
                        <div style="font-size:11px; color:#64748B; margin-top:1px;">${r.desc || ''}</div>
                      </div>
                    </label>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- KARTA 3: TYUTOR GURUHLARI -->
            <div class="staff-card-panel">
              <h3 class="staff-card-title">
                ${icon('cap', 17)} <span>Tyutor Guruhlari (Select)</span>
              </h3>
              <p style="font-size:11.5px; color:var(--text-muted); margin-bottom:10px;">
                Ushbu xodim qaysi akademik guruhlarga tyutorlik qilishini belgilang:
              </p>
              <div style="display:flex; flex-wrap:wrap; gap:7px; max-height:180px; overflow-y:auto; background:#F8FAFC; padding:10px; border-radius:8px; border:1px solid #E2E8F0;">
                ${allGroups.map(g => {
                  const isSel = (userGroups || []).includes(g);
                  return `
                    <label style="cursor:pointer; display:inline-flex; align-items:center; gap:6px; background:${isSel ? '#EFF6FF' : 'white'}; border:1px solid ${isSel ? '#3B82F6' : '#CBD5E1'}; padding:5px 10px; border-radius:6px; font-size:12px; font-weight:600; user-select:none;">
                      <input type="checkbox" name="edit-staff-groups-checkbox" value="${g}" ${isSel ? 'checked' : ''} onchange="this.parentElement.style.background = this.checked ? '#EFF6FF' : 'white'; this.parentElement.style.borderColor = this.checked ? '#3B82F6' : '#CBD5E1';">
                      <span>${g}</span>
                    </label>
                  `;
                }).join('')}
              </div>
            </div>

          </div>

          <!-- RIGHT COLUMN: ALOHIDA GRANULAR RUXSATLAR (KATTA ASOSIY MAYDON) -->
          <div class="staff-edit-col-right">

            <div class="staff-card-panel" style="border-top:4px solid #2563EB;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px; margin-bottom:14px;">
                <div>
                  <h3 class="staff-card-title" style="margin-bottom:4px; border:none; padding:0; font-size:18px;">
                    🔐 Alohida Granular Ruxsatlar & Huquqlar Boshqaruvi
                  </h3>
                  <p style="font-size:12.5px; color:var(--text-muted); margin:0; line-height:1.5;">
                    Rollarga bog'lanmagan holda, tizimdagi har bir funksiyani xodimga shaxsan bering yoki olib qo'ying.
                  </p>
                </div>
                <div id="perm-total-active-badge" class="badge" style="font-size:13px; font-weight:700; padding:8px 16px; background:#EFF6FF; color:#2563EB; border:1px solid #BFDBFE;">
                  Yuklanmoqda...
                </div>
              </div>

              <!-- INFO CALLOUT -->
              <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-left:4px solid #2563EB; border-radius:8px; padding:12px 16px; margin-bottom:18px; font-size:12.5px; color:#334155; line-height:1.5;">
                💡 <b>Moslashuvchan boshqaruv:</b> Masalan, <b>Ilmiy bo'lim</b> xodimiga qo'shimcha ravishda talabalarni Exceldan import qilish yoki ball kiritish ruxsatini berishingiz mumkin. Yoki <b>Tyutor</b>ga turniket davomatini to'liq ko'rish ruxsatini berishingiz mumkin.
              </div>

              <!-- CONTROL TOOLBAR: QIDIRUV VA HAMMASINI YOQ/O'CH -->
              <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap; margin-bottom:20px; background:#FFFFFF; padding:12px; border-radius:10px; border:1px solid #E2E8F0;">
                <div class="perm-search-box" style="flex:1; min-width:240px;">
                  <span style="color:#64748B;">${icon('search', 16)}</span>
                  <input type="text" id="perm-live-search" class="perm-search-input" placeholder="Ruxsatlarni tezkor qidirish (masalan: import, ball, turniket, o'chirish)..." oninput="filterStaffPermissions(this.value)">
                  <button type="button" onclick="document.getElementById('perm-live-search').value=''; filterStaffPermissions('');" style="background:none; border:none; color:#94A3B8; cursor:pointer; font-size:14px;" title="Tozalash">✕</button>
                </div>

                <div style="display:flex; gap:8px; align-items:center;">
                  <button type="button" class="btn btn-sm btn-primary" onclick="toggleAllStaffPermissions(true)" style="font-size:12px; font-weight:600; padding:7px 14px;">
                    Hammasini Yoq
                  </button>
                  <button type="button" class="btn btn-sm btn-outline" onclick="toggleAllStaffPermissions(false)" style="font-size:12px; font-weight:600; padding:7px 14px; background:#F8FAFC;">
                    Hammasini O'ch
                  </button>
                  <button type="button" class="btn btn-sm btn-outline" onclick="applyRoleDefaultPermissions()" style="font-size:12px; font-weight:600; padding:7px 14px; color:#7C3AED; border-color:#DDD6FE; background:#F5F3FF;" title="Tanlangan rollar bo'yicha tavsiya etilgan ruxsatlarni belgilash">
                    ✨ Rol Ruxsatlarini Yuklash
                  </button>
                </div>
              </div>

              <!-- PERMISSION CATEGORIES -->
              <div id="perm-categories-container" style="display:flex; flex-direction:column; gap:16px;">
                ${PERM_CATEGORIES_DATA.map(cat => {
                  const catPermIds = cat.permissions.map(p => p.id);
                  const catActiveCount = catPermIds.filter(pid => userPerms.includes(pid)).length;

                  return `
                    <div class="perm-category-block" data-category-key="${cat.key}" style="border:1.5px solid ${cat.color}35;">
                      <!-- CATEGORY HEADER -->
                      <div class="perm-category-header" style="background:${cat.bg}; border-bottom:1px solid ${cat.color}25;">
                        <div style="display:flex; align-items:center; gap:10px;">
                          <span style="font-size:20px;">${cat.icon}</span>
                          <div>
                            <span style="font-weight:700; font-size:14px; color:#0F172A;">${cat.category}</span>
                            <span class="cat-counter-badge badge" id="cat-badge-${cat.key}" style="margin-left:8px; font-size:11px; font-weight:700; background:white; color:${cat.color}; border:1px solid ${cat.color}40;">
                              ${catActiveCount} / ${cat.permissions.length} faol
                            </span>
                          </div>
                        </div>

                        <div style="display:flex; gap:6px;">
                          <button type="button" onclick="toggleCategoryPerms('${cat.key}')" class="btn btn-sm" style="font-size:11px; font-weight:600; padding:3px 10px; border-radius:6px; background:${cat.color}; color:#FFFFFF; border:none; cursor:pointer;">
                            Barchasi
                          </button>
                        </div>
                      </div>

                      <!-- PERMISSION ITEMS GRID -->
                      <div class="perm-items-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(290px, 1fr)); gap:10px; padding:14px; background:#FAFAFA;">
                        ${cat.permissions.map(p => {
                          const isChecked = userPerms.includes(p.id);
                          return `
                            <div class="perm-item-card ${isChecked ? 'is-active' : ''}" data-perm-id="${p.id}" data-cat-key="${cat.key}" style="--card-accent:${cat.color}; --card-bg-active:${cat.bg};" onclick="togglePermCard(this, event)">
                              <label class="perm-toggle-switch" onclick="event.stopPropagation()">
                                <input type="checkbox" name="edit-staff-perm-checkbox" value="${p.id}" ${isChecked ? 'checked' : ''} data-cat="${cat.key}" onchange="onPermCheckboxChange(this)">
                                <span class="perm-toggle-slider"></span>
                              </label>
                              <div class="perm-item-content">
                                <div class="perm-title">${p.name}</div>
                                <div class="perm-desc">${p.desc || ''}</div>
                              </div>
                            </div>
                          `;
                        }).join('')}
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>

            </div>

          </div>

        </div>

        <!-- STICKY ACTION FOOTER BAR -->
        <div class="staff-sticky-footer">
          <div id="sticky-perm-summary" style="font-size:13.5px; font-weight:600; color:#334155; display:flex; align-items:center; gap:8px;">
            <span style="font-size:18px;">🔐</span>
            <span id="sticky-perm-text">Yuklanmoqda...</span>
          </div>
          <div style="display:flex; gap:12px; align-items:center;">
            <button type="button" class="btn btn-outline" onclick="navigateTo('admin-users-manage')" style="font-weight:600; padding:10px 20px;">
              Bekor Qilish
            </button>
            <button type="submit" id="btn-save-staff-page" class="btn btn-primary" style="display:inline-flex; align-items:center; gap:8px; padding:10px 26px; font-size:14px; font-weight:700; box-shadow:0 4px 14px rgba(37,99,235,0.35);">
              💾 O'zgarishlarni Saqlash
            </button>
          </div>
        </div>
      </form>
    </div>
  `;

  // Sanagichlarni boshlang'ich holatda yangilash
  setTimeout(() => updateStaffPermCounters(), 50);
}
window.renderStaffEditPage = renderStaffEditPage;

// Ruxsat kartasi ustiga bosilganda switchni almashish
function togglePermCard(cardEl, event) {
  if (event && event.target && event.target.tagName === 'INPUT') {
    return; // checkbox o'zining onchange hodisasida ishlaydi
  }
  const checkbox = cardEl.querySelector('input[type="checkbox"]');
  if (!checkbox) return;
  checkbox.checked = !checkbox.checked;
  onPermCheckboxChange(checkbox);
}
window.togglePermCard = togglePermCard;

function onPermCheckboxChange(checkbox) {
  const card = checkbox.closest('.perm-item-card');
  if (card) {
    if (checkbox.checked) {
      card.classList.add('is-active');
    } else {
      card.classList.remove('is-active');
    }
  }
  updateStaffPermCounters();
}
window.onPermCheckboxChange = onPermCheckboxChange;

// Kategoriya bo'yicha barcha ruxsatlarni yoqish yoki o'chirish
function toggleCategoryPerms(catKey, forceState) {
  const block = document.querySelector(`.perm-category-block[data-category-key="${catKey}"]`);
  if (!block) return;
  const checkboxes = Array.from(block.querySelectorAll('input[name="edit-staff-perm-checkbox"]'));
  if (checkboxes.length === 0) return;

  const targetState = forceState !== undefined ? forceState : !checkboxes.every(c => c.checked);
  checkboxes.forEach(c => {
    c.checked = targetState;
    const card = c.closest('.perm-item-card');
    if (card) {
      if (targetState) card.classList.add('is-active');
      else card.classList.remove('is-active');
    }
  });

  updateStaffPermCounters();
}
window.toggleCategoryPerms = toggleCategoryPerms;

// Barcha 34 ta ruxsatni bir vaqtda yoqish / o'chirish
function toggleAllStaffPermissions(forceState) {
  const checkboxes = Array.from(document.querySelectorAll('input[name="edit-staff-perm-checkbox"]'));
  checkboxes.forEach(c => {
    c.checked = Boolean(forceState);
    const card = c.closest('.perm-item-card');
    if (card) {
      if (forceState) card.classList.add('is-active');
      else card.classList.remove('is-active');
    }
  });

  updateStaffPermCounters();
}
window.toggleAllStaffPermissions = toggleAllStaffPermissions;

// Qidiruv bo'yicha ruxsatlarni jonli filtrlash
function filterStaffPermissions(query) {
  const q = (query || '').toLowerCase().trim();
  const blocks = document.querySelectorAll('.perm-category-block');

  blocks.forEach(block => {
    const cards = Array.from(block.querySelectorAll('.perm-item-card'));
    let matchedInBlock = 0;

    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      if (!q || text.includes(q)) {
        card.style.display = 'flex';
        matchedInBlock++;
      } else {
        card.style.display = 'none';
      }
    });

    if (matchedInBlock > 0 || !q) {
      block.style.display = 'block';
    } else {
      block.style.display = 'none';
    }
  });
}
window.filterStaffPermissions = filterStaffPermissions;

// Chap tomonda tanlangan rollarga qarab tavsiya etilgan ruxsatlarni biriktirish
function applyRoleDefaultPermissions() {
  const selectedRoles = Array.from(document.querySelectorAll('input[name="edit-staff-roles-checkbox"]:checked')).map(c => c.value);
  if (selectedRoles.length === 0) {
    showToast("Oldin chap ustunda kamida bitta rol tanlang!", "warning");
    return;
  }

  const recommendedPerms = new Set();
  selectedRoles.forEach(r => {
    if (ROLE_PERMISSIONS_PRESET[r]) {
      ROLE_PERMISSIONS_PRESET[r].forEach(p => recommendedPerms.add(p));
    }
    // dep_ bo'limlari uchun standart
    if (r && r.startsWith('dep_')) {
      ['points_enter', 'points_approve_dept', 'events_view', 'events_create', 'events_edit', 'events_qr_manage', 'attendance_view'].forEach(p => recommendedPerms.add(p));
    }
  });

  const checkboxes = Array.from(document.querySelectorAll('input[name="edit-staff-perm-checkbox"]'));
  checkboxes.forEach(c => {
    const shouldCheck = recommendedPerms.has(c.value);
    c.checked = shouldCheck;
    const card = c.closest('.perm-item-card');
    if (card) {
      if (shouldCheck) card.classList.add('is-active');
      else card.classList.remove('is-active');
    }
  });

  updateStaffPermCounters();
  showToast(`Tanlangan rollar bo'yicha ${recommendedPerms.size} ta ruxsat belgilandi!`, "info");
}
window.applyRoleDefaultPermissions = applyRoleDefaultPermissions;

// Sanagichlarni yangilash
function updateStaffPermCounters() {
  const allCheckboxes = Array.from(document.querySelectorAll('input[name="edit-staff-perm-checkbox"]'));
  const total = allCheckboxes.length;
  const checked = allCheckboxes.filter(c => c.checked).length;

  const totalBadge = document.getElementById('perm-total-active-badge');
  if (totalBadge) {
    totalBadge.textContent = checked === 0
      ? '0 / ' + total + ' ta ruxsat faol'
      : checked + ' / ' + total + ' ta ruxsat faol';
    totalBadge.style.background = checked > 0 ? '#EFF6FF' : '#F1F5F9';
    totalBadge.style.color = checked > 0 ? '#2563EB' : '#64748B';
    totalBadge.style.borderColor = checked > 0 ? '#BFDBFE' : '#CBD5E1';
  }

  const heroCount = document.getElementById('hero-perm-count');
  if (heroCount) {
    heroCount.textContent = `${checked} / ${total}`;
  }

  const stickyText = document.getElementById('sticky-perm-text');
  if (stickyText) {
    stickyText.textContent = checked === 0
      ? 'Hech qanday alohida ruxsat yoqilmagan'
      : `${checked} ta alohida granular ruxsat faol holatda (jami ${total} ta)`;
  }

  // Har bir kategoriya sonini yangilash
  PERM_CATEGORIES_DATA.forEach(cat => {
    const badge = document.getElementById(`cat-badge-${cat.key}`);
    if (badge) {
      const catCheckboxes = Array.from(document.querySelectorAll(`input[name="edit-staff-perm-checkbox"][data-cat="${cat.key}"]`));
      const catChecked = catCheckboxes.filter(c => c.checked).length;
      badge.textContent = `${catChecked} / ${catCheckboxes.length} faol`;
    }
  });
}
window.updateStaffPermCounters = updateStaffPermCounters;

// Formani saqlash (Page yoki Modal uchun universal)
async function submitStaffEditPage(userId) {
  const username = document.getElementById('edit-staff-username')?.value.trim();
  const full_name = document.getElementById('edit-staff-fullname')?.value.trim();
  const password = document.getElementById('edit-staff-password')?.value?.trim();
  const email = document.getElementById('edit-staff-email')?.value.trim();
  const phone = document.getElementById('edit-staff-phone')?.value.trim();
  const passport_id = document.getElementById('edit-staff-passport')?.value.trim().toUpperCase() || null;
  const photo_url = document.getElementById('edit-staff-photourl')?.value.trim();
  const telegram_user_id = document.getElementById('edit-staff-tgid')?.value.trim();
  const telegram_username = document.getElementById('edit-staff-tgusername')?.value.trim();
  const telegram_phone = document.getElementById('edit-staff-tgphone')?.value.trim();
  const bot_status = document.getElementById('edit-staff-botstatus')?.value;
  const is_active = document.getElementById('edit-staff-active')?.checked ? 1 : 0;

  const roles = Array.from(document.querySelectorAll(`input[name="edit-staff-roles-checkbox"]:checked`))
    .map(cb => cb.value)
    .filter(r => r && r !== 'undefined');

  const tutor_groups = Array.from(document.querySelectorAll(`input[name="edit-staff-groups-checkbox"]:checked`))
    .map(cb => cb.value.trim())
    .filter(Boolean);

  const permissions = Array.from(document.querySelectorAll(`input[name="edit-staff-perm-checkbox"]:checked`))
    .map(cb => cb.value)
    .filter(Boolean);

  if (!username) {
    showToast("Foydalanuvchi nomi (login) kiritilishi shart!", "warning");
    return;
  }
  if (!full_name) {
    showToast("F.I.Sh kiritilishi shart!", "warning");
    return;
  }
  if (roles.length === 0) {
    showToast("Kamida bitta rol tanlanishi shart!", "warning");
    return;
  }

  const submitBtn = document.getElementById('btn-save-staff-page') || document.querySelector('#common-modal .modal-footer .btn-primary');
  const originalBtnHtml = submitBtn ? submitBtn.innerHTML : null;
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `Saqlanmoqda...`;
  }

  let cleanTgId = telegram_user_id || null;
  let cleanTgUsername = telegram_username ? telegram_username.replace(/^@/, '').trim() : null;
  if (cleanTgId) {
    if (cleanTgId.toLowerCase() === 'null' || cleanTgId.toLowerCase() === 'undefined' || cleanTgId === '') {
      cleanTgId = null;
    } else if (cleanTgId.startsWith('@') || /[^0-9]/.test(cleanTgId)) {
      if (!cleanTgUsername) cleanTgUsername = cleanTgId.replace(/^@/, '').trim();
      cleanTgId = null;
    }
  }
  if (cleanTgUsername) {
    if (cleanTgUsername.toLowerCase() === 'null' || cleanTgUsername.toLowerCase() === 'undefined' || cleanTgUsername === '') {
      cleanTgUsername = null;
    }
  }
  let cleanPhone = phone ? phone.replace(/[^0-9+]/g, '') : null;
  if (cleanPhone && !cleanPhone.startsWith('+') && cleanPhone.startsWith('998')) cleanPhone = '+' + cleanPhone;
  let cleanTgPhone = telegram_phone ? telegram_phone.replace(/[^0-9+]/g, '') : (cleanPhone || null);
  if (cleanTgPhone && !cleanTgPhone.startsWith('+') && cleanTgPhone.startsWith('998')) cleanTgPhone = '+' + cleanTgPhone;

  try {
    const payload = {
      username,
      full_name,
      passport_id,
      email,
      phone: cleanPhone,
      photo_url: photo_url || null,
      telegram_user_id: cleanTgId,
      telegram_username: cleanTgUsername,
      telegram_phone: cleanTgPhone,
      bot_status: bot_status || undefined,
      active: is_active,
      is_active: is_active === 1,
      roles,
      tutor_groups,
      groups: tutor_groups,
      permissions
    };
    if (password && password.length > 0) {
      payload.password = password;
    }

    const res = await apiFetch(`/api/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });

    if (AppState.user && String(AppState.user.id) === String(userId)) {
      AppState.user.id = username;
      AppState.user.name = full_name;
      AppState.user.full_name = full_name;
      AppState.user.roles = roles;
      AppState.user.permissions = permissions;
      localStorage.setItem('akhu_auth_user', JSON.stringify(AppState.user));
    }

    showToast(res?.message || "Xodim ma'lumotlari va ruxsatlari muvaffaqiyatli saqlandi!", "success");
    await loadStaffUsersList();
    navigateTo('admin-users-manage');
  } catch (err) {
    if (submitBtn && originalBtnHtml) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHtml;
    }
    showToast(err.message, 'error');
  }
}
window.submitStaffEditPage = submitStaffEditPage;
window.handleEditStaffSubmit = submitStaffEditPage;


function generateStaffPassword(targetId) {
  const chars = 'abcdefghijkmnpqrstuvwxyz23456789';
  let pass = 'akhu_';
  for (let i = 0; i < 5; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
  const inp = document.getElementById(targetId);
  if (inp) {
    inp.value = pass;
    inp.focus();
  }
}

async function handleAdminStaffPhotoUpload(fileInput, targetUrlId, previewId) {
  const file = fileInput.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch('/api/files', {
      method: 'POST',
      headers: { 'x-user-id': AppState.user.id },
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Faylni yuklashda xatolik yuz berdi');

    const urlInput = document.getElementById(targetUrlId);
    if (urlInput) {
      urlInput.value = data.url;
      updateAdminStaffPhotoPreview(data.url, previewId);
    }
    showToast('Rasm muvaffaqiyatli yuklandi!');
  } catch (err) {
    showToast(`Xatolik: ${err.message}`, 'error');
  }
}

function updateAdminStaffPhotoPreview(url, previewId) {
  const preview = document.getElementById(previewId);
  if (!preview) return;
  if (url && url.trim()) {
    preview.src = url.trim();
    preview.style.display = 'block';
  } else {
    preview.style.display = 'none';
  }
}

// Universal xodim saqlash funksiyasi
const handleEditStaffSubmit = submitStaffEditPage;
window.handleEditStaffSubmit = handleEditStaffSubmit;

async function toggleStaffStatus(userId, currentActive) {
  const newActive = currentActive ? 0 : 1;
  const actionText = newActive ? 'faollashtirilsinmi' : 'bloklansinmi';

  if (!confirm(`Xodim ${actionText}?`)) return;

  try {
    await apiFetch(`/api/admin/users/${userId}/status`, {
      method: 'POST',
      body: JSON.stringify({ active: newActive })
    });
    showToast(`Xodim holati ${newActive ? 'faollashtirildi' : 'bloklandi'}!`);
    await loadStaffUsersList();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteStaffUser(userId) {
  const user = (adminStaffState.users || []).find(u => String(u.id) === String(userId));
  const fullName = user ? user.full_name : userId;

  if (!confirm(`Haqiqatan ham "${fullName}" xodimi tizimdan butunlay o'chirilsinmi?`)) return;

  try {
    await apiFetch(`/api/admin/users/${userId}`, {
      method: 'DELETE'
    });
    showToast("Xodim muvaffaqiyatli o'chirildi!");
    await loadStaffUsersList();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ====================================================================
// SUPERADMIN: XODIM MONITORINGI, TELEGRAM BOT VA O'CHMAS JURNAL
// ====================================================================
function formatDateTimeUz(isoStr) {
  if (!isoStr) return '-';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    return d.toLocaleString('uz-UZ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return isoStr;
  }
}

async function showStaffMonitoringModal(userId) {
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalFooter = document.getElementById('modal-footer');
  const modalContent = document.querySelector('#common-modal .modal-content');
  if (modalContent) modalContent.style.maxWidth = '920px';

  modalTitle.innerHTML = `<span style="display:flex; align-items:center; gap:8px;">${icon('shield', 20)} <span style="color:#2563EB;">Xodim Nazorati & Jonli Faoliyati</span></span>`;
  modalBody.innerHTML = `
    <div style="text-align:center; padding:50px; color:var(--text-muted);">
      <div class="spinner"></div>
      <p style="margin-top:12px; font-weight:600; font-size:14px;">Xodim ma'lumotlari, Telegram bot holati va doimiy arxiv yuklanmoqda...</p>
    </div>
  `;
  modalFooter.innerHTML = `<button class="btn btn-outline" onclick="closeModal()">Yopish</button>`;
  openModal();

  try {
    const res = await apiFetch(`/api/admin/users/${userId}/monitoring`);
    const { user, bot_info, stats, notifications = [], audit_logs = [] } = res;

    const initials = (user.full_name || '').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    const isActive = user.is_active !== undefined ? Boolean(user.is_active) : (user.active === 1);

    const validRoles = (user.roles || []).filter(r => r && r !== 'undefined');
    const roleBadges = validRoles.map(r => {
      let bg = '#F1F5F9', color = '#475569', label = r;
      if (r === 'superadmin') { bg = '#FEF2F2'; color = '#DC2626'; label = 'Superadmin'; }
      else if (r === 'prorektor') { bg = '#F5F3FF'; color = '#7C3AED'; label = 'Prorektor'; }
      else if (r === 'tutor') { bg = '#ECFDF5'; color = '#059669'; label = 'Tyutor'; }
      else if (r === 'dep_yb') { bg = '#EFF6FF'; color = '#2563EB'; label = 'Yoshlar bo\'limi'; }
      else if (r === 'dep_mb') { bg = '#FAF5FF'; color = '#9333EA'; label = 'Ma\'naviyat bo\'limi'; }
      else if (r === 'dep_ob') { bg = '#F0FDF4'; color = '#16A34A'; label = 'O\'quv bo\'limi'; }
      else if (r === 'dep_ib') { bg = '#FFFBEB'; color = '#D97706'; label = 'Ilmiy bo\'lim'; }
      else if (r === 'dep_sb') { bg = '#ECFEFF'; color = '#0891B2'; label = 'Sanoat hamkorlik'; }
      else if (r === 'dep_pb') { bg = '#FDF2F8'; color = '#DB2777'; label = 'Matbuot (PR)'; }
      else if (r === 'dep_atm') { bg = '#E0F2FE'; color = '#0284C7'; label = 'Axborot texnologiyalari markazi'; }
      else if (r === 'dep_xb') { bg = '#FEF3C7'; color = '#D97706'; label = 'Xo\'jalik bo\'limi'; }
      else if (r === 'dep_iy') { bg = '#F5F3FF'; color = '#7C3AED'; label = 'Ish yurituvchi'; }
      else if (r === 'observer') { bg = '#F8FAFC'; color = '#475569'; label = 'Kuzatuvchi'; }
      return `<span class="badge" style="background:${bg}; color:${color}; margin-right:4px; margin-bottom:4px; border:1px solid rgba(0,0,0,0.08); font-weight:600;">${label}</span>`;
    }).join('') || '<span class="text-muted">Rollar biriktirilmagan</span>';

    // Bot status badge & description
    let botStatusBadge = '';
    let botStatusDesc = '';
    const bStatus = bot_info.bot_status || (bot_info.telegram_user_id ? 'active' : 'not_started');

    if (bStatus === 'active') {
      botStatusBadge = `<span class="badge" style="background:#ECFDF5; color:#059669; border:1px solid #A7F3D0; font-size:12.5px; padding:4px 10px; font-weight:700;">🟢 Faol (Start bosgan)</span>`;
      botStatusDesc = `<span style="color:#059669; font-weight:500;">Xodim botga ulangan va barcha arizalar hamda tizim xabarlarini qabul qiladi.</span>`;
    } else if (bStatus === 'blocked' || bStatus === 'muted') {
      botStatusBadge = `<span class="badge" style="background:#FEF2F2; color:#DC2626; border:1px solid #FECACA; font-size:12.5px; padding:4px 10px; font-weight:700;">🔴 Mute / Bloklangan</span>`;
      botStatusDesc = `<span style="color:#DC2626; font-weight:700;">DIQQAT: Xodim Telegram botini o'chirib qo'ygan yoki bloklagan! Bot yuborgan bildirishnomalar yetib bormayapti.</span>`;
    } else {
      botStatusBadge = `<span class="badge" style="background:#F1F5F9; color:#64748B; border:1px solid #CBD5E1; font-size:12.5px; padding:4px 10px; font-weight:700;">⚪ Start bosmagan</span>`;
      botStatusDesc = `<span style="color:#64748B;">Xodim hali universitet Telegram botiga /start buyrug'ini yubormagan.</span>`;
    }

    modalTitle.innerHTML = `
      <div style="display:flex; align-items:center; gap:10px;">
        <span style="color:#2563EB;">${icon('shield', 22)}</span>
        <div>
          <div style="font-size:16px; font-weight:700; color:var(--text-main);">${user.full_name}</div>
          <div style="font-size:12px; color:var(--text-muted); font-weight:normal;">Login: <b>@${user.id}</b> | Nazorat & Monitoring</div>
        </div>
      </div>
    `;

    modalBody.innerHTML = `
      <!-- TOP STAFF INFO & TELEGRAM CARD -->
      <div style="display:grid; grid-template-columns: 1fr 1.3fr; gap:16px; margin-bottom:20px;">
        <!-- Karta 1: Xodim Asosiy Ma'lumotlari -->
        <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:12px; padding:16px;">
          <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
            ${user.photo_url ? `
              <img src="${user.photo_url}" style="width:52px; height:52px; border-radius:50%; object-fit:cover; border:2px solid #3B82F6;" onerror="this.outerHTML='<span class=\\'avatar-badge\\' style=\\'width:52px;height:52px;font-size:18px;\\'>${initials || 'X'}</span>'">
            ` : `
              <span class="avatar-badge" style="width:52px; height:52px; font-size:18px;">${initials || 'X'}</span>
            `}
            <div>
              <div style="font-weight:700; font-size:15px; color:#1E293B;">${user.full_name}</div>
              <div style="font-size:12px; color:#64748B;">Login: <b>${user.id}</b></div>
              <div style="margin-top:2px;">
                <span class="status-badge ${isActive ? 'badge-active' : 'badge-inactive'}" style="font-size:10.5px; padding:2px 8px;">
                  ${isActive ? 'Tizimda Faol' : 'Bloklangan'}
                </span>
              </div>
            </div>
          </div>
          <div style="font-size:12.5px; color:#334155; line-height:1.7; border-top:1px solid #E2E8F0; padding-top:10px;">
            <div>📧 <b>Email:</b> ${user.email || '<span style="color:#94A3B8;">Mavjud emas</span>'}</div>
            <div>📞 <b>Asosiy Tel:</b> ${user.phone || '<span style="color:#94A3B8;">Kiritilmagan</span>'}</div>
            <div style="margin-top:8px;">
              <div style="font-size:11.5px; font-weight:700; color:#475569; margin-bottom:4px;">Biriktirilgan Rollar:</div>
              <div style="display:flex; flex-wrap:wrap; gap:4px;">${roleBadges}</div>
            </div>
          </div>
        </div>

        <!-- Karta 2: Telegram Bot Nazorati -->
        <div style="background: linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%); border:1px solid #BAE6FD; border-radius:12px; padding:16px; position:relative;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <div style="font-weight:700; font-size:13.5px; color:#0369A1; display:flex; align-items:center; gap:6px;">
              <span>🤖</span> <span>TELEGRAM BOT NAZORATI</span>
            </div>
            <div>${botStatusBadge}</div>
          </div>

          <div style="font-size:12.5px; color:#0C4A6E; line-height:1.7; margin-bottom:12px;">
            <div>🆔 <b>Telegram ID:</b> <code style="background:white; padding:2px 6px; border-radius:4px; font-weight:700; color:#0284C7;">${bot_info.telegram_user_id || 'Ulanmagan'}</code></div>
            <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
              <span>👤 <b>Telegram Username:</b></span>
              ${bot_info.telegram_username ? `
                <a href="https://t.me/${bot_info.telegram_username.replace(/^@/, '')}" target="_blank" style="color:#0284C7; font-weight:700; text-decoration:underline;">@${bot_info.telegram_username.replace(/^@/, '')}</a>
                <button class="btn btn-xs" onclick="syncStaffTelegram('${user.id}')" title="Telegram API dan qayta tekshirish" style="padding:1px 6px; font-size:11px; background:#E0F2FE; color:#0369A1; border:1px solid #BAE6FD; border-radius:4px; cursor:pointer; font-weight:600;">🔄 Yangilash</button>
              ` : `
                <span style="color:#D97706; font-weight:600;">Kutilmoqda (botga /start bosganda avtomatik ulanadi)</span>
                <button class="btn btn-xs" onclick="syncStaffTelegram('${user.id}')" title="Telegram API dan qidirish" style="padding:2px 8px; font-size:11px; background:#0284C7; color:white; border:none; border-radius:4px; font-weight:600; cursor:pointer;">🔄 Telegramdan Olish</button>
              `}
            </div>
            <div>📱 <b>Telegram Telefon:</b> <b>${bot_info.telegram_phone || user.phone || 'Kiritilmagan'}</b></div>
            <div>⏱️ <b>Botga /start bosgan:</b> <b>${formatDateTimeUz(bot_info.bot_started_at)}</b></div>
            <div>⚡ <b>Oxirgi faollik:</b> <b>${formatDateTimeUz(bot_info.last_active_at)}</b></div>
            <div>📬 <b>Oxirgi bildirishnoma:</b> <b>${formatDateTimeUz(bot_info.last_notification_at)}</b></div>
          </div>

          ${!bot_info.telegram_username ? `
            <div style="background:#FFFBEB; border:1px solid #FDE68A; border-radius:8px; padding:8px 12px; font-size:11.5px; color:#92400E; margin-bottom:12px; line-height:1.45;">
              💡 <b>Telegram Qoidasi:</b> Telegram xavfsizlik siyosatiga binoan, bot foydalanuvchi ma'lumotlarini olishi uchun xodim kamida 1 marta rasmiy botga (<a href="https://t.me/akhu_talabalar_bot" target="_blank" style="color:#B45309; font-weight:700; text-decoration:underline;">@akhu_talabalar_bot</a>) <code>/start</code> bosishi shart. Xodim botga /start bosishi bilanoq username darhol tizimga birikadi!
            </div>
          ` : ''}

          <div style="font-size:11.5px; margin-bottom:12px;">
            ${botStatusDesc}
          </div>

          <!-- Jonli Test Xabari Yuborish Tugmasi -->
          <div style="border-top:1px solid #BAE6FD; padding-top:10px; display:flex; align-items:center; justify-content:space-between; gap:10px;">
            <button id="btn-send-staff-test-notif" class="btn btn-sm" onclick="sendStaffTestNotification('${user.id}')" style="background:#0284C7; color:white; border:none; font-weight:700; border-radius:6px; display:inline-flex; align-items:center; gap:6px; padding:6px 14px; box-shadow:0 2px 6px rgba(2,132,199,0.3);">
              <span>🔔</span> <span>Test Bildirishnoma Yuborish (Mute tekshiruvi)</span>
            </button>
            <button class="btn btn-sm" onclick="syncStaffTelegram('${user.id}')" style="background:white; color:#0369A1; border:1px solid #BAE6FD; font-weight:600; border-radius:6px; display:inline-flex; align-items:center; gap:6px; padding:6px 12px; cursor:pointer;" title="Xodimning Telegram username va holatini qayta sinxronizatsiya qilish">
              <span>🔄</span> <span>Telegramdan Olish</span>
            </button>
          </div>
          <div id="staff-test-notif-result" style="margin-top:8px; display:none;"></div>
        </div>
      </div>

      <!-- KPI METRIKALARI -->
      <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:10px; margin-bottom:20px;">
        <div style="background:#FFFFFF; border:1px solid #E2E8F0; border-radius:10px; padding:12px; border-left:4px solid #3B82F6;">
          <div style="font-size:11px; color:#64748B; font-weight:600; text-transform:uppercase;">Kiritgan Ballari</div>
          <div style="font-size:18px; font-weight:800; color:#1D4ED8; margin-top:2px;">${stats.points_created_count} ta</div>
          <div style="font-size:11px; color:#64748B;">Jami: <b>${stats.points_created_sum}</b> ball</div>
        </div>
        <div style="background:#FFFFFF; border:1px solid #E2E8F0; border-radius:10px; padding:12px; border-left:4px solid #10B981;">
          <div style="font-size:11px; color:#64748B; font-weight:600; text-transform:uppercase;">Tasdiqlagan Ballari</div>
          <div style="font-size:18px; font-weight:800; color:#047857; margin-top:2px;">${stats.points_approved_count} ta</div>
          <div style="font-size:11px; color:#64748B;">Jami: <b>${stats.points_approved_sum}</b> ball</div>
        </div>
        <div style="background:#FFFFFF; border:1px solid #E2E8F0; border-radius:10px; padding:12px; border-left:4px solid #8B5CF6;">
          <div style="font-size:11px; color:#64748B; font-weight:600; text-transform:uppercase;">Bot Bildirishnomalari</div>
          <div style="font-size:18px; font-weight:800; color:#6D28D9; margin-top:2px;">${stats.total_notifications} ta</div>
          <div style="font-size:11px; color:#64748B;">Yetkazildi: <b>${stats.delivered_notifications}</b> | Blok: <b>${stats.blocked_notifications}</b></div>
        </div>
        <div style="background:#FFFFFF; border:1px solid #E2E8F0; border-radius:10px; padding:12px; border-left:4px solid #F59E0B;">
          <div style="font-size:11px; color:#64748B; font-weight:600; text-transform:uppercase;">Doimiy Arxiv (Audit)</div>
          <div style="font-size:18px; font-weight:800; color:#B45309; margin-top:2px;">${stats.audit_actions_count} ta</div>
          <div style="font-size:11px; color:#64748B;">Hech qachon o'chmaydi</div>
        </div>
      </div>

      <!-- TABLAR: BILDIRISHNOMALAR VA AUDIT JURNALI -->
      <div style="display:flex; gap:8px; border-bottom:2px solid #E2E8F0; padding-bottom:6px; margin-bottom:14px;">
        <button id="sm-tab-btn-notifs" class="btn btn-sm btn-primary" onclick="switchStaffMonitoringSubTab('notifs')" style="font-weight:700; border-radius:6px; display:inline-flex; align-items:center; gap:6px;">
          <span>📨</span> <span>Telegram Bildirishnomalari Jurnali (${notifications.length})</span>
        </button>
        <button id="sm-tab-btn-audit" class="btn btn-sm btn-outline" onclick="switchStaffMonitoringSubTab('audit')" style="font-weight:700; border-radius:6px; display:inline-flex; align-items:center; gap:6px;">
          <span>📋</span> <span>Doimiy Faoliyat & Hatti-harakatlar Tarixi (${audit_logs.length})</span>
        </button>
      </div>

      <!-- TAB 1 CONTENT: NOTIFICATIONS -->
      <div id="sm-tab-content-notifs">
        ${notifications.length === 0 ? `
          <div style="text-align:center; padding:30px; background:#F8FAFC; border-radius:8px; color:#64748B;">
            <div style="font-size:24px; margin-bottom:6px;">📭</div>
            <p style="font-weight:600;">Hozircha ushbu xodimga Telegram bildirishnomasi yuborilmagan.</p>
            <p style="font-size:12px;">Tyutor ball kiritganda mas'ul bo'lim sifatida bildirishnoma avtomatik keladi.</p>
          </div>
        ` : `
          <div style="max-height:360px; overflow-y:auto; border:1px solid #E2E8F0; border-radius:8px;">
            <table class="data-table" style="font-size:12px;">
              <thead>
                <tr style="background:#F8FAFC;">
                  <th style="width:130px;">Vaqti</th>
                  <th style="width:140px;">Turi</th>
                  <th>Sarlavha & Mazmuni</th>
                  <th style="width:110px;">Holati</th>
                </tr>
              </thead>
              <tbody>
                ${notifications.map(n => {
                  let statusBadge = '';
                  if (n.status === 'delivered') {
                    statusBadge = `<span class="badge" style="background:#ECFDF5; color:#059669; border:1px solid #A7F3D0; font-weight:700;">🟢 Yetkazildi</span>`;
                  } else if (n.status === 'blocked') {
                    statusBadge = `<span class="badge" style="background:#FEF2F2; color:#DC2626; border:1px solid #FECACA; font-weight:700;">🔴 Bloklangan</span>`;
                  } else {
                    statusBadge = `<span class="badge" style="background:#FFFBEB; color:#D97706; border:1px solid #FDE68A; font-weight:700;">⚠️ ${n.status}</span>`;
                  }

                  let typeLabel = n.type;
                  if (n.type === 'new_point_submission') typeLabel = '✍️ Yangi Ariza (Tyutor)';
                  else if (n.type === 'test_notification') typeLabel = '🔔 Sinov (Test)';
                  else if (n.type === 'point_approved') typeLabel = '✅ Tasdiqlash';
                  else if (n.type === 'point_rejected') typeLabel = '❌ Rad etish';

                  return `
                    <tr>
                      <td style="white-space:nowrap; font-weight:600; color:#475569;">${formatDateTimeUz(n.sent_at)}</td>
                      <td><span class="badge" style="background:#EFF6FF; color:#1D4ED8; font-weight:600;">${typeLabel}</span></td>
                      <td>
                        <div style="font-weight:700; color:#1E293B;">${n.title || 'Bildirishnoma'}</div>
                        <div style="font-size:11.5px; color:#475569; margin-top:3px; max-height:48px; overflow:hidden; text-overflow:ellipsis;">
                          ${(n.message || '').replace(/<[^>]*>/g, ' ').slice(0, 150)}...
                        </div>
                        ${n.error_message ? `<div style="font-size:11px; color:#DC2626; margin-top:2px;"><b>Xato sababi:</b> ${n.error_message}</div>` : ''}
                      </td>
                      <td>${statusBadge}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>

      <!-- TAB 2 CONTENT: AUDIT LOGS -->
      <div id="sm-tab-content-audit" style="display:none;">
        ${audit_logs.length === 0 ? `
          <div style="text-align:center; padding:30px; background:#F8FAFC; border-radius:8px; color:#64748B;">
            <p style="font-weight:600;">Faoliyat tarixi mavjud emas</p>
          </div>
        ` : `
          <div style="max-height:360px; overflow-y:auto; border:1px solid #E2E8F0; border-radius:8px;">
            <table class="data-table" style="font-size:12px;">
              <thead>
                <tr style="background:#F8FAFC;">
                  <th style="width:130px;">Vaqti</th>
                  <th style="width:160px;">Amal / Action</th>
                  <th>Ob'ekt & Tafsilotlar</th>
                  <th style="width:110px;">IP Manzil</th>
                </tr>
              </thead>
              <tbody>
                ${audit_logs.map(al => {
                  let actBadge = '';
                  const a = al.action || '';
                  if (a.includes('LOGIN')) actBadge = `<span class="badge" style="background:#EFF6FF; color:#1D4ED8; font-weight:700;">🔑 Tizimga Kirish</span>`;
                  else if (a.includes('BOT_START')) actBadge = `<span class="badge" style="background:#ECFDF5; color:#059669; font-weight:700;">🤖 Botga Start</span>`;
                  else if (a.includes('BOT_LINK')) actBadge = `<span class="badge" style="background:#ECFDF5; color:#059669; font-weight:700;">📱 Bot Ulash</span>`;
                  else if (a.includes('CREATE_POINT')) actBadge = `<span class="badge" style="background:#FEF3C7; color:#D97706; font-weight:700;">➕ Ball Kiritish</span>`;
                  else if (a.includes('APPROVE')) actBadge = `<span class="badge" style="background:#ECFDF5; color:#059669; font-weight:700;">✅ Tasdiqlash</span>`;
                  else if (a.includes('REJECT')) actBadge = `<span class="badge" style="background:#FEF2F2; color:#DC2626; font-weight:700;">❌ Rad Etish</span>`;
                  else if (a.includes('UPDATE')) actBadge = `<span class="badge" style="background:#F5F3FF; color:#7C3AED; font-weight:700;">✏️ Tahrirlash</span>`;
                  else actBadge = `<span class="badge" style="background:#F1F5F9; color:#475569; font-weight:700;">${a}</span>`;

                  let details = '';
                  try {
                    if (al.details) {
                      const d = typeof al.details === 'string' ? JSON.parse(al.details) : al.details;
                      details = JSON.stringify(d);
                    }
                  } catch(e) { details = String(al.details || ''); }

                  return `
                    <tr>
                      <td style="white-space:nowrap; font-weight:600; color:#475569;">${formatDateTimeUz(al.at)}</td>
                      <td>${actBadge}</td>
                      <td>
                        <div style="font-weight:600; color:#1E293B;">${al.object_type || '-'}: <code>${al.object_id || '-'}</code></div>
                        ${details ? `<div style="font-size:11px; color:#64748B; font-family:monospace; margin-top:2px; word-break:break-all;">${details.slice(0, 120)}</div>` : ''}
                      </td>
                      <td style="color:#64748B; font-family:monospace; font-size:11px;">${al.ip || '127.0.0.1'}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;

    modalFooter.innerHTML = `
      <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
        <button class="btn btn-primary btn-sm" onclick="openStaffEditPage('${user.id}')" style="display:inline-flex; align-items:center; gap:6px;">
          ${icon('edit', 14)} <span>Tahrirlash & Huquqlar</span>
        </button>
        <button class="btn btn-outline" onclick="closeModal()">Yopish</button>
      </div>
    `;
  } catch (err) {
    modalBody.innerHTML = `
      <div style="padding:24px; text-align:center; color:#DC2626;">
        <div style="font-size:28px; margin-bottom:8px;">⚠️</div>
        <p style="font-weight:700; font-size:15px;">Ma'lumotlarni yuklashda xatolik:</p>
        <p style="font-size:13px; color:#64748B; margin-top:4px;">${err.message}</p>
      </div>
    `;
  }
}

function switchStaffMonitoringSubTab(tab) {
  const btnNotifs = document.getElementById('sm-tab-btn-notifs');
  const btnAudit = document.getElementById('sm-tab-btn-audit');
  const contentNotifs = document.getElementById('sm-tab-content-notifs');
  const contentAudit = document.getElementById('sm-tab-content-audit');

  if (tab === 'notifs') {
    if (btnNotifs) { btnNotifs.className = 'btn btn-sm btn-primary'; }
    if (btnAudit) { btnAudit.className = 'btn btn-sm btn-outline'; }
    if (contentNotifs) contentNotifs.style.display = 'block';
    if (contentAudit) contentAudit.style.display = 'none';
  } else {
    if (btnNotifs) { btnNotifs.className = 'btn btn-sm btn-outline'; }
    if (btnAudit) { btnAudit.className = 'btn btn-sm btn-primary'; }
    if (contentNotifs) contentNotifs.style.display = 'none';
    if (contentAudit) contentAudit.style.display = 'block';
  }
}

async function sendStaffTestNotification(userId) {
  const btn = document.getElementById('btn-send-staff-test-notif');
  const resultBox = document.getElementById('staff-test-notif-result');
  if (!btn || !resultBox) return;

  btn.disabled = true;
  const origText = btn.innerHTML;
  btn.innerHTML = `<span class="spinner" style="width:14px; height:14px; display:inline-block; border-width:2px; vertical-align:middle;"></span> <span style="margin-left:6px;">Yuborilmoqda...</span>`;
  resultBox.style.display = 'block';
  resultBox.innerHTML = `<div style="padding:8px 12px; background:#EFF6FF; border:1px solid #BFDBFE; border-radius:6px; font-size:12px; color:#1E3A8A;">Bot orqali sinov xabari yuborilmoqda, kuting...</div>`;

  try {
    const res = await apiFetch(`/api/admin/users/${userId}/test-notification`, {
      method: 'POST'
    });
    if (res.status === 'delivered') {
      resultBox.innerHTML = `
        <div style="padding:10px 14px; background:#ECFDF5; border:1px solid #A7F3D0; border-radius:6px; font-size:12.5px; color:#065F46; font-weight:700; display:flex; align-items:center; gap:8px;">
          <span>✅</span> 
          <span>${res.message || 'Sinov xabari muvaffaqiyatli yetkazildi! Xodim botni faol kuzatmoqda.'}</span>
        </div>
      `;
    } else if (res.status === 'blocked') {
      resultBox.innerHTML = `
        <div style="padding:10px 14px; background:#FEF2F2; border:1px solid #FECACA; border-radius:6px; font-size:12.5px; color:#991B1B; font-weight:700; display:flex; align-items:center; gap:8px;">
          <span>🔴</span> 
          <span>DIQQAT: Xodim botni bloklagan yoki ovozini o'chirgan (Mute/Blocked)! Xabar yetib bormadi.</span>
        </div>
      `;
    } else {
      resultBox.innerHTML = `
        <div style="padding:10px 14px; background:#FFFBEB; border:1px solid #FDE68A; border-radius:6px; font-size:12.5px; color:#92400E;">
          Holat: ${res.status || 'Noma\'lum'}. ${res.message || ''}
        </div>
      `;
    }

    // Refresh monitoring details after 1.5 seconds
    setTimeout(() => {
      showStaffMonitoringModal(userId);
    }, 1500);
  } catch (err) {
    resultBox.innerHTML = `
      <div style="padding:10px 14px; background:#FEF2F2; border:1px solid #FECACA; border-radius:6px; font-size:12.5px; color:#991B1B;">
        <strong>Xatolik:</strong> ${err.message}
      </div>
    `;
    btn.disabled = false;
    btn.innerHTML = origText;
  }
}

async function autoFetchTgUsername(inputId, targetUsernameId, statusId) {
  const idInput = document.getElementById(inputId);
  const uInput = document.getElementById(targetUsernameId);
  const statusBox = document.getElementById(statusId);
  if (!idInput || !idInput.value.trim()) return;

  const val = idInput.value.trim();
  // Agar foydalanuvchi Telegram ID maydoniga @username yoki matn yozgan bo'lsa
  if (val.startsWith('@') || /[^0-9]/.test(val)) {
    const cleanU = val.replace(/^@/, '');
    if (uInput && (!uInput.value || !uInput.value.trim())) {
      uInput.value = cleanU;
    }
    idInput.value = '';
    if (statusBox) statusBox.innerHTML = `<span style="color:#2563EB;">💡 @${cleanU} username maydoniga o'tkazildi. Telegram ID botga /start bosganda avtomatik olinadi!</span>`;
    return;
  }

  if (statusBox) statusBox.innerHTML = '<span style="color:#2563EB;">🔍 Telegram tekshirilmoqda...</span>';

  try {
    const res = await apiFetch(`/api/admin/telegram-resolve?target=${encodeURIComponent(val)}`);
    if (res.success && res.username) {
      if (uInput) uInput.value = res.username;
      if (statusBox) statusBox.innerHTML = `<span style="color:#059669; font-weight:600;">✅ Topildi: @${res.username} (${res.firstName || ''})</span>`;
    } else if (res.not_started) {
      if (statusBox) statusBox.innerHTML = `<span style="color:#D97706;">ℹ️ Xodim botga /start bosganda avtomatik ulanadi</span>`;
    } else {
      if (statusBox) statusBox.innerHTML = `<span style="color:#64748B;">ℹ️ ID kiritildi</span>`;
    }
  } catch(e) {
    if (statusBox) statusBox.innerHTML = '';
  }
}

async function syncStaffTelegram(userId) {
  const resultBox = document.getElementById('staff-test-notif-result');
  if (resultBox) {
    resultBox.style.display = 'block';
    resultBox.innerHTML = `<div style="padding:8px 12px; background:#EFF6FF; border:1px solid #BFDBFE; border-radius:6px; font-size:12px; color:#1E3A8A;"><span class="spinner" style="width:12px; height:12px; display:inline-block; border-width:2px; vertical-align:middle; margin-right:6px;"></span> Telegram API orqali ma'lumotlar olinmoqda...</div>`;
  }

  try {
    const res = await apiFetch(`/api/admin/users/${userId}/sync-telegram`, { method: 'POST' });
    if (res.success) {
      if (resultBox) {
        resultBox.innerHTML = `
          <div style="padding:10px 14px; background:#ECFDF5; border:1px solid #A7F3D0; border-radius:6px; font-size:12.5px; color:#065F46; font-weight:700;">
            ✅ ${res.message || 'Telegram ma\'lumotlari muvaffaqiyatli yangilandi!'}
          </div>
        `;
      }
      setTimeout(() => {
        showStaffMonitoringModal(userId);
        loadStaffUsersList();
      }, 1200);
    } else {
      if (resultBox) {
        resultBox.innerHTML = `
          <div style="padding:10px 14px; background:#FFFBEB; border:1px solid #FDE68A; border-radius:6px; font-size:12px; color:#92400E; line-height:1.45;">
            ℹ️ ${res.message || res.error || 'Chat topilmadi'}
          </div>
        `;
      }
    }
  } catch (err) {
    if (resultBox) {
      resultBox.innerHTML = `
        <div style="padding:10px 14px; background:#FEF2F2; border:1px solid #FECACA; border-radius:6px; font-size:12.5px; color:#991B1B;">
          ❌ <b>Xatolik:</b> ${err.message}
        </div>
      `;
    }
  }
}

window.showCreateStaffModal = showCreateStaffModal;
window.handleCreateStaffSubmit = handleCreateStaffSubmit;
window.showEditStaffModal = showEditStaffModal;
window.handleEditStaffSubmit = handleEditStaffSubmit;
window.toggleStaffStatus = toggleStaffStatus;
window.deleteStaffUser = deleteStaffUser;
window.resetStaffFilters = resetStaffFilters;
window.showStaffMonitoringModal = showStaffMonitoringModal;
window.switchStaffMonitoringSubTab = switchStaffMonitoringSubTab;
window.sendStaffTestNotification = sendStaffTestNotification;
window.autoFetchTgUsername = autoFetchTgUsername;
window.syncStaffTelegram = syncStaffTelegram;

// ====================================================================
// SUPERADMIN: XODIM SIFATIDA TIZIMNI TEKSHIRISH (IMPERSONATION)
// ====================================================================
function impersonateStaffUser(userId) {
  const user = (adminStaffState.users || []).find(u => String(u.id) === String(userId));
  if (!user) {
    alert("Xodim topilmadi!");
    return;
  }

  // Asl superadmin hisobini eslab qolish
  if (!sessionStorage.getItem('akhu_original_admin')) {
    sessionStorage.setItem('akhu_original_admin', JSON.stringify(AppState.user));
  }

  let roles = [];
  try { roles = typeof user.roles === 'string' ? JSON.parse(user.roles) : user.roles; } catch(e) { roles = [user.roles]; }

  AppState.isLoggedIn = true;
  AppState.user = {
    id: user.id,
    name: user.full_name,
    full_name: user.full_name,
    roles: roles || [],
    email: user.email,
    groups: user.tutor_groups || []
  };
  AppState.currentRole = roles[0] || 'staff';
  AppState.isImpersonating = true;

  updateAuthUI();
  updateSidebarPermissions();
  showImpersonationBanner(user.full_name, roles);

  // Roliga mos asosiy kabinetga o'tish
  if (roles.includes('tutor')) {
    navigateTo('tutor-my-students');
  } else if (roles.includes('prorektor')) {
    navigateTo('prorektor-queue');
  } else if (roles.includes('dep_ob')) {
    navigateTo('dept-students-manage');
  } else if (roles.some(r => r.startsWith('dep_'))) {
    navigateTo('dept-approvals');
  } else {
    navigateTo('observe-dashboard');
  }
}

function showImpersonationBanner(name, roles) {
  let banner = document.getElementById('impersonation-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'impersonation-banner';
    banner.style.cssText = "background: #FEF3C7; border-bottom: 2px solid #F59E0B; color: #92400E; padding: 10px 20px; display: flex; justify-content: space-between; align-items: center; font-size: 13px; font-weight: 600; position: sticky; top: 0; z-index: 999; box-shadow: 0 2px 4px rgba(0,0,0,0.05);";
    const mainWrap = document.querySelector('.main-wrapper') || document.body;
    mainWrap.insertBefore(banner, mainWrap.firstChild);
  }

  banner.innerHTML = `
    <div style="display:flex; align-items:center; gap:8px;">
      <span style="display:inline-flex; align-items:center; color:#B45309;">${icon('eye', 17)}</span>
      <span>TEKSHIRUV REJIMI: Siz <u>${name}</u> (${roles.join(', ')}) sifatida tizimni ko'zdan kechirmoqdasiz</span>
    </div>
    <button onclick="exitImpersonation()" style="background:#DC2626; color:white; border:none; padding:6px 14px; border-radius:6px; font-size:12px; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:6px;">
      ${icon('arrowLeft', 13)} <span>Superadminga Qaytish</span>
    </button>
  `;
}

function exitImpersonation() {
  const orig = sessionStorage.getItem('akhu_original_admin');
  if (orig) {
    try {
      const u = JSON.parse(orig);
      AppState.user = u;
      AppState.currentRole = 'superadmin';
      AppState.isImpersonating = false;
      sessionStorage.removeItem('akhu_original_admin');

      const banner = document.getElementById('impersonation-banner');
      if (banner) banner.remove();

      updateAuthUI();
      updateSidebarPermissions();
      navigateTo('admin-users-manage');
      alert("Superadmin profiliga muvaffaqiyatli qaytildi!");
    } catch(e) {
      location.reload();
    }
  } else {
    location.reload();
  }
}

// ====================================================================
// DARSLAR & DAVOMAT TIZIMI (LMS VA TURNIKET YAGONA SUPER-PANELI)
// ====================================================================
let unifiedAttState = {
  currentTab: 'timetable', // 'timetable' | 'lms_attendance' | 'group_ranking' | 'turniket' | 'cross_audit'
  timetableMode: 'today', // 'today' | 'tomorrow' | 'week'
  period: 'day',
  date: new Date().toISOString().slice(0, 10),
  group: '',
  weekday: 0,
  auditCategory: 'all',
  auditCourse: '',
  auditGroup: '',
  search: '',
  timetableSearch: ''
};


async function renderUnifiedAttendance(targetContainer) {
  targetContainer.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:16px;">
      
      <!-- YUQORI BOSHQARUV VA TABLAR PANELI -->
      <div style="background:#FFFFFF; border:1px solid #E2E8F0; border-radius:14px; padding:16px 20px; box-shadow:0 2px 8px rgba(0,0,0,0.03);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:14px;">
          <div>
            <h2 style="font-size:18px; font-weight:800; color:#0F172A; margin:0 0 4px; display:flex; align-items:center; gap:8px;">
              <span>🏛️ Darslar & Davomat Tizimi</span>
              <span class="badge" style="background:#EFF6FF; color:#1D4ED8; font-size:11px; font-weight:700; border:1px solid #BFDBFE;">LMS & Turniket Nazorati</span>
            </h2>
            <div style="font-size:12.5px; color:#64748B;">
              Haftalik dars jadvali, Moodle LMS davomati, guruhlar reytingi, Turniket Face ID va davomat mutanosibligi auditi
            </div>
          </div>

          <div style="display:flex; align-items:center; gap:8px;">
            <button class="btn btn-outline btn-sm" onclick="triggerHikPhotosSync(this)" style="font-size:12px; display:inline-flex; align-items:center; gap:6px;">
              📸 <span>Rasmlar</span>
            </button>
            <button class="btn btn-outline btn-sm" onclick="triggerHikCentralSync()" style="font-size:12px; display:inline-flex; align-items:center; gap:6px;">
              ${icon('refresh', 13)} <span>Sinxronlash</span>
            </button>
            <span id="unified-live-badge" style="font-size:11px; font-weight:600; color:#15803D; background:#DCFCE7; border:1px solid #BBF7D0; padding:4px 10px; border-radius:20px; display:inline-flex; align-items:center; gap:6px;">
              <span style="display:inline-block; width:7px; height:7px; border-radius:50%; background:#22C55E;"></span>
              <span>Jonli Tizim</span>
            </span>
          </div>
        </div>

        <!-- 5 TA ASOSIY BO'LIM TUGMALARI (NAV SWITCHER) -->
        <div style="display:flex; gap:8px; border-top:1px solid #F1F5F9; padding-top:14px; flex-wrap:wrap;">
          <button id="btn-u-timetable" class="btn btn-sm ${unifiedAttState.currentTab === 'timetable' ? 'btn-primary' : 'btn-outline'}" onclick="switchUnifiedAttTab('timetable')" style="display:inline-flex; align-items:center; gap:6px; font-weight:700; font-size:12.5px; padding:7px 14px; border-radius:8px;">
            <span>📅 Haftalik Dars Jadvali</span>
          </button>

          <button id="btn-u-lms_attendance" class="btn btn-sm ${unifiedAttState.currentTab === 'lms_attendance' ? 'btn-primary' : 'btn-outline'}" onclick="switchUnifiedAttTab('lms_attendance')" style="display:inline-flex; align-items:center; gap:6px; font-weight:700; font-size:12.5px; padding:7px 14px; border-radius:8px;">
            <span>📊 LMS Davomati</span>
          </button>

          <button id="btn-u-group_ranking" class="btn btn-sm ${unifiedAttState.currentTab === 'group_ranking' ? 'btn-primary' : 'btn-outline'}" onclick="switchUnifiedAttTab('group_ranking')" style="display:inline-flex; align-items:center; gap:6px; font-weight:700; font-size:12.5px; padding:7px 14px; border-radius:8px;">
            <span>👥 Guruhlar Davomati</span>
          </button>

          <button id="btn-u-turniket" class="btn btn-sm ${unifiedAttState.currentTab === 'turniket' ? 'btn-primary' : 'btn-outline'}" onclick="switchUnifiedAttTab('turniket')" style="display:inline-flex; align-items:center; gap:6px; font-weight:700; font-size:12.5px; padding:7px 14px; border-radius:8px;">
            <span>🚪 Turniket Davomati (Face ID)</span>
          </button>

          <button id="btn-u-cross_audit" class="btn btn-sm ${unifiedAttState.currentTab === 'cross_audit' ? 'btn-primary' : 'btn-outline'}" onclick="switchUnifiedAttTab('cross_audit')" style="display:inline-flex; align-items:center; gap:6px; font-weight:700; font-size:12.5px; padding:7px 14px; border-radius:8px; ${unifiedAttState.currentTab === 'cross_audit' ? '' : 'background:#EFF6FF; color:#1D4ED8; border-color:#93C5FD;'}">
            <span>⚖️ Turniket & LMS Mutanosibligi</span>
          </button>
        </div>
      </div>

      <!-- TANLANGAN TAB KONTENTI -->
      <div id="unified-att-tab-body">
        <div style="padding:40px; text-align:center;"><div class="spinner" style="margin:0 auto 10px;"></div>Ma'lumotlar yuklanmoqda...</div>
      </div>

    </div>
  `;

  await switchUnifiedAttTab(unifiedAttState.currentTab);
}

async function switchUnifiedAttTab(tabName) {
  unifiedAttState.currentTab = tabName;
  const tabs = ['timetable', 'lms_attendance', 'group_ranking', 'turniket', 'cross_audit'];
  tabs.forEach(t => {
    const btn = document.getElementById(`btn-u-${t}`);
    if (btn) {
      if (t === tabName) {
        btn.classList.add('btn-primary');
        btn.classList.remove('btn-outline');
        if (t === 'cross_audit') {
          btn.style.background = '';
          btn.style.color = '';
        }
      } else {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-outline');
        if (t === 'cross_audit') {
          btn.style.background = '#EFF6FF';
          btn.style.color = '#1D4ED8';
          btn.style.borderColor = '#93C5FD';
        }
      }
    }
  });

  const body = document.getElementById('unified-att-tab-body');
  if (!body) return;

  if (tabName === 'timetable') {
    await renderUnifiedTimetableTab(body);
  } else if (tabName === 'lms_attendance') {
    await renderUnifiedLmsOverviewTab(body);
  } else if (tabName === 'group_ranking') {
    await renderUnifiedGroupsRankingTab(body);
  } else if (tabName === 'turniket') {
    await renderCampusAttendance(body);
  } else if (tabName === 'cross_audit') {
    await renderUnifiedCrossAuditTab(body);
  }
}

// 1. HAFTALIK DARS JADVALI TABI (TIMETABLE)
async function renderUnifiedTimetableTab(container) {
  container.innerHTML = `
    <div style="display:flex; justify-content:center; align-items:center; min-height:220px;">
      <div class="spinner"></div>
      <span style="margin-left:10px; font-weight:600; color:#64748B;">Dars jadvali yuklanmoqda...</span>
    </div>
  `;

  try {
    const [ttRes, grpRes] = await Promise.all([
      apiFetch('/api/lms/timetable'),
      apiFetch('/api/admin/groups-list').catch(() => ({ groups: [] }))
    ]);

    cachedLmsTimetable = ttRes;
    const groupsList = Array.isArray(grpRes.groups) ? grpRes.groups : [];

    const dayStr = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Tashkent', weekday: 'short' }).format(new Date());

    const dayMap = { 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6, 'Sun': 7 };
    const currentWeekday = dayMap[dayStr] || 1;

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:16px;">
        <!-- FILTRLAR VA REJIM TANLASH PANELI -->
        <div class="card" style="background:#FFFFFF; border:1px solid #E2E8F0; border-radius:12px; padding:16px 20px; box-shadow:0 1px 3px rgba(0,0,0,0.03);">
          
          <!-- YUQORI REJIM TUGMALARI (BUGUN, ERTAGA, HAFTALIK) -->
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:14px; padding-bottom:12px; border-bottom:1px solid #F1F5F9;">
            <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
              <span style="font-size:11.5px; font-weight:800; color:#475569; text-transform:uppercase; letter-spacing:0.5px;">Tanlov:</span>
              <button id="btn-mode-today" class="btn btn-sm ${unifiedAttState.timetableMode === 'today' ? 'btn-primary' : 'btn-outline'}" onclick="switchTimetableMode('today')">
                ⚡ Bugungi darslar (${ttRes.today?.date ? ttRes.today.date.slice(8,10) + '-oktabr' : 'Bugun'}) <span class="badge" style="background:#22C55E; color:white; margin-left:4px;">${ttRes.today?.count || 0} ta</span>
              </button>
              <button id="btn-mode-tomorrow" class="btn btn-sm ${unifiedAttState.timetableMode === 'tomorrow' ? 'btn-primary' : 'btn-outline'}" onclick="switchTimetableMode('tomorrow')">
                ⏩ Ertangi darslar (${ttRes.tomorrow?.date ? ttRes.tomorrow.date.slice(8,10) + '-oktabr' : 'Ertaga'}) <span class="badge" style="background:#3B82F6; color:white; margin-left:4px;">${ttRes.tomorrow?.count || 0} ta</span>
              </button>
              <button id="btn-mode-week" class="btn btn-sm ${unifiedAttState.timetableMode === 'week' ? 'btn-primary' : 'btn-outline'}" onclick="switchTimetableMode('week')">
                🗓️ Haftalik umumiy jadval
              </button>
            </div>

            <div style="font-size:11.5px; font-weight:700; background:#F8FAFC; color:#0369A1; border:1px solid #BAE6FD; padding:4px 10px; border-radius:6px;">
              🎓 2026-2027 O'quv yili (Fall 26/27)
            </div>
          </div>

          <!-- QUYI FILTRLAR (GURUH, HAFTA KUNI, QIDIRUV) -->
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
            <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
              <!-- Guruh tanlash -->
              <div style="display:flex; align-items:center; gap:6px;">
                <span style="font-size:12px; font-weight:700; color:#475569;">🎓 Guruh:</span>
                <select id="u-tt-group-select" class="form-control" onchange="handleUnifiedTimetableFilter()" style="font-size:12.5px; padding:5px 8px; border-radius:6px; min-width:130px;">
                  <option value="">Barcha guruhlar</option>
                  ${groupsList.map(g => `<option value="${g}" ${unifiedAttState.group === g ? 'selected' : ''}>${g}</option>`).join('')}
                </select>
              </div>

              <!-- Hafta kunlari tugmalari (faqat Haftalik rejimda yoki ixtiyoriy kun tanlashda) -->
              <div style="display:${unifiedAttState.timetableMode === 'week' ? 'flex' : 'none'}; gap:4px; flex-wrap:wrap;" id="u-tt-weekday-buttons">
                <button class="btn btn-sm ${unifiedAttState.weekday === 0 ? 'btn-primary' : 'btn-outline'}" onclick="handleUnifiedTtDay(0, this)">Hafta (Barchasi)</button>
                <button class="btn btn-sm ${unifiedAttState.weekday === 1 ? 'btn-primary' : 'btn-outline'}" onclick="handleUnifiedTtDay(1, this)">Dush ${currentWeekday === 1 ? '●' : ''}</button>
                <button class="btn btn-sm ${unifiedAttState.weekday === 2 ? 'btn-primary' : 'btn-outline'}" onclick="handleUnifiedTtDay(2, this)">Sesh ${currentWeekday === 2 ? '●' : ''}</button>
                <button class="btn btn-sm ${unifiedAttState.weekday === 3 ? 'btn-primary' : 'btn-outline'}" onclick="handleUnifiedTtDay(3, this)">Chor ${currentWeekday === 3 ? '●' : ''}</button>
                <button class="btn btn-sm ${unifiedAttState.weekday === 4 ? 'btn-primary' : 'btn-outline'}" onclick="handleUnifiedTtDay(4, this)">Pay ${currentWeekday === 4 ? '●' : ''}</button>
                <button class="btn btn-sm ${unifiedAttState.weekday === 5 ? 'btn-primary' : 'btn-outline'}" onclick="handleUnifiedTtDay(5, this)">Juma ${currentWeekday === 5 ? '●' : ''}</button>
                <button class="btn btn-sm ${unifiedAttState.weekday === 6 ? 'btn-primary' : 'btn-outline'}" onclick="handleUnifiedTtDay(6, this)">Shan ${currentWeekday === 6 ? '●' : ''}</button>
              </div>
            </div>

            <!-- Qidiruv -->
            <div>
              <input type="text" id="u-tt-search-input" value="${unifiedAttState.timetableSearch}" placeholder="🔍 Fan, o'qituvchi yoki xona..." oninput="handleUnifiedTimetableFilter()" class="form-control" style="font-size:12.5px; padding:5px 10px; border-radius:6px; width:220px;">
            </div>
          </div>
        </div>

        <!-- DARSLAR RO'YXATI GRIDI -->
        <div id="u-tt-grid" style="display:flex; flex-direction:column; gap:16px;">
          <!-- Dinamik kunlar -->
        </div>
      </div>
    `;

    renderUnifiedTimetableDays(cachedLmsTimetable);
  } catch (err) {
    container.innerHTML = `<div class="card" style="padding:30px; text-align:center; color:#EF4444;">Dars jadvali yuklanmadi: ${err.message}</div>`;
  }
}

function switchTimetableMode(mode) {
  unifiedAttState.timetableMode = mode;
  ['today', 'tomorrow', 'week'].forEach(m => {
    const btn = document.getElementById(`btn-mode-${m}`);
    if (btn) {
      if (m === mode) {
        btn.classList.add('btn-primary');
        btn.classList.remove('btn-outline');
      } else {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-outline');
      }
    }
  });

  const weekdayPills = document.getElementById('u-tt-weekday-buttons');
  if (weekdayPills) {
    weekdayPills.style.display = (mode === 'week') ? 'flex' : 'none';
  }

  if (cachedLmsTimetable) {
    renderUnifiedTimetableDays(cachedLmsTimetable);
  }
}

function renderLessonCard(l) {
  const isLab = /lab|laboratoriya/i.test(l.subject_name);
  const isLecture = /lecture|ma'ruza/i.test(l.subject_name);
  const typeLabel = isLab ? '🔬 Lab' : (isLecture ? '🎓 Ma\'ruza' : '✏️ Amaliyot');

  return `
    <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:12px 14px; display:flex; flex-direction:column; gap:6px;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="background:#0F172A; color:white; font-weight:800; font-size:11.5px; padding:3px 8px; border-radius:6px; font-family:monospace;">
          🕒 ${l.time_str}
        </span>
        <div style="display:flex; align-items:center; gap:6px;">
          ${l.group_code ? `<span style="font-size:10.5px; font-weight:800; background:#EEF2FF; color:#4F46E5; border:1px solid #C7D2FE; padding:2px 7px; border-radius:6px;" title="${l.group_name || ''}">👥 ${l.group_code}</span>` : ''}
          <span style="font-size:11px; font-weight:700; color:#475569; background:#FFFFFF; border:1px solid #E2E8F0; padding:2px 7px; border-radius:6px;">
            ${typeLabel}
          </span>
        </div>
      </div>
      <div style="font-size:13.5px; font-weight:700; color:#0F172A; line-height:1.35; margin-top:2px;">
        ${l.subject_name}
      </div>
      <div style="font-size:12px; color:#475569; margin-top:3px; display:flex; flex-direction:column; gap:4px;">
        <span>👨‍🏫 <b>Ustoz:</b> <span style="font-weight:600; color:#1E293B;">${l.teacher_name || 'Belgilanmagan'}</span></span>
        <span style="display:flex; align-items:center; gap:5px;">
          📍 <b>Xona:</b>
          ${l.room ? `<span style="font-weight:700; background:#DCFCE7; color:#15803D; border:1px solid #BBF7D0; padding:2px 8px; border-radius:6px;">🏢 ${l.room}</span>` : `<span style="color:#94A3B8; font-style:italic;">Ko'rsatilmagan</span>`}
        </span>
        ${l.group_name ? `<span>👥 <b>Guruh:</b> <span style="color:#4338CA; font-weight:600;">${l.group_name}</span></span>` : ''}
      </div>
    </div>
  `;
}

function renderUnifiedTimetableDays(ttData) {
  const container = document.getElementById('u-tt-grid');
  if (!container || !ttData) return;

  const mode = unifiedAttState.timetableMode || 'today';
  const selectedDay = unifiedAttState.weekday || 0;
  const search = (unifiedAttState.timetableSearch || '').toLowerCase().trim();
  const group = (unifiedAttState.group || '').toLowerCase().trim();

  const filterList = (lessons) => {
    let list = lessons || [];
    if (search) {
      list = list.filter(l => 
        (l.subject_name || '').toLowerCase().includes(search) ||
        (l.teacher_name || '').toLowerCase().includes(search) ||
        (l.room || '').toLowerCase().includes(search) ||
        (l.group_name || '').toLowerCase().includes(search) ||
        (l.group_code || '').toLowerCase().includes(search)
      );
    }
    if (group) {
      list = list.filter(l => 
        (l.group_code || '').toLowerCase().includes(group) ||
        (l.group_name || '').toLowerCase().includes(group) ||
        (l.subject_code || '').toLowerCase().includes(group) ||
        (l.subject_name || '').toLowerCase().includes(group)
      );
    }
    return list;
  };

  let html = '';

  // 1. BUGUNGI DARSLAR REJIMI
  if (mode === 'today') {
    const today = ttData.today || { lessons: [] };
    const lessons = filterList(today.lessons);

    html = `
      <div class="tt-day-card" style="background:#FFFFFF; border:2px solid #22C55E; border-radius:12px; padding:18px; box-shadow:0 2px 8px rgba(34,197,94,0.06);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; border-bottom:1px solid #F1F5F9; padding-bottom:10px;">
          <h4 style="font-size:16px; font-weight:800; color:#166534; margin:0; display:flex; align-items:center; gap:8px;">
            <span>⚡ Bugungi Dars Jadvali (${today.date || ''} - ${today.weekday || 'Bugun'})</span>
            <span class="badge" style="background:#DCFCE7; color:#15803D; font-size:11px; font-weight:800; padding:3px 8px;">Jonli Jadval</span>
          </h4>
          <span class="badge" style="background:#F1F5F9; color:#475569; font-weight:700; font-size:12px;">${lessons.length} ta dars</span>
        </div>

        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap:12px;">
          ${lessons.length === 0 ? `
            <div style="color:#94A3B8; font-size:13px; padding:16px; text-align:center; grid-column: 1 / -1;">
              Bugun uchun dars jadvali topilmadi yoki filtr bo'yicha dars yo'q.
            </div>
          ` : lessons.map(renderLessonCard).join('')}
        </div>
      </div>
    `;
    container.innerHTML = html;
    return;
  }

  // 2. ERTANGI DARSLAR REJIMI
  if (mode === 'tomorrow') {
    const tomorrow = ttData.tomorrow || { lessons: [] };
    const lessons = filterList(tomorrow.lessons);

    html = `
      <div class="tt-day-card" style="background:#FFFFFF; border:2px solid #3B82F6; border-radius:12px; padding:18px; box-shadow:0 2px 8px rgba(59,130,246,0.06);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; border-bottom:1px solid #F1F5F9; padding-bottom:10px;">
          <h4 style="font-size:16px; font-weight:800; color:#1D4ED8; margin:0; display:flex; align-items:center; gap:8px;">
            <span>⏩ Ertangi Dars Jadvali (${tomorrow.date || ''} - ${tomorrow.weekday || 'Ertaga'})</span>
            <span class="badge" style="background:#EFF6FF; color:#1D4ED8; font-size:11px; font-weight:800; padding:3px 8px;">Rejalashtirilgan</span>
          </h4>
          <span class="badge" style="background:#F1F5F9; color:#475569; font-weight:700; font-size:12px;">${lessons.length} ta dars</span>
        </div>

        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap:12px;">
          ${lessons.length === 0 ? `
            <div style="color:#94A3B8; font-size:13px; padding:16px; text-align:center; grid-column: 1 / -1;">
              Ertaga uchun dars jadvali topilmadi yoki filtr bo'yicha dars yo'q.
            </div>
          ` : lessons.map(renderLessonCard).join('')}
        </div>
      </div>
    `;
    container.innerHTML = html;
    return;
  }

  // 3. HAFTALIK UMUMIY JADVAL REJIMI
  const groupedDays = ttData.grouped_by_weekday || [];
  const dayStr = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Tashkent', weekday: 'short' }).format(new Date());
  const dayMap = { 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6, 'Sun': 7 };
  const currentWeekday = dayMap[dayStr] || 1;

  groupedDays.forEach(day => {
    if (selectedDay !== 0 && day.weekday !== selectedDay) return;

    const lessons = filterList(day.lessons);
    const isToday = day.weekday === currentWeekday;

    html += `
      <div class="tt-day-card" style="background:#FFFFFF; border:1px solid ${isToday ? '#93C5FD' : '#E2E8F0'}; border-radius:12px; padding:16px; box-shadow:0 1px 4px rgba(0,0,0,0.03);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid #F1F5F9; padding-bottom:8px;">
          <h4 style="font-size:15px; font-weight:800; color:${isToday ? '#1D4ED8' : '#1E293B'}; margin:0; display:flex; align-items:center; gap:8px;">
            <span>📅 ${day.name}</span>
            ${isToday ? '<span class="badge" style="background:#DCFCE7; color:#15803D; font-size:10px; font-weight:700;">Bugun</span>' : ''}
          </h4>
          <span class="badge" style="background:#F1F5F9; color:#475569; font-weight:700; font-size:11px;">${lessons.length} ta dars</span>
        </div>

        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap:12px;">
          ${lessons.length === 0 ? `
            <div style="color:#94A3B8; font-size:12.5px; padding:10px;">Ushbu mezonlar bo'yicha darslar topilmadi</div>
          ` : lessons.map(renderLessonCard).join('')}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function handleUnifiedTtDay(dayNumber, btn) {
  unifiedAttState.weekday = dayNumber;
  document.querySelectorAll('#u-tt-weekday-buttons button').forEach(b => {
    b.classList.remove('btn-primary');
    b.classList.add('btn-outline');
  });
  if (btn) {
    btn.classList.add('btn-primary');
    btn.classList.remove('btn-outline');
  }
  if (cachedLmsTimetable) {
    renderUnifiedTimetableDays(cachedLmsTimetable);
  }
}

function handleUnifiedTimetableFilter() {
  const grpSelect = document.getElementById('u-tt-group-select');
  const searchInput = document.getElementById('u-tt-search-input');
  if (grpSelect) unifiedAttState.group = grpSelect.value;
  if (searchInput) unifiedAttState.timetableSearch = searchInput.value;
  if (cachedLmsTimetable) {
    renderUnifiedTimetableDays(cachedLmsTimetable);
  }
}

// 2. LMS DAVOMATI TABI (KUNLIK / HAFTALIK / OYLIK)

async function renderUnifiedLmsOverviewTab(container) {
  container.innerHTML = `
    <div style="display:flex; justify-content:center; align-items:center; min-height:220px;">
      <div class="spinner"></div>
      <span style="margin-left:10px; font-weight:600; color:#64748B;">LMS davomat ma'lumotlari yuklanmoqda...</span>
    </div>
  `;

  try {
    const period = unifiedAttState.period || 'day';
    const date = unifiedAttState.date || new Date().toISOString().slice(0, 10);
    const data = await apiFetch(`/api/lms/overview?period=${encodeURIComponent(period)}&date=${encodeURIComponent(date)}`);
    cachedLmsOverview = data;
    const kpis = data.kpis || {};
    const recentSessions = data.recent_sessions || [];

    const pRate = kpis.overall_rate || 0;
    const rateColor = pRate >= 85 ? '#10B981' : (pRate >= 70 ? '#F59E0B' : '#EF4444');

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:16px;">
        
        <!-- DAVR FILTRI (KUNLIK / HAFTALIK / OYLIK) -->
        <div class="card" style="background:#FFFFFF; border:1px solid #E2E8F0; border-radius:12px; padding:12px 18px; box-shadow:0 1px 3px rgba(0,0,0,0.03);">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
            <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
              <span style="font-size:12px; font-weight:700; color:#475569;">Davr:</span>
              <button class="btn btn-sm ${period === 'day' ? 'btn-primary' : 'btn-outline'}" onclick="setUnifiedLmsPeriod('day')">⚡ Bugun (Kunlik)</button>
              <button class="btn btn-sm ${period === 'week' ? 'btn-primary' : 'btn-outline'}" onclick="setUnifiedLmsPeriod('week')">📅 Shu Hafta</button>
              <button class="btn btn-sm ${period === 'month' ? 'btn-primary' : 'btn-outline'}" onclick="setUnifiedLmsPeriod('month')">🗓️ Shu Oy (Oylik)</button>
              <button class="btn btn-sm ${period === 'all' ? 'btn-primary' : 'btn-outline'}" onclick="setUnifiedLmsPeriod('all')">🌐 Barcha Davr</button>
            </div>

            <div style="display:flex; align-items:center; gap:6px;">
              <span style="font-size:12px; font-weight:700; color:#475569;">Sana:</span>
              <input type="date" value="${date}" onchange="setUnifiedLmsDate(this.value)" class="form-control" style="font-size:12.5px; padding:5px 8px; border-radius:6px; width:135px;">
            </div>
          </div>
        </div>

        <!-- 4 TA KPI KARTALAR -->
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:12px;">
          <div class="card" style="padding:16px; border-radius:12px; border-left:4px solid #3B82F6; background:#FFFFFF;">
            <div style="font-size:11px; font-weight:700; color:#64748B; text-transform:uppercase;">Rejalashtirilgan Darslar</div>
            <div style="font-size:24px; font-weight:800; color:#0F172A; margin:4px 0 2px;">${kpis.total_sessions || 0} ta</div>
            <div style="font-size:11.5px; color:#64748B;">Tanlangan davrda</div>
          </div>

          <div class="card" style="padding:16px; border-radius:12px; border-left:4px solid #10B981; background:#FFFFFF;">
            <div style="font-size:11px; font-weight:700; color:#64748B; text-transform:uppercase;">O'tkazilgan Darslar</div>
            <div style="font-size:24px; font-weight:800; color:#10B981; margin:4px 0 2px;">${kpis.taken_sessions || 0} ta</div>
            <div style="font-size:11.5px; color:#64748B;">Moodle da davomat olingan</div>
          </div>

          <div class="card" style="padding:16px; border-radius:12px; border-left:4px solid ${rateColor}; background:#FFFFFF;">
            <div style="font-size:11px; font-weight:700; color:#64748B; text-transform:uppercase;">O'rtacha Davomat Foizi</div>
            <div style="font-size:24px; font-weight:800; color:${rateColor}; margin:4px 0 2px;">${pRate}%</div>
            <div style="font-size:11.5px; color:#64748B;">🟢 ${kpis.present_count || 0} bor • 🔴 ${kpis.absent_count || 0} yo'q</div>
          </div>

          <div class="card" style="padding:16px; border-radius:12px; border-left:4px solid #F59E0B; background:#FFFFFF;">
            <div style="font-size:11px; font-weight:700; color:#64748B; text-transform:uppercase;">Kechikishlar</div>
            <div style="font-size:24px; font-weight:800; color:#D97706; margin:4px 0 2px;">${kpis.late_count || 0} marta</div>
            <div style="font-size:11.5px; color:#64748B;">Olingan darslar bo'yicha</div>
          </div>
        </div>

        <!-- FANLAR KESIMIDAGI REYTING VA DARS JURNALI -->
        <div class="card" style="background:#FFFFFF; border:1px solid #E2E8F0; border-radius:12px; padding:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <h3 style="font-size:15px; font-weight:800; color:#0F172A; margin:0;">
              📋 O'tkazilgan Dars Mashg'ulotlari Jurnali (${recentSessions.length} ta)
            </h3>
            <span style="font-size:12px; color:#64748B;">Batafsil ko'rish uchun dars ustiga bosing</span>
          </div>

          <div class="table-responsive" style="border:1px solid #E2E8F0; border-radius:10px; overflow:hidden;">
            <table class="table" style="margin:0; width:100%; font-size:12.5px;">
              <thead style="background:#F8FAFC;">
                <tr>
                  <th style="padding:10px 12px;">Sana & Vaqt</th>
                  <th style="padding:10px 12px;">Fan / Dars Mashg'uloti</th>
                  <th style="padding:10px 12px; text-align:center;">Jami Talabalar</th>
                  <th style="padding:10px 12px; text-align:center;">🟢 Bor</th>
                  <th style="padding:10px 12px; text-align:center;">🟡 Kech</th>
                  <th style="padding:10px 12px; text-align:center;">🔴 Kelmadi</th>
                  <th style="padding:10px 12px; text-align:center;">Davomat Foizi</th>
                </tr>
              </thead>
              <tbody>
                ${recentSessions.length === 0 ? `
                  <tr><td colspan="7" style="text-align:center; padding:30px; color:#94A3B8;">Ushbu davrda dars jurnali topilmadi</td></tr>
                ` : recentSessions.map(s => {
                  const dt = s.sessdate_iso ? new Date(s.sessdate_iso).toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric', weekday: 'short' }) : '—';
                  const rate = s.attendance_rate || 0;
                  const bg = rate >= 85 ? '#ECFDF5' : (rate >= 70 ? '#FFFBEB' : '#FEF2F2');
                  const col = rate >= 85 ? '#059669' : (rate >= 70 ? '#D97706' : '#DC2626');

                  return `
                    <tr style="border-bottom:1px solid #F1F5F9; cursor:pointer; transition:background-color 0.15s ease;" onmouseover="this.style.backgroundColor='#F8FAFC'" onmouseout="this.style.backgroundColor=''" onclick="openLmsSessionModal(${s.session_id})" title="Davomat tafsilotini ko'rish uchun bosing">
                      <td style="padding:10px 12px; font-weight:600; color:#1E293B; white-space:nowrap;">📅 ${dt}</td>
                      <td style="padding:10px 12px;">
                        <strong style="color:#0F172A;">${s.course_name || `Kurs ${s.course_id}`}</strong>
                        ${s.description ? `<div style="font-size:11px; color:#64748B;">${s.description}</div>` : ''}
                      </td>
                      <td style="padding:10px 12px; text-align:center; font-weight:700;">${s.total_enrolled} ta</td>
                      <td style="padding:10px 12px; text-align:center; font-weight:700; color:#10B981;">${s.present_count}</td>
                      <td style="padding:10px 12px; text-align:center; font-weight:700; color:#F59E0B;">${s.late_count}</td>
                      <td style="padding:10px 12px; text-align:center; font-weight:700; color:#EF4444;">${s.absent_count}</td>
                      <td style="padding:10px 12px; text-align:center;">
                        <span style="background:${bg}; color:${col}; font-weight:800; font-size:11.5px; padding:3px 8px; border-radius:6px;">${rate}%</span>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="card" style="padding:30px; text-align:center; color:#EF4444;">LMS ma'lumotlari yuklanmadi: ${err.message}</div>`;
  }
}

function setUnifiedLmsPeriod(period) {
  unifiedAttState.period = period;
  const body = document.getElementById('unified-att-tab-body');
  if (body) renderUnifiedLmsOverviewTab(body);
}

function setUnifiedLmsDate(date) {
  unifiedAttState.date = date;
  const body = document.getElementById('unified-att-tab-body');
  if (body) renderUnifiedLmsOverviewTab(body);
}

// 3. GURUHLAR DAVOMATI VA REYTINGI TABI
async function renderUnifiedGroupsRankingTab(container) {
  container.innerHTML = `
    <div style="display:flex; justify-content:center; align-items:center; min-height:220px;">
      <div class="spinner"></div>
      <span style="margin-left:10px; font-weight:600; color:#64748B;">Guruhlar davomati hisoblanmoqda...</span>
    </div>
  `;

  try {
    const date = unifiedAttState.date || new Date().toISOString().slice(0, 10);
    const res = await apiFetch(`/api/lms/groups-ranking?date=${encodeURIComponent(date)}&period=${encodeURIComponent(unifiedAttState.period || 'day')}`);
    const ranking = res.ranking || [];

    const topGroup = ranking[0] || null;
    const avgRate = ranking.length > 0 ? Math.round(ranking.reduce((s, r) => s + r.turniket_rate, 0) / ranking.length) : 0;

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:16px;">
        
        <!-- YUQORI METRIKALAR -->
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:12px;">
          <div class="card" style="padding:16px; border-radius:12px; background:#FFFFFF; border:1px solid #E2E8F0;">
            <div style="font-size:11px; font-weight:700; color:#64748B; text-transform:uppercase;">Akademik Guruhlar</div>
            <div style="font-size:24px; font-weight:800; color:#0F172A; margin:4px 0 2px;">${ranking.length} ta</div>
            <div style="font-size:11.5px; color:#64748B;">Universitet bo'yicha</div>
          </div>

          <div class="card" style="padding:16px; border-radius:12px; background:#F0FDF4; border:1px solid #BBF7D0;">
            <div style="font-size:11px; font-weight:700; color:#15803D; text-transform:uppercase;">Eng Intizomli Guruh</div>
            <div style="font-size:24px; font-weight:800; color:#166534; margin:4px 0 2px;">${topGroup ? topGroup.group_code : '—'} (${topGroup ? topGroup.turniket_rate + '%' : '0%'})</div>
            <div style="font-size:11.5px; color:#15803D;">🥇 1-o'rin sohibi</div>
          </div>

          <div class="card" style="padding:16px; border-radius:12px; background:#EFF6FF; border:1px solid #BFDBFE;">
            <div style="font-size:11px; font-weight:700; color:#1D4ED8; text-transform:uppercase;">O'rtacha Guruh Davomati</div>
            <div style="font-size:24px; font-weight:800; color:#1E40AF; margin:4px 0 2px;">${avgRate}%</div>
            <div style="font-size:11.5px; color:#1E40AF;">Turniket ko'rsatkichi</div>
          </div>
        </div>

        <!-- REYTING JADVALI -->
        <div class="card" style="background:#FFFFFF; border:1px solid #E2E8F0; border-radius:12px; padding:16px; box-shadow:0 1px 3px rgba(0,0,0,0.03);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
            <h3 style="font-size:15px; font-weight:800; color:#0F172A; margin:0;">
              🏆 Guruhlar Davomat Reytingi (${ranking.length} ta guruh)
            </h3>
            <span style="font-size:12px; color:#64748B;">Sana: <b>${date}</b></span>
          </div>

          <div class="table-responsive" style="border:1px solid #E2E8F0; border-radius:10px; overflow:hidden;">
            <table class="table" style="margin:0; width:100%; font-size:12.5px;">
              <thead style="background:#F8FAFC;">
                <tr>
                  <th style="padding:10px 12px; text-align:center; width:70px;">O'rin</th>
                  <th style="padding:10px 12px;">Akademik Guruh</th>
                  <th style="padding:10px 12px; text-align:center;">Kurs</th>
                  <th style="padding:10px 12px; text-align:center;">Jami Talabalar</th>
                  <th style="padding:10px 12px; text-align:center;">Turniket Davomati</th>
                  <th style="padding:10px 12px; text-align:center;">LMS Qatnashuv</th>
                  <th style="padding:10px 12px; text-align:center;">Qoldirilgan Darslar</th>
                  <th style="padding:10px 12px; text-align:center; width:140px;">Davomat Ko'rsatkichi</th>
                </tr>
              </thead>
              <tbody>
                ${ranking.map((g, idx) => {
                  const rate = g.turniket_rate || 0;
                  const barColor = rate >= 80 ? '#22C55E' : (rate >= 65 ? '#EAB308' : '#EF4444');
                  const badgeStyle = idx === 0 
                    ? 'background:#FEF3C7; color:#B45309; border:1px solid #FDE68A;' 
                    : (idx === 1 ? 'background:#F1F5F9; color:#334155; border:1px solid #CBD5E1;' : (idx === 2 ? 'background:#FFEDD5; color:#C2410C; border:1px solid #FED7AA;' : 'background:#F8FAFC; color:#64748B;'));

                  return `
                    <tr style="border-bottom:1px solid #F1F5F9;">
                      <td style="padding:10px 12px; text-align:center;">
                        <span class="badge" style="${badgeStyle} font-weight:800; padding:3px 8px; border-radius:6px; font-size:11px;">
                          ${g.badge}
                        </span>
                      </td>
                      <td style="padding:10px 12px;">
                        <strong style="color:#0F172A; font-size:13px;">${g.group_code}</strong>
                      </td>
                      <td style="padding:10px 12px; text-align:center; color:#64748B; font-weight:600;">
                        ${g.course}-kurs
                      </td>
                      <td style="padding:10px 12px; text-align:center; font-weight:700;">
                        ${g.total_students} ta
                      </td>
                      <td style="padding:10px 12px; text-align:center; font-weight:700; color:#15803D;">
                        ${g.in_campus_count} / ${g.total_students} (${g.turniket_rate}%)
                      </td>
                      <td style="padding:10px 12px; text-align:center; font-weight:700; color:#2563EB;">
                        ${g.lms_rate}%
                      </td>
                      <td style="padding:10px 12px; text-align:center; font-weight:700; color:#DC2626;">
                        ${g.absent_count} ta
                      </td>
                      <td style="padding:10px 12px; text-align:center;">
                        <div style="display:flex; align-items:center; gap:6px;">
                          <div style="flex:1; height:7px; background:#E2E8F0; border-radius:4px; overflow:hidden;">
                            <div style="width:${rate}%; height:100%; background:${barColor}; border-radius:4px;"></div>
                          </div>
                          <span style="font-size:11px; font-weight:800; color:#0F172A; min-width:32px;">${rate}%</span>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;
  } catch(err) {
    container.innerHTML = `<div class="card" style="padding:30px; text-align:center; color:#EF4444;">Guruhlar davomati yuklanmadi: ${err.message}</div>`;
  }
}

// 5. TURNIKET & LMS MUTANOSIBLIGI TABI (AUDIT & COMPARISON)
async function renderUnifiedCrossAuditTab(container) {
  container.innerHTML = `
    <div style="display:flex; justify-content:center; align-items:center; min-height:220px;">
      <div class="spinner"></div>
      <span style="margin-left:10px; font-weight:600; color:#64748B;">Mutanosiblik tahlili hisoblanmoqda...</span>
    </div>
  `;

  try {
    const date = unifiedAttState.date || new Date().toISOString().slice(0, 10);
    const category = unifiedAttState.auditCategory || 'all';
    const group = unifiedAttState.auditGroup || '';
    const course = unifiedAttState.auditCourse || '';
    const search = unifiedAttState.search || '';

    const query = new URLSearchParams({ date, category, group_code: group, course, search });
    const [res, grpRes] = await Promise.all([
      apiFetch(`/api/attendance/cross-audit-deep?${query.toString()}`),
      apiFetch('/api/admin/groups-list').catch(() => ({ groups: [] }))
    ]);

    const summary = res.summary || {};
    const counts = res.counts || {};
    const students = res.students || [];
    const groupsList = Array.isArray(grpRes.groups) ? grpRes.groups : [];

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:16px;">
        
        <!-- YUQORI ANALITIKA (UNIVERSITET VA BAKALAVR KESIMIDA) -->
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap:12px;">
          <!-- Universitet umumiy davomati -->
          <div class="card" style="padding:16px; border-radius:12px; background:#FFFFFF; border:1px solid #E2E8F0;">
            <div style="font-size:11px; font-weight:700; color:#64748B; text-transform:uppercase;">🏛️ Universitet Davomati</div>
            <div style="font-size:24px; font-weight:800; color:#0F172A; margin:4px 0 2px;">
              ${summary.university_attendance_rate || 0}% 
              <span style="font-size:12px; font-weight:600; color:#64748B;">(${summary.in_campus_count || 0}/${summary.total_students || 0})</span>
            </div>
            <div style="font-size:11.5px; color:#15803D; font-weight:600;">Jami bino hududida</div>
          </div>

          <!-- Bakalavr kurslar kesimida -->
          <div class="card" style="padding:16px; border-radius:12px; background:#FFFFFF; border:1px solid #E2E8F0;">
            <div style="font-size:11px; font-weight:700; color:#64748B; text-transform:uppercase;">🎓 Bakalavr Kurslar Davomati</div>
            <div style="font-size:14px; font-weight:700; color:#1E293B; margin:6px 0 4px; display:flex; flex-wrap:wrap; gap:8px;">
              ${(summary.bachelor_courses || []).map(bc => `
                <span class="badge" style="background:#EFF6FF; color:#1D4ED8; font-weight:700; font-size:11.5px;">
                  ${bc.course_name}: ${bc.rate}% (${bc.in_campus}/${bc.total_students})
                </span>
              `).join('')}
            </div>
            <div style="font-size:11.5px; color:#64748B;">Barcha kurslar bo'yicha</div>
          </div>

          <!-- LMS Ishonchlilik Indeksi -->
          <div class="card" style="padding:16px; border-radius:12px; background:#FAF5FF; border:1px solid #E9D5FF;">
            <div style="font-size:11px; font-weight:700; color:#7E22CE; text-transform:uppercase;">🎯 LMS Ishonchlilik Indeksi</div>
            <div style="font-size:24px; font-weight:800; color:#6B21A8; margin:4px 0 2px;">${summary.reliability_rate || 100}%</div>
            <div style="font-size:11.5px; color:#7E22CE;">Moodle va Turniket haqiqiylik mosligi</div>
          </div>

          <!-- Eng yaxshi guruhlar -->
          <div class="card" style="padding:16px; border-radius:12px; background:#F0FDF4; border:1px solid #BBF7D0;">
            <div style="font-size:11px; font-weight:700; color:#15803D; text-transform:uppercase;">🏆 Eng Intizomli Guruhlar</div>
            <div style="font-size:12.5px; font-weight:700; color:#166534; margin-top:4px; display:flex; flex-wrap:wrap; gap:6px;">
              ${(summary.top_groups || []).map((tg, i) => `
                <span style="background:#DCFCE7; padding:2px 6px; border-radius:4px;">${i+1}. ${tg.group_code} (${tg.rate}%)</span>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- 4 TA MUTANOSIBLIK TOIFASI KARTALARI (BOSILADIGAN FILTRLAR) -->
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap:12px;">
          <!-- 1. Shubhali (LMSda bor, Turniketda yo'q) -->
          <div class="kpi-filter-card" onclick="filterCrossAuditCategory('suspicious_present')" style="background:#FEF2F2; border:1.5px solid ${category === 'suspicious_present' ? '#DC2626' : '#FECACA'}; border-radius:12px; padding:14px; cursor:pointer; box-shadow:${category === 'suspicious_present' ? '0 4px 14px rgba(220,38,38,0.2)' : 'none'};">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:11.5px; font-weight:700; color:#991B1B;">⚠️ Shubhali (Binoda yo'q, darsda bor)</span>
              <span class="badge" style="background:#FEE2E2; color:#B91C1C; font-weight:800; font-size:11px;">${counts.suspicious_present || 0}</span>
            </div>
            <div style="font-size:22px; font-weight:800; color:#DC2626; margin-top:6px;">${counts.suspicious_present || 0} nafar</div>
            <div style="font-size:10.5px; color:#B91C1C; margin-top:2px;">Turniketdan o'tmagan, lekin LMSda 'Bor'</div>
          </div>

          <!-- 2. Binoda bo'lib darsga kirmagan -->
          <div class="kpi-filter-card" onclick="filterCrossAuditCategory('in_campus_skipped')" style="background:#FFFBEB; border:1.5px solid ${category === 'in_campus_skipped' ? '#D97706' : '#FDE68A'}; border-radius:12px; padding:14px; cursor:pointer; box-shadow:${category === 'in_campus_skipped' ? '0 4px 14px rgba(217,119,6,0.2)' : 'none'};">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:11.5px; font-weight:700; color:#92400E;">🚶 Binoda bor, lekin darsda yo'q</span>
              <span class="badge" style="background:#FEF3C7; color:#B45309; font-weight:800; font-size:11px;">${counts.in_campus_skipped || 0}</span>
            </div>
            <div style="font-size:22px; font-weight:800; color:#D97706; margin-top:6px;">${counts.in_campus_skipped || 0} nafar</div>
            <div style="font-size:10.5px; color:#92400E; margin-top:2px;">Turniketdan kirgan, lekin LMSda 'Kelmadi'</div>
          </div>

          <!-- 3. Binoga ham kelmagan, darsga ham kelmagan -->
          <div class="kpi-filter-card" onclick="filterCrossAuditCategory('both_absent')" style="background:#F8FAFC; border:1.5px solid ${category === 'both_absent' ? '#475569' : '#E2E8F0'}; border-radius:12px; padding:14px; cursor:pointer; box-shadow:${category === 'both_absent' ? '0 4px 14px rgba(71,85,105,0.2)' : 'none'};">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:11.5px; font-weight:700; color:#475569;">❌ Kelmaganlar (Ikkalasida ham)</span>
              <span class="badge" style="background:#E2E8F0; color:#334155; font-weight:800; font-size:11px;">${counts.both_absent || 0}</span>
            </div>
            <div style="font-size:22px; font-weight:800; color:#334155; margin-top:6px;">${counts.both_absent || 0} nafar</div>
            <div style="font-size:10.5px; color:#64748B; margin-top:2px;">Turniketda ham, darsda ham qatnashmagan</div>
          </div>

          <!-- 4. 100% Tasdiqlangan (Haqiqiy) -->
          <div class="kpi-filter-card" onclick="filterCrossAuditCategory('verified_present')" style="background:#F0FDF4; border:1.5px solid ${category === 'verified_present' ? '#16A34A' : '#BBF7D0'}; border-radius:12px; padding:14px; cursor:pointer; box-shadow:${category === 'verified_present' ? '0 4px 14px rgba(22,163,74,0.2)' : 'none'};">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:11.5px; font-weight:700; color:#15803D;">✅ 100% Mos kelgan (Haqiqiy)</span>
              <span class="badge" style="background:#DCFCE7; color:#166534; font-weight:800; font-size:11px;">${counts.verified_present || 0}</span>
            </div>
            <div style="font-size:22px; font-weight:800; color:#16A34A; margin-top:6px;">${counts.verified_present || 0} nafar</div>
            <div style="font-size:10.5px; color:#15803D; margin-top:2px;">Turniketda binoda va darsda qatnashgan</div>
          </div>
        </div>

        <!-- FILTRLAR VA AMALLAR QATORI -->
        <div class="card" style="background:#FFFFFF; border:1px solid #E2E8F0; border-radius:12px; padding:14px 18px; box-shadow:0 1px 3px rgba(0,0,0,0.03);">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
            <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
              <!-- Sana -->
              <div style="display:flex; align-items:center; gap:6px;">
                <span style="font-size:12px; font-weight:700; color:#475569;">📅 Sana:</span>
                <input type="date" value="${date}" onchange="handleCrossAuditFilterChange('date', this.value)" class="form-control" style="font-size:12.5px; padding:5px 8px; border-radius:6px; width:135px;">
              </div>

              <!-- Toifa -->
              <div style="display:flex; align-items:center; gap:6px;">
                <span style="font-size:12px; font-weight:700; color:#475569;">Toifa:</span>
                <select id="cross-category-select" onchange="handleCrossAuditFilterChange('category', this.value)" class="form-control" style="font-size:12.5px; padding:5px 8px; border-radius:6px; min-width:140px;">
                  <option value="all" ${category === 'all' ? 'selected' : ''}>Barchasi (${counts.all || 0})</option>
                  <option value="suspicious_present" ${category === 'suspicious_present' ? 'selected' : ''}>⚠️ Shubhali (${counts.suspicious_present || 0})</option>
                  <option value="in_campus_skipped" ${category === 'in_campus_skipped' ? 'selected' : ''}>🚶 Binoda darsda yo'q (${counts.in_campus_skipped || 0})</option>
                  <option value="both_absent" ${category === 'both_absent' ? 'selected' : ''}>❌ Kelmagan (${counts.both_absent || 0})</option>
                  <option value="verified_present" ${category === 'verified_present' ? 'selected' : ''}>✅ Mos kelgan (${counts.verified_present || 0})</option>
                </select>
              </div>

              <!-- Kurs -->
              <div style="display:flex; align-items:center; gap:6px;">
                <span style="font-size:12px; font-weight:700; color:#475569;">Kurs:</span>
                <select onchange="handleCrossAuditFilterChange('course', this.value)" class="form-control" style="font-size:12.5px; padding:5px 8px; border-radius:6px; width:100px;">
                  <option value="">Barchasi</option>
                  <option value="1" ${course === '1' ? 'selected' : ''}>1-kurs</option>
                  <option value="2" ${course === '2' ? 'selected' : ''}>2-kurs</option>
                </select>
              </div>

              <!-- Guruh -->
              <div style="display:flex; align-items:center; gap:6px;">
                <span style="font-size:12px; font-weight:700; color:#475569;">Guruh:</span>
                <select onchange="handleCrossAuditFilterChange('group', this.value)" class="form-control" style="font-size:12.5px; padding:5px 8px; border-radius:6px; min-width:110px;">
                  <option value="">Barchasi</option>
                  ${groupsList.map(g => `<option value="${g}" ${group === g ? 'selected' : ''}>${g}</option>`).join('')}
                </select>
              </div>

              <!-- Qidiruv -->
              <div>
                <input type="text" id="cross-search-input" value="${search}" placeholder="🔍 F.I.SH. bo'yicha..." oninput="handleCrossAuditSearch(this.value)" class="form-control" style="font-size:12.5px; padding:5px 10px; border-radius:6px; width:180px;">
              </div>
            </div>

            <!-- Excel yuklab olish -->
            <div>
              <button id="btn-export-cross-excel" class="btn btn-sm" onclick="downloadCrossAuditExcel()" style="display:inline-flex; align-items:center; gap:6px; font-weight:700; font-size:12px; color:#15803D; border:1px solid #86EFAC; background:#F0FDF4; padding:6px 12px; border-radius:6px; cursor:pointer;">
                ${icon('download', 13)} <span>Excel (.xlsx)</span>
              </button>
            </div>
          </div>
        </div>

        <!-- JADVAL QISMI -->
        <div class="card" style="background:#FFFFFF; border:1px solid #E2E8F0; border-radius:12px; padding:16px; box-shadow:0 1px 3px rgba(0,0,0,0.03);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <h3 style="font-size:15px; font-weight:800; color:#0F172A; margin:0;">
              ⚖️ Turniket va LMS Davomat Mutanosibligi Ro'yxati (${students.length} nafar)
            </h3>
            <span style="font-size:12px; color:#64748B;">Batafsil ma'lumot uchun satr ustiga bosing</span>
          </div>

          <div class="table-responsive" style="border:1px solid #E2E8F0; border-radius:10px; overflow:hidden;">
            <table class="table" style="margin:0; width:100%; font-size:12.5px;">
              <thead style="background:#F8FAFC;">
                <tr>
                  <th style="padding:10px 12px; text-align:center; width:50px;">№</th>
                  <th style="padding:10px 12px;">Talaba F.I.SH.</th>
                  <th style="padding:10px 12px; text-align:center;">Guruh / Kurs</th>
                  <th style="padding:10px 12px;">Bugungi Darslar (LMS Jadval)</th>
                  <th style="padding:10px 12px; text-align:center;">LMS Davomati</th>
                  <th style="padding:10px 12px; text-align:center;">Turniket (Face ID)</th>
                  <th style="padding:10px 12px; text-align:center;">Mutanosiblik Xulosasi</th>
                </tr>
              </thead>
              <tbody>
                ${students.length === 0 ? `
                  <tr><td colspan="7" style="text-align:center; padding:30px; color:#94A3B8;">Ushbu mezonlar bo'yicha ma'lumot topilmadi</td></tr>
                ` : students.map((s, idx) => {
                  const formatTime = (iso) => {
                    if (!iso) return '-';
                    try { return new Date(iso).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }); } catch(e) { return iso.slice(11, 16); }
                  };

                  let turniketHtml = '-';
                  if (s.turniket.has_entry) {
                    turniketHtml = `
                      <div style="display:flex; flex-direction:column; align-items:center; gap:2px;">
                        <span style="color:#15803D; font-weight:700;">🟢 ${formatTime(s.turniket.first_in)}</span>
                        ${s.turniket.is_in_campus ? '<span style="font-size:10px; color:#1D4ED8; font-weight:700; background:#EFF6FF; padding:1px 6px; border-radius:4px;">🏢 Binoda</span>' : `<span style="font-size:10px; color:#475569;">Chiqdi: ${formatTime(s.turniket.last_out)}</span>`}
                      </div>
                    `;
                  } else {
                    turniketHtml = `<span style="color:#DC2626; font-weight:700; font-size:11px;">Turniketda yo'q</span>`;
                  }

                  let lmsBadge = `<span style="color:#94A3B8; font-size:11px;">Kiritilmagan</span>`;
                  if (s.lms.has_record) {
                    const stColor = s.lms.status === 'P' ? '#15803D' : (s.lms.status === 'L' ? '#B45309' : '#B91C1C');
                    const stBg = s.lms.status === 'P' ? '#DCFCE7' : (s.lms.status === 'L' ? '#FEF3C7' : '#FEE2E2');
                    lmsBadge = `<span class="badge" style="background:${stBg}; color:${stColor}; font-weight:700; padding:3px 8px; border-radius:6px;">${s.lms.status_label}</span>`;
                  }

                  let verdictBadgeHtml = '';
                  if (s.category === 'suspicious_present') {
                    verdictBadgeHtml = `<span class="badge" style="background:#FEE2E2; color:#B91C1C; font-weight:800; border:1px solid #FECACA; padding:4px 8px; border-radius:6px;" title="${s.verdict_details}">⚠️ Shubhali (LMSda bor, Turniketda yo'q)</span>`;
                  } else if (s.category === 'in_campus_skipped') {
                    verdictBadgeHtml = `<span class="badge" style="background:#FEF3C7; color:#B45309; font-weight:800; border:1px solid #FDE68A; padding:4px 8px; border-radius:6px;" title="${s.verdict_details}">🚶 Binoda bor, lekin darsda yo'q</span>`;
                  } else if (s.category === 'verified_present') {
                    verdictBadgeHtml = `<span class="badge" style="background:#DCFCE7; color:#15803D; font-weight:700; border:1px solid #BBF7D0; padding:4px 8px; border-radius:6px;" title="${s.verdict_details}">✅ 100% Mos keldi (Haqiqiy)</span>`;
                  } else {
                    verdictBadgeHtml = `<span class="badge" style="background:#F1F5F9; color:#475569; font-weight:600; padding:4px 8px; border-radius:6px;" title="${s.verdict_details}">❌ Kelmagan (Tasdiqlangan)</span>`;
                  }

                  const avatarHtml = s.photo_url
                    ? `<img src="${s.photo_url}" style="width:32px; height:32px; border-radius:50%; object-fit:cover; border:1px solid #CBD5E1;">`
                    : `<div style="width:32px; height:32px; border-radius:50%; background:#E0F2FE; color:#0369A1; font-weight:700; font-size:12px; display:flex; align-items:center; justify-content:center;">${(s.first_name || 'T')[0]}</div>`;

                  const lessonsPreview = (s.lessons && s.lessons.length > 0)
                    ? s.lessons.map(ls => `<div style="font-size:11px; color:#334155;"><b>${ls.time_str}:</b> ${ls.subject} <span style="color:#64748B;">(${ls.room || ''})</span></div>`).join('')
                    : `<span style="color:#94A3B8; font-size:11px;">Dars jadvalida yo'q</span>`;

                  return `
                    <tr style="border-bottom:1px solid #F1F5F9; cursor:pointer;" onclick="showStudentAttendanceModal('${s.student_id}')" title="Batafsil talaba davomati va auditini ochish">
                      <td style="padding:10px 12px; text-align:center; color:#64748B; font-weight:600;">${idx + 1}</td>
                      <td style="padding:10px 12px;">
                        <div style="display:flex; align-items:center; gap:10px;">
                          ${avatarHtml}
                          <div>
                            <div style="font-weight:700; color:#0F172A; font-size:13px;">${s.full_name}</div>
                            ${s.phone ? `<div style="font-size:10.5px; color:#64748B;">📞 ${s.phone}</div>` : ''}
                          </div>
                        </div>
                      </td>
                      <td style="padding:10px 12px; text-align:center;">
                        <span style="font-weight:700; color:#1E40AF; background:#EFF6FF; padding:2px 7px; border-radius:5px; font-size:11px;">${s.group_code}</span>
                        <div style="font-size:10.5px; color:#64748B; margin-top:2px;">${s.course}-kurs</div>
                      </td>
                      <td style="padding:10px 12px; max-width:280px;">
                        ${lessonsPreview}
                      </td>
                      <td style="padding:10px 12px; text-align:center;">
                        ${lmsBadge}
                      </td>
                      <td style="padding:10px 12px; text-align:center;">
                        ${turniketHtml}
                      </td>
                      <td style="padding:10px 12px; text-align:center;">
                        ${verdictBadgeHtml}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;
  } catch(err) {
    container.innerHTML = `<div class="card" style="padding:30px; text-align:center; color:#EF4444;">Mutanosiblik tahlili yuklanmadi: ${err.message}</div>`;
  }
}

function handleCrossAuditFilterChange(field, val) {
  if (field === 'date') unifiedAttState.date = val;
  if (field === 'category') unifiedAttState.auditCategory = val;
  if (field === 'course') unifiedAttState.auditCourse = val;
  if (field === 'group') unifiedAttState.auditGroup = val;
  const body = document.getElementById('unified-att-tab-body');
  if (body) renderUnifiedCrossAuditTab(body);
}

let crossSearchTimer = null;
function handleCrossAuditSearch(val) {
  clearTimeout(crossSearchTimer);
  crossSearchTimer = setTimeout(() => {
    unifiedAttState.search = val;
    const body = document.getElementById('unified-att-tab-body');
    if (body) renderUnifiedCrossAuditTab(body);
  }, 300);
}

function filterCrossAuditCategory(category) {
  unifiedAttState.auditCategory = category;
  const body = document.getElementById('unified-att-tab-body');
  if (body) renderUnifiedCrossAuditTab(body);
}

async function downloadCrossAuditExcel() {
  const btn = document.getElementById('btn-export-cross-excel');
  const origHtml = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner" style="width:12px; height:12px; display:inline-block; border-width:2px; vertical-align:middle; margin-right:4px;"></span> Tayyorlanmoqda...`;
  }

  try {
    const params = new URLSearchParams({
      date: unifiedAttState.date,
      category: unifiedAttState.auditCategory || 'all',
      group_code: unifiedAttState.auditGroup || '',
      course: unifiedAttState.auditCourse || '',
      search: unifiedAttState.search || ''
    });

    const res = await fetch(`/api/attendance/export-cross-audit-excel?${params.toString()}`, {
      headers: {
        'x-user-id': (AppState.user && AppState.user.id) ? AppState.user.id : 'superadmin'
      }
    });

    if (!res.ok) throw new Error(`Server xatoligi: ${res.statusText}`);

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mutanosiblik_audit_${unifiedAttState.date}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    showToast("✅ Mutanosiblik auditi Excel (.xlsx) muvaffaqiyatli yuklab olindi!", "success");
  } catch(err) {
    showToast(`Excel yuklab olishda xatolik: ${err.message}`, "error");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = origHtml;
    }
  }
}

let attendanceState = {
  date: new Date().toISOString().slice(0, 10),
  group: '',
  status: '',
  search: '',
  page: 1,
  limit: 20,
  syncing: false
};

async function renderCampusAttendance(targetContainer) {
  targetContainer.innerHTML = `
    <div class="attendance-container" style="display:flex; flex-direction:column; gap:16px;">
      <!-- KPI STATISTIKA KARTALARI (IXCHAM VA ZAMONAVIY) -->
      <div id="att-summary-cards" style="display:grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap:12px;">
        <!-- 1. Jami Talabalar -->
        <div id="kpi-card-all" class="att-kpi-card kpi-filter-card" onclick="filterAttendanceByCard('')" style="background:#FFFFFF; border:1px solid #CBD5E1; border-radius:10px; padding:12px 14px; cursor:pointer; transition:all 0.15s ease;" title="Barcha talabalar">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:11px; font-weight:700; color:#64748B; text-transform:uppercase; letter-spacing:0.5px;">Jami Talabalar</span>
            <span class="kpi-active-pill" style="font-size:10px; font-weight:700; background:#F1F5F9; color:#475569; padding:2px 7px; border-radius:6px;">Barchasi</span>
          </div>
          <div id="kpi-total-students" style="font-size:26px; font-weight:800; color:#0F172A; line-height:1.1; margin-top:6px;">...</div>
        </div>

        <!-- 2. Kelganlar -->
        <div id="kpi-card-present" class="att-kpi-card kpi-filter-card" onclick="filterAttendanceByCard('present')" style="background:#F0FDF4; border:1px solid #BBF7D0; border-radius:10px; padding:12px 14px; cursor:pointer; transition:all 0.15s ease;" title="Universitetga kelganlar">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:11px; font-weight:700; color:#15803D; text-transform:uppercase; letter-spacing:0.5px;">Kelganlar</span>
            <span id="kpi-att-rate" class="badge" style="background:#22C55E; color:white; font-size:10px; font-weight:700; padding:2px 7px; border-radius:6px;">0%</span>
          </div>
          <div id="kpi-present-students" style="font-size:26px; font-weight:800; color:#166534; line-height:1.1; margin-top:6px;">...</div>
        </div>

        <!-- 3. Kechikkanlar -->
        <div id="kpi-card-late" class="att-kpi-card kpi-filter-card" onclick="filterAttendanceByCard('late')" style="background:#FFFBEB; border:1px solid #FDE68A; border-radius:10px; padding:12px 14px; cursor:pointer; transition:all 0.15s ease;" title="09:15 dan keyin kelganlar">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:11px; font-weight:700; color:#B45309; text-transform:uppercase; letter-spacing:0.5px;">Kechikkanlar</span>
            <span style="font-size:10px; font-weight:700; background:#FEF3C7; color:#92400E; padding:2px 6px; border-radius:6px;">> 09:15</span>
          </div>
          <div id="kpi-late-students" style="font-size:26px; font-weight:800; color:#92400E; line-height:1.1; margin-top:6px;">...</div>
        </div>

        <!-- 4. Hozir Binoda -->
        <div id="kpi-card-in_campus" class="att-kpi-card kpi-filter-card" onclick="filterAttendanceByCard('in_campus')" style="background:#EFF6FF; border:1px solid #BFDBFE; border-radius:10px; padding:12px 14px; cursor:pointer; transition:all 0.15s ease;" title="Hozir universitet binosida">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:11px; font-weight:700; color:#1D4ED8; text-transform:uppercase; letter-spacing:0.5px;">Hozir Binoda</span>
            <span style="font-size:10px; font-weight:700; background:#DBEAFE; color:#1E40AF; padding:2px 6px; border-radius:6px;">Hududda</span>
          </div>
          <div id="kpi-in-campus" style="font-size:26px; font-weight:800; color:#1E40AF; line-height:1.1; margin-top:6px;">...</div>
        </div>

        <!-- 5. Kelmaganlar -->
        <div id="kpi-card-absent" class="att-kpi-card kpi-filter-card" onclick="filterAttendanceByCard('absent')" style="background:#FEF2F2; border:1px solid #FECACA; border-radius:10px; padding:12px 14px; cursor:pointer; transition:all 0.15s ease;" title="Turniketdan o'tmaganlar">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:11px; font-weight:700; color:#B91C1C; text-transform:uppercase; letter-spacing:0.5px;">Kelmaganlar</span>
            <span style="font-size:10px; font-weight:700; background:#FEE2E2; color:#991B1B; padding:2px 6px; border-radius:6px;">Kelmadi</span>
          </div>
          <div id="kpi-absent-students" style="font-size:26px; font-weight:800; color:#991B1B; line-height:1.1; margin-top:6px;">...</div>
        </div>
      </div>

      <!-- BOSHQARUV, FILTRLAR VA AMALLAR -->
      <div class="card" style="background:#FFFFFF; border:1px solid #E2E8F0; border-radius:12px; padding:14px 16px; box-shadow:0 1px 3px rgba(0,0,0,0.03);">
        <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:12px;">
          <!-- Filtrlash mezonlari -->
          <div style="display:flex; flex-wrap:wrap; align-items:center; gap:10px;">
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="font-size:12px; font-weight:700; color:#475569;">📅 Sana:</span>
              <input type="date" id="att-date-input" value="${attendanceState.date}" class="form-control" style="font-size:12.5px; padding:5px 8px; border-radius:6px; border:1px solid #CBD5E1; font-weight:600; width:135px;">
            </div>

            <div style="display:flex; align-items:center; gap:6px;">
              <span style="font-size:12px; font-weight:700; color:#475569;">🎓 Guruh:</span>
              <select id="att-group-select" class="form-control" style="font-size:12.5px; padding:5px 8px; border-radius:6px; border:1px solid #CBD5E1; min-width:130px;">
                <option value="">Barchasi</option>
              </select>
            </div>

            <div style="display:flex; align-items:center; gap:6px;">
              <span style="font-size:12px; font-weight:700; color:#475569;">🏷️ Holat:</span>
              <select id="att-status-select" class="form-control" style="font-size:12.5px; padding:5px 8px; border-radius:6px; border:1px solid #CBD5E1; min-width:130px;">
                <option value="">Barchasi</option>
                <option value="present">Kelganlar</option>
                <option value="late">Kechikkanlar</option>
                <option value="in_campus">Hozir binoda</option>
                <option value="absent">Kelmaganlar</option>
              </select>
            </div>

            <div>
              <input type="text" id="att-search-input" placeholder="🔍 F.I.SH. yoki guruh bo'yicha..." class="form-control" style="font-size:12.5px; padding:5px 10px; border-radius:6px; border:1px solid #CBD5E1; width:200px;">
            </div>
          </div>

          <!-- AMALLAR TUGMALARI -->
          <div style="display:flex; flex-wrap:wrap; align-items:center; gap:8px;">
            <!-- LMS VA TURNIKET AUDIT TAHLILI -->
            <button class="btn btn-outline" onclick="openLmsTurniketAuditModal()" style="display:inline-flex; align-items:center; gap:6px; padding:6px 12px; border-radius:6px; font-size:12px; font-weight:700; color:#1D4ED8; border-color:#93C5FD; background:#EFF6FF;" title="LMS dars davomati va Turniket kirish mosligini tahlil qilish">
              ${icon('activity', 13)} <span>LMS & Turniket Auditi</span>
            </button>

            <!-- EXCEL YUKLAB OLISH TUGMASI -->
            <button id="btn-export-excel" class="btn" onclick="downloadAttendanceExcel()" style="display:inline-flex; align-items:center; gap:6px; padding:6px 12px; border-radius:6px; font-weight:700; font-size:12px; color:#15803D; border:1px solid #86EFAC; background:#F0FDF4; cursor:pointer;" title="Excel formatida yuklab olish">
              ${icon('download', 13)}
              <span id="btn-export-excel-label">Excel (.xlsx)</span>
            </button>

            <!-- HIKCENTRAL SINXRONLASH -->
            <button id="btn-sync-hik" class="btn btn-primary" onclick="triggerHikCentralSync()" style="display:inline-flex; align-items:center; gap:6px; padding:6px 12px; border-radius:6px; font-weight:600; font-size:12px;">
              ${icon('refresh', 13)}
              <span>Sinxronlash</span>
            </button>

            <!-- ALOQANI TEKSHIRISH -->
            <button class="btn btn-outline" onclick="checkHikConnectionStatus()" title="Turniket server aloqasini tekshirish" style="font-size:12px; padding:6px 10px; border-radius:6px;">
              📡 Aloqa
            </button>

            <!-- RASMLARNI TURNIKETDAN YUKLAB OLISH -->
            <button id="btn-sync-photos" class="btn" onclick="triggerHikPhotosSync(this)" title="Rasmi yo'q talabalar rasmini turniketdan to'ldirish" style="display:inline-flex; align-items:center; gap:5px; font-size:12px; padding:6px 10px; border-radius:6px; background:#F8FAFC; border:1px solid #CBD5E1; color:#1E293B; font-weight:600; cursor:pointer;">
              📸 <span>Rasmlar</span>
            </button>

            <!-- JONLI MONITORING STATUSI -->
            <span id="att-live-status-badge" style="font-size:11px; font-weight:600; color:#15803D; background:#DCFCE7; border:1px solid #BBF7D0; padding:5px 10px; border-radius:20px; display:inline-flex; align-items:center; gap:5px;">
              <span style="display:inline-block; width:7px; height:7px; border-radius:50%; background:#22C55E;"></span>
              <span id="att-last-refreshed-time">Jonli</span>
            </span>
          </div>
        </div>

        <!-- JADVAL QISMI (PASPORT ID OLIB TASHLANDI, DARS VAQTI BINODA BO'LGANMI TEKSHIRUVI QO'SHILDI) -->
        <div class="table-responsive" style="margin-top:12px; border-radius:10px; border:1px solid #E2E8F0; overflow:hidden;">
          <table class="table" style="margin-bottom:0; width:100%; border-collapse:collapse;">
            <thead style="background:#F8FAFC; border-bottom:1px solid #E2E8F0;">
              <tr>
                <th style="padding:10px 14px; font-size:12px; font-weight:700; color:#475569; text-align:left;">TALABA F.I.SH.</th>
                <th style="padding:10px 14px; font-size:12px; font-weight:700; color:#475569; text-align:center;">GURUH / KURS</th>
                <th style="padding:10px 14px; font-size:12px; font-weight:700; color:#475569; text-align:center;">KIRDI (VAQT)</th>
                <th style="padding:10px 14px; font-size:12px; font-weight:700; color:#475569; text-align:center;">CHIQDI (VAQT)</th>
                <th style="padding:10px 14px; font-size:12px; font-weight:700; color:#475569; text-align:center;">O'TISHLAR</th>
                <th style="padding:10px 14px; font-size:12px; font-weight:700; color:#475569; text-align:center;">DARS VAQTI BINODA BO'LGANMI (LMS TEKSHIRUVI)</th>
                <th style="padding:10px 14px; font-size:12px; font-weight:700; color:#475569; text-align:center;">HOLATI</th>
              </tr>
            </thead>
            <tbody id="att-table-body">
              <tr>
                <td colspan="7" style="text-align:center; padding:30px; color:#94A3B8;">
                  <div class="spinner" style="margin:0 auto 10px;"></div>
                  Davomat ma'lumotlari yuklanmoqda...
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- SAHIFALASH (PAGINATION) -->
        <div id="att-pagination-container" style="display:flex; justify-content:space-between; align-items:center; margin-top:16px; padding:4px 6px;">
          <!-- Dinamik sahifalash -->
        </div>
      </div>
    </div>
  `;

  // Guruhlarni select ga yuklash
  populateAttendanceGroups();

  // Hodisalarni ulash
  document.getElementById('att-date-input').addEventListener('change', (e) => {
    attendanceState.date = e.target.value;
    attendanceState.page = 1;
    loadAttendanceData();
  });

  document.getElementById('att-group-select').addEventListener('change', (e) => {
    attendanceState.group = e.target.value;
    attendanceState.page = 1;
    loadAttendanceData();
  });

  document.getElementById('att-status-select').addEventListener('change', (e) => {
    attendanceState.status = e.target.value;
    attendanceState.page = 1;
    updateActiveKpiCard(e.target.value);
    loadAttendanceData();
  });

  let searchTimeout = null;
  document.getElementById('att-search-input').addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      attendanceState.search = e.target.value;
      attendanceState.page = 1;
      loadAttendanceData();
    }, 300);
  });

  // Har 1 minutda (60000 ms) avtomatik ravishda yangilanish
  if (window.attendanceAutoRefreshTimer) {
    clearInterval(window.attendanceAutoRefreshTimer);
  }
  window.attendanceAutoRefreshTimer = setInterval(() => {
    const tableBody = document.getElementById('att-table-body');
    if (!tableBody) {
      clearInterval(window.attendanceAutoRefreshTimer);
      return;
    }
    loadAttendanceData(true); // jimjit yangilash
  }, 60000);

  // Faol KPI kartani belgilash va ma'lumotlarni yuklash
  updateActiveKpiCard(attendanceState.status);
  await loadAttendanceData();
}

// KPI kartani bosganda filtrlash funksiyasi
function filterAttendanceByCard(status) {
  attendanceState.status = status;
  attendanceState.page = 1;
  const select = document.getElementById('att-status-select');
  if (select) select.value = status;
  updateActiveKpiCard(status);
  loadAttendanceData();
}

// KPI kartalarning aktiv ko'rinishini boshqarish
function updateActiveKpiCard(status) {
  const cards = {
    '': document.getElementById('kpi-card-all'),
    'present': document.getElementById('kpi-card-present'),
    'late': document.getElementById('kpi-card-late'),
    'in_campus': document.getElementById('kpi-card-in_campus'),
    'absent': document.getElementById('kpi-card-absent')
  };

  Object.entries(cards).forEach(([key, card]) => {
    if (!card) return;
    if (key === (status || '')) {
      card.style.transform = 'translateY(-3px)';
      card.style.boxShadow = '0 10px 22px rgba(0,0,0,0.12)';
      card.style.outline = '3px solid #3B82F6';
      card.style.outlineOffset = '2px';
    } else {
      card.style.transform = 'translateY(0)';
      card.style.boxShadow = '0 2px 6px rgba(0,0,0,0.03)';
      card.style.outline = 'none';
    }
  });

  // Excel tugmasi matnini yangilash
  const btnExp = document.getElementById('btn-export-excel-label');
  if (btnExp) {
    const labels = {
      '': 'Excel Yuklab Olish (.xlsx)',
      'present': 'Kelganlar (Excel)',
      'late': 'Kechikkanlar (Excel)',
      'in_campus': 'Hozir Binodagilar (Excel)',
      'absent': 'Kelmaganlar (Excel)'
    };
    btnExp.textContent = labels[status || ''] || 'Excel Yuklab Olish (.xlsx)';
  }
}

// Excel faylini yuklab olish
async function downloadAttendanceExcel() {
  const btn = document.getElementById('btn-export-excel');
  const btnLabel = document.getElementById('btn-export-excel-label');
  const origText = btnLabel ? btnLabel.textContent : 'Excel Yuklab Olish';

  try {
    if (btn) btn.style.opacity = '0.6';
    if (btnLabel) btnLabel.textContent = "Tayyorlanmoqda...";

    const params = new URLSearchParams({
      date: attendanceState.date,
      group_code: attendanceState.group || '',
      status: attendanceState.status || '',
      search: attendanceState.search || ''
    });

    const res = await fetch(`/api/attendance/export-excel?${params.toString()}`, {
      headers: {
        'x-user-id': (AppState.user && AppState.user.id) ? AppState.user.id : 'superadmin'
      }
    });

    if (!res.ok) {
      throw new Error(`Server xatoligi: ${res.statusText}`);
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    const statusLabels = {
      '': 'Barcha_Talabalar',
      'present': 'Kelganlar',
      'late': 'Kechikkanlar',
      'in_campus': 'Hozir_Binoda',
      'absent': 'Kelmaganlar'
    };
    const curLabel = statusLabels[attendanceState.status || ''] || 'Davomat';
    a.download = `davomat_${curLabel}_${attendanceState.date}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    showToast(`✅ Excel ro'yxat (${curLabel}) muvaffaqiyatli yuklab olindi!`, 'success');
  } catch (err) {
    showToast(`Excel yuklab olishda xatolik: ${err.message}`, 'error');
  } finally {
    if (btn) btn.style.opacity = '1';
    if (btnLabel) btnLabel.textContent = origText;
  }
}

async function populateAttendanceGroups() {
  try {
    const res = await apiFetch('/api/admin/groups-list');
    const select = document.getElementById('att-group-select');
    if (!select || !Array.isArray(res.groups)) return;
    res.groups.forEach(g => {
      const opt = document.createElement('option');
      opt.value = g;
      opt.textContent = g;
      select.appendChild(opt);
    });
  } catch (e) {
    // Guruhlar ro'yxati chiqmasa ham davom etadi
  }
}

async function loadAttendanceData(isSilent = false) {
  const tableBody = document.getElementById('att-table-body');
  if (!tableBody) return;

  if (!isSilent) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; padding:35px; color:#94A3B8;">
          <div class="spinner" style="margin:0 auto 10px;"></div>
          Davomat ma'lumotlari yuklanmoqda...
        </td>
      </tr>
    `;
  }

  try {
    // 1. KPI statistikani yuklash
    const sumRes = await apiFetch(`/api/attendance/summary?date=${encodeURIComponent(attendanceState.date)}`);
    const totalEl = document.getElementById('kpi-total-students');
    const presEl = document.getElementById('kpi-present-students');
    const rateEl = document.getElementById('kpi-att-rate');
    const lateEl = document.getElementById('kpi-late-students');
    const campusEl = document.getElementById('kpi-in-campus');
    const absentEl = document.getElementById('kpi-absent-students');

    if (totalEl) totalEl.textContent = (sumRes.totalStudents || 0).toLocaleString();
    if (presEl) presEl.textContent = (sumRes.presentCount || 0).toLocaleString();
    if (rateEl) rateEl.textContent = `${sumRes.attendanceRate || 0}%`;
    if (lateEl) lateEl.textContent = (sumRes.lateCount || 0).toLocaleString();
    if (campusEl) campusEl.textContent = (sumRes.inCampusCount || 0).toLocaleString();
    if (absentEl) absentEl.textContent = (sumRes.absentCount || 0).toLocaleString();

    // Oxirgi yangilangan vaqtni yozib qo'yish
    const lastRefEl = document.getElementById('att-last-refreshed-time');
    if (lastRefEl) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      lastRefEl.textContent = `Jonli (Oxirgi: ${timeStr})`;
    }

    // 2. Talabalar ro'yxatini yuklash
    const query = new URLSearchParams({
      date: attendanceState.date,
      group_code: attendanceState.group,
      status: attendanceState.status,
      search: attendanceState.search,
      page: attendanceState.page,
      limit: attendanceState.limit
    });

    const dataRes = await apiFetch(`/api/attendance/daily?${query.toString()}`);
    const list = dataRes.list || [];

    if (list.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center; padding:40px; color:#94A3B8;">
            <div style="font-size:28px; margin-bottom:8px;">🔍</div>
            <div style="font-size:14px; font-weight:700; color:#64748B;">Ushbu mezonlar bo'yicha talabalar topilmadi</div>
            <div style="font-size:12px; color:#94A3B8; margin-top:4px;">Boshqa guruh yoki holat filtrini tanlab ko'ring</div>
          </td>
        </tr>
      `;
      const pag = document.getElementById('att-pagination-container');
      if (pag) pag.innerHTML = '';
      return;
    }

    let rowsHtml = '';
    list.forEach(st => {
      // Vaqt formatlash (HH:MM:SS)
      const formatTime = (iso) => {
        if (!iso) return '-';
        try {
          const d = new Date(iso);
          return d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        } catch(e) {
          return iso.slice(11, 19);
        }
      };

      const inTimeStr = formatTime(st.first_in_at);
      const outTimeStr = st.is_in_campus 
        ? '<span style="color:#2563EB; font-weight:700; background:#EFF6FF; padding:2px 8px; border-radius:6px; border:1px solid #BFDBFE;">🏢 Binoda</span>' 
        : formatTime(st.last_out_at);

      // Holat nishoni
      let badgeHtml = '';
      if (st.attendance_status === 'present') {
        badgeHtml = '<span class="badge" style="background:#DCFCE7; color:#15803D; font-weight:700; border:1px solid #BBF7D0; padding:3px 10px; border-radius:12px;">Kelgan</span>';
      } else if (st.attendance_status === 'late') {
        badgeHtml = '<span class="badge" style="background:#FEF3C7; color:#B45309; font-weight:700; border:1px solid #FDE68A; padding:3px 10px; border-radius:12px;">Kechikkan</span>';
      } else {
        badgeHtml = '<span class="badge" style="background:#FEE2E2; color:#B91C1C; font-weight:700; border:1px solid #FECACA; padding:3px 10px; border-radius:12px;">Kelmagan</span>';
      }

      const avatarHtml = st.photo_url 
        ? `<img src="${st.photo_url}" style="width:34px; height:34px; border-radius:50%; object-fit:cover; border:1px solid #E2E8F0;">`
        : `<div style="width:34px; height:34px; border-radius:50%; background:#E0F2FE; color:#0369A1; font-weight:700; font-size:12px; display:flex; align-items:center; justify-content:center;">${(st.first_name || 'T')[0]}</div>`;

      // Timetable tekshiruvi (LMS dars vaqtida binoda bo'lganmi?)
      const tt = st.timetable_info || {};
      let ttBadgeHtml = `<span style="color:#94A3B8; font-size:11.5px;">Dars jadvalida yo'q</span>`;
      if (tt.class_count > 0) {
        if (tt.status === 'verified') {
          ttBadgeHtml = `
            <div style="display:inline-flex; flex-direction:column; align-items:center; gap:2px;">
              <span class="badge" style="background:#DCFCE7; color:#15803D; font-weight:700; border:1px solid #BBF7D0; padding:3px 8px; border-radius:6px; font-size:11px;" title="Talaba dars jadvalidagi soatlarda bino hududida bo'lgan">
                ✅ Binoda (${tt.class_count} ta dars)
              </span>
              <span style="font-size:10px; color:#166534; font-weight:600;">Dars vaqtida hududda</span>
            </div>
          `;
        } else {
          ttBadgeHtml = `
            <div style="display:inline-flex; flex-direction:column; align-items:center; gap:2px;">
              <span class="badge" style="background:#FEE2E2; color:#B91C1C; font-weight:700; border:1px solid #FECACA; padding:3px 8px; border-radius:6px; font-size:11px;" title="Bugun darsi bor edi, biroq turniketdan o'tmagan">
                ❌ Turniketda yo'q (${tt.class_count} dars)
              </span>
              <span style="font-size:10px; color:#991B1B; font-weight:600;">Darsga kelmagan</span>
            </div>
          `;
        }
      } else if (st.first_in_at) {
        ttBadgeHtml = `<span class="badge" style="background:#EFF6FF; color:#1D4ED8; font-weight:600; border:1px solid #BFDBFE; padding:3px 8px; border-radius:6px; font-size:11px;">🏢 Binoda (Darsi yo'q)</span>`;
      }

      rowsHtml += `
        <tr onclick="showStudentAttendanceModal('${st.student_id}')" style="border-bottom:1px solid #F1F5F9; cursor:pointer; transition:background 0.15s ease;" onmouseenter="this.style.background='#F8FAFC'" onmouseleave="this.style.background='white'" title="Davomat va LMS dars jadvalini batafsil tekshirish uchun bosing">
          <td style="padding:10px 14px;">
            <div style="display:flex; align-items:center; gap:10px;">
              ${avatarHtml}
              <div>
                <div style="font-weight:700; font-size:13px; color:#0F172A;">${st.last_name || ''} ${st.first_name || ''}</div>
                ${st.phone ? `<div style="font-size:11px; color:#64748B;">📞 ${st.phone}</div>` : ''}
              </div>
            </div>
          </td>
          <td style="padding:10px 14px; text-align:center;">
            <span style="font-weight:700; color:#1E40AF; background:#EFF6FF; padding:3px 8px; border-radius:6px; font-size:11.5px;">${st.group_code || '-'}</span>
            <div style="font-size:10.5px; color:#64748B; margin-top:2px;">${st.course ? st.course + '-kurs' : ''}</div>
          </td>
          <td style="padding:10px 14px; text-align:center; font-weight:700; color:#15803D;">
            ${inTimeStr !== '-' ? `<span style="display:inline-flex; align-items:center; gap:4px;">🟢 ${inTimeStr}</span>` : '-'}
          </td>
          <td style="padding:10px 14px; text-align:center; font-weight:600; color:#475569;">
            ${outTimeStr}
          </td>
          <td style="padding:10px 14px; text-align:center; font-size:12px;">
            <span style="color:#16A34A; font-weight:700;">+${st.in_count}</span> / <span style="color:#EA580C; font-weight:700;">-${st.out_count}</span>
          </td>
          <td style="padding:10px 14px; text-align:center;">
            ${ttBadgeHtml}
          </td>
          <td style="padding:10px 14px; text-align:center;">
            ${badgeHtml}
          </td>
        </tr>
      `;
    });

    tableBody.innerHTML = rowsHtml;

    // Sahifalash render qilish
    renderAttendancePagination(dataRes.total, dataRes.page, dataRes.totalPages);
  } catch (err) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; padding:30px; color:#EF4444;">
          <div style="font-weight:700; margin-bottom:4px;">Yuklashda xatolik yuz berdi:</div>
          <div style="font-size:12px;">${err.message}</div>
        </td>
      </tr>
    `;
  }
}

function renderAttendancePagination(total, page, totalPages) {
  const container = document.getElementById('att-pagination-container');
  if (!container) return;

  if (totalPages <= 1) {
    container.innerHTML = `<span style="font-size:12px; color:#64748B;">Jami ${total} nafar talaba</span>`;
    return;
  }

  container.innerHTML = `
    <span style="font-size:12px; color:#64748B;">
      Jami <b>${total}</b> nafar talaba (Sahifa <b>${page}</b> / <b>${totalPages}</b>)
    </span>
    <div style="display:flex; gap:6px;">
      <button class="btn btn-outline btn-sm" ${page <= 1 ? 'disabled' : ''} onclick="changeAttendancePage(${page - 1})">
        ← Oldingi
      </button>
      <button class="btn btn-outline btn-sm" ${page >= totalPages ? 'disabled' : ''} onclick="changeAttendancePage(${page + 1})">
        Keyingi →
      </button>
    </div>
  `;
}

function changeAttendancePage(newPage) {
  attendanceState.page = newPage;
  loadAttendanceData();
}

// ====================================================================
// MA'LUMOTLARNI TEZKOR BIRLASHGAN SINXRONLASH VA JARAYON (PROGRESS) MODALI
// ====================================================================
let isUnifiedSyncRunning = false;

async function triggerUnifiedSyncModal(btnEl) {
  if (isUnifiedSyncRunning) return;
  isUnifiedSyncRunning = true;

  // Modal elementini yaratish yoki mavjudini olish
  let modalOverlay = document.getElementById('unified-sync-process-modal');
  if (!modalOverlay) {
    modalOverlay = document.createElement('div');
    modalOverlay.id = 'unified-sync-process-modal';
    modalOverlay.style.cssText = 'position:fixed; inset:0; background:rgba(15,23,42,0.65); backdrop-filter:blur(5px); z-index:99999; display:flex; align-items:center; justify-content:center; padding:16px; opacity:0; transition:opacity 0.2s ease;';
    document.body.appendChild(modalOverlay);
  }

  modalOverlay.innerHTML = `
    <div style="background:#FFFFFF; border:1px solid #E2E8F0; width:100%; max-width:540px; border-radius:18px; padding:24px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); font-family:inherit;">
      <!-- Sarlavha -->
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px;">
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="width:42px; height:42px; border-radius:12px; background:#EFF6FF; color:#2563EB; display:flex; align-items:center; justify-content:center; font-size:20px; box-shadow:inset 0 0 0 1px #BFDBFE;">
            🔄
          </div>
          <div>
            <h3 style="margin:0; font-size:16px; font-weight:800; color:#0F172A; display:flex; align-items:center; gap:8px;">
              <span>Ma'lumotlarni Sinxronlash</span>
            </h3>
            <div style="font-size:12px; color:#64748B; margin-top:2px;">Moodle LMS va Turniket (Face ID) tizimlari bilan integratsiya</div>
          </div>
        </div>
        <span id="usp-badge" style="background:#EFF6FF; color:#1D4ED8; font-size:11.5px; font-weight:800; padding:4px 10px; border-radius:20px; border:1px solid #BFDBFE; display:inline-flex; align-items:center; gap:5px;">
          <span class="spinner" style="width:11px; height:11px; border-width:2px;"></span> <span>Jarayon...</span>
        </span>
      </div>

      <!-- Progress bar -->
      <div style="margin-bottom:18px; background:#F8FAFC; border:1px solid #E2E8F0; padding:12px 14px; border-radius:12px;">
        <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:700; margin-bottom:8px; color:#334155;">
          <span id="usp-step-label">Moodle LMS bilan aloqa o'rnatilmoqda...</span>
          <span id="usp-percent" style="color:#2563EB; font-weight:800;">10%</span>
        </div>
        <div style="background:#E2E8F0; border-radius:10px; height:8px; overflow:hidden;">
          <div id="usp-progress-bar" style="background:linear-gradient(90deg, #2563EB, #3B82F6); height:100%; width:10%; transition:width 0.35s ease, background-color 0.35s ease; border-radius:10px;"></div>
        </div>
      </div>

      <!-- Bosqichlar (Steps) -->
      <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:18px;">
        <!-- Step 1 -->
        <div id="usp-step-1" style="display:flex; align-items:center; justify-content:space-between; padding:10px 14px; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; transition:all 0.2s;">
          <div style="display:flex; align-items:center; gap:10px;">
            <span id="usp-icon-1" class="spinner" style="width:14px; height:14px; border-width:2px;"></span>
            <div>
              <div style="font-size:12.5px; font-weight:700; color:#0F172A;">1. Moodle LMS Dars Jadvallari (Timetable)</div>
              <div id="usp-desc-1" style="font-size:11px; color:#64748B;">Haftalik dars taqvimi tortilmoqda...</div>
            </div>
          </div>
          <span id="usp-status-1" style="font-size:11.5px; font-weight:700; color:#2563EB;">Yuklanmoqda</span>
        </div>

        <!-- Step 2 -->
        <div id="usp-step-2" style="display:flex; align-items:center; justify-content:space-between; padding:10px 14px; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; transition:all 0.2s;">
          <div style="display:flex; align-items:center; gap:10px;">
            <span id="usp-icon-2" style="font-size:13px; color:#94A3B8;">⚪</span>
            <div>
              <div style="font-size:12.5px; font-weight:700; color:#0F172A;">2. LMS Dars Mashg'ulotlari & Davomat Jurnali</div>
              <div id="usp-desc-2" style="font-size:11px; color:#64748B;">Talabalar davomat qaydlari tahlil qilinadi...</div>
            </div>
          </div>
          <span id="usp-status-2" style="font-size:11.5px; font-weight:600; color:#94A3B8;">Kutilmoqda</span>
        </div>

        <!-- Step 3 -->
        <div id="usp-step-3" style="display:flex; align-items:center; justify-content:space-between; padding:10px 14px; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; transition:all 0.2s;">
          <div style="display:flex; align-items:center; gap:10px;">
            <span id="usp-icon-3" style="font-size:13px; color:#94A3B8;">⚪</span>
            <div>
              <div style="font-size:12.5px; font-weight:700; color:#0F172A;">3. Turniket & Face ID Kirish-Chiqish Loglari</div>
              <div id="usp-desc-3" style="font-size:11px; color:#64748B;">HikCentral serveri tekshiriladi...</div>
            </div>
          </div>
          <span id="usp-status-3" style="font-size:11.5px; font-weight:600; color:#94A3B8;">Kutilmoqda</span>
        </div>

        <!-- Step 4 -->
        <div id="usp-step-4" style="display:flex; align-items:center; justify-content:space-between; padding:10px 14px; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; transition:all 0.2s;">
          <div style="display:flex; align-items:center; gap:10px;">
            <span id="usp-icon-4" style="font-size:13px; color:#94A3B8;">⚪</span>
            <div>
              <div style="font-size:12.5px; font-weight:700; color:#0F172A;">4. Tizim Statistikasi va Mutanosiblik Auditi</div>
              <div id="usp-desc-4" style="font-size:11px; color:#64748B;">Guruhlar reytingi va tahlillar yangilanadi...</div>
            </div>
          </div>
          <span id="usp-status-4" style="font-size:11.5px; font-weight:600; color:#94A3B8;">Kutilmoqda</span>
        </div>
      </div>

      <!-- Xulosa qutisi (Success Banner) -->
      <div id="usp-banner" style="display:none; padding:12px 16px; border-radius:12px; background:#ECFDF5; border:1px solid #A7F3D0; margin-bottom:18px;">
        <div style="font-size:13px; font-weight:800; color:#065F46; display:flex; align-items:center; gap:6px;">
          <span>🎉</span> <span>Sinxronizatsiya muvaffaqiyatli yakunlandi!</span>
        </div>
        <div id="usp-banner-text" style="font-size:12px; color:#047857; margin-top:5px; line-height:1.5;"></div>
      </div>

      <!-- Pastki tugmalar -->
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span id="usp-timer-note" style="font-size:11.5px; color:#64748B;">Iltimos kuting, tizim tezkor yangilanmoqda...</span>
        <button id="usp-btn-close" class="btn btn-primary" onclick="closeUnifiedSyncModal()" disabled style="font-size:12.5px; font-weight:700; padding:6px 18px; border-radius:8px; opacity:0.6; cursor:not-allowed;">
          Yopish
        </button>
      </div>
    </div>
  `;

  // Ko'rsatish
  modalOverlay.style.display = 'flex';
  setTimeout(() => { modalOverlay.style.opacity = '1'; }, 20);

  const setProgress = (percent, label) => {
    const bar = document.getElementById('usp-progress-bar');
    const pct = document.getElementById('usp-percent');
    const lbl = document.getElementById('usp-step-label');
    if (bar) bar.style.width = `${percent}%`;
    if (pct) pct.textContent = `${percent}%`;
    if (lbl && label) lbl.textContent = label;
  };

  const updateStep = (stepNum, state, desc, statusText) => {
    const iconEl = document.getElementById(`usp-icon-${stepNum}`);
    const descEl = document.getElementById(`usp-desc-${stepNum}`);
    const statusEl = document.getElementById(`usp-status-${stepNum}`);
    const rowEl = document.getElementById(`usp-step-${stepNum}`);

    if (state === 'running') {
      if (iconEl) iconEl.outerHTML = `<span id="usp-icon-${stepNum}" class="spinner" style="width:14px; height:14px; border-width:2px;"></span>`;
      if (statusEl) {
        statusEl.textContent = statusText || 'Bajarilmoqda...';
        statusEl.style.color = '#2563EB';
      }
      if (rowEl) {
        rowEl.style.background = '#EFF6FF';
        rowEl.style.borderColor = '#BFDBFE';
      }
    } else if (state === 'success') {
      const el = document.getElementById(`usp-icon-${stepNum}`);
      if (el) el.outerHTML = `<span id="usp-icon-${stepNum}" style="color:#059669; font-size:15px; font-weight:bold;">✅</span>`;
      if (statusEl) {
        statusEl.textContent = statusText || 'Bajarildi';
        statusEl.style.color = '#059669';
      }
      if (rowEl) {
        rowEl.style.background = '#F0FDF4';
        rowEl.style.borderColor = '#BBF7D0';
      }
    } else if (state === 'info') {
      const el = document.getElementById(`usp-icon-${stepNum}`);
      if (el) el.outerHTML = `<span id="usp-icon-${stepNum}" style="color:#D97706; font-size:15px; font-weight:bold;">ℹ️</span>`;
      if (statusEl) {
        statusEl.textContent = statusText || 'Offline';
        statusEl.style.color = '#D97706';
      }
      if (rowEl) {
        rowEl.style.background = '#FFFBEB';
        rowEl.style.borderColor = '#FDE68A';
      }
    }
    if (descEl && desc) descEl.textContent = desc;
  };

  try {
    // 1-va 2-bosqich: LMS sinxronlash (parallel tezkor)
    setProgress(20, '1/3: Moodle LMS dars jadvallari va darslar yangilanmoqda...');
    updateStep(1, 'running', 'Moodle lms.akhu.uz dan jadvallar yuklanmoqda...', 'Bajarilmoqda...');

    let lmsRes = null;
    try {
      lmsRes = await apiFetch('/api/lms/sync', { method: 'POST' });
    } catch (lmsErr) {
      console.warn('LMS sync warning:', lmsErr);
    }

    const ttCount = lmsRes?.timetable?.count || 0;
    const sessCount = lmsRes?.attendance?.sessions || 0;
    const attCount = lmsRes?.attendance?.attendanceRecords || 0;

    updateStep(1, 'success', `Moodle dars jadvali to'liq yangilandi (${ttCount} ta faol dars)`, '✅ Tayyor');
    setProgress(55, '2/3: LMS talabalar davomat yozuvlari keshlandi...');
    updateStep(2, 'success', `Davomat jurnali yangilandi (${sessCount} ta mashg'ulot, ${attCount} ta davomat qaydi)`, '✅ Tayyor');

    // 3-bosqich: Turniket (Face ID) sinxronlash
    setProgress(75, '3/3: Turniket Face ID loglari bilan solishtirilmoqda...');
    updateStep(3, 'running', 'HikCentral turniket o\'tishlari tekshirilmoqda...', 'So\'ralmoqda...');

    const currentDate = (typeof attendanceState !== 'undefined' && attendanceState.date) || new Date().toISOString().slice(0, 10);
    let hikRes = null;
    try {
      hikRes = await apiFetch('/api/attendance/sync', {
        method: 'POST',
        body: JSON.stringify({ date: currentDate })
      });
    } catch (hikErr) {
      hikRes = { offline: true, message: hikErr.message };
    }

    if (hikRes && hikRes.offline) {
      updateStep(3, 'info', `Turniket serveri offline (VPN talab etiladi). Mavjud lokal loglar saqlab qolindi.`, 'ℹ️ Lokal kesh');
    } else {
      updateStep(3, 'success', `Turniket loglari yangilandi (${hikRes?.totalEvents || 0} ta o'tish, ${hikRes?.studentsPresent || 0} nafar talaba)`, '✅ Yangilandi');
    }

    // 4-bosqich: Tahlillar va statistika
    setProgress(95, 'Barcha statistika va davomat auditi qayta hisoblanmoqda...');
    updateStep(4, 'running', 'Reytinglar va tahlillar hisoblanmoqda...', 'Hisoblanmoqda...');

    // Sahifadagi mavjud faol modullarni yangilash
    if (typeof loadAttendanceData === 'function' && document.getElementById('att-table-body')) {
      await loadAttendanceData().catch(() => {});
    }
    if (typeof loadUnifiedLmsOverviewData === 'function' && document.getElementById('unified-lms-sessions-tbody')) {
      await loadUnifiedLmsOverviewData().catch(() => {});
    }
    if (typeof loadUnifiedGroupsRankingData === 'function' && document.getElementById('unified-groups-ranking-tbody')) {
      await loadUnifiedGroupsRankingData().catch(() => {});
    }

    updateStep(4, 'success', 'Statistika, guruhlar reytingi va tahlillar yangilandi', '✅ Tayyor');
    setProgress(100, 'Sinxronizatsiya muvaffaqiyatli yakunlandi!');

    const badge = document.getElementById('usp-badge');
    if (badge) {
      badge.style.background = '#ECFDF5';
      badge.style.color = '#059669';
      badge.style.borderColor = '#BBF7D0';
      badge.innerHTML = `<span>✅ Yakunlandi</span>`;
    }

    const banner = document.getElementById('usp-banner');
    const bannerText = document.getElementById('usp-banner-text');
    if (banner && bannerText) {
      banner.style.display = 'block';
      bannerText.innerHTML = `
        📅 <b>${ttCount} ta</b> dars jadvali &bull;
        🎓 <b>${sessCount} ta</b> mashg'ulot &bull;
        👥 <b>${attCount} ta</b> talaba davomati yangilandi.<br>
        ${hikRes && hikRes.offline ? `<span style="color:#B45309; font-size:11.5px;">⚠️ Turniket serveriga ulanish uchun VPN (Tailscale) faol bo'lishi kerak.</span>` : `🚪 <b>${hikRes?.totalEvents || 0} ta</b> turniket o'tishi qayd etildi.`}
      `;
    }

    const note = document.getElementById('usp-timer-note');
    if (note) note.textContent = 'Jarayon yakunlandi. Oyna 3 soniyadan so\'ng yopiladi.';

    const closeBtn = document.getElementById('usp-btn-close');
    if (closeBtn) {
      closeBtn.disabled = false;
      closeBtn.style.opacity = '1';
      closeBtn.style.cursor = 'pointer';
    }

    setTimeout(() => {
      closeUnifiedSyncModal();
    }, 3200);

  } catch (err) {
    console.error('Unified sync error:', err);
    setProgress(100, 'Xatolik yuz berdi');
    const badge = document.getElementById('usp-badge');
    if (badge) {
      badge.style.background = '#FEF2F2';
      badge.style.color = '#DC2626';
      badge.style.borderColor = '#FECACA';
      badge.textContent = 'Xatolik';
    }
    const note = document.getElementById('usp-timer-note');
    if (note) note.textContent = `Xatolik: ${err.message}`;
    const closeBtn = document.getElementById('usp-btn-close');
    if (closeBtn) {
      closeBtn.disabled = false;
      closeBtn.style.opacity = '1';
      closeBtn.style.cursor = 'pointer';
    }
  } finally {
    isUnifiedSyncRunning = false;
  }
}

function closeUnifiedSyncModal() {
  const modal = document.getElementById('unified-sync-process-modal');
  if (modal) {
    modal.style.opacity = '0';
    setTimeout(() => {
      modal.style.display = 'none';
    }, 200);
  }
}

async function triggerHikCentralSync(btnEl) {
  return triggerUnifiedSyncModal(btnEl);
}

async function checkHikConnectionStatus() {
  try {
    const res = await apiFetch('/api/attendance/status');
    if (res.success) {
      alert(`✅ HikCentral aloqasi muvaffaqiyatli!\nServer: ${res.host}\nApp Key: ${res.appKey}\nJavob: ${res.message}`);
    } else {
      alert(`⚠️ HikCentral serveriga hozirda ulanib bo'lmadi:\nServer: ${res.host}\nXatolik: ${res.error}\n\nVPN (Tailscale) tarmog'i sozlanganini tekshiring.`);
    }
  } catch (err) {
    alert(`Xatolik: ${err.message}`);
  }
}

// TURNIKET SERVERIDAN RASMI YO'Q TALABALARNING RASMLARINI YUKLASH VA BAZAGA TO'LDIRISH
async function triggerHikPhotosSync(btnEl) {
  const btn = btnEl || document.getElementById('btn-sync-photos') || document.getElementById('btn-sync-students-photos');
  if (btn && btn.disabled) return;

  if (!confirm("Turniket serveridan rasmi yo'q talabalarning rasmlarini yuklab olib to'ldirishni boshlaysizmi?")) {
    return;
  }

  const origHtml = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner" style="width:14px; height:14px; border-width:2px; display:inline-block; vertical-align:middle; margin-right:6px;"></span> Yuklanmoqda...`;
  }

  try {
    const res = await apiFetch('/api/attendance/sync-photos', { method: 'POST' });
    if (res.success) {
      if (res.downloadedCount > 0) {
        alert(`✅ Muvaffaqiyatli yakunlandi!\n\nTurniket serveridan ${res.downloadedCount} nafar talabaning rasmi yuklab olindi va bazaga saqlandi.`);
      } else {
        alert(`ℹ️ ${res.message || "Barcha talabalarda rasm mavjud yoki turniketda yangi rasm topilmadi."}`);
      }
      if (typeof loadAttendanceData === 'function' && document.getElementById('att-table-body')) {
        await loadAttendanceData();
      }
      if (typeof renderStudentsList === 'function' && document.getElementById('students-table-body')) {
        renderStudentsList();
      }
    } else {
      alert(`⚠️ Xatolik: ${res.error || 'Noma\'lum xatolik'}`);
    }
  } catch (err) {
    alert(`Rasmlarni yuklashda xatolik:\n${err.message}`);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = origHtml;
    }
  }
}

// TALABANING TURNIKET DAVOMAT TARIXI VA MUHIM STATISTIKALARI MODALI
async function showStudentAttendanceModal(studentId) {
  const modal = document.getElementById('common-modal');
  const title = document.getElementById('modal-title');
  const body = document.getElementById('modal-body');
  if (!modal || !body) return;

  title.textContent = "Talabaning Turniket Davomat Tarixi va LMS Tekshiruvi";
  body.innerHTML = `<div class="loading-state" style="padding:40px; text-align:center;"><div class="spinner" style="margin:0 auto 10px;"></div><p style="color:#64748B;">Davomat tarixi va LMS dars jadvali tekshirilmoqda...</p></div>`;
  modal.classList.add('active');

  try {
    const checkDate = attendanceState.date || new Date().toISOString().slice(0, 10);
    const [data, crosscheckRes] = await Promise.all([
      apiFetch(`/api/attendance/student/${encodeURIComponent(studentId)}?days=30`),
      apiFetch(`/api/attendance/student-lms-crosscheck?student_id=${encodeURIComponent(studentId)}&date=${encodeURIComponent(checkDate)}`).catch(() => null)
    ]);
    const st = data.student;
    const history = data.history || [];
    const logs = data.logs || [];
    const crosscheck = (crosscheckRes && crosscheckRes.data) ? crosscheckRes.data : null;

    // Muhim statistikalarni hisoblash
    const todayStr = checkDate;
    const todayRecord = history.find(h => h.date === todayStr) || history[0] || null;

    const totalDaysRecorded = history.length;
    const daysPresent = history.filter(h => h.status === 'present' || h.status === 'late').length;
    const daysLate = history.filter(h => h.status === 'late').length;
    const daysAbsent = history.filter(h => h.status === 'absent').length;
    const attRate30 = totalDaysRecorded > 0 ? Math.round((daysPresent / totalDaysRecorded) * 100) : 0;
    const totalTurnstilePasses = history.reduce((sum, h) => sum + (h.in_count || 0) + (h.out_count || 0), 0);

    // Hozirgi bino holati
    let presenceHtml = '';
    if (todayRecord && todayRecord.is_in_campus) {
      presenceHtml = `<span style="color:#1D4ED8; background:#EFF6FF; border:1px solid #BFDBFE; padding:4px 10px; border-radius:8px; font-weight:700;">🏢 Hozir universitet hududida</span>`;
    } else if (todayRecord && todayRecord.first_in_at) {
      presenceHtml = `<span style="color:#475569; background:#F1F5F9; border:1px solid #E2E8F0; padding:4px 10px; border-radius:8px; font-weight:700;">🚶 Universitetdan chiqib ketgan</span>`;
    } else {
      presenceHtml = `<span style="color:#B91C1C; background:#FEF2F2; border:1px solid #FECACA; padding:4px 10px; border-radius:8px; font-weight:700;">❌ Bugun kelmagan</span>`;
    }

    const formatTimeOnly = (iso) => {
      if (!iso) return '-';
      try {
        return new Date(iso).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      } catch(e) {
        return iso.slice(11, 19);
      }
    };

    const inTodayTime = todayRecord ? formatTimeOnly(todayRecord.first_in_at) : '-';
    const outTodayTime = todayRecord ? (todayRecord.is_in_campus ? 'Hozir binoda' : formatTimeOnly(todayRecord.last_out_at)) : '-';

    // LMS Dars jadvali va Turniket moslik tahlili
    let lmsTimetableHtml = '';
    if (crosscheck && crosscheck.lessons && crosscheck.lessons.length > 0) {
      let lessonRows = '';
      crosscheck.lessons.forEach(ls => {
        let verdictBadge = '';
        if (ls.audit_verdict === 'VERIFIED') {
          verdictBadge = '<span class="badge" style="background:#DCFCE7; color:#15803D; font-weight:700; border:1px solid #BBF7D0; padding:3px 8px; border-radius:6px;">✅ Mos keladi (Haqiqiy)</span>';
        } else if (ls.audit_verdict === 'SUSPICIOUS') {
          verdictBadge = '<span class="badge" style="background:#FEE2E2; color:#B91C1C; font-weight:800; border:1px solid #FECACA; padding:3px 8px; border-radius:6px;" title="LMS da \'Present\' belgilangan, lekin o\'sha paytda turniketdan kirmagan!">⚠️ Shubhali (Turniketda yo\'q)</span>';
        } else if (ls.audit_verdict === 'ABSENT_CONFIRMED') {
          verdictBadge = '<span class="badge" style="background:#F1F5F9; color:#475569; font-weight:600; padding:3px 8px; border-radius:6px;">❌ Kelmagan (Tasdiqlangan)</span>';
        } else {
          verdictBadge = '<span class="badge" style="background:#EFF6FF; color:#1D4ED8; font-weight:600; padding:3px 8px; border-radius:6px;">🏢 Binoda (LMS belgilanmagan)</span>';
        }

        const lmsStatusBadge = ls.lms_status === 'Present'
          ? '<span style="color:#16A34A; font-weight:700; background:#DCFCE7; padding:2px 8px; border-radius:6px;">Kelgan (Present)</span>'
          : (ls.lms_status === 'Absent'
            ? '<span style="color:#DC2626; font-weight:700; background:#FEE2E2; padding:2px 8px; border-radius:6px;">Kelmagan (Absent)</span>'
            : `<span style="color:#64748B; font-weight:600;">${ls.lms_status || 'Kiritilmagan'}</span>`);

        const turniketStatus = ls.in_building_during_class
          ? '<span style="color:#15803D; font-weight:700;">🟢 Binoda bo\'lgan</span>'
          : '<span style="color:#DC2626; font-weight:700;">🔴 Binoda bo\'lmagan</span>';

        lessonRows += `
          <tr style="border-bottom:1px solid #F1F5F9;">
            <td style="padding:9px 12px; font-weight:700; color:#1E293B;">
              ⏰ ${ls.time_str || '-'}
              ${ls.room ? `<div style="font-size:11px; color:#64748B; font-weight:normal;">Xona: ${ls.room}</div>` : ''}
            </td>
            <td style="padding:9px 12px;">
              <div style="font-weight:700; color:#0F172A; font-size:12.5px;">${ls.subject || ls.class_name || '-'}</div>
              <div style="font-size:11px; color:#64748B;">${ls.teacher ? 'Ustoz: ' + ls.teacher : ''}</div>
            </td>
            <td style="padding:9px 12px; text-align:center;">
              ${lmsStatusBadge}
            </td>
            <td style="padding:9px 12px; text-align:center;">
              ${turniketStatus}
            </td>
            <td style="padding:9px 12px; text-align:center;">
              ${verdictBadge}
            </td>
          </tr>
        `;
      });

      lmsTimetableHtml = `
        <div style="margin-bottom:18px; background:#FFFFFF; border:1.5px solid #BFDBFE; border-radius:10px; overflow:hidden; box-shadow:0 2px 8px rgba(37,99,235,0.06);">
          <div style="background:#EFF6FF; padding:10px 14px; border-bottom:1px solid #BFDBFE; display:flex; justify-content:space-between; align-items:center;">
            <div style="font-weight:800; color:#1E40AF; font-size:13px; display:flex; align-items:center; gap:6px;">
              <span>🎓 LMS Dars Jadvali va Turniket Moslik Tahlili</span>
              <span style="font-size:11px; font-weight:600; color:#3B82F6;">(${crosscheck.date}, ${crosscheck.weekday})</span>
            </div>
            <span style="font-size:11px; font-weight:700; color:#1E40AF;">Jami darslar: ${crosscheck.total_classes} ta</span>
          </div>
          <div class="table-responsive">
            <table class="table" style="width:100%; font-size:12px; margin:0; border-collapse:collapse;">
              <thead style="background:#F8FAFC; border-bottom:1px solid #E2E8F0;">
                <tr>
                  <th style="padding:8px 12px; text-align:left;">Dars Vaqti</th>
                  <th style="padding:8px 12px; text-align:left;">Fan va O'qituvchi</th>
                  <th style="padding:8px 12px; text-align:center;">LMS Davomati</th>
                  <th style="padding:8px 12px; text-align:center;">Turniket Nazorati</th>
                  <th style="padding:8px 12px; text-align:center;">Moslik Xulosasi</th>
                </tr>
              </thead>
              <tbody>
                ${lessonRows}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (crosscheck) {
      lmsTimetableHtml = `
        <div style="margin-bottom:18px; padding:12px 14px; background:#F8FAFC; border:1px dashed #CBD5E1; border-radius:10px; display:flex; align-items:center; gap:10px;">
          <span style="font-size:18px;">ℹ️</span>
          <div style="font-size:12px; color:#64748B;">
            <b>LMS Dars Jadvali (${crosscheck.date}):</b> Ushbu sanada talabaning guruhiga LMS tizimida dars biriktirilmagan yoki dam olish kuni.
          </div>
        </div>
      `;
    }

    let historyRows = '';
    if (history.length === 0) {
      historyRows = `<tr><td colspan="5" style="text-align:center; color:#94A3B8; padding:20px;">Oxirgi 30 kunda davomat qayd etilmagan</td></tr>`;
    } else {
      history.forEach(h => {
        const inStr = formatTimeOnly(h.first_in_at);
        const outStr = h.is_in_campus ? '<b style="color:#2563EB;">Binoda</b>' : formatTimeOnly(h.last_out_at);
        const statusBadge = h.status === 'present' 
          ? '<span style="color:#16A34A; font-weight:700; background:#DCFCE7; padding:2px 8px; border-radius:6px;">Kelgan</span>'
          : (h.status === 'late' 
            ? '<span style="color:#D97706; font-weight:700; background:#FEF3C7; padding:2px 8px; border-radius:6px;">Kechikkan</span>' 
            : '<span style="color:#DC2626; font-weight:700; background:#FEE2E2; padding:2px 8px; border-radius:6px;">Kelmagan</span>');

        historyRows += `
          <tr style="border-bottom:1px solid #F1F5F9;">
            <td style="padding:10px 12px; font-weight:700; color:#334155;">${h.date}</td>
            <td style="padding:10px 12px; color:#15803D; font-weight:700;">${inStr !== '-' ? '🟢 ' + inStr : '-'}</td>
            <td style="padding:10px 12px; color:#475569; font-weight:600;">${outStr}</td>
            <td style="padding:10px 12px; text-align:center; font-weight:700;">
              <span style="color:#16A34A;">+${h.in_count}</span> / <span style="color:#EA580C;">-${h.out_count}</span>
            </td>
            <td style="padding:10px 12px; text-align:center;">${statusBadge}</td>
          </tr>
        `;
      });
    }

    const studentAvatarHtml = st.photo_url 
      ? `<img src="${st.photo_url}" style="width:56px; height:56px; border-radius:50%; object-fit:cover; border:2px solid #3B82F6; box-shadow:0 2px 8px rgba(0,0,0,0.1);">`
      : `<div style="width:56px; height:56px; border-radius:50%; background:#EFF6FF; color:#1D4ED8; font-weight:800; font-size:20px; display:flex; align-items:center; justify-content:center; border:2px solid #BFDBFE;">${(st.first_name || 'T')[0]}</div>`;

    body.innerHTML = `
      <!-- TALABA ASOSIY PROFIL KARTASI -->
      <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:16px; margin-bottom:18px; padding-bottom:16px; border-bottom:1px solid #E2E8F0;">
        <div style="display:flex; align-items:center; gap:14px;">
          ${studentAvatarHtml}
          <div>
            <h3 style="margin:0; font-size:17px; font-weight:800; color:#0F172A;">${st.last_name || ''} ${st.first_name || ''}</h3>
            <div style="font-size:12.5px; color:#64748B; margin-top:4px; display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
              <span style="background:#EFF6FF; color:#1E40AF; padding:2px 8px; border-radius:6px; font-weight:700;">${st.group_code || '-'}</span>
              <span>${st.course ? st.course + '-kurs' : ''}</span>
              ${st.phone ? `<span>•</span> <span>📞 ${st.phone}</span>` : ''}
            </div>
          </div>
        </div>
        <div>
          ${presenceHtml}
        </div>
      </div>

      <!-- MUHIM STATISTIKALAR BLOKI (4 TA METRIKA KARTALARI) -->
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap:12px; margin-bottom:18px;">
        <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:12px; text-align:center;">
          <div style="font-size:11px; font-weight:700; color:#64748B; text-transform:uppercase;">Tanlangan Kun Kirish</div>
          <div style="font-size:17px; font-weight:800; color:#15803D; margin-top:4px;">${inTodayTime}</div>
          <div style="font-size:10.5px; color:#94A3B8; margin-top:2px;">Birinchi qayd</div>
        </div>

        <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:12px; text-align:center;">
          <div style="font-size:11px; font-weight:700; color:#64748B; text-transform:uppercase;">Tanlangan Kun Chiqish</div>
          <div style="font-size:17px; font-weight:800; color:#475569; margin-top:4px;">${outTodayTime}</div>
          <div style="font-size:10.5px; color:#94A3B8; margin-top:2px;">Oxirgi qayd</div>
        </div>

        <div style="background:#F0FDF4; border:1px solid #BBF7D0; border-radius:10px; padding:12px; text-align:center;">
          <div style="font-size:11px; font-weight:700; color:#15803D; text-transform:uppercase;">30 Kunlik Davomat</div>
          <div style="font-size:17px; font-weight:800; color:#166534; margin-top:4px;">${attRate30}%</div>
          <div style="font-size:10.5px; color:#15803D; margin-top:2px;">${daysPresent} / ${totalDaysRecorded} kun kelgan</div>
        </div>

        <div style="background:#FEF2F2; border:1px solid #FECACA; border-radius:10px; padding:12px; text-align:center;">
          <div style="font-size:11px; font-weight:700; color:#991B1B; text-transform:uppercase;">Kechikishlar</div>
          <div style="font-size:17px; font-weight:800; color:#B91C1C; margin-top:4px;">${daysLate} marta</div>
          <div style="font-size:10.5px; color:#DC2626; margin-top:2px;">Kelmagan: ${daysAbsent} kun</div>
        </div>
      </div>

      <!-- LMS VA TURNIKET MOSLIK BLOKI -->
      ${lmsTimetableHtml}

      <!-- KUNLIK DAVOMAT TARIXI JADVALI -->
      <div style="margin-bottom:18px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <h4 style="font-size:13.5px; font-weight:800; color:#1E293B; margin:0;">📋 Kunlik Davomat Tarixi (Oxirgi 30 kun)</h4>
          <span style="font-size:11.5px; color:#64748B;">Jami o'tishlar: <b>${totalTurnstilePasses}</b> marta</span>
        </div>
        <div class="table-responsive" style="max-height:200px; overflow-y:auto; border:1px solid #E2E8F0; border-radius:10px;">
          <table class="table" style="width:100%; font-size:12px; margin:0; border-collapse:collapse;">
            <thead style="background:#F8FAFC; position:sticky; top:0; z-index:2; border-bottom:1px solid #E2E8F0;">
              <tr>
                <th style="padding:10px 12px; text-align:left;">Sana</th>
                <th style="padding:10px 12px; text-align:left;">Birinchi Kirish</th>
                <th style="padding:10px 12px; text-align:left;">Oxirgi Chiqish</th>
                <th style="padding:10px 12px; text-align:center;">Harakatlar (+/-)</th>
                <th style="padding:10px 12px; text-align:center;">Holati</th>
              </tr>
            </thead>
            <tbody>
              ${historyRows}
            </tbody>
          </table>
        </div>
      </div>

      <!-- FACE ID VA TURNIKET O'TISH LOGLARI -->
      <div>
        <h4 style="font-size:13.5px; font-weight:800; color:#1E293B; margin:0 0 8px;">🚪 Face ID / Turniket O'tish Tafsilotlari (Jonli Loglar)</h4>
        <div style="max-height:150px; overflow-y:auto; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:10px; font-size:11.5px; font-family:monospace;">
          ${logs.length === 0 ? '<div style="color:#94A3B8; text-align:center; padding:14px;">Ushbu talaba bo\'yicha turniket loglari mavjud emas</div>' : logs.map(l => {
            const isKirish = l.direction === 'in';
            const timeFormatted = l.event_time ? l.event_time.replace('T', ' ').slice(0, 19) : '';
            return `
              <div style="padding:5px 8px; border-bottom:1px dashed #E2E8F0; display:flex; justify-content:space-between; align-items:center;">
                <span style="font-weight:700; color:${isKirish ? '#15803D' : '#C2410C'};">
                  ${isKirish ? '🟢 KIRISH' : '🔴 CHIQISH'} — ${l.door_name || (isKirish ? 'Turniket Kirish' : 'Turniket Chiqish')}
                </span>
                <span style="color:#64748B; font-weight:600;">${timeFormatted}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  } catch (err) {
    body.innerHTML = `<div style="color:#EF4444; padding:30px; text-align:center; font-weight:700;">Xatolik yuz berdi: ${err.message}</div>`;
  }
}

// UNIVERSITET MIQYOSIDA LMS VA TURNIKET AUDIT TAHLILI MODALI
async function openLmsTurniketAuditModal() {
  const modal = document.getElementById('common-modal');
  const title = document.getElementById('modal-title');
  const body = document.getElementById('modal-body');
  if (!modal || !body) return;

  const date = attendanceState.date || new Date().toISOString().slice(0, 10);
  title.textContent = `LMS va Turniket Davomat Auditi (${date})`;
  body.innerHTML = `
    <div style="padding:40px; text-align:center;">
      <div class="spinner" style="margin:0 auto 10px;"></div>
      <p style="color:#64748B; font-weight:600;">LMS davomati va turniket o'tishlari solishtirilmoqda...</p>
    </div>
  `;
  modal.classList.add('active');

  try {
    const res = await apiFetch(`/api/attendance/lms-turniket-audit?date=${encodeURIComponent(date)}`);
    const data = res.data || res;
    if (!data) throw new Error("Audit ma'lumotlari topilmadi");

    const discrepancies = data.discrepancies || [];
    let rowsHtml = '';
    if (discrepancies.length === 0) {
      rowsHtml = `
        <tr>
          <td colspan="5" style="text-align:center; padding:30px; color:#16A34A; font-weight:700;">
            🎉 Ushbu kunda hech qanday shubhali nomuvofiqlik aniqlanmadi! LMS va Turniket ma'lumotlari to'liq mos keladi.
          </td>
        </tr>
      `;
    } else {
      discrepancies.forEach(item => {
        const isSuspicious = item.verdict === 'SUSPICIOUS_PRESENT';
        rowsHtml += `
          <tr style="border-bottom:1px solid #F1F5F9;">
            <td style="padding:10px 12px;">
              <div style="font-weight:700; color:#0F172A; font-size:12.5px;">${item.student_name}</div>
              <div style="font-size:11px; color:#64748B;">Guruh: <b style="color:#1D4ED8;">${item.group_code}</b></div>
            </td>
            <td style="padding:10px 12px; font-size:12px;">
              <div style="font-weight:700; color:#334155;">${item.subject}</div>
              <div style="color:#64748B; font-size:11px;">⏰ ${item.time_str}</div>
            </td>
            <td style="padding:10px 12px; text-align:center;">
              <span class="badge" style="background:${item.lms_status === 'Present' ? '#DCFCE7' : '#FEE2E2'}; color:${item.lms_status === 'Present' ? '#15803D' : '#B91C1C'}; font-weight:700; padding:3px 8px; border-radius:6px; font-size:11px;">
                ${item.lms_status}
              </span>
            </td>
            <td style="padding:10px 12px; text-align:center; font-size:11.5px;">
              ${item.in_building_during_class 
                ? '<span style="color:#15803D; font-weight:700;">🟢 Binoda bo\'lgan</span>' 
                : '<span style="color:#DC2626; font-weight:700;">🔴 Turniketda yo\'q</span>'}
            </td>
            <td style="padding:10px 12px; text-align:center;">
              ${isSuspicious 
                ? '<span style="background:#FEE2E2; color:#B91C1C; font-weight:800; padding:4px 8px; border-radius:6px; font-size:11px; border:1px solid #FECACA;">⚠️ Shubhali (LMSda bor, Turniketda yo\'q)</span>'
                : '<span style="background:#FEF3C7; color:#B45309; font-weight:700; padding:4px 8px; border-radius:6px; font-size:11px;">E\'tiborga molik</span>'}
            </td>
          </tr>
        `;
      });
    }

    body.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:16px;">
        <!-- AUDIT STATISTIKASI -->
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap:10px;">
          <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px; padding:12px; text-align:center;">
            <div style="font-size:11px; color:#64748B; font-weight:700;">Jami Talabalar</div>
            <div style="font-size:18px; font-weight:800; color:#0F172A; margin-top:2px;">${data.total_students}</div>
          </div>
          <div style="background:#EFF6FF; border:1px solid #BFDBFE; border-radius:8px; padding:12px; text-align:center;">
            <div style="font-size:11px; color:#1E40AF; font-weight:700;">Turniketga Kelgan</div>
            <div style="font-size:18px; font-weight:800; color:#1D4ED8; margin-top:2px;">${data.students_with_turniket}</div>
          </div>
          <div style="background:#F0FDF4; border:1px solid #BBF7D0; border-radius:8px; padding:12px; text-align:center;">
            <div style="font-size:11px; color:#166534; font-weight:700;">LMS & Turniket Mos (Verified)</div>
            <div style="font-size:18px; font-weight:800; color:#15803D; margin-top:2px;">${data.verified_matches}</div>
          </div>
          <div style="background:#FEF2F2; border:1px solid #FECACA; border-radius:8px; padding:12px; text-align:center;">
            <div style="font-size:11px; color:#991B1B; font-weight:700;">Shubhali Holatlar</div>
            <div style="font-size:18px; font-weight:800; color:#DC2626; margin-top:2px;">${data.suspicious_count}</div>
          </div>
          <div style="background:#FAF5FF; border:1px solid #E9D5FF; border-radius:8px; padding:12px; text-align:center;">
            <div style="font-size:11px; color:#7E22CE; font-weight:700;">LMS Ishonchliligi</div>
            <div style="font-size:18px; font-weight:800; color:#6B21A8; margin-top:2px;">${data.reliability_rate}%</div>
          </div>
        </div>

        <div style="background:#FFFBEB; border:1px solid #FDE68A; border-radius:8px; padding:10px 14px; font-size:12px; color:#92400E; display:flex; align-items:center; gap:8px;">
          <span>💡</span>
          <div>
            <b>Audit maqsadi:</b> O'qituvchilar tomonidan LMS (Moodle) ga kiritilgan davomat haqiqatan talabaning turniket orqali universitetga kirib-chiqqan vaqtlari bilan to'g'ri keladimi yoki soxta/noto'g'ri belgilanganligini avtomatik tekshirish.
          </div>
        </div>

        <!-- SHUBHALI / MOS KELMAGAN RO'YXAT -->
        <div>
          <h4 style="font-size:13.5px; font-weight:800; color:#1E293B; margin:0 0 8px;">
            ⚠️ Mos Kelmagan va Shubhali Davomat Qaydlari (${discrepancies.length} ta)
          </h4>
          <div class="table-responsive" style="max-height:300px; overflow-y:auto; border:1px solid #E2E8F0; border-radius:8px;">
            <table class="table" style="width:100%; font-size:12px; margin:0; border-collapse:collapse;">
              <thead style="background:#F8FAFC; position:sticky; top:0; z-index:2; border-bottom:1px solid #E2E8F0;">
                <tr>
                  <th style="padding:10px 12px; text-align:left;">Talaba / Guruh</th>
                  <th style="padding:10px 12px; text-align:left;">Fan / Dars Vaqti</th>
                  <th style="padding:10px 12px; text-align:center;">LMS Holati</th>
                  <th style="padding:10px 12px; text-align:center;">Turniket Holati</th>
                  <th style="padding:10px 12px; text-align:center;">Audit Xulosasi</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    body.innerHTML = `<div style="color:#EF4444; padding:30px; text-align:center; font-weight:700;">Audit yuklashda xatolik: ${err.message}</div>`;
  }
}

window.impersonateStaffUser = impersonateStaffUser;
window.exitImpersonation = exitImpersonation;
window.showEditStudentModal = showEditStudentModal;
window.handleEditStudentSubmit = handleEditStudentSubmit;
window.showStudentModal = showStudentModal;
window.showStudentDetailsModal = showStudentDetailsModal;
window.triggerHikCentralSync = triggerHikCentralSync;
window.checkHikConnectionStatus = checkHikConnectionStatus;
window.showStudentAttendanceModal = showStudentAttendanceModal;
window.openLmsTurniketAuditModal = openLmsTurniketAuditModal;
window.changeAttendancePage = changeAttendancePage;
window.filterAttendanceByCard = filterAttendanceByCard;
window.updateActiveKpiCard = updateActiveKpiCard;
window.downloadAttendanceExcel = downloadAttendanceExcel;

// ====================================================================
// LMS (MOODLE) MONITORING VA DARSLAR BOSHQARUVI (WEB PORTAL)
// ====================================================================

let currentLmsSubTab = 'sessions';
let cachedLmsOverview = null;
let cachedLmsTimetable = null;
let cachedLmsStudents = null;

async function renderLmsMonitoring(container) {
  container.innerHTML = `
    <div style="display:flex; justify-content:center; align-items:center; min-height:280px;">
      <div class="spinner"></div>
      <span style="margin-left:12px; font-weight:600; color:#64748B;">LMS (Moodle) ma'lumotlari yuklanmoqda...</span>
    </div>
  `;

  try {
    const data = await apiFetch('/api/lms/overview');
    cachedLmsOverview = data;
    const kpis = data.kpis || {};
    const today = data.today || {};
    const recentSessions = data.recent_sessions || [];

    const pRate = kpis.overall_rate || 0;
    const rateColor = pRate >= 85 ? '#10B981' : (pRate >= 70 ? '#F59E0B' : '#EF4444');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 20px;">
        
        <!-- YUQORI KPI KARTALARI -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 14px;">
          <!-- 1. Jami rejalashtirilgan darslar -->
          <div class="card" style="padding: 18px 20px; border-radius: 16px; border-left: 4px solid #3B82F6; background: #FFFFFF; box-shadow: 0 2px 10px rgba(0,0,0,0.04);">
            <div style="font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px;">📅 Rejalashtirilgan Darslar</div>
            <div style="font-size: 28px; font-weight: 800; color: #0F172A; margin: 4px 0 2px;">${kpis.total_timetable || 0} <span style="font-size: 14px; font-weight: 600; color: #64748B;">ta</span></div>
            <div style="font-size: 12px; color: #64748B;">Semestr dars jadvali bo'yicha</div>
          </div>

          <!-- 2. O'tkazilgan darslar -->
          <div class="card" style="padding: 18px 20px; border-radius: 16px; border-left: 4px solid #10B981; background: #FFFFFF; box-shadow: 0 2px 10px rgba(0,0,0,0.04);">
            <div style="font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px;">🎓 O'tkazilgan Darslar</div>
            <div style="font-size: 28px; font-weight: 800; color: #10B981; margin: 4px 0 2px;">${kpis.taken_sessions || 0} <span style="font-size: 14px; font-weight: 600; color: #64748B;">ta</span></div>
            <div style="font-size: 12px; color: #64748B;">Moodle da davomati olingan</div>
          </div>

          <!-- 3. O'rtacha qatnashuv foizi -->
          <div class="card" style="padding: 18px 20px; border-radius: 16px; border-left: 4px solid ${rateColor}; background: #FFFFFF; box-shadow: 0 2px 10px rgba(0,0,0,0.04);">
            <div style="font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px;">📈 O'rtacha Davomat Foizi</div>
            <div style="font-size: 28px; font-weight: 800; color: ${rateColor}; margin: 4px 0 2px;">${pRate}%</div>
            <div style="font-size: 12px; color: #64748B;">🟢 ${kpis.present_count || 0} bor • 🔴 ${kpis.absent_count || 0} yo'q</div>
          </div>

          <!-- 4. Bugungi darslar -->
          <div class="card" style="padding: 18px 20px; border-radius: 16px; border-left: 4px solid #8B5CF6; background: #FFFFFF; box-shadow: 0 2px 10px rgba(0,0,0,0.04);">
            <div style="font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px;">🕒 Bugungi Darslar</div>
            <div style="font-size: 28px; font-weight: 800; color: #8B5CF6; margin: 4px 0 2px;">${today.count || 0} <span style="font-size: 14px; font-weight: 600; color: #64748B;">ta</span></div>
            <div style="font-size: 12px; color: #64748B;">Sana: ${today.date || ''}</div>
          </div>
        </div>

        <!-- SUB-TABLAR: DARS JURNALI, DARS JADVALI, TALABALAR REYTINGI -->
        <div class="card" style="padding: 0; border-radius: 16px; overflow: hidden; background: #FFFFFF; box-shadow: 0 2px 10px rgba(0,0,0,0.04);">
          <div style="display: flex; gap: 8px; border-bottom: 1px solid #E2E8F0; padding: 12px 18px; background: #F8FAFC; flex-wrap: wrap; align-items: center; justify-content: space-between;">
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button class="btn btn-sm ${currentLmsSubTab === 'sessions' ? 'btn-primary' : 'btn-outline'}" onclick="switchLmsSubTab('sessions')" id="tab-btn-lms-sessions" style="display: inline-flex; align-items: center; gap: 6px;">
                <span>📊 Dars Jurnali & Davomat</span>
              </button>
              <button class="btn btn-sm ${currentLmsSubTab === 'timetable' ? 'btn-primary' : 'btn-outline'}" onclick="switchLmsSubTab('timetable')" id="tab-btn-lms-timetable" style="display: inline-flex; align-items: center; gap: 6px;">
                <span>📅 Dars Jadvali (Timetable)</span>
              </button>
              <button class="btn btn-sm ${currentLmsSubTab === 'students' ? 'btn-primary' : 'btn-outline'}" onclick="switchLmsSubTab('students')" id="tab-btn-lms-students" style="display: inline-flex; align-items: center; gap: 6px;">
                <span>👥 Talabalar Davomat Reytingi</span>
              </button>
            </div>

            <div style="font-size: 12px; color: #64748B; display: inline-flex; align-items: center; gap: 6px;">
              <span>🌐 Moodle lms.akhu.uz bilan bog'langan</span>
            </div>
          </div>

          <!-- TAB KONTENTI MAYDONI -->
          <div id="lms-subtab-content" style="padding: 20px;">
            <!-- Dinamik kontent -->
          </div>
        </div>

      </div>
    `;

    renderLmsSubTabContent();
  } catch (err) {
    container.innerHTML = `<div class="card" style="padding: 30px; text-align: center; color: #EF4444;">Xatolik yuz berdi: ${err.message}</div>`;
  }
}

function switchLmsSubTab(tab) {
  currentLmsSubTab = tab;
  ['sessions', 'timetable', 'students'].forEach(t => {
    const btn = document.getElementById(`tab-btn-lms-${t}`);
    if (btn) {
      if (t === tab) {
        btn.classList.add('btn-primary');
        btn.classList.remove('btn-outline');
      } else {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-outline');
      }
    }
  });
  renderLmsSubTabContent();
}

async function renderLmsSubTabContent() {
  const container = document.getElementById('lms-subtab-content');
  if (!container) return;

  if (currentLmsSubTab === 'sessions') {
    renderLmsSessionsTab(container);
  } else if (currentLmsSubTab === 'timetable') {
    renderLmsTimetableTab(container);
  } else if (currentLmsSubTab === 'students') {
    renderLmsStudentsTab(container);
  }
}

// 1. DARS JURNALI VA DAVOMAT TABI
function renderLmsSessionsTab(container) {
  const sessions = cachedLmsOverview?.recent_sessions || [];

  container.innerHTML = `
    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
        <h3 style="font-size: 16px; font-weight: 700; color: #0F172A; margin: 0;">
          O'tkazilgan Dars Mashg'ulotlari Jurnali (So'nggi 25 ta)
        </h3>
        <span style="font-size: 12.5px; color: #64748B;">Batafsil talabalar ro'yxatini ko'rish uchun dars ustiga bosing</span>
      </div>

      <div class="table-responsive" style="border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden;">
        <table class="table" style="margin: 0; width: 100%; font-size: 13px;">
          <thead style="background: #F8FAFC;">
            <tr>
              <th style="padding: 12px 14px;">Sana & Vaqt</th>
              <th style="padding: 12px 14px;">Fan / Dars Mashg'uloti</th>
              <th style="padding: 12px 14px; text-align: center;">Jami Talabalar</th>
              <th style="padding: 12px 14px; text-align: center;">🟢 Bor</th>
              <th style="padding: 12px 14px; text-align: center;">🟡 Kech</th>
              <th style="padding: 12px 14px; text-align: center;">🔴 Kelmadi</th>
              <th style="padding: 12px 14px; text-align: center;">Davomat Foizi</th>
            </tr>
          </thead>
          <tbody>
            ${sessions.length === 0 ? `
              <tr><td colspan="7" style="text-align: center; padding: 30px; color: #94A3B8;">Hozircha o'tkazilgan darslar topilmadi</td></tr>
            ` : sessions.map(s => {
              const dt = s.sessdate_iso ? new Date(s.sessdate_iso).toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric', weekday: 'short' }) : '—';
              const rate = s.attendance_rate || 0;
              const badgeBg = rate >= 85 ? '#ECFDF5' : (rate >= 70 ? '#FFFBEB' : '#FEF2F2');
              const badgeColor = rate >= 85 ? '#059669' : (rate >= 70 ? '#D97706' : '#DC2626');

              return `
                <tr style="border-bottom: 1px solid #F1F5F9; transition: background 0.15s; cursor: pointer;" onmouseover="this.style.backgroundColor='#F8FAFC'" onmouseout="this.style.backgroundColor=''" onclick="openLmsSessionModal(${s.session_id})" title="Davomat tafsilotini ko'rish uchun bosing">
                  <td style="padding: 12px 14px; font-weight: 600; color: #1E293B; white-space: nowrap;">
                    📅 ${dt}
                  </td>
                  <td style="padding: 12px 14px;">
                    <strong style="color: #0F172A;">${s.course_name || `Kurs ${s.course_id}`}</strong>
                    ${s.description ? `<div style="font-size: 11.5px; color: #64748B; margin-top: 2px;">${s.description}</div>` : ''}
                  </td>
                  <td style="padding: 12px 14px; text-align: center; font-weight: 700; color: #334155;">
                    ${s.total_enrolled} ta
                  </td>
                  <td style="padding: 12px 14px; text-align: center; font-weight: 700; color: #10B981;">
                    ${s.present_count}
                  </td>
                  <td style="padding: 12px 14px; text-align: center; font-weight: 700; color: #F59E0B;">
                    ${s.late_count}
                  </td>
                  <td style="padding: 12px 14px; text-align: center; font-weight: 700; color: #EF4444;">
                    ${s.absent_count}
                  </td>
                  <td style="padding: 12px 14px; text-align: center;">
                    <span style="background: ${badgeBg}; color: ${badgeColor}; font-weight: 800; font-size: 12px; padding: 4px 10px; border-radius: 8px;">
                      ${rate}%
                    </span>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// 2. DARS JADVALI TABI (TIMETABLE)
async function renderLmsTimetableTab(container) {
  container.innerHTML = `
    <div style="display:flex; justify-content:center; padding:30px;">
      <div class="spinner"></div>
    </div>
  `;

  try {
    const res = await apiFetch('/api/lms/timetable');
    cachedLmsTimetable = res;
    const grouped = res.grouped_by_weekday || [];

    container.innerHTML = `
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; flex-wrap: wrap; gap: 10px;">
          <div>
            <h3 style="font-size: 16px; font-weight: 700; color: #0F172A; margin: 0 0 4px;">
              Universitet Haftalik Dars Jadvali (Timetable)
            </h3>
            <span style="font-size: 12.5px; color: #64748B;">Moodle tizimidagi barcha kurs va auditoriya jadvallari</span>
          </div>

          <div style="display: flex; gap: 6px; flex-wrap: wrap;" id="tt-weekday-buttons">
            <button class="btn btn-sm btn-primary" onclick="filterTtDay(0, this)">Hafta (Barchasi)</button>
            <button class="btn btn-sm btn-outline" onclick="filterTtDay(1, this)">Dush</button>
            <button class="btn btn-sm btn-outline" onclick="filterTtDay(2, this)">Sesh</button>
            <button class="btn btn-sm btn-outline" onclick="filterTtDay(3, this)">Chor</button>
            <button class="btn btn-sm btn-outline" onclick="filterTtDay(4, this)">Pay</button>
            <button class="btn btn-sm btn-outline" onclick="filterTtDay(5, this)">Juma</button>
            <button class="btn btn-sm btn-outline" onclick="filterTtDay(6, this)">Shan</button>
          </div>
        </div>

        <div id="tt-schedule-grid" style="display: flex; flex-direction: column; gap: 20px;">
          ${grouped.map(day => `
            <div class="tt-day-block" data-day="${day.weekday}" style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px; padding: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid #CBD5E1; padding-bottom: 8px;">
                <h4 style="font-size: 15px; font-weight: 800; color: #1E293B; margin: 0;">
                  📅 ${day.name}
                </h4>
                <span class="badge" style="background: #E2E8F0; color: #475569; font-weight: 700;">${day.lessons.length} ta dars</span>
              </div>

              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 12px;">
                ${day.lessons.length === 0 ? `
                  <div style="color: #94A3B8; font-size: 12.5px; padding: 10px;">Darslar yo'q</div>
                ` : day.lessons.map(l => {
                  const isLab = /lab|laboratoriya/i.test(l.subject_name);
                  const isLecture = /lecture|ma'ruza/i.test(l.subject_name);
                  const typeLabel = isLab ? '🔬 Lab' : (isLecture ? '🎓 Ma\'ruza' : '✏️ Amaliyot');

                  return `
                    <div style="background: #FFFFFF; border: 1.5px solid #E2E8F0; border-radius: 12px; padding: 14px; box-shadow: 0 1px 4px rgba(0,0,0,0.03); display: flex; flex-direction: column; gap: 6px;">
                      <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="background: #0F172A; color: white; font-weight: 800; font-size: 11.5px; padding: 3px 8px; border-radius: 6px; font-family: monospace;">
                          🕒 ${l.time_str}
                        </span>
                        <span style="font-size: 11px; font-weight: 700; color: #475569; background: #F1F5F9; padding: 2px 7px; border-radius: 6px;">
                          ${typeLabel}
                        </span>
                      </div>
                      <div style="font-size: 14px; font-weight: 700; color: #0F172A; line-height: 1.35; margin-top: 2px;">
                        ${l.subject_name}
                      </div>
                      <div style="font-size: 12px; color: #64748B; margin-top: 4px; display: flex; flex-direction: column; gap: 2px;">
                        <span>👨‍🏫 <b>O'qituvchi:</b> ${l.teacher_name || 'Ko\'rsatilmagan'}</span>
                        <span>📍 <b>Auditoriya:</b> ${l.room || 'Ko\'rsatilmagan'}</span>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div style="color:#EF4444; padding:20px; text-align:center;">Dars jadvalini yuklashda xatolik: ${err.message}</div>`;
  }
}

function filterTtDay(dayNumber, btn) {
  document.querySelectorAll('#tt-weekday-buttons button').forEach(b => {
    b.classList.remove('btn-primary');
    b.classList.add('btn-outline');
  });
  if (btn) {
    btn.classList.add('btn-primary');
    btn.classList.remove('btn-outline');
  }

  document.querySelectorAll('.tt-day-block').forEach(el => {
    const d = Number(el.getAttribute('data-day'));
    if (dayNumber === 0 || d === dayNumber) {
      el.style.display = 'block';
    } else {
      el.style.display = 'none';
    }
  });
}

// 3. TALABALAR KESIMIDA DAVOMAT TABI
async function renderLmsStudentsTab(container) {
  container.innerHTML = `
    <div style="display:flex; justify-content:center; padding:30px;">
      <div class="spinner"></div>
    </div>
  `;

  try {
    const res = await apiFetch('/api/lms/students');
    cachedLmsStudents = res.students || [];

    container.innerHTML = `
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
          <div>
            <h3 style="font-size: 16px; font-weight: 700; color: #0F172A; margin: 0 0 4px;">
              Talabalar Dars Davomati Ko'rsatkichlari (Moodle)
            </h3>
            <span style="font-size: 12.5px; color: #64748B;">Barcha talabalarning semestr davomidagi darslarga qatnashish foizlari</span>
          </div>

          <div style="display: flex; gap: 8px;">
            <input type="text" id="lms-student-search-input" placeholder="Ism yoki pasport..." oninput="handleLmsStudentSearch()" style="padding: 7px 12px; border: 1px solid #CBD5E1; border-radius: 8px; font-size: 12.5px; width: 220px;" />
          </div>
        </div>

        <div class="table-responsive" style="border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden;">
          <table class="table" style="margin: 0; width: 100%; font-size: 13px;" id="lms-students-table">
            <thead style="background: #F8FAFC;">
              <tr>
                <th style="padding: 10px 14px;">#</th>
                <th style="padding: 10px 14px;">Talaba F.I.Sh</th>
                <th style="padding: 10px 14px;">Guruh</th>
                <th style="padding: 10px 14px;">Pasport ID</th>
                <th style="padding: 10px 14px; text-align: center;">Jami Darslar</th>
                <th style="padding: 10px 14px; text-align: center;">🟢 Bor</th>
                <th style="padding: 10px 14px; text-align: center;">🟡 Kech</th>
                <th style="padding: 10px 14px; text-align: center;">🔴 Kelmadi</th>
                <th style="padding: 10px 14px; text-align: center;">Davomat Foizi</th>
              </tr>
            </thead>
            <tbody id="lms-students-tbody">
              <!-- To'ldiriladi -->
            </tbody>
          </table>
        </div>
      </div>
    `;

    renderLmsStudentsTbody(cachedLmsStudents);
  } catch (err) {
    container.innerHTML = `<div style="color:#EF4444; padding:20px; text-align:center;">Talabalar ro'yxatini yuklashda xatolik: ${err.message}</div>`;
  }
}

function renderLmsStudentsTbody(students) {
  const tbody = document.getElementById('lms-students-tbody');
  if (!tbody) return;

  if (students.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 25px; color: #94A3B8;">Mos talabalar topilmadi</td></tr>`;
    return;
  }

  tbody.innerHTML = students.map((st, idx) => {
    const rate = st.attendance_rate || 0;
    const color = rate >= 85 ? '#10B981' : (rate >= 70 ? '#F59E0B' : '#EF4444');
    const bg = rate >= 85 ? '#ECFDF5' : (rate >= 70 ? '#FFFBEB' : '#FEF2F2');

    return `
      <tr style="border-bottom: 1px solid #F1F5F9;">
        <td style="padding: 10px 14px; color: #64748B; font-weight: 600;">${idx + 1}</td>
        <td style="padding: 10px 14px; font-weight: 700; color: #0F172A;">${st.full_name}</td>
        <td style="padding: 10px 14px;"><span class="badge" style="background:#EFF6FF; color:#2563EB;">${st.group_code || '—'}</span></td>
        <td style="padding: 10px 14px; font-family: monospace; font-weight: 600; color: #475569;">${st.external_id || '—'}</td>
        <td style="padding: 10px 14px; text-align: center; font-weight: 700;">${st.total_classes}</td>
        <td style="padding: 10px 14px; text-align: center; font-weight: 700; color: #10B981;">${st.present_count}</td>
        <td style="padding: 10px 14px; text-align: center; font-weight: 700; color: #F59E0B;">${st.late_count}</td>
        <td style="padding: 10px 14px; text-align: center; font-weight: 700; color: #EF4444;">${st.absent_count}</td>
        <td style="padding: 10px 14px; text-align: center;">
          <span style="background: ${bg}; color: ${color}; font-weight: 800; font-size: 12px; padding: 3px 8px; border-radius: 6px;">
            ${rate}%
          </span>
        </td>
      </tr>
    `;
  }).join('');
}

function handleLmsStudentSearch() {
  const query = (document.getElementById('lms-student-search-input')?.value || '').toLowerCase().trim();
  if (!cachedLmsStudents) return;

  const filtered = cachedLmsStudents.filter(st => {
    const fn = (st.full_name || '').toLowerCase();
    const id = (st.external_id || '').toLowerCase();
    const gr = (st.group_code || '').toLowerCase();
    return fn.includes(query) || id.includes(query) || gr.includes(query);
  });
  renderLmsStudentsTbody(filtered);
}

// 4. BITTA DARSNING TALABALAR RO'YXATI MODALI
async function openLmsSessionModal(sessionId) {
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalFooter = document.getElementById('modal-footer');

  modalTitle.textContent = 'Dars Davomati Tafsilotlari';
  modalBody.innerHTML = `
    <div style="display:flex; justify-content:center; padding:30px;">
      <div class="spinner"></div>
    </div>
  `;
  modalFooter.innerHTML = `<button class="btn btn-outline" onclick="closeModal()">Yopish</button>`;
  openModal();

  try {
    const res = await apiFetch(`/api/lms/sessions/${sessionId}`);
    const sess = res.session || {};
    const students = res.students || [];

    const dt = sess.sessdate_iso ? new Date(sess.sessdate_iso).toLocaleDateString('uz-UZ', { month: 'long', day: 'numeric', weekday: 'long' }) : '';

    modalBody.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:16px;">
        <!-- DARS INFO HADER -->
        <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:14px; padding:16px;">
          <h3 style="font-size:16px; font-weight:800; color:#0F172A; margin:0 0 6px;">${sess.course_name || `Kurs ${sess.course_id}`}</h3>
          <div style="font-size:12.5px; color:#64748B; display:flex; flex-wrap:wrap; gap:12px;">
            <span>📅 <b>Sana:</b> ${dt}</span>
            <span>⏱️ <b>Davomiyligi:</b> ${Math.round(sess.duration / 60)} daqiqa</span>
            <span>👥 <b>Jami yozilgan:</b> ${sess.total_enrolled} ta talaba</span>
          </div>
          <div style="margin-top:10px; display:flex; gap:8px;">
            <span class="badge" style="background:#ECFDF5; color:#059669; font-weight:700;">🟢 Bor: ${sess.present_count}</span>
            <span class="badge" style="background:#FFFBEB; color:#D97706; font-weight:700;">🟡 Kech: ${sess.late_count}</span>
            <span class="badge" style="background:#EFF6FF; color:#2563EB; font-weight:700;">🔵 Sababli: ${sess.excused_count}</span>
            <span class="badge" style="background:#FEF2F2; color:#DC2626; font-weight:700;">🔴 Kelmadi: ${sess.absent_count}</span>
          </div>
        </div>

        <!-- TALABALAR RO'YXATI -->
        <h4 style="font-size:14px; font-weight:700; margin:0;">Talabalar davomati ro'yxati (${students.length} nafar):</h4>
        <div style="max-height:360px; overflow-y:auto; border:1px solid #E2E8F0; border-radius:12px;">
          <table class="table" style="margin:0; width:100%; font-size:12.5px;">
            <thead style="background:#F1F5F9; position:sticky; top:0;">
              <tr>
                <th style="padding:8px 12px;">#</th>
                <th style="padding:8px 12px;">Talaba</th>
                <th style="padding:8px 12px;">Guruh</th>
                <th style="padding:8px 12px; text-align:center;">Holat</th>
                <th style="padding:8px 12px;">Izoh</th>
              </tr>
            </thead>
            <tbody>
              ${students.map((st, i) => {
                let badge = '';
                if (st.status === 'P') badge = '<span style="background:#ECFDF5; color:#059669; font-weight:700; padding:2px 8px; border-radius:6px;">🟢 Bor</span>';
                else if (st.status === 'L') badge = '<span style="background:#FFFBEB; color:#D97706; font-weight:700; padding:2px 8px; border-radius:6px;">🟡 Kech</span>';
                else if (st.status === 'E') badge = '<span style="background:#EFF6FF; color:#2563EB; font-weight:700; padding:2px 8px; border-radius:6px;">🔵 Sababli</span>';
                else badge = '<span style="background:#FEF2F2; color:#DC2626; font-weight:700; padding:2px 8px; border-radius:6px;">🔴 Kelmadi</span>';

                return `
                  <tr style="border-bottom:1px solid #F1F5F9;">
                    <td style="padding:8px 12px; color:#64748B;">${i + 1}</td>
                    <td style="padding:8px 12px; font-weight:700; color:#0F172A;">${st.student_name}</td>
                    <td style="padding:8px 12px;"><span class="badge" style="background:${st.group_code ? '#EFF6FF' : '#F1F5F9'}; color:${st.group_code ? '#1D4ED8' : '#94A3B8'}; font-weight:700; padding:3px 8px; border-radius:6px; font-size:11.5px; border:1px solid ${st.group_code ? '#BFDBFE' : '#E2E8F0'};">${st.group_code || '—'}</span></td>
                    <td style="padding:8px 12px; text-align:center;">${badge}</td>
                    <td style="padding:8px 12px; font-size:11px; color:#64748B;">${st.remarks || '—'}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } catch (err) {
    modalBody.innerHTML = `<div style="color:#EF4444; padding:20px; text-align:center;">Xatolik: ${err.message}</div>`;
  }
}

// 5. QO'LDA SINXRONLASH
async function syncLmsManually(btnEl) {
  return triggerUnifiedSyncModal(btnEl);
}

window.renderLmsMonitoring = renderLmsMonitoring;
window.switchLmsSubTab = switchLmsSubTab;
window.filterTtDay = filterTtDay;
window.handleLmsStudentSearch = handleLmsStudentSearch;
window.openLmsSessionModal = openLmsSessionModal;
window.syncLmsManually = syncLmsManually;
window.triggerUnifiedSyncModal = triggerUnifiedSyncModal;
window.closeUnifiedSyncModal = closeUnifiedSyncModal;
window.triggerHikCentralSync = triggerUnifiedSyncModal;

// Birlashgan Darslar & Davomat Tizimi window eksportlari
window.renderUnifiedAttendance = renderUnifiedAttendance;
window.switchUnifiedAttTab = switchUnifiedAttTab;
window.handleUnifiedTtDay = handleUnifiedTtDay;
window.handleUnifiedTimetableFilter = handleUnifiedTimetableFilter;
window.setUnifiedLmsPeriod = setUnifiedLmsPeriod;
window.setUnifiedLmsDate = setUnifiedLmsDate;
window.loadUnifiedLmsOverviewData = loadUnifiedLmsOverviewData;
window.loadUnifiedGroupsRankingData = loadUnifiedGroupsRankingData;
window.filterCrossAuditCategory = filterCrossAuditCategory;
window.handleCrossAuditFilterChange = handleCrossAuditFilterChange;
window.handleCrossAuditSearch = handleCrossAuditSearch;
window.downloadCrossAuditExcel = downloadCrossAuditExcel;
window.switchTimetableMode = switchTimetableMode;




