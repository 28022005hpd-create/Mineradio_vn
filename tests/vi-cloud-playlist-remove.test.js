'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const read = pathName => fs.readFileSync(path.join(root,pathName),'utf8');
const ui = read('public/js/modules/06-lyrics/02-playlist-detail.js');
const frontend = ui.slice(ui.indexOf("var playlistPanelCloudRemovalBusy = ''"),
  ui.indexOf('function playlistPanelNoticeHtml('));
assert.ok(frontend.includes('removePlaylistPanelCloudTrack'));
function makeUi(st = {key:'netease:123',playlist:{id:'123',name:'Tên của tôi',owned:true},
  tracks:[{provider:'netease',id:'456',name:'Nhạc của tôi'}],total:1,nextOffset:1}, api) {
  const calls=[];
  const ctx = {
    console,
    window:{},
    normalizePlaylistProvider:p=>p,
    playlistPanelDetailState:st,
    playlistProviderName:p=>({netease:'NetEase Cloud Music',spotify:'Spotify',qishui:'Qishui Music',kugou:'KuGou Music'})[p] || p,
    isSongAccountLoggedIn:()=>true,
    songAccountId:s=>String(s.id),
    songAccountStateKey:s=>s.provider+':'+s.id,
    likedSongMap:{'netease:456':true},
    renderPlaylistPanelDetailRows(){calls.push({type:'render'});},
    showToast(msg){calls.push({type:'toast',msg});},
    updateLikeButtons(){calls.push({type:'like-ui'});},
    async refreshUserPlaylists(){calls.push({type:'refresh'});},
    async apiJson(url,opts){
      calls.push({type:'cloud',url,opts});
      if (api) return api(url,opts);
      return {success:true,code:200};
    }
  };
  vm.createContext(ctx);
  vm.runInContext(frontend,ctx);
  ctx.playlistPanelConfirmCloudDelete = async details => {
    calls.push({type:'confirm',details}); return ctx.confirmApproved !== false;
  };
  ctx.playlistPanelRenderCloudUndo = () => { calls.push({type:'undo-ui'}); };
  return {ctx,calls,st};
}
test('show delete controls only for owned or explicitly recognized liked cloud lists',()=>{
  const {ctx}=makeUi();
  const action=ctx.playlistPanelCloudRemovalAction;
  assert.equal(action({id:'123',owned:true},'netease').endpoint,'/api/playlist/remove-song');
  assert.equal(action({id:'123',owned:true,specialType:5},'netease').endpoint,'/api/song/like');
  assert.equal(action({id:'123',owned:false},'netease'),null);
  assert.equal(action({id:'spotify-liked',virtual:true},'spotify').endpoint,'/api/spotify/song/like');
  assert.equal(action({id:'123',owned:true},'spotify').endpoint,'/api/spotify/playlist/remove-song');
  assert.equal(action({id:'123',owned:false},'spotify'),null);
  assert.equal(action({id:'qishui-liked',virtual:true,owned:true},'qishui').endpoint,'/api/qishui/song/like');
  assert.equal(action({id:'anything',owned:true},'qishui'),null);
  assert.equal(action({id:'888',likedCollection:true},'kugou').endpoint,'/api/kugou/song/like');
  assert.equal(action({id:'888'},'kugou'),null);
  assert.equal(action({id:'999',owned:true},'qq'),null);
});
test('cloud delete confirms first, sends exact playlist and song and then updates UI',async ()=>{
  const {ctx,calls,st}=makeUi();
  assert.equal(await ctx.removePlaylistPanelCloudTrack(0),true);
  assert.equal(calls[0].type,'confirm');
  assert.equal(calls[0].details.provider,'NetEase Cloud Music');
  assert.equal(calls[0].details.playlist,'Tên của tôi');
  const sent=calls.find(x=>x.type==='cloud');
  assert.equal(sent.url,'/api/playlist/remove-song');
  assert.deepEqual(JSON.parse(sent.opts.body).pid,'123');
  assert.deepEqual(JSON.parse(sent.opts.body).id,'456');
  assert.equal(st.tracks.length,0);
  assert.equal(st.total,0);
  assert.equal(calls.some(x=>x.type==='refresh'),true);
});
test('never remove a local song when cloud refused or user canceled',async ()=>{
  const {ctx,calls,st}=makeUi(undefined,()=>({success:false,error:'PLAYLIST_NOT_OWNED'}));
  assert.equal(await ctx.removePlaylistPanelCloudTrack(0),false);
  assert.equal(st.tracks.length,1);
  assert.equal(calls.some(x=>x.type==='toast'&&x.msg.includes('quyền')),true);
  const second=makeUi();
  second.ctx.confirmApproved=false;
  assert.equal(await second.ctx.removePlaylistPanelCloudTrack(0),false);
  assert.equal(second.calls.some(x=>x.type==='cloud'),false);
});
test('liked playlists send unlike and update heart only after success',async ()=>{
  const st={key:'netease:123',playlist:{id:'123',owned:true,specialType:5,name:'Yêu thích'},
    tracks:[{provider:'netease',id:'456',name:'Bài hát'}],total:1,nextOffset:1};
  const {ctx,calls}=makeUi(st,()=>({liked:false,code:200}));
  assert.equal(await ctx.removePlaylistPanelCloudTrack(0),true);
  const sent=calls.find(x=>x.type==='cloud');
  assert.equal(sent.url,'/api/song/like');
  assert.equal(JSON.parse(sent.opts.body).like,false);
  assert.equal(ctx.likedSongMap['netease:456'],false);
});
test('Spotify remover validates account ownership before calling 2026 playlist items API',async ()=>{
  const source=read('spotify-api.js');
  const code=source.slice(source.indexOf('async function handleSpotifyPlaylistRemoveSong('),
    source.indexOf('async function handleSpotifyPlaylistAddSong('));
  assert.ok(code.startsWith('async function'));
  const calls=[];
  let owner='account-a';
  const sandbox={
    normalizeScopes:()=>['playlist-modify-private'],
    readStoredSpotifyToken:()=>({scope:'playlist-modify-private'}),
    requireSpotifyScopes:()=>{},
    normalizeText:value=>String(value||'').trim(),
    spotifyLibraryUri:()=> 'spotify:track:1234567890123456789012',
    getSpotifyProfile:async()=>({id:'account-a'}),
    spotifyUserGet:async()=>({owner:{id:owner}}),
    spotifyUserRequest:async(path,method,params,payload,opts)=>{
      calls.push({path,method,payload,opts});return {snapshot_id:'good'};
    }
  };
  vm.createContext(sandbox);
  vm.runInContext(code,sandbox);
  owner='someone-else';
  await assert.rejects(sandbox.handleSpotifyPlaylistRemoveSong('1234567890123456789012',{}),/PLAYLIST_NOT_OWNED/);
  assert.equal(calls.length,0);
  owner='account-a';
  const result=await sandbox.handleSpotifyPlaylistRemoveSong('1234567890123456789012',{});
  assert.equal(result.success,true);
  assert.equal(calls.length,1);
  assert.equal(calls[0].method,'DELETE');
  assert.equal(calls[0].path,'/playlists/1234567890123456789012/items');
  assert.equal(calls[0].payload.items[0].uri,'spotify:track:1234567890123456789012');
  assert.equal(calls[0].opts.noRetry,true,'Avoid replaying a destructive request');
});
test('NetEase handler is POST-only, ownership checked server-side, and invalidates song index after success',()=>{
  const server=read('server.js');
  const start=server.indexOf("if (pn === '/api/playlist/remove-song')");
  assert.ok(start>0);
  const block=server.slice(start,server.indexOf("// ---------- 歌词 ----------",start));
  assert.match(block,/req.method !== 'POST'/);
  assert.match(block,/playlist_detail\(\{ id: pid/);
  assert.match(block,/String\(pl\.creator && pl\.creator\.userId/);
  assert.match(block,/String\(info\.userId\)/);
  assert.match(block,/PLAYLIST_NOT_OWNED/);
  assert.match(block,/op: 'del'/);
  assert.match(block,/invalidateNeteasePlaylistTrackIndex\(pid\)/);
  assert.match(server,/pn === '\/api\/spotify\/playlist\/remove-song'/);
});
test('cloud remove button is scoped to My Music playlist rows and not songs in public albums',()=>{
  assert.match(ui,/data-pl-detail-remove-cloud/);
  assert.match(ui,/removePlaylistPanelCloudTrack\(Number\(removeCloudTrack\.getAttribute/);
  assert.match(ui,/playlistPanelCloudRemovalAction\(st\.playlist, activeProvider\)/);
  assert.match(ui,/if \(playlistPanelDetailState\.key === key && playlistPanelDetailState === state\)/);
  const css=read('public/css/index.css');
  assert.match(css,/#playlist-panel \.pl-detail-cloud-remove:focus-visible/);
});

test('undo uses the correct re-add endpoint for every supported provider and kind',()=>{
  const {ctx}=makeUi();
  const restore=ctx.playlistPanelCloudRestoreEndpoint;
  function item(provider,kind,endpoint) {
    return restore({provider,action:{kind,endpoint}});
  }
  assert.equal(item('netease','playlist','/api/playlist/remove-song'),'/api/playlist/add-song');
  assert.equal(item('spotify','playlist','/api/spotify/playlist/remove-song'),'/api/spotify/playlist/add-song');
  for(const [provider,url] of [
    ['netease','/api/song/like'],
    ['spotify','/api/spotify/song/like'],
    ['qishui','/api/qishui/song/like'],
    ['kugou','/api/kugou/song/like']
  ]) assert.equal(item(provider,'unlike',url),url);
  assert.equal(item('qq','playlist',''), '');
});
test('undo restores the exact cloud playlist song and its original index',async()=>{
  const st={key:'netease:123',playlist:{id:'123',name:'Bộ sưu tập',owned:true},
    tracks:[{provider:'netease',id:'111',name:'A'},{provider:'netease',id:'456',name:'B'},
    {provider:'netease',id:'333',name:'C'}],total:3,nextOffset:3};
  const {ctx,calls}=makeUi(st);
  assert.equal(await ctx.removePlaylistPanelCloudTrack(1),true);
  assert.deepEqual(Array.from(st.tracks,s=>s.id),['111','333']);
  assert.ok(ctx.playlistPanelCloudLastRemoval,'Undo record must exist after successful cloud removal');
  assert.equal(ctx.playlistPanelCloudLastRemoval.index,1);
  assert.equal(await ctx.undoPlaylistPanelCloudTrack(),true);
  assert.deepEqual(Array.from(st.tracks,s=>s.id),['111','456','333']);
  assert.equal(st.total,3);
  assert.equal(st.nextOffset,3);
  const requests=calls.filter(c=>c.type==='cloud');
  assert.equal(requests.length,2);
  assert.equal(requests[0].url,'/api/playlist/remove-song');
  assert.equal(requests[1].url,'/api/playlist/add-song');
  assert.equal(JSON.parse(requests[1].opts.body).pid,'123');
  assert.equal(JSON.parse(requests[1].opts.body).id,'456');
  assert.equal(ctx.playlistPanelCloudLastRemoval,null);
});
test('undo re-likes cloud tracks and restores local heart only after successful API update',async()=>{
  const st={key:'netease:123',playlist:{id:'123',name:'Yêu thích',owned:true,specialType:5},
    tracks:[{id:'456',provider:'netease',name:'B'}],total:1,nextOffset:1};
  const {ctx,calls}=makeUi(st,(url,options)=>({
    liked:JSON.parse(options.body).like === true,code:200
  }));
  assert.equal(await ctx.removePlaylistPanelCloudTrack(0),true);
  assert.equal(ctx.likedSongMap['netease:456'],false);
  assert.equal(await ctx.undoPlaylistPanelCloudTrack(),true);
  assert.equal(ctx.likedSongMap['netease:456'],true);
  assert.equal(st.tracks.length,1);
  const request=calls.filter(x=>x.type==='cloud');
  assert.equal(request[1].url,'/api/song/like');
  assert.equal(JSON.parse(request[1].opts.body).like,true);
});
test('a failed cloud undo is not faked locally and remains available for a retry',async()=>{
  const st={key:'netease:123',playlist:{id:'123',name:'Danh sách',owned:true},
    tracks:[{id:'456',provider:'netease',name:'B'}],total:1,nextOffset:1};
  let failedOnce=false;
  const {ctx,calls}=makeUi(st,(url)=> {
    if (url==='/api/playlist/add-song' && !failedOnce) {
      failedOnce=true;
      return {success:false,error:'API_DOWN'};
    }
    return {success:true,code:200};
  });
  assert.equal(await ctx.removePlaylistPanelCloudTrack(0),true);
  assert.equal(st.tracks.length,0);
  assert.equal(await ctx.undoPlaylistPanelCloudTrack(),false);
  assert.equal(st.tracks.length,0,'Never restore locally before cloud confirmation');
  assert.ok(ctx.playlistPanelCloudLastRemoval,'Keep undo available');
  assert.equal(await ctx.undoPlaylistPanelCloudTrack(),true);
  assert.equal(st.tracks.length,1);
  assert.equal(ctx.playlistPanelCloudLastRemoval,null);
});
test('undo does not insert a duplicate when an independent refresh already restored the track',async()=>{
  const st={key:'netease:123',playlist:{id:'123',name:'Danh sách',owned:true},
    tracks:[{id:'456',provider:'netease',name:'B'}],total:1,nextOffset:1};
  const {ctx}=makeUi(st);
  await ctx.removePlaylistPanelCloudTrack(0);
  st.tracks.push({id:'456',provider:'netease',name:'B'});
  st.total=1;
  assert.equal(await ctx.undoPlaylistPanelCloudTrack(),true);
  assert.equal(st.tracks.length,1);
  assert.equal(st.total,1);
});
test('custom confirmation is accessible, localized, text-safe and never calls native Windows confirm',()=>{
  assert.match(ui,/function playlistPanelConfirmCloudDelete\(details\)/);
  assert.match(ui,/role="dialog" aria-modal="true"/);
  assert.match(ui,/aria-labelledby="pl-cloud-confirm-title"/);
  assert.match(ui,/details.name \|\| 'Bài hát'/);
  assert.match(ui,/data-pl-cloud-cancel/);
  assert.match(ui,/data-pl-cloud-accept/);
  assert.match(ui,/e.key === 'Escape'/);
  assert.match(ui,/e.key === 'Tab'/);
  assert.doesNotMatch(frontend,/window\.confirm\s*\(/);
  assert.match(ui,/data-pl-detail-undo/);
  assert.match(ui,/undoPlaylistPanelCloudTrack\(\)/);
  assert.match(ui,/isCloudBusy \? '…' : '×'/);
  const css=read('public/css/index.css');
  assert.match(css, /\.pl-cloud-confirm-overlay\s*\{/);
  assert.match(css,/\.pl-cloud-undo-bar\s*\{/);
  assert.match(css,/\.pl-detail-cloud-remove:hover/);
});
