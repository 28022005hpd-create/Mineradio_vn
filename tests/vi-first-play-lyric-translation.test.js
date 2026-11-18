'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const file = path.join(__dirname, '../public/js/modules/06-lyrics/00a-localized-lyric-translation.js');
const source = fs.readFileSync(file, 'utf8');

function originalLines(count) {
  return { lines: Array.from({length: count}, (_,i) =>
    ({t: i * 2.3, duration: 2.3, text: 'Bài hát gốc ' + i })),
    hasNativeKaraoke: true, timingSource:'native', translationLines:[], translationSource:'none' };
}
function makePlayer(options = {}) {
  const song = {provider:'netease',id:'123',name:'Đang tải tên bài'};
  const timers = [];
  const renders = [];
  const calls = [];
  const ctx = {
    console, Map, Set, Date, Promise, setTimeout(fn,ms) {timers.push({fn,ms});return timers.length;},
    clearTimeout() {},
    trackSwitchToken: 11, lyricSourceMode:'original',
    originalLyricsState:originalLines(0), fx:{lyricTranslationMode:'multi'},
    currentLyricSong() {return song;},
    isNoLyricText() {return false;},
    isLyricCreditLineText() {return false;},
    normalizeStageLyricText(text) {return String(text || '').trim();},
    normalizeLyricTranslationText(text) {return String(text || '').trim();},
    normalizeLyricTranslationMode(mode) {return mode;},
    cloneLyricLines(lines) {return lines.map(line => ({ ...line }));},
    async fetch(url,opts) {
      assert.equal(url,'/api/lyrics/translate');
      const body = JSON.parse(opts.body);
      calls.push(body);
      return options.fetch ? options.fetch(body,calls.length) : {
        ok:true, async json() {
          return { locale:'vi-VN', translations: body.lines.map(x=>'Dịch: ' + x) };
        }
      };
    },
    applyOriginalLyricsState() {
      renders.push(ctx.preferredLocalizedLyricsForDisplay(ctx.originalLyricsState));
    }
  };
  ctx.window = {MineradioI18n:{locale:'vi-VN',onChange() {}}};
  vm.createContext(ctx);
  vm.runInContext(source,ctx);
  return {ctx, song, timers, renders, calls};
}
async function flushTicks(count=25) {
  for(let i=0;i<count;i++) await new Promise(resolve=>setImmediate(resolve));
}
test('a first-time song gets Vietnamese lyrics automatically after the initial provider response',async () => {
  const {ctx,calls,renders}=makePlayer();
  const pending=ctx.preferredLocalizedLyricsForDisplay(ctx.originalLyricsState);
  assert.equal(pending.translationLines.length,0);
  assert.equal(calls.length,0,'Do not translate unavailable placeholder lyrics');
  ctx.originalLyricsState=originalLines(16);
  const initial=ctx.preferredLocalizedLyricsForDisplay(ctx.originalLyricsState);
  assert.equal(initial.translationLines.length,0);
  await flushTicks();
  assert.equal(calls.length,3,'Five-line first-verse requests and the remaining lines must start without replay');
  assert.ok(renders.length >= 1, 'Async translation must repaint the existing song');
  assert.equal(ctx.preferredLocalizedLyricsForDisplay(ctx.originalLyricsState).translationLines.length,16);
});
test('hydrating current track metadata after fetching lyrics does not cancel first-play translation', async () => {
  let resolveRequest;
  const pending=new Promise(resolve=>{resolveRequest=resolve;});
  const {ctx,song,calls}=makePlayer({fetch:()=>pending});
  // One five-line request isolates metadata hydration from parallel batching.
  ctx.originalLyricsState=originalLines(4);
  ctx.preferredLocalizedLyricsForDisplay(ctx.originalLyricsState);
  await flushTicks(3);
  assert.equal(calls.length,1);
  song.name='Tên bài chính thức sau khi tải';
  resolveRequest({ok:true,async json() {return {locale:'vi-VN',
    translations:calls[0].lines.map(x=>'Tiếng Việt: '+x)};}});
  await flushTicks();
  const translated=ctx.preferredLocalizedLyricsForDisplay(ctx.originalLyricsState);
  assert.equal(translated.translationLines.length,4,
    'The first playback should not require re-opening a song with updated metadata');
});
test('network failure automatically retries the current track, retaining successful batches',async () => {
  const {ctx,calls,timers,renders}=makePlayer({fetch:async(body,n)=>{
    if(n===1) return {ok:false,status:503};
    return {ok:true,async json() {return {locale:'vi-VN',translations:body.lines.map(x=>'Dịch: '+x)};}};
  }});
  ctx.originalLyricsState=originalLines(5);
  ctx.preferredLocalizedLyricsForDisplay(ctx.originalLyricsState);
  await flushTicks();
  assert.equal(calls.length,1);
  assert.equal(timers.length,1,'One automatic retry should be queued');
  assert.equal(timers[0].ms,1400);
  timers.shift().fn();
  await flushTicks();
  assert.equal(calls.length,2,'A failed first request should re-fetch without song switch');
  assert.equal(ctx.preferredLocalizedLyricsForDisplay(ctx.originalLyricsState).translationLines.length,5);
  assert.ok(renders.length>=1);
  assert.equal(ctx.viLyricTranslationFinished.size,1);
});
test('small first-verse batches render before long-song bulk batches complete',async () => {
  let releaseBulk;
  const bulk=new Promise(resolve=>{releaseBulk=resolve;});
  const {ctx,calls,renders}=makePlayer({fetch:async (body)=>{
    if(body.lines.length>5) await bulk;
    return {ok:true,async json() {
      return {locale:'vi-VN',translations:body.lines.map(x=>'Dịch: '+x)};
    }};
  }});
  ctx.originalLyricsState=originalLines(92);
  ctx.preferredLocalizedLyricsForDisplay(ctx.originalLyricsState);
  await flushTicks();
  const first=ctx.preferredLocalizedLyricsForDisplay(ctx.originalLyricsState);
  assert.ok(calls.some(c=>c.lines.length>5), 'Bulk translation should begin after first verse');
  assert.equal(first.translationLines.length,10,
    'First five-line batches must appear even before longer requests finish');
  releaseBulk();
  await flushTicks();
  assert.equal(ctx.preferredLocalizedLyricsForDisplay(ctx.originalLyricsState).translationLines.length,92);
  assert.ok(renders.length>=2);
});
test('stale-song jobs never mark a new same-lyrics track finished or erase its pending request',async () => {
  let resolveFirst;
  const first=new Promise(resolve=>{resolveFirst=resolve;});
  const {ctx,calls}=makePlayer({fetch:(body,n)=>n===1?first:{
    ok:true,async json(){return {locale:'vi-VN',translations:body.lines.map(x=>'Dịch: '+x)};}
  }});
  ctx.originalLyricsState=originalLines(4);
  ctx.preferredLocalizedLyricsForDisplay(ctx.originalLyricsState);
  await flushTicks(2);
  ctx.trackSwitchToken++;
  ctx.preferredLocalizedLyricsForDisplay(ctx.originalLyricsState);
  await flushTicks();
  assert.equal(calls.length,2,'New track must not wait for a previous song network request');
  assert.equal(ctx.preferredLocalizedLyricsForDisplay(ctx.originalLyricsState).translationLines.length,4);
  resolveFirst({ok:true,async json(){return {locale:'vi-VN',translations:Array(4).fill('Cũ')};}});
  await flushTicks();
  assert.equal(ctx.viLyricTranslationPending.size,0);
  const finalLyrics = ctx.preferredLocalizedLyricsForDisplay(ctx.originalLyricsState);
  assert.equal(finalLyrics.translationLines.length,4);
  assert.equal(finalLyrics.lines[0].translation, 'Dịch: Bài hát gốc 0',
    'Stale responses must never replace a newer song translation');
});
