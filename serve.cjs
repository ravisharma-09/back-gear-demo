/* A plain static file server for the demo. There is NO backend and NO API here -
   this only hands the browser the HTML, CSS, JS and images.
   Run it with:  npm start        */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PORT = Number(process.env.PORT) || 5173;
const ROOT = __dirname;
const TYPES = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8',
  '.js':'text/javascript; charset=utf-8', '.json':'application/json', '.svg':'image/svg+xml',
  '.png':'image/png', '.jpg':'image/jpeg', '.webp':'image/webp', '.ico':'image/x-icon',
  '.webmanifest':'application/manifest+json' };

http.createServer((req, res) => {
  let file = decodeURIComponent(req.url.split('?')[0]);
  if (file.endsWith('/')) file += 'index.html';
  const full = path.join(ROOT, file);
  if (!full.startsWith(ROOT)) { res.writeHead(403).end('Forbidden'); return; }
  fs.readFile(full, (err, data) => {
    if (err) {
      // unknown paths inside the app fall back to the app shell
      if (file.startsWith('/app')) {
        return fs.readFile(path.join(ROOT, 'app', 'index.html'), (e2, shell) =>
          e2 ? res.writeHead(404).end('Not found') :
               res.writeHead(200, { 'Content-Type': TYPES['.html'] }).end(shell));
      }
      return res.writeHead(404).end('Not found');
    }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(full)] || 'application/octet-stream',
                         'Cache-Control': 'no-store, must-revalidate' }).end(data);
  });
}).listen(PORT, () => {
  console.log('\n  Back Gear demo running\n');
  console.log(`  Public website   http://localhost:${PORT}/`);
  console.log(`  Management app   http://localhost:${PORT}/app/\n`);
  console.log('  Demo login: owner@backgear.demo / demo123\n');
});
