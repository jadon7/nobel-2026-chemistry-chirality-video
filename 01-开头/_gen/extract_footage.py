# extract_footage.py —— 把选中的老影像片段抽成灰度 jpg 序列（30 帧/秒），写 代码/footdata.js
# 用法: python3 -I extract_footage.py        （片段清单在下面 CLIPS；素材文件在 素材/footage/，来源见 素材/footage/manifest.json）
# 下载来的视频只用 ffmpeg 读，不执行任何东西。
import json, os, subprocess, shutil, sys
P = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC, DST = os.path.join(P, '素材/footage'), os.path.join(P, '素材/footage_frames')
# 名字: [文件, 入点秒, 出点秒, 预处理滤镜(裁黑边等，在缩放之前)]
CLIPS = json.load(open(os.path.join(P, '_gen/footage_cut.json')))
meta = {}
for name, (f, a, b, extra) in CLIPS.items():
    out = os.path.join(DST, name); shutil.rmtree(out, ignore_errors=True); os.makedirs(out)
    vf = (extra + ',' if extra else '') + 'fps=30,scale=1440:-2:flags=lanczos,format=gray,eq=contrast=1.06'
    subprocess.run(['/opt/homebrew/bin/ffmpeg', '-y', '-loglevel', 'error', '-ss', str(a), '-to', str(b), '-i', os.path.join(SRC, f), '-vf', vf, '-q:v', '3', os.path.join(out, 'f_%04d.jpg')], check=True)
    n = len([x for x in os.listdir(out) if x.endswith('.jpg')])
    w, h = subprocess.check_output(['/opt/homebrew/bin/ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', os.path.join(out, 'f_0001.jpg')]).decode().strip().split(',')
    meta[name] = {'n': n, 'w': int(w), 'h': int(h)}
    print(f'{name:10s} {f}  {a}-{b}s  {n} 帧  {w}x{h}')
open(os.path.join(P, '代码/footdata.js'), 'w').write('// footdata.js —— 由 _gen/extract_footage.py 生成：老影像帧序列（30 帧/秒，灰度）\nconst FOOT = ' + json.dumps(meta, ensure_ascii=False) + ';\n')
