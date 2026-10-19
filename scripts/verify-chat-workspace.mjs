import { browserOptions } from './browser-options.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
assert.equal(process.version, 'v24.19.0');
const out = path.join(root, 'evidence/chat-workspace');
await fs.mkdir(out, { recursive: true });
await build({
  absWorkingDir: root,
  entryPoints: ['examples/chat-workspace.tsx'],
  bundle: true,
  outfile: path.join(out, 'app.js'),
  format: 'iife',
  jsx: 'automatic',
  logOverride: { 'ignored-bare-import': 'silent' },
  define: { 'process.env.NODE_ENV': '"production"' },
});
await fs.writeFile(
  path.join(out, 'index.html'),
  '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="app.css"><link rel="stylesheet" href="fixture.css"><div id="root"></div><script src="app.js" defer></script>',
);
await fs.writeFile(
  path.join(out, 'fixture.css'),
  'html,body,#root,.fixture-root{height:100%;margin:0;overflow:hidden}.fixture-column{width:calc(100% - 40px);max-width:800px;margin-inline:auto}.fixture-search{padding:8px 16px}.fixture-search>input{width:100%}',
);
await fs.writeFile(
  path.join(out, 'fixture-image.svg'),
  '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800"><rect width="800" height="800" fill="#8ab7bd"/><path d="M0 600L800 200V800H0Z" fill="#deceb3"/><circle cx="600" cy="150" r="60" fill="#f4eddb"/></svg>',
);
const server = http.createServer(async (request, response) => {
  const file = path.basename(new URL(request.url, 'http://localhost').pathname) || 'index.html';
  try {
    const body = await fs.readFile(path.join(out, file));
    response.writeHead(200, {
      'Content-Type': file.endsWith('.css')
        ? 'text/css'
        : file.endsWith('.js')
          ? 'text/javascript'
          : file.endsWith('.svg')
            ? 'image/svg+xml'
            : 'text/html',
      'Content-Security-Policy':
        "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'",
    });
    response.end(body);
  } catch {
    response.writeHead(404);
    response.end();
  }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch(browserOptions());
const errors = [],
  checks = [];
try {
  for (const [width, height, scale] of [
    [1920, 1080, 1],
    [1280, 800, 1.25],
    [390, 844, 1],
    [320, 740, 1],
  ]) {
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: scale,
      hasTouch: width < 768,
    });
    const page = await context.newPage();
    page.on('pageerror', (error) => errors.push(error.message));
    await page.addInitScript(() => {
      window.__violations = [];
      addEventListener('securitypolicyviolation', (event) =>
        window.__violations.push(event.violatedDirective),
      );
    });
    await page.goto(origin);
    await page.getByRole('textbox', { name: 'Message', exact: true }).waitFor();
    await page.evaluate(() => {
      window.__draftNode = document.querySelector('textarea');
    });
    for (const theme of ['light', 'dark']) {
      if (theme === 'dark') {
        await page.getByRole('button', { name: 'More', exact: true }).click();
        await page.getByRole('menuitem', { name: 'Change theme', exact: true }).click();
      }
      await page.waitForFunction(
        (value) =>
          getComputedStyle(document.querySelector('.desktop-chat-app')).backgroundColor ===
          (value === 'dark' ? 'rgb(24, 24, 24)' : 'rgb(255, 255, 255)'),
        theme,
      );
      const dock = await page.locator('.desktop-composer-surface').boundingBox();
      assert.ok(dock.y > 0 && dock.y + dock.height <= height, JSON.stringify({ width, theme, dock }));
      assert.ok(
        (await page.locator('textarea').boundingBox()).height <= 40,
        'An empty chat draft must remain a single compact line',
      );
      assert.match(
        await page.locator('.desktop-chat-app').evaluate((e) => getComputedStyle(e).fontFamily),
        /system-ui/,
      );
      for (const target of [
        page.getByRole('button', { name: 'New conversation', exact: true }),
        page.locator('textarea'),
      ]) {
        assert.match(await target.evaluate((e) => getComputedStyle(e).fontFamily), /system-ui/);
      }
      await page.screenshot({ path: path.join(out, `${width}-${theme}-conversation.png`) });
      const trigger = page.getByRole('button', { name: 'Toggle conversations', exact: true });
      if ((await page.locator('.desktop-chat-workspace').getAttribute('data-sidebar-open')) === 'true')
        await trigger.click();
      await page
        .locator('.desktop-chat-workspace__sidebar')
        .evaluate((e) => Promise.all(e.getAnimations().map((a) => a.finished.catch(() => {}))));
      const before = await trigger.boundingBox();
      await trigger.hover();
      assert.deepEqual(await trigger.boundingBox(), before);
      await page.mouse.down();
      assert.deepEqual(await trigger.boundingBox(), before);
      await page.mouse.up();
      // The press toggled the drawer; return to its initial state.
      if (width < 768)
        await page.getByRole('button', { name: 'Close conversations', exact: true }).last().click();
      else await trigger.click();
      await trigger.click();
      const side = page.locator('.desktop-chat-workspace__sidebar');
      await side.evaluate((element) =>
        Promise.all(element.getAnimations().map((animation) => animation.finished.catch(() => {}))),
      );
      await page.screenshot({ path: path.join(out, `${width}-${theme}-sidebar.png`) });
      if (width < 768) {
        assert.equal(await side.getAttribute('aria-modal'), 'true');
        await page.getByRole('textbox', { name: 'Search conversations', exact: true }).evaluate((element) => {
          element.dispatchEvent(
            new KeyboardEvent('keydown', { key: 'Escape', keyCode: 229, bubbles: true, cancelable: true }),
          );
          element.dispatchEvent(
            new KeyboardEvent('keydown', {
              key: 'Escape',
              isComposing: true,
              bubbles: true,
              cancelable: true,
            }),
          );
        });
        assert.equal(
          await page.locator('.desktop-chat-workspace').getAttribute('data-sidebar-open'),
          'true',
          'IME Escape keeps the drawer open',
        );
        assert.equal(await side.evaluate((e) => getComputedStyle(e).outlineStyle), 'none');
        await page.keyboard.press('Shift+Tab');
        assert.ok(await side.evaluate((e) => e.contains(document.activeElement)));
        const bounds = await side.boundingBox(),
          x = bounds.x + bounds.width - 6;
        const touch = await context.newCDPSession(page);
        const point = (left, top = 150) => [{ x: left, y: top, id: 1 }];
        await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: point(x) });
        await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: point(x - 48) });
        await page.waitForFunction(
          () =>
            new DOMMatrixReadOnly(
              getComputedStyle(document.querySelector('.desktop-chat-workspace__sidebar')).transform,
            ).m41 < -30,
        );
        assert.equal(
          await page.locator('.desktop-chat-workspace').getAttribute('data-sidebar-open'),
          'true',
          'Dragging alone cannot commit dismissal',
        );
        await page.screenshot({ path: path.join(out, `${width}-${theme}-dragging.png`) });
        await touch.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
        await side.evaluate((e) => Promise.all(e.getAnimations().map((a) => a.finished.catch(() => {}))));
        assert.equal(
          await page.locator('.desktop-chat-workspace').getAttribute('data-sidebar-open'),
          'true',
          'Cancelled touch must retain the drawer',
        );
        assert.ok(
          Math.abs(await side.evaluate((e) => new DOMMatrixReadOnly(getComputedStyle(e).transform).m41)) < 1,
        );
        await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: point(x) });
        await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: point(x - 2, 220) });
        await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        assert.equal(
          await page.locator('.desktop-chat-workspace').getAttribute('data-sidebar-open'),
          'true',
          'Vertical reading cannot dismiss',
        );
        await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: point(x) });
        await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: point(x - 130, 154) });
        await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await touch.detach();
        await page.waitForFunction(
          () => document.querySelector('.desktop-chat-workspace').dataset.sidebarOpen === 'false',
        );
      } else await trigger.click();
      assert.ok(await page.evaluate(() => window.__draftNode === document.querySelector('textarea')));
      await page
        .getByRole('textbox', { name: 'Message', exact: true })
        .fill('A long editable draft.\n'.repeat(40));
      const draftGeometry = await page.locator('textarea').evaluate((e) => ({
        scroll: e.scrollHeight,
        client: e.clientHeight,
        max: getComputedStyle(e).maxHeight,
        box: getComputedStyle(e).boxSizing,
        overflow: getComputedStyle(e).overflowY,
      }));
      assert.ok(
        draftGeometry.scroll > draftGeometry.client && draftGeometry.client <= 200,
        JSON.stringify(draftGeometry),
      );
      await page.screenshot({ path: path.join(out, `${width}-${theme}-long-draft.png`) });
      await page.getByRole('button', { name: 'New conversation', exact: true }).click();
      const panel = page.getByRole('dialog', { name: 'Conversation options', exact: true });
      await page.screenshot({ path: path.join(out, `${width}-${theme}-sheet.png`) });
      if (width < 768) {
        const box = await panel.boundingBox();
        assert.ok(
          Math.abs(box.y + box.height - height) < 2,
          'The mobile sheet docks above the viewport edge',
        );
        const grip = await panel.locator('[data-desktop-sheet-handle]').boundingBox();
        const touch = await context.newCDPSession(page);
        const point = (y) => [{ x: grip.x + grip.width / 2, y, id: 4 }];
        const y = grip.y + grip.height / 2;
        await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: point(y) });
        await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: point(y + 48) });
        await page.waitForFunction(
          () => document.querySelector('[data-presentation=sheet]').dataset.dragging === 'true',
        );
        assert.ok(await panel.isVisible());
        await page.screenshot({ path: path.join(out, `${width}-${theme}-sheet-drag.png`) });
        await touch.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
        assert.ok(await panel.isVisible(), 'Cancelling a sheet drag retains the parent and its draft');
        await panel.evaluate((e) => Promise.all(e.getAnimations().map((a) => a.finished.catch(() => {}))));
        const after = await panel.boundingBox();
        assert.ok(Math.abs(after.y + after.height - height) < 2);
        await page.evaluate(() => {
          Object.defineProperty(window.visualViewport, 'height', {
            configurable: true,
            value: innerHeight - 280,
          });
          window.visualViewport.dispatchEvent(new Event('resize'));
        });
        await panel.evaluate((e) => Promise.all(e.getAnimations().map((a) => a.finished.catch(() => {}))));
        const keyboardBox = await panel.boundingBox();
        assert.ok(
          Math.abs(keyboardBox.y + keyboardBox.height - (height - 280)) < 2,
          'Sheet follows a synthetic visual viewport resize',
        );
        await page.evaluate(() => {
          delete window.visualViewport.height;
          window.visualViewport.dispatchEvent(new Event('resize'));
        });
        await touch.detach();
      }
      await page.getByRole('combobox', { name: 'Reasoning', exact: true }).click();
      await page.waitForFunction(() => window.__dismissals.length === 2);
      await page.evaluate(() => window.__dismissals.at(-1)());
      await page.getByRole('listbox').waitFor({ state: 'hidden' });
      assert.ok(await page.getByRole('dialog', { name: 'Conversation options', exact: true }).isVisible());
      await page.getByRole('combobox', { name: 'Reasoning', exact: true }).click();
      const shellConsumed = await page.evaluate(
        () =>
          !document.dispatchEvent(
            new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true, cancelable: true }),
          ),
      );
      assert.ok(shellConsumed, 'A shell Escape probe must be consumed by the top selector');
      assert.ok(await page.getByRole('dialog', { name: 'Conversation options', exact: true }).isVisible());
      await page.getByRole('button', { name: 'Inspect image', exact: true }).click();
      const image = page.getByRole('dialog', { name: 'Image preview', exact: true });
      await image.locator('img').evaluate((e) => e.decode());
      const canvas = image.locator('.desktop-image-viewer__canvas');
      await page.screenshot({ path: path.join(out, `${width}-${theme}-image.png`) });
      await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
      assert.equal(await canvas.getAttribute('data-scale'), '1.5');
      await page.getByRole('button', { name: 'Reset zoom', exact: true }).click();
      if (width < 768) {
        const area = await canvas.boundingBox(),
          cx = area.x + area.width / 2,
          cy = area.y + area.height / 2;
        const touch = await context.newCDPSession(page);
        const points = (distance) => [
          { x: cx - distance / 2, y: cy, id: 5 },
          { x: cx + distance / 2, y: cy, id: 6 },
        ];
        await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: points(80) });
        await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: points(160) });
        await page.waitForFunction(
          () => Number(document.querySelector('.desktop-image-viewer__canvas').dataset.scale) > 1.8,
        );
        await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await touch.send('Input.dispatchTouchEvent', {
          type: 'touchStart',
          touchPoints: [{ x: cx, y: cy, id: 7 }],
        });
        await touch.send('Input.dispatchTouchEvent', {
          type: 'touchMove',
          touchPoints: [{ x: cx, y: cy + 120, id: 7 }],
        });
        await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        assert.ok(await image.isVisible(), 'Panning a zoomed image cannot close it');
        await page.screenshot({ path: path.join(out, `${width}-${theme}-image-zoom.png`) });
        await page.getByRole('button', { name: 'Reset zoom', exact: true }).click();
        await touch.send('Input.dispatchTouchEvent', {
          type: 'touchStart',
          touchPoints: [{ x: cx, y: cy, id: 8 }],
        });
        await touch.send('Input.dispatchTouchEvent', {
          type: 'touchMove',
          touchPoints: [{ x: cx, y: cy + 50, id: 8 }],
        });
        await touch.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
        assert.ok(await image.isVisible(), 'Cancelled image dismissal retains the preview');
        await touch.send('Input.dispatchTouchEvent', {
          type: 'touchStart',
          touchPoints: [{ x: cx, y: cy, id: 9 }],
        });
        await touch.send('Input.dispatchTouchEvent', {
          type: 'touchMove',
          touchPoints: [{ x: cx, y: cy + 150, id: 9 }],
        });
        await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await image.waitFor({ state: 'hidden' });
        await touch.detach();
      } else await image.getByRole('button', { name: 'Close', exact: true }).click();
      assert.ok(await panel.isVisible(), 'Image dismissal retains the owning editor');
      assert.ok(await page.evaluate(() => window.__draftNode === document.querySelector('textarea')));
      await page.route('**/fixture-image.svg', (route) => route.fulfill({ status: 404, body: '' }));
      await page.getByRole('button', { name: 'Inspect image', exact: true }).click();
      await image.getByRole('status').waitFor();
      assert.ok(await image.getByRole('button', { name: 'Zoom in', exact: true }).isDisabled());
      await image.getByRole('button', { name: 'Close', exact: true }).click();
      await page.unroute('**/fixture-image.svg');
      if (width < 768) {
        const grip = await panel.locator('[data-desktop-sheet-handle]').boundingBox();
        const touch = await context.newCDPSession(page),
          x = grip.x + grip.width / 2,
          y = grip.y + grip.height / 2;
        await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 10 }] });
        await touch.send('Input.dispatchTouchEvent', {
          type: 'touchMove',
          touchPoints: [{ x, y: y + 125, id: 10 }],
        });
        await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await panel.waitFor({ state: 'hidden' });
        await touch.detach();
      } else await page.keyboard.press('Escape');
      assert.equal(await page.getByRole('dialog').count(), 0);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      assert.deepEqual(await page.evaluate(() => window.__violations), []);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      assert.ok(parseFloat(await side.evaluate((e) => getComputedStyle(e).transitionDuration)) <= 0.00001);
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.getByRole('textbox', { name: 'Message', exact: true }).fill('');
      checks.push(
        `${width}px ${theme}: retained draft DOM, stable controls, drawer cancellation, sheet, image zoom/pan/failure, shell Escape, CSP`,
      );
    }
    if (width < 768) {
      await page.goto(`${origin}/?catalog=1`);
      const catalog = page.locator('.desktop-chat-workspace__sidebar');
      await catalog.waitFor();
      assert.equal(await catalog.getAttribute('aria-modal'), null);
      assert.equal(Math.round((await catalog.boundingBox()).width), width);
      await page.waitForFunction(
        () => Array.isArray(window.__dismissals) && window.__dismissals.length === 0,
      );
      await page.screenshot({ path: path.join(out, `${width}-root-catalog.png`) });
      checks.push(`${width}px: full-width root catalog, no modal/history layer`);
    }
    await context.close();
  }
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
await fs.writeFile(
  path.join(out, 'acceptance.json'),
  JSON.stringify({ checks, errors, synthetic: true, systemScalingChanged: false }, null, 2),
);
console.log(JSON.stringify({ checks: checks.length, errors, output: out }));
