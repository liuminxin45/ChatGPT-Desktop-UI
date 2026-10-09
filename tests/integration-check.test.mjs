import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { checkConsumer } from '../scripts/check-consumer.mjs';

const revision = 'a'.repeat(40);
const source = `git+https://github.com/liuminxin45/ChatGPT-Desktop-UI.git#${revision}`;
function fixture() {
  fs.mkdirSync('tests/output', { recursive: true });
  const root = fs.mkdtempSync(path.resolve('tests/output/integration-'));
  const write = (file, value) => { const target = path.join(root, file); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, typeof value === 'string' ? value : JSON.stringify(value)); };
  write('package.json', { dependencies: { 'chatgpt-desktop-kit': source } });
  const lock = { packages: { '': { dependencies: { 'chatgpt-desktop-kit': source } }, 'node_modules/chatgpt-desktop-kit': { version: '0.3.1', resolved: source } } };
  write('package-lock.json', lock);
  write('node_modules/.package-lock.json', lock);
  write('node_modules/chatgpt-desktop-kit/package.json', { name: 'chatgpt-desktop-kit', version: '0.3.1' });
  for (const file of ['index.js', 'index.d.ts', 'styles.css', 'controls.css', 'tokens.css', 'THIRD_PARTY_NOTICES.txt']) write('node_modules/chatgpt-desktop-kit/dist/' + file, 'fixture');
  write('ui/button.ts', "export * from 'chatgpt-desktop-kit/compat/button';");
  write('ui/tokens.css', "@import 'chatgpt-desktop-kit/tokens.css';");
  write('ui/package.json', { peerDependencies: { 'chatgpt-desktop-kit': '^0.3.1' } });
  const contract = { forwarders: ['ui/button.ts'], styleForwarders: ['ui/tokens.css'], adapterManifests: ['ui/package.json'], retiredPaths: ['vendor/ui'] };
  write('ui.integration.json', contract);
  return { root, write, lock, contract };
}
test('a prepared, public, coordinated release has a single authority', () => {
  const { root } = fixture();
  assert.equal(checkConsumer(root, { revision, version: '0.3.1' }).status, 'passed');
});
test('rejects local release sources and mismatched coordinated revisions', () => {
  const { root, write } = fixture();
  write('package.json', { dependencies: { 'chatgpt-desktop-kit': 'git+file:///workspace/ui#' + revision } });
  const result = checkConsumer(root, { revision: 'b'.repeat(40) });
  assert.ok(result.errors.some(error => error.code === 'public-immutable-git-source'));
  assert.ok(result.errors.some(error => error.code === 'coordinated-revision'));
});
test('rejects duplicate implementations and a stale actual installation', () => {
  const { root, write, lock } = fixture();
  lock.packages['node_modules/other/node_modules/chatgpt-desktop-kit'] = lock.packages['node_modules/chatgpt-desktop-kit'];
  write('package-lock.json', lock);
  write('node_modules/.package-lock.json', { packages: { 'node_modules/chatgpt-desktop-kit': { version: '0.2.0', resolved: source } } });
  const result = checkConsumer(root);
  assert.ok(result.errors.some(error => error.code === 'single-installed-implementation'));
  assert.ok(result.errors.some(error => error.code === 'actual-installation-revision'));
});
test('rejects copied controls, tokens, retired vendor directories and stale peer ranges', () => {
  const { root, write } = fixture();
  write('ui/button.ts', "export function Button() { return null; }");
  write('ui/tokens.css', ':root{--desktop-color-shell:black}');
  write('ui/package.json', { peerDependencies: { 'chatgpt-desktop-kit': '^0.2.0' } });
  write('vendor/ui/index.js', 'copy');
  const codes = checkConsumer(root).errors.map(error => error.code);
  for (const code of ['forwarder-without-implementation', 'style-forwarder-without-tokens', 'retired-copy-absent', 'adapter-peer-version']) assert.ok(codes.includes(code), code);
});
test('rejects a source-only Git installation and paths escaping the consumer', () => {
  const { root, write, contract } = fixture();
  fs.unlinkSync(path.join(root, 'node_modules/chatgpt-desktop-kit/dist/index.js'));
  assert.ok(checkConsumer(root).errors.some(error => error.code === 'prepared-distribution'));
  write('ui.integration.json', { ...contract, forwarders: ['../outside.ts'] });
  assert.ok(checkConsumer(root).errors.some(error => error.code === 'integration-read-failed'));
});
