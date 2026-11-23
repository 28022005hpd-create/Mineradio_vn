'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const test = require('node:test');
const samples = [
  {provider:'netease',id:1001,name:' Bài hát tiếng Việt ',artist:' Ca sĩ ',cover:'https://example.com/x.jpg'},
  {provider:'qq',id:'qq-1',mid:'003QQMID',name:'Tên bài hát',mediaMid:'004MEDIA'},
  {provider:'kugou',hash:'ABCDEF',name:'Nhạc'},
  {provider:'qishui',id:'qs-1',providerSongId:'qs-1',artist:'A'},
  {provider:'local',id:'local:abc',localFileId:'abc',name:'Local file'},
  {provider:'local',id:'local:abc',name:'Local prefix'},
  {provider:'spotify',id:'blocked',spotifyId:'blocked'},
  {provider:'netease',name:'missing id'},
  {provider:'netease',id:123,title:'fallback title',artist:'  '},
  {id:'123',provider:'qq',privilege:{vip:true,bad:{deep:{nested:'x'}}}},
  {provider:'qq',id:99,name:'null\u0000inside',fee:0,playable:false},
  {provider:'qq',id:3,recommendationSource:['a','b','c']},
  {type:'qishui',providerSongId:'song',albumAudioId:'audio'},
  {provider:'kugou',id:'1',fileHash:'ZZZ',title:'Song'},
  {provider:'local',localKey:'local-1',name:'Local alternative'},
  {provider:'netease',id:5,veryPrivateField:'must be removed',name:'A'.repeat(1100)},
  {provider:'netease',id:6,privilege:[1,true,null,' x ',{a:1}]},
  null, [], 'not an object'
];
const script = [
  "const api = require('./desktop/built-in-playlist-library');",
  "const inputs = JSON.parse(process.env.MINERADIO_TEST_INPUTS);",
  "const output = inputs.map(api.sanitizeTrack);",
  "process.stdout.write(JSON.stringify({active:api.RUST_PLAYLIST_NATIVE_ACTIVE,output}));",
].join('\n');
function run(mode) {
  const result = spawnSync(process.execPath,['-e',script],{
    cwd:path.join(__dirname,'..'), encoding:'utf8',
    env:{...process.env,MINERADIO_RUST_PLAYLIST:mode,MINERADIO_TEST_INPUTS:JSON.stringify(samples)},
  });
  assert.equal(result.status,0,result.stderr);
  return JSON.parse(result.stdout);
}
test('Native Rust track serialization matches original JS on fixtures',()=>{
  const js=run('0'),rust=run('1');
  assert.equal(js.active,false);
  assert.equal(rust.active,true,'Rust .node addon missing; cannot count JS fallback as a Rust test');
  assert.deepEqual(rust.output,js.output);
});
