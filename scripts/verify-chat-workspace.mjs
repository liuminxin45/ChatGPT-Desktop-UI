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
const server = http.createServer(async (request, response) => {
  const file = path.basename(new URL(request.url, 'http://localhost').pathname) || 'index.html';
  try {
    const body = await fs.readFile(path.join(out, file));
    response.writeHead(200, {
      'Content-Type': file.endsWith('.css')
        ? 'text/css'
        : file.endsWith('.js')
          ? 'text/javascript'
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
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const errors = [],
  checks = [];
try {
  for (const [width, height, scale] of [
    [1920, 1080, 1],
    [1280, 800, 1.25],
    [390, 844, 1],
    [320, 740, 1],
  ]) {
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: scale });
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
        assert.equal(await side.evaluate((e) => getComputedStyle(e).outlineStyle), 'none');
        await page.keyboard.press('Shift+Tab');
        assert.ok(await side.evaluate((e) => e.contains(document.activeElement)));
        const bounds = await side.boundingBox();
        await side.dispatchEvent('pointerdown', { clientX: bounds.x + bounds.width - 10, clientY: 150 });
        await side.dispatchEvent('pointerup', { clientX: bounds.x + bounds.width - 100, clientY: 154 });
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
      await page.getByRole('combobox', { name: 'Reasoning', exact: true }).click();
      await page.keyboard.press('Escape');
      assert.ok(await page.getByRole('dialog', { name: 'Conversation options', exact: true }).isVisible());
      await page.keyboard.press('Escape');
      assert.equal(await page.getByRole('dialog').count(), 0);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      assert.deepEqual(await page.evaluate(() => window.__violations), []);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      assert.ok(parseFloat(await side.evaluate((e) => getComputedStyle(e).transitionDuration)) <= 0.00001);
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.getByRole('textbox', { name: 'Message', exact: true }).fill('');
      checks.push(
        `${width}px ${theme}: retained draft DOM, no hover geometry shift, drawer, long input, nested Escape, CSP`,
      );
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
