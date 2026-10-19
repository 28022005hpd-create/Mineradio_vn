/* Native Bloom Lyrics glyph sampling.
 * Offscreen CPU mask, never inserted into DOM, with typed 3D point targets
 * on the SAME geometry as the flower. Samples only when the line changes.
 */
(function (host, make) {
  'use strict';
  var api = make();
  if (host) host.MineradioBloomGlyphs = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof window === 'undefined' ? null : window, function () {
  'use strict';
  var W = 1024, H = 256;
  function clean(source) {
    return Array.from(String(source || '').replace(/<[^>]*>/g, '')
      .replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim())
      .slice(0, 72).join('');
  }
  function split(text) {
    var chars = Array.from(clean(text));
    if (chars.length <= 25) return [chars.join('')];
    var cut = Math.ceil(chars.length / 2);
    for (var i = 0; i < 7; i++) {
      if (chars[cut + i] === ' ') { cut += i; break; }
      if (chars[cut - i] === ' ') { cut -= i; break; }
    }
    return [chars.slice(0, cut).join('').trim(), chars.slice(cut).join('').trim()];
  }
  function rasterize(text, documentRef) {
    text = clean(text);
    if (!text || !documentRef || !documentRef.createElement) return [];
    var canvas = documentRef.createElement('canvas');
    canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return [];
    var lines = split(text);
    ctx.clearRect(0, 0, W, H);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 88px "Microsoft YaHei","Noto Sans CJK SC","Segoe UI",sans-serif';
    if (lines.length === 1) ctx.fillText(lines[0], W / 2, H / 2, W - 56);
    else {
      ctx.font = 'bold 76px "Microsoft YaHei","Noto Sans CJK SC","Segoe UI",sans-serif';
      ctx.fillText(lines[0], W / 2, H * 0.33, W - 56);
      ctx.fillText(lines[1], W / 2, H * 0.69, W - 56);
    }
    var pixels;
    try { pixels = ctx.getImageData(0, 0, W, H).data; } catch (_) { return []; }
    var points = [];
    for (var y = 4; y < H - 4; y += 2) for (var x = 4; x < W - 4; x += 2) {
      if (pixels[4 * (y * W + x) + 3] > 115) points.push([x, y]);
    }
    return points;
  }
  function assign(geometry, text, doc) {
    text = clean(text);
    var stamp = geometry && geometry.userData;
    if (!geometry || !stamp || !geometry.getAttribute) return false;
    if (stamp.bloomLine === text) return !!stamp.bloomGlyphs;
    var positions = geometry.getAttribute('aGlyph');
    var progress = geometry.getAttribute('aGlyphX');
    if (!positions || !progress) return false;
    var points = rasterize(text, doc);
    stamp.bloomLine = text;
    if (points.length < 12) { stamp.bloomGlyphs = false; return false; }
    var count = progress.array.length, n = points.length;
    var out = positions.array, fractions = progress.array;
    var seed = 12837261;
    for (var i = 0; i < count; i++) {
      seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
      var pixel = points[(i * 157 + (seed >>> 0)) % n];
      var p = 3 * i;
      out[p] = (pixel[0] / W - 0.5) * 10.1;
      out[p + 1] = (0.5 - pixel[1] / H) * 2.55;
      out[p + 2] = ((i % 13) - 6) * 0.009;
      fractions[i] = pixel[0] / W;
    }
    positions.needsUpdate = true;
    progress.needsUpdate = true;
    stamp.bloomGlyphs = true;
    return true;
  }
  return Object.freeze({ clean: clean, split: split, rasterize: rasterize, assign: assign });
});
