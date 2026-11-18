'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const detail = read('public/js/modules/05-playback/06-track-detail-lyrics-actions.js');
function snippet(begin, end) {
  const a = detail.indexOf(begin), b = detail.indexOf(end, a);
  assert.ok(a >= 0 && b > a, 'Missing source block ' + begin);
  return detail.slice(a,b);
}
function makeContext(fetcher) {
  const nodes = {};
  const ctx = {
    console, Map, Promise, trackDetailSeq: 7,
    MineradioI18n: { locale: 'vi-VN' },
    document: {
      querySelector(sel) {
        const match = /data-comment-vi="(\d+)"/.exec(sel);
        if (!match) return null;
        const i = Number(match[1]);
        if (!nodes[i]) {
          const classes = new Set();
          nodes[i] = {
            hidden: false, textContent: '', childNodes: [],
            classList: { add(x) { classes.add(x); }, remove(x) { classes.delete(x); }, contains(x) { return classes.has(x); } },
            removeAttribute() {},
            appendChild(child) { this.childNodes.push(child); },
          };
        }
        return nodes[i];
      },
      createElement() { return { textContent: '', className: '' }; },
      createTextNode(text) { return { nodeValue: text }; },
    },
    fetch: fetcher,
  };
  vm.createContext(ctx);
  const script =
    'var detailCommentTranslationCache = new Map();\n' +
    snippet('function detailCommentVietnameseEnabled()', 'function commentTimeLabel(') +
    snippet('function detailCommentNeedsTranslation(', 'function renderDetailComments(') +
    snippet('function detailCommentTranslationSegments(', 'function detailCommentsConfig(');
  vm.runInContext(script,ctx);
  return { ctx, nodes };
}
test('Chinese and English comments qualify, emoji-only comments do not', () => {
  const {ctx} = makeContext();
  assert.equal(ctx.detailCommentNeedsTranslation('这首歌真的好听'),true);
  assert.equal(ctx.detailCommentNeedsTranslation('Lovely song'),true);
  assert.equal(ctx.detailCommentNeedsTranslation('😭🌟'),false);
});
test('long reviews are split on natural boundaries under translation server limits', () => {
  const {ctx} = makeContext();
  const text = '非常喜欢这首歌，今天又听了一遍。'.repeat(90);
  const chunks = ctx.detailCommentTranslationSegments(text);
  assert.ok(chunks.length > 3);
  assert.ok(chunks.length <= 9);
  assert.ok(chunks.every(x=>x.length <= 250));
  assert.equal(chunks.join(''), text.slice(0,1800));
});
test('automatic translations are progressive and one failed review does not stop the others', async () => {
  const sent = [];
  const {ctx,nodes} = makeContext(async (url,opts) => {
    assert.equal(url, '/api/lyrics/translate');
    const body = JSON.parse(opts.body);
    sent.push(body);
    assert.equal(body.locale,'vi-VN');
    assert.ok(body.lines.every(s=>s.length <= 250));
    if(body.lines[0].includes('ERROR')) throw Error('network failed');
    return {ok:true, async json() {return {translations:body.lines.map(()=> 'Bản dịch thử nghiệm tiếng Việt')};}};
  });
  await ctx.translateDetailCommentsToVietnamese([
    {content:'ERROR music comment'},{content:'这是中文评论，希望大家都听到。'}
  ],7);
  assert.ok(nodes[0].classList.contains('comment-vi-unavailable'));
  assert.equal(nodes[1].childNodes[0].textContent,'Bản dịch tiếng Việt');
  assert.equal(nodes[1].childNodes[1].nodeValue,'Bản dịch thử nghiệm tiếng Việt');
  assert.equal(ctx.detailCommentTranslationCache.size,1);
  assert.equal(sent.length,2);
});
test('closing modal cancels outdated comments and original content remains separate', () => {
  assert.match(detail,/function closeTrackDetailModal\(\) \{\s*\+\+trackDetailSeq/);
  assert.match(detail,/class="comment-text">' \+ escHtml\(sourceText\)/);
  assert.match(detail,/function translateDetailCommentsToVietnamese/);
  assert.match(detail,/data-comment-state="pending"/);
  assert.match(detail,/Chưa thể dịch bình luận này/);
  assert.doesNotMatch(detail,/c\.content\s*=\s*vi/);
});
test('Vietnamese DIY media buttons use full width two-column actions without broken words', () => {
  const css=read('public/css/index.css');
  const tail=css.slice(css.lastIndexOf('/* vi-VN: repair narrow DIY toolbar tabs'));
  assert.match(tail,/\.bg-media-actions, \.wallpaper-engine-actions/);
  assert.match(tail,/grid-column: 1 \/ -1/);
  assert.match(tail,/grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(tail,/white-space: nowrap !important/);
  assert.match(tail,/overflow-wrap: normal !important/);
  assert.match(tail,/\.fx-console-toolbar \.fx-panel-tabs/);
  assert.match(tail,/overflow-x: auto/);
  const ui = read('public/index.html');
  assert.match(ui,/id="bg-album-toggle-btn"/);
  assert.match(ui,/id="bg-media-crop-btn"/);
  assert.match(ui,/background-image-input/);
});
