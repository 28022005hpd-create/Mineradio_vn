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
assert.equal(api.RUST_PLAYLIST_NATIVE_ACTIVE,true,'Native addon not loaded');
assert.equal(api.RUST_PLAYLIST_BATCH_ACTIVE,true,'Rust batch path unavailable');
const songs=Array.from({length:128},(_,i)=>({provider:'netease',id:String(i),name:'Bài '+i}));
const got=api.sanitizePlaylistTracks(songs);
assert.equal(got.length,128);
assert.equal(got[127].builtInIdentity,'netease:127');
assert.ok(api.RUST_PLAYLIST_DIAGNOSTICS.nativeBatchCalls>=1,'No actual Rust batch');
assert.equal(api.RUST_PLAYLIST_DIAGNOSTICS.batchFallbacks,0);
console.log('OK: packaged Windows optimized edition loads Rust batch and remains isolated');
