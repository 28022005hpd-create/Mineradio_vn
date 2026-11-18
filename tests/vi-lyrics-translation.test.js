'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createLyricTranslator } = require('../lyric-translation-service');

test('Vietnamese subtitle service retains order and caches duplicate source lines', async () => {
  const calls = [];
  const translate = createLyricTranslator({
    requestTranslation: async (source) => { calls.push(source); return 'VI: ' + source; }
  });
  assert.deepEqual(await translate(['Hello', 'Hello', '世界', ''], 'vi-VN'),
    ['VI: Hello', 'VI: Hello', 'VI: 世界', '']);
  assert.deepEqual(await translate(['世界', 'Hello'], 'vi-VN'), ['VI: 世界', 'VI: Hello']);
  assert.deepEqual(calls.sort(), ['Hello', '世界'].sort());
});

test('Vietnamese subtitle service rejects unsupported locale or oversized payload', async () => {
  const translate = createLyricTranslator({ requestTranslation: async source => source });
  await assert.rejects(translate(['hello'], 'zh-CN'), RangeError);
  await assert.rejects(translate(Array(181).fill('word'), 'vi-VN'), RangeError);
});

test('renderer uses locale-aware subtitles but never overwrites provider lyric state', () => {
  const root = path.join(__dirname, '..');
  const renderer = fs.readFileSync(path.join(root, 'public/js/modules/06-lyrics/00a-localized-lyric-translation.js'), 'utf8');
  const actions = fs.readFileSync(path.join(root, 'public/js/modules/05-playback/06-track-detail-lyrics-actions.js'), 'utf8');
  const loader = fs.readFileSync(path.join(root, 'public/js/index-loader.js'), 'utf8');
  assert.match(renderer, /viLyricTranslationLocale\(\) !== 'vi-VN'/);
  assert.match(renderer, /delete line\.translation/);
  assert.match(renderer, /token !== trackSwitchToken/);
  assert.match(actions, /preferredLocalizedLyricsForDisplay\(originalLyricsState\)/);
  assert.match(loader, /06-lyrics\/00a-localized-lyric-translation\.js/);
});
