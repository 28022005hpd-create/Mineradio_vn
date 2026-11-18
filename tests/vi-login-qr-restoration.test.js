'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'public/js/modules/08-account/03-login-modal-flows.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'public/index.html'), 'utf8');

function functionBlock(startName, nextName) {
  const start = src.indexOf('function ' + startName + '(');
  const end = src.indexOf('function ' + nextName + '(', start);
  assert.ok(start >= 0 && end > start);
  return src.slice(start, end);
}
test('login opens its authentication drawer immediately and initializes inline NetEase QR', () => {
  const calls = [];
  const context = {
    loginProvider: 'netease', window: { MineradioI18n: { bindDynamicUi() {} } },
    document: { getElementById() { return {}; } },
    bindLoginWorkflowPointerEvents() { calls.push('bind'); },
    setLoginAuthDrawerOpen(state) { calls.push('drawer:' + state); },
    updateLoginProviderUi() { calls.push('ui'); },
    scheduleLoginWorkflowEdges() {}, refreshQr() { calls.push('qr'); },
  };
  vm.runInNewContext(functionBlock('resumeLoginModalAfterGate', 'closeLoginModal') +
    '\nresumeLoginModalAfterGate();', context);
  assert.deepEqual(calls.slice(0,4), ['bind','drawer:true','ui','qr']);
});

test('switching providers does not require the MR connector or hide the login drawer', () => {
  const calls = [];
  const context = {
    loginProviderClickSuppressed: false,
    qrKey: 'old',
    normalizeLoginProviderKey(provider) { return provider; },
    setLoginProvider(provider) { calls.push('select:' + provider); },
    setLoginAuthDrawerOpen(state) { calls.push('drawer:' + state); },
    updateLoginProviderUi() {},
    refreshQr() { calls.push('qr'); },
    stopQrPoll() { calls.push('stop'); }
  };
  const code = functionBlock('selectLoginProviderNode', 'connectLoginProviderToMr');
  vm.runInNewContext(code, context);
  vm.runInNewContext('selectLoginProviderNode("netease");', context);
  assert.deepEqual(calls, ['select:netease','drawer:true','qr']);
  calls.length = 0;
  vm.runInNewContext('selectLoginProviderNode("qq");', context);
  assert.deepEqual(calls, ['select:qq','drawer:true','stop']);
  assert.equal(context.qrKey, null);
});

test('desktop code no longer blocks NetEase QR and offers official login as fallback', () => {
  const qrCode = src.slice(src.indexOf('async function refreshQr()'),
    src.indexOf('function startQrPoll()'));
  assert.match(qrCode, /api\/login\/qr\/key/);
  assert.match(qrCode, /api\/login\/qr\/create/);
  assert.match(qrCode, /startQrPoll\(\)/);
  assert.doesNotMatch(qrCode, /if \(window\.desktopWindow && typeof window\.desktopWindow\.openNeteaseMusicLogin/);
  assert.match(src, /fallbackBtn\.style\.display = isNetease && canOpenNeteaseWeb/);
  assert.match(src, /isQQ \|\| isKugou \|\| \(isNetease && manualCookieOpen\)/);
  assert.match(html, /id="login-web-fallback-btn"[^>]+onclick="openProviderWebLogin\(\)"/);
});

test('the main login action works without a successful connector animation', () => {
  const begin = src.indexOf('function startSelectedLoginConnection()');
  const end = src.indexOf('function connectLoginMode(', begin);
  const block = src.slice(begin, end);
  assert.match(block, /connectLoginMode\(loginWorkflowActiveMode\(\)\)/);
  assert.doesNotMatch(block, /先把左侧接口拖到 MR/);
  assert.doesNotMatch(block, /hasLoginWorkflowConnection/);
});

test('QR and login status have Vietnamese alternatives and keep metadata untouched', () => {
  assert.match(src, /Chưa tạo được mã QR/);
  assert.match(src, /Dùng ứng dụng NetEase Cloud Music quét mã QR/);
  assert.match(src, /loginProviderDisplayName/);
  assert.match(src, /Mở trang đăng nhập/);
  assert.doesNotMatch(src, /track\.title\s*=/);
});

test('explicit native web login does not silently reuse stale NetEase or QQ cookies', () => {
  const desktop = fs.readFileSync(path.join(root, 'desktop/main.js'), 'utf8');
  const preload = fs.readFileSync(path.join(root, 'desktop/preload.js'), 'utf8');
  const netease = desktop.slice(desktop.indexOf('async function openNeteaseMusicLoginWindow('),
    desktop.indexOf('async function openQQMusicLoginWindow('));
  assert.match(netease, /options\.forceReauth === true/);
  assert.ok(netease.indexOf('clearStorageData') < netease.indexOf('const initialCookie'),
    'Fresh reauthentication must clear stale browsing cookies before reuse checks');
  assert.match(netease, /visibilityTimer = setTimeout\(presentLoginWindow/);
  const qq = desktop.slice(desktop.indexOf('async function openQQMusicLoginWindow('),
    desktop.indexOf('async function clearQQMusicLoginSession('));
  assert.match(qq, /qqCookieHasPlaybackLogin\(initialCookie\) && !options\.forceReauth/);
  assert.match(preload, /openNeteaseMusicLogin: \(options\) => ipcRenderer\.invoke\('netease-music-open-login', options \|\| \{\}\)/);
  assert.match(src, /openNeteaseMusicLogin\(\{ forceReauth: true \}\)/);
  assert.match(src, /forceReauth: !qqLoginStatus\.loggedIn/);
});
