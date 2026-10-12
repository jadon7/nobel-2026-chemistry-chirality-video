# mix_audio.py —— 配乐 + 旁白混音，和纯配乐版
# 配乐压低按旁白时间轴（代码/timeline.js）精确做：每句 [起-0.15, 止+0.35] 内配乐再降 DUCK dB，进出各 0.3 秒渐变
# 输出：素材/music/mix_vo_bgm.wav（配乐+旁白）、素材/music/mix_bgm_only.wav（纯配乐），之后用 ffmpeg loudnorm 统一到 -16 LUFS
import numpy as np, wave, json, os
P = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
BGM_GAIN_DB = -11.0     # 配乐整体（原曲母带很响，约 -10 LUFS）
DUCK_DB = -8.0          # 旁白时再压低
RAMP = .3
def rd(p):
    w = wave.open(p); ch = w.getnchannels(); x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    assert w.getframerate() == SR, p
    return x.reshape(-1, ch)
vo = rd(os.path.join(P, '素材/tts/narration_full.wav'))[:, 0]
bgm = rd(os.path.join(P, '素材/music/bgm_full.wav'))
src = open(os.path.join(P, '代码/timeline.js')).read(); VO = json.loads(src[src.index('const VO = ') + 11:src.rindex(';')])
n = max(len(vo), len(bgm)); vo = np.pad(vo, (0, n - len(vo))); bgm = np.pad(bgm, ((0, n - len(bgm)), (0, 0)))
# 压低包络（dB）
duck = np.zeros(n, np.float32)
for v in VO:
    a, b = int((v['a'] - .15) * SR), int((v['b'] + .35) * SR)
    duck[max(0, a):min(n, b)] = 1
# 包络平滑：0.3 秒的线性渐变（用累加实现移动平均）
k = int(RAMP * SR); c = np.cumsum(np.concatenate([[0], duck])); sm = (c[k:] - c[:-k]) / k; sm = np.concatenate([sm, np.full(n - len(sm), sm[-1])])
sm = np.roll(sm, -k // 2)
gain = 10 ** ((BGM_GAIN_DB + DUCK_DB * sm) / 20)
mix = bgm * gain[:, None] + vo[:, None]
only = bgm * 10 ** (BGM_GAIN_DB / 20)
def wr(p, y):
    pk = np.abs(y).max(); y = y / max(1.0, pk / .98)
    with wave.open(p, 'wb') as o: o.setnchannels(2); o.setsampwidth(2); o.setframerate(SR); o.writeframes((y * 32767).astype(np.int16).tobytes())
wr(os.path.join(P, '素材/music/mix_vo_bgm.wav'), mix); wr(os.path.join(P, '素材/music/mix_bgm_only.wav'), only)
print('ok', n / SR)
