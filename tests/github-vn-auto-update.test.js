'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),crypto=require('node:crypto');
const {GithubVnAutoUpdater,trustedUrl,validateManifest,validInstaller,installerLaunchScript}=require('../desktop/github-vn-auto-update');
const commit='a'.repeat(40),name='Mineradio-VN-'+commit.slice(0,12)+'-Setup.exe',buf=Buffer.alloc(70000);buf.write('MZ');
const artifact={name,size:buf.length,sha256:crypto.createHash('sha256').update(buf).digest('hex')};
const manifest={schema:1,channel:'vi-VN',buildNumber:15,commit,artifact};
const base='https://github.com/28022005hpd-create/Mineradio_vn/releases/download/mineradio-vn-auto/';
function release(){return {tag_name:'mineradio-vn-auto',prerelease:true,draft:false,assets:[{name:'latest-vn.json',browser_download_url:base+'latest-vn.json'},{name,browser_download_url:base+name,size:artifact.size}]};}
function create(options={}){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'vn-update-')),events=[];
 const updater=new GithubVnAutoUpdater(Object.assign({enabled:true,userData:dir,buildNumber:14,onStatus:s=>events.push(s),readJSON:async url=>url.includes('/releases/tags/')?release():manifest,download:async(url,file,a,onProgress)=>{assert.equal(url,base+name);assert.deepEqual(a,artifact);fs.writeFileSync(file,buf);onProgress(100);}},options));
 return {dir,updater,events};
}
test('safe URLs and manifests',()=>{
 assert.equal(trustedUrl('https://github.com/test'),true);assert.equal(trustedUrl('https://github.com.evil.test'),false);
 assert.throws(()=>validateManifest({...manifest,commit:'../unsafe'}));assert.throws(()=>validateManifest({...manifest,artifact:{...artifact,name:'../bad.exe'}}));
});
test('one-way download and verified installer',async t=>{
 const v=create();t.after(()=>fs.rmSync(v.dir,{recursive:true,force:true}));
 assert.equal((await v.updater.check()).status,'ready');
 const file=await v.updater.verifiedFile();assert.ok(file.startsWith(v.dir));
 assert.equal(await validInstaller(file,artifact),true);assert.ok(v.events.some(x=>x.status==='downloading'));
 fs.appendFileSync(file,'corrupt');assert.equal(await v.updater.verifiedFile(),null);
});
test('disable and stale builds',async t=>{
 const p=create({buildNumber:15,download:()=>{throw Error('no download');}});t.after(()=>fs.rmSync(p.dir,{recursive:true,force:true}));
 assert.equal((await p.updater.check()).status,'up-to-date');
 const q=create({enabled:false,readJSON:()=>{throw Error('no network');}});t.after(()=>fs.rmSync(q.dir,{recursive:true,force:true}));
 assert.equal((await q.updater.check()).status,'disabled');
});
test('restart helper awaits process exit',()=>{const s=installerLaunchScript("C:\\O'Brien\\u.exe",'D:\\Mineradio','D:\\Mineradio\\Mineradio.exe',123);
 assert.match(s,/Get-Process -Id \$oldProcessId/);assert.match(s,/O''Brien/);assert.match(s,/Start-Process/);});


test('auto-update is enabled only for installed Vietnamese Windows build',()=>{
 const root=path.join(__dirname,'..');
 const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
 const electron=fs.readFileSync(path.join(root,'desktop/main.js'),'utf8');
 const preload=fs.readFileSync(path.join(root,'desktop/preload.js'),'utf8');
 assert.equal(pkg.mineradio.githubAutoUpdate.enabled,true);
 assert.match(electron,/process\.platform === 'win32' && app\.isPackaged/);
 assert.match(electron,/VN_BUILD_METADATA\.channel === 'vi-VN'/);
 assert.match(electron,/userData: STABLE_USER_DATA_PATH/);
 assert.match(electron,/app\.on\('quit'/);
 assert.match(electron,/app\.quit\(\)/);
 assert.match(preload,/getVnGithubUpdateStatus/);
});
