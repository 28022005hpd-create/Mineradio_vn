// Locale-aware bilingual subtitles. Original titles, artists, karaoke timing
// and provider lyric data are immutable; only the displayed secondary line is
// translated. A long song is sent in bounded batches rather than truncating at
// 180 lines. No song metadata is passed to the translator.
var viLyricTranslationCache = new Map();
var viLyricTranslationPending = new Map(); // state key -> track-switch token
var viLyricTranslationRetries = new Map();
var viLyricTranslationRetryTimers = new Map();
var viLyricTranslationMisses = new Map();
var viLyricTranslationFinished = new Set();

function viLyricTranslationLocale() {
  return window.MineradioI18n ? window.MineradioI18n.locale : 'zh-CN';
}
function viLyricTranslationKey(state) {
  // Only lyric text/timing define translation identity. On first playback the
  // song may be hydrated/replaced after fetching lyrics. Coupling the key to
  // mutable queue metadata silently cancelled the translation until replay.
  // Track-switch token separately prevents old results reaching the next song.
  return (state.lines || []).map(function (line) {
    return Math.round((Number(line.t) || 0) * 1000) + ':' + String(line.text || '');
  }).join('\u001e');
}
function viLyricTranslatable(line) {
  return !!(line && !line.fallback && String(line.text || '').trim() &&
    !isNoLyricText(line.text) && !isLyricCreditLineText(line.text));
}
function viLyricTranslationBatches(items) {
  var batches = [], current = [], charCount = 0;
  items.forEach(function (item) {
    // The opening 24 lyric lines arrive in small, fast batches. Longer bulk
    // batches continue concurrently and progressively fill the whole song.
    var cap = batches.length < 2 ? 12 : 60;
    if (current.length >= cap || (charCount + item.text.length > 9000 && current.length)) {
      batches.push(current);
      current = [];
      charCount = 0;
    }
    current.push(item);
    charCount += item.text.length;
  });
  if (current.length) batches.push(current);
  return batches;
}
function viLyricTranslationCurrent(key, token) {
  return !(token !== trackSwitchToken) && viLyricTranslationLocale() === 'vi-VN' &&
    lyricSourceMode !== 'custom' && originalLyricsState &&
    viLyricTranslationKey(originalLyricsState) === key;
}
function viLyricTranslationStore(key, mapped) {
  viLyricTranslationCache.delete(key);
  viLyricTranslationCache.set(key, mapped);
  while (viLyricTranslationCache.size > 16) {
    var oldest = viLyricTranslationCache.keys().next().value;
    viLyricTranslationCache.delete(oldest);
    viLyricTranslationFinished.delete(oldest);
    viLyricTranslationMisses.delete(oldest);
    viLyricTranslationRetries.delete(oldest);
    var timer = viLyricTranslationRetryTimers.get(oldest);
    if (timer) clearTimeout(timer);
    viLyricTranslationRetryTimers.delete(oldest);
  }
}
function viLyricTranslationScheduleRetry(key, token) {
  if (!viLyricTranslationCurrent(key, token)) return;
  var count = viLyricTranslationRetries.get(key) || 0;
  if (count >= 3) {
    viLyricTranslationMisses.set(key, Date.now());
    return;
  }
  if (viLyricTranslationRetryTimers.has(key)) return;
  viLyricTranslationRetries.set(key, count + 1);
  // Retry transient translator outages without forcing the listener to
  // reselect the song. All successful batches are retained.
  var waitMs = [1400, 3000, 6000][count];
  var id = setTimeout(function () {
    viLyricTranslationRetryTimers.delete(key);
    if (viLyricTranslationCurrent(key, token)) {
      viLyricRequestTranslation(key, originalLyricsState);
    }
  }, waitMs);
  viLyricTranslationRetryTimers.set(key, id);
}
function viLyricRequestTranslation(key, state) {
  var token = trackSwitchToken;
  if (viLyricTranslationPending.get(key) === token || viLyricTranslationFinished.has(key)) return;
  var failedAt = viLyricTranslationMisses.get(key) || 0;
  if (failedAt && Date.now() - failedAt < 60000) return;
  var mapped = Object.assign({}, viLyricTranslationCache.get(key) || {});
  var items = [];
  (state.lines || []).forEach(function (line, index) {
    if (viLyricTranslatable(line) && !mapped[index]) {
      items.push({ index: index, text: String(line.text).slice(0, 300) });
    }
  });
  if (!items.length) {
    viLyricTranslationFinished.add(key);
    viLyricTranslationRetries.delete(key);
    return;
  }
  var batches = viLyricTranslationBatches(items);
  var anyFailure = false;
  var nextBatch = 0;
  var completedBatches = 0;
  viLyricTranslationPending.set(key, token);
  function worker() {
    return Promise.resolve().then(async function () {
      while (nextBatch < batches.length) {
        if (!viLyricTranslationCurrent(key, token)) return;
        var batch = batches[nextBatch++];
        try {
          var response = await fetch('/api/lyrics/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ locale: 'vi-VN', lines: batch.map(function (item) { return item.text; }) })
          });
          if (!response.ok) throw new Error('Vietnamese lyric translation unavailable');
          var payload = await response.json();
          var values = payload && payload.locale === 'vi-VN' && payload.translations;
          if (!Array.isArray(values) || values.length !== batch.length) throw new Error('Invalid lyric translation');
          var changed = false;
          batch.forEach(function (item, position) {
            var translated = normalizeLyricTranslationText(values[position]);
            if (translated && translated !== normalizeStageLyricText(item.text)) {
              // Some upstream services return an untranslated Chinese fragment.
              // Only use text that actually contains target-language characters.
              if (/[\u3400-\u9fff]/.test(translated) && !/[A-Za-z\u00c0-\u1ef9]/.test(translated)) return;
              if (mapped[item.index] !== translated) {
                mapped[item.index] = translated;
                changed = true;
              }
            }
          });
          completedBatches += 1;
          if (changed) {
            viLyricTranslationStore(key, Object.assign({}, mapped));
            // Render at most once per batch: one underlying timing timeline for
            // both the original karaoke words and each translated line.
            if (viLyricTranslationCurrent(key, token)) {
              applyOriginalLyricsState({ preserveSame: true, reason: 'vi-translation-ready' });
            }
          }
        } catch (_) {
          anyFailure = true;
        }
      }
    });
  }
  Promise.all([worker(), worker()]).then(function () {
    if (!viLyricTranslationCurrent(key, token)) return;
    if (!anyFailure && completedBatches === batches.length) {
      viLyricTranslationFinished.add(key);
      viLyricTranslationMisses.delete(key);
      viLyricTranslationRetries.delete(key);
    } else {
      viLyricTranslationScheduleRetry(key, token);
    }
  }).catch(function () {
    if (viLyricTranslationCurrent(key, token)) viLyricTranslationScheduleRetry(key, token);
  }).finally(function () {
    // A previous song's late request must not clear a fresh song's pending
    // task even if they share exactly the same timed lyric lines.
    if (viLyricTranslationPending.get(key) === token) viLyricTranslationPending.delete(key);
  });
}
function preferredLocalizedLyricsForDisplay(original) {
  if (viLyricTranslationLocale() !== 'vi-VN') return original;
  var state = original || { lines: [] };
  var lines = cloneLyricLines(state.lines || []);
  // Chinese provider tlyric/ytlrc is never presented as a Vietnamese subtitle.
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
  if (!viLyricTranslationFinished.has(key)) viLyricRequestTranslation(key, state);
  if (!cached) return display;
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
