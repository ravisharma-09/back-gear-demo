import { $, icon, esc, money, initials, dmy, fmtTime, emptyState } from '../ui.js';
import { setPage, state, go } from '../main.js';
import { todaySummary, lessonsOn, getStudent, getInstructor, getVehicle,
         listEnquiries, listStudents, totalPending, TODAY } from '../../data/store.js';
import { openAddStudent } from './students.js';
import { openAddPayment } from './fees.js';
import { openBookClass } from './schedule.js';

const WELCOME_KEY = 'backgear.welcome.done';
const welcomeDone = () => { try { return localStorage.getItem(WELCOME_KEY) === '1'; } catch { return true; } };
const finishWelcome = () => { try { localStorage.setItem(WELCOME_KEY, '1'); } catch {} };

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};

export function renderAdminHome(view){
  setPage({ title:'Home', sub:`${dmy(TODAY)}` });

  const s = todaySummary();
  const classes = lessonsOn(TODAY).filter(l => l.status !== 'Cancelled');
  const newEnquiries = listEnquiries('New');
  const owing = listStudents().filter(st => st.status !== 'Dropped');
  const pending = totalPending();

  view.innerHTML = `
    ${welcomeDone() ? '' : welcomePanel()}

    <p class="hello">${greeting()},</p>
    <h2 class="hello-name">${esc(state.user?.name || '')}</h2>

    <!-- the four things the owner checks every morning -->
    <div class="glance">
      <a class="glance-item" href="#/schedule">
        <span class="glance-icon">${icon('calendar-days')}</span>
        <span class="glance-body">
          <b>${classes.length}</b>
          <span>Today's classes</span>
        </span>
        ${icon('chevron-right','icon row-chev')}
      </a>
      <a class="glance-item" href="#/enquiries">
        <span class="glance-icon ${newEnquiries.length ? 'is-amber' : ''}">${icon('phone-call')}</span>
        <span class="glance-body">
          <b>${newEnquiries.length}</b>
          <span>New enquiries</span>
        </span>
        ${icon('chevron-right','icon row-chev')}
      </a>
      <a class="glance-item" href="#/payments">
        <span class="glance-icon ${pending ? 'is-amber' : ''}">${icon('indian-rupee')}</span>
        <span class="glance-body">
          <b>${money(pending)}</b>
          <span>Money pending</span>
        </span>
        ${icon('chevron-right','icon row-chev')}
      </a>
      <a class="glance-item" href="#/students">
        <span class="glance-icon">${icon('users')}</span>
        <span class="glance-body">
          <b>${s.students}</b>
          <span>Students</span>
        </span>
        ${icon('chevron-right','icon row-chev')}
      </a>
    </div>

    <!-- four big, obvious things to do -->
    <div class="block">
      <div class="block-head"><h2>What do you want to do?</h2></div>
      <div class="quick">
        <button class="btn btn-primary" data-do="add-student">${icon('user-plus')}Add Student</button>
        <button class="btn" data-do="book-class">${icon('calendar-days')}Book Class</button>
        <button class="btn" data-do="add-payment">${icon('indian-rupee')}Record Payment</button>
        <a class="btn" href="#/schedule">${icon('list')}View Today</a>
      </div>
    </div>

    <div class="block">
      <div class="block-head"><h2>Today's classes</h2>
        <a href="#/schedule">See all</a></div>
      ${classes.length ? `<div class="rows">${classes.slice(0,5).map(lessonRow).join('')}</div>`
        : emptyState('calendar-days', 'No classes booked for today.',
            `<p style="margin-top:14px"><button class="btn btn-primary" data-do="book-class">
               ${icon('plus')}Book a class</button></p>`)}
    </div>
  `;

  view.addEventListener('click', async e => {
    const btn = e.target.closest('[data-do]');
    if (!btn) return;
    const what = btn.dataset.do;
    if (what === 'add-student')  openAddStudent();
    if (what === 'book-class')   openBookClass();
    if (what === 'add-payment')  openAddPayment();
    if (what === 'welcome-done'){ finishWelcome(); renderAdminHome(view); }
    if (what === 'welcome-demo'){ finishWelcome(); go('#/students'); }
  });
}

function lessonRow(l){
  const st = getStudent(l.studentId);
  const car = getVehicle(l.vehicleId);
  const tone = l.status === 'Completed' ? 'pill-green'
             : l.status === 'In progress' ? 'pill-amber' : 'pill-blue';
  const label = l.status === 'In progress' ? 'Going on' : l.status;
  return `<a class="row-item" href="#/student/${esc(l.studentId)}">
    <span class="avatar avatar-sm" aria-hidden="true">${esc(initials(st?.name))}</span>
    <span class="row-main">
      <b>${esc(st?.name || 'Student removed')}</b>
      <span>${fmtTime(l.time)} &nbsp;·&nbsp; ${esc(getInstructor(l.instructorId)?.name || 'No trainer')}${
        car ? ' &nbsp;·&nbsp; ' + esc(car.name) : ''}</span>
    </span>
    <span class="row-side"><span class="pill ${tone}">${esc(label)}</span></span>
  </a>`;
}

function welcomePanel(){
  return `<section class="welcome">
    <h2>Welcome to Back Gear Management</h2>
    <p>Everything your paper register does, on your phone. Three steps to try it:</p>
    <ol class="welcome-steps">
      <li><span>1</span><div><b>Add or open a student</b>
        <p>Their phone number, course and trainer.</p></div></li>
      <li><span>2</span><div><b>Book their class</b>
        <p>Pick a day, a trainer and a car. We check nothing clashes.</p></div></li>
      <li><span>3</span><div><b>Record progress and payment</b>
        <p>Mark the class done and note the money you received.</p></div></li>
    </ol>
    <div class="welcome-actions">
      <button class="btn btn-primary" data-do="welcome-demo">Show me</button>
      <button class="btn" data-do="welcome-done">I'll look around myself</button>
    </div>
  </section>`;
}
