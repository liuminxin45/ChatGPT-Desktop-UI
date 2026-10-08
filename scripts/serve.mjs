import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export function createGalleryServer() {
  return http.createServer((req, res) => {
    const name = new URL(req.url, 'http://localhost').pathname.slice(1) || 'index.html';
    if (!['index.html', 'app.js', 'app.css'].includes(name)) { res.writeHead(404); return res.end(); }
    res.setHeader('Content-Type', name.endsWith('.css') ? 'text/css' : name.endsWith('.js') ? 'text/javascript' : 'text/html');
    try { res.end(fs.readFileSync(path.join(root, 'examples/gallery/build', name))); }
    catch { res.writeHead(404); res.end('Run npm run build first.'); }
  });
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  createGalleryServer().listen(0, '127.0.0.1', function() { console.log(`Gallery: http://127.0.0.1:${this.address().port}`); });
}
