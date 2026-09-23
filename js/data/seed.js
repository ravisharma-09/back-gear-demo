/* ==================================================================
   DEMO DATA ONLY. These are invented people, not real customers.
   When a real backend arrives this file is deleted and store.js
   swaps its mock calls for API calls - the screens do not change.
   ================================================================== */

const iso = d => d.toISOString().slice(0, 10);
const today = () => { const d = new Date(); d.setHours(12,0,0,0); return d; };
export const TODAY = iso(today());
export const shift = (isoDate, days) => {
  const d = new Date(isoDate + 'T12:00:00'); d.setDate(d.getDate() + days); return iso(d);
};
const dow = isoDate => new Date(isoDate + 'T12:00:00').getDay();   // 0 = Sunday

export const COURSES = [
  { id:'c-car30',   name:'Car Driving',   label:'Car Driving · 30 Days', days:30, fee:8000,  vehicle:'Car' },
  { id:'c-car15',   name:'Car Driving',   label:'Car Driving · 15 Days', days:15, fee:5500,  vehicle:'Car' },
  { id:'c-refresh', name:'Refresher',     label:'Refresher · 10 Days',   days:10, fee:3500,  vehicle:'Car' },
  { id:'c-two',     name:'Two-Wheeler',   label:'Two-Wheeler · 15 Days', days:15, fee:4000,  vehicle:'Scooter / Bike' },
  { id:'c-ladies',  name:'Ladies Batch',  label:'Ladies Batch · 30 Days',days:30, fee:8000,  vehicle:'Car' },
  { id:'c-comm',    name:'Commercial',    label:'Commercial · 45 Days',  days:45, fee:15000, vehicle:'Commercial' },
];
export const courseById = id => COURSES.find(c => c.id === id) || COURSES[0];

export const LICENCE_STATES = ['Not applied', 'Learner Licence Applied', 'Learner Licence Received',
                               'Driving Test Booked', 'Driving Licence Received'];

/* The cars and scooter the school teaches in. A class needs one free car
   and one free trainer, which is what the booking screen checks. */
/* Vehicles live in the store so the admin can add, edit and retire them. */
const VEHICLE_SEED = [
  { id:'v1', name:'Swift',  reg:'PB 03 AB 1234', type:'Car',     status:'Available' },
  { id:'v2', name:'Alto',   reg:'PB 03 CD 5678', type:'Car',     status:'Available' },
  { id:'v3', name:'i10',    reg:'PB 03 EF 9012', type:'Car',     status:'Available' },
  { id:'v4', name:'Activa', reg:'PB 03 GH 3456', type:'Scooter', status:'Available' },
];
export const VEHICLE_STATUS = ['Available', 'In maintenance', 'Retired'];

/* Two demo sign-ins: the admin who runs the school, and one trainer. */
export const DEMO_ACCOUNTS = [
  { email:'admin@backgear.demo',   password:'demo123', name:'Arjun Singh',    role:'admin' },
  { email:'trainer@backgear.demo', password:'demo123', name:'Harpreet Singh', role:'trainer', instructorId:'i2' },
];

const INSTRUCTORS = [
  { id:'i1', name:'Raj Kumar',      phone:'+91 98765 10001', joined:'2016-04-11', active:true, languages:'Hindi, Punjabi' },
  { id:'i2', name:'Harpreet Singh', phone:'+91 98765 10002', joined:'2018-09-02', active:true, languages:'Punjabi, Hindi, English' },
  { id:'i3', name:'Simran Kaur',    phone:'+91 98765 10003', joined:'2020-02-17', active:true, languages:'Punjabi, Hindi' },
  { id:'i4', name:'Gurdeep Singh',  phone:'+91 98765 10004', joined:'2022-07-25', active:true, languages:'Punjabi, English' },
];

const PEOPLE = [
  ['Aman Kumar','+91 98765 43210','c-car30','i1',  'Model Town'],
  ['Simran Kaur','+91 98765 22334','c-car15','i2', 'Civil Lines'],
  ['Raj Singh','+91 98765 33445','c-car30','i1',   'Bhagu Road'],
  ['Neha Sharma','+91 98765 44556','c-car15','i3', 'Power House Road'],
  ['Gurpreet Singh','+91 98765 55667','c-car30','i2','Goniana Road'],
  ['Vikramjeet Singh','+91 98765 66778','c-comm','i4','Mall Road'],
  ['Amanpreet Kaur','+91 98765 77889','c-ladies','i3','Paras Ram Nagar'],
  ['Rohit Sharma','+91 98765 88990','c-car30','i1', 'Bibiwala Road'],
  ['Jaspreet Kaur','+91 98765 99001','c-ladies','i3','Model Town'],
  ['Karanveer Singh','+91 98765 10112','c-two','i4','Amrik Singh Road'],
  ['Pooja Bansal','+91 98765 12123','c-car15','i2','Dhobiana Road'],
  ['Harman Sidhu','+91 98765 13234','c-car30','i1','Thermal Colony'],
  ['Deepak Garg','+91 98765 14345','c-refresh','i2','Civil Lines'],
  ['Kiran Rani','+91 98765 15456','c-ladies','i3','Multania Road'],
  ['Sukhwinder Singh','+91 98765 16567','c-comm','i4','Goniana Road'],
  ['Ritu Mittal','+91 98765 17678','c-car15','i3','Model Town'],
  ['Balwinder Singh','+91 98765 18789','c-two','i4','Bhagu Road'],
  ['Navjot Kaur','+91 98765 19890','c-car30','i2','Power House Road'],
  ['Arjun Mehta','+91 98765 20901','c-refresh','i1','Mall Road'],
  ['Sandeep Kaur','+91 98765 21012','c-car30','i3','Bibiwala Road'],
];

const SLOTS = ['06:00','07:00','08:00','09:00','16:00','17:00','18:00'];
const fmtTime = t => { const [h,m] = t.split(':').map(Number);
  const ap = h < 12 ? 'AM' : 'PM'; const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${String(m).padStart(2,'0')} ${ap}`; };
export { fmtTime };

/* deterministic pseudo-random so the demo looks the same every time */
let s = 20250921;
const rnd = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
const pick = a => a[Math.floor(rnd() * a.length)];

export function buildSeed(){
  const instructors = INSTRUCTORS.map(i => ({ ...i }));

  const students = PEOPLE.map(([name, phone, courseId, instructorId, area], i) => {
    const course = courseById(courseId);
    const joined = shift(TODAY, -(22 + i * 4));
    const paidPart = [0.625, 1, 0.4, 1, 0.5][i % 5];
    return {
      id: 'S' + String(101 + i),
      name, phone, area, courseId, instructorId,
      slot: SLOTS[i % SLOTS.length],
      joinedOn: joined,
      fee: course.fee,
      paid: Math.round(course.fee * paidPart / 500) * 500,
      status: i === 8 ? 'On hold' : i === 17 ? 'Completed' : 'Active',
      pickup: area + ', Bathinda',
      licence: LICENCE_STATES[i % LICENCE_STATES.length],
      notes: i % 4 === 0 ? 'Regular student, good progress.' : '',
    };
  });

  /* ---- attendance, never more classes than the course actually has ---- */
  const attendance = [];
  const presentSoFar = {};
  for (let back = 30; back >= 0; back--){
    const date = shift(TODAY, -back);
    if (dow(date) === 0) continue;                       // closed on Sunday
    for (const st of students){
      if (st.status !== 'Active' && st.status !== 'Completed') continue;
      if (date < st.joinedOn) continue;
      if (back === 0 && rnd() < 0.45) continue;          // today is still being filled in
      if (rnd() < 0.18) continue;                        // not every student every day
      // never record more attended classes than the course contains, so
      // progress can never read "16 of 15"
      const cap = courseById(st.courseId).days;
      const attended = presentSoFar[st.id] || 0;
      const status = rnd() < 0.87 && attended < cap - 1 ? 'present' : 'absent';
      if (status === 'present') presentSoFar[st.id] = attended + 1;
      attendance.push({ id:`A-${st.id}-${date}`, studentId: st.id, date, status });
    }
  }

  /* ---- payments that add up to each student's paid amount ---- */
  const payments = [];
  let receipt = 1000;
  for (const st of students){
    if (st.paid <= 0) continue;
    const first = Math.min(st.paid, Math.round(st.fee * 0.4 / 500) * 500) || st.paid;
    payments.push({ id:'P' + (++receipt), studentId: st.id, amount: first,
      date: st.joinedOn, method: pick(['Cash','UPI']), note:'First instalment' });
    if (st.paid - first > 0){
      payments.push({ id:'P' + (++receipt), studentId: st.id, amount: st.paid - first,
        date: shift(st.joinedOn, 9), method: pick(['Cash','UPI','Other']), note:'Second instalment' });
    }
  }

  /* ---- lessons: yesterday, today and tomorrow ---- */
  const lessons = [];
  let n = 0;
  for (const offset of [-1, 0, 1]){
    const date = shift(TODAY, offset);
    if (dow(date) === 0) continue;
    const dayStudents = students.filter(st => st.status === 'Active').slice(offset + 1, offset + 9);
    for (const st of dayStudents){
      n++;
      const course = courseById(st.courseId);
      const pool = course.vehicle === 'Scooter / Bike'
        ? VEHICLE_SEED.filter(v => v.type === 'Scooter')
        : VEHICLE_SEED.filter(v => v.type === 'Car');
      lessons.push({
        id:'L' + (2000 + n), studentId: st.id, instructorId: st.instructorId,
        vehicleId: pool[n % pool.length].id,
        date, time: st.slot, duration: 60,
        rating: 0, practise: '',
        // only the very first class of today is done, so the demo always has
        // classes left to start and complete
        status: offset < 0 ? 'Completed'
              : offset === 0 ? (Number(st.slot.slice(0,2)) <= 6 ? 'Completed' : 'Scheduled')
              : 'Scheduled',
        notes: '',
      });
    }
  }

  const enquiries = [
    { id:'E1', name:'Karan Malhotra',  phone:'+91 98765 11122', interest:'c-car30',  status:'New',
      date: TODAY, note:'Wants to start next week.' },
    { id:'E2', name:'Priya Sharma',    phone:'+91 98765 22334', interest:'licence',  status:'Contacted',
      date: shift(TODAY,-1), note:'Asked about learner licence help only.' },
    { id:'E3', name:'Manpreet Singh',  phone:'+91 98765 33445', interest:'c-car30',  status:'New',
      date: shift(TODAY,-2), note:'' },
    { id:'E4', name:'Anjali Goyal',    phone:'+91 98765 44556', interest:'c-ladies', status:'New',
      date: shift(TODAY,-2), note:'Prefers a lady instructor, morning batch.' },
    { id:'E5', name:'Sahil Jindal',    phone:'+91 98765 55667', interest:'c-two',    status:'Contacted',
      date: shift(TODAY,-4), note:'Will confirm after exams.' },
    { id:'E6', name:'Rupinder Kaur',   phone:'+91 98765 66778', interest:'c-car15',  status:'Converted',
      date: shift(TODAY,-6), note:'Joined on the 15 day course.' },
    { id:'E7', name:'Mohit Aggarwal',  phone:'+91 98765 77889', interest:'c-refresh',status:'Closed',
      date: shift(TODAY,-8), note:'Went with another school.' },
    { id:'E8', name:'Baljit Singh',    phone:'+91 98765 88990', interest:'c-comm',   status:'New',
      date: shift(TODAY,-1), note:'Needs a commercial licence for taxi work.' },
  ];

  const vehicles = VEHICLE_SEED.map(v => ({ ...v }));
  /* changes a trainer has asked the admin to make */
  const requests = [];
  return { students, instructors, vehicles, attendance, payments, lessons, enquiries, requests };
}
