/* ==================================================================
   Management app shell: demo login, navigation and routing.

   >>> The login below is PROTOTYPE ONLY. It compares against a
   >>> hard-coded demo account and stores a flag in the browser.
   >>> It is not authentication and protects nothing. Real auth,
   >>> roles and permissions come with the production build.
   ================================================================== */
import { $, $$, icon, esc, toast, wireSheet } from './ui.js';
import { onChange } from '../data/store.js';
import { renderDashboard } from './views/dashboard.js';
import { renderStudents, renderStudentProfile } from './views/students.js';
import { renderAttendance } from './views/attendance.js';
import { renderFees } from './views/fees.js';
import { renderLessons } from './views/lessons.js';
import { renderInstructors, renderEnquiries, renderReports, renderSettings, renderMore }
  from './views/more.js';
import { registerServiceWorker, onInstallChange } from './install.js';

const DEMO_USER = { email:'owner@backgear.demo', password:'demo123', name:'Arjun Singh', role:'Owner' };
const SESSION_KEY = 'backgear.demo.session';

export const state = { user:null, route:{ name:'home', id:'' } };

/* ---------------- demo login ---------------- */
function readSession(){
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; }
}
function writeSession(user){
  try { user ? sessionStorage.setItem(SESSION_KEY, JSON.stringify(user))
             : sessionStorage.removeItem(SESSION_KEY); } catch { /* demo continues in memory */ }
}
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
  if (email.trim().toLowerCase() === DEMO_USER.email && password === DEMO_USER.password){
    state.user = { name: DEMO_USER.name, role: DEMO_USER.role, email: DEMO_USER.email };
    writeSession(state.user);
    err.hidden = true;
    showApp();
  } else {
    err.textContent = 'Use the demo account shown below.';
    err.hidden = false;
  }
});
$('#fillDemo').addEventListener('click', () => {
  $('#lgEmail').value = DEMO_USER.email;
  $('#lgPass').value = DEMO_USER.password;
  $('#loginForm').requestSubmit();
});
$('#pwToggle').addEventListener('click', () => {
  const input = $('#lgPass');
  const show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  $('#pwToggle').setAttribute('aria-label', show ? 'Hide password' : 'Show password');
  $('#pwToggle').innerHTML = icon(show ? 'eye-off' : 'eye');
});
function signOut(){
  writeSession(null);
  location.hash = '#/home';
  showLogin();
}
$('#signOutDesktop').addEventListener('click', signOut);

/* ---------------- navigation ---------------- */
const PRIMARY = [
  { id:'home',       label:'Home',       icon:'house' },
  { id:'students',   label:'Students',   icon:'users' },
  { id:'attendance', label:'Attendance', icon:'calendar-check' },
  { id:'fees',       label:'Fees',       icon:'indian-rupee' },
];
export const SECONDARY = [
  { id:'lessons',     label:'Lessons',     icon:'clipboard-list' },
  { id:'instructors', label:'Instructors', icon:'user-check' },
  { id:'enquiries',   label:'Enquiries',   icon:'phone-call' },
  { id:'reports',     label:'Reports',     icon:'chart-column' },
  { id:'settings',    label:'Settings',    icon:'settings' },
];

function buildNav(){
  $('#bottomNav').innerHTML = [...PRIMARY,
    { id:'more', label:'More', icon:'grid-2x2' }]
    .map(t => `<a href="#/${t.id}" data-nav="${t.id}">${icon(t.icon)}<span>${t.label}</span></a>`).join('');
  $('#sidebarNav').innerHTML = [...PRIMARY, ...SECONDARY]
    .map(t => `<a href="#/${t.id}" data-nav="${t.id}">${icon(t.icon)}<span>${t.label}</span></a>`).join('');
}
function markNav(name){
  const group = ['lessons','instructors','enquiries','reports','settings'].includes(name) ? 'more' : name;
  $$('[data-nav]').forEach(a => {
    const on = a.dataset.nav === group || a.dataset.nav === name;
    on ? a.setAttribute('aria-current','page') : a.removeAttribute('aria-current');
  });
}

/* ---------------- page chrome ---------------- */
export function setPage({ title, sub = '', back = false, actions = '' }){
  $('#pageTitle').textContent = title;
  $('#pageSub').textContent = sub;
  $('#pageSub').hidden = !sub;
  $('#topBack').hidden = !back;
  $('#topActions').innerHTML = actions;
}
$('#topBack').addEventListener('click', () => history.back());

/* ---------------- router ---------------- */
const ROUTES = {
  home: renderDashboard,
  students: renderStudents,
  student: renderStudentProfile,
  attendance: renderAttendance,
  fees: renderFees,
  lessons: renderLessons,
  instructors: renderInstructors,
  enquiries: renderEnquiries,
  reports: renderReports,
  settings: renderSettings,
  more: renderMore,
};

function route(scroll = true){
  if (!state.user) return;
  const raw = (location.hash || '#/home').replace(/^#\/?/, '');
  const [name, id] = raw.split('/');
  state.route = { name: ROUTES[name] ? name : 'home', id: decodeURIComponent(id || '') };
  markNav(state.route.name);
  const view = $('#view');
  view.innerHTML = '';
  try {
    ROUTES[state.route.name](view, state.route.id);
  } catch (err){
    console.error(err);
    view.innerHTML = `<div class="empty">${icon('triangle-alert','icon icon-lg')}
      <p>This screen could not be shown.</p></div>`;
  }
  if (scroll) window.scrollTo(0, 0);
}
export const go = hash => { location.hash = hash; };
/** Re-draws the current screen — used after any data change. */
export const refresh = () => route(false);

window.addEventListener('hashchange', () => route(true));
/* any change in the data store re-draws the screen, keeping the scroll position */
onChange(() => { if (state.user) route(false); });

/* ---------------- start ---------------- */
wireSheet();
registerServiceWorker();
/* the install button appears the moment the browser says the app is installable */
onInstallChange(() => { if (state.user) route(false); });
const saved = readSession();
if (saved){ state.user = saved; showApp(); } else showLogin();
