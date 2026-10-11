import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const adapter=fileURLToPath(new URL('../src/runtime/desktop-scroll-lock.tsx',import.meta.url));
const original=path.join(path.dirname(require.resolve('react-remove-scroll/package.json')),'dist/es2015/index.js');
export const desktopScrollLock={name:'desktop-scroll-lock',setup(build){
  build.onResolve({filter:/^react-remove-scroll$/},args=>({path:path.resolve(args.importer)===adapter?original:adapter}));
}};
