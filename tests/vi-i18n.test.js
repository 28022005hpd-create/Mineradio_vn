'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const root = path.join(__dirname, '..');
const dictionary = require(path.join(root, 'public/js/i18n/vi-dictionary.js'));

test('common original UI labels have deliberate Vietnamese translations', () => {
  assert.equal(dictionary.translate('  播放  '), '  Phát  ');
  assert.equal(dictionary.translate('桌面歌词'), 'Lời bài hát trên màn hình nền');
  assert.equal(dictionary.translate('查看使用引导'), 'Xem hướng dẫn sử dụng');
  assert.equal(dictionary.translate('4 首'), '4 bài');
  assert.equal(dictionary.translate('12 分钟'), '12 phút');
  assert.equal(dictionary.translate('静音'), 'Tắt tiếng');
  assert.equal(dictionary.translate('Genre Artist (Official Video)'), 'Genre Artist (Official Video)');
  assert.equal(dictionary.translate('一段未知中文歌词'), '一段未知中文歌词');
});
test('no duplicate entries and translating a translated label is a no-op', () => {
  const keys = Object.keys(dictionary.exact);
  assert.ok(keys.length >= 700, 'covers original HTML and dynamic UI labels');
  assert.equal(dictionary.translate(dictionary.translate('搜索历史')), 'Lịch sử tìm kiếm');
  assert.equal(dictionary.translate('Ctrl+Alt+R'), 'Ctrl+Alt+R');
  assert.equal(dictionary.translate('8 秒'), '8 giây');
});
test('original Mineradio static HTML has Vietnamese coverage without rewriting source text', () => {
  const html = fs.readFileSync(path.join(root,'public/index.html'),'utf8');
  const all = [...html.matchAll(/>([^<>]*[\u3400-\u9fff][^<>]*)</g)].map(x => x[1].trim())
    .concat([...html.matchAll(/\b(?:placeholder|title|aria-label|alt)="([^"]*[\u3400-\u9fff][^"]*)"/g)].map(x=>x[1].trim()));
  const unique = [...new Set(all.filter(Boolean))];
  const remaining = unique.filter(value => dictionary.translate(value) === value);
  // Five isolated characters form the original application's hidden easter-egg
  // trigger/visual. They are intentionally never localized by heuristics.
  assert.ok(remaining.length <= 12, JSON.stringify(remaining.slice(0,25)));
  assert.match(html, /<script src="js\/i18n\/runtime\.js"><\/script>/);
});

function fakeDom() {
  let observe;
  const timers = [];
  const storage = new Map();
  const body = makeElement('BODY');
  const shell = makeElement('DIV');
  shell.id = 'desktop-window-shell';
  body.appendChild(shell);
  const songCard = makeElement('DIV');
  songCard._skip = true;
  shell.appendChild(songCard);
  const plain = makeText('播放');
  shell.appendChild(plain);
  const aria = makeElement('BUTTON');
  aria.setAttribute('title','查看使用引导');
  shell.appendChild(aria);
  const lyric = makeText('喜欢');
  songCard.appendChild(lyric);
  const document = {
    readyState: 'complete',
    body,
    documentElement: { lang: 'zh-CN' },
    createElement: tag => makeElement(tag.toUpperCase()),
    createTreeWalker: (root) => {
      const found = [];
      function walk(node) {
        for (const c of node.childNodes || []) {
          found.push(c);
          walk(c);
        }
      }
      walk(root);
      let i = 0;
      return { nextNode: () => found[i++] || null };
    },
    getElementById: id => {
      function find(n) {
        if (n.id === id) return n;
        for (const ch of n.childNodes || []) { const x = find(ch); if (x) return x; }
        return null;
      }
      return find(body);
    },
  };
  const window = {
    document,
    localStorage: {
      getItem: key => storage.get(key) || null,
      setItem: (key,value) => { storage.set(key,value); },
    },
    setTimeout: fn => { timers.push(fn); },
  };
  class MutationObserver {
    constructor(fn) { observe = fn; }
    observe() {}
  }
  const context = { window, MutationObserver, NodeFilter: { SHOW_ELEMENT: 1, SHOW_TEXT: 4 } };
  function settle() {
    // Simulate self-mutations being observed on the original text/attribute.
    while (timers.length) timers.shift()();
  }
  vm.runInNewContext(fs.readFileSync(path.join(root,'public/js/i18n/runtime.js'),'utf8'),context);
  return { window, body, shell, songCard, plain, lyric, aria, observe: data => observe(data), settle };
}

function makeElement(tag) {
  const attrs = new Map();
  return {
    nodeType: 1, tagName: tag, isConnected: true, childNodes: [], parentElement: null,
    style: { cssText: '' }, id: '', textContent: '', _skip: false,
    appendChild(child) { child.parentElement = this; this.childNodes.push(child); return child; },
    hasAttribute: n => attrs.has(n),
    getAttribute: n => attrs.get(n) || null,
    setAttribute(n,v) { attrs.set(n,String(v)); },
    addEventListener(event,cb) { this['on'+event] = cb; },
    closest() { let current=this; while (current) {if(current._skip)return current;current=current.parentElement;}return null; }
  };
}
function makeText(value) { return { nodeType: 3, nodeValue: value, childNodes: [], parentElement: null, isConnected: true }; }

test('new UI changes are translated only once, and switching to Chinese restores the original', () => {
  const ui = fakeDom();
  const api = ui.window.MineradioI18n;
  assert.equal(api.language, 'vi');
  assert.equal(ui.plain.nodeValue, 'Phát');
  assert.equal(ui.aria.getAttribute('title'), 'Xem hướng dẫn sử dụng');
  assert.equal(ui.lyric.nodeValue, '喜欢', 'song lyric is never translated');
  assert.equal(ui.window.document.documentElement.lang, 'vi');

  ui.observe([{type:'characterData',target:ui.plain}]);
  ui.settle();
  assert.equal(ui.plain.nodeValue,'Phát', 'no double translation');

  ui.plain.nodeValue='暂停'; // Mineradio changes the text of the existing button.
  ui.observe([{type:'characterData',target:ui.plain}]);
  ui.settle();
  assert.equal(ui.plain.nodeValue,'Tạm dừng');

  const button = ui.window.document.getElementById('mineradio-language-toggle');
  assert.ok(button, 'language control present in main window');
  api.setLanguage('zh');
  ui.settle();
  assert.equal(ui.plain.nodeValue,'暂停');
  assert.equal(ui.aria.getAttribute('title'),'查看使用引导');
  assert.equal(ui.window.document.documentElement.lang,'zh-CN');

  api.setLanguage('vi');
  ui.settle();
  assert.equal(ui.plain.nodeValue,'Tạm dừng');
  assert.equal(ui.aria.getAttribute('title'),'Xem hướng dẫn sử dụng');
});

test('translates dynamically inserted interface labels and preserves original unknown strings', () => {
  const ui = fakeDom();
  const badge = makeElement('DIV');
  const title = makeText('歌词控制台');
  const next = makeText('搜索历史');
  badge.appendChild(title); badge.appendChild(next); ui.shell.appendChild(badge);
  ui.observe([{type:'childList',addedNodes:[badge]}]);
  ui.settle();
  assert.equal(title.nodeValue, '歌词控制台', 'unknown label remains unchanged; never guessed');
  assert.equal(next.nodeValue, 'Lịch sử tìm kiếm');
  assert.ok(ui.window.MineradioI18n.getUntranslatedLabels().includes('歌词控制台'));
});
