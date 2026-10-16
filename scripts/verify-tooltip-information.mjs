import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { build } from 'esbuild';
import { chromium } from 'playwright';
if (process.version !== 'v24.19.0') throw Error('Node 24.19.0 required');
const root = path.resolve(import.meta.dirname, '..');
const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'kit-tooltip-information-'));
const output = path.join(root, 'tests/output/tooltip-information');
await fs.mkdir(output, { recursive: true });
await build({
  absWorkingDir: root,
  entryPoints: ['examples/tooltip-information.tsx'],
  outdir: temp,
  bundle: true,
  jsx: 'automatic',
});
const server = http.createServer(async (req, res) => {
  const asset = ['/tooltip-information.js', '/tooltip-information.css'].includes(req.url);
  res.setHeader(
    'Content-Type',
    asset ? (req.url.endsWith('js') ? 'text/javascript' : 'text/css') : 'text/html',
  );
  res.end(
    asset
      ? await fs.readFile(path.join(temp, req.url.slice(1)))
      : '<link rel="stylesheet" href="/tooltip-information.css"><div id="root"></div><script src="/tooltip-information.js"></script>',
  );
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
let browser;
const results = [];
try {
  browser = await chromium.launch({ channel: 'msedge', headless: true });
  for (const theme of ['light', 'dark'])
    for (const [width, zoom] of [
      [1920, 1],
      [1280, 1],
      [1280, 1.25],
      [760, 1.25],
    ]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(`http://127.0.0.1:${server.address().port}`);
      await page.evaluate(
        ({ theme, zoom }) => {
          document.documentElement.dataset.theme = theme;
          document.documentElement.classList.toggle('dark', theme === 'dark');
          document.documentElement.style.zoom = String(zoom);
        },
        { theme, zoom },
      );
      const ordinary = page.getByTestId('ordinary');
      assert.equal(
        await ordinary.locator('.desktop-action-tooltip,[data-state]').count(),
        0,
        'ordinary controls have no tooltip infrastructure',
      );
      for (const target of await ordinary.getByRole('button').all()) {
        await target.hover();
        await page.waitForTimeout(400);
        assert.equal(await page.getByRole('tooltip').count(), 0);
        await target.focus();
        await page.waitForTimeout(100);
        assert.equal(await page.getByRole('tooltip').count(), 0);
      }
      await page.getByRole('button', { name: 'Save', exact: true }).focus();
      await page.keyboard.press('Enter');
      assert.equal(await page.locator('output').textContent(), '1');
      const file = page.getByTestId('filename');
      await file.hover();
      await page.getByRole('tooltip').waitFor();
      await page.screenshot({ path: path.join(output, `${theme}-${width}-${zoom}-clipped.png`) });
      await page.getByRole('button', { name: 'Resize filename' }).click();
      await file.hover();
      await page.waitForTimeout(400);
      assert.equal(await page.getByRole('tooltip').count(), 0, 'fully visible filename must not repeat');
      await page.getByRole('button', { name: 'Resize filename' }).click();
      const row = page.locator('.client-sidebar-link');
      await row.hover();
      await page.getByRole('tooltip').waitFor();
      await page.keyboard.press('Escape');
      await page.getByRole('tooltip').waitFor({ state: 'hidden' });
      const disabled = page.getByRole('button', { name: 'Connect', exact: true });
      assert.equal(await disabled.isDisabled(), true);
      await disabled.locator('..').hover();
      await page.getByRole('tooltip', { name: 'Account is unavailable' }).waitFor();
      await page.keyboard.press('Escape');
      await page.getByRole('tooltip').waitFor({ state: 'hidden' });
      await page.getByRole('button', { name: 'Legacy', exact: true }).focus();
      await page.getByRole('tooltip', { name: 'Legacy additional information' }).waitFor();
      await page.getByRole('button', { name: 'Current task status', exact: true }).hover();
      await page.getByRole('tooltip', { name: 'In progress', exact: true }).waitFor();
      await page.getByRole('button', { name: 'Language', exact: true }).click();
      await page.getByRole('button', { name: '保存', exact: true }).hover();
      await page.waitForTimeout(400);
      assert.equal(await page.getByRole('tooltip').count(), 0);
      assert.deepEqual(errors, []);
      results.push({
        theme,
        width,
        zoom,
        ordinary: 'no tooltip subtree',
        useful: 'disabled reason, clipped value, legacy supplemental information',
        keyboard: 'Enter and Escape',
      });
      await page.close();
    }
  await fs.writeFile(path.join(output, 'results.json'), JSON.stringify(results, null, 2));
  console.log(`PASS supplemental tooltips: ${results.length} theme/viewport/zoom cases`);
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
  // This unique temporary directory is owned by this test.
  if (path.dirname(temp) !== os.tmpdir() || !path.basename(temp).startsWith('kit-tooltip-information-'))
    throw Error('Unexpected temporary root');
  await fs.rm(temp, { recursive: true, force: true });
}
