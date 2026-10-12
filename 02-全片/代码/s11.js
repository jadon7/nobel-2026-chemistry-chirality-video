// s11.js —— 第 34–40 句（2003 年实验：Sato, Soai 等, Angew. Chem. Int. Ed. 2003）：
//          放大镜一层层放大起点的分界线，怎么放大都看不出差别 → 论文（老影像）+ 2003 → 两个镜像分子"几乎各占一半"→
//          读数滚到 50.000025% : 49.999975% → 仪器读数 50.0 : 50.0（分辨不出来）→ 三个烧瓶接力：78.5% → 99.5% → 超过 99.75% →
//          两个圆饼：起点几乎一样大，终点几乎全红
'use strict';
fuse('s11_journal', 'journal_ft', 192.6, 204.2, 0, 1);
fuse('s11_rec', 'recorder', 203.4, 208.0, 0, .6);
const S11F = [[420, 640], [960, 640], [1500, 640]], S11P = [.785, .995, .9975];
const S11FP = (() => { const r = rng(2003), a = []; for (let i = 0; i < 46; i++) a.push({ r: Math.sqrt(r()) * .88, th: r() * 6.28, sp: (.2 + r() * .3) * (r() < .5 ? 1 : -1), u: (i + r()) / 46, s: .8 + r() * .4 }); return a; })();
function drawMagLens(ctx, x, y, R, a, inner) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, R, 0, 7); ctx.clip(); inner(); ctx.restore();
  if (IMG.magnifier && IMG.magnifier.width > 10) { const s = R / ANCH.magnifier.r; drawAt(ctx, IMG.magnifier, ...ANCH.magnifier.lens, x, y, s, 0); }
  else { ctx.strokeStyle = '#c9a25a'; ctx.lineWidth = R * .1; ctx.beginPath(); ctx.arc(x, y, R * 1.04, 0, 7); ctx.stroke(); ctx.lineWidth = R * .18; ctx.lineCap = 'round'; ctx.strokeStyle = '#6b4a2a'; ctx.beginPath(); ctx.moveTo(x + R * .8, y + R * .8); ctx.lineTo(x + R * 1.7, y + R * 1.7); ctx.stroke(); }
  ctx.save(); ctx.globalCompositeOperation = 'screen'; const g = ctx.createRadialGradient(x - R * .4, y - R * .4, 0, x, y, R); g.addColorStop(0, 'rgba(220,245,255,.18)'); g.addColorStop(1, 'rgba(220,245,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, R, 0, 7); ctx.fill(); ctx.restore();
  ctx.restore();
}
function drawFlaskMix(ctx, x, y, s, p, a, T, seed = 0) {
  if (a <= 0) return;
  const c = imgPt(...ANCH.flask.c, ...ANCH.flask.c, x, y, s), surf = imgPt(ANCH.flask.surf[0], ANCH.flask.surf[1], ...ANCH.flask.c, x, y, s), R = ANCH.flask.bulbR * s * .9;
  ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, c[0], c[1], R * 2.2, p > .9 ? COL.red : '#b9a8ff', .25 * a); ctx.restore();
  drawAt(ctx, IMG.flask, ...ANCH.flask.c, x, y, s, 0, a);
  ctx.save(); ctx.beginPath(); ctx.arc(c[0], c[1], R, 0, 7); ctx.clip(); ctx.beginPath(); ctx.rect(c[0] - R, surf[1] + 6, R * 2, R * 2); ctx.clip();
  S11FP.forEach((m, i) => { const th = m.th + TA * m.sp + seed, rr = m.r * R, px = c[0] + Math.cos(th) * rr, py = c[1] + R * .25 + Math.sin(th) * rr * .55; if (py < surf[1] + 10) return; dot(ctx, px, py, 9 * m.s * s / .4, m.u < p, a); });
  ctx.restore();
  return c;
}
function drawS11(ctx, T) {
  drawBg(ctx, '#132c5c', .5, .35);
  resetT(ctx); drawDust(ctx, TA, 0, 0, W, H, '#bfe0ff', .2);
  // —— 第 34 句：放大镜 ——
  const ba = eOut(prog(T, 188.3, 189.0)) * (1 - eIO(prog(T, PA(35, 0) - .3, PA(35, 0) + .3)));
  if (ba > 0) {
    const bx = 360, bw = 1200, by = 520;
    drawRatioBar(ctx, bx, by, bw, 40, .5, ba);
    txt(ctx, '起点：两种镜像分子', 960, by - 60, { size: 32, font: FONT_T, col: COL.cream, a: ba * .85, track: 4 });
    const ma = eOut(prog(T, PA(34, 1) - .3, PA(34, 1) + .3)) * ba;
    const zoomLv = prog(T, PA(34, 1) + .1, PA(34, 1) + 2.0), lvl = Math.min(3, Math.floor(zoomLv * 4)), lvls = ['×10', '×1,000', '×100,000', '×1,000,000'];
    const mx = 960 + Math.sin(TA * 1.3) * 6, my = by + 20;
    drawMagLens(ctx, mx, my, 170, ma, () => {
      // 镜片里：放大的分界线（怎么放大都在正中间），刻度越来越细
      ctx.fillStyle = COL.red; ctx.fillRect(mx - 200, my - 200, 200, 400); ctx.fillStyle = COL.blue; ctx.fillRect(mx, my - 200, 200, 400);
      ctx.globalAlpha = .3; ctx.fillStyle = ctx.createPattern(GRAIN.stip, 'repeat'); ctx.fillRect(mx - 200, my - 200, 400, 400); ctx.globalAlpha = 1;
      ctx.strokeStyle = 'rgba(255,255,255,.95)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(mx, my - 200); ctx.lineTo(mx, my + 200); ctx.stroke();
      const sub = (zoomLv * 4) % 1; ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 1.5;
      for (let k = -10; k <= 10; k++) { const x = mx + k * 26 * (1 + sub); ctx.beginPath(); ctx.moveTo(x, my + 120); ctx.lineTo(x, my + (k % 5 ? 140 : 160)); ctx.stroke(); }
    });
    if (ma > 0) { const fl = (zoomLv * 4) % 1; txt(ctx, lvls[lvl], mx + 230, my - 150, { size: 54, font: FONT_B, col: COL.gold2, a: ma * (zoomLv > 0 ? 1 : 0), align: 'left', track: 2, glow: .4 });
      if (zoomLv > 0 && fl < .2) { ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, mx, my, 220, '#ffffff', .25 * (1 - fl / .2) * ma); ctx.restore(); }
      txt(ctx, '还是看不出差别？', mx + 230, my - 80, { size: 30, font: FONT_T, col: COL.cream, a: eOut(prog(T, PA(34, 1) + 1.6, PA(34, 1) + 2.1)) * ma, align: 'left', track: 3 }); }
  }
  // —— 第 35 句：论文 · 2003 ——
  const ja = eOut(prog(T, PA(35, 0) - .2, PA(35, 0) + .5)) * (1 - eIO(prog(T, PA(36, 1) - .2, PA(36, 1) + .3)));
  if (ja > 0) {
    const jUp = eIO(prog(T, PA(35, 1) - .2, PA(35, 1) + .5));
    const ww = lerp(620, 380, jUp), wh = ww * .75, wx = lerp(220, 110, jUp), wy = lerp(250, 110, jUp);
    ctx.save(); ctx.globalAlpha = ja; drawFilmFrame(ctx, wx, wy, ww, wh, { sprocket: 'tb', r: 4 }); drawFootage(ctx, 's11_journal', T, wx, wy, ww, wh, { hi: '#f0dcb8', lo: '#131a3c', vig: .45 });
    txt(ctx, '资料影像 · 1963', wx, wy + wh + 54, { size: 20, font: FONT_T, col: COL.cream, a: .55, align: 'left', track: 2 }); ctx.restore();
    if (IMG.journal && IMG.journal.width > 10) drawAt(ctx, IMG.journal, ...ANCH.journal.c, lerp(1270, 1580, jUp), lerp(560, 250, jUp), lerp(.56, .26, jUp), -.05, ja * (1 - .3 * jUp));
    txt(ctx, '2003', lerp(1270, 1580, jUp), lerp(190, 100, jUp), { size: lerp(180, 80, jUp), font: FONT_B, col: COL.gold2, a: ja, track: 6, glow: .4 });
    txt(ctx, 'Sato, Soai 等 · Angew. Chem. Int. Ed. 2003', lerp(1270, 1580, jUp), lerp(860, 400, jUp), { size: lerp(26, 20, jUp), font: FONT_T, col: COL.cream, a: ja * .7 });
  }
  // —— 第 35–36 句：两个镜像分子，几乎各占一半 → 50.000025% : 49.999975% ——
  const pa2 = eOut(prog(T, PA(35, 1) - .1, PA(35, 1) + .6)) * (1 - eIO(prog(T, PA(37, 0) - .5, PA(37, 0) + .1)));
  if (pa2 > 0) {
    const up = eIO(prog(T, PA(36, 1) - .4, PA(36, 1) + .3)), cy = 520, molA = 1 - up;
    const R0 = pose(TA * .4 + .4, .35, .1), R1 = M3.mul(M3.MX, M3.mul(R0, M3.MX)), s = 32;
    ctx.save(); ctx.globalAlpha = pa2 * molA; ctx.strokeStyle = 'rgba(190,235,255,.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(960, cy - 170); ctx.lineTo(960, cy + 170); ctx.stroke(); ctx.restore();
    drawMol(ctx, { mol: MSOAI03, x: 960 - 330, y: cy, s, R: R0, a: pa2 * molA, bond: COL.red, bondW: 1.3, rim: [COL.red, 1], glow: COL.red, glowA: .7 });
    drawMol(ctx, { mol: MSOAI03, x: 960 + 330, y: cy, s, R: R1, mir: true, a: pa2 * molA, bond: COL.blue, bondW: 1.3, rim: [COL.blue, 1], glow: COL.blue, glowA: .7 });
    // 读数：先 50% / 50%，再滚出后面的小数
    const dig = eIO(prog(T, PA(36, 0) + .2, PA(36, 0) + 2.4));
    const fmt = (v, n) => v.toFixed(n);
    const nd = Math.round(dig * 6), lv = 50 + .000025 * (dig >= 1 ? 1 : 0), rv = 50 - .000025 * (dig >= 1 ? 1 : 0);
    const ls = nd === 0 ? '50%' : (dig >= 1 ? '50.000025%' : fmt(50, nd) + '%'), rs = nd === 0 ? '50%' : (dig >= 1 ? '49.999975%' : fmt(50, nd) + '%');
    txt(ctx, ls, lerp(960 - 330, 960 - 300, up), lerp(cy + 210, 150, up), { size: lerp(84, 64, up), font: FONT_B, col: COL.redL, a: pa2, track: 3, glow: .3, glowCol: COL.red });
    txt(ctx, rs, lerp(960 + 330, 960 + 300, up), lerp(cy + 210, 150, up), { size: lerp(84, 64, up), font: FONT_B, col: COL.blueL, a: pa2, track: 3, glow: .3, glowCol: COL.blue });
    txt(ctx, '几乎各占一半', 960, cy - 220, { size: 34, font: FONT_T, col: COL.cream, a: pa2 * (1 - up), track: 8 });
    if (dig >= 1) txt(ctx, '大约 500 万个对 500 万个，只多出几个', 960, lerp(cy + 280, 222, up), { size: 28, font: FONT_T, col: COL.gold2, a: eOut(prog(T, PA(36, 0) + 2.4, PA(36, 0) + 2.9)) * pa2, track: 3 });
  }
  // —— 第 36 句后半：仪器分辨不出来 ——
  const ia = eOut(prog(T, PA(36, 1) - .1, PA(36, 1) + .6)) * (1 - eIO(prog(T, PA(37, 0) - .5, PA(37, 0) + .1)));
  if (ia > 0) {
    const ix = 1060, iy = 660, is = .42;
    drawAt(ctx, IMG.instrument, ...ANCH.instrument.c, ix, iy + (1 - ia) * 80, is, 0, ia);
    const [d0x, d0y, d1x, d1y] = ANCH.instrument.disp, p0 = imgPt(d0x, d0y, ...ANCH.instrument.c, ix, iy + (1 - ia) * 80, is), p1 = imgPt(d1x, d1y, ...ANCH.instrument.c, ix, iy + (1 - ia) * 80, is);
    ctx.save(); ctx.globalAlpha = ia; ctx.fillStyle = '#0a1a10'; ctx.fillRect(p0[0], p0[1], p1[0] - p0[0], p1[1] - p0[1]);
    const blink = Math.sin(TA * 3) > -.6 ? 1 : .6; txt(ctx, '50.0 : 50.0', (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2, { size: 36, font: FONT_B, col: '#7dffb0', a: ia * blink, glow: .6, glowCol: '#3cff90', shadow: false, track: 3 }); ctx.restore();
    // 记录仪老影像
    const ww = 330, wh = 248, wx = 150, wy = 520; ctx.save(); ctx.globalAlpha = ia; drawFilmFrame(ctx, wx, wy, ww, wh, { sprocket: 'tb', r: 4 }); drawFootage(ctx, 's11_rec', T, wx, wy, ww, wh, { hi: '#f0dcb8', lo: '#131a3c', vig: .45 });
    txt(ctx, '资料影像 · 记录仪', wx, wy - 24, { size: 20, font: FONT_T, col: COL.cream, a: .55, align: 'left', track: 2 }); ctx.restore();
    txt(ctx, '常用仪器：看不出差别', ix, 330, { size: 34, font: FONT_T, col: '#9fe8c0', a: eOut(prog(T, PA(36, 1) + .8, PA(36, 1) + 1.3)) * ia, track: 4 });
  }
  // —— 第 37–38 句：三个烧瓶接力 ——
  const fa = eOut(prog(T, PA(37, 0) - .3, PA(37, 0) + .5)) * (1 - eIO(prog(T, PA(39, 0) - .5, PA(39, 0) + .2)));
  if (fa > 0) {
    S11F.forEach(([x, y], k) => {
      const on = k === 0 ? eOut(prog(T, PA(37, 0) - .2, PA(37, 0) + .5)) : eOut(prog(T, PA(37, 1) + (k - 1) * .9, PA(37, 1) + (k - 1) * .9 + .6));
      const tk = [PA(38, 0) + .2, PA(38, 1) + .1, PA(38, 2) + .1][k], p = lerp(.5, S11P[k], eIO(prog(T, tk, tk + .9)));
      const pv = k === 0 ? p : (T < tk ? lerp(.5, S11P[k - 1], 1) : p);
      const c = drawFlaskMix(ctx, x, y + (1 - on) * 60, .4, k === 0 && T < tk ? .500001 : pv, fa * on, T, k);
      txt(ctx, `第 ${k + 1} 轮`, x, 838, { size: 32, font: FONT_T, col: COL.cream, a: fa * on, track: 6 });
      const shown = T > tk ? 1 : 0, label = k === 2 ? '> 99.75%' : String(Math.round(S11P[k] * 1000) / 10) + '%';
      txt(ctx, label, x, 896, { size: 50, font: FONT_B, col: COL.redL, a: fa * on * eOut(prog(T, tk, tk + .5)), track: 3, glow: .35, glowCol: COL.red });
      if (k < 2) { const pk = eIO(prog(T, PA(37, 1) + k * .9 - .2, PA(37, 1) + k * .9 + .6)); if (pk > 0) { const x0 = x + 120, x1 = S11F[k + 1][0] - 120;
        drawArrow(ctx, x0, 470, x1, 470, -.25, hex(COL.gold2, .85), fa, 4, pk);
        const r = rng(k + 9); for (let i = 0; i < 10; i++) { const ph = ((TA * .8 + i / 10) % 1); if (pk < 1) continue; const q = qpts(x0, 470, (x0 + x1) / 2, 470 - (x1 - x0) * .25, x1, 470, 20), f = ph * 20, j = Math.floor(f); const qq = q[Math.min(19, j)];
          dot(ctx, qq[0], qq[1], 6, r() < S11P[k] + .1, fa * Math.sin(ph * Math.PI) * .9); } } }
    });
    txt(ctx, '把产物用来继续反应', 960, 150, { size: 28, font: FONT_T, col: COL.gold2, a: eOut(prog(T, PA(37, 1), PA(37, 1) + .5)) * fa * (1 - eIO(prog(T, PA(38, 0), PA(38, 0) + .4))), track: 4 });
    const big = eOutBack(prog(T, PA(38, 2) + .3, PA(38, 2) + .9));
    if (big > 0) { txt(ctx, '99.75%', 960, 170, { size: 150 * clamp(big, 0, 1.2), font: FONT_B, col: COL.gold2, a: fa * clamp(big), track: 6, glow: .6, glowCol: COL.red }); drawBurst(ctx, 960, 170, prog(T, PA(38, 2) + .3, PA(38, 2) + 1.3), 30, COL.gold2, 38, 520); }
    txt(ctx, '2003 · 三轮：ee ≈0.00005% → 57% → 99% → >99.5%', 960, 262, { size: 22, font: FONT_T, col: COL.cream, a: eOut(prog(T, PA(38, 2), PA(38, 2) + .6)) * fa * .55 });
  }
  // —— 第 39–40 句：两个圆饼 ——
  const pz = eOut(prog(T, PA(39, 0) - .2, PA(39, 0) + .6));
  if (pz > 0) {
    const L = [620, 500], Rr = [1300, 500], r = 240;
    drawPie(ctx, L[0], L[1], r * eOutBack(pz), .5000003, pz);
    txt(ctx, '起点', L[0], L[1] - r - 60, { size: 40, font: FONT_T, col: COL.cream, a: pz, track: 10 });
    txt(ctx, '50.000025% : 49.999975%', L[0], L[1] + r + 56, { size: 28, font: FONT_B, col: COL.cream, a: pz * .8, track: 2 });
    const same = eOut(prog(T, PA(39, 1), PA(39, 1) + .5)) * (1 - eIO(prog(T, PA(40, 0), PA(40, 0) + .4)));
    txt(ctx, '两边几乎一样大', L[0], L[1] + r + 100, { size: 30, font: FONT_T, col: COL.gold2, a: same, track: 4 });
    const ea = eOut(prog(T, PA(40, 0) - .1, PA(40, 0) + .5)), ek = eIO(prog(T, PA(40, 1) - .1, PA(40, 1) + 2.4));
    if (ea > 0) {
      drawArrow(ctx, L[0] + r + 30, L[1], Rr[0] - r - 40, Rr[1], 0, hex(COL.gold2, .8), ea, 4, ea);
      txt(ctx, '三轮', (L[0] + Rr[0]) / 2, L[1] - 40, { size: 28, font: FONT_T, col: COL.gold2, a: ea, track: 6 });
      drawPie(ctx, Rr[0], Rr[1], r * eOutBack(ea), lerp(.5, .9975, ek), ea);
      txt(ctx, '终点', Rr[0], Rr[1] - r - 60, { size: 40, font: FONT_T, col: COL.cream, a: ea, track: 10 });
      txt(ctx, ek >= 1 ? '> 99.75% : < 0.25%' : `${(lerp(.5, .9975, ek) * 100).toFixed(1)}%`, Rr[0], Rr[1] + r + 56, { size: 28, font: FONT_B, col: COL.redL, a: ea, track: 2 });
      const sl = eOut(prog(T, PA(40, 1) + 2.0, PA(40, 1) + 2.6));
      if (sl > 0) { const an = -Math.PI / 2 - .008, sx = Rr[0] + Math.cos(an) * r * .86, sy = Rr[1] + Math.sin(an) * r * .86;
        ctx.save(); ctx.globalAlpha = sl; ctx.strokeStyle = COL.blueL; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(sx, sy, 26, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(sx + 20, sy - 18); ctx.lineTo(sx + 120, sy - 90); ctx.stroke(); ctx.restore();
        txt(ctx, '蓝色只剩一丝', sx + 130, sy - 100, { size: 28, font: FONT_T, col: COL.blueL, a: sl, align: 'left', track: 2 }); }
    }
  }
}
