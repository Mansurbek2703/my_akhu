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

// ====================================================================
// RASMIY UNIVERSITET VEKTOR SVG BELGILARI (ICONS SYSTEM)
// ====================================================================
const ICONS = {
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

  'staff-my-profile': 'staff-my-profile'
};

function renderModuleSubNav(pageName) {
  const sectionKey = PAGE_SECTION_MAP[pageName] || pageName;
  let tabs = [];
  let extraActions = '';

  if (sectionKey === 'observe-dashboard') {
    tabs = [
      { id: 'observe-dashboard', label: '📊 Asosiy Ko\'rsatkichlar' },
      { id: 'observe-rating', label: '🏆 Talabalar Reytingi' },
      { id: 'observe-catalog', label: '📖 Ball Katalogi v1.0' }
    ];
  } else if (sectionKey === 'admin-students-manage') {
    tabs = [
      { id: 'admin-students-manage', label: '📋 Talabalar Ro\'yxati & Profil' },
      { id: 'dept-gpa-import', label: '📈 GPA & Davomat Import' }
    ];
  } else if (sectionKey === 'dept-events') {
    tabs = [
      { id: 'dept-events', label: '📅 Barcha Tadbirlar' }
    ];
    if (AppState.isLoggedIn) {
      extraActions = `
        <div class="module-nav-actions">
          <button class="btn btn-primary btn-sm" onclick="openCreateEventModal()" style="display:inline-flex; align-items:center; gap:6px;">
            ${icon('calendar', 14)} <span>+ Yangi Tadbir Qo'shish</span>
          </button>
          <button class="btn btn-outline btn-sm" onclick="showStudentCheckinModal()" style="display:inline-flex; align-items:center; gap:6px; border-color:#3B82F6; color:#2563EB; background:#EFF6FF;">
            ${icon('qrCode', 14)} <span>📷 Talaba QR Skanerlash & Check-in</span>
          </button>
        </div>
      `;
    }
  } else if (sectionKey === 'dept-approvals') {
    tabs = [
      { id: 'dept-approvals', label: '⏳ Tasdiq Navbati' },
      { id: 'prorektor-queue', label: '🛡️ Prorektor 25+ / -30' },
      { id: 'prorektor-risks', label: '⚠️ Xavf & Konsentratsiya' },
      { id: 'prorektor-appeals', label: '📑 E\'tirozlar (Apellyatsiya)' }
    ];
  } else if (sectionKey === 'tutor-my-students') {
    tabs = [
      { id: 'tutor-my-students', label: '👥 Mening Talabalarim' },
      { id: 'tutor-add-points', label: '➕ Ball Kiritish' },
      { id: 'tutor-history', label: '📜 Kiritgan Yozuvlarim' }
    ];
  } else if (sectionKey === 'admin-users-manage') {
    tabs = [
      { id: 'admin-users-manage', label: '👥 Xodimlar & Rollar' },
      { id: 'admin-catalog', label: '⚙️ Katalog Sozlamalari' },
      { id: 'admin-audit', label: '📝 To\'liq Audit Jurnali' }
    ];
  } else if (sectionKey === 'staff-my-profile') {
    tabs = [
      { id: 'staff-my-profile', label: '👤 Shaxsiy Profil & Rasm' }
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
      pageTitle.textContent = 'Talabalar Reytingi';
      pageDesc.textContent = 'Mavsumiy va umumiy o\'rinlar jadvali, filtrlar';
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
async function renderObserveDashboard(container) {
  try {
    const data = await apiFetch('/api/observe/dashboard');
    const m = data.metrics;
    const ws = data.weekly_stars || {};

    let html = `
      <!-- METRIKALAR -->
      <div class="metrics-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background:#EFF6FF; color:#2563EB;">${icon('users', 20)}</div>
          <div class="stat-data">
            <span class="stat-label">Jami Talabalar</span>
            <h3 class="stat-val">${m.total_students} nafar</h3>
            <span class="stat-sub">Faollik: <strong>${m.active_ratio}%</strong> (30+ ball)</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background:#FEF3C7; color:#D97706;">${icon('zap', 20)}</div>
          <div class="stat-data">
            <span class="stat-label">Mavsum Ballari</span>
            <h3 class="stat-val">${m.total_season_points.toLocaleString()}</h3>
            <span class="stat-sub">Tasdiqlanish: <strong>${m.approved_ratio}%</strong></span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background:#FEE2E2; color:#DC2626;">${icon('clock', 20)}</div>
          <div class="stat-data">
            <span class="stat-label">Kutilayotgan Tasdiq</span>
            <h3 class="stat-val">${m.pending_approvals} ta</h3>
            <span class="stat-sub text-danger">Kechikkan: <strong>${data.attention_required.late_approvals_count} ta</strong></span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background:#ECFDF5; color:#059669;">${icon('target', 20)}</div>
          <div class="stat-data">
            <span class="stat-label">Bugungi Tadbirlar</span>
            <h3 class="stat-val">${m.today_events} ta</h3>
            <span class="stat-sub">QR check-in faol</span>
          </div>
        </div>
      </div>

      <!-- HAFTANING YULDUZLARI -->
      <div class="card mb-4" style="background: linear-gradient(135deg, #1E293B, #0F172A); color: white; border: none;">
        <div class="card-header" style="border-bottom: 1px solid rgba(255,255,255,0.1);">
          <div>
            <h3 style="color: #FBBF24; display: flex; align-items: center; gap: 8px;">
              <span style="color:#D97706;">${icon('star', 16)}</span> HAFTANING YULDUZLARI
            </h3>
            <span style="font-size: 12px; color: #94A3B8;">Avtomatlashgan haftalik reyting g'oliblari</span>
          </div>
          <span class="badge" style="background: rgba(245, 158, 11, 0.2); color: #FBBF24; border: 1px solid #F59E0B;">Joriy Hafta</span>
        </div>
        <div class="card-body">
          <div class="grid grid-3">
            <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 12px; border-left: 4px solid #F59E0B;">
              <span style="font-size: 11px; text-transform: uppercase; color: #F59E0B; font-weight: 700;">Hafta Qahramoni</span>
              <h4 style="font-size: 16px; margin: 6px 0 2px;">${ws.hero ? ws.hero.student_name : 'Aniqlanmoqda'}</h4>
              <p style="font-size: 12px; color: #94A3B8;">${ws.hero ? ws.hero.group_code + ' • +' + ws.hero.week_points + ' ball' : ''}</p>
            </div>

            <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 12px; border-left: 4px solid #EC4899;">
              <span style="font-size: 11px; text-transform: uppercase; color: #EC4899; font-weight: 700;">Eng Faol Qiz</span>
              <h4 style="font-size: 16px; margin: 6px 0 2px;">${ws.girl ? ws.girl.student_name : 'Aniqlanmoqda'}</h4>
              <p style="font-size: 12px; color: #94A3B8;">${ws.girl ? ws.girl.group_code + ' • +' + ws.girl.week_points + ' ball' : ''}</p>
            </div>

            <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 12px; border-left: 4px solid #3B82F6;">
              <span style="font-size: 11px; text-transform: uppercase; color: #3B82F6; font-weight: 700;">Eng Faol Yigit</span>
              <h4 style="font-size: 16px; margin: 6px 0 2px;">${ws.boy ? ws.boy.student_name : 'Aniqlanmoqda'}</h4>
              <p style="font-size: 12px; color: #94A3B8;">${ws.boy ? ws.boy.group_code + ' • +' + ws.boy.week_points + ' ball' : ''}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- IKKITA USTUN: TOP TALABALAR VA SOHALAR -->
      <div class="grid grid-2 mb-4">
        <!-- TOP BAKALAVRIAT -->
        <div class="card">
          <div class="card-header">
            <h3><span style="color:#D97706;">${icon('trophy', 16)}</span> Top 10 — Bakalavriat</h3>
            <button class="btn btn-outline btn-sm" onclick="navigateTo('observe-rating')">Barchasi →</button>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>O'rin</th>
                    <th>Talaba</th>
                    <th>Guruh</th>
                    <th>Mavsumiy</th>
                  </tr>
                </thead>
                <tbody>
                  ${(data.top_bak || []).map((s, idx) => `
                    <tr>
                      <td><span class="rank-badge rank-${idx + 1}">${idx + 1}</span></td>
                      <td>
                        <strong>${s.first_name} ${s.last_name}</strong>
                      </td>
                      <td><span class="badge badge-light">${s.group_code}</span></td>
                      <td><strong style="color: #2563EB;">${s.season} ball</strong></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- SOHALAR BO'YICHA TAQSIMOT -->
        <div class="card">
          <div class="card-header">
            <h3><span style="color:#2563EB;">${icon('activity', 16)}</span> Sohalar Bo'yicha Taqsimot</h3>
            <span style="font-size: 12px; color: var(--text-muted);">Tasdiqlangan ballar</span>
          </div>
          <div class="card-body">
            <div class="categories-list">
              ${(data.categories || []).map(c => `
                <div class="cat-progress-item mb-3">
                  <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; margin-bottom: 6px;">
                    <span style="color: ${c.color || '#3B82F6'};">● ${c.name}</span>
                    <span>${c.total_points} ball</span>
                  </div>
                  <div class="progress-bar-bg" style="height: 8px; background: #E2E8F0; border-radius: 4px; overflow: hidden;">
                    <div style="height: 100%; width: ${Math.min(100, Math.round((c.total_points / (m.total_season_points || 1)) * 100))}%; background: ${c.color || '#3B82F6'}; border-radius: 4px;"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- XAVFLAR VA E'TIBOR TALAB QILADIGAN HOLATLAR -->
      ${data.attention_required.late_approvals_count > 0 ? `
        <div class="alert-box alert-warning mb-4" style="background:#FFFBEB; border: 1px solid #FDE68A; padding: 16px; border-radius: 10px;">
          <h4 style="color:#B45309; font-size: 15px; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
            ${icon('alertTriangle', 14)} 3 ish kunidan oshib ketgan tasdiqlar: ${data.attention_required.late_approvals_count} ta
          </h4>
          <p style="font-size: 13px; color: #78350F; margin-bottom: 12px;">R-07 qoidasi bo'yicha sohaviy bo'limlar ushbu arizalarni zudlik bilan ko'rib chiqishi shart.</p>
          <button class="btn btn-warning btn-sm" onclick="navigateTo('dept-approvals')">Tasdiq Navbatiga O'tish →</button>
        </div>
      ` : ''}
    `;

    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<div class="card"><p class="text-danger">Dashboard ma'lumotlarini yuklashda xatolik: ${err.message}</p></div>`;
  }
}

// -------------------------------------------------------------
// SAHIFA: TALABALAR REYTINGI
// -------------------------------------------------------------
async function renderObserveRating(container) {
  let html = `
    <div class="card mb-3">
      <div class="card-body">
        <div class="filter-bar" style="display: flex; gap: 12px; flex-wrap: wrap;">
          <select id="rating-filter-level" class="form-control" style="width: auto;">
            <option value="">Barcha bosqichlar</option>
            <option value="bak">Bakalavriat</option>
            <option value="mag">Magistratura</option>
          </select>
          <select id="rating-filter-course" class="form-control" style="width: auto;">
            <option value="">Barcha kurslar</option>
            <option value="1">1-kurs</option>
            <option value="2">2-kurs</option>
            <option value="3">3-kurs</option>
            <option value="4">4-kurs</option>
          </select>
          <input type="text" id="rating-filter-group" class="form-control" placeholder="Guruh (masalan, 210-22)" style="width: 180px;">
          <input type="text" id="rating-filter-search" class="form-control" placeholder="Ism yoki familiya..." style="flex: 1; min-width: 200px;">
          <button id="btn-rating-filter" class="btn btn-primary">Qidirish</button>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table" id="rating-table">
            <thead>
              <tr>
                <th style="width: 60px;">O'rin</th>
                <th>Talaba</th>
                <th>Guruh</th>
                <th>Bosqich</th>
                <th>Mavsum Balli</th>
                <th>Jami Ball</th>
                <th>Haftalik</th>
                <th style="text-align: right;">Amal</th>
              </tr>
            </thead>
            <tbody id="rating-table-body">
              <tr><td colspan="8" class="text-center p-4">Yuklanmoqda...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
  container.innerHTML = html;

  async function loadRating() {
    const level = document.getElementById('rating-filter-level').value;
    const course = document.getElementById('rating-filter-course').value;
    const group = document.getElementById('rating-filter-group').value;
    const search = document.getElementById('rating-filter-search').value;

    const params = new URLSearchParams();
    if (level) params.append('level', level);
    if (course) params.append('course', course);
    if (group) params.append('group', group);
    if (search) params.append('search', search);

    const tbody = document.getElementById('rating-table-body');
    tbody.innerHTML = '<tr><td colspan="8" class="text-center p-4"><div class="spinner"></div></td></tr>';

    try {
      const data = await apiFetch(`/api/observe/rating?${params.toString()}`);
      if (!data.list || data.list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center p-4">Talabalar topilmadi</td></tr>';
        return;
      }

      tbody.innerHTML = data.list.map(s => `
        <tr>
          <td><span class="rank-badge rank-${s.rank_cohort}">${s.rank_cohort}</span></td>
          <td>
            <strong>${s.first_name} ${s.last_name}</strong>
            ${s.is_passive ? '<span class="badge badge-warning" style="margin-left: 6px;">Passiv</span>' : ''}
          </td>
          <td><span class="badge badge-light">${s.group_code}</span></td>
          <td>${s.level === 'bak' ? 'Bakalavr' : 'Magistr'} (${s.course}-kurs)</td>
          <td><strong style="color: #2563EB;">${s.season} ball</strong></td>
          <td><strong>${s.total} ball</strong></td>
          <td><span style="color: #059669; font-weight: 600;">+${s.week_cur}</span></td>
          <td style="text-align: right;">
            <button class="btn btn-outline btn-sm" onclick="showStudentModal('${s.id}')">Ko'rish</button>
          </td>
        </tr>
      `).join('');
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-danger p-4">Yuklashda xato: ${err.message}</td></tr>`;
    }
  }

  document.getElementById('btn-rating-filter').addEventListener('click', loadRating);
  loadRating();
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
                    <span>Mas'ul: <strong>${c.approver_role || 'Rektorat'}</strong></span>
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
          <span class="badge badge-group" style="font-weight: 600;">${it.approver_role || '-'}</span>
        </td>
      </tr>
    `;
  }).join('');
}


// -------------------------------------------------------------
// SAHIFA: TYUTORNING TALABALARI (T-01, T-05)
// -------------------------------------------------------------
async function renderTutorStudents(container) {
  try {
    const summary = await apiFetch('/api/tutor/summary');
    const studRes = await apiFetch('/api/tutor/students');
    const students = studRes.students || [];

    let html = `
      <div class="metrics-grid mb-4">
        <div class="stat-card">
          <div class="stat-icon" style="background:#EFF6FF; color:#2563EB;">${icon('users', 20)}</div>
          <div class="stat-data">
            <span class="stat-label">Guruh Talabalari</span>
            <h3 class="stat-val">${summary.total_students} nafar</h3>
            <span class="stat-sub">Guruhlar: ${summary.groups.join(', ')}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background:#ECFDF5; color:#059669;">${icon('zap', 20)}</div>
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
          <div class="stat-icon" style="background:#FEE2E2; color:#DC2626;">${icon('clock', 20)}</div>
          <div class="stat-data">
            <span class="stat-label">Passiv Talabalar</span>
            <h3 class="stat-val">${summary.passive_students_count} nafar</h3>
            <span class="stat-sub text-danger">14 kundan beri harakatsiz</span>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>Mening Talabalarim Ro'yxati</h3>
          <button class="btn btn-primary btn-sm" onclick="navigateTo('tutor-add-points')">${icon('userPlus', 14)} Yangi Ball Kiritish</button>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Talaba</th>
                  <th>Guruh</th>
                  <th>Mavsum Balli</th>
                  <th>Joriy Hafta</th>
                  <th>Holati</th>
                  <th style="text-align: right;">Amallar</th>
                </tr>
              </thead>
              <tbody>
                ${students.map(s => `
                  <tr>
                    <td><strong>${s.first_name} ${s.last_name}</strong></td>
                    <td><span class="badge badge-light">${s.group_code}</span></td>
                    <td><strong style="color: #2563EB;">${s.season || 0} ball</strong></td>
                    <td>+${s.week_cur || 0}</td>
                    <td>
                      ${s.is_passive ? '<span class="badge badge-warning">Passiv (14 kun)</span>' : '<span class="badge badge-success">Faol</span>'}
                    </td>
                    <td style="text-align: right;">
                      <button class="btn btn-outline btn-sm" onclick="showStudentModal('${s.id}')">Tarix</button>
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
            const canManage = isStaffOrAdmin && (AppState.user.roles.includes('superadmin') || ev.created_by === AppState.user.id || ev.organizer_unit === AppState.user.id);
            return `
              <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
                <div>
                  <div class="card-header" style="border-bottom: 1px solid var(--border-light); padding-bottom: 12px;">
                    <div>
                      <span class="badge" style="background: ${ev.category_color}20; color: ${ev.category_color}; border: 1px solid ${ev.category_color}40; font-weight: 600;">
                        ${ev.category_name}
                      </span>
                      <h3 style="margin-top: 8px; font-size: 16px; font-weight: 700; color: var(--text-main); line-height: 1.35;">${ev.title}</h3>
                    </div>
                    <span class="badge badge-primary" style="font-size: 13px; font-weight: 700; padding: 4px 10px;">+${ev.points} ball</span>
                  </div>
                  <div class="card-body" style="padding: 14px 18px;">
                    <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                      ${icon('mapPin', 14)} <span><strong>O'tkazilish joyi:</strong> ${ev.place}</span>
                    </p>
                    <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                      ${icon('clock', 14)} <span><strong>Vaqti:</strong> ${startsFormatted}</span>
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
                    <button class="btn btn-outline btn-sm" onclick="showEventQrModal('${ev.id}')" title="1-Usul: Tadbir QR kodini monitorga chiqarish (talaba scan qiladi)" style="display: inline-flex; align-items: center; gap: 5px;">
                      ${icon('qrCode', 13)} <span>Tadbir QR (Talaba scan)</span>
                    </button>
                    ${isStaffOrAdmin ? `
                      <button class="btn btn-primary btn-sm" onclick="showStudentCheckinModal('${ev.id}')" title="2-Usul: Talaba QR kodini yoki ID raqamini skanerlab ball berish" style="display: inline-flex; align-items: center; gap: 5px;">
                        ${icon('checkCircle', 13)} <span>Qabul Qilish (Check-in)</span>
                      </button>
                    ` : ''}
                  </div>
                  <div style="display: flex; gap: 6px;">
                    <button class="btn btn-outline btn-sm" onclick="showEventParticipantsModal('${ev.id}')" title="Ishtirokchilar ro'yxati">
                      ${icon('users', 13)}
                    </button>
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
    <form id="dept-create-event-form">
      <div class="form-group mb-3">
        <label class="form-label">Tadbir Nomi *</label>
        <input type="text" id="ev-title" class="form-control" placeholder="Masalan: 'AKHU AI Hackathon 2026'" required>
      </div>

      <div class="grid grid-2 mb-3">
        <div class="form-group">
          <label class="form-label">Boshlanish vaqti *</label>
          <input type="datetime-local" id="ev-starts-at" class="form-control" required>
        </div>
        <div class="form-group">
          <label class="form-label">Tugash vaqti *</label>
          <input type="datetime-local" id="ev-ends-at" class="form-control" required>
        </div>
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
    </form>
  `;

  modalFooter.innerHTML = `
    <button class="btn btn-outline" onclick="closeModal()">Bekor Qilish</button>
    <button class="btn btn-primary" onclick="submitCreateEvent()" style="display: inline-flex; align-items: center; gap: 6px;">
      ${icon('check', 14)} E'lon Qilish va QR Yaratish
    </button>
  `;

  openModal();
}

async function submitCreateEvent() {
  const title = document.getElementById('ev-title')?.value.trim();
  const starts_at_val = document.getElementById('ev-starts-at')?.value;
  const ends_at_val = document.getElementById('ev-ends-at')?.value;
  const place = document.getElementById('ev-place')?.value.trim();
  const category_id = document.getElementById('ev-cat-id')?.value;
  const level = document.getElementById('ev-level')?.value;
  const capacity = document.getElementById('ev-capacity')?.value;
  const req_reg = document.getElementById('ev-req-reg')?.checked;

  if (!title || !starts_at_val || !ends_at_val || !place || !category_id || !level) {
    alert("Iltimos, barcha majburiy maydonlarni to'ldiring!");
    return;
  }

  try {
    const payload = {
      title,
      starts_at: new Date(starts_at_val).toISOString(),
      ends_at: new Date(ends_at_val).toISOString(),
      place,
      organizer_unit: AppState.user.id || 'dep_yb',
      category_id,
      level,
      capacity: capacity ? Number(capacity) : null,
      requires_registration: Boolean(req_reg)
    };

    const res = await apiFetch('/api/events', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    closeModal();
    alert(`Tadbir muvaffaqiyatli e'lon qilindi (+${res.points} ball)!`);
    renderDeptEvents(document.getElementById('module-page-container') || document.getElementById('app-content-area'));
    showEventQrModal(res.event_id);
  } catch (err) {
    alert(err.message);
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
            ${list.map((p, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td style="font-weight: 600;">${p.student_name || p.full_name}</td>
                <td><span class="badge badge-group">${p.group_code}</span></td>
                <td style="color: var(--text-muted); font-size: 12px;">${new Date(p.checked_in_at || p.created_at).toLocaleString('uz-UZ')}</td>
                <td><span class="badge" style="background:#ECFDF5; color:#059669; font-weight: 700;">+${p.points || 5}</span></td>
              </tr>
            `).join('')}
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
            <!-- 1. Foto yuklash qismi -->
            <div style="margin-bottom: 24px;">
              <label class="form-label" style="font-weight: 700; font-size: 14px; margin-bottom: 8px; display: block;">
                📷 Profil Fotosurati (Rasm Yuklash)
              </label>
              <div class="photo-uploader-box">
                <img id="profile-preview-thumb" src="${user.photo_url || ''}" class="photo-preview-thumb" style="${user.photo_url ? '' : 'display:none;'}" alt="Preview">
                <div style="flex: 1;">
                  <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px;">
                    <input type="file" id="staff-profile-file-input" accept="image/*" style="display: none;" onchange="handleStaffProfilePhotoUpload(this)">
                    <button type="button" class="btn btn-outline btn-sm" onclick="document.getElementById('staff-profile-file-input').click()" style="display: inline-flex; align-items: center; gap: 6px; background: white;">
                      ${icon('upload', 14)} <span>Kompyuterdan Rasm Yuklash</span>
                    </button>
                    <span style="font-size: 11.5px; color: var(--text-muted);">(JPG, PNG formatlarda)</span>
                  </div>
                  <div>
                    <input type="url" id="staff-profile-photo-url" class="form-control" value="${user.photo_url || ''}" placeholder="Yoki rasm havolasini kiriting (https://...)" oninput="updateProfilePhotoPreview(this.value)">
                  </div>
                </div>
              </div>
            </div>

            <!-- 2. Shaxsiy ma'lumotlar -->
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

            <!-- 3. Parol o'zgartirish -->
            <div class="form-group mb-4" style="background: #F8FAFC; border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 14px;">
              <label class="form-label" style="font-weight: 600; margin-bottom: 4px;">Yangi Parol O'rnatish</label>
              <p style="font-size: 11.5px; color: var(--text-muted); margin-bottom: 8px;">Agar parolni o'zgartirishni istamasangiz, ushbu maydonni bo'sh qoldiring:</p>
              <input type="password" id="staff-profile-password" class="form-control" placeholder="Yangi parol (kamida 6 ta belgi)" style="max-width: 400px;">
            </div>

            <!-- 4. Biriktirilgan Rollar va Guruhlar (Faqat ko'rish uchun) -->
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

function updateProfilePhotoPreview(url) {
  const thumb = document.getElementById('profile-preview-thumb');
  if (!thumb) return;
  if (url && url.trim()) {
    thumb.src = url.trim();
    thumb.style.display = 'block';
  } else {
    thumb.style.display = 'none';
  }
}

async function handleStaffProfilePhotoUpload(fileInput) {
  const file = fileInput.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch('/api/files', {
      method: 'POST',
      headers: {
        'x-user-id': AppState.user.id
      },
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Faylni yuklashda xatolik yuz berdi');

    const urlInput = document.getElementById('staff-profile-photo-url');
    if (urlInput) {
      urlInput.value = data.url;
      updateProfilePhotoPreview(data.url);
    }
    alert('Rasm muvaffaqiyatli yuklandi!');
  } catch (err) {
    alert(`Xatolik: ${err.message}`);
  }
}

async function handleStaffProfileSave(event) {
  event.preventDefault();

  const full_name = document.getElementById('staff-profile-fullname')?.value.trim();
  const email = document.getElementById('staff-profile-email')?.value.trim();
  const phone = document.getElementById('staff-profile-phone')?.value.trim();
  const telegram_user_id = document.getElementById('staff-profile-tgid')?.value.trim();
  const photo_url = document.getElementById('staff-profile-photo-url')?.value.trim();
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
      telegram_user_id: telegram_user_id || null,
      photo_url: photo_url || null
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
    AppState.user.photo_url = photo_url;
    localStorage.setItem('akhu_auth_user', JSON.stringify(AppState.user));

    updateAuthUI();
    alert("Profil ma'lumotlaringiz va rasmingiz muvaffaqiyatli saqlandi!");
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
              <span>Ball Katalogi Sozlamalari & Versiyalash</span>
              <span class="badge" style="background: rgba(59, 130, 246, 0.2); color: #93C5FD; border: 1px solid rgba(59, 130, 246, 0.4); font-size: 11px;">Superadmin</span>
            </div>
            <p class="admin-hero-desc">
              Katalog mezonlarini tahrirlash uchun jadvaldagi ixtiyoriy band ustiga bosing. 
              Har bir o'zgartirish tizimda o'zgarmas versiya sifatida saqlanadi va audit qilinadi.
            </p>
          </div>
        </div>
      </div>

      <!-- TOOLBAR -->
      <div class="admin-toolbar">
        <div class="admin-search-box">
          ${icon('search', 16)}
          <input type="text" id="admin-cat-search" class="admin-search-input" placeholder="Mezon nomi bo'yicha tezkor qidiruv...">
        </div>
        <div class="admin-filters-group">
          <select id="admin-cat-filter-cat" class="admin-filter-select">
            <option value="">Barcha kategoriyalar</option>
            ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
          </select>
          <button class="btn btn-outline btn-sm" onclick="resetAdminCatalogFilters()" style="display:inline-flex; align-items:center; gap:4px;">
            ${icon('refresh', 13)} Tozalash
          </button>
        </div>
      </div>

      <!-- DATA TABLE -->
      <div class="card">
        <div class="card-header" style="background: #F8FAFC; border-bottom: 1px solid var(--border-light);">
          <span style="font-size: 12.5px; color: var(--text-secondary); font-weight: 600;">
            Maslahat: Mezonni tahrirlash uchun qatordan ixtiyoriy joyiga bosing.
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

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 32px; color: var(--text-muted);">Mezonlar topilmadi</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(it => {
    const catColor = it.category_color || '#2563EB';
    const catName = it.category_name || `Kategoriya #${it.category_id}`;

    return `
      <tr class="student-table-row" onclick="showEditCatalogModal('${it.id}')" style="cursor: pointer;" title="Tahrirlash uchun bosing">
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
        <td><span class="badge badge-group" style="font-weight: 600;">${it.approver_role || '-'}</span></td>
        <td><span style="font-size: 11.5px; color: var(--text-muted);">${it.evidence_hint || 'Majburiy emas'}</span></td>
      </tr>
    `;
  }).join('');
}

async function showEditCatalogModal(id) {
  const item = adminCatalogState.items.find(i => String(i.id) === String(id));
  if (!item) return;

  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalFooter = document.getElementById('modal-footer');

  modalTitle.innerHTML = `<span style="display:flex; align-items:center; gap:8px;">${icon('edit', 18)} Mezonni Tahrirlash: #${item.id}</span>`;
  modalBody.innerHTML = `
    <form id="edit-cat-form">
      <div class="form-group mb-3">
        <label class="form-label">Mezon (Band Nomi) *</label>
        <textarea id="edit-cat-name" class="form-control" rows="2" required>${item.name}</textarea>
      </div>

      <div class="grid grid-2 mb-3">
        <div class="form-group">
          <label class="form-label">Baza Balli</label>
          <input type="number" id="edit-cat-points" class="form-control" value="${item.base_points !== null ? item.base_points : 0}" ${item.is_scale ? 'disabled' : ''}>
          ${item.is_scale ? `<small class="text-muted">Bu band musobaqa shkalasi bo'yicha hisoblanadi</small>` : ''}
        </div>
        <div class="form-group">
          <label class="form-label">Tasdiqlovchi Mas'ul Rol</label>
          <input type="text" id="edit-cat-role" class="form-control" value="${item.approver_role || ''}">
        </div>
      </div>

      <div class="form-group mb-3">
        <label class="form-label">Dalil Talabi (Yo'riqnoma)</label>
        <input type="text" id="edit-cat-evidence" class="form-control" value="${item.evidence_hint || ''}">
      </div>

      <div class="form-group mb-2">
        <label class="form-label">Limit Qoidasi</label>
        <input type="text" id="edit-cat-limit" class="form-control" value="${item.limit_rule || ''}" placeholder="Masalan: semestrda 2 marta">
      </div>
    </form>
  `;

  modalFooter.innerHTML = `
    <button class="btn btn-outline" onclick="closeModal()">Bekor Qilish</button>
    <button class="btn btn-primary" onclick="saveCatalogItem('${id}')" style="display:inline-flex; align-items:center; gap:6px;">
      ${icon('check', 14)} Saqlash
    </button>
  `;

  openModal();
}

async function saveCatalogItem(id) {
  const name = document.getElementById('edit-cat-name')?.value.trim();
  const base_points = Number(document.getElementById('edit-cat-points')?.value || 0);
  const approver_role = document.getElementById('edit-cat-role')?.value.trim();
  const evidence_hint = document.getElementById('edit-cat-evidence')?.value.trim();
  const limit_rule = document.getElementById('edit-cat-limit')?.value.trim();

  if (!name) {
    alert('Band nomi kiritilishi shart!');
    return;
  }

  try {
    const res = await apiFetch(`/api/admin/catalog/item/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, base_points, approver_role, evidence_hint, limit_rule })
    });
    closeModal();
    alert(res.message || "Muvaffaqiyatli saqlandi!");
    await renderAdminCatalog(document.getElementById('app-content-area'));
  } catch (e) {
    alert(e.message);
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
      ? `<img src="${st.photo_url}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 2px solid #2563EB;" alt="${st.first_name}">`
      : `<span class="avatar-badge ${isFemale ? 'female' : ''}" style="width: 60px; height: 60px; font-size: 22px;">${initials}</span>`;

    modalTitle.textContent = `${st.first_name} ${st.last_name} (${st.group_code})`;
    modalBody.innerHTML = `
      <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px; padding-bottom: 14px; border-bottom: 1px solid var(--border-light);">
        ${avatarHtml}
        <div>
          <h4 style="font-size: 16px; font-weight: 700; margin-bottom: 4px;">${st.first_name} ${st.last_name}</h4>
          <span class="badge badge-group">${st.external_id}</span>
          <span class="badge badge-course">${st.course}-kurs • ${st.group_code}</span>
        </div>
      </div>
      <div class="grid grid-2 mb-3">
        <div>
          <p><strong>Guruh:</strong> ${st.group_code}</p>
          <p><strong>Kurs:</strong> ${st.course}-kurs (${st.level === 'bak' ? 'Bakalavriat' : 'Magistratura'})</p>
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
  } catch (err) {
    modalBody.innerHTML = `<p class="text-danger">${err.message}</p>`;
  }
}

// Tadbir QR kodini ko'rish
async function showEventQrModal(eventId) {
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalFooter = document.getElementById('modal-footer');

  modalTitle.textContent = 'Tadbir Check-in QR Kodi';
  modalBody.innerHTML = '<div class="spinner"></div>';
  modalFooter.innerHTML = '<button class="btn btn-outline" onclick="closeModal()">Yopish</button>';
  openModal();

  try {
    const res = await apiFetch(`/api/events/${eventId}/qr`);
    const qrImg = res.qr_data_url || res.dataUrl;
    modalBody.innerHTML = `
      <div style="text-align: center; padding: 16px;">
        <span class="badge badge-primary" style="font-size: 13px; font-weight: 700; padding: 4px 10px; margin-bottom: 8px;">1-USUL: UMUMIY TADBIR QR KODI</span>
        <h3 style="margin: 8px 0 6px 0; font-size: 18px;">${res.title || 'Tadbir'}</h3>
        <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 16px; max-width: 440px; margin-left: auto; margin-right: auto;">
          Ushbu QR kodni auditoriya ekraniga yoki posterga chiqaring. Talabalar Telegram Mini App da skaner qilib avtomatik <strong>+${res.points || 5} ball</strong> oladilar.
        </p>
        <div style="background: white; padding: 16px; display: inline-block; border-radius: 14px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid var(--border-light);">
          <img src="${qrImg}" alt="QR Kod" style="width: 250px; height: 250px; display: block; margin: 0 auto;">
        </div>

        <div style="margin-top: 16px; padding: 12px; background: #F8FAFC; border-radius: 8px; border: 1px solid var(--border-light); font-size: 12px; color: var(--text-secondary);">
          🔄 Ushbu QR kod avtomatik yangilanadi va soxtalashtirishdan himoyalangan.
        </div>
      </div>
    `;
    modalFooter.innerHTML = `
      <button class="btn btn-primary" onclick="showStudentCheckinModal('${eventId}')" style="display:inline-flex; align-items:center; gap:6px;">
        ${icon('qrCode', 14)} <span>2-Usul: Talaba QR Skanerlash</span>
      </button>
      <a href="${qrImg}" download="tadbir_qr_${eventId}.png" class="btn btn-outline">Yuklab Olish (PNG)</a>
      <button class="btn btn-outline" onclick="closeModal()">Yopish</button>
    `;
  } catch (e) {
    modalBody.innerHTML = `<p class="text-danger">${e.message}</p>`;
  }
}

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
          <a href="/api/admin/students/template" download="talabalar_import_shablon.xlsx" class="btn btn-outline" style="color: #F8FAFC; border-color: rgba(255,255,255,0.25); display: inline-flex; align-items: center; gap: 6px;">
            ${icon('download', 14)} <span>Excel Shablon</span>
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
            <p style="font-size: 12.5px; color: var(--text-secondary); margin-bottom: 10px; font-weight: 600;">
              Excel fayldagi talab qilinadigan 8 ta ustun tartibi:
            </p>
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
              <th style="width: 130px;">Talaba ID</th>
              <th>F.I.Sh</th>
              <th>Yo'nalish & Guruh</th>
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
              <td colspan="10" style="text-align: center; padding: 40px; color: var(--text-muted);">
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
  adminStudentsState.course = '';
  adminStudentsState.gender = '';
  adminStudentsState.status = '';
  adminStudentsState.offset = 0;

  const s = document.getElementById('filter-student-search');
  if (s) s.value = '';
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
          <td colspan="10" style="text-align: center; padding: 48px; color: var(--text-muted);">
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

      <div class="grid grid-2 mb-3">
        <div class="form-group">
          <label class="form-label">Ta'lim Yo'nalishi</label>
          <input type="text" id="new-std-program" class="form-control" placeholder="Masalan: Sun'iy intellekt">
        </div>
        <div class="form-group">
          <label class="form-label">Kursi (Bosqich)</label>
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
          <input type="text" id="new-std-phone" class="form-control" placeholder="+998901234567">
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

async function handleCreateStudentSubmit() {
  const external_id = document.getElementById('new-std-external-id')?.value.trim();
  const group_code = document.getElementById('new-std-group')?.value.trim();
  const first_name = document.getElementById('new-std-first-name')?.value.trim();
  const last_name = document.getElementById('new-std-last-name')?.value.trim();
  const program_code = document.getElementById('new-std-program')?.value.trim() || 'IT';
  const course = Number(document.getElementById('new-std-course')?.value || 1);
  const gender = document.getElementById('new-std-gender')?.value || 'm';
  const phone = document.getElementById('new-std-phone')?.value.trim();
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
        program_code, course, gender, phone, email
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

    modalBody.innerHTML = `
      <form id="edit-student-form">
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

        <div class="grid grid-2 mb-3">
          <div class="form-group">
            <label class="form-label">Ta'lim Yo'nalishi</label>
            <input type="text" id="edit-std-program" class="form-control" value="${st.program_code || ''}">
          </div>
          <div class="form-group">
            <label class="form-label">Kursi (Bosqich)</label>
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
            <input type="text" id="edit-std-phone" class="form-control" value="${st.phone || ''}">
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

async function handleEditStudentSubmit(studentId) {
  const external_id = document.getElementById('edit-std-external-id')?.value.trim();
  const group_code = document.getElementById('edit-std-group')?.value.trim();
  const first_name = document.getElementById('edit-std-first-name')?.value.trim();
  const last_name = document.getElementById('edit-std-last-name')?.value.trim();
  const program_code = document.getElementById('edit-std-program')?.value.trim();
  const course = Number(document.getElementById('edit-std-course')?.value || 1);
  const gender = document.getElementById('edit-std-gender')?.value;
  const phone = document.getElementById('edit-std-phone')?.value.trim();
  const email = document.getElementById('edit-std-email')?.value.trim();
  const status = document.getElementById('edit-std-status')?.value;
  const tutor_id = document.getElementById('edit-std-tutor')?.value || null;

  try {
    await apiFetch(`/api/admin/students/${studentId}`, {
      method: 'PUT',
      body: JSON.stringify({
        external_id, group_code, first_name, last_name,
        program_code, course, gender, phone, email, tutor_id, status
      })
    });

    closeModal();
    alert("Talaba ma'lumotlari muvaffaqiyatli yangilandi!");
    await loadAdminStudentsList();
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
            <span>Universitet Xodimlari & Tizim Rollari Boshqaruvi</span>
            <span class="badge" style="background: rgba(248, 113, 113, 0.2); color: #FCA5A5; border: 1px solid rgba(248, 113, 113, 0.4); font-size: 11px;">
              Superadmin Full Access
            </span>
          </div>
          <p class="admin-hero-desc">
            Barcha tizim foydalanuvchilari (Tyutorlar, Bo'lim xodimlari, Registratorlar, Prorektor) reyestri. 
            Ixtiyoriy xodimga rollarni biriktirish, yangi xodimlarni ro'yxatdan o'tkazish yoki faollik holatini boshqarish.
          </p>
        </div>
        <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
          <button class="btn btn-primary" onclick="showCreateStaffModal()" style="display: inline-flex; align-items: center; gap: 6px;">
            ${icon('userPlus', 14)} <span>Yangi Xodim Qo'shish</span>
          </button>
        </div>
      </div>
    </div>

    <!-- METRIKALAR -->
    <div class="metrics-grid mb-4">
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
          <span class="stat-sub">Tizimga kirish huquqiga ega</span>
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
          <span class="stat-sub">Yoshlar, Ilmiy, Ma'naviyat va b.</span>
        </div>
      </div>
    </div>

    <!-- TOOLBAR -->
    <div class="admin-toolbar">
      <div class="admin-search-box">
        ${icon('search', 16)}
        <input type="text" id="filter-staff-search" class="admin-search-input" placeholder="Ism, login yoki email bo'yicha qidiruv...">
      </div>
      <div class="admin-filters-group">
        <select id="filter-staff-role" class="admin-filter-select">
          <option value="">Barcha rollar</option>
          <option value="superadmin">Superadmin</option>
          <option value="prorektor">Prorektor</option>
          <option value="tutor">Tyutor</option>
          <option value="dep_yb">Yoshlar bilan ishlash</option>
          <option value="dep_ob">O'quv bo'limi</option>
          <option value="dep_mb">Ma'naviyat bo'limi</option>
          <option value="dep_ib">Ilmiy bo'lim</option>
          <option value="observer">Kuzatuvchi</option>
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
              <th>Holati</th>
              <th style="text-align: right; width: 120px;">Amallar</th>
            </tr>
          </thead>
          <tbody id="admin-staff-table-body">
            <tr>
              <td colspan="6" style="text-align: center; padding: 40px; color: var(--text-muted);">
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
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      adminStaffState.search = e.target.value.trim().toLowerCase();
      renderStaffTableRows();
    }, 300);
  });

  document.getElementById('filter-staff-role').addEventListener('change', (e) => {
    adminStaffState.role = e.target.value;
    renderStaffTableRows();
  });

  await loadStaffUsersList();
}

function resetStaffFilters() {
  adminStaffState.search = '';
  adminStaffState.role = '';
  const s = document.getElementById('filter-staff-search');
  if (s) s.value = '';
  const r = document.getElementById('filter-staff-role');
  if (r) r.value = '';
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
    const tutors = adminStaffState.users.filter(u => (u.roles || []).includes('tutor')).length;
    const depts = adminStaffState.users.filter(u => (u.roles || []).some(r => r.startsWith('dep_'))).length;

    const elTotal = document.getElementById('stat-staff-total');
    const elActive = document.getElementById('stat-staff-active');
    const elTutors = document.getElementById('stat-staff-tutors');
    const elDepts = document.getElementById('stat-staff-depts');

    if (elTotal) elTotal.textContent = total;
    if (elActive) elActive.textContent = active;
    if (elTutors) elTutors.textContent = tutors;
    if (elDepts) elDepts.textContent = depts;

    renderStaffTableRows();
  } catch (err) {
    const tbody = document.getElementById('admin-staff-table-body');
    if (tbody) tbody.innerHTML = `<tr><td colspan="6" class="text-danger" style="text-align:center; padding:20px;">${err.message}</td></tr>`;
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
      (u.email || '').toLowerCase().includes(q)
    );
  }

  if (adminStaffState.role) {
    filtered = filtered.filter(u => (u.roles || []).includes(adminStaffState.role));
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 40px; color: var(--text-muted);">
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

    return `
      <tr>
        <td>
          <div class="table-student-name">
            ${u.photo_url ? `
              <img src="${u.photo_url}" class="avatar-badge" style="object-fit:cover; border-radius:50%; width:32px; height:32px;" onerror="this.outerHTML='<span class=\\'avatar-badge\\'>${initials || 'X'}</span>'">
            ` : `
              <span class="avatar-badge">${initials || 'X'}</span>
            `}
            <div>
              <div style="font-weight: 600; color: var(--text-main); font-size: 13px;">${u.full_name}</div>
              <div class="table-sub-text">@${u.username || u.id}</div>
            </div>
          </div>
        </td>
        <td>
          <div style="display: flex; flex-wrap: wrap; max-width: 280px;">${roleBadges || '<span class="text-muted">Rollar biriktirilmagan</span>'}</div>
        </td>
        <td>${groupBadges}</td>
        <td>
          <div style="font-size: 12px; color: var(--text-main);">${u.email || '-'}</div>
          <div class="table-sub-text">${u.phone || '<span style="color:#94A3B8;">Tel kiritilmagan</span>'}</div>
        </td>
        <td>
          <span class="status-badge ${isActive ? 'badge-active' : 'badge-inactive'}">
            ${isActive ? 'Faol' : 'Bloklangan'}
          </span>
        </td>
        <td style="text-align: right;">
          <div style="display: inline-flex; gap: 4px; justify-content: flex-end;">
            <button class="btn-action" style="background:#EFF6FF; color:#2563EB; border:1px solid #BFDBFE;" onclick="impersonateStaffUser('${u.id}')" title="Ushbu xodim nomidan tizimni tekshirish (Check / Kirish)">
              ${icon('eye', 14)}
            </button>
            <button class="btn-action btn-action-primary" onclick="showEditStaffModal('${u.id}')" title="Tahrirlash / Rollar">
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
            <input type="url" id="new-staff-photourl" class="form-control" placeholder="Yoki rasm havolasi (https://...)" oninput="updateAdminStaffPhotoPreview(this.value, 'create-staff-photo-preview')">
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
          <label class="form-label">Telefon Raqami</label>
          <input type="text" id="new-staff-phone" class="form-control" placeholder="+998901234567">
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
        <label class="form-label">Tyutor Guruhlari (vergul bilan, faqat Tyutor roli tanlanganda):</label>
        <input type="text" id="new-staff-tutor-groups" class="form-control" placeholder="FMC01, FMC02">
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
  const photo_url = document.getElementById('new-staff-photourl')?.value.trim();

  const roles = Array.from(document.querySelectorAll(`input[name="new-staff-roles-checkbox"]:checked`))
    .map(cb => cb.value)
    .filter(r => r && r !== 'undefined');

  const rawGroups = document.getElementById('new-staff-tutor-groups')?.value.trim();
  const tutor_groups = rawGroups ? rawGroups.split(',').map(g => g.trim()).filter(Boolean) : [];

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
        username, password, full_name, email, phone, photo_url: photo_url || null, roles, tutor_groups, groups: tutor_groups
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
            <input type="url" id="edit-staff-photourl" class="form-control" value="${user.photo_url || ''}" placeholder="Yoki rasm havolasini kiriting (https://...)" oninput="updateAdminStaffPhotoPreview(this.value, 'edit-staff-photo-preview')">
          </div>
        </div>
      </div>

      <div class="grid grid-2 mb-3">
        <div class="form-group">
          <label class="form-label">F.I.Sh (To'liq ismi) *</label>
          <input type="text" id="edit-staff-fullname" class="form-control" value="${user.full_name || ''}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Yangi Parol (faqat o'zgartirish uchun)</label>
          <input type="password" id="edit-staff-password" class="form-control" placeholder="Eski parolni saqlash uchun bo'sh qoldiring">
        </div>
      </div>

      <div class="grid grid-2 mb-3">
        <div class="form-group">
          <label class="form-label">Email *</label>
          <input type="email" id="edit-staff-email" class="form-control" value="${user.email || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Telefon Raqami</label>
          <input type="text" id="edit-staff-phone" class="form-control" value="${user.phone || ''}" placeholder="+998901234567">
        </div>
      </div>

      <div class="grid grid-2 mb-3">
        <div class="form-group">
          <label class="form-label">Foydalanuvchi Nomi (Login)</label>
          <input type="text" class="form-control" value="${user.username || user.id}" disabled style="background:#F1F5F9; color:#64748B;">
        </div>
        <div class="form-group">
          <label class="form-label">Telegram User ID (Xabarnomalar uchun)</label>
          <input type="text" id="edit-staff-tgid" class="form-control" value="${user.telegram_user_id || ''}" placeholder="masalan: 1202082857">
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

      <div class="grid grid-2 mb-2">
        <div class="form-group">
          <label class="form-label">Tyutor Guruhlari (vergul bilan):</label>
          <input type="text" id="edit-staff-tutor-groups" class="form-control" value="${userGroups.join(', ')}" placeholder="FMC01, FMC02">
        </div>
        <div class="form-group">
          <label class="form-label">Xodimning Tizimdagi Holati</label>
          <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; margin-top: 8px; cursor: pointer; font-weight: 600;">
            <input type="checkbox" id="edit-staff-active" ${isActive ? 'checked' : ''}>
            <span>Faol (Tizimga kirishga to'liq ruxsat)</span>
          </label>
        </div>
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
  const full_name = document.getElementById('edit-staff-fullname')?.value.trim();
  const password = document.getElementById('edit-staff-password')?.value;
  const email = document.getElementById('edit-staff-email')?.value.trim();
  const phone = document.getElementById('edit-staff-phone')?.value.trim();
  const photo_url = document.getElementById('edit-staff-photourl')?.value.trim();
  const telegram_user_id = document.getElementById('edit-staff-tgid')?.value.trim();
  const is_active = document.getElementById('edit-staff-active')?.checked ? 1 : 0;

  const roles = Array.from(document.querySelectorAll(`input[name="edit-staff-roles-checkbox"]:checked`))
    .map(cb => cb.value)
    .filter(r => r && r !== 'undefined');

  const rawGroups = document.getElementById('edit-staff-tutor-groups')?.value.trim();
  const tutor_groups = rawGroups ? rawGroups.split(',').map(g => g.trim()).filter(Boolean) : [];

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
      full_name,
      email,
      phone,
      photo_url: photo_url || null,
      telegram_user_id: telegram_user_id || null,
      active: is_active,
      is_active: is_active === 1,
      roles,
      tutor_groups,
      groups: tutor_groups
    };
    if (password && String(password).trim().length > 0) {
      payload.password = String(password).trim();
    }

    await apiFetch(`/api/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });

    closeModal();
    alert("Xodim ma'lumotlari, fotosurati va rollari muvaffaqiyatli yangilandi!");
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

window.showCreateStaffModal = showCreateStaffModal;
window.handleCreateStaffSubmit = handleCreateStaffSubmit;
window.showEditStaffModal = showEditStaffModal;
window.handleEditStaffSubmit = handleEditStaffSubmit;
window.toggleStaffStatus = toggleStaffStatus;
window.deleteStaffUser = deleteStaffUser;
window.resetStaffFilters = resetStaffFilters;

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
      <span style="font-size:16px;">👁️</span>
      <span>TEKSHIRUV REJIMI: Siz <u>${name}</u> (${roles.join(', ')}) sifatida tizimni tekshirmoqdasiz!</span>
    </div>
    <button onclick="exitImpersonation()" style="background:#DC2626; color:white; border:none; padding:6px 14px; border-radius:6px; font-size:12px; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:6px;">
      🔙 Superadminga Qaytish
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
