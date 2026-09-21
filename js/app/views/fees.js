import { $, icon, esc, money, initials, dmy, emptyState, openSheet, toast,
         field, selectField, textareaField, downloadCSV } from '../ui.js';
import { setPage } from '../main.js';
import { listStudents, getStudent, feeSummary, allPayments, addPayment,
         totalPending, courseById, TODAY } from '../../data/store.js';

export function openAddPayment(studentId = ''){
  const students = listStudents().filter(s => s.status !== 'Closed');
  openSheet({
    title:'Add payment',
    body: `
      ${selectField({ name:'studentId', label:'Student', value:studentId,
        options: students.map(s => {
          const { due } = feeSummary(s.id);
          return { value:s.id, label: due > 0 ? `${s.name} — ${money(due)} due` : `${s.name} — paid` };
        }) })}
      ${field({ name:'amount', label:'Amount (₹)', type:'number', required:true,
                attrs:'min="1" step="1" inputmode="numeric" placeholder="2000"' })}
      ${field({ name:'date', label:'Date', type:'date', value:TODAY, required:true })}
      ${selectField({ name:'method', label:'Payment method', value:'Cash',
        options:['Cash','UPI','Other'].map(m => ({ value:m, label:m })) })}
      ${textareaField({ name:'note', label:'Note (optional)', rows:2 })}
      <div class="notice notice-amber">${icon('info')}
        <span class="small">This only records a payment in the demo. No money is collected
        and no UPI request is sent.</span></div>`,
    submitLabel:'Save payment',
    onSave: data => {
      const p = addPayment(data);
      const st = getStudent(p.studentId);
      const { due } = feeSummary(p.studentId);
      toast(`${money(p.amount)} recorded — ${st.name} now owes ${money(due)}`);
    },
  });
}

export function renderFees(view){
  const students = listStudents().map(s => ({ ...s, ...feeSummary(s.id) }));
  const owing = students.filter(s => s.due > 0).sort((a,b) => b.due - a.due);
  const payments = allPayments();

  setPage({ title:'Fees', sub:'Who has paid and who still owes',
    actions:`<button class="btn btn-primary btn-sm" data-do="pay">${icon('plus','icon icon-sm')}Payment</button>` });

  view.innerHTML = `
    <div class="total-line">
      <span>Total pending</span><b>${money(totalPending())}</b>
    </div>

    <div class="block">
      <div class="block-head"><h2>Students with a balance</h2>
        <span class="muted small">${owing.length}</span></div>
      ${owing.length ? `<div class="rows">${owing.slice(0, 12).map(s => `
        <a class="row-item" href="#/student/${esc(s.id)}">
          <span class="avatar avatar-sm" aria-hidden="true">${esc(initials(s.name))}</span>
          <span class="row-main"><b>${esc(s.name)}</b>
            <span>Fee ${money(s.fee)} · Paid ${money(s.paid)}</span></span>
          <span class="row-side"><span class="amount" style="color:var(--amber)">${money(s.due)}</span>
            <span class="tiny muted">remaining</span></span>
          ${icon('chevron-right','icon row-chev')}
        </a>`).join('')}</div>`
      : emptyState('check', 'Everyone has paid in full.')}
    </div>

    <div class="block">
      <div class="block-head"><h2>Payment history</h2>
        <button class="btn btn-sm btn-ghost" data-do="csv">${icon('download','icon icon-sm')}CSV</button></div>
      ${payments.length ? `<div class="rows">${payments.slice(0, 15).map(p => {
        const st = getStudent(p.studentId);
        return `<div class="row-item">
          <span class="row-main"><b>${esc(st?.name || 'Removed student')}</b>
            <span>${dmy(p.date)} · ${esc(p.method)}${p.note ? ' · ' + esc(p.note) : ''}</span></span>
          <span class="row-side"><span class="amount" style="color:var(--green)">+ ${money(p.amount)}</span></span>
        </div>`; }).join('')}</div>
        <p class="hr-note">Showing the latest ${Math.min(15, payments.length)} of ${payments.length} payments.</p>`
      : emptyState('banknote', 'No payments recorded yet.')}
    </div>

    <button class="btn btn-primary btn-lg btn-block" data-do="pay">${icon('plus')}Add payment</button>`;

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
