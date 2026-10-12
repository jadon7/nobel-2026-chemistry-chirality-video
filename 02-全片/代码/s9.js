// s9.js —— 第 26–30 句：生产线上一台台造出同款小机器人；一台走下生产线、转身走到压机旁一起干活 →
//          停机、红灯："起初没有走通" → 1990 重启：新造出的机器人红蓝混杂，催化剂红 93% → 新产物红约 68%（Soai 1990：86% ee → 35% ee）→
//          机器越造越多，红色占比并没有变高
'use strict';
fuse('s9_line', 'assembly', 135.4, 144.2, 0, 1);
const S9 = { CX: 960, CY: 840, CS: .95, V: 150, PD: 1.15, RS: .15, FLOOR: 872 };
S9.belt = (() => { const [x0, by, x1] = ANCH.conveyor.belt; return { x0: S9.CX + (x0 - 768) * S9.CS, x1: S9.CX + (x1 - 768) * S9.CS, y: S9.CY + (by - 760) * S9.CS }; })();
S9.press = [S9.CX + (ANCH.conveyor.press[0] - 768) * S9.CS, S9.CY + (ANCH.conveyor.press[1] - 760) * S9.CS];
// 皮带速度：第 27 句停机，1990 年重启
function s9Speed(t) { return 1 - eIO(prog(t, 143.7, 144.5)) + eIO(prog(t, 148.4, 149.3)); }
const S9BT = (() => { const a = [], dt = .02; let bt = 0; for (let t = 130; t <= 175; t += dt) { a.push(bt); bt += s9Speed(t) * dt; } return { a, t0: 130, dt }; })();
function s9BT(T) { const f = (T - S9BT.t0) / S9BT.dt, i = clamp(Math.floor(f), 0, S9BT.a.length - 2); return lerp(S9BT.a[i], S9BT.a[i + 1], f - i); }
function s9TimeOfBT(bt) { const a = S9BT.a; let lo = 0, hi = a.length - 1; if (bt <= a[0]) return S9BT.t0; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (a[m] < bt) lo = m; else hi = m; } return S9BT.t0 + hi * S9BT.dt; }
// 每台机器人：出生（皮带时间 k·PD）、颜色、是否下线当帮手
const S9R = (() => {
  const L = S9.belt.x1 - S9.press[0], rides = L / S9.V, list = [];
  for (let k = 0; k < 40; k++) { const born = s9TimeOfBT(k * S9.PD), arrive = s9TimeOfBT(k * S9.PD + rides);
    const red = born < 149.0 ? true : hash1(k * 3.7 + 1) < .675; list.push({ k, born, arrive, red }); }
  // 帮手：第 26 句一台（落地后转身走到压机旁），第 29 句两台
  const pick = (a, b, n) => list.filter(r => r.arrive > a && r.arrive < b).slice(0, n);
  const h1 = pick(137.3, 138.6, 1), h2 = pick(151.0, 154.5, 2);
  h1.forEach(r => { r.helper = { slot: [S9.press[0] + 210, S9.FLOOR], face: -1 }; });
  h2.forEach((r, i) => { r.helper = { slot: [S9.press[0] + 360 + i * 150, S9.FLOOR + 8], face: -1 }; });
  return list;
})();
function drawS9(ctx, T) {
  const stop = eIO(prog(T, 143.8, 144.4)) * (1 - eIO(prog(T, 148.3, 149.0)));
  drawBg(ctx, stop > .5 ? '#1c2244' : '#16305e', .55, .3);
  resetT(ctx); drawDust(ctx, TA, 0, 0, W, H, '#ffe7c0', .18);
  // 地面
  const fg = ctx.createLinearGradient(0, S9.FLOOR - 40, 0, H); fg.addColorStop(0, 'rgba(10,18,44,0)'); fg.addColorStop(1, 'rgba(10,18,44,.85)'); ctx.fillStyle = fg; ctx.fillRect(0, S9.FLOOR - 40, W, H);
  const bt = s9BT(T);
  // 老影像：真实的流水线（第 26 句）
  const wa = eOut(prog(T, 136.0, 136.8)) * (1 - eIO(prog(T, 142.6, 143.4)));
  if (wa > 0) { const ww = 440, wh = 330, wx = 110, wy = 90; ctx.save(); ctx.globalAlpha = wa; drawFilmFrame(ctx, wx, wy, ww, wh, { sprocket: 'tb', r: 4 }); drawFootage(ctx, 's9_line', T, wx, wy, ww, wh, { hi: '#f0dcb8', lo: '#131a3c', vig: .5 });
    txt(ctx, '资料影像 · 流水线', wx, wy + wh + 58, { size: 22, font: FONT_T, col: COL.cream, a: .6, align: 'left', track: 2 }); ctx.restore(); }
  // 灯色：正常绿、停机红闪、1990 重启琥珀→绿
  const blink = stop > .5 ? (Math.sin(TA * 9) > 0 ? 1 : .25) : 1;
  const lampCol = stop > .5 ? '#ff4a3a' : (T > 148 && T < 149.5 ? '#ffb340' : '#5dffa8');
  const enter = eOut(prog(T, 135.4, 136.4));
  ctx.save(); ctx.globalAlpha = enter; if (stop > 0) ctx.filter = `saturate(${1 - .6 * stop})`;
  drawConveyor(ctx, S9.CX, S9.CY + (1 - enter) * 120, S9.CS, bt * S9.V, 1, { lamp: lampCol, lampK: blink * .9 });
  ctx.restore();
  // 原料小箱子从左边送进压机
  for (let k = 0; k < 6; k++) { const x = S9.belt.x0 + 50 + ((bt * S9.V + k * 120) % (S9.press[0] - S9.belt.x0 - 110)); ctx.save(); ctx.globalAlpha = enter * .85 * (stop > .5 ? .6 : 1); ctx.fillStyle = '#7d89ab'; roundRect(ctx, x - 20, S9.belt.y - 30, 40, 30, 5); ctx.fill(); ctx.strokeStyle = 'rgba(220,230,255,.45)'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore(); }
  // 压机一下一下压（每 PD 一次），压下时火花
  const phase = ((bt % S9.PD) + S9.PD) % S9.PD / S9.PD, hit = Math.max(0, 1 - phase / .18);
  if (hit > 0 && stop < .5) { ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, S9.press[0], S9.belt.y - 20, 120, '#fff0c0', .6 * hit); ctx.restore(); drawBurst(ctx, S9.press[0], S9.belt.y - 30, 1 - hit, 10, COL.gold2, Math.floor(bt / S9.PD), 140); }
  // 机器人
  let count = 0, redOnBelt = 0, onBelt = 0;
  const desat = stop > 0 ? `saturate(${1 - .75 * stop}) brightness(${1 - .25 * stop})` : null;
  const want = eOut(prog(T, PA(30, 1), PA(30, 1) + .5)) * (1 - eIO(prog(T, 165.6, 166.4)));
  for (const r of S9R) {
    if (r.born > T) continue;
    if (r.born > 135.9) count++;
    const age = bt - r.k * S9.PD, x = S9.press[0] + age * S9.V;
    const emerge = eOutBack(clamp(age / .35));
    let rx = x, ry = S9.belt.y, sc = S9.RS * emerge, face = 1, walk = (stop < .5 && age > .35) ? 0 : 0, a = 1;
    if (r.helper && T > r.arrive) {
      const h = r.helper, tt = T - r.arrive, hop = clamp(tt / .6), turn = clamp((tt - .7) / .4), wk = clamp((tt - 1.1) / 1.1);
      const fx = S9.belt.x1 + 90, fy = h.slot[1];
      rx = lerp(S9.belt.x1, fx, hop); ry = lerp(S9.belt.y, fy, eIn(hop)) - Math.sin(hop * Math.PI) * 90; sc = lerp(S9.RS, S9.RS * 1.3, hop);
      face = turn < .5 ? 1 : -1; if (turn > 0 && turn < 1) sc *= Math.abs(Math.cos(turn * Math.PI)) * .9 + .1;
      if (wk > 0) { rx = lerp(fx, h.slot[0], eIO(wk)); walk = wk < 1 ? tt * 2.2 : 0; }
      const work = tt > 2.3 ? Math.sin(TA * 6) * .5 + .5 : 0;
      drawRobot(ctx, rx, ry, sc, r.red, face, walk, a, { filter: desat, glow: .25 });
      if (work > 0 && stop < .5) drawBurst(ctx, rx - 70, ry - 150, (TA * 1.5) % 1, 5, COL.gold2, Math.floor(TA * 1.5) + r.k, 60);
      if (want > 0 && r.red) { ctx.save(); ctx.globalAlpha = want; ctx.strokeStyle = COL.gold2; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(rx, ry - 120 * sc / .15, 70 * sc / .15, 130 * sc / .15, 0, 0, 7); ctx.stroke(); ctx.restore(); }
      continue;
    }
    if (x > S9.belt.x1) { const over = (x - S9.belt.x1) / S9.V; rx = x; ry = S9.belt.y + 400 * over * over; a = 1 - clamp(over / .6); if (a <= 0) continue; }
    else { onBelt++; if (r.red) redOnBelt++; }
    drawRobot(ctx, rx, ry, sc, r.red, face, 0, a * clamp(age / .1), { filter: desat });
    if (want > 0 && r.red && x < S9.belt.x1) { ctx.save(); ctx.globalAlpha = want; ctx.strokeStyle = COL.gold2; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(rx, ry - 95, 70, 112, 0, 0, 7); ctx.stroke(); ctx.restore(); }
  }
  // 压机头盖在新出生的机器人上面一点
  // —— 文字和数据 ——
  const ca = eOut(prog(T, PA(26, 2) - .2, PA(26, 2) + .3)) * (1 - eIO(prog(T, 143.4, 144.0)));
  txt(ctx, `同款机器 ×${Math.max(1, count)}`, 1700, 200, { size: 44, font: FONT_B, col: COL.redL, a: ca, align: 'right', track: 3, glow: .3, glowCol: COL.red });
  // 第 27 句：停机
  const xa = eOutBack(prog(T, PA(27, 0) + .3, PA(27, 0) + .8)) * (1 - eIO(prog(T, 148.2, 148.9)));
  if (xa > 0) { drawMark(ctx, 1480, 240, 70 * clamp(xa, 0, 1.2), false, clamp(xa)); txt(ctx, '起初没有走通', 1480, 350, { size: 40, font: FONT_T, col: '#ff9a8a', a: clamp(xa), track: 8 }); }
  // 第 28 句：1990
  const ya = eOut(prog(T, PA(28, 0) - .2, PA(28, 0) + .3)) * (1 - eIO(prog(T, 166.0, 166.8)));
  if (ya > 0) { drawFlipYear(ctx, 220, 110, 1990, 1990, 1, ya, { size: 86, col: COL.cream });
    if (PIMG.soai90 || PIMG.soai) drawPhoto(ctx, PIMG.soai90 ? 'soai90' : 'soai', 470, 128, 104, 104, ya, { shape: 'circle', ring: 2.5, credit: false });
    txt(ctx, '第一个不对称自催化反应', 120, 190, { size: 28, font: FONT_T, col: COL.gold2, a: eOut(prog(T, PA(28, 1), PA(28, 1) + .5)) * ya, align: 'left', track: 3 }); }
  // 第 29 句：比例 93% → 约 68%
  const ba = eOut(prog(T, PA(29, 1) - .2, PA(29, 1) + .4)) * (1 - eIO(prog(T, 165.8, 166.6)));
  if (ba > 0) {
    const bx = 1180, bw = 560;
    txt(ctx, '帮忙的分子（催化剂）', bx, 120, { size: 26, font: FONT_T, col: COL.cream, a: ba, align: 'left', track: 2 });
    drawRatioBar(ctx, bx, 140, bw, 20, .93, ba); txt(ctx, '红 93%', bx + bw + 14, 150, { size: 26, font: FONT_B, col: COL.redL, a: ba, align: 'left' });
    const nk = eIO(prog(T, PA(29, 2) - .3, PA(29, 2) + .9)), np = lerp(.93, .675, nk);
    txt(ctx, '新做出的分子', bx, 210, { size: 26, font: FONT_T, col: COL.cream, a: ba, align: 'left', track: 2 });
    drawRatioBar(ctx, bx, 230, bw, 20, np, ba); txt(ctx, `红 ${Math.round(np * 100)}%`, bx + bw + 14, 240, { size: 26, font: FONT_B, col: COL.redL, a: ba, align: 'left' });
    const gk = eOut(prog(T, PA(29, 2) + .5, PA(29, 2) + 1.0));
    if (gk > 0) { txt(ctx, '差距反而变小', bx + bw * .8, 290, { size: 28, font: FONT_T, col: '#ff9a8a', a: gk, track: 4 }); }
    txt(ctx, '1990 年：86% ee → 35% ee', bx, 330, { size: 20, font: FONT_T, col: COL.cream, a: ba * .5, align: 'left' });
  }
  // 第 30 句：数量越来越多，占比没变高
  const qa = eOut(prog(T, PA(30, 0), PA(30, 0) + .4)) * (1 - eIO(prog(T, 165.8, 166.6)));
  if (qa > 0) { const n = Math.pow(2, Math.min(4, Math.floor((T - PA(30, 0)) / .55) + 1));
    txt(ctx, `数量 ×${n}`, 560, 260, { size: 56, font: FONT_B, col: COL.gold2, a: qa, track: 4, glow: .3 });
    txt(ctx, '想要的那一款（红）', 560, 330, { size: 28, font: FONT_T, col: COL.gold2, a: want, track: 2 });
    txt(ctx, '占比没有变高', 560, 372, { size: 28, font: FONT_T, col: '#ff9a8a', a: eOut(prog(T, PA(30, 2), PA(30, 2) + .4)), track: 4 }); }
}
