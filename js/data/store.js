/* ==================================================================
   The mock data service.

   Every screen talks to THIS file and nothing else. It keeps the demo
   data in the browser (localStorage) so the prototype feels real for
   the length of a demo.

   >>> PROTOTYPE STORAGE ONLY. This is not a database and is not secure.
   >>> When the real backend exists, each function below becomes a
   >>> fetch() call and the screens stay exactly as they are.
   ================================================================== */
import { buildSeed, courseById, COURSES, TODAY, VEHICLE_STATUS, DEMO_ACCOUNTS } from './seed.js';
import { require as needs, requireOwnInstructor, isTrainer, getActor,
         PermissionError } from './permissions.js';
export { setActor, can, isTrainer, isAdmin, roleLabel, PermissionError } from './permissions.js';

const KEY = 'backgear.demo.v2';
const listeners = new Set();
let db = load();

function load(){
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { const parsed = JSON.parse(raw); if (parsed && parsed.students) return parsed; }
  } catch { /* private window, blocked storage - fall through to fresh data */ }
  return buildSeed();
}
function save(){
  try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { /* demo still works in memory */ }
  listeners.forEach(fn => fn());
}
export const onChange = fn => { listeners.add(fn); return () => listeners.delete(fn); };
export function resetDemo(){ db = buildSeed(); save(); }

const clone = v => (v === undefined || v === null) ? null : JSON.parse(JSON.stringify(v));
const nextId = (list, prefix) => prefix + (list.reduce((m, r) =>
  Math.max(m, Number(String(r.id).replace(/\D/g, '')) || 0), 100) + 1);

/* ---------------- students ---------------- */
export const listStudents = ({ q = '', status = '', instructorId = '', courseId = '' } = {}) => {
  const needle = q.trim().toLowerCase();
  // a trainer only ever receives their own students, whatever they ask for
  const mine = isTrainer() ? getActor().instructorId : instructorId;
  if (isTrainer()) instructorId = mine;
  return clone(db.students)
    .filter(s => !status || s.status === status)
    .filter(s => !instructorId || s.instructorId === instructorId)
    .filter(s => !courseId || s.courseId === courseId)
    .filter(s => !needle || s.name.toLowerCase().includes(needle) ||
                 s.phone.replace(/\s/g,'').includes(needle.replace(/\s/g,'')) ||
                 s.id.toLowerCase().includes(needle))
    .sort((a, b) => a.name.localeCompare(b.name));
};
export const getStudent = id => {
  const s = db.students.find(x => x.id === id);
  if (!s) return null;
  if (isTrainer() && s.instructorId !== getActor().instructorId) return null;
  return clone(s);
};

export function saveStudent(data){
  needs('students.write');
  const errors = validateStudent(data);
  if (errors) throw new ValidationError(errors);
  if (data.id){
    const i = db.students.findIndex(s => s.id === data.id);
    if (i < 0) throw new Error('That student no longer exists.');
    db.students[i] = { ...db.students[i], ...data };
    save();
    return clone(db.students[i]);
  }
  const record = {
    id: nextId(db.students, 'S'), paid: 0, status:'Active', notes:'',
    licence:'Not applied', joinedOn: TODAY, slot:'07:00',
    ...data,
    fee: Number(data.fee) || courseById(data.courseId).fee,
  };
  db.students.push(record);
  save();
  return clone(record);
}
export function deleteStudent(id){
  needs('students.delete');
  db.students = db.students.filter(s => s.id !== id);
  db.attendance = db.attendance.filter(a => a.studentId !== id);
  db.payments   = db.payments.filter(p => p.studentId !== id);
  db.lessons    = db.lessons.filter(l => l.studentId !== id);
  save();
}

/** A rule stopped this, and the message explains what to do about it. */
export class BlockedError extends Error {
  constructor(message){ super(message); this.name = 'BlockedError'; }
}
export class ValidationError extends Error {
  constructor(fields){ super('Please check the highlighted fields.'); this.fields = fields; }
}
function validateStudent(d){
  const e = {};
  if (!d.name || d.name.trim().length < 2) e.name = 'Enter the student’s full name.';
  if (!d.phone || d.phone.replace(/\D/g,'').length < 10) e.phone = 'Enter a 10 digit phone number.';
  if (!d.courseId) e.courseId = 'Choose a course.';
  if (!d.instructorId) e.instructorId = 'Choose an instructor.';
  if (d.fee !== undefined && d.fee !== '' && Number(d.fee) < 0) e.fee = 'Fee cannot be negative.';
  return Object.keys(e).length ? e : null;
}

/* ---------------- money ---------------- */
export const paymentsFor = id => clone(db.payments.filter(p => p.studentId === id))
  .sort((a, b) => b.date.localeCompare(a.date));
export const paidTotal = id => db.payments.filter(p => p.studentId === id)
  .reduce((t, p) => t + Number(p.amount || 0), 0);
export function feeSummary(id){
  const st = db.students.find(s => s.id === id);
  if (!st) return { fee:0, paid:0, due:0 };
  const paid = paidTotal(id);
  return { fee: st.fee, paid, due: Math.max(0, st.fee - paid) };
}
export function addPayment({ studentId, amount, date, method, note }){
  needs('payments.write');
  const value = Number(amount);
  if (!studentId) throw new ValidationError({ studentId:'Choose a student.' });
  if (!value || value <= 0) throw new ValidationError({ amount:'Enter an amount greater than zero.' });
  if (!date) throw new ValidationError({ date:'Choose a date.' });
  const row = { id: nextId(db.payments, 'P'), studentId, amount: value, date,
                method: method || 'Cash', note: note || '' };
  db.payments.push(row);
  const st = db.students.find(s => s.id === studentId);
  if (st) st.paid = paidTotal(studentId);
  save();
  return clone(row);
}
export const allPayments = () => clone(db.payments).sort((a,b) => b.date.localeCompare(a.date));
export const totalPending = () => db.students
  .filter(s => s.status !== 'Closed')
  .reduce((t, s) => t + Math.max(0, s.fee - paidTotal(s.id)), 0);

/* ---------------- attendance ---------------- */
export const attendanceOn = date => clone(db.attendance.filter(a => a.date === date));
export const attendanceFor = id => clone(db.attendance.filter(a => a.studentId === id))
  .sort((a,b) => b.date.localeCompare(a.date));
export function attendanceCount(id){
  const rows = db.attendance.filter(a => a.studentId === id);
  return { present: rows.filter(r => r.status === 'present').length, total: rows.length };
}
export function setAttendance(studentId, date, status){
  const i = db.attendance.findIndex(a => a.studentId === studentId && a.date === date);
  if (!status){ if (i >= 0) db.attendance.splice(i, 1); }
  else if (i >= 0) db.attendance[i].status = status;
  else db.attendance.push({ id:`A-${studentId}-${date}`, studentId, date, status });
  save();
}
/** Applies a whole day at once - used by "Mark all present" and "Save attendance". */
export function saveAttendanceDay(date, marks){
  db.attendance = db.attendance.filter(a => a.date !== date);
  for (const [studentId, status] of Object.entries(marks)){
    if (status) db.attendance.push({ id:`A-${studentId}-${date}`, studentId, date, status });
  }
  save();
}

/* ---------------- lessons ---------------- */
export const lessonsOn = date => clone(db.lessons.filter(l => l.date === date))
  .sort((a,b) => a.time.localeCompare(b.time));
export const lessonsFor = id => clone(db.lessons.filter(l => l.studentId === id))
  .sort((a,b) => (b.date + b.time).localeCompare(a.date + a.time));
export function saveLesson(data){
  needs('schedule.write');
  const e = {};
  if (!data.studentId) e.studentId = 'Choose a student.';
  if (!data.instructorId) e.instructorId = 'Choose an instructor.';
  if (!data.date) e.date = 'Choose a date.';
  if (!data.time) e.time = 'Choose a time.';
  if (Object.keys(e).length) throw new ValidationError(e);
  if (data.id){
    const i = db.lessons.findIndex(l => l.id === data.id);
    if (i >= 0) db.lessons[i] = { ...db.lessons[i], ...data };
    save();
    return clone(db.lessons[i]);
  }
  const row = { id: nextId(db.lessons, 'L'), duration:60, status:'Scheduled', notes:'', ...data };
  db.lessons.push(row);
  save();
  return clone(row);
}
export function setLessonStatus(id, status){
  const l = db.lessons.find(x => x.id === id);
  if (l){ l.status = status; save(); }
}

/* ---------------- cars and scooters ---------------- */
export const listVehicles = ({ includeRetired = false } = {}) =>
  clone((db.vehicles || []).filter(v => includeRetired || v.status !== 'Retired'));
export const getVehicle = id => clone((db.vehicles || []).find(v => v.id === id));
/** Cars that can actually take a class right now. */
export const usableVehicles = () =>
  clone((db.vehicles || []).filter(v => v.status === 'Available'));

export function saveVehicle(data){
  needs('vehicles.write');
  // an update only has to send what is changing, so merge before checking
  const existing = data.id ? (db.vehicles || []).find(v => v.id === data.id) : null;
  const merged = { type:'Car', status:'Available', ...(existing || {}), ...data };
  const e = {};
  if (!merged.name || !String(merged.name).trim()) e.name = 'Give the vehicle a name, like Swift.';
  if (!merged.reg || String(merged.reg).trim().length < 4) e.reg = 'Enter the number plate.';
  if (Object.keys(e).length) throw new ValidationError(e);
  const row = { ...merged,
    name: String(merged.name).trim(), reg: String(merged.reg).trim().toUpperCase() };
  if (data.id){
    const i = db.vehicles.findIndex(v => v.id === data.id);
    if (i >= 0) db.vehicles[i] = { ...db.vehicles[i], ...row };
  } else {
    row.id = nextId(db.vehicles, 'v');
    db.vehicles.push(row);
  }
  save();
  return clone(row);
}
/** What would break if this car went away. */
export function vehicleLoad(id){
  const upcoming = db.lessons.filter(l => l.vehicleId === id && l.date >= TODAY &&
    l.status !== 'Cancelled' && l.status !== 'Completed');
  return { upcoming: upcoming.length, lessons: clone(upcoming) };
}
export function deleteVehicle(id){
  needs('vehicles.delete');
  const { upcoming } = vehicleLoad(id);
  if (upcoming > 0){
    const v = db.vehicles.find(x => x.id === id);
    throw new BlockedError(
      `${v?.name || 'This car'} is booked for ${upcoming} upcoming ${upcoming === 1 ? 'class' : 'classes'}. ` +
      `Move those classes to another car before removing it.`);
  }
  db.vehicles = db.vehicles.filter(v => v.id !== id);
  save();
}

/* ---------------- trainers ---------------- */
export function saveInstructor(data){
  needs('trainers.write');
  const e = {};
  if (!data.name || data.name.trim().length < 2) e.name = 'Enter the trainer\u2019s name.';
  if (!data.phone || data.phone.replace(/\D/g,'').length < 10) e.phone = 'Enter a 10 digit phone number.';
  if (Object.keys(e).length) throw new ValidationError(e);
  const row = { active:true, languages:'', ...data, name: data.name.trim(), phone: data.phone.trim() };
  if (data.id){
    const i = db.instructors.findIndex(x => x.id === data.id);
    if (i >= 0) db.instructors[i] = { ...db.instructors[i], ...row };
  } else {
    row.id = nextId(db.instructors, 'i');
    row.joined = TODAY;
    db.instructors.push(row);
  }
  save();
  return clone(row);
}
/** Students and future classes still attached to this trainer. */
export function instructorLoad(id){
  const students = db.students.filter(s => s.instructorId === id && s.status !== 'Dropped');
  const upcoming = db.lessons.filter(l => l.instructorId === id && l.date >= TODAY &&
    l.status !== 'Cancelled' && l.status !== 'Completed');
  return { students: students.length, upcoming: upcoming.length };
}
/** Hand every student and future class to another trainer. */
export function reassignInstructor(fromId, toId){
  needs('trainers.write');
  if (!db.instructors.some(i => i.id === toId)) throw new BlockedError('Choose a trainer to move them to.');
  let students = 0, lessons = 0;
  for (const s of db.students) if (s.instructorId === fromId){ s.instructorId = toId; students++; }
  for (const l of db.lessons)
    if (l.instructorId === fromId && l.date >= TODAY && l.status !== 'Completed' && l.status !== 'Cancelled'){
      l.instructorId = toId; lessons++;
    }
  save();
  return { students, lessons };
}
export function deleteInstructor(id){
  needs('trainers.delete');
  const { students, upcoming } = instructorLoad(id);
  if (students || upcoming){
    const who = db.instructors.find(i => i.id === id)?.name || 'This trainer';
    const bits = [];
    if (students) bits.push(`${students} ${students === 1 ? 'student' : 'students'}`);
    if (upcoming) bits.push(`${upcoming} upcoming ${upcoming === 1 ? 'class' : 'classes'}`);
    throw new BlockedError(`${who} has ${bits.join(' and ')}. Please reassign them before removing this trainer.`);
  }
  db.instructors = db.instructors.filter(i => i.id !== id);
  save();
}

/* ---------------- correcting a payment ---------------- */
export function updatePayment(id, data){
  needs('payments.write');
  const p = db.payments.find(x => x.id === id);
  if (!p) return null;
  const value = Number(data.amount);
  if (!value || value <= 0) throw new ValidationError({ amount:'Enter an amount greater than zero.' });
  Object.assign(p, { amount:value, date:data.date || p.date, method:data.method || p.method,
                     note:data.note ?? p.note });
  const st = db.students.find(s => s.id === p.studentId);
  if (st) st.paid = paidTotal(p.studentId);
  save();
  return clone(p);
}
export function deletePayment(id){
  needs('payments.write');
  const p = db.payments.find(x => x.id === id);
  if (!p) return;
  const studentId = p.studentId;
  db.payments = db.payments.filter(x => x.id !== id);
  const st = db.students.find(s => s.id === studentId);
  if (st) st.paid = paidTotal(studentId);
  save();
}
export const getPayment = id => clone(db.payments.find(p => p.id === id));

const mins = t => { const [h, m] = String(t).split(':').map(Number); return h * 60 + (m || 0); };
const overlaps = (aStart, aLen, bStart, bLen) =>
  mins(aStart) < mins(bStart) + bLen && mins(bStart) < mins(aStart) + aLen;

/**
 * Is this slot free? Returns plain sentences the owner can act on,
 * never codes or technical wording.
 *   checkBooking({date, time, duration, instructorId, vehicleId})
 */
export function checkBooking({ date, time, duration = 60, instructorId, vehicleId, exceptLessonId }){
  const problems = [];
  const sameDay = db.lessons.filter(l =>
    l.date === date && l.id !== exceptLessonId && l.status !== 'Cancelled');

  const clashTrainer = sameDay.find(l =>
    l.instructorId === instructorId && overlaps(time, duration, l.time, l.duration || 60));
  if (clashTrainer){
    const who = db.instructors.find(i => i.id === instructorId)?.name || 'That trainer';
    const withWhom = db.students.find(s => s.id === clashTrainer.studentId)?.name || 'another student';
    problems.push({
      field:'instructorId',
      message:`${who} is already teaching ${withWhom} at ${pretty(clashTrainer.time)}. Pick another trainer or another time.`
    });
  }

  const clashVehicle = sameDay.find(l =>
    l.vehicleId === vehicleId && overlaps(time, duration, l.time, l.duration || 60));
  if (clashVehicle){
    const car = (db.vehicles || []).find(v => v.id === vehicleId)?.name || 'That car';
    const free = (db.vehicles || []).filter(v => v.status === 'Available' && v.id !== vehicleId &&
      !sameDay.some(l => l.vehicleId === v.id && overlaps(time, duration, l.time, l.duration || 60)));
    const suggestion = free.length
      ? `Choose ${free.slice(0,2).map(v => v.name).join(' or ')}, or another time.`
      : 'Every car is busy then. Try another time.';
    problems.push({
      field:'vehicleId',
      message:`${car} is already booked at ${pretty(clashVehicle.time)}. ${suggestion}`
    });
  }
  return problems;
}
function pretty(t){
  const [h, m] = String(t).split(':').map(Number);
  const ap = h < 12 ? 'AM' : 'PM', hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${String(m).padStart(2,'0')} ${ap}`;
}

/** Which cars are free for this slot — used to preselect a sensible default. */
export function freeVehicles(date, time, duration = 60, exceptLessonId){
  const taken = db.lessons.filter(l => l.date === date && l.id !== exceptLessonId &&
    l.status !== 'Cancelled' && overlaps(time, duration, l.time, l.duration || 60))
    .map(l => l.vehicleId);
  return listVehicles().filter(v => !taken.includes(v.id));
}
export function freeInstructors(date, time, duration = 60, exceptLessonId){
  const taken = db.lessons.filter(l => l.date === date && l.id !== exceptLessonId &&
    l.status !== 'Cancelled' && overlaps(time, duration, l.time, l.duration || 60))
    .map(l => l.instructorId);
  return listInstructors().filter(i => !taken.includes(i.id));
}

/* ---------------- a class from start to finish ---------------- */
export function startLesson(id){
  needs('lesson.start');
  const l = db.lessons.find(x => x.id === id);
  if (!l) return null;
  requireOwnInstructor(l.instructorId, 'lesson.start');
  l.status = 'In progress'; save();
  return clone(l);
}
/** Finishing a class marks the student present for that day too. */
export function completeLesson(id, { notes = '', rating = 0, practise = '' } = {}){
  needs('lesson.complete');
  const l = db.lessons.find(x => x.id === id);
  if (!l) return null;
  requireOwnInstructor(l.instructorId, 'lesson.complete');
  l.status = 'Completed';
  if (notes) l.notes = notes;
  if (rating) l.rating = Number(rating);
  if (practise) l.practise = practise;
  setAttendance(l.studentId, l.date, 'present');
  save();
  return clone(l);
}
export function cancelLesson(id, reason = ''){
  needs('schedule.write');
  const l = db.lessons.find(x => x.id === id);
  if (l){ l.status = 'Cancelled'; if (reason) l.notes = reason; save(); }
  return clone(l);
}
/** A trainer cannot move a class. They ask the admin, who sees it under Requests. */
export function requestScheduleChange(id, note = ''){
  needs('schedule.request');
  const l = db.lessons.find(x => x.id === id);
  if (!l) return null;
  requireOwnInstructor(l.instructorId, 'schedule.request');
  db.requests = db.requests || [];
  db.requests.push({
    id: nextId(db.requests, 'R'), lessonId: id, instructorId: l.instructorId,
    studentId: l.studentId, date: l.date, time: l.time,
    note: note || 'Please move this class', status:'Open', created: TODAY,
  });
  save();
  return clone(l);
}
export const listRequests = (status = '') => clone(db.requests || [])
  .filter(r => !status || r.status === status)
  .sort((a,b) => b.id.localeCompare(a.id));
export function resolveRequest(id, outcome = 'Done'){
  needs('schedule.write');
  const r = (db.requests || []).find(x => x.id === id);
  if (r){ r.status = outcome; save(); }
}
export const nextLessonFor = studentId => clone(
  db.lessons.filter(l => l.studentId === studentId && l.status !== 'Cancelled' &&
    (l.date > TODAY || (l.date === TODAY && l.status !== 'Completed')))
    .sort((a,b) => (a.date + a.time).localeCompare(b.date + b.time))[0]);
export const lessonsForInstructor = (instructorId, date) => {
  requireOwnInstructor(instructorId, 'lessons.read.assigned');
  return clone(db.lessons.filter(l => l.instructorId === instructorId && l.date === date))
    .sort((a,b) => a.time.localeCompare(b.time));
};

/* ---------------- instructors ---------------- */
export const listInstructors = () => clone(db.instructors);
export const getInstructor = id => clone(db.instructors.find(i => i.id === id));
export const studentsOf = id => clone(db.students.filter(s => s.instructorId === id && s.status === 'Active'));

/* ---------------- enquiries ---------------- */
export const listEnquiries = (status = '') => clone(db.enquiries)
  .filter(e => !status || e.status === status)
  .sort((a,b) => b.date.localeCompare(a.date));
export function setEnquiryStatus(id, status){
  const e = db.enquiries.find(x => x.id === id);
  if (e){ e.status = status; save(); }
}
export function addEnquiry(data){
  const e = {};
  if (!data.name || data.name.trim().length < 2) e.name = 'Enter a name.';
  if (!data.phone || data.phone.replace(/\D/g,'').length < 10) e.phone = 'Enter a 10 digit phone number.';
  if (Object.keys(e).length) throw new ValidationError(e);
  const row = { id: nextId(db.enquiries, 'E'), status:'New', date: TODAY, note:'', ...data };
  db.enquiries.push(row);
  save();
  return clone(row);
}
/** Marks the enquiry converted and links it to the student that was created. */
export function markConverted(enquiryId, studentId){
  const e = db.enquiries.find(x => x.id === enquiryId);
  if (e){ e.status = 'Converted'; e.studentId = studentId; save(); }
}

/* ---------------- dashboard ---------------- */
export function todaySummary(date = TODAY){
  const marks = db.attendance.filter(a => a.date === date);
  return {
    students: db.students.filter(s => s.status === 'Active').length,
    present:  marks.filter(m => m.status === 'present').length,
    absent:   marks.filter(m => m.status === 'absent').length,
    lessons:  db.lessons.filter(l => l.date === date).length,
    pending:  totalPending(),
    newEnquiries: db.enquiries.filter(e => e.status === 'New').length,
  };
}
export { COURSES, courseById, TODAY, DEMO_ACCOUNTS, VEHICLE_STATUS };
