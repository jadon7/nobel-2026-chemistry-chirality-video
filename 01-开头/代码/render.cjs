// render.cjs —— 本地起 HTTP 服务，无头 Chrome 逐帧调用 window.seek(t) 截图（4K 画、缩到 1080p），ffmpeg 合成 mp4（带旁白）
// 用法：node render.cjs --snap 1.2,3.4     截这几个时间点到 _snap/（1080p jpg）
//       node render.cjs --subs              每句字幕中点各截一张
//       node render.cjs [--from 0 --to 10]  渲染 → ../成片/开头.mp4（无声）和 开头_旁白版.mp4
'use strict';
const path = require('path'), http = require('http'), fs = require('fs'), { spawnSync } = require('child_process');
let chromium; try { ({ chromium } = require('playwright-core')); } catch (e) { ({ chromium } = require('/Users/jadon7/Downloads/codex-video-test/promo/node_modules/playwright-core')); }   // 先找项目里 npm i 的 playwright-core
const ROOT = path.resolve(__dirname, '..'), DIR = __dirname, FRAMES = path.join(ROOT, '_frames'), SNAP = path.join(DIR, '_snap');
const OUT = path.join(ROOT, '成片', process.env.OUT || '开头.mp4'), VO = path.join(ROOT, '素材', 'tts', 'narration.wav');
const FFMPEG = '/opt/homebrew/bin/ffmpeg', FPS = 30, WORKERS = +(process.env.WORKERS || 6);
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.otf': 'font/otf', '.ttf': 'font/ttf', '.jpg': 'image/jpeg' };
const argv = process.argv.slice(2), arg = k => argv.includes(k) ? argv[argv.indexOf(k) + 1] : null;
const srv = http.createServer((q, s) => { const p = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); fs.readFile(p, (e, b) => { if (e) { s.writeHead(404); s.end(); return; } s.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' }); s.end(b); }); });
async function openPage(browser, port) {
  const ctx = await browser.newContext({ viewport: { width: 3840, height: 2160 }, deviceScaleFactor: 1 }); const page = await ctx.newPage();
  page.on('pageerror', e => console.log('[page] error:', e.message)); page.on('console', m => { if (m.type() === 'error' && !/favicon/.test(m.text())) console.log('[page]', m.text()); });
  await page.goto(`http://127.0.0.1:${port}/${encodeURIComponent('代码')}/index.html${process.env.TS ? '?ts=1' : ''}`); await page.waitForFunction(() => window.READY === true, null, { timeout: 180000 }); return page;
}
async function shot(page, t, file, type = 'png') { await page.evaluate(tt => window.seek(tt).then(() => new Promise(res => requestAnimationFrame(() => requestAnimationFrame(res)))), t); await page.screenshot({ path: file, type, ...(type === 'jpeg' ? { quality: 95 } : {}) }); }
srv.listen(0, '127.0.0.1', async () => {
  const port = srv.address().port, T0 = Date.now();
  const browser = await chromium.launch({ channel: 'chrome', args: ['--hide-scrollbars', '--force-color-profile=srgb', '--ignore-gpu-blocklist', '--use-angle=metal', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'] });
  try {
    const p0 = await openPage(browser, port); const meta = await p0.evaluate(() => ({ DUR: window.META.DUR, mids: window.META.SUBS.map(s => +((s.a + s.b) / 2).toFixed(2)) }));
    let snapArg = arg('--snap'); if (argv.includes('--subs')) snapArg = meta.mids.join(',');
    if (snapArg) {
      fs.mkdirSync(SNAP, { recursive: true });
      for (const s of snapArg.split(',').map(Number)) { const tmp = path.join(SNAP, '_tmp.jpg'), f = path.join(SNAP, `t${s.toFixed(2).padStart(5, '0')}.jpg`); const t1 = Date.now(); await shot(p0, s, tmp, 'jpeg');
        spawnSync(FFMPEG, ['-y', '-hide_banner', '-loglevel', 'error', '-i', tmp, '-vf', 'scale=1920:1080:flags=lanczos', '-q:v', '2', f]); console.log('→', path.relative(DIR, f), ((Date.now() - t1) / 1000).toFixed(2) + 's'); }
      fs.rmSync(path.join(SNAP, '_tmp.jpg'), { force: true }); return;
    }
    await p0.context().close();
    const from = +(arg('--from') || 0), to = +(arg('--to') || meta.DUR); const i0 = Math.round(from * FPS), N = Math.ceil(to * FPS - 1e-6);
    fs.rmSync(FRAMES, { recursive: true, force: true }); fs.mkdirSync(FRAMES, { recursive: true });
    const pages = await Promise.all(Array.from({ length: WORKERS }, () => openPage(browser, port)));
    // 每个进程拿连续的一段（老影像帧缓存命中率高）
    const per = Math.ceil((N - i0) / WORKERS); let done = 0;
    await Promise.all(pages.map(async (page, w) => { for (let i = i0 + w * per; i < Math.min(N, i0 + (w + 1) * per); i++) { await shot(page, i / FPS, path.join(FRAMES, `f_${String(i - i0).padStart(5, '0')}.jpg`), 'jpeg'); if (++done % 60 === 0) console.log(`[render] ${done}/${N - i0}  ${((Date.now() - T0) / 1000).toFixed(1)}s`); } }));
    console.log(`[render] 截图完成 ${((Date.now() - T0) / 1000).toFixed(1)}s`);
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    const enc = spawnSync(FFMPEG, ['-y', '-hide_banner', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(FRAMES, 'f_%05d.jpg'), '-vf', 'scale=1920:1080:flags=lanczos,scale=out_color_matrix=bt709:out_range=tv,format=yuv420p', '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-tune', 'grain', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv', '-an', '-movflags', '+faststart', OUT], { stdio: 'inherit' });
    if (enc.status !== 0) { console.error('ffmpeg 失败'); process.exitCode = 1; return; }
    if (from === 0 && fs.existsSync(VO)) {
      const OUT2 = OUT.replace(/\.mp4$/, '_旁白版.mp4');
      spawnSync(FFMPEG, ['-y', '-hide_banner', '-loglevel', 'error', '-i', OUT, '-i', VO, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-shortest', '-movflags', '+faststart', OUT2], { stdio: 'inherit' });
      console.log('→', OUT2);
    }
    fs.rmSync(FRAMES, { recursive: true, force: true }); console.log(`[render] 完成 → ${OUT}  ${((Date.now() - T0) / 1000).toFixed(1)}s`);
  } finally { await browser.close(); srv.close(); }
});
