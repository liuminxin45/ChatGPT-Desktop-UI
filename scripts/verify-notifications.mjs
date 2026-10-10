import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { chromium } from 'playwright';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
if (process.version !== 'v24.19.0') throw Error('Node 24.19.0 required');
const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'desktop-notifications-')),
  output = process.env.DESKTOP_UI_EVIDENCE_DIR || path.join(root, 'tests/output/notifications');
await fs.mkdir(output, { recursive: true });
await build({
  absWorkingDir: root,
  entryPoints: ['examples/notifications.tsx'],
  outdir: temp,
  bundle: true,
  platform: 'browser',
  jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"production"' },
});
const server = http.createServer(async (req, res) => {
  const asset = ['/notifications.js', '/notifications.css'].includes(req.url);
  res.setHeader(
    'Content-Type',
    asset ? (req.url.endsWith('.js') ? 'text/javascript' : 'text/css') : 'text/html',
  );
  res.end(
    asset
      ? await fs.readFile(path.join(temp, req.url.slice(1)))
      : '<html><link rel="stylesheet" href="/notifications.css"><div id="root"></div><script src="/notifications.js"></script></html>',
  );
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
let browser;
const results = [];
try {
  browser = await chromium.launch({ headless: true, channel: 'msedge' });
  for (const theme of ['light', 'dark'])
    for (const [width, height, scale] of [
      [1920, 1080, 1],
      [1280, 800, 1],
      [1024, 640, 1.25],
      [480, 640, 1],
    ]) {
      const context = await browser.newContext({
          colorScheme: theme,
          viewport: { width, height },
          deviceScaleFactor: scale,
        }),
        page = await context.newPage(),
        errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.goto(`http://127.0.0.1:${server.address().port}`);
      await page.getByRole('button', { name: 'Host notice', exact: true }).click();
      const notice = page.locator('.desktop-toast-notice');
      await notice.waitFor();
      const paint = await notice.evaluate((e) => {
        const s = getComputedStyle(e),
          r = e.getBoundingClientRect();
        return {
          background: s.backgroundColor,
          borders: [s.borderLeftWidth, s.borderRightWidth, s.borderTopWidth, s.borderBottomWidth],
          radius: s.borderRadius,
          font: s.fontSize,
          weight: s.fontWeight,
          left: r.left,
          right: r.right,
          bottom: r.bottom,
          overflow: e.scrollWidth > e.clientWidth,
        };
      });
      assert.deepEqual(paint.borders, ['1px', '1px', '1px', '1px']);
      assert.equal(paint.weight, '400');
      assert.equal(paint.font, '13px');
      assert.ok(paint.left >= 0 && paint.right <= width && paint.bottom <= height && !paint.overflow);
      await page.getByRole('button', { name: 'Close host notice' }).focus();
      await page.getByRole('tooltip', { name: 'Close host notice' }).waitFor();
      await page.keyboard.press('Enter');
      await notice.waitFor({ state: 'detached' });
      for (const kind of ['success', 'error', 'warning', 'info']) {
        await page.getByRole('button', { name: kind, exact: true }).click();
        const queued = page.locator('[data-sonner-toast]').filter({ hasText: kind + ' result' });
        await queued.waitFor();
        await page.waitForTimeout(450);
        const queuePaint = await queued.evaluate((e) => {
          const s = getComputedStyle(e);
          return {
            background: s.backgroundColor,
            border: s.borderLeftWidth,
            radius: s.borderRadius,
            weight: s.fontWeight,
            font: s.fontSize,
            styled: e.dataset.styled,
          };
        });
        assert.equal(queuePaint.background, paint.background);
        assert.equal(queuePaint.radius, paint.radius);
        assert.equal(queuePaint.weight, '400');
        assert.equal(queuePaint.font, '13px');
        assert.equal(queuePaint.styled, 'false');
        if (kind === 'success') {
          assert.equal(
            await queued
              .getByRole('button', { name: 'Undo', exact: true })
              .getAttribute('data-desktop-action'),
            'notification.action',
          );
          await queued.getByRole('button', { name: 'Undo', exact: true }).click();
          assert.equal(await page.locator('output').textContent(), '1');
        } else if (kind === 'warning') {
          const cancel = queued.getByRole('button', { name: 'Cancel notification', exact: true });
          assert.equal(await cancel.getAttribute('data-desktop-action'), 'notification.cancel');
          await cancel.click();
          assert.equal(await page.locator('output').textContent(), '2');
        } else {
          const close = queued.getByRole('button', { name: 'Dismiss notification' });
          assert.equal(await close.getAttribute('data-desktop-action'), 'notification.close');
          await page.keyboard.press('Tab');
          await close.focus();
          assert.equal(
            await close.evaluate((e) => getComputedStyle(e, '::after').content),
            '"Dismiss notification"',
          );
          await close.click();
        }
        await queued.waitFor({ state: 'detached' });
      }
      await page.getByRole('button', { name: 'Timed', exact: true }).click();
      const timed = page.locator('[data-sonner-toast]').filter({ hasText: 'Temporary result' });
      await timed.waitFor();
      await page.mouse.move(width / 2, 20);
      await timed.waitFor({ state: 'detached', timeout: 5000 });
      await page.getByRole('button', { name: 'Search people', exact: true }).click();
      await page.getByLabel('People search').waitFor();
      await page.waitForTimeout(100);
      await page.getByLabel('People search').focus();
      await page.keyboard.press('Escape');
      await page.getByLabel('People search').waitFor({ state: 'detached' });
      await page.waitForTimeout(100);
      assert.equal(
        await page
          .getByRole('button', { name: 'Search people', exact: true })
          .evaluate((e) => document.activeElement === e),
        true,
      );
      await page.getByRole('button', { name: 'Host notice', exact: true }).click();
      await page.getByRole('button', { name: 'error', exact: true }).click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(output, `${theme}-${width}-${scale}.png`) });
      assert.deepEqual(errors, []);
      results.push({
        theme,
        width,
        height,
        scale,
        paint,
        checks: [
          'neutral borders',
          'wrapping',
          'keyboard close tooltip',
          'queue success/error/warning/info',
          'undo',
          'auto-dismiss',
          'popover focus return',
        ],
      });
      await context.close();
    }
  await fs.writeFile(path.join(output, 'checks.json'), JSON.stringify({ results }, null, 2));
  console.log(`PASS ${results.length} notification surfaces, shared queue/actions and popover focus`);
} finally {
  await browser?.close();
  await new Promise((r) => server.close(r));
  await fs.rm(temp, { recursive: true, force: true });
}
