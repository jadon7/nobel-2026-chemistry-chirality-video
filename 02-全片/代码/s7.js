// s7.js —— 第 18–23 句（简化模型，按 Kagan 的 ML2 模型）：烧瓶里 12 只红手、8 只蓝手 → 画成红球、蓝球 → 两两结组：
//          红红 3 组、蓝蓝 1 组、红蓝 6 组 → 红红、蓝蓝组发亮、吐产物（强）；红蓝组变暗（弱）→ 瓶里 60 : 40 不能直接决定结果 →
//          蓝色大多被拉进了红蓝组 → 真正干活的是 3 组红红对 1 组蓝蓝，产物约 75 : 25（示意）
'use strict';
const S7 = (() => {
  const types = ['rb', 'rr', 'rb', 'bb', 'rb', 'rr', 'rb', 'rb', 'rr', 'rb'];
  const r = rng(707), pairs = [], balls = [];
  types.forEach((t, k) => { const col = k % 5, row = Math.floor(k / 5);
    const px = 560 + col * 200 + (row ? 100 : 0), py = 400 + row * 210;
    pairs.push({ t, x: px, y: py, rot0: r() * 6.28, ph: r() * 6.28 });
    [t[0], t[1]].forEach((c, j) => balls.push({ red: c === 'r', pair: k, side: j ? 1 : -1, x0: 330 + r() * 1260, y0: 230 + r() * 520, ph: r() * 6.28, d: r() })); });
  return { pairs, balls };
})();
function drawS7(ctx, T) {
  drawBg(ctx, '#132a64', .5, .4);
  resetT(ctx);
  // 模型空间：淡淡的网格
  ctx.save(); ctx.strokeStyle = 'rgba(140,180,255,.05)'; ctx.lineWidth = 1; for (let x = 0; x <= W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); } for (let y = 0; y <= H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); } ctx.restore();
  drawDust(ctx, TA, 0, 0, W, H, '#bfe0ff', .18);
  txt(ctx, '简化模型', 120, 100, { size: 34, font: FONT_T, col: COL.cream, a: eOut(prog(T, PA(18, 1), PA(18, 1) + .5)) * .85, align: 'left', track: 8 });
  txt(ctx, '据 Kagan 的模型示意', 120, 140, { size: 22, font: FONT_T, col: COL.cream, a: eOut(prog(T, PA(18, 1) + .3, PA(18, 1) + .8)) * .5, align: 'left', track: 2 });

  const morph = eIO(prog(T, 92.6, 93.6));              // 小手 → 小球
  const pairK = eIO(prog(T, PA(19, 0) - .1, PA(19, 0) + 1.6));   // 结组
  const strong = eIO(prog(T, PA(20, 0), PA(20, 0) + .6)), weak = eIO(prog(T, PA(20, 3), PA(20, 3) + .6));
  const R = 24;
  // 球
  const pos = S7.balls.map((b, i) => {
    const p = S7.pairs[b.pair];
    const fx = b.x0 + Math.sin(TA * .5 + b.ph) * 30, fy = b.y0 + Math.cos(TA * .43 + b.ph) * 22;
    const spin = p.rot0 + TA * (p.t === 'rb' ? lerp(.6, .12, weak) : lerp(.6, 1.6, strong));
    const d = R * 1.25, tx = p.x + Math.cos(spin) * d * b.side, ty = p.y + Math.sin(spin) * d * b.side + Math.sin(TA * .8 + p.ph) * 6;
    const k = eIO(clamp((pairK - b.d * .3) / .7));
    return { x: lerp(fx, tx, k), y: lerp(fy, ty, k), k };
  });
  // 产物：红红、蓝蓝组往下吐小分子（落进下面的产物条）
  const em = prog(T, PA(20, 1), 123.5);
  if (em > 0) S7.pairs.forEach((p, k) => { if (p.t === 'rb') return; const red = p.t === 'rr', r = rng(k * 31 + 5);
    for (let i = 0; i < 14; i++) { const t0 = r() * .95, ph = clamp((em - t0) / .12); if (ph <= 0 || ph >= 1) continue;
      const x = lerp(p.x, 560 + r() * 800, eIn(ph)), y = lerp(p.y + 30, 868, eIn(ph)); dot(ctx, x, y, 8, red, Math.sin(ph * Math.PI) * .95); } });
  // 连杆和球
  S7.pairs.forEach((p, k) => {
    const b1 = pos[k * 2], b2 = pos[k * 2 + 1], link = Math.min(b1.k, b2.k);
    const act = p.t === 'rb' ? 1 - .85 * weak : 1;
    const strongPulse = p.t !== 'rb' ? strong * (.6 + .4 * Math.sin(TA * 5 + k)) : 0;
    if (strongPulse > 0) { ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, p.x, p.y, 120, p.t === 'rr' ? COL.red : COL.blue, .35 * strongPulse); ctx.restore(); }
    if (link > .05) { ctx.save(); ctx.globalAlpha = link * (.45 + .55 * act); ctx.strokeStyle = hex(COL.gold, .9); ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(b1.x, b1.y); ctx.lineTo(b2.x, b2.y); ctx.stroke(); ctx.restore(); }
    [b1, b2].forEach((b, j) => { const ball = S7.balls[k * 2 + j];
      if (morph < 1) drawHandToken(ctx, b.x, b.y, .8, ball.red, 1 - morph, Math.sin(TA + k + j) * .2);
      if (morph > 0) { ctx.save(); ctx.globalAlpha = morph * (.4 + .6 * act); if (act < .6) ctx.filter = `saturate(${.3 + act})`; drawCatBall(ctx, b.x, b.y, R * eOutBack(morph), ball.red, 1, act * (p.t === 'rb' ? 0 : 1) + strongPulse); ctx.restore(); }
    });
    const mf = prog(T, 92.9, 93.4); if (mf > 0 && mf < 1) { drawBurst(ctx, b1.x, b1.y, mf, 6, '#ffffff', k, 60); }
  });
  // 图例：强 / 弱
  const lg = [[PA(20, 0), 'rr', '红红 · 强'], [PA(20, 0) + .4, 'bb', '蓝蓝 · 强'], [PA(20, 2), 'rb', '红蓝 · 弱']];
  const lgOut = 1 - eIO(prog(T, 122.9, 123.7));
  lg.forEach(([t0, ty, label], i) => { const k = eOut(prog(T, t0, t0 + .5)) * lgOut; if (k <= 0) return; const x = 1180 + i * 230, y = 120;
    const act = ty === 'rb' ? 1 - .85 * weak : 1;
    drawPair(ctx, x, y, 16, ty[0], ty[1], 0, k, act); txt(ctx, label, x, y + 50, { size: 28, font: FONT_T, col: ty === 'rb' ? '#9aa6c8' : (ty === 'rr' ? COL.redL : COL.blueL), a: k, track: 4 }); });
  // 瓶里：12 红 8 蓝（60 : 40）
  const ca = eOut(prog(T, PA(21, 1), PA(21, 1) + .5)) * lgOut;
  if (ca > 0) {
    txt(ctx, '瓶里：红 12 · 蓝 8', 120, 214, { size: 30, font: FONT_T, col: COL.cream, a: ca, align: 'left', track: 3 });
    drawRatioBar(ctx, 120, 240, 380, 20, .6, ca);
    txt(ctx, '60%', 120, 284, { size: 24, font: FONT_B, col: COL.redL, a: ca, align: 'left' }); txt(ctx, '40%', 500, 284, { size: 24, font: FONT_B, col: COL.blueL, a: ca, align: 'right' });
  }
  // 产物条（底部）
  const pa = eOut(prog(T, PA(20, 1) + .3, PA(20, 1) + .9)) * lgOut;
  const pfill = lerp(.5, .75, eIO(prog(T, PA(20, 1) + .5, PA(23, 1) + 1.5)));
  if (pa > 0) {
    txt(ctx, '做出的产物', 560, 838, { size: 28, font: FONT_T, col: COL.cream, a: pa, align: 'left', track: 3 });
    drawRatioBar(ctx, 560, 860, 800, 24, pfill, pa);
    const fk = eOut(prog(T, PA(23, 1), PA(23, 1) + .6));
    txt(ctx, `红 ${Math.round(pfill * 100)}%`, 560, 906, { size: 26, font: FONT_B, col: COL.redL, a: pa * (.4 + .6 * fk), align: 'left' });
    txt(ctx, `${Math.round((1 - pfill) * 100)}% 蓝`, 1360, 906, { size: 26, font: FONT_B, col: COL.blueL, a: pa * (.4 + .6 * fk), align: 'right' });
  }
  // "不能直接决定结果"：从瓶里的比例画一根箭头到产物条，打叉
  const nk = eOut(prog(T, PA(21, 2), PA(21, 2) + .7)) * (1 - eIO(prog(T, PA(22, 0), PA(22, 0) + .4)));
  if (nk > 0) { drawArrow(ctx, 310, 300, 540, 850, -.25, hex(COL.cream, .7), nk, 3, eOut(prog(T, PA(21, 2), PA(21, 2) + .6))); drawMark(ctx, 330, 600, 28, false, eOut(prog(T, PA(21, 2) + .4, PA(21, 2) + .8)) * nk); }
  // "和谁组在一起"：红蓝组画虚线圈，红红、蓝蓝组画金圈
  const ok = eOut(prog(T, PA(22, 1) - .2, PA(22, 1) + .4)) * (1 - eIO(prog(T, 122.6, 123.4)));
  if (ok > 0) {
    S7.pairs.forEach((p, k) => { ctx.save(); ctx.globalAlpha = ok; if (p.t === 'rb') { ctx.strokeStyle = 'rgba(170,180,210,.75)'; ctx.setLineDash([6, 6]); ctx.lineWidth = 2; } else { ctx.strokeStyle = hex(COL.gold2, .9); ctx.lineWidth = 3; }
      ctx.beginPath(); ctx.arc(p.x, p.y, 74, 0, 7); ctx.stroke(); ctx.restore(); });
    txt(ctx, '蓝色大多被拉进了红蓝组', 960, 722, { size: 28, font: FONT_T, col: '#b8c2e0', a: ok });
    txt(ctx, '真正干活的：红红 3 组，蓝蓝 1 组', 960, 764, { size: 28, font: FONT_T, col: COL.gold2, a: eOut(prog(T, PA(22, 1) + .4, PA(22, 1) + .9)) * ok });
  }
  // "只多一点"→"多得多"
  const mk = eOut(prog(T, PA(23, 0), PA(23, 0) + .5)) * lgOut;
  if (mk > 0) { ctx.save(); ctx.globalAlpha = mk; ctx.strokeStyle = COL.gold2; ctx.lineWidth = 2.5; roundRect(ctx, 110, 196, 420, 104, 12); ctx.stroke(); ctx.restore();
    txt(ctx, '只多一点', 320, 330, { size: 28, font: FONT_T, col: COL.gold2, a: mk, track: 4 });
    const mk2 = eOut(prog(T, PA(23, 1) + .4, PA(23, 1) + 1));
    if (mk2 > 0) { ctx.save(); ctx.globalAlpha = mk2; ctx.strokeStyle = COL.gold2; ctx.lineWidth = 2.5; roundRect(ctx, 550, 822, 820, 104, 12); ctx.stroke(); ctx.restore(); txt(ctx, '偏得更多', 1440, 872, { size: 30, font: FONT_T, col: COL.gold2, a: mk2, align: 'left', track: 4 }); }
  }
}
