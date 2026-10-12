// s1.js —— 第 1–2 句：放映机亮起，巨大的"1957"里放着老药房影像，月份标尺标出年末 → 一片药落下 →
//          孕妇（插画）和老影像窗口，药片飘到她手边、头边泛起不适的波纹 → 药盒升起，印上 Contergan，标题"反应停"
'use strict';
fuse('s1_digits', 'pharmacy', 0, 9, 0, 1);
fuse('s1_win', 'pregnant', 3.5, 6.6, 0, 1);
const S1 = { DX: 960, DY: 455, DS: 560, RX0: 560, RX1: 1360, RY: 790 };

// 大字年份，字里放老影像。g={x,y,s}，rev 0..1 逐个数字升起
function drawYearDigits(ctx, T, str, g, rev, a, tint) {
  if (a <= 0) return;
  const size = S1.DS * g.s, tr = size * .03;
  ctx.save(); ctx.font = `${size}px ${FONT_B}`;
  const ws = [...str].map(c => ctx.measureText(c).width), tw = ws.reduce((p, q) => p + q, 0) + tr * (str.length - 1);
  const capH = size * .7, x0 = g.x - tw / 2, base = g.y + capH / 2; ctx.restore();
  const xs = []; { let x = x0; ws.forEach(w => { xs.push(x); x += w + tr; }); }
  const dig = (i) => { const k = eOut(clamp(rev * 1.9 - i * .3)); return { k, dy: (1 - k) * capH * .9 }; };
  // 投影
  ctx.save(); ctx.globalAlpha *= a; ctx.font = `${size}px ${FONT_B}`; ctx.textBaseline = 'alphabetic';
  ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = size * .06; ctx.shadowOffsetY = size * .02; ctx.fillStyle = '#0a1028';
  [...str].forEach((c, i) => { const d = dig(i); if (d.k <= 0) return; ctx.save(); ctx.beginPath(); ctx.rect(xs[i] - 20, base - capH - 20, ws[i] + 40, capH + 40); ctx.clip(); ctx.globalAlpha = a * d.k; ctx.fillText(c, xs[i], base + d.dy); ctx.restore(); });
  ctx.restore();
  // 字里的老影像
  const bx = x0 - 10, by = base - capH - 10, bw = tw + 20, bh = capH + 20;
  drawFootage(ctx, 's1_digits', T, bx, by, bw, bh, { a, hi: tint.hi, lo: tint.lo, zoom: 1.05, vig: .35, weave: 1.4,
    mask: (fx, sc) => { fx.font = `${size * sc}px ${FONT_B}`; fx.textBaseline = 'alphabetic'; [...str].forEach((c, i) => { const d = dig(i); if (d.k <= 0) return; fx.save(); fx.beginPath(); fx.rect((xs[i] - bx - 20) * sc, 0, (ws[i] + 40) * sc, bh * sc); fx.clip(); fx.fillText(c, (xs[i] - bx) * sc, (base - by + d.dy) * sc); fx.restore(); }); } });
  // 描边 + 顶部高光
  ctx.save(); ctx.globalAlpha *= a; ctx.font = `${size}px ${FONT_B}`; ctx.textBaseline = 'alphabetic'; ctx.lineWidth = Math.max(1, size * .004); ctx.strokeStyle = hex(COL.cream, .75);
  [...str].forEach((c, i) => { const d = dig(i); if (d.k <= 0) return; ctx.save(); ctx.beginPath(); ctx.rect(xs[i] - 20, base - capH - 20, ws[i] + 40, capH + 40); ctx.clip(); ctx.strokeText(c, xs[i], base + d.dy); ctx.restore(); });
  ctx.restore();
  return { x0, tw, base, capH };
}

function drawS1(ctx, T) {
  // —— 背景：深蓝 + 左上角放映机的暖光 ——
  drawBg(ctx, '#1a2a62', .62, .3);
  resetT(ctx);
  const on = T < .72 ? [.6, .15, 1, .3, .9, .5, 1][Math.floor(T / .11)] || 1 : 1;   // 放映机开灯：闪几下再稳定
  drawBeam(ctx, -60, -40, .55, .32, 1500, .55 * on, TA);
  drawDust(ctx, TA, 0, 0, W, H, '#ffe9c0', .25);
  // 两侧的胶片边（片孔往下走），开场交代"老影像"
  const fsA = eOut(prog(T, -.2, .5)) * (1 - eIO(prog(T, 3.4, 4.1)));
  if (fsA > 0) for (const side of [0, 1]) {
    const bw = 44, x0 = side ? W - bw + (1 - fsA) * bw : -(1 - fsA) * bw;
    ctx.save(); ctx.fillStyle = 'rgba(3,5,12,.88)'; ctx.fillRect(x0, 0, bw, H);
    const off = (TA * 90) % 46; for (let y = -46 + off; y < H + 46; y += 46) { ctx.fillStyle = hex(COL.cream, .2 * fsA); roundRect(ctx, x0 + 12, y, 20, 26, 4); ctx.fill(); }
    ctx.restore();
  }

  const tint = { hi: mixHexH('#f6dcae', '#e9d3b0', 0), lo: '#1b1636' };
  // —— 年份大字：0.45 起升起；3.55 起缩到左上角当角标 ——
  const mv = eIO(prog(T, 3.5, 4.35));
  const g = { x: lerp(S1.DX, 196, mv), y: lerp(S1.DY + 6 * Math.sin(TA * .5), 92, mv), s: lerp(1 + .03 * prog(T, 0, 3.5), .16, mv) };
  const dimD = 1 - .55 * eIO(prog(T, 2.85, 3.3)) * (1 - mv) ;
  const out = 1 - eIO(prog(T, 8.2, 8.7));
  drawYearDigits(ctx, T, '1957', g, prog(T, .12, 1.15), dimD * out, tint);
  if (mv > .6) txt(ctx, '联邦德国', 196, 160, { size: 22, font: FONT_T, col: COL.cream, a: eOut(prog(T, 4.1, 4.6)) * .75 * out, track: 6 });

  // —— 月份标尺："年末" ——
  const ra = eOut(prog(T, 1.25, 1.95)) * (1 - eIO(prog(T, 3.35, 3.8)));
  if (ra > 0) {
    const x0 = S1.RX0, x1 = S1.RX1, y = S1.RY, gw = (x1 - x0) / 12;
    ctx.save(); ctx.globalAlpha = ra;
    ctx.strokeStyle = hex(COL.cream, .55); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(lerp(x0, x1, eOut(prog(T, 1.25, 1.9))), y); ctx.stroke();
    for (let m = 0; m <= 12; m++) { const k = eOut(prog(T, 1.3 + m * .04, 1.6 + m * .04)); if (k <= 0) continue; const x = x0 + m * gw;
      ctx.strokeStyle = hex(COL.cream, .6 * k); ctx.beginPath(); ctx.moveTo(x, y - 9 * k); ctx.lineTo(x, y + 9 * k); ctx.stroke();
      if (m < 12) txt(ctx, String(m + 1), x + gw / 2, y + 30, { size: 24, font: FONT_B, col: COL.cream, a: .55 * k, shadow: false }); }
    // 年末三个月高亮
    const q = eIO(prog(T, 1.95, 2.45));
    if (q > 0) { const qx = x0 + 9 * gw; ctx.save(); ctx.globalCompositeOperation = 'screen';
      const gr = ctx.createLinearGradient(qx, 0, qx + 3 * gw, 0); gr.addColorStop(0, hex(COL.gold, .65)); gr.addColorStop(1, hex(COL.warm, .3));
      ctx.fillStyle = gr; ctx.fillRect(qx, y - 7, 3 * gw * q, 14); glow(ctx, qx, y, 40, COL.gold, .8 * q); ctx.restore();
      ctx.fillStyle = COL.gold2; ctx.beginPath(); ctx.arc(qx, y, 7 * q, 0, 7); ctx.fill();
      txt(ctx, '10 月 1 日 · 在联邦德国上市', qx + 6, y - 46, { size: 30, font: FONT_T, col: COL.gold2, a: eOut(prog(T, 2.2, 2.6)), align: 'right' }); }
    ctx.restore();
  }

  // —— 老影像窗口（左）——
  const wa = eOut(prog(T, 3.8, 4.5)) * (1 - eIO(prog(T, 5.9, 6.4)));
  if (wa > 0) {
    const ww = 600, wh = 450, wx = 200 - (1 - wa) * 120 - eIO(prog(T, 5.9, 6.4)) * 200, wy = 300;
    ctx.save(); ctx.globalAlpha = wa;
    drawFilmFrame(ctx, wx, wy, ww, wh, { sprocket: 'tb', a: 1, r: 4 });
    drawFootage(ctx, 's1_win', T, wx, wy, ww, wh, { hi: '#f2dcb4', lo: '#1a1838', vig: .5 });
    txt(ctx, '资料影像 · 1950 年代', wx, wy + wh + 64, { size: 24, font: FONT_T, col: COL.cream, a: .6, align: 'left', track: 2 });
    ctx.restore();
  }

  // —— 孕妇（插画，右）——
  const ma = eOut(prog(T, 3.6, 4.6)) * (1 - eIO(prog(T, 5.9, 6.45)));
  const MS = .62, mx = 1360 + (1 - eOut(prog(T, 3.6, 4.6))) * 260 + eIO(prog(T, 5.9, 6.45)) * 220, my = 1110 + Math.sin(TA * .9) * 3;
  if (ma > 0) {
    ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, mx - 40, my - 520, 520, '#3a5bb0', .35 * ma); glow(ctx, mx + 60, my - 620, 260, COL.red, .12 * ma); ctx.restore();
    drawAt(ctx, IMG.mother_f, ...ANCH.mother.c, mx, my, MS, 0, ma);
    const hd = imgPt(...ANCH.mother.head, ...ANCH.mother.c, mx, my, MS);
    drawWobble(ctx, hd[0] - 10, hd[1] - 10, 150, eOut(prog(T, 4.7, 5.2)) * ma, TA, '#aee9ff');
  }
  const glass = imgPt(...ANCH.mother.glass, ...ANCH.mother.c, mx, my, MS);

  // —— 药片：落下 → 停在中间 → 飘到她手边 ——
  const fall = prog(T, 2.72, 3.22), ta = clamp(fall * 4) * (1 - eIO(prog(T, 5.95, 6.3)));
  if (ta > 0) {
    let px = 960, py = lerp(-220, 520, eIn(fall)), sc = .21, rot = lerp(-1.4, -.12, eOut(fall));
    if (fall >= 1) { const b = prog(T, 3.22, 3.6); py = 520 - Math.sin(b * Math.PI) * 26 * (1 - b); }
    const fly = eIO(prog(T, 4.25, 5.15));
    if (fly > 0) { const tx = glass[0] + 135, ty = glass[1] + 6; const cx1 = 1640, cy1 = -260; px = lerp(lerp(960, cx1, fly), lerp(cx1, tx, fly), fly); py = lerp(lerp(520, cy1, fly), lerp(cy1, ty, fly), fly); sc = lerp(.21, .07, fly); rot = lerp(-.12, .3, fly); }
    if (T > 5.15) { py += Math.sin(TA * 2.2) * 3; }
    // 阴影
    if (fly < .5) { ctx.save(); ctx.globalAlpha = ta * .45 * (1 - fly * 2); ctx.fillStyle = '#02040c'; ctx.filter = 'blur(10px)'; ctx.beginPath(); ctx.ellipse(960, 600, 130 * (.6 + .4 * eIn(fall)), 24, 0, 0, 7); ctx.fill(); ctx.restore(); }
    ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, px, py, 260 * sc / .21, '#bfe3ff', .4 * ta); ctx.restore();
    drawAt(ctx, IMG.tablet, ...ANCH.tablet.c, px, py, sc, rot, ta);
    const land = prog(T, 3.2, 3.75); if (land > 0 && land < 1) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.strokeStyle = hex('#dff3ff', .7 * (1 - land)); ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(960, 590, 140 + 260 * eOut(land), 30 + 50 * eOut(land), 0, 0, 7); ctx.stroke(); ctx.restore(); }
    if (T > 2.95) txt(ctx, '一种药', 960, 700, { size: 34, font: FONT_T, col: COL.cream, a: eOut(prog(T, 3.0, 3.4)) * (1 - eIO(prog(T, 3.9, 4.3))), track: 8 });
  }

  // —— 第 2 句：药盒升起，标签印上 Contergan；标题"反应停" ——
  const ba = eOut(prog(T, 6.0, 6.7)), bOut = 1 - eIO(prog(T, 8.3, 8.8));
  if (ba > 0) {
    const BS = .52 + .025 * prog(T, 6.5, 8.8), bx = 960, by = 735 + (1 - ba) * 380 + Math.sin(TA * .8) * 3;
    ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, bx, by - 60, 560, '#ffcf8a', .22 * ba * bOut); ctx.restore();
    ctx.save(); ctx.globalAlpha = ba * bOut * .5; ctx.fillStyle = '#02040c'; ctx.filter = 'blur(18px)'; ctx.beginPath(); ctx.ellipse(bx + 20, by + 230, 360, 40, 0, 0, 7); ctx.fill(); ctx.restore();
    drawAt(ctx, IMG.pillbox, ...ANCH.pillbox.c, bx, by, BS, 0, ba * bOut);
    // 标签：仿射映射到盒子正面
    const [p0, p1, p2] = ANCH.pillbox.label.map(p => imgPt(...p, ...ANCH.pillbox.c, bx, by, BS));
    const la = eOut(prog(T, 6.6, 7.0)) * bOut;
    if (la > 0) {
      ctx.save(); const ux = (p1[0] - p0[0]) / 1000, uy = (p1[1] - p0[1]) / 1000, vx = (p2[0] - p0[0]) / 300, vy = (p2[1] - p0[1]) / 300;
      const m = ctx.getTransform(); ctx.transform(ux, uy, vx, vy, p0[0], p0[1]);
      ctx.globalAlpha = la; ctx.globalCompositeOperation = 'multiply';
      const st = 1 + .25 * (1 - eOut(prog(T, 6.6, 6.9)));
      ctx.translate(500, 120); ctx.scale(st, st);
      ctx.font = `italic 168px ${FONT_HB}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#2b3f7a'; ctx.fillText('Contergan', 0, 0);
      ctx.font = `42px ${FONT_HB}`; ctx.fillStyle = '#9c3a2c'; ctx.fillText('N-Phthalyl-glutaminsäure-imid', 0, 108);
      ctx.font = `34px ${FONT_HB}`; ctx.fillStyle = '#2b3f7a'; ctx.fillText('20 Tabletten', 0, 160);
      ctx.restore();
    }
    // 背后淡淡转动的分子骨架
    const ga = eOut(prog(T, 6.4, 7.2)) * bOut * .33;
    if (ga > 0) { drawMolGhost(ctx, { x: 1560, y: 600, s: 30, R: pose(TA * .35, .5 + .1 * Math.sin(TA * .3), .2), a: ga * .8 }, COL.gold); drawMolGhost(ctx, { x: 360, y: 640, s: 26, R: pose(-TA * .3 + 2, -.4, .5), a: ga * .5 }, COL.cream); }
    // 标题
    const ti = prog(T, 6.35, 7.0);
    txtReveal(ctx, '反应停', 960, 228, ti, { size: 128, font: FONT_H, col: COL.cream, a: bOut, track: 26, glow: .45, glowCol: COL.gold });
    txt(ctx, 'THALIDOMIDE  ·  沙利度胺', 960, 334, { size: 40, font: FONT_B, col: COL.gold2, a: eOut(prog(T, 6.85, 7.3)) * bOut, track: 7 });
    txt(ctx, '1957 年 10 月在联邦德国上市的非处方安眠镇静药', 960, 384, { size: 28, font: FONT_T, col: COL.cream, a: eOut(prog(T, 7.2, 7.7)) * bOut * .78, track: 2 });
    // 标题扫光
    const sw = prog(T, 7.1, 7.9); if (sw > 0 && sw < 1) { ctx.save(); ctx.globalCompositeOperation = 'screen'; const gx = lerp(700, 1220, sw); const gr = ctx.createLinearGradient(gx - 80, 0, gx + 80, 0); gr.addColorStop(0, 'rgba(255,230,170,0)'); gr.addColorStop(.5, 'rgba(255,240,200,.35)'); gr.addColorStop(1, 'rgba(255,230,170,0)'); ctx.fillStyle = gr; ctx.fillRect(gx - 80, 150, 160, 160); ctx.restore(); }
  }
}
const mixHexH = (a, b, k) => rgb2hexS(mixHex(a, b, k));
function rgb2hexS(c) { const m = c.match(/\d+/g); return '#' + m.slice(0, 3).map(v => (+v).toString(16).padStart(2, '0')).join(''); }
