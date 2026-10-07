// ====================================================================
// AKHU TALABALAR TIZIMI - ASOSIY BOSHQARUV VA KUZATUV SPA JS (app.js)
// ====================================================================

const AppState = {
  currentRole: 'superadmin',
  currentPage: 'observe-dashboard',
  catalog: { categories: [], items: [], scale: [] },
  user: {
    id: 'superadmin',
    name: 'Mansurbek Qazaqov (Superadmin)',
    roles: ['superadmin']
  }
};

const ROLE_MAP = {
  'observer': { id: 'observer', name: 'Kuzatuvchi (Rektorat)', roles: ['observer'], tagColor: '#60A5FA' },
  'tutor_1': { id: 'tutor_1', name: 'Jasur Mahmudov (Tyutor)', roles: ['tutor'], tagColor: '#34D399' },
  'tutor_2': { id: 'tutor_2', name: 'Aziza Qodirova (Tyutor)', roles: ['tutor'], tagColor: '#34D399' },
  'tutor_3': { id: 'tutor_3', name: 'Bobur Alimov (Tyutor)', roles: ['tutor'], tagColor: '#34D399' },
  'dep_yb': { id: 'dep_yb', name: 'Yoshlar bilan ishlash bo\'limi', roles: ['dep_yb'], tagColor: '#FBBF24' },
  'dep_mb': { id: 'dep_mb', name: 'Ma\'naviyat va ma\'rifat bo\'limi', roles: ['dep_mb'], tagColor: '#FBBF24' },
  'dep_ob': { id: 'dep_ob', name: 'O\'quv bo\'limi (Registrator)', roles: ['dep_ob'], tagColor: '#FBBF24' },
  'dep_ib': { id: 'dep_ib', name: 'Ilmiy tadqiqotlar bo\'limi', roles: ['dep_ib'], tagColor: '#FBBF24' },
  'dep_sb': { id: 'dep_sb', name: 'Sanoat bilan hamkorlik', roles: ['dep_sb'], tagColor: '#FBBF24' },
  'dep_pb': { id: 'dep_pb', name: 'Matbuot xizmati (PR)', roles: ['dep_pb'], tagColor: '#FBBF24' },
  'prorektor': { id: 'prorektor', name: 'Yoshlar bo\'yicha Prorektor', roles: ['prorektor'], tagColor: '#A78BFA' },
  'superadmin': { id: 'superadmin', name: 'Mansurbek Qazaqov (Superadmin)', roles: ['superadmin'], tagColor: '#F87171' }
};

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
  // Saqlangan rolni tekshirish
  const savedRole = localStorage.getItem('akhu_staff_role') || 'superadmin';
  if (ROLE_MAP[savedRole]) {
    const info = ROLE_MAP[savedRole];
    AppState.currentRole = savedRole;
    AppState.user = { id: info.id, name: info.name, roles: info.roles };
  }

  initRoleSwitcher();
  initNavigation();
  initModals();
  initLoginForm();
  await loadCatalogData();
  navigateTo(AppState.currentPage);

  // Refresh tugmasi
  const refreshBtn = document.getElementById('btn-refresh-data');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      navigateTo(AppState.currentPage);
    });
  }
});

// 1. ROL ALMASHTIRGICH (SSO SIMULATOR)
function initRoleSwitcher() {
  const selector = document.getElementById('role-selector');
  const roleTag = document.getElementById('role-tag');
  const topbarUser = document.getElementById('topbar-user-name');

  if (selector) selector.value = AppState.currentRole;
  if (roleTag) {
    roleTag.textContent = AppState.user.name.split(' ')[0];
    roleTag.style.color = ROLE_MAP[AppState.currentRole]?.tagColor || '#60A5FA';
  }
  if (topbarUser) {
    topbarUser.textContent = AppState.user.name;
  }

  if (selector) {
    selector.addEventListener('change', (e) => {
      setUserRole(e.target.value);
    });
  }

  updateSidebarPermissions();
}

function setUserRole(roleKey) {
  const info = ROLE_MAP[roleKey];
  if (!info) return;

  AppState.currentRole = roleKey;
  AppState.user = { id: info.id, name: info.name, roles: info.roles };
  localStorage.setItem('akhu_staff_role', roleKey);

  const selector = document.getElementById('role-selector');
  const roleTag = document.getElementById('role-tag');
  const topbarUser = document.getElementById('topbar-user-name');

  if (selector) selector.value = roleKey;
  if (roleTag) {
    roleTag.textContent = info.name.split(' ')[0];
    roleTag.style.color = info.tagColor;
  }
  if (topbarUser) {
    topbarUser.textContent = info.name;
  }

  updateSidebarPermissions();

  if (info.roles.includes('tutor')) {
    navigateTo('tutor-my-students');
  } else if (info.roles.includes('prorektor')) {
    navigateTo('prorektor-queue');
  } else if (info.roles.some(r => r.startsWith('dep_'))) {
    navigateTo('dept-approvals');
  } else if (info.roles.includes('superadmin')) {
    navigateTo('admin-catalog');
  } else {
    navigateTo('observe-dashboard');
  }
}

// LOGIN MODAL
function openLoginModal() {
  const modal = document.getElementById('login-modal');
  if (modal) modal.classList.add('active');
}

function closeLoginModal() {
  const modal = document.getElementById('login-modal');
  if (modal) modal.classList.remove('active');
}

function quickLoginRole(roleKey) {
  setUserRole(roleKey);
  closeLoginModal();
}

function initLoginForm() {
  const form = document.getElementById('portal-login-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const errBox = document.getElementById('login-error-msg');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Kirish xatosi');

      setUserRole(data.user.roles[0] || 'superadmin');
      closeLoginModal();
      alert(`Xush kelibsiz, ${data.user.full_name}!`);
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
  const userRoles = AppState.user.roles;

  sections.forEach(el => {
    const forRole = el.getAttribute('data-for-role');
    let visible = false;

    if (userRoles.includes('superadmin')) {
      visible = true;
    } else if (forRole === 'tutor' && userRoles.includes('tutor')) {
      visible = true;
    } else if (forRole === 'approver' && (userRoles.some(r => r.startsWith('dep_')) || userRoles.includes('prorektor'))) {
      visible = true;
    } else if (forRole === 'dep_ob' && userRoles.includes('dep_ob')) {
      visible = true;
    } else if (forRole === 'prorektor' && userRoles.includes('prorektor')) {
      visible = true;
    } else if (forRole === 'superadmin' && userRoles.includes('superadmin')) {
      visible = true;
    }

    el.style.display = visible ? '' : 'none';
  });

  // Agar bo'lim xodimi bo'lsa navbat sonini yuklash
  if (userRoles.some(r => r.startsWith('dep_')) || userRoles.includes('prorektor') || userRoles.includes('superadmin')) {
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
  AppState.currentPage = pageName;

  document.querySelectorAll('.sidebar-nav a.nav-item').forEach(link => {
    if (link.getAttribute('data-page') === pageName) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  const pageTitle = document.getElementById('current-page-title');
  const pageDesc = document.getElementById('current-page-desc');
  const contentArea = document.getElementById('app-content-area');

  contentArea.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Ma\'lumotlar yuklanmoqda...</p></div>';

  switch (pageName) {
    case 'observe-dashboard':
      pageTitle.textContent = 'Kuzatuv Paneli';
      pageDesc.textContent = 'Universitet talabalari faolligi va reyting ko\'rsatkichlari';
      renderObserveDashboard(contentArea);
      break;
    case 'observe-rating':
      pageTitle.textContent = 'Talabalar Reytingi';
      pageDesc.textContent = 'Mavsumiy va umumiy o\'rinlar jadvali, filtrlar';
      renderObserveRating(contentArea);
      break;
    case 'observe-students':
      pageTitle.textContent = 'Talabalar Katalogi';
      pageDesc.textContent = 'Universitetdagi barcha faol talabalar va shaxsiy profillar';
      renderObserveStudents(contentArea);
      break;
    case 'observe-events':
      pageTitle.textContent = 'Tadbirlar & QR Kodlar';
      pageDesc.textContent = 'Universitet miqyosidagi tadbirlar, ishtirokchilar va check-in';
      renderObserveEvents(contentArea);
      break;
    case 'observe-catalog':
      pageTitle.textContent = 'Ball Katalogi v1.0';
      pageDesc.textContent = 'Ball berish qoidalari, sohalar, shkala va limitlar';
      renderObserveCatalog(contentArea);
      break;
    case 'tutor-my-students':
      pageTitle.textContent = 'Mening Talabalarim';
      pageDesc.textContent = 'Tyutor guruhlaridagi talabalar faolligi va passivlik monitoringi';
      renderTutorStudents(contentArea);
      break;
    case 'tutor-add-points':
      pageTitle.textContent = 'Ball Kiritish';
      pageDesc.textContent = 'Talabalarga dalil asosida ball kiritish (R-01, R-02, R-04)';
      renderTutorAddPoints(contentArea);
      break;
    case 'tutor-history':
      pageTitle.textContent = 'Kiritgan Yozuvlarim';
      pageDesc.textContent = 'Holatlar (kutilmoqda, tasdiqlandi, rad etildi) va qayta topshirish';
      renderTutorHistory(contentArea);
      break;
    case 'dept-approvals':
      pageTitle.textContent = 'Tasdiq Navbati (Approval Queue)';
      pageDesc.textContent = 'Bo\'lim arizalarini tekshirish, tasdiqlash yoki rad etish (B-01)';
      renderDeptApprovals(contentArea);
      break;
    case 'dept-events':
      pageTitle.textContent = 'Tadbir Yaratish & QR';
      pageDesc.textContent = 'Yangi tadbir e\'lon qilish va Check-in QR kodini chop etish (B-04)';
      renderDeptEvents(contentArea);
      break;
    case 'dept-students-manage':
      pageTitle.textContent = 'Talabalar Ro\'yxati & Import (Registrator)';
      pageDesc.textContent = 'Talabalarni ro\'yxatga olish, Excel import, yangi talaba qo\'shish va tahrirlash';
      renderStudentsManagement(contentArea, 'Registrator');
      break;
    case 'dept-gpa-import':
      pageTitle.textContent = 'GPA & Davomat Import';
      pageDesc.textContent = 'Semestr yakuni bo\'yicha avtomatik ballar importi (O\'quv bo\'limi)';
      renderGpaImport(contentArea);
      break;
    case 'admin-students-manage':
      pageTitle.textContent = 'Talabalar Boshqaruvi & Import (Superadmin)';
      pageDesc.textContent = 'Barcha talabalar bazasi, ommaviy Excel import, yangi talaba qo\'shish va tahrirlash';
      renderStudentsManagement(contentArea, 'Superadmin');
      break;
    case 'admin-users-manage':
      pageTitle.textContent = 'Xodimlar & Rollar Boshqaruvi (Superadmin Full Access)';
      pageDesc.textContent = 'Xodimlarni ro\'yxatdan o\'tkazish, ixtiyoriy rollarni biriktirish yoki olib tashlash';
      renderStaffUsersManagement(contentArea);
      break;
    case 'prorektor-queue':
      pageTitle.textContent = 'Prorektor Nazorati — 2-bosqich Tasdiq (PV)';
      pageDesc.textContent = '25+ ballik yutuqlar va -30 jarimalar bo\'yicha yakuniy qaror';
      renderProrektorQueue(contentArea);
      break;
    case 'prorektor-risks':
      pageTitle.textContent = 'Xavf & Konsentratsiya Indikatorlari';
      pageDesc.textContent = 'Tyutor konsentratsiyasi (>40%) va talaba bir manba (>70%) tahlili';
      renderProrektorRisks(contentArea);
      break;
    case 'prorektor-appeals':
      pageTitle.textContent = 'E\'tirozlar & Apellyatsiyalar';
      pageDesc.textContent = 'Talabalarning rad etilgan yozuvlar bo\'yicha shikoyatlari';
      renderProrektorAppeals(contentArea);
      break;
    case 'admin-catalog':
      pageTitle.textContent = 'Katalog Sozlamalari (Superadmin)';
      pageDesc.textContent = 'Katalog bandlarini o\'zgartirish va versiyalash (S-01, AT-21)';
      renderAdminCatalog(contentArea);
      break;
    case 'admin-audit':
      pageTitle.textContent = 'Tizim Audit Jurnali (X-05)';
      pageDesc.textContent = 'O\'zgarmas harakatlar tarixi: kim, qachon, nima qildi va IP manzili';
      renderAdminAudit(contentArea);
      break;
    default:
      contentArea.innerHTML = `<div class="card"><p>Sahifa topilmadi: ${pageName}</p></div>`;
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
          <div class="stat-icon" style="background:#EFF6FF; color:#2563EB;">👥</div>
          <div class="stat-data">
            <span class="stat-label">Jami Talabalar</span>
            <h3 class="stat-val">${m.total_students} nafar</h3>
            <span class="stat-sub">Faollik: <strong>${m.active_ratio}%</strong> (30+ ball)</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background:#FEF3C7; color:#D97706;">⚡</div>
          <div class="stat-data">
            <span class="stat-label">Mavsum Ballari</span>
            <h3 class="stat-val">${m.total_season_points.toLocaleString()}</h3>
            <span class="stat-sub">Tasdiqlanish: <strong>${m.approved_ratio}%</strong></span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background:#FEE2E2; color:#DC2626;">⏳</div>
          <div class="stat-data">
            <span class="stat-label">Kutilayotgan Tasdiq</span>
            <h3 class="stat-val">${m.pending_approvals} ta</h3>
            <span class="stat-sub text-danger">Kechikkan: <strong>${data.attention_required.late_approvals_count} ta</strong></span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background:#ECFDF5; color:#059669;">🎯</div>
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
              <span>⭐</span> HAFTANING YULDUZLARI (WEEKLY STARS)
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
            <h3>🏆 Top 10 — Bakalavriat</h3>
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
            <h3>📊 Sohalar Bo'yicha Taqsimot</h3>
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
            ⚠️ 3 ish kunidan oshib ketgan tasdiqlar: ${data.attention_required.late_approvals_count} ta
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
async function renderObserveStudents(container) {
  let html = `
    <div class="card mb-3">
      <div class="card-body">
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <input type="text" id="students-search" class="form-control" placeholder="Ism, familiya, guruh yoki telefon..." style="flex: 1; min-width: 250px;">
          <select id="students-passive-filter" class="form-control" style="width: auto;">
            <option value="">Barcha holatlar</option>
            <option value="1">Faqat passiv talabalar</option>
            <option value="0">Faol talabalar</option>
          </select>
          <button id="btn-students-search" class="btn btn-primary">Izlash</button>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Talaba</th>
                <th>Guruh</th>
                <th>Kurs & Yo'nalish</th>
                <th>Telefon</th>
                <th>Telegram</th>
                <th>Mavsum</th>
                <th style="text-align: right;">Amallar</th>
              </tr>
            </thead>
            <tbody id="students-table-body">
              <tr><td colspan="7" class="text-center p-4">Yuklanmoqda...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
  container.innerHTML = html;

  async function loadStudents() {
    const search = document.getElementById('students-search').value;
    const isPassive = document.getElementById('students-passive-filter').value;

    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (isPassive) params.append('is_passive', isPassive);

    const tbody = document.getElementById('students-table-body');
    try {
      const data = await apiFetch(`/api/observe/students?${params.toString()}`);
      if (!data.students || data.students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center p-4">Talabalar topilmadi</td></tr>';
        return;
      }

      tbody.innerHTML = data.students.map(s => `
        <tr>
          <td>
            <strong>${s.first_name} ${s.last_name}</strong>
            ${s.is_passive ? '<span class="badge badge-warning" style="margin-left: 6px;">14+ kun passiv</span>' : ''}
          </td>
          <td><span class="badge badge-light">${s.group_code}</span></td>
          <td>${s.course}-kurs • ${s.program_code}</td>
          <td>${s.phone || '-'}</td>
          <td>${s.telegram_user_id ? '<span class="text-success">✅ Ulangan</span>' : '<span class="text-muted">Ulanmagan</span>'}</td>
          <td><strong style="color: #2563EB;">${s.season || 0} ball</strong></td>
          <td style="text-align: right;">
            <button class="btn btn-outline btn-sm" onclick="showStudentModal('${s.id}')">Profil</button>
          </td>
        </tr>
      `).join('');
    } catch (e) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-danger p-4">${e.message}</td></tr>`;
    }
  }

  document.getElementById('btn-students-search').addEventListener('click', loadStudents);
  loadStudents();
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
                📍 <strong>Joy:</strong> ${ev.place} &nbsp;|&nbsp; 
                🏛️ <strong>Tashkilotchi:</strong> ${ev.organizer_unit}
              </p>
              <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 12px;">
                🕒 <strong>Boshlanish:</strong> ${new Date(ev.starts_at).toLocaleString('uz-UZ')}
              </p>
              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); padding-top: 12px;">
                <span style="font-size: 12px; color: var(--text-muted);">
                  Check-in: <strong>${ev.checkins_count || 0}</strong> nafar
                  ${ev.capacity ? `/ ${ev.capacity} ta o'rin` : ''}
                </span>
                <button class="btn btn-outline btn-sm" onclick="showEventQrModal('${ev.id}')">
                  📷 QR Kodni Ko'rish
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
// SAHIFA: BALL KATALOGI v1.0
// -------------------------------------------------------------
async function renderObserveCatalog(container) {
  try {
    const data = await apiFetch('/api/observe/catalog');
    const categories = data.categories || [];
    const items = data.items || [];
    const scale = data.scale || [];

    let html = `
      <!-- KATEGORIYALAR -->
      <div class="card mb-4">
        <div class="card-header">
          <h3>Sohalar (Kategoriyalar)</h3>
        </div>
        <div class="card-body p-0">
          <table class="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Soha Nomi</th>
                <th>Tasdiqlovchi Rol</th>
                <th>Rang</th>
              </tr>
            </thead>
            <tbody>
              ${categories.map(c => `
                <tr>
                  <td><strong>${c.id}</strong></td>
                  <td><span style="color: ${c.color}; font-weight: 700;">●</span> ${c.name}</td>
                  <td><span class="badge badge-light">${c.approver_role}</span></td>
                  <td><code>${c.color}</code></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- MUSOBAQA SHKALASI -->
      <div class="card mb-4">
        <div class="card-header">
          <h3>Musobaqalar va Tanlovlar Shkalasi (Matrix)</h3>
        </div>
        <div class="card-body p-0">
          <table class="table">
            <thead>
              <tr>
                <th>Daraja (Level)</th>
                <th>Ishtirok</th>
                <th>Sovrindor (2-3 o'rin)</th>
                <th>G'olib (1-o'rin)</th>
              </tr>
            </thead>
            <tbody>
              ${['universitet', 'viloyat', 'respublika', 'xalqaro'].map(lvl => {
                const isht = scale.find(s => s.level === lvl && s.role === 'ishtirok')?.points || 0;
                const sovr = scale.find(s => s.level === lvl && s.role === 'sovrindor')?.points || 0;
                const gol = scale.find(s => s.level === lvl && s.role === 'golib')?.points || 0;
                return `
                  <tr>
                    <td><strong>${lvl.toUpperCase()}</strong></td>
                    <td><span class="badge badge-light">${isht} ball (±20%: ${Math.round(isht*0.8)}-${Math.round(isht*1.2)})</span></td>
                    <td><span class="badge badge-warning">${sovr} ball (±20%: ${Math.round(sovr*0.8)}-${Math.round(sovr*1.2)})</span></td>
                    <td><span class="badge badge-success">${gol} ball (±20%: ${Math.round(gol*0.8)}-${Math.round(gol*1.2)})</span></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- KATALOG BANDLARI -->
      <div class="card">
        <div class="card-header">
          <h3>Katalog Bandlari Ro'yxati</h3>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Kategoriya</th>
                  <th>Band Nomi</th>
                  <th>Baza Balli</th>
                  <th>Turi</th>
                  <th>Dalil Talabi</th>
                  <th>Tasdiqlovchi</th>
                </tr>
              </thead>
              <tbody>
                ${items.map(it => `
                  <tr>
                    <td><code>${it.id}</code></td>
                    <td>${it.category_name}</td>
                    <td><strong>${it.name}</strong></td>
                    <td>
                      ${it.is_scale ? '<span class="badge badge-primary">Shkala bo\'yicha</span>' : 
                        (it.base_points !== null ? `<strong>${it.base_points} ball</strong>` : '-')}
                    </td>
                    <td>
                      ${it.is_auto ? '<span class="badge badge-light">Avtomatik</span>' : 
                        (it.is_scale ? '<span class="badge badge-warning">Musobaqa</span>' : '<span class="badge badge-light">Oddiy</span>')}
                    </td>
                    <td><small style="color: var(--text-muted);">${it.evidence_hint || 'Majburiy emas'}</small></td>
                    <td><span class="badge badge-light">${it.approver_role || '-'}</span></td>
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
          <div class="stat-icon" style="background:#EFF6FF; color:#2563EB;">👨‍🎓</div>
          <div class="stat-data">
            <span class="stat-label">Guruh Talabalari</span>
            <h3 class="stat-val">${summary.total_students} nafar</h3>
            <span class="stat-sub">Guruhlar: ${summary.groups.join(', ')}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background:#ECFDF5; color:#059669;">⚡</div>
          <div class="stat-data">
            <span class="stat-label">Faol Talabalar (30+)</span>
            <h3 class="stat-val">${summary.active_students} nafar</h3>
            <span class="stat-sub">Ulush: ${summary.active_ratio}%</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background:#FEF3C7; color:#D97706;">📝</div>
          <div class="stat-data">
            <span class="stat-label">Bugungi Limit (R-06)</span>
            <h3 class="stat-val">${summary.today_limit.used} / ${summary.today_limit.max}</h3>
            <span class="stat-sub">Qolgan ruxsat: <strong>${summary.today_limit.remaining} ta</strong></span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background:#FEE2E2; color:#DC2626;">💤</div>
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
          <button class="btn btn-primary btn-sm" onclick="navigateTo('tutor-add-points')">➕ Yangi Ball Kiritish</button>
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
              💾 Ball Yozuvini Yuborish (Tasdiqqa)
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

        alert(`✅ Muvaffaqiyatli saqlandi! Yaratilgan yozuvlar soni: ${res.created_entries.length}`);
        navigateTo('tutor-history');
      } catch (err) {
        alert(`❌ Xatolik: ${err.message}`);
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
          <p style="font-size: 16px; color: var(--text-muted);">🎉 Hozircha tasdiqlash uchun kutayotgan arizalar yo'q!</p>
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
                  📅 <strong>Sana:</strong> ${e.event_date} &nbsp;|&nbsp; 
                  📝 <strong>Izoh:</strong> ${e.note || 'Ko\'rsatilmagan'}
                </p>
                ${e.evidence_url ? `
                  <p style="font-size: 13px; margin-bottom: 12px;">
                    📎 <strong>Dalil:</strong> <a href="${e.evidence_url}" target="_blank" style="color: #2563EB; word-break: break-all;">${e.evidence_url}</a>
                  </p>
                ` : ''}

                <div style="display: flex; gap: 8px; justify-content: flex-end; border-top: 1px solid var(--border); padding-top: 12px;">
                  <button class="btn btn-outline text-danger btn-sm" onclick="showRejectModal('${e.id}')">
                    ❌ Rad Etish
                  </button>
                  <button class="btn btn-success btn-sm" onclick="approveEntryAction('${e.id}')">
                    ✅ Tasdiqlash
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
async function renderDeptEvents(container) {
  try {
    const catRes = await apiFetch('/api/observe/catalog');
    const categories = catRes.categories || [];

    let html = `
      <div class="card" style="max-width: 700px; margin: 0 auto;">
        <div class="card-header">
          <h3>Yangi Tadbir Yaratish & QR Chiqarish</h3>
        </div>
        <div class="card-body">
          <form id="dept-create-event-form">
            <div class="form-group mb-3">
              <label class="form-label">Tadbir Nomi:</label>
              <input type="text" id="ev-title" class="form-control" placeholder="Masalan: 'Startap Tanlovi 2026'" required>
            </div>

            <div class="grid grid-2 mb-3">
              <div class="form-group">
                <label class="form-label">Boshlanish vaqti:</label>
                <input type="datetime-local" id="ev-starts-at" class="form-control" required>
              </div>
              <div class="form-group">
                <label class="form-label">Tugash vaqti:</label>
                <input type="datetime-local" id="ev-ends-at" class="form-control" required>
              </div>
            </div>

            <div class="form-group mb-3">
              <label class="form-label">O'tkazilish joyi (Bino / Zal):</label>
              <input type="text" id="ev-place" class="form-control" placeholder="Bosh bino, 204-auditoriya" required>
            </div>

            <div class="grid grid-2 mb-3">
              <div class="form-group">
                <label class="form-label">Soha / Kategoriya:</label>
                <select id="ev-cat-id" class="form-control" required>
                  ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Miqyos / Daraja (Ball avtomatik):</label>
                <select id="ev-level" class="form-control" required>
                  <option value="klub">Klub miqyosida (3 ball)</option>
                  <option value="universitet" selected>Universitet miqyosida (5 ball)</option>
                  <option value="viloyat">Viloyat miqyosida (8 ball)</option>
                  <option value="respublika">Respublika miqyosida (15 ball)</option>
                  <option value="xalqaro">Xalqaro miqyosda (25 ball)</option>
                </select>
              </div>
            </div>

            <div class="grid grid-2 mb-4">
              <div class="form-group">
                <label class="form-label">Maksimal sig'im (o'rinlar):</label>
                <input type="number" id="ev-capacity" class="form-control" placeholder="Cheksiz bo'lsa bo'sh qoldiring">
              </div>
              <div class="form-group" style="display: flex; align-items: center; padding-top: 24px;">
                <label style="cursor: pointer; font-size: 13px;">
                  <input type="checkbox" id="ev-req-reg"> Oldindan ro'yxatdan o'tish majburiy
                </label>
              </div>
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%;">
              🎯 Tadbirni E'lon Qilish va QR Kod Yaratish
            </button>
          </form>
        </div>
      </div>
    `;
    container.innerHTML = html;

    document.getElementById('dept-create-event-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const payload = {
          title: document.getElementById('ev-title').value,
          starts_at: new Date(document.getElementById('ev-starts-at').value).toISOString(),
          ends_at: new Date(document.getElementById('ev-ends-at').value).toISOString(),
          place: document.getElementById('ev-place').value,
          organizer_unit: AppState.user.id,
          category_id: document.getElementById('ev-cat-id').value,
          level: document.getElementById('ev-level').value,
          capacity: document.getElementById('ev-capacity').value || null,
          requires_registration: document.getElementById('ev-req-reg').checked
        };

        const res = await apiFetch('/api/events', {
          method: 'POST',
          body: JSON.stringify(payload)
        });

        alert(`✅ Tadbir e'lon qilindi! Ball: ${res.points}`);
        showEventQrModal(res.event_id);
      } catch (err) {
        alert(err.message);
      }
    });
  } catch (err) {
    container.innerHTML = `<div class="card"><p class="text-danger">${err.message}</p></div>`;
  }
}

// -------------------------------------------------------------
// SAHIFA: GPA & DAVOMAT IMPORT (REGISTRATOR)
// -------------------------------------------------------------
async function renderGpaImport(container) {
  let html = `
    <div class="grid grid-2">
      <!-- GPA TOP 20% -->
      <div class="card">
        <div class="card-header">
          <h3>📊 GPA Top 20% Talabalar Importi</h3>
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
            📥 GPA Ma'lumotlarini Qayta Ishlash
          </button>
        </div>
      </div>

      <!-- 100% DAVOMAT -->
      <div class="card">
        <div class="card-header">
          <h3>🕒 100% Namumali Davomat Importi</h3>
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
            📥 Davomat Ma'lumotlarini Qayta Ishlash
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
      alert(`✅ Muvaffaqiyatli import qilindi! Yangilanganlar: ${data.created}`);
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
      alert(`✅ Muvaffaqiyatli import qilindi! Yangilanganlar: ${data.created}`);
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
                  📅 <strong>Sana:</strong> ${e.event_date} &nbsp;|&nbsp; 
                  📝 <strong>Izoh:</strong> ${e.note || 'Ko\'rsatilmagan'}
                </p>
                ${e.evidence_url ? `
                  <p style="font-size: 13px; margin-bottom: 12px;">
                    📎 <strong>Dalil:</strong> <a href="${e.evidence_url}" target="_blank" style="color: #2563EB;">${e.evidence_url}</a>
                  </p>
                ` : ''}

                <div style="display: flex; gap: 8px; justify-content: flex-end; border-top: 1px solid var(--border); padding-top: 12px;">
                  <button class="btn btn-outline text-danger btn-sm" onclick="showRejectModal('${e.id}')">
                    ❌ Rad Etish
                  </button>
                  <button class="btn btn-primary btn-sm" onclick="approveEntryAction('${e.id}')">
                    ⚖️ Yakuniy Tasdiq (PV)
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
              <p class="text-success" style="font-size: 13px;">✅ Tyutorlar bo'yicha og'ishlar aniqlanmadi.</p>
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
              <p class="text-success" style="font-size: 13px;">✅ Bir manbaga bog'lanib qolgan talabalar yo'q.</p>
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
                  💬 <em>"${a.text}"</em>
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
// SAHIFA: SUPERADMIN KATALOG SOZLAMALARI
// -------------------------------------------------------------
async function renderAdminCatalog(container) {
  try {
    const data = await apiFetch('/api/admin/catalog');
    const items = data.items || [];

    let html = `
      <div class="card">
        <div class="card-header">
          <h3>Katalog Bandlarini Versiyalash va Boshqarish (S-01, AT-21)</h3>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nomi</th>
                  <th>Baza Balli</th>
                  <th>Versiya</th>
                  <th>Tasdiqlovchi Rol</th>
                  <th style="text-align: right;">Tahrirlash</th>
                </tr>
              </thead>
              <tbody>
                ${items.map(it => `
                  <tr>
                    <td><code>${it.id}</code></td>
                    <td><strong>${it.name}</strong></td>
                    <td>${it.base_points !== null ? it.base_points : 'Shkala'}</td>
                    <td><span class="badge badge-light">v${it.version_from}</span></td>
                    <td>${it.approver_role || '-'}</td>
                    <td style="text-align: right;">
                      <button class="btn btn-outline btn-sm" onclick="editCatalogItemModal('${it.id}', '${it.name.replace(/'/g, "\\'")}', ${it.base_points})">
                        Tahrirlash
                      </button>
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

function editCatalogItemModal(id, currentName, currentPoints) {
  const modalBody = document.getElementById('modal-body');
  const modalTitle = document.getElementById('modal-title');
  const modalFooter = document.getElementById('modal-footer');

  modalTitle.textContent = `Bandni Tahrirlash: ${id}`;
  modalBody.innerHTML = `
    <div class="form-group mb-3">
      <label class="form-label">Band Nomi:</label>
      <input type="text" id="edit-cat-name" class="form-control" value="${currentName}">
    </div>
    <div class="form-group">
      <label class="form-label">Baza Balli:</label>
      <input type="number" id="edit-cat-points" class="form-control" value="${currentPoints || 0}">
    </div>
  `;

  modalFooter.innerHTML = `
    <button class="btn btn-outline" onclick="closeModal()">Bekor qilish</button>
    <button class="btn btn-primary" onclick="saveCatalogItem('${id}')">Yangi Versiya Saqlash</button>
  `;

  openModal();
}

async function saveCatalogItem(id) {
  const name = document.getElementById('edit-cat-name').value;
  const base_points = Number(document.getElementById('edit-cat-points').value);

  try {
    const res = await apiFetch(`/api/admin/catalog/item/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, base_points })
    });
    closeModal();
    alert(res.message);
    navigateTo('admin-catalog');
  } catch (e) {
    alert(e.message);
  }
}

// -------------------------------------------------------------
// SAHIFA: AUDIT JURNALI (X-05)
// -------------------------------------------------------------
async function renderAdminAudit(container) {
  try {
    const data = await apiFetch('/api/admin/audit?limit=50');
    const logs = data.logs || [];

    let html = `
      <div class="card">
        <div class="card-header">
          <h3>Tizim Harakatlari Jurnali (Audit Log - X-05)</h3>
          <span style="font-size: 12px; color: var(--text-muted);">O'zgartirib bo'lmas to'liq xronologiya</span>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Vaqt</th>
                  <th>Foydalanuvchi</th>
                  <th>Harakat</th>
                  <th>Obyekt</th>
                  <th>IP Manzil</th>
                </tr>
              </thead>
              <tbody>
                ${logs.map(l => `
                  <tr>
                    <td><small>${new Date(l.at).toLocaleString('uz-UZ')}</small></td>
                    <td><strong>${l.actor_name || l.actor_id}</strong> (${l.actor_role})</td>
                    <td><span class="badge badge-light">${l.action}</span></td>
                    <td><code>${l.object_type}:${l.object_id}</code></td>
                    <td><small style="color: var(--text-muted);">${l.ip}</small></td>
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
// MODALLAR VA YORDAMCHI FUNKSIYALAR
// -------------------------------------------------------------
function initModals() {
  const modal = document.getElementById('common-modal');
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

function openModal() {
  document.getElementById('common-modal').classList.add('active');
}

function closeModal() {
  document.getElementById('common-modal').classList.remove('active');
}

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

    modalTitle.textContent = `${st.first_name} ${st.last_name} (${st.group_code})`;
    modalBody.innerHTML = `
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
          <p><strong>Telegram:</strong> ${st.telegram_user_id ? '✅ Bog\'langan' : '❌ Bog\'lanmagan'}</p>
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
    modalBody.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <h3 style="margin-bottom: 8px;">${res.title}</h3>
        <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 16px;">
          Talabalar ushbu QR kodni Telegram Mini App orqali skaner qilib ball oladilar (+${res.points} ball)
        </p>
        <div style="background: white; padding: 16px; display: inline-block; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
          <img src="${res.qr_data_url}" alt="QR Kod" style="width: 250px; height: 250px; display: block;">
        </div>
      </div>
    `;
    modalFooter.innerHTML = `
      <a href="${res.qr_data_url}" download="tadbir_qr_${eventId}.png" class="btn btn-primary">Yuklab Olish</a>
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

async function renderStudentsManagement(container, roleTitle = 'Registrator') {
  container.innerHTML = `
    <!-- YUQORI SOHAVIY BLOK -->
    <div class="card mb-4" style="background: linear-gradient(135deg, #1E293B, #0F172A); color: white; border: none;">
      <div class="card-body" style="padding: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <div>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
              <span style="font-size: 24px;">🎓</span>
              <h2 style="font-size: 20px; font-weight: 700; color: #fff;">Talabalar Ro'yxati & Boshqaruvi (${roleTitle})</h2>
              <span class="badge" style="background: rgba(59, 130, 246, 0.2); color: #60A5FA; border: 1px solid #3B82F6;">1-bosqich Integratsiya</span>
            </div>
            <p style="color: #94A3B8; font-size: 13px; max-width: 700px; margin: 0;">
              Universitet talabalarining yagona manbasi (Registrator). Kunlik yoki davriy Excel/CSV import orqali bazani yangilang, 
              yangi talabalarni qo'lda kiriting yoki holatini boshqaring.
            </p>
          </div>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <a href="/api/admin/students/template" download="talabalar_import_shablon.xlsx" class="btn btn-outline" style="color: #F8FAFC; border-color: rgba(255,255,255,0.25); display: flex; align-items: center; gap: 6px;">
              <span>📥</span> Excel Shablon Yuklab Olish
            </a>
            <button class="btn btn-primary" onclick="toggleImportPanel()" style="display: flex; align-items: center; gap: 6px;">
              <span>📊</span> Excel / CSV Import
            </button>
            <button class="btn btn-success" onclick="showCreateStudentModal()" style="display: flex; align-items: center; gap: 6px; background: #10B981; border-color: #10B981;">
              <span>➕</span> Yangi Talaba Qo'shish
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- EXCEL IMPORT PANEL (YASHIRIN / OCHILADI) -->
    <div id="student-import-panel" class="card mb-4" style="display: none; border: 2px dashed #3B82F6; background: #F8FAFC;">
      <div class="card-header" style="background: #EFF6FF; border-bottom: 1px solid #DBEAFE;">
        <h3 style="font-size: 15px; color: #1E3A8A; font-weight: 600; display: flex; align-items: center; gap: 8px;">
          <span>📤</span> Talabalar Ro'yxatini Ommaviy Import Qilish (.xlsx / .csv)
        </h3>
        <button class="btn btn-outline" style="padding: 4px 10px; font-size: 12px;" onclick="toggleImportPanel()">Yopish</button>
      </div>
      <div class="card-body">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start;">
          <div>
            <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 12px;">
              Fayldagi ustunlar tartibi yoki sarlavhalari quyidagicha bo'lishi mumkin:
            </p>
            <ul style="font-size: 12px; color: var(--text-muted); padding-left: 20px; line-height: 1.8;">
              <li><strong>external_id / id:</strong> Talaba ID kodi (masalan, STD-0012)</li>
              <li><strong>familiya, ism:</strong> Talabaning to'liq familiyasi va ismi</li>
              <li><strong>guruh / group_code:</strong> Guruh kodi (masalan, 210-21)</li>
              <li><strong>yo'nalish / fakultet:</strong> Ta'lim yo'nalishi yoki fakultet</li>
              <li><strong>kurs:</strong> Bosqich (1, 2, 3, 4)</li>
              <li><strong>jins:</strong> Erkak / Ayol (M / F)</li>
              <li><strong>telefon, email:</strong> Shaxsiy aloqa ma'lumotlari</li>
              <li><strong>holat:</strong> active (faol) yoki left (chiqarilgan)</li>
            </ul>
            <div style="margin-top: 12px; font-size: 12px; color: #2563EB;">
              💡 <em>Eslatma: Mavjud talabalar ID bo'yicha yangilanadi, yangilari esa qo'shiladi va boshlang'ich 0 ball beriladi.</em>
            </div>
          </div>

          <div style="background: white; padding: 20px; border-radius: var(--radius-md); border: 1px solid var(--border);">
            <div class="form-group mb-3">
              <label class="form-label" style="font-weight: 600;">Excel / CSV faylini tanlang:</label>
              <input type="file" id="import-file-input" accept=".xlsx,.xls,.csv" class="form-control" style="padding: 8px;">
            </div>
            <button id="btn-do-import" class="btn btn-primary w-100" onclick="handleStudentExcelUpload()" style="display: flex; justify-content: center; align-items: center; gap: 8px;">
              <span>🚀</span> Importni Boshlash
            </button>
            <div id="import-result-box" style="margin-top: 14px; display: none;"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- METRIKA KARTALARI -->
    <div id="students-metrics-cards" class="metrics-grid mb-4">
      <div class="stat-card">
        <div class="stat-icon" style="background:#EFF6FF; color:#2563EB;">👥</div>
        <div class="stat-data">
          <span class="stat-label">Jami Ro'yxatdagi</span>
          <h3 class="stat-val" id="stat-total-students">-</h3>
          <span class="stat-sub">Barcha talabalar</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#ECFDF5; color:#059669;">✅</div>
        <div class="stat-data">
          <span class="stat-label">Faol Talabalar</span>
          <h3 class="stat-val" id="stat-active-students">-</h3>
          <span class="stat-sub">Reytingda ishtirok etadi</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#FEF2F2; color:#DC2626;">🚫</div>
        <div class="stat-data">
          <span class="stat-label">Chiqarilganlar (Left)</span>
          <h3 class="stat-val" id="stat-left-students">-</h3>
          <span class="stat-sub">Ballari saqlanadi</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#FEF3C7; color:#D97706;">🏫</div>
        <div class="stat-data">
          <span class="stat-label">Guruhlar Soni</span>
          <h3 class="stat-val" id="stat-total-groups">-</h3>
          <span class="stat-sub">Akademik guruhlar</span>
        </div>
      </div>
    </div>

    <!-- FILTRLAR VA JADVAL -->
    <div class="card">
      <div class="card-header" style="flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; gap: 10px; align-items: center; flex: 1; min-width: 280px;">
          <input type="text" id="filter-student-search" class="form-control" placeholder="Qidirish: ism, familiya, ID kod..." style="max-width: 300px;">
          <input type="text" id="filter-student-group" class="form-control" placeholder="Guruh (masalan: 210-21)" style="max-width: 160px;">
          <select id="filter-student-status" class="form-control" style="max-width: 150px;">
            <option value="">Barcha holatlar</option>
            <option value="active">Faqat Faol</option>
            <option value="left">Chiqarilgan (Left)</option>
          </select>
          <button class="btn btn-primary" onclick="applyStudentsFilter()">Filtrlash</button>
          <button class="btn btn-outline" onclick="resetStudentsFilter()">Tozalash</button>
        </div>
        <div id="students-pagination-info" style="font-size: 13px; color: var(--text-muted);">
          Yuklanmoqda...
        </div>
      </div>

      <div class="card-body" style="padding: 0;">
        <div class="table-container">
          <table class="data-table" id="students-data-table">
            <thead>
              <tr>
                <th style="width: 110px;">ID Kod</th>
                <th>Talaba F.I.Sh</th>
                <th>Guruh</th>
                <th>Fakultet / Kurs</th>
                <th>Aloqa (Tel / Email)</th>
                <th>Ball (Mavsum / Jami)</th>
                <th>Holat</th>
                <th style="text-align: right; width: 140px;">Amallar</th>
              </tr>
            </thead>
            <tbody id="students-table-body">
              <tr><td colspan="8" style="text-align:center; padding: 24px;">Talabalar yuklanmoqda...</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- PAGINATION BAR -->
      <div class="card-footer" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 20px;">
        <div style="font-size: 13px; color: var(--text-muted);" id="students-page-counter">
          Sahifa 1
        </div>
        <div style="display: flex; gap: 8px;">
          <button id="btn-prev-page" class="btn btn-outline" style="padding: 6px 14px;" onclick="changeStudentsPage(-1)" disabled>◀ Oldingi</button>
          <button id="btn-next-page" class="btn btn-outline" style="padding: 6px 14px;" onclick="changeStudentsPage(1)">Keyingi ▶</button>
        </div>
      </div>
    </div>
  `;

  // Qidiruv inputlariga Enter tinglovchisi
  document.getElementById('filter-student-search')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') applyStudentsFilter();
  });
  document.getElementById('filter-student-group')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') applyStudentsFilter();
  });

  await loadStudentsData();
}

function toggleImportPanel() {
  const panel = document.getElementById('student-import-panel');
  if (panel) {
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  }
}

async function loadStudentsData() {
  const tbody = document.getElementById('students-table-body');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 24px;"><div class="spinner"></div></td></tr>';

  try {
    const params = new URLSearchParams({
      page: StudentMgmtState.page,
      limit: StudentMgmtState.limit,
      q: StudentMgmtState.q,
      group: StudentMgmtState.group,
      status: StudentMgmtState.status
    });

    const res = await apiFetch(`/api/admin/students?${params.toString()}`);
    StudentMgmtState.totalPages = res.totalPages || 1;
    StudentMgmtState.totalStudents = res.total || 0;

    // Metrikalarni yangilash
    const statTotal = document.getElementById('stat-total-students');
    const statActive = document.getElementById('stat-active-students');
    const statLeft = document.getElementById('stat-left-students');
    const statGroups = document.getElementById('stat-total-groups');

    if (statTotal) statTotal.textContent = `${res.total} nafar`;
    
    // Guruhlar va statuslar hisobi
    const activeCount = res.students.filter(s => s.status === 'active').length;
    const leftCount = res.students.filter(s => s.status === 'left').length;
    const uniqueGroups = new Set(res.students.map(s => s.group_code)).size;

    if (statActive) statActive.textContent = `${activeCount}`;
    if (statLeft) statLeft.textContent = `${leftCount}`;
    if (statGroups) statGroups.textContent = `${uniqueGroups} ta`;

    // Pagination info
    const infoEl = document.getElementById('students-pagination-info');
    const counterEl = document.getElementById('students-page-counter');
    const prevBtn = document.getElementById('btn-prev-page');
    const nextBtn = document.getElementById('btn-next-page');

    if (infoEl) infoEl.textContent = `Jami: ${res.total} ta talaba (${res.page}-sahifa / ${res.totalPages})`;
    if (counterEl) counterEl.textContent = `Sahifa ${res.page} / ${res.totalPages}`;
    if (prevBtn) prevBtn.disabled = res.page <= 1;
    if (nextBtn) nextBtn.disabled = res.page >= res.totalPages;

    if (!res.students || res.students.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 24px; color: var(--text-muted);">Talabalar topilmadi</td></tr>';
      return;
    }

    tbody.innerHTML = res.students.map(st => `
      <tr>
        <td>
          <code style="background: #F1F5F9; padding: 2px 6px; border-radius: 4px; font-weight: 600; color: #1E293B;">
            ${st.external_id || st.id.slice(0, 8)}
          </code>
        </td>
        <td>
          <div style="font-weight: 600; color: var(--text-main);">${st.last_name || ''} ${st.first_name || ''}</div>
          <small style="color: var(--text-muted);">${st.gender === 'female' ? '👩 Qiz' : '👨 O\'g\'il'}</small>
        </td>
        <td>
          <span class="badge" style="background: #EFF6FF; color: #1D4ED8; font-weight: 600;">${st.group_code}</span>
        </td>
        <td>
          <div style="font-size: 13px;">${st.faculty || '—'}</div>
          <small style="color: var(--text-muted);">${st.course ? st.course + '-kurs' : ''}</small>
        </td>
        <td>
          <div style="font-size: 12px;">${st.phone || '—'}</div>
          <div style="font-size: 11px; color: var(--text-muted);">${st.email || '—'}</div>
        </td>
        <td>
          <strong style="color: #2563EB;">${st.season_points || 0}</strong>
          <span style="color: var(--text-muted); font-size: 12px;"> / ${st.total_points || 0}</span>
        </td>
        <td>
          ${st.status === 'active' 
            ? '<span class="status-badge" style="background:#ECFDF5; color:#059669; border: 1px solid #10B981;">Faol</span>'
            : '<span class="status-badge" style="background:#FEF2F2; color:#DC2626; border: 1px solid #EF4444;">Left</span>'
          }
        </td>
        <td style="text-align: right;">
          <div style="display: flex; gap: 6px; justify-content: flex-end;">
            <button class="btn btn-outline" style="padding: 4px 8px; font-size: 12px;" title="Tahrirlash" onclick="showEditStudentModal('${st.id}')">
              ✏️
            </button>
            <button class="btn btn-outline" style="padding: 4px 8px; font-size: 12px; color: ${st.status === 'active' ? '#DC2626' : '#059669'};" 
                    title="${st.status === 'active' ? 'Left qilish' : 'Faollashtirish'}"
                    onclick="toggleStudentStatus('${st.id}', '${st.status}')">
              ${st.status === 'active' ? '🚫' : '✅'}
            </button>
            <button class="btn btn-outline" style="padding: 4px 8px; font-size: 12px;" title="Batafsil profil" onclick="showStudentModal('${st.id}')">
              👁️
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-danger" style="text-align:center; padding: 20px;">Xatolik: ${err.message}</td></tr>`;
  }
}

function applyStudentsFilter() {
  StudentMgmtState.q = document.getElementById('filter-student-search')?.value.trim() || '';
  StudentMgmtState.group = document.getElementById('filter-student-group')?.value.trim() || '';
  StudentMgmtState.status = document.getElementById('filter-student-status')?.value || '';
  StudentMgmtState.page = 1;
  loadStudentsData();
}

function resetStudentsFilter() {
  if (document.getElementById('filter-student-search')) document.getElementById('filter-student-search').value = '';
  if (document.getElementById('filter-student-group')) document.getElementById('filter-student-group').value = '';
  if (document.getElementById('filter-student-status')) document.getElementById('filter-student-status').value = '';
  StudentMgmtState.q = '';
  StudentMgmtState.group = '';
  StudentMgmtState.status = '';
  StudentMgmtState.page = 1;
  loadStudentsData();
}

function changeStudentsPage(delta) {
  const newPage = StudentMgmtState.page + delta;
  if (newPage >= 1 && newPage <= StudentMgmtState.totalPages) {
    StudentMgmtState.page = newPage;
    loadStudentsData();
  }
}

async function handleStudentExcelUpload() {
  const fileInput = document.getElementById('import-file-input');
  const resultBox = document.getElementById('import-result-box');
  const btn = document.getElementById('btn-do-import');

  if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
    alert('Iltimos, avval Excel (.xlsx / .csv) faylini tanlang!');
    return;
  }

  const file = fileInput.files[0];
  const formData = new FormData();
  formData.append('file', file);

  btn.disabled = true;
  btn.innerHTML = '<div class="spinner" style="width:16px;height:16px;border-width:2px;display:inline-block;"></div> Import qilinmoqda...';
  if (resultBox) {
    resultBox.style.display = 'block';
    resultBox.innerHTML = '<p style="color: #2563EB;">Fayl o\'qilmoqda va bazaga yozilmoqda...</p>';
  }

  try {
    const res = await fetch('/api/admin/import/students', {
      method: 'POST',
      headers: { 'x-user-id': AppState.user.id },
      body: formData
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Import xatosi');

    resultBox.innerHTML = `
      <div style="background: #ECFDF5; border: 1px solid #10B981; padding: 12px; border-radius: var(--radius-md); font-size: 13px;">
        <h4 style="color: #065F46; margin-bottom: 6px; font-weight: 700;">✅ ${data.message}</h4>
        <ul style="color: #047857; margin: 0; padding-left: 18px;">
          <li>Fayldagi jami qatorlar: <strong>${data.total} ta</strong></li>
          <li>Yangi qo'shilgan talabalar: <strong>${data.inserted} ta</strong></li>
          <li>Yangilangan talabalar: <strong>${data.updated} ta</strong></li>
          <li>Chiqarilgan (left) talabalar: <strong>${data.left} ta</strong></li>
          <li>O'tkazib yuborilgan: <strong>${data.skipped} ta</strong></li>
        </ul>
        ${data.errors && data.errors.length > 0 ? `
          <div style="margin-top: 8px; color: #DC2626;">
            <strong>Xatoliklar (${data.errors.length}):</strong>
            <div style="max-height: 80px; overflow-y: auto; font-size: 11px; margin-top: 4px;">
              ${data.errors.map(e => `<div>${e}</div>`).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;

    fileInput.value = '';
    await loadStudentsData();
  } catch (err) {
    if (resultBox) {
      resultBox.innerHTML = `
        <div style="background: #FEF2F2; border: 1px solid #EF4444; padding: 12px; border-radius: var(--radius-md); font-size: 13px; color: #991B1B;">
          <strong>❌ Xatolik yuz berdi:</strong> ${err.message}
        </div>
      `;
    }
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<span>🚀</span> Importni Boshlash';
  }
}

async function toggleStudentStatus(studentId, currentStatus) {
  const newStatus = currentStatus === 'active' ? 'left' : 'active';
  const confirmMsg = newStatus === 'left' 
    ? 'Talabani "Left" (o\'qishdan ketgan/chiqarilgan) holatiga o\'tkazmoqchimisiz? Uning ballari saqlanadi, lekin ommaviy reytingda ko\'rinmaydi.'
    : 'Talabani qayta "Faol" holatiga o\'tkazmoqchimisiz?';

  if (!confirm(confirmMsg)) return;

  try {
    await apiFetch(`/api/admin/students/${studentId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status: newStatus })
    });
    alert('Talaba holati muvaffaqiyatli o\'zgartirildi');
    await loadStudentsData();
  } catch (err) {
    alert(err.message);
  }
}

function showCreateStudentModal() {
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalFooter = document.getElementById('modal-footer');

  modalTitle.textContent = 'Yangi Talaba Qo\'shish (Registrator / Superadmin)';
  modalBody.innerHTML = `
    <form id="create-student-form">
      <div class="grid grid-2 mb-3">
        <div class="form-group">
          <label class="form-label">ID Kod (external_id) *:</label>
          <input type="text" id="new-stud-id" class="form-control" placeholder="Masalan: STD-2026-001" required>
        </div>
        <div class="form-group">
          <label class="form-label">Guruh kodi *:</label>
          <input type="text" id="new-stud-group" class="form-control" placeholder="Masalan: 210-21" required>
        </div>
      </div>

      <div class="grid grid-2 mb-3">
        <div class="form-group">
          <label class="form-label">Ismi *:</label>
          <input type="text" id="new-stud-first-name" class="form-control" placeholder="Ism" required>
        </div>
        <div class="form-group">
          <label class="form-label">Familiyasi *:</label>
          <input type="text" id="new-stud-last-name" class="form-control" placeholder="Familiya" required>
        </div>
      </div>

      <div class="grid grid-3 mb-3">
        <div class="form-group">
          <label class="form-label">Fakultet / Yo'nalish:</label>
          <input type="text" id="new-stud-faculty" class="form-control" placeholder="Dasturiy injiniring">
        </div>
        <div class="form-group">
          <label class="form-label">Kurs (bosqich):</label>
          <select id="new-stud-course" class="form-control">
            <option value="1">1-kurs</option>
            <option value="2">2-kurs</option>
            <option value="3">3-kurs</option>
            <option value="4">4-kurs</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Jinsi:</label>
          <select id="new-stud-gender" class="form-control">
            <option value="male">Erkak (Yigit)</option>
            <option value="female">Ayol (Qiz)</option>
          </select>
        </div>
      </div>

      <div class="grid grid-2 mb-3">
        <div class="form-group">
          <label class="form-label">Telefon raqami:</label>
          <input type="tel" id="new-stud-phone" class="form-control" placeholder="+998901234567">
        </div>
        <div class="form-group">
          <label class="form-label">Email manzili:</label>
          <input type="email" id="new-stud-email" class="form-control" placeholder="talaba@akhu.uz">
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Boshlang'ich holat:</label>
        <select id="new-stud-status" class="form-control">
          <option value="active">Faol (Active - Reytingda qatnashadi)</option>
          <option value="left">Chiqarilgan (Left - Reytingda ko'rinmaydi)</option>
        </select>
      </div>
    </form>
  `;

  modalFooter.innerHTML = `
    <button class="btn btn-outline" onclick="closeModal()">Bekor qilish</button>
    <button class="btn btn-primary" onclick="submitCreateStudent()">Saqlash</button>
  `;

  openModal();
}

async function submitCreateStudent() {
  const external_id = document.getElementById('new-stud-id')?.value.trim();
  const group_code = document.getElementById('new-stud-group')?.value.trim();
  const first_name = document.getElementById('new-stud-first-name')?.value.trim();
  const last_name = document.getElementById('new-stud-last-name')?.value.trim();
  const faculty = document.getElementById('new-stud-faculty')?.value.trim();
  const course = Number(document.getElementById('new-stud-course')?.value) || 1;
  const gender = document.getElementById('new-stud-gender')?.value || 'male';
  const phone = document.getElementById('new-stud-phone')?.value.trim();
  const email = document.getElementById('new-stud-email')?.value.trim();
  const status = document.getElementById('new-stud-status')?.value || 'active';

  if (!external_id || !first_name || !last_name || !group_code) {
    alert('Iltimos, barcha majburiy maydonlarni (ID, Guruh, Ism, Familiya) to\'ldiring!');
    return;
  }

  try {
    await apiFetch('/api/admin/students', {
      method: 'POST',
      body: JSON.stringify({
        external_id, group_code, first_name, last_name,
        faculty, course, gender, phone, email, status
      })
    });

    closeModal();
    alert('Talaba muvaffaqiyatli qo\'shildi!');
    await loadStudentsData();
  } catch (err) {
    alert(err.message);
  }
}

async function showEditStudentModal(studentId) {
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalFooter = document.getElementById('modal-footer');

  modalTitle.textContent = 'Talaba Ma\'lumotlarini Tahrirlash';
  modalBody.innerHTML = '<div class="spinner"></div>';
  modalFooter.innerHTML = '<button class="btn btn-outline" onclick="closeModal()">Yopish</button>';
  openModal();

  try {
    const data = await apiFetch(`/api/observe/students/${studentId}`);
    const st = data.student;

    modalBody.innerHTML = `
      <form id="edit-student-form">
        <div class="grid grid-2 mb-3">
          <div class="form-group">
            <label class="form-label">ID Kod (external_id):</label>
            <input type="text" id="edit-stud-id" class="form-control" value="${st.external_id || ''}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Guruh kodi:</label>
            <input type="text" id="edit-stud-group" class="form-control" value="${st.group_code || ''}" required>
          </div>
        </div>

        <div class="grid grid-2 mb-3">
          <div class="form-group">
            <label class="form-label">Ismi:</label>
            <input type="text" id="edit-stud-first-name" class="form-control" value="${st.first_name || ''}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Familiyasi:</label>
            <input type="text" id="edit-stud-last-name" class="form-control" value="${st.last_name || ''}" required>
          </div>
        </div>

        <div class="grid grid-3 mb-3">
          <div class="form-group">
            <label class="form-label">Fakultet / Yo'nalish:</label>
            <input type="text" id="edit-stud-faculty" class="form-control" value="${st.faculty || ''}">
          </div>
          <div class="form-group">
            <label class="form-label">Kurs:</label>
            <select id="edit-stud-course" class="form-control">
              <option value="1" ${st.course === 1 ? 'selected' : ''}>1-kurs</option>
              <option value="2" ${st.course === 2 ? 'selected' : ''}>2-kurs</option>
              <option value="3" ${st.course === 3 ? 'selected' : ''}>3-kurs</option>
              <option value="4" ${st.course === 4 ? 'selected' : ''}>4-kurs</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Jinsi:</label>
            <select id="edit-stud-gender" class="form-control">
              <option value="male" ${st.gender === 'male' ? 'selected' : ''}>Erkak</option>
              <option value="female" ${st.gender === 'female' ? 'selected' : ''}>Ayol</option>
            </select>
          </div>
        </div>

        <div class="grid grid-2 mb-3">
          <div class="form-group">
            <label class="form-label">Telefon:</label>
            <input type="tel" id="edit-stud-phone" class="form-control" value="${st.phone || ''}">
          </div>
          <div class="form-group">
            <label class="form-label">Email:</label>
            <input type="email" id="edit-stud-email" class="form-control" value="${st.email || ''}">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Holat:</label>
          <select id="edit-stud-status" class="form-control">
            <option value="active" ${st.status === 'active' ? 'selected' : ''}>Faol (Active)</option>
            <option value="left" ${st.status === 'left' ? 'selected' : ''}>Chiqarilgan (Left)</option>
          </select>
        </div>
      </form>
    `;

    modalFooter.innerHTML = `
      <button class="btn btn-outline" onclick="closeModal()">Bekor qilish</button>
      <button class="btn btn-primary" onclick="submitEditStudent('${studentId}')">O'zgarishlarni Saqlash</button>
    `;
  } catch (err) {
    modalBody.innerHTML = `<p class="text-danger">${err.message}</p>`;
  }
}

async function submitEditStudent(studentId) {
  const external_id = document.getElementById('edit-stud-id')?.value.trim();
  const group_code = document.getElementById('edit-stud-group')?.value.trim();
  const first_name = document.getElementById('edit-stud-first-name')?.value.trim();
  const last_name = document.getElementById('edit-stud-last-name')?.value.trim();
  const faculty = document.getElementById('edit-stud-faculty')?.value.trim();
  const course = Number(document.getElementById('edit-stud-course')?.value) || 1;
  const gender = document.getElementById('edit-stud-gender')?.value || 'male';
  const phone = document.getElementById('edit-stud-phone')?.value.trim();
  const email = document.getElementById('edit-stud-email')?.value.trim();
  const status = document.getElementById('edit-stud-status')?.value || 'active';

  try {
    await apiFetch(`/api/admin/students/${studentId}`, {
      method: 'PUT',
      body: JSON.stringify({
        external_id, group_code, first_name, last_name,
        faculty, course, gender, phone, email, status
      })
    });

    closeModal();
    alert('Talaba ma\'lumotlari yangilandi!');
    await loadStudentsData();
  } catch (err) {
    alert(err.message);
  }
}

// ====================================================================
// 9. XODIMLAR & TIZIM ROLLARI BOSHQARUVI (SUPERADMIN FULL ACCESS)
// ====================================================================

const ALL_ROLES_META = [
  { role: 'superadmin', name: 'Superadmin (Full Access)', color: '#DC2626', desc: 'Barcha tizim boshqaruvi, xodimlar va konfiguratsiya' },
  { role: 'dep_ob', name: 'O\'quv bo\'limi (Registrator)', color: '#2563EB', desc: 'Talabalar bazasi, Excel import, GPA va davomat nazorati' },
  { role: 'dep_yb', name: 'Yoshlar bilan ishlash bo\'limi', color: '#D97706', desc: 'Yoshlar siyosati, tadbirlar, arizalarni tasdiqlash' },
  { role: 'dep_mb', name: 'Ma\'naviyat va ma\'rifat bo\'limi', color: '#7C3AED', desc: 'Ma\'naviy tadbirlar, teatr, kitobxonlik tasdiqlari' },
  { role: 'dep_ib', name: 'Ilmiy tadqiqotlar bo\'limi', color: '#059669', desc: 'Maqolalar, patentlar, ilmiy yutuqlarni tasdiqlash' },
  { role: 'dep_sb', name: 'Sanoat bilan hamkorlik bo\'limi', color: '#0D9488', desc: 'Amaliyot, innovatsion loyihalar, sanoat sertifikatlari' },
  { role: 'dep_pb', name: 'Matbuot xizmati (PR)', color: '#DB2777', desc: 'Ijtimoiy tarmoqlar, media-kontent, universitet imiji' },
  { role: 'prorektor', name: 'Yoshlar bo\'yicha Prorektor', color: '#4F46E5', desc: '2-bosqich tasdiqlari (PV: 25+ ball, -30 jarimalar), xavf nazorati' },
  { role: 'tutor', name: 'Guruh Tyutori', color: '#10B981', desc: 'Guruh talabalariga dalil asosida ball kiritish' },
  { role: 'observer', name: 'Kuzatuvchi (Rektorat / Dekanat)', color: '#64748B', desc: 'Faqat statistikani kuzatish va hisobotlarni ko\'rish' }
];

async function renderStaffUsersManagement(container) {
  container.innerHTML = `
    <!-- HEADER -->
    <div class="card mb-4" style="background: linear-gradient(135deg, #1E1B4B, #0F172A); color: white; border: none;">
      <div class="card-body" style="padding: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <div>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
              <span style="font-size: 26px;">🛡️</span>
              <h2 style="font-size: 20px; font-weight: 700; color: #fff;">Xodimlar & Rollar Boshqaruvi (Superadmin Full Access)</h2>
              <span class="badge" style="background: rgba(220, 38, 38, 0.2); color: #F87171; border: 1px solid #EF4444;">To'liq Ruxsat</span>
            </div>
            <p style="color: #94A3B8; font-size: 13px; max-width: 750px; margin: 0;">
              Superadmin sifatida istalgan bo'lim xodimlarini tizimga kiritishingiz, ularga bir yoki bir nechta rollarni 
              (Tyutor, Registrator, Bo'limlar, Prorektor) biriktirishingiz yoki istalgan paytda olib tashlashingiz mumkin.
            </p>
          </div>
          <button class="btn btn-primary" onclick="showCreateStaffModal()" style="display: flex; align-items: center; gap: 8px; background: #2563EB; border-color: #2563EB; font-weight: 600;">
            <span>➕</span> Yangi Xodim Qo'shish
          </button>
        </div>
      </div>
    </div>

    <!-- ROLLAR SHIFRI VA TAVSIFI -->
    <div class="card mb-4">
      <div class="card-header" style="background: #F8FAFC; border-bottom: 1px solid var(--border);">
        <h3 style="font-size: 14px; color: var(--text-main); font-weight: 600; display: flex; align-items: center; gap: 8px;">
          <span>📋</span> Tizimdagi Mavjud Bo'limlar va Rollar Ro'yxati (10 ta rol)
        </h3>
      </div>
      <div class="card-body" style="padding: 16px;">
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 10px;">
          ${ALL_ROLES_META.map(r => `
            <div style="background: #F8FAFC; border-left: 3px solid ${r.color}; padding: 10px 12px; border-radius: var(--radius-sm);">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                <code style="font-size: 11px; font-weight: 700; color: ${r.color};">${r.role}</code>
                <span style="font-size: 11px; font-weight: 600; color: var(--text-main);">${r.name.split(' (')[0]}</span>
              </div>
              <div style="font-size: 11px; color: var(--text-muted); line-height: 1.3;">${r.desc}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- XODIMLAR JADVALI -->
    <div class="card">
      <div class="card-header" style="justify-content: space-between;">
        <h3 style="font-size: 15px; font-weight: 600;">Ro'yxatdan O'tgan Xodimlar</h3>
        <div id="staff-users-count" style="font-size: 13px; color: var(--text-muted);">Yuklanmoqda...</div>
      </div>
      <div class="card-body" style="padding: 0;">
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 140px;">Login / ID</th>
                <th>Xodim F.I.Sh</th>
                <th>Aloqa (Email / Tel)</th>
                <th>Telegram ID</th>
                <th>Biriktirilgan Rollar</th>
                <th>Tyutor Guruhlari</th>
                <th>Holat</th>
                <th style="text-align: right; width: 130px;">Amallar</th>
              </tr>
            </thead>
            <tbody id="staff-users-tbody">
              <tr><td colspan="8" style="text-align:center; padding: 24px;"><div class="spinner"></div></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  await loadStaffUsersList();
}

async function loadStaffUsersList() {
  const tbody = document.getElementById('staff-users-tbody');
  const countEl = document.getElementById('staff-users-count');
  if (!tbody) return;

  try {
    const res = await apiFetch('/api/admin/users');
    const users = res.users || [];

    if (countEl) countEl.textContent = `Jami xodimlar: ${users.length} nafar`;

    if (users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 24px;">Xodimlar mavjud emas</td></tr>';
      return;
    }

    tbody.innerHTML = users.map(u => {
      const roleBadges = (u.roles || []).map(r => {
        const meta = ALL_ROLES_META.find(m => m.role === r) || { name: r, color: '#64748B' };
        return `<span class="badge" style="background: ${meta.color}15; color: ${meta.color}; border: 1px solid ${meta.color}40; margin: 2px; font-size: 11px;">${r}</span>`;
      }).join(' ');

      const tutorGroups = (u.tutor_groups && u.tutor_groups.length > 0)
        ? u.tutor_groups.map(g => `<span class="badge" style="background:#EFF6FF; color:#1D4ED8; font-size: 11px;">${g}</span>`).join(' ')
        : '<span style="color: var(--text-muted); font-size: 11px;">—</span>';

      return `
        <tr>
          <td>
            <code style="font-weight: 700; color: #1E293B;">${u.username}</code>
          </td>
          <td>
            <div style="font-weight: 600; color: var(--text-main);">${u.full_name}</div>
          </td>
          <td>
            <div style="font-size: 12px;">${u.email || '—'}</div>
            <div style="font-size: 11px; color: var(--text-muted);">${u.phone || '—'}</div>
          </td>
          <td>
            ${u.telegram_id 
              ? `<code style="font-size: 12px; background: #E0F2FE; color: #0284C7; padding: 2px 6px; border-radius: 4px;">${u.telegram_id}</code>`
              : '<span style="color: var(--text-muted); font-size: 11px;">Ulanmagan</span>'
            }
          </td>
          <td>
            <div style="display: flex; flex-wrap: wrap; gap: 2px; max-width: 250px;">
              ${roleBadges || '<span style="color: var(--text-muted);">Rol belgilanmagan</span>'}
            </div>
          </td>
          <td>${tutorGroups}</td>
          <td>
            ${u.is_active 
              ? '<span class="status-badge" style="background:#ECFDF5; color:#059669; border: 1px solid #10B981;">Faol</span>'
              : '<span class="status-badge" style="background:#FEF2F2; color:#DC2626; border: 1px solid #EF4444;">Nofaol</span>'
            }
          </td>
          <td style="text-align: right;">
            <div style="display: flex; gap: 6px; justify-content: flex-end;">
              <button class="btn btn-outline" style="padding: 4px 8px; font-size: 12px;" title="Tahrirlash va Rollarni boshqarish" onclick="showEditStaffModal('${u.id}')">
                ✏️ Rollar
              </button>
              <button class="btn btn-outline" style="padding: 4px 8px; font-size: 12px; color: ${u.is_active ? '#DC2626' : '#059669'};" 
                      title="${u.is_active ? 'Nofaol qilish' : 'Faollashtirish'}"
                      onclick="toggleStaffStatus('${u.id}', ${u.is_active})">
                ${u.is_active ? '🚫' : '✅'}
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-danger" style="text-align:center; padding: 24px;">Xatolik: ${err.message}</td></tr>`;
  }
}

function showCreateStaffModal() {
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalFooter = document.getElementById('modal-footer');

  modalTitle.textContent = 'Yangi Xodim Qo\'shish & Rollar Biriktirish (Superadmin)';
  modalBody.innerHTML = `
    <form id="create-staff-form">
      <div class="grid grid-2 mb-3">
        <div class="form-group">
          <label class="form-label">Tizim Logini (username) *:</label>
          <input type="text" id="new-staff-username" class="form-control" placeholder="masalan: jasur_m yoki dep_math" required>
        </div>
        <div class="form-group">
          <label class="form-label">Parol *:</label>
          <input type="password" id="new-staff-password" class="form-control" placeholder="Kamida 6 belgi" required>
        </div>
      </div>

      <div class="form-group mb-3">
        <label class="form-label">Xodim F.I.Sh *:</label>
        <input type="text" id="new-staff-fullname" class="form-control" placeholder="To'liq ismi va familiyasi" required>
      </div>

      <div class="grid grid-3 mb-3">
        <div class="form-group">
          <label class="form-label">Email:</label>
          <input type="email" id="new-staff-email" class="form-control" placeholder="xodim@akhu.uz">
        </div>
        <div class="form-group">
          <label class="form-label">Telefon:</label>
          <input type="tel" id="new-staff-phone" class="form-control" placeholder="+998901234567">
        </div>
        <div class="form-group">
          <label class="form-label">Telegram Chat ID:</label>
          <input type="number" id="new-staff-tgid" class="form-control" placeholder="123456789">
        </div>
      </div>

      <div class="form-group mb-3">
        <label class="form-label" style="font-weight: 700; color: #1E3A8A; display: block; margin-bottom: 8px;">
          Biriktiriladigan Rollar (Ixtiyoriy kombinatsiya tanlanishi mumkin):
        </label>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; background: #F8FAFC; padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--border);">
          ${ALL_ROLES_META.map(r => `
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px;">
              <input type="checkbox" name="staff-roles-checkbox" value="${r.role}" onchange="checkTutorSelection('create')">
              <span style="font-weight: 600; color: ${r.color};">${r.role}</span>
              <span style="font-size: 11px; color: var(--text-muted);">- ${r.name.split(' (')[0]}</span>
            </label>
          `).join('')}
        </div>
      </div>

      <div id="create-tutor-group-box" class="form-group mb-3" style="display: none; background: #EFF6FF; padding: 12px; border-radius: var(--radius-md); border: 1px solid #BFDBFE;">
        <label class="form-label" style="color: #1E3A8A; font-weight: 600;">Tyutor Guruhlari (vergul bilan ajrating):</label>
        <input type="text" id="new-staff-tutor-groups" class="form-control" placeholder="Masalan: 210-21, 210-22, 210-23">
        <small style="color: #2563EB; font-size: 11px; display: block; margin-top: 4px;">Ushbu tyutor faqat belgilangan guruh talabalariga ball kirita oladi.</small>
      </div>

      <div class="form-group">
        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
          <input type="checkbox" id="new-staff-active" checked>
          <span style="font-weight: 600;">Hisob faol (tizimga kira oladi)</span>
        </label>
      </div>
    </form>
  `;

  modalFooter.innerHTML = `
    <button class="btn btn-outline" onclick="closeModal()">Bekor qilish</button>
    <button class="btn btn-primary" onclick="submitCreateStaff()">Xodimni Yaratish</button>
  `;

  openModal();
}

function checkTutorSelection(prefix) {
  const isChecked = Array.from(document.querySelectorAll(`input[name="staff-roles-checkbox"]:checked`))
    .some(cb => cb.value === 'tutor');
  const box = document.getElementById(`${prefix}-tutor-group-box`);
  if (box) box.style.display = isChecked ? 'block' : 'none';
}

async function submitCreateStaff() {
  const username = document.getElementById('new-staff-username')?.value.trim();
  const password = document.getElementById('new-staff-password')?.value;
  const full_name = document.getElementById('new-staff-fullname')?.value.trim();
  const email = document.getElementById('new-staff-email')?.value.trim();
  const phone = document.getElementById('new-staff-phone')?.value.trim();
  const telegram_id = document.getElementById('new-staff-tgid')?.value.trim();
  const is_active = document.getElementById('new-staff-active')?.checked ? 1 : 0;

  const roles = Array.from(document.querySelectorAll(`input[name="staff-roles-checkbox"]:checked`))
    .map(cb => cb.value);

  const rawGroups = document.getElementById('new-staff-tutor-groups')?.value.trim();
  const tutor_groups = rawGroups ? rawGroups.split(',').map(g => g.trim()).filter(Boolean) : [];

  if (!username || !password || !full_name) {
    alert('Iltimos, Login, Parol va F.I.Sh maydonlarini to\'ldiring!');
    return;
  }

  if (roles.length === 0) {
    alert('Iltimos, kamida bitta rol tanlang!');
    return;
  }

  try {
    await apiFetch('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        username, password, full_name, email, phone,
        telegram_id: telegram_id ? Number(telegram_id) : null,
        is_active, roles, tutor_groups
      })
    });

    closeModal();
    alert('Yangi xodim muvaffaqiyatli saqlandi!');
    await loadStaffUsersList();
  } catch (err) {
    alert(err.message);
  }
}

async function showEditStaffModal(userId) {
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalFooter = document.getElementById('modal-footer');

  modalTitle.textContent = 'Xodimni Tahrirlash va Rollarni O\'zgartirish';
  modalBody.innerHTML = '<div class="spinner"></div>';
  modalFooter.innerHTML = '<button class="btn btn-outline" onclick="closeModal()">Yopish</button>';
  openModal();

  try {
    const res = await apiFetch('/api/admin/users');
    const u = (res.users || []).find(x => x.id === userId);
    if (!u) throw new Error('Xodim topilmadi');

    modalBody.innerHTML = `
      <form id="edit-staff-form">
        <div class="grid grid-2 mb-3">
          <div class="form-group">
            <label class="form-label">Login (O'zgartirib bo'lmaydi):</label>
            <input type="text" class="form-control" value="${u.username}" disabled style="background:#F1F5F9;">
          </div>
          <div class="form-group">
            <label class="form-label">Yangi Parol (ixtiyoriy):</label>
            <input type="password" id="edit-staff-password" class="form-control" placeholder="Bo'sh qoldirilsa o'zgarmaydi">
          </div>
        </div>

        <div class="form-group mb-3">
          <label class="form-label">Xodim F.I.Sh *:</label>
          <input type="text" id="edit-staff-fullname" class="form-control" value="${u.full_name || ''}" required>
        </div>

        <div class="grid grid-3 mb-3">
          <div class="form-group">
            <label class="form-label">Email:</label>
            <input type="email" id="edit-staff-email" class="form-control" value="${u.email || ''}">
          </div>
          <div class="form-group">
            <label class="form-label">Telefon:</label>
            <input type="tel" id="edit-staff-phone" class="form-control" value="${u.phone || ''}">
          </div>
          <div class="form-group">
            <label class="form-label">Telegram Chat ID:</label>
            <input type="number" id="edit-staff-tgid" class="form-control" value="${u.telegram_id || ''}">
          </div>
        </div>

        <div class="form-group mb-3">
          <label class="form-label" style="font-weight: 700; color: #1E3A8A; display: block; margin-bottom: 8px;">
            Biriktirilgan Rollar (Ixtiyoriy qo'shish yoki olib tashlash):
          </label>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; background: #F8FAFC; padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--border);">
            ${ALL_ROLES_META.map(r => `
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px;">
                <input type="checkbox" name="edit-staff-roles-checkbox" value="${r.role}" 
                       ${(u.roles || []).includes(r.role) ? 'checked' : ''} 
                       onchange="checkTutorSelection('edit')">
                <span style="font-weight: 600; color: ${r.color};">${r.role}</span>
                <span style="font-size: 11px; color: var(--text-muted);">- ${r.name.split(' (')[0]}</span>
              </label>
            `).join('')}
          </div>
        </div>

        <div id="edit-tutor-group-box" class="form-group mb-3" style="display: ${(u.roles || []).includes('tutor') ? 'block' : 'none'}; background: #EFF6FF; padding: 12px; border-radius: var(--radius-md); border: 1px solid #BFDBFE;">
          <label class="form-label" style="color: #1E3A8A; font-weight: 600;">Tyutor Guruhlari (vergul bilan ajrating):</label>
          <input type="text" id="edit-staff-tutor-groups" class="form-control" value="${(u.tutor_groups || []).join(', ')}" placeholder="210-21, 210-22">
        </div>

        <div class="form-group">
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" id="edit-staff-active" ${u.is_active ? 'checked' : ''}>
            <span style="font-weight: 600;">Hisob faol</span>
          </label>
        </div>
      </form>
    `;

    modalFooter.innerHTML = `
      <button class="btn btn-outline" onclick="closeModal()">Bekor qilish</button>
      <button class="btn btn-primary" onclick="submitEditStaff('${userId}')">O'zgarishlarni Saqlash</button>
    `;
  } catch (err) {
    modalBody.innerHTML = `<p class="text-danger">${err.message}</p>`;
  }
}

async function submitEditStaff(userId) {
  const full_name = document.getElementById('edit-staff-fullname')?.value.trim();
  const password = document.getElementById('edit-staff-password')?.value;
  const email = document.getElementById('edit-staff-email')?.value.trim();
  const phone = document.getElementById('edit-staff-phone')?.value.trim();
  const telegram_id = document.getElementById('edit-staff-tgid')?.value.trim();
  const is_active = document.getElementById('edit-staff-active')?.checked ? 1 : 0;

  const roles = Array.from(document.querySelectorAll(`input[name="edit-staff-roles-checkbox"]:checked`))
    .map(cb => cb.value);

  const rawGroups = document.getElementById('edit-staff-tutor-groups')?.value.trim();
  const tutor_groups = rawGroups ? rawGroups.split(',').map(g => g.trim()).filter(Boolean) : [];

  if (!full_name) {
    alert('F.I.Sh kiritilishi shart!');
    return;
  }

  if (roles.length === 0) {
    alert('Kamida bitta rol tanlanishi shart!');
    return;
  }

  try {
    const payload = {
      full_name, email, phone,
      telegram_id: telegram_id ? Number(telegram_id) : null,
      is_active, roles, tutor_groups
    };
    if (password) payload.password = password;

    await apiFetch(`/api/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });

    closeModal();
    alert('Xodim ma\'lumotlari va rollari yangilandi!');
    await loadStaffUsersList();
  } catch (err) {
    alert(err.message);
  }
}

async function toggleStaffStatus(userId, currentActive) {
  const newActive = currentActive ? 0 : 1;
  const actionText = newActive ? 'faollashtirmoqchimisiz' : 'bloklamoqchimisiz (nofaol)';

  if (!confirm(`Xodimni ${actionText}?`)) return;

  try {
    await apiFetch(`/api/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ is_active: newActive })
    });
    alert('Xodim holati yangilandi');
    await loadStaffUsersList();
  } catch (err) {
    alert(err.message);
  }
}

