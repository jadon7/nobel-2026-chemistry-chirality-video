// assets.js —— 读入 AI 插画（Codex imagegen，提示词在 _gen/*.txt），做着色版本；IMG.x 是 Image 或 canvas
'use strict';
const IMG = {};
const ASSET_LIST = ['mother', 'pillbox', 'tablet', 'glove', 'flask', 'baby_hand', 'body', 'hand_left', 'medal'];
// 图里的关键点（图片像素坐标，看坐标网格量的）
const ANCH = {
  mother: { c: [560, 1536], glass: [665, 428], head: [600, 210], belly: [690, 800] },   // c = 底部中心（裁在膝盖）
  pillbox: { c: [760, 520], label: [[455, 62], [1100, 200], [458, 368]] },              // 标签面：左上、右上、左下
  tablet: { c: [640, 600] },
  glove: { c: [512, 860], cuff: [560, 1500] },
  flask: { c: [513, 1140], neck: [513, 70], surf: [510, 980, 383, 52], bulbR: 405 },
  baby_hand: { grip: [620, 500] },
  body: { c: [520, 900], heart: [518, 840], brain: [600, 165], gut: [610, 1180], nose: [240, 330] },
  hand_left: { c: [520, 860], tip: [520, 40], thumb: [880, 640], wrist: [560, 1500] },
  medal: { c: [634, 622] },
};
function loadImg(src) { return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('load ' + src)); i.src = src; }); }
function recolor(img, filter, mirror = false) {
  const c = cv(img.width, img.height), x = c.getContext('2d'); x.filter = filter;
  if (mirror) { x.translate(img.width, 0); x.scale(-1, 1); }
  x.drawImage(img, 0, 0); return c;
}
function silhouette(img, col, mirror = false) {
  const c = cv(img.width, img.height), x = c.getContext('2d');
  if (mirror) { x.translate(img.width, 0); x.scale(-1, 1); }
  x.drawImage(img, 0, 0); x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = col; x.fillRect(0, 0, c.width, c.height); return c;
}
function outline(img, col, px = 6, mirror = false) {
  const s = silhouette(img, col, mirror), c = cv(img.width, img.height), x = c.getContext('2d');
  for (let a = 0; a < 16; a++) x.drawImage(s, Math.cos(a / 16 * 6.283) * px, Math.sin(a / 16 * 6.283) * px);
  x.globalCompositeOperation = 'destination-out'; x.drawImage(s, 0, 0); return c;
}
function fadeEdge(c, side, inner, outer) {   // 图片直切边渐隐：inner 处完全保留，outer 处完全去掉（0..1，按宽或高）。side: 'b' / 'l' / 'r' / 't'
  const x = c.getContext('2d'), vert = side === 'b' || side === 't', L = vert ? c.height : c.width;
  const a = inner * L, b = outer * L;
  const g = vert ? x.createLinearGradient(0, a, 0, b) : x.createLinearGradient(a, 0, b, 0);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,1)');
  x.save(); x.globalCompositeOperation = 'destination-out'; x.fillStyle = g;
  const lo = Math.min(a, side === 'b' || side === 'r' ? L : 0), hi = Math.max(a, side === 'b' || side === 'r' ? L : 0);
  if (vert) x.fillRect(0, lo, c.width, hi - lo); else x.fillRect(lo, 0, hi - lo, c.height);
  x.restore(); return c;
}
const copyC = img => { const c = cv(img.width, img.height); c.getContext('2d').drawImage(img, 0, 0); return c; };
async function loadAssets() {
  for (const n of ASSET_LIST) IMG[n] = await loadImg(`../素材/ai/${n}.png`);
  // 左手（红）、右手（蓝，= 左手的镜像）
  IMG.hand_red = fadeEdge(recolor(IMG.hand_left, 'hue-rotate(168deg) saturate(1.5) brightness(1.35)'), 'b', .72, .97);
  IMG.hand_blue = fadeEdge(recolor(IMG.hand_left, 'hue-rotate(-8deg) saturate(1.25) brightness(1.2)', true), 'b', .72, .97);
  IMG.hand_red_sil = silhouette(IMG.hand_left, '#ff6a55'); IMG.hand_blue_sil = silhouette(IMG.hand_left, '#4ea6ff', true);
  IMG.hand_red_line = fadeEdge(outline(IMG.hand_left, '#ffb0a0', 5), 'b', .72, .97);
  IMG.hand_blue_line = fadeEdge(outline(IMG.hand_left, '#a8d4ff', 5, true), 'b', .72, .97);
  IMG.mother_f = fadeEdge(copyC(IMG.mother), 'b', .8, .99);
  IMG.body_f = fadeEdge(copyC(IMG.body), 'b', .78, .99);
  IMG.baby_f = fadeEdge(fadeEdge(fadeEdge(copyC(IMG.baby_hand), 'l', .3, .03), 'r', .78, .99), 'b', .8, .99);
  IMG.glove_red = recolor(IMG.glove, 'hue-rotate(160deg) saturate(1.3) brightness(1.1)');
  IMG.tablet_sil = silhouette(IMG.tablet, '#ffffff');
}
// 按锚点画图：(x,y) 对准图里的 (ax,ay)，s 缩放，rot 旋转
function drawAt(ctx, img, ax, ay, x, y, s = 1, rot = 0, a = 1, flip = false) {
  if (a <= 0 || !img) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(flip ? -s : s, s); ctx.drawImage(img, -ax, -ay); ctx.restore();
}
// 图片坐标 → 世界坐标（和 drawAt 的变换一致）
function imgPt(px, py, ax, ay, x, y, s, rot = 0, flip = false) { const lx = (px - ax) * (flip ? -s : s), ly = (py - ay) * s; return [x + lx * Math.cos(rot) - ly * Math.sin(rot), y + lx * Math.sin(rot) + ly * Math.cos(rot)]; }
