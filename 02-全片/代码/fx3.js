// fx3.js —— 后半段的通用组件：颗粒圆饼、催化剂小手、两两结组的小球、机器人和传送带、曲线图、年份大字（通用版）
'use strict';
// 颗粒质感的圆饼：p = 红色占比；o: {a, start(起始角), label}
function drawPie(ctx, x, y, r, p, a, o = {}) {
  if (a <= 0) return;
  const st = o.start === undefined ? -Math.PI / 2 : o.start, mid = st + Math.PI * 2 * p;
  ctx.save(); ctx.globalAlpha *= a;
  ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, x, y, r * 1.6, p > .5 ? COL.red : COL.blue, .18 * Math.abs(p - .5) * 2 + .08); ctx.restore();
  // 阴影
  ctx.fillStyle = 'rgba(2,4,14,.55)'; ctx.beginPath(); ctx.ellipse(x + r * .06, y + r * .1, r * 1.02, r * 1.02, 0, 0, 7); ctx.fill();
  const wedge = (a0, a1, c0, c1) => { if (a1 - a0 < 1e-4) return; const g = ctx.createRadialGradient(x - r * .35, y - r * .4, r * .1, x, y, r * 1.05); g.addColorStop(0, c0); g.addColorStop(1, c1);
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, r, a0, a1); ctx.closePath(); ctx.fill(); };
  wedge(st, mid, COL.redL, COL.redD); wedge(mid, st + Math.PI * 2, COL.blueL, COL.blueD);
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.clip();
  ctx.globalAlpha = .35; ctx.fillStyle = ctx.createPattern(GRAIN.stip, 'repeat'); ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.globalAlpha = .2; ctx.fillStyle = ctx.createPattern(GRAIN.light, 'repeat'); ctx.fillRect(x - r, y - r, r * 2, r * 2);
  const sh = ctx.createRadialGradient(x - r * .3, y - r * .35, r * .2, x, y, r); sh.addColorStop(0, 'rgba(255,255,255,.12)'); sh.addColorStop(1, 'rgba(0,0,20,.35)'); ctx.globalAlpha = 1; ctx.fillStyle = sh; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.restore();
  // 分界线
  ctx.strokeStyle = 'rgba(255,248,235,.9)'; ctx.lineWidth = 2.5;
  [st, mid].forEach(an => { if (p > .0005 && p < .9995) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(an) * r, y + Math.sin(an) * r); ctx.stroke(); } });
  ctx.strokeStyle = hex(COL.cream, .5); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke();
  ctx.restore();
}
// 催化剂 = 一只小手（红 = 左手，蓝 = 右手）
function drawHandToken(ctx, x, y, s, red, a, rot = 0) {
  if (a <= 0) return;
  ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, x, y, 60 * s, red ? COL.red : COL.blue, .35 * a); ctx.restore();
  const img = red ? IMG.hand_red : IMG.hand_blue, ax = red ? ANCH.hand_left.c[0] : 1024 - ANCH.hand_left.c[0];
  drawAt(ctx, img, ax, 700, x, y, .085 * s, rot, a);
}
// 一个催化剂小球（带一圈环）
function drawCatBall(ctx, x, y, r, red, a, act = 1) {
  if (a <= 0) return;
  const c = red ? COL.red : COL.blue;
  if (act > 0) { ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, x, y, r * 3, c, .3 * a * act); ctx.restore(); }
  ctx.save(); ctx.globalAlpha *= a; ctx.drawImage(sphereSprite(c), x - r, y - r, r * 2, r * 2);
  ctx.strokeStyle = hex(red ? COL.redL : COL.blueL, .7); ctx.lineWidth = Math.max(1.2, r * .08); ctx.beginPath(); ctx.arc(x, y, r * 1.32, 0, 7); ctx.stroke();
  ctx.restore();
}
// 两个小球结成一组：act 活跃度（0 = 灰暗"不干活"），rot 自转角
function drawPair(ctx, x, y, r, c1, c2, rot, a, act = 1, link = 1) {
  if (a <= 0) return;
  const d = r * 1.25 * link, dx = Math.cos(rot) * d, dy = Math.sin(rot) * d;
  ctx.save(); ctx.globalAlpha *= a;
  ctx.strokeStyle = hex(COL.gold, .9 * link); ctx.lineWidth = r * .32; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - dx, y - dy); ctx.lineTo(x + dx, y + dy); ctx.stroke();
  ctx.restore();
  const dim = .45 + .55 * act;
  ctx.save(); ctx.globalAlpha *= dim; ctx.filter = act < .6 ? `saturate(${.25 + act})` : 'none';
  drawCatBall(ctx, x - dx, y - dy, r, c1 === 'r', a, act); drawCatBall(ctx, x + dx, y + dy, r, c2 === 'r', a, act);
  ctx.filter = 'none'; ctx.restore();
}
// 机器人：img 用红/蓝两版；x,y = 脚底中点；face 1 朝右 / -1 朝左；walk 步态相位（0 = 站着）
function drawRobot(ctx, x, y, s, red, face, walk, a, o = {}) {
  if (a <= 0) return;
  const bob = walk ? Math.abs(Math.sin(walk * Math.PI)) * -10 * s : 0, tilt = walk ? Math.sin(walk * Math.PI * 2) * .05 : 0;
  ctx.save(); ctx.globalAlpha *= a * .5; ctx.fillStyle = '#02040c'; ctx.beginPath(); ctx.ellipse(x, y + 2, 300 * s, 34 * s, 0, 0, 7); ctx.fill(); ctx.restore();
  if (o.glow) { ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, x, y - 600 * s, 700 * s, red ? COL.red : COL.blue, o.glow * a); ctx.restore(); }
  ctx.save(); ctx.translate(x, y + bob); ctx.rotate(tilt); ctx.scale(face * s * (o.sx || 1), s);
  ctx.globalAlpha *= a; if (o.filter) ctx.filter = o.filter;
  ctx.drawImage(red ? IMG.machine : IMG.machine_blue, -ANCH.machine.foot[0], -ANCH.machine.foot[1]);
  ctx.restore();
}
// 传送带：在插画上叠一层往右走的皮带纹理；off = 皮带走过的距离（像素）
function drawConveyor(ctx, x, y, s, off, a, o = {}) {
  if (a <= 0) return;
  drawAt(ctx, IMG.conveyor, ...ANCH.conveyor.c, x, y, s, 0, a);
  const [bx0, by, bx1] = ANCH.conveyor.belt, p0 = imgPt(bx0, by, ...ANCH.conveyor.c, x, y, s), p1 = imgPt(bx1, by, ...ANCH.conveyor.c, x, y, s);
  ctx.save(); ctx.globalAlpha *= a * .5; ctx.strokeStyle = 'rgba(160,190,240,.35)'; ctx.lineWidth = 2;
  const step = 46 * s / .62; for (let k = -1; k < (p1[0] - p0[0]) / step + 1; k++) { const xx = p0[0] + ((k * step + off) % (p1[0] - p0[0] + step)); if (xx < p0[0] || xx > p1[0]) continue; ctx.beginPath(); ctx.moveTo(xx, p0[1] - 3); ctx.lineTo(xx - 10 * s, p0[1] + 10 * s); ctx.stroke(); }
  ctx.restore();
  // 警示灯
  if (o.lamp) { const lp = imgPt(...ANCH.conveyor.lamp, ...ANCH.conveyor.c, x, y, s); ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, lp[0], lp[1], 90 * s / .62, o.lamp, a * (o.lampK === undefined ? 1 : o.lampK)); ctx.restore(); }
}
// 曲线图：x 轴"催化剂的偏向"、y 轴"产物的偏向"（0..1 都是红色占比减 0.5 的两倍，即 ee）
function drawEEChart(ctx, x, y, w, h, o, a, T) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  ctx.fillStyle = 'rgba(6,10,28,.6)'; roundRect(ctx, x - 70, y - 30, w + 110, h + 110, 14); ctx.fill();
  ctx.strokeStyle = hex(COL.cream, .55); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + h); ctx.lineTo(x + w, y + h); ctx.stroke();
  ctx.strokeStyle = hex(COL.cream, .12); ctx.lineWidth = 1; for (let k = 1; k <= 4; k++) { ctx.beginPath(); ctx.moveTo(x, y + h - h * k / 4); ctx.lineTo(x + w, y + h - h * k / 4); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x + w * k / 4, y); ctx.lineTo(x + w * k / 4, y + h); ctx.stroke(); }
  txt(ctx, '催化剂的偏向', x + w / 2, y + h + 40, { size: 24, font: FONT_T, col: COL.cream, a: .75 });
  ctx.save(); ctx.translate(x - 40, y + h / 2); ctx.rotate(-Math.PI / 2); txt(ctx, '产物的偏向', 0, 0, { size: 24, font: FONT_T, col: COL.cream, a: .75 }); ctx.restore();
  // 预想：对角线
  const kd = o.diag || 0; if (kd > 0) { ctx.strokeStyle = hex(COL.cream, .7); ctx.setLineDash([8, 8]); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x, y + h); ctx.lineTo(x + w * kd, y + h - h * kd); ctx.stroke(); ctx.setLineDash([]);
    txt(ctx, '预想', x + w * .78, y + h * .3, { size: 26, font: FONT_T, col: COL.cream, a: kd * .85 }); }
  // 实际：向上鼓的曲线（正非线性效应）
  const kc = o.curve || 0; if (kc > 0) { const f = u => o.fn ? o.fn(u) : u; ctx.strokeStyle = COL.redL; ctx.lineWidth = 4; ctx.beginPath();
    for (let i = 0; i <= 60 * kc; i++) { const u = i / 60, px = x + w * u, py = y + h - h * f(u); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke();
    txt(ctx, '实际', x + w * .3, y + h * .2, { size: 26, font: FONT_T, col: COL.redL, a: clamp(kc * 2 - 1) }); }
  if (o.dot !== undefined && o.dotA > 0) { const u = o.dot, f = o.fn || (q => q), px = x + w * u, py = y + h - h * f(u), py0 = y + h - h * u;
    ctx.globalAlpha = a * o.dotA; ctx.setLineDash([4, 5]); ctx.strokeStyle = hex(COL.gold2, .8); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(px, py0); ctx.lineTo(px, py); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = COL.cream; ctx.beginPath(); ctx.arc(px, py0, 7, 0, 7); ctx.fill(); ctx.fillStyle = COL.red; ctx.beginPath(); ctx.arc(px, py, 9, 0, 7); ctx.fill();
    ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, px, py, 40, COL.red, .7 * (.7 + .3 * Math.sin(T * 6))); ctx.restore(); }
  ctx.restore();
}
// 年份大字（通用版，字里放老影像）：fid 老影像，g={x,y,s}，rev 升起进度
function drawYearFoot(ctx, T, str, g, rev, a, tint, fid, size0 = 560) {
  if (a <= 0) return;
  const size = size0 * g.s, tr = size * .03;
  ctx.save(); ctx.font = `${size}px ${FONT_B}`;
  const ws = [...str].map(c => ctx.measureText(c).width), tw = ws.reduce((p, q) => p + q, 0) + tr * (str.length - 1);
  const capH = size * .7, x0 = g.x - tw / 2, base = g.y + capH / 2; ctx.restore();
  const xs = []; { let x = x0; ws.forEach(w => { xs.push(x); x += w + tr; }); }
  const dig = i => { const k = eOut(clamp(rev * 1.9 - i * .3)); return { k, dy: (1 - k) * capH * .9 }; };
  ctx.save(); ctx.globalAlpha *= a; ctx.font = `${size}px ${FONT_B}`; ctx.textBaseline = 'alphabetic';
  ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = size * .06; ctx.shadowOffsetY = size * .02; ctx.fillStyle = '#0a1028';
  [...str].forEach((c, i) => { const d = dig(i); if (d.k <= 0) return; ctx.save(); ctx.beginPath(); ctx.rect(xs[i] - 20, base - capH - 20, ws[i] + 40, capH + 40); ctx.clip(); ctx.globalAlpha = a * d.k; ctx.fillText(c, xs[i], base + d.dy); ctx.restore(); });
  ctx.restore();
  const bx = x0 - 10, by = base - capH - 10, bw = tw + 20, bh = capH + 20;
  drawFootage(ctx, fid, T, bx, by, bw, bh, { a, hi: tint.hi, lo: tint.lo, zoom: 1.05, vig: .35, weave: 1.4,
    mask: (fx, sc) => { fx.font = `${size * sc}px ${FONT_B}`; fx.textBaseline = 'alphabetic'; [...str].forEach((c, i) => { const d = dig(i); if (d.k <= 0) return; fx.save(); fx.beginPath(); fx.rect((xs[i] - bx - 20) * sc, 0, (ws[i] + 40) * sc, bh * sc); fx.clip(); fx.fillText(c, (xs[i] - bx) * sc, (base - by + d.dy) * sc); fx.restore(); }); } });
  ctx.save(); ctx.globalAlpha *= a; ctx.font = `${size}px ${FONT_B}`; ctx.textBaseline = 'alphabetic'; ctx.lineWidth = Math.max(1, size * .004); ctx.strokeStyle = hex(COL.cream, .75);
  [...str].forEach((c, i) => { const d = dig(i); if (d.k <= 0) return; ctx.save(); ctx.beginPath(); ctx.rect(xs[i] - 20, base - capH - 20, ws[i] + 40, capH + 40); ctx.clip(); ctx.strokeText(c, xs[i], base + d.dy); ctx.restore(); });
  ctx.restore();
}
// 文字里采样点（粒子聚成文字/数字用）
const TPTS = {};
function textPoints(str, font, step = 8) {
  const key = str + font + step; if (TPTS[key]) return TPTS[key];
  const n = 1400, c = cv(n, 500), x = c.getContext('2d'); x.font = font; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#fff'; x.fillText(str, n / 2, 250);
  const d = x.getImageData(0, 0, n, 500).data, pts = [];
  for (let y = 0; y < 500; y += step) for (let xx = 0; xx < n; xx += step) if (d[(y * n + xx) * 4 + 3] > 128) pts.push([xx - n / 2, y - 250]);
  const r = rng(11); for (let i = pts.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [pts[i], pts[j]] = [pts[j], pts[i]]; }
  return (TPTS[key] = pts);
}
// 小分子粒子（红/蓝），带一点光
function dot(ctx, x, y, r, red, a) { if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.drawImage(sphereSprite(red ? COL.red : COL.blue), x - r, y - r, r * 2, r * 2); ctx.restore(); }
// 弯箭头
function drawArrow(ctx, x0, y0, x1, y1, bend, col, a, w = 3, k = 1) {
  if (a <= 0 || k <= 0) return;
  const cx = (x0 + x1) / 2 - (y1 - y0) * bend, cy = (y0 + y1) / 2 + (x1 - x0) * bend, pts = qpts(x0, y0, cx, cy, x1, y1, 30);
  const n = Math.max(2, Math.round(pts.length * k)), seg = pts.slice(0, n);
  ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.beginPath(); seg.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke();
  const e = seg[seg.length - 1], q = seg[Math.max(0, seg.length - 3)], an = Math.atan2(e[1] - q[1], e[0] - q[0]);
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(e[0] + Math.cos(an) * w * 3, e[1] + Math.sin(an) * w * 3); ctx.lineTo(e[0] + Math.cos(an + 2.5) * w * 3.5, e[1] + Math.sin(an + 2.5) * w * 3.5); ctx.lineTo(e[0] + Math.cos(an - 2.5) * w * 3.5, e[1] + Math.sin(an - 2.5) * w * 3.5); ctx.closePath(); ctx.fill();
  ctx.restore();
}

// —— 真实照片（素材/photos/，清单见 photodata.js）：双色调 + 颗粒，和老影像同一套处理 ——
// PHOTOS[id] = {file, fx, fy (脸部中心 0..1), zoom, credit}
const PIMG = {}, PCACHE = {};
async function loadPhotos() {
  if (typeof PHOTOS === 'undefined') return;
  for (const id in PHOTOS) { try { PIMG[id] = await loadImg('../素材/photos/' + PHOTOS[id].file); } catch (e) { console.error('缺照片 ' + id); } }
}
// 双色调版本（缓存）。tone: 'warm' 暖奶油 / 'cool' 冷蓝 / 'gold' 金色 / 'color' 保留一点原色
function photoTone(id, tone) {
  const key = id + ':' + tone; if (PCACHE[key]) return PCACHE[key];
  const img = PIMG[id]; if (!img) return null;
  const c = cv(img.naturalWidth, img.naturalHeight), x = c.getContext('2d');
  if (tone === 'orig') { x.drawImage(img, 0, 0); return (PCACHE[key] = c); }
  x.filter = tone === 'color' ? 'saturate(.55) contrast(1.08)' : 'grayscale(1) contrast(1.12)'; x.drawImage(img, 0, 0); x.filter = 'none';
  const T = { warm: ['#f3e3c4', '#121a3e'], cool: ['#cfe0ff', '#0a1430'], gold: ['#f6dca2', '#1a1430'], color: ['#fff6e8', '#0b1430'] }[tone] || ['#f3e3c4', '#121a3e'];
  x.globalCompositeOperation = 'multiply'; x.fillStyle = T[0]; x.fillRect(0, 0, c.width, c.height);
  x.globalCompositeOperation = 'screen'; x.fillStyle = T[1]; x.fillRect(0, 0, c.width, c.height);
  x.globalCompositeOperation = 'source-over'; x.globalAlpha = .18; x.fillStyle = x.createPattern(GRAIN.dark, 'repeat'); x.fillRect(0, 0, c.width, c.height);
  x.globalAlpha = .1; x.fillStyle = x.createPattern(GRAIN.light, 'repeat'); x.fillRect(0, 0, c.width, c.height);
  return (PCACHE[key] = c);
}
// 在 (x,y) 为中心、w×h 的区域里按 cover 画照片（以脸部为中心）；shape: 'circle' | 'rect'
function drawPhoto(ctx, id, x, y, w, h, a, o = {}) {
  if (a <= 0 || !PIMG[id]) return false;
  const P = PHOTOS[id], src = photoTone(id, o.tone || P.tone || 'warm'); if (!src) return false;
  const z = (o.zoom || 1) * (P.zoom || 1), s = Math.max(w / src.width, h / src.height) * z;
  const dw = src.width * s, dh = src.height * s, fx = P.fx === undefined ? .5 : P.fx, fy = P.fy === undefined ? .4 : P.fy;
  const dx = clamp(x - dw * fx, x + w / 2 - dw, x - w / 2), dy = clamp(y - dh * fy, y + h / 2 - dh, y - h / 2);
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.translate(-x, -y);
  if (o.shape !== 'circle') { ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12; ctx.fillStyle = o.paper || '#efe4cc'; const pad = o.pad === undefined ? 14 : o.pad; roundRect(ctx, x - w / 2 - pad, y - h / 2 - pad, w + pad * 2, h + pad * 2 + (o.caption ? 46 : 0), 4); ctx.fill(); ctx.restore(); }
  ctx.save(); ctx.beginPath(); if (o.shape === 'circle') ctx.arc(x, y, Math.min(w, h) / 2, 0, 7); else ctx.rect(x - w / 2, y - h / 2, w, h); ctx.clip();
  ctx.drawImage(src, dx, dy, dw, dh);
  const vg = ctx.createRadialGradient(x, y, Math.min(w, h) * .3, x, y, Math.max(w, h) * .75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(5,8,24,.45)'); ctx.fillStyle = vg; ctx.fillRect(x - w / 2, y - h / 2, w, h);
  ctx.restore();
  if (o.shape === 'circle') { ctx.strokeStyle = hex(COL.gold, .95); ctx.lineWidth = o.ring || 3; ctx.beginPath(); ctx.arc(x, y, Math.min(w, h) / 2, 0, 7); ctx.stroke(); }
  if (o.caption) txt(ctx, o.caption, x, y + h / 2 + 30, { size: o.capSize || 26, font: FONT_H, col: '#2a2a3a', shadow: false, track: 4 });
  ctx.restore();
  if (o.credit !== false && P.credit) txt(ctx, P.credit, o.creditX !== undefined ? o.creditX : x, o.creditY !== undefined ? o.creditY : y + h / 2 + (o.shape === 'circle' ? 26 : (o.caption ? 84 : 40)), { size: 16, font: FONT_T, col: COL.cream, a: a * .55, align: o.creditAlign || 'center' });
  return true;
}
