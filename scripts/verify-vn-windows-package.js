'use strict';
// Check extracted Windows resources, not merely the source checkout.
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {createRequire}=require('node:module');

function verifyWindowsPackage(root){
  if(!root||!fs.existsSync(root))throw Error('Missing unpacked Windows app directory: '+root);
  const required=[
    'server.js','lyric-translation-service.js','desktop/main.js',
    'desktop/github-vn-auto-update.js','desktop/vn-update-build.json',
    'public/js/modules/06-lyrics/00a-localized-lyric-translation.js',
    'public/index.html','package.json'
  ];
  required.forEach(relative=>{
    const f=path.join(root,relative);
    assert.ok(fs.existsSync(f)&&fs.statSync(f).isFile(),'Missing packaged runtime file: '+relative);
  });
  const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
  const version=JSON.parse(fs.readFileSync(path.join(root,'desktop/vn-update-build.json'),'utf8'));
  assert.equal(pkg.productName,'Mineradio_vn');
  assert.equal(version.channel,'vi-VN');
  assert.ok(Number.isSafeInteger(version.buildNumber)&&version.buildNumber>0);
  assert.match(version.commit,/^[a-f0-9]{40}$/);
  for(const entry of ['server.js','desktop/main.js']){
    const entryFile=path.join(root,entry);
    const requireHere=createRequire(entryFile);
    for(const found of fs.readFileSync(entryFile,'utf8').matchAll(/\brequire\(\s*['"](\.{1,2}\/[^'"]+)['"]\s*\)/g)){
      try{requireHere.resolve(found[1]);}
      catch(error){throw Error('Unpackaged local module from '+entry+': '+found[1]+' '+error.message);}
    }
  }
  return {ok:true,files:required.length,build:version.buildNumber};
}
if(require.main===module){
  try{console.log('Windows package OK:',JSON.stringify(verifyWindowsPackage(path.resolve(process.argv[2]||'dist/win-unpacked/resources/app'))));}
  catch(error){console.error(error.message);process.exitCode=1;}
}
module.exports={verifyWindowsPackage};
