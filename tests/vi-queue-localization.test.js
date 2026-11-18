'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
test('queue and playlist UI labels follow the locale but song metadata is untouched',()=>{
 const mini=fs.readFileSync(path.join(root,'public/js/modules/06-lyrics/01-playlist-panel-shell.js'),'utf8');
 const detail=fs.readFileSync(path.join(root,'public/js/modules/06-lyrics/02-playlist-detail.js'),'utf8');
 for(const message of ['队列为空，先搜索或打开歌单','队列为空，搜索后点 + 设为下一首','登录后显示我的播客']){
   assert.ok(mini.includes("MineradioI18n.ui('"+message+"')"));
 }
 assert.ok(detail.includes("MineradioI18n.ui('未找到歌单')"));
 assert.ok(detail.includes("MineradioI18n.ui('暂无播客数据')"));
 assert.ok(detail.includes("MineradioI18n.source(String(pl.trackCount) + ' 首')"));
 assert.match(mini,/escHtml\(song\.name\)/);
 assert.match(detail,/escHtml\(pl\.name\)/);
});
test('queue placeholders and counts switch between Vietnamese and Chinese',()=>{
 const c={console,document:null,localStorage:{getItem(){return null;},setItem(){}}};c.window=c;vm.createContext(c);
 for(const name of ['locales/zh-CN.js','locales/vi-VN.js','i18n.js'])vm.runInContext(fs.readFileSync(path.join(root,'public/js/i18n',name),'utf8'),c);
 const ui=c.MineradioI18n;
 assert.equal(ui.ui('登录后显示我的播客'),'Đăng nhập để xem podcast của tôi');
 assert.equal(ui.source('24 首'),'24 bài');
 ui.setLanguage('zh-CN');
 assert.equal(ui.ui('登录后显示我的播客'),'登录后显示我的播客');
});
