/* ==================================================================
   The mock data service.

   Every screen talks to THIS file and nothing else. It keeps the demo
   data in the browser (localStorage) so the prototype feels real for
   the length of a demo.

   >>> PROTOTYPE STORAGE ONLY. This is not a database and is not secure.
   >>> When the real backend exists, each function below becomes a
   >>> fetch() call and the screens stay exactly as they are.
   ================================================================== */
import { buildSeed, courseById, COURSES, TODAY } from './seed.js';

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
  return clone(db.students)
    .filter(s => !status || s.status === status)
    .filter(s => !instructorId || s.instructorId === instructorId)
    .filter(s => !courseId || s.courseId === courseId)
    .filter(s => !needle || s.name.toLowerCase().includes(needle) ||
                 s.phone.replace(/\s/g,'').includes(needle.replace(/\s/g,'')) ||
                 s.id.toLowerCase().includes(needle))
    .sort((a, b) => a.name.localeCompare(b.name));
};
export const getStudent = id => clone(db.students.find(s => s.id === id));

export function saveStudent(data){
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
  db.students = db.students.filter(s => s.id !== id);
  db.attendance = db.attendance.filter(a => a.studentId !== id);
  db.payments   = db.payments.filter(p => p.studentId !== id);
  db.lessons    = db.lessons.filter(l => l.studentId !== id);
  save();
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
export { COURSES, courseById, TODAY };
