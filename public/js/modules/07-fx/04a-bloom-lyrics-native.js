/* Mineradio built-in BLOOM LYRICS — no WandFX importer, no remote engine.
 * The flower's own THREE.Points becomes readable animated lyric glyphs.
 * Reuses the existing scene/camera/WebGLRenderer and original timed lyrics/FFT.
 */
(function (root) {
  'use strict';
  var glyphs = root.MineradioBloomGlyphs;
  var PRESET = typeof MINERADIO_BLOOM_LYRICS_PRESET !== 'undefined' ? MINERADIO_BLOOM_LYRICS_PRESET : -1;
  var state = {mesh:null, geo:null, mat:null, count:0, tier:-1, text:'', hasGlyph:false, morph:0,
    smooth:{bass:0,mid:0,treble:0,beat:0}, ready:false, frames:0};
  function clamp(n,min,max) { n=Number(n);return isFinite(n)?Math.min(max,Math.max(min,n)):min; }
  function active(fxState) { return !!(fxState && Number(fxState.preset)===PRESET); }
  function cleanup() {
    if(state.mesh && state.mesh.parent)state.mesh.parent.remove(state.mesh);
    if(state.geo)state.geo.dispose();
    if(state.mat)state.mat.dispose();
    state.mesh=state.geo=state.mat=null;
    state.tier=-1;state.count=0;state.hasGlyph=false;state.text='';state.morph=0;state.ready=false;
  }
  function currentLyric() {
    if(typeof lyricsLines==='undefined' || !Array.isArray(lyricsLines) || !lyricsLines.length ||
      typeof findStageLyricIndexAtTime!=='function' || !audio || !audio.src || audio.ended)
      return {text:'',progress:0};
    // Same clock and lyric offset as the built-in karaoke renderer.
    var t=typeof stageLyricPlaybackSeconds==='function' ?
      stageLyricPlaybackSeconds() : Number(audio.currentTime)||0;
    t=typeof getAdjustedLyricPlaybackTime==='function' ? getAdjustedLyricPlaybackTime(t) : t;
    var i=findStageLyricIndexAtTime(t);
    if(i<0 || i>=lyricsLines.length)return {text:'',progress:0};
    var line=lyricsLines[i];
    if(!line || line.fallback || !line.text)return {text:'',progress:0};
    var caption=typeof lyricLineDisplayTextAt==='function'?lyricLineDisplayTextAt(i):line.text;
    if(typeof isNoLyricText==='function' && isNoLyricText(caption))caption='';
    var p=typeof getLyricLineProgress==='function'
      ? getLyricLineProgress(line,lyricsLines[i+1]||null,t):0;
    return {text:glyphs.clean(caption),progress:clamp(p,0,1)};
  }
  function makeGeometry(count) {
    var pos=new Float32Array(count*3), seed=new Float32Array(count),
      tint=new Float32Array(count), glyph=new Float32Array(count*3),
      glyphX=new Float32Array(count);
    // Deterministic 8 petal geometry in 3D, no album/Emily vertex dependencies.
    var rng=0x53e405, TAU=Math.PI*2;
    function rand(){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return(rng>>>0)/4294967296;}
    for(var i=0;i<count;i++){
      var t=(i+.5)/count,a=TAU*t*21,v=Math.sqrt(rand()),petal=8;
      var radius=3.65*Math.abs(Math.cos(petal*a/2))*v;
      var k=3*i;
      pos[k]=Math.cos(a)*radius;pos[k+1]=Math.sin(a)*radius;
      pos[k+2]=1.45*Math.sin(petal*a/2)*v+(rand()-.5)*0.16;
      seed[i]=rand();tint[i]=rand();
    }
    var geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.BufferAttribute(pos,3));
    geometry.setAttribute('aSeed',new THREE.BufferAttribute(seed,1));
    geometry.setAttribute('aTint',new THREE.BufferAttribute(tint,1));
    geometry.setAttribute('aGlyph',new THREE.BufferAttribute(glyph,3));
    geometry.setAttribute('aGlyphX',new THREE.BufferAttribute(glyphX,1));
    geometry.userData=geometry.userData||{};
    geometry.userData.bloomLine=null; geometry.userData.bloomGlyphs=false;
    geometry.boundingSphere=new THREE.Sphere(new THREE.Vector3(),12);
    return geometry;
  }
  var vs=[
    'precision highp float;',
    'attribute float aSeed,aTint,aGlyphX;',
    'attribute vec3 aGlyph;',
    'uniform float uTime,uMorph,uKaraoke,uBass,uMid,uTreble,uBeat,uEnergy,uDpr;',
    'varying vec3 vColor;',
    'varying float vAlpha;',
    'void main(){',
    ' float t=uTime;',
    ' vec3 flower=position;',
    // A breathing responsive flower rather than constant spinning petals.
    ' flower.xy*=1.0+uBass*0.20+uBeat*0.26;',
    ' flower.z+=sin(atan(flower.y,flower.x)*5.0-t*0.72+aSeed*6.283)*(.10+uMid*.26);',
    ' float twist=sin(t*.24)*.16;',
    ' flower.xy=mat2(cos(twist),-sin(twist),sin(twist),cos(twist))*flower.xy;',
    // Each particle moves physically into the sampled lyric glyph target.
    ' vec3 letter=aGlyph;',
    ' letter.z+=sin(aGlyphX*13.0+t*1.1+aSeed*6.283)*(.004+uMid*.013);',
    ' vec3 p=mix(flower,letter,uMorph);',
    ' vec4 eye=modelViewMatrix*vec4(p,1.0);',
    ' gl_Position=projectionMatrix*eye;',
    ' float persp=clamp(14.0/max(2.0,-eye.z),0.5,1.6);',
    ' gl_PointSize=clamp((2.0+aSeed*1.8+uTreble*.75+uBeat*.30)*uDpr*persp,1.0,7.0);',
    ' vec3 flowerCol=mix(vec3(.98,.52,.63),vec3(1.0,.78,.73),aTint);',
    ' float sung=1.0-smoothstep(uKaraoke-.014,uKaraoke+.014,aGlyphX);',
    ' vec3 letterCol=mix(vec3(.32,.79,.89),vec3(1.0,.95,.84),sung);',
    ' vColor=mix(flowerCol,letterCol,uMorph);',
    ' vAlpha=(.68+uEnergy*.14+uBeat*.11+uTreble*.08)*(.88+.12*sin(t*1.3+aSeed*6.28));',
    '}'
  ].join('\n');
  var fs=[
    'precision highp float;',
    'varying vec3 vColor;',
    'varying float vAlpha;',
    'void main(){',
    ' float radius=length(gl_PointCoord-vec2(.5));',
    ' float center=1.0-smoothstep(.10,.30,radius);',
    ' float glow=1.0-smoothstep(.22,.50,radius);',
    ' float alpha=(center*.84+glow*.31)*vAlpha;',
    ' if(alpha<.01)discard;',
    ' gl_FragColor=vec4(vColor,alpha);',
    '}'
  ].join('\n');
  function ensure(context) {
    var tier=clamp(context.tier,0,2);
    if(state.mesh && state.tier===tier)return true;
    cleanup();
    if(!glyphs || !context.scene || typeof THREE==='undefined')return false;
    try{
      var count=tier>=2?12000:tier>=1?21000:32000;
      var geometry=makeGeometry(count);
      var material=new THREE.ShaderMaterial({
        uniforms:{uTime:{value:0},uMorph:{value:0},uKaraoke:{value:0},
          uBass:{value:0},uMid:{value:0},uTreble:{value:0},uBeat:{value:0},
          uEnergy:{value:0},uDpr:{value:1}},
        vertexShader:vs,fragmentShader:fs,
        transparent:true,depthWrite:false,depthTest:false,blending:THREE.AdditiveBlending
      });
      var mesh=new THREE.Points(geometry,material);
      mesh.frustumCulled=false;mesh.renderOrder=5;
      context.scene.add(mesh);
      state.mesh=mesh;state.geo=geometry;state.mat=material;
      state.tier=tier;state.count=count;state.ready=true;
      return true;
    }catch(err){
      console.warn('[Mineradio Bloom Lyrics] GPU initialization failed:',err);
      cleanup();return false;
    }
  }
  function update(dt,context) {
    context=context||{};
    if(!active(context.fx)) {if(state.mesh)cleanup();return false;}
    if(!ensure(context))return false;
    var line=currentLyric();
    if(line.text!==state.text){
      state.text=line.text;
      state.hasGlyph=!!glyphs.assign(state.geo,line.text,root.document);
      state.morph=Math.min(state.morph,0.22); // show the particles going somewhere
    }
    var time=clamp(dt,0,0.10),target=state.hasGlyph?1:0;
    state.morph+=(target-state.morph)*(1-Math.exp(-time/(target ? 0.32 : 0.48)));
    var u=state.mat.uniforms;
    var audioState=context.audio||{};
    ['bass','mid','treble','beat'].forEach(function(k){
      var dest=clamp(audioState[k],0,1.5),prev=state.smooth[k];
      state.smooth[k]+= (dest-prev)*(1-Math.exp(-time/(dest>prev ? 0.06 : 0.30)));
    });
    u.uTime.value=clamp(context.time,0,1e8);
    u.uMorph.value=state.morph;
    u.uKaraoke.value=line.progress;
    u.uBass.value=state.smooth.bass;u.uMid.value=state.smooth.mid;
    u.uTreble.value=state.smooth.treble;u.uBeat.value=state.smooth.beat;
    u.uEnergy.value=clamp(audioState.energy,0,1);
    u.uDpr.value=clamp(context.dpr||1,.7,1.7);
    // Position the REAL glyph mesh in front of the existing camera, avoiding
    // the old failure where a separate lyric overlay appeared over a faraway flower.
    if(context.camera && context.camera.position && context.camera.getWorldDirection){
      var forward=new THREE.Vector3();
      context.camera.getWorldDirection(forward);
      state.mesh.position.copy(context.camera.position).addScaledVector(forward,14);
      state.mesh.quaternion.copy(context.camera.quaternion);
      var vfov=(Number(context.camera.fov)||45)*Math.PI/180;
      var aspect=Number(context.camera.aspect)||1;
      var width=28*Math.tan(vfov/2)*aspect;
      var fit=Math.min(1,Math.max(.52,width/11.2));
      state.mesh.scale.setScalar(fit);
    }
    state.mesh.visible=true;state.frames++;
    return true;
  }
  // Catalog-driven preset labels. Rebuilding the card list on language switch
  // keeps the translated name inside the ORIGINAL Mineradio FX panel.
  function syncBloomLabels() {
    if (PRESET < 0 || !presetMeta[PRESET] || !root.MineradioI18n) return;
    presetMeta[PRESET].name = MineradioI18n.t('bloomLyrics.name');
    presetMeta[PRESET].desc = MineradioI18n.t('bloomLyrics.desc');
    if (typeof buildPresetGrid === 'function') buildPresetGrid();
  }
  if (root.MineradioI18n && MineradioI18n.onChange) {
    MineradioI18n.onChange(syncBloomLabels);
    syncBloomLabels();
  }
    root.MineradioBloomLyrics=Object.freeze({
    isActive:active,update:update,dispose:cleanup,
    status:function(){return {preset:PRESET,active:!!state.mesh,ready:state.ready,
      count:state.count,hasLyric:state.hasGlyph,morph:state.morph,text:state.text,frames:state.frames};}
  });
})(window);
