import { $, icon, esc, money, initials, dmy, emptyState, openSheet, toast,
         field, selectField, textareaField, downloadCSV } from '../ui.js';
import { setPage } from '../main.js';
import { listStudents, getStudent, feeSummary, allPayments, addPayment,
         totalPending, courseById, TODAY } from '../../data/store.js';

export function openAddPayment(studentId = ''){
  const students = listStudents().filter(s => s.status !== 'Closed');
  openSheet({
    title:'Record Fee Payment',
    body: `
      ${selectField({ name:'studentId', label:'Student', value:studentId,
        options: students.map(s => {
          const { due } = feeSummary(s.id);
          return { value:s.id, label: due > 0 ? `${s.name} — ${money(due)} remaining` : `${s.name} — fully paid` };
        }) })}
      ${field({ name:'amount', label:'Payment Amount (₹)', type:'number', required:true,
                attrs:'min="1" step="1" inputmode="numeric" placeholder="e.g. 2000"' })}
      ${field({ name:'date', label:'Payment Date', type:'date', value:TODAY, required:true })}
      ${selectField({ name:'method', label:'Payment Mode', value:'Cash',
        options:['Cash','UPI','Other'].map(m => ({ value:m, label:m })) })}
      ${textareaField({ name:'note', label:'Note (optional)', rows:2, placeholder:'e.g. Received by Chetan' })}
      <div class="notice notice-amber">${icon('info')}
        <span class="small">Demo mode: this records the entry in the register.</span></div>`,
    submitLabel:'Save payment',
    onSave: data => {
      const p = addPayment(data);
      const st = getStudent(p.studentId);
      const { due } = feeSummary(p.studentId);
      toast(`${money(p.amount)} saved — ${st.name} balance is now ${money(due)}`);
    },
  });
}

export function renderFees(view){
  const students = listStudents().map(s => ({ ...s, ...feeSummary(s.id) }));
  const owing = students.filter(s => s.due > 0).sort((a,b) => b.due - a.due);
  const payments = allPayments();

  setPage({ title:'Fees', sub:'Track student payments and remaining balances',
    actions:`<button class="btn btn-primary btn-sm" data-do="pay">${icon('plus','icon icon-sm')}Add payment</button>` });

  view.innerHTML = `
    <div class="fees-pay-top">
      <button class="btn btn-primary btn-lg btn-block" data-do="pay">
        ${icon('plus')}Record New Payment
      </button>
    </div>

    <div class="fees-pending-bar">
      <div>
        <div class="fees-pending-label">Total Money Pending</div>
        <div class="fees-pending-amt">${money(totalPending())}</div>
      </div>
      <div style="font-size:13.5px;color:var(--ink-2)">
        <b>${owing.length}</b> students have a pending balance
      </div>
    </div>

    <div class="block">
      <div class="block-head">
        <h2>Who still owes money</h2>
        <span class="count">${owing.length} students</span>
      </div>
      ${owing.length ? `
        <div class="tcols t-fees" aria-hidden="true">
          <span>Student</span><span>Course</span>
          <span class="r">Fee / Paid</span><span class="r">Remaining</span><span></span>
        </div>
        <div class="rows">${owing.map(s => `
        <a class="row-item trow t-fees" href="#/student/${esc(s.id)}">
          <span class="row-main" style="display:flex;align-items:center;gap:11px">
            <span class="avatar avatar-sm" aria-hidden="true">${esc(initials(s.name))}</span>
            <span style="min-width:0"><b>${esc(s.name)}</b>
              <span>Total ${money(s.fee)} · Paid ${money(s.paid)}</span></span>
          </span>
          <span class="trow-cell">${esc(courseById(s.courseId).name)}</span>
          <span class="trow-cell r">${money(s.fee)} / ${money(s.paid)}</span>
          <span class="row-side">
            <span class="fee-due-amt">${money(s.due)}</span>
            <span class="fee-due-label">remaining</span>
          </span>
          ${icon('chevron-right','icon row-chev')}
        </a>`).join('')}</div>`
      : emptyState('check', 'Great job! All active students have paid in full.')}
    </div>

    <div class="block">
      <div class="block-head">
        <h2>Recent Payments Received</h2>
        <button class="btn btn-sm btn-ghost" data-do="csv">${icon('download','icon icon-sm')}Export CSV</button>
      </div>
      ${payments.length ? `<div class="rows">${payments.slice(0, 15).map(p => {
        const st = getStudent(p.studentId);
        return `<div class="row-item">
          <span class="row-main"><b>${esc(st?.name || 'Removed student')}</b>
            <span>${dmy(p.date)} · ${esc(p.method)}${p.note ? ' · ' + esc(p.note) : ''}</span></span>
          <span class="row-side"><span class="fee-paid-amt">+ ${money(p.amount)}</span></span>
        </div>`; }).join('')}</div>
        <p class="hr-note">Showing the latest ${Math.min(15, payments.length)} of ${payments.length} payments recorded.</p>`
      : emptyState('banknote', 'No payments recorded yet.')}
    </div>`;

  const handle = e => {
    if (e.target.closest('[data-do="pay"]')) openAddPayment();
    if (e.target.closest('[data-do="csv"]')){
      downloadCSV('back-gear-payments.csv',
        [['Date','Student','Amount','Method','Note']].concat(
          payments.map(p => [p.date, getStudent(p.studentId)?.name || '', p.amount, p.method, p.note])));
      toast('CSV downloaded');
    }
  };
  view.addEventListener('click', handle);
  $('#topActions').onclick = handle;
}
