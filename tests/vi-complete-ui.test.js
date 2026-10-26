'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..');
const src=fs.readFileSync(path.join(root,'public/js/i18n/i18n.js'),'utf8');
const css=fs.readFileSync(path.join(root,'public/css/index.css'),'utf8');
const startup=fs.readFileSync(path.join(root,'public/js/modules/10-shell/05-startup-bindings.js'),'utf8');
function getI18n(){
  const ctx={console,localStorage:{getItem(){return null;},setItem(){}},document:null};
  ctx.window=ctx;vm.createContext(ctx);
  for(const file of ['locales/zh-CN.js','locales/vi-VN.js','i18n.js'])
    vm.runInContext(fs.readFileSync(path.join(root,'public/js/i18n',file),'utf8'),ctx);
  return ctx.MineradioI18n;
}
test('visual consoles, Wallpaper Engine, lyrics detail and home interface have Vietnamese copy',()=>{
 const i=getI18n();
 for(const [original,expected] of [
  ['界面配色','Màu giao diện'],
  ['字体与排版','Phông chữ và bố cục'],
  ['未找到 Wallpaper Engine 本体','Không tìm thấy ứng dụng Wallpaper Engine'],
  ['正在读取项目设置…','Đang đọc cài đặt dự án…'],
  ['暂无评论','Chưa có bình luận'],
  ['发送','Gửi'],
  ['没有符合筛选条件的壁纸','Không có hình nền phù hợp bộ lọc'],
  ['展开播放器控制台','Mở bảng điều khiển phát nhạc'],
 ]) assert.equal(i.ui(original),expected);
 i.setLanguage('zh-CN');
 assert.equal(i.ui('暂无评论'),'暂无评论');
 i.setLanguage('vi-VN');
 assert.equal(i.ui('暂无评论'),'Chưa có bình luận');
});
test('Vietnamese layout is scoped to locale and responsive at narrow windows',()=>{
 assert.match(css,/html\[lang="vi-VN"\] :is\(#fx-panel, #playlist-panel/);
 assert.match(css,/overflow-wrap: anywhere/);
 assert.match(css,/max-height: calc\(100dvh - 28px\)/);
 assert.match(css,/@media \(max-width: 680px\)/);
 assert.match(css,/@media \(max-width: 390px\)/);
 assert.match(css,/flex-wrap: wrap/);
});
test('localized dynamic panels do not touch WebAudio, WebGL or arbitrary metadata',()=>{
 for(const name of ['renderWallpaperEngineLibrary','renderFxConsoleSearchResults','renderDetailComments','renderHomeDashboard']){
   assert.ok(startup.includes('afterLocalizedUiRender('+name));
 }
 assert.match(src,/data-playlist-title/);
 assert.match(src,/mini-queue-name/);
 assert.match(src,/bindUiAttributes\(node\)/);
 assert.doesNotMatch(src,/new MutationObserver/);
 assert.doesNotMatch(startup,/renderLyricTexture|HTMLAudioElement|requestAnimationFrame/);
});
