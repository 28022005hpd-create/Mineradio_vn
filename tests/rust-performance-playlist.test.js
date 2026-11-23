'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const {spawnSync} = require('node:child_process');

const root = path.join(__dirname, '..');
const native = require(path.join(root, 'rust/mineradio-playlist-core/native/mineradio_playlist_core.node'));
const {sanitizeTrack} = require('../desktop/built-in-playlist-library');

function normalizeFromNative(value) {
  const payload = native.sanitizeTrackJson(JSON.stringify(value));
  return payload == null ? null : JSON.parse(payload);
}

test('native Rust identity and sanitization remain structurally equivalent to original JS', () => {
  assert.equal(typeof native.sanitizeTrackJson, 'function');
  assert.equal(typeof native.sanitizeTracksJson, 'function');
  const corpus = [
    {provider:'netease', id:1, name:'  Nhạc Việt  ', artist:' Ca sĩ '},
    {provider:'qq',id:'123',mid:'QQ001',cover:'https://example.com/cover'},
    {provider:'kugou',hash:'ABCDEF',title:'Dài',artist:'Thử nghiệm'},
    {provider:'qishui',id:'qs-1',name:'Nhạc số'},
    {provider:'local',id:'local:abc', localFileId:'abc',name:'Nội bộ'},
    {provider:'local',id:'local:def',name:'Tệp âm thanh'},
    {provider:'spotify',id:'unsupported'},
    {provider:'netease',name:'Missing track ID'},
    {provider:'qq',id:2,playable:false,fee:0},
    {provider:'netease',id:777,privilege:{entitlement:1,extra:{tooDeep:{drop:true}}}},
    {provider:'netease',id:778,name:'zero\u0000character'},
    null, [], 'bad input',
  ];
  const expected = corpus.map(sanitizeTrack);
  assert.deepEqual(corpus.map(normalizeFromNative), expected);
  const bulk = JSON.parse(native.sanitizeTracksJson(JSON.stringify(corpus)));
  assert.deepEqual(bulk, expected);
});

test('native batch guard rejects malformed and oversized input', () => {
  assert.throws(() => native.sanitizeTracksJson('{"not":"an array"}'), /invalid type|array|sequence/i);
  assert.throws(() => native.sanitizeTracksJson(JSON.stringify(Array.from({length:129},(_,i)=>({id:i})))), /RUST_PLAYLIST_BATCH_TOO_MANY_TRACKS/);
  assert.throws(() => native.sanitizeTracksJson('x'.repeat(4*1024*1024+1)), /RUST_PLAYLIST_BATCH_TOO_LARGE/);
});

test('bulk Rust path preserves exact saved playlist data, order and duplicate semantics', t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(),'mineradio-rust-perf-'));
  t.after(() => fs.rmSync(dir,{recursive:true,force:true}));
  const id='0123456789abcdef01234567';
  const tracks = Array.from({length:1900},(_,i)=>{
    const p=['netease','qq','kugou','qishui','local'][i%5];
    if (p==='netease') return {provider:p,id:'n'+i,name:'Bài '+i,artist:'Ca sĩ'};
    if (p==='qq') return {provider:p,id:'q'+i,mid:'QQ'+i,name:'Nhạc '+i};
    if (p==='kugou') return {provider:p,id:'k'+i,hash:'HASH'+i,name:'Tên '+i};
    if (p==='qishui') return {provider:p,id:'s'+i,name:'Song '+i};
    return {provider:p,id:'local:'+i,localFileId:String(i),name:'File '+i};
  });
  tracks.push({...tracks[17]}, {provider:'spotify',id:'ignored'}, {name:'no identity'});
  const payload={version:1, updatedAt:1234,playlists:[{id,name:'Bộ sưu tập',createdAt:1234,updatedAt:1234,tracks}]};
  fs.writeFileSync(path.join(dir,'built-in-playlists.json'),JSON.stringify(payload));

  const script = [
    "const x=require('./desktop/built-in-playlist-library');",
    "const l=new x.BuiltInPlaylistLibrary({userDataPath:process.env.TEST_PLAYLIST_DIR});",
    "const id=process.env.TEST_PLAYLIST_ID;",
    "const all=[];for(let offset=0;offset<l.page(id).total;offset+=500){all.push(...l.page(id,{offset,limit:500}).tracks)}",
    "process.stdout.write(JSON.stringify({active:x.RUST_PLAYLIST_BATCH_ACTIVE, diagnostics:x.RUST_PLAYLIST_DIAGNOSTICS, list:l.listSync(), tracks:all}));",
  ].join('\n');
  function run(rust) {
    const child=spawnSync(process.execPath,['-e',script],{cwd:root,encoding:'utf8',
      env:{...process.env,MINERADIO_RUST_PLAYLIST:rust?'1':'0',TEST_PLAYLIST_DIR:dir,TEST_PLAYLIST_ID:id}});
    assert.equal(child.status,0,child.stderr);
    return JSON.parse(child.stdout);
  }
  const js=run(false), rust=run(true);
  assert.equal(js.active,false);
  assert.equal(rust.active,true, 'Native Rust batch not activated');
  assert.ok(rust.diagnostics.nativeBatchCalls >= 10, 'Expected real bulk native invocations');
  assert.ok(rust.diagnostics.nativeBatchTracks >= 1900);
  assert.equal(rust.diagnostics.batchFallbacks,0, 'Native batch unexpectedly fell back');
  assert.equal(rust.tracks.length,1900);
  assert.deepEqual(rust.list,js.list);
  assert.deepEqual(rust.tracks,js.tracks);
});
