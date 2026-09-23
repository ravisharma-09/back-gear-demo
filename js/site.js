/* ==================================================================
   Public website.
   Business content comes from js/config.js, and the booking form
   writes into the same demo store the Admin Portal reads — so an
   enquiry sent here appears under Enquiries in /app/.
   ================================================================== */
import {
  BUSINESS,
  IMAGES,
  COURSE_COPY,
  TRUST,
  STEPS,
  WHY,
  FLEET,
  LICENCE_HELP,
  TIME_SLOTS,
} from "./config.js";
import { COURSES } from "./data/seed.js";
import { addEnquiry, ValidationError } from "./data/store.js";

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const ic = (n, cls = "ic") =>
  `<svg class="${cls}" aria-hidden="true"><use href="/assets/icons.svg#i-${n}"/></svg>`;

/* ---------- pictures ---------- */
function paint(id, key) {
  const el = $(id),
    img = IMAGES[key];
  if (!el || !img) return;
  el.alt = img.alt;
  el.width = img.w;
  el.height = img.h;
  el.addEventListener(
    "error",
    () => {
      el.style.visibility = "hidden";
    },
    { once: true },
  );
  el.src = img.src;
}
paint("#heroImg", "hero");
paint("#roadsImg", "roads");
paint("#whyImg", "why");
paint("#licenceImg", "licence");

/* ---------- phone and WhatsApp ---------- */
const tel = "tel:" + BUSINESS.phoneHref;
const wa =
  "https://wa.me/" +
  BUSINESS.whatsapp +
  "?text=" +
  encodeURIComponent(
    `Hello ${BUSINESS.name}, I would like to know about driving classes.`,
  );
$$("[data-call]").forEach((a) => (a.href = tel));
$$("[data-wa]").forEach((a) => {
  a.href = wa;
  a.target = "_blank";
  a.rel = "noopener";
});

/* ---------- menu ---------- */
const burger = $("#burger"),
  nav = $("#nav");
burger.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  burger.setAttribute("aria-expanded", String(open));
});
nav.addEventListener("click", (e) => {
  if (e.target.closest("a")) {
    nav.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && nav.classList.contains("open")) {
    nav.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
    burger.focus();
  }
});

/* ---------- trust strip ---------- */
$("#trustStrip").innerHTML = TRUST.map(
  (t) => `
  <div class="strip-item">${ic(t.icon)}
    <div><b>${esc(t.title)}</b><span>${esc(t.note)}</span></div>
  </div>`,
).join("");

/* ---------- courses ---------- */
$("#courseGrid").innerHTML = COURSES.map((c, index) => {
  const copy = COURSE_COPY[c.id];
  if (!copy) return "";
  const img = IMAGES[copy.image];
  return `<article class="course" data-category="${c.id === "c-two" ? "two" : c.id === "c-comm" ? "comm" : "car"}">
    <div class="course-photo"><span class="course-number">0${index + 1}</span>
    <img src="${esc(img.src)}" alt="${esc(img.alt)}" width="${img.w}" height="${img.h}"
         loading="lazy" decoding="async">
    </div><div class="course-body">
      <h3>${esc(copy.name)}</h3>
      <div class="course-meta">
        <span class="chip chip-blue">${esc(copy.duration)}</span>
        <span class="chip">${esc(copy.who)}</span>
        ${BUSINESS.showPrices ? `<span class="chip">₹${c.fee.toLocaleString("en-IN")}</span>` : ""}
      </div>
      <p>${esc(copy.benefit)}</p>
      <a class="btn btn-line" href="#book" data-course="${esc(c.id)}">Explore course <span aria-hidden="true">↗</span></a>
    </div>
  </article>`;
}).join("");

$("#feeNote").textContent = BUSINESS.showPrices
  ? "Fees shown are for the full course."
  : "Fees depend on the course and the number of classes. Call us and we will tell you the exact amount, with nothing hidden.";

/* choosing a course jumps to the form with it already selected */
$("#courseGrid").addEventListener("click", (e) => {
  const link = e.target.closest("[data-course]");
  if (!link) return;
  $("#bkCourse").value = link.dataset.course;
  setTimeout(() => $("#bkName").focus({ preventScroll: true }), 420);
});

/* ---------- how it works ---------- */
$("#journey").innerHTML = STEPS.map(
  (s) => `
  <li><b>${esc(s.title)}</b><p>${esc(s.note)}</p></li>`,
).join("");

/* ---------- why ---------- */
$("#whyList").innerHTML = WHY.map(
  (w) => `
  <li>${ic(w.icon)}<div><b>${esc(w.title)}</b><span>${esc(w.note)}</span></div></li>`,
).join("");

/* ---------- fleet ---------- */
$("#fleetGrid").innerHTML = FLEET.map((f) => {
  const img = IMAGES[f.image];
  return `<article>
    <img src="${esc(img.src)}" alt="${esc(img.alt)}" width="${img.w}" height="${img.h}"
         loading="lazy" decoding="async">
    <div class="fleet-body">
      <h3>${esc(f.name)}</h3>
      <div class="course-meta">${f.tags.map((t) => `<span class="chip">${esc(t)}</span>`).join("")}</div>
      <p>${esc(f.note)}</p>
    </div>
  </article>`;
}).join("");

/* ---------- licence ---------- */
$("#licenceList").innerHTML = LICENCE_HELP.map(
  (l) => `
  <li><div><b>${esc(l.title)}</b><span>${esc(l.note)}</span></div></li>`,
).join("");

/* ---------- contact ---------- */
$("#contactGrid").innerHTML = `
  <div class="contact-item">${ic("phone", "ic ic-lg")}
    <h3>Phone</h3>
    <p><a class="cline" href="${tel}">${esc(BUSINESS.phone)}</a></p>
    <div class="contact-acts"><a class="btn btn-line" href="${tel}">Call now</a></div>
  </div>
  <div class="contact-item">${ic("message-circle", "ic ic-lg")}
    <h3>WhatsApp</h3>
    <p>Message us any time</p>
    <div class="contact-acts"><a class="btn btn-line" data-wa href="#">Open WhatsApp</a></div>
  </div>
  <div class="contact-item">${ic("map-pin", "ic ic-lg")}
    <h3>Address</h3>
    <p>${BUSINESS.addressLines.map(esc).join("<br>")}</p>
    <div class="contact-acts">
      <a class="btn btn-line" href="${esc(BUSINESS.mapsUrl)}" target="_blank" rel="noopener">View map</a>
      <a class="btn btn-line" href="${esc(BUSINESS.directionsUrl)}" target="_blank" rel="noopener">Directions</a>
    </div>
  </div>
  <div class="contact-item">${ic("clock", "ic ic-lg")}
    <h3>Opening hours</h3>
    <p>${esc(BUSINESS.hours)}<br><span class="fine">${esc(BUSINESS.closed)}</span></p>
  </div>`;
$$("[data-wa]").forEach((a) => {
  a.href = wa;
  a.target = "_blank";
  a.rel = "noopener";
});

/* ---------- footer ---------- */
$("#footCourses").innerHTML = COURSES.filter((c) => COURSE_COPY[c.id])
  .map((c) => `<li><a href="#courses">${esc(COURSE_COPY[c.id].name)}</a></li>`)
  .join("");
$("#footContact").innerHTML = `
  <li><a href="${tel}">${esc(BUSINESS.phone)}</a></li>
  <li><a href="mailto:${esc(BUSINESS.email)}">${esc(BUSINESS.email)}</a></li>
  <li><a data-wa href="#">WhatsApp</a></li>
  <li>${esc(BUSINESS.hours)}</li>`;
$$("[data-wa]").forEach((a) => {
  a.href = wa;
  a.target = "_blank";
  a.rel = "noopener";
});
$("#copy").textContent =
  `© ${new Date().getFullYear()} ${BUSINESS.name}, ${BUSINESS.city}, ${BUSINESS.state}.`;

/* ---------- booking form ---------- */
$("#bkCourse").innerHTML =
  `<option value="">Not sure yet — please advise</option>` +
  COURSES.filter((c) => COURSE_COPY[c.id])
    .map(
      (c) =>
        `<option value="${esc(c.id)}">${esc(COURSE_COPY[c.id].name)}</option>`,
    )
    .join("") +
  `<option value="licence">Licence help only</option>`;
$("#bkTime").innerHTML =
  `<option value="">Any time</option>` +
  TIME_SLOTS.map((t) => `<option>${esc(t)}</option>`).join("");

const form = $("#bookForm");
function setError(key, message) {
  const box = $("#err" + key),
    input = $("#bk" + key);
  if (box) {
    box.textContent = message || "";
    box.hidden = !message;
  }
  if (input) input.setAttribute("aria-invalid", message ? "true" : "false");
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  setError("Name", "");
  setError("Phone", "");

  const data = Object.fromEntries(new FormData(form).entries());
  const name = (data.name || "").trim();
  const phone = (data.phone || "").trim();
  let bad = false;
  if (name.length < 2) {
    setError("Name", "Please tell us your name.");
    bad = true;
  }
  if (phone.replace(/\D/g, "").length < 10) {
    setError("Phone", "Please enter a 10 digit phone number.");
    bad = true;
  }
  if (bad) {
    $(bad && name.length < 2 ? "#bkName" : "#bkPhone").focus();
    return;
  }

  /* everything the office needs, kept in the note so nothing is lost */
  const extras = [];
  if (data.timing) extras.push(`Prefers ${data.timing}`);
  if (data.area) extras.push(`Pickup: ${data.area.trim()}`);
  if (data.note) extras.push(data.note.trim());

  const btn = $("#bkSend");
  btn.disabled = true;
  btn.textContent = "Sending…";
  try {
    addEnquiry({
      name,
      phone,
      interest: data.interest || "",
      note: extras.join(" · "),
    });
    $("#doneTitle").textContent = `Thank you, ${name.split(" ")[0]}.`;
    $("#doneText").textContent =
      `${BUSINESS.short} will contact you shortly on ${phone}.`;
    form.hidden = true;
    $("#bookDone").hidden = false;
    $("#bookDone").focus({ preventScroll: true });
    $("#bookDone").scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
      block: "center",
    });
  } catch (err) {
    if (err instanceof ValidationError && err.fields) {
      if (err.fields.name) setError("Name", err.fields.name);
      if (err.fields.phone) setError("Phone", err.fields.phone);
    } else {
      setError("Name", "Something went wrong. Please call us instead.");
    }
  } finally {
    btn.disabled = false;
    btn.textContent = "Request a Callback";
  }
});

$("#bookAgain").addEventListener("click", () => {
  form.reset();
  form.hidden = false;
  $("#bookDone").hidden = true;
  $("#bkName").focus();
});

/* Course filters keep all enquiry links tied to their original course IDs. */
$$("[data-filter]").forEach((button) =>
  button.addEventListener("click", () => {
    $$("[data-filter]").forEach((item) => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    $$(".course").forEach((card) => {
      card.hidden =
        button.dataset.filter !== "all" &&
        card.dataset.category !== button.dataset.filter;
    });
    $("#courseStatus").textContent =
      `${$$(".course:not([hidden])").length} courses shown`;
  }),
);

/* Progressively enhanced entrance motion: content stays visible without JS. */
const motion = matchMedia("(prefers-reduced-motion: reduce)");
if (!motion.matches && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.08 },
  );
  $$(
    ".lead, .course, .journey li, .split-media, .split-copy, .fleet article, .faq-list, .book-copy, .book-card, .contact-item",
  ).forEach((el) => {
    el.classList.add("reveal");
    observer.observe(el);
  });
  motion.addEventListener("change", (event) => {
    if (event.matches) {
      observer.disconnect();
      $$(".reveal").forEach((el) => el.classList.add("is-visible"));
    }
  });
}
const syncHeader = () => $("#head").classList.toggle("scrolled", scrollY > 30);
window.addEventListener("scroll", syncHeader, { passive: true });
syncHeader();
if ("IntersectionObserver" in window) {
  const sections = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          $$(".nav > a").forEach((link) => {
            const active = link.hash === "#" + entry.target.id;
            link.classList.toggle("current", active);
            if (active) link.setAttribute("aria-current", "location");
            else link.removeAttribute("aria-current");
          });
        }
      });
    },
    { rootMargin: "-20% 0px -60% 0px" },
  );
  $$("main section[id]").forEach((section) => sections.observe(section));
}
