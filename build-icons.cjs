/* Builds assets/icons.svg - one sprite holding only the Lucide icons we use.
   Lucide is ISC licensed. Re-run with: node build-icons.js  */
const fs = require('node:fs');
const path = require('node:path');

const ICONS = [
  // public website
  'car','phone','message-circle','map-pin','clock','check','shield-check','users','star',
  'chevron-down','menu','x','mail','book-open','graduation-cap','calendar','arrow-right',
  'languages','circle-check-big','badge-check','quote','building-2',
  // management app
  'house','user-round','calendar-check','indian-rupee','grid-2x2','search','plus','pencil',
  'trash-2','chevron-right','chevron-left','arrow-left','bell','log-out','file-text','download',
  'clipboard-list','user-plus','circle-alert','settings','filter','notebook-pen','banknote',
  'chart-column','eye','eye-off','lock','calendar-days','save','list-checks','circle-user-round',
  'triangle-alert','info','phone-call','user-check','wallet','receipt','square-pen','list',
];

const SRC = path.join(__dirname, 'node_modules', 'lucide-static', 'icons');
const parts = [];
const missing = [];

for (const name of ICONS) {
  const file = path.join(SRC, name + '.svg');
  if (!fs.existsSync(file)) { missing.push(name); continue; }
  const raw = fs.readFileSync(file, 'utf8');
  const inner = raw.slice(raw.indexOf('>', raw.indexOf('<svg')) + 1, raw.lastIndexOf('</svg>')).trim();
  parts.push(`<symbol id="i-${name}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner.replace(/\s+/g, ' ')}</symbol>`);
}

const sprite = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">
<!-- Icons from Lucide (https://lucide.dev) - ISC licence. Built by build-icons.js -->
${parts.join('\n')}
</svg>\n`;

fs.mkdirSync(path.join(__dirname, 'assets'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'assets', 'icons.svg'), sprite);
console.log(`Wrote assets/icons.svg with ${parts.length} icons (${(sprite.length/1024).toFixed(1)} KB)`);
if (missing.length) console.log('NOT FOUND in lucide-static:', missing.join(', '));
