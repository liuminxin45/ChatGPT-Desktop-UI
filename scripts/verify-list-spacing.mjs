import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { chromium } from 'playwright';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
assert.equal(process.version, 'v24.19.0');
const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'desktop-kit-spacing-')),
  output = path.join(root, 'tests/output/list-spacing');
await fs.mkdir(output, { recursive: true });
await build({
  absWorkingDir: root,
  entryPoints: ['examples/list-spacing.tsx'],
  outdir: temp,
  bundle: true,
  format: 'esm',
  platform: 'browser',
  jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"production"' },
});
const server = http.createServer(async (req, res) => {
  const asset = ['/list-spacing.js', '/list-spacing.css'].includes(req.url);
  res.setHeader(
    'Content-Type',
    asset ? (req.url.endsWith('.js') ? 'text/javascript' : 'text/css') : 'text/html',
  );
  res.end(
    asset
      ? await fs.readFile(path.join(temp, req.url.slice(1)))
      : '<html><head><link rel="stylesheet" href="/list-spacing.css"></head><body><div id="root"></div><script type="module" src="/list-spacing.js"></script></body></html>',
  );
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
let browser;
const results = [];
async function gap(rows) {
  return rows.evaluateAll((elements) => {
    const [a, b] = elements.slice(0, 2).map((element) => element.getBoundingClientRect());
    return b.top - a.bottom;
  });
}
try {
  browser = await chromium.launch({ channel: 'msedge', headless: true });
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
      await page.getByRole('list', { name: 'Dynamic records' }).getByRole('button').first().waitFor();
      const fixed = page.getByRole('list', { name: 'Fixed records' }),
        dynamic = page.getByRole('list', { name: 'Dynamic records' });
      const measured = {
        fixed: await gap(fixed.getByRole('button')),
        dynamic: await gap(dynamic.getByRole('button')),
        stack: await gap(page.locator('.desktop-list-stack button')),
      };
      for (const value of Object.values(measured)) assert.ok(value >= 4, value + ' row gap');
      const tab = page.getByRole('tab', { name: 'Change' });
      await tab.hover();
      const inset = await tab.evaluate((element) => {
        const r = element.getBoundingClientRect(),
          bar = element.closest('.desktop-tool-page-bar').getBoundingClientRect();
        return { top: r.top - bar.top, bottom: bar.bottom - r.bottom };
      });
      assert.ok(inset.top >= 4 && inset.bottom >= 4);
      await page.getByRole('tab', { name: 'Organize' }).focus();
      await page.keyboard.press('ArrowRight');
      assert.equal(await tab.getAttribute('aria-selected'), 'true');
      await page.getByRole('button', { name: 'Menu', exact: true }).click();
      assert.ok((await gap(page.getByRole('menuitem'))) >= 4);
      await page.keyboard.press('Escape');
      await page.getByRole('combobox', { name: 'Choice' }).click();
      assert.ok((await gap(page.getByRole('option'))) >= 4);
      await page.getByRole('option', { name: 'Beta' }).click();
      await fixed.getByRole('button').nth(1).hover();
      await page.screenshot({ path: path.join(output, `${theme}-${width}.png`) });
      await page.evaluate(() => window.listSpacing.scroll(500));
      await fixed.getByRole('button', { name: 'Record 500', exact: true }).waitFor();
      await page.evaluate(() => window.listSpacing.prepend());
      await page.evaluate(() =>
        document
          .querySelector('.desktop-fixed-virtual-list')
          .dispatchEvent(
            new CustomEvent('desktop:restore-list-anchor', {
              detail: { key: '500', offset: 0, top: 0, handled: false },
            }),
          ),
      );
      assert.equal(await fixed.evaluate((element) => element.scrollTop), 501 * 42 + 2);
      await page.evaluate(() => window.listSpacing.scroll(0));
      await fixed.getByRole('button', { name: 'Record 0', exact: true }).press('End');
      await fixed.getByRole('button', { name: 'Record 999', exact: true }).waitFor();
      await dynamic.evaluate((element) => (element.scrollTop = element.scrollHeight));
      await dynamic.getByRole('button', { name: 'Record 999', exact: true }).waitFor();
      await page.evaluate(() => window.listSpacing.empty());
      assert.equal(await fixed.getByRole('button').count(), 0);
      assert.deepEqual(errors, []);
      results.push({
        theme,
        width,
        height,
        scale,
        ...measured,
        tabInset: inset,
        scrollAnchor: 'passed',
        lastRows: 'passed',
        empty: 'passed',
      });
      await context.close();
    }
  await fs.writeFile(
    path.join(output, 'results.json'),
    JSON.stringify({ node: process.version, status: 'passed', results }, null, 2),
  );
  console.log('PASS 6 spacing/hover/keyboard/menu/scroll/anchor/empty cases');
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
  if (path.dirname(temp) === os.tmpdir() && path.basename(temp).startsWith('desktop-kit-spacing-'))
    await fs.rm(temp, { recursive: true, force: true });
}
