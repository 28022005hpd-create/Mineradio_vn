'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const context = { console, localStorage: { getItem() { return null; }, setItem() {} }, document: null };
context.window = context;
vm.createContext(context);
for (const file of ['locales/zh-CN.js', 'locales/vi-VN.js', 'i18n.js'])
  vm.runInContext(read('public/js/i18n/' + file), context);
const lang = context.MineradioI18n;
const hasHan = value => /[\u3400-\u9fff]/.test(value);

test('the entire task-first FX console category, section and item inventory is Vietnamese', () => {
  const ui = read('public/js/modules/07-fx/09-console-workspace.js');
  const fx = read('public/js/modules/07-fx/05-fx-panel-performance.js');
  const labels = [];
  for (const match of ui.matchAll(/\{\s*key:\s*'[^']+',\s*title:\s*'([^']+)',\s*hint:\s*'([^']+)'/g))
    labels.push(match[1], match[2]);
  for (const match of ui.matchAll(/fxConsoleItem\([^\n]+?,\s*'([^']+)',\s*'([^']+)'/g))
    labels.push(match[1]);
  for (const match of fx.matchAll(/(?:setFxSectionBefore(?:Node)?|setFxSliderLabel|ensureFxRangeControl)\([^\n]+?,\s*'([^']+)'(?:\s*,|\s*\))/g))
    labels.push(match[1]);
  assert.ok(labels.length > 190, 'inventory must stay comprehensive');
  const missing = [...new Set(labels.filter(hasHan).filter(x => hasHan(lang.ui(x))))];
  assert.deepEqual(missing, [], 'Every visual-console heading and control must be translated');
});

test('visual presets and palette labels are translated but artist credits are preserved', () => {
  const code = read('public/js/modules/07-fx/00-preset-archive-data.js');
  const labels = [];
  for (const m of code.matchAll(/^\s*\{\s*name:\s*'([^']+)',\s*(?:nameHtml:\s*'[^']+',\s*)?desc:\s*'([^']+)'/gm))
    labels.push(m[1], m[2]);
  for (const m of code.matchAll(/\{\s*name:\s*'([^']+)',\s*color:\s*'#[0-9a-f]{6}'/g))
    labels.push(m[1]);
  assert.ok(labels.length > 35);
  assert.deepEqual([...new Set(labels.filter(hasHan).filter(x => hasHan(lang.ui(x))))], []);
  assert.equal(lang.ui('作者 Ajin'), 'Tác giả Ajin');
  assert.equal(lang.ui('作者 CmzYa'), 'Tác giả CmzYa');
  assert.equal(lang.ui('星河'), 'Ngân hà');
});

test('search toolbar, archive controls and dynamic user settings use Vietnamese', () => {
  for (const label of [
    '搜索功能，如：粒子、缓存、歌词','撤销上一步设置','历史',
    '最近操作','用户存档','粘贴码','导入 JSON',
    '主入口使用 MR2 短代码复制/粘贴；旧 JSON 仍可拖拽或作为兼容备份导入。',
    '把 MR2 短代码粘到这里，也兼容旧 JSON 存档',
    '从剪贴板粘贴','复制码','新建空白存档','可继续创建，不限制 4 个'
  ]) assert.equal(hasHan(lang.ui(label)), false, 'Untranslated: ' + label);
  const source = read('public/js/modules/07-fx/09-console-workspace.js');
  assert.match(source, /fxConsoleUi\(meta\.label\)/);
  assert.match(source, /fxConsoleUi\(groupMeta\.title\)/);
  assert.match(source, /fxConsoleUi\(groupMeta\.hint/);
  assert.match(source, /fxConsoleUi\(entry\.title\)/);
  assert.match(source, /normalize\('NFD'\)/);
});

test('interface translation avoids renaming user archive slots and music metadata', () => {
  const a = { nodeType: 3, nodeValue: '星河' };
  const archive = { nodeType: 1, nodeName: 'DIV', id: '', className:'user-archive-name',
    hasAttribute() {return false;}, getAttribute() {return null;}, childNodes:[a] };
  const song = { nodeType: 3, nodeValue: '星河' };
  const music = { nodeType: 1, nodeName: 'DIV', id: '', className:'song-name',
    hasAttribute() {return false;}, getAttribute() {return null;}, childNodes:[song] };
  const presetText = { nodeType: 3, nodeValue:'星河' };
  const preset = { nodeType: 1, nodeName:'DIV', id:'', className:'pc-name',
    hasAttribute() {return false;}, getAttribute() {return null;}, childNodes:[presetText] };
  const panel = {nodeType:1,nodeName:'DIV',id:'fx-panel',className:'',
    hasAttribute() {return false;},getAttribute() {return null;},childNodes:[archive,music,preset]};
  lang.bindDynamicUi(panel);
  assert.equal(a.nodeValue,'星河');
  assert.equal(song.nodeValue,'星河');
  assert.equal(presetText.nodeValue,'Ngân hà');
  lang.setLanguage('zh-CN');
  lang.bindDynamicUi(panel);
  assert.equal(presetText.nodeValue,'星河');
  lang.setLanguage('vi-VN');
});

test('original QR images remain visible and NetEase can generate missing png from official QR URL', () => {
  const server=read('server.js');
  const player=read('public/js/modules/08-account/03-login-modal-flows.js');
  const css=read('public/css/index.css');
  assert.match(server,/const QRCode = require\('qrcode'\)/);
  assert.match(server,/await QRCode\.toDataURL\(qrurl/);
  assert.match(server,/sendJSON\(res, \{ img: qrimg, url: qrurl \}\)/);
  assert.match(player,/isQQ \|\| isKugou \|\| \(isNetease && manualCookieOpen\)/);
  assert.match(player,/api\/login\/qr\/key/);
  assert.match(player,/api\/login\/qr\/create/);
  assert.match(css, /#fx-panel \.preset-card :is\(\.pc-name, \.pc-desc/);
  assert.match(css, /#fx-panel \.fx-console-toolbar \.fx-panel-tabs button/);
});

test('re-rendering FX preset and archive panels triggers scoped Vietnamese localization', () => {
  const js=read('public/js/modules/10-shell/05-startup-bindings.js');
  for(const func of ['renderUserFxArchives','buildPresetGrid','refreshPresetGrid','organizeFxConsoleWorkspace','relabelFxPanelControls'])
    assert.ok(js.includes(func+' = afterLocalizedUiRender('+func+', \'fx-panel\')'), func);
  assert.doesNotMatch(js,/new MutationObserver/);
});

test('all visual-console action toasts have Vietnamese wording', () => {
  const names = [
    'public/js/modules/07-fx/07-bindings-shelf-immersive.js',
    'public/js/modules/07-fx/05-fx-panel-performance.js'
  ];
  let checked = 0;
  for (const name of names) {
    for (const line of read(name).split('\n')) {
      if (!line.includes('showFxUiToast(')) continue;
      for (const m of line.matchAll(/'([^'\n]*[\u3400-\u9fff][^'\n]*)'/g)) {
        ++checked;
        assert.equal(hasHan(lang.ui(m[1])), false, 'Untranslated FX toast: ' + m[1]);
      }
    }
  }
  assert.ok(checked >= 80, 'All visual effects and toggles must be covered');
});

test('system memory and cache paths keep user data intact while notices are Vietnamese', () => {
  const memory=read('public/js/modules/00-state/11-system-memory-controls.js');
  const cache=read('public/js/modules/07-fx/08-cache-storage-settings.js');
  assert.match(memory, /'RAM hệ thống ' \+ used/);
  assert.match(memory, /quyền quản trị/);
  assert.match(memory, /memoryUiToast\(/);
  for(const txt of ['系统内存读取失败','播放器压缩未完成','正在统计...','缓存设置不可用'])
    assert.equal(hasHan(lang.ui(txt)), false, txt);
  assert.match(cache, /id === 'cache-storage-total' \|\| id === 'cache-storage-note'/);
  assert.match(cache, /copy = MineradioI18n.ui\(copy\)/);
  const pathStore={ textContent: '' };
  const statusStore={ textContent: '' };
  const ctx={ MineradioI18n:lang,
    mineradioCacheStorageNode(id) { return id==='cache-storage-root' ? pathStore : statusStore; } };
  const snippet=cache.slice(cache.indexOf('function setMineradioCacheStorageText('),
    cache.indexOf('function applyMineradioCacheSettings('));
  vm.runInNewContext(snippet + '\nsetMineradioCacheStorageText("cache-storage-root", "C:\\\\音乐\\\\星河");\n' +
    'setMineradioCacheStorageText("cache-storage-total", "已占用 20 MB");',ctx);
  assert.equal(pathStore.textContent,'C:\\音乐\\星河');
  assert.equal(statusStore.textContent,'Đã sử dụng 20 MB');
});

test('NetEase key-based QR fallback survives a failed upstream image request', () => {
  const server=read('server.js');
  assert.match(server, /catch \(serviceError\)/);
  assert.match(server, /https:\/\/music\.163\.com\/login\?codekey=/);
  assert.match(server, /await QRCode\.toDataURL\(qrurl/);
  assert.match(server, /sendJSON\(res, \{ img: qrimg, url: qrurl \}\)/);
});
