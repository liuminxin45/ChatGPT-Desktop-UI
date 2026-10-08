import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { createGalleryServer } from './serve.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
if (process.version !== 'v24.19.0') throw Error('Node 24.19.0 required');
await mkdir(path.join(root, 'docs/gallery'), { recursive: true });
await mkdir(path.join(root, 'tests/output'), { recursive: true });
const server = createGalleryServer(); await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
let browser; const errors = [], cases = [];
try {
  const channel = process.env.UI_BROWSER_CHANNEL || 'msedge';
  browser = await chromium.launch({ headless: true, ...(channel === 'chromium' ? {} : { channel }) });
  for (const theme of ['light','dark']) for (const [width,height,scale] of [[1920,1080,1],[1280,800,1],[1536,864,1.25]]) {
    const context = await browser.newContext({ viewport: { width,height }, colorScheme: theme, deviceScaleFactor: scale });
    const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    for (const [id,label] of [['workspace','Workspace'],['chat','Chat'],['settings','Settings'],['components','Components']]) {
      await page.getByRole('button',{ name: label, exact:true }).click(); await page.waitForTimeout(180);
      if (id === 'workspace') await page.getByRole('list',{ name:'Work items' }).getByRole('listitem').first().waitFor();
      const metrics = await page.evaluate(() => {
        const rail = document.querySelector('.kit-rail'), item = rail.querySelector('[aria-current=page]'), main = document.querySelector('.kit-shell__main'), heading = document.querySelector('section:not([hidden]) .kit-settings-content');
        const bounds = element => element.getBoundingClientRect();
        return { viewport:innerWidth, titlebarHeight:bounds(document.querySelector('.kit-titlebar')).height, railWidth:bounds(rail).width, tileWidth:bounds(item).width, tileHeight:bounds(item).height, tileRadius:getComputedStyle(item).borderRadius, tileColor:getComputedStyle(item).color, tileBackground:getComputedStyle(item).backgroundColor, mainWidth:bounds(main).width, overflow:document.documentElement.scrollWidth>innerWidth, cursor:[...document.querySelectorAll('button,input,textarea,[role=combobox]')].every(element=>getComputedStyle(element).cursor==='default'), settingsWidth:heading ? bounds(heading).width : null, background:getComputedStyle(main).backgroundColor };
      });
      assert.equal(metrics.titlebarHeight,40); assert.equal(metrics.railWidth,48); assert.equal(metrics.tileWidth,32); assert.equal(metrics.tileHeight,32); assert.equal(metrics.tileRadius,'10px'); assert.equal(metrics.tileColor,'rgb(255, 255, 255)'); assert.equal(metrics.tileBackground,theme==='dark'?'rgb(48, 49, 52)':'rgb(59, 59, 59)'); assert.equal(metrics.overflow,false); assert.equal(metrics.cursor,true);
      assert.equal(metrics.background,theme==='dark'?'rgb(24, 24, 24)':'rgb(255, 255, 255)');
      if (metrics.settingsWidth) assert.ok(metrics.settingsWidth <= 720.1);
      if (id==='workspace'||id==='components') assert.equal(metrics.mainWidth,width-48);
      await page.screenshot({ path:path.join(root,width===1280?'docs/gallery':'tests/output',`${id}-${theme}-${width}.png`) });
      cases.push({page:id,theme,width,height,scale,metrics});
    }
    await context.close();
  }
  const context = await browser.newContext({viewport:{width:1280,height:800},colorScheme:'dark'}); const page = await context.newPage(); page.on('pageerror',error=>errors.push(error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  // Virtualized long lists remain bounded and reach the last row.
  const list = page.getByRole('list',{name:'Work items'}); assert.ok(await list.getByRole('listitem').count() < 100);
  await list.evaluate(element=>element.scrollTop=element.scrollHeight); await page.locator('[data-phd-item-key="99"]').waitFor();
  // Open/floating controls are keyboard reachable and collision bounded.
  await page.getByRole('button',{name:'Workspace',exact:true}).hover(); await page.getByRole('tooltip',{name:'Workspace',exact:true}).waitFor(); await page.screenshot({path:path.join(root,'docs/gallery/rail-tooltip.png')});
  await page.getByRole('button',{name:'Example account',exact:true}).click(); await page.getByRole('menu').waitFor();
  const menuBounds = await page.getByRole('menu').evaluate(element=>{const r=element.getBoundingClientRect();return{left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:innerWidth,height:innerHeight};});
  assert.ok(menuBounds.left>=0&&menuBounds.right<=menuBounds.width&&menuBounds.top>=0&&menuBounds.bottom<=menuBounds.height);
  await page.screenshot({path:path.join(root,'docs/gallery/avatar-menu.png')}); await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'Settings',exact:true}).click(); await page.getByRole('textbox',{name:'Search settings'}).fill('alert'); assert.equal(await page.locator('.kit-category').filter({hasText:'Notifications'}).count(),1); assert.equal(await page.locator('.kit-category').filter({hasText:'Appearance'}).count(),0);
  await page.getByRole('textbox',{name:'Search settings'}).fill('');
  await page.getByRole('textbox',{name:'Default workspace'}).fill('Synthetic draft');
  await page.getByRole('combobox',{name:'Theme',exact:true}).click(); await page.getByRole('option',{name:'Light',exact:true}).click(); assert.equal(await page.getByRole('textbox',{name:'Default workspace'}).inputValue(),'Synthetic draft');
  await page.getByRole('combobox',{name:'Theme',exact:true}).click(); await page.getByRole('option',{name:'Dark',exact:true}).click();
  await page.getByRole('combobox',{name:'Theme',exact:true}).click(); await page.getByRole('listbox').waitFor(); await page.waitForTimeout(180); await page.screenshot({path:path.join(root,'docs/gallery/dropdown.png')}); await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'Toggle page sidebar',exact:true}).click(); assert.equal(await page.locator('.kit-sidebar').isVisible(),false); assert.equal(await page.getByRole('textbox',{name:'Default workspace'}).inputValue(),'Synthetic draft');
  await page.getByRole('button',{name:'Toggle page sidebar',exact:true}).click(); assert.equal(await page.locator('.kit-sidebar').isVisible(),true);
  // Failed saves and close/navigation protect the same draft.
  await page.getByRole('button',{name:'Workspace',exact:true}).click(); await page.getByRole('button',{name:'New project',exact:true}).click(); await page.getByLabel('Project name').fill('Synthetic project'); await page.getByRole('button',{name:'Save',exact:true}).click(); assert.equal(await page.getByLabel('Project name').inputValue(),'Synthetic project'); assert.ok(await page.getByRole('alert').isVisible());
  await page.screenshot({path:path.join(root,'docs/gallery/dialog-failure.png')});
  await page.keyboard.press('Escape'); assert.ok(await page.getByRole('dialog',{name:'Discard changes?'}).isVisible()); await page.getByRole('button',{name:'Keep editing'}).click(); assert.equal(await page.getByLabel('Project name').inputValue(),'Synthetic project');
  for(let i=0;i<8;i++){await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>!!document.activeElement.closest('[role=dialog]')),true);}
  await page.keyboard.press('Escape'); await page.getByRole('button',{name:'Discard',exact:true}).click(); assert.equal(await page.getByRole('dialog').count(),0);
  await page.reload(); assert.equal(await page.evaluate(()=>document.documentElement.classList.contains('dark')),true);
  assert.deepEqual(errors,[]);
  await writeFile(path.join(root,'docs/VALIDATION.json'),JSON.stringify({node:process.version,status:'passed',renderCases:cases.length,cases,interactions:['virtual-list-end','keyboard-focus','theme-draft-preservation','theme-persistence','category-search','sidebar-preserves-draft','portal-collision','failed-save','discard-guard'],limitations:['Synthetic browser gallery; no native window/credential services tested.','125% uses deviceScaleFactor emulation.']},null,2)+'\n');
  console.log(JSON.stringify({status:'passed',renderCases:cases.length,interactionChecks:9})); await context.close();
} finally { await browser?.close(); await new Promise(resolve=>server.close(resolve)); }
