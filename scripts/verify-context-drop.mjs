import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { build } from 'esbuild';
import { chromium } from 'playwright';
const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'desktop-context-drop-'));
await build({ stdin: { contents: `import React from 'react';import{createRoot}from'react-dom/client';import{ContextAttachment,DropOverlay,DesktopDocumentAdapter}from'./src/index';import './dist/desktop.css';createRoot(document.getElementById('root')).render(<DesktopDocumentAdapter><div style={{position:'relative',width:320,height:180,padding:12}}><ContextAttachment label="A long attachment title with several words and details" removeLabel="Remove attachment" removeActionId="test.remove" onRemove={()=>window.removed=true}/><DropOverlay variant="boundary" active label="Drop context"/></div></DesktopDocumentAdapter>);`, resolveDir: process.cwd(), loader:'tsx' }, outfile:path.join(temp,'app.js'),bundle:true,format:'esm',jsx:'automatic' });
const server=http.createServer(async(req,res)=>{const name=req.url==='/app.js'?'app.js':req.url==='/app.css'?'app.css':null;res.setHeader('Content-Type',name?.endsWith('.js')?'text/javascript':name?'text/css':'text/html');res.end(name?await fs.readFile(path.join(temp,name)):'<html><head><link rel="stylesheet" href="/app.css"></head><body><div id="root"></div><script type="module" src="/app.js"></script></body></html>')});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({channel:'msedge',headless:true});
try {
  for(const width of [1280,1920])for(const scale of [1,1.25])for(const theme of ['light','dark']){
    const context=await browser.newContext({viewport:{width,height:800},deviceScaleFactor:scale});const page=await context.newPage();
    await page.goto(`http://127.0.0.1:${server.address().port}`);await page.locator('.desktop-context-attachment').waitFor();await page.locator('html').evaluate((el,theme)=>el.dataset.theme=theme,theme);
    const button=page.getByRole('button',{name:'Remove attachment'});await button.hover();
    const geometry=await button.evaluate(el=>{const a=el.getBoundingClientRect(),b=el.closest('.desktop-context-attachment').getBoundingClientRect();return{inside:a.left>=b.left&&a.right<=b.right&&a.top>=b.top&&a.bottom<=b.bottom}});assert.equal(geometry.inside,true);
    await button.focus();await button.press('Enter');assert.equal(await page.evaluate(()=>window.removed),true);
    assert.equal(await page.locator('.desktop-drop-boundary rect').evaluate(el=>getComputedStyle(el).animationName),'desktop-drop-march');
    await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('.desktop-drop-boundary rect').evaluate(el=>getComputedStyle(el).animationName),'none');
    await context.close();
  }
  console.log('Attachment hover/focus containment, removal and drop motion passed: 8 renders');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));await fs.rm(temp,{recursive:true,force:true});}
