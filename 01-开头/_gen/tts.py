# tts.py —— OpenRouter Gemini 3.8 Flash TTS 生成旁白（整段一次读完，语气连贯）
# 用法: python3 tts.py <音色> <输出wav> [文本文件]    key 从环境变量 OR_KEY 读
import json, os, sys, subprocess, urllib.request
voice, out = sys.argv[1], sys.argv[2]
text = open(sys.argv[3]).read().strip() if len(sys.argv) > 3 else open(os.path.join(os.path.dirname(__file__), 'narration.txt')).read().strip()
INSTR = os.environ.get('TTS_INSTR', '你是一部严肃、精致的中文科普纪录片的旁白。用沉稳、克制、低声叙述的语气朗读，语速适中偏慢，句与句之间自然停顿，空行处停顿更长。讲到孩子出生缺陷时语气放低、带着尊重和沉重；讲到“同样的原子”“左手和右手”时清楚而有好奇感；讲到诺贝尔奖时稍微提起精神；最后一句是一个引人好奇的追问。')
body = json.dumps({'model': 'google/gemini-3.8-flash-tts', 'input': text, 'voice': voice, 'response_format': 'pcm', 'instructions': INSTR}).encode()
req = urllib.request.Request('https://openrouter.ai/api/v1/audio/speech', data=body, headers={'Authorization': 'Bearer ' + os.environ['OR_KEY'], 'Content-Type': 'application/json'})
pcm = urllib.request.urlopen(req, timeout=300).read()
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 's16le', '-ar', '24000', '-ac', '1', '-i', '-', out], input=pcm, check=True)
print(out, len(pcm) / 48000, 's')
