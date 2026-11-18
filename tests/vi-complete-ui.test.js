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


test('Vietnamese viewport audit measures actual control overflow',()=>{
 const cls=()=>{const values=new Set();return{add:x=>values.add(x),remove:x=>values.delete(x),contains:x=>values.has(x)};};
 const wide={id:'wide',tagName:'BUTTON',clientWidth:88,scrollWidth:160,classList:cls(),getClientRects(){return[{}]}};
 const fit={id:'fit',tagName:'BUTTON',clientWidth:125,scrollWidth:100,classList:cls(),getClientRects(){return[{}]}};
 const i=getI18n(),rootNode={querySelectorAll(){return[wide,fit]}};
 assert.equal(i.auditLayout(rootNode).length,1);
 assert.equal(i.getLayoutIssues()[0].id,'wide');
 assert.equal(wide.classList.contains('vi-copy-overflow'),true);
 assert.equal(fit.classList.contains('vi-copy-overflow'),false);
 wide.scrollWidth=70;
 assert.equal(i.auditLayout(rootNode).length,0);
 assert.equal(wide.classList.contains('vi-copy-overflow'),false);
 i.setLanguage('zh-CN');
 assert.equal(i.auditLayout(rootNode).length,0);
});


test('3D visual controls, wallpaper previews and song detail labels are localized',()=>{
 const i=getI18n();
 const messages=[
  ['音频监视器','Trình giám sát âm thanh'],
  ['3D 播客','Podcast 3D'],
  ['WE 音频强度','Cường độ âm thanh WE'],
  ['Scene · Wallpaper Engine 原生实时运行','Scene · chạy trực tiếp bằng Wallpaper Engine'],
  ['歌手','Nghệ sĩ'],['评论','Bình luận'],['预设与存档','Cấu hình và kho lưu']
 ];
 for(const [a,b] of messages)assert.equal(i.ui(a),b);
 i.setLanguage('zh-CN');
 assert.equal(i.ui('歌手'),'歌手');
});


test('two-line Vietnamese buttons are detected when fixed height clips the second line',()=>{
 const state=new Set();
 const item={id:'two-line',tagName:'BUTTON',clientWidth:180,scrollWidth:180,
   clientHeight:26,scrollHeight:49,
   classList:{add:x=>state.add(x),remove:x=>state.delete(x)},
   getClientRects(){return[{}]}};
 const i=getI18n(),rootNode={querySelectorAll(){return[item]}};
 const problems=i.auditLayout(rootNode);
 assert.equal(problems.length,1);
 assert.equal(problems[0].neededHeight,49);
 assert.equal(state.has('vi-copy-overflow'),true);
});
