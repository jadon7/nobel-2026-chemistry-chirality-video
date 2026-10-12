// fx.js —— 背景、星空、黑洞同心环、光锥、金线、标签、问号、颗粒
'use strict';
const COL = { navy0: '#060a1a', navy1: '#0c1636', navy2: '#13235a', gold: '#f4c85a', gold2: '#ffe3a0', cyan: '#7fe4ff',
  us: '#ff9a5c', usD: '#e2602e', alien: '#35dcb0', alienD: '#0fa88a', ink: '#eef3ff' };
const FONT_T = '"ChillCond", "Alibaba PuHuiTi", sans-serif';
const FONT_S = '"HanSerif", serif';

// 相机：cam={cx,cy,z,r}。depth<1 的层移动和缩放都更少（视差）
function setCam(ctx, cam, d = 1) {
  const z = Math.pow(cam.z, d), cx = W / 2 + (cam.cx - W / 2) * d, cy = H / 2 + (cam.cy - H / 2) * d, r = (cam.r || 0) * d;
  ctx.setTransform(SS, 0, 0, SS, 0, 0); ctx.translate(W / 2, H / 2); ctx.rotate(r); ctx.scale(z, z); ctx.translate(-cx, -cy);
}
function toScreen(cam, x, y, d = 1) { const z = Math.pow(cam.z, d), cx = W / 2 + (cam.cx - W / 2) * d, cy = H / 2 + (cam.cy - H / 2) * d, r = (cam.r || 0) * d; let dx = (x - cx) * z, dy = (y - cy) * z; return [W / 2 + dx * Math.cos(r) - dy * Math.sin(r), H / 2 + dx * Math.sin(r) + dy * Math.cos(r)]; }
const resetT = ctx => ctx.setTransform(SS, 0, 0, SS, 0, 0);

// 深蓝底 + 一点点上方的冷光
function drawBg(ctx, tint = '#13235a', gx = .65, gy = .25, k = 1) {
  resetT(ctx);
  ctx.fillStyle = COL.navy0; ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(W * gx, H * gy, 0, W * gx, H * gy, W * .9);
  g.addColorStop(0, hex(tint, .95 * k)); g.addColorStop(.55, hex('#0b1533', .7)); g.addColorStop(1, hex(COL.navy0, 0));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
// 静态屏幕颗粒 + 暗角（最后一层）
function drawFinish(ctx, vig = 1, T = 0) {
  resetT(ctx);
  const v = ctx.createRadialGradient(W / 2, H * .46, H * .35, W / 2, H * .5, W * .72);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(2,4,14,${.62 * vig})`);
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  // 颗粒每 1/12 秒换一次位置（像胶片颗粒在动，但不至于闪）
  const f = Math.floor(T * 12), o1 = Math.floor(hash1(f) * 400), o2 = Math.floor(hash1(f + 77) * 400);
  grainOver(ctx, 0, 0, W + 400, H + 400, .085, 'light', 'source-over', o1);
  grainOver(ctx, 0, 0, W + 400, H + 400, .16, 'dark', 'source-over', o2);
}

// 星空（固定随机）
const STARS = (() => { const r = rng(91), a = []; for (let i = 0; i < 520; i++) a.push({ x: r() * 2600 - 340, y: r() * 1600 - 260, s: Math.pow(r(), 3) * 2.6 + .5, ph: r() * 7, sp: .6 + r() * 2.2, c: r() < .15 ? '#ffd9a8' : (r() < .3 ? '#a8e8ff' : '#ffffff') }); return a; })();
function drawStars(ctx, t, a = 1) {
  for (const s of STARS) { const tw = .55 + .45 * Math.sin(t * s.sp + s.ph); ctx.fillStyle = hex(s.c, a * tw * (s.s > 2 ? .95 : .7)); ctx.beginPath(); ctx.arc(s.x, s.y, s.s * .7, 0, 7); ctx.fill();
    if (s.s > 2.3) { ctx.strokeStyle = hex(s.c, a * tw * .35); ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(s.x - s.s * 3, s.y); ctx.lineTo(s.x + s.s * 3, s.y); ctx.moveTo(s.x, s.y - s.s * 3); ctx.lineTo(s.x, s.y + s.s * 3); ctx.stroke(); } }
}

// 黑洞：同心环（参考图 2）+ 黑色核心。open 0..1 打开程度，wave 环上的涟漪
function drawPortal(ctx, x, y, t, open, a = 1) {
  const core = 165 * eOut(open);
  ctx.save(); ctx.lineWidth = 1.6;
  for (let i = 0; i < 26; i++) {
    const r0 = 70 + i * 62;
    const pull = core > 0 ? core * 1.25 * Math.exp(-i * .16) : 0;       // 核心附近的环被"吸"开
    const wave = Math.sin(t * 2.2 - i * .55) * 4 * open;
    const r = r0 + pull + wave;
    const al = a * (.34 - i * .0105) * (.55 + .45 * open);
    if (al <= 0) continue;
    ctx.strokeStyle = hex('#b9c8ff', al); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke();
  }
  // 涟漪亮环：从中心往外推
  for (let k = 0; k < 3; k++) { const ph = ((t * .45 + k / 3) % 1); const rr = core + ph * 900; ctx.strokeStyle = hex('#9fe8ff', a * .32 * (1 - ph) * open); ctx.lineWidth = 3 * (1 - ph) + .5; ctx.beginPath(); ctx.arc(x, y, rr, 0, 7); ctx.stroke(); }
  ctx.restore();
  if (core > 1) {
    glow(ctx, x, y, core * 2.1, '#2c4fd8', .5 * a);
    const g = ctx.createRadialGradient(x, y, core * .2, x, y, core * 1.08);
    g.addColorStop(0, hex('#000000', a)); g.addColorStop(.86, hex('#01020a', a)); g.addColorStop(.95, hex('#7ff0ff', .85 * a)); g.addColorStop(1, hex('#7ff0ff', 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, core * 1.08, 0, 7); ctx.fill();
  } else if (open <= 0) glow(ctx, x, y, 40, '#bff4ff', a * .8);
}

// 光锥（参考图 1）：从镜头 (x0,y0, 半宽 w0) 打到地面椭圆 (x1,y1, rx, ry)
function drawCone(ctx, x0, y0, w0, x1, y1, rx, ry, a, t = 0, spot = 1) {
  if (a <= 0) return;
  ctx.save(); ctx.globalCompositeOperation = 'screen';
  const path = () => { ctx.beginPath(); ctx.moveTo(x0 - w0, y0); ctx.lineTo(x1 - rx, y1); ctx.ellipse(x1, y1, rx, ry, 0, Math.PI, 0, true); ctx.lineTo(x0 + w0, y0); ctx.closePath(); };
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, hex('#fff8e0', 1 * a)); g.addColorStop(.45, hex('#ffe9a8', .62 * a)); g.addColorStop(1, hex('#fff2c8', .5 * a));
  path(); ctx.fillStyle = g; ctx.fill();
  // 光线条纹
  ctx.save(); path(); ctx.clip();
  const r = rng(5);
  for (let i = 0; i < 26; i++) { const u = r() * 2 - 1, u2 = u * 1.05 + (r() - .5) * .08; const wv = .5 + .5 * Math.sin(t * 1.3 + i); ctx.strokeStyle = hex('#ffffff', a * (.05 + .1 * r()) * wv); ctx.lineWidth = 2 + r() * 10; ctx.beginPath(); ctx.moveTo(x0 + u * w0, y0); ctx.lineTo(x1 + u2 * rx, y1); ctx.stroke(); }
  // 光里的颗粒
  ctx.globalAlpha = a * .35; ctx.fillStyle = ctx.createPattern(GRAIN.stipL, 'repeat'); ctx.fillRect(Math.min(x0, x1) - rx - 20, y0, rx * 2 + Math.abs(x1 - x0) + 40, y1 - y0 + ry);
  ctx.restore();
  // 落点
  const sg = ctx.createRadialGradient(x1, y1, 0, x1, y1, rx);
  sg.addColorStop(0, hex('#ffffff', .9 * a * spot)); sg.addColorStop(.5, hex('#fff1c8', .45 * a * spot)); sg.addColorStop(1, hex('#fff1c8', 0));
  ctx.fillStyle = sg; ctx.beginPath(); ctx.ellipse(x1, y1, rx * 1.05, ry * 1.05, 0, 0, 7); ctx.fill();
  glow(ctx, x1, y1, rx * 2.2, '#ffe2a0', .35 * a * spot);
  ctx.restore();
}

// 漂浮微尘
const DUST = (() => { const r = rng(77), a = []; for (let i = 0; i < 160; i++) a.push({ x: r(), y: r(), s: .6 + r() * 2.2, sp: .2 + r() * .8, ph: r() * 7 }); return a; })();
function drawDust(ctx, t, x, y, w, h, col = '#ffffff', a = .6) {
  for (const d of DUST) { const px = x + ((d.x * w + t * 14 * d.sp) % w), py = y + ((d.y * h - t * 9 * d.sp + h * 10) % h); const tw = .5 + .5 * Math.sin(t * 1.7 + d.ph); ctx.fillStyle = hex(col, a * tw * .8); ctx.beginPath(); ctx.arc(px, py, d.s, 0, 7); ctx.fill(); }
}

// 标签：短中文 + 引线 + 端点。o={x,y,text,col,a,size,ax,ay,align}
function drawTag(ctx, o) {
  const a = o.a; if (a <= 0) return;
  const size = o.size || 44, GA = ctx.globalAlpha;
  ctx.save(); ctx.globalAlpha = a * GA;
  if (o.ax !== undefined) {
    const k = eIO(clamp(a * 1.4));
    ctx.strokeStyle = hex(o.col, .85); ctx.lineWidth = 2; ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(o.ax, o.ay); ctx.lineTo(lerp(o.ax, o.lx ?? o.x, k), lerp(o.ay, o.ly ?? (o.y + size * .1), k)); ctx.stroke();
    ctx.fillStyle = hex(o.col, 1); ctx.beginPath(); ctx.arc(o.ax, o.ay, 5.5, 0, 7); ctx.fill();
    glow(ctx, o.ax, o.ay, 22, o.col, .6);
  }
  ctx.font = `${size}px ${FONT_T}`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle';
  const dy = (1 - eOut(clamp(a * 1.2))) * 14;
  ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 14;
  ctx.fillStyle = hex(o.col, 1); ctx.fillText(o.text, o.x, o.y + dy);
  ctx.restore();
}

// 金色问号
function drawQ(ctx, x, y, size, a, t = 0) {
  if (a <= 0) return;
  glow(ctx, x, y, size * 1.3, COL.gold, .45 * a);
  ctx.save(); ctx.globalAlpha = a * ctx.globalAlpha; ctx.font = `${size}px ${FONT_S}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const g = ctx.createLinearGradient(x, y - size / 2, x, y + size / 2); g.addColorStop(0, COL.gold2); g.addColorStop(1, '#d99a2b');
  ctx.shadowColor = hex(COL.gold, .8); ctx.shadowBlur = size * .25; ctx.fillStyle = g; ctx.fillText('?', x, y + Math.sin(t * 2.4) * size * .03);
  ctx.restore();
}

// 会生长的发光线。pts=[[x,y],...]，k 0..1 画到哪里
function drawThread(ctx, pts, k, col, w = 3, a = 1, head = true) {
  if (k <= 0 || a <= 0 || pts.length < 2) return;
  const L = []; let tot = 0; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d; }
  const goal = tot * clamp(k); let acc = 0, end = pts[0];
  const path = () => { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); acc = 0; for (let i = 1; i < pts.length; i++) { if (acc + L[i - 1] >= goal) { const f = (goal - acc) / L[i - 1]; end = [lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)]; ctx.lineTo(end[0], end[1]); return; } acc += L[i - 1]; ctx.lineTo(pts[i][0], pts[i][1]); end = pts[i]; } };
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.globalCompositeOperation = 'screen';
  path(); ctx.strokeStyle = hex(col, .16 * a); ctx.lineWidth = w * 6; ctx.stroke();
  path(); ctx.strokeStyle = hex(col, .45 * a); ctx.lineWidth = w * 2.2; ctx.stroke();
  path(); ctx.strokeStyle = hex('#ffffff', .85 * a); ctx.lineWidth = w * .6; ctx.stroke();
  ctx.restore();
  if (head && k < .999) { glow(ctx, end[0], end[1], w * 9, col, a); glow(ctx, end[0], end[1], w * 3, '#ffffff', a); }
  return end;
}
// 二次贝塞尔采样
function qpts(x0, y0, cx, cy, x1, y1, n = 40) { const a = []; for (let i = 0; i <= n; i++) { const u = i / n; a.push([(1 - u) * (1 - u) * x0 + 2 * u * (1 - u) * cx + u * u * x1, (1 - u) * (1 - u) * y0 + 2 * u * (1 - u) * cy + u * u * y1]); } return a; }

// 沿着一条线流动的光点（线画完以后用，增加动感但不增加信息）
function drawFlow(ctx, pts, t, col, a = 1, n = 2, speed = .55, seed = 0, r = 9) {
  if (a <= 0 || pts.length < 2) return;
  ctx.save(); ctx.globalCompositeOperation = 'screen';
  for (let j = 0; j < n; j++) { const u = ((t * speed + j / n + seed * .37) % 1 + 1) % 1, f = u * (pts.length - 1), i = Math.floor(f), k = f - i;
    const p = pts[i], q = pts[Math.min(i + 1, pts.length - 1)], x = lerp(p[0], q[0], k), y = lerp(p[1], q[1], k), fade = Math.sin(u * Math.PI);
    glow(ctx, x, y, r * 2.2, col, a * fade * .8); glow(ctx, x, y, r * .7, '#ffffff', a * fade); }
  ctx.restore();
}
