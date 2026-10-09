import { build } from 'esbuild';
import { mkdir, copyFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { root } from './component-catalog.mjs';
if (process.version !== 'v24.19.0') throw Error('Use Node 24.19.0.');
const output = path.join(root, 'examples/catalog/build');
await mkdir(output, { recursive: true });
const utilities = spawnSync(
  process.execPath,
  [
    'node_modules/tailwindcss/lib/cli.js',
    '-c',
    'examples/catalog/tailwind.config.cjs',
    '-i',
    'examples/catalog/utilities.css',
    '-o',
    'examples/catalog/build/utilities.css',
    '--minify',
  ],
  { cwd: root, stdio: 'inherit' },
);
if (utilities.status !== 0) throw Error('Reference utility build failed.');
await build({
  absWorkingDir: root,
  entryPoints: ['examples/catalog/App.tsx'],
  outfile: 'examples/catalog/build/app.js',
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2022',
  jsx: 'automatic',
  minify: true,
  define: { 'process.env.NODE_ENV': '"production"' },
});
await copyFile(path.join(root, 'examples/catalog/index.html'), path.join(output, 'index.html'));
console.log('Built searchable component reference.');
