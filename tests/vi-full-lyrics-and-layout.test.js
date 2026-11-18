'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');

test('Vietnamese startup has no unbound Chinese-only placeholder text', () => {
  const html = fs.readFileSync(path.join(root, 'public/index.html'), 'utf8');
  assert.match(html, /<html lang="vi-VN">/);
  const chineseLeaves = [...html.matchAll(/<([a-z][\w-]*)\b([^<>]*?)>([^<>]*[\u3400-\u9fff][^<>]*)<\/\1>/gi)]
    .filter(m => !m[2].includes('data-i18n') && m[3].trim() &&
      !m[3].trim().startsWith('<!--'));
  assert.deepEqual(chineseLeaves.map(m => m[0]), [],
    'Static placeholders must be Vietnamese; dynamic song/artist data remains untouched');
});

test('more than 180 lyric lines are translated in timed batches without changing original lyrics', async () => {
  const calls = [];
  const displays = [];
  const original = { lines: Array.from({ length: 235 }, (_, index) => ({
    t: index * 2.5, duration: 2.5, text: 'Original line ' + index,
    translation: '原中文翻译', translationSource: 'provider'
  })), hasNativeKaraoke: true, timingSource: 'native' };
  const context = {
    console, Map, Set, Date, Promise,
    trackSwitchToken: 7,
    lyricSourceMode: 'original',
    originalLyricsState: original,
    fx: { lyricTranslationMode: 'multi' },
    currentLyricSong() { return { provider: 'netease', id: 42, name: '歌名', artist: '周杰伦' }; },
    isNoLyricText() { return false; },
    isLyricCreditLineText() { return false; },
    cloneLyricLines(lines) { return lines.map(line => ({ ...line })); },
    normalizeLyricTranslationText(value) { return String(value || '').trim(); },
    normalizeStageLyricText(value) { return String(value || '').trim(); },
    normalizeLyricTranslationMode(value) { return value; },
    fetch: async (_url, options) => {
      const request = JSON.parse(options.body);
      calls.push(request);
      return { ok: true, json: async () => ({
        locale: 'vi-VN',
        translations: request.lines.map(line => 'Tiếng Việt: ' + line)
      }) };
    },
    applyOriginalLyricsState() {
      displays.push(context.preferredLocalizedLyricsForDisplay(original));
    }
  };
  context.window = { MineradioI18n: { locale: 'vi-VN', onChange() {} } };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(
    path.join(root, 'public/js/modules/06-lyrics/00a-localized-lyric-translation.js'), 'utf8'
  ), context);
  const before = context.preferredLocalizedLyricsForDisplay(original);
  assert.equal(before.translationLines.length, 0);
  for (let n = 0; n < 80 && (!displays.length || displays.at(-1).translationLines.length < 235); n++) {
    await new Promise(resolve => setImmediate(resolve));
  }
  assert.equal(calls.length, 6, '235 lines must start with two fast batches and complete all lyrics');
  assert.ok(calls.every(call => call.locale === 'vi-VN' && call.lines.length <= 60));
  assert.ok(calls.slice(0, 2).every(call => call.lines.length <= 12), 'The first lines should render quickly');
  const last = context.preferredLocalizedLyricsForDisplay(original);
  assert.equal(last.translationLines.length, 235);
  assert.equal(last.lines[234].translationTime, 234 * 2.5);
  assert.equal(last.lines[234].text, 'Original line 234');
  assert.equal(last.lines[234].translation, 'Tiếng Việt: Original line 234');
  assert.equal(original.lines[234].translation, '原中文翻译', 'Provider data must not be overwritten');
  assert.equal(context.currentLyricSong().name, '歌名');
  assert.equal(context.currentLyricSong().artist, '周杰伦');
  context.window.MineradioI18n.locale = 'zh-CN';
  assert.equal(context.preferredLocalizedLyricsForDisplay(original), original);
  assert.equal(calls.length, 6, 'Switching UI language must not trigger extra translations');
});

test('Vietnamese CSS lets interface labels wrap but keeps music metadata elided', () => {
  const css = fs.readFileSync(path.join(root, 'public/css/index.css'), 'utf8');
  assert.match(css, /Vietnamese viewport and long-translation containment/);
  assert.match(css, /overflow-wrap:\s*anywhere/);
  assert.match(css, /\.song-name/);
  assert.match(css, /text-overflow:\s*ellipsis/);
  assert.match(css, /max-width:\s*calc\(100dvw - 20px\)/);
});
