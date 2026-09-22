/* Builds assets/icons.svg - one sprite holding only the Lucide icons we use.
   Lucide is ISC licensed. Re-run with: node build-icons.js  */
const fs = require('node:fs');
const path = require('node:path');

const ICONS = require('node:fs')
  .readFileSync(require('node:path').join(__dirname, 'icons.list'), 'utf8')
  .split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));

const SRC = path.join(__dirname, 'node_modules', 'lucide-static', 'icons');
const parts = [];
const missing = [];

for (const name of ICONS) {
  const file = path.join(SRC, name + '.svg');
  if (!fs.existsSync(file)) { missing.push(name); continue; }
  const raw = fs.readFileSync(file, 'utf8');
  const inner = raw.slice(raw.indexOf('>', raw.indexOf('<svg')) + 1, raw.lastIndexOf('</svg>')).trim();
  // no stroke-width here on purpose - CSS sets it so icons stay crisp at every size
  parts.push(`<symbol id="i-${name}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">${inner.replace(/\s+/g, ' ')}</symbol>`);
}

/* The brand mark: a steering wheel, drawn on the same 24 grid as the icons so it
   sits in the sprite and inherits currentColor on light and dark backgrounds. */
const BRAND = `<symbol id="brand-mark" viewBox="0 0 24 24" fill="none" stroke="currentColor"
  stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="9"/>
  <circle cx="12" cy="12" r="2.6"/>
  <path d="M3.1 12h6.3M14.6 12h6.3M12 14.6v6.3"/>
</symbol>`;

const sprite = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">
<!-- Icons from Lucide (https://lucide.dev) - ISC licence. Built by build-icons.js -->
${BRAND}
${parts.join('\n')}
</svg>\n`;

fs.mkdirSync(path.join(__dirname, 'assets'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'assets', 'icons.svg'), sprite);
console.log(`Wrote assets/icons.svg with ${parts.length} icons (${(sprite.length/1024).toFixed(1)} KB)`);
if (missing.length) console.log('NOT FOUND in lucide-static:', missing.join(', '));
