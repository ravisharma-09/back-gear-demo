/* Small helpers every screen in the management app uses. */
export const $  = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
export const icon = (name, cls = 'icon') =>
  `<svg class="${cls}" aria-hidden="true"><use href="/assets/icons.svg#i-${name}"/></svg>`;
export const money = n => '₹' + Number(n || 0).toLocaleString('en-IN');
export const initials = n => String(n || '?').trim().split(/\s+/).slice(0,2)
  .map(w => w[0]).join('').toUpperCase();

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
export const dmy = iso => { if (!iso) return '—'; const d = new Date(iso + 'T12:00:00');
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`; };
export const dShort = iso => { if (!iso) return '—'; const d = new Date(iso + 'T12:00:00');
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`; };
export const dayName = iso => DAYS[new Date(iso + 'T12:00:00').getDay()];
export const isSunday = iso => new Date(iso + 'T12:00:00').getDay() === 0;
export const addDays = (iso, n) => { const d = new Date(iso + 'T12:00:00');
  d.setDate(d.getDate() + n); return d.toISOString().slice(0,10); };
export const fmtTime = t => { const [h, m] = String(t).split(':').map(Number);
  const ap = h < 12 ? 'AM' : 'PM'; const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${String(m).padStart(2,'0')} ${ap}`; };

/* ---------- toast ---------- */
let toastTimer;
export function toast(message, kind){
  let el = $('#toast');
  if (!el){ el = document.createElement('div'); el.id = 'toast'; el.setAttribute('role','status');
    el.setAttribute('aria-live','polite'); document.body.appendChild(el); }
  el.className = 'toast show' + (kind === 'error' ? ' toast-error' : '');
  el.textContent = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.className = 'toast'; }, 2600);
}

/* ---------- bottom sheet / dialog form ---------- */
let onSubmit = null;
export function openSheet({ title, body, submitLabel = 'Save', onSave }){
  $('#sheetTitle').textContent = title;
  $('#sheetBody').innerHTML = body;
  $('#sheetFoot').innerHTML =
    `<button class="btn" type="button" data-close-sheet>Cancel</button>
     <button class="btn btn-primary" type="submit">${esc(submitLabel)}</button>`;
  onSubmit = onSave;
  $('#sheet').showModal();
  const first = $('#sheetBody input, #sheetBody select, #sheetBody textarea');
  if (first) setTimeout(() => first.focus(), 60);
}
export const closeSheet = () => $('#sheet').close();

export function wireSheet(){
  const dlg = $('#sheet');
  dlg.addEventListener('click', e => { if (e.target.closest('[data-close-sheet]')) dlg.close(); });
  $('#sheetForm').addEventListener('submit', async e => {
    e.preventDefault();
    /* a blocked native validation would otherwise fail silently */
    if (!e.target.checkValidity()){ e.target.reportValidity(); return; }
    if (!onSubmit) return dlg.close();
    const data = Object.fromEntries(new FormData(e.target).entries());
    try { await onSubmit(data); dlg.close(); }
    catch (err){ showFormErrors(err); }
  });
}
/** Puts validation messages under the right fields instead of one vague alert. */
export function showFormErrors(err){
  $$('#sheetBody .error-text').forEach(p => { p.hidden = true; p.textContent = ''; });
  $$('#sheetBody [aria-invalid]').forEach(i => i.setAttribute('aria-invalid','false'));
  const fields = err?.fields;
  if (!fields){ toast(err?.message || 'Something went wrong.', 'error'); return; }
  let first = null;
  for (const [key, message] of Object.entries(fields)){
    const input = $(`#sheetBody [name="${key}"]`);
    const box = $(`#sheetBody [data-error="${key}"]`);
    if (box){ box.textContent = message; box.hidden = false; }
    if (input){ input.setAttribute('aria-invalid','true'); first = first || input; }
  }
  first?.focus();
}

/* ---------- form field builders ---------- */
export const field = ({ name, label, type = 'text', value = '', required, attrs = '', hint }) => `
  <div class="field">
    <label class="label" for="f-${name}">${esc(label)}</label>
    <input class="control" id="f-${name}" name="${name}" type="${type}"
           value="${esc(value)}" ${required ? 'required' : ''} ${attrs}>
    ${hint ? `<p class="hint">${esc(hint)}</p>` : ''}
    <p class="error-text" data-error="${name}" hidden></p>
  </div>`;

export const selectField = ({ name, label, options, value = '', hint }) => `
  <div class="field">
    <label class="label" for="f-${name}">${esc(label)}</label>
    <select class="control" id="f-${name}" name="${name}">
      ${options.map(o => `<option value="${esc(o.value)}"${
        String(o.value) === String(value) ? ' selected' : ''}>${esc(o.label)}</option>`).join('')}
    </select>
    ${hint ? `<p class="hint">${esc(hint)}</p>` : ''}
    <p class="error-text" data-error="${name}" hidden></p>
  </div>`;

export const textareaField = ({ name, label, value = '', rows = 3 }) => `
  <div class="field">
    <label class="label" for="f-${name}">${esc(label)}</label>
    <textarea class="control" id="f-${name}" name="${name}" rows="${rows}">${esc(value)}</textarea>
  </div>`;

export const emptyState = (iconName, text, actionHtml = '') =>
  `<div class="empty">${icon(iconName, 'icon icon-lg')}<p>${esc(text)}</p>${actionHtml}</div>`;

/* ---------- CSV ---------- */
export function downloadCSV(filename, rows){
  const csv = rows.map(r => r.map(c => {
    const s = String(c ?? '');
    return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g,'""') + '"' : s;
  }).join(',')).join('\r\n');
  const blob = new Blob(['﻿' + csv], { type:'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
