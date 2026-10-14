import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { PNG } from 'pngjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'desktop-window-shell-'));
const output = path.join(root, 'tests/output/window-shell');
await fs.mkdir(output, { recursive: true });
await build({
  absWorkingDir: root,
  entryPoints: ['examples/window-shell.tsx'],
  bundle: true,
  jsx: 'automatic',
  outfile: path.join(temp, 'app.js'),
  platform: 'browser',
  logOverride: { 'ignored-bare-import': 'silent' },
  define: { 'process.env.NODE_ENV': '"production"' },
});
await fs.copyFile(path.join(root, 'dist/desktop.css'), path.join(temp, 'style.css'));
await fs.writeFile(
  path.join(temp, 'index.html'),
  '<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="style.css"></head><body><div id="root"></div><script src="app.js"></script></body></html>',
);
const server = http.createServer(async (req, res) => {
  const name = path.basename(new URL(req.url, 'http://localhost').pathname) || 'index.html';
  if (!['index.html', 'app.js', 'style.css'].includes(name)) {
    res.writeHead(404);
    return res.end();
  }
  res.setHeader(
    'Content-Type',
    name.endsWith('.js') ? 'text/javascript' : name.endsWith('.css') ? 'text/css' : 'text/html',
  );
  res.end(await fs.readFile(path.join(temp, name)));
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const results = [],
  errors = [];
let browser;
const near = (actual, expected, label) =>
  assert.ok(Math.abs(actual - expected) <= 1, `${label}: ${actual} != ${expected}`);
try {
  browser = await chromium.launch({ channel: 'msedge', headless: true });
  for (const theme of ['light', 'dark'])
    for (const [width, height, zoom] of [
      [1920, 1080, 1],
      [1280, 800, 1],
      [800, 800, 1],
      [1280, 800, 1.25],
    ]) {
      const page = await browser.newPage({ viewport: { width, height } });
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(`http://127.0.0.1:${server.address().port}/index.html?theme=${theme}`);
      await page.getByRole('textbox', { name: 'Editor draft' }).waitFor();
      await page.waitForFunction(
        (dark) => document.documentElement.classList.contains('dark') === dark,
        theme === 'dark',
      );
      await page.evaluate((z) => (document.documentElement.style.zoom = String(z)), zoom);
      await page.getByRole('textbox', { name: 'Editor draft' }).fill('Unsaved draft');
      await page.evaluate(() => {
        window.editorBefore = document.querySelector('[aria-label="Editor draft"]');
        window.sidebarBefore = document.querySelector('[aria-label="Sidebar draft"]');
      });
      for (const nested of [false, true]) {
        await page.evaluate((value) => window.shellFixture.setNested(value), nested);
        await page.waitForTimeout(100);
        await page.getByRole('textbox', { name: 'Editor draft' }).fill('Unsaved draft');
        await page.evaluate(() => {
          window.editorBefore = document.querySelector('[aria-label="Editor draft"]');
        });
        for (const visible of [true, false, true]) {
          await page.evaluate((value) => window.shellFixture.setSidebar(value), visible);
          await page.waitForTimeout(220);
          const metrics = await page.evaluate(() => {
            const bounds = (selector) => {
              const r = document.querySelector(selector).getBoundingClientRect();
              return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom };
            };
            const style = (selector) => getComputedStyle(document.querySelector(selector));
            return {
              frame: bounds('.kit-shell__workspace'),
              titlebar: bounds('.kit-titlebar'),
              rail: bounds('.kit-rail'),
              first: bounds('.kit-rail__item'),
              titleActions: bounds('.kit-titlebar__actions'),
              radius: style('.kit-shell__workspace').borderRadius,
              railFill: style('.kit-rail').backgroundColor,
              titleFill: style('.kit-titlebar').backgroundColor,
              canvas: style('.kit-shell__main').backgroundColor,
              font: style('[aria-label="Editor draft"]').fontSize,
              weight: style('[aria-label="Editor draft"]').fontWeight,
              overflow: document.documentElement.scrollWidth > innerWidth,
            };
          });
          near(metrics.titlebar.height, 44 * zoom, 'title bar');
          near(metrics.rail.width, 52 * zoom, 'rail');
          near(metrics.first.y, 52 * zoom, 'first navigation target');
          near(metrics.first.height, 36 * zoom, 'navigation target height');
          near(metrics.titleActions.height, 36 * zoom, 'title actions');
          near(metrics.frame.x, 52 * zoom, 'frame left');
          near(metrics.frame.right, width - 4 * zoom, 'frame right');
          near(metrics.frame.bottom, height - 4 * zoom, 'frame bottom');
          assert.equal(metrics.radius, '14px');
          assert.equal(metrics.railFill, 'rgba(0, 0, 0, 0)');
          assert.equal(metrics.titleFill, 'rgba(0, 0, 0, 0)');
          assert.equal(metrics.canvas, theme === 'dark' ? 'rgb(24, 24, 24)' : 'rgb(255, 255, 255)');
          assert.equal(metrics.font, '14px');
          assert.equal(metrics.weight, '400');
          assert.equal(metrics.overflow, false);
          assert.equal(
            await page.evaluate(
              () => window.editorBefore === document.querySelector('[aria-label="Editor draft"]'),
            ),
            true,
          );
          assert.equal(
            await page.getByRole('textbox', { name: 'Editor draft' }).inputValue(),
            'Unsaved draft',
          );
          results.push({ theme, width, height, zoom, nested, sidebar: visible, metrics });
        }
      }
      await page.evaluate(() => window.shellFixture.setNavigation(false));
      await page.waitForTimeout(220);
      const hiddenX = await page
        .locator('.kit-shell__workspace')
        .evaluate((el) => el.getBoundingClientRect().x);
      near(hiddenX, 0, 'hidden navigation frame');
      await page.evaluate(() => window.shellFixture.setNavigation(true));
      await page.waitForTimeout(220);
      const list = page.getByRole('list', { name: 'Long records' });
      await list.evaluate((el) => (el.scrollTop = el.scrollHeight));
      await page.getByRole('button', { name: 'Record 100', exact: true }).waitFor();
      await page.getByRole('button', { name: 'Open dialog', exact: true }).click();
      await page.getByRole('dialog').waitFor();
      await page.keyboard.press('Escape');
      await page.getByRole('dialog').waitFor({ state: 'hidden' });
      assert.equal(await page.getByRole('textbox', { name: 'Editor draft' }).inputValue(), 'Unsaved draft');
      await page.evaluate(() => {
        window.editorBefore = document.querySelector('[aria-label="Editor draft"]');
      });
      await page.getByRole('textbox', { name: 'Editor draft' }).fill('Final retained draft');
      await page.evaluate(() => window.shellFixture.setSidebar(false));
      await page.waitForTimeout(220);
      assert.equal(
        await page.evaluate(
          () => window.editorBefore === document.querySelector('[aria-label="Editor draft"]'),
        ),
        true,
      );
      const screenshot = await page.screenshot({
        path: path.join(output, `${theme}-${width}-zoom${zoom}.png`),
        animations: 'disabled',
      });
      const png = PNG.sync.read(screenshot);
      const pixel = (x, y) =>
        Array.from(
          png.data.subarray(
            (Math.floor(y) * png.width + Math.floor(x)) * 4,
            (Math.floor(y) * png.width + Math.floor(x)) * 4 + 3,
          ),
        );
      const shell = pixel(25 * zoom, 500 * zoom);
      const expected = theme === 'dark' ? [26, 32, 51] : [240, 243, 249];
      if (height === 1080 && zoom === 1)
        expected.forEach((v, index) =>
          assert.ok(Math.abs(shell[index] - v) <= 2, `shell pixel ${shell} vs ${expected}`),
        );
      if (theme === 'dark' && height === 1080 && zoom === 1)
        for (const [x, y, rgb] of [
          [40, 18, [27, 32, 45]],
          [489, 18, [30, 32, 37]],
          [800, 18, [30, 32, 35]],
          [25, 850, [28, 31, 48]],
        ]) {
          const sample = pixel(x, y);
          rgb.forEach((value, channel) =>
            assert.ok(
              Math.abs(sample[channel] - value) <= 2,
              `material sample ${x},${y}: ${sample} vs ${rgb}`,
            ),
          );
        }
      results.push({ theme, width, zoom, shellPixel: shell });
      await page.close();
    }
  assert.deepEqual(errors, []);
  await fs.writeFile(
    path.join(output, 'report.json'),
    JSON.stringify({ status: 'passed', renderer: 'Windows Edge; CSS zoom', results }, null, 2),
  );
  console.log(JSON.stringify({ status: 'passed', cases: results.length, output }));
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
  const absolute = path.resolve(temp);
  if (
    path.dirname(absolute) !== path.resolve(os.tmpdir()) ||
    !path.basename(absolute).startsWith('desktop-window-shell-')
  )
    throw new Error('Invalid fixture cleanup path');
  await fs.rm(absolute, { recursive: true, force: true });
}
