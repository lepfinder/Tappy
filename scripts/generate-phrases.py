#!/usr/bin/env python3
"""
使用 edge-tts 为 Tappy 生成中文句子/词语语音文件
Usage: python3 scripts/generate-phrases.py
"""

import asyncio
import json
import os
import re
import hashlib
import edge_tts

# 配置
VOICE_ZH = "zh-CN-XiaoxiaoNeural"
OUTPUT_DIR = "public/audio"
PHRASES_DIR = f"{OUTPUT_DIR}/phrases"
MANIFEST_FILE = f"{OUTPUT_DIR}/manifest.json"

# API 频率控制
DELAY_PER_REQUEST = 0.5  # 每个请求后等待秒数
BATCH_PAUSE_COUNT = 50   # 每多少个请求后暂停
BATCH_PAUSE_SECONDS = 5  # 批次暂停秒数

def get_phrase_hash(text: str) -> str:
    """生成句子的 MD5 哈希作为文件名"""
    return hashlib.md5(text.encode('utf-8')).hexdigest()[:12]

def extract_phrases_from_file(filepath: str) -> list[str]:
    """从数据文件提取所有 display 字段"""
    phrases = []
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        # 匹配 display: '...' 或 display: "..."
        matches = re.findall(r"display:\s*['\"]([^'\"]+)['\"]", content)
        phrases.extend(matches)
    return phrases

def extract_all_phrases() -> list[str]:
    """从所有句子/诗歌/短文数据文件提取句子"""
    phrases = set()
    data_files = [
        'data/cn_sentences.ts',
        'data/cn_poems.ts',
        'data/cn_essays.ts'
    ]
    
    for filepath in data_files:
        if os.path.exists(filepath):
            print(f"  扫描: {filepath}")
            file_phrases = extract_phrases_from_file(filepath)
            phrases.update(file_phrases)
            print(f"    找到 {len(file_phrases)} 个句子")
    
    # 过滤：只保留 2 个字符以上的句子
    phrases = [p for p in phrases if len(p) >= 2]
    return sorted(phrases)

async def generate_audio(text: str, voice: str, output_path: str):
    """生成单个音频文件"""
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(output_path)

async def main():
    print("🎤 Tappy 句子语音生成器")
    print("=" * 50)
    
    # 创建输出目录
    os.makedirs(PHRASES_DIR, exist_ok=True)
    
    # 提取所有句子
    print("\n📖 扫描数据文件...")
    phrases = extract_all_phrases()
    print(f"\n✨ 找到 {len(phrases)} 个唯一句子/词语")
    
    # 加载已有的 manifest
    manifest = {"zh": {}, "en": {}, "phrases": {}}
    if os.path.exists(MANIFEST_FILE):
        with open(MANIFEST_FILE, 'r', encoding='utf-8') as f:
            manifest = json.load(f)
    
    # 确保 phrases 字段存在
    if "phrases" not in manifest:
        manifest["phrases"] = {}
    
    # 生成句子音频
    print(f"\n🔊 开始生成音频 (语音: {VOICE_ZH})...")
    print(f"   频率控制: 每请求 {DELAY_PER_REQUEST}s, 每 {BATCH_PAUSE_COUNT} 个暂停 {BATCH_PAUSE_SECONDS}s")
    
    generated = 0
    skipped = 0
    errors = 0
    
    for i, phrase in enumerate(phrases):
        # 生成文件名
        phrase_hash = get_phrase_hash(phrase)
        filename = f"{phrase_hash}.mp3"
        filepath = f"{PHRASES_DIR}/{filename}"
        
        if os.path.exists(filepath) and phrase in manifest.get("phrases", {}):
            skipped += 1
            continue
        
        print(f"  [{i+1}/{len(phrases)}] 生成: {phrase[:20]}{'...' if len(phrase) > 20 else ''} -> {filename}")
        
        try:
            await generate_audio(phrase, VOICE_ZH, filepath)
            manifest["phrases"][phrase] = filename
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
    if os.path.exists(PHRASES_DIR):
        for f in os.listdir(PHRASES_DIR):
            fpath = os.path.join(PHRASES_DIR, f)
            if os.path.isfile(fpath):
                total_size += os.path.getsize(fpath)
    print(f"   📦 句子音频总大小: {total_size / 1024 / 1024:.2f} MB")

if __name__ == "__main__":
    asyncio.run(main())
