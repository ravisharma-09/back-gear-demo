import { $, icon, esc, initials, dmy, dayName, fmtTime, addDays, emptyState,
         openSheet, closeSheet, toast, field, selectField, textareaField, showFormErrors } from '../ui.js';
import { setPage, go } from '../main.js';
import { lessonsOn, saveLesson, completeLesson, cancelLesson, startLesson,
         listStudents, listInstructors, listVehicles, freeVehicles, freeInstructors,
         checkBooking, getStudent, getInstructor, getVehicle, courseById,
         attendanceCount, TODAY } from '../../data/store.js';

let day = TODAY;
const TIMES = ['06:00','07:00','08:00','09:00','10:00','11:00','15:00','16:00','17:00','18:00'];

/* ================= Book a class ================= */
export function openBookClass(prefill = {}){
  const students = listStudents({ status:'Active' });
  if (!students.length){
    toast('Add a student first', 'error');
    return;
  }
  const chosen = students.find(s => s.id === prefill.studentId) || students[0];
  const body = bookingForm({ student: chosen, date: prefill.date || day, lesson: prefill.lesson });

  openSheet({
    title: prefill.lesson ? 'Change this class' : 'Book a class',
    body,
    submitLabel: prefill.lesson ? 'Save changes' : 'Confirm booking',
    onSave: data => {
      const problems = checkBooking({
        date: data.date, time: data.time, duration: Number(data.duration) || 60,
        instructorId: data.instructorId, vehicleId: data.vehicleId,
        exceptLessonId: prefill.lesson?.id,
      });
      if (problems.length){
        const fields = {};
        problems.forEach(p => { fields[p.field] = p.message; });
        const err = new Error('Please pick a free time'); err.fields = fields;
        throw err;
      }
      const saved = saveLesson({
        ...(prefill.lesson ? { id: prefill.lesson.id } : {}),
        studentId: data.studentId, instructorId: data.instructorId, vehicleId: data.vehicleId,
        date: data.date, time: data.time, duration: Number(data.duration) || 60,
        status: prefill.lesson?.status || 'Scheduled', notes: data.notes || '',
      });
      const who = getStudent(saved.studentId)?.name || 'The student';
      toast(`Class booked. ${who} on ${dmy(saved.date)} at ${fmtTime(saved.time)}.`);
      day = saved.date;
    },
  });
}

/** Sensible defaults: the student's usual trainer, usual time, and a car that is free. */
function bookingForm({ student, date, lesson }){
  const students = listStudents({ status:'Active' });
  const time = lesson?.time || student.slot || '07:00';
  const trainerId = lesson?.instructorId || student.instructorId;
  const course = courseById(student.courseId);
  const wantsScooter = course.vehicle === 'Scooter / Bike';
  const free = freeVehicles(date, time, 60, lesson?.id)
    .filter(v => wantsScooter ? v.type === 'Scooter' : v.type === 'Car');
  const vehicleId = lesson?.vehicleId || free[0]?.id || listVehicles()[0]?.id;

  return `
    <p class="sheet-lead">Five quick choices. We check the trainer and the car are free.</p>

    <div class="step-group">
      <div class="step-label"><span>1</span> Which student?</div>
      ${selectField({ name:'studentId', label:'Student', value: student.id,
        options: students.map(s => ({ value:s.id, label:`${s.name} — ${courseById(s.courseId).name}` })) })}
    </div>

    <div class="step-group">
      <div class="step-label"><span>2</span> When?</div>
      <div class="field-row">
        ${field({ name:'date', label:'Date', type:'date', value:date, required:true })}
        ${selectField({ name:'time', label:'Time', value:time,
          options: TIMES.map(t => ({ value:t, label:fmtTime(t) })) })}
      </div>
    </div>

    <div class="step-group">
      <div class="step-label"><span>3</span> Which trainer?</div>
      ${selectField({ name:'instructorId', label:'Trainer', value: trainerId,
        options: listInstructors().map(i => ({ value:i.id, label:i.name })) })}
    </div>

    <div class="step-group">
      <div class="step-label"><span>4</span> Which car?</div>
      ${selectField({ name:'vehicleId', label:'Car', value: vehicleId,
        options: listVehicles().map(v => ({ value:v.id, label:`${v.name} (${v.type})` })) })}
      <p class="hint">${free.length
        ? 'Free right now: ' + free.map(v => v.name).join(', ')
        : 'Every car is busy at this time. Pick another time.'}</p>
    </div>

    <div class="step-group">
      <div class="step-label"><span>5</span> Anything to note?</div>
      ${selectField({ name:'duration', label:'How long', value:'60',
        options:[30,45,60,90].map(d => ({ value:String(d), label:`${d} minutes` })) })}
      ${textareaField({ name:'notes', label:'Note (optional)', value: lesson?.notes || '', rows:2 })}
    </div>`;
}

/* ================= The schedule screen ================= */
export function renderSchedule(view){
  const classes = lessonsOn(day);
  const isToday = day === TODAY;

  setPage({ title:'Schedule', sub:`${dayName(day)}, ${dmy(day)}`,
    actions:`<button class="btn btn-primary btn-sm" data-do="book">${icon('plus','icon icon-sm')}Book Class</button>` });

  view.innerHTML = `
    <div class="daypick">
      <button class="btn btn-icon" type="button" data-day="-1" aria-label="Previous day"
        title="Previous day">${icon('chevron-left')}</button>
      <label class="sr-only" for="schDate">Date</label>
      <input class="control" id="schDate" type="date" value="${day}">
      <button class="btn btn-icon" type="button" data-day="1" aria-label="Next day"
        title="Next day">${icon('chevron-right')}</button>
      ${isToday ? '' : `<button class="btn btn-sm" type="button" data-today>Today</button>`}
    </div>

    ${classes.length ? `<div class="class-list">${classes.map(classCard).join('')}</div>`
      : emptyState('calendar-days', isToday ? 'No classes booked for today.' : 'No classes booked for this day.',
          `<p style="margin-top:14px"><button class="btn btn-primary" data-do="book">
             ${icon('plus')}Book a class</button></p>`)}

    <button class="btn btn-primary btn-lg btn-block" style="margin-top:20px" data-do="book">
      ${icon('plus')}Book Class</button>`;

  $('#schDate', view).addEventListener('change', e => {
    if (e.target.value){ day = e.target.value; renderSchedule(view); }
  });

  const handle = async e => {
    const step = e.target.closest('[data-day]');
    if (step){ day = addDays(day, Number(step.dataset.day)); renderSchedule(view); return; }
    if (e.target.closest('[data-today]')){ day = TODAY; renderSchedule(view); return; }
    if (e.target.closest('[data-do="book"]')) return openBookClass({ date: day });

    const change = e.target.closest('[data-change]');
    if (change){
      const lesson = lessonsOn(day).find(l => l.id === change.dataset.change);
      if (lesson) openBookClass({ lesson, studentId: lesson.studentId, date: lesson.date });
      return;
    }
    const done = e.target.closest('[data-complete]');
    if (done){
      const l = completeLesson(done.dataset.complete);
      const st = getStudent(l.studentId);
      const count = attendanceCount(l.studentId);
      const total = courseById(st?.courseId).days;
      const done = Math.min(count.present, total);
      toast(done >= total
        ? `Class complete. ${st?.name?.split(' ')[0] || 'They'} has finished all ${total} classes.`
        : `Class complete. ${st?.name?.split(' ')[0] || 'They'} has now done ${done} of ${total} classes.`);
      return;
    }
    const drop = e.target.closest('[data-cancel]');
    if (drop){
      cancelLesson(drop.dataset.cancel);
      toast('Class cancelled');
    }
  };
  view.addEventListener('click', handle);
  $('#topActions').onclick = handle;
}

function classCard(l){
  const st = getStudent(l.studentId);
  const trainer = getInstructor(l.instructorId);
  const car = getVehicle(l.vehicleId);
  const done = l.status === 'Completed';
  const cancelled = l.status === 'Cancelled';
  const tone = done ? 'pill-green' : cancelled ? 'pill-red'
             : l.status === 'In progress' ? 'pill-amber' : 'pill-blue';
  const label = l.status === 'In progress' ? 'Going on' : l.status;

  return `<article class="class-card${cancelled ? ' is-off' : ''}">
    <div class="cc-time">${fmtTime(l.time)}</div>
    <div class="cc-body">
      <a class="cc-name" href="#/student/${esc(l.studentId)}">${esc(st?.name || 'Student removed')}</a>
      <div class="cc-meta">
        <span>${icon('user-check','icon icon-sm')} ${esc(trainer?.name || 'No trainer')}</span>
        <span>${icon('car','icon icon-sm')} ${esc(car?.name || 'No car')}</span>
      </div>
    </div>
    <div class="cc-side">
      <span class="pill ${tone}">${esc(label)}</span>
      ${done || cancelled ? '' : `
        <div class="cc-actions">
          <button class="btn btn-sm btn-green" data-complete="${esc(l.id)}">Mark done</button>
          <button class="btn btn-sm" data-change="${esc(l.id)}">Change</button>
        </div>`}
    </div>
  </article>`;
}
