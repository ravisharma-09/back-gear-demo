import { icon, esc, money, initials, dayName, dmy, fmtTime, emptyState } from '../ui.js';
import { setPage } from '../main.js';
import { state } from '../main.js';
import { todaySummary, lessonsOn, getStudent, getInstructor, TODAY } from '../../data/store.js';
import { openAddStudent } from './students.js';
import { openAddPayment } from './fees.js';
import { openAddLesson } from './lessons.js';

export function renderDashboard(view){
  setPage({ title:'Home', sub:`${dayName(TODAY)}, ${dmy(TODAY)}` });
  const s = todaySummary();
  const lessons = lessonsOn(TODAY);

  view.innerHTML = `
    <div class="stats">
      <div class="stat">${icon('users')}<b>${s.students}</b><span>Total students</span></div>
      <div class="stat stat-green">${icon('calendar-check')}<b>${s.present}</b>
        <span>Present today</span></div>
      <div class="stat">${icon('clipboard-list')}<b>${s.lessons}</b><span>Today's lessons</span></div>
      <div class="stat stat-amber">${icon('indian-rupee')}<b>${money(s.pending)}</b>
        <span>Pending fees</span></div>
    </div>

    <div class="block">
      <div class="block-head"><h2>Quick actions</h2></div>
      <div class="quick">
        <a class="btn btn-primary" href="#/attendance">${icon('calendar-check')}Mark Today's Attendance</a>
        <button class="btn" data-do="add-student">${icon('user-plus')}Add new student</button>
        <button class="btn" data-do="add-payment">${icon('banknote')}Record fee payment</button>
        <button class="btn" data-do="add-lesson">${icon('plus')}Book a lesson</button>
      </div>
    </div>

    <div class="block">
      <div class="block-head"><h2>Today's lessons</h2>
        <a href="#/lessons">View all</a></div>
      ${lessons.length ? `<div class="rows">${lessons.map(l => {
        const st = getStudent(l.studentId), ins = getInstructor(l.instructorId);
        const tone = l.status === 'Completed' ? 'pill-green'
                   : l.status === 'Cancelled' ? 'pill-red' : 'pill-blue';
        return `<a class="row-item" href="#/student/${esc(l.studentId)}">
          <span class="avatar avatar-sm" aria-hidden="true">${esc(initials(st?.name))}</span>
          <span class="row-main">
            <b>${esc(st?.name || 'Student removed')}</b>
            <span>${fmtTime(l.time)} · ${esc(ins?.name || 'No instructor')}</span>
          </span>
          <span class="row-side"><span class="pill ${tone}">${esc(l.status)}</span></span>
        </a>`; }).join('')}</div>`
      : emptyState('clipboard-list', 'No lessons booked for today.')}
    </div>

    ${s.newEnquiries ? `<div class="notice notice-amber">${icon('phone-call')}
      <span><b>${s.newEnquiries} new ${s.newEnquiries === 1 ? 'enquiry' : 'enquiries'}</b>
      from the website. <a href="#/enquiries">Open enquiries</a></span></div>` : ''}
  `;

  view.addEventListener('click', e => {
    const btn = e.target.closest('[data-do]');
    if (!btn) return;
    if (btn.dataset.do === 'add-student') openAddStudent();
    if (btn.dataset.do === 'add-payment') openAddPayment();
    if (btn.dataset.do === 'add-lesson') openAddLesson();
  });
}
