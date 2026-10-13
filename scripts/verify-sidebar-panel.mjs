import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { build } from 'esbuild';
import { chromium } from 'playwright';

const root = path.resolve(import.meta.dirname, '..');
const temp = await mkdtemp(path.join(tmpdir(), 'desktop-sidebar-panel-'));
const evidence = path.join(root, 'tests/output/sidebar-panel');
let browser, server;
const cases = [];
try {
  await mkdir(evidence, { recursive: true });
  await build({
    entryPoints: [path.join(root, 'examples/sidebar-panel-contract.tsx')],
    outfile: path.join(temp, 'fixture.js'),
    bundle: true,
    platform: 'browser',
    jsx: 'automatic',
    nodePaths: [path.join(root, 'node_modules')],
  });
  await build({
    entryPoints: [path.join(root, 'src/desktop.css')],
    outfile: path.join(temp, 'fixture.css'),
    bundle: true,
  });
  await writeFile(
    path.join(temp, 'index.html'),
    '<html><head><link rel="stylesheet" href="/fixture.css"></head><body><div id="root"></div><script src="/fixture.js"></script></body></html>',
  );
  server = http.createServer(async (req, res) => {
    const name = path.basename(new URL(req.url, 'http://localhost').pathname);
    const file = ['fixture.css', 'fixture.js'].includes(name) ? name : 'index.html';
    res.setHeader(
      'Content-Type',
      file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : 'text/html',
    );
    res.end(await readFile(path.join(temp, file)));
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const channel = process.env.UI_BROWSER_CHANNEL || 'msedge';
  browser = await chromium.launch({ headless: true, ...(channel === 'chromium' ? {} : { channel }) });
  for (const profile of ['portable', 'client']) {
    for (const theme of ['light', 'dark']) {
      for (const [width, height, scale] of [
        [1920, 1080, 1],
        [1280, 800, 1],
        [1536, 864, 1.25],
      ]) {
        const context = await browser.newContext({
          viewport: { width, height },
          deviceScaleFactor: scale,
          colorScheme: theme,
        });
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.goto(`http://127.0.0.1:${server.address().port}/?profile=${profile}&transform=${scale}`);
        const panel = page.locator('#sidebar'),
          handle = panel.locator('[role="separator"]');
        await handle.waitFor();
        await page.evaluate(
          (theme) => document.documentElement.classList.toggle('dark', theme === 'dark'),
          theme,
        );
        const state = () =>
          page.locator('#host-state').evaluate((element) => JSON.parse(element.textContent));
        // Wait for real CSS animations, including transitionend delivery, rather than fixed sleeps.
        const settled = async (expected) => {
          await page.waitForFunction((expected) => {
            const panel = document.getElementById('sidebar');
            return (
              !panel.getAnimations().some((animation) => animation.playState === 'running') &&
              Math.abs(
                panel.getBoundingClientRect().width /
                  Number(new URLSearchParams(location.search).get('transform')) -
                  expected,
              ) < 0.1
            );
          }, expected);
          const metrics = await panel.evaluate((element) => ({
            width: parseFloat(getComputedStyle(element).width),
            opacity: getComputedStyle(element).opacity,
            visibility: getComputedStyle(element).visibility,
            hidden: element.hidden,
            inert: element.inert,
            resizing: element.hasAttribute('data-resizing'),
          }));
          assert.equal(metrics.width, expected);
          assert.equal(metrics.opacity, expected === 0 ? '0' : '1');
          assert.equal(metrics.visibility, expected === 0 ? 'hidden' : 'visible');
          assert.equal(metrics.hidden, expected === 0);
          assert.equal(metrics.inert, expected === 0);
          assert.equal(metrics.resizing, false);
          return metrics;
        };
        await settled(320);
        await page.getByLabel('Draft').fill('Retained edited draft');
        await page.getByLabel('Sidebar scroll').evaluate((element) => {
          element.scrollTop = 65;
          window.originalDraft = document.querySelector('input');
        });
        await handle.press('ArrowRight');
        await settled(330);
        await handle.press('ArrowLeft');
        await settled(320);
        await handle.press('ArrowRight');
        await handle.press('ArrowRight');
        await settled(340);
        await page.getByRole('button', { name: 'Restore default' }).click();
        await settled(320);
        await handle.press('End');
        await settled(460);
        await handle.press('ArrowRight');
        await settled(460);
        await handle.press('Home');
        const folded = await settled(0);
        assert.equal((await state()).width, 240);
        assert.equal(await handle.getAttribute('tabindex'), '-1');
        assert.equal(await page.getByRole('separator', { name: 'Resize sidebar' }).count(), 0);
        await page.getByRole('button', { name: 'Toggle sidebar' }).focus();
        await page.keyboard.press('Tab');
        assert.equal(await panel.evaluate((element) => element.contains(document.activeElement)), false);
        await page.getByRole('button', { name: 'Toggle sidebar' }).click();
        await settled(240);
        await handle.press('ArrowLeft');
        await settled(0);
        await page.getByRole('button', { name: 'Toggle sidebar' }).click();
        await settled(240);
        assert.equal(await page.getByLabel('Draft').inputValue(), 'Retained edited draft');
        assert.equal(
          await page.getByLabel('Draft').evaluate((element) => element === window.originalDraft),
          true,
        );
        assert.equal(await page.getByLabel('Sidebar scroll').evaluate((element) => element.scrollTop), 65);
        assert.equal(await page.evaluate(() => window.sidebarContract.mounts), 1);
        assert.equal(await page.evaluate(() => window.sidebarContract.unmounts), 0);
        for (const [name, expected] of [
          ['Restore narrow', 240],
          ['Restore wide', 460],
          ['Restore default', 320],
        ]) {
          await page.getByRole('button', { name }).click();
          await settled(expected);
          assert.equal((await state()).hidden, false);
          assert.equal(await handle.getAttribute('aria-valuenow'), String(expected));
        }
        await page.getByRole('button', { name: 'Freeze Host' }).click();
        await handle.press('Home');
        await settled(320);
        assert.equal((await state()).hidden, false);
        await page.getByRole('button', { name: 'Freeze Host' }).click();
        const beginDrag = async () => {
          const rect = await handle.boundingBox();
          const point = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
          await page.mouse.move(point.x, point.y);
          await page.mouse.down();
          assert.equal(await panel.getAttribute('data-resizing'), 'true');
          assert.equal(await panel.evaluate((element) => getComputedStyle(element).transitionDuration), '0s');
          return point;
        };
        let point = await beginDrag();
        await page.mouse.move(point.x + 40 * scale, point.y);
        assert.equal(
          await panel.evaluate((element) => element.offsetWidth),
          360,
          'drag updates immediately in CSS pixels',
        );
        await page.mouse.move(point.x + 1000 * scale, point.y);
        assert.equal(await panel.evaluate((element) => element.offsetWidth), 460);
        await page.mouse.up();
        await settled(460);
        await page.getByRole('button', { name: 'Restore default' }).click();
        await settled(320);
        point = await beginDrag();
        await page.mouse.move(point.x + 30 * scale, point.y);
        await page.keyboard.press('Escape');
        await page.mouse.up();
        await settled(320);
        point = await beginDrag();
        await page.mouse.move(point.x + 30 * scale, point.y);
        await handle.evaluate((element) => {
          element.dispatchEvent(new PointerEvent('pointercancel', { pointerId: 1, bubbles: true }));
        });
        await page.mouse.up();
        await settled(320);
        point = await beginDrag();
        await page.mouse.move(point.x - 1000 * scale, point.y);
        await page.mouse.up();
        await settled(0);
        assert.equal((await state()).width, 240);
        await page.getByRole('button', { name: 'Toggle sidebar' }).click();
        await settled(240);
        // Reverse a collapse while it is running; the final state still belongs to the Host.
        await page.evaluate(() => {
          const toggle = [...document.querySelectorAll('button')].find(
            (element) => element.textContent === 'Toggle sidebar',
          );
          toggle.click();
          requestAnimationFrame(() => requestAnimationFrame(() => toggle.click()));
        });
        await settled(240);
        assert.equal((await state()).hidden, false);
        assert.equal(await page.getByLabel('Draft').inputValue(), 'Retained edited draft');
        const transitions = await page.evaluate(() => window.sidebarContract.transitions);
        assert.ok(transitions.includes('width'), 'real width transition must complete');
        assert.ok(transitions.includes('opacity'), 'real opacity transition must complete');
        await page.screenshot({ path: path.join(evidence, `${profile}-${theme}-${width}-${scale}.png`) });
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.getByRole('button', { name: 'Toggle sidebar' }).click();
        await settled(0);
        assert.ok(
          await panel.evaluate((element) =>
            getComputedStyle(element)
              .transitionDuration.split(',')
              .every((value) => parseFloat(value) <= 0.00001),
          ),
        );
        await page.getByRole('button', { name: 'Toggle sidebar' }).click();
        await settled(240);
        assert.deepEqual(errors, []);
        cases.push({ profile, theme, width, height, scale, folded, transitions: [...new Set(transitions)] });
        await context.close();
      }
    }
  }
  await writeFile(path.join(evidence, 'report.json'), JSON.stringify({ status: 'passed', cases }, null, 2));
  console.log(
    JSON.stringify({
      status: 'passed',
      cases: cases.length,
      scope:
        'Controlled sidebar geometry, keyboard, scaled pointer capture/cancellation, folding, retained children, completed/reversed transitions and reduced motion',
    }),
  );
} catch (error) {
  await writeFile(
    path.join(evidence, 'report.json'),
    JSON.stringify({ status: 'failed', cases, error: error.stack }, null, 2),
  );
  throw error;
} finally {
  await browser?.close();
  if (server) await new Promise((resolve) => server.close(resolve));
  await rm(temp, { recursive: true, force: true });
}
