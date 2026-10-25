import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
assert.equal(process.version, 'v24.19.0');
const out = path.join(root, 'evidence/app-surface');
await fs.mkdir(out, { recursive: true });
await build({
  absWorkingDir: root,
  entryPoints: ['examples/app-surface.tsx'],
  bundle: true,
  outfile: path.join(out, 'app.js'),
  format: 'iife',
  jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"production"' },
  plugins: [
    {
      name: 'prepared-library',
      setup(builder) {
        builder.onResolve({ filter: /^\.\.\/src$/ }, () => ({ path: path.join(root, 'dist/index.js') }));
        builder.onResolve({ filter: /^\.\.\/src\/desktop\.css$/ }, () => ({
          path: path.join(root, 'dist/desktop.css'),
        }));
      },
    },
  ],
});
await fs.writeFile(
  path.join(out, 'index.html'),
  '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="app.css"><link rel="stylesheet" href="fixture.css"><div id="root"></div><script src="app.js" defer></script>',
);
await fs.writeFile(
  path.join(out, 'fixture.css'),
  'html,body,#root{margin:0;min-height:100%;height:100%}.example-outside{padding:8px}.example-app{max-width:900px;margin:auto;display:grid;gap:20px;padding:24px}.example-tiles{display:grid;grid-template-columns:1fr 1fr;gap:16px}',
);
await fs.copyFile(path.join(root, 'dist/controls.css'), path.join(out, 'late-controls.css'));
const server = http.createServer(async (req, res) => {
  const file = path.basename(new URL(req.url, 'http://localhost').pathname) || 'index.html';
  try {
    const body = await fs.readFile(path.join(out, file));
    res.writeHead(200, {
      'Content-Type': file.endsWith('.css')
        ? 'text/css'
        : file.endsWith('.js')
          ? 'text/javascript'
          : 'text/html',
      'Content-Security-Policy':
        "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'",
    });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ channel: 'msedge', headless: true }),
  errors = [],
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
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(origin);
    await page.getByRole('textbox', { name: 'App draft', exact: true }).fill('Retain this app input');
    for (const theme of ['light', 'dark']) {
      if (theme === 'dark') await page.getByRole('button', { name: 'Change theme', exact: true }).click();
      await page.waitForFunction(
        (value) => document.querySelector('.desktop-app').dataset.theme === value,
        theme,
      );
      await assert.equal(
        await page.getByRole('textbox', { name: 'App draft', exact: true }).inputValue(),
        'Retain this app input',
      );
      const outside = page.getByRole('button', { name: 'Portable button', exact: true }),
        inside = page.getByRole('button', { name: 'Open sheet', exact: true });
      assert.equal((await outside.boundingBox()).height, 36);
      const targets = [];
      for (const name of [
        'App icon',
        'App small icon',
        'App menu',
        'App row',
        'App small row',
        'App disclosure',
      ]) {
        const bounds = await page.getByRole('button', { name, exact: true }).boundingBox();
        targets.push({ name, ...bounds });
      }
      await fs.writeFile(path.join(out, `targets-${width}-${theme}.json`), JSON.stringify(targets, null, 2));
      for (const target of targets) {
        assert.ok(
          target.width >= 44 && target.height >= 44,
          `${target.name}: ${target.width} x ${target.height}`,
        );
      }
      await page.addStyleTag({ url: origin + '/late-controls.css' });
      for (const name of [
        'App icon',
        'App small icon',
        'App menu',
        'App row',
        'App small row',
        'App disclosure',
      ]) {
        const bounds = await page.getByRole('button', { name, exact: true }).boundingBox();
        assert.ok(
          bounds.width >= 44 && bounds.height >= 44,
          `late portable styles ${name}: ${bounds.width} x ${bounds.height}`,
        );
      }
      for (const target of [
        page.getByRole('textbox', { name: 'App title', exact: true }),
        page.getByRole('combobox', { name: 'App setting choice', exact: true }),
        page.getByRole('tab', { name: 'Draft', exact: true }),
      ]) {
        const bounds = await target.boundingBox();
        assert.ok(
          bounds.width >= 44 && bounds.height >= 44,
          `app field/tab: ${bounds.width} x ${bounds.height}`,
        );
      }
      assert.equal(
        (await page.getByRole('button', { name: 'Portable small icon', exact: true }).boundingBox()).width,
        30,
      );
      assert.ok(
        (await page.getByRole('button', { name: 'Portable disclosure', exact: true }).boundingBox()).height <
          44,
      );
      if (width < 768) {
        await page.getByRole('button', { name: 'Open app drawer', exact: true }).click();
        for (const name of ['Drawer destination', 'Drawer icon', 'Drawer disclosure']) {
          const target = page.getByRole('button', { name, exact: true });
          await target.waitFor({ state: 'visible' });
          const bounds = await target.boundingBox();
          assert.ok(
            bounds.width >= 44 && bounds.height >= 44,
            `portalled ${name}: ${bounds.width} x ${bounds.height}`,
          );
          assert.equal(await target.evaluate((e) => !!e.closest('.desktop-app')), true);
        }
        await page.keyboard.press('Escape');
      }
      assert.ok((await inside.boundingBox()).height >= 44);
      assert.equal(
        await page
          .getByRole('textbox', { name: 'App draft', exact: true })
          .evaluate((e) => getComputedStyle(e).fontSize),
        '16px',
      );
      assert.ok(
        (await page.getByRole('checkbox', { name: 'Keep words', exact: true }).boundingBox()).height >= 44,
      );
      const tile = page.getByRole('button', {
        name: 'Create an image Start with your material',
        exact: true,
      });
      await tile.scrollIntoViewIfNeeded();
      const before = await tile.boundingBox();
      await tile.hover();
      const hover = await tile.boundingBox();
      await page.mouse.down();
      const pressed = await tile.boundingBox();
      await page.mouse.move(0, 0);
      await page.mouse.up();
      for (const key of ['x', 'y', 'width', 'height']) {
        assert.ok(Math.abs(before[key] - hover[key]) < 1);
        assert.ok(Math.abs(before[key] - pressed[key]) < 1);
      }
      await tile.click();
      const dialog = page.getByRole('dialog', { name: 'Adjust the direction', exact: true });
      await dialog.waitFor();
      for (const name of ['Sheet small icon', 'Sheet disclosure']) {
        const bounds = await dialog.getByRole('button', { name, exact: true }).boundingBox();
        assert.ok(
          bounds.width >= 44 && bounds.height >= 44,
          `sheet ${name}: ${bounds.width} x ${bounds.height}`,
        );
      }
      assert.equal(
        await dialog
          .getByRole('textbox', { name: 'Sheet draft', exact: true })
          .evaluate((e) => getComputedStyle(e).fontSize),
        '16px',
      );
      assert.equal(
        await dialog.evaluate((e) => e.closest('.desktop-ui-portal').classList.contains('desktop-app')),
        true,
      );
      assert.ok(
        (await dialog.getByRole('combobox', { name: 'Sheet choice', exact: true }).boundingBox()).height >=
          44,
      );
      assert.equal(await dialog.evaluate((e) => e.closest('.desktop-ui-portal').dataset.theme), theme);
      await dialog.getByRole('combobox', { name: 'Sheet choice', exact: true }).click();
      await page.keyboard.press('Escape');
      assert.equal(await dialog.isVisible(), true);
      if (width < 768) {
        const handle = dialog.locator('[data-desktop-sheet-handle]');
        const bounds = await handle.boundingBox();
        await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
        await page.mouse.down();
        await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2 + 150, { steps: 12 });
        await page.mouse.up();
        await dialog.waitFor({ state: 'hidden' });
      } else {
        await page.keyboard.press('Escape');
        await dialog.waitFor({ state: 'hidden' });
      }
      assert.equal(await tile.evaluate((e) => document.activeElement === e), true);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      await page.screenshot({ path: path.join(out, `${width}-${theme}.png`), fullPage: true });
      checks.push(
        `${width} ${theme}: profile isolation, 44px targets, 16px input, stable hover/press, portal sheet and nested Escape/focus`,
      );
    }
    await context.close();
  }
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  await page.goto(origin);
  assert.ok(
    parseFloat(
      await page
        .locator('.desktop-app-tile')
        .first()
        .evaluate((e) => getComputedStyle(e).transitionDuration),
    ) <= 0.001,
  );
  await context.close();
  checks.push('reduced motion retains static focus/selection without transitions');
  assert.deepEqual(errors, []);
  await fs.writeFile(
    path.join(out, 'result.json'),
    JSON.stringify(
      { status: 'passed', checks, pageErrors: errors, preparedPackage: true, realDevice: false },
      null,
      2,
    ),
  );
  console.log(JSON.stringify({ status: 'passed', checks, screenshots: 8 }));
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
