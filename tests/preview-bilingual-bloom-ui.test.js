'use strict';
/* The old Windows CI only checked that source files existed. This test executes
 * the actual shipped presets and console registry: Bloom must appear first,
 * and language select must be registered in System, not swallowed as "Other".
 */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const publicRoot=process.env.MINERADIO_PREVIEW_PUBLIC_ROOT ?
  path.resolve(process.env.MINERADIO_PREVIEW_PUBLIC_ROOT) :
  path.resolve(__dirname,'..','public');
function read(p){return fs.readFileSync(path.join(publicRoot,p),'utf8');}
const html=read('index.html');
test('Installed HTML ships the language picker and every executable dependency',()=>{
  assert.match(html,/<select id="mineradio-language-select"/);
  assert.match(html,/<option value="vi-VN">Tiếng Việt<\/option>/);
  assert.match(html,/<option value="zh-CN">简体中文<\/option>/);
  for(const p of ['js/i18n/locales/zh-CN.js','js/i18n/locales/vi-VN.js',
    'js/i18n/i18n.js','js/index-loader.js']) {
    assert.ok(html.includes('src="'+p+'"'),'Entry HTML must load '+p);
    assert.ok(fs.existsSync(path.join(publicRoot,p)),'Installed file missing '+p);
  }
  const loader=read('js/index-loader.js');
  for(const p of [
    'js/modules/02-visual/16-bloom-lyric-glyphs.js',
    'js/modules/07-fx/04a-bloom-lyrics-native.js',
    'js/modules/07-fx/00-preset-archive-data.js',
    'js/modules/07-fx/04-preset-grid-uniforms.js',
    'js/modules/07-fx/09-console-workspace.js',
    'js/modules/11-main-loop.js'
  ]){
    assert.ok(loader.includes("'"+p+"'"),'Installed loader must execute '+p);
    assert.ok(fs.existsSync(path.join(publicRoot,p)),'Installed JavaScript missing '+p);
  }
});
test('Actual Mineradio preset grid renders Bloom as first visible choice',()=>{
  const archive=read('js/modules/07-fx/00-preset-archive-data.js');
  const prefix=archive.split('var lyricColorPresets =')[0];
  assert.ok(prefix.length>1000,'Cannot read original preset data');
  let htmlOutput='';
  const grid={get innerHTML(){return htmlOutput},set innerHTML(v){htmlOutput=String(v)}};
  const doc={getElementById:k=>k==='preset-grid'?grid:null,querySelectorAll:()=>[]};
  const ctx={document:doc,fx:{preset:0},window:{},console,Math};
  vm.createContext(ctx);
  vm.runInContext(prefix,ctx,{filename:'shipped-preset-metadata.js'});
  vm.runInContext(read('js/modules/07-fx/04-preset-grid-uniforms.js'),ctx,{filename:'shipped-preset-grid.js'});
  assert.equal(ctx.MINERADIO_BLOOM_LYRICS_PRESET,13);
  assert.equal(ctx.presetMeta.length,14);
  assert.equal(ctx.presetIcons.length,ctx.presetMeta.length,'Every preset requires an icon');
  ctx.buildPresetGrid();
  assert.ok(htmlOutput.includes('Hoa ánh sáng vũ trụ'),'Bloom card missing from live rendering');
  const matches=[...htmlOutput.matchAll(/data-preset="(\d+)"/g)].map(m=>Number(m[1]));
  assert.equal(matches.length,ctx.presetMeta.length,'No original preset may disappear');
  assert.equal(new Set(matches).size,matches.length,'No duplicated preset cards');
  assert.equal(matches[0],13,'Bloom must be immediately visible, not below scroll fold');
});
test('Task-first FX console installs language selector as first expanded System group',()=>{
  const source=read('js/modules/07-fx/09-console-workspace.js');
  const ctx={console,window:{},Math,document:{},MineradioI18n:{
    t(id){return id==='settings.console.system'?'Hệ thống':
      id==='settings.language'?'Ngôn ngữ giao diện':id},
    source(text){return text},onChange(){},bind(){}
  }};
  vm.createContext(ctx);
  vm.runInContext(source,ctx,{filename:'shipped-FX-console.js'});
  const system=ctx.FX_CONSOLE_LAYOUT.find(x=>x.key==='system');
  assert.ok(system,'System tab must remain present');
  assert.equal(system.groups[0].key,'language');
  assert.equal(system.groups[0].open,true);
  assert.ok(system.groups[0].items.some(x=>x.ref==='mineradio-language-settings'),
    'The selector is lost without a first-class console item');
  assert.equal(ctx.fxConsoleLocalizedText('界面语言'),'Ngôn ngữ giao diện');
  assert.equal(ctx.fxConsoleLocalizedText('系统','system'),'Hệ thống');
});
test('Both language catalogs ship every setting and Bloom translation',()=>{
  const getCatalog=p=>JSON.parse(read(p).match(/Object\.freeze\((\{[\s\S]*?\})\);/)[1]);
  const zh=getCatalog('js/i18n/locales/zh-CN.js'),vi=getCatalog('js/i18n/locales/vi-VN.js');
  for(const id of ['settings.language','settings.language.short','settings.language.hint',
    'ui.bloomlyricsname','ui.bloomlyricsdesc',...['home','interface','lyrics','motion','shelf','system']
      .map(x=>'settings.console.'+x)]){
    assert.ok(vi[id]&&zh[id],'Missing complete bilingual translation: '+id);
  }
  assert.equal(vi['ui.bloomlyricsname'],'Hoa ánh sáng vũ trụ');
  assert.equal(vi['settings.language'],'Ngôn ngữ giao diện');
});
