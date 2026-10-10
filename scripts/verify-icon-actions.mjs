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
const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'desktop-kit-icon-actions-'));
const evidence = process.env.DESKTOP_UI_EVIDENCE_DIR || path.join(root, 'tests/output/icon-actions');
await fs.mkdir(evidence, {recursive:true});
await build({absWorkingDir:root,entryPoints:['examples/icon-actions.tsx'],outdir:temp,bundle:true,platform:'browser',jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'}});
const server = http.createServer(async(req,res)=>{
  const asset = ['/icon-actions.js','/icon-actions.css'].includes(req.url);
  res.setHeader('Content-Type',asset ? req.url.endsWith('.js')?'text/javascript':'text/css' : 'text/html');
  res.end(asset ? await fs.readFile(path.join(temp,req.url.slice(1))) : '<html><head><link rel="stylesheet" href="/icon-actions.css"></head><body><div id="root"></div><script src="/icon-actions.js"></script></body></html>');
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
let browser;
try {
  const channel=process.env.UI_BROWSER_CHANNEL || 'msedge';
  browser = await chromium.launch({headless:true,...(channel==='chromium'?{}:{channel})});
  for(const theme of ['light','dark']) for(const [width,height,scale] of [[1920,1080,1],[1280,800,1],[1536,864,1.25]]) {
    const context = await browser.newContext({colorScheme:theme,viewport:{width,height},deviceScaleFactor:scale});
    const page = await context.newPage(), errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    const note = page.getByRole('textbox', { name: 'Growing note' });
    const initialHeight = (await note.boundingBox()).height;
    await note.fill(Array.from({length:20}, () => 'A long action with readable wrapping.').join('\n'));
    assert.ok((await note.boundingBox()).height > initialHeight * 3);
    assert.ok(await note.evaluate(e => e.scrollHeight <= e.clientHeight + 1));
    await note.fill('Short');
    assert.ok((await note.boundingBox()).height <= initialHeight + 1);
    await page.getByRole('button', {name:'Attach file',exact:true}).focus();
    await page.getByRole('tooltip', {name:'Attach file',exact:true}).waitFor();
    await page.getByRole('button', {name:'Mark complete',exact:true}).waitFor();
    await page.getByRole('button', {name:'Collection actions',exact:true}).click();
    assert.equal(await page.locator('body').getAttribute('data-collection-open'), 'true');
    await page.getByRole('menuitem', {name:'Full collection',exact:true}).waitFor();
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => document.body.dataset.collectionOpen === 'false');
    assert.equal(await page.locator('body').getAttribute('data-collection-open'), 'false');
    for (const name of ['Confirm and submit', 'AI review', '3 replies', 'Tasks', 'Forward']) {
      const button = page.getByRole('button', {name, exact:true});
      assert.equal(await button.textContent(), name);
      assert.equal(await button.evaluate(e=>e.classList.contains('desktop-button--icon')), false);
      assert.equal(await button.locator('svg').count(), 1);
    }
    assert.equal(await page.locator('[data-desktop-action="fixture.reply"] .desktop-action-badge').count(), 0);
    for(const name of ['Show fields','Create new node','Save']) {
      const button=page.getByRole('button',{name,exact:true});
      assert.equal(await button.evaluate(e=>e.textContent.includes(e.getAttribute('aria-label'))),false);
      const box=await button.boundingBox(); assert.equal(box.width,36); assert.equal(box.height,36);
      await button.hover(); await page.getByRole('tooltip',{name,exact:true}).waitFor();
    }
    await page.getByRole('button',{name:'Create new node',exact:true}).click();
    assert.equal(await page.locator('[data-desktop-action="fixture.node.create"] .desktop-action-badge').textContent(),'3');
    assert.equal(await page.getByRole('status').textContent(),'1');
    await page.getByRole('button',{name:'Save',exact:true}).click();
    const disabled=page.getByRole('button',{name:'Saving',exact:true}); assert.equal(await disabled.isDisabled(),true);
    await page.mouse.move(0,0); await disabled.locator('..').hover(); await page.getByRole('tooltip',{name:'Saving',exact:true}).waitFor();
    await page.getByRole('button',{name:'Reset',exact:true}).click();
    await page.getByRole('button',{name:'Show fields',exact:true}).focus(); await page.getByRole('tooltip',{name:'Show fields',exact:true}).waitFor();
    await page.getByRole('button',{name:'Send',exact:true}).hover(); await page.getByRole('tooltip',{name:'Send',exact:true}).waitFor();
    await page.getByLabel('API Token',{exact:true}).fill('isolated-fixture');
    assert.equal(await page.getByLabel('API Token',{exact:true}).inputValue(),'isolated-fixture');
    await page.getByRole('button',{name:'Inner label',exact:true}).hover(); await page.getByRole('tooltip',{name:'Outer label',exact:true}).waitFor(); assert.equal(await page.getByRole('tooltip').count(),1);
    await page.getByRole('button',{name:'Menu',exact:true}).click(); const item=page.getByRole('menuitem',{name:'Delete',exact:true});
    assert.equal(await item.textContent(), 'Delete');
    assert.ok((await item.boundingBox()).width > 100);
    await page.getByRole('menuitem',{name:'Manage account',exact:true}).focus();
    assert.match(await page.locator('[data-desktop-action="fixture.menu.settings"]').textContent(), /Settings.*Ctrl\+,/);
    await page.keyboard.press('d'); await page.waitForFunction(()=>document.activeElement?.getAttribute('data-desktop-action')==='fixture.menu.delete');
    await page.keyboard.press('Enter');
    assert.equal(await page.getByRole('status').textContent(),'2');
    await page.getByRole('button',{name:'Surface action',exact:true}).hover(); await page.getByRole('tooltip',{name:'Surface action',exact:true}).waitFor();
    await page.getByRole('button',{name:'Hide surface',exact:true}).click(); assert.equal(await page.getByRole('tooltip',{name:'Surface action',exact:true}).count(),0);
    await page.getByRole('button',{name:'Language',exact:true}).click();
    await page.getByRole('button',{name:'显示字段',exact:true}).hover(); await page.getByRole('tooltip',{name:'显示字段',exact:true}).waitFor();
    assert.equal(await page.getByRole('link',{name:'Download',exact:true}).getAttribute('href'),'#download');
    assert.deepEqual(errors,[]);
    await page.getByRole('button',{name:'Menu',exact:true}).click();
    await page.screenshot({path:path.join(evidence,`actions-${theme}-${width}.png`)});
    await context.close();
  }
  console.log('PASS action labels: 6 themed/scaled renders, visible menus/shortcuts/workflows/counts/views, explicit compact controls, hover/focus, busy states, typeahead, one invocation and retained Surface visibility');
} finally {
  await browser?.close(); await new Promise(r=>server.close(r));
  await fs.rm(temp,{recursive:true,force:true});
}
