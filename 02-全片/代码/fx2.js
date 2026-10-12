// fx2.js —— 这一期新增的通用效果：配色、旁白时间查询、文字、放映机光束、准星、年份翻牌、比例条
'use strict';
Object.assign(COL, {
  red: '#ff6a55', redD: '#c9372b', redL: '#ffb0a0',        // "左手"那一种（和正文"红色"一致）
  blue: '#4ea6ff', blueD: '#1f5fc4', blueL: '#a8d4ff',      // "右手"那一种（和正文"蓝色"一致）
  cream: '#f3e6c8', paper: '#efe2c4', warm: '#ffcf8a', steel: '#8fa6d8',
});
const FONT_H = '"HanSerif", serif', FONT_HB = '"HanSerifB", serif', FONT_B = '"Bebas", sans-serif', FONT_P = '"PuHui", sans-serif';

// 旁白时间：L(i) 第 i 句 [起, 止]；PH(i, j) 第 i 句第 j 个短语 [起, 止]（i 从 1 开始）
const L = i => [VO[i - 1].a, VO[i - 1].b];
const PH = (i, j) => { const p = VO[i - 1].ph[j]; return [p[1], p[2]]; };
const PA = (i, j) => PH(i, j)[0], PB = (i, j) => PH(i, j)[1];

// 确定性的 1D 噪声（闪烁、抖动用）
function hash1(n) { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
function noise1(x) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash1(i), hash1(i + 1), u); }

// 文字。o: {size, font, col, align, base, a, glow, glowCol, track(字距 px), dy, shadow}
function txt(ctx, s, x, y, o = {}) {
  const a = (o.a === undefined ? 1 : o.a); if (a <= 0) return 0;
  ctx.save(); ctx.globalAlpha *= a; ctx.font = `${o.size || 40}px ${o.font || FONT_T}`; ctx.textBaseline = o.base || 'middle';
  const tr = o.track || 0; let w = ctx.measureText(s).width + tr * (s.length - 1);
  let x0 = o.align === 'left' ? x : o.align === 'right' ? x - w : x - w / 2;
  if (o.shadow !== false) { ctx.shadowColor = o.shadowCol || 'rgba(0,0,0,.6)'; ctx.shadowBlur = o.shadowBlur || 14; }
  if (o.glow) { ctx.shadowColor = hex(o.glowCol || o.col || '#ffffff', o.glow); ctx.shadowBlur = (o.size || 40) * .45; }
  ctx.fillStyle = o.fill || o.col || '#ffffff';
  if (!tr) { ctx.textAlign = 'left'; ctx.fillText(s, x0, y + (o.dy || 0)); }
  else { ctx.textAlign = 'left'; for (const ch of s) { ctx.fillText(ch, x0, y + (o.dy || 0)); x0 += ctx.measureText(ch).width + tr; } }
  ctx.restore(); return w;
}
// 逐字出现的文字（每个字从下方 12px 浮上来、淡入）。k 0..1
function txtReveal(ctx, s, x, y, k, o = {}) {
  if (k <= 0) return;
  ctx.save(); ctx.font = `${o.size || 40}px ${o.font || FONT_T}`;
  const tr = o.track || 0, chars = [...s], ws = chars.map(c => ctx.measureText(c).width), w = ws.reduce((p, q) => p + q, 0) + tr * (chars.length - 1);
  let cx = o.align === 'left' ? x : o.align === 'right' ? x - w : x - w / 2; ctx.restore();
  const n = chars.length;
  chars.forEach((c, i) => { const kk = eOut(clamp(k * (n * .35 + 1) - i * .35)); if (kk > 0) txt(ctx, c, cx, y, { ...o, align: 'left', track: 0, a: (o.a === undefined ? 1 : o.a) * kk, dy: (1 - kk) * (o.rise === undefined ? 14 : o.rise) }); cx += ws[i] + tr; });
}

// 放映机光束：从 (x0,y0) 打向画面，带闪烁和光束里的微尘
function drawBeam(ctx, x0, y0, ang, spread, len, a, t) {
  if (a <= 0) return;
  const fl = .82 + .18 * noise1(t * 22) - .1 * (hash1(Math.floor(t * 24)) > .93 ? 1 : 0);
  ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.translate(x0, y0); ctx.rotate(ang);
  const g = ctx.createLinearGradient(0, 0, len, 0); g.addColorStop(0, hex('#fff1d0', .5 * a * fl)); g.addColorStop(.35, hex('#ffe2a8', .16 * a * fl)); g.addColorStop(1, hex('#ffe2a8', 0));
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(len, -len * spread); ctx.lineTo(len, len * spread); ctx.lineTo(0, 6); ctx.closePath(); ctx.fill();
  ctx.clip();
  const r = rng(404);
  for (let i = 0; i < 120; i++) { const u = r(), v = r() * 2 - 1, sp = .3 + r(); const px = ((u * len + t * 30 * sp) % len), py = v * px * spread + Math.sin(t * sp + i) * 8;
    const tw = .4 + .6 * Math.sin(t * 2 * sp + i); ctx.fillStyle = hex('#fff6e0', a * fl * .5 * tw * (1 - px / len)); ctx.beginPath(); ctx.arc(px, py, .8 + r() * 1.8, 0, 7); ctx.fill(); }
  ctx.restore();
  glow(ctx, x0, y0, 120, '#fff0c8', .5 * a * fl);
}

// 准星：两圈反向转的刻度环
function drawReticle(ctx, x, y, r, a, t, col = COL.gold) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = hex(col, .95); ctx.lineCap = 'round';
  ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke();
  ctx.lineWidth = 1.4; ctx.setLineDash([4, 9]); ctx.lineDashOffset = -t * 30; ctx.beginPath(); ctx.arc(x, y, r * 1.28, 0, 7); ctx.stroke(); ctx.setLineDash([]);
  for (let i = 0; i < 4; i++) { const an = i * Math.PI / 2 + t * .4; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + Math.cos(an) * r * 1.12, y + Math.sin(an) * r * 1.12); ctx.lineTo(x + Math.cos(an) * r * 1.45, y + Math.sin(an) * r * 1.45); ctx.stroke(); }
  ctx.restore();
  ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, x, y, r * 1.6, col, .25 * a); ctx.restore();
}

// 年份翻牌：from → to，k 0..1 翻页进度。o: {size, col}
function drawFlipYear(ctx, x, y, from, to, k, a, o = {}) {
  if (a <= 0) return;
  const size = o.size || 96, s = String(k < .5 ? from : to), w = size * .5;
  const cardW = w * .98, cardH = size * 1.06; const digits = String(to).length;
  ctx.save(); ctx.globalAlpha *= a;
  for (let i = 0; i < digits; i++) {
    const cx = x + (i - (digits - 1) / 2) * (cardW + 6), fd = String(from)[i], td = String(to)[i];
    const kk = fd === td ? 1 : clamp(k * 1.6 - i * .2);
    // 卡片底
    ctx.fillStyle = 'rgba(8,14,36,.82)'; roundRect(ctx, cx - cardW / 2, y - cardH / 2, cardW, cardH, 8); ctx.fill();
    ctx.strokeStyle = hex(o.col || COL.cream, .25); ctx.lineWidth = 1.2; ctx.stroke();
    const up = kk < .5, sc = up ? Math.cos(kk * Math.PI) : -Math.cos(kk * Math.PI);
    ctx.save(); ctx.beginPath(); ctx.rect(cx - cardW / 2, y - cardH / 2, cardW, cardH); ctx.clip();
    ctx.font = `${size}px ${FONT_B}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = o.col || COL.cream;
    // 下半：新数字的下半（翻到一半后才露出）/ 旧数字下半
    ctx.save(); ctx.beginPath(); ctx.rect(cx - cardW / 2, y, cardW, cardH / 2); ctx.clip(); ctx.fillText(kk >= 1 ? td : (kk > .5 ? td : fd), cx, y + size * .04); ctx.restore();
    // 上半：新数字上半
    ctx.save(); ctx.beginPath(); ctx.rect(cx - cardW / 2, y - cardH / 2, cardW, cardH / 2); ctx.clip(); ctx.fillText(kk > 0 ? td : fd, cx, y + size * .04); ctx.restore();
    // 翻动的那一页
    if (kk > 0 && kk < 1) {
      ctx.save(); ctx.translate(cx, y); ctx.scale(1, Math.max(.001, Math.abs(sc)));
      ctx.beginPath(); ctx.rect(-cardW / 2, up ? -cardH / 2 : 0, cardW, cardH / 2); ctx.fillStyle = 'rgba(14,22,52,1)'; ctx.fill(); ctx.clip();
      ctx.fillStyle = o.col || COL.cream; ctx.fillText(up ? fd : td, 0, size * .04); ctx.restore();
    }
    ctx.restore();
    ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - cardW / 2, y); ctx.lineTo(cx + cardW / 2, y); ctx.stroke();
  }
  ctx.restore();
}
function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

// 左右比例条（红 | 蓝）。p = 红色占比 0..1
function drawRatioBar(ctx, x, y, w, h, p, a, o = {}) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  roundRect(ctx, x, y, w, h, h / 2); ctx.save(); ctx.clip();
  const gr = ctx.createLinearGradient(x, y, x, y + h); gr.addColorStop(0, COL.redL); gr.addColorStop(.5, COL.red); gr.addColorStop(1, COL.redD);
  const gb = ctx.createLinearGradient(x, y, x, y + h); gb.addColorStop(0, COL.blueL); gb.addColorStop(.5, COL.blue); gb.addColorStop(1, COL.blueD);
  ctx.fillStyle = gr; ctx.fillRect(x, y, w * p, h); ctx.fillStyle = gb; ctx.fillRect(x + w * p, y, w * (1 - p), h);
  ctx.globalAlpha = .28; ctx.fillStyle = ctx.createPattern(GRAIN.stip, 'repeat'); ctx.fillRect(x, y, w, h); ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(255,255,255,.95)'; ctx.fillRect(x + w * p - 1.5, y - 2, 3, h + 4);
  ctx.restore();
  ctx.strokeStyle = hex(COL.cream, .5); ctx.lineWidth = 1.5; roundRect(ctx, x, y, w, h, h / 2); ctx.stroke();
  ctx.restore();
}

// 晃动的同心波纹（"孕吐"的不适感）
function drawWobble(ctx, x, y, r, a, t, col = '#9fe8ff') {
  if (a <= 0) return;
  ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.lineWidth = 2;
  for (let k = 0; k < 3; k++) {
    const ph = (t * .6 + k / 3) % 1, rr = r * (.6 + ph * .9);
    ctx.strokeStyle = hex(col, a * .6 * Math.sin(ph * Math.PI)); ctx.beginPath();
    for (let i = 0; i <= 64; i++) { const an = i / 64 * Math.PI * 2, w = 1 + .08 * Math.sin(an * 5 + t * 4 + k) ; const px = x + Math.cos(an) * rr * w, py = y + Math.sin(an) * rr * w * .55; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
    ctx.stroke();
  }
  ctx.restore();
}

// 光点粒子爆开（转场用）
function drawBurst(ctx, x, y, k, n, col, seed, R = 600) {
  if (k <= 0 || k >= 1) return;
  const r = rng(seed); ctx.save(); ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < n; i++) { const an = r() * 6.283, sp = .3 + r() * .7, d = R * sp * eOut(k), s = (1 + r() * 3) * (1 - k);
    glow(ctx, x + Math.cos(an) * d, y + Math.sin(an) * d, s * 4, col, (1 - k) * .8); }
  ctx.restore();
}
// 打勾 / 打叉的小徽标
function drawMark(ctx, x, y, r, ok, a) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; const col = ok ? '#7ff0b0' : '#ff5a5a';
  ctx.fillStyle = 'rgba(6,10,26,.75)'; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  ctx.strokeStyle = col; ctx.lineWidth = r * .14; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke(); ctx.lineCap = 'round'; ctx.lineWidth = r * .2;
  ctx.beginPath(); if (ok) { ctx.moveTo(x - r * .45, y); ctx.lineTo(x - r * .1, y + r * .35); ctx.lineTo(x + r * .48, y - r * .38); } else { ctx.moveTo(x - r * .38, y - r * .38); ctx.lineTo(x + r * .38, y + r * .38); ctx.moveTo(x + r * .38, y - r * .38); ctx.lineTo(x - r * .38, y + r * .38); }
  ctx.stroke(); ctx.restore();
}
