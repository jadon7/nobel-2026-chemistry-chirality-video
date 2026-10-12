# mux_final.py —— 两遍 loudnorm（-16 LUFS / -1.5 dBTP），和无声全片合成：全片_配乐旁白版.mp4、全片_纯配乐版.mp4
import subprocess, json, re, os, sys
P = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); FF = '/opt/homebrew/bin/ffmpeg'
for src, dst in [('mix_vo_bgm', '全片_配乐旁白版'), ('mix_bgm_only', '全片_纯配乐版')]:
    a = os.path.join(P, '素材/music', src + '.wav')
    out = subprocess.run([FF, '-hide_banner', '-i', a, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
    m = json.loads(out[out.rindex('{'):out.rindex('}') + 1])
    af = f"loudnorm=I=-16:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true"
    subprocess.run([FF, '-y', '-hide_banner', '-loglevel', 'error', '-i', os.path.join(P, '成片/全片.mp4'), '-i', a, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-af', af, '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-shortest', '-movflags', '+faststart', os.path.join(P, '成片', dst + '.mp4')], check=True)
    r = subprocess.run([FF, '-hide_banner', '-i', os.path.join(P, '成片', dst + '.mp4'), '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    print(dst, re.findall(r'I:\s+(-?[\d.]+) LUFS', r)[-1], 'LUFS', re.findall(r'Peak:\s+(-?[\d.]+) dBFS', r)[-1], 'dBTP')
