import { $, icon, esc, money, initials, dmy, fmtTime, emptyState, openSheet, toast,
         field, selectField, textareaField, downloadCSV } from '../ui.js';
import { setPage, moreItems, go, signOut, state } from '../main.js';
import { listInstructors, studentsOf, listEnquiries, setEnquiryStatus, markConverted,
         addEnquiry, listStudents, feeSummary, allPayments, getStudent, attendanceCount,
         courseById, totalPending, resetDemo, COURSES, listVehicles, lessonsOn,
         saveInstructor, deleteInstructor, instructorLoad, reassignInstructor,
         saveVehicle, deleteVehicle, vehicleLoad, getVehicle, VEHICLE_STATUS,
         listRequests, resolveRequest, getInstructor,
         TODAY } from '../../data/store.js';
import { openAddStudent } from './students.js';
import { installState, promptInstall, getDeviceCategory } from '../install.js';

/* ---------------- installing the app ---------------- */
export function installRow(){
  const st = installState();
  const installed = st === 'installed';
  return `<button class="row-item" type="button" data-do="install">
    ${icon(installed ? 'circle-check-big' : 'download')}
    <span class="row-main">
      <b>${installed ? 'Back Gear is Installed' : 'Download / install app'}</b>
      <span>${installed ? 'Open from your home screen' : 'Use like an app on iPhone, Android or Computer'}</span>
    </span>
    ${icon('chevron-right','icon row-chev')}
  </button>`;
}

export async function handleInstall(){
  const st = installState();
  if (st === 'installed'){
    toast('Back Gear is already installed on this device');
    return;
  }
  if (st === 'ready'){
    const outcome = await promptInstall();
    if (outcome === 'accepted'){ toast('Installing Back Gear…'); return; }
    if (outcome === 'dismissed'){ toast('Install cancelled'); return; }
  }

  const defaultCat = getDeviceCategory(); // 'ios' | 'android' | 'desktop'
  openInstallGuide(defaultCat);
}

function openInstallGuide(activeTab = 'ios'){
  openSheet({
    title: 'Install Back Gear',
    body: `
      <p class="muted" style="margin-bottom:14px;font-size:14px">
        Add Back Gear to your home screen for a dedicated app window. Open it online once to save the app for offline use. Demo records stay on this device.
      </p>

      <div class="chips" data-install-tabs role="group" aria-label="Device selection" style="margin-bottom:18px">
        <button class="chip" type="button" data-inst-tab="ios" aria-pressed="${activeTab === 'ios'}">
          📱 iPhone / iPad
        </button>
        <button class="chip" type="button" data-inst-tab="android" aria-pressed="${activeTab === 'android'}">
          🤖 Android
        </button>
        <button class="chip" type="button" data-inst-tab="desktop" aria-pressed="${activeTab === 'desktop'}">
          💻 Laptop / PC
        </button>
      </div>

      ${!window.isSecureContext ? `<div class="notice notice-amber" style="margin-bottom:18px">${icon('info')}<span>Open the published HTTPS website to install on your phone. A local network HTTP address cannot install the offline app.</span></div>` : ''}
      <div id="instGuideBody">
        ${renderGuideSteps(activeTab)}
      </div>
    `,
    submitLabel: 'Got it',
    onSave: () => {},
  });

  const dialog = document.querySelector('dialog[open]');
  dialog.querySelector('[data-install-tabs]').addEventListener('click', e => {
    const chip = e.target.closest('[data-inst-tab]');
    if (!chip) return;
    const tab = chip.dataset.instTab;
    dialog.querySelectorAll('[data-inst-tab]').forEach(c => {
      c.setAttribute('aria-pressed', String(c.dataset.instTab === tab));
    });
    dialog.querySelector('#instGuideBody').innerHTML = renderGuideSteps(tab);
  });
}

function renderGuideSteps(tab){
  if (tab === 'ios'){
    return `
      <ol class="steps-list">
        <li>
          <div>
            <b>Tap the Share button in Safari</b>
            <span>Look for the square icon with an upward arrow (⎕↑) at the bottom or top of your screen.</span>
          </div>
        </li>
        <li>
          <div>
            <b>Select "Add to Home Screen"</b>
            <span>Scroll down the share menu options and tap "Add to Home Screen" (+).</span>
          </div>
        </li>
        <li>
          <div>
            <b>Tap "Add" at the top right</b>
            <span>Back Gear icon will now be on your home screen ready to open in full screen!</span>
          </div>
        </li>
      </ol>
      <div class="notice notice-amber" style="margin-top:16px">
        ${icon('info')}
        <span class="small">If your browser does not show this option, open this page in Safari and use its Share menu.</span>
      </div>`;
  }
  if (tab === 'android'){
    return `
      <ol class="steps-list">
        <li>
          <div>
            <b>Tap the Browser Menu (⋮)</b>
            <span>Tap the 3 vertical dots at the top right corner in Chrome, Brave, or Samsung Internet.</span>
          </div>
        </li>
        <li>
          <div>
            <b>Tap "Install App" or "Add to Home screen"</b>
            <span>Look for the install or home screen option in the dropdown menu.</span>
          </div>
        </li>
        <li>
          <div>
            <b>Confirm "Install"</b>
            <span>Confirm the browser prompt, then open Back Gear from your home screen.</span>
          </div>
        </li>
      </ol>`;
  }
  return `
    <ol class="steps-list">
      <li>
        <div>
          <b>In Chrome, Edge, or Brave</b>
          <span>Click the <b>Install (⤓ or ⊕)</b> icon on the right side of the address bar at the top.</span>
        </div>
      </li>
      <li>
        <div>
          <b>Click "Install Back Gear"</b>
          <span>Confirm the prompt to create a dedicated desktop window and app shortcut.</span>
        </div>
      </li>
      <li>
        <div>
          <b>On Safari (macOS Sonoma+)</b>
          <span>Click <b>File → Add to Dock</b> from the top menu bar.</span>
        </div>
      </li>
    </ol>`;
}

/* ---------------- More menu (mobile) ---------------- */
export function renderMore(view){
  setPage({ title:'More' });
  view.innerHTML = `<div class="rows">
    ${moreItems().map(s => `<a class="row-item" href="#/${s.id}">
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
  view.onclick = async e => {
    if (e.target.closest('[data-do="install"]')) return handleInstall();
    if (e.target.closest('[data-do="signout"]')) signOut();
  };
}

/* ---------------- Instructors ---------------- */
export function renderTrainers(view){
  const list = listInstructors();
  setPage({ title:'Trainers', sub:`${list.length} trainers`, back:true,
    actions:`<button class="btn btn-primary btn-sm" data-do="add-trainer">${icon('plus','icon icon-sm')}Add</button>` });

  view.innerHTML = `<div class="class-list">${list.map(i => {
    const load = instructorLoad(i.id);
    return `<article class="class-card">
      <div class="cc-time"><span class="avatar" aria-hidden="true">${esc(initials(i.name))}</span></div>
      <div class="cc-body">
        <div class="cc-name">${esc(i.name)}</div>
        <div class="cc-meta">
          <span>${icon('phone','icon icon-sm')} ${esc(i.phone)}</span>
          <span>${icon('languages','icon icon-sm')} ${esc(i.languages || '\u2014')}</span>
        </div>
        <div class="cc-meta">
          <span>${load.students} students</span>
          <span>${load.upcoming} upcoming classes</span>
        </div>
      </div>
      <div class="cc-side">
        <span class="pill ${i.active ? 'pill-green' : ''}">${i.active ? 'Active' : 'Not working'}</span>
        <div class="cc-actions">
          <button class="btn btn-sm" data-edit-trainer="${esc(i.id)}">Edit</button>
          <button class="btn btn-sm" data-students="${esc(i.id)}">Students</button>
          <button class="btn btn-sm btn-danger" data-remove-trainer="${esc(i.id)}">Remove</button>
        </div>
      </div>
    </article>`; }).join('')}</div>
    <div id="instPanel" style="margin-top:22px"></div>`;

  const handle = e => {
    if (e.target.closest('[data-do="add-trainer"]')) return openTrainerForm();
    const ed = e.target.closest('[data-edit-trainer]');
    if (ed) return openTrainerForm(list.find(x => x.id === ed.dataset.editTrainer));
    const rm = e.target.closest('[data-remove-trainer]');
    if (rm) return removeTrainer(rm.dataset.removeTrainer);
    const show = e.target.closest('[data-students]');
    if (show){
      const i = list.find(x => x.id === show.dataset.students);
      const mine = studentsOf(i.id);
      $('#instPanel', view).innerHTML = `
        <div class="block-head"><h2>${esc(i.name)} \u2014 their students</h2></div>
        ${mine.length ? `<div class="rows">${mine.map(s => `
          <a class="row-item" href="#/student/${esc(s.id)}">
            <span class="row-main"><b>${esc(s.name)}</b>
              <span>${esc(courseById(s.courseId).label)}</span></span>
            ${icon('chevron-right','icon row-chev')}</a>`).join('')}</div>`
        : emptyState('users', 'No active students assigned.')}`;
      $('#instPanel', view).scrollIntoView({ behavior:'smooth', block:'nearest' });
    }
  };
  view.onclick = handle;
  $('#topActions').onclick = handle;
}

function openTrainerForm(trainer){
  openSheet({
    title: trainer ? `Edit ${trainer.name}` : 'Add a trainer',
    body: `${field({ name:'name', label:'Name', value:trainer?.name, required:true })}
      ${field({ name:'phone', label:'Phone number', type:'tel', value:trainer?.phone, required:true,
                attrs:'inputmode="tel"' })}
      ${field({ name:'languages', label:'Languages they teach in', value:trainer?.languages,
                attrs:'placeholder="Punjabi, Hindi"' })}
      ${trainer ? selectField({ name:'active', label:'Currently working', value:String(trainer.active),
        options:[{value:'true',label:'Yes, taking classes'},{value:'false',label:'No, not right now'}] }) : ''}`,
    submitLabel: trainer ? 'Save changes' : 'Add trainer',
    onSave: data => {
      saveInstructor({ ...(trainer ? { id:trainer.id } : {}), ...data,
        active: data.active === undefined ? true : data.active === 'true' });
      toast(trainer ? 'Trainer updated' : `${data.name} added as a trainer`);
    },
  });
}

/** Removing a trainer is blocked until their students and classes have a new home. */
function removeTrainer(id){
  const trainer = getInstructor(id);
  const load = instructorLoad(id);
  const others = listInstructors().filter(i => i.id !== id);

  if (!load.students && !load.upcoming){
    openSheet({
      title:`Remove ${trainer.name}?`,
      body:`<p>${esc(trainer.name)} has no students and no upcoming classes, so it is safe to remove them.</p>`,
      submitLabel:'Remove trainer',
      onSave: () => { deleteInstructor(id); toast(`${trainer.name} removed`); },
    });
    return;
  }
  const bits = [];
  if (load.students) bits.push(`${load.students} ${load.students === 1 ? 'student' : 'students'}`);
  if (load.upcoming) bits.push(`${load.upcoming} upcoming ${load.upcoming === 1 ? 'class' : 'classes'}`);

  openSheet({
    title:`Move ${trainer.name}'s work first`,
    body:`<div class="notice notice-amber">${icon('triangle-alert')}
        <span>${esc(trainer.name)} has ${esc(bits.join(' and '))}.
        Please reassign them before removing this trainer.</span></div>
      ${others.length ? `<div style="margin-top:20px">
        ${selectField({ name:'to', label:'Move everything to', value: others[0].id,
          options: others.map(i => ({ value:i.id, label:i.name })) })}
        <p class="hint">Their students and all future classes move across. Finished classes stay
          on the record as they were.</p></div>`
        : `<p style="margin-top:16px">There is no other trainer to move them to. Add one first.</p>`}`,
    submitLabel: others.length ? 'Reassign all' : 'Close',
    onSave: data => {
      if (!others.length) return;
      const moved = reassignInstructor(id, data.to);
      const to = getInstructor(data.to);
      toast(`Moved ${moved.students} students and ${moved.lessons} classes to ${to.name}. You can remove ${trainer.name} now.`);
    },
  });
}

/* ---------------- Cars ---------------- */
export function renderVehicles(view){
  const cars = listVehicles({ includeRetired: true });
  const today = lessonsOn(TODAY).filter(l => l.status !== 'Cancelled');
  setPage({ title:'Vehicles', sub:`${cars.length} cars and scooters`, back:true,
    actions:`<button class="btn btn-primary btn-sm" data-do="add-vehicle">${icon('plus','icon icon-sm')}Add</button>` });

  view.innerHTML = `
    <p class="sheet-lead" style="margin-bottom:16px">Who is using each vehicle today.</p>
    <div class="class-list">${cars.map(v => {
      const booked = today.filter(l => l.vehicleId === v.id).sort((a,b) => a.time.localeCompare(b.time));
      const tone = v.status === 'Available' ? (booked.length ? 'pill-amber' : 'pill-green')
                 : v.status === 'In maintenance' ? 'pill-red' : '';
      return `<article class="class-card${v.status === 'Retired' ? ' is-off' : ''}">
        <div class="cc-time">${icon('car','icon icon-lg')}</div>
        <div class="cc-body">
          <div class="cc-name">${esc(v.name)}</div>
          <div class="cc-meta"><span>${esc(v.reg)}</span><span>${esc(v.type)}</span></div>
          ${v.status === 'Available'
            ? (booked.length ? `<ul class="car-slots">${booked.map(l => `
                <li>${fmtTime(l.time)} \u2014 ${esc(getStudent(l.studentId)?.name || 'student')}</li>`).join('')}</ul>`
              : `<p class="car-free">Free all day</p>`)
            : `<p class="car-free" style="color:var(--ink-2)">Not taking classes</p>`}
        </div>
        <div class="cc-side">
          <span class="pill ${tone}">${v.status === 'Available' && booked.length
            ? booked.length + ' booked' : esc(v.status)}</span>
          <div class="cc-actions">
            <button class="btn btn-sm" data-edit-vehicle="${esc(v.id)}">Edit</button>
            <button class="btn btn-sm btn-danger" data-remove-vehicle="${esc(v.id)}">Remove</button>
          </div>
        </div>
      </article>`; }).join('')}</div>`;

  const handle = e => {
    if (e.target.closest('[data-do="add-vehicle"]')) return openVehicleForm();
    const ed = e.target.closest('[data-edit-vehicle]');
    if (ed) return openVehicleForm(getVehicle(ed.dataset.editVehicle));
    const rm = e.target.closest('[data-remove-vehicle]');
    if (rm) return removeVehicle(rm.dataset.removeVehicle);
  };
  view.onclick = handle;
  $('#topActions').onclick = handle;
}

function openVehicleForm(vehicle){
  openSheet({
    title: vehicle ? `Edit ${vehicle.name}` : 'Add a vehicle',
    body: `${field({ name:'name', label:'Name', value:vehicle?.name, required:true,
              attrs:'placeholder="Swift"' })}
      ${field({ name:'reg', label:'Number plate', value:vehicle?.reg, required:true,
              attrs:'placeholder="PB 03 AB 1234"' })}
      ${selectField({ name:'type', label:'Type', value:vehicle?.type || 'Car',
        options:[{value:'Car',label:'Car'},{value:'Scooter',label:'Scooter or bike'}] })}
      ${selectField({ name:'status', label:'Status', value:vehicle?.status || 'Available',
        options: VEHICLE_STATUS.map(x => ({ value:x, label:
          x === 'Available' ? 'Available for classes'
          : x === 'In maintenance' ? 'In maintenance \u2014 no classes'
          : 'Retired \u2014 not used any more' })) })}`,
    submitLabel: vehicle ? 'Save changes' : 'Add vehicle',
    onSave: data => {
      saveVehicle({ ...(vehicle ? { id:vehicle.id } : {}), ...data });
      toast(vehicle ? `${data.name} updated` : `${data.name} added`);
    },
  });
}

/** A vehicle cannot disappear from under a booked class. */
function removeVehicle(id){
  const v = getVehicle(id);
  const { upcoming } = vehicleLoad(id);
  if (upcoming){
    openSheet({
      title:`${v.name} is still booked`,
      body:`<div class="notice notice-amber">${icon('triangle-alert')}
        <span>${esc(v.name)} is booked for ${upcoming} upcoming
        ${upcoming === 1 ? 'class' : 'classes'}. Move those classes to another vehicle,
        or put it in maintenance instead of removing it.</span></div>`,
      submitLabel:'Put in maintenance',
      onSave: () => { saveVehicle({ id, status:'In maintenance' });
        toast(`${v.name} marked as in maintenance`); },
    });
    return;
  }
  openSheet({
    title:`Remove ${v.name}?`,
    body:`<p>${esc(v.name)} has no upcoming classes, so it is safe to remove.</p>`,
    submitLabel:'Remove vehicle',
    onSave: () => { deleteVehicle(id); toast(`${v.name} removed`); },
  });
}

/* ---------------- what trainers have asked for ---------------- */
export function renderRequests(view){
  const open = listRequests('Open');
  const done = listRequests().filter(r => r.status !== 'Open');
  setPage({ title:'Requests', sub:`${open.length} waiting for you`, back:true });

  const card = r => {
    const trainer = getInstructor(r.instructorId);
    const student = getStudent(r.studentId);
    return `<article class="class-card${r.status !== 'Open' ? ' is-off' : ''}">
      <div class="cc-time">${fmtTime(r.time)}</div>
      <div class="cc-body">
        <div class="cc-name">${esc(student?.name || 'Student')} \u2014 ${esc(dmy(r.date))}</div>
        <div class="cc-meta"><span>Asked by ${esc(trainer?.name || 'a trainer')}</span></div>
        <p class="small" style="margin-top:6px">${esc(r.note)}</p>
      </div>
      <div class="cc-side">
        <span class="pill ${r.status === 'Open' ? 'pill-amber' : 'pill-green'}">${esc(r.status)}</span>
        ${r.status === 'Open' ? `<div class="cc-actions">
          <a class="btn btn-sm btn-primary" href="#/schedule">Open schedule</a>
          <button class="btn btn-sm" data-done="${esc(r.id)}">Mark handled</button>
        </div>` : ''}
      </div>
    </article>`;
  };

  view.innerHTML = open.length || done.length
    ? `${open.length ? `<div class="class-list">${open.map(card).join('')}</div>` : ''}
       ${done.length ? `<div class="block" style="margin-top:26px">
         <div class="block-head"><h2>Already handled</h2></div>
         <div class="class-list">${done.map(card).join('')}</div></div>` : ''}`
    : emptyState('circle-alert', 'No requests. Trainers can ask you to move a class from their app.');

  view.onclick = e => {
    const b = e.target.closest('[data-done]');
    if (b){ resolveRequest(b.dataset.done); toast('Marked as handled'); }
  };
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
  view.onclick = handle;
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

  view.onclick = e => {
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
  };
}

/* ---------------- Settings ---------------- */
export function renderSettings(view){
  setPage({ title:'Settings', back:true });
  view.innerHTML = `
    <section class="app-download" aria-labelledby="downloadTitle">
      <img src="/assets/app-icon-192.png" width="78" height="78" alt="Back Gear app icon">
      <div class="app-download-copy">
        <div class="eyebrow-sm">YOUR SCHOOL. IN YOUR POCKET.</div>
        <h2 id="downloadTitle">${installState() === 'installed' ? 'Your app is ready.' : 'Take Back Gear with you.'}</h2>
        <p>Students, schedules and payments, one tap away. Add the web app to your phone’s home screen or your computer.</p>
        <div class="download-actions">
          <button class="btn btn-primary btn-lg" type="button" data-do="install" ${installState() === 'installed' ? 'disabled' : ''}>
            ${icon(installState() === 'installed' ? 'circle-check-big' : 'download')}
            ${installState() === 'installed' ? 'App installed' : 'Download / install app'}
          </button>
          <button class="install-help" type="button" data-do="install-help">How to install</button>
        </div>
      </div>
    </section>
    <p class="install-caption">iPhone · Android · Desktop. Installs from your browser, with no app-store download.</p>

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
      <div class="block-head"><h2>Demo data</h2></div>
      <div class="rows">
        <button class="row-item" type="button" data-do="reset">
          ${icon('triangle-alert')}
          <span class="row-main"><b>Reset the demo</b>
            <span>Put back the original sample students, attendance and payments</span></span>
        </button>
      </div>
    </div>`;

  view.onclick = async e => {
    if (e.target.closest('[data-do="install-help"]')) return openInstallGuide(getDeviceCategory());
    if (e.target.closest('[data-do="install"]')) return handleInstall();
    if (!e.target.closest('[data-do="reset"]')) return;
    openSheet({
      title:'Reset the demo?',
      body:`<p>Everything you changed during this demo will be replaced with the
        original sample data.</p>`,
      submitLabel:'Reset demo',
      onSave: () => { resetDemo(); toast('Demo data restored'); go('#/home'); },
    });
  };
}
