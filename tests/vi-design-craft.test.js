'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

test('Vietnamese chrome supports keyboard focus and reduced-motion preference', () => {
  const css = fs.readFileSync(path.join(root, 'public/css/index.css'), 'utf8');
  const section = css.slice(css.lastIndexOf('/* Mineradio VN design-quality pass:'));
  assert.ok(section, 'Targeted UI-quality rules must be present');
  assert.match(section, /:focus-visible/);
  assert.match(section, /outline:\s*2px\s+solid/);
  assert.match(section, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(section, /transition-duration:\s*\.01ms/);
  assert.doesNotMatch(section, /(?:canvas-container|lyric-mesh|three\.js)/i,
    'Do not rewrite the music visualization engine for UI polish');
});

test('Vietnamese overflow check responds to resize and coalesces paints', async () => {
  const frames = [];
  const handlers = new Map();
  const classes = new Set();
  const el = {
    id: 'fx-language-setting', tagName: 'BUTTON', clientWidth: 110, scrollWidth: 108,
    clientHeight: 28, scrollHeight: 27,
    classList: { add(k) { classes.add(k); }, remove(k) { classes.delete(k); } },
    getClientRects() { return [{}]; }
  };
  const doc = {
    readyState: 'complete',
    documentElement: { lang: 'zh-CN' },
    getElementById() { return null; },
    querySelectorAll() { return [el]; },
    fonts: { ready: Promise.resolve() }
  };
  const ctx = {
    console, Promise, Set, Map,
    document: doc,
    localStorage: { getItem() { return null; }, setItem() {} },
    requestAnimationFrame(fn) { frames.push(fn); },
    addEventListener(name, fn) { handlers.set(name, fn); }
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  for (const file of ['locales/zh-CN.js', 'locales/vi-VN.js', 'i18n.js']) {
    vm.runInContext(fs.readFileSync(path.join(root, 'public/js/i18n', file), 'utf8'), ctx);
  }
  assert.equal(doc.documentElement.lang, 'vi-VN');
  assert.ok(handlers.has('resize'));
  assert.equal(frames.length, 1);
  // Simulate a font load and multiple fast window changes before next frame.
  el.scrollWidth = 190;
  handlers.get('resize')();
  handlers.get('resize')();
  await Promise.resolve();
  assert.equal(frames.length, 1, 'Only one layout frame should be queued');
  frames.shift()();
  assert.equal(classes.has('vi-copy-overflow'), true);
  assert.equal(ctx.MineradioI18n.getLayoutIssues().length, 1);
  el.scrollWidth = 85;
  handlers.get('resize')();
  assert.equal(frames.length, 1);
  frames.shift()();
  assert.equal(classes.has('vi-copy-overflow'), false);
  ctx.MineradioI18n.setLanguage('zh-CN');
  assert.equal(doc.documentElement.lang, 'zh-CN');
  assert.equal(ctx.MineradioI18n.getLayoutIssues().length, 0);
});

test('music titles and artist names remain provider-owned', () => {
  const source = fs.readFileSync(path.join(root, 'public/js/i18n/i18n.js'), 'utf8');
  const lyrics = fs.readFileSync(path.join(
    root, 'public/js/modules/06-lyrics/00a-localized-lyric-translation.js'), 'utf8');
  assert.match(source, /song-name\|song-artist\|song-title/);
  assert.match(lyrics, /delete line\.translation/);
  assert.match(lyrics, /line\.translationTime = line\.t/);
  assert.match(lyrics, /translate/);
});
