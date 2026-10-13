// ====================================================================
// AKHU TALABALAR TIZIMI - ASOSIY BOSHQARUV VA KUZATUV SPA JS (app.js)
// ====================================================================

const AppState = {
  isLoggedIn: false,
  currentRole: 'observer',
  currentPage: 'observe-dashboard',
  catalog: { categories: [], items: [], scale: [] },
  user: {
    id: 'observer',
    name: 'Ommaviy Kuzatuvchi',
    roles: ['observer']
  }
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
  'observer': { label: 'Ommaviy Kuzatuv', color: '#60A5FA', bg: 'rgba(96, 165, 250, 0.1)' }
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
  refresh: (s=16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>`
};

function icon(name, size = 16) {
  return ICONS[name] ? ICONS[name](size) : '';
}



// API so'rov yuborish uchun yordamchi funksiya
async function apiFetch(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'x-user-id': AppState.user.id,
    ...(options.headers || {})
  };
  try {
    const res = await fetch(endpoint, { credentials: 'omit', ...options, headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: `Server xatosi: ${res.status}` }));
      throw new Error(err.error || `Xato yuz berdi (${res.status})`);
    }
    return await res.json();
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err);
    throw err;
  }
}

// Boshlang'ich yuklash
document.addEventListener('DOMContentLoaded', async () => {
  // Saqlangan tizim xodimi autentifikatsiyasini tekshirish
  const savedAuth = localStorage.getItem('akhu_auth_user');
  if (savedAuth) {
    try {
      const u = JSON.parse(savedAuth);
      if (u && u.id && u.roles) {
        AppState.isLoggedIn = true;
        AppState.user = u;
        AppState.currentRole = u.roles[0] || 'staff';
      }
    } catch (e) {
      localStorage.removeItem('akhu_auth_user');
    }
  }

  updateAuthUI();
  updateSidebarPermissions();
  initNavigation();
  initModals();
  initLoginForm();
  await loadCatalogData();
  
  // Boshlang'ich sahifani aniqlash (Hash yoki localStorage orqali tiklash)
  const hashPage = (window.location.hash || '').replace(/^#/, '').trim();
  const savedPage = localStorage.getItem('akhu_current_page');
  const targetPage = hashPage || savedPage || 'observe-dashboard';

  // Agar xodim kirmagan bo'lsa va sahifa yopiq xodimlar bo'limi bo'lsa
  if (!AppState.isLoggedIn && !targetPage.startsWith('observe-')) {
    AppState.currentPage = 'observe-dashboard';
  } else {
    AppState.currentPage = targetPage;
  }
  navigateTo(AppState.currentPage);

  // Hash o'zgarganda sahifani avtomatik almashtirish (Browser Back/Forward)
  window.addEventListener('hashchange', () => {
    const curHash = (window.location.hash || '').replace(/^#/, '').trim();
    if (curHash && curHash !== AppState.currentPage) {
      navigateTo(curHash);
    }
  });

  // Hodimlar kirishi tugmasi (to'g'ridan-to'g'ri tinglovchi)
  const loginBtn = document.getElementById('btn-login-modal');
  if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openLoginModal();
    });
  }
  const sideLoginBtn = document.getElementById('btn-sidebar-login');
  if (sideLoginBtn) {
    sideLoginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openLoginModal();
    });
  }

  // Refresh tugmasi
  const refreshBtn = document.getElementById('btn-refresh-data');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      navigateTo(AppState.currentPage);
    });
  }
});

// FOYDALANUVCHI STATUSI VA INTERFEYSINI YANGILASH
function updateAuthUI() {
  const loginBtn = document.getElementById('btn-login-modal');
  const sideLoginBtn = document.getElementById('btn-sidebar-login');
  const loggedBox = document.getElementById('auth-logged-box');
  const topbarUser = document.getElementById('topbar-user-name');
  const topbarAvatarImg = document.getElementById('topbar-avatar-img');
  const topbarAvatarFallback = document.getElementById('topbar-avatar-fallback');
  const roleTag = document.getElementById('role-tag');
  const authUserDisplay = document.getElementById('auth-user-display');

  if (AppState.isLoggedIn) {
    if (loginBtn) loginBtn.style.display = 'none';
    if (sideLoginBtn) sideLoginBtn.style.display = 'none';
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
    const meta = ROLE_META[mainRole] || { label: mainRole, color: '#3B82F6', bg: '#EFF6FF' };
    
    if (roleTag) {
      roleTag.textContent = meta.label;
      roleTag.style.color = meta.color;
      roleTag.style.background = meta.bg;
      roleTag.style.borderColor = meta.color + '40';
    }
    if (authUserDisplay) {
      authUserDisplay.textContent = fullName;
    }
  } else {
    if (loginBtn) loginBtn.style.display = 'inline-flex';
    if (sideLoginBtn) sideLoginBtn.style.display = 'flex';
    if (loggedBox) loggedBox.style.display = 'none';

    if (roleTag) {
      roleTag.textContent = 'Ommaviy Kuzatuv';
      roleTag.style.color = '#60A5FA';
      roleTag.style.background = 'rgba(96, 165, 250, 0.1)';
      roleTag.style.borderColor = 'rgba(96, 165, 250, 0.2)';
    }
    if (authUserDisplay) {
      authUserDisplay.textContent = 'Ochiq Monitoring';
    }
  }
}

// XODIMNING TIZIMDAN CHIQISHI (LOGOUT)
function logoutStaffUser() {
  if (confirm("Haqiqatan ham tizimdan chiqmoqchimisiz?")) {
    localStorage.removeItem('akhu_auth_user');
    localStorage.removeItem('akhu_current_page');
    AppState.isLoggedIn = false;
    AppState.currentRole = 'observer';
    AppState.user = {
      id: 'observer',
      name: 'Ommaviy Kuzatuvchi',
      roles: ['observer']
    };
    updateAuthUI();
    updateSidebarPermissions();
    window.location.hash = '#observe-dashboard';
    navigateTo('observe-dashboard');
  }
}

// LOGIN MODAL
function openLoginModal() {
  const modal = document.getElementById('login-modal');
  const errBox = document.getElementById('login-error-msg');
  if (errBox) errBox.style.display = 'none';
  if (modal) {
    modal.classList.add('active');
    modal.style.display = 'flex';
    setTimeout(() => {
      const uInput = document.getElementById('login-username');
      if (uInput) uInput.focus();
    }, 50);
  }
}

function closeLoginModal() {
  const modal = document.getElementById('login-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
  }
}

window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;
window.logoutStaffUser = logoutStaffUser;

function initLoginForm() {
  const form = document.getElementById('portal-login-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const usernameInput = document.getElementById('login-username');
    const passwordInput = document.getElementById('login-password');
    const errBox = document.getElementById('login-error-msg');

    const username = usernameInput ? usernameInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value : '';

    if (!username || !password) return;

    try {
      if (errBox) errBox.style.display = 'none';
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Kirish xatosi');

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

      updateAuthUI();
      updateSidebarPermissions();
      closeLoginModal();

      // Muvaffaqiyatli xabarnoma va sahifaga yo'naltirish
      if (AppState.user.roles.includes('superadmin')) {
        navigateTo('admin-users-manage');
      } else if (AppState.user.roles.includes('tutor')) {
        navigateTo('tutor-my-students');
      } else if (AppState.user.roles.includes('prorektor')) {
        navigateTo('prorektor-queue');
      } else if (AppState.user.roles.includes('dep_ob')) {
        navigateTo('admin-students-manage');
      } else if (AppState.user.roles.some(r => r.startsWith('dep_'))) {
        navigateTo('dept-approvals');
      } else {
        navigateTo('observe-dashboard');
      }
    } catch (err) {
      if (errBox) {
        errBox.textContent = err.message;
        errBox.style.display = 'block';
      } else {
        alert(err.message);
      }
    }
  });
}

function updateSidebarPermissions() {
  const sections = document.querySelectorAll('.nav-role-section');
  const userRoles = AppState.isLoggedIn ? (AppState.user.roles || []) : [];

  sections.forEach(el => {
    const forRole = el.getAttribute('data-for-role');
    let visible = false;

    if (AppState.isLoggedIn) {
      if (forRole === 'staff') {
        visible = true; // Barcha xodimlar shaxsiy profilini ko'radi
      } else if (userRoles.includes('superadmin')) {
        visible = true; // Superadmin barcha bo'limlarni ko'radi
      } else if (forRole === 'tutor' && userRoles.includes('tutor')) {
        visible = true;
      } else if (forRole === 'approver' && (userRoles.some(r => r.startsWith('dep_')) || userRoles.includes('prorektor'))) {
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
  if (AppState.isLoggedIn && (userRoles.some(r => r.startsWith('dep_')) || userRoles.includes('prorektor') || userRoles.includes('superadmin'))) {
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
  'dept-gpa-import': 'admin-students-manage',

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
  'admin-catalog': 'admin-users-manage',
  'admin-audit': 'admin-users-manage',
  'admin-bot-monitoring': 'admin-users-manage',

  'staff-my-profile': 'staff-my-profile'
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
    tabs = [
      { id: 'admin-students-manage', label: 'Talabalar Ro\'yxati' },
      { id: 'dept-gpa-import', label: 'GPA va Davomat Importi' }
    ];
  } else if (sectionKey === 'dept-events') {
    tabs = [
      { id: 'dept-events', label: 'Barcha Tadbirlar' }
    ];
    if (AppState.isLoggedIn) {
      extraActions = `
        <div class="module-nav-actions">
          <button class="btn btn-primary btn-sm" onclick="openCreateEventModal()" style="display:inline-flex; align-items:center; gap:6px;">
            ${icon('calendar', 14)} <span>Yangi Tadbir Qo'shish</span>
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
  } else if (sectionKey === 'staff-my-profile') {
    tabs = [
      { id: 'staff-my-profile', label: 'Shaxsiy Profil' }
    ];
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
      e.preventDefault();
      const page = link.getAttribute('data-page');
      if (page) navigateTo(page);
    });
  });
}

function navigateTo(pageName) {
  // Himoya: Xodimlar bo'limiga kirish uchun tizimga kirish talab qilinadi
  if (!AppState.isLoggedIn && !pageName.startsWith('observe-') && pageName !== 'dept-events') {
    openLoginModal();
    const errBox = document.getElementById('login-error-msg');
    if (errBox) {
      errBox.textContent = "Ushbu boshqaruv bo'limiga kirish uchun xodim akkauntingizga kiring!";
      errBox.style.display = 'block';
    }
    pageName = 'observe-dashboard';
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
      pageTitle.textContent = 'GPA & Davomat Import';
      pageDesc.textContent = 'Semestr yakuni bo\'yicha avtomatik ballar importi (O\'quv bo\'limi)';
      renderGpaImport(targetContainer);
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
// SAHIFA: TYUTOR BALL KIRITISH (R-01, R-02, R-04, R-06)
// -------------------------------------------------------------
async function renderTutorAddPoints(container) {
  try {
    const studRes = await apiFetch('/api/tutor/students');
    const students = studRes.students || [];
    const catRes = await apiFetch('/api/observe/catalog');
    const items = (catRes.items || []).filter(i => !i.is_auto);

    let html = `
      <div class="card" style="max-width: 800px; margin: 0 auto;">
        <div class="card-header">
          <h3>Talabalarga Ball Kiritish Formasi</h3>
          <span style="font-size: 12px; color: var(--text-muted);">Bir nechta talabani tanlash mumkin (R-01)</span>
        </div>
        <div class="card-body">
          <form id="tutor-entry-form">
            <!-- 1. TALABALARNI TANLASH -->
            <div class="form-group mb-3">
              <label class="form-label">Talabalarni tanlang (Bir yoki bir nechta):</label>
              <div style="max-height: 150px; overflow-y: auto; border: 1px solid var(--border); padding: 8px; border-radius: 6px;">
                ${students.map(s => `
                  <label style="display: block; font-size: 13px; margin-bottom: 4px; cursor: pointer;">
                    <input type="checkbox" name="selected_students" value="${s.id}">
                    ${s.first_name} ${s.last_name} (${s.group_code})
                  </label>
                `).join('')}
              </div>
            </div>

            <!-- 2. KATALOG BANDINI TANLASH -->
            <div class="form-group mb-3">
              <label class="form-label">Katalog bandi:</label>
              <select id="entry-item-id" class="form-control" required>
                <option value="">-- Bandni tanlang --</option>
                ${items.map(it => `
                  <option value="${it.id}" data-scale="${it.is_scale}" data-base="${it.base_points}" data-hint="${it.evidence_hint || ''}">
                    [${it.category_name}] ${it.name} ${it.base_points !== null ? `(${it.base_points} ball)` : '(Shkala)'}
                  </option>
                `).join('')}
              </select>
            </div>

            <!-- 3. SHKALA BO'LSA: DARAJA VA ROL -->
            <div id="scale-fields-box" class="grid grid-2 mb-3" style="display: none;">
              <div class="form-group">
                <label class="form-label">Musobaqa Darajasi:</label>
                <select id="entry-scale-level" class="form-control">
                  <option value="universitet">Universitet</option>
                  <option value="viloyat">Viloyat</option>
                  <option value="respublika">Respublika</option>
                  <option value="xalqaro">Xalqaro</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Egallangan o'rin (Rol):</label>
                <select id="entry-scale-role" class="form-control">
                  <option value="ishtirok">Ishtirok</option>
                  <option value="sovrindor">Sovrindor (2-3 o'rin)</option>
                  <option value="golib">G'olib (1-o'rin)</option>
                </select>
              </div>
            </div>

            <!-- 4. BALL MIQDORI -->
            <div class="form-group mb-3">
              <label class="form-label">Ball miqdori: <span id="points-range-hint" style="color: #2563EB; font-size: 12px;"></span></label>
              <input type="number" id="entry-points" class="form-control" required>
            </div>

            <!-- 5. SANA -->
            <div class="form-group mb-3">
              <label class="form-label">Tadbir / Faollik sanasi:</label>
              <input type="date" id="entry-date" class="form-control" value="${new Date().toISOString().split('T')[0]}" required>
            </div>

            <!-- 6. IZOH VA DALIL HAVOLASI -->
            <div class="form-group mb-3">
              <label class="form-label">Izoh / Asos:</label>
              <textarea id="entry-note" class="form-control" rows="2" placeholder="Masalan: 'Universitet shaxmat turnirida 1-o'rin'"></textarea>
            </div>

            <div class="form-group mb-4">
              <label class="form-label">Dalil hujjati / fayl havolasi (|ball| > 10 bo'lsa majburiy - R-04):</label>
              <input type="url" id="entry-evidence-url" class="form-control" placeholder="https://... yoki fayl havolasi">
              <small id="evidence-hint-text" style="color: var(--text-muted); display: block; margin-top: 4px;"></small>
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%;">
              ${icon('check', 15)} Ball Yozuvini Yuborish (Tasdiqqa)
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

    // Form topshirish
    document.getElementById('tutor-entry-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const checkboxes = document.querySelectorAll('input[name="selected_students"]:checked');
      const studentIds = Array.from(checkboxes).map(c => c.value);

      if (studentIds.length === 0) {
        alert('Iltimos, kamida bitta talabani tanlang!');
        return;
      }

      const itemId = itemSelect.value;
      const points = Number(pointsInput.value);
      const isScale = itemSelect.selectedOptions[0].getAttribute('data-scale') === '1';
      const date = document.getElementById('entry-date').value;
      const note = document.getElementById('entry-note').value;
      const evidenceUrl = document.getElementById('entry-evidence-url').value;

      try {
        const payload = {
          student_ids: studentIds,
          item_id: itemId,
          points,
          scale_level: isScale ? document.getElementById('entry-scale-level').value : null,
          scale_role: isScale ? document.getElementById('entry-scale-role').value : null,
          event_date: date,
          note,
          evidence_url: evidenceUrl || null
        };

        const res = await apiFetch('/api/tutor/entries', {
          method: 'POST',
          body: JSON.stringify(payload)
        });

        alert(`Muvaffaqiyatli saqlandi! Yaratilgan yozuvlar soni: ${res.created_entries.length}`);
        navigateTo('tutor-history');
      } catch (err) {
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
                    <td>${e.item_name}</td>
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
                  ${icon('fileText', 13)} <strong>Izoh:</strong> ${e.note || 'Ko\'rsatilmagan'}
                </p>
                ${e.evidence_url ? `
                  <p style="font-size: 13px; margin-bottom: 12px;">
                    ${icon('link', 13)} <strong>Dalil:</strong> <a href="${e.evidence_url}" target="_blank" style="color: #2563EB; word-break: break-all;">${e.evidence_url}</a>
                  </p>
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

  modalTitle.textContent = 'Arizani Rad Etish';
  modalBody.innerHTML = `
    <div class="form-group mb-3">
      <label class="form-label">Rad etish sababi kodi:</label>
      <select id="reject-reason-code" class="form-control">
        <option value="evidence_missing">Dalil hujjati mavjud emas</option>
        <option value="fake_evidence">Dalil asossiz yoki soxta</option>
        <option value="wrong_item">Noto'g'ri katalog bandi tanlangan</option>
        <option value="wrong_level">Musobaqa darajasi noto'g'ri ko'rsatilgan</option>
        <option value="limit_exceeded">Ushbu band bo'yicha limit tugagan</option>
        <option value="other">Boshqa sabab</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Batafsil izoh (Talaba va tyutorga ko'rinadi):</label>
      <textarea id="reject-note-text" class="form-control" rows="3" placeholder="Rad etish sababini aniq ko'rsating..."></textarea>
    </div>
  `;

  modalFooter.innerHTML = `
    <button class="btn btn-outline" onclick="closeModal()">Bekor qilish</button>
    <button class="btn btn-danger" onclick="submitReject('${id}')">Rad Etishni Tasdiqlash</button>
  `;

  openModal();
}

async function submitReject(id) {
  const code = document.getElementById('reject-reason-code').value;
  const note = document.getElementById('reject-note-text').value;

  try {
    await apiFetch(`/api/approvals/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason_code: code, note })
    });
    closeModal();
    alert('Ariza rad etildi');
    navigateTo('dept-approvals');
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
      AppState.user.roles.includes('superadmin') ||
      AppState.user.roles.includes('prorektor') ||
      AppState.user.roles.some(r => r.startsWith('dep_'))
    );

    let html = `
      <div class="admin-hero-card" style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
          <div>
            <div class="admin-hero-title">
              <span style="color: #60A5FA;">${icon('calendar', 22)}</span>
              <span>Universitet Tadbirlari & QR Check-in Tizimi</span>
            </div>
            <p class="admin-hero-desc">
              Tadbirlarni e'lon qilish, umumiy Tadbir QR kodlarini chiqarish (talaba skanerlaydi) yoki talabalarning shaxsiy QR kodlarini skanerlash (xodim qabul qiladi).
            </p>
          </div>
          ${isStaffOrAdmin ? `
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button class="btn btn-primary" onclick="openCreateEventModal()" style="display: inline-flex; align-items: center; gap: 6px;">
                ${icon('calendar', 15)} <span>+ Yangi Tadbir Yaratish</span>
              </button>
              <button class="btn btn-outline" onclick="showStudentCheckinModal()" style="display: inline-flex; align-items: center; gap: 6px; background: #FFFFFF;">
                ${icon('qrCode', 15)} <span>📷 Talaba QR Skanerlash / Qabul Qilish</span>
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
          <h3 style="margin-bottom: 8px;">Hozircha tizimda e'lon qilingan tadbirlar mavjud emas</h3>
          <p style="color: var(--text-muted); max-width: 500px; margin: 0 auto 20px; font-size: 13.5px; line-height: 1.5;">
            Universitet talabalari uchun yangi ilmiy, madaniy, sport yoki ijtimoiy tadbir e'lon qiling va talabalar uchun QR kodlarini yarating.
          </p>
          ${isStaffOrAdmin ? `
            <div style="display: flex; justify-content: center; gap: 10px;">
              <button class="btn btn-primary" onclick="openCreateEventModal()">
                ${icon('calendar', 15)} + Yangi Tadbir Yaratish
              </button>
            </div>
          ` : ''}
        </div>
      `;
    } else {
      html += `
        <div class="grid grid-2">
          ${events.map(ev => {
            const startsFormatted = new Date(ev.starts_at).toLocaleString('uz-UZ', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            const endsFormatted = new Date(ev.ends_at).toLocaleString('uz-UZ', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            const isEnded = new Date() > new Date(ev.ends_at);
            const isCreator = (ev.created_by === AppState.user.id || ev.organizer_unit === AppState.user.id);
            const isSuperadmin = AppState.user.roles.includes('superadmin');
            const canManage = isStaffOrAdmin && (isSuperadmin || isCreator);
            const canEdit = canManage && !isEnded;
            const attOpenMin = ev.attendance_open_minutes_before ?? 5;

            return `
              <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); ${isEnded ? 'opacity: 0.92; border-color: #E2E8F0;' : ''}">
                <div>
                  <div class="card-header" style="border-bottom: 1px solid var(--border-light); padding-bottom: 12px;">
                    <div>
                      <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
                        <span class="badge" style="background: ${ev.category_color}20; color: ${ev.category_color}; border: 1px solid ${ev.category_color}40; font-weight: 600;">
                          ${ev.category_name}
                        </span>
                        ${isEnded ? `
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
                    <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                      ${icon('mapPin', 14)} <span><strong>O'tkazilish joyi:</strong> ${ev.place}</span>
                    </p>
                    <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                      ${icon('clock', 14)} <span><strong>Vaqti:</strong> ${startsFormatted} &mdash; ${endsFormatted}</span>
                    </p>
                    <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
                      ${icon('building', 14)} <span><strong>Tashkilotchi:</strong> ${ev.organizer_unit}</span>
                    </p>
                    <div style="background: #F8FAFC; border-radius: 8px; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; font-size: 12.5px;">
                      <span style="color: var(--text-secondary);">Qabul qilingan talabalar:</span>
                      <span style="font-weight: 700; color: #1E293B;">${ev.checkins_count || 0} nafar ${ev.capacity ? `/ ${ev.capacity} ta o'rin` : ''}</span>
                    </div>
                  </div>
                </div>

                <div class="card-footer" style="background: #FAFAFA; border-top: 1px solid var(--border-light); padding: 10px 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                  <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                    ${!isEnded ? `
                      <button class="btn btn-outline btn-sm" onclick="showEventQrModal('${ev.id}')" title="1-Usul: Jonli Tadbir QR kodini chiqarish (talaba skanerlaydi, har 5s yangilanadi)" style="display: inline-flex; align-items: center; gap: 5px;">
                        ${icon('qrCode', 13)} <span>Tadbir QR (5s Dinamik)</span>
                      </button>
                      ${isStaffOrAdmin ? `
                        <button class="btn btn-primary btn-sm" onclick="showStudentCheckinModal('${ev.id}')" title="2-Usul: Talaba QR kodini yoki ID raqamini skanerlab ball berish" style="display: inline-flex; align-items: center; gap: 5px;">
                          ${icon('checkCircle', 13)} <span>Qabul Qilish</span>
                        </button>
                      ` : ''}
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

// Yangi Tadbir Yaratish Modali
async function openCreateEventModal() {
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalFooter = document.getElementById('modal-footer');

  modalTitle.innerHTML = `<span style="display: flex; align-items: center; gap: 8px;">${icon('calendar', 18)} Yangi Tadbir Yaratish</span>`;

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
        <label class="form-label">Tadbir Nomi *</label>
        <input type="text" id="ev-title" class="form-control" placeholder="Masalan: 'AKHU AI Hackathon 2026'" required style="font-size: 15px; font-weight: 600;">
      </div>

      <!-- SANA VA VAQT BOSHQARUVI (MAXSUS KALENDAR & GORIZONTAL SCROLLER) -->
      <div style="background: #F8FAFC; border: 2px solid #E2E8F0; border-radius: 14px; padding: 14px; margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <label style="font-weight: 800; font-size: 14px; color: #0F172A; display: flex; align-items: center; gap: 6px; margin: 0;">
            📅 Tadbir Sanasi va Vaqti (Sodda & Xatosiz) *
          </label>
          <span style="font-size: 11px; background: #DBEAFE; color: #1E40AF; padding: 3px 8px; border-radius: 6px; font-weight: 700;">Kamida +10 daqiqa keyin</span>
        </div>

        <!-- 1. SANA (KALENDAR KO'RINISHI - O'TGAN KUNLAR BLOKLANGAN) -->
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

        <!-- 2. BOSHLANISH VAQTI (BITTA GORIZONTAL SATRDA SCROLL) -->
        <div class="time-scroll-track-wrapper">
          <div style="font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
            <span>⏰ 2. Boshlanish vaqti</span>
            <span style="font-size: 11px; color: #64748B; font-weight: normal;">(Gorizontal suring va tanlang):</span>
          </div>
          <div class="time-scroll-track" id="start-time-track"></div>
        </div>

        <!-- 3. TUGASH VAQTI (BITTA GORIZONTAL SATRDA SCROLL) -->
        <div class="time-scroll-track-wrapper">
          <div style="font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
            <span>⌛ 3. Davomiyligi va Tugash vaqti</span>
            <span style="font-size: 11px; color: #64748B; font-weight: normal;">(Gorizontal suring va tanlang):</span>
          </div>
          <div class="time-scroll-track" id="end-time-track"></div>
        </div>

        <!-- 4. TASDIQ XULOSASI VA OK TUGMASI -->
        <div id="ev-datetime-summary"></div>
      </div>

      <div class="form-group mb-3">
        <label class="form-label">O'tkazilish joyi (Bino / Zal) *</label>
        <input type="text" id="ev-place" class="form-control" placeholder="Masalan: Bosh bino, Aktlar zali" required>
      </div>

      <div class="grid grid-2 mb-3">
        <div class="form-group">
          <label class="form-label">Soha / Kategoriya *</label>
          <select id="ev-cat-id" class="form-control" required>
            ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Miqyos / Daraja (Ball avtomatik) *</label>
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

      <!-- DAVOMAT BOSHLANISH VAQTI SOZLAMASI (DEFAULT 5 DAQIQA) -->
      <div class="form-group mb-3" style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 12px 14px;">
        <label class="form-label" style="font-weight: 700; color: #1E293B; margin-bottom: 4px;">
          ⏱️ Davomat Boshlanish Vaqti (Attendance Window) *
        </label>
        <p style="font-size: 12px; color: #64748B; margin-bottom: 8px;">
          Default holatda davomat tadbirdan 5 daqiqa oldin boshlanadi. Zarurat bo'lsa o'zgartirishingiz mumkin:
        </p>
        <div style="display: flex; gap: 10px; align-items: center;">
          <input type="number" id="ev-att-open-minutes" class="form-control" min="0" max="180" value="5" style="max-width: 130px; font-weight: 700; font-size: 14px;">
          <span style="font-size: 13px; font-weight: 600; color: #334155;">daqiqa oldin boshlanadi</span>
        </div>
        <div style="display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap;">
          <button type="button" class="btn btn-sm btn-outline" onclick="document.getElementById('ev-att-open-minutes').value=0">0 daq (Boshlanganda)</button>
          <button type="button" class="btn btn-sm btn-outline" style="background: #EFF6FF; border-color: #BFDBFE; font-weight: 700; color: #1D4ED8;" onclick="document.getElementById('ev-att-open-minutes').value=5">5 daq (Standart)</button>
          <button type="button" class="btn btn-sm btn-outline" onclick="document.getElementById('ev-att-open-minutes').value=10">10 daqiqa oldin</button>
          <button type="button" class="btn btn-sm btn-outline" onclick="document.getElementById('ev-att-open-minutes').value=15">15 daqiqa oldin</button>
          <button type="button" class="btn btn-sm btn-outline" onclick="document.getElementById('ev-att-open-minutes').value=30">30 daqiqa oldin</button>
        </div>
        <p style="font-size: 11.5px; color: #DC2626; margin-top: 8px; margin-bottom: 0;">
          ⚠️ <strong>Muhim:</strong> Tadbir tugashi bilan attendance checking avtomatik yakunlanadi!
        </p>
      </div>

      <!-- TELEGRAM BILDIRISHNOMA VA ANTI-FRAUD QR QOIDASI -->
      <div class="form-group mb-3" style="background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 10px; padding: 12px 14px;">
        <label class="form-label" style="font-weight: 700; color: #1E40AF; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
          📢 Avtomatik Telegram Bildirishnoma & 🛡️ 5s Dinamik QR
        </label>
        <p style="font-size: 12px; color: #1E3A8A; margin-bottom: 0; line-height: 1.45;">
          • Tadbir yaratilishi bilan Telegram botga ulangan <strong>barcha talabalarga avtomatik xabar</strong> boradi.<br>
          • Skrinshot tarqatishdan himoya uchun QR kod <strong>har 5 sekundda majburiy yangilanadi</strong>.
        </p>
      </div>
    </form>
  `;

  modalFooter.innerHTML = `
    <button class="btn btn-outline" onclick="closeModal()">Bekor Qilish</button>
    <button class="btn btn-primary" onclick="submitCreateEvent()" style="display: inline-flex; align-items: center; gap: 6px;">
      ${icon('check', 14)} E'lon Qilish va Talabalarga Yuborish
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

  const attOpenMinutes = Math.max(0, Number(att_open_val) || 5);

  try {
    const payload = {
      title,
      starts_at: dtResult.starts_at,
      ends_at: dtResult.ends_at,
      place,
      organizer_unit: AppState.user.id || 'dep_yb',
      category_id,
      level,
      capacity: capacity ? Number(capacity) : null,
      requires_registration: Boolean(req_reg),
      attendance_open_minutes_before: attOpenMinutes
    };

    const res = await apiFetch('/api/events', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    closeModal();
    alert(`🎉 Tadbir muvaffaqiyatli e'lon qilindi (+${res.points} ball)!\nBarcha talabalarga Telegram bot orqali bildirishnoma yuborildi.`);
    renderDeptEvents(document.getElementById('module-page-container') || document.getElementById('app-content-area'));
    showEventQrModal(res.event_id);
  } catch (err) {
    alert(err.message);
  }
}

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
    const payload = {
      title,
      starts_at: dtResult.starts_at,
      ends_at: dtResult.ends_at,
      place,
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
    alert("Tadbir muvaffaqiyatli tahrirlandi!");
    renderDeptEvents(document.getElementById('module-page-container') || document.getElementById('app-content-area'));
  } catch (err) {
    alert("Xatolik: " + err.message);
  }
}

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
    alert(res.message || "Tadbir muvaffaqiyatli o'chirildi!");
    renderDeptEvents(document.getElementById('module-page-container') || document.getElementById('app-content-area'));
  } catch (err) {
    alert(`Xatolik: ${err.message}`);
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
    alert("Profil ma'lumotlaringiz muvaffaqiyatli saqlandi!");
    renderStaffProfile(document.getElementById('module-page-container') || document.getElementById('app-content-area'));
  } catch (err) {
    alert(`Xatolik: ${err.message}`);
  }
}

window.openCreateEventModal = openCreateEventModal;
window.submitCreateEvent = submitCreateEvent;
window.showStudentCheckinModal = showStudentCheckinModal;
window.handleStudentCheckinSubmit = handleStudentCheckinSubmit;
window.loadEventRecentCheckins = loadEventRecentCheckins;
window.showEventParticipantsModal = showEventParticipantsModal;
window.deleteEvent = deleteEvent;
window.handleStaffProfilePhotoUpload = handleStaffProfilePhotoUpload;
window.updateProfilePhotoPreview = updateProfilePhotoPreview;
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
    alert(res.message || "Yangi mezon muvaffaqiyatli qo'shildi!");
    const refreshData = await apiFetch('/api/admin/catalog');
    adminCatalogState.items = refreshData.items || [];
    renderAdminCatalogRows();
  } catch (err) {
    alert('Xatolik: ' + err.message);
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
    alert('Band nomi kiritilishi shart!');
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
    alert(res.message || "Muvaffaqiyatli saqlandi!");
    const refreshData = await apiFetch('/api/admin/catalog');
    adminCatalogState.items = refreshData.items || [];
    renderAdminCatalogRows();
  } catch (e) {
    alert('Xatolik: ' + e.message);
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
    alert(res.message || "Mezon muvaffaqiyatli o'chirildi!");
    const refreshData = await apiFetch('/api/admin/catalog');
    adminCatalogState.items = refreshData.items || [];
    renderAdminCatalogRows();
  } catch (err) {
    alert('Xatolik: ' + err.message);
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
  if (typeof currentModalPasteHandler === 'function') {
    window.removeEventListener('paste', currentModalPasteHandler);
    currentModalPasteHandler = null;
  }
  const m = document.getElementById('common-modal');
  if (m) {
    m.classList.remove('active');
    m.style.display = 'none';
  }
}

window.openModal = openModal;
window.closeModal = closeModal;

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
  limit: 50,
  offset: 0,
  total: 0,
  items: []
};

async function renderStudentsManagement(container, roleTitle = 'Registrator') {
  container.innerHTML = `
    <!-- RASMIY SOHAVIY HERO BANNER -->
    <div class="admin-hero-card">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px;">
        <div>
          <div class="admin-hero-title">
            <span style="color: #60A5FA;">${icon('cap', 22)}</span>
            <span>Talabalar Reyestri & Boshqaruv Markazi</span>
            <span class="badge" style="background: rgba(59, 130, 246, 0.2); color: #93C5FD; border: 1px solid rgba(59, 130, 246, 0.4); font-size: 11px;">
              ${roleTitle}
            </span>
          </div>
          <p class="admin-hero-desc">
            Al-Xorazmiy Universiteti talabalarining yagona rasmiy bazasi. Excel/CSV orqali ommaviy yuklash, 
            yangi talabalarni ro'yxatga olish, kurs va guruh ma'lumotlarini boshqarish hamda ballar monitoringi.
          </p>
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
          ${roleTitle === 'Superadmin' ? `
            <button class="btn btn-outline" onclick="handleClearAllStudents()" style="color: #F87171; border-color: rgba(239, 68, 68, 0.5); display: inline-flex; align-items: center; gap: 6px;" title="Barcha talabalarni tozalash">
              ${icon('trash', 14)} <span>Tozalash</span>
            </button>
          ` : ''}
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

    <!-- METRIKA STATISTIKALARI -->
    <div id="students-metrics-cards" class="metrics-grid mb-4">
      <div class="stat-card">
        <div class="stat-icon" style="background:#EFF6FF; color:#2563EB;">${icon('users', 20)}</div>
        <div class="stat-data">
          <span class="stat-label">Jami Ro'yxatdagi</span>
          <h3 class="stat-val" id="stat-total-students">-</h3>
          <span class="stat-sub">Barcha talabalar</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#ECFDF5; color:#059669;">${icon('checkCircle', 20)}</div>
        <div class="stat-data">
          <span class="stat-label">Faol Talabalar</span>
          <h3 class="stat-val" id="stat-active-students">-</h3>
          <span class="stat-sub">Ta'lim jarayonida</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#FEF2F2; color:#DC2626;">${icon('xCircle', 20)}</div>
        <div class="stat-data">
          <span class="stat-label">Nofaol / Chetlashtirilgan</span>
          <h3 class="stat-val" id="stat-inactive-students">-</h3>
          <span class="stat-sub">Akademik ta'tilda</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#FEF3C7; color:#D97706;">${icon('building', 20)}</div>
        <div class="stat-data">
          <span class="stat-label">Guruhlar Soni</span>
          <h3 class="stat-val" id="stat-groups-count">-</h3>
          <span class="stat-sub">Akademik guruhlar</span>
        </div>
      </div>
    </div>

    <!-- FILTR VA QIDIRUV BOSHQARUV PANELI -->
    <div class="admin-toolbar">
      <div class="admin-search-box">
        ${icon('search', 16)}
        <input type="text" id="filter-student-search" class="admin-search-input" placeholder="ID, F.I.Sh, guruh yoki telefon bo'yicha tezkor qidiruv...">
      </div>
      <div class="admin-filters-group">
        <select id="filter-student-level" class="admin-filter-select">
          <option value="">Barcha bosqichlar</option>
          <option value="bak">Bakalavriat</option>
          <option value="mag">Magistratura</option>
        </select>
        <select id="filter-student-course" class="admin-filter-select">
          <option value="">Barcha kurslar</option>
          <option value="1">1-kurs</option>
          <option value="2">2-kurs</option>
          <option value="3">3-kurs</option>
          <option value="4">4-kurs</option>
        </select>
        <select id="filter-student-gender" class="admin-filter-select">
          <option value="">Barcha jinslar</option>
          <option value="m">Erkak (O'g'il bola)</option>
          <option value="f">Ayol (Qiz bola)</option>
        </select>
        <select id="filter-student-status" class="admin-filter-select">
          <option value="">Barcha holatlar</option>
          <option value="active">Faol (Active)</option>
          <option value="left">Nofaol (Left)</option>
        </select>
        <button class="btn btn-outline btn-sm" onclick="resetStudentFilters()" title="Filtrlarni tozalash" style="display: inline-flex; align-items: center; gap: 4px;">
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
              <th style="width: 120px;">Talaba ID</th>
              <th>F.I.Sh</th>
              <th>Yo'nalish & Guruh</th>
              <th style="width: 115px;">Bosqich</th>
              <th>Kurs</th>
              <th>Telefon Raqami</th>
              <th>Jinsi</th>
              <th>Ball</th>
              <th>Holati</th>
              <th>Tyutor</th>
              <th style="text-align: right; width: 130px;">Amallar</th>
            </tr>
          </thead>
          <tbody id="admin-students-table-body">
            <tr>
              <td colspan="11" style="text-align: center; padding: 40px; color: var(--text-muted);">
                <div class="spinner" style="margin-bottom: 10px;"></div>
                <p>Talabalar ro'yxati yuklanmoqda...</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- PAGINATION -->
      <div class="pagination-bar" id="students-pagination-bar">
        <span id="students-pagination-info">0 ta ma'lumot</span>
        <div style="display: flex; gap: 8px; align-items: center;">
          <button class="btn btn-outline btn-sm" id="btn-prev-page" onclick="prevStudentPage()" disabled>Oldingi</button>
          <span id="students-page-number" style="font-weight: 600; padding: 0 6px;">1</span>
          <button class="btn btn-outline btn-sm" id="btn-next-page" onclick="nextStudentPage()" disabled>Keyingi</button>
        </div>
      </div>
    </div>
  `;

  // Filter hodisalarini ulash
  const searchInput = document.getElementById('filter-student-search');
  let searchTimer;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      adminStudentsState.search = e.target.value.trim();
      adminStudentsState.offset = 0;
      loadAdminStudentsList();
    }, 350);
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
  adminStudentsState.gender = '';
  adminStudentsState.status = '';
  adminStudentsState.offset = 0;

  const s = document.getElementById('filter-student-search');
  if (s) s.value = '';
  const lvl = document.getElementById('filter-student-level');
  if (lvl) lvl.value = '';
  const c = document.getElementById('filter-student-course');
  if (c) c.value = '';
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
  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="10" style="text-align: center; padding: 40px; color: var(--text-muted);">
        <div class="spinner" style="margin-bottom: 8px;"></div>
        <p>Ma'lumotlar yangilanmoqda...</p>
      </td>
    </tr>
  `;

  try {
    const params = new URLSearchParams({
      limit: adminStudentsState.limit,
      offset: adminStudentsState.offset
    });
    if (adminStudentsState.search) params.append('search', adminStudentsState.search);
    if (adminStudentsState.level) params.append('level', adminStudentsState.level);
    if (adminStudentsState.course) params.append('course', adminStudentsState.course);
    if (adminStudentsState.status) params.append('status', adminStudentsState.status);

    const res = await apiFetch(`/api/admin/students?${params.toString()}`);
    let students = res.students || [];

    // Jins bo'yicha frontend filtri (agar tanlangan bo'lsa)
    if (adminStudentsState.gender) {
      students = students.filter(s => s.gender === adminStudentsState.gender);
    }

    adminStudentsState.items = students;
    adminStudentsState.total = res.total || students.length;

    // Metrikalarni yangilash
    const statTotal = document.getElementById('stat-total-students');
    const statActive = document.getElementById('stat-active-students');
    const statInactive = document.getElementById('stat-inactive-students');
    const statGroups = document.getElementById('stat-groups-count');

    if (res.metrics) {
      if (statTotal) statTotal.textContent = res.metrics.total || 0;
      if (statActive) statActive.textContent = res.metrics.active || 0;
      if (statInactive) statInactive.textContent = res.metrics.inactive || 0;
      if (statGroups) statGroups.textContent = res.metrics.groups || 0;
    } else {
      if (statTotal) statTotal.textContent = res.total || 0;
      if (statActive) statActive.textContent = res.total || 0;
      if (statInactive) statInactive.textContent = 0;
      if (statGroups) statGroups.textContent = 5;
    }

    // Pagination update
    const pageInfo = document.getElementById('students-pagination-info');
    const pageNum = document.getElementById('students-page-number');
    const btnPrev = document.getElementById('btn-prev-page');
    const btnNext = document.getElementById('btn-next-page');

    const startIdx = adminStudentsState.total === 0 ? 0 : adminStudentsState.offset + 1;
    const endIdx = Math.min(adminStudentsState.offset + students.length, adminStudentsState.total);
    if (pageInfo) pageInfo.textContent = `${startIdx}-${endIdx} dan ${adminStudentsState.total} ta`;
    if (pageNum) pageNum.textContent = Math.floor(adminStudentsState.offset / adminStudentsState.limit) + 1;
    if (btnPrev) btnPrev.disabled = adminStudentsState.offset <= 0;
    if (btnNext) btnNext.disabled = endIdx >= adminStudentsState.total;

    if (students.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="11" style="text-align: center; padding: 48px; color: var(--text-muted);">
            <div style="font-size: 32px; color: #94A3B8; margin-bottom: 8px;">${icon('users', 32)}</div>
            <p style="font-size: 14px; font-weight: 600; color: var(--text-main);">Talabalar topilmadi</p>
            <p style="font-size: 12px; margin-top: 4px;">Qidiruv yoki filtr mezonlarini o'zgartiring, yoki Excel orqali yangi talabalarni yuklang.</p>
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
        ? `<span class="badge" style="background:#F5F3FF; color:#7C3AED; border:1px solid #DDD6FE; font-weight:700; font-size:11.5px; padding:3px 8px; border-radius:6px; letter-spacing:0.3px;">Magistratura</span>`
        : `<span class="badge" style="background:#EFF6FF; color:#2563EB; border:1px solid #BFDBFE; font-weight:700; font-size:11.5px; padding:3px 8px; border-radius:6px; letter-spacing:0.3px;">Bakalavr</span>`;
      const photoHtml = st.photo_url
        ? `<img src="${st.photo_url}" class="avatar-badge" style="object-fit: cover; border: 1px solid #CBD5E1; width: 34px; height: 34px; border-radius: 50%;" alt="${st.first_name}">`
        : `<span class="avatar-badge ${isFemale ? 'female' : ''}">${initials || 'ST'}</span>`;

      return `
        <tr class="student-table-row" onclick="showStudentDetailsModal('${st.id}')" style="cursor: pointer;" title="Profilni ko'rish uchun bosing">
          <td>
            <span class="badge badge-group" style="letter-spacing: 0.5px;">${st.external_id || '-'}</span>
          </td>
          <td>
            <div class="table-student-name">
              ${photoHtml}
              <div>
                <div style="font-weight: 600; color: var(--text-main); font-size: 13px;">${st.first_name} ${st.last_name}</div>
                <div class="table-sub-text">${st.email || 'Email biriktirilmagan'}</div>
              </div>
            </div>
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
            <span style="font-size: 12px; color: ${isFemale ? '#DB2777' : '#2563EB'}; font-weight: 600;">
              ${isFemale ? 'Ayol' : 'Erkak'}
            </span>
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
          <td>
            <span style="font-size: 12px; color: var(--text-secondary);">${st.tutor_name || '<em style="color:#94A3B8;">Biriktirilmagan</em>'}</span>
          </td>
          <td style="text-align: right;" onclick="event.stopPropagation()">
            <div style="display: inline-flex; gap: 4px; justify-content: flex-end;">
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

  } catch (err) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align: center; padding: 24px; color: var(--danger);">
          Xatolik yuz berdi: ${err.message}
        </td>
      </tr>
    `;
  }
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
    alert("Talaba ID, Guruh, Ism va Familiya to'ldirilishi shart!");
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
    alert('Talaba muvaffaqiyatli saqlandi!');
    await loadAdminStudentsList();
  } catch (err) {
    alert(err.message);
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
    let tutors = [];
    try {
      const tutRes = await apiFetch('/api/admin/tutors');
      tutors = tutRes.tutors || [];
    } catch(e) {}

    const data = await apiFetch(`/api/admin/students/${studentId}`);
    const st = data.student;

    const isFemale = st.gender === 'female' || st.gender === 'f';
    const initials = `${(st.first_name || '').charAt(0)}${(st.last_name || '').charAt(0)}`.toUpperCase();
    const avatarHtml = st.photo_url
      ? `<img src="${st.photo_url}" style="width: 56px; height: 56px; border-radius: 50%; object-fit: cover; border: 2px solid #2563EB;" alt="${st.first_name}">`
      : `<span class="avatar-badge ${isFemale ? 'female' : ''}" style="width: 56px; height: 56px; font-size: 20px;">${initials}</span>`;

    modalBody.innerHTML = `
      <form id="edit-student-form">
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

        <div class="form-group mb-3">
          <label class="form-label" style="font-weight: 600;">Biriktirilgan Tyutor (Mas'ul)</label>
          <select id="edit-std-tutor" class="form-select">
            <option value="">-- Tyutor biriktirilmagan --</option>
            ${tutors.map(t => `<option value="${t.id}" ${String(st.tutor_id) === String(t.id) ? 'selected' : ''}>${t.full_name} (${(t.groups || []).join(', ') || t.id})</option>`).join('')}
          </select>
        </div>
      </form>
    `;

    modalFooter.innerHTML = `
      <button class="btn btn-outline" onclick="closeModal()">Bekor Qilish</button>
      <button class="btn btn-primary" onclick="handleEditStudentSubmit('${st.id}')" style="display:inline-flex; align-items:center; gap:6px;">
        ${icon('check', 14)} Saqlash
      </button>
    `;

  } catch (err) {
    modalBody.innerHTML = `<p class="text-danger">${err.message}</p>`;
  }
}

async function handleStudentEditPhotoSelect(studentId, input) {
  const file = input.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('photo', file);

  try {
    const res = await fetch(`/api/admin/students/${studentId}/photo`, {
      method: 'POST',
      headers: { 'x-user-id': AppState.user.id },
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Rasm yuklashda xatolik yuz berdi');

    const previewWrap = document.getElementById('edit-std-photo-preview-wrap');
    if (previewWrap && data.photo_url) {
      previewWrap.innerHTML = `<img src="${data.photo_url}" style="width: 56px; height: 56px; border-radius: 50%; object-fit: cover; border: 2px solid #2563EB;" alt="Foto">`;
    }
    const urlInp = document.getElementById('edit-std-photourl');
    if (urlInp) urlInp.value = data.photo_url;

    alert("Talaba fotosurati muvaffaqiyatli saqlandi!");
  } catch (err) {
    alert("Xatolik: " + err.message);
  }
}

async function removeStudentPhotoInEdit(studentId) {
  if (!confirm("Talaba fotosuratini o'chirmoqchimisiz?")) return;
  try {
    const res = await fetch(`/api/admin/students/${studentId}/photo`, {
      method: 'DELETE',
      headers: { 'x-user-id': AppState.user.id }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Rasmni o'chirishda xatolik");

    const previewWrap = document.getElementById('edit-std-photo-preview-wrap');
    if (previewWrap) {
      previewWrap.innerHTML = `<span class="avatar-badge" style="width: 56px; height: 56px; font-size: 20px;">👤</span>`;
    }
    const urlInp = document.getElementById('edit-std-photourl');
    if (urlInp) urlInp.value = '';

    alert("Fotosurat o'chirildi!");
  } catch (err) {
    alert("Xatolik: " + err.message);
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
  const tutor_id = document.getElementById('edit-std-tutor')?.value || null;
  const photo_url = document.getElementById('edit-std-photourl')?.value || undefined;

  try {
    await apiFetch(`/api/admin/students/${studentId}`, {
      method: 'PUT',
      body: JSON.stringify({
        external_id, group_code, first_name, last_name,
        program_code, level, course, gender, phone, email, tutor_id, status, photo_url
      })
    });

    closeModal();
    alert("Talaba ma'lumotlari muvaffaqiyatli yangilandi!");
    if (typeof loadAdminStudentsList === 'function') {
      try { await loadAdminStudentsList(); } catch (e) {}
    }
    const mainContent = document.getElementById('main-content');
    if (mainContent && (AppState.currentSection === 'tutor-my-students' || AppState.user?.roles?.includes('tutor'))) {
      try { await renderTutorStudents(mainContent); } catch (e) {}
    }
  } catch (err) {
    alert(err.message);
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
let currentModalPasteHandler = null;

async function showStudentDetailsModal(studentId) {
  currentActiveStudentModalId = studentId;
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalFooter = document.getElementById('modal-footer');

  // Avvalgi paste hodisasini tozalash
  if (currentModalPasteHandler) {
    window.removeEventListener('paste', currentModalPasteHandler);
    currentModalPasteHandler = null;
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
    currentModalPasteHandler = (e) => {
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
    window.addEventListener('paste', currentModalPasteHandler);

  } catch (err) {
    modalBody.innerHTML = `<p class="text-danger">${err.message}</p>`;
  }
}

function closeStudentModalCleanly() {
  if (currentModalPasteHandler) {
    window.removeEventListener('paste', currentModalPasteHandler);
    currentModalPasteHandler = null;
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
              <div class="table-sub-text">@${u.username || u.id}</div>
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
            <button class="btn-action btn-action-primary" onclick="showEditStaffModal('${u.id}')" title="Tahrirlash / Rollar / Login / Parol">
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

      <div class="grid grid-2 mb-3">
        <div class="form-group">
          <label class="form-label">Email *</label>
          <input type="email" id="new-staff-email" class="form-control" placeholder="staff@akhu.uz">
        </div>
        <div class="form-group">
          <label class="form-label">Asosiy Telefon</label>
          <input type="text" id="new-staff-phone" class="form-control" placeholder="+998901234567">
        </div>
      </div>

      <!-- Telegram ma'lumotlari -->
      <div class="grid grid-3 mb-3" style="display:grid; grid-template-columns: 1.1fr 1fr 1fr; gap:10px;">
        <div class="form-group">
          <label class="form-label" style="font-weight:600;">Telegram User ID</label>
          <input type="text" id="new-staff-tgid" class="form-control" placeholder="1202082857" onblur="autoFetchTgUsername('new-staff-tgid', 'new-staff-tgusername', 'new-staff-tgid-status')">
          <div id="new-staff-tgid-status" style="font-size:11px; margin-top:3px; color:var(--text-muted);">ID kiritilganda username botdan avtomatik olinadi</div>
        </div>
        <div class="form-group">
          <label class="form-label">Telegram Username (@)</label>
          <div style="position:relative;">
            <span style="position:absolute; left:10px; top:8px; color:#94A3B8; font-weight:600;">@</span>
            <input type="text" id="new-staff-tgusername" class="form-control" style="padding-left:26px;" placeholder="avtomatik aniqlanadi">
          </div>
          <small class="text-muted" style="font-size:11px;">Avtomatik olinadi</small>
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
    alert("Login, Parol va F.I.Sh kiritilishi shart!");
    return;
  }

  if (roles.length === 0) {
    alert("Kamida bitta rol tanlanishi shart!");
    return;
  }

  try {
    await apiFetch('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        username,
        password,
        full_name,
        email,
        phone,
        telegram_user_id: telegram_user_id || null,
        telegram_username: telegram_username || null,
        telegram_phone: telegram_phone || phone || null,
        photo_url: photo_url || null,
        roles,
        tutor_groups,
        groups: tutor_groups
      })
    });

    closeModal();
    alert('Xodim muvaffaqiyatli yaratildi!');
    await loadStaffUsersList();
  } catch (err) {
    alert(err.message);
  }
}

// XODIMNI TAHRIRLASH (SUPERADMIN HAMMA MA'LUMOTLARNI VA RASMNI TAHRIRLAY OLADI)
async function showEditStaffModal(userId) {
  const user = adminStaffState.users.find(u => String(u.id) === String(userId));
  if (!user) return;

  const isActive = (user.is_active !== undefined) ? Boolean(user.is_active) : (user.active === 1);
  const userGroups = user.tutor_groups || user.groups || [];
  const currentRoles = (user.roles || []).filter(r => r && r !== 'undefined');

  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalFooter = document.getElementById('modal-footer');
  const modalContent = document.querySelector('#common-modal .modal-content');
  if (modalContent) modalContent.style.maxWidth = '680px';

  modalTitle.innerHTML = `<span style="display:flex; align-items:center; gap:8px;">${icon('edit', 18)} Xodimni Tahrirlash: ${user.full_name}</span>`;

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
    <form id="edit-staff-form">
      <!-- Fotosurat yuklash / tahrirlash -->
      <div class="form-group mb-3">
        <label class="form-label" style="font-weight: 600;">Xodim Fotosurati (Profil Rasmi)</label>
        <div class="photo-uploader-box">
          <img id="edit-staff-photo-preview" src="${user.photo_url || ''}" class="photo-preview-thumb" style="${user.photo_url ? '' : 'display:none;'}" alt="Foto">
          <div style="flex: 1;">
            <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 6px;">
              <input type="file" id="edit-staff-file-input" accept="image/*" style="display:none;" onchange="handleAdminStaffPhotoUpload(this, 'edit-staff-photourl', 'edit-staff-photo-preview')">
              <button type="button" class="btn btn-outline btn-sm" onclick="document.getElementById('edit-staff-file-input').click()" style="display: inline-flex; align-items: center; gap: 5px; background: white;">
                ${icon('upload', 13)} <span>Kompyuterdan Rasm Yuklash</span>
              </button>
            </div>
            <input type="text" id="edit-staff-photourl" class="form-control" value="${user.photo_url || ''}" placeholder="Yoki rasm havolasini kiriting (https://... yoki /api/files/...)" oninput="updateAdminStaffPhotoPreview(this.value, 'edit-staff-photo-preview')">
          </div>
        </div>
      </div>

      <div class="grid grid-2 mb-3">
        <div class="form-group">
          <label class="form-label" style="font-weight: 600;">Foydalanuvchi Nomi (Login) *</label>
          <input type="text" id="edit-staff-username" class="form-control" value="${user.username || user.id}" required placeholder="masalan: jasur_m">
          <small class="text-muted" style="font-size: 11px;">Tizimga kirish uchun xodim logini</small>
        </div>
        <div class="form-group">
          <label class="form-label" style="font-weight: 600;">Yangi Parol</label>
          <div style="display: flex; gap: 6px;">
            <input type="text" id="edit-staff-password" class="form-control" placeholder="Yangi parol (o'zgartirish uchun)">
            <button type="button" class="btn btn-outline btn-sm" onclick="generateStaffPassword('edit-staff-password')" title="Yangi parol generatsiya qilish" style="padding: 4px 8px; font-size: 11px; white-space: nowrap;">
              Tasodifiy
            </button>
          </div>
          <small class="text-muted" style="font-size: 11px;">Eski parolni saqlab qolish uchun bo'sh qoldiring</small>
        </div>
      </div>

      <div class="grid grid-2 mb-3">
        <div class="form-group">
          <label class="form-label">F.I.Sh (To'liq ismi) *</label>
          <input type="text" id="edit-staff-fullname" class="form-control" value="${user.full_name || ''}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Email *</label>
          <input type="email" id="edit-staff-email" class="form-control" value="${user.email || ''}">
        </div>
      </div>

      <!-- Telegram va Aloqa Parametrlari -->
      <div class="grid grid-3 mb-3" style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:10px;">
        <div class="form-group">
          <label class="form-label">Asosiy Telefon</label>
          <input type="text" id="edit-staff-phone" class="form-control" value="${user.phone || ''}" placeholder="+998901234567">
        </div>
        <div class="form-group">
          <label class="form-label">Telegram Username (@)</label>
          <div style="position:relative;">
            <span style="position:absolute; left:10px; top:8px; color:#94A3B8; font-weight:600;">@</span>
            <input type="text" id="edit-staff-tgusername" class="form-control" style="padding-left:26px;" value="${user.telegram_username ? user.telegram_username.replace(/^@/, '') : ''}" placeholder="username">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label" style="font-weight:600;">Telegram User ID</label>
          <input type="text" id="edit-staff-tgid" class="form-control" value="${user.telegram_user_id || ''}" placeholder="1202082857" onblur="autoFetchTgUsername('edit-staff-tgid', 'edit-staff-tgusername', 'edit-staff-tgid-status')">
          <div id="edit-staff-tgid-status" style="font-size:11px; margin-top:3px; color:var(--text-muted);">ID kiritilganda username botdan avtomatik olinadi</div>
        </div>
      </div>

      <div class="grid grid-2 mb-3">
        <div class="form-group">
          <label class="form-label">Telegram Telefon Raqami (Bot bilan bog'langan)</label>
          <input type="text" id="edit-staff-tgphone" class="form-control" value="${user.telegram_phone || user.phone || ''}" placeholder="+998901234567">
        </div>
        <div class="form-group">
          <label class="form-label">Telegram Bot Holati</label>
          <select id="edit-staff-botstatus" class="form-control">
            <option value="active" ${user.bot_status === 'active' ? 'selected' : ''}>🟢 Faol (Xabarlar yetib bormoqda)</option>
            <option value="not_started" ${(!user.bot_status || user.bot_status === 'not_started') ? 'selected' : ''}>⚪ Botga kirmagan / Start bosmagan</option>
            <option value="blocked" ${user.bot_status === 'blocked' ? 'selected' : ''}>🔴 Mute / Bot bloklangan</option>
          </select>
        </div>
      </div>

      <div class="form-group mb-3">
        <label class="form-label" style="font-weight: 700; color: var(--text-main);">Biriktirilgan Rollar & Funksional Ruxsatlar:</label>
        <p style="font-size: 11.5px; color: var(--text-muted); margin-bottom: 8px;">Ushbu xodimga tegishli rollar va bo'lim ruxsatlarini yoqing yoki o'chiring:</p>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; max-height: 240px; overflow-y: auto; background: #F8FAFC; padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--border-light);">
          ${rolesList.map(r => {
            const rKey = r.key || r.id;
            const isChecked = currentRoles.includes(rKey);
            return `
              <div style="border: 1px solid ${isChecked ? '#BFDBFE' : '#E2E8F0'}; border-radius: 8px; padding: 10px; background: ${isChecked ? '#F0F9FF' : 'white'}; display: flex; align-items: flex-start; gap: 10px; cursor: pointer;">
                <input type="checkbox" name="edit-staff-roles-checkbox" value="${rKey}" id="edit-role-${rKey}" ${isChecked ? 'checked' : ''} style="margin-top: 3px; cursor: pointer;">
                <label for="edit-role-${rKey}" style="cursor: pointer; margin: 0; width: 100%;">
                  <div style="font-weight: 600; font-size: 12.5px; color: var(--text-main);">${r.name}</div>
                  <div style="font-size: 11px; color: #64748B; line-height: 1.35; margin-top: 2px;">${r.desc || ''}</div>
                </label>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <div class="form-group mb-3">
        <label class="form-label" style="font-weight: 700; color: var(--text-main);">Tyutor Biriktirilgan Guruhlari (Select / Tanlang):</label>
        <p style="font-size: 11.5px; color: var(--text-muted); margin-bottom: 6px;">Ushbu xodim qaysi guruhlarga tyutorlik qilishini belgilang:</p>
        <div style="display: flex; flex-wrap: wrap; gap: 8px; max-height: 120px; overflow-y: auto; background: #F8FAFC; padding: 10px; border-radius: 8px; border: 1px solid #E2E8F0;">
          ${allGroups.map(g => {
            const isSel = (userGroups || []).includes(g);
            return `
              <label style="cursor: pointer; display: inline-flex; align-items: center; gap: 6px; background: ${isSel ? '#EFF6FF' : 'white'}; border: 1px solid ${isSel ? '#3B82F6' : '#CBD5E1'}; padding: 5px 10px; border-radius: 6px; font-size: 12.5px; font-weight: 600; user-select: none;">
                <input type="checkbox" name="edit-staff-groups-checkbox" value="${g}" ${isSel ? 'checked' : ''} onchange="this.parentElement.style.background = this.checked ? '#EFF6FF' : 'white'; this.parentElement.style.borderColor = this.checked ? '#3B82F6' : '#CBD5E1';">
                <span>${g}</span>
              </label>
            `;
          }).join('')}
        </div>
      </div>

      <div class="form-group mb-2">
        <label class="form-label" style="font-weight: 600;">Xodimning Tizimdagi Holati</label>
        <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; margin-top: 4px; cursor: pointer; font-weight: 600;">
          <input type="checkbox" id="edit-staff-active" ${isActive ? 'checked' : ''}>
          <span>Faol (Tizimga kirishga to'liq ruxsat)</span>
        </label>
      </div>
    </form>
  `;

  modalFooter.innerHTML = `
    <button class="btn btn-outline" onclick="closeModal()">Bekor Qilish</button>
    <button class="btn btn-primary" onclick="handleEditStaffSubmit('${user.id}')" style="display:inline-flex; align-items:center; gap:6px;">
      ${icon('check', 14)} Saqlash
    </button>
  `;

  openModal();
}

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
    alert('Rasm muvaffaqiyatli yuklandi!');
  } catch (err) {
    alert(`Xatolik: ${err.message}`);
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

async function handleEditStaffSubmit(userId) {
  const username = document.getElementById('edit-staff-username')?.value.trim();
  const full_name = document.getElementById('edit-staff-fullname')?.value.trim();
  const password = document.getElementById('edit-staff-password')?.value?.trim();
  const email = document.getElementById('edit-staff-email')?.value.trim();
  const phone = document.getElementById('edit-staff-phone')?.value.trim();
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

  if (!username) {
    alert("Foydalanuvchi nomi (login) kiritilishi shart!");
    return;
  }

  if (!full_name) {
    alert("F.I.Sh kiritilishi shart!");
    return;
  }

  if (roles.length === 0) {
    alert("Kamida bitta rol tanlanishi shart!");
    return;
  }

  try {
    const payload = {
      username,
      full_name,
      email,
      phone,
      photo_url: photo_url || null,
      telegram_user_id: telegram_user_id || null,
      telegram_username: telegram_username || null,
      telegram_phone: telegram_phone || phone || null,
      bot_status: bot_status || undefined,
      active: is_active,
      is_active: is_active === 1,
      roles,
      tutor_groups,
      groups: tutor_groups
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
      localStorage.setItem('akhu_auth_user', JSON.stringify(AppState.user));
    }

    closeModal();
    alert(res?.message || "Xodim ma'lumotlari muvaffaqiyatli saqlandi!");
    await loadStaffUsersList();
  } catch (err) {
    alert(err.message);
  }
}

async function toggleStaffStatus(userId, currentActive) {
  const newActive = currentActive ? 0 : 1;
  const actionText = newActive ? 'faollashtirilsinmi' : 'bloklansinmi';

  if (!confirm(`Xodim ${actionText}?`)) return;

  try {
    await apiFetch(`/api/admin/users/${userId}/status`, {
      method: 'POST',
      body: JSON.stringify({ active: newActive })
    });
    alert(`Xodim holati ${newActive ? 'faollashtirildi' : 'bloklandi'}!`);
    await loadStaffUsersList();
  } catch (err) {
    alert(err.message);
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
    alert("Xodim muvaffaqiyatli o'chirildi!");
    await loadStaffUsersList();
  } catch (err) {
    alert(err.message);
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
        <button class="btn btn-primary btn-sm" onclick="showEditStaffModal('${user.id}')" style="display:inline-flex; align-items:center; gap:6px;">
          ${icon('edit', 14)} <span>Tahrirlash / Rollar</span>
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

window.impersonateStaffUser = impersonateStaffUser;
window.exitImpersonation = exitImpersonation;
