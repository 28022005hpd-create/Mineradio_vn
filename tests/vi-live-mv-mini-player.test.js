'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const source = read('public/js/modules/10-shell/04b-live-mv-mini.js');
function player() {
  const calls = [];
  const track = {id:66,provider:'netease',name:'Tên bài hát',artist:'Tên nghệ sĩ',
    cover:'https://example.com/cover.jpg'};
  const ctx = {
    console, Map, Set, Promise, Number, Date, Intl,
    window: {},
    currentLyricSong: () => track,
    songCoverUrl: s => s.cover,
    playbackDurationFromSong: () => 120,
    originalLyricsState: {
      lines:[
        {t:0,duration:3,text:'Original first',translation:'Dịch câu 1'},
        {t:3,duration:3,text:'Original second',translation:'Dịch câu 2'},
        {t:6,duration:4,text:'Original third',translation:'Dịch câu 3'}
      ],
      translationLines:[]
    },
    preferredLocalizedLyricsForDisplay: s => s,
    audio: {currentTime:4.2,duration:120,paused:false,ended:false},
    audioEnergy:.35,
    togglePlay(){calls.push('toggle');},
    nextTrack(){calls.push('next');},
    prevTrack(){calls.push('previous');},
    localStorage:{getItem(){return null;},setItem(){}},
  };
  vm.createContext(ctx);
  vm.runInContext(source,ctx);
  return {ctx,track,calls};
}
test('the Live MV snapshot uses active song cover and karaoke time, never fixed video captions',()=>{
  const {ctx,track}=player();
  const item=ctx.liveMvSongSnapshot();
  assert.equal(item.title,'Tên bài hát');
  assert.equal(item.artist,'Tên nghệ sĩ');
  assert.equal(item.cover,'https://example.com/cover.jpg');
  assert.equal(item.lyric,'Original second');
  assert.equal(item.translation,'Dịch câu 2');
  assert.equal(item.next,'Original third');
  assert.ok(item.progress > .39 && item.progress < .41);
  assert.equal(item.paused,false);
  assert.equal(track.name,'Tên bài hát','Provider title must not be modified');
});
test('changing song/time updates the Live MV and translation on the very next snapshot',()=>{
  const {ctx,track}=player();
  const old=ctx.liveMvSongSnapshot();
  track.name='Bài mới';
  track.cover='https://example.com/new.jpg';
  ctx.audio.currentTime=7;
  const next=ctx.liveMvSongSnapshot();
  assert.notEqual(next.trackKey,old.trackKey);
  assert.equal(next.cover,'https://example.com/new.jpg');
  assert.equal(next.lyric,'Original third');
  assert.equal(next.translation,'Dịch câu 3');
});
test('the responsive compact player commands call the single existing audio engine',()=>{
  const {ctx,calls}=player();
  ctx.liveMvHandleMiniCommand('toggle');
  ctx.liveMvHandleMiniCommand('next');
  ctx.liveMvHandleMiniCommand('previous');
  ctx.liveMvHandleMiniCommand('unsupported');
  assert.deepEqual(calls,['toggle','next','previous']);
  assert.doesNotMatch(source,/new Audio\(|\\.play\\(\s*new Audio/);
});
test('Live MV controls are exposed through the DIY effects tab and startup loader',()=>{
  const html=read('public/index.html');
  const consoleUi=read('public/js/modules/07-fx/09-console-workspace.js');
  const loader=read('public/js/index-loader.js');
  const startup=read('public/js/modules/10-shell/05-startup-bindings.js');
  assert.match(html,/id="mineradio-live-mv-controls"/);
  assert.match(html,/id="live-mv-toggle"/);
  assert.match(html,/id="live-mv-mini-toggle"/);
  assert.match(consoleUi,/fxConsoleItem\('mineradio-live-mv-controls'/);
  assert.match(loader,/04b-live-mv-mini\.js/);
  assert.match(startup,/initializeMineradioLiveMv\(\)/);
});
test('the Windows mini window only bridges whitelisted playback commands and sanitized display data',()=>{
  const main=read('desktop/main.js');
  const preload=read('desktop/preload.js');
  const tinyPreload=read('desktop/mini-player-preload.js');
  const tiny=read('public/mini-player.html');
  assert.match(main,/function compactMusicOpen\(\)/);
  assert.match(main,/new BrowserWindow\(\{/);
  assert.match(main,/if \(minimizeIntent\.intentional && compactMusicEnabled\) compactMusicOpen\(\)/);
  assert.match(main,/compactMusicClose\(\);\s*if \(mainWindowMinimizeRecoveryTimer\)/);
  assert.match(main,/event\.sender !== mainWindow\.webContents/);
  assert.match(main,/event\.sender !== compactMusicWindow\.webContents/);
  assert.match(main,/\['toggle', 'previous', 'next', 'restore', 'mv'\]/);
  assert.match(preload,/publishMiniPlayerState/);
  assert.match(preload,/onMiniPlayerCommand/);
  assert.match(tinyPreload,/contextBridge\.exposeInMainWorld\('mineradioMiniBridge'/);
  assert.match(tiny,/window\.mineradioMiniBridge/);
  assert.match(tiny,/data-cmd="toggle"/);
  assert.doesNotMatch(tiny,/audio\s+src=/);
});
test('mobile in-app compact mode stays responsive and no unsupported native mobile PiP is claimed',()=>{
  const css=read('public/css/index.css');
  assert.match(css,/#mineradio-mini-inapp/);
  assert.match(css,/@media\(max-width:720px\)/);
  assert.match(css,/env\(safe-area-inset-bottom\)/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(source,/OS-level mobile PiP/);
  assert.match(source,/publishMiniPlayerState/);
});
