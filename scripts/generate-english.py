#!/usr/bin/env python3
"""
使用 edge-tts 为 Tappy 生成英语单词/字母语音文件
Usage: python3 scripts/generate-english.py
"""

import asyncio
import json
import os
import re
import hashlib
import edge_tts

# 配置
VOICE_EN = "en-US-AriaNeural"  # 自然的美式英语女声
OUTPUT_DIR = "public/audio"
EN_DIR = f"{OUTPUT_DIR}/en"
MANIFEST_FILE = f"{OUTPUT_DIR}/manifest.json"

# API 频率控制 - 更快的请求频率
DELAY_PER_REQUEST = 0.05  # 每个请求后等待秒数 (50ms)
BATCH_PAUSE_COUNT = 100   # 每多少个请求后暂停
BATCH_PAUSE_SECONDS = 2   # 批次暂停秒数

def get_word_hash(text: str) -> str:
    """生成单词的 MD5 哈希作为文件名"""
    return hashlib.md5(text.encode('utf-8')).hexdigest()[:12]

def extract_words_from_file(filepath: str) -> list[str]:
    """从数据文件提取所有 display 字段"""
    words = []
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        # 匹配 display: '...' 或 display: "..."
        matches = re.findall(r"display:\s*['\"]([^'\"]+)['\"]", content)
        words.extend(matches)
    return words

def extract_all_english_words() -> list[str]:
    """从所有英语数据文件提取单词"""
    words = set()
    data_files = [
        'data/en_words.ts',
        'data/en_letters.ts'
    ]
    
    for filepath in data_files:
        if os.path.exists(filepath):
            print(f"  扫描: {filepath}")
            file_words = extract_words_from_file(filepath)
            words.update(file_words)
            print(f"    找到 {len(file_words)} 个单词/短语")
    
    # 过滤：只保留非空的单词
    words = [w for w in words if len(w) >= 1]
    return sorted(words)

async def generate_audio(text: str, voice: str, output_path: str):
    """生成单个音频文件"""
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(output_path)

async def main():
    print("🎤 Tappy 英语语音生成器")
    print("=" * 50)
    
    # 创建输出目录
    os.makedirs(EN_DIR, exist_ok=True)
    
    # 提取所有单词
    print("\n📖 扫描数据文件...")
    words = extract_all_english_words()
    print(f"\n✨ 找到 {len(words)} 个唯一单词/短语")
    
    # 加载已有的 manifest
    manifest = {"zh": {}, "en": {}, "phrases": {}}
    if os.path.exists(MANIFEST_FILE):
        with open(MANIFEST_FILE, 'r', encoding='utf-8') as f:
            manifest = json.load(f)
    
    # 确保 en 字段存在
    if "en" not in manifest:
        manifest["en"] = {}
    
    # 生成英语音频
    print(f"\n🔊 开始生成音频 (语音: {VOICE_EN})...")
    print(f"   频率控制: 每请求 {DELAY_PER_REQUEST}s, 每 {BATCH_PAUSE_COUNT} 个暂停 {BATCH_PAUSE_SECONDS}s")
    
    generated = 0
    skipped = 0
    errors = 0
    
    for i, word in enumerate(words):
        # 生成文件名
        word_hash = get_word_hash(word)
        filename = f"{word_hash}.mp3"
        filepath = f"{EN_DIR}/{filename}"
        
        if os.path.exists(filepath) and word in manifest.get("en", {}):
            skipped += 1
            continue
        
        display_word = word[:30] + '...' if len(word) > 30 else word
        print(f"  [{i+1}/{len(words)}] 生成: {display_word} -> {filename}")
        
        try:
            await generate_audio(word, VOICE_EN, filepath)
            manifest["en"][word] = filename
            generated += 1
            
            # 频率控制
            await asyncio.sleep(DELAY_PER_REQUEST)
            
            # 批次暂停
            if generated > 0 and generated % BATCH_PAUSE_COUNT == 0:
                print(f"    ⏸️ 暂停 {BATCH_PAUSE_SECONDS} 秒 (已生成 {generated} 个)...")
                await asyncio.sleep(BATCH_PAUSE_SECONDS)
                
        except Exception as e:
            print(f"    ⚠️ 错误: {e}")
            errors += 1
    
    # 保存 manifest
    with open(MANIFEST_FILE, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    
    print("\n" + "=" * 50)
    print(f"✅ 完成!")
    print(f"   新生成: {generated} 个")
    print(f"   已跳过: {skipped} 个")
    print(f"   错误: {errors} 个")
    print(f"   📄 Manifest: {MANIFEST_FILE}")
    
    # 计算总大小
    total_size = 0
    if os.path.exists(EN_DIR):
        for f in os.listdir(EN_DIR):
            fpath = os.path.join(EN_DIR, f)
            if os.path.isfile(fpath):
                total_size += os.path.getsize(fpath)
    print(f"   📦 英语音频总大小: {total_size / 1024 / 1024:.2f} MB")

if __name__ == "__main__":
    asyncio.run(main())
