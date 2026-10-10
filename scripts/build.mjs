import { build } from 'esbuild';
import { mkdir, copyFile, readFile, readdir, writeFile, rm, lstat } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
if (process.version !== 'v24.19.0') throw Error('Use the repository Node 24.19.0 runtime.');
const output = path.resolve(root, 'dist');
if (path.dirname(output) !== root || path.basename(output) !== 'dist') throw Error('Invalid library output directory.');
const previous = await lstat(output).catch(error => { if(error.code !== 'ENOENT') throw error; return null; });
if(previous?.isSymbolicLink()) throw Error('Library output must not be redirected.');
await rm(output, {recursive:true, force:true});
await mkdir(output, { recursive: true });
const types = spawnSync(process.execPath, ['node_modules/typescript/bin/tsc', '--emitDeclarationOnly'], { cwd: root, stdio: 'inherit' });
if (types.status) process.exit(types.status);
const compat = (await readdir(path.join(root,'src/compat'))).filter(file=>/\.tsx?$/.test(file)).map(file=>'src/compat/'+file);
const components = (await readdir(path.join(root,'src/components'),{withFileTypes:true})).filter(entry=>entry.isDirectory()).map(entry=>'src/components/'+entry.name+'/index.tsx');
const bundled = await build({ absWorkingDir: root, entryPoints: ['src/index.ts','src/tab-navigation.ts','src/fixed-virtual-list.tsx',...components,...compat], outdir: 'dist', outbase:'src', splitting:true, bundle: true, format: 'esm', platform: 'neutral', mainFields: ['module','main'], banner: {js:'"use client";'}, target: 'es2022', jsx: 'automatic', minify: true, legalComments: 'none', metafile: true, external: ['react', 'react/*', 'react-dom', 'react-dom/*', 'sonner'] });
const modules = [...new Set(Object.keys(bundled.metafile.inputs).map(input=>input.match(/^node_modules\/(?:@[^/]+\/[^/]+|[^/]+)/)?.[0]).filter(Boolean))].sort();
let notices = 'Desktop UI Kit source: MIT. Adapted shadcn/ui compatibility components and bundled dependencies retain their original licenses.\n';
notices += '\n===== shadcn/ui =====\n' + await readFile(path.join(root,'licenses/shadcn-ui.txt'),'utf8');
for(const modulePath of modules) {
  const pkg = JSON.parse(await readFile(path.join(root,modulePath,'package.json'),'utf8'));
  notices += `\n===== ${pkg.name} ${pkg.version} (${typeof pkg.license === 'string' ? pkg.license : 'see package'}) =====\n`;
  for(const name of (await readdir(path.join(root,modulePath))).filter(name=>/^licen[cs]e(?:\.|$)/i.test(name))) {
    try { notices += await readFile(path.join(root,modulePath,name),'utf8') + '\n'; } catch(error) { if(error.code !== 'EISDIR') throw error; }
  }
}
await writeFile(path.join(root,'dist/THIRD_PARTY_NOTICES.txt'),notices.replace(/\r\n/g,'\n').trimEnd()+'\n');
await build({ absWorkingDir: root, entryPoints: ['src/styles.css','src/controls.css','src/tokens.css','src/primitives.css','src/shell.css','src/compound.css'], outdir: 'dist', outbase:'src', bundle: true, minify: true });
await copyFile(path.join(root,'LICENSE'),path.join(root,'dist/LICENSE'));
await copyFile(path.join(root,'scripts/check-consumer.mjs'),path.join(root,'dist/check-consumer.mjs'));
await copyFile(path.join(root,'scripts/check-consumer.d.mts'),path.join(root,'dist/check-consumer.d.mts'));
await copyFile(path.join(root,'scripts/audit-controls.mjs'),path.join(root,'dist/audit-controls.mjs'));
if(process.argv.includes('--library-only')) { console.log('Built UI package, declarations, styles and license notices.'); process.exit(0); }
await build({ absWorkingDir: root, entryPoints: ['examples/gallery/App.tsx'], outfile: 'examples/gallery/build/app.js', bundle: true, format: 'esm', platform: 'browser', target: 'es2022', jsx: 'automatic', minify: true, define: { 'process.env.NODE_ENV': '"production"' } });
await copyFile(path.join(root, 'examples/gallery/index.html'), path.join(root, 'examples/gallery/build/index.html'));
console.log('Built portable UI, declarations and visual gallery.');
