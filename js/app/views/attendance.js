import { $, $$, icon, esc, initials, dmy, dayName, isSunday, addDays, emptyState, toast } from '../ui.js';
import { setPage } from '../main.js';
import { listStudents, attendanceOn, saveAttendanceDay, courseById, TODAY } from '../../data/store.js';

let day = TODAY;
let draft = null;      // marks being edited but not yet saved
let search = '';

function loadDraft(){
  draft = {};
  for (const row of attendanceOn(day)) draft[row.studentId] = row.status;
}

export function renderAttendance(view){
  if (draft === null) loadDraft();
  const students = listStudents({ status:'Active', q:search });
  const marked = Object.values(draft).filter(Boolean);
  const present = marked.filter(m => m === 'present').length;
  const absent  = marked.filter(m => m === 'absent').length;

  setPage({ title:'Attendance', sub:`${dayName(day)}, ${dmy(day)}` });

  view.innerHTML = `
    <div class="daypick">
      <button class="btn btn-icon" type="button" data-day="-1" aria-label="Previous day"
        title="Previous day">${icon('chevron-left')}</button>
      <label class="sr-only" for="attDate">Date</label>
      <input class="control" id="attDate" type="date" value="${day}">
      <button class="btn btn-icon" type="button" data-day="1" aria-label="Next day"
        title="Next day">${icon('chevron-right')}</button>
      ${day !== TODAY ? `<button class="btn btn-sm" type="button" data-today>Today</button>` : ''}
    </div>

    ${isSunday(day) ? `<div class="notice">${icon('info')}
      <span>Sunday — the school is closed, so no classes are scheduled.</span></div>`
    : `
      <div class="att-progress">
        <div class="att-progress-count">${marked.length} of ${students.length} students marked</div>
        <div class="att-progress-detail">
          <span class="clr-green">✓ ${present} Present</span>
          <span class="clr-red">✗ ${absent} Absent</span>
          <span class="clr-muted">· ${students.length - marked.length} Left</span>
        </div>
      </div>

      <div class="att-top-actions">
        <button class="btn btn-block" type="button" data-all>${icon('check')}Mark all present</button>
      </div>

      <div class="searchbar" style="margin-bottom:12px">
        ${icon('search')}
        <label class="sr-only" for="attSearch">Search student</label>
        <input class="control" id="attSearch" type="search" placeholder="Search student name..."
               value="${esc(search)}" autocomplete="off">
      </div>

      ${students.length ? `<div class="rows att-list">${students.map(st => {
        const c = courseById(st.courseId);
        const mark = draft[st.id] || '';
        return `<div class="att-row">
          <span class="avatar avatar-sm" aria-hidden="true">${esc(initials(st.name))}</span>
          <span class="att-main">
            <b>${esc(st.name)}</b>
            <span>${esc(c.name)} · ${c.days} Days</span>
          </span>
          <span class="att-buttons">
            <button class="att-btn" type="button" data-mark="present" data-id="${esc(st.id)}"
              aria-pressed="${mark === 'present'}" aria-label="Mark ${esc(st.name)} present">✓ Present</button>
            <button class="att-btn" type="button" data-mark="absent" data-id="${esc(st.id)}"
              aria-pressed="${mark === 'absent'}" aria-label="Mark ${esc(st.name)} absent">Absent</button>
          </span>
        </div>`; }).join('')}</div>

        <div class="att-actions">
          <button class="btn btn-primary btn-lg" type="button" data-save style="width:100%">${icon('save')}Save attendance for ${dmy(day)}</button>
        </div>`
      : emptyState('users', 'No active student matches this search.')}
    `}`;

  const box = $('#attSearch', view);
  if (box){
    let t;
    box.addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(() => {
        search = box.value;
        const pos = box.selectionStart;
        renderAttendance(view);
        const again = $('#attSearch', view);
        if (again){ again.focus(); try { again.setSelectionRange(pos,pos); } catch {} }
      }, 200);
    });
  }
  $('#attDate', view).addEventListener('change', e => {
    if (!e.target.value) return;
    day = e.target.value; loadDraft(); renderAttendance(view);
  });

  view.onclick = e => {
    const step = e.target.closest('[data-day]');
    if (step){ day = addDays(day, Number(step.dataset.day)); loadDraft(); renderAttendance(view); return; }
    if (e.target.closest('[data-today]')){ day = TODAY; loadDraft(); renderAttendance(view); return; }

    const mark = e.target.closest('[data-mark]');
    if (mark){
      const id = mark.dataset.id, value = mark.dataset.mark;
      draft[id] = draft[id] === value ? '' : value;
      renderAttendance(view);
      return;
    }
    if (e.target.closest('[data-all]')){
      for (const st of listStudents({ status:'Active' })) draft[st.id] = 'present';
      renderAttendance(view);
      toast('All students marked present — remember to tap Save');
      return;
    }
    if (e.target.closest('[data-save]')){
      saveAttendanceDay(day, draft);
      toast(`Attendance saved for ${dmy(day)}`);
    }
  };
}
