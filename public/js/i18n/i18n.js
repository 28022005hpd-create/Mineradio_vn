'use strict';
/**
 * Native, opt-in Mineradio locale service.
 * - Text is referenced by stable message ID (ui.xxxx), not by changing a
 *   rendered string with MutationObserver.
 * - Original zh-CN / translated vi-VN have identical IDs.
 * - UI modules may use t(id), source(text) or bind a static data-i18n key.
 * - Language changes update only registered interface labels. They do not
 *   reload the document, HTMLAudioElement, WebAudio or Three.js renderer.
 */
(function (root, factory) {
  const api = factory(root || {});
  if (root) root.MineradioI18n = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  const catalogs = root.MineradioLocales || {};
  const DEFAULT = 'zh-CN';
  const VIETNAMESE = 'vi-VN';
  const STORAGE = 'mineradio:language:v2';
  const ALLOWED = Object.freeze([DEFAULT, VIETNAMESE]);
  const sourceIndex = Object.create(null);
  const zh = catalogs[DEFAULT] || {};
  const vi = catalogs[VIETNAMESE] || {};
  for (const id of Object.keys(zh)) {
    if (!Object.prototype.hasOwnProperty.call(sourceIndex, zh[id])) sourceIndex[zh[id]] = id;
  }

  let locale = DEFAULT;
  try {
    const saved = root.localStorage && root.localStorage.getItem(STORAGE);
    const old = root.localStorage && root.localStorage.getItem('mineradio:ui-language:v1');
    locale = ALLOWED.includes(saved) ? saved : old === 'vi' ? VIETNAMESE : old === 'zh' ? DEFAULT : VIETNAMESE;
  } catch (_) { locale = VIETNAMESE; }

  const missingIds = new Set();
  const listeners = new Set();
  const staticAttrs = Object.freeze([
    ['data-i18n', 'textContent'], ['data-i18n-title', 'title'],
    ['data-i18n-placeholder', 'placeholder'], ['data-i18n-aria-label', 'aria-label'],
    ['data-i18n-alt', 'alt']
  ]);

  function interpolate(message, params) {
    if (!params || typeof params !== 'object') return message;
    return String(message).replace(/\{([a-zA-Z]\w*)\}/g, (source, name) =>
      Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : source);
  }

  function t(id, params) {
    if (typeof id !== 'string' || !id) return '';
    const current = catalogs[locale] || zh;
    const message = current[id] || zh[id];
    if (!message) {
      missingIds.add(id);
      return id;
    }
    return interpolate(message, params);
  }

  // Transitional helper for render functions with original Chinese constants.
  // UI only: NEVER feed dynamic song titles, artists, lyrics or account data here.
  function source(value, params) {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    const id = sourceIndex[value] || sourceIndex[trimmed];
    if (id) {
      const left = value.slice(0, value.indexOf(trimmed));
      const right = value.slice(value.indexOf(trimmed) + trimmed.length);
      return left + t(id, params) + right;
    }
    // A few count labels are grammatical templates rather than static IDs.
    if (locale === VIETNAMESE) {
      const match = /^(\d+)\s*(首歌曲|首|分钟|秒)$/.exec(trimmed);
      if (match) return match[1] + ' ' + ({
        '首歌曲':'bài hát', '首':'bài', '分钟':'phút', '秒':'giây'
      })[match[2]];
    }
    return value;
  }

  function bind(rootNode) {
    const doc = root.document;
    if (!doc || !rootNode) return;
    let elements = [];
    if (rootNode.nodeType === 1 && rootNode.hasAttribute &&
        staticAttrs.some(([attr]) => rootNode.hasAttribute(attr))) elements.push(rootNode);
    if (typeof rootNode.querySelectorAll === 'function') {
      elements = elements.concat(Array.from(rootNode.querySelectorAll(
        '[data-i18n],[data-i18n-title],[data-i18n-placeholder],[data-i18n-aria-label],[data-i18n-alt]'
      )));
    }
    for (const element of elements) {
      for (const [keyAttr, property] of staticAttrs) {
        const key = element.getAttribute(keyAttr);
        if (!key) continue;
        const value = t(key);
        if (value === key) continue;
        if (property === 'textContent') {
          // Never destroy event handlers or nested markup: only leaf labels
          // are keyed in the original templates.
          if (element.childElementCount === 0 && element.textContent !== value) {
            element.textContent = value;
          }
        } else if (element.getAttribute(property) !== value) {
          element.setAttribute(property, value);
        }
      }
    }
  }

  function setLanguage(next) {
    if (!ALLOWED.includes(next)) return locale;
    if (locale === next) return locale;
    locale = next;
    try { root.localStorage && root.localStorage.setItem(STORAGE, locale); } catch (_) {}
    // Electron owns the native tray preference; no network and no page reload.
    if (root.desktopWindow && typeof root.desktopWindow.setUiLanguage === 'function') {
      Promise.resolve(root.desktopWindow.setUiLanguage(locale)).catch(() => {});
    }
    const doc = root.document;
    if (doc) {
      doc.documentElement.lang = locale;
      bind(doc);
      const picker = doc.getElementById && doc.getElementById('mineradio-language-select');
      if (picker) picker.value = locale;
    }
    for (const callback of Array.from(listeners)) {
      try { callback(locale); } catch (_) { /* one consumer cannot break audio */ }
    }
    if (root.dispatchEvent && root.CustomEvent) {
      root.dispatchEvent(new root.CustomEvent('mineradio:languagechange', { detail: { locale } }));
    }
    return locale;
  }

  function onChange(callback) {
    if (typeof callback !== 'function') return () => {};
    listeners.add(callback);
    return () => listeners.delete(callback);
  }

  function init() {
    const doc = root.document;
    if (!doc) return;
    if (root.desktopWindow) {
      if (typeof root.desktopWindow.onUiLanguageChanged === 'function') {
        root.desktopWindow.onUiLanguageChanged((next) => setLanguage(next));
      }
      if (typeof root.desktopWindow.getUiLanguage === 'function') {
        const initially = locale;
        const hasLocalChoice = (() => {
          try {
            return !!(root.localStorage && (
              root.localStorage.getItem(STORAGE) ||
              root.localStorage.getItem('mineradio:ui-language:v1')
            ));
          } catch (_) { return false; }
        })();
        Promise.resolve(root.desktopWindow.getUiLanguage()).then((result) => {
          if (locale !== initially) return; // user switched during async startup
          if (hasLocalChoice && typeof root.desktopWindow.setUiLanguage === 'function') {
            // Migrate explicit renderer choice to the shared native tray preference.
            return root.desktopWindow.setUiLanguage(locale);
          }
          if (result && ALLOWED.includes(result.locale)) setLanguage(result.locale);
        }).catch(() => {});
      }
    }
    doc.documentElement.lang = locale;
    const picker = doc.getElementById && doc.getElementById('mineradio-language-select');
    if (picker) picker.value = locale;
    bind(doc);
  }

  const api = Object.freeze({
    locales: ALLOWED,
    get locale() { return locale; },
    t, source, bind, setLanguage, onChange,
    getMissingKeys: () => Array.from(missingIds).sort(),
    has: id => Object.prototype.hasOwnProperty.call(zh, id) &&
      Object.prototype.hasOwnProperty.call(vi, id)
  });
  if (root.document) {
    if (root.document.readyState === 'loading') {
      root.document.addEventListener('DOMContentLoaded', init, { once: true });
    } else init();
  }
  return api;
});
