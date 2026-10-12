// s8.js —— 第 24–25 句：硤合宪三的名卡 → 反应示意"原料 → 产物"，上面一颗催化剂 → "又多了一步"：一根回环箭头从产物指回催化剂 →
//          刚做出来的分子（硤合反应的真实产物结构）沿回环回到催化剂的位置 → 1 → 2 → 4 → 8 → 16 的分叉树
'use strict';
fuse('s8_drip', 'drip', 126.3, 132.0, 0, .68);
fuse('s8_kantei', 'kantei', 123.7, 126.6, 2.0, 1);
const S8 = { AX0: 560, AX1: 1180, AY: 560, CAT: [870, 360], PROD: [1400, 560] };
function drawSoaiCard(ctx, x, y, a, T) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  const R = 62; const g = ctx.createRadialGradient(x - R * .3, y - R * .3, R * .1, x, y, R); g.addColorStop(0, '#1c2c66'); g.addColorStop(1, '#0a1230'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, R, 0, 7); ctx.fill();
  ctx.strokeStyle = hex(COL.gold, .95); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(x, y, R, 0, 7); ctx.stroke();
  if (PIMG.soai) { ctx.restore(); drawPhoto(ctx, 'soai', x, y, R * 2 - 4, R * 2 - 4, a, { shape: 'circle', ring: 2.5, credit: false }); ctx.save(); }
  else drawIconLoop(ctx, x, y, R * 1.05, 1, TA);
  ctx.restore();
  txt(ctx, '硤合宪三', x + 90, y - 16, { size: 44, font: FONT_H, col: COL.cream, a, align: 'left', track: 6 });
  txt(ctx, 'KENSO SOAI · 东京理科大学', x + 92, y + 30, { size: 26, font: FONT_B, col: COL.gold2, a: a * .9, align: 'left', track: 3 });
}
function drawS8(ctx, T) {
  drawBg(ctx, '#11305e', .55, .35);
  resetT(ctx); drawDust(ctx, TA, 0, 0, W, H, '#bfe0ff', .2);
  const out = 1 - eIO(prog(T, 135.0, 135.9));
  const hasSP = !!PIMG.soai, shrink = eIO(prog(T, 125.7, 126.5));
  // 获奖当晚：首相官邸的祝贺电话（老影像同一套处理）+ 硤合的官方肖像
  const ka = eOut(prog(T, 123.8, 124.4)) * (1 - eIO(prog(T, 125.6, 126.2))) * out;
  if (ka > 0 && FOOT.kantei) { const vw = 760, vh = 428, vx = 150, vy = 240;
    ctx.save(); ctx.globalAlpha = ka; drawFilmFrame(ctx, vx, vy, vw, vh, { r: 6 }); drawFootage(ctx, 's8_kantei', T, vx, vy, vw, vh, { hi: '#f2e2c2', lo: '#111a3c', vig: .35, dirt: .2, weave: .4 });
    txt(ctx, '2026 年 10 月 7 日晚 · 日本首相打电话祝贺硤合宪三', vx, vy - 34, { size: 28, font: FONT_T, col: COL.gold2, align: 'left', track: 2 });
    txt(ctx, '出典：首相官邸ホームページ「ノーベル化学賞についての東京理科大学硤合名誉教授へのお祝いの電話」を加工して作成', vx, vy + vh + 28, { size: 15, font: FONT_T, col: COL.cream, a: .55, align: 'left' }); ctx.restore(); }
  if (hasSP && T < 126.6) { const a = eOut(prog(T, 123.9, 124.6)) * out;
    const x = lerp(1360, 150, shrink), y = lerp(470, 120, shrink), w = lerp(340, 124, shrink), h = lerp(420, 124, shrink);
    if (shrink < 1) drawPhoto(ctx, 'soai', x, y, w, h, a, { shape: shrink > .5 ? 'circle' : 'rect', rot: lerp(.03, 0, shrink), caption: shrink < .3 ? '硤合宪三' : null, credit: shrink < .3, creditY: y + h / 2 + 84 }); }
  drawSoaiCard(ctx, 150, 120, (hasSP ? eOut(prog(T, 126.1, 126.6)) : eOut(prog(T, 124.4, 125.3))) * out, T);
  // —— 反应示意 ——
  const RA0 = Math.max(PA(24, 0), 126.2), ra = eOut(prog(T, RA0, RA0 + .7)) * out * (1 - eIO(prog(T, PA(25, 2) - .2, PA(25, 2) + .4)));
  if (ra > 0) {
    // 原料：一团灰白小球
    const r = rng(24); for (let i = 0; i < 26; i++) { const x = 380 + (r() - .5) * 220 + Math.sin(TA + i) * 7, y = S8.AY + (r() - .5) * 170 + Math.cos(TA * .8 + i) * 7, rr = 10 + r() * 6; ctx.save(); ctx.globalAlpha = ra * .9; ctx.drawImage(sphereSprite('#cfd6e6'), x - rr, y - rr, rr * 2, rr * 2); ctx.restore(); }
    txt(ctx, '原料', 380, S8.AY + 150, { size: 30, font: FONT_T, col: COL.cream, a: ra * .8, track: 6 });
    drawArrow(ctx, S8.AX0, S8.AY, S8.AX1, S8.AY, 0, hex(COL.cream, .85), ra, 6, eOut(prog(T, RA0 + .2, RA0 + .9)));
    // 催化剂（一颗红球）
    const ck = eOutBack(prog(T, RA0 + .4, RA0 + .9));
    drawCatBall(ctx, S8.CAT[0], S8.CAT[1], 42 * ck, true, ra, 1);
    drawFlow(ctx, [[S8.AX0, S8.AY], [S8.AX1, S8.AY]], TA, '#ffffff', ra * clamp(ck), 3, .5, 0, 7);
    txt(ctx, '催化剂', S8.CAT[0], S8.CAT[1] - 82, { size: 26, font: FONT_T, col: COL.cream, a: ra * clamp(ck) * .8, track: 4 });
    // 产物（真实结构）
    const pk = eOut(prog(T, RA0 + .6, RA0 + 1.1));
    if (pk > 0) { const R0 = pose(TA * .5, .4, .2); drawMol(ctx, { mol: MSOAI03, x: S8.PROD[0], y: S8.PROD[1], s: 36, R: R0, a: ra * pk, bond: COL.red, bondW: 1.3, rim: [COL.red, .9], glow: COL.red, glowA: .8 });
      txt(ctx, '产物', S8.PROD[0], S8.PROD[1] + 175, { size: 30, font: FONT_T, col: COL.redL, a: ra * pk * .9, track: 6 }); }
    // 又多了一步：回环箭头
    const lk = eIO(prog(T, PA(24, 1) - .1, PA(24, 1) + .9));
    if (lk > 0) { drawArrow(ctx, S8.PROD[0] - 20, S8.PROD[1] - 110, S8.CAT[0] + 50, S8.CAT[1] - 20, .45, COL.gold2, ra, 5, lk);
      txt(ctx, '+ 1 步：产物回头当催化剂', 1160, 190, { size: 36, font: FONT_T, col: COL.gold2, a: ra * eOut(prog(T, PA(24, 1) + .5, PA(24, 1) + 1.0)), track: 3, glow: .3 }); }
    // 刚做出来的分子沿回环跑回去
    const back = eIO(prog(T, PA(25, 1) - .1, PA(25, 1) + 1.3));
    if (T > PA(25, 0) - .2 && back < 1) {
      const pop = eOutBack(prog(T, PA(25, 0) - .2, PA(25, 0) + .4));
      const ax0 = S8.PROD[0] - 20, ay0 = S8.PROD[1] - 110, ax1 = S8.CAT[0] + 50, ay1 = S8.CAT[1] - 20, pts = qpts(ax0, ay0, (ax0 + ax1) / 2 - (ay1 - ay0) * .45, (ay0 + ay1) / 2 + (ax1 - ax0) * .45, ax1, ay1, 40);
      const f = back * (pts.length - 1), i0 = Math.floor(f), p0 = pts[i0], p1 = pts[Math.min(pts.length - 1, i0 + 1)], x = lerp(p0[0], p1[0], f - i0), y = lerp(p0[1], p1[1], f - i0);
      ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, x, y, 80, COL.red, .7); ctx.restore();
      drawMol(ctx, { mol: MSOAI03, x, y, s: 22 * pop, R: pose(TA * 1.5, .3, .1), a: 1, bond: COL.red, rim: [COL.red, 1] });
    }
    if (back >= 1) { const fl = prog(T, PA(25, 1) + 1.2, PA(25, 1) + 1.8); if (fl < 1) drawBurst(ctx, S8.CAT[0], S8.CAT[1], fl, 18, COL.gold2, 5, 160); }
  }
  // 老影像：反应（滴液）
  const fw = eOut(prog(T, 126.5, 127.1)) * (1 - eIO(prog(T, 131.0, 131.7)));
  if (fw > 0) { const ww = 340, wh = 255, wx = 1540, wy = 100; ctx.save(); ctx.globalAlpha = fw; drawFilmFrame(ctx, wx, wy, ww, wh, { sprocket: 'tb', r: 4 }); drawFootage(ctx, 's8_drip', T, wx, wy, ww, wh, { hi: '#f0dcb8', lo: '#131a3c', vig: .5 });
    txt(ctx, '资料影像 · 1973', wx + ww, wy + wh + 50, { size: 22, font: FONT_T, col: COL.cream, a: .6, align: 'right', track: 2 }); ctx.restore(); }
  // —— 分叉树：1 → 2 → 4 → 8 → 16 ——
  const tg = prog(T, PA(25, 2) - .1, PA(25, 2) + 2.6);
  if (tg > 0) {
    const gens = 5, x0 = 330, x1 = 1600, yc = 590, H0 = 280;
    const nodes = [[{ x: x0, y: yc }]];
    for (let g2 = 1; g2 < gens; g2++) { const prev = nodes[g2 - 1], cur = []; const dy = H0 / Math.pow(2, g2) ; prev.forEach(n => { cur.push({ x: lerp(x0, x1, g2 / (gens - 1)), y: n.y - dy, p: n }); cur.push({ x: lerp(x0, x1, g2 / (gens - 1)), y: n.y + dy, p: n }); }); nodes.push(cur); }
    nodes.forEach((gen, g2) => { const k = eOut(clamp(tg * gens - g2)); if (k <= 0) return;
      const fl = clamp(tg * gens - g2) < 1 ? 1 - clamp(tg * gens - g2) : 0;
      gen.forEach((n, j) => { if (n.p) { const pts = [[n.p.x, n.p.y], [lerp(n.p.x, n.x, k), lerp(n.p.y, n.y, k)]]; ctx.save(); ctx.globalAlpha = out; drawThread(ctx, pts, 1, COL.red, 2.2, .75, false); ctx.restore();
          if (k >= 1) drawFlow(ctx, [[n.p.x, n.p.y], [n.x, n.y]], TA, COL.redL, out * .8, 1, .7, j * .13 + g2, 5); }
        const x = lerp(n.p ? n.p.x : n.x, n.x, k), y = lerp(n.p ? n.p.y : n.y, n.y, k), r = (26 - g2 * 4) * eOutBack(k);
        ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, x, y, r * 3.2, COL.red, (.35 + .5 * fl) * out); ctx.restore();
        dot(ctx, x, y, r, true, out); });
      txt(ctx, `×${Math.pow(2, g2)}`, lerp(x0, x1, g2 / (gens - 1)), 250, { size: 44, font: FONT_B, col: COL.gold2, a: k * out, track: 2, glow: .3 }); });
    txt(ctx, '生成更多和自己一样的分子', 960, 190, { size: 30, font: FONT_T, col: COL.redL, a: eOut(prog(T, PA(25, 2) + .4, PA(25, 2) + .9)) * out, track: 4 });
  }
}
