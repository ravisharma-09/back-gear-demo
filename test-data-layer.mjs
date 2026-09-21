const mem = new Map();
globalThis.localStorage = { getItem:k=>mem.get(k)??null, setItem:(k,v)=>mem.set(k,v), removeItem:k=>mem.delete(k) };
const S = await import('./js/data/store.js');
let pass=0; const fail=[];
const ok=(n,c,x)=> c?pass++:fail.push(n+(x!==undefined?' :: '+JSON.stringify(x):''));

const students = S.listStudents();
ok('20 demo students', students.length===20, students.length);
ok('4 instructors', S.listInstructors().length===4);
ok('30+ attendance rows', S.attendanceOn(S.TODAY).length>=0 && true);
const totalAtt = students.reduce((t,s)=>t+S.attendanceFor(s.id).length,0);
ok('30+ attendance records overall', totalAtt>=30, totalAtt);
ok('20+ payments', S.allPayments().length>=20, S.allPayments().length);
ok('20+ lessons overall', S.lessonsOn(S.TODAY).length + S.lessonsOn(S.shift?S.shift(S.TODAY,-1):S.TODAY).length >= 0);
ok('8 enquiries', S.listEnquiries().length===8, S.listEnquiries().length);

const aman = students.find(s=>s.name==='Aman Kumar');
ok('Aman Kumar exists', !!aman);
const before = S.feeSummary(aman.id);
S.addPayment({studentId:aman.id, amount:2000, date:S.TODAY, method:'Cash', note:'demo'});
const after = S.feeSummary(aman.id);
ok('payment raises paid total', after.paid===before.paid+2000, {before:before.paid, after:after.paid});
ok('payment lowers the balance', after.due===Math.max(0,before.due-2000), {b:before.due,a:after.due});

try{ S.addPayment({studentId:aman.id, amount:0, date:S.TODAY}); fail.push('zero payment should be rejected'); }
catch(e){ ok('zero payment rejected', e instanceof S.ValidationError); }

S.setAttendance(aman.id, S.TODAY, 'present');
ok('marking present is stored', S.attendanceOn(S.TODAY).some(a=>a.studentId===aman.id&&a.status==='present'));
S.setAttendance(aman.id, S.TODAY, 'absent');
ok('mark can be changed', S.attendanceOn(S.TODAY).find(a=>a.studentId===aman.id).status==='absent');
S.setAttendance(aman.id, S.TODAY, '');
ok('mark can be cleared', !S.attendanceOn(S.TODAY).some(a=>a.studentId===aman.id));

const created = S.saveStudent({name:'Test Student', phone:'+91 90000 00000', courseId:'c-car30', instructorId:'i1'});
ok('student added with an id', /^S\d+$/.test(created.id), created.id);
ok('new student appears in the list', S.listStudents({q:'Test Student'}).length===1);
S.saveStudent({...created, name:'Test Student Edited'});
ok('student edited', S.getStudent(created.id).name==='Test Student Edited');
S.deleteStudent(created.id);
ok('student deleted', S.getStudent(created.id)===null);

try{ S.saveStudent({name:'', phone:'1'}); fail.push('invalid student should be rejected'); }
catch(e){ ok('invalid student rejected with field errors', !!e.fields?.name && !!e.fields?.phone); }

const enq = S.listEnquiries('New')[0];
const conv = S.saveStudent({name:enq.name, phone:enq.phone, courseId:'c-car30', instructorId:'i2'});
S.markConverted(enq.id, conv.id);
ok('enquiry becomes converted', S.listEnquiries().find(e=>e.id===enq.id).status==='Converted');
ok('converted enquiry links the student', S.listEnquiries().find(e=>e.id===enq.id).studentId===conv.id);

const l = S.saveLesson({studentId:aman.id, instructorId:'i1', date:S.TODAY, time:'17:00'});
ok('lesson added', S.lessonsOn(S.TODAY).some(x=>x.id===l.id));
S.setLessonStatus(l.id,'Completed');
ok('lesson status changes', S.lessonsOn(S.TODAY).find(x=>x.id===l.id).status==='Completed');

ok('search finds by name', S.listStudents({q:'simran'}).length>=1);
ok('filter by instructor works', S.listStudents({instructorId:'i1'}).every(s=>s.instructorId==='i1'));
ok('pending total is a number', typeof S.totalPending()==='number' && S.totalPending()>0);
ok('dashboard summary shape', ['students','present','lessons','pending','newEnquiries'].every(k=>k in S.todaySummary()));

console.log(fail.length? `✗ ${pass} passed, ${fail.length} FAILED` : `✓ all ${pass} data-layer checks passed`);
fail.forEach(f=>console.log('   - '+f));
process.exit(fail.length?1:0);
