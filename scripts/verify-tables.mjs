import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { root } from './component-catalog.mjs';
const directory = path.join(root, 'tests/output/tables');
await fs.mkdir(directory, { recursive: true });
await build({
  absWorkingDir: root,
  entryPoints: ['examples/table-conditions.tsx'],
  outdir: directory,
  bundle: true,
  format: 'esm',
  jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"production"' },
});
const server = http.createServer(async (req, res) => {
  const file = req.url.split('?')[0];
  if (file === '/favicon.ico') {
    res.writeHead(204);
    res.end();
    return;
  }
  res.setHeader(
    'Content-Type',
    file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : 'text/html',
  );
  res.end(
    file === '/'
      ? '<link rel="stylesheet" href="/table-conditions.css"><div id="root"></div><script type="module" src="/table-conditions.js"></script>'
      : await fs.readFile(path.join(directory, path.basename(file))),
  );
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
let browser;
const results = [];
try {
  browser = await chromium.launch({ channel: 'msedge', headless: true });
  for (const theme of ['light', 'dark'])
    for (const [width, height, scale] of [
      [1920, 1080, 1],
      [1280, 800, 1],
      [1536, 864, 1.25],
      [520, 700, 1],
    ]) {
      const context = await browser.newContext({
        viewport: { width, height },
        deviceScaleFactor: scale,
        colorScheme: theme,
      });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.goto(`http://127.0.0.1:${server.address().port}`);
      await page.getByRole('combobox').waitFor();
      const metrics = await page.evaluate(() => {
        const cell = document.querySelector('td'),
          select = document.querySelector('[role=combobox]'),
          label = select.firstElementChild;
        return {
          inset: parseFloat(getComputedStyle(cell).paddingLeft),
          labelHeight: label.getBoundingClientRect().height,
          selectHeight: select.getBoundingClientRect().height,
          ellipsis: getComputedStyle(label).textOverflow,
          overflow: document.documentElement.scrollWidth > innerWidth,
        };
      });
      assert.ok(metrics.inset >= 12);
      assert.equal(
        await page.locator('td[data-pinned=true]').evaluate((el) => getComputedStyle(el).backgroundColor),
        await page
          .evaluate(() =>
            getComputedStyle(document.documentElement)
              .getPropertyValue('--desktop-color-warning-soft')
              .trim(),
          )
          .then((value) =>
            page.evaluate((value) => {
              const span = document.createElement('span');
              span.style.color = value;
              document.body.append(span);
              const color = getComputedStyle(span).color;
              span.remove();
              return color;
            }, value),
          ),
      );
      assert.ok(metrics.labelHeight > 20);
      assert.notEqual(metrics.ellipsis, 'ellipsis');
      assert.equal(metrics.overflow, false);
      const row = page.locator('tbody tr');
      const initial = await row.evaluate((el) => getComputedStyle(el).backgroundColor);
      await row.hover();
      assert.equal(await row.evaluate((el) => getComputedStyle(el).backgroundColor), initial);
      await page.locator('.desktop-inline-notice__content').click();
      assert.equal(await page.locator('output').textContent(), '0');
      await page.getByRole('button', { name: 'Review', exact: true }).focus();
      await page.keyboard.press('Enter');
      assert.equal(await page.locator('output').textContent(), '1');
      await page.getByRole('combobox').click();
      await page.getByRole('option').last().waitFor();
      assert.ok(
        await page
          .getByRole('option')
          .last()
          .evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
      );
      await page.keyboard.press('Escape');
      const list = page.getByRole('list', { name: 'Records' });
      const columns = await list.evaluate((el) => ({
        heading: el.querySelector('.desktop-virtual-list__header span').getBoundingClientRect().left,
        record: el.querySelector('.desktop-record-row span').getBoundingClientRect().left,
      }));
      assert.ok(Math.abs(columns.heading - columns.record) < 1, 'header and records have different gutters');
      await list.evaluate((el) => (el.scrollTop = el.scrollHeight));
      await page.getByText('BUG-1999', { exact: true }).waitFor();
      assert.ok((await list.locator('[role=listitem]').count()) < 60);
      const captureAnchor = () =>
        list.evaluate((el) => {
          const top =
            el.getBoundingClientRect().top +
            el.querySelector('.desktop-virtual-list__header').getBoundingClientRect().height;
          const row = [...el.querySelectorAll('[data-desktop-item-key]')].find(
            (row) => row.getBoundingClientRect().bottom > top,
          );
          return { key: row.dataset.desktopItemKey, offset: row.getBoundingClientRect().top - top };
        });
      await list.evaluate((el) => (el.scrollTop = el.scrollHeight / 2));
      await page.waitForTimeout(150);
      const anchor = await captureAnchor();
      await page.getByRole('button', { name: 'Toggle list' }).click();
      await page.getByRole('button', { name: 'Toggle list' }).click();
      await page.waitForTimeout(150);
      const restored = await captureAnchor();
      assert.equal(restored.key, anchor.key, 'remount lost the stable record');
      assert.ok(Math.abs(restored.offset - anchor.offset) < 2);
      await page.getByRole('button', { name: 'Reverse list' }).click();
      await page.waitForTimeout(150);
      assert.equal((await captureAnchor()).key, anchor.key, 'reorder lost the stable record');
      assert.deepEqual(errors, []);
      await page.screenshot({ path: path.join(directory, `${theme}-${width}-${scale}.png`) });
      results.push({ theme, width, height, scale, metrics });
      await context.close();
    }
  await fs.writeFile(path.join(directory, 'results.json'), JSON.stringify(results, null, 2));
  console.log(JSON.stringify({ status: 'passed', cases: results.length }));
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
