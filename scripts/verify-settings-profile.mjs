import { browserOptions } from './browser-options.mjs';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, rm, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { build } from 'esbuild';
import { chromium } from 'playwright';
const root = path.resolve(import.meta.dirname, '..'),
  temp = await mkdtemp(path.join(tmpdir(), 'desktop-settings-profile-'));
let browser, server;
try {
  await build({
    entryPoints: [path.join(root, 'examples/settings-profile.tsx')],
    outfile: path.join(temp, 'fixture.js'),
    bundle: true,
    platform: 'browser',
    jsx: 'automatic',
    nodePaths: [path.join(root, 'node_modules')],
  });
  await build({
    entryPoints: [path.join(root, 'src/desktop.css')],
    outfile: path.join(temp, 'fixture.css'),
    bundle: true,
  });
  await writeFile(
    path.join(temp, 'index.html'),
    '<html><link rel="stylesheet" href="/fixture.css"><div id="root"></div><script src="/fixture.js"></script></html>',
  );
  server = http.createServer(async (req, res) => {
    const name = path.basename(new URL(req.url, 'http://localhost').pathname);
    const file = ['fixture.css', 'fixture.js'].includes(name) ? name : 'index.html';
    res.setHeader(
      'Content-Type',
      file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : 'text/html',
    );
    res.end(await readFile(path.join(temp, file)));
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  browser = await chromium.launch(browserOptions());
  await mkdir(path.join(root, 'tests/output/settings-profile'), { recursive: true });
  const cases = [];
  for (const shell of [false, true])
    for (const theme of ['light', 'dark'])
      for (const [width, height, scale] of [
        [1920, 1080, 1],
        [1280, 800, 1],
        [1536, 864, 1.25],
        [760, 800, 1],
      ]) {
        const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: scale });
        const errors = [];
        page.on('pageerror', (e) => errors.push(e.message));
        await page.goto(`http://127.0.0.1:${server.address().port}${shell ? '?shell=1' : ''}`);
        await page.locator('.client-settings-field').first().waitFor();
        await page.evaluate(
          (theme) => document.documentElement.classList.toggle('dark', theme === 'dark'),
          theme,
        );
        const metrics = await page.evaluate(() => {
          const style = (s) => getComputedStyle(document.querySelector(s)),
            rect = (s) => document.querySelector(s).getBoundingClientRect();
          return {
            searchGap: (() => {
              const group = document.querySelector('.kit-settings-search'),
                input = group.querySelector('input'),
                icon = group.querySelector('svg');
              return (
                input.getBoundingClientRect().left +
                parseFloat(getComputedStyle(input).paddingLeft) -
                icon.getBoundingClientRect().right
              );
            })(),
            fontFamily: style('.desktop-client').fontFamily,
            expectedFontFamily: style('.desktop-client').getPropertyValue('--desktop-font-sans').trim(),
            heading: style('.kit-settings-content>h1').fontSize,
            headingWeight: style('.kit-settings-content>h1').fontWeight,
            fieldWeight: style('.client-settings-field h3').fontWeight,
            portableWeight: style('#portable h3').fontWeight,
            toolBodyWeight: style('[data-testid=tool-body]').fontWeight,
            toolBodyFamily: style('[data-testid=tool-body]').fontFamily,
            toolButtonWeight: style('.desktop-native-tool-surface .desktop-button').fontWeight,
            toolButtonFamily: style('.desktop-native-tool-surface .desktop-button').fontFamily,
            labelWeight: style('.client-settings-field h3 span').fontWeight,
            labelFamily: style('.client-settings-field h3 span').fontFamily,
            portableFamily: style('#portable h3').fontFamily,
            senderWeight: style('#portable-sender').fontWeight,
            sidebar: rect('.kit-sidebar').width,
            column: rect('.kit-settings-content').width,
            overflow:
              document.querySelector('.kit-settings-content').scrollWidth >
              rect('.kit-settings-content').width,
          };
        });
        assert.ok(metrics.searchGap >= 7.9, JSON.stringify(metrics));
        assert.equal(metrics.fontFamily, metrics.expectedFontFamily);
        assert.equal(metrics.heading, '28px');
        assert.equal(metrics.headingWeight, '600');
        assert.equal(metrics.fieldWeight, '600');
        assert.equal(metrics.portableWeight, '400');
        assert.equal(metrics.toolBodyWeight, '400');
        assert.equal(metrics.toolButtonWeight, '400');
        assert.equal(metrics.labelWeight, '600');
        assert.equal(metrics.senderWeight, '400');
        for (const family of [
          metrics.toolBodyFamily,
          metrics.toolButtonFamily,
          metrics.labelFamily,
          metrics.portableFamily,
        ])
          assert.equal(family, metrics.fontFamily);
        assert.equal(metrics.sidebar, width <= 1000 ? 260 : 336);
        assert.ok(metrics.column <= 728);
        assert.equal(metrics.overflow, false);
        const selectBounds = await page.getByRole('combobox', { name: 'Model' }).evaluate((node) => {
          const control = node.getBoundingClientRect(),
            value = node.querySelector('span').getBoundingClientRect();
          return {
            controlTop: control.top,
            controlBottom: control.bottom,
            valueTop: value.top,
            valueBottom: value.bottom,
          };
        });
        assert.ok(
          selectBounds.valueTop >= selectBounds.controlTop &&
            selectBounds.valueBottom <= selectBounds.controlBottom,
          JSON.stringify(selectBounds),
        );
        await page.getByRole('combobox', { name: 'Model' }).click();
        await page.locator('.desktop-ui-portal.desktop-client').waitFor({ state: 'attached' });
        assert.equal(
          await page
            .locator('.desktop-ui-portal')
            .evaluate((e) => e.classList.contains('desktop-native-tool-surface')),
          true,
        );
        await page.keyboard.press('Escape');
        await page.locator('.desktop-select-content').waitFor({ state: 'hidden' });
        if (shell) {
          const nav = await page.locator('.kit-settings-search input').elementHandle();
          await page.getByRole('button', { name: 'Toggle layout', exact: true }).click();
          assert.equal(
            await page.locator('.kit-sidebar').evaluate((n) => n.getBoundingClientRect().width),
            width <= 1000 ? 300 : 372,
          );
          await page.getByRole('button', { name: 'Toggle layout', exact: true }).click();
          assert.equal(
            await nav.evaluate((n) => n === document.querySelector('.kit-settings-search input')),
            true,
            'layout switches retain navigation state',
          );
          for (const name of ['File', 'More', 'Test account']) {
            await page.getByRole('button', { name, exact: true }).click();
            const menu = page.locator('[role=menu]').last();
            await menu.waitFor();
            await page.waitForFunction(() => document.activeElement?.closest('[role=menu]'));
            const portal = await menu.evaluate((n) => ({
              client: !!n.closest('.desktop-ui-portal.desktop-client'),
              font: getComputedStyle(n).fontSize,
              background: getComputedStyle(n).backgroundColor,
            }));
            assert.equal(portal.client, true, name);
            assert.equal(portal.font, '14px', name);
            assert.equal(
              portal.background,
              theme === 'dark' ? 'rgb(44, 44, 44)' : 'rgb(255, 255, 255)',
              name,
            );
            if (name === 'Test account') {
              await page.getByRole('menuitem', { name: 'Appearance', exact: true }).focus();
              await page.keyboard.press('ArrowRight');
              await page.getByRole('menuitemradio', { name: 'Dark', exact: true }).waitFor();
              assert.equal(
                await page
                  .getByRole('menuitemradio', { name: 'Dark', exact: true })
                  .evaluate((n) => !!n.closest('.desktop-ui-portal.desktop-client')),
                true,
              );
              await page.keyboard.press('Escape');
              await page
                .getByRole('menuitemradio', { name: 'Dark', exact: true })
                .waitFor({ state: 'hidden' });
            }
            await page.keyboard.press('Escape');
            await menu.waitFor({ state: 'hidden' });
          }
        }
        await page.screenshot({
          path: path.join(
            root,
            'tests/output/settings-profile',
            (shell ? 'shell-' : 'layout-') + theme + '-' + width + '.png',
          ),
        });
        assert.deepEqual(errors, []);
        cases.push({ shell, theme, width, scale, selectBounds, ...metrics });
        await page.close();
      }
  await writeFile(
    path.join(root, 'tests/output/settings-profile/result.json'),
    JSON.stringify({ status: 'passed', browser: browserOptions(), cases }, null, 2),
  );
  console.log(
    JSON.stringify({
      cases,
      scope:
        'Shared reference settings; nested Native Tool labels retain client emphasis; portable Host typography stays regular',
    }),
  );
} finally {
  await browser?.close();
  if (server) await new Promise((r) => server.close(r));
  if (path.dirname(temp) !== tmpdir() || !path.basename(temp).startsWith('desktop-settings-profile-'))
    throw Error('UNSAFE_TEMP_ROOT');
  await rm(temp, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}
