'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(process.argv[2]||'dist-rust-optimized/win-unpacked/resources/app');
function file(name){
  const full=path.join(root,name);
  assert.ok(fs.existsSync(full) && fs.statSync(full).isFile(),'Missing packaged file: '+name);
  return full;
}
for(const name of [
  'package.json','desktop/main.js','server.js','public/index.html',
  'lyric-translation-service.js','lyric-fallback-service.js',
  'public/js/modules/10-shell/04b-live-mv-mini.js',
  'desktop/mini-player-preload.js',
  'rust/mineradio-playlist-core/native/mineradio_playlist_core.node'
]) file(name);
const meta=JSON.parse(fs.readFileSync(file('package.json'),'utf8'));
assert.equal(meta.productName,'Mineradio_Rust_Optimized');
assert.equal(meta.mineradio.runtimeName,'Mineradio_Rust_Optimized');
assert.equal(meta.mineradio.appUserModelId,'com.mineradio.vn.rustoptimized');
assert.equal(meta.mineradio.rustPerformanceEdition,true);
assert.equal(meta.mineradio.update.disabled,true);
assert.equal(meta.mineradio.githubAutoUpdate.enabled,false);
const api=require(path.join(root,'desktop/built-in-playlist-library.js'));
assert.equal(api.RUST_PLAYLIST_NATIVE_ACTIVE,false,'Native DLL must not load in ordinary mode');
assert.equal(api.RUST_PLAYLIST_BATCH_AVAILABLE,false,'Native batch must not load in ordinary mode');
assert.equal(api.RUST_PLAYLIST_BATCH_ACTIVE,false,'Slower native batch must remain OFF by default');
const songs=Array.from({length:128},(_,i)=>({provider:'netease',id:String(i),name:'Bài '+i}));
const got=api.sanitizePlaylistTracks(songs);
assert.equal(got.length,128);
assert.equal(got[127].builtInIdentity,'netease:127');
assert.equal(api.RUST_PLAYLIST_DIAGNOSTICS.nativeBatchCalls,0,'Default path must not use slower Rust JSON bridge');
const addon=require(file('rust/mineradio-playlist-core/native/mineradio_playlist_core.node'));
const native=JSON.parse(addon.sanitizeTracksJson(JSON.stringify(songs)));
assert.deepEqual(native,got,'Experimental native batch must retain playlist semantics');
// Verify opt-in native route loads in a clean process without changing user profile.
const {spawnSync}=require('node:child_process');
const checkScript=[
  'const api=require('+JSON.stringify(path.join(root,'desktop/built-in-playlist-library.js'))+');',
  'if(!api.RUST_PLAYLIST_BATCH_ACTIVE) process.exit(2);',
  'const songs=Array.from({length:128},(_,i)=>({provider:"netease",id:String(i),name:"Nhạc"}));',
  'const tracks=api.sanitizePlaylistTracks(songs);',
  'if(tracks.length!==128 || api.RUST_PLAYLIST_DIAGNOSTICS.nativeBatchCalls<1) process.exit(3);'
].join('\n');
const child=spawnSync(process.execPath,['-e',checkScript],{
  encoding:'utf8',
  env:{...process.env,MINERADIO_RUST_PLAYLIST_BATCH_FORCE:'1',MINERADIO_RUST_PLAYLIST:'1'},
});
assert.equal(child.status,0,child.stderr||'Forced native batch failed');
console.log('OK: packaged Windows optimized edition loads Rust batch and remains isolated');
