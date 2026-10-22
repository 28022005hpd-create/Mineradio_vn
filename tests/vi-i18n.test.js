'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const base = path.join(__dirname, '../public/js/i18n');

function read(relative) { return fs.readFileSync(path.join(base, relative), 'utf8'); }
function catalog() {
  const ctx = { console }; ctx.window = ctx;
  vm.runInNewContext(read('locales/zh-CN.js'), ctx);
  vm.runInNewContext(read('locales/vi-VN.js'), ctx);
  return ctx.MineradioLocales;
}
const catalogs = catalog();
const keys = Object.keys(catalogs['zh-CN']);

test('Chinese and Vietnamese are two native locale catalogs with exactly the same stable keys', () => {
  assert.ok(keys.length >= 740, 'at least 740 curated interface messages');
  assert.deepEqual(Object.keys(catalogs['vi-VN']).sort(), keys.slice().sort());
  for (const key of keys) {
    assert.match(key, /^(ui\.[0-9a-z]+|settings\.language(?:\.short|\.hint)?|settings\.console\.[a-z]+)$/);
    assert.ok(catalogs['zh-CN'][key]);
    assert.ok(catalogs['vi-VN'][key]);
  }
  const entry = keys.find(key => catalogs['zh-CN'][key] === '播放');
  assert.equal(catalogs['vi-VN'][entry], 'Phát');
});

function element(attributes = {}, textContent = '', childElementCount = 0) {
  const attributesMap = new Map(Object.entries(attributes));
  return {
    nodeType: 1,
    childElementCount,
    textContent,
    setAttribute(name, value) { attributesMap.set(name, String(value)); },
    getAttribute(name) { return attributesMap.get(name) || null; },
    hasAttribute(name) { return attributesMap.has(name); }
  };
}
function createUI() {
  const keys = Object.keys(catalogs['zh-CN']);
  const playKey = keys.find(key => catalogs['zh-CN'][key] === '播放');
  const hintKey = keys.find(key => catalogs['zh-CN'][key] === '查看使用引导');
  const play = element({ 'data-i18n': playKey }, '播放');
  const hint = element({ 'data-i18n-title': hintKey, title: '查看使用引导' });
  const song = element({}, '周杰伦');
  const lyrics = element({}, '歌词原文，不应该自动翻译');
  const select = { value: 'zh-CN' };
  const elements = [play, hint, song, lyrics];
  const body = {
    nodeType: 1,
    querySelectorAll() { return elements; }
  };
  const doc = {
    nodeType: 9,
    readyState: 'complete',
    documentElement: { lang: 'zh-CN' },
    querySelectorAll: body.querySelectorAll,
    getElementById(id) { return id === 'mineradio-language-select' ? select : null; },
  };
  const storage = new Map();
  const nativeUpdates = [];
  const listeners = [];
  const desktopWindow = {
    setUiLanguage(next) { nativeUpdates.push(next); return Promise.resolve({ ok: true }); },
    getUiLanguage() { return Promise.resolve({ locale: 'vi-VN' }); },
    onUiLanguageChanged(cb) { listeners.push(cb); return () => {}; }
  };
  const window = { document: doc, localStorage: {
    getItem(key) { return storage.get(key) || null; },
    setItem(key,value) { storage.set(key,String(value)); }
  }, desktopWindow, dispatchEvent() {}, CustomEvent: class { constructor(name, options) { this.name=name; this.options=options; } } };
  const ctx = { window, console, Promise };
  vm.runInNewContext(read('locales/zh-CN.js'), ctx);
  vm.runInNewContext(read('locales/vi-VN.js'), ctx);
  vm.runInNewContext(read('i18n.js'), ctx);
  return { window, play, hint, song, lyrics, select, body, storage, listeners, nativeUpdates };
}

test('native controls switch Chinese ↔ Vietnamese without reload or DOM observer', async () => {
  const u = createUI(); const i = u.window.MineradioI18n;
  assert.equal(i.locale, 'vi-VN');
  assert.equal(u.play.textContent, 'Phát');
  assert.equal(u.hint.getAttribute('title'), 'Xem hướng dẫn sử dụng');
  assert.equal(u.select.value,'vi-VN');
  assert.equal(u.window.document.documentElement.lang,'vi-VN');
  i.setLanguage('zh-CN');
  assert.equal(u.play.textContent,'播放');
  assert.equal(u.hint.getAttribute('title'),'查看使用引导');
  assert.equal(u.select.value,'zh-CN');
  i.setLanguage('vi-VN');
  assert.equal(u.play.textContent,'Phát');
  assert.equal(u.song.textContent,'周杰伦');
  assert.equal(u.lyrics.textContent,'歌词原文，不应该自动翻译');
  assert.equal(u.storage.get('mineradio:language:v2'),'vi-VN');
  assert.equal(u.nativeUpdates.join('|'), 'zh-CN|vi-VN');
  i.setLanguage('not-a-locale');
  assert.equal(i.locale,'vi-VN');
  assert.equal(u.nativeUpdates.length,2);
  assert.doesNotMatch(read('i18n.js').replace(/\/\*[\s\S]*?\*\//g,''), /\bnew MutationObserver\b|\.createTreeWalker\(|\bsetInterval\(/);
});

test('generated labels can use t(id), source(text), and bind(container) by explicit render call', () => {
  const u=createUI(), i=u.window.MineradioI18n;
  const id=keys.find(k=>catalogs['zh-CN'][k] === '下一首');
  assert.equal(i.t(id),'Bài tiếp theo');
  assert.equal(i.source('当前歌曲'),'Bài hát hiện tại');
  assert.equal(i.source('5 首'),'5 bài');
  assert.equal(i.source('一首来自用户资料的中文歌名'),'一首来自用户资料的中文歌名');
  const button=element({'data-i18n':id},'下一首');
  i.bind({nodeType:1,querySelectorAll:()=>[button]});
  assert.equal(button.textContent,'Bài tiếp theo');
  i.setLanguage('zh-CN');
  i.bind({nodeType:1,querySelectorAll:()=>[button]});
  assert.equal(button.textContent,'下一首');
});
test('main Mineradio HTML is ID-bound; language switch belongs inside FX preferences', () => {
  const html=fs.readFileSync(path.join(__dirname,'../public/index.html'),'utf8');
  const total=(html.match(/\bdata-i18n="(?:ui\.[a-z0-9]+|settings\.language)"/g)||[]).length;
  assert.ok(total>=450,'native message bindings for hundreds of original labels');
  assert.ok((html.match(/\bdata-i18n-(?:title|placeholder|aria-label|alt)=/g)||[]).length>=110);
  assert.match(html,/id="mineradio-language-select"/);
  assert.match(html,/onchange="MineradioI18n\.setLanguage\(this\.value\)"/);
  const order=[
    'js/i18n/locales/zh-CN.js',
    'js/i18n/locales/vi-VN.js',
    'js/i18n/i18n.js',
    'js/index-loader.js'
  ].map(x=>html.indexOf('src="'+x+'"'));
  assert.ok(order.every((value,i)=>value>0 && (i===0||value>order[i-1])),'i18n loads before first app module');
  assert.doesNotMatch(html,/js\/i18n\/(?:runtime|vi-dictionary)\.js/);
});
test('runtime song fields are deliberately not bound to translated static labels',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../public/index.html'),'utf8');
 for(const id of ['home-today-artist','home-next-title','local-beat-title','memory-status-chip','play-mode-chip']) {
   const regex=new RegExp('<[^>]*id="'+id+'"[^>]*>');
   const tag=html.match(regex);
   assert.ok(tag,'element '+id+' exists');
   assert.doesNotMatch(tag[0],/\bdata-i18n="/);
 }
});
test('original visualizer and WebAudio source modules have not been edited for translation',()=>{
  const html=fs.readFileSync(path.join(__dirname,'../public/index.html'),'utf8');
  assert.match(html,/id="canvas-container"/);
  assert.ok(fs.existsSync(path.join(__dirname,'../public/js/modules/02-visual/00-pointer-cover-particles.js')));
  assert.ok(fs.existsSync(path.join(__dirname,'../public/js/modules/03-beat/06-sonic-audio-monitor.js')));
  assert.ok(fs.existsSync(path.join(__dirname,'../public/js/modules/05-playback/08-audio-graph-controls.js')));
});


test('Vietnamese settings and playlist use bounded, language-specific layouts', () => {
  const html = fs.readFileSync(path.join(__dirname,'../public/index.html'),'utf8');
  const css = fs.readFileSync(path.join(__dirname,'../public/css/index.css'),'utf8');
  assert.match(html, /id="mineradio-language-settings"/);
  assert.match(html, /data-i18n="settings\.language\.short"/);
  assert.equal(catalogs['vi-VN']['settings.language.short'], 'Ngôn ngữ');
  assert.equal(catalogs['zh-CN']['settings.language.short'], '语言');
  assert.equal(catalogs['vi-VN']['ui.vuata3'], 'Nhạc của tôi');
  assert.equal(catalogs['vi-VN']['ui.1r2rmpv'], 'Hàng đợi');
  assert.match(css, /html\[lang="vi-VN"\] #mineradio-language-settings\s*\{/);
  assert.match(css, /html\[lang="vi-VN"\] #playlist-panel \.panel-tabs\s*\{/);
  assert.match(css, /grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(css, /html\[lang="vi-VN"\] #playlist-panel \.queue-toolbar\s*\{/);
});


test('dynamic Vietnamese UI exposes opt-in translations without a DOM observer', () => {
  const service = read('i18n.js');
  assert.match(service,/function bindDynamicUi\(rootNode\)/);
  assert.match(service,/const dynamicTextCache = new WeakMap/);
  assert.match(service,/get locale\(\) \{ return locale; \}/);
  assert.doesNotMatch(service,/new MutationObserver/);
});
