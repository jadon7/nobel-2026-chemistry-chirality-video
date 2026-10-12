// subs.js —— 字幕：原文来自飞书《反应停与分子的左右｜手性口播稿 v3》开头 12 句，一个字没改；时间来自 timeline.js（旁白实际停顿）
// 句末句号不显示，句中逗号显示成半个字宽的空隙；太长的句子按短语拆成两张卡
'use strict';
// 第 11 句拆两张：按旁白的停顿拆（[短语序号], 卡上的原文）
const SPLIT = { 11: [[[0, 1], '他们的研究，就是在把化学反应'], [[2, 3, 4], '能够把微小的差别放大，让结果偏向其中一边']] };
const SUBS = [];
VO.forEach(v => {
  const cards = SPLIT[v.i] || [[v.ph.map((_, j) => j), v.text.replace(/。$/, '')]];
  for (const [g, text] of cards) {
    const a = v.ph[g[0]][1], b = v.ph[g[g.length - 1]][2];
    SUBS.push({ text, gold: v.gold, a: a - .06, b: b + .28 });
  }
});
// 和下一张卡之间不重叠
for (let i = 0; i < SUBS.length - 1; i++) SUBS[i].b = Math.min(SUBS[i].b, SUBS[i + 1].a - .04);

function subSegs(s) { // [文字, 是否金色]
  let segs = [[s.text, false]];
  for (const g of s.gold) { const out = []; for (const [txt, isG] of segs) { if (isG) { out.push([txt, true]); continue; } const i = txt.indexOf(g); if (i < 0) { out.push([txt, false]); continue; } if (i > 0) out.push([txt.slice(0, i), false]); out.push([g, true]); if (i + g.length < txt.length) out.push([txt.slice(i + g.length), false]); } segs = out; }
  // 逗号拆成空隙
  const out = []; for (const [txt, g] of segs) txt.split(/(，)/).forEach(p => { if (p === '，') out.push([null, false]); else if (p) out.push([p, g]); });
  return out;
}
function drawSubs(ctx, T) {
  resetT(ctx);
  const band = ctx.createLinearGradient(0, H - 240, 0, H); band.addColorStop(0, 'rgba(3,6,18,0)'); band.addColorStop(1, 'rgba(3,6,18,.6)');
  ctx.fillStyle = band; ctx.fillRect(0, H - 240, W, 240);
  for (const s of SUBS) {
    if (T < s.a - .01 || T > s.b + .2) continue;
    const a = Math.min(clamp((T - s.a) / .14), 1 - clamp((T - s.b) / .18)); if (a <= 0) continue;
    const size = 52, y = H - 90 + (1 - eOut(clamp((T - s.a) / .25))) * 10, gap = size * .55;
    ctx.save(); ctx.font = `${size}px ${FONT_S}`; ctx.textBaseline = 'middle';
    const segs = subSegs(s); const widths = segs.map(([x]) => x === null ? gap : ctx.measureText(x).width); const tot = widths.reduce((p, q) => p + q, 0);
    let x = W / 2 - tot / 2;
    ctx.globalAlpha = a; ctx.shadowColor = 'rgba(0,0,0,.85)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 2;
    segs.forEach(([t, g], i) => { if (t !== null) { ctx.fillStyle = g ? COL.gold : '#f6f3ea'; ctx.fillText(t, x, y); } x += widths[i]; });
    ctx.restore();
  }
}
