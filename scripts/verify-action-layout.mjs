import { browserOptions } from './browser-options.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { build } from 'esbuild';
import { chromium } from 'playwright';
const root = path.resolve(import.meta.dirname, '..');
const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'kit-action-layout-'));
const output = path.join(root, 'tests/output/action-layout');
await fs.mkdir(output, { recursive: true });
let browser;
const server = http.createServer(async (req, res) => {
  const asset = ['/app.js', '/app.css', '/portable.css'].includes(req.url);
  res.setHeader(
    'Content-Type',
    asset ? (req.url.endsWith('css') ? 'text/css' : 'text/javascript') : 'text/html',
  );
  res.end(
    asset
      ? await fs.readFile(path.join(temp, req.url.slice(1)))
      : `<link rel="stylesheet" href="/${req.url.includes('portable') ? 'portable' : 'app'}.css"><div id="root"></div><script type="module" src="/app.js"></script>`,
  );
});
try {
  await build({
    absWorkingDir: root,
    entryPoints: ['examples/action-layout.tsx'],
    outfile: path.join(temp, 'app.js'),
    bundle: true,
    jsx: 'automatic',
    format: 'esm',
  });
  // Embedded consumers do not inherit the desktop document's arrow-cursor policy.
  await build({
    entryPoints: [path.join(root, 'src/controls.css')],
    outfile: path.join(temp, 'portable.css'),
    bundle: true,
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  browser = await chromium.launch(browserOptions());
  const cases = [];
  for (const portable of [false, true])
    for (const theme of ['light', 'dark'])
      for (const [width, height, scale] of [
        [1920, 1080, 1],
        [1280, 800, 1],
        [1536, 864, 1.25],
        [480, 800, 1],
      ]) {
        const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: scale });
        const errors = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.goto(`http://127.0.0.1:${server.address().port}${portable ? '/?portable' : '/'}`);
        await page.locator('[data-testid=row]').first().waitFor();
        await page.evaluate((theme) => {
          document.documentElement.classList.toggle('dark', theme === 'dark');
          document.documentElement.dataset.theme = theme;
        }, theme);
        const boxes = await page
          .locator('[data-testid=avatar]')
          .evaluateAll((nodes) => nodes.map((n) => n.getBoundingClientRect().toJSON()));
        assert.equal(boxes[0].x, boxes[1].x, 'names cannot shift row alignment');
        assert.equal(
          await page
            .locator('[data-testid=surface]')
            .evaluate((n) => n.parentElement.classList.contains('desktop-action-tooltip')),
          false,
          'tooltip must not introduce a grid item',
        );
        assert.equal(
          await page.locator('[data-testid=command]').evaluate((n) => getComputedStyle(n).justifyContent),
          'center',
        );
        for (const tile of await page.locator('[data-testid=tile]').all()) {
          const box = await tile.boundingBox(),
            img = await tile.locator('img').boundingBox();
          assert.ok(box.width >= 70 && Math.abs(box.width - box.height) < 1);
          assert.ok(
            img.width >= 58 && img.height >= 58,
            'intrinsic tiny assets enlarge to shared preview size',
          );
        }
        assert.equal(
          (await page.locator('[data-testid=surface]').boundingBox()).height,
          88,
          'schedule cannot inherit command height',
        );
        const matrix = await page.locator('[data-testid=matrix]').evaluateAll((nodes) =>
          nodes.map((node) => {
            const style = getComputedStyle(node),
              rect = node.getBoundingClientRect();
            node.click();
            return {
              layout: node.dataset.layout,
              variant: node.dataset.variant,
              size: node.dataset.size,
              disabled: node.disabled,
              opacity: style.opacity,
              cursor: style.cursor,
              width: rect.width,
              height: rect.height,
              commandClass: node.classList.contains('desktop-button'),
              invoked: node.dataset.invoked === 'true',
            };
          }),
        );
        assert.equal(matrix.length, 64);
        for (const button of matrix) {
          assert.equal(button.opacity, button.disabled ? '0.55' : '1', JSON.stringify(button));
          if (button.disabled) assert.equal(button.cursor, 'default', JSON.stringify(button));
          assert.equal(button.invoked, !button.disabled, 'native disabled buttons must suppress commands');
          if (button.layout === 'surface') {
            if (portable && !button.disabled) assert.equal(button.cursor, 'pointer');
            assert.equal(button.commandClass, false);
            assert.equal(button.width, 88);
            assert.equal(button.height, 44);
          }
        }
        const surface = page.locator('[data-testid=matrix][data-layout=surface]').first();
        const restingFill = await surface.evaluate((node) => getComputedStyle(node).backgroundColor);
        await page.keyboard.press('Tab');
        await surface.focus();
        const focus = await surface.evaluate((node) => {
          const probe = document.createElement('span');
          probe.style.background = 'var(--desktop-color-surface-hover)';
          node.append(probe);
          const expected = getComputedStyle(probe).backgroundColor;
          probe.remove();
          const style = getComputedStyle(node);
          return { active: document.activeElement === node, outline: style.outlineStyle,
            shadow: style.boxShadow, fill: style.backgroundColor, expected };
        });
        assert.equal(focus.active, true);
        assert.equal(focus.outline, 'none');
        assert.equal(focus.shadow, 'none');
        assert.equal(focus.fill, focus.expected, 'domain resting fills must preserve shared keyboard feedback');
        assert.notEqual(focus.fill, restingFill);
        await surface.evaluate((node) => delete node.dataset.invoked);
        await surface.press('Space');
        assert.equal(await surface.getAttribute('data-invoked'), 'true');
        assert.deepEqual(errors, []);
        cases.push({ portable, theme, width, height, scale, matrix });
        await page.screenshot({
          path: path.join(output, `${portable ? 'portable-' : ''}${theme}-${width}.png`),
        });
        await page.close();
      }
  await fs.writeFile(
    path.join(output, 'result.json'),
    JSON.stringify({ status: 'passed', browser: browserOptions(), cases }, null, 2),
  );
  console.log(`Action layout: ${cases.length} theme/viewport/scale cases passed`);
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
  await fs.rm(temp, { recursive: true, force: true });
}
