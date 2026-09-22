import { $, icon, esc, initials, dmy, dayName, fmtTime, addDays, emptyState, openSheet, toast,
         field, selectField, textareaField } from '../ui.js';
import { setPage } from '../main.js';
import { lessonsOn, saveLesson, setLessonStatus, listStudents, listInstructors,
         getStudent, getInstructor, TODAY } from '../../data/store.js';

let day = TODAY;
const TIMES = ['06:00','07:00','08:00','09:00','10:00','11:00','15:00','16:00','17:00','18:00'];

export function openAddLesson(prefill = {}){
  const students = listStudents({ status:'Active' });
  const instructors = listInstructors();
  const existing = prefill.lesson;
  openSheet({
    title: existing ? 'Edit lesson' : 'Add lesson',
    body: `
      ${selectField({ name:'studentId', label:'Student', value: existing?.studentId || prefill.studentId || '',
        options: students.map(s => ({ value:s.id, label:s.name })) })}
      ${selectField({ name:'instructorId', label:'Instructor', value: existing?.instructorId || '',
        options: instructors.map(i => ({ value:i.id, label:i.name })) })}
      ${field({ name:'date', label:'Date', type:'date', value: existing?.date || day, required:true })}
      ${selectField({ name:'time', label:'Time', value: existing?.time || '07:00',
        options: TIMES.map(t => ({ value:t, label:fmtTime(t) })) })}
      ${selectField({ name:'duration', label:'Duration', value: String(existing?.duration || 60),
        options:[30,45,60,90].map(d => ({ value:String(d), label:`${d} minutes` })) })}
      ${selectField({ name:'status', label:'Status', value: existing?.status || 'Scheduled',
        options:['Scheduled','Completed','Cancelled'].map(s => ({ value:s, label:s })) })}
      ${textareaField({ name:'notes', label:'Notes (optional)', value: existing?.notes || '', rows:2 })}`,
    submitLabel: existing ? 'Save lesson' : 'Add lesson',
    onSave: data => {
      saveLesson({ ...(existing ? { id: existing.id } : {}), ...data, duration: Number(data.duration) });
      toast(existing ? 'Lesson updated' : 'Lesson added');
    },
  });
}

export function renderLessons(view){
  const lessons = lessonsOn(day);
  setPage({ title:'Lessons', sub:`${dayName(day)}, ${dmy(day)}`, back:true,
    actions:`<button class="btn btn-primary btn-sm" data-do="add">${icon('plus','icon icon-sm')}Add</button>` });

  view.innerHTML = `
    <div class="daypick">
      <button class="btn btn-icon" type="button" data-day="-1" aria-label="Previous day"
        title="Previous day">${icon('chevron-left')}</button>
      <label class="sr-only" for="lsDate">Date</label>
      <input class="control" id="lsDate" type="date" value="${day}">
      <button class="btn btn-icon" type="button" data-day="1" aria-label="Next day"
        title="Next day">${icon('chevron-right')}</button>
      ${day !== TODAY ? `<button class="btn btn-sm" type="button" data-today>Today</button>` : ''}
    </div>

    ${lessons.length ? `<div class="rows">${lessons.map(l => {
      const st = getStudent(l.studentId), ins = getInstructor(l.instructorId);
      const tone = l.status === 'Completed' ? 'pill-green'
                 : l.status === 'Cancelled' ? 'pill-red' : 'pill-blue';
      return `<div class="row-item">
        <span class="avatar avatar-sm" aria-hidden="true">${esc(initials(st?.name))}</span>
        <span class="row-main">
          <b>${fmtTime(l.time)} · ${esc(st?.name || 'Removed student')}</b>
          <span>${esc(ins?.name || 'No instructor')} · ${l.duration} minutes</span>
        </span>
        <span class="row-actions">
          <span class="pill ${tone}">${esc(l.status)}</span>
          <button class="btn btn-sm btn-icon" type="button" data-edit="${esc(l.id)}"
            aria-label="Edit the lesson for ${esc(st?.name || 'this student')}"
            title="Edit lesson">${icon('square-pen','icon icon-sm')}</button>
        </span>
      </div>`; }).join('')}</div>
      <p class="hr-note">Tap the pencil to change a lesson's time or mark it completed.</p>`
    : emptyState('clipboard-list', 'No lessons booked for this day.')}

    <button class="btn btn-primary btn-lg btn-block" style="margin-top:16px" data-do="add">
      ${icon('plus')}Add lesson</button>`;

  $('#lsDate', view).addEventListener('change', e => {
    if (e.target.value){ day = e.target.value; renderLessons(view); }
  });
  const handle = e => {
    const step = e.target.closest('[data-day]');
    if (step){ day = addDays(day, Number(step.dataset.day)); renderLessons(view); return; }
    if (e.target.closest('[data-today]')){ day = TODAY; renderLessons(view); return; }
    if (e.target.closest('[data-do="add"]')) openAddLesson();
    const edit = e.target.closest('[data-edit]');
    if (edit){
      const lesson = lessonsOn(day).find(l => l.id === edit.dataset.edit);
      if (lesson) openAddLesson({ lesson });
    }
  };
  view.addEventListener('click', handle);
  $('#topActions').onclick = handle;
}
