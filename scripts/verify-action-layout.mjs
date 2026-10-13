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
  const asset = ['/app.js', '/app.css'].includes(req.url);
  res.setHeader(
    'Content-Type',
    asset ? (req.url.endsWith('css') ? 'text/css' : 'text/javascript') : 'text/html',
  );
  res.end(
    asset
      ? await fs.readFile(path.join(temp, req.url.slice(1)))
      : '<link rel="stylesheet" href="/app.css"><div id="root"></div><script type="module" src="/app.js"></script>',
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
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const channel = process.env.UI_BROWSER_CHANNEL || 'msedge';
  browser = await chromium.launch({ headless: true, ...(channel === 'chromium' ? {} : { channel }) });
  for (const theme of ['light', 'dark'])
    for (const width of [1920, 1280, 480]) {
      const page = await browser.newPage({ viewport: { width, height: 800 } });
      await page.goto(`http://127.0.0.1:${server.address().port}`);
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
      await page.screenshot({ path: path.join(output, `${theme}-${width}.png`) });
      await page.close();
    }
  console.log('Action layout: 6 theme/viewport cases passed');
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
  await fs.rm(temp, { recursive: true, force: true });
}
