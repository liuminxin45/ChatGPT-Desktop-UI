import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import { build } from 'esbuild';
import { chromium } from 'playwright';

if (process.version !== 'v24.19.0') throw Error('Node 24.19.0 required');
const root = process.cwd(),
  temp = await fs.mkdtemp(path.join(os.tmpdir(), 'kit-composition-'));
const output = path.join(root, 'tests/output/composer-integration');
await fs.mkdir(output, { recursive: true });
await build({
  entryPoints: ['examples/composer-integration.tsx'],
  outdir: temp,
  bundle: true,
  format: 'esm',
  jsx: 'automatic',
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
    asset = ['/composer-integration.js', '/composer-integration.css'].includes(name);
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
      : '<!doctype html><html lang="zh-CN"><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/composer-integration.css"></head><body><div id="root"></div><script type="module" src="/composer-integration.js"></script></body></html>',
  );
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const browser = await chromium.launch({
    channel: process.env.UI_BROWSER_CHANNEL || 'msedge',
    headless: true,
  }),
  checks = [];
try {
  for (const theme of ['light', 'dark'])
    for (const [width, height, scale] of [
      [1920, 1080, 1],
      [1280, 800, 1.25],
      [390, 844, 1],
      [320, 740, 1],
    ]) {
      const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: scale }),
        page = await context.newPage(),
        errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.addInitScript(() => {
        window.__csp = [];
        addEventListener('securitypolicyviolation', (e) => window.__csp.push(e.violatedDirective));
      });
      await page.goto(`http://127.0.0.1:${server.address().port}/?theme=${theme}`);
      const field = page.getByRole('textbox', { name: '消息草稿' });
      await field.waitFor();
      const activity = page.locator('.desktop-ai-activity');
      assert.notEqual(await activity.evaluate((e) => getComputedStyle(e).animationName), 'none');
      const jump = page.getByRole('button', { name: '滚动到底部', exact: true });
      await jump.click();
      await jump.waitFor({ state: 'hidden' });
      const message = page.getByLabel('消息', { exact: true });
      assert.match(await message.evaluate((e) => getComputedStyle(e).maskImage), /linear-gradient/);
      await message.evaluate((e) => (e.scrollTop = 0));
      await jump.waitFor();
      const draft = Array.from({ length: 40 }, (_, i) => `第 ${i + 1} 行：完整草稿`).join('\n');
      await field.fill(draft);
      const geometry = await field.evaluate((e) => ({
        height: e.getBoundingClientRect().height,
        client: e.clientHeight,
        scroll: e.scrollHeight,
        overflow: getComputedStyle(e).overflowY,
      }));
      assert.ok(geometry.height <= 161);
      assert.ok(geometry.scroll > geometry.client);
      assert.equal(geometry.overflow, 'auto');
      await field.evaluate((e) => (e.scrollTop = 0));
      await field.evaluate((e) => (e.scrollTop = e.scrollHeight));
      assert.ok((await field.evaluate((e) => e.scrollTop)) > 0);
      const modelTrigger = page.getByRole('combobox', { name: '模型', exact: true });
      const chevron = await modelTrigger.locator('svg').elementHandle();
      const beforeChevron = await chevron.boundingBox();
      await modelTrigger.hover();
      await page.mouse.down();
      for (const delay of [0, 60, 180]) {
        if (delay) await page.waitForTimeout(delay);
        const afterChevron = await chevron.boundingBox();
        for (const key of ['x', 'y', 'width', 'height']) {
          assert.ok(
            Math.abs(beforeChevron[key] - afterChevron[key]) < 0.1,
            `Select chevron ${key} moved while opening`,
          );
        }
      }
      await page.mouse.up();
      await page.getByRole('option', { name: '模型 B', exact: true }).click();
      assert.equal(await field.inputValue(), draft);
      assert.equal(await page.locator('[role=status]').last().innerText(), '发送次数：0');
      await page.screenshot({ path: path.join(output, `${width}-${theme}-conversation.png`) });
      await page.getByRole('tab', { name: '设置', exact: true }).click();
      await page.getByRole('heading', { name: '设置', exact: true }).waitFor();
      await page.screenshot({ path: path.join(output, `${width}-${theme}-settings.png`) });
      await page.getByRole('tab', { name: '日期', exact: true }).click();
      assert.equal(await page.getByRole('button', { name: '禁用日期', exact: true }).isDisabled(), true);
      const date = page.getByRole('button', { name: '资讯日期', exact: true });
      await date.click();
      await page.locator('.desktop-calendar').waitFor();
      assert.equal(await page.getByRole('button', { name: '清除日期', exact: true }).count(), 0);
      await page.screenshot({ path: path.join(output, `${width}-${theme}-calendar.png`) });
      await page.locator('.desktop-calendar-day').filter({ hasText: /^15$/ }).click();
      assert.match(await date.innerText(), /15/);
      await date.click();
      await page.keyboard.press('Escape');
      await page.locator('.desktop-calendar').waitFor({ state: 'hidden' });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      assert.deepEqual(await page.evaluate(() => window.__csp), []);
      assert.deepEqual(errors, []);
      checks.push({ width, theme, scale, geometry });
      await context.close();
    }
  const context = await browser.newContext({ reducedMotion: 'reduce' }),
    page = await context.newPage();
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  await page.locator('.desktop-ai-activity').waitFor();
  assert.equal(
    await page.locator('.desktop-ai-activity').evaluate((e) => getComputedStyle(e).animationName),
    'none',
  );
  await context.close();
  await fs.writeFile(
    path.join(output, 'result.json'),
    JSON.stringify(
      { status: 'passed', checks, reducedMotion: 'static', preparedPackage: true, synthetic: true },
      null,
      2,
    ),
  );
  console.log(JSON.stringify({ status: 'passed', cases: checks.length, preparedPackage: true }));
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
  await fs.rm(temp, { recursive: true, force: true });
}
