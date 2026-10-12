# align.py —— 按停顿把整段旁白切成句子和短语（句界 = 最长的 N-1 个停顿；句内按逗号数取最长的停顿）
# 用法: python3 align.py <wav> <文本文件>   → 打印 JSON：[{text, ph:[[短语, 起, 止], ...]}, ...]
import re, subprocess, sys, json
wav, txtf = sys.argv[1], sys.argv[2]
lines = [l.strip() for l in open(txtf) if l.strip()]
out = subprocess.run(['/opt/homebrew/bin/ffmpeg', '-hide_banner', '-i', wav, '-af', 'silencedetect=noise=-38dB:d=0.16', '-f', 'null', '-'], capture_output=True, text=True).stderr
st = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', out)]; en = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', out)]
dur = float(subprocess.check_output(['/opt/homebrew/bin/ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', wav]).decode())
sil = list(zip(st, en + [dur] * (len(st) - len(en))))
# 讲话段
speech = []; t = 0
for a, b in sil:
    if a - t > .05: speech.append([t, a])
    t = b
if dur - t > .05: speech.append([t, dur])
gaps = [(speech[i + 1][0] - speech[i][1], i) for i in range(len(speech) - 1)]
cut = sorted(i for _, i in sorted(gaps, reverse=True)[:len(lines) - 1])
groups = []; s0 = 0
for c in cut + [len(speech) - 1]: groups.append(speech[s0:c + 1]); s0 = c + 1
res = []
for text, segs in zip(lines, groups):
    parts = [p for p in re.split(r'[，；]', text.rstrip('。？')) if p]
    k = len(parts) - 1
    ig = sorted((segs[i + 1][0] - segs[i][1], i) for i in range(len(segs) - 1))[::-1][:k]
    bnd = sorted(i for _, i in ig)
    if len(bnd) < k:   # 停顿不够：后面几个短语并到一起
        parts = parts[:len(bnd)] + ['，'.join(parts[len(bnd):])]
    ph = []; s0 = 0
    for j, c in enumerate(bnd + [len(segs) - 1]): ph.append([parts[j], round(segs[s0][0], 3), round(segs[c][1], 3)]); s0 = c + 1
    res.append({'text': text, 'ph': ph})
print(json.dumps(res, ensure_ascii=False, indent=0))
