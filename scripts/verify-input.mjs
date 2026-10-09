import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { chromium } from 'playwright';

if (process.version !== 'v24.19.0') throw Error('Node 24.19.0 required');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'desktop-kit-input-'));
const evidence = process.env.DESKTOP_UI_EVIDENCE_DIR || path.join(root, 'tests/output/input');
await fs.mkdir(evidence, { recursive: true });
await build({ absWorkingDir: root, entryPoints: ['examples/input-contract.tsx'], outdir: temp, bundle: true, format: 'esm', platform: 'browser', jsx: 'automatic', define: { 'process.env.NODE_ENV': '"production"' } });
const server = http.createServer(async (req, res) => {
  const asset = req.url === '/input-contract.js' || req.url === '/input-contract.css';
  res.setHeader('Content-Type', asset ? req.url.endsWith('.js') ? 'text/javascript' : 'text/css' : 'text/html');
  res.end(asset ? await fs.readFile(path.join(temp, req.url.slice(1))) : '<html><head><link rel="stylesheet" href="/input-contract.css"></head><body><div id="root"></div><script type="module" src="/input-contract.js"></script></body></html>');
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
let browser;
const results = [];
try {
  const channel = process.env.UI_BROWSER_CHANNEL || 'msedge';
  browser = await chromium.launch({ headless: true, ...(channel === 'chromium' ? {} : { channel }) });
  for (const theme of ['light', 'dark']) for (const [width, height, scale] of [[1920,1080,1],[1280,800,1],[1536,864,1.25]]) {
    const context = await browser.newContext({ colorScheme: theme, viewport: { width, height }, deviceScaleFactor: scale });
    const page = await context.newPage(); const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    const count = key => page.evaluate(key => window.inputContract[key] || 0, key);
    await page.getByLabel('Form field').fill('Example');
    await page.getByLabel('Form notes').fill('First'); await page.getByLabel('Form notes').press('Shift+Enter'); await page.keyboard.type('Second');
    assert.equal(await page.getByLabel('Form notes').inputValue(), 'First\nSecond'); assert.equal(await count('form'), 0);
    await page.getByLabel('Form notes').press('Enter'); assert.equal(await count('form'), 1);
    for (const label of ['Scoped name', 'Host name', 'Host notes', 'Native notes', 'Rich notes']) {
      const field = page.getByLabel(label); await field.fill('Draft'); await field.focus();
      const before = await count('scope');
      for (const init of [{isComposing:true},{keyCode:229},{repeat:true}]) await field.dispatchEvent('keydown', {key:'Enter',code:'Enter',bubbles:true,...init});
      assert.equal(await count('scope'), before, label + ' IME/repeat');
      await field.press('Shift+Enter'); await field.press('Control+Enter'); assert.equal(await count('scope'), before);
      const focus = await field.evaluate(element => { const s=getComputedStyle(element); return {shadow:s.boxShadow,outline:s.outlineStyle}; });
      assert.equal(focus.outline, 'none'); assert.ok(focus.shadow === 'none' || focus.shadow.includes('inset')); assert.ok(!focus.shadow.includes('56, 124, 244') && !focus.shadow.includes('67, 139, 250'));
      await field.press('Enter'); assert.equal(await count('scope'), before + 1, label + ' confirm exactly once');
    }
    await page.getByRole('button', {name:'Toggle disabled'}).click(); const before = await count('scope');
    await page.getByLabel('Scoped name').press('Enter'); assert.equal(await count('scope'), before);
    await page.getByLabel('Nested filter').press('Enter'); assert.equal(await count('scope'), before);
    await page.getByLabel('Ambiguous field').press('Enter'); assert.equal(await count('first'), 0); assert.equal(await count('second'), 0);
    await page.getByLabel('Hidden action field').press('Enter'); assert.equal(await count('hidden'), 0);
    await page.getByLabel('Read only').press('Enter'); assert.equal(await page.getByLabel('Read only').inputValue(), 'Read only content');
    await page.getByLabel('Portal field').press('Enter'); assert.equal(await count('portal'), 1);
    await page.getByLabel('Live filter').press('Enter'); assert.equal(await page.getByLabel('Live filter').evaluate(element => document.activeElement === element), false);
    for(const label of ['Live filter','Legacy filter']){const field=page.getByLabel(label);await field.focus();assert.equal(await field.evaluate(e=>getComputedStyle(e.parentElement).boxShadow),'none');}
    const message = page.getByLabel('Message', {exact:true});
    await message.fill('First'); await message.press('Shift+Enter'); await page.keyboard.type('Second');
    assert.equal(await message.inputValue(), 'First\nSecond'); assert.equal(await count('send'), 0);
    await message.press('Enter'); assert.equal(await count('send'), 1); assert.equal(await message.inputValue(), '');
    await message.fill('Focused message');
    const geometry = await page.locator('.desktop-composer').first().evaluate(element => ({radius:getComputedStyle(element).borderRadius,shadow:getComputedStyle(element).boxShadow}));
    assert.equal(geometry.radius, '16px'); assert.equal(geometry.shadow, 'none');
    const shared = page.getByRole('textbox', { name: 'Shared composer', exact: true });
    assert.equal(await page.getByRole('button', { name: 'Send sample', exact: true }).isEnabled(), false);
    await shared.fill('A shared draft');
    for (const init of [{isComposing:true},{keyCode:229},{repeat:true}]) await shared.dispatchEvent('keydown', {key:'Enter',code:'Enter',bubbles:true,...init});
    assert.equal(await count('clientSend'), 0);
    await shared.press('Shift+Enter'); await page.keyboard.type('Second line');
    assert.equal(await shared.inputValue(), 'A shared draft\nSecond line');
    await shared.press('Enter'); assert.equal(await count('clientSend'), 1);
    await shared.press('Enter'); assert.equal(await count('clientSend'), 1); assert.equal(await count('clientStop'), 0);
    await page.getByRole('button', { name: 'Stop sample', exact: true }).click();
    assert.equal(await count('clientStop'), 1); assert.equal(await shared.inputValue(), 'A shared draft\nSecond line');
    await shared.fill(Array(30).fill('Long multiline draft').join('\n'));
    assert.equal(await shared.evaluate(element => element.clientHeight), 200);
    assert.equal(await shared.evaluate(element => getComputedStyle(element).overflowY), 'auto');
    assert.deepEqual(errors, []);
    await page.screenshot({path:path.join(evidence,`input-${theme}-${width}.png`)});
    results.push({theme,width,height,scale,geometry}); await context.close();
  }
  await fs.writeFile(path.join(evidence, 'input-results.json'), JSON.stringify({node:process.version,results},null,2));
  console.log('PASS text input confirmation, IME, repeats, scopes, portals, disabled state, neutral focus and 6 themed renders');
} finally {
  await browser?.close(); await new Promise(resolve => server.close(resolve));
  // This fixture owns this exact root; no consumer data or shared runtime is inside it.
  await fs.rm(temp, {recursive:true,force:true});
}
