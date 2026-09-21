/* ==================================================================
   Business details and image sources, in one place.
   Replace anything marked REPLACE before showing real customers.
   ================================================================== */
export const BUSINESS = {
  name:     'Back Gear Driving School',
  short:    'Back Gear',
  city:     'Bathinda',
  state:    'Punjab',
  phone:    '+91 98765 43210',
  phoneHref:'+919876543210',
  whatsapp: '919876543210',
  email:    'backgeardrivingschool@gmail.com',
  address:  'Bathinda, Punjab, India',          // REPLACE with the full street address
  hours:    'Monday to Saturday, 6:00 AM – 7:00 PM',
  closed:   'Closed on Sunday',
  mapsUrl:  'https://www.google.com/maps/search/?api=1&query=Back+Gear+Driving+School+Bathinda',
  languages:'Hindi · Punjabi · English',
};

/* Temporary stock photography (Unsplash Licence — free for commercial use).
   To use the school's own pictures: save them into assets/images/ and change
   each `src` below to e.g. '/assets/images/hero.jpg'. Nothing else needs editing. */
const U = (id, w = 1400) => `https://images.unsplash.com/${id}?w=${w}&q=75&auto=format&fit=crop`;

export const IMAGES = {
  hero:        { src: U('photo-1630406144797-821be1f35d75', 1600), alt: 'A driving instructor with a clipboard beside a training car and a learner' },
  about:       { src: U('photo-1537211790624-e6f568af4b13', 1200), alt: 'An instructor sitting beside a learner in the front of a car' },
  licence:     { src: U('photo-1553782097-130fef5d3e27', 1200),    alt: 'A learner driving through town, hands on the wheel' },
  interior:    { src: U('photo-1615563164538-89e1da13fcc4', 1200), alt: 'Close view of a learner’s hands on the steering wheel' },
  courseCar:   { src: U('photo-1516862523118-a3724eb136d7', 900),  alt: 'A learner driving a car on a city road' },
  courseAuto:  { src: U('photo-1612709060421-596380268eaf', 900),  alt: 'A woman driving a car, smiling' },
  courseRefr:  { src: U('photo-1584672202732-1308a6e909cf', 900),  alt: 'A driver at the wheel seen over the shoulder' },
  courseTwo:   { src: U('photo-1603799091901-f0034ac3e7fa', 900),  alt: 'A rider on a scooter wearing a helmet' },
  courseLadies:{ src: U('photo-1527593167147-e9c94a5883e6', 900),  alt: 'A woman driving a car confidently' },
  courseComm:  { src: U('photo-1596649714492-a8f90ecb3776', 900),  alt: 'A driver at the wheel of a vehicle' },
};

/* One clearly-marked banner so nobody mistakes the prototype for the real thing. */
export const DEMO_NOTICE = 'Demo prototype · sample data only';
