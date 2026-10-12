// s4.js —— 第 8–9 句：两个分子飞进半透明的人体；身体里的"受体"像一只左手手套：红色（左手型）正好戴进去，
//          蓝色（右手型）戴不进，漂到别处，两处泛起不同颜色的波纹（作用也可能不同）→
//          制药老影像 + 烧瓶里红蓝各半的分子，比例条拉不动，问号升起
'use strict';
fuse('s4_fac', 'factory', 37.4, 40.6, 0, 1);
fuse('s4_chem', 'chemist', 40.25, 44.8, 0, 1);
const S4 = { BX: 1330, BY: 600, BS: .6 };
const S4P = (() => { const r = rng(88), a = []; for (let i = 0; i < 64; i++) a.push({ red: i % 2 === 0, r: Math.sqrt(r()) * .9, th: r() * 6.283, sp: (.25 + r() * .35) * (r() < .5 ? 1 : -1), dz: r(), s: .8 + r() * .5 }); return a; })();

function drawS4(ctx, T) {
  drawBg(ctx, '#132a62', .55, .4);
  resetT(ctx); drawDust(ctx, TA, 0, 0, W, H, '#bfe0ff', .2);
  const R0 = molR0(T), R1 = M3.mul(M3.MX, M3.mul(R0, M3.MX));

  // —— 镜头：第 8 句推近胸口 ——
  const bodyIn = eOut(prog(T, 33.6, 34.5)), bodyOut = eIO(prog(T, 37.5, 38.3));
  const push = eIO(prog(T, PA(8, 1) - .3, PA(8, 1) + .5)) * (1 - bodyOut);
  const heart = imgPt(...ANCH.body.heart, ...ANCH.body.c, S4.BX, S4.BY, S4.BS), gut = imgPt(...ANCH.body.gut, ...ANCH.body.c, S4.BX, S4.BY, S4.BS);
  const rec = [heart[0] - 20, heart[1] + 10];        // 受体（手套）位置
  ctx.save();
  const z = 1 + .55 * push; ctx.translate(lerp(0, 760 - rec[0], push) + rec[0], lerp(0, 540 - rec[1], push) + rec[1]); ctx.scale(z, z); ctx.translate(-rec[0], -rec[1]);

  // 人体
  const ba = bodyIn * (1 - bodyOut);
  if (ba > 0) {
    ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, S4.BX, S4.BY - 100, 600, '#2a6cc8', .25 * ba); ctx.restore();
    drawAt(ctx, IMG.body_f, ...ANCH.body.c, S4.BX + (1 - bodyIn) * 160 + bodyOut * 300, S4.BY, S4.BS, 0, ba * .92);
  }
  // 受体：一只小手套（左手）
  const ga = eOut(prog(T, 34.6, 35.1)) * (1 - bodyOut), fitK = eOut(prog(T, 35.45, 35.8));
  if (ga > 0) {
    const gs = .105 * (1 + .06 * Math.sin(TA * 3) * (1 - fitK));
    ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, rec[0], rec[1], 140, fitK > 0 ? COL.red : '#9fe8ff', (.35 + .4 * fitK) * ga); ctx.restore();
    drawAt(ctx, IMG.glove, ...ANCH.glove.c, rec[0], rec[1], gs, 0, ga * (1 - fitK) * .85);
    drawAt(ctx, IMG.glove_red, ...ANCH.glove.c, rec[0], rec[1], gs, 0, ga * fitK);
    txt(ctx, '身体里的"手套"', rec[0], rec[1] - 115, { size: 26, font: FONT_T, col: '#cfeeff', a: ga * (1 - eIO(prog(T, 36.2, 36.6))), track: 3 });
  }
  // 两个分子：从上一场的位置飞进身体
  const fly = T < 34.0 ? 0 : 1;
  const sR = lerp(28, 15, eIO(prog(T, 33.7, 35.0)));
  const pR = (() => { const k = eIO(prog(T, 33.75, 35.45)); const q = [[760, 400], [1000, 120], [rec[0], rec[1] - 40]]; return [lerp(lerp(q[0][0], q[1][0], k), lerp(q[1][0], q[2][0], k), k), lerp(lerp(q[0][1], q[1][1], k), lerp(q[1][1], q[2][1], k), k)]; })();
  // 蓝色：先去手套 → 弹开 → 漂到下腹
  const pB = (() => { const k1 = eIO(prog(T, 33.75, 35.65)); const q = [[1160, 400], [1500, 160], [rec[0] + 70, rec[1] - 80]];
    let x = lerp(lerp(q[0][0], q[1][0], k1), lerp(q[1][0], q[2][0], k1), k1), y = lerp(lerp(q[0][1], q[1][1], k1), lerp(q[1][1], q[2][1], k1), k1);
    const bo = eOut(prog(T, 35.65, 36.0)); x += bo * 70; y -= bo * 40;
    const k2 = eIO(prog(T, 36.0, 36.7)); x = lerp(x, gut[0] + 10, k2); y = lerp(y, gut[1], k2); return [x, y]; })();
  const ma = (1 - bodyOut);
  if (ma > 0) {
    const tr = (p, col) => { ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, p[0], p[1], sR * 5, col, .45 * ma); ctx.restore(); };
    tr(pR, COL.red); tr(pB, COL.blue);
    drawMol(ctx, { x: pR[0], y: pR[1], s: sR, R: R0, a: ma, bond: COL.red, bondW: 1.5, rim: [COL.red, 1] });
    drawMol(ctx, { x: pB[0], y: pB[1], s: sR, R: R1, mir: true, a: ma, bond: COL.blue, bondW: 1.5, rim: [COL.blue, 1] });
    drawMark(ctx, rec[0] + 70, rec[1] + 70, 20, true, eOut(prog(T, 35.5, 35.8)) * (1 - eIO(prog(T, 36.4, 36.8))));
    drawMark(ctx, rec[0] + 150, rec[1] - 110, 20, false, eOut(prog(T, 35.7, 35.95)) * (1 - eIO(prog(T, 36.3, 36.6))));
    // 两处波纹：作用也可能不同
    const rip = (p, col, t0) => { for (let k = 0; k < 3; k++) { const ph = prog(T, t0 + k * .35, t0 + 1.4 + k * .35); if (ph <= 0 || ph >= 1) continue; ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.strokeStyle = hex(col, .8 * (1 - ph) * ma); ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(p[0], p[1], 30 + ph * 230, 20 + ph * 150, 0, 0, 7); ctx.stroke(); ctx.restore(); } };
    rip(rec, COL.red, 35.6); rip(rec, COL.red, 36.7); rip(gut, COL.blue, 36.55); rip(gut, COL.blue, 37.2);
  }
  ctx.restore();
  // 标签（不跟镜头）
  const la = eOut(prog(T, PA(8, 2), PA(8, 2) + .4)) * (1 - bodyOut);
  if (la > 0) {
    const y0 = 380;
    ctx.save(); ctx.globalAlpha = la;
    [[COL.red, '左手型', '一种作用'], [COL.blue, '右手型', '另一种作用']].forEach(([c, n, e], i) => { const y = y0 + i * 92;
      ctx.drawImage(sphereSprite(c), 230, y - 18, 36, 36);
      txt(ctx, n, 285, y, { size: 38, font: FONT_T, col: c === COL.red ? COL.redL : COL.blueL, align: 'left' });
      txt(ctx, '→  ' + e, 410, y, { size: 38, font: FONT_T, col: COL.cream, align: 'left' }); });
    txt(ctx, '≠', 330, y0 + 46, { size: 46, font: FONT_B, col: COL.gold2, a: eOut(prog(T, PA(8, 2) + .3, PA(8, 2) + .6)) });
    ctx.restore();
  }

  // —— 第 9 句：制药老影像 ——
  const fa = eOut(prog(T, 37.6, 38.4)), fsh = eIO(prog(T, 39.0, 39.8));
  if (fa > 0) {
    const fw = lerp(1180, 820, fsh), fh = fw * .62, fx = lerp(370, 110, fsh) - (1 - fa) * 300, fy = lerp(195, 260, fsh);
    ctx.save(); ctx.globalAlpha = fa;
    drawFilmFrame(ctx, fx, fy, fw, fh, { sprocket: 'tb', r: 4 });
    const cut = prog(T, 40.3, 40.42);
    if (cut < 1) drawFootage(ctx, 's4_fac', T, fx, fy, fw, fh, { hi: '#e9dcc0', lo: '#0d1836', vig: .5, a: 1 });
    if (cut > 0) drawFootage(ctx, 's4_chem', T, fx, fy, fw, fh, { hi: '#e9dcc0', lo: '#0d1836', vig: .5, a: cut, zoom: 1.05 + .05 * prog(T, 40.3, 44.6), px: .45 });
    const fl0 = Math.max(0, 1 - Math.abs(T - 40.36) / .08); if (fl0 > 0) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = `rgba(255,244,220,${.5 * fl0})`; ctx.fillRect(fx, fy, fw, fh); ctx.restore(); }
    txt(ctx, '制药', fx, fy - 70, { size: 40, font: FONT_T, col: COL.cream, align: 'left', track: 8 });
    txt(ctx, T < 40.35 ? '资料影像 · 1965 年药厂包装线' : '资料影像 · 1940 年化学实验室', fx + fw, fy + fh + 64, { size: 22, font: FONT_T, col: COL.cream, a: .55, align: 'right', track: 2 });
    ctx.restore();
  }
  // 烧瓶：红蓝各一半
  const fl = eOut(prog(T, PA(9, 1) - .2, PA(9, 1) + .5));
  if (fl > 0) {
    const FX = 1440, FY = 560 + (1 - fl) * 300, FS = .5;
    const c = imgPt(...ANCH.flask.c, ...ANCH.flask.c, FX, FY, FS), surf = imgPt(ANCH.flask.surf[0], ANCH.flask.surf[1], ...ANCH.flask.c, FX, FY, FS), R = ANCH.flask.bulbR * FS * .92;
    ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, c[0], c[1], 420, '#b9a8ff', .25 * fl); ctx.restore();
    drawAt(ctx, IMG.flask, ...ANCH.flask.c, FX, FY, FS, 0, fl);
    // 液体里的分子
    const want = eIO(prog(T, 40.1, 40.6));
    ctx.save(); ctx.beginPath(); ctx.arc(c[0], c[1], R, 0, 7); ctx.clip(); ctx.beginPath(); ctx.rect(c[0] - R, surf[1] + 6, R * 2, R * 2); ctx.clip();
    for (const p of S4P) { const th = p.th + TA * p.sp, rr = p.r * R, x = c[0] + Math.cos(th) * rr, y = c[1] + 40 + Math.sin(th) * rr * .55; if (y < surf[1] + 14) continue;
      const col = p.red ? COL.red : COL.blue, rs = 11 * p.s * (.75 + .25 * p.dz);
      if (p.red && want > 0) { ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, x, y, rs * 3.2, COL.red, .7 * want); ctx.restore(); }
      ctx.globalAlpha = fl * (p.red ? 1 : 1 - .35 * want); ctx.drawImage(sphereSprite(col), x - rs, y - rs, rs * 2, rs * 2); }
    ctx.restore();
    // 比例条：想往红色那边推，推不动
    const tug = Math.sin(clamp(prog(T, 40.7, 42.2)) * Math.PI * 3) * .09 * (1 - prog(T, 40.7, 42.2)) + .06 * eOut(prog(T, 40.7, 41.0)) * (1 - eIO(prog(T, 41.0, 41.5)));
    const bw = 440, bx = FX - bw / 2, by = 860;
    drawRatioBar(ctx, bx, by, bw, 22, .5 + tug, eOut(prog(T, 39.6, 40.1)));
    const ba2 = eOut(prog(T, 39.7, 40.2));
    txt(ctx, '左手型 50%', bx, by - 30, { size: 30, font: FONT_T, col: COL.redL, a: ba2, align: 'left' });
    txt(ctx, '50% 右手型', bx + bw, by - 30, { size: 30, font: FONT_T, col: COL.blueL, a: ba2, align: 'right' });
    txt(ctx, '我们想要的', bx - 30, 420, { size: 34, font: FONT_T, col: COL.redL, a: want, align: 'right', glow: .3, glowCol: COL.red });
    if (want > 0) { ctx.save(); ctx.globalAlpha = want; ctx.strokeStyle = hex(COL.redL, .8); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx - 20, 440); ctx.quadraticCurveTo(c[0] - R * .6, 470, c[0] - R * .3, surf[1] + 60); ctx.stroke(); ctx.restore(); }
    // 问号
    const qa = eOutBack(prog(T, 41.6, 42.2));
    const qUp = eIO(prog(T, 42.7, 44.4));
    if (qa > 0) drawQ(ctx, lerp(FX + 270, 960, qUp), lerp(260, 200, qUp), 170 * clamp(qa) * (1 + qUp * .5), clamp(qa), TA);
  }
  // 结尾：金光从上面压下来（接诺贝尔奖）
  const gl = eIn(prog(T, 43.2, 44.75));
  if (gl > 0) { resetT(ctx); ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, 960, 200, 1400 * gl, COL.gold, .5 * gl); ctx.restore(); }
}
