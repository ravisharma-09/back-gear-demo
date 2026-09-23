/* Builds assets/icons.svg - one sprite holding only the Lucide icons we use.
   Lucide is ISC licensed. Re-run with: node build-icons.js  */
const fs = require('node:fs');
const path = require('node:path');

/* Work out which icons are actually used by scanning the source, so the
   sprite can never drift out of step with the code. Three ways an icon
   is referenced: `#i-name` in HTML, `icon('name')` in JS, and `icon:'name'`
   in a data table. */
const SCAN_DIRS = ['js', 'app', 'css', '.'];
function collectUsedIcons(){
  const fsx = require('node:fs'), px = require('node:path');
  const found = new Set();
  const walk = dir => {
    for (const entry of fsx.readdirSync(dir, { withFileTypes:true })){
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      const full = px.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(html|js|cjs|mjs|css)$/.test(entry.name) && entry.name !== 'build-icons.cjs'){
        const text = fsx.readFileSync(full, 'utf8');
        for (const m of text.matchAll(/#i-([a-z0-9-]+)/g)) found.add(m[1]);
        for (const m of text.matchAll(/\bicon\(\s*'([a-z0-9-]+)'/g)) found.add(m[1]);
        for (const m of text.matchAll(/\bicon:\s*'([a-z0-9-]+)'/g)) found.add(m[1]);
      }
    }
  };
  walk(px.join(__dirname));
  return [...found].sort();
}
const ICONS = collectUsedIcons();

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

/* The Back Gear brand mark: a steering wheel with the red L plate at the hub,
   redrawn from the school's own logo. The rim, spokes and hub take currentColor
   so the mark works on white and on navy; the L stays red on both. */
const BRAND = `<symbol id="brand-mark" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="9.35" fill="none" stroke="currentColor" stroke-width="3.3"/>
  <path d="M4.15 12h4.6M15.25 12h4.6M12 15.25v4.6" stroke="currentColor" stroke-width="2.9" fill="none"/>
  <circle cx="12" cy="12" r="3.55" fill="currentColor"/>
  <circle cx="12" cy="12" r="2.75" fill="#ffffff"/>
  <text x="12" y="14.5" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif" font-size="5.1" font-weight="800" fill="#e01d2b">L</text>
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
