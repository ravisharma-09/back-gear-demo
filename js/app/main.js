/* ==================================================================
   The app shell: who is signed in, what they can see, and routing.

   >>> The sign-in below is PROTOTYPE ONLY. It compares against three
   >>> demo accounts kept in the browser. It is not authentication and
   >>> protects nothing. Real logins, roles and permissions come later.
   ================================================================== */
import { $, $$, icon, esc, toast, wireSheet } from './ui.js';
import { onChange, DEMO_ACCOUNTS, setActor } from '../data/store.js';
import { renderAdminHome } from './views/admin-home.js';
import { renderStudents, renderStudentProfile } from './views/students.js';
import { renderSchedule } from './views/schedule.js';
import { renderAttendance } from './views/attendance.js';
import { renderPayments } from './views/fees.js';
import { renderTrainers, renderVehicles, renderEnquiries, renderReports,
         renderSettings, renderMore } from './views/more.js';
import { renderTrainerToday, renderTrainerStudents, renderTrainerProfile } from './views/trainer.js';
import { renderRequests } from './views/more.js';
import { registerServiceWorker, onInstallChange } from './install.js';

const SESSION_KEY = 'backgear.demo.session';
export const state = { user:null, route:{ name:'home', id:'' } };

/* ---------------- who can see what ---------------- */
const NAV = {
  admin: {
    bar: [
      { id:'home',     label:'Home',     icon:'house' },
      { id:'students', label:'Students', icon:'users' },
      { id:'schedule', label:'Schedule', icon:'calendar-days' },
      { id:'payments', label:'Payments', icon:'indian-rupee' },
    ],
    more: [
      { id:'trainers',   label:'Trainers',   icon:'user-check' },
      { id:'vehicles',   label:'Vehicles',   icon:'car' },
      { id:'enquiries',  label:'Enquiries',  icon:'phone-call' },
      { id:'attendance', label:'Attendance', icon:'calendar-check' },
      { id:'requests',   label:'Requests',   icon:'circle-alert' },
      { id:'reports',    label:'Reports',    icon:'chart-column' },
      { id:'settings',   label:'Settings',   icon:'settings' },
    ],
  },
  trainer: {
    bar: [
      { id:'home',     label:'Today',       icon:'calendar-check' },
      { id:'students', label:'My students', icon:'users' },
    ],
    more: [{ id:'profile', label:'My profile', icon:'user-round' }],
  },
};
const navFor = () => NAV[state.user?.role] || NAV.admin;
export const moreItems = () => navFor().more;

/* A role can only reach the screens listed for it. Typing another hash
   simply lands on their own home screen. */
const ROUTES = {
  admin: {
    home: renderAdminHome, students: renderStudents, student: renderStudentProfile,
    schedule: renderSchedule, payments: renderPayments, attendance: renderAttendance,
    trainers: renderTrainers, vehicles: renderVehicles, enquiries: renderEnquiries,
    requests: renderRequests, reports: renderReports, settings: renderSettings,
    more: renderMore,
  },
  trainer: {
    home: renderTrainerToday, students: renderTrainerStudents,
    student: renderStudentProfile, profile: renderTrainerProfile, more: renderMore,
  },
};

/* ---------------- sign in ---------------- */
const readSession = () => { try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; } };
const writeSession = u => { try { u ? sessionStorage.setItem(SESSION_KEY, JSON.stringify(u))
                                  : sessionStorage.removeItem(SESSION_KEY); } catch {} };

function showLogin(){
  state.user = null;
  $('#app').hidden = true;
  $('#loginScreen').hidden = false;
}
function showApp(){
  $('#loginScreen').hidden = true;
  $('#app').hidden = false;
  buildNav();
  route();
}

$('#loginForm').addEventListener('submit', e => {
  e.preventDefault();
  const err = $('#loginError');
  const { email, password } = Object.fromEntries(new FormData(e.target).entries());
  const found = DEMO_ACCOUNTS.find(a =>
    a.email === String(email).trim().toLowerCase() && a.password === password);
  if (!found){
    err.textContent = 'That email and password do not match. Try one of the demo accounts below.';
    err.hidden = false;
    return;
  }
  state.user = { ...found };
  delete state.user.password;
  setActor(state.user);
  writeSession(state.user);
  err.hidden = true;
  location.hash = '#/home';
  showApp();
});

$$('[data-demo-login]').forEach(btn => btn.addEventListener('click', () => {
  const acct = DEMO_ACCOUNTS.find(a => a.role === btn.dataset.demoLogin);
  if (!acct) return;
  $('#lgEmail').value = acct.email;
  $('#lgPass').value = acct.password;
  $('#loginForm').requestSubmit();
}));

$('#pwToggle').addEventListener('click', () => {
  const input = $('#lgPass');
  const show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  $('#pwToggle').setAttribute('aria-label', show ? 'Hide password' : 'Show password');
  $('#pwToggle').innerHTML = icon(show ? 'eye-off' : 'eye');
});

export function signOut(){
  writeSession(null);
  location.hash = '#/home';
  showLogin();
}
$('#signOutDesktop').addEventListener('click', signOut);

/* ---------------- navigation ---------------- */
function buildNav(){
  const nav = navFor();
  const bar = [...nav.bar, { id:'more', label:'More', icon:'grid-2x2' }];
  $('#bottomNav').innerHTML = bar.map(t =>
    `<a href="#/${t.id}" data-nav="${t.id}">${icon(t.icon)}<span>${esc(t.label)}</span></a>`).join('');
  $('#sidebarNav').innerHTML = [...nav.bar, ...nav.more].map(t =>
    `<a href="#/${t.id}" data-nav="${t.id}">${icon(t.icon)}<span>${esc(t.label)}</span></a>`).join('');
  $('#roleBadge').textContent = portalLabel();
}
function markNav(name){
  const inMore = navFor().more.some(m => m.id === name);
  $$('[data-nav]').forEach(a => {
    const on = a.dataset.nav === name || (inMore && a.dataset.nav === 'more');
    on ? a.setAttribute('aria-current','page') : a.removeAttribute('aria-current');
  });
}

/* ---------------- page chrome ---------------- */
/** "Admin Portal" or "Trainer Portal — Harpreet Singh". */
export function portalLabel(){
  if (state.user?.role === 'trainer') return `Trainer Portal — ${state.user.name}`;
  return 'Admin Portal';
}

export function setPage({ title, sub = '', back = false, actions = '' }){
  $('#pageTitle').textContent = title;
  $('#pageSub').textContent = sub;
  $('#pageSub').hidden = !sub;
  $('#topBack').hidden = !back;
  $('#topActions').innerHTML = actions;
}
$('#topBack').addEventListener('click', () => history.back());

/* ---------------- routing ---------------- */
function route(scroll = true){
  if (!state.user) return;
  const table = ROUTES[state.user.role] || ROUTES.admin;
  const raw = (location.hash || '#/home').replace(/^#\/?/, '');
  const [name, id] = raw.split('/');
  state.route = { name: table[name] ? name : 'home', id: decodeURIComponent(id || '') };
  markNav(state.route.name);
  const view = $('#view');
  view.innerHTML = '';
  try {
    table[state.route.name](view, state.route.id);
  } catch (err){
    console.error(err);
    view.innerHTML = `<div class="empty">${icon('triangle-alert','icon icon-lg')}
      <p>This screen could not be shown. Go back and try again.</p></div>`;
  }
  if (scroll) window.scrollTo(0, 0);
}
export const go = hash => { location.hash = hash; };
export const refresh = () => route(false);

window.addEventListener('hashchange', () => route(true));
onChange(() => { if (state.user) route(false); });
onInstallChange(() => { if (state.user) route(false); });

/* ---------------- start ---------------- */
wireSheet();
registerServiceWorker();
const saved = readSession();
if (saved){ state.user = saved; setActor(saved); showApp(); } else showLogin();
