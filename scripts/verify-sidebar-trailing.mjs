import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { build } from 'esbuild';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const root = path.resolve(new URL('..', import.meta.url).pathname.replace(/^\/(?:([A-Z]:))/i, '$1'));
const temp = await mkdtemp(path.join(os.tmpdir(), 'desktop-sidebar-trailing-'));
const fixture = `import React from 'react';import {createRoot} from 'react-dom/client';import {ClientSidebarItem,DesktopClientSurface,DesktopDocumentAdapter,DocumentIcon} from '${root.replaceAll('\\', '/')}/dist/index.js';
createRoot(document.getElementById('root')).render(<DesktopDocumentAdapter><DesktopClientSurface><aside style={{width:260}}><ClientSidebarItem label="A very long conversation name for truncation" icon={<DocumentIcon/>} selected actionId="fixture" count={<span aria-label="Pinned, two mentions, draft">📌 @2 ✎</span>}/></aside></DesktopClientSurface></DesktopDocumentAdapter>);`;
await writeFile(path.join(temp, 'fixture.tsx'), fixture);
await build({ entryPoints: [path.join(temp, 'fixture.tsx')], outfile: path.join(temp, 'app.js'), bundle: true, jsx: 'automatic', platform: 'browser', nodePaths: [path.join(root, 'node_modules')], define: { 'process.env.NODE_ENV': '"production"' }, logLevel: 'error' });
const css = await readFile(path.join(root, 'dist/desktop.css'));
const server = http.createServer(async (req, res) => {
  if (req.url === '/app.js') { res.setHeader('Content-Type', 'text/javascript'); res.end(await readFile(path.join(temp, 'app.js'))); }
  else if (req.url === '/style.css') { res.setHeader('Content-Type', 'text/css'); res.end(css); }
  else res.end('<html><head><link rel="stylesheet" href="/style.css"></head><body><div id="root"></div><script src="/app.js"></script></body></html>');
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
let browser;
const results = [];
try {
  browser = await chromium.launch({ channel: 'msedge', headless: true });
  for (const theme of ['light', 'dark']) for (const width of [1280, 760]) for (const zoom of [1, 1.25]) {
    const context = await browser.newContext({ viewport: { width, height: 800 } });
    const page = await context.newPage();
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    await page.evaluate(({ theme, zoom }) => { document.documentElement.classList.toggle('dark', theme === 'dark'); document.documentElement.style.zoom = String(zoom); }, { theme, zoom });
    const button = page.getByRole('button', { name: 'A very long conversation name for truncation Pinned, two mentions, draft' });
    await button.waitFor();
    const geometry = await button.evaluate(node => {
      const row = node.getBoundingClientRect(), label = node.querySelector('.client-sidebar-label').getBoundingClientRect(), count = node.querySelector('.client-sidebar-count').getBoundingClientRect();
      return { row: { left: row.left, right: row.right }, label: { left: label.left, right: label.right }, count: { left: count.left, right: count.right }, overflow: node.scrollWidth - node.clientWidth };
    });
    assert.ok(geometry.overflow <= 1 && geometry.count.right <= geometry.row.right + 1 && geometry.label.right <= geometry.count.left + 1, JSON.stringify(geometry));
    assert.equal(await button.getAttribute('aria-current'), 'page');
    await button.focus();
    assert.equal(await button.evaluate(node => node === document.activeElement), true);
    const contrast = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
    assert.deepEqual(contrast.violations.map(({ id }) => id), []);
    results.push({ theme, width, zoom, geometry });
    await context.close();
  }
  console.log(JSON.stringify({ passed: true, results }));
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
  if (path.dirname(temp) !== os.tmpdir() || !path.basename(temp).startsWith('desktop-sidebar-trailing-')) throw Error('INVALID_FIXTURE_ROOT');
  await rm(temp, { recursive: true, force: true });
}
