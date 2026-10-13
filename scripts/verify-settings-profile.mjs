import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { build } from 'esbuild';
import { chromium } from 'playwright';
const root = path.resolve(import.meta.dirname, '..'),
  temp = await mkdtemp(path.join(tmpdir(), 'desktop-settings-profile-'));
let browser, server;
try {
  await writeFile(
    path.join(temp, 'fixture.tsx'),
    `import React from 'react';import {createRoot} from 'react-dom/client';import {DesktopClientSurface,DesktopDocumentAdapter,SettingsLayout,SettingsNavigation,SettingsPage,SettingsGroup,SettingsField,Select,Switch,Input} from '${path.join(root, 'src/index.ts').replaceAll('\\', '/')}';
 function Fixture(){return <DesktopDocumentAdapter><DesktopClientSurface><SettingsLayout sidebar={<SettingsNavigation categories={[{id:'general',label:'General'}]} selected="general" onSelect={()=>{}}/>}><SettingsPage title="General" data-test-page><section className="desktop-native-tool-surface"><SettingsGroup title="Permissions"><SettingsField label="Default permissions" description="Long readable descriptions preserve the label and right control alignment."><Switch checked onCheckedChange={()=>{}} aria-label="Permissions"/></SettingsField><SettingsField label="Model"><Select value="model" options={[{value:'model',label:'A long model name with explanatory information and a current default preference'}]} onValueChange={()=>{}} aria-label="Model"/></SettingsField><SettingsField label={'LongPath/'.repeat(12)}><Input aria-label="Path" defaultValue="Long value"/></SettingsField></SettingsGroup></section></SettingsPage></SettingsLayout></DesktopClientSurface><section className="desktop-native-tool-surface" id="portable"><h3>Portable Host typography</h3></section></DesktopDocumentAdapter>};createRoot(document.getElementById('root')).render(<Fixture/>);`,
  );
  await build({
    entryPoints: [path.join(temp, 'fixture.tsx')],
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
  browser = await chromium.launch({ channel: 'msedge', headless: true });
  const cases = [];
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
      await page.goto(`http://127.0.0.1:${server.address().port}`);
      await page.locator('.client-settings-field').first().waitFor();
      await page.evaluate(
        (theme) => document.documentElement.classList.toggle('dark', theme === 'dark'),
        theme,
      );
      const metrics = await page.evaluate(() => {
        const style = (s) => getComputedStyle(document.querySelector(s)),
          rect = (s) => document.querySelector(s).getBoundingClientRect();
        return {
          fontFamily: style('.desktop-client').fontFamily,
          expectedFontFamily: style('.desktop-client').getPropertyValue('--desktop-font-sans').trim(),
          heading: style('.kit-settings-content>h1').fontSize,
          headingWeight: style('.kit-settings-content>h1').fontWeight,
          fieldWeight: style('.client-settings-field h3').fontWeight,
          portableWeight: style('#portable h3').fontWeight,
          sidebar: rect('.kit-sidebar').width,
          column: rect('.kit-settings-content').width,
          overflow:
            document.querySelector('.kit-settings-content').scrollWidth > rect('.kit-settings-content').width,
        };
      });
      assert.equal(metrics.fontFamily, metrics.expectedFontFamily);
      assert.equal(metrics.heading, '28px');
      assert.equal(metrics.headingWeight, '600');
      assert.equal(metrics.fieldWeight, '600');
      assert.equal(metrics.portableWeight, '400');
      assert.equal(metrics.sidebar, width <= 1000 ? 260 : 336);
      assert.ok(metrics.column <= 728);
      assert.equal(metrics.overflow, false);
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
      assert.deepEqual(errors, []);
      cases.push({ theme, width, scale, ...metrics });
      await page.close();
    }
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
