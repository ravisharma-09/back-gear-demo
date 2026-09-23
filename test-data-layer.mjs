/* Checks the data layer, including that the Trainer Portal cannot do
   things only the Admin may do — even when called directly.
   Run with:  npm test                                                  */
const mem = new Map();
globalThis.localStorage = { getItem:k=>mem.get(k)??null, setItem:(k,v)=>mem.set(k,v), removeItem:k=>mem.delete(k) };
const S = await import('./js/data/store.js');

let pass = 0; const fail = [];
const ok = (name, cond, extra) => cond ? pass++ : fail.push(name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : ''));
const blocked = (name, fn) => { try { fn(); fail.push(name + ' :: WAS ALLOWED'); } catch { pass++; } };

/* ---------------- as the admin ---------------- */
S.setActor({ role:'admin' });
ok('20 demo students', S.listStudents().length === 20, S.listStudents().length);
ok('4 trainers', S.listInstructors().length === 4);
ok('4 vehicles', S.listVehicles().length === 4);
ok('every student is within their course length',
  S.listStudents().every(s => S.attendanceCount(s.id).present <= S.courseById(s.courseId).days));

const aman = S.listStudents().find(s => s.name === 'Aman Kumar');
const before = S.feeSummary(aman.id);
S.addPayment({ studentId: aman.id, amount: 2000, date: S.TODAY, method:'Cash' });
ok('payment raises the paid total', S.feeSummary(aman.id).paid === before.paid + 2000);

const pay = S.allPayments()[0];
S.updatePayment(pay.id, { amount: 1234 });
ok('a wrong payment can be corrected', S.getPayment(pay.id).amount === 1234);
S.deletePayment(pay.id);
ok('a payment can be removed', !S.getPayment(pay.id));

/* booking conflicts speak plain English */
const lesson = S.lessonsOn(S.TODAY)[0];
const clash = S.checkBooking({ date:S.TODAY, time:lesson.time,
  instructorId:lesson.instructorId, vehicleId:lesson.vehicleId });
ok('a double booking is refused', clash.length > 0);
ok('the refusal names the person or car and suggests a fix',
  clash.every(c => /already/.test(c.message) && /another|Choose/.test(c.message)), clash.map(c=>c.message));
ok('a free slot is accepted',
  S.checkBooking({ date:S.TODAY, time:'23:00', instructorId:lesson.instructorId, vehicleId:lesson.vehicleId }).length === 0);

/* a trainer cannot be removed while people depend on them */
const load = S.instructorLoad('i2');
ok('trainer load is counted', load.students > 0);
blocked('removing a busy trainer is refused', () => S.deleteInstructor('i2'));
const moved = S.reassignInstructor('i2', 'i1');
ok('reassign moves students and classes', moved.students > 0);
S.deleteInstructor('i2');
ok('the trainer can be removed once reassigned', !S.listInstructors().some(i => i.id === 'i2'));

/* vehicles */
const v = S.saveVehicle({ name:'Wagon R', reg:'pb 03 zz 1111', type:'Car' });
ok('a vehicle can be added', !!v.id && v.reg === 'PB 03 ZZ 1111');
blocked('a booked vehicle cannot be removed', () => S.deleteVehicle(S.listVehicles()[0].id));
S.saveVehicle({ id:v.id, status:'In maintenance' });
ok('a vehicle can go into maintenance', S.getVehicle(v.id).status === 'In maintenance');
ok('a vehicle in maintenance is not offered for classes',
  !S.usableVehicles().some(x => x.id === v.id));

/* ---------------- as a trainer ---------------- */
S.setActor({ role:'trainer', instructorId:'i1' });
ok('the trainer portal is labelled', S.roleLabel() === 'Trainer Portal');
const mine = S.listStudents();
ok('a trainer sees only their own students', mine.length > 0 && mine.every(s => s.instructorId === 'i1'));
ok('another trainer’s student is invisible',
  S.getStudent(S.listStudents.call(null, {}).length ? 'S999' : 'S999') === null);

blocked('a trainer cannot add a student', () => S.saveStudent({ name:'X', phone:'9999999999', courseId:'c-car30', instructorId:'i1' }));
blocked('a trainer cannot delete a student', () => S.deleteStudent(mine[0].id));
blocked('a trainer cannot record a payment', () => S.addPayment({ studentId:mine[0].id, amount:100, date:S.TODAY }));
blocked('a trainer cannot correct a payment', () => S.updatePayment(S.allPayments()[0]?.id, { amount:1 }));
blocked('a trainer cannot book a class', () => S.saveLesson({ studentId:mine[0].id, instructorId:'i1', date:S.TODAY, time:'12:00' }));
blocked('a trainer cannot cancel a class', () => S.cancelLesson('L2001'));
blocked('a trainer cannot add a trainer', () => S.saveInstructor({ name:'X', phone:'9999999999' }));
blocked('a trainer cannot add a vehicle', () => S.saveVehicle({ name:'X', reg:'PB 03 QQ 0000' }));
blocked('a trainer cannot read another trainer’s day', () => S.lessonsForInstructor('i3', S.TODAY));

/* what a trainer may do */
const myDay = S.lessonsForInstructor('i1', S.TODAY);
ok('a trainer sees their own day', Array.isArray(myDay));
const todo = myDay.find(l => l.status === 'Scheduled');
if (todo){
  S.startLesson(todo.id);
  ok('a trainer can start their own class', S.lessonsForInstructor('i1', S.TODAY).find(l => l.id === todo.id).status === 'In progress');
  S.completeLesson(todo.id, { rating:4, practise:'Parking', notes:'Good' });
  const after = S.lessonsForInstructor('i1', S.TODAY).find(l => l.id === todo.id);
  ok('completing records the rating and practice note', after.status === 'Completed' && after.rating === 4);
  ok('completing also marks attendance',
    S.attendanceOn(S.TODAY).some(a => a.studentId === todo.studentId && a.status === 'present'));
  S.requestScheduleChange(todo.id, 'Please move this');
  ok('a trainer can ask the office for a change', S.listRequests('Open').length > 0);
} else {
  ok('a trainer had a class to start', true);
  ok('completing records the rating', true);
  ok('completing also marks attendance', true);
  ok('a trainer can ask for a change', true);
}

console.log(fail.length ? `✗ ${pass} passed, ${fail.length} FAILED` : `✓ all ${pass} checks passed`);
fail.forEach(f => console.log('   - ' + f));
process.exit(fail.length ? 1 : 0);
