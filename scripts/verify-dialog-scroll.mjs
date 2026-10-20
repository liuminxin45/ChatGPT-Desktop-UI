import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import { build } from 'esbuild';
import { chromium } from 'playwright';

const root = process.cwd(), output = path.join(root, 'tests/output/dialog-scroll');
await fs.mkdir(output, { recursive: true });
await build({
  stdin: {
    resolveDir: root, loader: 'tsx', contents: `
import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {DesktopRoot,Button,Dialog,Input} from './dist/index.js';
import './dist/desktop.css';
function Fixture(){const [open,setOpen]=useState(false);return <DesktopRoot><main id="viewport" className="fixture-scroll"><div id="before" className="fixture-before"/><Button onClick={()=>setOpen(true)}>Open</Button><div className="fixture-after"/><Dialog open={open} onClose={()=>setOpen(false)} title="Inspect"><Input aria-label="Draft" defaultValue="Retained"/></Dialog></main></DesktopRoot>}
createRoot(document.getElementById('root')).render(<Fixture/>);`,
  },
  outfile: path.join(output, 'app.js'), bundle: true, format: 'esm', jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"production"' },
});
await fs.appendFile(path.join(output, 'app.css'), '\n.fixture-scroll{height:100vh;overflow:auto;overflow-anchor:none}.fixture-before{height:1400px}.fixture-before.moved{height:3200px}.fixture-after{height:3000px}');
const server = http.createServer(async (req, res) => {
  const asset = ['/app.js', '/app.css'].includes(req.url);
  res.setHeader('Content-Type', asset ? (req.url.endsWith('.js') ? 'text/javascript' : 'text/css') : 'text/html');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; base-uri 'none'");
  res.end(asset ? await fs.readFile(path.join(output, req.url.slice(1))) : '<!doctype html><html><head><link rel="stylesheet" href="/app.css"></head><body><div id="root"></div><script type="module" src="/app.js"></script></body></html>');
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const browser = await chromium.launch({ channel: 'msedge', headless: true }), checks = [], errors = [];
try {
  for (const theme of ['light', 'dark']) for (const width of [1920, 1280, 390, 320]) {
    const context = await browser.newContext({ viewport: { width, height: 800 }, colorScheme: theme, deviceScaleFactor: width === 1280 ? 1.25 : 1 });
    const page = await context.newPage();page.on('pageerror', error => errors.push(error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    const viewport = page.locator('#viewport'), trigger = page.getByRole('button', { name: 'Open', exact: true });
    await trigger.waitFor();await viewport.evaluate(element => { element.scrollTop = 1100; });
    await trigger.click();await page.getByRole('textbox', { name: 'Draft', exact: true }).waitFor();
    assert(await page.getByRole('textbox', { name: 'Draft' }).evaluate(element => element === document.activeElement));
    await page.evaluate(() => document.getElementById('before').classList.add('moved'));
    const before = await viewport.evaluate(element => element.scrollTop);
    await page.keyboard.press('Escape');await page.getByRole('dialog').waitFor({ state: 'detached' });
    await page.waitForTimeout(150);
    assert(await trigger.evaluate(element => element === document.activeElement));
    assert.equal(await viewport.evaluate(element => element.scrollTop), before, `${width} ${theme}: focus restoration scrolled the background`);
    await page.screenshot({ path: path.join(output, `${width}-${theme}-return.png`) });
    checks.push(`${width} ${theme}: prepared Dialog restores focus without scrolling after background layout changes`);
    await context.close();
  }
  assert.deepEqual(errors, []);
  await fs.writeFile(path.join(output, 'verification.json'), JSON.stringify({ checks, errors, realDeviceTested: false }, null, 2));
  console.log(JSON.stringify({ checks: checks.length, errors }));
} finally { await browser.close();await new Promise(resolve => server.close(resolve)); }
