// s12.js —— 第 41–44 句：满屏红蓝分子，戴手套的手拿镊子想挑走一颗蓝的 → 打叉（人没有逐个挑走）→
//          中间一颗红分子亮起（微小的领先），一圈波纹往外扩，新生成的红分子越来越多 → 红分子汇进烧瓶 →
//          画面转冷，回到 1957 的 Contergan 药盒：只有一种构型的分子进入人体，在体内一部分翻成镜像（相互转化）→
//          镜子两边一对分子：分开它们，并不等于解决了安全问题 → 淡出
'use strict';
fuse('s12_tw', 'tweezers_ft', 236.0, 240.6, 0, 1);
const S12D = (() => { const r = rng(4141), a = []; for (let i = 0; i < 150; i++) { const th = r() * 6.283, rr = Math.sqrt(r()); a.push({ x: 960 + Math.cos(th) * rr * 640, y: 540 + Math.sin(th) * rr * 270, red: r() < .5, ph: r() * 6.28, s: .75 + r() * .5 }); } return a; })();
const S12N = (() => { const r = rng(4242), a = []; for (let i = 0; i < 170; i++) { const th = r() * 6.283, rr = Math.sqrt(r()); a.push({ x: 960 + Math.cos(th) * rr * 660, y: 540 + Math.sin(th) * rr * 290, d: Math.hypot(Math.cos(th) * rr * 660, Math.sin(th) * rr * 290 * 2.2), ph: r() * 6.28, s: .7 + r() * .5 }); } return a; })();
const S12B = (() => { const r = rng(4343), a = []; for (let i = 0; i < 14; i++) a.push({ t0: 256.0 + i * .22, path: r(), flip: 257.4 + r() * 3.0, flipped: r() < .5, ox: (r() - .5) * 160, oy: (r() - .5) * 360, rot: r() * 6.28 }); return a; })();
function drawS12(ctx, T) {
  const cold = eIO(prog(T, PA(44, 0) - .3, PA(44, 0) + .8));
  drawBg(ctx, cold > .5 ? '#101c3e' : '#14295e', .5, .38);
  resetT(ctx); drawDust(ctx, TA, 0, 0, W, H, cold > .5 ? '#c8d6f0' : '#ffe7c0', .2);
  const fieldOut = 1 - eIO(prog(T, PA(43, 0) + 1.2, PA(43, 1) + .4));
  // —— 满屏分子 ——
  const seedT = PA(42, 1) - .1, waveR = eIO(prog(T, PA(42, 2) - .2, PA(42, 2) + 2.6)) * 820;
  const tw = eOut(prog(T, 236.5, 237.6)), pick = prog(T, 237.7, 238.5), lift = eIO(prog(T, 238.3, 239.0)), drop = eIn(prog(T, 239.3, 239.9));
  const target = S12D[17];
  const fa = eOut(prog(T, 235.9, 236.7)) * fieldOut;
  if (fa > 0) {
    S12D.forEach((m, i) => {
      let x = m.x + Math.sin(TA * .5 + m.ph) * 10, y = m.y + Math.cos(TA * .4 + m.ph) * 8;
      if (i === 17) { y -= lift * 160 * (1 - drop); x += lift * 30 * (1 - drop); }
      const dWave = Math.hypot((x - 960), (y - 540) * 2.2);
      const dim = !m.red && waveR > dWave ? .35 : 1;
      dot(ctx, x, y, 11 * m.s, m.red, fa * dim);
    });
    // 新生成的红分子：波纹扫过的地方冒出来
    if (waveR > 0) S12N.forEach(n => { if (n.d > waveR) return; const k = eOutBack(clamp((waveR - n.d) / 120)); const x = n.x + Math.sin(TA * .6 + n.ph) * 8, y = n.y + Math.cos(TA * .5 + n.ph) * 6; dot(ctx, x, y, 11 * n.s * k, true, fa * clamp(k)); });
    // 种子：微小的领先
    const sa = eOut(prog(T, seedT, seedT + .5)) * fieldOut;
    if (sa > 0) { ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, 960, 540, 160, COL.red, .8 * sa * (.7 + .3 * Math.sin(TA * 5))); ctx.restore(); dot(ctx, 960, 540, 20, true, sa);
      txt(ctx, '一点微小的领先', 960, 470, { size: 32, font: FONT_T, col: COL.gold2, a: sa * (1 - eIO(prog(T, PA(42, 2) + .6, PA(42, 2) + 1.2))), track: 4 }); }
    if (waveR > 0 && waveR < 820) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.strokeStyle = hex(COL.redL, .7 * (1 - waveR / 820)); ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(960, 540, waveR, waveR / 2.2, 0, 0, 7); ctx.stroke(); ctx.restore(); }
    // 比例条：50% → 越来越红
    const ra = eOut(prog(T, PA(42, 1), PA(42, 1) + .5)) * fieldOut, rp = lerp(.5, .99, eIO(prog(T, PA(42, 2), PA(42, 2) + 2.8)));
    if (ra > 0) { drawRatioBar(ctx, 560, 880, 800, 20, rp, ra); txt(ctx, `红 ${Math.round(rp * 100)}%`, 540, 890, { size: 28, font: FONT_B, col: COL.redL, a: ra, align: 'right' }); }
  }
  // —— 镊子 ——
  if (tw > 0 && T < 240.4) {
    const tOut = eIO(prog(T, 239.2, 240.2)), tip = [target.x + lift * 30, target.y - lift * 160];
    const tx = lerp(1700, tip[0], tw) + tOut * 300, ty = lerp(-200, tip[1], tw) - tOut * 500;
    drawAt(ctx, IMG.tweezers, ...ANCH.tweezers.tip, tx, ty, .5, 0, tw * (1 - tOut));
    if (pick > 0 && pick < 1) { ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, tip[0], tip[1], 50, '#ffffff', .6 * Math.sin(pick * Math.PI)); ctx.restore(); }
    const xa = eOutBack(prog(T, 238.9, 239.4)) * (1 - eIO(prog(T, 239.9, 240.4)));
    if (xa > 0) { drawMark(ctx, tip[0] + 20, tip[1] - 30, 70 * clamp(xa, 0, 1.2), false, clamp(xa)); txt(ctx, '没有逐个挑走', tip[0] + 20, tip[1] + 70, { size: 34, font: FONT_T, col: '#ff9a8a', a: clamp(xa), track: 6 }); }
    // 老影像：真实的镊子
    const wa = eOut(prog(T, 236.6, 237.3)) * (1 - eIO(prog(T, 239.8, 240.5))), ww = 400, wh = 300, wx = 110, wy = 90;
    if (wa > 0) { ctx.save(); ctx.globalAlpha = wa; drawFilmFrame(ctx, wx, wy, ww, wh, { sprocket: 'tb', r: 4 }); drawFootage(ctx, 's12_tw', T, wx, wy, ww, wh, { hi: '#f0dcb8', lo: '#131a3c', vig: .45 });
      txt(ctx, '资料影像 · 1949', wx, wy + wh + 54, { size: 20, font: FONT_T, col: COL.cream, a: .55, align: 'left', track: 2 }); ctx.restore(); }
  }
  // —— 第 43 句：红分子汇进烧瓶 ——
  const fl = eOut(prog(T, PA(43, 0) + .2, PA(43, 0) + 1.0)) * (1 - eIO(prog(T, PA(44, 0) - .4, PA(44, 0) + .3)));
  if (fl > 0) {
    const c = drawFlaskMix(ctx, 960, 600, .46, 1, fl, T, 5);
    const r = rng(43); for (let i = 0; i < 26; i++) { const t0 = PA(43, 0) + r() * 1.6, ph = clamp((T - t0) / .9); if (ph <= 0 || ph >= 1) continue; const sx = 960 + (r() - .5) * 1200, sy = 540 + (r() - .5) * 500; dot(ctx, lerp(sx, 960, eIn(ph)), lerp(sy, 300, eIn(ph)), 10, true, (1 - ph) * fl); }
    const gk = eOut(prog(T, PA(43, 1), PA(43, 1) + .6)); if (gk > 0) { ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, c[0], c[1], 420, COL.gold, .35 * gk * fl); ctx.restore(); drawBurst(ctx, c[0], c[1], prog(T, PA(43, 1), PA(43, 1) + 1.2), 24, COL.gold2, 43, 420); }
    txt(ctx, '只要红色的那一种', 600, 420, { size: 34, font: FONT_T, col: COL.redL, a: eOut(prog(T, PA(43, 0) + .6, PA(43, 0) + 1.1)) * fl, track: 6 });
  }
  // —— 第 44 句：回到反应停 ——
  const ba = eOut(prog(T, PA(44, 0) - .2, PA(44, 0) + .6)) * (1 - eIO(prog(T, PA(44, 2) - .3, PA(44, 2) + .3)));
  const bodyA = eOut(prog(T, PA(44, 1) - .3, PA(44, 1) + .5)) * (1 - eIO(prog(T, PA(44, 2) - .3, PA(44, 2) + .3)));
  if (ba > 0) {
    ctx.save(); ctx.filter = `saturate(${1 - .4 * cold})`;
    drawAt(ctx, IMG.pillbox, ...ANCH.pillbox.c, 470, 640, .4, 0, ba);
    const [p0, p1, p2] = ANCH.pillbox.label.map(p => imgPt(...p, ...ANCH.pillbox.c, 470, 640, .4));
    ctx.save(); const ux = (p1[0] - p0[0]) / 1000, uy = (p1[1] - p0[1]) / 1000, vx = (p2[0] - p0[0]) / 300, vy = (p2[1] - p0[1]) / 300;
    ctx.transform(ux, uy, vx, vy, p0[0], p0[1]); ctx.globalAlpha = ba; ctx.globalCompositeOperation = 'multiply'; ctx.translate(500, 120);
    ctx.font = `italic 168px ${FONT_HB}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#2b3f7a'; ctx.fillText('Contergan', 0, 0); ctx.restore();
    ctx.restore();
    txt(ctx, '反应停 · 1957', 470, 330, { size: 40, font: FONT_H, col: COL.cream, a: ba, track: 8 });
    // 单一构型的分子从药盒飞进人体
    if (bodyA > 0) {
      ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, 1380, 520, 520, '#2a6cc8', .22 * bodyA); ctx.restore();
      drawAt(ctx, IMG.body_f, ...ANCH.body.c, 1400, 600, .58, 0, bodyA * .9);
      const R0 = molR0(T), R1 = M3.mul(M3.MX, M3.mul(R0, M3.MX));
      S12B.forEach((b, i) => { const k = eIO(prog(T, b.t0, b.t0 + 1.2)); if (k <= 0) return;
        const x0 = 560, y0 = 560, x1 = 1380 + b.ox, y1 = 640 + b.oy, x = lerp(x0, x1, k), y = lerp(y0, y1, k) - Math.sin(k * Math.PI) * 140;
        const fk = b.flipped ? prog(T, b.flip, b.flip + .35) : 0, sx = fk > 0 && fk < 1 ? Math.abs(Math.cos(fk * Math.PI)) : 1, blue = fk >= .5;
        ctx.save(); ctx.translate(x, y); ctx.scale(Math.max(.05, sx), 1); ctx.translate(-x, -y);
        drawMol(ctx, { x, y, s: 9, R: blue ? R1 : R0, mir: blue, a: bodyA * clamp(k * 3), bond: blue ? COL.blue : COL.red, bondW: 1.6, rim: [blue ? COL.blue : COL.red, 1] });
        ctx.restore();
        if (fk > 0 && fk < 1) { ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, x, y, 70, '#ffffff', .6 * Math.sin(fk * Math.PI)); ctx.restore(); } });
      txt(ctx, '只服一种', 600, 840, { size: 30, font: FONT_T, col: COL.redL, a: eOut(prog(T, 256.0, 256.5)) * bodyA, track: 4 });
      const ia = eOut(prog(T, 258.0, 258.6)) * bodyA;
      if (ia > 0) { txt(ctx, '⇄', 1700, 330, { size: 70, font: FONT_B, col: COL.gold2, a: ia, glow: .4 }); txt(ctx, '在体内会相互转化', 1700, 400, { size: 30, font: FONT_T, col: COL.gold2, a: ia, track: 3 }); txt(ctx, '（几小时内）', 1700, 440, { size: 22, font: FONT_T, col: COL.cream, a: ia * .7, track: 2 }); }
    }
  }
  // —— 分开它们，并不等于解决了安全问题 ——
  const ma = eOut(prog(T, PA(44, 2) - .2, PA(44, 2) + .5));
  if (ma > 0) {
    const fade = 1 - .55 * eIO(prog(T, PA(44, 3) + 1.0, 268.5));
    const R0 = molR0(T), R1 = M3.mul(M3.MX, M3.mul(R0, M3.MX));
    drawMirror(ctx, 960, 230, 700, ma * fade, T);
    const sep = eIO(prog(T, PA(44, 2) - .1, PA(44, 2) + .9)), lx = lerp(900, 600, sep), rx = lerp(1020, 1320, sep);
    // 并不等于解决：左边那个在中途翻成镜像，又翻回来
    const fl2 = prog(T, PA(44, 3) + .3, PA(44, 3) + .8), sx = fl2 > 0 && fl2 < 1 ? Math.abs(Math.cos(fl2 * Math.PI * 2)) : 1, mid = fl2 > .25 && fl2 < .75;
    ctx.save(); ctx.globalAlpha = fade;
    ctx.save(); ctx.translate(lx, 480); ctx.scale(Math.max(.05, sx), 1); ctx.translate(-lx, -480);
    drawMol(ctx, { x: lx, y: 480, s: 46, R: mid ? R1 : R0, mir: mid, a: ma, bond: mid ? COL.blue : COL.red, bondW: 1.4, rim: [mid ? COL.blue : COL.red, 1], glow: mid ? COL.blue : COL.red, glowA: .8 });
    ctx.restore();
    drawMol(ctx, { x: rx, y: 480, s: 46, R: R1, mir: true, a: ma, bond: COL.blue, bondW: 1.4, rim: [COL.blue, 1], glow: COL.blue, glowA: .8 });
    ctx.restore();
    // 结尾：婴儿握指的插画，淡淡地浮在下面
    const bh = eOut(prog(T, PA(44, 3) + .6, PA(44, 3) + 2.2)) * .35;
    if (bh > 0) drawAt(ctx, IMG.baby_f, ...ANCH.baby_hand.grip, 960, 840, .4, 0, bh);
  }
}
