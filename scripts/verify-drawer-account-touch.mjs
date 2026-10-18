import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
assert.equal(process.version, 'v24.19.0');
const out = path.join(root, 'evidence/drawer-account-touch');
await fs.mkdir(out, { recursive: true });
await build({
  absWorkingDir: root,
  entryPoints: ['examples/mobile-navigation.tsx'],
  bundle: true,
  outfile: path.join(out, 'app.js'),
  format: 'iife',
  jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"production"' },
});
await fs.writeFile(
  path.join(out, 'index.html'),
  '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/app.css"><div id="root"></div><script src="/app.js" defer></script>',
);
const server = http.createServer(async (req, res) => {
  const name = path.basename(new URL(req.url, 'http://fixture').pathname) || 'index.html';
  try {
    const data = await fs.readFile(path.join(out, name));
    res.writeHead(200, {
      'Content-Type': name.endsWith('.js')
        ? 'text/javascript'
        : name.endsWith('.css')
          ? 'text/css'
          : 'text/html',
      'Content-Security-Policy':
        "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:",
    });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const browser = await chromium.launch({ channel: 'msedge', headless: true }),
  checks = [],
  errors = [];
let status = 'failed';
try {
  for (const theme of ['light', 'dark']) {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      hasTouch: true,
      isMobile: true,
      colorScheme: theme,
    });
    const page = await context.newPage();
    page.setDefaultTimeout(4000);
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    await page.getByRole('button', { name: 'Open navigation', exact: true }).tap();
    const sidebar = page.locator('.desktop-navigation-drawer');
    await page
      .getByRole('dialog', { name: 'Modules', exact: true })
      .getByRole('button', { name: 'Account', exact: true })
      .tap();
    await page.getByRole('menu').waitFor({ state: 'visible' });
    assert.equal(await sidebar.getAttribute('data-sidebar-open'), 'true');
    await page.screenshot({ path: path.join(out, theme + '-account.png') });
    await page.getByRole('menuitem', { name: 'Appearance', exact: true }).tap();
    await page.getByRole('menuitemradio', { name: 'Dark', exact: true }).waitFor();
    await page.keyboard.press('Escape');
    assert.equal(await sidebar.getAttribute('data-sidebar-open'), 'true');
    await page.keyboard.press('Escape');
    await page.getByRole('menu').waitFor({ state: 'hidden' });
    assert.equal(await sidebar.getAttribute('data-sidebar-open'), 'true');
    await page
      .locator('.desktop-navigation-drawer > .desktop-chat-workspace__backdrop')
      .tap({ position: { x: 385, y: 300 } });
    assert.equal(await sidebar.getAttribute('data-sidebar-open'), 'false');
    checks.push(
      theme + ': touch account and appearance remain open; nested Escape and genuine backdrop dismissal work',
    );
    await context.close();
  }
  assert.deepEqual(errors, []);
  status = 'passed';
} finally {
  await fs.writeFile(
    path.join(out, 'result.json'),
    JSON.stringify({ status, checks, errors, physicalDevice: false }, null, 2),
  );
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
console.log(JSON.stringify({ status, checks, errors }));
