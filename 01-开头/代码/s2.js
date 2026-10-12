// s2.js —— 第 3–4 句：年份翻到 1958，画面变冷；背景是育婴室老影像；一排排母亲图标，其中一部分服过药（变红），
//          从她们身上垂下细线连到孩子图标；婴儿握住大人手指的插画浮现，"全球超过 10,000 名婴儿"；
//          最后一片药浮在中间，镜头扎进药片（接第 3 场的分子）
// 出于尊重，不画残缺的肢体，也不用这类实拍：孩子只用中性的图标表示。
'use strict';
fuse('s2_bg', 'nursery', 8.35, 18.1, 0, 1);
const S2 = (() => {
  const r = rng(58), M = [], cols = 16, rows = 3;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const x = 330 + i * 84 + (j % 2) * 42, y = 210 + j * 92;
    M.push({ x, y, took: false, d: r(), ph: r() * 6 });
  }
  // 其中一部分服过药（固定挑 11 个，分散开）
  [3, 6, 9, 13, 17, 20, 26, 29, 35, 40, 44].forEach((k, n) => { M[k].took = true; M[k].n = n; });
  return { M };
})();
// 1950 年代的女性图标：圆头 + 喇叭裙
function drawMotherIcon(ctx, x, y, s, col, a) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = col;
  ctx.beginPath(); ctx.arc(x, y - 22 * s, 8.5 * s, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - 5 * s, y - 11 * s); ctx.lineTo(x + 5 * s, y - 11 * s); ctx.lineTo(x + 15 * s, y + 20 * s); ctx.quadraticCurveTo(x, y + 23 * s, x - 15 * s, y + 20 * s); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function drawChildIcon(ctx, x, y, s, col, a) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = col;
  ctx.beginPath(); ctx.arc(x, y - 13 * s, 7 * s, 0, 7); ctx.fill();
  roundRect(ctx, x - 7 * s, y - 4 * s, 14 * s, 17 * s, 6 * s); ctx.fill();
  ctx.restore();
}

function drawS2(ctx, T) {
  drawBg(ctx, '#0f1f4c', .5, .3);
  // 背景：育婴室老影像，冷色，慢慢推近
  resetT(ctx);
  const bgA = .42 * eOut(prog(T, 8.4, 9.4)) * (1 - .55 * eIO(prog(T, 14.0, 14.7)));
  const z = 1 + .06 * prog(T, 8.4, 18);
  drawFootage(ctx, 's2_bg', T, 0, 0, W, H, { a: bgA, hi: '#b8cdf0', lo: '#06102c', zoom: z, vig: .7, dirt: .6 });
  // 压一层渐变，让前景图标清楚
  const sh = ctx.createLinearGradient(0, 0, 0, H); sh.addColorStop(0, 'rgba(5,10,30,.55)'); sh.addColorStop(.5, 'rgba(5,10,30,.2)'); sh.addColorStop(1, 'rgba(5,10,30,.7)'); ctx.fillStyle = sh; ctx.fillRect(0, 0, W, H);
  drawDust(ctx, TA, 0, 0, W, H, '#cfe2ff', .22);

  // 年份：1957 → 1958
  const ya = 1 - eIO(prog(T, 16.4, 16.9));
  drawFlipYear(ctx, 196, 92, 1957, 1958, eIO(prog(T, PA(3, 0) + .02, PA(3, 0) + .62)), ya, { size: 80, col: COL.cream });
  txt(ctx, '年后', 302, 92, { size: 30, font: FONT_T, col: COL.cream, a: eOut(prog(T, 9.1, 9.5)) * ya, align: 'left' });

  // —— 母亲图标 ——
  const dimAll = 1 - .72 * eIO(prog(T, 14.0, 14.7));
  const fadeOut = 1 - eIO(prog(T, 16.3, 16.9));
  const t0 = 9.15, tk = PA(3, 1) + .3;       // "一部分服过药的母亲"
  for (const m of S2.M) {
    const k = eOut(prog(T, t0 + m.d * .9, t0 + m.d * .9 + .45)); if (k <= 0) continue;
    const red = m.took ? eIO(prog(T, tk + m.n * .07, tk + m.n * .07 + .35)) : 0;
    const col = red > 0 ? mixHexH('#e8dcc4', COL.red, red) : '#e8dcc4';
    const y = m.y + (1 - k) * 18 + Math.sin(TA * 1.1 + m.ph) * 1.5;
    if (red > 0) { ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, m.x, y - 6, 46, COL.red, .5 * red * dimAll * fadeOut); ctx.restore(); }
    drawMotherIcon(ctx, m.x, y, 1, col, k * (m.took ? 1 : .55 + .45 * (1 - red)) * dimAll * fadeOut * (m.took ? 1 : (1 - .35 * eIO(prog(T, tk, tk + .8)))));
    // 小药片
    if (red > 0) { ctx.save(); ctx.globalAlpha = red * dimAll * fadeOut; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(m.x + 17, y - 28, 6, 4, -.3, 0, 7); ctx.fill(); ctx.restore(); }
  }
  txt(ctx, '服过药的母亲', 1640, 210, { size: 30, font: FONT_T, col: COL.redL, a: eOut(prog(T, tk + .5, tk + 1)) * dimAll * fadeOut, align: 'left' });

  // —— 孩子：从服过药的母亲身上牵出细线，落到出生年份的时间轴上（多数在 1960–61 年）——
  const tc = PA(4, 0) + .05;                  // "有的生下孩子……"
  const ax0 = 470, ax1 = 1450, ay = 690, yx = y => lerp(ax0, ax1, (y - 1958) / 4);
  const axA = eOut(prog(T, tc - .5, tc + .2)) * dimAll * fadeOut;
  if (axA > 0) {
    ctx.save(); ctx.globalAlpha = axA; ctx.strokeStyle = hex(COL.cream, .5); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(ax0 - 60, ay); ctx.lineTo(lerp(ax0 - 60, ax1 + 60, eOut(prog(T, tc - .5, tc + .3))), ay); ctx.stroke();
    for (let y = 1958; y <= 1962; y++) { const x = yx(y); ctx.beginPath(); ctx.moveTo(x, ay - 6); ctx.lineTo(x, ay + 6); ctx.stroke(); txt(ctx, String(y), x, ay + 32, { size: 28, font: FONT_B, col: COL.cream, a: .7, shadow: false }); }
    // 1961 年 11 月撤市
    const wx = yx(1961.9), wa = eOut(prog(T, 14.6, 15.1));
    if (wa > 0) { ctx.globalAlpha = axA * wa; ctx.strokeStyle = hex('#ff7a6a', .9); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(wx, ay - 150); ctx.lineTo(wx, ay + 8); ctx.stroke();
      txt(ctx, '1961 年 11 月 撤市', wx + 10, ay - 150, { size: 26, font: FONT_T, col: '#ff9a8a', align: 'left', a: 1 }); }
    ctx.restore();
  }
  const YEARS = [1960.5, 1961.2, 1958.6, 1960.2, 1961.6, 1959.5, 1961.4, 1960.8, 1961.8, 1962.3, 1961.0];
  const stack = {};
  for (const m of S2.M) {
    if (!m.took) continue;
    const yr = YEARS[m.n], key = Math.floor(yr); stack[key] = (stack[key] || 0) + 1;
    const cx = yx(yr), cy = ay - 22 - (stack[key] - 1) * 40;
    const st = tc + m.n * .12, k = eIO(prog(T, st, st + .6)); if (k <= 0) continue;
    const y0 = m.y + 24, pts = qpts(m.x, y0, (m.x + cx) / 2, (y0 + cy) / 2 + 60, cx, cy - 26, 24);
    ctx.save(); ctx.globalAlpha = dimAll * fadeOut; ctx.setLineDash([3, 5]); drawThread(ctx, pts, k, COL.red, 1.2, .5, false); ctx.restore();
    const kc = eOutBack(prog(T, st + .45, st + .85));
    if (kc > 0) { ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, cx, cy - 6, 40, COL.warm, .35 * kc * dimAll * fadeOut); ctx.restore();
      drawChildIcon(ctx, cx, cy, kc * 1.3, '#ffd9b8', clamp(kc) * dimAll * fadeOut); }
  }
  txt(ctx, '她们的孩子 · 出生年份', ax0 - 60, ay + 80, { size: 26, font: FONT_T, col: '#ffd9b8', a: eOut(prog(T, tc + .6, tc + 1.1)) * dimAll * fadeOut * .85, align: 'left' });
  // —— 婴儿握住大人的手指（插画）+ 数字 ——
  const ba = eOut(prog(T, 14.05, 14.95)) * (1 - eIO(prog(T, 16.35, 16.95)));
  if (ba > 0) {
    const bs = .62 + .03 * prog(T, 14.05, 16.9), bx = 960, by = 470 + (1 - ba) * 40;
    ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, bx, by, 520, '#ff9a5c', .22 * ba); glow(ctx, bx, by, 220, '#ffd9a8', .2 * ba); ctx.restore();
    drawAt(ctx, IMG.baby_f, ...ANCH.baby_hand.grip, bx, by, bs, 0, ba);
    const na = eOut(prog(T, 14.75, 15.25)) * (1 - eIO(prog(T, 16.35, 16.95)));
    const cnt = Math.round(10000 * eOut(prog(T, 14.75, 15.9)) / 100) * 100;
    txt(ctx, cnt.toLocaleString('en-US') + (T > 15.85 ? '+' : ''), 960, 800, { size: 118, font: FONT_B, col: COL.gold2, a: na, glow: .5, glowCol: COL.gold, track: 4 });
    txt(ctx, '全球受影响的婴儿（估计）', 960, 880, { size: 30, font: FONT_T, col: COL.cream, a: na * .8, track: 3 });
  }

  // —— 结尾：一片药浮在中间，镜头扎进去 ——
  const pa = eOut(prog(T, 16.6, 17.0));
  if (pa > 0) {
    const dive = eIn(prog(T, 17.0, 18.0)), sc = lerp(.1, 2.4, dive), rot = -.15 + dive * .4;
    ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, 960, 520, 300 + dive * 900, '#bfe3ff', .4 * pa); ctx.restore();
    drawAt(ctx, IMG.tablet, ...ANCH.tablet.c, 960, 520, sc, rot, pa);
  }
}
