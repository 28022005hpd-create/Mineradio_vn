'use strict';
// Run on Windows GitHub Actions after building .node. This is diagnostic only;
// benchmark variance should not fail correctness or prevent safe fallback.
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const root=path.join(__dirname,'..');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'mineradio-native-playlist-bench-'));
try {
  const id='0123456789abcdef01234567';
  const tracks=Array.from({length:3200},(_,i)=>({
    provider:['netease','qq','kugou','qishui','local'][i%5],
    id:String(i+1),
    mid:'QQ'+i,
    hash:'HASH'+i,
    localFileId:String(i+1),
    name:'Bài nhạc '+i,
    artist:'Ca sĩ Việt Nam',
    album:'Album '+(i%20),
    cover:'https://example.com/cover/'+i+'.jpg'
  }));
  // Use provider-specific record shapes: accidental cross-provider fields
  // can otherwise change normalization (hash -> Kugou).
  for(const t of tracks){
    if(t.provider!=='qq') delete t.mid;
    if(t.provider!=='kugou') delete t.hash;
    if(t.provider!=='local') delete t.localFileId;
  }
  fs.writeFileSync(path.join(tmp,'built-in-playlists.json'),
    JSON.stringify({version:1,updatedAt:123,playlists:[{id,name:'Nhạc Việt',createdAt:123,updatedAt:123,tracks}]}));
  const script=[
    "const {performance}=require('node:perf_hooks');",
    "const x=require('./desktop/built-in-playlist-library');",
    "const a=[];let last=null;",
    "for(let i=0;i<7;i++){const t=performance.now();const lib=new x.BuiltInPlaylistLibrary({userDataPath:process.env.TEST_PLAYLIST_DIR});a.push(performance.now()-t);last=lib.listSync();}",
    "const measurements=a.slice(2).sort((a,b)=>a-b);",
    "process.stdout.write(JSON.stringify({mode:process.env.MINERADIO_RUST_PLAYLIST==='1'?'rust-batch':'javascript',",
    "medianMs:measurements[2],minMs:measurements[0],maxMs:measurements[4],",
    "count:last.playlists[0].trackCount,metrics:x.RUST_PLAYLIST_DIAGNOSTICS,rssMb:Math.round(process.memoryUsage().rss/1048576)}));"
  ].join('\n');
  function measure(mode) {
    const proc=spawnSync(process.execPath,['-e',script],{cwd:root,encoding:'utf8',
      env:{...process.env,MINERADIO_RUST_PLAYLIST:mode,TEST_PLAYLIST_DIR:tmp}});
    if(proc.status!==0) throw Error(proc.stderr||'Benchmark failed');
    return JSON.parse(proc.stdout);
  }
  const js=measure('0'),rust=measure('1');
  if(js.count!==rust.count||js.count!==3200||rust.metrics.nativeBatchCalls===0) {
    throw Error('Benchmark integrity or native binding failure');
  }
  const summary={dataset:'3200 mixed-provider tracks; 7 loads, first 2 excluded; Windows runner',
    javascript:js,rust:rust,ratio:Math.round((js.medianMs/rust.medianMs)*100)/100,
    note:'Synthetic diagnostic, not a real-world smoothness or audio benchmark. A ratio below 1 means Rust is slower on this runner.'};
  console.log(JSON.stringify(summary,null,2));
  fs.writeFileSync(path.join(root,'rust-playlist-perf.json'),JSON.stringify(summary,null,2));
} finally {fs.rmSync(tmp,{recursive:true,force:true});}
