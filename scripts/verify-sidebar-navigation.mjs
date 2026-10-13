import { browserOptions } from './browser-options.mjs';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { build } from 'esbuild';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
const root = path.resolve(new URL('..', import.meta.url).pathname.replace(/^\/(?:([A-Z]:))/i, '$1'));
const temp = await mkdtemp(path.join(os.tmpdir(), 'desktop-sidebar-'));
const output = path.join(root, 'tests/output/sidebar-navigation');
await mkdir(output, { recursive: true });
await writeFile(
  path.join(temp, 'fixture.tsx'),
  `import React from 'react';import {createRoot} from 'react-dom/client';import {ClientSidebar,ClientSidebarItem,DesktopClientSurface,DesktopDocumentAdapter,ListStack,DocumentIcon} from '${root.replaceAll('\\', '/')}/dist/index.js';
createRoot(document.getElementById('root')!).render(<DesktopDocumentAdapter><DesktopClientSurface><aside className="kit-sidebar" style={{height:'100%'}}><ClientSidebar header="Navigation"><ListStack><ClientSidebarItem label="Data" selected count={12} icon={<DocumentIcon size={12}/>} actionId="data"/><ClientSidebarItem label="Very long category name for cross-team collaboration and engineering project documentation 长分类名称" count={123} icon={<DocumentIcon size={20}/>} actionId="long"/><ClientSidebarItem label="超长中文分类名称用于核对窄窗口和缩放下的导航阅读与独立统计数量" count={8} actionId="chinese"/><ClientSidebarItem label="Disabled destination" disabled actionId="disabled"/></ListStack></ClientSidebar></aside></DesktopClientSurface></DesktopDocumentAdapter>);`,
);
await build({
  entryPoints: [path.join(temp, 'fixture.tsx')],
  outfile: path.join(temp, 'app.js'),
  bundle: true,
  jsx: 'automatic',
  platform: 'browser',
  nodePaths: [path.join(root, 'node_modules')],
  define: { 'process.env.NODE_ENV': '"production"' },
});
const styles = await readFile(path.join(root, 'dist/desktop.css'));
const server = http.createServer(async (req, res) => {
  const name = new URL(req.url, 'http://localhost').pathname;
  if (name === '/app.js') {
    res.setHeader('Content-Type', 'text/javascript');
    res.end(await readFile(path.join(temp, 'app.js')));
  } else if (name === '/style.css') {
    res.setHeader('Content-Type', 'text/css');
    res.end(styles);
  } else
    res.end(
      '<html><head><link rel="stylesheet" href="/style.css"></head><body><div id="root"></div><script src="/app.js"></script></body></html>',
    );
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
let browser;
const results = [];
try {
  browser = await chromium.launch(browserOptions());
  for (const theme of ['light', 'dark'])
    for (const width of [1920, 1280, 760])
      for (const zoom of [1, 1.25]) {
        const context = await browser.newContext({ viewport: { width, height: 800 } });
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', (e) => errors.push(e.message));
        await page.goto(`http://127.0.0.1:${server.address().port}`);
        await page.getByRole('button', { name: 'Data 12' }).waitFor();
        await page.evaluate(
          ({ theme, zoom }) => {
            document.documentElement.classList.toggle('dark', theme === 'dark');
            document.documentElement.style.zoom = zoom;
          },
          { theme, zoom },
        );
        const geometry = await page.locator('.client-sidebar-link').evaluateAll((rows) =>
          rows.map((row) => {
            const bounds = row.getBoundingClientRect(),
              label = row.querySelector('.client-sidebar-label').getBoundingClientRect();
            return {
              left: label.left,
              top: bounds.top,
              bottom: bounds.bottom,
              height: parseFloat(getComputedStyle(row).height),
              scroll: row.scrollWidth,
              width: row.clientWidth,
              labelBottom: label.bottom,
              labelTop: label.top,
            };
          }),
        );
        assert.ok(
          geometry.every(
            (row) =>
              row.scroll <= row.width + 1 && row.labelBottom <= row.bottom + 1 && row.labelTop >= row.top,
          ),
        );
        assert.ok(geometry.every((row) => Math.abs(row.left - geometry[0].left) < 1));
        assert.ok(geometry[1].height > 32);
        assert.equal(geometry[0].height, 32);
        assert.equal(
          await page.getByRole('button', { name: 'Data 12' }).getAttribute('aria-current'),
          'page',
        );
        assert.equal(await page.getByRole('button', { name: 'Disabled destination' }).isDisabled(), true);
        const contrast = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
        assert.deepEqual(
          contrast.violations.map(({ id, nodes }) => ({ id, targets: nodes.map((node) => node.target) })),
          [],
          `${theme}/${width}/${zoom}: sidebar count contrast`,
        );
        for (const row of page.locator('.client-sidebar-link').all
          ? await page.locator('.client-sidebar-link').all()
          : []) {
          if (await row.isEnabled()) {
            await row.focus();
            await row.press('Enter');
          }
        }
        assert.deepEqual(errors, []);
        await page.screenshot({ path: path.join(output, `${theme}-${width}-${zoom}.png`) });
        results.push({ theme, width, zoom, geometry });
        await context.close();
      }
  await writeFile(path.join(output, 'renderer.json'), JSON.stringify({ results }, null, 2));
  console.log('PASS shared sidebar label wrapping, counts, alignment and focus: 12 renders');
} finally {
  await browser?.close();
  await new Promise((r) => server.close(r));
  if (path.dirname(temp) !== os.tmpdir() || !path.basename(temp).startsWith('desktop-sidebar-'))
    throw Error('Invalid sidebar fixture directory');
  await rm(temp, { recursive: true, force: true });
}
