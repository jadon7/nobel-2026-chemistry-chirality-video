# assemble_full.py —— 全片旁白：开头 12 句（take2_Charon，时间和开头版完全一致）+ 后 32 句（take_A~D，按 align_*.json 的短语时间）
# 输出 素材/tts/narration_full.wav（48k 单声道）和 代码/timeline.js（44 句，每句/每个短语在成片里的起止秒数）
# 两处单独重配的句子：B 段第 1 句（原来"宪三"读成 xian cai）、C 段第 5 句（原来"99.75"读成九十九点五七）
import json, subprocess, os, re, importlib.util
P = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TTS = os.path.join(P, '素材/tts')
SR = 48000
# —— 开头 12 句：直接沿用 assemble_vo.py 里的数据 ——
spec = importlib.util.spec_from_file_location('vo', os.path.join(P, '_gen/assemble_vo_data.py')); vo = importlib.util.module_from_spec(spec); spec.loader.exec_module(vo)

def last_speech_end(wav):
    out = subprocess.run(['/opt/homebrew/bin/ffmpeg', '-hide_banner', '-i', wav, '-af', 'silencedetect=noise=-38dB:d=0.12', '-f', 'null', '-'], capture_output=True, text=True).stderr
    dur = float(subprocess.check_output(['/opt/homebrew/bin/ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', wav]).decode())
    st = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', out)]; en = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', out)]
    return st[-1] if len(st) > len(en) else dur

# 后半段：每句 (原文, 金色关键词)。原文和飞书稿一致（"硤"在字幕里保留）
NEW = [
 ('1986年，卡根和同事做实验时，发现了一件反常的事。', ['1986年', '反常']),
 ('他们用来推动反应的催化剂，混着“左手”和“右手”两种。', ['“左手”', '“右手”']),
 ('原本以为，催化剂掺了另一种，做出的分子也会跟着掺进去。', ['也会跟着掺进去']),
 ('可在其中一类反应里，产物对某一边的偏向，比预想的更强。', ['比预想的更强']),
 ('混着用，怎么还能把差距拉大？', ['拉大']),
 ('把两类催化剂画成红色和蓝色，用一个简化模型来看。', ['红色', '蓝色']),
 ('它们有时会结合成小组。', ['小组']),
 ('红红一组、蓝蓝一组，推动反应的能力强；红蓝一组，能力却弱。', ['能力强', '能力却弱']),
 ('这样一来，瓶里有多少红色、多少蓝色，就不能直接决定结果。', ['不能直接决定']),
 ('还要看，它们和谁组在一起。', ['和谁组在一起']),
 ('原来只多一点的那一边，就可能造出多得多的同类产物。', ['多得多']),
 ('硤合宪三研究的反应，又多了一步。', ['又多了一步']),
 ('刚做出来的分子，还能回头帮忙，生成更多和自己一样的分子。', ['回头帮忙']),
 ('就像一台机器走下生产线，转身加入生产，继续制造同款机器。', ['同款机器']),
 ('但这条路起初没有走通。', ['没有走通']),
 ('1990年，他已经做出了这样的反应。', ['1990年']),
 ('新分子确实能帮忙，可新产物的左右差距，反而比起点更小了。', ['更小了']),
 ('机器造得更多，不代表想要的那一款，占比也会更高。', ['占比']),
 ('五年后，团队找到另一套分子体系，局面才变了。', ['局面才变了']),
 ('原本略多的那一边，生成更多同类；这些新产物继续参与催化，推动下一批同类生成。', ['生成更多同类']),
 ('一轮接一轮，数量增加，左右两边的差距也在扩大。', ['差距也在扩大']),
 ('那起点的差距，究竟能小到什么程度？', ['小到什么程度']),
 ('2003年发表的一项实验里，他们把两种镜像分子配得几乎各占一半。', ['2003年', '各占一半']),
 ('其中一种只比另一种多出一点，差距小到常用仪器都分辨不出来。', ['分辨不出来']),
 ('研究者用这批分子启动反应，再把产物用来继续反应。', ['继续反应']),
 ('三轮之后，原来略多的那一种，占比超过了99.75%。', ['99.75%']),
 ('如果把起点画成红蓝两色的圆饼，两边看起来几乎一样大。', ['几乎一样大']),
 ('到了终点，几乎整张圆饼都成了同一种颜色。', ['同一种颜色']),
 ('人没有把另一种分子逐个挑走。', ['逐个挑走']),
 ('他们找到了一种反应，让一点微小的领先，随着新分子的生成不断扩大。', ['不断扩大']),
 ('这给制造特定结构的分子，提供了新的办法。', ['新的办法']),
 ('但回到反应停，左右两种形式进入人体后还会相互转化，分开它们，并不等于解决了安全问题。', ['相互转化']),
]
# 每句的音频来源和短语时间
src = []
for sec in 'ABCD':
    d = json.load(open(os.path.join(TTS, f'align_{sec}.json')))
    for l in d['lines']: src.append([f'take_{sec}.wav', l['ph']])
fixes = {11: 'fix_b1', 25: 'fix_c5'}   # NEW 里的序号（从 0 起）
for k, name in fixes.items():
    ph = json.load(open(os.path.join(TTS, f'align_{name}.json')))['lines'][0]['ph']
    ph[-1][2] = max(ph[-1][2], last_speech_end(os.path.join(TTS, name + '.wav')))
    src[k] = [name + '.wav', ph]
assert len(src) == len(NEW), (len(src), len(NEW))
# 短语文字换成字幕原文的切法（TTS 文本里"峡""百分之九十九点七五"只是读音用的）
for k, (text, gold) in enumerate(NEW):
    parts = [p for p in re.split(r'[，；？。]', text) if p.strip()]
    assert len(parts) == len(src[k][1]), (text, src[k][1])
    for j, p in enumerate(parts): src[k][1][j][0] = p
# 句间停顿（第 i 句结束 → 第 i+1 句开始），i 是全片句号（1..44）；没写的默认 0.6
GAP = {12: 2.6, 13: .7, 14: .7, 15: .6, 16: .7, 17: 1.7, 18: .6, 19: .5, 20: .8, 21: .5, 22: .6, 23: 2.2,
       24: .6, 25: .6, 26: 1.5, 27: .5, 28: .6, 29: .7, 30: 1.5, 31: .6, 32: .6, 33: 2.2,
       34: .7, 35: .7, 36: .9, 37: .6, 38: 1.2, 39: .6, 40: 2.2, 41: .6, 42: .7, 43: .9}
TAIL = 4.0
# 动画是按这一版的句子起点设计的：每句仍从这里开始（比前一句结尾至少晚 0.35 秒）
OLD_START = {13: 63.54, 14: 69.58, 15: 74.93, 16: 80.95, 17: 87.47, 18: 92.06, 19: 97.42, 20: 100.17, 21: 108.28, 22: 114.34, 23: 117.45,
  24: 125.06, 25: 129.28, 26: 135.88, 27: 144.00, 28: 146.94, 29: 151.85, 30: 159.44, 31: 166.62, 32: 171.65, 33: 180.50,
  34: 188.54, 35: 192.93, 36: 200.66, 37: 208.19, 38: 214.66, 39: 222.97, 40: 229.41, 41: 236.94, 42: 240.66, 43: 248.56, 44: 253.85}
DUR_MIN = 269.77
PAD_A, PAD_B = .10, .16
out = []; parts = []
# 开头 12 句：时间和开头版一样
t = vo.PRE
for i, (text, gold, ph) in enumerate(vo.LINES):
    a0, b0 = ph[0][1], ph[-1][2]; off = t - a0
    parts.append((t - PAD_A, 'take2_Charon.wav', a0 - PAD_A, b0 + .14))
    out.append({'i': i + 1, 'text': text, 'gold': gold, 'a': round(t, 3), 'b': round(b0 + off, 3), 'ph': [[p, round(x + off, 3), round(y + off, 3)] for p, x, y in ph]})
    t = b0 + off + (vo.GAPS[i] if i < len(vo.GAPS) else GAP[12])
prev_end = out[-1]['b']
for k, (text, gold) in enumerate(NEW):
    i = 13 + k; wav, ph = src[k]
    t = max(OLD_START.get(i, t), prev_end + .35)
    a0, b0 = ph[0][1], ph[-1][2]; off = t - a0
    parts.append((t - PAD_A, wav, max(0, a0 - PAD_A), b0 + PAD_B))
    out.append({'i': i, 'text': text, 'gold': gold, 'a': round(t, 3), 'b': round(b0 + off, 3), 'ph': [[p, round(x + off, 3), round(y + off, 3)] for p, x, y in ph]})
    prev_end = b0 + off
    t = b0 + off + GAP.get(i, .6) if i < 44 else b0 + off + TAIL
DUR = round(max(t, DUR_MIN), 2)
segs = []; flt = []; inputs = []
for k, (st, wav, a, b) in enumerate(parts):
    seg = f'/tmp/_vof_{k}.wav'
    subprocess.run(['/opt/homebrew/bin/ffmpeg', '-y', '-loglevel', 'error', '-i', os.path.join(TTS, wav), '-ss', f'{a:.3f}', '-to', f'{b:.3f}', '-af', 'afade=t=in:d=0.02,areverse,afade=t=in:d=0.05,areverse', '-ar', str(SR), '-ac', '1', seg], check=True)
    segs.append(seg); inputs += ['-i', seg]; ms = int(round(st * 1000)); flt.append(f'[{k}]adelay={ms}|{ms}[d{k}]')
flt.append(''.join(f'[d{k}]' for k in range(len(segs))) + f'amix=inputs={len(segs)}:normalize=0,apad=whole_dur={DUR}[o]')
fs = os.path.join(TTS, '_filter.txt'); open(fs, 'w').write(';'.join(flt))
subprocess.run(['/opt/homebrew/bin/ffmpeg', '-y', '-loglevel', 'error', *inputs, '-filter_complex_script', fs, '-map', '[o]', '-ar', str(SR), '-ac', '1', '-t', str(DUR), os.path.join(TTS, 'narration_full.wav')], check=True)
os.remove(fs); [os.remove(s) for s in segs]
js = '// timeline.js —— 由 _gen/assemble_full.py 生成，不要手改。旁白 Charon，每句/每个短语在成片里的起止秒数（前 12 句和开头版一致）\n'
js += f'const VO_DUR = {DUR};\nconst VO = {json.dumps(out, ensure_ascii=False, indent=0)};\n'
open(os.path.join(P, '代码/timeline.js'), 'w').write(js)
for o in out: print(f"L{o['i']:>2} {o['a']:7.2f}–{o['b']:7.2f}  {o['text']}")
print('DUR', DUR)
