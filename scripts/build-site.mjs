import { spawnSync } from 'node:child_process';
import { cp } from 'node:fs/promises';
import { root } from './component-catalog.mjs';
import path from 'node:path';
for (const script of ['build.mjs', 'build-demo.mjs', 'build-catalog.mjs']) {
  const run = spawnSync(process.execPath, ['scripts/' + script], { cwd: root, stdio: 'inherit' });
  if (run.status !== 0) process.exit(run.status || 1);
}
await cp(path.join(root, 'examples/catalog/build'), path.join(root, 'examples/demo/build/components'), {
  recursive: true,
});
await cp(path.join(root, 'examples/gallery/build'), path.join(root, 'examples/demo/build/gallery'), {
  recursive: true,
});
console.log('Built replica, component reference and gallery in one Pages artifact.');
