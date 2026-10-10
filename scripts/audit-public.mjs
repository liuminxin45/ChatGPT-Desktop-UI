import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const root=process.cwd();
const git=args=>execFileSync('git',args,{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024});
const patterns=[
  ['private-path',/(?:[A-Z]:[\\/]Users[\\/](?!Public\b|Default\b)[^\\/\s]+|[A-Z]:[\\/]Leo[\\/])/i],
  ['internal-domain',/https?:\/\/[^\s'"<>]*(?:tp-link|gerrit\.[^/\s]+|phabri[c]ator\.[^/\s]+)/i],
  ['credential',/(?:-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\b(?:sk-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9]{30,}))/],
];
const findings=[];
function check(file,text,scope){for(const [code,pattern]of patterns)if(pattern.test(text))findings.push({scope,file,code});}
const files=[...new Set(git(['ls-files','--cached','--others','--exclude-standard']).trim().split('\n'))];
for(const file of files){if(!file||!fs.existsSync(file))continue;const buffer=fs.readFileSync(file);if(!buffer.includes(0))check(file,buffer.toString('utf8'),'working-tree');if(/(?:^|\/)references\/.+\.png$/.test(file))findings.push({scope:'working-tree',file,code:'official-reference-image'});}
const historicalBlobs=new Map();
for(const commit of git(['rev-list','--all']).trim().split('\n').filter(Boolean)){
  for(const entry of git(['ls-tree','-r',commit]).trim().split('\n').filter(Boolean)){
    const match=entry.match(/^\d+ blob ([a-f0-9]+)\t(.+)$/);
    if(!match)continue;
    const [,blob,file]=match;
    if(/(?:^|\/)references\/.+\.png$/.test(file))findings.push({scope:commit,file,code:'official-reference-image'});
    if(/\.(?:png|zip|woff2?)$/.test(file))continue;
    if(!historicalBlobs.has(blob))historicalBlobs.set(blob,git(['cat-file','blob',blob]));
    check(file,historicalBlobs.get(blob),commit);
  }
}
const manifest=JSON.parse(fs.readFileSync('package.json','utf8'));
if(manifest.license!=='MIT'||manifest.private||!fs.existsSync('LICENSE')||!fs.existsSync('dist/THIRD_PARTY_NOTICES.txt'))findings.push({scope:'package',code:'distribution-metadata'});
console.log(JSON.stringify({status:findings.length?'failed':'passed',files:files.length,historyCommits:git(['rev-list','--all','--count']).trim(),findings},null,2));
if(findings.length)process.exitCode=1;
