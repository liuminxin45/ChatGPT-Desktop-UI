import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { chromium } from 'playwright';
if(process.version!=='v24.19.0')throw Error('Use Node 24.19.0.');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'tests/output/computer-icon');await fs.mkdir(output,{recursive:true});
await build({absWorkingDir:root,entryPoints:['examples/icon-actions.tsx'],outdir:output,bundle:true,platform:'browser',jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'}});
const server=http.createServer(async(req,res)=>{
  if(['/icon-actions.js','/icon-actions.css'].includes(req.url)){res.setHeader('Content-Type',req.url.endsWith('.js')?'text/javascript':'text/css');res.end(await fs.readFile(path.join(output,req.url.slice(1))));}
  else {res.setHeader('Content-Type','text/html');res.end('<!doctype html><html><head><link rel="stylesheet" href="/icon-actions.css"></head><body><div id="root"></div><script src="/icon-actions.js"></script></body></html>');}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({channel:'msedge',headless:true}),checks=[],errors=[];
try{
  for(const theme of ['light','dark'])for(const width of [1920,1280,390,320]){
    const context=await browser.newContext({colorScheme:theme,viewport:{width,height:800},deviceScaleFactor:width===1280?1.25:1});
    const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    const button=page.getByRole('button',{name:'Switch computer',exact:true});await button.waitFor();
    assert.equal(await button.locator('svg.lucide-monitor rect').count(),1);
    const bounds=await button.boundingBox();await button.hover();assert.deepEqual(await button.boundingBox(),bounds);
    await page.mouse.down();assert.deepEqual(await button.boundingBox(),bounds);await page.mouse.up();
    // Clicking already focused the trigger and closed its tooltip. Move focus
    // away first so this checks an actual keyboard focus transition.
    await page.mouse.move(0,0);await page.keyboard.press('Tab');await button.focus();await page.getByRole('tooltip',{name:'Switch computer',exact:true}).waitFor();
    await page.screenshot({path:path.join(output,`${width}-${theme}.png`)});checks.push(`${width} ${theme}: computer glyph, accessible name, tooltip and stable hover/press geometry`);
    await context.close();
  }
  assert.deepEqual(errors,[]);await fs.writeFile(path.join(output,'verification.json'),JSON.stringify({checks,errors},null,2));console.log(JSON.stringify({checks:checks.length,errors}));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
