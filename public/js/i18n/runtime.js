'use strict';
/* Non-invasive live localization for the original Mineradio renderer.
 * No third-party translator, network traffic or mutation of JS source strings.
 * Future upstream UI nodes are picked up by the observer without a rebuild.
 */
(function (root) {
  const dict = root.MineradioVietnamese;
  if (!dict || !root.document) return;
  const document = root.document;
  const KEY = 'mineradio:ui-language:v1';
  const UNKNOWN_LIMIT = 500;
  const TEXT_ONLY = 3;
  const ELEMENT = 1;
  const LABEL_ATTRS = ['title', 'placeholder', 'aria-label', 'alt'];
  const IGNORE = [
    '[data-i18n-skip]', '[data-mineradio-i18n]',
    '[contenteditable="true"]', 'script', 'style', 'textarea', 'code', 'pre', 'svg', 'canvas',
    // Song/artist/library metadata and lyrics must remain in their original language.
    '.song-name', '.song-title', '.song-artist', '.song-album', '.song-cover',
    '.track-title', '.track-artist', '.track-name', '.track-meta', '.artist-name',
    '.search-song-name', '.search-song-artist', '.search-song-title',
    '.lyric-line', '.lyric-row', '.lyric-text', '.lyrics-line', '.lyrics-row',
    '.lyrics-text', '.lyrics-display', '.lyric-viewport', '.lyric-scroll',
    '#lyrics-text', '#lyrics-container', '#track-title', '#track-artist',
    '#current-song-name', '#current-song-artist', '#home-today-artist',
    '#home-next-title', '.playlist-track-name', '.queue-song-name',
    '.queue-item-title', '.queue-item-artist'
  ].join(',');
  const rememberedText = new WeakMap();
  const rememberedAttributes = new WeakMap();
  const unknown = new Set();
  const pending = new Set();
  let locale = 'vi';
  let observer = null;
  let scheduled = false;
  let button = null;

  try { locale = root.localStorage.getItem(KEY) === 'zh' ? 'zh' : 'vi'; } catch (_) {}

  function ignored(el) {
    return !!(el && typeof el.closest === 'function' && el.closest(IGNORE));
  }

  function noteUnknown(text) {
    const key = String(text || '').trim();
    if (key && key.length <= 150 && dict.isChinese(key) && unknown.size < UNKNOWN_LIMIT) unknown.add(key);
  }

  function translateOrOriginal(source) {
    if (locale !== 'vi') return source;
    const translated = dict.translate(source);
    if (translated === source) noteUnknown(source);
    return translated;
  }

  // Cache the SOURCE and our last rendered value. If upstream changes the DOM,
  // treat it as NEW SOURCE instead of treating our translation as input.
  // Translation is idempotent: observing our own changes is a no-op.
  function text(node) {
    const parent = node.parentElement;
    if (!parent || ignored(parent)) return;
    const current = node.nodeValue || '';
    let memory = rememberedText.get(node);
    if (memory && current !== memory.rendered) {
      memory = { source: current, rendered: current };
    } else if (!memory) {
      memory = { source: current, rendered: current };
    }
    const next = translateOrOriginal(memory.source);
    memory.rendered = next;
    rememberedText.set(node, memory);
    if (next !== current) node.nodeValue = next;
  }

  function attributes(el) {
    if (ignored(el)) return;
    let records = rememberedAttributes.get(el);
    if (!records) { records = new Map(); rememberedAttributes.set(el, records); }
    for (const name of LABEL_ATTRS) {
      if (!el.hasAttribute(name)) { records.delete(name); continue; }
      const current = el.getAttribute(name);
      let state = records.get(name);
      if (!state || current !== state.rendered) state = { source: current, rendered: current };
      const next = translateOrOriginal(state.source);
      state.rendered = next;
      records.set(name, state);
      if (current !== next) el.setAttribute(name, next);
    }
  }

  function visit(rootNode) {
    if (!rootNode) return;
    if (rootNode.nodeType === TEXT_ONLY) { text(rootNode); return; }
    if (rootNode.nodeType !== ELEMENT && rootNode.nodeType !== 9) return;
    if (rootNode.nodeType === ELEMENT && ignored(rootNode)) return;
    if (rootNode.nodeType === ELEMENT) attributes(rootNode);
    // TreeWalker does not mutate tag markup; event handlers and control values survive.
    const walker = document.createTreeWalker(rootNode, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.nodeType === TEXT_ONLY) text(node);
      else if (node.nodeType === ELEMENT) attributes(node);
    }
  }

  function flush() {
    scheduled = false;
    const queued = Array.from(pending);
    pending.clear();
    // Coalesce repeated updates of a single section during the same frame.
    for (const node of queued) if (node.isConnected !== false) visit(node);
    if (pending.size) schedule();
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    // Do not occupy Mineradio's FFT/Three.js render loop.
    root.setTimeout(flush, 40);
  }

  function enqueue(node) {
    if (!node || node.isConnected === false) return;
    pending.add(node);
    schedule();
  }

  function updateButton() {
    if (!button) return;
    const vietnamese = locale === 'vi';
    button.textContent = vietnamese ? '中文' : 'Tiếng Việt';
    button.title = vietnamese ? 'Chuyển về giao diện gốc' : 'Chuyển sang tiếng Việt';
    button.setAttribute('aria-label', button.title);
    button.setAttribute('aria-pressed', String(vietnamese));
    document.documentElement.lang = vietnamese ? 'vi' : 'zh-CN';
  }

  function setLanguage(next) {
    locale = next === 'zh' ? 'zh' : 'vi';
    try { root.localStorage.setItem(KEY, locale); } catch (_) {}
    updateButton();
    enqueue(document.body);
    return locale;
  }

  function makeToggle() {
    if (!document.body || document.getElementById('mineradio-language-toggle')) return;
    button = document.createElement('button');
    button.id = 'mineradio-language-toggle';
    button.type = 'button';
    button.setAttribute('data-mineradio-i18n', '');
    button.style.cssText = [
      'position:fixed', 'right:12px', 'bottom:12px', 'z-index:2147482000',
      'padding:6px 12px', 'min-height:32px', 'max-width:110px',
      'color:#f0f6ff', 'background:rgba(13,20,33,.88)',
      'border:1px solid rgba(154,218,255,.55)', 'border-radius:12px',
      'font:600 12px/1.4 Inter,Arial,sans-serif', 'cursor:pointer',
      'box-shadow:0 2px 12px rgba(0,0,0,.27)'
    ].join(';');
    button.addEventListener('click', () => setLanguage(locale === 'vi' ? 'zh' : 'vi'));
    document.body.appendChild(button);
    updateButton();
  }

  function init() {
    if (observer) return;
    makeToggle();
    visit(document.body);
    updateButton();
    observer = new MutationObserver(changes => {
      for (const change of changes) {
        if (change.type === 'characterData') enqueue(change.target);
        else if (change.type === 'attributes') enqueue(change.target);
        else if (change.type === 'childList') {
          for (const node of change.addedNodes) enqueue(node);
        }
      }
    });
    observer.observe(document.body, {
      subtree: true, childList: true, characterData: true,
      attributes: true, attributeFilter: LABEL_ATTRS
    });
  }

  const api = Object.freeze({
    get language() { return locale; },
    setLanguage,
    getUntranslatedLabels: () => Array.from(unknown).sort(),
    translate: dict.translate,
    version: dict.version
  });
  root.MineradioI18n = api;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})(typeof window !== 'undefined' ? window : globalThis);
