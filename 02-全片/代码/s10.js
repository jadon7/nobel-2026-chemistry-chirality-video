// s10.js —— 第 31–33 句：1990 → 1995 翻牌；"另一套分子体系"：1995 年的嘧啶基烷醇（真实结构）组装出来 →
//          一圈圈往外扩的分子环 = 一轮轮反应，每圈红色占比按 Soai 1995 的数据：ee 2% → 10% → 57% → 81% → 88%
//          （红色占比 51% → 55% → 78.5% → 90.5% → 94%）→ 环收成堆叠柱状图：数量增加、差距扩大
'use strict';
const pct = p => String(Math.round(p * 1000) / 10) + '%';
const S10R = [ // [红色占比, 环半径, 粒子数, 出现时刻(短语)]
  [.51, 0, 26], [.55, 165, 40], [.785, 245, 58], [.905, 325, 78], [.94, 405, 96]];
const S10P = S10R.map(([p, R, n], k) => { const r = rng(1995 + k), a = []; for (let i = 0; i < n; i++) { const u = (i + r() * .8) / n; a.push({ th: i / n * 6.283 + r() * .2, rr: R + (r() - .5) * 26, red: u < p, s: .8 + r() * .4, rx: (r() - .5) * 120, ry: (r() - .5) * 120 }); } a.sort(() => r() - .5); return a; });
function drawS10(ctx, T) {
  drawBg(ctx, '#15305e', .5, .4);
  resetT(ctx); drawDust(ctx, TA, 0, 0, W, H, '#ffe7c0', .2);
  const C = [820, 520];
  // —— 1990 → 1995 ——
  const ya = eOut(prog(T, 166.3, 166.8)), yUp = eIO(prog(T, PA(31, 1) - .1, PA(31, 1) + .5)), yOut = 1 - eIO(prog(T, 187.6, 188.3));
  drawFlipYear(ctx, lerp(960, 220, yUp), lerp(300, 110, yUp), 1990, 1995, eIO(prog(T, PA(31, 0) - .05, PA(31, 0) + .55)), ya * yOut, { size: lerp(150, 86, yUp), col: COL.cream });
  // —— 另一套分子体系 ——
  const ma = eOut(prog(T, PA(31, 1) - .2, PA(31, 1) + .3)), mOut = 1 - eIO(prog(T, PA(32, 0) - .2, PA(32, 0) + .5));
  if (ma > 0 && mOut > 0) {
    const asm = prog(T, PA(31, 1) - .1, PA(31, 1) + 1.4), win = eIO(prog(T, PA(31, 2) - .1, PA(31, 2) + .5));
    const mx = lerp(960, C[0], 1 - mOut), my = 520, s = lerp(70, 30, 1 - mOut);
    if (win > 0) { ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, mx, my, 420, COL.red, .35 * win * mOut); ctx.restore(); drawBurst(ctx, mx, my, prog(T, PA(31, 2), PA(31, 2) + 1), 30, COL.gold2, 31, 500); }
    drawMol(ctx, { mol: MSOAI95, x: mx, y: my, s, R: pose(TA * .4 + .3, .5, .15), a: ma * mOut, asm, asmFrom: [960, 520], asmSeed: 9, bond: mixHexH('#e7b65e', COL.red, win), bondW: 1 + .4 * win, rim: win > 0 ? [COL.red, win] : null, glow: COL.red, glowA: win });
    txt(ctx, '另一套分子体系', 960, 790, { size: 36, font: FONT_T, col: COL.cream, a: eOut(prog(T, PA(31, 1) + .3, PA(31, 1) + .8)) * mOut, track: 8 });
    txt(ctx, '嘧啶基烷醇（1995）', 960, 836, { size: 26, font: FONT_T, col: COL.gold2, a: eOut(prog(T, PA(31, 1) + .5, PA(31, 1) + 1.0)) * mOut * .85, track: 3 });
    txt(ctx, '局面才变了', 960, 200, { size: 44, font: FONT_T, col: COL.gold2, a: win * mOut, track: 10, glow: .4 });
  }
  // —— 一轮轮的分子环 ——
  const tR = [PA(32, 0) + .1, PA(32, 1) + .1, PA(32, 2) + .3, PA(32, 3) + .1, PA(32, 3) + 1.1];
  const toBars = eIO(prog(T, PA(33, 0) - .3, PA(33, 0) + 1.2));
  const BX = 520, BY = 260, BW = 1000, BH = 64, BG = 104, amount = [.16, .28, .46, .7, 1];
  S10R.forEach(([p, R, n], k) => {
    const appear = eOut(prog(T, tR[k], tR[k] + .8)); if (appear <= 0) return;
    const rot = TA * (k % 2 ? -.08 : .1);
    S10P[k].forEach((m, i) => {
      const th = m.th + rot, rr = m.rr * appear;
      let x = C[0] + (k === 0 ? m.rx : Math.cos(th) * rr), y = C[1] + (k === 0 ? m.ry : Math.sin(th) * rr * .86);
      if (toBars > 0) { // 收进第 k 根柱子：红的在左、蓝的在右
        const bw = BW * amount[k], nr = Math.round(n * p), j = m.red ? S10P[k].filter((q, ii) => q.red && ii < i).length : S10P[k].filter((q, ii) => !q.red && ii < i).length;
        const u = m.red ? (j + .5) / n : (nr + j + .5) / n, tx = BX + bw * u, ty = BY + k * BG + BH / 2 + ((i * 7) % 5 - 2) * 8;
        const kk = eIO(clamp(toBars * 1.4 - (i % 10) * .04)); x = lerp(x, tx, kk); y = lerp(y, ty, kk);
      }
      dot(ctx, x, y, 9 * m.s * (1 - .25 * toBars), m.red, appear * (1 - .85 * eIO(prog(toBars, .7, 1))));
    });
    // 每圈的标签
    const la = appear * (1 - toBars);
    if (la > .04) { const lx = 1360, ly = 260 + k * 92; txt(ctx, k === 0 ? '起点' : `第 ${k} 轮`, lx, ly, { size: 30, font: FONT_T, col: COL.cream, a: la, align: 'left', track: 3 });
      txt(ctx, `红 ${pct(p)}`, lx + 130, ly, { size: 34, font: FONT_B, col: COL.redL, a: la, align: 'left', track: 2 });
      drawRatioBar(ctx, lx + 250, ly - 9, 220, 18, p, la); }
  });
  // —— 堆叠柱状图 ——
  if (toBars > 0) {
    S10R.forEach(([p], k) => { const bw = BW * amount[k], y = BY + k * BG, a = eOut(prog(toBars, .55 + k * .06, .85 + k * .06));
      drawRatioBar(ctx, BX, y, bw, BH, p, a * yOut);
      txt(ctx, k === 0 ? '起点' : `第 ${k} 轮`, BX - 30, y + BH / 2, { size: 30, font: FONT_T, col: COL.cream, a: a * yOut, align: 'right', track: 3 });
      txt(ctx, pct(p), BX + bw + 24, y + BH / 2, { size: 40, font: FONT_B, col: COL.redL, a: a * yOut, align: 'left', track: 2 }); });
    const ak = eOut(prog(T, PA(33, 1), PA(33, 1) + .5)) * yOut, dk = eOut(prog(T, PA(33, 2), PA(33, 2) + .5)) * yOut;
    txt(ctx, '数量增加 →', BX + BW / 2, BY + 4 * BG + BH + 50, { size: 32, font: FONT_T, col: COL.gold2, a: ak, track: 6 });
    txt(ctx, '差距扩大 ↓', BX + BW + 230, BY + 2 * BG + BH / 2, { size: 32, font: FONT_T, col: COL.redL, a: dk, align: 'left', track: 6 });
    txt(ctx, 'Soai 1995 · ee 2% → 10% → 57% → 81% → 88%（之后不再升高）', 960, 860, { size: 22, font: FONT_T, col: COL.cream, a: eOut(prog(toBars, .7, 1)) * .55 * yOut });
  }
}
