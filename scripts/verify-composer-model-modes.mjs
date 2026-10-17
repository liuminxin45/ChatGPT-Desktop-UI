import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
const root = process.cwd(),
  temp = await fs.mkdtemp(path.join(os.tmpdir(), 'model-modes-')),
  out = path.join(root, 'tests/output/composer-model-modes');
await fs.mkdir(out, { recursive: true });
await build({
  entryPoints: ['examples/composer-model-modes.tsx'],
  outdir: temp,
  bundle: true,
  format: 'esm',
  jsx: 'automatic',
  logOverride: { 'ignored-bare-import': 'silent' },
  define: { 'process.env.NODE_ENV': '"production"' },
  plugins: [
    {
      name: 'prepared-kit',
      setup(b) {
        b.onResolve({ filter: /^\.\.\/src$/ }, () => ({ path: path.join(root, 'dist/index.js') }));
        b.onResolve({ filter: /^\.\.\/src\/desktop\.css$/ }, () => ({
          path: path.join(root, 'dist/desktop.css'),
        }));
      },
    },
  ],
});
const server = http.createServer(async (req, res) => {
  const name = req.url.split('?')[0],
    asset = /\.(js|css)$/.test(name);
  res.setHeader(
    'Content-Type',
    asset ? (name.endsWith('.js') ? 'text/javascript' : 'text/css') : 'text/html',
  );
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; base-uri 'none'",
  );
  res.end(
    asset
      ? await fs.readFile(path.join(temp, name.slice(1)))
      : '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/composer-model-modes.css"></head><body><div id="root"></div><script type="module" src="/composer-model-modes.js"></script></body></html>',
  );
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch({
    headless: true,
    executablePath:
      process.env.UI_BROWSER_EXECUTABLE ||
      (process.platform === 'win32'
        ? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
        : undefined),
  }),
  results = [],
  errors = [];
try {
  for (const [width, height, scale] of [
    [1920, 1080, 1],
    [1280, 800, 1],
    [499, 500, 1],
    [390, 844, 1],
    [320, 700, 1],
    [1280, 800, 1.25],
  ])
    for (const theme of ['light', 'dark']) {
      const context = await browser.newContext({
          viewport: { width, height },
          deviceScaleFactor: scale,
          isMobile: width < 500,
          hasTouch: width < 500,
        }),
        p = await context.newPage();
      p.setDefaultTimeout(12000);
      p.on('pageerror', (e) => errors.push(e.message));
      p.on('console', (m) => {
        if (m.type() === 'error') errors.push(m.text());
      });
      await p.goto(`http://127.0.0.1:${server.address().port}/?theme=${theme}`);
      const trigger = p.locator('#model');
      await trigger.click();
      await p.getByRole('slider', { name: 'Select effort' }).waitFor();
      await p.screenshot({ path: path.join(out, `${width}-${theme}-${scale}-effort.png`) });
      const slider = p.getByRole('slider');
      await slider.focus();
      await slider.press('ArrowRight');
      await p.getByRole('textbox', { name: 'Outcome' }).filter({ visible: true }).waitFor();
      assert.match(await p.getByRole('textbox', { name: 'Outcome' }).inputValue(), /effort:xhigh/);
      await p.getByRole('button', { name: 'Select model', exact: true }).click();
      await p.getByRole('menuitemradio', { name: 'GPT-6 Luna', exact: true }).waitFor();
      await p.screenshot({ path: path.join(out, `${width}-${theme}-${scale}-models.png`) });
      await p.getByRole('menuitemradio', { name: 'GPT-6 Luna', exact: true }).click();
      assert.match(await trigger.textContent(), /GPT-6 Luna/);
      assert.equal(await p.getByRole('textbox', { name: 'Draft' }).inputValue(), 'Preserve this draft');
      await trigger.click();
      await p.getByRole('button', { name: 'Reset effort' }).click();
      assert.match(await p.getByRole('textbox', { name: 'Outcome' }).inputValue(), /effort:medium/);
      assert.equal(
        await slider.evaluate((e) =>
          getComputedStyle(e).getPropertyValue('--desktop-color-effort-thumb').trim(),
        ),
        '#ffffff',
      );
      const pixels = PNG.sync.read(await p.screenshot()),
        sliderBox = await slider.boundingBox(),
        factor = pixels.width / width;
      const thumbPoint = await slider.evaluate((e) => Number(e.value) / Number(e.max));
      const pixel =
        (Math.round((sliderBox.y + sliderBox.height / 2) * factor) * pixels.width +
          Math.round((sliderBox.x + 14 + thumbPoint * (sliderBox.width - 28)) * factor)) *
        4;
      assert.deepEqual([...pixels.data.subarray(pixel, pixel + 3)], [255, 255, 255]);
      const track = await slider.boundingBox(),
        beforeDrag = await p.getByRole('textbox', { name: 'Outcome' }).inputValue();
      if (width < 500) {
        await p.touchscreen.tap(track.x + track.width - 3, track.y + track.height / 2);
      } else {
        await p.mouse.move(track.x + track.width * 0.22, track.y + track.height / 2);
        await p.mouse.down();
        await p.mouse.move(track.x + track.width - 3, track.y + track.height / 2, { steps: 8 });
        assert.equal(await p.getByRole('textbox', { name: 'Outcome' }).inputValue(), beforeDrag);
        await p.mouse.up();
      }
      const afterDrag = await p.getByRole('textbox', { name: 'Outcome' }).inputValue();
      assert.equal(afterDrag, beforeDrag + ',effort:ultra');
      await p.keyboard.press('Escape');
      await p.getByRole('button', { name: 'Add', exact: true }).click();
      await p.getByRole('menuitem', { name: 'Plan mode Turn plan mode on' }).waitFor();
      await p.screenshot({ path: path.join(out, `${width}-${theme}-${scale}-add.png`) });
      await p.getByRole('menuitem', { name: 'Plan mode Turn plan mode on' }).click();
      assert.equal(await p.locator('[data-plan]').getAttribute('data-plan'), 'true');
      await p.getByRole('button', { name: 'Pause goal', exact: true }).click();
      await p.getByRole('button', { name: 'Resume goal', exact: true }).click();
      await p.getByRole('button', { name: 'View goal', exact: true }).click();
      assert.equal(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      assert.equal((await p.getByRole('textbox', { name: 'Outcome' }).inputValue()).includes('send'), false);
      assert.equal(
        (await p.getByRole('textbox', { name: 'Outcome' }).inputValue()).includes('execute'),
        false,
      );
      if (width >= 768) {
        await p.keyboard.press('Control+Shift+M');
        await p.getByRole('slider').waitFor();
        await p.keyboard.press('Escape');
      }
      results.push({ width, height, scale, theme, passed: true });
      await context.close();
    }
  assert.deepEqual(errors, []);
  await fs.writeFile(
    path.join(out, 'results.json'),
    JSON.stringify({ passed: true, cases: results, errors, realAI: false, physicalDevices: false }, null, 2),
  );
  console.log(JSON.stringify({ passed: true, cases: results.length }));
} finally {
  await browser.close();
  server.close();
  await fs.rm(temp, { recursive: true, force: true });
}
