'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname,'..');
const fallback = require('../lyric-fallback-service');
const read = file => fs.readFileSync(path.join(root,file),'utf8');
const synced = '[00:06.12]Đêm nay trời xanh\n[00:11.52]Mong ngày mai bình yên';
const meta = {title:'Bài hát thử',artist:'Ca sĩ A',album:'Album X',duration:176};

test('verified exact LRC from LRCLIB is accepted and cached for the same song',async () => {
  let calls = 0;
  const resolve = fallback.createFallbackResolver({getJson:async (url) => {
    ++calls;
    assert.match(url,/track_name=/);
    return {id:12,trackName:meta.title,artistName:meta.artist,albumName:meta.album,
      duration:176,syncedLyrics:synced, instrumental:false};
  }});
  const first = await resolve(meta);
  assert.equal(first.lyric,synced);
  assert.equal(first.timingVerified,true);
  assert.equal(first.source,'lrclib-synced');
  assert.equal((await resolve(meta)).lyric,synced);
  assert.equal(calls,1);
});
test('never use similarly named song by wrong singer or incorrect duration',async () => {
  const resolve = fallback.createFallbackResolver({getJson:async url => url.includes('/api/get')
    ? {trackName:meta.title,artistName:'Khác ca sĩ',duration:176,syncedLyrics:synced}
    : [
      {trackName:meta.title,artistName:meta.artist,duration:220,syncedLyrics:synced},
      {trackName:'Bài hát khác',artistName:meta.artist,duration:176,syncedLyrics:synced}
    ]});
  assert.equal(await resolve(meta),null);
});
test('plain lyrics and untimed/instrumental responses never become fabricated karaoke',async () => {
  const resolve = fallback.createFallbackResolver({getJson:async () => ({
    trackName:meta.title,artistName:meta.artist,duration:176,
    plainLyrics:'Câu một\nCâu hai',syncedLyrics:'',instrumental:false
  })});
  assert.equal(await resolve(meta),null);
  assert.equal(fallback.validSyncedLyrics('[00:00.00]Một dòng duy nhất'),false);
  assert.equal(fallback.verifyRecord({
    trackName:meta.title,artistName:meta.artist,duration:176,
    syncedLyrics:synced,instrumental:true},meta),false);
});
test('LRCLIB lookup misses do not throw or interrupt playback',async () => {
  const resolve = fallback.createFallbackResolver({getJson:async () => { throw Error('offline'); }});
  assert.equal(await resolve(meta),null);
  assert.equal(await resolve(meta),null);
});
test('lyrics fetch uses desktop local cache then alternate service only when provider is missing', () => {
  const client=read('public/js/modules/06-lyrics/00-lyrics-fetch-parse.js');
  const detail=read('public/js/modules/05-playback/06-track-detail-lyrics-actions.js');
  const server=read('server.js');
  const pkg=JSON.parse(read('package.json'));
  assert.match(client,/await readPersistentLyricCache\(song\)/);
  assert.match(client,/if \(!state\.usableLyric\)/);
  assert.match(client,/resolveMissingLyricsForSong\(song, token\)/);
  assert.match(client,/result\.timingVerified/);
  assert.match(client,/applyFetchedLyricResponse\(song, token, result\)/);
  assert.match(client,/writePersistentLyricCache\(song, result\)/);
  assert.match(server,/pn === '\/api\/lyrics\/fallback'/);
  assert.ok(pkg.build.files.includes('lyric-fallback-service.js'));
  assert.match(detail,/LRCLIB · lời hát đồng bộ/);
});
test('song reviews preserve original, translated comment is shown in distinct layer', () => {
  const code=read('public/js/modules/05-playback/06-track-detail-lyrics-actions.js');
  assert.match(code,/function translateDetailCommentsToVietnamese/);
  assert.match(code,/body: JSON\.stringify\(\{ locale: 'vi-VN', lines: chunks \}\)/);
  assert.match(code,/comment-vi-translation/);
  assert.match(code,/escHtml\(sourceText\)/);
  assert.match(code,/escHtml\(translated\)/);
  assert.match(code,/seq !== trackDetailSeq/);
  assert.match(code,/Bình luận NetEase Cloud Music/);
  assert.doesNotMatch(code,/c\.content\s*=\s*translated/);
  const style=read('public/css/index.css');
  assert.match(style,/#track-detail-modal \.comment-vi-translation:not\(\[hidden\]\)/);
});
