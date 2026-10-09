import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export function createDemoServer() {
  return http.createServer(async (req, res) => {
    const name = new URL(req.url, 'http://localhost').pathname.slice(1) || 'index.html';
    if (!['index.html', 'app.js', 'app.css', 'LICENSE.txt', 'NOTICE.txt', 'THIRD_PARTY_NOTICES.txt'].includes(name)) { res.writeHead(404); return res.end(); }
    try {
      const contents = await readFile(path.join(root, 'examples/demo/build', name));
      res.setHeader('Content-Type', name.endsWith('.css') ? 'text/css' : name.endsWith('.js') ? 'text/javascript' : name.endsWith('.txt') ? 'text/plain; charset=utf-8' : 'text/html');
      res.end(contents);
    } catch { res.writeHead(404); res.end('Run npm run demo:build first.'); }
  });
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 4173);
  const server = createDemoServer();
  server.on('error', error => { console.error(`Demo server failed: ${error.code || error.message}`); process.exitCode = 1; });
  server.listen(port, '127.0.0.1', () => console.log(`Demo: http://127.0.0.1:${server.address().port}`));
}
