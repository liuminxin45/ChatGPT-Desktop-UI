import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import { build } from 'esbuild';
import { chromium } from 'playwright';
const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'desktop-record-actions-'));
const output = path.resolve('tests/output/record-actions');
await fs.mkdir(output, { recursive: true });
await build({
  entryPoints: ['examples/record-actions.tsx'],
  outdir: temp,
  bundle: true,
  format: 'esm',
  platform: 'browser',
  jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"production"' },
});
const server = http.createServer(async (req, res) => {
  const name = req.url.split('?')[0],
    asset = ['/record-actions.js', '/record-actions.css'].includes(name);
  res.setHeader('Content-Type', asset ? (name.endsWith('js') ? 'text/javascript' : 'text/css') : 'text/html');
  res.end(
    asset
      ? await fs.readFile(path.join(temp, name.slice(1)))
      : '<link rel="stylesheet" href="/record-actions.css"><div id="root"></div><script type="module" src="/record-actions.js"></script>',
  );
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
let browser;
const results = [];
const background = (element) => getComputedStyle(element).backgroundColor;
try {
  browser = await chromium.launch({ channel: process.env.UI_BROWSER_CHANNEL || 'msedge', headless: true });
  for (const theme of ['light', 'dark'])
    for (const [width, height, scale] of [
      [1920, 1080, 1],
      [1280, 800, 1],
      [1536, 864, 1.25],
    ]) {
      const context = await browser.newContext({
          colorScheme: theme,
          viewport: { width, height },
          deviceScaleFactor: scale,
        }),
        page = await context.newPage(),
        errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(`http://127.0.0.1:${server.address().port}`);
      const row = page.getByTestId('record'),
        link = page.getByRole('link'),
        initiate = page.getByRole('button', { name: 'Initiate', exact: true }),
        details = page.getByRole('button', { name: 'Details', exact: true });
      await row.waitFor();
      const initial = await row.evaluate(background);
      await row.hover({ position: { x: 8, y: 8 } });
      assert.equal(await row.evaluate(background), initial);
      await row.click({ position: { x: 8, y: 8 } });
      assert.equal(await page.locator('output').textContent(), '0');
      assert.equal(new URL(page.url()).hash, '');
      const linkInitial = await link.evaluate(background);
      await link.hover();
      assert.notEqual(await link.evaluate(background), linkInitial);
      assert.equal(await row.evaluate(background), initial);
      await link.click();
      assert.equal(new URL(page.url()).hash, '#source');
      assert.equal(await page.locator('output').textContent(), '0');
      await initiate.focus();
      await page.keyboard.press('Enter');
      assert.equal(await page.locator('output').textContent(), '1');
      await details.focus();
      await page.keyboard.press('Space');
      await page.getByText('Review plan is available.', { exact: true }).waitFor();
      assert.equal(await details.getAttribute('aria-expanded'), 'true');
      assert.equal(await row.evaluate(background), initial);
      await details.click();
      await page.getByText('Review plan is available.', { exact: true }).waitFor({ state: 'hidden' });
      assert.equal(await page.getByRole('button', { name: 'Unavailable' }).isDisabled(), true);
      const setting = page.locator('.client-settings-field'),
        settingBg = await setting.evaluate(background);
      await page.getByRole('button', { name: 'Change' }).hover();
      assert.equal(await setting.evaluate(background), settingBg);
      const select = page.getByRole('button', { name: 'Select conversation' }),
        selectBg = await select.evaluate(background);
      await select.hover();
      assert.notEqual(await select.evaluate(background), selectBg);
      await select.click();
      assert.equal(await select.getAttribute('aria-pressed'), 'true');
      await initiate.hover();
      await page.screenshot({ path: path.join(output, `${theme}-${width}.png`) });
      assert.deepEqual(errors, []);
      assert.equal(await row.locator('button button, a button, button a, [role=button] button').count(), 0);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      results.push({
        theme,
        width,
        height,
        scale,
        staticRow: true,
        independentNavigation: true,
        keyboardCommands: true,
        staticSetting: true,
        selectionHover: true,
      });
      await context.close();
    }
  await fs.writeFile(
    path.join(output, 'result.json'),
    JSON.stringify({ status: 'passed', cases: results }, null, 2),
  );
  console.log(JSON.stringify({ status: 'passed', cases: results.length }));
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
  await fs.rm(temp, { recursive: true, force: true });
}
