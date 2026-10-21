'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..','public','js','i18n');
const ctx={console,localStorage:{getItem(){return null;},setItem(){}},document:null};
ctx.window=ctx;vm.createContext(ctx);
for(const name of ['locales/zh-CN.js','locales/vi-VN.js','i18n.js']){
 vm.runInContext(fs.readFileSync(path.join(root,name),'utf8'),ctx);
}
test('dynamic account and login UI copy follows active selected locale',()=>{
 const i=ctx.MineradioI18n;
 assert.equal(i.locale,'vi-VN');
 assert.equal(i.ui('扫码登录酷狗音乐'),'Đăng nhập bằng QR KuGou Music');
 assert.equal(i.ui('QQ 音乐登录已失效'),'QQ Music登录已失效');
 assert.equal(i.ui('UID: 2048 / 普通用户'),'UID: 2048 / Tài khoản thường');
 i.setLanguage('zh-CN');
 assert.equal(i.ui('扫码登录酷狗音乐'),'扫码登录酷狗音乐');
 i.setLanguage('vi-VN');
 assert.equal(i.ui('正在打开下载页'),'Đang mở trang tải xuống');
});
test('explicit dynamic UI binding restores Chinese and never mutates nickname',()=>{
 const i=ctx.MineradioI18n;
 const uiNode={nodeType:3,nodeValue:'扫码登录酷狗音乐'};
 const nickname={nodeType:3,nodeValue:'周杰伦'};
 const uiBlock={nodeType:1,nodeName:'DIV',id:'login-modal',hasAttribute(){return false;},childNodes:[uiNode]};
 const nameBlock={nodeType:1,nodeName:'DIV',id:'user-modal-name',hasAttribute(){return false;},childNodes:[nickname]};
 const wrapper={nodeType:1,nodeName:'DIV',id:'',hasAttribute(){return false;},childNodes:[uiBlock,nameBlock]};
 i.bindDynamicUi(wrapper);
 assert.equal(uiNode.nodeValue,'Đăng nhập bằng QR KuGou Music');
 assert.equal(nickname.nodeValue,'周杰伦');
 i.setLanguage('zh-CN');
 i.bindDynamicUi(wrapper);
 assert.equal(uiNode.nodeValue,'扫码登录酷狗音乐');
 i.setLanguage('vi-VN');
 i.bindDynamicUi(wrapper);
 assert.equal(uiNode.nodeValue,'Đăng nhập bằng QR KuGou Music');
});
test('dynamic locale work is scoped to login/account/update panels, not song metadata',()=>{
 const f=fs.readFileSync(path.join(__dirname,'..','public/js/modules/10-shell/05-startup-bindings.js'),'utf8');
 assert.match(f,/\['login-modal','user-modal','update-modal'\]/);
 assert.doesNotMatch(f,/bindDynamicUi\(document\)/);
});
