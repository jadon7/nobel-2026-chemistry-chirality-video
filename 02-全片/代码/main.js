// main.js —— window.seek(T) 画第 T 秒的一帧（纯函数，不依赖上一帧；先异步加载这一帧要用的老影像帧）
'use strict';
const CTX = document.getElementById('c').getContext('2d');
const DUR = VO_DUR;
// 每场的时间范围（两场重叠的部分由转场决定怎么合成）
const SCENES = [
  { f: t => drawS1(CTX_CUR, t), a: 0, b: 8.95 },
  { f: t => drawS2(CTX_CUR, t), a: 8.35, b: 18.05 },
  { f: t => drawS3(CTX_CUR, t), a: 17.35, b: 34.0 },
  { f: t => drawS4(CTX_CUR, t), a: 33.55, b: 44.75 },
  { f: t => drawS5(CTX_CUR, t), a: 44.2, b: 63.3 },
  { f: t => drawS6(CTX_CUR, t), a: 62.5, b: 91.7 },      // 1986 卡根：反常
  { f: t => drawS7(CTX_CUR, t), a: 90.9, b: 124.5 },     // 简化模型：两两结组
  { f: t => drawS8(CTX_CUR, t), a: 123.7, b: 136.4 },    // 硤合：产物回头帮忙
  { f: t => drawS9(CTX_CUR, t), a: 135.4, b: 166.9 },    // 机器和生产线；1990 年没走通
  { f: t => drawS10(CTX_CUR, t), a: 166.2, b: 188.4 },   // 1995：一轮接一轮
  { f: t => drawS11(CTX_CUR, t), a: 187.7, b: 236.5 },   // 2003：小到仪器分辨不出 → 99.75%
  { f: t => drawS12(CTX_CUR, t), a: 235.8, b: 999 },     // 收尾：回到反应停
];
// 转场：[起, 止, 方式, 参数]。方式：fade 交叉淡化 / iris 圆形张开 / wipe 斜切
const TRANS = [
  [8.35, 8.95, 'wipe', { ang: -.35 }],
  [17.35, 18.05, 'iris', { x: 960, y: 520 }],
  [33.55, 34.0, 'fade'],
  [44.2, 44.75, 'iris', { x: 960, y: 300 }],
  [62.5, 63.3, 'fade'],
  [90.9, 91.7, 'iris', { x: 520, y: 600 }],
  [123.7, 124.5, 'fade'],
  [135.4, 136.4, 'wipe', { ang: .3 }],
  [166.2, 166.9, 'fade'],
  [187.7, 188.4, 'iris', { x: 960, y: 540 }],
  [235.8, 236.5, 'fade'],
];
let CTX_CUR = CTX, LAY = null, LAYX = null;
function sceneLayer() { if (!LAY) { LAY = cv(W * SS, H * SS); LAYX = LAY.getContext('2d'); } LAYX.setTransform(1, 0, 0, 1, 0, 0); LAYX.globalAlpha = 1; LAYX.globalCompositeOperation = 'source-over'; LAYX.clearRect(0, 0, LAY.width, LAY.height); return LAYX; }

function drawFrame(T) {
  const ctx = CTX; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  ctx.fillStyle = COL.navy0; ctx.fillRect(0, 0, W * SS, H * SS);
  const live = SCENES.filter(s => T >= s.a && T < s.b);
  const tr = TRANS.find(x => T >= x[0] && T < x[1]);
  if (live.length >= 2 && tr) {
    CTX_CUR = CTX; live[0].f(T);
    const lx = sceneLayer(); CTX_CUR = lx; live[1].f(T); CTX_CUR = CTX;
    const k = eIO(prog(T, tr[0], tr[1])), o = tr[3] || {};
    resetT(ctx); ctx.save();
    if (tr[2] === 'fade') ctx.globalAlpha = k;
    else if (tr[2] === 'iris') { ctx.beginPath(); ctx.arc(o.x, o.y, lerp(0, 1250, eIn(prog(T, tr[0], tr[1]))), 0, 7); ctx.clip(); }
    else if (tr[2] === 'wipe') { const c = Math.cos(o.ang), s = Math.sin(o.ang), d = lerp(-1300, 1300, k); ctx.translate(W / 2, H / 2); ctx.rotate(o.ang); ctx.beginPath(); ctx.rect(-2000, -2000, 2000 + d, 4000); ctx.clip(); ctx.rotate(-o.ang); ctx.translate(-W / 2, -H / 2); }
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(LAY, 0, 0); ctx.restore();
    if (tr[2] === 'iris') { const R = lerp(0, 1250, eIn(prog(T, tr[0], tr[1]))); resetT(ctx); ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.strokeStyle = hex(COL.gold2, .8 * (1 - k)); ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(o.x, o.y, R, 0, 7); ctx.stroke(); glow(ctx, o.x, o.y, R * .5, COL.gold, .15 * (1 - k)); ctx.restore(); }
    if (tr[2] === 'wipe') { resetT(ctx); ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(tr[3].ang); const d = lerp(-1300, 1300, k); ctx.globalCompositeOperation = 'screen'; const g = ctx.createLinearGradient(d - 60, 0, d + 6, 0); g.addColorStop(0, 'rgba(255,240,210,0)'); g.addColorStop(1, 'rgba(255,240,210,.55)'); ctx.fillStyle = g; ctx.fillRect(d - 60, -2000, 66, 4000); ctx.restore(); }
  } else if (live.length) { CTX_CUR = CTX; live[live.length - 1].f(T); }
  drawFinish(ctx, 1, T);
  drawSubs(ctx, T);
  // 结尾淡出
  const fo = prog(T, DUR - .7, DUR); if (fo > 0) { resetT(ctx); ctx.fillStyle = `rgba(2,3,10,${eIn(fo)})`; ctx.fillRect(0, 0, W, H); }
  if (SHOW_T) { resetT(ctx); ctx.fillStyle = 'rgba(0,0,0,.65)'; ctx.fillRect(14, 14, 200, 70); ctx.fillStyle = '#fff'; ctx.font = '56px Bebas'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.fillText(T.toFixed(2) + 's', 30, 52); }
}
window.seek = async function (T) { TA = T; await preloadFootage(T); drawFrame(T); };
const SHOW_T = /[?&]ts=1/.test(location.search);
window.META = { DUR, SUBS };
(async () => {
  makeGrain();
  await Promise.all(['54px HanSerif', '54px HanSerifB', '50px ChillCond', '50px Bebas', '50px PuHui'].map(f => document.fonts.load(f)));
  await loadAssets();
  await window.seek(+(new URLSearchParams(location.search).get('t') || 0)); window.READY = true;
})();
