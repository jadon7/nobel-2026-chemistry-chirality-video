// lib.js —— 通用小工具：缓动、插值、随机数、离屏画布、颗粒纹理
'use strict';
const W = 1920, H = 1080, SS = 2;            // 设计尺寸 1920×1080，画布两倍超采样
let TA = 0;                                   // 环境时钟（真实播放时间）：星星、微尘、轻摆一直走；故事动画用设计时间 t，停顿时可以停住
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const prog = (t, a, b) => clamp((t - a) / (b - a));          // t 在 [a,b] 里的进度 0..1
const eIO = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;   // 三次缓入缓出
const eOut = k => 1 - Math.pow(1 - k, 3);
const eIn = k => k * k * k;
const eOutBack = (k, s = 1.4) => 1 + (s + 1) * Math.pow(k - 1, 3) + s * Math.pow(k - 1, 2);
const smooth = k => k * k * (3 - 2 * k);
const win = (t, a, b, fi = .4, fo = .4) => Math.min(eIO(prog(t, a, a + fi)), 1 - eIO(prog(t, b - fo, b))); // 窗口淡入淡出
function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
function cv(w, h) { const c = document.createElement('canvas'); c.width = Math.ceil(w); c.height = Math.ceil(h); return c; }
const hex = (h, a = 1) => { const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; };
const mixHex = (h1, h2, k) => { const a = parseInt(h1.slice(1), 16), b = parseInt(h2.slice(1), 16); const c = s => Math.round(lerp(a >> s & 255, b >> s & 255, k)); return `rgb(${c(16)},${c(8)},${c(0)})`; };

// 关键帧插值：K=[[t,{x,y,z,...}],...]，按 eIO 在相邻关键帧间过渡
function keys(K, t) {
  if (t <= K[0][0]) return { ...K[0][1] };
  for (let i = 0; i < K.length - 1; i++) {
    const [ta, a] = K[i], [tb, b] = K[i + 1];
    if (t <= tb) { const k = eIO(prog(t, ta, tb)), o = {}; for (const p in a) o[p] = lerp(a[p], b[p] !== undefined ? b[p] : a[p], k); return o; }
  }
  return { ...K[K.length - 1][1] };
}

// 颗粒纹理（画一次，反复用）：亮点、暗点两种
const GRAIN = {};
function makeGrain() {
  const mk = (n, dark, seed) => {
    const c = cv(n, n), x = c.getContext('2d'), d = x.createImageData(n, n), r = rng(seed);
    for (let i = 0; i < n * n; i++) { const v = r(); const a = v < .5 ? Math.pow(v * 2, 3) : 0; const o = i * 4; const g = dark ? 0 : 255; d.data[o] = g; d.data[o + 1] = g; d.data[o + 2] = g; d.data[o + 3] = Math.round(a * 255); }
    x.putImageData(d, 0, 0); return c;
  };
  GRAIN.light = mk(512, false, 7); GRAIN.dark = mk(512, true, 11);
  // 点彩：稀疏的较大颗粒，用来做阴影里的"网点"
  const s = cv(512, 512), sx = s.getContext('2d'), r = rng(23);
  for (let i = 0; i < 9000; i++) { sx.fillStyle = `rgba(0,0,0,${.35 + r() * .5})`; const rr = .5 + r() * 1.1; sx.beginPath(); sx.arc(r() * 512, r() * 512, rr, 0, 7); sx.fill(); }
  GRAIN.stip = s;
  const s2 = cv(512, 512), sx2 = s2.getContext('2d'), r2 = rng(29);
  for (let i = 0; i < 9000; i++) { sx2.fillStyle = `rgba(255,255,255,${.3 + r2() * .55})`; const rr = .5 + r2() * 1.1; sx2.beginPath(); sx2.arc(r2() * 512, r2() * 512, rr, 0, 7); sx2.fill(); }
  GRAIN.stipL = s2;
}

// 在当前路径/已画内容上叠颗粒：mode 'source-atop' 只落在已有像素上
function grainOver(ctx, x, y, w, h, alpha = .25, kind = 'light', comp = 'source-atop', off = 0) {
  const pat = ctx.createPattern(GRAIN[kind], 'repeat');
  ctx.save(); ctx.globalCompositeOperation = comp; ctx.globalAlpha = alpha; ctx.fillStyle = pat;
  ctx.translate(off, off * .7); ctx.fillRect(x - off, y - off * .7, w, h); ctx.restore();
}

// 柔光圆点（发光）
function glow(ctx, x, y, r, col, a = 1) {
  if (a <= 0 || r <= 0) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, hex(col, a)); g.addColorStop(.35, hex(col, a * .35)); g.addColorStop(1, hex(col, 0));
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
}
