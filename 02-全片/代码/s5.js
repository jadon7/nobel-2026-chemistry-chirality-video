// s5.js —— 第 10–12 句：日期转盘转到 10 月 7 日 → 奖章转着落下 → 两张名卡（卡根、硤合宪三，各带一个小图示）→
//          一个"反应环"：红蓝分子在环里转，比例条从 50.5 : 49.5 一轮轮被放大，偏向红色那边 →
//          分子飞出来聚成一个问号
'use strict';
const S5 = { RC: [960, 500], RR: 230 };
fuse('s5_sth', 'stockholm', 44.2, 52.0, 0, 1);
const S5ANN = { off: 0 };   // 发布会视频从素材里第几秒开始（photodata.js 里可覆盖）
fuse('s5_ann', 'announce', 45.55, 48.2, 0, 1);
const S5P = (() => { const r = rng(2026), a = []; const N = 120; for (let i = 0; i < N; i++) a.push({ u: (i + r() * .9) / N, th: r() * 6.283, rr: .78 + r() * .44, sp: .35 + r() * .25, s: .8 + r() * .5, d: r() }); return a; })();
let QPTS = null;
function qPoints() {   // 问号字形上的采样点
  if (QPTS) return QPTS;
  const n = 420, c = cv(n, n), x = c.getContext('2d'); x.font = `360px ${FONT_H}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#fff'; x.fillText('？', n / 2, n / 2 + 10);
  const d = x.getImageData(0, 0, n, n).data, pts = [];
  for (let y = 0; y < n; y += 9) for (let xx = 0; xx < n; xx += 9) if (d[(y * n + xx) * 4 + 3] > 128) pts.push([xx - n / 2, y - n / 2]);
  const r = rng(7); for (let i = pts.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [pts[i], pts[j]] = [pts[j], pts[i]]; }
  return (QPTS = pts);
}
// 红色占比随时间：50.5% → 一轮轮放大 → 99.7%
function s5Ratio(T) {
  const steps = [[53.0, .505], [53.55, .58], [54.15, .74], [54.75, .9], [55.6, .975], [56.4, .997]];
  if (T <= steps[0][0]) return steps[0][1];
  for (let i = 0; i < steps.length - 1; i++) if (T < steps[i + 1][0]) return lerp(steps[i][1], steps[i + 1][1], eOut(prog(T, steps[i][0], steps[i][0] + .45)));
  return steps[steps.length - 1][1];
}
// 名卡小图示：卡根 = 红红、蓝蓝、红蓝配对；硤合 = 分子造出同款分子的循环箭头
function drawIconPairs(ctx, x, y, r, a) {
  const P = [[COL.red, COL.red], [COL.blue, COL.blue], [COL.red, COL.blue]];
  P.forEach(([c1, c2], i) => { const yy = y + (i - 1) * r * .62, k = .9;
    ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = hex(COL.gold2, .8); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - r * .22, yy); ctx.lineTo(x + r * .22, yy); ctx.stroke();
    ctx.drawImage(sphereSprite(c1), x - r * .22 - r * .16, yy - r * .16, r * .32, r * .32); ctx.drawImage(sphereSprite(c2), x + r * .22 - r * .16, yy - r * .16, r * .32, r * .32); ctx.restore(); });
}
function drawIconLoop(ctx, x, y, r, a, t) {
  ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = hex(COL.gold2, .85); ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(x, y, r * .46, -.4, Math.PI * 1.6); ctx.stroke();
  const ae = Math.PI * 1.6, ex = x + Math.cos(ae) * r * .46, ey = y + Math.sin(ae) * r * .46; ctx.fillStyle = COL.gold2; ctx.beginPath(); ctx.moveTo(ex + 10, ey - 2); ctx.lineTo(ex - 6, ey - 10); ctx.lineTo(ex - 4, ey + 8); ctx.closePath(); ctx.fill();
  for (let i = 0; i < 4; i++) { const an = t * .9 + i * Math.PI / 2; ctx.drawImage(sphereSprite(COL.red), x + Math.cos(an) * r * .46 - r * .12, y + Math.sin(an) * r * .46 - r * .12, r * .24, r * .24); }
  ctx.drawImage(sphereSprite(COL.red), x - r * .14, y - r * .14, r * .28, r * .28);
  ctx.restore();
}
function drawNameCard(ctx, x, y, k, o, T) {
  if (k <= 0) return;
  const R = 112, a = clamp(k * 1.5);
  ctx.save(); ctx.translate(x, y + (1 - eOut(k)) * 40); ctx.globalAlpha *= a;
  // 圆形徽章
  ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, 0, 0, R * 2, COL.gold, .25); ctx.restore();
  const g = ctx.createRadialGradient(-R * .3, -R * .3, R * .1, 0, 0, R); g.addColorStop(0, '#1c2c66'); g.addColorStop(1, '#0a1230'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, R, 0, 7); ctx.fill();
  ctx.strokeStyle = hex(COL.gold, .95); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * eOut(k)); ctx.stroke();
  ctx.strokeStyle = hex(COL.gold, .35); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(0, 0, R - 10, 0, 7); ctx.stroke();
  const hasP = o.photo && PIMG[o.photo];
  if (hasP) { ctx.restore(); drawPhoto(ctx, o.photo, x, y + (1 - eOut(k)) * 40, (R - 6) * 2, (R - 6) * 2, a * eOut(prog(k, .2, .8)), { shape: 'circle', ring: 0, credit: false });
    ctx.save(); ctx.translate(x + R * .74, y + (1 - eOut(k)) * 40 + R * .74); ctx.globalAlpha *= a * eOut(prog(k, .5, 1)); ctx.fillStyle = '#0a1230'; ctx.beginPath(); ctx.arc(0, 0, 38, 0, 7); ctx.fill(); ctx.strokeStyle = hex(COL.gold, .95); ctx.lineWidth = 2.5; ctx.stroke(); o.icon(ctx, 0, 0, 38, 1, T); }
  else o.icon(ctx, 0, 0, R, eOut(prog(k, .4, 1)), T);
  ctx.restore();
  if (hasP && PHOTOS[o.photo].credit) txt(ctx, PHOTOS[o.photo].credit, x, y + R + 200 + (1 - eOut(k)) * 40, { size: 16, font: FONT_T, col: COL.cream, a: a * .5 });
  const ty = y + R + 64 + (1 - eOut(k)) * 40;
  txt(ctx, o.zh, x, ty, { size: 54, font: FONT_H, col: COL.cream, a: eOut(prog(k, .25, .8)), track: 6, glow: .25, glowCol: COL.gold });
  txt(ctx, o.en, x, ty + 54, { size: 34, font: FONT_B, col: COL.gold2, a: eOut(prog(k, .35, .9)), track: 4 });
  txt(ctx, o.info, x, ty + 98, { size: 26, font: FONT_T, col: COL.cream, a: eOut(prog(k, .45, 1)) * .75, track: 2 });
}

function drawS5(ctx, T) {
  drawBg(ctx, '#1a2a5e', .5, .25);
  resetT(ctx);
  ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, 960, 120, 900, '#c99a3a', .16 * (1 - eIO(prog(T, 57.5, 59)))); ctx.restore();
  // 背景：斯德哥尔摩湖岸老影像（淡金色），奖章段结束前淡出
  const sa = .24 * eOut(prog(T, 44.3, 45.2)) * (1 - eIO(prog(T, 49.6, 50.6)));
  if (sa > 0) { drawFootage(ctx, 's5_sth', T, 0, 0, W, H, { a: sa, hi: '#f0cf8e', lo: '#0c1430', zoom: 1.08 + .04 * prog(T, 44.2, 51), vig: .75, dirt: .5 });
    const sg = ctx.createLinearGradient(0, 0, 0, H); sg.addColorStop(0, 'rgba(8,12,32,.35)'); sg.addColorStop(.6, 'rgba(8,12,32,.15)'); sg.addColorStop(1, 'rgba(8,12,32,.6)'); ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H);
    txt(ctx, '斯德哥尔摩 · 资料影像', 1880, 1040, { size: 20, font: FONT_T, col: COL.cream, a: sa * 1.6 * .6, align: 'right', track: 2 }); }
  drawDust(ctx, TA, 0, 0, W, H, '#ffe7b8', .22);
  drawBeam(ctx, 960, -80, Math.PI / 2, .38, 900, .35 * eOut(prog(T, 45.6, 46.4)) * (1 - eIO(prog(T, 49.8, 50.6))), TA);

  // —— 日期转盘：10 月 1 日 … 转到 7 日 ——
  const dIn = eOut(prog(T, 44.3, 44.8)), dUp = eIO(prog(T, 45.75, 46.5)), dOut = 1 - eIO(prog(T, 49.9, 50.5));
  if (dIn > 0 && dOut > 0) {
    const cy = lerp(500, 128, dUp), sc = lerp(1, .42, dUp);
    const spin = eOut(prog(T, 44.35, 45.35)), pos = lerp(-14, 7, spin);        // 当前居中的日期（浮点）
    ctx.save(); ctx.translate(960, cy); ctx.scale(sc, sc); ctx.globalAlpha = dIn * dOut;
    for (let d = 1; d <= 31; d++) { const off = d - pos, x = off * 150; if (Math.abs(x) > 1100) continue;
      const f = Math.max(0, 1 - Math.abs(off) / 6), isSel = Math.abs(off) < .5 && spin > .97;
      txt(ctx, String(d).padStart(2, '0'), x, 0, { size: lerp(70, 230, Math.pow(Math.max(0, 1 - Math.abs(off)), 2)), font: FONT_B, col: isSel ? COL.gold2 : COL.cream, a: (.15 + .85 * f * f) * (d === 7 ? 1 : (1 - .6 * eIO(prog(T, 45.3, 45.8)))), glow: isSel ? .6 : 0, glowCol: COL.gold, shadow: false }); }
    txt(ctx, '2026 · 10 月', 0, -175, { size: 46, font: FONT_T, col: COL.gold2, a: eOut(prog(T, 44.6, 45.0)), track: 10 });
    txt(ctx, '诺贝尔化学奖公布日', 0, 165, { size: 34, font: FONT_T, col: COL.cream, a: eOut(prog(T, 45.15, 45.55)) * .8 * (1 - dUp), track: 6 });
    ctx.restore();
    const sel = prog(T, 45.3, 45.9); if (sel > 0 && sel < 1 && dUp < .1) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.strokeStyle = hex(COL.gold2, .8 * (1 - sel)); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(960, 500, 120 + sel * 260, 0, 7); ctx.stroke(); ctx.restore(); }
  }

  // —— 奖章 ——
  const ANN = !!FOOT.announce || !!PIMG.both_ill, m0 = ANN ? 47.45 : 45.75;
  const md = eOutBack(prog(T, m0, m0 + .95), 1.05), mUp = eIO(prog(T, PA(11, 0) - .2, PA(11, 0) + .6)), mOut = 1 - eIO(prog(T, 58.0, 58.8));
  if (md > 0 && mOut > 0) {
    const my = lerp(lerp(-300, 470, md), 150, mUp) + Math.sin(TA * 1.3) * 4 * (1 - mUp), ms = lerp(.36, .13, mUp), mx = 960;
    const spin = (1 - eOut(prog(T, m0, m0 + 1.15))) * Math.PI * 3, sx = Math.cos(spin);
    ctx.save(); ctx.globalAlpha = mOut; ctx.globalCompositeOperation = 'screen'; glow(ctx, mx, my, 520 * ms / .36, COL.gold, .45 * clamp(md)); ctx.restore();
    ctx.save(); ctx.globalAlpha = mOut; ctx.translate(mx, my); ctx.scale(Math.max(.04, Math.abs(sx)), 1);
    if (Math.abs(sx) < .3) { ctx.fillStyle = '#8a5a14'; ctx.beginPath(); ctx.ellipse(0, 0, 12 / Math.max(.04, Math.abs(sx)), 222 * ms / .36, 0, 0, 7); ctx.fill(); }
    drawAt(ctx, IMG.medal, ...ANCH.medal.c, 0, 0, ms, 0, 1);
    const sw = prog(T, m0 + .85, m0 + 1.75); if (sw > 0 && sw < 1) { ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 590 * ms, 0, 7); ctx.clip(); ctx.globalCompositeOperation = 'screen'; const gx = lerp(-300, 300, sw); const g = ctx.createLinearGradient(gx - 70, -120, gx + 70, 120); g.addColorStop(0, 'rgba(255,240,200,0)'); g.addColorStop(.5, 'rgba(255,248,220,.8)'); g.addColorStop(1, 'rgba(255,240,200,0)'); ctx.fillStyle = g; ctx.fillRect(-300, -300, 600, 600); ctx.restore(); }
    ctx.restore();
    // 落定的一圈光
    const land = prog(T, m0 + .7, m0 + 1.45); if (land > 0 && land < 1) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.strokeStyle = hex(COL.gold2, .7 * (1 - land)); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(mx, my, 240 + land * 300, 0, 7); ctx.stroke(); ctx.restore(); }
    const ta = eOut(prog(T, m0 + .75, m0 + 1.25)) * (1 - eIO(prog(T, PA(11, 0) - .3, PA(11, 0) + .2)));
    txt(ctx, 'THE NOBEL PRIZE IN CHEMISTRY 2026', mx, my + 268, { size: 34, font: FONT_B, col: COL.gold2, a: ta, track: 8 });
    txt(ctx, '诺贝尔化学奖', mx, my + 325, { size: 50, font: FONT_H, col: COL.cream, a: ta, track: 14 });
  }
  // —— 发布会现场视频 ——
  if (ANN) {
    const va = eOut(prog(T, 45.6, 46.15)) * (1 - eIO(prog(T, 47.4, 47.95)));
    if (va > 0) { const sc = lerp(.92, 1, eOut(prog(T, 45.6, 46.4))) * lerp(1, .85, eIO(prog(T, 47.4, 47.95))), vw = 1040 * sc, vh = 585 * sc, vx = 960 - vw / 2, vy = 540 - vh / 2 - eIO(prog(T, 47.4, 47.95)) * 60;
      resetT(ctx); ctx.save(); ctx.fillStyle = `rgba(4,7,20,${.5 * va})`; ctx.fillRect(0, 0, W, H); ctx.restore();
      ctx.save(); ctx.globalAlpha = va; drawFilmFrame(ctx, vx, vy, vw, vh, { r: 8, col: COL.gold2 });
      if (FOOT.announce) drawFootage(ctx, 's5_ann', T, vx, vy, vw, vh, { hi: '#f6e2b8', lo: '#101634', vig: .35, dirt: .15, weave: .3, flicker: .03 });
      else { // 现场大屏示意：官方双人肖像
        ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, 960, vy + vh / 2, vw * .8, '#fff0d0', .22 * va); ctx.restore();
        ctx.fillStyle = '#f3eee4'; roundRect(ctx, vx, vy, vw, vh, 8); ctx.fill();
        const ih = vh * .82, iw = ih * 1.5; drawPhoto(ctx, 'both_ill', 960, vy + vh * .45, iw, ih, 1, { shape: 'rect', pad: 0, credit: false, paper: '#f3eee4' });
        txt(ctx, 'THE NOBEL PRIZE IN CHEMISTRY 2026', 960, vy + vh * .93, { size: 26 * sc, font: FONT_B, col: '#1b2a55', shadow: false, track: 6 });
        // 前景：观众剪影
        resetT(ctx); ctx.save(); ctx.globalAlpha = va; ctx.fillStyle = '#04060f'; const r = rng(77);
        for (let i = 0; i < 14; i++) { const hx = 40 + i * 140 + (r() - .5) * 40, hy = 1010 + r() * 40, hr = 46 + r() * 14; ctx.beginPath(); ctx.arc(hx, hy - hr * 1.1, hr * .62, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(hx, hy + hr * .6, hr * 1.2, hr * 1.1, 0, Math.PI, 0); ctx.fill(); ctx.fillRect(hx - hr * 1.2, hy + hr * .6, hr * 2.4, 200); }
        ctx.restore(); }
      txt(ctx, '2026 年 10 月 7 日 · 斯德哥尔摩 · 瑞典皇家科学院宣布', 960, vy - 34, { size: 28, font: FONT_T, col: COL.gold2, a: 1, track: 3 });
      txt(ctx, FOOT.announce ? ANNCREDIT : '现场大屏示意 · Ill. Niklas Elmehed © Nobel Prize Outreach', vx + vw, vy + vh + 28, { size: 16, font: FONT_T, col: COL.cream, a: .55, align: 'right' });
      ctx.restore(); }
  }
  // —— 名卡 ——
  const cOut = 1 - eIO(prog(T, PA(11, 0) - .1, PA(11, 0) + .5));
  if (cOut > 0) {
    ctx.save(); ctx.globalAlpha = cOut;
    drawNameCard(ctx, 400, 430, prog(T, 47.65, 48.5), { photo: 'kagan_ill', zh: '亨利·卡根', en: 'HENRI B. KAGAN', info: '法国 · 95 岁 · 非线性效应', icon: (c, x, y, r, a) => drawIconPairs(c, x, y, r, a) }, T);
    drawNameCard(ctx, 1520, 430, prog(T, 48.35, 49.2), { photo: 'soai', zh: '硤合宪三', en: 'KENSO SOAI', info: '日本 · 76 岁 · 不对称自催化', icon: (c, x, y, r, a, t) => drawIconLoop(c, x, y, r, a, TA) }, T);
    ctx.restore();
  }

  // —— 反应环：微小的差别被一轮轮放大 ——
  const ringIn = eOut(prog(T, PA(11, 1) - .3, PA(11, 1) + .5)), gather = prog(T, PA(12, 0) - .25, PA(12, 0) + 1.6);
  const ringOut = 1 - eIO(prog(T, PA(12, 0) - .1, PA(12, 0) + .5));
  const p = s5Ratio(T);
  if (ringIn > 0) {
    const [cx, cy] = S5.RC, R = S5.RR;
    ctx.save(); ctx.globalAlpha = ringIn * ringOut;
    ctx.strokeStyle = hex('#9fd8ff', .35); ctx.lineWidth = 2; ctx.setLineDash([6, 10]); ctx.lineDashOffset = -TA * 40; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = hex('#9fd8ff', .15); ctx.lineWidth = 26; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
    // 每一轮放大时环上闪一下
    [53.55, 54.15, 54.75, 55.6].forEach(t0 => { const k = prog(T, t0 - .05, t0 + .5); if (k <= 0 || k >= 1) return; ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.strokeStyle = hex(COL.redL, .8 * (1 - k)); ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, cy, R + k * 60, 0, 7); ctx.stroke(); ctx.restore(); });
    txt(ctx, '化学反应', cx, cy - 6, { size: 34, font: FONT_T, col: COL.cream, a: .75 * eOut(prog(T, PA(11, 1), PA(11, 1) + .4)) * (1 - eIO(prog(T, 55.3, 55.8))), track: 8 });
    ctx.restore();
  }
  // 分子：先在环里转，最后聚成问号
  const QP = qPoints(), qx = 960, qy = 420, qs = 1.55 * (1 + .07 * eIO(prog(T, 59.5, 63.3)));
  if (ringIn > 0) {
    S5P.forEach((m, i) => {
      const th = m.th + TA * m.sp, [cx, cy] = S5.RC, rr = S5.RR * m.rr;
      const enter = eOut(prog(T, PA(11, 1) - .2 + m.d * .8, PA(11, 1) + .4 + m.d * .8));
      let x = cx + Math.cos(th) * rr, y = cy + Math.sin(th) * rr * .92;
      x = lerp(-80, x, enter); y = lerp(cy + (m.d - .5) * 300, y, enter);
      const gk = eIO(clamp((gather - m.d * .45) / .55)); const q = QP[i % QP.length];
      if (gk > 0) { const tx = qx + q[0] * qs, ty = qy + q[1] * qs + Math.sin(TA * 1.5 + i) * 2; x = lerp(x, tx, gk); y = lerp(y, ty, gk); }
      const red = clamp((p - m.u) * 60 + .5), rs = 12 * m.s * (1 - .25 * gk) * (1 + .12 * gk * Math.sin(TA * 2.2 + i * .7));
      ctx.save(); ctx.globalAlpha = enter;
      if (red > .02) { ctx.globalAlpha = enter * red; ctx.drawImage(sphereSprite(COL.red), x - rs, y - rs, rs * 2, rs * 2); }
      if (red < .98) { ctx.globalAlpha = enter * (1 - red); ctx.drawImage(sphereSprite(COL.blue), x - rs, y - rs, rs * 2, rs * 2); }
      ctx.restore();
    });
    if (gather > .3) { ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, qx, qy, 520, COL.red, .3 * eIO(prog(gather, .3, 1))); glow(ctx, qx, qy, 300, COL.gold, .18 * eIO(prog(gather, .5, 1)) * (.8 + .2 * Math.sin(TA * 2))); ctx.restore(); }
  }
  // 比例条（会倾斜：偏向一边）
  const barA = eOut(prog(T, PA(11, 2) - .3, PA(11, 2) + .2)) * ringOut;
  if (barA > 0) {
    const tilt = eIO(prog(T, PA(11, 4) - .3, PA(11, 4) + .6)) * .12, bw = 620, bx = 960, by = 815;
    ctx.save(); ctx.translate(bx, by); ctx.rotate(tilt);
    drawRatioBar(ctx, -bw / 2, -13, bw, 26, p, barA);
    txt(ctx, (p * 100).toFixed(p > .99 ? 1 : 1) + '%', -bw / 2 - 20, 0, { size: 44, font: FONT_B, col: COL.redL, a: barA, align: 'right' });
    txt(ctx, ((1 - p) * 100).toFixed(1) + '%', bw / 2 + 20, 0, { size: 44, font: FONT_B, col: COL.blueL, a: barA, align: 'left' });
    // 支点
    ctx.restore();
    ctx.save(); ctx.globalAlpha = barA * eOut(prog(T, PA(11, 4) - .4, PA(11, 4))); ctx.fillStyle = hex(COL.cream, .7); ctx.beginPath(); ctx.moveTo(bx, by + 16); ctx.lineTo(bx - 18, by + 46); ctx.lineTo(bx + 18, by + 46); ctx.closePath(); ctx.fill(); ctx.restore();
    // 放大镜：起点那一丝差别
    const lp = eOut(prog(T, PA(11, 2), PA(11, 2) + .4)) * (1 - eIO(prog(T, 53.7, 54.1)));
    if (lp > 0) { const lx = bx - bw / 2 + bw * .505, ly = by - 110;
      ctx.save(); ctx.globalAlpha = lp; ctx.strokeStyle = hex(COL.cream, .9); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(lx, ly, 62, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(lx, ly + 62); ctx.lineTo(lx, by - 16); ctx.stroke();
      ctx.save(); ctx.beginPath(); ctx.arc(lx, ly, 60, 0, 7); ctx.clip(); ctx.fillStyle = COL.red; ctx.fillRect(lx - 70, ly - 70, 70 + 6, 140); ctx.fillStyle = COL.blue; ctx.fillRect(lx + 6, ly - 70, 70, 140); ctx.fillStyle = '#fff'; ctx.fillRect(lx + 4, ly - 70, 3, 140); ctx.restore();
      ctx.restore();
      txt(ctx, '微小的差别', lx + 84, ly - 30, { size: 30, font: FONT_T, col: COL.gold2, a: lp, align: 'left' }); }
    txt(ctx, '偏向一边', 960, by + 78, { size: 34, font: FONT_T, col: COL.redL, a: eOut(prog(T, PA(11, 4), PA(11, 4) + .4)) * barA, track: 8, glow: .3, glowCol: COL.red });
    const amp = eOut(prog(T, 53.5, 53.9)) * (1 - eIO(prog(T, 55.2, 55.6)));
    txt(ctx, '一轮轮放大', 960, by + 78, { size: 34, font: FONT_T, col: COL.gold2, a: amp * barA, track: 12 });
  }
  // 结尾：问号上闪过的金色星光
  if (gather > .9) { const r = rng(Math.floor(TA * 6)); ctx.save(); ctx.globalCompositeOperation = 'screen';
    for (let k = 0; k < 4; k++) { const q = QP[Math.floor(r() * QP.length)], ph = (TA * 6) % 1, x = qx + q[0] * qs, y = qy + q[1] * qs, a = Math.sin(ph * Math.PI) * .9;
      glow(ctx, x, y, 26, COL.gold2, a); ctx.strokeStyle = hex('#fff6dc', a * .8); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x - 22, y); ctx.lineTo(x + 22, y); ctx.moveTo(x, y - 22); ctx.lineTo(x, y + 22); ctx.stroke(); }
    ctx.restore(); }
  // 结尾：问号里的分子微微发亮，"？"字的金色轮廓
  const qa = eOut(prog(T, PA(12, 2) - .2, PA(12, 2) + .6));
  if (qa > 0) { ctx.save(); ctx.globalAlpha = qa * .5; ctx.font = `${360 * qs}px ${FONT_H}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.strokeStyle = hex(COL.gold2, .6); ctx.lineWidth = 2; ctx.strokeText('？', qx, qy + 10 * qs); ctx.restore(); }
}
