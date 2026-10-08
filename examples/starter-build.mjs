import { build } from 'esbuild';
import { mkdir, copyFile, readFile } from 'node:fs/promises';
import http from 'node:http';
await mkdir('build',{recursive:true});
await build({entryPoints:['App.tsx'],outfile:'build/app.js',bundle:true,format:'esm',jsx:'automatic',target:'es2022',define:{'process.env.NODE_ENV':'"production"'}});
await copyFile('index.html','build/index.html');
console.log('Built the standalone Skill starter.');
if(process.argv.includes('--serve')) http.createServer(async(req,res)=>{
  const name = new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';
  if(!['index.html','app.css','app.js'].includes(name)){res.writeHead(404);return res.end();}
  res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'text/html');
  res.end(await readFile('build/'+name));
}).listen(0,'127.0.0.1',function(){console.log(`http://127.0.0.1:${this.address().port}`);});
