import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const npmCli =
  process.env.npm_execpath || path.resolve(path.dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js');
const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'desktop-kit-tarball-'));
const evidence = path.join(root, 'tests/output/tarball');
await fs.mkdir(evidence, { recursive: true });
async function run(node, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(node, args, {
      cwd,
      env: { ...process.env, NODE_EXTRA_CA_CERTS: undefined },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let out = '',
      err = '';
    const timeout = setTimeout(() => {
      child.kill();
      reject(new Error('Consumer command timeout'));
    }, 180000);
    child.stdout.on('data', (chunk) => (out += chunk));
    child.stderr.on('data', (chunk) => (err += chunk));
    child.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.on('exit', (code) => {
      clearTimeout(timeout);
      if (code !== 0) reject(new Error(`Consumer command exited ${code}: ${err.slice(-3000)}`));
      else resolve(out);
    });
  });
}
function decodePack(text) {
  const start = text.search(/^\[\s*$/m);
  if (start < 0) throw Error('npm pack did not return metadata');
  return JSON.parse(text.slice(start));
}
const versions = (process.env.DESKTOP_UI_REACT_MATRIX || '18.3.1,19.0.0,19.3.0').split(',');
const nodes = [
  process.execPath,
  ...(process.env.DESKTOP_UI_CONSUMER_NODES || '').split(path.delimiter).filter(Boolean),
];
const reports = [];
try {
  const suppliedArchive = process.argv
    .find((value) => value.startsWith('--archive='))
    ?.slice('--archive='.length);
  const packs = decodePack(
    await run(
      process.execPath,
      suppliedArchive
        ? [npmCli, 'pack', path.resolve(suppliedArchive), '--dry-run', '--ignore-scripts', '--json']
        : [npmCli, 'pack', '--json', '--pack-destination', temp],
      suppliedArchive ? temp : root,
    ),
  );
  const pack = packs[0];
  const archive = suppliedArchive ? path.resolve(suppliedArchive) : path.join(temp, pack.filename);
  const files = pack.files.map((file) => file.path);
  for (const file of [
    'dist/index.js',
    'dist/index.d.ts',
    'dist/components.css',
    'dist/desktop.css',
    'dist/tokens.css',
    'dist/THIRD_PARTY_NOTICES.txt',
    'LICENSE',
    'README.md',
  ])
    assert.ok(files.includes(file), `Missing tarball file ${file}`);
  assert.ok(
    !files.some((file) => /^(examples|tests|node_modules|artifacts)\//.test(file)),
    'No development/private assets in tarball',
  );
  await fs.copyFile(archive, path.join(evidence, pack.filename));
  for (const react of versions) {
    const fixture = path.join(temp, 'react-' + react);
    await fs.mkdir(fixture);
    const types = react.startsWith('18.') ? '18' : '19';
    await fs.writeFile(
      path.join(fixture, 'package.json'),
      JSON.stringify({
        name: 'independent-desktop-consumer',
        private: true,
        type: 'module',
        dependencies: { 'chatgpt-desktop-kit': 'file:' + archive, react, 'react-dom': react },
        devDependencies: { '@types/react': types, '@types/react-dom': types, typescript: '5.9.3' },
      }),
    );
    // Normal installation: a registry/tarball consumer must not run the source build.
    await run(
      process.execPath,
      [npmCli, 'install', '--no-audit', '--no-fund', '--registry=https://registry.npmjs.org/'],
      fixture,
    );
    const installed = JSON.parse(
      await fs.readFile(path.join(fixture, 'node_modules/chatgpt-desktop-kit/package.json'), 'utf8'),
    );
    assert.equal(installed.version, pack.version);
    assert.equal(
      (await fs.lstat(path.join(fixture, 'node_modules/chatgpt-desktop-kit'))).isSymbolicLink(),
      false,
    );
    await fs.writeFile(
      path.join(fixture, 'App.tsx'),
      `import {createRef} from 'react';
import {DesktopProvider,Button,Checkbox,IconButton,Switch,Input,Dialog} from 'chatgpt-desktop-kit';
import {Calendar} from 'chatgpt-desktop-kit/compat/calendar';
import {Popover,PopoverTrigger,PopoverContent} from 'chatgpt-desktop-kit/compat/popover';
import 'chatgpt-desktop-kit/components.css';
export function App(){return <DesktopProvider theme="dark"><Button actionId="consumer.create">Create</Button><Input defaultValue="Draft"/><Checkbox ref={createRef<HTMLInputElement>()}/><IconButton ref={createRef<HTMLButtonElement>()} aria-label="Close"/><Switch defaultChecked onCheckedChange={()=>{}}/><Popover><PopoverTrigger>Open</PopoverTrigger><PopoverContent>Content</PopoverContent></Popover><Calendar mode="single" initialFocus/><Dialog open={false} title="Details" onClose={()=>{}} /></DesktopProvider>}`,
    );
    await fs.writeFile(
      path.join(fixture, 'tsconfig.json'),
      JSON.stringify({
        compilerOptions: {
          jsx: 'react-jsx',
          module: 'ESNext',
          moduleResolution: 'Bundler',
          target: 'ES2022',
          lib: ['DOM', 'ES2022'],
          strict: true,
          skipLibCheck: false,
          noEmit: true,
        },
        include: ['App.tsx'],
      }),
    );
    await run(process.execPath, [path.join(fixture, 'node_modules/typescript/bin/tsc'), '--noEmit'], fixture);
    const bundled = await build({
      absWorkingDir: fixture,
      entryPoints: ['App.tsx'],
      outdir: path.join(fixture, 'build'),
      bundle: true,
      format: 'esm',
      platform: 'browser',
      jsx: 'automatic',
      metafile: true,
      logLevel: 'error',
    });
    assert.ok(
      Object.keys(bundled.metafile.inputs).some((file) =>
        file.includes('node_modules/chatgpt-desktop-kit/dist/'),
      ),
      'Bundle uses installed distribution',
    );
    await fs.writeFile(
      path.join(fixture, 'server.mjs'),
      `import React from 'react';import {renderToString} from 'react-dom/server';import {DesktopProvider,Input,Switch} from 'chatgpt-desktop-kit';const html=renderToString(React.createElement(DesktopProvider,{theme:'dark'},React.createElement(Input,{defaultValue:'Draft'}),React.createElement(Switch,{defaultChecked:true})));if(!html.includes('data-theme="dark"')||!html.includes('aria-checked="true"'))throw Error('SSR contract failed');console.log(JSON.stringify({node:process.version,react:React.version,ssr:'passed'}));`,
    );
    for (const node of nodes)
      reports.push({
        ...JSON.parse(await run(node, ['server.mjs'], fixture)),
        types: 'passed',
        browserBuild: 'passed',
        normalInstall: 'passed',
      });
  }
  await fs.writeFile(
    path.join(evidence, 'report.json'),
    JSON.stringify(
      {
        status: 'passed',
        archive: pack.filename,
        bytes: pack.size,
        unpackedBytes: pack.unpackedSize,
        integrity: pack.integrity,
        reports,
      },
      null,
      2,
    ),
  );
  console.log(JSON.stringify({ status: 'passed', archive: pack.filename, cases: reports.length, reports }));
} finally {
  const target = path.resolve(temp);
  if (path.dirname(target) !== path.resolve(os.tmpdir()) || (await fs.lstat(target)).isSymbolicLink())
    throw Error('Unsafe fixture cleanup');
  await fs.rm(target, { recursive: true, force: true });
}
