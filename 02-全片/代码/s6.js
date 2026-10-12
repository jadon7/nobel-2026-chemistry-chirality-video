// s6.js —— 第 13–17 句：开头结尾的问号散开、聚成"1986"（字里是 1980 年代实验室老影像）→ 实验台插画，烧瓶亮起"反常" →
//          烧瓶里的催化剂是红色左手、蓝色右手（75% : 25%）→ 预想产物也是约 74% → 实际约 85%（Kagan 1986 香叶醇环氧化，据原文图读取）
//          → 曲线图：实际曲线鼓在"预想"对角线上方 → 问号：混着用，怎么还能把差距拉大？
'use strict';
fuse('s6_digits', 'lab80s', 62.5, 66.0, 0, 1);
fuse('s6_win', 'lab80s_b', 64.6, 69.8, 0, 1);
// Kagan 1986 香叶醇环氧化：配体 ee → 产物 ee（据诺贝尔科学背景图 2b 读取，约值）→ 换算成"红色占比"
const KAGAN = [[0, 0], [10, 20], [20, 42], [30, 45], [50, 70], [70, 77], [85, 85], [100, 95]].map(([a, b]) => [.5 + a / 200, .5 + b / 200]);
function kaganFn(u) {   // u = 催化剂红色占比 0.5..1 → 产物红色占比（分段线性插值，再平滑一点）
  for (let i = 0; i < KAGAN.length - 1; i++) if (u <= KAGAN[i + 1][0]) { const k = (u - KAGAN[i][0]) / (KAGAN[i + 1][0] - KAGAN[i][0]); return lerp(KAGAN[i][1], KAGAN[i + 1][1], smooth(k)); }
  return KAGAN[KAGAN.length - 1][1];
}
const S6 = { FX: 480, FY: 600, FS: .44 };
const S6H = (() => { const r = rng(1986), a = []; for (let i = 0; i < 8; i++) a.push({ red: i < 6, th: r() * 6.28, rr: .2 + r() * .7, sp: (.15 + r() * .2) * (r() < .5 ? 1 : -1), rot: (r() - .5) * .8, d: r() }); return a; })();

function drawS6(ctx, T) {
  drawBg(ctx, '#18295e', .55, .35);
  resetT(ctx); drawDust(ctx, TA, 0, 0, W, H, '#ffe9c0', .2);
  // —— 实验台（插画）+ 老影像窗口 ——
  const la = eOut(prog(T, 64.9, 65.8)) * (1 - eIO(prog(T, 69.2, 69.9)));
  if (la > 0) {
    resetT(ctx); ctx.save(); ctx.globalAlpha = la * .9;
    const z = 1.04 + .05 * prog(T, 64.9, 69.9), iw = 1536 * 1.32 * z, ih = 1024 * 1.32 * z;
    ctx.drawImage(IMG.lab1986, 960 - iw / 2, 560 - ih / 2, iw, ih); ctx.restore();
    const vg = ctx.createRadialGradient(960, 560, 300, 960, 560, 1100); vg.addColorStop(0, 'rgba(5,9,26,0)'); vg.addColorStop(1, `rgba(5,9,26,${.85 * la})`); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    // 反常：烧瓶亮起，一个大感叹号
    const ab = prog(T, PA(13, 2) - .1, PA(13, 2) + .5);
    const fp = ANCH.lab1986.flask ? imgPt(...ANCH.lab1986.flask, 768, 512, 960, 560, 1.32 * z) : [900, 520];
    if (ab > 0) { ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, fp[0], fp[1], 260, '#ffcf8a', .7 * la * clamp(ab * 2)); ctx.restore();
      drawBurst(ctx, fp[0], fp[1], prog(T, PA(13, 2), PA(13, 2) + .9), 30, COL.gold2, 13, 420);
      const k = eOutBack(clamp(ab * 1.6)), bx0 = fp[0] + 190, by0 = fp[1] - 250;
      ctx.save(); ctx.globalAlpha = la * clamp(ab * 3); ctx.translate(bx0, by0); ctx.scale(clamp(k, 0, 1.2), clamp(k, 0, 1.2));
      ctx.fillStyle = 'rgba(8,12,30,.88)'; roundRect(ctx, 0, -55, 360, 110, 16); ctx.fill(); ctx.strokeStyle = COL.gold2; ctx.lineWidth = 2.5; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(10, 30); ctx.lineTo(-40, 80); ctx.lineTo(40, 45); ctx.closePath(); ctx.fillStyle = 'rgba(8,12,30,.88)'; ctx.fill();
      ctx.restore();
      txt(ctx, '!', bx0 + 50 * clamp(k, 0, 1.2), by0, { size: 96, font: FONT_B, col: COL.gold2, a: la * clamp(ab * 3), glow: .6, glowCol: COL.red });
      txt(ctx, '一件反常的事', bx0 + 220 * clamp(k, 0, 1.2), by0, { size: 36, font: FONT_T, col: COL.gold2, a: la * eOut(prog(T, PA(13, 2) + .2, PA(13, 2) + .7)), track: 4 }); }
    // 卡根的照片（钉在左边）
    const pk = eOutBack(prog(T, 65.0, 65.7), 1.1) * (1 - eIO(prog(T, 69.2, 69.9)));
    if (pk > 0) drawPhoto(ctx, 'kagan', 300, 480, 270, 340, clamp(pk) * la, { rot: -.05 + (1 - clamp(pk)) * .2, zoom: 1 / clamp(pk, .6, 1.2), tone: 'warm', caption: '亨利·卡根', creditY: 760 });
    // 老影像
    const wa = eOut(prog(T, 65.2, 65.9)) * la, ww = 480, wh = 360, wx = 1360, wy = 150;
    if (wa > 0) { ctx.save(); ctx.globalAlpha = wa; drawFilmFrame(ctx, wx, wy, ww, wh, { sprocket: 'tb', r: 4 }); drawFootage(ctx, 's6_win', T, wx, wy, ww, wh, { hi: '#f0dcb8', lo: '#141a3c', vig: .5 });
      txt(ctx, '资料影像 · 1970 年代实验室', wx + ww, wy + wh + 60, { size: 22, font: FONT_T, col: COL.cream, a: .65, align: 'right', track: 2 }); ctx.restore(); }
  }

  // —— 问号的粒子散开，聚成 1986 ——
  const QP = qPoints(), qs = 1.55 * (1 + .07 * eIO(prog(T, 59.5, 63.3))), DP = textPoints('1986', `420px ${FONT_B}`, 7);
  const mv = eIO(prog(T, 62.6, 63.6)), pa = 1 - eIO(prog(T, 63.5, 64.1));
  if (pa > 0) for (let i = 0; i < 120; i++) {
    const q = QP[i % QP.length], d = DP[(i * 7) % DP.length], r = rng(i + 3);
    const x0 = 960 + q[0] * qs, y0 = 420 + q[1] * qs, x1 = 960 + d[0] * 1.32, y1 = 440 + d[1] * 1.32;
    const k = eIO(clamp((mv - r() * .3) / .7)), cx = (x0 + x1) / 2 + (r() - .5) * 500, cy = (y0 + y1) / 2 + (r() - .5) * 300;
    const x = lerp(lerp(x0, cx, k), lerp(cx, x1, k), k), y = lerp(lerp(y0, cy, k), lerp(cy, y1, k), k);
    dot(ctx, x, y, 11 * (1 - .4 * k), true, pa);
  }
  // —— 年份大字 ——
  const sh = eIO(prog(T, 64.75, 65.55));
  const g = { x: lerp(960, 196, sh), y: lerp(440, 92, sh), s: lerp(1, .16, sh) };
  const yOut = 1 - eIO(prog(T, 90.2, 90.9));
  drawYearFoot(ctx, T, '1986', g, prog(T, 63.35, 64.3), yOut, { hi: '#f2d9ae', lo: '#191435' }, 's6_digits');
  txt(ctx, '法国 · 巴黎南大学（奥赛）', lerp(960, 196, sh), lerp(790, 160, sh), { size: lerp(36, 22, sh), font: FONT_T, col: COL.cream, a: eOut(prog(T, 63.9, 64.4)) * .8 * yOut, track: lerp(6, 3, sh) });

  // —— 烧瓶 + 催化剂小手 ——
  const fa = eOut(prog(T, 69.4, 70.2));
  const push = eIn(prog(T, 89.6, 91.6));
  if (fa > 0) {
    ctx.save();
    if (push > 0) { const z = 1 + push * 1.6; ctx.translate(S6.FX, S6.FY); ctx.scale(z, z); ctx.translate(-S6.FX, -S6.FY); }
    const fy = S6.FY + (1 - fa) * 200;
    const c = imgPt(...ANCH.flask.c, ...ANCH.flask.c, S6.FX, fy, S6.FS), surf = imgPt(ANCH.flask.surf[0], ANCH.flask.surf[1], ...ANCH.flask.c, S6.FX, fy, S6.FS), R = ANCH.flask.bulbR * S6.FS * .9;
    ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, c[0], c[1], 420, '#b9a8ff', .25 * fa); ctx.restore();
    drawAt(ctx, IMG.flask, ...ANCH.flask.c, S6.FX, fy, S6.FS, 0, fa);
    const ha = eOut(prog(T, PA(14, 0) + .3, PA(14, 0) + 1.2));
    S6H.forEach((h, i) => { const th = h.th + TA * h.sp, rr = h.rr * R * .85, x = c[0] + Math.cos(th) * rr, y = c[1] + 70 + Math.sin(th) * rr * .38;
      const k = eOutBack(clamp((ha * 1.6 - h.d * .6))); if (k <= 0) return;
      const glowRed = h.red ? 1 : 0; drawHandToken(ctx, x, y, .72 * k, h.red, fa * clamp(k), h.rot + Math.sin(TA + i) * .15); });
    // 产物：每只手吐出同色的小分子，往右边的比例条飞
    const em = prog(T, 76.0, 86.5);
    if (em > 0) { const r = rng(7); for (let i = 0; i < 40; i++) { const t0 = r() * .9, ph = clamp((em - t0) / .25); if (ph <= 0 || ph >= 1) continue;
      const red = r() < (T < 81.2 ? .74 : .85), sx = c[0] + (r() - .5) * R, sy = c[1] + 40, tx = 1080 + r() * 500, ty = 470;
      dot(ctx, lerp(sx, tx, eIO(ph)), lerp(sy, ty, eIO(ph)) - Math.sin(ph * Math.PI) * 120, 8, red, Math.sin(ph * Math.PI) * fa); } }
    ctx.restore();
    txt(ctx, '催化剂：“左手” 6 · “右手” 2', S6.FX, 878, { size: 30, font: FONT_T, col: COL.cream, a: ha * (1 - push), track: 3 });
  }
  // —— 右边：比例条 ——
  const bx = 1060, bw = 640, ba1 = eOut(prog(T, PA(14, 1), PA(14, 1) + .5)) * (1 - push);
  if (ba1 > 0) {
    txt(ctx, '瓶里的催化剂', bx, 270, { size: 30, font: FONT_T, col: COL.cream, a: ba1, align: 'left', track: 3 });
    drawRatioBar(ctx, bx, 300, bw, 26, .75, ba1);
    txt(ctx, '红 75%', bx, 352, { size: 26, font: FONT_B, col: COL.redL, a: ba1, align: 'left', track: 2 }); txt(ctx, '25% 蓝', bx + bw, 352, { size: 26, font: FONT_B, col: COL.blueL, a: ba1, align: 'right', track: 2 });
  }
  const ex = eOut(prog(T, PA(15, 0), PA(15, 0) + .5)) * (1 - push), act = eIO(prog(T, PA(16, 1) - .2, PA(16, 2) + .2));
  if (ex > 0) {
    txt(ctx, '做出的产物', bx, 420, { size: 30, font: FONT_T, col: COL.cream, a: ex, align: 'left', track: 3 });
    const pe = lerp(.5, .74, eOut(prog(T, PA(15, 2) - .3, PA(15, 2) + 1.2)));   // 预想：跟着催化剂的比例走
    const pr = lerp(pe, .85, act);
    drawRatioBar(ctx, bx, 450, bw, 26, pr, ex);
    // 预想的位置：虚线刻度
    ctx.save(); ctx.globalAlpha = ex; ctx.strokeStyle = hex(COL.cream, .9); ctx.setLineDash([5, 5]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx + bw * pe, 436); ctx.lineTo(bx + bw * pe, 490); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
    txt(ctx, `预想 约 ${Math.round(pe * 100)}%`, bx + bw * pe, 512, { size: 24, font: FONT_T, col: COL.cream, a: ex * (1 - .4 * act) });
    if (act > 0) { txt(ctx, `实际 约 ${Math.round(pr * 100)}%`, bx + bw * pr, 410, { size: 28, font: FONT_T, col: COL.redL, a: act, glow: .3, glowCol: COL.red });
      // 差距括号
      const gk = eOut(prog(T, PA(16, 2), PA(16, 2) + .5)); if (gk > 0) { ctx.save(); ctx.globalAlpha = gk; ctx.strokeStyle = COL.gold2; ctx.lineWidth = 3; const y = 540, x0 = bx + bw * pe, x1 = bx + bw * pr; ctx.beginPath(); ctx.moveTo(x0, y - 10); ctx.lineTo(x0, y); ctx.lineTo(x1, y); ctx.lineTo(x1, y - 10); ctx.stroke(); ctx.restore();
        txt(ctx, '更强', (bx + bw * pe + bx + bw * pr) / 2, 572, { size: 30, font: FONT_T, col: COL.gold2, a: gk, track: 6 }); } }
  }
  // 曲线图（真实数据）
  const ca = eOut(prog(T, PA(16, 0) - .2, PA(16, 0) + .5)) * (1 - push);
  if (ca > 0) {
    const cx = 1150, cy = 640, cw = 460, ch = 250;
    const map = u => (u - .5) * 2;   // 红色占比 0.5..1 → 图上 0..1
    drawEEChart(ctx, cx, cy, cw, ch, { diag: eOut(prog(T, PA(16, 0), PA(16, 0) + .8)), curve: eIO(prog(T, PA(16, 1), PA(16, 2) + .5)), fn: u => map(kaganFn(.5 + u / 2)), dot: map(.75), dotA: eOut(prog(T, PA(16, 2), PA(16, 2) + .4)) }, ca, TA);
    txt(ctx, 'Kagan 1986 · 香叶醇环氧化（据原文图读取，约值）', cx + cw / 2, cy + ch + 78, { size: 20, font: FONT_T, col: COL.cream, a: ca * .55 });
  }
  // 问号：混着用，怎么还能把差距拉大？
  const qa = eOutBack(prog(T, PA(17, 1) - .1, PA(17, 1) + .4)) * (1 - push);
  if (qa > 0) drawQ(ctx, 1380, 200, 130 * clamp(qa), clamp(qa), TA);
}
