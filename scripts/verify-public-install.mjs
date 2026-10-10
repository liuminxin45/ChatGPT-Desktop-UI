import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { build } from 'esbuild';
import { checkConsumer } from './check-consumer.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const revision = process.env.DESKTOP_UI_REVISION || process.argv[2];
if (!/^[a-f0-9]{40}$/.test(revision || '')) throw Error('Supply the public full commit through DESKTOP_UI_REVISION or the first argument.');
const npmCli = process.env.npm_execpath || process.argv[3];
if (!npmCli || !/npm-cli\.js$/.test(npmCli)) throw Error('Run through npm or supply the existing npm-cli.js as the second argument.');
if (process.version !== 'v24.19.0') throw Error('Use Node 24.19.0.');
const output = path.join(root, 'tests/output');
await fs.mkdir(output, { recursive: true });
const fixture = await fs.mkdtemp(path.join(output, 'public-install-'));
try {
  const manifest = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8'));
  await fs.writeFile(path.join(fixture, 'package.json'), JSON.stringify({ name: 'desktop-ui-install-fixture', private: true, type: 'module', dependencies: {
    'chatgpt-desktop-kit': `git+https://github.com/liuminxin45/ChatGPT-Desktop-UI.git#${revision}`, react: '18.3.1', 'react-dom': '18.3.1',
  } }, null, 2));
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [npmCli, 'install', '--no-audit', '--no-fund', '--registry=https://registry.npmjs.org/'], { cwd: fixture, stdio: 'inherit' });
    child.on('error', reject); child.on('exit', code => code === 0 ? resolve() : reject(Error(`Public installation exited ${code}`)));
  });
  const result = checkConsumer(fixture, { revision, version: manifest.version });
  if (result.status !== 'passed') throw Error(JSON.stringify(result));
  await fs.writeFile(path.join(fixture, 'App.tsx'), `import {createRoot} from 'react-dom/client';
import {DesktopRoot,DesktopClientSurface,ClientComposer,ConversationMessage} from 'chatgpt-desktop-kit';
import {Button} from 'chatgpt-desktop-kit/components/actions';
import {Input} from 'chatgpt-desktop-kit/compat/input';
import 'chatgpt-desktop-kit/styles.css';
createRoot(document.getElementById('root')!).render(<DesktopRoot><DesktopClientSurface><Input aria-label="Project"/><Button actionId="fixture.create">Create</Button><ConversationMessage role="assistant" label="Response">A synthetic response.</ConversationMessage><ClientComposer actionId="fixture.message" label="Message" value="A draft" onValueChange={()=>{}} onSubmit={()=>{}} /></DesktopClientSurface></DesktopRoot>);`);
  const bundle = await build({ absWorkingDir: fixture, entryPoints: ['App.tsx'], outfile: 'build/app.js', bundle: true, format: 'esm', platform: 'browser', jsx: 'automatic', metafile: true });
  if (!Object.keys(bundle.metafile.inputs).some(file => /node_modules\/chatgpt-desktop-kit\/dist\//.test(file))) throw Error('Build did not use the installed distribution');
  const report = { ...result, node: process.version, isolatedPublicInstall: 'passed', reactBuild: 'passed', localCheckoutDependency: false };
  await fs.writeFile(path.join(output, 'public-install.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
} finally {
  const target = path.resolve(fixture);
  if (path.dirname(target) !== output || !(await fs.lstat(target)).isDirectory() || (await fs.lstat(target)).isSymbolicLink()) throw Error('Unsafe fixture cleanup target');
  await fs.rm(target, { recursive: true, force: true });
}
