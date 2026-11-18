'use strict';
// Optional, metadata-verified synchronized lyrics from LRCLIB. Do not invent
// words or line timings from a track title/beat; only use verified timed LRC.
const https = require('https');
const BASE_URL = 'https://lrclib.net';
const MAX_PAYLOAD = 450 * 1024;
const MAX_DURATION_DELTA = 5;

function compact(value) {
  return String(value || '').normalize('NFKC').toLowerCase()
    .replace(/[\s\u200b\u200c\u200d\u3000]+/g, '')
    .replace(/[\u2013\u2014_\-.,!?()\[\]{}\u3001\u3002]/g, '');
}
function artistMatches(expected, actual) {
  const a = compact(expected), b = compact(actual);
  if (!a || !b) return false;
  if (a === b) return true;
  // Multi-artist listings can differ in separator and order. Never match a
  // different vocalist just because the title and duration are identical.
  const first = String(expected).split(/\s*(?:,|&|\/|、| feat\.? | ft\.? )\s*/i)
    .map(compact).filter(Boolean)[0];
  return !!first && first.length >= 3 && b.includes(first);
}
function validSyncedLyrics(text) {
  if (typeof text !== 'string' || text.length > 140000) return false;
  const timed = text.split(/\r?\n/).filter(row => /\[\d{1,2}:\d{2}(?:\.\d{1,3})?\]/.test(row)
    && row.replace(/\[\d{1,2}:\d{2}(?:\.\d{1,3})?\]/g, '').trim());
  return timed.length >= 2;
}
function verifyRecord(record, meta) {
  if (!record || record.instrumental) return false;
  if (compact(record.trackName) !== compact(meta.title)) return false;
  if (!artistMatches(meta.artist, record.artistName)) return false;
  if (meta.duration > 0 && Number(record.duration) > 0 &&
      Math.abs(meta.duration - Number(record.duration)) > MAX_DURATION_DELTA) return false;
  return validSyncedLyrics(record.syncedLyrics);
}
function requestJson(path, options) {
  const get = options && options.request || https.get;
  return new Promise((resolve, reject) => {
    const req = get(BASE_URL + path, {
      headers: {
        'User-Agent': 'Mineradio-VN/2.2.0 (+https://github.com/28022005hpd-create/Mineradio_vn)',
        Accept: 'application/json'
      },
      timeout: 5500
    }, res => {
      let body = '';
      if (res.statusCode !== 200) { res.resume(); resolve(null); return; }
      res.setEncoding('utf8');
      res.on('data', chunk => {
        body += chunk;
        if (body.length > MAX_PAYLOAD) req.destroy(new Error('LYRICS_RESPONSE_TOO_LARGE'));
      });
      res.on('end', () => {
        try { resolve(JSON.parse(body)); } catch (_) { resolve(null); }
      });
      res.on('error', reject);
    });
    req.on('timeout', () => req.destroy(new Error('LYRICS_TIMEOUT')));
    req.on('error', reject);
  });
}
function createFallbackResolver(options = {}) {
  const getJson = options.getJson || (path => requestJson(path, options));
  const cache = new Map();
  return async function resolveFallback(meta) {
    const title = String(meta && meta.title || '').trim().slice(0, 220);
    const artist = String(meta && meta.artist || '').trim().slice(0, 220);
    const album = String(meta && meta.album || '').trim().slice(0, 220);
    const duration = Math.max(0, Math.round(Number(meta && meta.duration) || 0));
    if (!title || !artist || title.length < 2 || artist.length < 2) return null;
    const key = JSON.stringify([compact(title), compact(artist), compact(album), duration]);
    const prior = cache.get(key);
    if (prior && prior.until > Date.now()) return prior.value;
    const params = new URLSearchParams({ track_name:title, artist_name:artist });
    if (album) params.set('album_name', album);
    if (duration) params.set('duration', String(duration));
    let found = null;
    try {
      // Strict exact metadata lookup; if it misses, search and validate the
      // returned artist/title/duration before using any lyrics.
      const exact = await getJson('/api/get?' + params);
      if (verifyRecord(exact, {title, artist, duration})) found = exact;
      if (!found) {
        const search = new URLSearchParams({track_name:title, artist_name:artist});
        const items = await getJson('/api/search?' + search);
        if (Array.isArray(items)) {
          found = items.filter(item => verifyRecord(item,{title,artist,duration}))
            .sort((a,b) =>
              (compact(b.albumName) === compact(album) ? 1 : 0) -
              (compact(a.albumName) === compact(album) ? 1 : 0))[0] || null;
        }
      }
    } catch (e) {
      // Network loss and rate limiting should not block music playback.
      if (options.onError) options.onError(e);
    }
    const value = found ? {
      lyric: found.syncedLyrics,
      tlyric: '',
      yrc: '',
      source: 'lrclib-synced',
      timingVerified: true,
      lyricProvider: 'LRCLIB',
      lrclibId: Number(found.id) || null
    } : null;
    cache.set(key, { value, until: Date.now() + (value ? 12 * 60 * 60 * 1000 : 15 * 60 * 1000) });
    if (cache.size > 300) cache.delete(cache.keys().next().value);
    return value;
  };
}
const resolveFallbackLyrics = createFallbackResolver();
module.exports = { compact, artistMatches, validSyncedLyrics, verifyRecord,
  createFallbackResolver, resolveFallbackLyrics };
