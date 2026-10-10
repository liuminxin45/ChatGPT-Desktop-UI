import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import { build } from 'esbuild';
import { chromium } from 'playwright';
if (process.version !== 'v24.19.0') throw Error('Node 24.19.0 required');
const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'desktop-composer-actions-'));
const output = path.resolve('tests/output/composer-actions');
await fs.mkdir(output, { recursive: true });
await build({
  entryPoints: ['examples/composer-actions.tsx'],
  outdir: temp,
  bundle: true,
  format: 'esm',
  platform: 'browser',
  jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"production"' },
});
const server = http.createServer(async (req, res) => {
  const name = req.url.split('?')[0],
    asset = ['/composer-actions.js', '/composer-actions.css'].includes(name);
  res.setHeader('Content-Type', asset ? (name.endsWith('js') ? 'text/javascript' : 'text/css') : 'text/html');
  res.end(
    asset
      ? await fs.readFile(path.join(temp, name.slice(1)))
      : '<link rel="stylesheet" href="/composer-actions.css"><div id="root"></div><script type="module" src="/composer-actions.js"></script>',
  );
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
let browser;
const cases = [];
try {
  browser = await chromium.launch({ channel: 'msedge', headless: true });
  for (const theme of ['light', 'dark'])
    for (const [width, height, scale] of [
      [1920, 1080, 1],
      [1280, 800, 1],
      [1536, 864, 1.25],
    ]) {
      const context = await browser.newContext({
        colorScheme: theme,
        viewport: { width, height },
        deviceScaleFactor: scale,
      });
      const page = await context.newPage(),
        errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.goto(`http://127.0.0.1:${server.address().port}`);
      await page.getByRole('button', { name: 'Ready', exact: true }).waitFor();
      const buttons = page.locator('button.desktop-send-control');
      const geometry = await buttons.evaluateAll((nodes) =>
        nodes.map((node) => {
          const r = node.getBoundingClientRect(),
            s = getComputedStyle(node);
          return {
            width: r.width,
            height: r.height,
            radius: s.borderRadius,
            background: s.backgroundColor,
            color: s.color,
            state: node.dataset.composerState,
            disabled: node.disabled,
          };
        }),
      );
      for (const g of geometry) {
        assert.equal(g.width, 32);
        assert.equal(g.height, 32);
        assert.equal(g.radius, '50%');
        assert.equal(g.background, geometry[0].background);
        assert.equal(g.color, geometry[0].color);
      }
      for (const name of ['Sending', 'Stopping', 'Empty', 'Unsupported stop'])
        assert.equal(await page.getByRole('button', { name, exact: true }).isDisabled(), true);
      assert.equal(await page.getByRole('button', { name: 'Stop', exact: true }).isEnabled(), true);
      await page.screenshot({ path: path.join(output, `${theme}-${width}-${scale}.png`) });
      const work = page.locator('[data-desktop-surface="fixture.work.composer"]'),
        field = page.getByRole('textbox', { name: 'Work draft' });
      await work.getByRole('button', { name: 'Send message' }).click();
      assert.equal(await field.inputValue(), 'Draft stays editable');
      await field.press('Enter');
      assert.deepEqual(await page.evaluate(() => window.composerEvents), { send: 1, stop: 0 });
      await work.getByRole('button', { name: 'Stop generating' }).focus();
      await page.keyboard.press('Space');
      assert.equal(await work.getByRole('button', { name: 'Stopping' }).isDisabled(), true);
      assert.deepEqual(await page.evaluate(() => window.composerEvents), { send: 1, stop: 1 });
      await page.getByRole('button', { name: 'Finish', exact: true }).click();
      await field.fill('Next draft');
      await field.press('Shift+Enter');
      assert.equal((await page.evaluate(() => window.composerEvents)).send, 1);
      await field.press('Enter');
      assert.equal((await page.evaluate(() => window.composerEvents)).send, 2);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      assert.equal(
        await page
          .locator('[data-composer-state="sending"] .desktop-composer-progress')
          .evaluate((node) => getComputedStyle(node).animationName),
        'none',
      );
      assert.deepEqual(errors, []);
      cases.push({ theme, width, height, scale, geometry });
      await context.close();
    }
  await fs.writeFile(path.join(output, 'result.json'), JSON.stringify({ status: 'passed', cases }, null, 2));
  console.log(JSON.stringify({ status: 'passed', cases: cases.length }));
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
  await fs.rm(temp, { recursive: true, force: true });
}
