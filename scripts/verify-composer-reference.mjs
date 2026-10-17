import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import {build} from 'esbuild';
import {chromium} from 'playwright';
if(process.version!=='v24.19.0')throw Error('Node 24.19.0 required');
const root=process.cwd(),temp=await fs.mkdtemp(path.join(os.tmpdir(),'composer-reference-')),out=path.join(root,'tests/output/composer-reference');
await fs.mkdir(out,{recursive:true});
await build({entryPoints:['examples/composer-reference.tsx'],outdir:temp,bundle:true,format:'esm',jsx:'automatic',logOverride:{'ignored-bare-import':'silent'},define:{'process.env.NODE_ENV':'"production"'},plugins:[{name:'prepared-kit',setup(b){b.onResolve({filter:/^\.\.\/src$/},()=>({path:path.join(root,'dist/index.js')}));b.onResolve({filter:/^\.\.\/src\/desktop\.css$/},()=>({path:path.join(root,'dist/desktop.css')}));}}]});
const server=http.createServer(async(req,res)=>{
 const name=req.url.split('?')[0],asset=['/composer-reference.js','/composer-reference.css'].includes(name);
 res.setHeader('Content-Type',asset?(name.endsWith('.js')?'text/javascript':'text/css'):'text/html');
 res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; base-uri 'none'");
 res.end(asset?await fs.readFile(path.join(temp,name.slice(1))):'<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/composer-reference.css"></head><body><div id="root"></div><script type="module" src="/composer-reference.js"></script></body></html>');
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({channel:process.env.UI_BROWSER_CHANNEL || 'msedge',headless:true}),cases=[];
try{
 for(const theme of ['light','dark'])for(const [width,height,scale] of [[1920,1080,1],[1280,800,1],[1280,800,1.25],[499,600,1],[390,844,1],[320,700,1]]){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:scale,isMobile:width<768}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  await page.goto(`http://127.0.0.1:${server.address().port}/?theme=${theme}`);
  await page.getByRole('textbox',{name:'Draft'}).waitFor();
  await page.waitForFunction(t=>document.documentElement.classList.contains('dark')===(t==='dark'),theme);
  assert((await page.locator('.reference-page').evaluate(e=>getComputedStyle(e).fontFamily)).includes('system-ui'));
  assert.equal(await page.locator('.desktop-composer-surface').evaluate(e=>getComputedStyle(e).backgroundColor),theme==='dark'?'rgb(54, 54, 54)':'rgb(255, 255, 255)');
  const geometry=await page.evaluate(()=>{
   const r=s=>{const b=document.querySelector(s).getBoundingClientRect();return {x:b.x,y:b.y,w:b.width,h:b.height}};
   return {editor:r('.desktop-composer-surface-editor'),toolbar:r('.desktop-composer-surface-toolbar'),add:r('[aria-label="Add attachments"]'),permission:r('#permission'),model:r('#model'),action:r('[data-composer-state]'),overflow:document.documentElement.scrollWidth>innerWidth};
  });
  assert(!geometry.overflow);assert(geometry.editor.y<geometry.toolbar.y);assert(geometry.add.x<geometry.permission.x);assert(geometry.permission.x<geometry.model.x);assert(geometry.model.x<geometry.action.x);
  const name=`${theme}-${width}-${scale}`;
  await page.locator('.reference-composer').screenshot({path:path.join(out,`${name}.png`)});
  const box=async()=>page.locator('.desktop-composer-surface-toolbar').evaluate(e=>JSON.stringify([...e.querySelectorAll('button,svg')].map(n=>{const r=n.getBoundingClientRect();return [r.x,r.y,r.width,r.height]})));
  const before=await box();await page.getByRole('button',{name:'Add attachments',exact:true}).hover();assert.equal(await box(),before);
  await page.getByRole('button',{name:'More message actions',exact:true}).click();await page.getByRole('menuitem',{name:'Edit message'}).waitFor();
  await page.screenshot({path:path.join(out,`${name}-menu.png`)});await page.keyboard.press('Escape');
  await page.getByRole('combobox',{name:'Permissions',exact:true}).click();await page.getByRole('option',{name:'Read only',exact:true}).click();
  assert.equal(await page.getByLabel('Outcome').textContent(),'none');
  await page.getByRole('combobox',{name:'Model',exact:true}).click();await page.getByRole('option',{name:'GPT-6 Astra',exact:true}).click();
  await page.getByRole('combobox',{name:'Reasoning',exact:true}).click();await page.getByRole('option',{name:'High',exact:true}).click();
  assert.equal(await page.getByLabel('Outcome').textContent(),'none');
  await page.getByRole('textbox',{name:'Draft'}).fill(Array.from({length:40},(_,i)=>`Draft line ${i}: retain all input`).join('\n'));
  const input=await page.getByRole('textbox',{name:'Draft'}).evaluate(e=>({h:e.clientHeight,scroll:e.scrollHeight,overflow:getComputedStyle(e).overflowY}));
  assert(input.scroll>input.h&&input.h<=200&&input.overflow==='auto');
  await page.locator('.reference-composer').screenshot({path:path.join(out,`${name}-long.png`)});
  await page.getByRole('button',{name:'More message actions',exact:true}).click();await page.getByRole('menuitem',{name:'Edit message',exact:true}).click();
  assert.equal(await page.getByRole('textbox',{name:'Draft'}).inputValue(),'干得不错，继续加油');assert.equal(await page.getByLabel('Outcome').textContent(),'edited');
  await page.getByRole('button',{name:'Stop generating',exact:true}).click();assert.equal(await page.getByLabel('Outcome').textContent(),'stopped');
  assert.deepEqual(errors,[]);cases.push({theme,width,height,scale,geometry,input});await context.close();
 }
 const c=await browser.newContext({reducedMotion:'reduce'}),p=await c.newPage();await p.goto(`http://127.0.0.1:${server.address().port}/?theme=dark`);await p.locator('.desktop-ai-activity').waitFor();assert.equal(await p.locator('.desktop-ai-activity').evaluate(e=>getComputedStyle(e).animationName),'none');await c.close();
 await fs.writeFile(path.join(out,'results.json'),JSON.stringify({passed:true,cases,source:'User-provided 499x173 capture; OS scale and ChatGPT build unverified',realHostWrites:false},null,2));console.log(JSON.stringify({passed:true,cases:cases.length}));
}finally{await browser.close();server.close();await fs.rm(temp,{recursive:true,force:true});}
