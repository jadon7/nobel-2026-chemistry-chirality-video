// s3.js —— 第 5–7 句：药片里飞出原子，拼成沙利度胺分子 → 镜头推近手性碳（"差异"）→ 镜子立起来，
//          对面"走出"它的镜像（原子清单一模一样）→ 左右两只手从下面托住两个分子 → 两边往中间叠：
//          手叠不上（大拇指一左一右，对不上的地方发光），分子按苯环那半边对齐后另一半对不上（红圈）
'use strict';
const S3 = { MX: 960, LX: 600, RX: 1320, MY: 470, S: 60 };
fuse('s3_hands', 'hands_ft', 26.55, 27.95, 0, .95);
// 左手型分子的姿态（右手型永远用 M·R0·M，屏幕上严格镜像）
function molR0(T) { return pose(.62 + .22 * Math.sin(TA * .35), .38 + .06 * Math.sin(TA * .27 + 1), -.1); }
let S3L = null, S3LX = null;
function s3layer() { if (!S3L) { S3L = cv(W * SS, H * SS); S3LX = S3L.getContext('2d'); } S3LX.setTransform(1, 0, 0, 1, 0, 0); S3LX.globalCompositeOperation = 'source-over'; S3LX.globalAlpha = 1; S3LX.clearRect(0, 0, S3L.width, S3L.height); return S3LX; }

function drawMirror(ctx, x, y0, y1, a, T) {
  if (a <= 0) return;
  const k = eOut(a), h = (y1 - y0) * k, yc = (y0 + y1) / 2, ya = yc - h / 2, yb = yc + h / 2;
  ctx.save(); ctx.globalAlpha *= clamp(a * 1.5);
  const g = ctx.createLinearGradient(x - 26, 0, x + 26, 0); g.addColorStop(0, 'rgba(120,200,255,0)'); g.addColorStop(.5, 'rgba(150,215,255,.16)'); g.addColorStop(1, 'rgba(120,200,255,0)');
  ctx.fillStyle = g; ctx.fillRect(x - 26, ya, 52, h);
  ctx.globalCompositeOperation = 'screen';
  ctx.strokeStyle = 'rgba(190,235,255,.85)'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(x, ya); ctx.lineTo(x, yb); ctx.stroke();
  ctx.strokeStyle = 'rgba(190,235,255,.25)'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(x, ya); ctx.lineTo(x, yb); ctx.stroke();
  const sy = ya + ((TA * .35) % 1) * h; glow(ctx, x, sy, 60, '#dff6ff', .5);
  ctx.fillStyle = 'rgba(220,245,255,.9)'; [ya, yb].forEach(y => { ctx.beginPath(); ctx.arc(x, y, 4, 0, 7); ctx.fill(); });
  ctx.restore();
}
function drawTally(ctx, x, y, a) {
  if (a <= 0) return;
  const items = [['C', 13], ['H', 10], ['N', 2], ['O', 4]], gap = 118, x0 = x - gap * 1.5;
  items.forEach(([el, n], i) => { const k = eOut(clamp(a * 2.2 - i * .35)); if (k <= 0) return; const cx = x0 + i * gap;
    ctx.save(); ctx.globalAlpha *= k; const r = 15; ctx.drawImage(sphereSprite(ELEM[el]), cx - 34 - r, y - r, r * 2, r * 2); ctx.restore();
    txt(ctx, `${el}×${n}`, cx - 10, y + (1 - k) * 10, { size: 34, font: FONT_B, col: COL.cream, a: k, align: 'left', track: 1 }); });
}

function drawS3(ctx, T) {
  drawBg(ctx, '#142a66', .5, .42);
  resetT(ctx);
  // 分子空间的背景：远处漂浮的小分子光点
  ctx.save(); ctx.globalCompositeOperation = 'screen'; const rb = rng(31);
  for (let i = 0; i < 70; i++) { const x = rb() * W, y = rb() * H, s = 2 + rb() * 6, ph = rb() * 6; glow(ctx, x + Math.sin(TA * .2 + ph) * 20, y + Math.cos(TA * .17 + ph) * 14, s * 4, rb() < .5 ? '#5d7fd8' : '#3fbfd0', .18); }
  ctx.restore();
  drawDust(ctx, TA, 0, 0, W, H, '#bfe0ff', .2);

  const R0 = molR0(T), R1 = M3.mul(M3.MX, M3.mul(R0, M3.MX));
  // —— 位置时间线 ——
  const split = eIO(prog(T, 21.75, 22.65));                       // 分子挪到左边、镜子立起来
  const hands = eOut(prog(T, PA(7, 1) - .2, PA(7, 1) + .7));       // "左手和右手"
  const merge = eIO(prog(T, PA(7, 3) - .15, PA(7, 3) + .75));     // "却不能完全重合"：往中间叠
  const apart = eIO(prog(T, 32.55, 33.4));
  const sOut = 1 - eIO(prog(T, 33.0, 33.8)) * .35;
  let s = S3.S * lerp(1, .72, hands) * sOut;
  let ly = lerp(S3.MY, 330, hands), lx = lerp(S3.MX, S3.LX, split), rx = S3.RX;
  lx = lerp(lx, 860, merge * (1 - apart)) + apart * -40 * 0; rx = lerp(S3.RX, 860, merge * (1 - apart));
  if (apart > 0) { lx = lerp(860, 760, apart); rx = lerp(860, 1160, apart); ly = lerp(330, 400, apart); }

  // —— 推近手性碳（"藏着一个容易被忽略的差异"）——
  const zin = eIO(prog(T, PA(5, 1) - .05, PA(5, 1) + .75)) * (1 - eIO(prog(T, 21.3, 22.1)));
  const asm = prog(T, 17.55, 19.1);
  const P0 = projMol({ x: lx, y: ly, s, R: R0 });
  const sp = P0[MOL.st];
  ctx.save();
  if (zin > 0) { const z = 1 + 1.25 * zin; ctx.translate(lerp(0, 960 - sp.X, zin) + sp.X, lerp(0, 500 - sp.Y, zin) + sp.Y); ctx.scale(z, z); ctx.translate(-sp.X, -sp.Y); }

  // 镜子
  drawMirror(ctx, S3.MX, 215, 790, prog(T, 22.05, 22.85) * (1 - eIO(prog(T, 28.6, 29.4))), T);
  txt(ctx, '镜子', S3.MX, 818, { size: 26, font: FONT_T, col: '#cfeeff', a: eOut(prog(T, 22.6, 23.0)) * (1 - eIO(prog(T, 28.6, 29.2))) * .8, track: 6 });

  // —— 手（第 7 句）——
  const HS = .44, hy = 800 + (1 - hands) * 520;
  const lhx = lerp(S3.LX, 860, merge * (1 - apart)), rhx = lerp(S3.RX, 860, merge * (1 - apart));
  const handA = hands * (1 - eIO(prog(T, 32.7, 33.5)));
  const sway = Math.sin(TA * .9) * .035 * eIO(prog(T, PA(7, 2) - .3, PA(7, 2) + .3)) * (1 - merge);
  if (handA > 0) {
    ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, lhx, hy - 200, 380, COL.red, .2 * handA); glow(ctx, rhx, hy - 200, 380, COL.blue, .2 * handA); ctx.restore();
    drawAt(ctx, IMG.hand_red, ...ANCH.hand_left.c, lhx, hy, HS, -sway, handA);
    drawAt(ctx, IMG.hand_blue, 1024 - ANCH.hand_left.c[0], ANCH.hand_left.c[1], rhx, hy, HS, sway, handA * lerp(1, .62, merge));
    if (merge > .2) drawAt(ctx, IMG.hand_blue_line, 1024 - ANCH.hand_left.c[0], ANCH.hand_left.c[1], rhx, hy, HS, sway, handA * clamp(merge * 2 - .4));
    // 叠在一起后：对不上的部分发光（两只手剪影做异或）
    const mis = prog(T, PA(7, 3) + .55, PA(7, 3) + 1.0) * (1 - eIO(prog(T, 32.6, 33.2)));
    if (mis > 0) {
      const lx2 = s3layer(); const m = ctx.getTransform(); lx2.setTransform(m);
      drawAt(lx2, IMG.hand_red_sil, ...ANCH.hand_left.c, lhx, hy, HS, -sway, 1);
      lx2.globalCompositeOperation = 'xor'; drawAt(lx2, IMG.hand_blue_sil, 1024 - ANCH.hand_left.c[0], ANCH.hand_left.c[1], rhx, hy, HS, sway, 1);
      lx2.globalCompositeOperation = 'source-in'; lx2.setTransform(1, 0, 0, 1, 0, 0); lx2.fillStyle = hatchPat(lx2); lx2.fillRect(0, 0, S3L.width, S3L.height);
      const pulse = .55 + .45 * Math.sin(TA * 9);
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = mis * .35 * pulse; ctx.globalCompositeOperation = 'screen'; ctx.filter = 'blur(10px)'; ctx.drawImage(S3L, 0, 0); ctx.filter = 'none'; ctx.globalAlpha = mis * (.55 + .3 * pulse); ctx.globalCompositeOperation = 'source-over'; ctx.drawImage(S3L, 0, 0); ctx.restore();
      const th1 = imgPt(...ANCH.hand_left.thumb, ...ANCH.hand_left.c, lhx, hy, HS), th2 = imgPt(1024 - ANCH.hand_left.thumb[0], ANCH.hand_left.thumb[1], 1024 - ANCH.hand_left.c[0], ANCH.hand_left.c[1], rhx, hy, HS);
      drawMark(ctx, th1[0] + 40, th1[1] - 60, 26, false, mis); drawMark(ctx, th2[0] - 40, th2[1] - 60, 26, false, mis);
    }
    const la = hands * (1 - eIO(prog(T, PA(7, 3) - .2, PA(7, 3) + .2)));
    txt(ctx, '左手', 270, 600, { size: 44, font: FONT_T, col: COL.redL, a: la, track: 6 });
    txt(ctx, '右手', 1650, 600, { size: 44, font: FONT_T, col: COL.blueL, a: la, track: 6 });
  }

  // —— 分子 ——
  const colK = eIO(prog(T, 24.9, 25.5));                         // 两边分别染成红、蓝
  const bondL = mixHexH('#e7b65e', COL.red, colK), bondR = mixHexH('#e7b65e', COL.blue, colK);
  const molA = 1 - eIO(prog(T, 33.4, 34.0)) * 0;
  // 右手型：从镜子里"走出来"（离镜子近的原子先出现）
  const ra = (T > 23.3) ? 1 : 0;
  let RR = R1, rxx = rx;
  const fit = kabschCache(R0);
  if (merge > 0) RR = slerpM(R1, fit, eIO(prog(T, PA(7, 3) - .15, PA(7, 3) + .6)) * (1 - apart));
  const atomAppear = i => { const p = MOL_PM[i], d = (M3.ap(R1, p)[0] * s + rx - S3.MX) / 520; return eOut(prog(T, 23.45 + d * 1.0, 23.75 + d * 1.0)); };
  const Pl = drawMol(ctx, { x: lx, y: ly, s, R: R0, a: molA, asm, asmFrom: [960, 520], asmSeed: 5, bond: bondL, glow: COL.red, glowA: colK * 1.6, hi: zin, bondW: 1 + .5 * colK, rim: colK > 0 ? [COL.red, colK] : null });
  if (ra && merge < .98) {
    // 还在镜子里的时候偏冷、半透明
    const inMirror = 1 - eIO(prog(T, 24.4, 25.0));
    ctx.save(); ctx.globalAlpha = 1 - .45 * inMirror;
    drawMol(ctx, { x: rxx, y: ly, s, R: RR, mir: true, a: molA * (merge > 0 ? 1 - merge * .45 : 1), bond: bondR, glow: COL.blue, glowA: colK * 1.6, atomA: merge > 0 ? null : atomAppear, bondW: 1 + .5 * colK, rim: colK > 0 ? [COL.blue, colK] : null });
    ctx.restore();
  }
  // 叠到一起：右手型变成蓝色描边的"幽灵"，对不上的原子打红圈
  if (merge > 0) {
    const ghostA = clamp(merge * 1.4) * (1 - eIO(prog(T, 32.6, 33.3)));
    const Pr = drawMolGhost(ctx, { x: rxx, y: ly, s, R: RR, mir: true, a: ghostA }, '#8fd0ff');
    const chk = prog(T, PA(7, 3) + .6, PA(7, 3) + 1.0) * (1 - eIO(prog(T, 32.6, 33.2)));
    if (chk > 0) {
      ctx.save();
      for (let i = 0; i < Pl.length; i++) { const d = Math.hypot(Pl[i].X - Pr[i].X, Pl[i].Y - Pr[i].Y) / s; if (d < .55) continue;
        const pulse = .6 + .4 * Math.sin(TA * 8 + i);
        ctx.strokeStyle = hex('#ff5a5a', chk * pulse); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(Pr[i].X, Pr[i].Y, s * RADM[Pr[i].el] * 1.5, 0, 7); ctx.stroke();
        ctx.strokeStyle = hex('#ff8a7a', .45 * chk); ctx.lineWidth = 1.5; ctx.setLineDash([4, 5]); ctx.beginPath(); ctx.moveTo(Pl[i].X, Pl[i].Y); ctx.lineTo(Pr[i].X, Pr[i].Y); ctx.stroke(); ctx.setLineDash([]); }
      ctx.restore();
      drawMark(ctx, lx + s * 3.6, ly - s * 2.6, 30, false, chk);
    }
  }
  // 手性碳：准星 + 标签
  if (zin > 0 || T < 22.2) {
    const sa = clamp(zin * 1.4);
    drawReticle(ctx, sp.X, sp.Y, 34, sa, TA, COL.gold2);
    if (sa > 0) { ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, sp.X, sp.Y, 70, COL.gold, .55 * sa * (.7 + .3 * Math.sin(TA * 5))); ctx.restore(); }
    ctx.save(); ctx.globalAlpha = sa; ctx.strokeStyle = hex(COL.gold2, .8); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(sp.X + 40, sp.Y - 30); ctx.lineTo(sp.X + 90, sp.Y - 80); ctx.lineTo(sp.X + 150, sp.Y - 80); ctx.stroke(); ctx.restore();
    txt(ctx, '差异藏在这个碳原子上', sp.X + 156, sp.Y - 80, { size: 22, font: FONT_T, col: COL.gold2, a: eOut(prog(T, PA(5, 1) + .5, PA(5, 1) + .9)) * sa, align: 'left' });
  }
  ctx.restore();

  // —— "就像左手和右手"：先闪一秒老影像里真实的一双手 ——
  const hf = eOut(prog(T, 26.6, 26.85)) * (1 - eIO(prog(T, 27.45, 27.85)));
  if (hf > 0) {
    resetT(ctx); ctx.save(); ctx.fillStyle = `rgba(4,7,20,${.55 * hf})`; ctx.fillRect(0, 0, W, H);
    const fw = 620, fh = 465, sc = lerp(.94, 1, eOut(prog(T, 26.6, 27.2))) * lerp(1, .9, eIO(prog(T, 27.45, 27.85))), fx = 960 - fw * sc / 2, fy = 445 - fh * sc / 2;
    ctx.globalAlpha = hf; drawFilmFrame(ctx, fx, fy, fw * sc, fh * sc, { sprocket: 'lr', r: 4 });
    drawFootage(ctx, 's3_hands', T, fx, fy, fw * sc, fh * sc, { hi: '#f3e3c4', lo: '#101a3c', vig: .45 });
    txt(ctx, '资料影像 · 1951', fx, fy + fh * sc + 30, { size: 22, font: FONT_T, col: COL.cream, a: .6, align: 'left', track: 2 });
    ctx.restore();
  }
  // —— 文字（不跟镜头）——
  const fa = eOut(prog(T, 18.5, 19.0)) * (1 - eIO(prog(T, 19.3, 19.7)));
  txt(ctx, '沙利度胺分子', 960, 820, { size: 34, font: FONT_T, col: COL.cream, a: fa, track: 6 });
  drawFormula(ctx, 960, 862, 40, COL.gold2, fa, THAL_F);
  // 原子清单：两边一样
  const ta1 = prog(T, 22.65, 23.4) * (1 - eIO(prog(T, PA(7, 1) - .4, PA(7, 1)))), ta2 = prog(T, 24.35, 25.0) * (1 - eIO(prog(T, PA(7, 1) - .4, PA(7, 1))));
  drawTally(ctx, S3.LX, 900, ta1); drawTally(ctx, S3.RX, 900, ta2);
  txt(ctx, '=', 960, 900, { size: 60, font: FONT_B, col: COL.gold2, a: eOut(prog(T, 24.8, 25.2)) * (1 - eIO(prog(T, PA(7, 1) - .4, PA(7, 1)))) });
  txt(ctx, '同样的原子', S3.LX, 845, { size: 28, font: FONT_T, col: COL.cream, a: eOut(prog(T, 22.5, 22.9)) * .8 * (1 - eIO(prog(T, PA(7, 1) - .4, PA(7, 1)))), track: 4 });
  const mt = eOut(prog(T, 24.3, 24.8)) * (1 - eIO(prog(T, PA(7, 1) - .3, PA(7, 1) + .1)));
    if (mt > 0) { txt(ctx, '两种结构 · 互为镜像', 960, 160 + 0 * mt, { size: 38, font: FONT_T, col: COL.gold2, a: mt, track: 6, glow: .35 }); }
  const na = eOut(prog(T, PA(7, 3) + .65, PA(7, 3) + 1.0)) * (1 - eIO(prog(T, 32.6, 33.1)));
  txt(ctx, '怎么转，都叠不到一起', 960, 160, { size: 38, font: FONT_T, col: '#ff9a8a', a: na, track: 6, glow: .3, glowCol: '#ff5a5a' });
}
// 最佳叠放旋转：右手型按"苯环那半边"（邻苯二甲酰亚胺）对齐左手型
let HATCH = null;
function hatchPat(c) { if (!HATCH) { HATCH = cv(28, 28); const x = HATCH.getContext('2d'); x.fillStyle = 'rgba(255,90,80,.35)'; x.fillRect(0, 0, 28, 28); x.strokeStyle = 'rgba(255,240,230,.95)'; x.lineWidth = 5; x.beginPath(); for (let k = -28; k <= 56; k += 14) { x.moveTo(k, 0); x.lineTo(k - 28, 28); } x.stroke(); } return c.createPattern(HATCH, 'repeat'); }
function kabschCache(R0) { const X = MOL_P.map(p => M3.ap(R0, p)); return kabsch(MOL_PM, X, MOL.phth); }
