import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageName = 'chatgpt-desktop-kit';
const publicGit = /^git\+https:\/\/github\.com\/liuminxin45\/ChatGPT-Desktop-UI\.git#([a-f0-9]{40})$/;
// npm's hosted Git resolver canonicalizes GitHub HTTPS specs to public SSH URLs in lockfiles.
const lockedGit = /^git\+(?:https:\/\/github\.com\/|ssh:\/\/git@github\.com\/)liuminxin45\/ChatGPT-Desktop-UI\.git#([a-f0-9]{40})$/;
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));

/** Check only dependency metadata and declared forwarding files; no Host data is read. */
export function checkConsumer(root, options = {}) {
  const directory = path.resolve(root);
  const errors = [];
  let revision;
  const expect = (condition, code, file) => { if (!condition) errors.push({ code, file }); };
  try {
    const manifest = readJson(path.join(directory, 'package.json'));
    const dependencies = [manifest.dependencies?.[packageName], manifest.devDependencies?.[packageName]].filter(Boolean);
    expect(dependencies.length === 1, 'single-direct-dependency', 'package.json');
    const match = publicGit.exec(dependencies[0] || '');
    revision = match?.[1];
    expect(Boolean(match), 'public-immutable-git-source', 'package.json');
    if (options.revision) expect(revision === options.revision, 'coordinated-revision', 'package.json');
    const lock = readJson(path.join(directory, 'package-lock.json'));
    const rootEntry = lock.packages?.[''];
    expect((rootEntry?.dependencies?.[packageName] || rootEntry?.devDependencies?.[packageName]) === dependencies[0], 'manifest-lock-agreement', 'package-lock.json');
    const packageKey = `node_modules/${packageName}`;
    const entries = Object.keys(lock.packages || {}).filter(key => key === packageKey || key.endsWith('/' + packageKey));
    expect(entries.length === 1, 'single-installed-implementation', 'package-lock.json');
    const entry = lock.packages?.[packageKey];
    expect(Boolean(revision) && lockedGit.exec(entry?.resolved || '')?.[1] === revision, 'lock-source-agreement', 'package-lock.json');
    const installedRoot = path.join(directory, packageKey);
    expect(!fs.lstatSync(installedRoot).isSymbolicLink(), 'installed-package-not-local-link', packageKey);
    const installed = readJson(path.join(installedRoot, 'package.json'));
    expect(installed.name === packageName && installed.version === entry?.version, 'installed-version-agreement', packageKey + '/package.json');
    if (options.version) expect(installed.version === options.version, 'coordinated-version', packageKey + '/package.json');
    for (const file of ['dist/index.js', 'dist/index.d.ts', 'dist/styles.css', 'dist/controls.css', 'dist/tokens.css', 'dist/THIRD_PARTY_NOTICES.txt']) {
      expect(fs.existsSync(path.join(installedRoot, file)), 'prepared-distribution', packageKey + '/' + file);
    }
    const installationLock = path.join(directory, 'node_modules/.package-lock.json');
    if (fs.existsSync(installationLock)) {
      const actual = readJson(installationLock).packages?.[packageKey];
      expect(actual?.resolved === entry?.resolved && actual?.version === entry?.version, 'actual-installation-revision', 'node_modules/.package-lock.json');
    }
    const contract = options.contract || (fs.existsSync(path.join(directory, 'ui.integration.json')) ? readJson(path.join(directory, 'ui.integration.json')) : {});
    const resolveDeclared = file => {
      const target = path.resolve(directory, file);
      if (!target.startsWith(directory + path.sep)) throw Error('Declared path must stay inside the consumer');
      return target;
    };
    for (const file of contract.forwarders || []) {
      const source = fs.readFileSync(resolveDeclared(file), 'utf8').trim();
      expect(/^(?:export\s+(?:\*|\{[^}]+\})\s+from\s+['"]chatgpt-desktop-kit(?:\/[^'"]+)?['"];?\s*)+$/.test(source), 'forwarder-without-implementation', file);
    }
    for (const file of contract.styleForwarders || []) {
      const source = fs.readFileSync(resolveDeclared(file), 'utf8').trim();
      expect(/^(?:@import\s+['"]chatgpt-desktop-kit\/[^'"]+['"];\s*)+$/.test(source), 'style-forwarder-without-tokens', file);
    }
    for (const file of contract.adapterManifests || []) {
      const peer = readJson(resolveDeclared(file)).peerDependencies?.[packageName];
      expect(peer === '^' + installed.version, 'adapter-peer-version', file);
    }
    for (const file of contract.retiredPaths || []) expect(!fs.existsSync(resolveDeclared(file)), 'retired-copy-absent', file);
    return { status: errors.length ? 'failed' : 'passed', revision, version: installed.version, errors };
  } catch (error) {
    errors.push({ code: 'integration-read-failed', message: error.message });
    return { status: 'failed', revision, errors };
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = checkConsumer(process.argv[2] || process.cwd(), { revision: process.env.DESKTOP_UI_REVISION, version: process.env.DESKTOP_UI_VERSION });
  console.log(JSON.stringify(result, null, 2));
  if (result.status !== 'passed') process.exitCode = 1;
}
