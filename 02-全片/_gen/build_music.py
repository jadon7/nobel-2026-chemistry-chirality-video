# build_music.py —— 把抖音视频里的配乐（和乐府《千年之后（氛围版）》，视频里只有 130 秒）铺满全片 269.8 秒
# 结构：第 1 遍 0→a1 原样 → 在最后一段里找"可互换"的点往回循环 → 171.5 秒左右回到前奏，让第 2 次 drop 落在 188.5 秒（2003 年实验段开头）
#       → 第 2 遍一直放到片尾，最后几秒淡出。接缝都选在前后几秒频谱最相似的地方，做等功率交叉淡化。
# 输出：素材/music/bgm_full.wav（48k 立体声）和接缝报告
import numpy as np, wave, os, json, subprocess, sys
P = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(P, '素材/music/qiannian_zhihou_ambient_douyin.wav')
DUR = 269.77
DROP_TARGET = 188.54          # 第 34 句"那起点的差距"
w = wave.open(SRC); sr = w.getframerate(); n = w.getnframes()
x = np.frombuffer(w.readframes(n), dtype=np.int16).reshape(-1, 2).astype(np.float32) / 32768
mono = x.mean(1)
# —— 特征：48 个对数频带的短时谱 ——
hop, win = 1024, 4096
fr = (len(mono) - win) // hop
F = np.zeros((fr, 48), np.float32); edges = np.geomspace(30, sr / 2, 49)
freqs = np.fft.rfftfreq(win, 1 / sr); bins = [np.where((freqs >= edges[i]) & (freqs < edges[i + 1]))[0] for i in range(48)]
hann = np.hanning(win).astype(np.float32)
for i in range(fr):
    s = np.abs(np.fft.rfft(mono[i * hop:i * hop + win] * hann)) ** 2
    F[i] = [np.log(s[b].sum() + 1e-9) for b in bins]
F = (F - F.mean(0)) / (F.std(0) + 1e-6)
fps = sr / hop
def sim(a, b, w_s=2.5):   # a、b 两个时间点前后 w_s 秒的平均相关
    ia, ib, k = int(a * fps), int(b * fps), int(w_s * fps)
    if ia - k < 0 or ib - k < 0 or ia + k >= fr or ib + k >= fr: return -1
    A, B = F[ia - k:ia + k], F[ib - k:ib + k]
    return float((A * B).sum() / (np.linalg.norm(A) * np.linalg.norm(B) + 1e-9))
def best_pair(arange, brange, dmin, dmax, step=0.046):
    best = (-2, 0, 0)
    for a in np.arange(*arange, step):
        for b in np.arange(*brange, step):
            if not (dmin <= a - b <= dmax): continue
            s = sim(a, b)
            if s > best[0]: best = (s, a, b)
    return best
# drop：16–18 秒之间能量跳升最大的地方
e = np.array([np.sqrt(np.mean(mono[int(t * sr):int((t + .05) * sr)] ** 2)) for t in np.arange(15.5, 18.5, .01)])
drop = 15.5 + .01 * int(np.argmax(np.diff(20 * np.log10(e + 1e-9))) + 1)
F2 = DROP_TARGET - drop      # 第 2 遍从前奏开始的成片时刻
# 第 1 个接缝：第 1 遍末尾 a1 ∈ [116,127] 跳回 b1 ∈ [94,110]
s1, a1, b1 = best_pair((116, 127), (94, 110), 18, 30)
# 第 2 个接缝：循环里再跳一次（如果需要更多长度）
seg = []   # (成片起点, 源起点, 源终点)
t = 0.0; seg.append((0.0, 0.0, a1)); t = a1
L = a1 - b1
while t + L < F2 - 1.0:
    seg.append((t, b1, a1)); t += L
# 最后一段循环截到 F2（这里用 2 秒交叉淡化接前奏）
seg.append((t, b1, b1 + (F2 - t) + 1.0))
seg.append((F2, 0.0, DUR - F2))
XF = .35     # 普通接缝交叉淡化
XF_INTRO = 2.0
out = np.zeros((int(DUR * 48000) + 48000, 2), np.float32)
def take(s0, s1_):   # 取源音频（重采样到 48k）
    i0, i1 = int(s0 * sr), int(s1_ * sr); seg_ = x[i0:i1]
    idx = np.linspace(0, len(seg_) - 1, int(len(seg_) * 48000 / sr)); return np.stack([np.interp(idx, np.arange(len(seg_)), seg_[:, c]) for c in (0, 1)], 1).astype(np.float32)
for k, (ft, s0, s1_) in enumerate(seg):
    xf_in = 0 if k == 0 else (XF_INTRO if s0 == 0.0 else XF)
    xf_out = 0 if k == len(seg) - 1 else (XF_INTRO if seg[k + 1][1] == 0.0 else XF)
    a = take(max(0, s0 - xf_in / 2), s1_ + xf_out / 2)
    m = len(a); env = np.ones(m, np.float32)
    ni, no = int(xf_in * 48000), int(xf_out * 48000)
    if ni: env[:ni] = np.sin(np.linspace(0, np.pi / 2, ni))
    if no: env[-no:] *= np.cos(np.linspace(0, np.pi / 2, no))
    st = int((ft - xf_in / 2) * 48000) if k else 0
    out[st:st + m] += a * env[:, None]
out = out[:int(DUR * 48000)]
# 片尾淡出（最后 5 秒）
nf = int(5.0 * 48000); out[-nf:] *= np.linspace(1, 0, nf)[:, None] ** 1.5
pk = np.abs(out).max(); out /= max(1.0, pk / .97)
dst = os.path.join(P, '素材/music/bgm_full.wav')
with wave.open(dst, 'wb') as o:
    o.setnchannels(2); o.setsampwidth(2); o.setframerate(48000); o.writeframes((out * 32767).astype(np.int16).tobytes())
rep = {'drop_in_source': round(drop, 3), 'intro_restart_at': round(F2, 3), 'splice1': {'from_src': round(a1, 3), 'to_src': round(b1, 3), 'similarity': round(s1, 3)}, 'segments': [[round(a, 3), round(b, 3), round(c, 3)] for a, b, c in seg]}
json.dump(rep, open(os.path.join(P, '素材/music/bgm_full.json'), 'w'), ensure_ascii=False, indent=1)
print(json.dumps(rep, ensure_ascii=False))
