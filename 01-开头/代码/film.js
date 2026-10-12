// film.js —— 老影像素材：ffmpeg 预先抽好的灰度 jpg 序列（30 帧/秒，见 _gen/extract_footage.py），
//            画的时候做双色调（暗部、亮部各一种颜色）、片门抖动、亮度闪烁、灰尘和划痕
'use strict';
// FOOT 来自 footdata.js：{名字: {n 帧数, w, h}}
const FUSE = {};   // 镜头里怎么用：id -> {name, a 成片起点, off 素材内起点(秒), rate 速度}
function fuse(id, name, a, b, off = 0, rate = 1) { FUSE[id] = { name, a, b, off, rate }; }
const FCACHE = new Map(), FC_MAX = 240;
function fIdx(name, lt) { const f = FOOT[name]; return f ? clamp(Math.floor(lt * 30), 0, f.n - 1) : 0; }
function fLT(id, T) { const u = FUSE[id]; return u.off + Math.max(0, T - u.a) * u.rate; }
function loadFrame(name, i) {
  const key = name + ':' + i;
  if (FCACHE.has(key)) { const v = FCACHE.get(key); FCACHE.delete(key); FCACHE.set(key, v); return v.p; }
  const img = new Image();
  const p = new Promise(res => { img.onload = () => res(img); img.onerror = () => { console.error('缺帧 ' + key); res(null); }; });
  img.src = `../素材/footage_frames/${name}/f_${String(i + 1).padStart(4, '0')}.jpg`;
  FCACHE.set(key, { img, p }); if (FCACHE.size > FC_MAX) FCACHE.delete(FCACHE.keys().next().value);
  return p;
}
// seek 之前调用：把 T 时刻要用的帧都加载好
function preloadFootage(T) {
  const ps = [];
  for (const id in FUSE) { const u = FUSE[id]; if (T < u.a - .05 || T > u.b + .05 || !FOOT[u.name]) continue; const i = fIdx(u.name, fLT(id, T)); ps.push(loadFrame(u.name, i)); if (i + 1 < FOOT[u.name].n) loadFrame(u.name, i + 1); }
  return Promise.all(ps);
}
function frameOf(id, T) { const u = FUSE[id]; if (!u || !FOOT[u.name]) return null; const v = FCACHE.get(u.name + ':' + fIdx(u.name, fLT(id, T))); return v && v.img.complete && v.img.naturalWidth ? v.img : null; }

let FB = null, FBX = null, MK = null, MKX = null;
function fbuf(w, h) { if (!FB || FB.width < w || FB.height < h) { FB = cv(Math.max(w, FB ? FB.width : 0), Math.max(h, FB ? FB.height : 0)); FBX = FB.getContext('2d'); } FBX.setTransform(1, 0, 0, 1, 0, 0); FBX.globalCompositeOperation = 'source-over'; FBX.globalAlpha = 1; FBX.filter = 'none'; FBX.clearRect(0, 0, w, h); return FBX; }

// 画一段老影像到 (x,y,w,h)（当前坐标系）。o:
//   lo/hi 暗部/亮部颜色，a 透明度，zoom 推近倍数，px/py 取景中心(0..1)，weave 抖动像素，flicker 闪烁幅度，
//   dirt 灰尘划痕强度，vig 画框内暗角，mask(fx, s) 在缓冲区坐标里画遮罩形状（destination-in），sat 保留原色比例(彩色片)
function drawFootage(ctx, id, T, x, y, w, h, o = {}) {
  const a = o.a === undefined ? 1 : o.a; if (a <= 0) return;
  const img = frameOf(id, T); if (!img) return;
  const m = ctx.getTransform(), sc = Math.hypot(m.a, m.b), pw = Math.max(2, Math.ceil(w * sc)), ph = Math.max(2, Math.ceil(h * sc));
  const fx = fbuf(pw, ph);
  const fi = Math.floor(T * 24), r = rng(fi * 7919 + 13);
  const wv = (o.weave === undefined ? 1.6 : o.weave) * sc, wx = (r() - .5) * wv, wy = (r() - .5) * wv;
  const flick = 1 + (noise1(T * 18) - .5) * (o.flicker === undefined ? .1 : o.flicker);
  // cover 取景
  const z = o.zoom || 1, iw = img.naturalWidth, ih = img.naturalHeight, s = Math.max(pw / iw, ph / ih) * z;
  const dw = iw * s, dh = ih * s, cx = (o.px === undefined ? .5 : o.px), cy = (o.py === undefined ? .5 : o.py);
  const dx = clamp(pw / 2 - dw * cx, pw - dw, 0) + wx, dy = clamp(ph / 2 - dh * cy, ph - dh, 0) + wy;
  fx.filter = `contrast(${o.contrast || 1.12}) brightness(${flick * (o.bright || 1)})`;
  fx.drawImage(img, dx, dy, dw, dh); fx.filter = 'none';
  // 双色调
  fx.globalCompositeOperation = 'multiply'; fx.fillStyle = o.hi || '#f1dfbb'; fx.fillRect(0, 0, pw, ph);
  fx.globalCompositeOperation = 'screen'; fx.fillStyle = o.lo || '#0d1a40'; fx.fillRect(0, 0, pw, ph);
  fx.globalCompositeOperation = 'source-over';
  // 画框内暗角
  const vg = fx.createRadialGradient(pw / 2, ph / 2, Math.min(pw, ph) * .35, pw / 2, ph / 2, Math.hypot(pw, ph) * .55);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(3,6,20,${o.vig === undefined ? .55 : o.vig})`); fx.fillStyle = vg; fx.fillRect(0, 0, pw, ph);
  // 颗粒
  fx.globalAlpha = .22; fx.fillStyle = fx.createPattern(GRAIN.dark, 'repeat'); fx.save(); fx.translate(r() * 300, r() * 300); fx.fillRect(-300, -300, pw + 300, ph + 300); fx.restore();
  fx.globalAlpha = .12; fx.fillStyle = fx.createPattern(GRAIN.light, 'repeat'); fx.save(); fx.translate(r() * 300, r() * 300); fx.fillRect(-300, -300, pw + 300, ph + 300); fx.restore(); fx.globalAlpha = 1;
  // 灰尘、毛发、划痕（每帧随机）
  const dirt = o.dirt === undefined ? 1 : o.dirt;
  if (dirt > 0) {
    const nd = Math.floor(r() * 5 * dirt);
    for (let i = 0; i < nd; i++) { const bx = r() * pw, by = r() * ph, br = (1 + r() * 3.5) * sc; fx.fillStyle = r() < .6 ? 'rgba(10,8,6,.7)' : 'rgba(255,248,230,.6)'; fx.beginPath(); fx.ellipse(bx, by, br, br * (.5 + r()), r() * 3, 0, 7); fx.fill(); }
    if (r() < .25 * dirt) { fx.strokeStyle = 'rgba(20,14,10,.55)'; fx.lineWidth = 1.2 * sc; fx.beginPath(); const hx = r() * pw, hy = r() * ph; fx.moveTo(hx, hy); fx.bezierCurveTo(hx + 20 * sc, hy + 10 * sc, hx + 10 * sc, hy + 30 * sc, hx + 30 * sc, hy + 40 * sc); fx.stroke(); }
    const sx = (noise1(T * .7 + 3) * 1.4 - .2) * pw; if (sx > 0 && sx < pw && dirt > .5) { fx.strokeStyle = 'rgba(255,250,235,.22)'; fx.lineWidth = 1.1 * sc; fx.beginPath(); fx.moveTo(sx, 0); fx.lineTo(sx + 3 * sc, ph); fx.stroke(); }
  }
  if (o.mask) {   // 遮罩先单独画好，再一次性 destination-in（逐个字直接 destination-in 会漏掉没画到的区域）
    if (!MK || MK.width < pw || MK.height < ph) { MK = cv(Math.max(pw, MK ? MK.width : 0), Math.max(ph, MK ? MK.height : 0)); MKX = MK.getContext('2d'); }
    MKX.setTransform(1, 0, 0, 1, 0, 0); MKX.globalCompositeOperation = 'source-over'; MKX.clearRect(0, 0, MK.width, MK.height); MKX.fillStyle = '#fff'; o.mask(MKX, sc);
    fx.globalCompositeOperation = 'destination-in'; fx.drawImage(MK, 0, 0); fx.globalCompositeOperation = 'source-over';
    fx.clearRect(pw, 0, FB.width, FB.height); fx.clearRect(0, ph, FB.width, FB.height);
  }
  ctx.save(); ctx.globalAlpha *= a; ctx.drawImage(FB, 0, 0, pw, ph, x, y, w, h); ctx.restore();
}

// 胶片画框：圆角框 + 片孔条。o: {sprocket:'tb'|'lr'|'', col, a, r}
function drawFilmFrame(ctx, x, y, w, h, o = {}) {
  const a = o.a === undefined ? 1 : o.a; if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  const sp = o.sprocket || '', band = o.band || 34;
  if (sp) {
    ctx.fillStyle = '#05070f';
    const holes = (x0, y0, len, vert) => {
      const n = Math.floor(len / 42); for (let i = 0; i < n; i++) { const t = (i + .5) * len / n; const hx = vert ? x0 : x0 + t, hy = vert ? y0 + t : y0;
        ctx.fillStyle = hex(COL.cream, .16); roundRect(ctx, hx - (vert ? 9 : 11), hy - (vert ? 11 : 9), vert ? 18 : 22, vert ? 22 : 18, 4); ctx.fill(); }
    };
    if (sp.includes('t')) { ctx.fillStyle = 'rgba(4,6,14,.92)'; ctx.fillRect(x - 8, y - band, w + 16, band); holes(x, y - band / 2, w, false); }
    if (sp.includes('b')) { ctx.fillStyle = 'rgba(4,6,14,.92)'; ctx.fillRect(x - 8, y + h, w + 16, band); holes(x, y + h + band / 2, w, false); }
    if (sp.includes('l')) { ctx.fillStyle = 'rgba(4,6,14,.92)'; ctx.fillRect(x - band, y - 8, band, h + 16); holes(x - band / 2, y, h, true); }
    if (sp.includes('r')) { ctx.fillStyle = 'rgba(4,6,14,.92)'; ctx.fillRect(x + w, y - 8, band, h + 16); holes(x + w + band / 2, y, h, true); }
  }
  ctx.strokeStyle = hex(o.col || COL.cream, .55); ctx.lineWidth = 2; roundRect(ctx, x, y, w, h, o.r === undefined ? 10 : o.r); ctx.stroke();
  ctx.restore();
}
