// Locale-aware subtitle lines. Provider tlyric stays untouched in the source
// state, but cannot be mistaken for Vietnamese. Playback/FFT/GPU stay intact.
var viLyricTranslationCache = new Map();
var viLyricTranslationPending = new Set();
var viLyricTranslationMisses = new Map();

function viLyricTranslationLocale() {
  return window.MineradioI18n ? window.MineradioI18n.locale : 'zh-CN';
}
function viLyricTranslationKey(state) {
  var song = typeof currentLyricSong === 'function' ? currentLyricSong() : null;
  var identity = song && [
    song.provider || song.source || '', song.id || song.mid || song.hash || '',
    song.name || song.title || ''
  ].join(':') || '';
  return identity + '|' + (state.lines || []).map(function (line) {
    return Math.round((Number(line.t) || 0) * 1000) + ':' + String(line.text || '');
  }).join('\u001e');
}
function viLyricTranslatable(line) {
  return !!(line && !line.fallback && String(line.text || '').trim() &&
    !isNoLyricText(line.text) && !isLyricCreditLineText(line.text));
}
function viLyricRequestTranslation(key, state) {
  if (viLyricTranslationPending.has(key)) return;
  var failedAt = viLyricTranslationMisses.get(key) || 0;
  if (failedAt && Date.now() - failedAt < 60000) return;
  var items = [];
  (state.lines || []).forEach(function (line, index) {
    if (viLyricTranslatable(line) && items.length < 180) {
      items.push({ index: index, text: String(line.text).slice(0, 300) });
    }
  });
  if (!items.length) return;
  var token = trackSwitchToken;
  viLyricTranslationPending.add(key);
  fetch('/api/lyrics/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ locale: 'vi-VN', lines: items.map(function (item) { return item.text; }) })
  }).then(function (response) {
    if (!response.ok) throw new Error('Localized lyric translation unavailable');
    return response.json();
  }).then(function (payload) {
    var results = payload && payload.locale === 'vi-VN' && payload.translations;
    if (!Array.isArray(results) || results.length !== items.length) throw new Error('Invalid translated lyric lines');
    var mapped = {};
    var count = 0;
    items.forEach(function (item, pos) {
      var translated = normalizeLyricTranslationText(results[pos]);
      if (translated && translated !== normalizeStageLyricText(item.text)) {
        mapped[item.index] = translated;
        count++;
      }
    });
    if (!count) {
      viLyricTranslationMisses.set(key, Date.now());
      return;
    }
    viLyricTranslationCache.set(key, mapped);
    if (viLyricTranslationCache.size > 16) viLyricTranslationCache.delete(viLyricTranslationCache.keys().next().value);
    if (token !== trackSwitchToken || viLyricTranslationLocale() !== 'vi-VN' ||
        lyricSourceMode === 'custom' || viLyricTranslationKey(originalLyricsState) !== key) return;
    applyOriginalLyricsState({ preserveSame: true, reason: 'vi-translation-ready' });
  }).catch(function () {
    viLyricTranslationMisses.set(key, Date.now());
  }).finally(function () {
    viLyricTranslationPending.delete(key);
  });
}

function preferredLocalizedLyricsForDisplay(original) {
  if (viLyricTranslationLocale() !== 'vi-VN') return original;
  var state = original || { lines: [] };
  var lines = cloneLyricLines(state.lines || []);
  // Chinese source translation must never silently be shown as Vietnamese.
  lines.forEach(function (line) {
    delete line.translation;
    delete line.translationTime;
    delete line.translationSource;
    delete line.translationMatch;
  });
  var display = {
    lines: lines,
    hasNativeKaraoke: state.hasNativeKaraoke,
    timingSource: state.timingSource,
    translationLines: [],
    translationSource: 'none'
  };
  if (!lines.length || normalizeLyricTranslationMode(fx && fx.lyricTranslationMode) === 'off') return display;
  var key = viLyricTranslationKey(state);
  var cached = viLyricTranslationCache.get(key);
  if (!cached) {
    viLyricRequestTranslation(key, state);
    return display;
  }
  var translations = [];
  lines.forEach(function (line, index) {
    var translated = cached[index];
    if (!translated || !viLyricTranslatable(line)) return;
    line.translation = translated;
    line.translationTime = line.t;
    line.translationSource = 'machine-vi-VN';
    translations.push({ t: line.t, duration: line.duration, text: translated, source: 'machine-vi-VN' });
  });
  display.translationLines = translations;
  display.translationSource = translations.length ? 'machine-vi-VN' : 'none';
  return display;
}

if (window.MineradioI18n && typeof window.MineradioI18n.onChange === 'function') {
  window.MineradioI18n.onChange(function () {
    if (lyricSourceMode !== 'custom' && originalLyricsState) {
      applyOriginalLyricsState({ preserveSame: true, reason: 'lyric-language-change' });
    }
  });
}
