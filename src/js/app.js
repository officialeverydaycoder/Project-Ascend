/* ══════════════════════════════════════════════════════
   APP.JS  — Router · State · Toast · Modal · Clock
══════════════════════════════════════════════════════ */
window.APP = {
  data: null,
  currentPage: 'dashboard',
  pageInits: {},
};

/* ── Bootstrap ─────────────────────────────────────────── */
async function initApp() {
  APP.data = await window.jee.loadData();
  if (!APP.data.tasks)     APP.data.tasks     = [];
  if (!APP.data.mocks)     APP.data.mocks     = [];
  if (!APP.data.resources) APP.data.resources = [];
  if (!APP.data.sessions)  APP.data.sessions  = [];
  if (!APP.data.alarms)    APP.data.alarms    = [];
  if (!APP.data.calendar)  APP.data.calendar  = {};

  // Seed default resources on very first launch
  if (!APP.data._resourcesSeeded) {
    const defaults = window.jee.getDefaultResources();
    APP.data.resources = [...defaults, ...(APP.data.resources||[])];
    APP.data._resourcesSeeded = true;
    saveData();
  }
  if (!APP.data.settings)  APP.data.settings  = {
    hfKey:'', pomoDuration:25, breakDuration:5, longBreak:15,
    alarmSound:true, notifTask:true, notifPomo:true
  };

  startClock();
  updateStreak();
  setupNav();
  navigateTo('dashboard');

  window.jee.onAlarmFired(alarm => {
    toast(`⏰  ${alarm.label || 'Alarm!'}`, 'warning');
  });
}

function saveData() { window.jee.saveData(APP.data); }

/* ── Navigation ─────────────────────────────────────────── */
function setupNav() {
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.addEventListener('click', () => navigateTo(item.dataset.page));
  });
}

function navigateTo(page) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  const navEl  = document.querySelector(`.nav-item[data-page="${page}"]`);
  const pageEl = document.getElementById(`page-${page}`);
  if (navEl)  navEl.classList.add('active');
  if (pageEl) pageEl.classList.add('active');

  APP.currentPage = page;

  const titles = {
    dashboard:'Dashboard', calendar:'Weekly Planner',
    tasks:'Task Tracker',  timer:'Timer & Pomodoro',
    mocks:'Mock Logger',   rank:'Rank Estimator',
    resources:'Resource Hub', settings:'Settings'
  };
  document.getElementById('titlebar-text').textContent = titles[page] || page;

  if (APP.pageInits[page]) {
    if (!APP.pageInits[page].initialized) {
      APP.pageInits[page].init();
      APP.pageInits[page].initialized = true;
    } else if (APP.pageInits[page].refresh) {
      APP.pageInits[page].refresh();
    }
  }
}

/* ── Clock ──────────────────────────────────────────────── */
function startClock() {
  const el = document.getElementById('clock');
  const tick = () => {
    const n = new Date();
    el.textContent = n.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
  };
  tick(); setInterval(tick, 1000);
}

/* ── Streak ─────────────────────────────────────────────── */
function updateStreak() {
  const days = [...new Set((APP.data.sessions||[]).map(s => new Date(s.date).toDateString()))];
  let streak = 0, d = new Date();
  while (days.includes(d.toDateString())) { streak++; d.setDate(d.getDate()-1); }
  document.getElementById('streak-count').textContent = `${streak} day streak`;
  return streak;
}

/* ── Toast ──────────────────────────────────────────────── */
window.toast = function(msg, type='info', duration=3200) {
  const c = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast ${type}`;

  const icon = { success:'✓', error:'✕', warning:'⏰', info:'·' }[type] || '·';
  const iconColor = { success:'var(--green)', error:'var(--red)', warning:'var(--amber)', info:'var(--indigo2)' }[type];
  el.innerHTML = `<span style="font-family:var(--font-mono);font-size:13px;color:${iconColor};flex-shrink:0">${icon}</span>${msg}`;

  c.appendChild(el);
  setTimeout(() => {
    el.style.animation = 'toastOut 0.35s ease forwards';
    setTimeout(() => el.remove(), 350);
  }, duration);
};

/* ── Modal ──────────────────────────────────────────────── */
window.openModal = function(html) {
  const root = document.getElementById('modal-root');
  root.innerHTML = `<div class="modal-overlay" id="active-modal"><div class="modal">${html}</div></div>`;
  requestAnimationFrame(() => document.getElementById('active-modal').classList.add('open'));
  document.getElementById('active-modal').addEventListener('click', e => {
    if (e.target.id === 'active-modal') closeModal();
  });
};

window.closeModal = function() {
  const m = document.getElementById('active-modal');
  if (!m) return;
  m.classList.remove('open');
  setTimeout(() => { if (m.parentNode) m.remove(); }, 320);
};

/* ── Animated Number Counter ────────────────────────────── */
window.animateCount = function(el, from, to, dur=900) {
  if (!el) return;
  const start = performance.now();
  const step  = t => {
    const p   = Math.min((t - start) / dur, 1);
    const val = Math.round(from + (to - from) * easeOutExpo(p));
    el.textContent = val.toLocaleString();
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

function easeOutExpo(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }

/* ── Animate Progress Bar ───────────────────────────────── */
window.animateBar = function(el, pct) {
  if (!el) return;
  el.style.width = '0%';
  requestAnimationFrame(() => requestAnimationFrame(() => { el.style.width = pct + '%'; }));
};

/* ── Init ───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', initApp);
