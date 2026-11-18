'use strict';
// Mineradio Live MV: a song-aware, renderer-only visual layer. It is not a
// pre-rendered CapCut clip, and never plays its own audio or resets WebGL.
// The mobile compact control stays inside the web app. OS-level mobile PiP
// requires a separate native mobile implementation.
var LIVE_MV_PREF_KEY = 'mineradio-live-mv-v1';
var liveMvEnabled = false;
var liveMvMiniEnabled = false;
var liveMvLastTrack = '';
var liveMvLastLine = -2;
var liveMvLastCover = '';
var liveMvLastMiniSnapshot = '';
var liveMvLastMiniPushAt = 0;
var liveMvTimer = 0;

function liveMvReadPrefs() {
  try { return JSON.parse(localStorage.getItem(LIVE_MV_PREF_KEY) || '{}') || {}; }
  catch (_) { return {}; }
}
function liveMvSavePrefs() {
  try { localStorage.setItem(LIVE_MV_PREF_KEY,
    JSON.stringify({ live: liveMvEnabled, mini: liveMvMiniEnabled })); }
  catch (_) {}
}
function liveMvText(value) { return String(value == null ? '' : value); }
function liveMvClamp(value, a, b) { return Math.max(a, Math.min(b, Number(value) || 0)); }
function liveMvTime(value) {
  var n = Math.max(0, Math.floor(Number(value) || 0));
  return Math.floor(n / 60) + ':' + String(n % 60).padStart(2, '0');
}
function liveMvSongSnapshot() {
  var song = typeof currentLyricSong === 'function' ? currentLyricSong() : null;
  var title = song && liveMvText(song.name || song.title) || 'Mineradio';
  var artist = song && liveMvText(song.artist || song.singer) || 'Chưa chọn bài hát';
  var cover = '';
  if (song && typeof songCoverUrl === 'function') cover = songCoverUrl(song);
  if (!cover && song) cover = song.customCover || song.cover || song.picUrl || song.albumCover || song.coverUrl || '';
  var current = audio && Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
  var duration = audio && Number.isFinite(audio.duration) ? audio.duration :
    (song && typeof playbackDurationFromSong === 'function' ? playbackDurationFromSong(song) : 0);
  var paused = !audio || audio.paused || audio.ended;
  var lyrics = typeof originalLyricsState !== 'undefined' && originalLyricsState
    ? originalLyricsState : null;
  if (lyrics && typeof preferredLocalizedLyricsForDisplay === 'function')
    lyrics = preferredLocalizedLyricsForDisplay(lyrics);
  var lines = lyrics && Array.isArray(lyrics.lines) ? lyrics.lines : [];
  var index = -1;
  for (var i = 0; i < lines.length; i++) {
    if (Number(lines[i].t) <= current + .06) index = i;
    else break;
  }
  var line = index >= 0 ? lines[index] : null;
  var original = line ? liveMvText(line.text) : 'Lời hát sẽ hiện theo bài đang phát';
  var translation = line ? liveMvText(line.translation) : '';
  // Some providers store translations as separate timed rows.
  if (!translation && line && lyrics && Array.isArray(lyrics.translationLines)) {
    var closest = lyrics.translationLines.find(function (item) {
      return Math.abs(Number(item.t) - Number(line.t)) < .3;
    });
    if (closest) translation = liveMvText(closest.text);
  }
  var next = index + 1 < lines.length && index >= -1
    ? liveMvText(lines[index + 1].text) : '';
  var lineStart = line ? Number(line.t) || 0 : 0;
  var lineEnd = line && Number(line.duration) > 0 ? lineStart + Number(line.duration)
    : index + 1 < lines.length ? Number(lines[index + 1].t) : current + 4;
  var progress = line ? liveMvClamp((current - lineStart) / Math.max(.2, lineEnd - lineStart), 0, 1) : 0;
  return {
    trackKey: song && [song.provider || song.source || '',song.id || song.mid || '',title].join(':') || '',
    title:title, artist:artist, cover:liveMvText(cover),
    current:current, duration:duration, paused:paused,
    lineIndex:index, lyric:original, translation:translation, next:next, progress:progress,
    beat:liveMvClamp(typeof audioEnergy === 'number' ? audioEnergy : 0,0,1)
  };
}
function liveMvSetText(id,value) {
  var node=document.getElementById(id);
  if(node && node.textContent !== liveMvText(value)) node.textContent=liveMvText(value);
}
function liveMvSetCover(prefix,source) {
  var image=document.getElementById(prefix+'-cover');
  var blur=document.getElementById(prefix+'-back');
  if (!image || !blur) return;
  var url=liveMvText(source);
  if(image.getAttribute('data-cover-url') === url) return;
  image.setAttribute('data-cover-url',url);
  if (url && /^(https?:|data:image\/|blob:|file:|\/[^\/])/i.test(url)) {
    image.src=url; blur.src=url;
    image.hidden=false;
    blur.hidden=false;
  } else {
    image.removeAttribute('src');
    blur.removeAttribute('src');
    image.hidden=true;
    blur.hidden=true;
  }
}
function liveMvMarkup() {
  if(document.getElementById('mineradio-live-mv')) return;
  var stage=document.createElement('section');
  stage.id='mineradio-live-mv';
  stage.setAttribute('aria-label','MV lời bài hát trực tiếp');
  stage.innerHTML =
    '<div class="live-mv-backdrop"><img id="live-mv-back" alt="" aria-hidden="true"></div>'+
    '<div class="live-mv-sheen" aria-hidden="true"></div>'+
    '<div class="live-mv-top"><span class="live-mv-brand">MINERADIO <b>LIVE MV</b></span>'+
      '<div class="live-mv-tools"><button type="button" id="live-mv-mini-btn" '+
      'title="Thu nhỏ thành trình phát nổi" aria-label="Thu nhỏ thành trình phát nổi">▢</button>'+
      '<button type="button" id="live-mv-close-btn" aria-label="Đóng MV">×</button></div></div>'+
    '<div class="live-mv-body"><div class="live-mv-art-wrap">'+
      '<img id="live-mv-cover" alt="Ảnh bìa bài hát" draggable="false">'+
      '<div class="live-mv-art-rings" aria-hidden="true"></div></div>'+
      '<div class="live-mv-captions">'+
        '<p class="live-mv-kicker">LỜI BÀI HÁT ĐANG PHÁT</p>'+
        '<p id="live-mv-current" class="live-mv-current" aria-live="off"></p>'+
        '<p id="live-mv-translation" class="live-mv-translation" lang="vi"></p>'+
        '<p id="live-mv-next" class="live-mv-next"></p>'+
        '<div class="live-mv-lyric-progress"><span id="live-mv-line-progress"></span></div>'+
      '</div></div>'+
    '<div class="live-mv-foot"><div class="live-mv-track">'+
      '<strong id="live-mv-title"></strong><span id="live-mv-artist"></span></div>'+
      '<div class="live-mv-timeline"><span id="live-mv-time"></span>'+
      '<div class="live-mv-track-progress"><span id="live-mv-track-progress-fill"></span></div>'+
      '<span id="live-mv-duration"></span></div></div>';
  stage.querySelector('#live-mv-close-btn').addEventListener('click',function(){liveMvSetEnabled(false);});
  stage.querySelector('#live-mv-mini-btn').addEventListener('click',function(){
    liveMvSetMiniEnabled(true);
    if(window.desktopWindow && window.desktopWindow.isDesktop && window.desktopWindow.minimize)
      window.desktopWindow.minimize();
    else liveMvSetEnabled(false);
  });
  document.body.appendChild(stage);
  var mini=document.createElement('section');
  mini.id='mineradio-mini-inapp';
  mini.setAttribute('aria-label','Trình phát thu nhỏ');
  mini.innerHTML =
    '<img class="mr-mini-cover" id="mr-mini-cover" alt="" aria-hidden="true">'+
    '<img id="mr-mini-back" alt="" aria-hidden="true" hidden>'+
    '<div class="mr-mini-info"><strong id="mr-mini-title"></strong>'+
      '<span id="mr-mini-lyric"></span></div>'+
    '<div class="mr-mini-actions">'+
      '<button id="mr-mini-toggle" type="button" aria-label="Phát hoặc tạm dừng">▶</button>'+
      '<button id="mr-mini-expand" type="button" aria-label="Mở MV">⛶</button>'+
      '<button id="mr-mini-close" type="button" aria-label="Đóng trình phát nhỏ">×</button></div>';
  document.body.appendChild(mini);
  mini.querySelector('#mr-mini-toggle').addEventListener('click',function(){
    if(typeof togglePlay === 'function') togglePlay();
  });
  mini.querySelector('#mr-mini-expand').addEventListener('click',function(){
    liveMvSetEnabled(true);liveMvSetMiniEnabled(false);
  });
  mini.querySelector('#mr-mini-close').addEventListener('click',function(){liveMvSetMiniEnabled(false);});
}
function liveMvUpdateControls() {
  var stage=document.getElementById('mineradio-live-mv');
  var mini=document.getElementById('mineradio-mini-inapp');
  if(stage) stage.classList.toggle('active',liveMvEnabled);
  var desktop=!!(window.desktopWindow && window.desktopWindow.isDesktop);
  if(mini) mini.classList.toggle('active',liveMvMiniEnabled && !liveMvEnabled && !desktop);
  for(var pair of [
    ['live-mv-toggle',liveMvEnabled],
    ['live-mv-mini-toggle',liveMvMiniEnabled]
  ]) {
    var control=document.getElementById(pair[0]);
    if(control){control.setAttribute('aria-pressed',pair[1]?'true':'false');
      control.classList.toggle('active',pair[1]);}
  }
}
function liveMvSetEnabled(enabled) {
  liveMvEnabled=!!enabled;
  if(liveMvEnabled && liveMvMiniEnabled) {
    liveMvMiniEnabled=false;
    if(window.desktopWindow && window.desktopWindow.setMiniPlayerEnabled)
      window.desktopWindow.setMiniPlayerEnabled(false).catch(function(){});
  }
  liveMvUpdateControls();
  liveMvSavePrefs();
}
function liveMvSetMiniEnabled(enabled) {
  liveMvMiniEnabled=!!enabled;
  if(liveMvMiniEnabled) liveMvEnabled=false;
  liveMvUpdateControls();
  liveMvSavePrefs();
  var bridge=window.desktopWindow;
  if(bridge && bridge.isDesktop && typeof bridge.setMiniPlayerEnabled === 'function') {
    Promise.resolve(bridge.setMiniPlayerEnabled(liveMvMiniEnabled)).catch(function (err) {
      console.warn('[MiniPlayer] enable failed',err);
    });
  }
}
function liveMvHandleMiniCommand(command) {
  if(command==='toggle') { if(typeof togglePlay==='function')togglePlay(); }
  else if(command==='next'){if(typeof nextTrack==='function')nextTrack(true);}
  else if(command==='previous'){if(typeof prevTrack==='function')prevTrack(true);}
  else if(command==='mv'){liveMvSetEnabled(true);}
}
// Mobile-browser lock-screen/playback controls where Media Session is supported.
// This complements the in-app mini UI; it does not claim system PiP.
var liveMvMediaSessionTrack = '';
var liveMvMediaSessionBound = false;
var liveMvMediaSessionUpdatedAt = 0;
function liveMvUpdateMobileMediaSession(state) {
  if(typeof navigator==='undefined' || !navigator.mediaSession ||
      typeof window.MediaMetadata!=='function') return;
  if(!liveMvMediaSessionBound) {
    liveMvMediaSessionBound=true;
    for(var pair of [
      ['play','toggle'], ['pause','toggle'],
      ['nexttrack','next'], ['previoustrack','previous']
    ]) {
      try {
        (function (action,cmd) {
          navigator.mediaSession.setActionHandler(action,function(){
            liveMvHandleMiniCommand(cmd);
          });
        })(pair[0],pair[1]);
      } catch (_) { /* Not supported by this mobile browser. */ }
    }
  }
  if(state.trackKey !== liveMvMediaSessionTrack) {
    liveMvMediaSessionTrack=state.trackKey;
    try {
      var art=state.cover && /^(https?:|data:image\/|blob:|\/[^\/])/i.test(state.cover)
        ? [{src:state.cover,sizes:'512x512'}] : [];
      navigator.mediaSession.metadata=new window.MediaMetadata({
        title:state.title,artist:state.artist,artwork:art
      });
    } catch (_) {}
  }
  try {navigator.mediaSession.playbackState=state.paused?'paused':'playing';} catch (_) {}
  var now=Date.now();
  if(now-liveMvMediaSessionUpdatedAt>850 && state.duration>0) {
    liveMvMediaSessionUpdatedAt=now;
    try {
      navigator.mediaSession.setPositionState({
        duration:state.duration,playbackRate:1,
        position:liveMvClamp(state.current,0,state.duration)
      });
    } catch (_) {}
  }
}
function liveMvUpdateFrame() {
  if(!liveMvEnabled && !liveMvMiniEnabled) return;
  var state=liveMvSongSnapshot();
  if(liveMvEnabled){
    if(state.trackKey !== liveMvLastTrack){
      liveMvLastTrack=state.trackKey;liveMvLastLine=-2;
      liveMvSetText('live-mv-title',state.title);
      liveMvSetText('live-mv-artist',state.artist);
    }
    if(state.cover !== liveMvLastCover) {
      liveMvLastCover=state.cover;
      liveMvSetCover('live-mv',state.cover);
    }
    liveMvSetText('live-mv-current',state.lyric);
    liveMvSetText('live-mv-translation',state.translation);
    liveMvSetText('live-mv-next',state.next);
    liveMvSetText('live-mv-time',liveMvTime(state.current));
    liveMvSetText('live-mv-duration',liveMvTime(state.duration));
    var fill=document.getElementById('live-mv-line-progress');
    if(fill)fill.style.width=Math.round(state.progress*100)+'%';
    var total=document.getElementById('live-mv-track-progress-fill');
    if(total) total.style.width=Math.round(100*state.current/Math.max(1,state.duration))+'%';
    var stage=document.getElementById('mineradio-live-mv');
    if(stage)stage.style.setProperty('--live-beat',String(state.beat));
  }
  if(liveMvMiniEnabled) {
    liveMvUpdateMobileMediaSession(state);
    liveMvSetText('mr-mini-title',state.title);
    liveMvSetText('mr-mini-lyric',state.lyric);
    liveMvSetText('mr-mini-toggle',state.paused?'▶':'Ⅱ');
    liveMvSetCover('mr-mini',state.cover);
    var bridge=window.desktopWindow;
    var now=Date.now();
    if(bridge && bridge.isDesktop && typeof bridge.publishMiniPlayerState==='function'
       && now-liveMvLastMiniPushAt>650) {
      liveMvLastMiniPushAt=now;
      // Never transmit cookies, audio URLs or account identifiers to the
      // compact window: presentation data only, with bounded payload size.
      bridge.publishMiniPlayerState({
        title:state.title.slice(0,180), artist:state.artist.slice(0,160),
        lyric:state.lyric.slice(0,300), translation:state.translation.slice(0,300),
        cover:state.cover.slice(0,1200),paused:state.paused,
        time:liveMvTime(state.current),duration:liveMvTime(state.duration),
        percent:100*state.current/Math.max(1,state.duration)
      });
    }
  }
}
function initializeMineradioLiveMv() {
  liveMvMarkup();
  var pref=liveMvReadPrefs();
  liveMvEnabled=pref.live===true;
  liveMvMiniEnabled=pref.mini===true;
  if(liveMvEnabled && liveMvMiniEnabled)liveMvMiniEnabled=false;
  liveMvUpdateControls();
  if(window.desktopWindow && window.desktopWindow.isDesktop) {
    if(typeof window.desktopWindow.onMiniPlayerCommand==='function') {
      window.desktopWindow.onMiniPlayerCommand(liveMvHandleMiniCommand);
    }
    if(typeof window.desktopWindow.setMiniPlayerEnabled==='function') {
      window.desktopWindow.setMiniPlayerEnabled(liveMvMiniEnabled).catch(function(){});
    }
  }
  if(liveMvTimer)clearInterval(liveMvTimer);
  liveMvTimer=setInterval(liveMvUpdateFrame,160);
  liveMvUpdateFrame();
}
