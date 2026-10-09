import { build } from 'esbuild';
import { mkdir, copyFile, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
if (process.version !== 'v24.19.0') throw Error('Use Node 24.19.0.');
const destination = path.join(root, 'examples/demo/build');
await mkdir(destination, { recursive: true });
const bundle = await build({ absWorkingDir: root, entryPoints: ['examples/demo/App.tsx'], outfile: 'examples/demo/build/app.js', bundle: true, format: 'esm', platform: 'browser', target: 'es2022', jsx: 'automatic', minify: true, metafile: true, legalComments: 'eof', define: { 'process.env.NODE_ENV': '"production"' } });
await copyFile(path.join(root, 'examples/demo/index.html'), path.join(destination, 'index.html'));
await copyFile(path.join(root, 'LICENSE'), path.join(destination, 'LICENSE.txt'));
await copyFile(path.join(root, 'NOTICE.md'), path.join(destination, 'NOTICE.txt'));
// Keep full dependency license texts alongside the redistributable browser bundle.
const modules = [...new Set(Object.keys(bundle.metafile.inputs).map(input => input.match(/^node_modules\/(?:@[^/]+\/[^/]+|[^/]+)/)?.[0]).filter(Boolean))].sort();
let notices = 'ChatGPT Desktop UI Kit demo: MIT.\n';
for (const modulePath of modules) {
  const pkg = JSON.parse(await readFile(path.join(root, modulePath, 'package.json'), 'utf8'));
  notices += `\n===== ${pkg.name} ${pkg.version} =====\n`;
  for (const name of (await readdir(path.join(root, modulePath))).filter(name => /^licen[cs]e(?:\.|$)/i.test(name))) {
    try { notices += await readFile(path.join(root, modulePath, name), 'utf8') + '\n'; }
    catch (error) { if (error.code !== 'EISDIR') throw error; }
  }
}
await writeFile(path.join(destination, 'THIRD_PARTY_NOTICES.txt'), notices.replace(/\r\n/g, '\n'));
console.log('Built browser demo: examples/demo/build (static HTML, CSS and JavaScript).');
