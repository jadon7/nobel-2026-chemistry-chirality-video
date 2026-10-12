# assemble_vo.py —— 把整段旁白（take2_Charon.wav）按句切开，按 GAPS 重新排时间，输出：
#   素材/tts/narration.wav（48k 单声道）和 代码/timeline.js（每句、每个短语在成片里的起止秒数）
# 切点来自 silencedetect（-38dB, 0.18s），逐句转写 + 拼音核对过。
import json, subprocess, os
P = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(P, '素材/tts/take2_Charon.wav')
# 每句：字幕原文、关键词（字幕金色）、短语 [(文字, 起, 止)]（原始音频里的秒数）
LINES = [
 ('1957年末，一种药被用来缓解孕妇的孕吐。', ['1957年末'], [('1957年末', .35, 1.47), ('一种药', 1.88, 2.42), ('被用来缓解孕妇的孕吐', 2.71, 4.65)]),
 ('它叫反应停。', ['反应停'], [('它叫反应停', 5.51, 6.79)]),
 ('1958 年后，一部分服过药的母亲', ['1958 年后'], [('1958 年后', 7.78, 8.74), ('一部分服过药的母亲', 9.07, 10.56)]),
 ('有的生下孩子手臂短小，有的缺少肢体', [], [('有的生下孩子手臂短小', 10.95, 13.09), ('有的', 13.60, 13.95), ('缺少肢体', 14.23, 15.13)]),
 ('这种药的分子，藏着一个容易被忽略的差异', ['差异'], [('这种药的分子', 16.08, 17.24), ('藏着一个容易被忽略的差异', 17.57, 19.86)]),
 ('同样的原子，可以组成两种互为镜像的结构', ['互为镜像'], [('同样的原子', 20.74, 21.69), ('可以组成两种互为镜像的结构', 22.04, 24.71)]),
 ('就像左手和右手，看起来相似，却不能完全重合', ['左手', '右手'], [('就像', 25.49, 25.94), ('左手和右手', 26.15, 27.27), ('看起来相似', 27.62, 28.69), ('却不能完全重合', 29.16, 30.82)]),
 ('作为药物，与人的身体作用也可能不同', ['可能不同'], [('作为药物', 31.75, 32.63), ('与人的身体作用', 32.93, 34.15), ('也可能不同', 34.41, 35.27)]),
 ('在制药时，怎样才能制作更多我们想要的分子类型？', ['我们想要的'], [('在制药时', 36.12, 37.01), ('怎样才能制作更多我们想要的分子类型', 37.39, 40.83)]),
 ('今年十月七日，诺贝尔化学奖颁给了卡根和硤合宪三。', ['诺贝尔化学奖'], [('今年十月七日', 41.74, 42.81), ('诺贝尔化学奖', 43.22, 44.29), ('颁给了卡根和硤合宪三', 44.54, 46.70)]),
 ('他们的研究，就是在把化学反应能够把微小的差别放大，让结果偏向其中一边', ['放大'], [('他们的研究', 47.51, 48.27), ('就是在把化学反应', 48.60, 50.02), ('能够把微小的差别放大', 50.31, 52.26), ('让结果', 52.74, 53.36), ('偏向其中一边', 53.56, 54.65)]),
 ('这些分子，究竟是怎么做到的？', ['怎么做到'], [('这些分子', 55.54, 56.26), ('究竟', 56.69, 57.18), ('是怎么做到的', 57.44, 58.38)]),
]
PRE = 1.4                                                    # 开场留白（片头画面先走）
GAPS = [.6, 1.0, .35, 2.0, .6, .6, 1.5, .7, 1.8, .8, .8]     # 第 i 句结束到第 i+1 句开始
TAIL = 2.4
PAD_A, PAD_B = .10, .14
SR = 48000
out = []; t = PRE; parts = []
for i, (text, gold, ph) in enumerate(LINES):
    a0, b0 = ph[0][1], ph[-1][2]
    off = t - a0
    seg = f'/tmp/_vo_{i}.wav'
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', SRC, '-ss', f'{a0 - PAD_A:.3f}', '-to', f'{b0 + PAD_B:.3f}', '-af', f'afade=t=in:d=0.02,areverse,afade=t=in:d=0.04,areverse', '-ar', str(SR), '-ac', '1', seg], check=True)
    parts.append((t - PAD_A, seg))
    out.append({'i': i + 1, 'text': text, 'gold': gold, 'a': round(t, 3), 'b': round(b0 + off, 3), 'ph': [[p, round(x + off, 3), round(y + off, 3)] for p, x, y in ph]})
    t = b0 + off + (GAPS[i] if i < len(GAPS) else TAIL)
DUR = round(t, 2)
# 合成：每段 adelay 到位再 amix
inputs = []; flt = []
for k, (st, seg) in enumerate(parts):
    inputs += ['-i', seg]; ms = int(round(st * 1000)); flt.append(f'[{k}]adelay={ms}|{ms}[d{k}]')
flt.append(''.join(f'[d{k}]' for k in range(len(parts))) + f'amix=inputs={len(parts)}:normalize=0,apad=whole_dur={DUR}[o]')
dst = os.path.join(P, '素材/tts/narration.wav')
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', *inputs, '-filter_complex', ';'.join(flt), '-map', '[o]', '-ar', str(SR), '-ac', '1', '-t', str(DUR), dst], check=True)
for _, seg in parts: os.remove(seg)
js = '// timeline.js —— 由 _gen/assemble_vo.py 生成，不要手改。旁白 Charon，每句/每个短语在成片里的起止秒数\n'
js += f'const VO_DUR = {DUR};\nconst VO = {json.dumps(out, ensure_ascii=False, indent=0)};\n'
open(os.path.join(P, '代码/timeline.js'), 'w').write(js)
for o in out: print(f"L{o['i']:>2} {o['a']:6.2f}–{o['b']:6.2f}  {o['text']}")
print('DUR', DUR)
