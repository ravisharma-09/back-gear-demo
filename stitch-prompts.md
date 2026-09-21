# Stitch prompts — Back Gear Driving School

Paste these into Google Stitch (stitch.withgoogle.com). Order matters.

**How to use**
1. Start a new project. Use **Experimental mode** for the bold public website,
   **Standard mode** for the management app (it follows layout instructions more literally).
2. Paste **Prompt 0** first and let it generate. That locks the style.
3. Then paste screen prompts one at a time. Stitch keeps the style from the previous screen.
4. Use the refinement lines at the bottom to push a screen further instead of re-prompting from scratch.
5. Upload a screenshot of the current site as a style reference if you want it to stay close.

---

## PROMPT 0 — Style foundation (paste this first)

```
Design system for "Back Gear Driving School", a driving school in Bathinda, Punjab, India.

Visual direction: bold, confident, modern Indian local business — premium but not corporate.
Think sharp editorial sports magazine, not generic SaaS dashboard.

Colour palette:
- Deep navy #0A1A2F (primary dark, used for full-bleed sections and footers)
- Electric blue #1A6BFF (primary action colour, buttons and links)
- Signal yellow #FFC42E (accent only — road-sign energy, used on one element per screen)
- Off-white #F7F9FC (page background)
- Pure white #FFFFFF (surfaces)
- Success green #12A05B, alert red #E8453C

Typography:
- Headings: a wide, heavy grotesque (Archivo Expanded or Bricolage Grotesque),
  weight 700–800, tight letter-spacing -3%, very large sizes
- Body: Inter or Plus Jakarta Sans, 16–18px, generous line height 1.65
- Numbers: tabular figures, oversized for statistics

Shape and depth:
- Corner radius 16px on cards, 12px on buttons, 999px on pills
- Flat colour blocks and crisp 1px hairlines instead of soft shadows everywhere
- One strong diagonal or lane-marking motif as a recurring graphic device

Photography: real documentary photography of driving lessons in India —
instructor and learner in a car, hands on a steering wheel, a learner licence,
a training car on a street. Warm natural daylight. No stock-smiling clichés.

Rules:
- No glassmorphism, no gradients on text, no floating 3D blobs, no neon glow
- Never put every section inside a rounded box
- Use whitespace and type scale to create hierarchy, not borders
```

---

## PUBLIC WEBSITE

### Prompt 1 — Home / hero
```
Responsive marketing homepage for Back Gear Driving School, Bathinda, Punjab.

Above the fold: a full-bleed photograph of a driving instructor teaching a learner
in a car, with a deep navy gradient over the left half. Over it, an oversized headline
"Learn to Drive in Bathinda with Confidence" set in heavy wide type, broken across
three lines. Below it one supporting sentence, then two buttons:
"Book a Free Demo" (electric blue, large) and "Call Us" (outlined, white on the photo).

Under the headline, a thin horizontal strip of four trust points with line icons:
Dual-control cars · Experienced instructors · Pickup & drop · Hindi / Punjabi / English.

Sticky header: logo left (a steering-wheel mark plus wordmark), navigation centre
(Home, About, Courses, Licence Help, Instructors, FAQ, Contact), and a blue
"Book a Free Demo" button right. Above the header, a slim navy utility bar with
phone number, WhatsApp and "Bathinda, Punjab".

Below the fold: a band of four services separated by vertical hairlines, not cards.
Then a statistics strip on deep navy with four oversized numbers in yellow.

Mobile version: hamburger menu, headline drops to 32px, buttons full width and stacked,
trust points become a two-column grid.
```

### Prompt 2 — Courses
```
A courses section for the same driving school website.

Six course cards in a three-column grid: Car Driving 30 Days, Car Driving 15 Days,
Refresher 10 Days, Two-Wheeler 15 Days, Ladies Batch 30 Days, Commercial 45 Days.

Each card: a real photograph on top (16:10), then the course name in heavy type,
two small pills (vehicle type, number of classes), a one-line description,
a horizontal hairline, then the fee in large tabular numerals on the left and a
blue "Book this course" button full width at the bottom.

The Ladies Batch card is highlighted with a yellow top border and a small "Lady instructor"
badge. Cards lift slightly on hover with a sharper border, no drop shadow.

Mobile: single column, photos keep their aspect ratio, fee and button stay readable.
```

### Prompt 3 — Licence help and instructors
```
Two sections for the same website.

Section one, "We handle the RTO paperwork": a two-column split. Left is a photograph
of a learner driving. Right is a numbered four-step vertical timeline — Learner licence,
Your classes, Driving test, Driving licence — with a thin vertical line connecting
large circular step numbers in electric blue.

Section two, "The people who will teach you": four instructor cards on off-white.
Each has a large circular initials avatar in a blue tint (no photograph), the name in
heavy type, a role line in blue, and a small definition list of Teaching, With us since,
and Languages. Beneath the grid, a small grey note that instructor details are examples.

Mobile: both sections stack to one column, the timeline stays vertical.
```

### Prompt 4 — Contact and booking
```
A contact section for the same website, two columns on desktop.

Left: heading "Come and see us", then a bordered list of rows with line icons —
Phone, WhatsApp, Email, Address, Timings — each row a label and value separated by
hairlines, no boxes.

Right: a booking form in a single white card with a 16px radius and a subtle border.
Title "Book a Free Demo Class", a reassuring line under it, then fields: Your name,
Phone number, Which course (dropdown), Anything you want to tell us (textarea),
and a full-width electric blue submit button "Send my details". Under the button,
small grey text about privacy.

Also design the success state: a green circular tick, "Thank you — we have your details",
and a "Send another" button.

Footer: deep navy, four columns, a yellow top hairline, logo and address on the left.
Mobile: everything stacks, form fields are 48px tall and easy to tap.
```

---

## MANAGEMENT APP (mobile-first web app)

> Keep this one calmer than the website. It is used every day by a shop owner,
> not admired once by a visitor.

### Prompt 5 — Login
```
Mobile-first login screen for a driving school management web app.

Centred white card on a soft blue-to-white vertical background. A steering-wheel logo mark
in electric blue, the wordmark "Back Gear" in heavy wide type, and a subtitle
"Driving School — Staff Login".

Two fields with floating labels — Email or phone, Password with a show/hide eye icon.
A full-width electric blue "Login" button, 52px tall. Below a hairline, a small
demo-account note and a secondary outlined button. A text link back to the website.

Show tablet and desktop versions where the card stays centred and the background
shows a faint lane-marking pattern.
```

### Prompt 6 — Dashboard
```
Mobile-first dashboard for the driving school management web app.
A slim navy bar at the very top reads "Demo prototype".

Header: page title "Home" and today's date. Below, a greeting "Good morning," and
the owner's name in large heavy type.

Four statistic tiles in a 2x2 grid — Total students, Present today, Today's lessons,
Pending fees. Each has a small line icon top left, an oversized tabular number, and a
label. Pending fees uses amber, Present today uses green. Rupee amounts use the ₹ symbol.

Then "Quick actions": four wide buttons in a 2x2 grid with line icons —
Add student, Mark attendance, Add payment, Add lesson.

Then "Today's lessons" with a "View all" link, and a list of rows. Each row: circular
initials avatar, student name in semibold, time and instructor underneath in grey,
and a status pill on the right (Completed in green, Scheduled in blue).

Fixed bottom navigation with five items and line icons: Home, Students, Attendance,
Fees, More. Active item in electric blue.

Also show the desktop version: the bottom navigation becomes a 248px left sidebar
listing Home, Students, Attendance, Fees, Lessons, Instructors, Enquiries, Reports,
Settings, with the statistics becoming a single row of four.
```

### Prompt 7 — Students list and profile
```
Two screens for the same management app.

Screen one, "Students": a search field with a magnifier icon, a horizontal row of
filter pills (All, Active, On hold, Completed), then a list of student rows. Each row:
circular initials avatar, name in semibold, course and phone number underneath in grey,
and on the right either an amber "₹3,000 due" pill or a green "Paid" pill, plus a
chevron. Rows separated by hairlines inside one white container. A blue "Add" button
in the header.

Screen two, "Student profile" for Aman Kumar: a header block with a large initials
avatar, the name, phone and area, and a status pill. Under it, a five-column strip of
key facts with hairline dividers — Course fee ₹8,000, Paid ₹5,000 (green),
Remaining ₹3,000 (amber), Attendance 18/20, Licence status. Then a horizontal tab bar:
Overview, Attendance, Payments, Lessons, Notes. The Overview tab shows a simple
two-column definition list and two action buttons.

Mobile-first, then show the desktop layout.
```

### Prompt 8 — Attendance
```
Mobile attendance screen for the driving school management app. This is the most
used screen, so make it fast and thumb-friendly.

Top: a date stepper — a left chevron button, a date field in the middle, a right
chevron button, and a "Today" button.

Then three summary tiles: Present (green), Absent (red), Not marked (amber).

Then a search field, then a list of students. Each row: circular initials avatar,
name in semibold, course underneath in grey, and on the right two large square buttons
marked P and A, at least 44px tall. When P is selected it fills solid green with white
text; when A is selected it fills solid red. Unselected buttons are white with a grey border.

Pinned above the bottom navigation: two buttons side by side —
"Mark all present" (outlined) and "Save attendance" (solid electric blue).

Show the state after saving with a dark toast message at the bottom.
```

### Prompt 9 — Fees ledger
```
Mobile fees screen for the driving school management app. It should feel like a tidy
digital notebook, not accounting software.

Top: a wide white row showing "Total pending" on the left and ₹47,000 in very large
amber tabular numerals on the right.

Section "Students with a balance": rows with initials avatar, name, "Fee ₹8,000 ·
Paid ₹5,000" underneath in grey, and the remaining amount in amber on the right.

Section "Payment history" with a small CSV download button: rows showing the student
name, then date and payment method underneath, and the amount in green with a plus sign
on the right.

A full-width electric blue "Add payment" button at the bottom.

Also design the "Add payment" bottom sheet: it slides up from the bottom with a
rounded top, a title and close button, fields for Student, Amount in rupees, Date,
Payment method (Cash / UPI / Other) and a Note, an amber information strip saying no
money is actually collected, and Cancel and Save payment buttons pinned at the bottom.
```

### Prompt 10 — Lessons and enquiries
```
Two more screens for the management app.

"Lessons": a date stepper at the top, then a list of lesson rows — time in semibold
followed by the student name, instructor and duration underneath in grey, a status pill
on the right (Completed green, Scheduled blue, Cancelled red), and a small pencil icon
button. A full-width blue "Add lesson" button at the bottom.

"Enquiries": a row of filter pills (All, New, Contacted, Converted, Closed), then
enquiry cards. Each card shows an initials avatar, the person's name, what they are
interested in and their phone number, the date and their note, then a status pill and a
row of small action buttons: "Mark contacted", "Convert to student" (solid blue) and
"Close". New enquiries have a soft amber background so they stand out.
```

---

## REFINEMENT LINES

Type these at a generated screen instead of starting again:

```
Make the headline twice as large and break it onto three lines.
```
```
Remove the card around this section. Use a hairline divider and whitespace instead.
```
```
Increase the vertical spacing between sections by 50%.
```
```
Replace the illustration with a real documentary photograph of a driving lesson in India.
```
```
Use the yellow accent on exactly one element in this screen and nowhere else.
```
```
Make every tap target at least 44px tall and widen the buttons to fill the row.
```
```
Show this screen at 390px width.
```
```
Show the desktop version with a left sidebar instead of bottom navigation.
```
```
Make the numbers much larger and use tabular figures.
```
```
Darken the photo overlay until the white headline passes AA contrast.
```

---

## DO NOT SAY THESE TO STITCH

They reliably produce the generic AI look:

- "modern SaaS dashboard"
- "glassmorphism" / "frosted glass"
- "vibrant gradient background"
- "futuristic" / "neon"
- "3D illustration"
- "beautiful cards"

Ask for a *specific* reference instead: "sharp editorial sports magazine",
"Indian local business signage", "printed school register".
