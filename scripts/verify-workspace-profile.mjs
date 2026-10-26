import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
assert.equal(process.version, 'v24.19.0');
const out = path.join(root, 'evidence/workspace-profile');
await fs.mkdir(out, { recursive: true });
await build({
  absWorkingDir: root,
  entryPoints: ['examples/workspace-profile.tsx'],
  bundle: true,
  outfile: path.join(out, 'app.js'),
  format: 'iife',
  logLevel: 'error',
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
  '<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="app.css"><link rel="stylesheet" href="fixture.css"><div id="root"></div><script src="app.js" defer></script></html>',
);
await fs.writeFile(
  path.join(out, 'fixture.css'),
  'html,body,#root{margin:0;height:100%;overflow:hidden}#root>.desktop-ui-root{height:100%}.workspace-fixture{height:100%;min-height:0;display:flex;flex-direction:column}.workspace-scroll{flex:1;min-height:0;overflow:auto}.workspace-reading{max-width:760px;display:grid;gap:16px;margin:auto;padding:20px 16px 32px}.workspace-nav{display:grid;gap:8px;padding:16px}.workspace-long-content{height:520px}',
);
const server = http.createServer(async (req, res) => {
  const name = path.basename(new URL(req.url, 'http://localhost').pathname) || 'index.html';
  try {
    const body = await fs.readFile(path.join(out, name));
    res.writeHead(200, {
      'Content-Type': name.endsWith('.css')
        ? 'text/css'
        : name.endsWith('.js')
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
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const errors = [],
  results = [];
try {
  for (const [width, height, scale] of [
    [1440, 1000, 1],
    [1280, 800, 1.25],
    [390, 844, 1],
    [360, 800, 1],
    [320, 740, 1],
    [430, 932, 1],
  ]) {
    const phone = width < 768;
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: scale,
      hasTouch: phone,
    });
    const page = await context.newPage();
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    const activate = async (locator) => (phone ? locator.tap() : locator.click());
    const draft = page.getByRole('textbox', { name: '本轮修改', exact: true });
    await draft.fill('我的修改意见，在切换主题与打开选择器后保留。');
    const handle = await draft.elementHandle();
    for (const theme of ['light', 'dark']) {
      if (theme === 'dark') await activate(page.getByRole('button', { name: '切换主题', exact: true }));
      await page.waitForFunction(
        (value) => document.querySelector('.desktop-app').dataset.theme === value,
        theme,
      );
      assert.equal(await draft.evaluate((element, old) => element === old, handle), true);
      assert.match(await draft.inputValue(), /修改意见/);
      const rootStyle = await page.locator('.workspace-fixture').evaluate((element) => ({
        background: getComputedStyle(element).backgroundColor,
        color: getComputedStyle(element).color,
        fontFamily: getComputedStyle(element).fontFamily,
      }));
      assert.equal(rootStyle.background, theme === 'light' ? 'rgb(245, 247, 248)' : 'rgb(16, 28, 32)');
      assert.match(rootStyle.fontFamily, /Microsoft YaHei/);
      assert.equal(
        await draft.evaluate((element) => getComputedStyle(element).fontSize),
        phone ? '16px' : '14px',
      );
      const header = page.locator('.desktop-chat-header');
      assert.equal((await header.boundingBox()).height, 56);
      const actionBar = page.getByRole('group', { name: '本轮操作', exact: true });
      const actionBarBounds = await actionBar.boundingBox();
      assert.ok(
        Math.abs(actionBarBounds.y + actionBarBounds.height - height) <= 1,
        'action bar at viewport edge',
      );
      assert.equal(
        await actionBar.evaluate((element) => getComputedStyle(element).backgroundColor),
        theme === 'light' ? 'rgb(255, 255, 255)' : 'rgb(25, 42, 48)',
      );
      for (const locator of [
        page.getByRole('button', { name: '打开导航', exact: true }),
        page.getByRole('tab', { name: '看稿', exact: true }),
      ]) {
        const bounds = await locator.boundingBox();
        assert.ok(bounds.height >= (phone ? 48 : 40), `${width}: target ${bounds.height}`);
      }
      await page.screenshot({ path: path.join(out, `${width}-${theme}.png`) });
      if (phone) {
        const trigger = page.getByRole('button', { name: '打开导航', exact: true });
        await activate(trigger);
        const destination = page.getByRole('button', { name: '创作基座', exact: true });
        await destination.waitFor();
        assert.equal(
          await destination.evaluate((element) => element.closest('[data-app-profile]').dataset.appProfile),
          'workspace',
        );
        assert.ok((await destination.boundingBox()).height >= 48);
        await page.keyboard.press('Escape');
        assert.equal(await trigger.evaluate((element) => document.activeElement === element), true);
      }
      const select = page.getByRole('combobox', { name: '表达重点', exact: true });
      await select.scrollIntoViewIfNeeded();
      const scroll = page.locator('.workspace-scroll');
      const before = await scroll.evaluate((element) => element.scrollTop);
      const assertRestored = async () => {
        await page.getByRole('listbox').waitFor({ state: 'hidden' });
        await page.waitForFunction(
          (element) => element === document.activeElement,
          await select.elementHandle(),
          { timeout: 2000 },
        );
        assert.equal(await select.evaluate((element) => element === document.activeElement), true);
        assert.ok(
          Math.abs((await scroll.evaluate((element) => element.scrollTop)) - before) <= 1,
          'scroll restored',
        );
        assert.match(await select.textContent(), /读者价值/);
        assert.equal(await page.evaluate(() => getComputedStyle(document.body).pointerEvents), 'auto');
      };
      await activate(select);
      const option = page.getByRole('option', { name: '个人风格', exact: true });
      await option.waitFor();
      const optionHeight = (await option.boundingBox()).height;
      assert.ok(optionHeight >= (phone ? 48 : 40) - 0.5, `${width} ${theme}: option ${optionHeight}`);
      assert.equal(
        await option.evaluate((element) => element.closest('[data-app-profile]').dataset.appProfile),
        'workspace',
      );
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Escape');
      await assertRestored();
      await activate(select);
      if (phone) await page.touchscreen.tap(4, 100);
      else await page.mouse.click(4, 100);
      await assertRestored();
      await activate(select);
      await page.evaluate(() => document.dispatchEvent(new Event('fixture-back')));
      await assertRestored();
      await activate(select);
      await page.evaluate(() => window.dispatchEvent(new Event('blur')));
      await assertRestored();
      await activate(select);
      await activate(page.getByRole('option', { name: '个人风格', exact: true }));
      await page.getByRole('listbox').waitFor({ state: 'hidden' });
      assert.match(await select.textContent(), /个人风格/);
      await activate(select);
      await activate(page.getByRole('option', { name: '读者价值', exact: true }));
      await activate(page.getByRole('button', { name: '调整设置', exact: true }));
      const dialog = page.getByRole('dialog', { name: '本轮设置', exact: true });
      await dialog.waitFor();
      assert.equal(
        await dialog.evaluate((element) => element.closest('[data-app-profile]').dataset.appProfile),
        'workspace',
      );
      await dialog.getByRole('textbox', { name: '弹层草稿', exact: true }).fill('取消选择仍在');
      await activate(dialog.getByRole('combobox', { name: '弹层表达重点', exact: true }));
      await page.evaluate(() => document.dispatchEvent(new Event('fixture-back')));
      await page.getByRole('listbox').waitFor({ state: 'hidden' });
      assert.equal(await dialog.isVisible(), true);
      assert.equal(
        await dialog.getByRole('textbox', { name: '弹层草稿', exact: true }).inputValue(),
        '取消选择仍在',
      );
      await page.screenshot({ path: path.join(out, `${width}-${theme}-sheet.png`) });
      await page.evaluate(() => document.dispatchEvent(new Event('fixture-back')));
      await dialog.waitFor({ state: 'hidden' });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      await activate(select);
      await page.evaluate(() => document.dispatchEvent(new Event('fixture-disable')));
      await page.getByRole('listbox').waitFor({ state: 'hidden' });
      assert.equal(await page.evaluate(() => getComputedStyle(document.body).pointerEvents), 'auto');
      await page.evaluate(() => document.dispatchEvent(new Event('fixture-disable')));
      results.push({
        width,
        height,
        scale,
        theme,
        status: 'passed',
        selectionCancel: ['escape', 'outside', 'host-back', 'window-blur'],
        nestedBack: true,
        disabledReleasesIsolation: true,
        inputRetained: true,
        profilePortal: true,
      });
    }
    await context.close();
  }
  assert.deepEqual(errors, []);
  await fs.writeFile(
    path.join(out, 'result.json'),
    JSON.stringify({ status: 'passed', preparedPackage: true, realDevice: false, results, errors }, null, 2),
  );
  console.log(JSON.stringify({ status: 'passed', views: results.length, screenshots: results.length * 2 }));
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
