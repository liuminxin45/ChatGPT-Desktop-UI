import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { chromium } from 'playwright';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'), output=path.join(root,'tests/output/dialog-search');
await fs.mkdir(output,{recursive:true});
await build({absWorkingDir:root,entryPoints:['examples/dialog-search.tsx'],outdir:output,bundle:true,platform:'browser',jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'}});
const server=http.createServer(async(req,res)=>{if(['/dialog-search.js','/dialog-search.css'].includes(req.url)){res.setHeader('Content-Type',req.url.endsWith('.js')?'text/javascript':'text/css');res.end(await fs.readFile(path.join(output,req.url.slice(1))))}else{res.setHeader('Content-Type','text/html');res.end('<!doctype html><html><head><link rel="stylesheet" href="/dialog-search.css"></head><body><div id="root"></div><script src="/dialog-search.js"></script></body></html>')}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({channel:'msedge',headless:true}), checks=[], errors=[];
try{
 for(const theme of ['light','dark'])for(const width of [1920,1280,390,320]){
  const context=await browser.newContext({viewport:{width,height:800},colorScheme:theme,deviceScaleFactor:width===1280?1.25:1});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(`http://127.0.0.1:${server.address().port}`);
  await page.getByRole('button',{name:'Search',exact:true}).click();const dialog=page.getByRole('dialog',{name:'Search chats',exact:true}), input=dialog.getByRole('combobox');await input.waitFor();assert(await input.evaluate(el=>el===document.activeElement));
  await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter');await page.waitForFunction(()=>document.querySelector('output').textContent==='Second conversation');assert.equal(await dialog.count(),0);
  await page.getByRole('button',{name:'Search',exact:true}).click();await input.fill('no-match');await dialog.getByText('No results').waitFor();await input.fill('');
  await page.screenshot({path:path.join(output,`${width}-${theme}-search.png`)});await page.keyboard.press('Escape');assert(await page.getByRole('button',{name:'Search',exact:true}).evaluate(el=>el===document.activeElement));
  await page.getByRole('button',{name:'Edit',exact:true}).click();const form=page.getByRole('dialog',{name:'Edit connection',exact:true});await form.getByRole('textbox',{name:'Name'}).fill('retained draft');
  const types=await form.evaluate(el=>Object.fromEntries(['.desktop-dialog__title','.desktop-dialog__body h2','.desktop-dialog__body small'].map(sel=>[sel,getComputedStyle(el.querySelector(sel)).fontSize])));
  assert.equal(types['.desktop-dialog__title'],'17px');assert.equal(types['.desktop-dialog__body h2'],'14px');assert.equal(types['.desktop-dialog__body small'],'12px');
  await form.getByRole('combobox',{name:'Client'}).click();await page.keyboard.press('Escape');assert(await form.isVisible());await page.screenshot({path:path.join(output,`${width}-${theme}-form.png`)});await page.keyboard.press('Escape');await page.getByRole('button',{name:'Edit',exact:true}).click();assert.equal(await form.getByRole('textbox',{name:'Name'}).inputValue(),'retained draft');await page.keyboard.press('Escape');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await context.close();checks.push(`${width} ${theme}: prepared package, search keyboard/focus, hierarchy, nested Escape and retained draft`);
 }
 assert.deepEqual(errors,[]);await fs.writeFile(path.join(output,'verification.json'),JSON.stringify({checks,errors},null,2));console.log(JSON.stringify({checks:checks.length,errors}));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve))}
