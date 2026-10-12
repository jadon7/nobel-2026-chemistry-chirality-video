# align2.py —— 用 whisper.cpp（large-v3-turbo）逐 token 时间戳，把原文逐字对齐到旁白，切出句子和短语的起止时间
# 用法: python3 align2.py <wav> <文本文件>  → 打印 JSON：[{text, ph:[[短语, 起, 止], ...], heard}, ...]；句子之间以 whisper 句段 + 静音为准
import re, subprocess, sys, json, os, difflib, tempfile
wav, txtf = sys.argv[1], sys.argv[2]
lines = [l.strip() for l in open(txtf) if l.strip()]
tmp = tempfile.mkdtemp(); w16 = os.path.join(tmp, 'a.wav')
subprocess.run(['/opt/homebrew/bin/ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-ar', '16000', '-ac', '1', w16], check=True)
subprocess.run(['whisper-cli', '-m', os.path.expanduser('~/.cache/whisper-cpp/ggml-large-v3-turbo.bin'), '-l', 'zh', '-ojf', '-of', os.path.join(tmp, 'o'), '-f', w16, '--prompt', '以下是普通话的句子。'], capture_output=True)
d = json.loads(open(os.path.join(tmp, 'o.json'), 'rb').read().decode('utf-8', 'replace'))
# 逐字时间：多字 token 均分；被拆开的汉字（�）合并成一个占位字
chars = []   # (字, 起, 止)
for s in d['transcription']:
    for t in s.get('tokens', []):
        x = t['text']
        if x.startswith('[_'): continue
        a, b = t['offsets']['from'] / 1000, t['offsets']['to'] / 1000
        x = re.sub(r'�+', '�', x)
        if x == '�' and chars and chars[-1][0] == '�' and chars[-1][3]: chars[-1] = ('�', chars[-1][1], b, False); continue
        n = max(1, len(x))
        for k, c in enumerate(x): chars.append((c, a + (b - a) * k / n, a + (b - a) * (k + 1) / n, c == '�'))
PUN = set('，。、；？！,.;?!“”"：: ')
hz = [(c, a, b) for c, a, b, _ in chars if c not in PUN]
heard = ''.join(c for c, _, _ in hz)
# 静音
out = subprocess.run(['/opt/homebrew/bin/ffmpeg', '-hide_banner', '-i', wav, '-af', 'silencedetect=noise=-38dB:d=0.12', '-f', 'null', '-'], capture_output=True, text=True).stderr
sil = list(zip([float(x) for x in re.findall(r'silence_start: ([\d.]+)', out)], [float(x) for x in re.findall(r'silence_end: ([\d.]+)', out)]))
def snap(t, side):   # 把边界贴到附近的静音边缘：起点贴 silence_end，止点贴 silence_start
    best = t
    for a, b in sil:
        e = b if side == 'a' else a
        if abs(e - t) < .45 and abs(e - t) < abs(best - t) + 1e-9: best = e
    return best
script = ''.join(c for c in ''.join(lines) if c not in PUN)
sm = difflib.SequenceMatcher(None, script, heard, autojunk=False)
tm = [None] * len(script)
for blk in sm.get_matching_blocks():
    for k in range(blk.size): tm[blk.a + k] = (hz[blk.b + k][1], hz[blk.b + k][2])
# 没匹配上的字：前后插值
known = [i for i, v in enumerate(tm) if v]
for i in range(len(tm)):
    if tm[i]: continue
    p = max([k for k in known if k < i], default=None); n = min([k for k in known if k > i], default=None)
    if p is None: tm[i] = tm[n]
    elif n is None: tm[i] = tm[p]
    else: f = (i - p) / (n - p); tm[i] = (tm[p][1] + (tm[n][0] - tm[p][1]) * f, tm[p][1] + (tm[n][0] - tm[p][1]) * f)
res = []; ci = 0
for line in lines:
    parts = [p for p in re.split(r'[，；？。]', line) if p.strip()]
    ph = []
    for p in parts:
        n = sum(1 for c in p if c not in PUN)
        a, b = tm[ci][0], tm[ci + n - 1][1]; ci += n
        ph.append([p, round(snap(a, 'a'), 3), round(snap(b, 'b'), 3)])
    # 句首句尾以真实静音为准（whisper 的字时间会偏早，句尾的字容易被切掉）
    big = [(a, b) for a, b in sil if b - a >= .22]
    e = ph[-1][2]; inside = [a for a, b in big if a <= e <= b]
    if inside: e2 = inside[0]
    else: nxt = [a for a, b in big if a >= e - .15]; e2 = nxt[0] if nxt and nxt[0] - e < 1.3 else e
    ph[-1][2] = round(e2, 3)
    st = ph[0][1]; inside = [b for a, b in big if a <= st <= b]; ahead = [b for a, b in big if st - .05 <= a <= st + .45]
    if inside: s2 = inside[-1]
    elif ahead: s2 = ahead[0]
    else: prv = [b for a, b in big if b <= st + .15]; s2 = prv[-1] if prv and st - prv[-1] < 1.0 else st
    ph[0][1] = round(s2, 3)
    # 短语太短（边界挪动后）：短语尾延到其后第一个停顿，下一个短语从停顿结束开始
    for j in range(len(ph) - 1):
        if ph[j][2] < ph[j][1] + .25:
            nx = [(a, b) for a, b in sil if a >= ph[j][1] + .2 and a < ph[j + 1][2] - .25]
            if nx: ph[j][2] = round(nx[0][0], 3); ph[j + 1][1] = round(max(ph[j + 1][1], nx[0][1]), 3)
            else:   # 没有停顿：按字数比例分
                n0 = len(ph[j][0]); n1 = len(ph[j + 1][0]); mid = ph[j][1] + (ph[j + 1][2] - ph[j][1]) * n0 / (n0 + n1)
                ph[j][2] = round(mid, 3); ph[j + 1][1] = round(mid + .05, 3)
    for j in range(len(ph) - 1):   # 保证单调
        if ph[j + 1][1] < ph[j][2]: ph[j + 1][1] = ph[j][2]
    res.append({'text': line, 'ph': ph})
# 读错检查：原文 vs 听到的
diff = [(script[i1:i2], heard[j1:j2]) for op, i1, i2, j1, j2 in sm.get_opcodes() if op != 'equal']
print(json.dumps({'lines': res, 'diff': diff}, ensure_ascii=False))
