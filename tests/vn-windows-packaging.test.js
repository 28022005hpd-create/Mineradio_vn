'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {verifyWindowsPackage}=require('../scripts/verify-vn-windows-package');
const root=path.join(__dirname,'..');

test('all packagers include the required lyrics module',()=>{
 const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
 const beta=JSON.parse(fs.readFileSync(path.join(root,'electron-builder.internal-beta.json'),'utf8'));
 assert.ok(pkg.build.files.includes('lyric-translation-service.js'));
 assert.ok(beta.files.includes('lyric-translation-service.js'));
 assert.equal(pkg.build.appId,'com.mineradio.vn.desktop');
 assert.equal(pkg.mineradio.runtimeName,'Mineradio_vn');
 assert.equal(pkg.mineradio.appUserModelId,'com.mineradio.vn.desktop');
 assert.equal(pkg.build.productName,'Mineradio_vn');
 assert.equal(pkg.build.nsis.include,'build/installer-vn.nsh');
 assert.equal(pkg.build.win.executableName,'Mineradio_vn');
 assert.equal(pkg.mineradio.update.disabled,true);
 const main=fs.readFileSync(path.join(root,'desktop/main.js'),'utf8');
 assert.match(main,/\.mineradio-vn-install-root/);
 assert.match(main,/appId=com\.mineradio\.vn\.desktop/);
});

test('reject an incomplete unpacked Windows app',t=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'vn-package-'));
 t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
 assert.throws(()=>verifyWindowsPackage(dir),/Missing packaged runtime file/);
 for(const f of ['server.js','lyric-translation-service.js','desktop/main.js','desktop/github-vn-auto-update.js','desktop/vn-update-build.json','public/js/modules/06-lyrics/00a-localized-lyric-translation.js','public/index.html','package.json']){
   fs.mkdirSync(path.dirname(path.join(dir,f)),{recursive:true});
   fs.writeFileSync(path.join(dir,f),'');
 }
 fs.writeFileSync(path.join(dir,'package.json'),JSON.stringify({productName:'Mineradio_vn'}));
 fs.writeFileSync(path.join(dir,'desktop/vn-update-build.json'),JSON.stringify({channel:'vi-VN',buildNumber:1,commit:'b'.repeat(40)}));
 assert.deepEqual(verifyWindowsPackage(dir),{ok:true,files:8,build:1});
 fs.unlinkSync(path.join(dir,'lyric-translation-service.js'));
 assert.throws(()=>verifyWindowsPackage(dir),/lyric-translation-service.js/);
});
