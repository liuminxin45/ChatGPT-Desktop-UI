import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { build } from 'esbuild';
import { chromium } from 'playwright';
const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'desktop-context-drop-'));
await build({ stdin: { contents: `import React from 'react';import{createRoot}from'react-dom/client';import{ContextAttachment,DropOverlay,DesktopDocumentAdapter,FloatingLauncher,AssistantIcon}from'./src/index';import './dist/desktop.css';createRoot(document.getElementById('root')).render(<DesktopDocumentAdapter><div data-drop-target style={{position:'relative',width:320,height:180,padding:12}}><ContextAttachment label="A long attachment title with several words and details" removeLabel="Remove attachment" removeActionId="test.remove" onRemove={()=>window.removed=true}/><DropOverlay variant="boundary" active label="Drop context"/></div><FloatingLauncher data-drop-target aria-label="Open assistant" style={{position:'absolute',left:12,top:220}}><AssistantIcon/><DropOverlay variant="boundary" label="Drop on assistant"/></FloatingLauncher><FloatingLauncher aria-label="Open assistant with glyph slot" icon={<AssistantIcon/>} iconOnly style={{position:'absolute',left:72,top:220}}/></DesktopDocumentAdapter>);`, resolveDir: process.cwd(), loader:'tsx' }, outfile:path.join(temp,'app.js'),bundle:true,format:'esm',jsx:'automatic' });
const server=http.createServer(async(req,res)=>{const name=req.url==='/app.js'?'app.js':req.url==='/app.css'?'app.css':null;res.setHeader('Content-Type',name?.endsWith('.js')?'text/javascript':name?'text/css':'text/html');res.end(name?await fs.readFile(path.join(temp,name)):'<html><head><link rel="stylesheet" href="/app.css"></head><body><div id="root"></div><script type="module" src="/app.js"></script></body></html>')});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({channel:'msedge',headless:true});
const output=path.resolve('tests/output/context-drop');await fs.mkdir(output,{recursive:true});const results=[];
try {
  for(const width of [1280,1920])for(const scale of [1,1.25])for(const theme of ['light','dark']){
    const context=await browser.newContext({viewport:{width,height:800},deviceScaleFactor:scale});const page=await context.newPage();
    await page.goto(`http://127.0.0.1:${server.address().port}`);await page.locator('.desktop-context-attachment').waitFor();await page.locator('html').evaluate((el,theme)=>{el.dataset.theme=theme;el.classList.toggle('dark',theme==='dark')},theme);
    const button=page.getByRole('button',{name:'Remove attachment'});await button.hover();
    const geometry=await button.evaluate(el=>{const a=el.getBoundingClientRect(),b=el.closest('.desktop-context-attachment').getBoundingClientRect();return{inside:a.left>=b.left&&a.right<=b.right&&a.top>=b.top&&a.bottom<=b.bottom}});assert.equal(geometry.inside,true);
    await button.focus();await button.press('Enter');assert.equal(await page.evaluate(()=>window.removed),true);
    for(const target of await page.locator('[data-drop-target]').all()){
      const geometry=await target.evaluate(el=>{const boundary=el.querySelector('.desktop-drop-boundary'),overlay=boundary.parentElement;const box=node=>node.getBoundingClientRect().toJSON();return{target:box(el),overlay:box(overlay),svg:box(boundary),rect:box(boundary.querySelector('rect')),pointerEvents:getComputedStyle(overlay).pointerEvents};});
      for(const edge of ['left','top','right','bottom'])assert.ok(Math.abs(geometry.svg[edge]-geometry.overlay[edge])<0.5,`Complete drop boundary ${edge}: ${JSON.stringify(geometry)}`);
      for(const edge of ['left','top','right','bottom'])assert.ok(Math.abs(geometry.target[edge]-geometry.rect[edge])<=4,`Perimeter encloses target ${edge}`);
      assert.equal(geometry.pointerEvents,'none');results.push({theme,width,scale,...geometry});
    }
    for(const icon of await page.locator('.desktop-floating-launcher svg:not(.desktop-drop-boundary)').all())assert.deepEqual(await icon.evaluate(el=>{const r=el.getBoundingClientRect();return [r.width,r.height]}),[20,20],'Only the action glyph has the fixed icon dimensions');
    for(const rect of await page.locator('.desktop-drop-boundary rect').all()){
      assert.equal(await rect.evaluate(el=>getComputedStyle(el).animationName),'desktop-drop-march');
      assert.equal(await rect.getAttribute('pathLength'),null,'Dashes stay in screen pixels rather than expanding with the perimeter');
      assert.equal(await rect.evaluate(el=>getComputedStyle(el).strokeDasharray),'6px, 5px');
    }
    await page.screenshot({path:path.join(output,`${theme}-${width}-${scale}.png`)});
    await page.emulateMedia({reducedMotion:'reduce'});for(const rect of await page.locator('.desktop-drop-boundary rect').all())assert.equal(await rect.evaluate(el=>getComputedStyle(el).animationName),'none');
    await context.close();
  }
  await fs.writeFile(path.join(output,'geometry.json'),JSON.stringify(results,null,2));
  console.log('Attachment containment, launcher/panel drop geometry, icon dimensions and reduced motion passed: 8 renders');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));await fs.rm(temp,{recursive:true,force:true});}
