# 反应停与分子的左右 · 2026 诺贝尔化学奖科普视频（代码生成）

一期 4 分 30 秒的中文科普视频的全部源码和素材：从 1957 年的反应停讲到手性，再讲 2026 年诺贝尔化学奖（Henri B. Kagan、硤合宪三 Kenso Soai：不对称有机合成中的非线性效应和自催化）。

画面全部由代码逐帧绘制（Canvas），组合三种表达：
- **杂志插画**：Codex 内置 imagegen 生成，颗粒点彩、深蓝底、边缘光；
- **老影像**：公有领域的 1940–80 年代纪录片片段，调成双色调，加片门抖动、灰尘划痕；
- **数据 / 分子可视化**：PubChem 真实 3D 构象的球棍模型、镜像对比、比例条、曲线图、圆饼等，数字来自原始论文。

旁白用 OpenRouter 上的 Gemini 3.8 Flash TTS 生成。

## 目录

| 路径 | 内容 |
|---|---|
| `01-开头/` | 开头 12 句（63 秒）的第 1 版，单独交付过的版本 |
| `02-全片/` | **全片**（44 句，269.8 秒），最新版本以这里为准 |
| `02-全片/说明.md` | 每句对应的画面、数据来源、素材授权、口播稿修改建议 |
| `02-全片/代码/` | 动画代码：`main.js` 主控，`s1.js`–`s12.js` 十二场，`mol.js` 分子渲染，`film.js` 老影像处理，`fx*.js` 通用组件 |
| `02-全片/_gen/` | 生图提示词（`*.txt`、`gen.sh`）、旁白生成与对齐（`tts.py`、`align2.py`、`assemble_full.py`）、老影像抽帧（`extract_footage.py`、`footage_cut.json`） |
| `02-全片/素材/` | 插画（`ai/`）、老影像原片（`footage/`）、照片（`photos/`）、分子构象（`mol/`）、旁白（`tts/`） |
| `00_进展.md` | 制作过程记录 |

## 重新渲染

需要：Node.js、Google Chrome、ffmpeg（`/opt/homebrew/bin/ffmpeg`）、Python 3。仓库里已经带了老影像抽帧、照片、字体等全部渲染资源，克隆下来可以直接渲染。

```bash
cd 02-全片/代码
npm i playwright-core
node render.cjs                          # 约 25–30 分钟 → ../成片/全片.mp4 和 全片_旁白版.mp4
node render.cjs --snap 66,128            # 只截几帧看效果
```

浏览器里直接看某一帧：在 `02-全片/` 起一个静态服务器，打开 `代码/index.html?ts=1&t=128`。

改了老影像的入点/出点（`_gen/footage_cut.json`）后，运行 `python3 -I _gen/extract_footage.py` 重新抽帧。重新配旁白需要 OpenRouter 的 key（环境变量 `OR_KEY`），仓库里没有任何密钥。

仓库里**只有渲染好的视频没放**（`成片/`，单个约 1 GB），用 `node render.cjs` 重新渲染即可。

## 素材授权

内部制作用，以下授权情况供发布前统一处理时参考（逐项原文见 `02-全片/说明.md`、`素材/photos/manifest.json`、`素材/footage/manifest*.json`）：


- **老影像**：来自 [movingimagearchive.com](https://www.movingimagearchive.com/)（标注公有领域）和 archive.org Prelinger 馆藏（公有领域），逐段来源见 `素材/footage/manifest*.json`。
- **卡根照片** `kagan_2013_commons*.jpg`：École polytechnique / Flickr，CC BY-SA 2.0。
- **首相官邸视频和照片**（`41_kantei_pm_call_soai_2026.mp4`、`kantei_*.jpg`）：首相官邸网站，适用政府标准利用规约 PDL1.0（与 CC BY 4.0 兼容），使用时需注明「出典：首相官邸ホームページ」，加工后注明「を加工して作成」。
- **分子构象**：PubChem（CID 75792、11744819、10911429）。
- **诺贝尔官方肖像插画**（`nobel_ill_*.jpg`）：Nobel Prize Outreach，仅限编辑用途，2026-12-31 前有效，署名 Ill. Niklas Elmehed © Nobel Prize Outreach。
- **硤合 2008 年合影**（`soai_2008_flickr_viedma.jpg`）：CC BY-NC-SA 2.0（非商业）；`soai_commons_pegy22_unverified.jpg` 授权存疑。两张视频里都没用。
- **`04_pharma_packaging_line.mp4`**：archive.org Prelinger 馆藏，条目没写授权；`40_hospital_patient_bed.mp4` 来自 openbeelden.nl，可能是 CC BY-SA（视频里没用）。
- **`参考图/`**：第三方杂志封面和插画，只作风格参考，不出现在视频里。
- **字体**：思源宋体、Bebas Neue、ChillDuanSans 为 SIL Open Font License 1.1；阿里巴巴普惠体文件里没有授权说明（代码里声明了但没实际用到）。
- **插画**（`素材/ai/`）：用 Codex 内置 imagegen 生成。
- **旁白**（`素材/tts/`）：Gemini 3.8 Flash TTS 生成。
