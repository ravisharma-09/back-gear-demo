# Back Gear Driving School — client demo prototype

A responsive, mobile-first **web** demo for Back Gear Driving School, Bathinda, Punjab.
Two parts on one codebase:

| | Address | What it is |
|---|---|---|
| **Public website** | `/` | The business website customers would see |
| **Management app** | `/app/` | The digital ledger that replaces the paper register |

> **This is a prototype for client review.** It is not the production system.
> There is no backend, no database and no real authentication. All data lives in
> the browser and is sample data about invented people.

---

## Running it

```bash
npm install
npm start
```

Then open **http://localhost:5173/**

**Demo login for the management app**

```
owner@backgear.demo
demo123
```

The login screen has a button that fills this in for you.

---

## The demo flow

A ready-made script for showing the client:

1. Open **http://localhost:5173/** — the public website.
2. Scroll through **Courses**, **Licence Help** and **Instructors**.
3. Fill in **Book a Free Demo** and send it.
4. Open **http://localhost:5173/app/** and sign in with the demo account.
5. **Home** — students, attendance, lessons and pending fees at a glance.
6. **Students → Aman Kumar** — fee ₹8,000, paid ₹5,000, remaining ₹3,000, attendance and lessons.
7. **Attendance** — tap **P** next to a student, then **Save attendance**.
8. **Fees → Add payment** — ₹2,000 for Aman Kumar. The balance drops to ₹1,000.
9. **Lessons** — add a lesson, or tap the pencil to mark one completed.
10. **Enquiries** — the enquiry you sent from the website is here. **Convert to student**
    opens a pre-filled form; saving it creates the student and marks the enquiry converted.
11. **Students** — the new student is in the list.
12. **Reports** — each one downloads a CSV.

**Settings → Reset the demo** puts the original sample data back at any time.

---

## What is real and what is not

**Works for real in the browser**

- Add, edit, search, filter and remove students
- Mark and change attendance, mark everyone present, save a day
- Record payments; balances and totals recalculate
- Add and edit lessons, change lesson status
- Add enquiries, change their status, convert one into a student
- Download CSV reports
- Website enquiries land in the management app

**Deliberately not built yet**

- No server, no database — data is kept in `localStorage` for the length of the demo
- No real authentication; the login compares against one hard-coded demo account
- No roles or permissions
- No payment gateway. Payments are **recorded**, never collected. No UPI request is sent.
- No SMS or email

---

## How the code is arranged

```
index.html            public website
app/index.html        management app shell
css/
  base.css            design system: colours, buttons, forms, pills
  site.css            public website
  app.css             management app
js/
  config.js           business details and photo sources
  site.js             public website behaviour
  data/
    seed.js           the demo data (delete this when a backend arrives)
    store.js          the ONLY file that touches data
  app/
    main.js           demo login, navigation, routing
    ui.js             shared helpers: sheets, toasts, form fields, CSV
    views/            one file per screen
assets/icons.svg      Lucide icons (ISC licence), built by build-icons.cjs
serve.cjs             a plain static file server — no API, no backend
```

### Ready for a real backend

Every screen reads and writes through **`js/data/store.js`** and nothing else.
No component holds its own copy of a student. To move to a real backend, replace
the function bodies in that one file with `fetch()` calls — the screens do not change.

The data models already in place: `students`, `instructors`, `attendance`,
`payments`, `lessons`, `enquiries`.

---

## Photographs

The website uses temporary stock photography from Unsplash (free for commercial use),
referenced in **`js/config.js`**. To use the school's own pictures, drop them into
`assets/images/` and change each `src` in that file. Nothing else needs editing.

Instructor cards deliberately use initials rather than stock portraits — no stranger's
photograph is presented as a member of staff. The names, experience and reviews shown
are demo content and must be replaced with real details before the site goes live.

---

## Rebuilding the icon sprite

```bash
npm run icons
```

Edit the `ICONS` list in `build-icons.cjs` to add more.

---

## When the client approves

The production build would add: a real backend and database, proper authentication
with roles for owner/admin/instructor, an API, secure hosting, automated backups,
audit history, and real notifications.
