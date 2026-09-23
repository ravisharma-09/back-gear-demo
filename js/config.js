/* ==================================================================
   EVERY WORD AND PICTURE ON THE PUBLIC WEBSITE LIVES HERE.
   Edit this file and the site updates. Nothing else needs touching.

   Lines marked  >>> REPLACE  are placeholders that must be confirmed
   with Back Gear before the site goes live.
   ================================================================== */

export const BUSINESS = {
  name:      'Back Gear Driving School',
  short:     'Back Gear',
  tagline:   'Drive a better tomorrow',
  city:      'Bathinda',
  state:     'Punjab',

  /* >>> REPLACE — confirmed contact details */
  phone:     '+91 98765 43210',
  phoneHref: '+919876543210',
  whatsapp:  '919876543210',
  email:     'backgeardrivingschool@gmail.com',
  addressLines: ['Back Gear Driving School', 'Bathinda, Punjab 151001'],
  mapsUrl:      'https://www.google.com/maps/search/?api=1&query=Back+Gear+Driving+School+Bathinda',
  directionsUrl:'https://www.google.com/maps/dir/?api=1&destination=Back+Gear+Driving+School+Bathinda',

  hours:     'Monday to Saturday, 6:00 AM – 7:00 PM',
  closed:    'Closed on Sunday',
  languages: 'Hindi, Punjabi and English',

  /* Set to true only once Back Gear confirms the fees they want published. */
  showPrices: false,
};

/* ------------------------------------------------------------------
   PHOTOGRAPHY
   Temporary images from Unsplash (free for commercial use), chosen to
   look like real driving practice rather than showroom cars.

   >>> REPLACE each one with Back Gear's own photographs. Save them into
   assets/images/ and change `src` to e.g. '/assets/images/hero.jpg'.
   Keep the same aspect ratio so the layout does not shift.
   ------------------------------------------------------------------ */
const U = (id, w) => `https://images.unsplash.com/${id}?w=${w}&q=72&auto=format&fit=crop`;

export const IMAGES = {
  /* Wide hero crop showing a driver and passenger on the road. */
  hero:     { src: U('photo-1553782097-130fef5d3e27', 1800), w:1800, h:1200,
              alt:'A driver and passenger in a car, seen from the back seat on a city road' },
  /* 16:9 — the road itself */
  roads:    { src: U('photo-1592639296346-560c37a0f711', 1200), w:1200, h:675,
              alt:'A wide Indian road with everyday traffic' },
  /* 4:3 — instructor sitting beside a learner */
  why:      { src: U('photo-1537211790624-e6f568af4b13', 1000), w:1000, h:750,
              alt:'An instructor sitting beside a learner in the front of a car' },
  /* 4:3 — driver's view used for the licence section */
  licence:  { src: U('photo-1553782097-130fef5d3e27', 1000), w:1000, h:750,
              alt:'A driver at the wheel moving through town traffic' },

  /* fleet, 3:2 */
  fleetManual:    { src: U('photo-1648799833144-cfe2988032dc', 800), w:800, h:533,
                    alt:'The gear lever of a manual training car' },
  fleetAutomatic: { src: U('photo-1572360721733-238badbb0dcd', 800), w:800, h:533,
                    alt:'The gear selector of an automatic car' },
  fleetTwoWheeler:{ src: U('photo-1603799091901-f0034ac3e7fa', 800), w:800, h:533,
                    alt:'A helmet resting on a scooter' },

  /* course cards, 3:2 */
  courseBeginner:   { src: U('photo-1615563164538-89e1da13fcc4', 700), w:700, h:467,
                      alt:'Hands on the steering wheel of a training car' },
  courseFastTrack:  { src: U('photo-1572360721733-238badbb0dcd', 700), w:700, h:467,
                      alt:'An automatic gear selector' },
  courseRefresher:  { src: U('photo-1584672202732-1308a6e909cf', 700), w:700, h:467,
                      alt:'A driver at the wheel, seen over the shoulder' },
  courseLadies:     { src: U('photo-1612709060421-596380268eaf', 700), w:700, h:467,
                      alt:'A woman driving a car confidently' },
  courseTwoWheeler: { src: U('photo-1603799091901-f0034ac3e7fa', 700), w:700, h:467,
                      alt:'A helmet on a scooter' },
  courseCommercial: { src: U('photo-1553782097-130fef5d3e27', 700), w:700, h:467,
                      alt:'A driver at the wheel of a vehicle in traffic' },
};

/* ------------------------------------------------------------------
   COURSES — how each one is described to the public. The `id` matches
   the course in the management app, so an enquiry arrives correctly.
   ------------------------------------------------------------------ */
export const COURSE_COPY = {
  'c-car30':   { name:'Beginner Driving Course', image:'courseBeginner',
                 duration:'30 days',  who:'Never driven before',
                 benefit:'Start from the very basics and finish ready for real traffic.' },
  'c-car15':   { name:'Fast-Track Course', image:'courseFastTrack',
                 duration:'15 days',  who:'Some driving experience already',
                 benefit:'A shorter course for people who pick things up quickly.' },
  'c-refresh': { name:'Refresher Training', image:'courseRefresher',
                 duration:'10 days',  who:'Hold a licence but out of practice',
                 benefit:'Get your confidence back without starting again.' },
  'c-ladies':  { name:'Ladies’ Training', image:'courseLadies',
                 duration:'30 days',  who:'Women who prefer a women-only batch',
                 benefit:'Taught by a lady instructor, with pickup assistance.' },
  'c-two':     { name:'Two-Wheeler Training', image:'courseTwoWheeler',
                 duration:'15 days',  who:'Scooter and motorcycle learners',
                 benefit:'Balance, road sense and helmet safety from day one.' },
  'c-comm':    { name:'Commercial Training', image:'courseCommercial',
                 duration:'45 days',  who:'Taxi, cab and light transport work',
                 benefit:'Includes guidance on commercial licence paperwork.' },
};

export const TRUST = [
  { icon:'user-check', title:'Experienced instructors', note:'Patient with complete beginners.' },
  { icon:'shield-check', title:'Dual-control vehicles', note:'A second brake on the instructor’s side.' },
  { icon:'map-pin', title:'Pickup assistance', note:'Across most of Bathinda city.' },
  { icon:'book-open', title:'Licence guidance', note:'From the learner licence to the test.' },
];

export const STEPS = [
  { title:'Choose your course',   note:'Tell us what you want to learn and we will suggest the right one.' },
  { title:'Select a time that suits you', note:'Morning and evening batches, six days a week.' },
  { title:'Train on real Bathinda roads', note:'Quiet lanes first, then real traffic when you are ready.' },
  { title:'Prepare for your driving test', note:'Practice the test route and get your paperwork in order.' },
];

export const WHY = [
  { icon:'users',        title:'Patient, beginner-friendly training',
    note:'Nobody is rushed. Most people do not struggle with driving, they struggle with being hurried.' },
  { icon:'car',          title:'Real traffic practice',
    note:'You will drive the roads you actually use, not only an empty ground.' },
  { icon:'shield-check', title:'Dual-control vehicles',
    note:'The instructor has their own brake and clutch, so you are safe from your first class.' },
  { icon:'clock',        title:'Flexible batches',
    note:'Pick your days and your time slot. Change them if your work changes.' },
  { icon:'clipboard-list', title:'Your progress is tracked properly',
    note:'Every class is recorded, so you always know how many you have done and what is left.' },
  { icon:'book-open',    title:'Licence guidance throughout',
    note:'Help with forms, documents and preparing for the driving test.' },
];

export const FLEET = [
  { image:'fleetManual',    name:'Manual training cars',
    tags:['Manual', 'Dual controls', 'Beginner-friendly'],
    note:'Our main training cars. Dual controls mean the instructor can stop the car at any moment.' },
  { image:'fleetAutomatic', name:'Automatic training car',
    tags:['Automatic', 'Dual controls', 'No clutch'],
    note:'For learners who would rather skip gears and concentrate on the road.' },
  { image:'fleetTwoWheeler',name:'Two-wheeler training',
    tags:['Scooter', 'Helmet provided', 'Beginner-friendly'],
    note:'Scooter training for new riders, starting in a quiet area.' },
];

export const LICENCE_HELP = [
  { title:'Learner licence guidance', note:'We tell you exactly which documents to bring and help you fill the forms.' },
  { title:'Document preparation',     note:'Aadhaar, photographs, address proof and the self-declaration, checked before you go.' },
  { title:'Test slot guidance',       note:'We explain how the appointment works and what to expect on the day.' },
  { title:'Driving test preparation', note:'Practice on the test route until the manoeuvres feel ordinary.' },
];

/* >>> REPLACE — these are written as samples on purpose. Put real words
   from real students here, with their permission, before going live.
   Do not publish invented reviews. */
export const REVIEWS = {
  isSample: true,
  items: [
    { text:'Sample review. Replace this with something a real student said after finishing their course.',
      name:'Student name', area:'Area, Bathinda' },
    { text:'Sample review. Ask two or three students for a line each once they pass their test.',
      name:'Student name', area:'Area, Bathinda' },
    { text:'Sample review. Short and specific works better than long praise.',
      name:'Student name', area:'Area, Bathinda' },
  ],
};

export const TIME_SLOTS = ['6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM',
                           '4:00 PM', '5:00 PM', '6:00 PM'];
