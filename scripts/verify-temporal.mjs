import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { spawnSync } from 'node:child_process';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'desktop-temporal-'));
const evidence = process.env.DESKTOP_UI_EVIDENCE_DIR || path.join(root, 'tests/output/temporal');
await fs.mkdir(evidence, { recursive: true });
await build({
  absWorkingDir: root,
  entryPoints: ['examples/temporal-contract.tsx'],
  outfile: path.join(temp, 'app.js'),
  bundle: true,
  format: 'esm',
  platform: 'browser',
  jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"production"' },
});
await fs.appendFile(
  path.join(temp, 'app.css'),
  '\n@tailwind base;\n@tailwind utilities;\n.temporal-fixture{padding:24px;max-width:760px}.temporal-fixture-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-bottom:24px}.temporal-fixture-fields>label{display:grid;gap:6px}\n',
);
await fs.writeFile(
  path.join(temp, 'tailwind.cjs'),
  `module.exports={content:[${JSON.stringify(path.join(root, 'src/**/*.{ts,tsx}'))}],darkMode:'class'};`,
);
const tw = spawnSync(
  process.execPath,
  [
    path.join(root, 'node_modules/tailwindcss/lib/cli.js'),
    '-i',
    path.join(temp, 'app.css'),
    '-o',
    path.join(temp, 'processed.css'),
    '-c',
    path.join(temp, 'tailwind.cjs'),
  ],
  { cwd: root, encoding: 'utf8' },
);
assert.equal(tw.status, 0, tw.stderr);
await fs.rename(path.join(temp, 'processed.css'), path.join(temp, 'app.css'));
const server = http.createServer(async (req, res) => {
  const name = req.url === '/app.js' ? 'app.js' : req.url === '/app.css' ? 'app.css' : null;
  res.setHeader('Content-Type', name ? (name.endsWith('js') ? 'text/javascript' : 'text/css') : 'text/html');
  res.end(
    name
      ? await fs.readFile(path.join(temp, name))
      : '<!doctype html><html><head><link rel="stylesheet" href="/app.css"></head><body><div id="root"></div><script type="module" src="/app.js"></script></body></html>',
  );
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
let browser;
let active;
const results = [];
const trigger = (page, id) => page.locator(`[data-desktop-action="example.${id}"]`);
const popup = (page) => page.locator('.desktop-temporal-popover');
try {
  browser = await chromium.launch({ channel: 'msedge', headless: true });
  for (const theme of ['light', 'dark'])
    for (const locale of ['en', 'zh-CN'])
      for (const [width, height, zoom] of [
        [1920, 1080, 1],
        [1280, 800, 1],
        [1280, 800, 1.25],
        [760, 800, 1],
      ]) {
        const context = await browser.newContext({ viewport: { width, height } });
        const page = await context.newPage();
        active = page;
        page.setDefaultTimeout(10000);
        const errors = [];
        page.on('pageerror', (err) => errors.push(err.message));
        await page.goto(`http://127.0.0.1:${server.address().port}/?theme=${theme}&locale=${locale}`);
        await page.evaluate((zoom) => (document.body.style.zoom = String(zoom)), zoom);
        for (const id of ['month', 'date', 'time']) {
          await trigger(page, id).click();
          await popup(page).waitFor();
          const geometry = await popup(page).evaluate((element) => {
            const r = element.getBoundingClientRect(),
              s = getComputedStyle(element);
            const controls = [...element.querySelectorAll('button')].map((node) => {
              const b = node.getBoundingClientRect();
              return { left: b.left, right: b.right, top: b.top, bottom: b.bottom, text: node.textContent };
            });
            return {
              left: r.left,
              right: r.right,
              top: r.top,
              bottom: r.bottom,
              width: r.width,
              radius: s.borderRadius,
              font: s.fontSize,
              overflow: element.scrollWidth > element.clientWidth,
              controls,
            };
          });
          assert.ok(geometry.left >= 0 && geometry.right <= width + 1);
          assert.equal(geometry.overflow, false);
          assert.ok(
            geometry.controls.every((c) => c.left >= geometry.left - 1 && c.right <= geometry.right + 1),
          );
          await page.screenshot({
            path: path.join(evidence, `${locale}-${theme}-${width}-${zoom}-${id}.png`),
          });
          if (width === 1280 && zoom === 1) await popup(page).screenshot({ path: path.join(evidence, `${locale}-${theme}-${id}-detail.png`) });
          results.push({ theme, locale, width, zoom, id, geometry });
          await page.keyboard.press('Escape');
          await popup(page).waitFor({ state: 'hidden' });
        }
        assert.deepEqual(errors, []);
        await context.close();
      }
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  active = page;
  page.setDefaultTimeout(10000);
  await page.goto(`http://127.0.0.1:${server.address().port}/?theme=dark&locale=en`);
  const count = (key) => page.evaluate((key) => window.temporalContract.changes[key] || 0, key);
  await trigger(page, 'month').click();
  await page.getByRole('button', { name: 'Nov', exact: true }).click();
  assert.equal(await count('month'), 1);
  assert.equal(await page.evaluate(() => window.temporalContract.values.month), '2026-11');
  await trigger(page, 'month').click();
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('Enter');
  assert.equal(await count('month'), 2);
  await trigger(page, 'date').click();
  await popup(page).locator('.desktop-calendar-day:not(:disabled)').filter({ hasText: /^29$/ }).first().click();
  assert.equal(await page.evaluate(() => window.temporalContract.values.date), '2024-02-29');
  await trigger(page, 'time').click();
  await page.getByRole('combobox', { name: 'Hour', exact: true }).click();
  await page.getByRole('option', { name: '09', exact: true }).click();
  assert.equal(await count('time'), 0);
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  assert.equal(await count('time'), 0);
  await trigger(page, 'time').click();
  await page.getByRole('combobox', { name: 'Hour', exact: true }).click();
  await page.getByRole('option', { name: '09', exact: true }).click();
  await page.getByRole('button', { name: 'Confirm', exact: true }).click();
  assert.equal(await count('time'), 1);
  assert.equal(await page.evaluate(() => window.temporalContract.values.time), '2026-10-14T09:30');
  await trigger(page, 'time').click();
  await page.getByRole('combobox', { name: 'Minute', exact: true }).click();
  await page.keyboard.press('Escape');
  assert.equal(await popup(page).isVisible(), true);
  await page.keyboard.press('Escape');
  assert.equal(await count('time'), 1);
  await page.getByRole('button', { name: 'Open editor', exact: true }).click();
  await trigger(page, 'dialog-time').click();
  await page.keyboard.press('Escape');
  await page.getByRole('dialog', { name: 'Editor', exact: true }).waitFor();
  assert.equal(await page.getByLabel('Editor draft').inputValue(), 'Preserved draft');
  await trigger(page, 'dialog-time').click();
  await page.getByRole('combobox', { name: 'Hour', exact: true }).click();
  await page.keyboard.press('Escape');
  assert.equal(await popup(page).isVisible(), true);
  assert.equal(await page.evaluate(() => window.temporalContract.submits), 0);
  await page.keyboard.press('Escape');
  await page.getByRole('dialog', { name: 'Editor', exact: true }).waitFor();
  await page.getByRole('dialog', { name: 'Editor', exact: true }).getByRole('button', { name: 'Close', exact: true }).click();
  await page.getByRole('dialog', { name: 'Editor', exact: true }).waitFor({ state: 'hidden' });
  await trigger(page, 'readonly').click();
  assert.equal(await popup(page).count(), 0);
  await fs.writeFile(
    path.join(evidence, 'report.json'),
    JSON.stringify(
      {
        status: 'passed',
        node: process.version,
        cases: results,
        behavior: 'month keyboard/leap date/minute confirmation/nested Escape/draft preservation',
      },
      null,
      2,
    ),
  );
  console.log(JSON.stringify({ status: 'passed', cases: results.length, evidence }));
} catch (error) {
  await active?.screenshot({ path: path.join(evidence, 'failure.png') }).catch(() => {});
  await fs.writeFile(path.join(evidence, 'failure.txt'), error.stack);
  throw error;
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
  await fs.rm(temp, { recursive: true, force: true });
}
