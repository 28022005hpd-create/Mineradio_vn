'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=x=>fs.readFileSync(path.join(root,x),'utf8');
function mocks(){
  let glyphRenders=0,geometryAllocations=0,renderers=0,added=0,disposed=0;
  const canvas={width:0,height:0,getContext(){
    return {clearRect(){},fillText(){glyphRenders++;},set font(_) {},set fillStyle(_) {},set textAlign(_) {},
      set textBaseline(_) {},getImageData(x,y,w,h){
        let data=new Uint8ClampedArray(w*h*4);
        for(let yy=100;yy<153;yy++)for(let xx=265;xx<768;xx++)data[4*(yy*w+xx)+3]=255;
        return {data};
      }};
  }};
  class BufferGeometry{
    constructor(){this.attrs={};this.userData={};geometryAllocations++;}
    setAttribute(k,v){this.attrs[k]=v;}
    getAttribute(k){return this.attrs[k];}
    dispose(){disposed++;}
  }
  class BufferAttribute{constructor(array,size){this.array=array;this.size=size;this.needsUpdate=false;}}
  class ShaderMaterial{constructor(opts){Object.assign(this,opts);}dispose(){disposed++;}}
  class Vector3{constructor(){this.x=0;this.y=0;this.z=0;}}
  class Sphere{constructor(){}}
  class Points{
    constructor(geometry,material){this.geometry=geometry;this.material=material;
      this.visible=true;this.rotation={};this.position={copy(){return this},addScaledVector(){return this}};
      this.quaternion={copy(){}};this.scale={setScalar(){}};}
  }
  const THREE={BufferGeometry,BufferAttribute,ShaderMaterial,Vector3,Sphere,Points,AdditiveBlending:2};
  const scene={add(mesh){mesh.parent=this;added++},remove(mesh){mesh.parent=null;}};
  const camera={position:{},quaternion:{},fov:45,aspect:16/9,getWorldDirection(){return {x:0,y:0,z:-1}}};
  const ctx={window:null,document:{createElement:()=>canvas},THREE,
    console:{warn(){}},MINERADIO_BLOOM_LYRICS_PRESET:13,presetMeta:Array.from({length:14},()=>({})),
    MineradioI18n:{t(id){return id},onChange(){}},
    buildPresetGrid(){},
    lyricsLines:[{t:1,text:'Não te para tudo',duration:3,charCount:17},{t:4,text:'Những ngôi sao',duration:4,charCount:13}],
    audio:{src:'blob://test',ended:false,currentTime:2,paused:false},
    stageLyricPlaybackSeconds(){return ctx.audio?ctx.audio.currentTime:0},
    getAdjustedLyricPlaybackTime(time){return time},
    findStageLyricIndexAtTime(time){return time<1?-1:time<4?0:1},
    getLyricLineProgress(line,next,time){return (time-line.t)/Math.max(1,(next?next.t:line.t+4)-line.t)},
    lyricLineDisplayTextAt(index){return ctx.lyricsLines[index].text}
  };
  ctx.window=ctx;
  vm.runInNewContext(read('public/js/modules/02-visual/16-bloom-lyric-glyphs.js'),ctx);
  vm.runInNewContext(read('public/js/modules/07-fx/04a-bloom-lyrics-native.js'),ctx);
  let fx={preset:0},frame={fx,scene,camera,tier:0,dpr:1,dt:1/60,time:1,
    audio:{bass:.7,mid:.3,treble:.6,beat:.5,energy:.4}};
  return {ctx,scene,camera,frame,fx,get alloc(){return geometryAllocations},
    get paints(){return glyphRenders},get adds(){return added},get disposes(){return disposed}};
}
test('Bloom is a real first-class Mineradio preset with no Wand import',()=>{
  let src=read('public/js/modules/07-fx/00-preset-archive-data.js');
  assert.match(src,/MINERADIO_BLOOM_LYRICS_PRESET = 13/);
  assert.match(src,/presetDisplayOrder = \[13, 0, 9, 10, 11, 12/);
  assert.doesNotMatch(src,/WAND HELIX|WAND AURORA|wandfx-import/);
  let main=read('public/js/modules/11-main-loop.js');
  assert.match(main,/MineradioBloomLyrics\.update/);
  assert.match(main,/stageLyrics\.group\.visible = !bloomLyricPresetActive/);
  assert.match(read('public/js/modules/02-visual/14-stage-lyrics-rendering.js'),/MineradioBloomLyrics\.isActive\(fx\)/);
});
test('Glyphs are actual GPU targets, Unicode line shape sampled once',()=>{
  const f=mocks(),g=f.ctx.MineradioBloomGlyphs;
  assert.equal(g.clean('<b>Em yêu anh</b>\n她走到'),'Em yêu anh 她走到');
  assert.equal(f.ctx.MineradioBloomLyrics.isActive({preset:13}),true);
  f.fx.preset=13;
  assert.equal(f.ctx.MineradioBloomLyrics.update(1/60,f.frame),true);
  let state=f.ctx.MineradioBloomLyrics.status();
  assert.equal(state.hasLyric,true);
  assert.ok(state.morph>0);
  assert.equal(state.text,'Não te para tudo');
  assert.equal(state.count,32000);
  assert.equal(f.alloc,1);
  let initialPaint=f.paints;
  for(let i=0;i<8;i++)f.ctx.MineradioBloomLyrics.update(1/60,f.frame);
  assert.equal(f.paints,initialPaint,'no glyph bitmap generation on every animation frame');
  assert.equal(f.alloc,1,'no second WebGL particle system');
  assert.ok(f.ctx.MineradioBloomLyrics.status().morph>state.morph);
});
test('New real karaoke line morphs with progress and cleans up on leaving preset',()=>{
  const f=mocks();f.fx.preset=13;
  f.ctx.MineradioBloomLyrics.update(1/60,f.frame);
  f.ctx.audio.currentTime=5;
  f.ctx.stageLyricPlaybackSeconds=()=>5;
  f.ctx.MineradioBloomLyrics.update(1/60,f.frame);
  assert.equal(f.ctx.MineradioBloomLyrics.status().text,'Những ngôi sao');
  assert.ok(f.paints>=2);
  const before=f.ctx.MineradioBloomLyrics.status().frames;
  f.fx.preset=7;
  assert.equal(f.ctx.MineradioBloomLyrics.update(1/60,f.frame),false);
  assert.equal(f.ctx.MineradioBloomLyrics.status().active,false);
  assert.ok(f.disposes>=2);
  assert.ok(before>=2);
});
test('No fabricated lyric on instrumentals, original 3D bloom returns without letters',()=>{
  const f=mocks();f.fx.preset=13;
  f.ctx.lyricsLines=[];
  f.ctx.MineradioBloomLyrics.update(1/60,f.frame);
  assert.equal(f.ctx.MineradioBloomLyrics.status().hasLyric,false);
  assert.equal(f.ctx.MineradioBloomLyrics.status().text,'');
});
test('Separate GLSL interpolation and karaoke light progress, not a text overlay',()=>{
  let js=read('public/js/modules/07-fx/04a-bloom-lyrics-native.js');
  assert.match(js,/vec3 p=mix\(flower,letter,uMorph\)/);
  assert.match(js,/smoothstep\(uKaraoke/);
  assert.match(js,/new THREE.BufferGeometry/);
  assert.match(js,/new THREE.ShaderMaterial/);
  assert.match(js,/context\.camera\.getWorldDirection/);
  assert.doesNotMatch(js,/requestAnimationFrame\s*\(|new THREE\.WebGLRenderer|new AudioContext/);
  assert.ok(read('public/js/modules/02-visual/16-bloom-lyric-glyphs.js').includes("documentRef.createElement('canvas')"));
});

test('Language selector is a visible System settings item and original bilingual resources ship',()=>{
 const ui=read('public/js/modules/07-fx/09-console-workspace.js');
 assert.match(ui,/key: 'language', title: '界面语言'[\s\S]*?fxConsoleItem\('mineradio-language-settings'/);
 const html=read('public/index.html');
 assert.match(html,/id="mineradio-language-select"/);
 assert.match(html,/js\/i18n\/locales\/vi-VN\.js/);
 assert.match(html,/js\/i18n\/locales\/zh-CN\.js/);
 const loader=read('public/js/index-loader.js');
 assert.match(loader,/02-visual\/16-bloom-lyric-glyphs\.js/);
 assert.match(loader,/07-fx\/04a-bloom-lyrics-native\.js/);
});
