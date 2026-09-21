/* ==================================================================
   Public website behaviour.
   The booking form writes into the same demo store the management app
   reads, so an enquiry sent here shows up under Enquiries.
   ================================================================== */
import { BUSINESS, IMAGES } from './config.js';
import { COURSES } from './data/seed.js';
import { addEnquiry, ValidationError } from './data/store.js';

const $ = sel => document.querySelector(sel);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
const rupees = n => '₹' + Number(n).toLocaleString('en-IN');

/* ---------- photographs ---------- */
function setPhoto(id, image){
  const el = document.getElementById(id);
  if (!el) return;
  el.alt = image.alt;
  el.loading = id === 'heroPhoto' ? 'eager' : 'lazy';
  el.src = image.src;
  el.addEventListener('error', () => {
    // offline or the photo host is unreachable - keep the layout, lose the picture
    el.removeAttribute('src');
    el.closest('.hero')?.classList.add('no-photo');
    el.style.display = 'none';
  }, { once:true });
}
setPhoto('heroPhoto', IMAGES.hero);
setPhoto('aboutPhoto', IMAGES.about);
setPhoto('licencePhoto', IMAGES.licence);

/* ---------- WhatsApp links ---------- */
const waHref = 'https://wa.me/' + BUSINESS.whatsapp + '?text=' +
  encodeURIComponent(`Hello ${BUSINESS.name}, I would like to know about driving classes.`);
document.querySelectorAll('[data-wa]').forEach(a => { a.href = waHref; a.target = '_blank'; a.rel = 'noopener'; });
$('#year').textContent = new Date().getFullYear();

/* ---------- menu ---------- */
const toggle = $('#navToggle'), nav = $('#siteNav');
toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
});
nav.addEventListener('click', e => {
  if (e.target.tagName === 'A'){ nav.classList.remove('open'); toggle.setAttribute('aria-expanded','false'); }
});

/* ---------- courses ---------- */
const COURSE_PHOTO = {
  'c-car30': IMAGES.courseCar, 'c-car15': IMAGES.courseAuto, 'c-refresh': IMAGES.courseRefr,
  'c-two': IMAGES.courseTwo, 'c-ladies': IMAGES.courseLadies, 'c-comm': IMAGES.courseComm,
};
const COURSE_BLURB = {
  'c-car30':  'Our most popular course. Everything from the first clutch press to driving in Bathinda traffic.',
  'c-car15':  'A shorter course for quick learners, or for people who have driven a little before.',
  'c-refresh':'You already hold a licence but have not driven for a while. Back to confidence in ten days.',
  'c-two':    'Scooter and motorcycle training, including balance, road sense and helmet safety.',
  'c-ladies': 'A women-only batch taught by a lady instructor, with pick-up and drop available.',
  'c-comm':   'For taxi, cab and light transport work. Includes commercial licence paperwork guidance.',
};
$('#courseGrid').innerHTML = COURSES.map(c => {
  const photo = COURSE_PHOTO[c.id] || IMAGES.courseCar;
  return `<article class="course-card">
    <img src="${esc(photo.src)}" alt="${esc(photo.alt)}" loading="lazy" width="600" height="375">
    <div class="body">
      <h3>${esc(c.name)} &middot; ${c.days} Days</h3>
      <div class="course-meta">
        <span class="pill pill-blue">${esc(c.vehicle)}</span>
        <span class="pill">${c.days} classes</span>
      </div>
      <p>${esc(COURSE_BLURB[c.id] || '')}</p>
      <div class="course-fee"><b>${rupees(c.fee)}</b><span>indicative fee</span></div>
      <a class="btn btn-primary" href="#book" data-course="${esc(c.id)}">Book this course</a>
    </div>
  </article>`;
}).join('');

/* clicking a course pre-selects it in the booking form */
$('#courseGrid').addEventListener('click', e => {
  const link = e.target.closest('[data-course]');
  if (!link) return;
  $('#bkCourse').value = link.dataset.course;
  setTimeout(() => $('#bkName').focus({ preventScroll:true }), 400);
});

/* ---------- instructors ----------
   Names and experience are demo content. We deliberately do not use stock
   photographs of people here - nobody should be presented as staff. */
const TEAM = [
  { name:'Raj Kumar',      role:'Senior instructor', since:2016, langs:'Hindi, Punjabi',           teaches:'Car — beginners' },
  { name:'Harpreet Singh', role:'Instructor',        since:2018, langs:'Punjabi, Hindi, English',  teaches:'Car, commercial' },
  { name:'Simran Kaur',    role:'Lady instructor',   since:2020, langs:'Punjabi, Hindi',           teaches:'Ladies batch' },
  { name:'Gurdeep Singh',  role:'Instructor',        since:2022, langs:'Punjabi, English',         teaches:'Two-wheeler' },
];
const initials = n => n.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase();
$('#teamList').innerHTML = TEAM.map(m => `
  <li>
    <span class="avatar" aria-hidden="true">${esc(initials(m.name))}</span>
    <h3>${esc(m.name)}</h3>
    <p class="role">${esc(m.role)}</p>
    <dl>
      <div><dt>Teaching</dt><dd>${esc(m.teaches)}</dd></div>
      <div><dt>With us</dt><dd>since ${m.since}</dd></div>
      <div><dt>Languages</dt><dd>${esc(m.langs)}</dd></div>
    </dl>
  </li>`).join('');
$('#teamList').insertAdjacentHTML('afterend',
  `<p class="team-note">Instructor details shown are demo content for this prototype.</p>`);

/* ---------- FAQ ---------- */
const FAQS = [
  ['What is the minimum age to learn?',
   'You must be 18 to learn in a car or on a geared two-wheeler, and 20 for a commercial licence. A learner licence is needed before road practice begins.'],
  ['What documents do I need?',
   'Aadhaar card, two passport photographs and proof of address. For the learner licence you also complete a Form 1 self-declaration — we help you fill it in.'],
  ['How long does a course take?',
   'The 30 day car course usually finishes in four to five weeks depending on the days you choose. The 15 day course and the 10 day refresher are shorter.'],
  ['Do you help with the licence itself?',
   'Yes. We guide you through the learner licence, book your slot, prepare you on the test route and accompany you on the day of the driving test.'],
  ['Is there a lady instructor?',
   'Yes. The ladies batch is taught by a lady instructor, and pick-up and drop is available for it.'],
  ['What are the fees?',
   'Fees depend on the course and the number of classes. Call us and we will give you the exact amount with nothing hidden.'],
  ['Are the cars dual-control?',
   'Every training car has a second brake and clutch on the instructor’s side, so you are safe from your first class.'],
  ['Do you pick up from home?',
   'We pick up and drop across most of Bathinda city. Tell us your area and we will confirm.'],
];
$('#faqList').innerHTML = FAQS.map(([q, a], i) => `
  <details${i === 0 ? ' open' : ''}>
    <summary>${esc(q)}<svg class="icon" aria-hidden="true"><use href="/assets/icons.svg#i-chevron-down"/></svg></summary>
    <p class="answer">${esc(a)}</p>
  </details>`).join('');

/* ---------- booking form ---------- */
$('#bkCourse').innerHTML =
  `<option value="">Not sure yet — please advise</option>` +
  COURSES.map(c => `<option value="${esc(c.id)}">${esc(c.label)}</option>`).join('') +
  `<option value="licence">Licence help only</option>`;

const form = $('#bookingForm');
const showFieldError = (key, message) => {
  const box = document.getElementById('err' + key);
  const input = document.getElementById('bk' + key);
  if (!box) return;
  box.textContent = message || '';
  box.hidden = !message;
  if (input) input.setAttribute('aria-invalid', message ? 'true' : 'false');
};

form.addEventListener('submit', e => {
  e.preventDefault();
  showFieldError('Name', ''); showFieldError('Phone', '');
  const data = Object.fromEntries(new FormData(form).entries());
  const btn = $('#bkSubmit');
  btn.disabled = true;
  try {
    addEnquiry({ name: data.name.trim(), phone: data.phone.trim(),
                 interest: data.interest || '', note: data.note.trim() });
    form.hidden = true;
    $('#bookingDone').hidden = false;
    $('#bookingDone').scrollIntoView({ behavior:'smooth', block:'center' });
  } catch (err){
    if (err instanceof ValidationError){
      if (err.fields.name)  showFieldError('Name', err.fields.name);
      if (err.fields.phone) showFieldError('Phone', err.fields.phone);
      const firstBad = form.querySelector('[aria-invalid="true"]');
      firstBad?.focus();
    } else {
      showFieldError('Name', 'Something went wrong. Please call us instead.');
    }
  } finally { btn.disabled = false; }
});

$('#bookingAgain').addEventListener('click', () => {
  form.reset(); form.hidden = false; $('#bookingDone').hidden = true;
  $('#bkName').focus();
});
