import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import zlib from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
if (process.version !== 'v24.19.0') throw Error('Node 24.19.0 required');
const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'desktop-fade-'));
const evidence = path.join(root, 'tests/output/scroll-edge-fade');
await fs.mkdir(evidence, { recursive: true });
// Decode browser RGB/RGBA PNGs for measured alpha-mask samples rather than checking CSS alone.
function pixels(png) {
  let cursor = 8, width, height, channels; const chunks = [];
  while (cursor < png.length) {
    const size = png.readUInt32BE(cursor), type = png.toString('ascii', cursor + 4, cursor + 8), data = png.subarray(cursor + 8, cursor + 8 + size);
    if (type === 'IHDR') { width = data.readUInt32BE(0); height = data.readUInt32BE(4); assert.equal(data[8], 8); channels = data[9] === 6 ? 4 : 3; assert.ok([2, 6].includes(data[9])); }
    if (type === 'IDAT') chunks.push(data);
    cursor += size + 12;
  }
  const raw = zlib.inflateSync(Buffer.concat(chunks)), stride = width * channels, result = Buffer.alloc(stride * height);
  let source = 0;
  const paeth = (a, b, c) => { const p = a + b - c, x = Math.abs(p - a), y = Math.abs(p - b), z = Math.abs(p - c); return x <= y && x <= z ? a : y <= z ? b : c; };
  for (let y = 0; y < height; y++) {
    const filter = raw[source++];
    for (let x = 0; x < stride; x++) {
      const i = y * stride + x, a = x >= channels ? result[i - channels] : 0, b = y ? result[i - stride] : 0, c = y && x >= channels ? result[i - stride - channels] : 0;
      result[i] = (raw[source++] + [0, a, b, Math.floor((a + b) / 2), paeth(a, b, c)][filter]) & 255;
    }
  }
  return (x, y) => [...result.subarray((y * width + x) * channels, (y * width + x) * channels + 3)];
}
await build({ absWorkingDir: root, entryPoints: ['examples/scroll-edge-fade-contract.tsx'], outdir: temp, bundle: true, format: 'esm', jsx: 'automatic', define: { 'process.env.NODE_ENV': '"production"' } });
await fs.writeFile(path.join(temp, 'utilities-input.css'), '@tailwind utilities;');
execFileSync(process.execPath, [path.join(root,'node_modules/tailwindcss/lib/cli.js'), '-i', path.join(temp,'utilities-input.css'), '-o', path.join(temp,'utilities.css'), '--content', 'examples/scroll-edge-fade-contract.tsx,src/components/radix/**/*.tsx'], {cwd:root,stdio:'pipe',windowsHide:true});
const server = http.createServer(async (req, res) => {
  const asset = req.url === '/scroll-edge-fade-contract.js' || req.url === '/scroll-edge-fade-contract.css' || req.url === '/utilities.css';
  res.setHeader('Content-Type', asset ? req.url.endsWith('.js') ? 'text/javascript' : 'text/css' : 'text/html');
  res.end(asset ? await fs.readFile(path.join(temp, req.url.slice(1))) : '<html><head><link rel="stylesheet" href="/scroll-edge-fade-contract.css"><link rel="stylesheet" href="/utilities.css"><style>.fixed-list{flex:1;min-height:0}</style></head><body><div id="root"></div><script type="module" src="/scroll-edge-fade-contract.js"></script></body></html>');
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
let browser; const cases = [];
try {
  browser = await chromium.launch({ headless: true, channel: 'msedge' });
  for (const theme of ['light', 'dark']) for (const [width, height, scale] of [[1920,1080,1],[1280,800,1],[1536,864,1.25]]) {
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: scale, colorScheme: theme });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    await page.evaluate(theme => document.documentElement.classList.toggle('dark', theme === 'dark'), theme);
    const viewport = page.getByLabel('Conversation', { exact: true });
    await viewport.evaluate(element => element.scrollTop = 600);
    const geometry = await viewport.evaluate(element => {
      const r = element.getBoundingClientRect(), dock = document.querySelector('#plain .desktop-composer-dock').getBoundingClientRect();
      return { x: r.x, y: r.y, height: element.clientHeight, bottom: r.bottom, dockTop: dock.top, padding: getComputedStyle(element).paddingBottom, ref: window.scrollRef.current === element };
    });
    assert.equal(geometry.bottom, geometry.dockTop); assert.equal(geometry.padding, '24px'); assert.equal(geometry.ref, true);
    assert.equal(await page.locator('#nested').getAttribute('data-desktop-scroll-fade'), null);
    const png = await page.screenshot({ path: path.join(evidence, `${theme}-${width}-${scale}.png`) });
    const pixel = pixels(png), x = Math.round((geometry.x + 20) * scale), edge = (geometry.y + geometry.height) * scale;
    const samples = [25, 18, 12, 6, 1].map(offset => pixel(x, Math.floor(edge - offset * scale)));
    const bg = theme === 'dark' ? [24,24,24] : [255,255,255];
    const distance = color => Math.hypot(...color.map((v, i) => v - bg[i]));
    const distances = samples.map(distance);
    assert.deepEqual(samples[0], [0,120,240]);
    for (let i = 1; i < distances.length; i++) assert.ok(distances[i] < distances[i-1], `Progressive alpha ${theme}: ${JSON.stringify(samples)}`);
    assert.ok(distances.at(-1) < distances[0] * .09, 'Bottom becomes transparent');
    // Give native tracks a diagnostic color and verify alpha masking does not fade them.
    for (const direction of ['ltr', 'rtl']) {
      await viewport.evaluate((element, direction) => {
        element.dir = direction;
        element.style.scrollbarColor = 'rgb(255, 0, 0) rgb(255, 0, 0)';
        element.querySelector('.probe').style.width = '2000px';
      }, direction);
      await page.waitForTimeout(50);
      const gutter = await viewport.evaluate(element => {
        const r = element.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height, clientLeft:element.clientLeft, vertical: element.offsetWidth-element.clientWidth, horizontal: element.offsetHeight-element.clientHeight, mask: getComputedStyle(element).maskSize, position: getComputedStyle(element).getPropertyValue('--desktop-scroll-fade-gutter-position') };
      });
      assert.ok(gutter.vertical > 0, JSON.stringify(gutter));
      assert.equal(gutter.position.trim(), direction === 'rtl' ? 'left' : 'right');
      const native = pixels(await page.screenshot());
      const gx = direction === 'rtl' ? gutter.x + gutter.vertical/2 : gutter.x + gutter.width - gutter.vertical/2;
      const track = native(Math.floor(gx*scale), Math.floor((gutter.y+gutter.height-gutter.horizontal-2)*scale));
      // Edge uses overlay tracks on this runner: an opaque probe behind a transparent track
      // must also remain opaque. Either native track paint or that probe proves preservation.
      assert.ok((track[0] > 240 && track[1] < 20 && track[2] < 20) || (track[0] === 0 && track[1] === 120 && track[2] === 240), `Scrollbar gutter remains opaque: ${JSON.stringify({direction,track,gutter})}`);
    }
    await viewport.evaluate(element => { element.dir='ltr';element.style.removeProperty('scrollbar-color');element.querySelector('.probe').style.removeProperty('width'); });
    await viewport.evaluate(element => element.scrollTop = element.scrollHeight);
    await page.getByRole('button', { name: 'Last message action', exact: true }).focus();
    assert.ok(await page.getByRole('button', { name: 'Last message action', exact: true }).evaluate(button => { const r=button.getBoundingClientRect(), v=button.closest('.desktop-internal-scroll'), b=v.getBoundingClientRect(); return r.bottom <= b.top + v.clientHeight - 24 + 1; }));
    await page.getByRole('button', { name: 'Last message action', exact: true }).click();
    assert.equal(await page.getByRole('dialog').evaluate(element => getComputedStyle(element).maskImage), 'none');
    await page.getByRole('button', { name: 'Close floating menu' }).click();
    await viewport.evaluate(element => element.scrollTop = 0);
    await page.getByRole('link', { name: 'Read source' }).click(); assert.equal(await page.evaluate(() => window.clicks), 1);
    await page.evaluate(() => { const range=document.createRange(); range.selectNodeContents(document.querySelector('.probe p')); const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range); });
    assert.match(await page.evaluate(() => window.getSelection().toString()), /stay selectable/);
    await page.getByLabel('Draft', { exact: true }).fill('One\nTwo\nThree\nFour\nFive');
    const value = await page.getByLabel('Draft', { exact: true }).inputValue();
    await page.evaluate(() => document.documentElement.classList.toggle('dark'));
    assert.equal(await page.getByLabel('Draft', { exact: true }).inputValue(), value);
    for (const label of ['Virtual conversation', 'Fixed conversation', 'Native conversation']) {
      const list = page.getByLabel(label);
      if (label === 'Virtual conversation') await page.evaluate(() => window.compatApi.current.scrollToIndex(99, 'end'));
      else if (label === 'Fixed conversation') await page.evaluate(() => window.fixedApi.current.scrollToIndex(99));
      else await list.evaluate(element => element.scrollTop = element.scrollHeight);
      await page.waitForTimeout(100);
      assert.equal(await list.getByRole('button', {name:'Message 100', exact:true}).count(), 1);
      const lastGeometry=await list.getByRole('button', {name:'Message 100', exact:true}).evaluate(button => { const v=button.closest('.desktop-internal-scroll'),r=v.getBoundingClientRect();return {bottom:button.getBoundingClientRect().bottom, readable:r.top+v.clientHeight-24,scrollTop:v.scrollTop,total:v.scrollHeight,padding:getComputedStyle(v).paddingBottom}; });
      assert.ok(lastGeometry.bottom <= lastGeometry.readable+1, JSON.stringify({label,...lastGeometry}));
    }
    await page.evaluate(() => { window.setEnabled(false); window.setShort(true); });
    await page.waitForTimeout(50); assert.equal(await viewport.evaluate(element => getComputedStyle(element).maskImage), 'none');
    await page.evaluate(() => window.setEnabled(true)); await page.waitForTimeout(50);
    assert.equal(await viewport.evaluate(element => element.scrollHeight <= element.clientHeight), true);
    assert.deepEqual(errors, []); cases.push({theme,width,height,scale,geometry,samples}); await context.close();
  }
  await fs.writeFile(path.join(evidence, 'results.json'), JSON.stringify({cases,scope:'Synthetic shared controls; emulated scale, not installed clients'}, null, 2));
  console.log('PASS six shared fade cases: measured alpha, ref, dock, nested isolation, focus, portals, selection, short content and virtual last rows');
} finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); await fs.rm(temp, {recursive:true,force:true}); }
