#!/usr/bin/env python3
"""
使用 edge-tts 为 Tappy 生成中文语音文件
Usage: python3 scripts/generate-audio.py
"""

import asyncio
import json
import os
import re
import edge_tts

# 配置
VOICE_ZH = "zh-CN-XiaoxiaoNeural"  # 小女孩声音，适合儿童App
VOICE_EN = "en-US-JennyNeural"     # 英文女声
OUTPUT_DIR = "public/audio"
MANIFEST_FILE = f"{OUTPUT_DIR}/manifest.json"

def extract_chinese_chars():
    """从 data 文件提取所有汉字"""
    chars = set()
    data_dir = "data"
    
    for filename in os.listdir(data_dir):
        if filename.endswith('.ts') and filename.startswith('cn_'):
            filepath = os.path.join(data_dir, filename)
            print(f"  扫描: {filename}")
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                # 匹配 display: '...' 中的内容
                matches = re.findall(r"display:\s*['\"]([^'\"]+)['\"]", content)
                for match in matches:
                    for char in match:
                        if '\u4e00' <= char <= '\u9fff':  # 只保留汉字
                            chars.add(char)
    
    return sorted(chars)

async def generate_audio(text: str, voice: str, output_path: str):
    """生成单个音频文件"""
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(output_path)

async def main():
    print("🎤 Tappy 语音生成器")
    print("=" * 40)
    
    # 创建输出目录
    os.makedirs(f"{OUTPUT_DIR}/zh", exist_ok=True)
    
    # 提取所有汉字
    print("\n📖 扫描数据文件...")
    chars = extract_chinese_chars()
    print(f"\n✨ 找到 {len(chars)} 个唯一汉字")
    
    # 加载已有的 manifest (如果存在)
    manifest = {"zh": {}, "en": {}}
    if os.path.exists(MANIFEST_FILE):
        with open(MANIFEST_FILE, 'r', encoding='utf-8') as f:
            manifest = json.load(f)
    
    # 生成中文音频
    print(f"\n🔊 开始生成音频 (语音: {VOICE_ZH})...")
    generated = 0
    skipped = 0
    
    for i, char in enumerate(chars):
        # 使用汉字的 Unicode 编码作为文件名
        filename = f"{ord(char):04x}.mp3"
        filepath = f"{OUTPUT_DIR}/zh/{filename}"
        
        if not os.path.exists(filepath):
            print(f"  [{i+1}/{len(chars)}] 生成: {char} -> {filename}")
            try:
                await generate_audio(char, VOICE_ZH, filepath)
                generated += 1
            except Exception as e:
                print(f"    ⚠️ 错误: {e}")
        else:
            skipped += 1
        
        manifest["zh"][char] = filename
    
    # 保存 manifest
    with open(MANIFEST_FILE, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    
    print("\n" + "=" * 40)
    print(f"✅ 完成!")
    print(f"   新生成: {generated} 个")
    print(f"   已跳过: {skipped} 个")
    print(f"   📄 Manifest: {MANIFEST_FILE}")
    
    # 计算总大小
    total_size = 0
    audio_dir = f"{OUTPUT_DIR}/zh"
    for f in os.listdir(audio_dir):
        total_size += os.path.getsize(os.path.join(audio_dir, f))
    print(f"   📦 总大小: {total_size / 1024 / 1024:.2f} MB")

if __name__ == "__main__":
    asyncio.run(main())
