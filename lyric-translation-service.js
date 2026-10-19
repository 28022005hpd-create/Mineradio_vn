'use strict';

// Best-effort opt-in Vietnamese subtitles. Source lyrics stay untouched.
// No credentials, playback data or account cookies go to the translation service.
const https = require('https');

function requestGoogleTranslation(source) {
  const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=vi&dt=t&q=' +
    encodeURIComponent(source);
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { Accept: 'application/json' } }, (res) => {
      if (res.statusCode !== 200) {
        res.resume();
        reject(new Error('Translation service HTTP ' + res.statusCode));
        return;
      }
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        body += chunk;
        if (body.length > 65536) req.destroy(new Error('Translation response too large'));
      });
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          const translated = Array.isArray(data[0])
            ? data[0].map(part => Array.isArray(part) ? String(part[0] || '') : '').join('').trim()
            : '';
          resolve(translated.slice(0, 600));
        } catch (error) {
          reject(error);
        }
      });
      res.on('error', reject);
    });
    req.setTimeout(6500, () => req.destroy(new Error('Translation timed out')));
    req.on('error', reject);
  });
}

function createLyricTranslator(options = {}) {
  const requestTranslation = options.requestTranslation || requestGoogleTranslation;
  const successful = new Map();
  const pending = new Map();

  function translateOne(source) {
    const text = String(source || '').trim();
    if (!text || text.length > 300) return Promise.resolve('');
    if (successful.has(text)) return Promise.resolve(successful.get(text));
    if (pending.has(text)) return pending.get(text);
    const task = Promise.resolve().then(() => requestTranslation(text)).then((translated) => {
      const value = typeof translated === 'string' ? translated.trim().slice(0, 600) : '';
      if (value) {
        successful.delete(text);
        successful.set(text, value);
        if (successful.size > 2000) successful.delete(successful.keys().next().value);
      }
      return value;
    }).catch(() => '').finally(() => pending.delete(text));
    pending.set(text, task);
    return task;
  }

  async function translateLyricLines(lines, locale) {
    if (locale !== 'vi-VN') throw new RangeError('Unsupported translation locale');
    if (!Array.isArray(lines) || lines.length > 180 ||
        lines.some(s => typeof s !== 'string' || s.length > 300) ||
        lines.reduce((n, s) => n + s.length, 0) > 24000) {
      throw new RangeError('Invalid lyric translation payload');
    }
    const result = new Array(lines.length);
    let next = 0;
    async function worker() {
      while (next < lines.length) {
        const index = next++;
        result[index] = await translateOne(lines[index]);
      }
    }
    await Promise.all(Array.from({ length: Math.min(5, lines.length) }, worker));
    return result;
  }

  return translateLyricLines;
}

module.exports = {
  createLyricTranslator,
  translateLyricLines: createLyricTranslator()
};
