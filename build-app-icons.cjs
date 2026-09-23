/* Draws the home-screen icons as real PNGs from the Back Gear mark.
   No image library: the pixels are computed, then written with zlib.
   Run with:  npm run app-icons                                        */
const zlib = require('node:zlib');
const fs = require('node:fs');
const path = require('node:path');

const NAVY = [24, 34, 31];
const LIME = [213, 242, 103];
const WHITE = [255, 255, 255];
const RED = [224, 29, 43];

/* ---------- tiny PNG writer ---------- */
let CRC = null;
function crc32(buf){
  if (!CRC){ CRC = new Int32Array(256);
    for (let n = 0; n < 256; n++){ let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      CRC[n] = c; } }
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return c ^ -1;
}
function writePNG(size, pixels){
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++){
    raw[y * (size * 4 + 1)] = 0;
    for (let x = 0; x < size; x++){
      const s = (y * size + x) * 4, d = y * (size * 4 + 1) + 1 + x * 4;
      raw[d] = pixels[s]; raw[d+1] = pixels[s+1]; raw[d+2] = pixels[s+2]; raw[d+3] = pixels[s+3];
    }
  }
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body) >>> 0);
    return Buffer.concat([len, body, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

/* ---------- the mark, as a signed-distance style test ---------- */
/** Returns the colour at a point in a 0..1 square, or null for transparent. */
function sample(u, v, opt){
  const cx = 0.5, cy = 0.5;
  const dx = u - cx, dy = v - cy;
  const d = Math.hypot(dx, dy);

  // rounded tile (maskable icons bleed to the edges instead)
  if (opt.maskable){
    if (u < 0 || u > 1 || v < 0 || v > 1) return null;
  } else {
    const r = 0.22, ax = Math.abs(u - .5), ay = Math.abs(v - .5), lim = .5 - r;
    const outside = ax > lim && ay > lim
      ? Math.hypot(ax - lim, ay - lim) > r
      : (ax > .5 || ay > .5);
    if (outside) return null;
  }

  const R = opt.wheel;                 // outer radius of the rim
  const rim = opt.rim;                 // rim thickness
  const hubR = opt.hub;                // hub radius
  const spoke = opt.spoke;             // half-thickness of a spoke

  // the red L inside the hub
  const lw = hubR * 0.26, lh = hubR * 0.92;
  const lx = dx + hubR * 0.20, ly = dy;
  const inStem = lx > -lw/2 - hubR*0.16 && lx < -lw/2 + lw + -hubR*0.16 + lw && false;
  const stem = (lx >= -hubR*0.30 && lx <= -hubR*0.30 + lw) && (ly >= -lh/2 && ly <= lh/2);
  const foot = (ly >= lh/2 - lw && ly <= lh/2) && (lx >= -hubR*0.30 && lx <= -hubR*0.30 + lw*2.5);
  if (d <= hubR){
    if (stem || foot) return RED;
    return WHITE;
  }
  // spokes: left, right and down, from the hub out to the rim
  const inner = R - rim;
  if (d < inner + rim*0.5){
    const horizontal = Math.abs(dy) <= spoke && Math.abs(dx) <= inner + rim*0.5;
    const down = Math.abs(dx) <= spoke && dy > 0 && dy <= inner + rim*0.5;
    if (horizontal || down) return opt.fg;
  }
  // the rim
  if (d <= R && d >= inner) return opt.fg;
  return opt.bg;
}

function render(size, opt){
  const SS = 4;                         // supersample for smooth edges
  const px = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++){
    for (let x = 0; x < size; x++){
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < SS; sy++){
        for (let sx = 0; sx < SS; sx++){
          const u = (x + (sx + .5) / SS) / size, v = (y + (sy + .5) / SS) / size;
          const c = sample(u, v, opt);
          if (c){ r += c[0]; g += c[1]; b += c[2]; a += 255; }
        }
      }
      const n = SS * SS, i = (y * size + x) * 4;
      px[i] = Math.round(r / n); px[i+1] = Math.round(g / n);
      px[i+2] = Math.round(b / n); px[i+3] = Math.round(a / n);
    }
  }
  return writePNG(size, px);
}

const out = path.join(__dirname, 'assets');
fs.mkdirSync(out, { recursive: true });

const standard = { bg: NAVY, fg: LIME, wheel:.32, rim:.058, hub:.115, spoke:.046, maskable:false };
const maskable = { bg: NAVY, fg: LIME, wheel:.25, rim:.046, hub:.090, spoke:.036, maskable:true };

fs.writeFileSync(path.join(out, 'app-icon-192.png'), render(192, standard));
fs.writeFileSync(path.join(out, 'app-icon-512.png'), render(512, standard));
fs.writeFileSync(path.join(out, 'app-icon-maskable-512.png'), render(512, maskable));
console.log('Wrote app-icon-192.png, app-icon-512.png and app-icon-maskable-512.png');
