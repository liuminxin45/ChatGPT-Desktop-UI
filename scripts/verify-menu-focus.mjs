import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { build } from 'esbuild';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'tests/output/menu-focus');
await fs.mkdir(output, { recursive: true });
await build({
  absWorkingDir: root,
  entryPoints: ['examples/menu-focus.tsx'],
  outfile: path.join(output, 'app.js'),
  bundle: true,
  platform: 'browser',
  format: 'esm',
  jsx: 'automatic',
});
// Reproduce the Tailwind host: utilities follow the library CSS. Tailwind 3
// outline-none is a transparent solid outline, not outline-style: none.
await fs.writeFile(path.join(output, 'tailwind.css'), '@tailwind base;\n@tailwind utilities;');
await fs.writeFile(
  path.join(output, 'tailwind.config.cjs'),
  `module.exports={content:[${JSON.stringify(path.join(root, 'src/compat/dropdown-menu.tsx'))},${JSON.stringify(path.join(root, 'examples/menu-focus.tsx'))}],darkMode:'class'};`,
);
const tw = spawnSync(
  process.execPath,
  [
    path.join(root, 'node_modules/tailwindcss/lib/cli.js'),
    '-i',
    path.join(output, 'tailwind.css'),
    '-o',
    path.join(output, 'utilities.css'),
    '-c',
    path.join(output, 'tailwind.config.cjs'),
  ],
  { cwd: root, encoding: 'utf8' },
);
assert.equal(tw.status, 0, tw.stderr);
const css = await Promise.all(
  [
    'dist/tokens.css',
    'dist/controls.css',
    'dist/compound.css',
    'tests/output/menu-focus/utilities.css',
  ].map((file) => fs.readFile(path.join(root, file), 'utf8')),
);
await fs.writeFile(
  path.join(output, 'app.css'),
  css.join('\n') +
    '\nbody{background:var(--desktop-color-background);color:var(--desktop-color-text)}main{padding:40px;display:flex;gap:24px;align-items:center}.fixture-menu{min-width:240px}',
);
await fs.writeFile(
  path.join(output, 'index.html'),
  '<!doctype html><html><head><link rel="stylesheet" href="/app.css"></head><body><div id="root"></div><script type="module" src="/app.js"></script></body></html>',
);
const server = http.createServer(async (req, res) => {
  const name = new URL(req.url, 'http://localhost').pathname.slice(1) || 'index.html';
  if (!['index.html', 'app.css', 'app.js'].includes(name)) {
    res.writeHead(404);
    return res.end();
  }
  res.setHeader(
    'Content-Type',
    name.endsWith('.css') ? 'text/css' : name.endsWith('.js') ? 'text/javascript' : 'text/html',
  );
  res.end(await fs.readFile(path.join(output, name)));
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const channel = process.env.UI_BROWSER_CHANNEL || 'msedge';
const browser = await chromium.launch({ headless: true, ...(channel === 'chromium' ? {} : { channel }) });
const results = [];
try {
  for (const theme of ['light', 'dark'])
    for (const [width, height, scale] of [
      [1920, 1080, 1],
      [1280, 800, 1],
      [1536, 864, 1.25],
    ]) {
      const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: scale });
      const page = await context.newPage();
      const errors = [];
      page.setDefaultTimeout(5000);
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(`http://127.0.0.1:${server.address().port}/?theme=${theme}`);
      const item = (name, role = 'menuitem') => page.getByRole(role, { name, exact: true });
      const state = (locator) =>
        locator.evaluate((element) => {
          const style = getComputedStyle(element);
          const probe = document.createElement('span');
          probe.style.background = 'var(--desktop-color-surface-hover)';
          document.body.append(probe);
          const hover = getComputedStyle(probe).backgroundColor;
          probe.remove();
          return {
            outline: style.outlineStyle,
            shadow: style.boxShadow,
            fill: style.backgroundColor,
            hover,
            focused: document.activeElement === element,
            highlighted: element.hasAttribute('data-highlighted'),
            keyboard: element.matches(':focus-visible'),
          };
        });
      const check = async (locator, label) => {
        await page.waitForFunction(
          (element) => {
            const probe = document.createElement('span');
            probe.style.background = 'var(--desktop-color-surface-hover)';
            document.body.append(probe);
            const expected = getComputedStyle(probe).backgroundColor;
            probe.remove();
            return getComputedStyle(element).backgroundColor === expected;
          },
          await locator.elementHandle(),
          { timeout: 2000 },
        );
        const current = await state(locator);
        assert.equal(current.outline, 'none', `${theme} ${label}: no outer outline`);
        assert.equal(current.shadow, 'none', `${theme} ${label}: no outer ring`);
        assert.equal(current.focused, true, `${label}: focus retained`);
        assert.equal(current.highlighted, true, `${label}: visible highlight retained`);
        assert.equal(current.fill, current.hover, `${label}: semantic highlight fill`);
        return current;
      };
      await page.getByRole('button', { name: 'Account menu', exact: true }).press('ArrowDown');
      await check(item('Appearance'), 'keyboard submenu');
      await item('Appearance').press('ArrowDown');
      await check(item('Manage account'), 'keyboard item');
      await page.screenshot({ path: path.join(output, `${theme}-${width}-${scale}-keyboard.png`) });
      await item('Settings').hover();
      await check(item('Settings'), 'pointer after keyboard');
      await item('Manage account').hover();
      const pointer = await check(item('Manage account'), 'pointer item');
      assert.equal(await page.evaluate(() => window.menuInvocations), 0, 'hover must not invoke');
      await page.screenshot({ path: path.join(output, `${theme}-${width}-${scale}-pointer.png`) });
      for (const [name, role] of [
        ['Notifications', 'menuitemcheckbox'],
        ['Second option', 'menuitemradio'],
      ]) {
        await item(name, role).hover();
        await check(item(name, role), role);
      }
      await item('Unavailable action').hover({ force: true });
      assert.equal(await item('Unavailable action').getAttribute('aria-disabled'), 'true');
      assert.equal((await state(item('Unavailable action'))).focused, false);
      await item('Manage account').hover();
      await item('Manage account').press('Enter');
      assert.equal(await page.evaluate(() => window.menuInvocations), 1, 'Enter invokes exactly once');
      await page.locator('.fixture-menu').waitFor({ state: 'hidden' });
      await page.waitForFunction(
        () => document.activeElement?.getAttribute('data-desktop-action') === 'fixture.account.open',
        undefined,
        { timeout: 2000 },
      );
      assert.equal(
        await page
          .getByRole('button', { name: 'Account menu', exact: true })
          .evaluate((element) => document.activeElement === element),
        true,
        'focus returns to trigger',
      );
      await page.getByRole('button', { name: 'Account menu', exact: true }).press('ArrowDown');
      await item('Appearance').press('ArrowRight');
      await check(item('System theme'), 'submenu child');
      await item('System theme').press('Escape');
      await page.locator('.fixture-menu').waitFor({ state: 'hidden' });
      for (const [trigger, label] of [
        ['Portable menu', 'Portable action'],
        ['Client menu', 'Client action'],
      ]) {
        await page.goto(`http://127.0.0.1:${server.address().port}/?theme=${theme}`);
        await page.getByRole('button', { name: trigger, exact: true }).press('Enter');
        await page.keyboard.press('ArrowDown');
        await check(item(label), trigger);
        await page.keyboard.press('Escape');
      }
      assert.deepEqual(errors, []);
      results.push({ theme, width, height, scale, pointer, passed: true });
      await context.close();
    }
  await fs.writeFile(path.join(output, 'results.json'), JSON.stringify(results, null, 2));
  console.log(
    `PASS menu focus contract: ${results.length} theme/viewport cases; Tailwind/Radix keyboard, pointer, submenu, checkbox, radio, disabled, invocation and focus return`,
  );
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
