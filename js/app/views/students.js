import { $, icon, esc, money, initials, dmy, fmtTime, emptyState, openSheet, toast,
         field, selectField, textareaField } from '../ui.js';
import { setPage, go } from '../main.js';
import { listStudents, getStudent, saveStudent, deleteStudent, listInstructors,
         COURSES, courseById, feeSummary, paymentsFor, attendanceFor, attendanceCount,
         lessonsFor } from '../../data/store.js';
import { LICENCE_STATES } from '../../data/seed.js';
import { openAddPayment } from './fees.js';
import { openBookClass } from './schedule.js';

const filters = { q:'', status:'' };

/* ---------------- list ---------------- */
export function renderStudents(view){
  const list = listStudents(filters);
  setPage({ title:'Students', sub:`${listStudents({ status:'Active' }).length} learning right now`,
    actions:`<button class="btn btn-primary btn-sm" data-do="add">${icon('plus','icon icon-sm')}Add student</button>` });

  const instructors = listInstructors();
  view.innerHTML = `
    <div class="toolbar">
      <div class="searchbar">
        ${icon('search')}
        <label class="sr-only" for="stSearch">Search students</label>
        <input class="control" id="stSearch" type="search" placeholder="Search by student name or phone"
               value="${esc(filters.q)}" autocomplete="off">
      </div>
      <div class="chips" role="group" aria-label="Filter by status">
        ${['', 'Active', 'On hold', 'Completed'].map(s => `
          <button class="chip" type="button" data-status="${esc(s)}"
            aria-pressed="${filters.status === s}">${s || 'All Students'}</button>`).join('')}
      </div>
    </div>
    ${list.length ? `
      <div class="tcols t-students" aria-hidden="true">
        <span>Student</span><span>Course</span><span>Instructor</span>
        <span class="r">Classes</span><span class="r">Fees</span><span></span>
      </div>
      <div class="rows">${list.map(st => {
        const c = courseById(st.courseId);
        const { due } = feeSummary(st.id);
        const a = attendanceCount(st.id);
        const ins = instructors.find(i => i.id === st.instructorId);
        return `<a class="row-item trow t-students" href="#/student/${esc(st.id)}">
          <span class="row-main" style="display:flex;align-items:center;gap:11px">
            <span class="avatar avatar-sm" aria-hidden="true">${esc(initials(st.name))}</span>
            <span style="min-width:0">
              <b>${esc(st.name)}</b>
              <span>${esc(c.name)} · ${c.days} Days &nbsp;·&nbsp; ${esc(st.phone)}</span>
            </span>
          </span>
          <span class="trow-cell">${esc(c.name)} · ${c.days} Days</span>
          <span class="trow-cell">${esc(ins?.name || '—')}</span>
          <span class="trow-cell r">${a.present}/${a.total || 0}</span>
          <span class="row-side">
            ${due > 0 ? `<span class="pill pill-amber">${money(due)} due</span>`
                      : `<span class="pill pill-green">Paid</span>`}
          </span>
          ${icon('chevron-right','icon row-chev')}
        </a>`; }).join('')}</div>`
    : emptyState('users', filters.q || filters.status
        ? 'No student matches this search.' : 'No students registered yet.')}
    <p class="hr-note">${list.length} of ${listStudents().length} students. Tap any student to open profile & records.</p>`;

  const search = $('#stSearch', view);
  let t;
  search.addEventListener('input', () => {
    clearTimeout(t);
    t = setTimeout(() => {
      filters.q = search.value;
      const pos = search.selectionStart;
      renderStudents(view);
      const again = $('#stSearch', view);
      again.focus(); try { again.setSelectionRange(pos, pos); } catch {}
    }, 200);
  });
  view.onclick = e => {
    const chip = e.target.closest('[data-status]');
    if (chip){ filters.status = chip.dataset.status; renderStudents(view); return; }
    if (e.target.closest('[data-do="add"]')) openAddStudent();
  };
  $('#topActions').onclick = e => { if (e.target.closest('[data-do="add"]')) openAddStudent(); };
}

/* ---------------- 5-field quick add form ---------------- */
function addStudentFormBody(st = {}){
  const instructors = listInstructors();
  return `
    ${field({ name:'name', label:'Student Full Name', value:st.name, required:true,
              attrs:'placeholder="e.g. Jaspreet Singh" autofocus' })}
    ${field({ name:'phone', label:'Phone Number', type:'tel', value:st.phone, required:true,
              attrs:'inputmode="tel" placeholder="+91 98765 43210"' })}
    ${selectField({ name:'courseId', label:'Course Package', value:st.courseId || 'c-car30',
      options: COURSES.map(c => ({ value:c.id, label:`${c.label} — ${money(c.fee)}` })) })}
    ${selectField({ name:'instructorId', label:'Assigned Instructor', value:st.instructorId || instructors[0]?.id,
      options: instructors.map(i => ({ value:i.id, label:i.name })) })}
    ${field({ name:'fee', label:'Agreed Fee (₹)', type:'number', value:st.fee,
              attrs:'min="0" step="1" placeholder="Leave empty for standard fee"',
              hint:'Leave blank to automatically use standard course fee.' })}`;
}

/* ---------------- full edit form ---------------- */
function editStudentFormBody(st = {}){
  const instructors = listInstructors();
  return `
    ${field({ name:'name', label:'Full name', value:st.name, required:true })}
    ${field({ name:'phone', label:'Phone number', type:'tel', value:st.phone, required:true,
              attrs:'inputmode="tel"' })}
    ${selectField({ name:'courseId', label:'Course', value:st.courseId,
      options: COURSES.map(c => ({ value:c.id, label:`${c.label} — ${money(c.fee)}` })) })}
    ${selectField({ name:'instructorId', label:'Instructor', value:st.instructorId,
      options: instructors.map(i => ({ value:i.id, label:i.name })) })}
    ${field({ name:'joinedOn', label:'Joined on', type:'date', value:st.joinedOn })}
    ${field({ name:'fee', label:'Course fee (₹)', type:'number', value:st.fee,
              attrs:'min="0" step="1"' })}
    ${selectField({ name:'licence', label:'Licence status', value:st.licence,
      options: LICENCE_STATES.map(l => ({ value:l, label:l })) })}
    ${selectField({ name:'status', label:'Student status', value:st.status,
      options:['Active','On hold','Completed'].map(s => ({ value:s, label:s })) })}
    ${field({ name:'area', label:'Area in Bathinda', value:st.area })}
    ${textareaField({ name:'notes', label:'Notes', value:st.notes })}`;
}

export function openAddStudent(prefill = {}){
  openSheet({
    title:'Add New Student',
    body: addStudentFormBody(prefill),
    submitLabel:'Register Student',
    onSave: data => {
      const created = saveStudent({
        ...data,
        joinedOn: new Date().toISOString().slice(0,10),
        licence: 'None',
        status: 'Active',
        fee: data.fee === '' ? undefined : Number(data.fee)
      });
      toast(`${created.name} added successfully!`);
      prefill.onCreated?.(created);
      go('#/student/' + created.id);
    },
  });
}

function openEditStudent(st){
  openSheet({
    title:'Edit Student Details',
    body: editStudentFormBody(st),
    submitLabel:'Save Changes',
    onSave: data => {
      saveStudent({ ...st, ...data, fee: Number(data.fee) });
      toast('Student details updated');
    },
  });
}

/* ---------------- profile ---------------- */
let activeTab = 'overview';

export function renderStudentProfile(view, id){
  const st = getStudent(id);
  if (!st){
    setPage({ title:'Student', back:true });
    view.innerHTML = emptyState('users', 'This student no longer exists.',
      `<p style="margin-top:14px"><a class="btn" href="#/students">Back to students</a></p>`);
    return;
  }
  const course = courseById(st.courseId);
  const { fee, paid, due } = feeSummary(st.id);
  const att = attendanceCount(st.id);
  const instructor = listInstructors().find(i => i.id === st.instructorId);

  setPage({ title: st.name, sub:`${course.name} · ${course.days} Days`, back:true,
    actions:`<button class="btn btn-sm" data-do="edit">${icon('square-pen','icon icon-sm')}Edit</button>` });

  view.innerHTML = `
    <div class="profile-head">
      <span class="avatar avatar-lg" aria-hidden="true">${esc(initials(st.name))}</span>
      <div style="flex:1;min-width:0">
        <p style="font-size:16px;color:var(--ink);font-weight:700">${esc(course.label)}</p>
        <p>Instructor: ${esc(instructor?.name || 'Not assigned')} &nbsp;·&nbsp; Joined ${esc(dmy(st.joinedOn))}</p>
        <p style="margin-top:8px;display:flex;gap:7px;flex-wrap:wrap">
          <span class="pill ${st.status === 'Active' ? 'pill-blue' : ''}">${esc(st.status)}</span>
          <a class="pill" href="tel:${esc(st.phone.replace(/\s/g,''))}">${esc(st.phone)}</a>
        </p>
      </div>
    </div>

    <div class="keyfacts">
      <div class="keyfact"><b>${money(fee)}</b><span>Course Fee</span></div>
      <div class="keyfact paid"><b>${money(paid)}</b><span>Paid</span></div>
      <div class="keyfact due"><b>${money(due)}</b><span>Remaining</span></div>
      <div class="keyfact"><b>${att.present}/${att.total || 0}</b><span>Classes Attended</span></div>
      <div class="keyfact wide"><b>${esc(st.licence)}</b><span>Licence</span></div>
    </div>

    <div class="tabs" role="tablist">
      ${['overview','attendance','payments','lessons','notes'].map(t => `
        <button class="tab" role="tab" data-tab="${t}" aria-selected="${activeTab === t}">
          ${t[0].toUpperCase() + t.slice(1)}</button>`).join('')}
    </div>
    <div id="tabPanel" role="tabpanel"></div>`;

  const panel = $('#tabPanel', view);
  const draw = () => { panel.innerHTML = tabContent(activeTab, st, course, instructor); };
  draw();

  view.onclick = e => {
    const tab = e.target.closest('[data-tab]');
    if (tab){
      activeTab = tab.dataset.tab;
      view.querySelectorAll('[data-tab]').forEach(b =>
        b.setAttribute('aria-selected', String(b.dataset.tab === activeTab)));
      draw();
      return;
    }
    if (e.target.closest('[data-do="pay"]')) openAddPayment(st.id);
    if (e.target.closest('[data-do="lesson"]')) openBookClass({ studentId: st.id });
    if (e.target.closest('[data-do="remove"]')) removeStudent(st);
  };
  $('#topActions').onclick = e => { if (e.target.closest('[data-do="edit"]')) openEditStudent(st); };
}

function tabContent(tab, st, course, instructor){
  if (tab === 'overview'){
    return `<dl class="deflist">
        <div><dt>Phone</dt><dd><a href="tel:${esc(st.phone.replace(/\s/g,''))}">${esc(st.phone)}</a></dd></div>
        <div><dt>Course</dt><dd>${esc(course.label)}</dd></div>
        <div><dt>Instructor</dt><dd>${esc(instructor?.name || 'Not assigned')}</dd></div>
        <div><dt>Class time</dt><dd>${fmtTime(st.slot)}</dd></div>
        <div><dt>Joined on</dt><dd>${dmy(st.joinedOn)}</dd></div>
        <div><dt>Area</dt><dd>${esc(st.area || '—')}</dd></div>
        <div><dt>Licence status</dt><dd>${esc(st.licence)}</dd></div>
      </dl>
      <div class="quick" style="margin-top:18px">
        <button class="btn btn-primary" data-do="pay">${icon('banknote')}Record Fee Payment</button>
        <button class="btn" data-do="lesson">${icon('plus')}Book Next Lesson</button>
      </div>
      <p style="margin-top:8px"><button class="btn btn-sm btn-danger" data-do="remove">
        ${icon('trash-2','icon icon-sm')}Remove student</button></p>`;
  }

  if (tab === 'attendance'){
    const rows = attendanceFor(st.id);
    if (!rows.length) return emptyState('calendar-check', 'No attendance recorded yet.');
    return `<div class="rows">${rows.map(a => `
      <div class="row-item">
        <span class="row-main"><b>${dmy(a.date)}</b><span>${esc(dayNameOf(a.date))}</span></span>
        <span class="row-side"><span class="pill ${a.status === 'present' ? 'pill-green' : 'pill-red'}">
          ${a.status === 'present' ? 'Present' : 'Absent'}</span></span>
      </div>`).join('')}</div>`;
  }

  if (tab === 'payments'){
    const rows = paymentsFor(st.id);
    const { due } = feeSummary(st.id);
    return `<div class="total-line">
        <span>Remaining balance</span><b>${money(due)}</b></div>
      ${rows.length ? `<div class="rows">${rows.map(p => `
        <div class="row-item">
          <span class="row-main"><b>${money(p.amount)}</b>
            <span>${dmy(p.date)} · ${esc(p.method)}${p.note ? ' · ' + esc(p.note) : ''}</span></span>
        </div>`).join('')}</div>` : emptyState('banknote', 'No payments recorded yet.')}
      <p style="margin-top:14px"><button class="btn btn-primary btn-block" data-do="pay">
        ${icon('plus')}Record Fee Payment</button></p>`;
  }

  if (tab === 'lessons'){
    const rows = lessonsFor(st.id);
    return `${rows.length ? `<div class="rows">${rows.map(l => `
        <div class="row-item">
          <span class="row-main"><b>${dmy(l.date)} · ${fmtTime(l.time)}</b>
            <span>${l.duration} minutes</span></span>
          <span class="row-side"><span class="pill ${l.status === 'Completed' ? 'pill-green'
            : l.status === 'Cancelled' ? 'pill-red' : 'pill-blue'}">${esc(l.status)}</span></span>
        </div>`).join('')}</div>` : emptyState('clipboard-list', 'No lessons yet.')}
      <p style="margin-top:14px"><button class="btn btn-primary btn-block" data-do="lesson">
        ${icon('plus')}Book Next Lesson</button></p>`;
  }

  return `<div class="rows"><div class="row-item"><span class="row-main">
    ${st.notes ? esc(st.notes) : '<span class="muted">No notes for this student.</span>'}
    </span></div></div>`;
}

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const dayNameOf = iso => DAYS[new Date(iso + 'T12:00:00').getDay()];

function removeStudent(st){
  openSheet({
    title:'Remove student',
    body:`<p>Remove <b>${esc(st.name)}</b> from the demo?</p>
      <p class="muted small" style="margin-top:10px">Their attendance, payments and lessons
      will be removed too.</p>`,
    submitLabel:'Remove',
    onSave: () => { deleteStudent(st.id); toast(`${st.name} removed`); go('#/students'); },
  });
}
