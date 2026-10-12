#!/bin/bash
# 用法: gen.sh <名字> <英文画面描述文件>   → 素材/ai/<名字>.png（沿用 v2 的生图方式：Codex 内置 imagegen + 3 张风格参考图）
P="/Users/jadon7/Downloads/A149-诺贝尔奖专题_v2v3源码/A149-诺贝尔奖专题v4_手性/01-开头"
NAME="$1"; DESC="$(cat "$2")"
REFS="$P/参考图/ref1_显微镜农田.jpg $P/参考图/ref2_伸手黑洞.jpg $P/参考图/ref3_DNA手套.jpg"
STYLE="Style: premium editorial magazine illustration matching the three attached style reference images (Bloomberg Businessweek / Science News cover art): soft volumetric gradients, rich saturated colors (deep navy, cyan, teal, emerald green, warm coral and gold accents), heavy fine-grain stipple / risograph noise texture used for all shading, crisp clean silhouettes, subtle glowing rim light, high detail. No text, no letters, no numbers, no watermark, no frame."
PROMPT="请用 imagegen 生成一张图。步骤：
1. 先用 view_image 依次打开这三张风格参考图（只参考画风、质感、颗粒和配色，不要照搬内容）：$REFS
2. 调用内置 image_gen 生成一张图，提示词如下，严格逐字使用，不要润色、不要扩写、不要改写：
\"$DESC $STYLE\"
3. 生成完成后，把图片原样复制到：$P/素材/ai/$NAME.png （如果是透明背景要保留 alpha 通道）。只生成这一张，不要生成多张，不要做别的事。"
cd "$P/_gen"
env -u CODEX_API_KEY /Applications/ChatGPT.app/Contents/Resources/codex-cli/bin/codex exec -c model_provider=openai --skip-git-repo-check --dangerously-bypass-approvals-and-sandbox "$PROMPT" < /dev/null > "$P/_gen/$NAME.log" 2>&1
ls -la "$P/素材/ai/$NAME.png" >> "$P/_gen/$NAME.log" 2>&1
