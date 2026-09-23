/* What a trainer sees: today's classes, and nothing they do not need. */
import { $, icon, esc, initials, dmy, dayName, fmtTime, addDays, emptyState,
         openSheet, toast, textareaField } from '../ui.js';
import { setPage, state, signOut } from '../main.js';
import { lessonsForInstructor, startLesson, completeLesson, getStudent, getVehicle,
         courseById, attendanceCount, listStudents, lessonsFor, getInstructor,
         requestScheduleChange, TODAY } from '../../data/store.js';
import { portalLabel } from '../main.js';

let day = TODAY;

export function renderTrainerToday(view){
  const me = state.user?.instructorId;
  const classes = lessonsForInstructor(me, day).filter(l => l.status !== 'Cancelled');
  const done = classes.filter(l => l.status === 'Completed').length;

  setPage({ title: day === TODAY ? 'Today' : dayName(day),
    sub: `${dmy(day)} · ${classes.length} ${classes.length === 1 ? 'class' : 'classes'}` });

  view.innerHTML = `
    <div class="daypick">
      <button class="btn btn-icon" type="button" data-day="-1" aria-label="Previous day">${icon('chevron-left')}</button>
      <label class="sr-only" for="trDate">Date</label>
      <input class="control" id="trDate" type="date" value="${day}">
      <button class="btn btn-icon" type="button" data-day="1" aria-label="Next day">${icon('chevron-right')}</button>
      ${day === TODAY ? '' : `<button class="btn btn-sm" type="button" data-today>Today</button>`}
    </div>

    ${classes.length ? `
      <p class="trainer-progress">${done} of ${classes.length} classes done</p>
      <div class="class-list">${classes.map(trainerCard).join('')}</div>`
      : emptyState('calendar-check', 'No classes for you on this day.')}
  `;

  $('#trDate', view).addEventListener('change', e => {
    if (e.target.value){ day = e.target.value; renderTrainerToday(view); }
  });

  view.addEventListener('click', e => {
    const step = e.target.closest('[data-day]');
    if (step){ day = addDays(day, Number(step.dataset.day)); renderTrainerToday(view); return; }
    if (e.target.closest('[data-today]')){ day = TODAY; renderTrainerToday(view); return; }

    const start = e.target.closest('[data-start]');
    if (start){
      const l = startLesson(start.dataset.start);
      toast(`Class started with ${getStudent(l.studentId)?.name?.split(' ')[0] || 'the student'}`);
      return;
    }
    const finish = e.target.closest('[data-finish]');
    if (finish) return openComplete(finish.dataset.finish);

    const ask = e.target.closest('[data-ask]');
    if (ask) return openScheduleRequest(ask.dataset.ask);
  });
}

function trainerCard(l){
  const st = getStudent(l.studentId);
  const car = getVehicle(l.vehicleId);
  const done = l.status === 'Completed';
  const running = l.status === 'In progress';

  return `<article class="class-card trainer-card${done ? ' is-done' : ''}">
    <div class="cc-time">${fmtTime(l.time)}</div>
    <div class="cc-body">
      <div class="cc-name">${esc(st?.name || 'Student')}</div>
      <div class="cc-meta">
        <span>${icon('map-pin','icon icon-sm')} ${esc(st?.pickup || 'No pickup point')}</span>
        <span>${icon('car','icon icon-sm')} ${esc(car?.name || 'No car')}</span>
      </div>
      <a class="cc-call" href="tel:${esc(String(st?.phone || '').replace(/\s/g,''))}">
        ${icon('phone','icon icon-sm')} Call ${esc(st?.phone || '')}</a>
    </div>
    <div class="cc-side">
      ${done ? `<span class="pill pill-green">Class done</span>`
        : running
          ? `<button class="btn btn-green btn-block" data-finish="${esc(l.id)}">Complete Class</button>`
          : `<button class="btn btn-primary btn-block" data-start="${esc(l.id)}">Start Class</button>
             <button class="btn btn-sm btn-block" data-ask="${esc(l.id)}">Ask to change</button>`}
    </div>
  </article>`;
}

/** One short screen to finish a class. Ratings and notes stay folded away. */
function openComplete(lessonId){
  const me = state.user?.instructorId;
  const today = lessonsForInstructor(me, day);
  const lesson = today.find(l => l.id === lessonId);
  const past = lesson ? lessonsFor(lesson.studentId)
    .filter(l => l.id !== lessonId && l.status === 'Completed' && (l.notes || l.practise))
    .slice(0, 2) : [];

  openSheet({
    title:'Complete this class',
    body: `
      <p class="sheet-lead">Marking this done records the student present for today.</p>

      ${past.length ? `<div class="last-notes">
        <b>Last time you wrote</b>
        ${past.map(l => `<p>${esc(dmy(l.date))} — ${esc(l.notes || l.practise)}</p>`).join('')}
      </div>` : ''}

      <details class="fold" open>
        <summary>Add progress details (optional) ${icon('chevron-down','icon icon-sm')}</summary>
        <div style="padding-top:16px">
          <div class="field">
            <span class="label">How was the driving today?</span>
            <div class="rate" role="group" aria-label="Driving rating">
              ${[1,2,3,4,5].map(n => `<label class="rate-opt">
                <input type="radio" name="rating" value="${n}"${n === 3 ? ' checked' : ''}>
                <span>${n}</span></label>`).join('')}
            </div>
            <p class="hint">1 is just starting, 5 is ready for the test.</p>
          </div>
          ${textareaField({ name:'practise', label:'What should they practise next?', rows:2 })}
          ${textareaField({ name:'notes', label:'Any other note', rows:2 })}
        </div>
      </details>`,
    submitLabel:'Mark Class Complete',
    onSave: data => {
      const l = completeLesson(lessonId, {
        notes: data.notes || '', rating: Number(data.rating) || 0, practise: data.practise || '' });
      const st = getStudent(l.studentId);
      const count = attendanceCount(l.studentId);
      const total = courseById(st?.courseId).days;
      const done = Math.min(count.present, total);
      toast(done >= total
        ? `Class complete. ${st?.name?.split(' ')[0] || 'They'} has finished all ${total} classes.`
        : `Class complete. ${st?.name?.split(' ')[0] || 'They'} has now done ${done} of ${total} classes.`);
    },
  });
}

/** A trainer cannot move a class. They send the admin a request. */
function openScheduleRequest(lessonId){
  openSheet({
    title:'Ask the office to change this class',
    body:`<p class="sheet-lead">You cannot move a class yourself. The office will see this
      and call you back. The class stays as it is until they change it.</p>
      ${textareaField({ name:'note', label:'What needs to change?', rows:3 })}`,
    submitLabel:'Send to office',
    onSave: data => {
      requestScheduleChange(lessonId, data.note);
      toast('Sent to the office. They will get back to you.');
    },
  });
}

/* ---------------- the trainer's own profile ---------------- */
export function renderTrainerProfile(view){
  const me = getInstructor(state.user?.instructorId);
  const mine = listStudents({ status:'Active' });
  setPage({ title:'My profile', back:true });
  view.innerHTML = `
    <div class="profile-head">
      <span class="avatar avatar-lg" aria-hidden="true">${esc(initials(me?.name))}</span>
      <div style="flex:1;min-width:0">
        <h2>${esc(me?.name || '')}</h2>
        <p>${esc(portalLabel())}</p>
      </div>
    </div>
    <dl class="deflist">
      <div><dt>Phone</dt><dd>${esc(me?.phone || '—')}</dd></div>
      <div><dt>Languages</dt><dd>${esc(me?.languages || '—')}</dd></div>
      <div><dt>With the school since</dt><dd>${esc(dmy(me?.joined))}</dd></div>
      <div><dt>My students</dt><dd>${mine.length}</dd></div>
    </dl>
    <div class="notice" style="margin-top:20px">${icon('info')}
      <span>Only the office can change these details or your classes.
        Ask them and they will update it for you.</span></div>
    <p style="margin-top:20px"><button class="btn btn-block" data-do="signout">
      ${icon('log-out')}Sign out</button></p>`;
  view.addEventListener('click', e => {
    if (e.target.closest('[data-do="signout"]')) signOut();
  });
}

/* The trainer's own students, nothing more. */
export function renderTrainerStudents(view){
  const me = state.user?.instructorId;
  const mine = listStudents({ instructorId: me, status:'Active' });
  setPage({ title:'My students', sub:`${mine.length} students` });

  view.innerHTML = mine.length ? `<div class="rows">${mine.map(s => {
    const c = courseById(s.courseId);
    const a = attendanceCount(s.id);
    return `<a class="row-item" href="#/student/${esc(s.id)}">
      <span class="avatar avatar-sm" aria-hidden="true">${esc(initials(s.name))}</span>
      <span class="row-main"><b>${esc(s.name)}</b>
        <span>${esc(c.name)} &nbsp;·&nbsp; ${a.present} of ${c.days} classes done</span></span>
      ${icon('chevron-right','icon row-chev')}
    </a>`; }).join('')}</div>`
    : emptyState('users', 'No students assigned to you yet.');
}
