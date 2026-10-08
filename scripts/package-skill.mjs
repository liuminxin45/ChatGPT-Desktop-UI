import { cp, mkdir, readFile, writeFile, access, unlink } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const skill = path.join(root,'skills/chatgpt-desktop-ui');
await access(path.join(root,'dist/index.js'));
await mkdir(path.join(skill,'references'),{recursive:true});
// Retire previously generated official crops from this managed package only.
async function removeRetiredReferences(directory) {
  for (const file of ['boundary-free-select.png','navigation-selected.png','navigation-tooltip.png']) {
    try { await unlink(path.join(directory,'references/references',file)); }
    catch(error) { if(error.code !== 'ENOENT') throw error; }
  }
}
await removeRetiredReferences(skill);
await cp(path.join(root,'docs/VALIDATION.json'),path.join(skill,'references/VALIDATION.json'));
for(const [from,to] of [['DESIGN_SYSTEM.md','design-system.md'],['DESIGN_GUIDANCE.md','design-guidance.md'],['INTEGRATION.md','integration.md'],['VISUAL_REFERENCES.md','visual-references.md']]) await cp(path.join(root,'docs',from),path.join(skill,'references',to));
await cp(path.join(root,'docs/gallery'),path.join(skill,'references/gallery'),{recursive:true});
await cp(path.join(root,'dist'),path.join(skill,'assets/ui/dist'),{recursive:true});
await cp(path.join(root,'src'),path.join(skill,'assets/ui/src'),{recursive:true});
await cp(path.join(root,'licenses'),path.join(skill,'assets/ui/licenses'),{recursive:true});
await cp(path.join(root,'LICENSE'),path.join(skill,'assets/ui/LICENSE'));
await cp(path.join(root,'NOTICE.md'),path.join(skill,'assets/ui/NOTICE.md'));
await cp(path.join(root,'docs/provenance.json'),path.join(skill,'assets/ui/provenance.json'));
const pkg = JSON.parse(await readFile(path.join(root,'package.json'),'utf8'));
delete pkg.devDependencies; delete pkg.scripts; delete pkg.engines;
await writeFile(path.join(skill,'assets/ui/package.json'),JSON.stringify(pkg,null,2)+'\n');
await cp(path.join(root,'examples/gallery/App.tsx'),path.join(skill,'assets/starter/App.tsx'));
let starter = await readFile(path.join(skill,'assets/starter/App.tsx'),'utf8');
starter = starter.replace("from '../../src'","from '@phd/chatgpt-desktop-kit'").replace("import '../../src/styles.css'","import '@phd/chatgpt-desktop-kit/styles.css'");
await writeFile(path.join(skill,'assets/starter/App.tsx'),starter);
await cp(path.join(root,'examples/gallery/gallery.css'),path.join(skill,'assets/starter/gallery.css'));
await cp(path.join(root,'examples/gallery/index.html'),path.join(skill,'assets/starter/index.html'));
await cp(path.join(root,'examples/starter-package.json'),path.join(skill,'assets/starter/package.json'));
await cp(path.join(root,'examples/starter-build.mjs'),path.join(skill,'assets/starter/build.mjs'));
await cp(path.join(root,'examples/starter-tsconfig.json'),path.join(skill,'assets/starter/tsconfig.json'));
await writeFile(path.join(skill,'origin.json'),JSON.stringify({managedBy:'chatgpt-desktop-kit',version:pkg.version},null,2)+'\n');
console.log(`Packaged self-contained Skill: ${skill}`);
if(process.argv.includes('--install')) {
  const codexRoot = process.env.CODEX_HOME || path.join(os.homedir(),'.codex');
  const destination = path.join(codexRoot,'skills/chatgpt-desktop-ui');
  let exists = false;
  try { await access(destination); exists = true; } catch(error) { if(error.code !== 'ENOENT') throw error; }
  if(exists) {
    try { const previous=JSON.parse(await readFile(path.join(destination,'origin.json'),'utf8')); if(previous.managedBy!=='chatgpt-desktop-kit') throw Error('UNRELATED_SKILL'); }
    catch(error) { throw Error(`Refusing to overwrite an unrelated Skill: ${destination}`,{cause:error}); }
  }
  await removeRetiredReferences(destination);
  await cp(skill,destination,{recursive:true});
  console.log(`Installed Skill: ${destination}`);
}
