// mol.js —— 沙利度胺球棍模型（参考图 4：颗粒质感的哑光小球 + 细金棍）
// 左手型 = 原始 (R) 构象，右手型 = x 取反的精确镜像。屏幕上"照镜子"用 R1 = M·R0·M 保证两边像素级镜像。
'use strict';
const ELEM = { C: '#5d6a94', N: '#3cc9b6', O: '#eaa23c', H: '#efe8da' };
const RADM = { C: .42, N: .4, O: .4, H: .25 };   // 球半径（Å）
const SPR = {};
function sphereSprite(col) {
  if (SPR[col]) return SPR[col];
  const n = 256, c = cv(n, n), x = c.getContext('2d'), r = n / 2 - 4;
  const g = x.createRadialGradient(n * .38, n * .34, r * .05, n * .5, n * .5, r);
  g.addColorStop(0, mixHex(col, '#ffffff', .5)); g.addColorStop(.45, col); g.addColorStop(1, mixHex(col, '#0a1030', .66));
  x.fillStyle = g; x.beginPath(); x.arc(n / 2, n / 2, r, 0, 7); x.fill();
  x.save(); x.globalCompositeOperation = 'source-atop';
  const sh = x.createRadialGradient(n * .3, n * .28, r * .5, n * .55, n * .58, r * 1.05); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,1)');
  const m = cv(n, n), mx = m.getContext('2d'); mx.fillStyle = mx.createPattern(GRAIN.stip, 'repeat'); mx.fillRect(0, 0, n, n); mx.globalCompositeOperation = 'destination-in'; mx.fillStyle = sh; mx.fillRect(0, 0, n, n);
  x.globalAlpha = .6; x.drawImage(m, 0, 0);
  x.globalAlpha = .25; x.fillStyle = x.createPattern(GRAIN.light, 'repeat'); x.fillRect(0, 0, n, n); x.restore();
  x.save(); x.globalCompositeOperation = 'source-atop';
  const rim = x.createRadialGradient(n * .2, n * .2, r * 1.15, n * .2, n * .2, r * 1.62); rim.addColorStop(0, 'rgba(160,230,255,0)'); rim.addColorStop(1, 'rgba(160,230,255,.5)');
  x.fillStyle = rim; x.fillRect(0, 0, n, n); x.restore();
  x.fillStyle = 'rgba(255,255,255,.7)'; x.beginPath(); x.ellipse(n * .37, n * .31, r * .14, r * .085, -.6, 0, 7); x.fill();
  return (SPR[col] = c);
}

// —— 3×3 矩阵、四元数 ——
const M3 = {
  mul: (A, B) => A.map((r, i) => [0, 1, 2].map(j => r[0] * B[0][j] + r[1] * B[1][j] + r[2] * B[2][j])),
  ap: (A, v) => [A[0][0] * v[0] + A[0][1] * v[1] + A[0][2] * v[2], A[1][0] * v[0] + A[1][1] * v[1] + A[1][2] * v[2], A[2][0] * v[0] + A[2][1] * v[1] + A[2][2] * v[2]],
  rx: a => [[1, 0, 0], [0, Math.cos(a), -Math.sin(a)], [0, Math.sin(a), Math.cos(a)]],
  ry: a => [[Math.cos(a), 0, Math.sin(a)], [0, 1, 0], [-Math.sin(a), 0, Math.cos(a)]],
  rz: a => [[Math.cos(a), -Math.sin(a), 0], [Math.sin(a), Math.cos(a), 0], [0, 0, 1]],
  I: [[1, 0, 0], [0, 1, 0], [0, 0, 1]], MX: [[-1, 0, 0], [0, 1, 0], [0, 0, 1]],
};
const pose = (yaw, pitch, roll = 0) => M3.mul(M3.rz(roll), M3.mul(M3.rx(pitch), M3.ry(yaw)));
function m2q(m) { const tr = m[0][0] + m[1][1] + m[2][2]; let q;
  if (tr > 0) { const s = Math.sqrt(tr + 1) * 2; q = [.25 * s, (m[2][1] - m[1][2]) / s, (m[0][2] - m[2][0]) / s, (m[1][0] - m[0][1]) / s]; }
  else if (m[0][0] > m[1][1] && m[0][0] > m[2][2]) { const s = Math.sqrt(1 + m[0][0] - m[1][1] - m[2][2]) * 2; q = [(m[2][1] - m[1][2]) / s, .25 * s, (m[0][1] + m[1][0]) / s, (m[0][2] + m[2][0]) / s]; }
  else if (m[1][1] > m[2][2]) { const s = Math.sqrt(1 + m[1][1] - m[0][0] - m[2][2]) * 2; q = [(m[0][2] - m[2][0]) / s, (m[0][1] + m[1][0]) / s, .25 * s, (m[1][2] + m[2][1]) / s]; }
  else { const s = Math.sqrt(1 + m[2][2] - m[0][0] - m[1][1]) * 2; q = [(m[1][0] - m[0][1]) / s, (m[0][2] + m[2][0]) / s, (m[1][2] + m[2][1]) / s, .25 * s]; }
  return q; }
function q2m(q) { const [w, x, y, z] = q; return [[1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)], [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)], [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)]]; }
function slerpM(A, B, k) { const a = m2q(A); let b = m2q(B); let d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]; if (d < 0) { b = b.map(v => -v); d = -d; }
  if (d > .9995) { const q = a.map((v, i) => v + (b[i] - v) * k), l = Math.hypot(...q); return q2m(q.map(v => v / l)); }
  const th = Math.acos(d), s = Math.sin(th), wa = Math.sin((1 - k) * th) / s, wb = Math.sin(k * th) / s; return q2m(a.map((v, i) => v * wa + b[i] * wb)); }
// Horn 四元数法求最佳旋转 Q：Q·P[i] ≈ X[i]（只用 idx 里的原子）
function kabsch(P, X, idx) {
  let S = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]; for (const i of idx) for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) S[a][b] += P[i][a] * X[i][b];
  const [[xx, xy, xz], [yx, yy, yz], [zx, zy, zz]] = S;
  const N = [[xx + yy + zz, yz - zy, zx - xz, xy - yx], [yz - zy, xx - yy - zz, xy + yx, zx + xz], [zx - xz, xy + yx, -xx + yy - zz, yz + zy], [xy - yx, zx + xz, yz + zy, -xx - yy + zz]];
  let v = [1, .1, .2, .3]; const sh = 100;
  for (let it = 0; it < 300; it++) { const w = [0, 1, 2, 3].map(i => N[i].reduce((s, n, j) => s + n * v[j], 0) + sh * v[i]); const l = Math.hypot(...w); v = w.map(u => u / l); }
  return q2m(v);
}

// —— 分子数据 ——
const MOL = (() => {
  const A = THAL.A.map(a => ({ el: a[0], p: [a[1], a[2], a[3]] })), B = THAL.B, st = THAL.stereo;
  const nb = A.map(() => []); B.forEach(([a, b]) => { nb[a].push(b); nb[b].push(a); });
  // 邻苯二甲酰亚胺部分 = 从 N 出发、不经过手性碳能走到的原子
  const n0 = THAL.stereoNb.find(j => A[j].el === 'N'), ph = new Set([n0]), q = [n0];
  while (q.length) { const u = q.pop(); for (const v of nb[u]) if (v !== st && !ph.has(v)) { ph.add(v); q.push(v); } }
  const hS = THAL.stereoNb.find(j => A[j].el === 'H');
  return { A, B, st, nb, phth: [...ph], glut: A.map((_, i) => i).filter(i => !ph.has(i)), hS, n0 };
})();
const MOL_P = MOL.A.map(a => a.p), MOL_PM = MOL.A.map(a => [-a.p[0], a.p[1], a.p[2]]);
MOL.P = MOL_P; MOL.PM = MOL_PM; MOL.nbSt = THAL.stereoNb;
function mkMol(D) { const A = D.A.map(a => ({ el: a[0], p: [a[1], a[2], a[3]] })); return { A, B: D.B, st: D.stereo, nbSt: D.stereoNb, P: A.map(a => a.p), PM: A.map(a => [-a.p[0], a.p[1], a.p[2]]) }; }

// 投影。o: {x,y,s, R 旋转矩阵, mir 是否用镜像坐标, persp}
function projMol(o) {
  const M = o.mol || MOL, src = o.mir ? M.PM : M.P, R = o.R || M3.I, per = o.persp === undefined ? .045 : o.persp;
  return src.map((p, i) => { const v = M3.ap(R, p), f = 1 / (1 - v[2] * per); return { i, el: M.A[i].el, X: o.x + v[0] * o.s * f, Y: o.y - v[1] * o.s * f, Z: v[2], f }; });
}
// 画分子。o 另外可有：a, bond 键色, glow 光晕色, glowA, asm(0..1 组装进度), asmSeed, asmFrom [x,y],
//   hi(0..1 只亮手性碳那一圈), atomA(i)→透明度系数, mark: {i: 强度} 红圈标记, ghost 半透明描边模式
function drawMol(ctx, o) {
  const a0 = (o.a === undefined ? 1 : o.a); if (a0 <= 0) return null;
  const P = projMol(o), asm = o.asm === undefined ? 1 : o.asm;
  // 组装：原子从散开的位置飞到原位
  if (asm < 1) { const r = rng(o.asmSeed || 3); P.forEach((p, k) => { const d = r(), an = r() * 6.283, rr = 380 + r() * 520, st = d * .45, kk = eOutBack(clamp((asm - st) / .55), 1.1);
    const fx = o.asmFrom ? o.asmFrom[0] + Math.cos(an) * 60 : o.x + Math.cos(an) * rr, fy = o.asmFrom ? o.asmFrom[1] + Math.sin(an) * 60 : o.y + Math.sin(an) * rr * .7;
    p.k = clamp((asm - st) / .55); p.X = lerp(fx, p.X, kk); p.Y = lerp(fy, p.Y, kk); }); }
  if (o.glowA) { ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, o.x, o.y, o.s * 6.5, o.glow || COL.gold, .3 * o.glowA * a0); ctx.restore(); }
  const items = [];
  const MM = o.mol || MOL;
  MM.B.forEach(b => items.push({ z: (P[b[0]].Z + P[b[1]].Z) / 2 - .05, b }));
  P.forEach(p => items.push({ z: p.Z, p }));
  items.sort((u, v) => u.z - v.z);
  const bcol = o.bond || '#e7b65e', zmin = -4, zmax = 4;
  const fog = z => .55 + .45 * clamp((z - zmin) / (zmax - zmin));
  const hiK = o.hi || 0, isHi = i => i === MM.st || MM.nbSt.includes(i);
  ctx.save();
  for (const it of items) {
    if (it.b) {
      const [i, j, ord] = it.b, A = P[i], B = P[j];
      let v = asm < 1 ? Math.min(A.k, B.k) : 1; if (v <= .02) continue;
      let al = a0 * (o.atomA ? Math.min(o.atomA(i), o.atomA(j)) : 1) * (1 - hiK * .78 * (isHi(i) && isHi(j) ? 0 : 1)); if (al <= 0) continue;
      const w = o.s * .085 * (o.bondW || 1) * (A.f + B.f) / 2, L = Math.hypot(B.X - A.X, B.Y - A.Y) || 1, nx = -(B.Y - A.Y) / L, ny = (B.X - A.X) / L;
      const ra = o.s * RADM[A.el] * A.f * .8, rb = o.s * RADM[B.el] * B.f * .8, ux = (B.X - A.X) / L, uy = (B.Y - A.Y) / L;
      const x0 = A.X + ux * ra * .6, y0 = A.Y + uy * ra * .6, x1 = B.X - ux * rb * .6, y1 = B.Y - uy * rb * .6;
      const line = (ox, oy, ww) => {
        ctx.lineCap = 'round'; ctx.globalAlpha = al * v;
        ctx.strokeStyle = 'rgba(6,10,30,.85)'; ctx.lineWidth = ww * 1.7; ctx.beginPath(); ctx.moveTo(x0 + ox, y0 + oy); ctx.lineTo(x1 + ox, y1 + oy); ctx.stroke();
        ctx.strokeStyle = bcol; ctx.globalAlpha = al * v * fog(it.z); ctx.lineWidth = ww; ctx.beginPath(); ctx.moveTo(x0 + ox, y0 + oy); ctx.lineTo(x1 + ox, y1 + oy); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,250,235,.55)'; ctx.lineWidth = ww * .3; ctx.beginPath(); ctx.moveTo(x0 + ox - nx * ww * .2, y0 + oy - ny * ww * .2); ctx.lineTo(x1 + ox - nx * ww * .2, y1 + oy - ny * ww * .2); ctx.stroke();
      };
      if (ord === 2) { const d = w * 1.1; line(nx * d, ny * d, w * .75); line(-nx * d, -ny * d, w * .75); } else line(0, 0, w);
    } else {
      const p = it.p, v = asm < 1 ? p.k : 1; if (v <= 0) continue;
      let al = a0 * (o.atomA ? o.atomA(p.i) : 1) * (1 - hiK * .78 * (isHi(p.i) ? 0 : 1)); if (al <= 0) continue;
      const r = o.s * RADM[p.el] * p.f * (asm < 1 ? eOutBack(clamp(v * 1.4)) : 1) * (o.atomScale || 1);
      ctx.globalAlpha = al * clamp(v * 3);
      ctx.drawImage(sphereSprite(ELEM[p.el]), p.X - r, p.Y - r, r * 2, r * 2);
      // 远处的原子压暗一点（景深）
      const d = 1 - fog(p.Z); if (d > .05) { ctx.globalAlpha = al * d * .6; ctx.fillStyle = '#060a1a'; ctx.beginPath(); ctx.arc(p.X, p.Y, r * .98, 0, 7); ctx.fill(); }
      if (o.rim) { ctx.globalAlpha = al * o.rim[1] * .9; ctx.strokeStyle = o.rim[0]; ctx.lineWidth = Math.max(1.5, r * .16); ctx.beginPath(); ctx.arc(p.X, p.Y, r * 1.04, 0, 7); ctx.stroke(); }
      if (o.mark && o.mark[p.i]) { const mk = o.mark[p.i]; ctx.globalAlpha = al * mk; ctx.strokeStyle = '#ff5a5a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(p.X, p.Y, r * 1.45, 0, 7); ctx.stroke(); }
    }
  }
  ctx.restore();
  return P;
}
// 用两种颜色描出分子轮廓（叠放对比时用：半透明的那一个）
function drawMolGhost(ctx, o, col) {
  const P = projMol(o); ctx.save(); ctx.globalAlpha *= (o.a === undefined ? 1 : o.a);
  ctx.strokeStyle = col; ctx.lineCap = 'round';
  (o.mol || MOL).B.forEach(([i, j]) => { ctx.globalAlpha = .55 * (o.a || 1); ctx.lineWidth = o.s * .06; ctx.beginPath(); ctx.moveTo(P[i].X, P[i].Y); ctx.lineTo(P[j].X, P[j].Y); ctx.stroke(); });
  P.forEach(p => { const r = o.s * RADM[p.el] * p.f; ctx.globalAlpha = .28 * (o.a || 1); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(p.X, p.Y, r, 0, 7); ctx.fill(); ctx.globalAlpha = .9 * (o.a || 1); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(p.X, p.Y, r, 0, 7); ctx.stroke(); });
  ctx.restore(); return P;
}
// 化学式（下标）
function drawFormula(ctx, x, y, size, col, a, parts) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = col; ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 12;
  const fs = p => p[1] ? size * .6 : size;
  const ws = parts.map(p => { ctx.font = `${fs(p)}px ${FONT_B}`; return ctx.measureText(p[0]).width + (p[1] ? 2 : 1); });
  let cx = x - ws.reduce((m, n) => m + n, 0) / 2;
  parts.forEach((p, i) => { ctx.font = `${fs(p)}px ${FONT_B}`; ctx.fillText(p[0], cx, y + (p[1] ? size * .18 : 0) + size * .35); cx += ws[i]; });
  ctx.restore();
}
const THAL_F = [['C', 0], ['13', 1], ['H', 0], ['10', 1], ['N', 0], ['2', 1], ['O', 0], ['4', 1]];
