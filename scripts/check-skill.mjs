import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
try {
  const {UIStringsProvider,ErrorState} = await import('../dist/index.js');
  const rendered = renderToStaticMarkup(React.createElement(UIStringsProvider,{labels:{'出现问题':'Localized error'}},React.createElement(ErrorState,{description:'Synthetic failure'})));
  assert.ok(rendered.includes('Localized error'));
  const markdown = [];
  function walk(dir) {for(const file of fs.readdirSync(dir,{withFileTypes:true})) {const target=path.join(dir,file.name); if(file.isDirectory()) walk(target); else if(file.name.endsWith('.md')) markdown.push(target);}}
  walk('skills/chatgpt-desktop-ui');
  let checked=0;
  for(const file of markdown) for(const match of fs.readFileSync(file,'utf8').matchAll(/\]\(([^)]+)\)/g)) {
    const value=match[1]; if(/^(https?:|#)/.test(value)) continue;
    assert.ok(fs.existsSync(path.resolve(path.dirname(file),value)),`${file}: ${value}`); checked++;
  }
  console.log(JSON.stringify({status:'passed',localizedDefaults:'passed',resourceLinks:checked,serverImport:'passed'}));
  fs.writeFileSync('docs/SKILL_VALIDATION.json',JSON.stringify({status:'passed',resourceLinks:checked,serverImport:'passed',localizedDefaults:'passed'},null,2)+'\n');
} catch(error) { console.error(error.stack); process.exitCode=1; }
