import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'desktop-kit-package-contract-'));
const evidence = path.join(root, 'tests/output/package-contract');
await fs.mkdir(evidence, { recursive: true });
const bundle = await build({
  absWorkingDir: root,
  entryPoints: ['examples/package-contract.tsx'],
  outfile: path.join(temp, 'app.js'),
  bundle: true,
  format: 'esm',
  platform: 'browser',
  jsx: 'automatic',
  metafile: true,
  logLevel: 'error',
  define: { 'process.env.NODE_ENV': '"production"' },
});
assert.ok(
  Object.keys(bundle.metafile.inputs).some((file) => file.startsWith('dist/')),
  'Consume the prepared distribution',
);
const css = await fs.readFile(path.join(root, 'dist/components.css'));
const hostCss =
  'body{margin:8px;background:rgb(240,240,240)}#host-link{cursor:pointer}#host-animation{transition:opacity 2s}#host-content{height:1800px}.desktop-ui-root{margin:8px;padding:12px}.desktop-ui-root>div{display:flex;flex-wrap:wrap;gap:8px}';
const server = http.createServer(async (request, response) => {
  response.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'",
  );
  if (request.url === '/app.js') {
    response.setHeader('Content-Type', 'text/javascript');
    response.end(await fs.readFile(path.join(temp, 'app.js')));
  } else if (request.url === '/components.css') {
    response.setHeader('Content-Type', 'text/css');
    response.end(css);
  } else if (request.url === '/host.css') {
    response.setHeader('Content-Type', 'text/css');
    response.end(hostCss);
  } else {
    response.setHeader('Content-Type', 'text/html');
    response.end(
      '<!doctype html><html lang="en"><head><title>Independent consumer</title><link rel="stylesheet" href="/host.css"><link rel="stylesheet" href="/components.css"></head><body><a id="host-link" href="#host-content">Host link</a><div id="host-animation">Host animation</div><div id="root"></div><div id="host-content">Scrollable host</div><script type="module" src="/app.js"></script></body></html>',
    );
  }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const reports = [];
let completed = false;
await fs.writeFile(path.join(evidence, 'report.json'), JSON.stringify({ status: 'running' }));
let browser;
try {
  const channel = process.env.UI_BROWSER_CHANNEL || 'msedge';
  browser = await chromium.launch({ headless: true, ...(channel === 'chromium' ? {} : { channel }) });
  for (const [width, height, scale] of [
    [1920, 1080, 1],
    [1280, 800, 1],
    [1024, 640, 1.25],
  ]) {
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: scale,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.setDefaultTimeout(10000);
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    const count = (id) => page.evaluate((id) => window.packageContract[id] ?? 0, id);
    await page.waitForFunction(() => window.packageContract?.['light.refs'] === 1);
    const host = await page.evaluate(() => ({
      htmlOverflow: getComputedStyle(document.documentElement).overflow,
      bodyOverflow: getComputedStyle(document.body).overflow,
      cursor: getComputedStyle(document.querySelector('#host-link')).cursor,
      boxSizing: getComputedStyle(document.querySelector('#host-link')).boxSizing,
      transition: getComputedStyle(document.querySelector('#host-animation')).transitionDuration,
      documentDark: document.documentElement.classList.contains('dark'),
    }));
    assert.deepEqual(host, {
      htmlOverflow: 'visible',
      bodyOverflow: 'visible',
      cursor: 'pointer',
      boxSizing: 'content-box',
      transition: '2s',
      documentDark: false,
    });
    await page.mouse.move(width - 30, height - 60);
    await page.mouse.wheel(0, 500);
    await page.waitForFunction(() => scrollY > 100);
    await page.evaluate(() => scrollTo(0, 0));
    for (const id of ['light', 'dark']) {
      const surface = page.getByTestId(id);
      assert.equal(await surface.getAttribute('data-theme'), id);
      assert.equal(
        await surface.evaluate((el) =>
          getComputedStyle(el).getPropertyValue('--desktop-color-background').trim(),
        ),
        id === 'light' ? '#ffffff' : '#181818',
      );
      const field = page.getByLabel(`${id} combo`);
      await field.focus();
      await field.press('Tab');
      await page.waitForFunction(() => !document.querySelector('[role=listbox]'));
      assert.equal(
        await page.getByTestId(`${id}-after`).evaluate((el) => el === document.activeElement),
        true,
      );
      assert.equal(await count(`${id}.commit`), 1);
      await field.focus();
      await field.press('ArrowDown');
      await field.press('Enter');
      await field.press('Tab');
      assert.equal(await field.inputValue(), 'one');
      assert.equal(await count(`${id}.commit`), 2);
      await field.fill('free text');
      await field.evaluate((el) =>
        el.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, isComposing: true, cancelable: true }),
        ),
      );
      assert.equal(await count(`${id}.commit`), 2);
      await field.press('Escape');
      assert.equal(await field.inputValue(), 'free text');
      await field.press('Tab');
      assert.equal(await count(`${id}.commit`), 3);
      const toggle = page.getByLabel(`${id} switch`);
      assert.equal(await toggle.getAttribute('aria-checked'), 'true');
      await toggle.click();
      assert.equal(await toggle.getAttribute('aria-checked'), 'false');
      assert.equal(await count(`${id}.switch`), 1);
      await page.getByLabel(`${id} select`, { exact: true }).click();
      const list = page.getByRole('listbox');
      await list.waitFor();
      assert.equal(
        await list.evaluate((el) => el.closest('.desktop-ui-portal')?.getAttribute('data-theme')),
        id,
      );
      assert.equal(await list.evaluate((el) => getComputedStyle(el).borderRadius), '19px');
      await page.keyboard.press('Escape');
      await page.waitForFunction(() => !document.querySelector('[role=listbox]'));
      await page.waitForFunction(
        (id) => document.activeElement?.getAttribute('aria-label') === `${id} select`,
        id,
      );
      await page.getByLabel(`${id} select`, { exact: true }).click();
      await page.getByRole('listbox').waitFor();
      await page.waitForFunction(() => document.activeElement?.closest('[role=listbox]'));

      await page.waitForFunction(() => {
        const el = document.querySelector('[role=listbox]');
        if (!el) return false;
        const b = el.getBoundingClientRect();
        return b.top >= 0 && b.left >= 0 && b.bottom <= innerHeight && b.right <= innerWidth;
      });
      await page.mouse.click(1, 1);

      await page.waitForFunction(() => !document.querySelector('[role=listbox]'));
      await page.waitForFunction(
        (id) => document.activeElement?.getAttribute('aria-label') === `${id} select`,
        id,
      );
      await page.waitForFunction(
        (id) => getComputedStyle(document.querySelector(`[aria-label="${id} select"]`)).boxShadow === 'none',
        id,
      );
      assert.equal(
        await page
          .getByLabel(`${id} select`, { exact: true })
          .evaluate((el) => getComputedStyle(el).boxShadow),
        'none',
        'Pointer dismissal preserves focus without a ring',
      );
      await page.getByRole('button', { name: `${id} popover`, exact: true }).click();
      const draft = page.getByLabel(`${id} popup draft`);
      await draft.waitFor();
      await draft.fill('Preserved');
      await page.getByRole('button', { name: `Toggle ${id}`, exact: true }).evaluate((el) => el.click());
      assert.equal(await draft.inputValue(), 'Preserved');
      assert.equal(
        await draft.evaluate((el) => el.closest('.desktop-ui-portal')?.getAttribute('data-theme')),
        id === 'light' ? 'dark' : 'light',
      );
      await page.keyboard.press('Escape');
      await page.getByRole('button', { name: `Toggle ${id}`, exact: true }).click();
      assert.equal(await page.getByLabel(`${id} draft`).inputValue(), 'Retained draft');
      await page.getByRole('button', { name: `Open ${id} dialog`, exact: true }).click();
      await page.getByLabel(`${id} outer draft`).waitFor();
      const outer = page.getByRole('dialog', { name: `${id} outer`, exact: true });
      const bounds = await outer.boundingBox();
      assert.ok(
        bounds &&
          bounds.x >= 0 &&
          bounds.y >= 0 &&
          bounds.x + bounds.width <= width + 1 &&
          bounds.y + bounds.height <= height + 1,
      );
      await page.getByLabel(`${id} outer draft`).evaluate((el) =>
        el.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'Escape',
            bubbles: true,
            isComposing: true,
            cancelable: true,
          }),
        ),
      );
      assert.equal(await count(`${id}.outer.close`), 0, 'IME Escape must retain the editor');
      await page
        .getByRole('button', { name: `${id} compound`, exact: true, includeHidden: true })
        .evaluate((el) => el.click());
      const compound = page.getByRole('dialog', { name: `${id} compound title`, exact: true });
      await compound.waitFor();
      assert.equal(
        await compound.evaluate((el) => {
          const b = el.getBoundingClientRect();
          return el.contains(document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2));
        }),
        true,
        'Mixed API modal is above its parent',
      );
      await page.keyboard.press('Escape');
      await compound.waitFor({ state: 'detached' });
      assert.equal(await count(`${id}.outer.close`), 0, 'Mixed API dismissal retains parent');
      await page.getByRole('button', { name: `Open ${id} nested`, exact: true }).click();
      await page.getByLabel(`${id} inner draft`).waitFor();
      await page.waitForFunction(
        (id) => document.activeElement?.getAttribute('aria-label') === `${id} inner draft`,
        id,
      );
      await page.keyboard.press('Escape');
      await page.getByRole('dialog', { name: `${id} inner`, exact: true }).waitFor({ state: 'detached' });
      assert.equal(
        await count(`${id}.inner.close`),
        1,
        JSON.stringify(await page.evaluate(() => window.packageContract)),
      );
      assert.equal(await count(`${id}.outer.close`), 0);
      await page.waitForFunction(
        (id) => document.activeElement?.getAttribute('data-desktop-action') === `${id}.inner`,
        id,
      );
      assert.equal(
        await page
          .getByRole('button', { name: `Open ${id} nested`, exact: true })
          .evaluate((el) => el === document.activeElement),
        true,
      );
      await page.screenshot({ path: path.join(evidence, `${id}-${width}-${scale}.png`) });
      assert.equal(
        await page.locator('#host-link').evaluate((el) => !!el.closest('[aria-hidden=true]')),
        true,
      );
      const axe = await new AxeBuilder({ page }).include('[role=dialog]').analyze();
      assert.deepEqual(axe.violations, []);
      await page.keyboard.press('Escape');
      await outer.waitFor({ state: 'detached' });
      await page.waitForFunction(
        (id) => document.activeElement?.getAttribute('data-desktop-action') === `${id}.outer`,
        id,
      );
      assert.equal(
        await page
          .getByRole('button', { name: `Open ${id} dialog`, exact: true })
          .evaluate((el) => el === document.activeElement),
        true,
      );
      await page.getByRole('button', { name: `${id} compound`, exact: true }).click();
      await page.getByRole('dialog', { name: `${id} compound title`, exact: true }).waitFor();
      await page.keyboard.press('Escape');
      await page
        .getByRole('dialog', { name: `${id} compound title`, exact: true })
        .waitFor({ state: 'detached' });
      await page.waitForFunction(
        (id) => document.activeElement?.getAttribute('data-desktop-action') === `${id}.compound`,
        id,
      );
    }
    await page.locator('#unmount').click();
    await page.waitForFunction(() => document.querySelectorAll('.desktop-ui-portal').length === 0);
    assert.deepEqual(errors, []);
    reports.push({
      width,
      height,
      scale,
      host,
      scopedPortals: 'passed',
      keyboard: 'passed',
      nestedDialogs: 'passed',
      axe: 'passed',
      strictCsp: 'passed',
    });
    await context.close();
  }
  for (const theme of ['light', 'dark']) {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      deviceScaleFactor: 1.25,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    await page.goto(`http://127.0.0.1:${server.address().port}/?calendar=${theme}`);
    const calendar = page.locator('.desktop-calendar');
    await calendar.waitFor();
    const day = calendar.locator('.desktop-calendar-day').filter({ hasText: /^13$/ });
    await day.click();
    assert.equal(await page.evaluate(() => window.packageContract['calendar.select']), 1);
    assert.equal(await day.evaluate((el) => getComputedStyle(el).height), '32px');
    assert.equal(await day.evaluate((el) => getComputedStyle(el).fontSize), '13px');
    await day.press('ArrowRight');
    await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(() => window.packageContract['calendar.select']), 2);
    const bounds = await calendar.boundingBox();
    assert.ok(bounds.width < 350 && bounds.x >= 0 && bounds.y >= 0);
    const axe = await new AxeBuilder({ page }).include('.desktop-calendar').analyze();
    assert.deepEqual(axe.violations, []);
    await calendar.screenshot({ path: path.join(evidence, `calendar-${theme}.png`) });
    reports.push({ theme, calendar: 'passed', keyboard: 'passed', axe: 'passed' });
    await context.close();
  }
  await fs.writeFile(
    path.join(evidence, 'report.json'),
    JSON.stringify({ status: 'passed', distribution: true, reports }, null, 2),
  );
  completed = true;
  console.log(JSON.stringify({ status: 'passed', cases: reports.length, evidence }));
} finally {
  if (!completed)
    await fs.writeFile(
      path.join(evidence, 'report.json'),
      JSON.stringify({ status: 'failed', reports }, null, 2),
    );
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
  const target = path.resolve(temp);
  if (path.dirname(target) !== path.resolve(os.tmpdir()) || (await fs.lstat(target)).isSymbolicLink())
    throw Error('Unsafe fixture cleanup');
  await fs.rm(target, { recursive: true, force: true });
}
