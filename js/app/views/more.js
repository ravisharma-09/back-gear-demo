import { $, icon, esc, money, initials, dmy, emptyState, openSheet, toast,
         field, selectField, textareaField, downloadCSV } from '../ui.js';
import { setPage, SECONDARY, go } from '../main.js';
import { listInstructors, studentsOf, listEnquiries, setEnquiryStatus, markConverted,
         addEnquiry, listStudents, feeSummary, allPayments, getStudent, attendanceCount,
         courseById, totalPending, resetDemo, COURSES } from '../../data/store.js';
import { openAddStudent } from './students.js';
import { installState, promptInstall, isIOS } from '../install.js';

/* ---------------- installing the app ---------------- */
const INSTALL_COPY = {
  ready:       { title:'Install the app',  note:'Add Back Gear to your home screen and open it like any other app.' },
  ios:         { title:'Add to Home Screen', note:'In Safari, tap Share then "Add to Home Screen".' },
  installed:   { title:'App installed',    note:'You are running Back Gear as an installed app.' },
  unavailable: { title:'Install the app',  note:'Open this page in Chrome, Edge or Safari on your phone to install it.' },
};

export function installRow(){
  const st = installState();
  const c = INSTALL_COPY[st];
  const disabled = st === 'installed' || st === 'unavailable';
  return `<button class="row-item" type="button" data-do="install"${disabled ? ' disabled' : ''}>
    ${icon(st === 'installed' ? 'circle-check-big' : 'download')}
    <span class="row-main"><b>${esc(c.title)}</b><span>${esc(c.note)}</span></span>
    ${disabled ? '' : icon('chevron-right','icon row-chev')}
  </button>`;
}

export async function handleInstall(){
  const st = installState();
  if (st === 'installed'){ toast('The app is already installed'); return; }
  if (st === 'ios' || st === 'unavailable'){
    openSheet({
      title: isIOS() ? 'Add to Home Screen' : 'Install the app',
      body: isIOS()
        ? `<ol class="steps-list">
             <li><div><b>Tap the Share button</b><span>The square with an arrow, at the bottom of Safari.</span></div></li>
             <li><div><b>Choose "Add to Home Screen"</b><span>Scroll down the list to find it.</span></div></li>
             <li><div><b>Tap Add</b><span>Back Gear then opens from your home screen like any other app.</span></div></li>
           </ol>`
        : `<p>Your browser has not offered to install this app yet.</p>
           <ol class="steps-list" style="margin-top:14px">
             <li><div><b>On a phone</b><span>Open this page in Chrome or Safari and try again.</span></div></li>
             <li><div><b>On a laptop</b><span>In Chrome or Edge, use the install icon in the address bar.</span></div></li>
           </ol>`,
      submitLabel:'Got it',
      onSave: () => {},
    });
    return;
  }
  const outcome = await promptInstall();
  if (outcome === 'accepted') toast('Installing Back Gear…');
  else if (outcome === 'dismissed') toast('Install cancelled');
  else toast('Install is not available here', 'error');
}

/* ---------------- More menu (mobile) ---------------- */
export function renderMore(view){
  setPage({ title:'More' });
  view.innerHTML = `<div class="rows">
    ${SECONDARY.map(s => `<a class="row-item" href="#/${s.id}">
      ${icon(s.icon)}<span class="row-main"><b>${esc(s.label)}</b></span>
      ${icon('chevron-right','icon row-chev')}</a>`).join('')}
  </div>
  <div class="block" style="margin-top:26px">
    <div class="block-head"><h2>This app</h2></div>
    <div class="rows">${installRow()}
      <button class="row-item" type="button" data-do="signout">
        ${icon('log-out')}<span class="row-main"><b>Sign out</b></span></button>
    </div>
  </div>`;
  view.addEventListener('click', async e => {
    if (e.target.closest('[data-do="install"]')) return handleInstall();
    if (e.target.closest('[data-do="signout"]')){
      try { sessionStorage.removeItem('backgear.demo.session'); } catch {}
      location.reload();
    }
  });
}

/* ---------------- Instructors ---------------- */
export function renderInstructors(view){
  const list = listInstructors();
  setPage({ title:'Instructors', sub:`${list.length} instructors`, back:true });
  view.innerHTML = `<div class="rows">${list.map(i => {
    const mine = studentsOf(i.id);
    return `<button class="row-item" type="button" data-inst="${esc(i.id)}">
      <span class="avatar" aria-hidden="true">${esc(initials(i.name))}</span>
      <span class="row-main"><b>${esc(i.name)}</b>
        <span>${mine.length} student${mine.length === 1 ? '' : 's'} · ${esc(i.languages)}</span></span>
      <span class="row-side"><span class="pill ${i.active ? 'pill-green' : ''}">
        ${i.active ? 'Active' : 'Inactive'}</span></span>
      ${icon('chevron-right','icon row-chev')}
    </button>`; }).join('')}</div>
    <div id="instPanel" style="margin-top:18px"></div>`;

  view.addEventListener('click', e => {
    const row = e.target.closest('[data-inst]');
    if (!row) return;
    const i = list.find(x => x.id === row.dataset.inst);
    const mine = studentsOf(i.id);
    $('#instPanel', view).innerHTML = `
      <div class="block-head"><h2>${esc(i.name)} — assigned students</h2></div>
      ${mine.length ? `<div class="rows">${mine.map(s => `
        <a class="row-item" href="#/student/${esc(s.id)}">
          <span class="row-main"><b>${esc(s.name)}</b>
            <span>${esc(courseById(s.courseId).label)}</span></span>
          ${icon('chevron-right','icon row-chev')}</a>`).join('')}</div>`
      : emptyState('users', 'No active students assigned.')}`;
    $('#instPanel', view).scrollIntoView({ behavior:'smooth', block:'nearest' });
  });
}

/* ---------------- Enquiries ---------------- */
const STATUSES = ['New','Contacted','Converted','Closed'];
let enqFilter = '';

export function renderEnquiries(view){
  const all = listEnquiries();
  const list = enqFilter ? all.filter(e => e.status === enqFilter) : all;
  setPage({ title:'Enquiries', sub:`${all.filter(e => e.status === 'New').length} new`, back:true,
    actions:`<button class="btn btn-primary btn-sm" data-do="add">${icon('plus','icon icon-sm')}Add</button>` });

  const courseLabel = id => id === 'licence' ? 'Licence help'
    : (COURSES.find(c => c.id === id)?.label || 'Not specified');

  view.innerHTML = `
    <div class="chips" role="group" aria-label="Filter enquiries">
      ${['', ...STATUSES].map(s => `<button class="chip" type="button" data-filter="${esc(s)}"
        aria-pressed="${enqFilter === s}">${s || 'All'}</button>`).join('')}
    </div>
    ${list.length ? `<div class="rows">${list.map(e => {
      const tone = e.status === 'New' ? 'pill-amber' : e.status === 'Converted' ? 'pill-green'
                 : e.status === 'Closed' ? '' : 'pill-blue';
      return `<div class="enq-row">
        <div style="display:flex;align-items:flex-start;gap:12px">
          <span class="avatar avatar-sm" aria-hidden="true">${esc(initials(e.name))}</span>
          <div style="flex:1;min-width:0">
            <b style="font-size:15px">${esc(e.name)}</b>
            <p class="small muted" style="margin-top:2px">${esc(courseLabel(e.interest))} &nbsp;·&nbsp; ${esc(e.phone)}</p>
            ${e.note ? `<p class="small" style="margin-top:4px">${esc(e.note)}</p>` : ''}
          </div>
          <div style="flex:none;text-align:right">
            <span class="pill ${tone}">${esc(e.status)}</span>
            <p class="tiny muted" style="margin-top:5px">${dmy(e.date)}</p>
          </div>
        </div>
        <div class="enq-actions">
          ${e.status === 'New' ? `<button class="btn btn-sm" data-called="${esc(e.id)}">Mark contacted</button>` : ''}
          ${e.status !== 'Converted' && e.status !== 'Closed'
            ? `<button class="btn btn-sm btn-primary" data-convert="${esc(e.id)}">Convert to student</button>
               <button class="btn btn-sm" data-close="${esc(e.id)}">Close</button>` : ''}
          ${e.studentId ? `<a class="btn btn-sm" href="#/student/${esc(e.studentId)}">Open student</a>` : ''}
        </div>
      </div>`; }).join('')}</div>`
    : emptyState('phone-call', 'No enquiries with this status.')}
    <p class="hr-note">Enquiries sent from the public website appear here.</p>`;

  const handle = e => {
    const chip = e.target.closest('[data-filter]');
    if (chip){ enqFilter = chip.dataset.filter; renderEnquiries(view); return; }
    const called = e.target.closest('[data-called]');
    if (called){ setEnquiryStatus(called.dataset.called, 'Contacted'); toast('Marked as contacted'); return; }
    const closed = e.target.closest('[data-close]');
    if (closed){ setEnquiryStatus(closed.dataset.close, 'Closed'); toast('Enquiry closed'); return; }
    const conv = e.target.closest('[data-convert]');
    if (conv){
      const enq = listEnquiries().find(x => x.id === conv.dataset.convert);
      if (!enq) return;
      openAddStudent({
        name: enq.name, phone: enq.phone,
        courseId: COURSES.find(c => c.id === enq.interest)?.id || 'c-car30',
        onCreated: student => { markConverted(enq.id, student.id); toast(`${student.name} enrolled from an enquiry`); },
      });
      return;
    }
    if (e.target.closest('[data-do="add"]')) openAddEnquiry();
  };
  view.addEventListener('click', handle);
  $('#topActions').onclick = handle;
}

function openAddEnquiry(){
  openSheet({
    title:'Add enquiry',
    body: `${field({ name:'name', label:'Name', required:true })}
      ${field({ name:'phone', label:'Phone number', type:'tel', required:true, attrs:'inputmode="tel"' })}
      ${selectField({ name:'interest', label:'Interested in', value:'c-car30',
        options:[...COURSES.map(c => ({ value:c.id, label:c.label })),
                 { value:'licence', label:'Licence help' }] })}
      ${textareaField({ name:'note', label:'Note', rows:2 })}`,
    submitLabel:'Add enquiry',
    onSave: data => { addEnquiry(data); toast('Enquiry added'); },
  });
}

/* ---------------- Reports ---------------- */
export function renderReports(view){
  setPage({ title:'Reports', sub:'Simple lists you can download', back:true });
  const students = listStudents();
  const payments = allPayments();
  const enquiries = listEnquiries();

  const REPORTS = [
    { id:'students',  label:'Student report',   note:`${students.length} students`, icon:'users' },
    { id:'attendance',label:'Attendance report',note:'Present and absent totals',   icon:'calendar-check' },
    { id:'fees',      label:'Fee collection',   note:`${payments.length} payments`, icon:'banknote' },
    { id:'pending',   label:'Pending fees',     note:money(totalPending()) + ' outstanding', icon:'wallet' },
    { id:'enquiries', label:'Enquiry report',   note:`${enquiries.length} enquiries`, icon:'phone-call' },
  ];

  view.innerHTML = `<div class="rows">${REPORTS.map(r => `
      <button class="row-item" type="button" data-report="${r.id}">
        ${icon(r.icon)}
        <span class="row-main"><b>${esc(r.label)}</b><span>${esc(r.note)}</span></span>
        <span class="row-side"><span class="pill">${icon('download','icon icon-sm')} CSV</span></span>
      </button>`).join('')}</div>
    <p class="hr-note">Each report downloads as a CSV file you can open in Excel.</p>`;

  view.addEventListener('click', e => {
    const btn = e.target.closest('[data-report]');
    if (!btn) return;
    const kind = btn.dataset.report;
    if (kind === 'students'){
      downloadCSV('students.csv', [['ID','Name','Phone','Course','Days','Instructor','Joined','Status','Fee','Paid','Remaining','Attendance','Licence']]
        .concat(students.map(s => { const c = courseById(s.courseId); const f = feeSummary(s.id);
          const a = attendanceCount(s.id);
          return [s.id, s.name, s.phone, c.name, c.days,
            listInstructors().find(i => i.id === s.instructorId)?.name || '',
            s.joinedOn, s.status, f.fee, f.paid, f.due, `${a.present}/${a.total}`, s.licence]; })));
    }
    if (kind === 'attendance'){
      downloadCSV('attendance.csv', [['Student','Present','Total marked','Percentage']]
        .concat(students.map(s => { const a = attendanceCount(s.id);
          return [s.name, a.present, a.total, a.total ? Math.round(a.present / a.total * 100) + '%' : '—']; })));
    }
    if (kind === 'fees'){
      downloadCSV('fee-collection.csv', [['Date','Student','Amount','Method','Note']]
        .concat(payments.map(p => [p.date, getStudent(p.studentId)?.name || '', p.amount, p.method, p.note])));
    }
    if (kind === 'pending'){
      downloadCSV('pending-fees.csv', [['Student','Phone','Course fee','Paid','Remaining']]
        .concat(students.map(s => ({ s, f: feeSummary(s.id) }))
          .filter(x => x.f.due > 0)
          .map(({ s, f }) => [s.name, s.phone, f.fee, f.paid, f.due])));
    }
    if (kind === 'enquiries'){
      downloadCSV('enquiries.csv', [['Date','Name','Phone','Interested in','Status','Note']]
        .concat(enquiries.map(e => [e.date, e.name, e.phone,
          e.interest === 'licence' ? 'Licence help' : (COURSES.find(c => c.id === e.interest)?.label || ''),
          e.status, e.note])));
    }
    toast('CSV downloaded');
  });
}

/* ---------------- Settings ---------------- */
export function renderSettings(view){
  setPage({ title:'Settings', back:true });
  view.innerHTML = `
    <div class="notice notice-amber">${icon('triangle-alert')}
      <span><b>This is a demo prototype.</b> Information is stored only in this browser.
      It is not a database, it is not backed up and it is not secure. The production
      version will add a real backend, real logins and proper permissions.</span></div>

    <div class="block" style="margin-top:20px">
      <div class="block-head"><h2>School details</h2></div>
      <dl class="deflist">
        <div><dt>Name</dt><dd>Back Gear Driving School</dd></div>
        <div><dt>Location</dt><dd>Bathinda, Punjab</dd></div>
        <div><dt>Phone</dt><dd>+91 98765 43210</dd></div>
        <div><dt>Email</dt><dd>backgeardrivingschool@gmail.com</dd></div>
        <div><dt>Working hours</dt><dd>Monday to Saturday, 6:00 AM – 7:00 PM</dd></div>
      </dl>
      <p class="hr-note">In the real system these would be editable by the owner.</p>
    </div>

    <div class="block">
      <div class="block-head"><h2>This app</h2></div>
      <div class="rows">${installRow()}</div>
    </div>

    <div class="block">
      <div class="block-head"><h2>Demo data</h2></div>
      <div class="rows">
        <button class="row-item" type="button" data-do="reset">
          ${icon('triangle-alert')}
          <span class="row-main"><b>Reset the demo</b>
            <span>Put back the original sample students, attendance and payments</span></span>
        </button>
      </div>
    </div>`;

  view.addEventListener('click', async e => {
    if (e.target.closest('[data-do="install"]')) return handleInstall();
    if (!e.target.closest('[data-do="reset"]')) return;
    openSheet({
      title:'Reset the demo?',
      body:`<p>Everything you changed during this demo will be replaced with the
        original sample data.</p>`,
      submitLabel:'Reset demo',
      onSave: () => { resetDemo(); toast('Demo data restored'); go('#/home'); },
    });
  });
}
