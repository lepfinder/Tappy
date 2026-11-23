import { Level } from '../types';

export interface CustomWordItem {
  display: string;
  translation?: string;
}

export interface CustomWordList {
  id: string;
  title: string;
  mode: 'EN_WORDS';
  items: CustomWordItem[];
  createdAt: number;
}

const STORAGE_KEY = 'tappy_custom_wordlists_v1';

export const SAMPLE_EN_DICTATION_TEXT = `apple 苹果
banana 香蕉
orange 橙子
monkey 猴子
school 学校
friend 朋友
morning 早晨
rainbow 彩虹`;

export function loadCustomWordLists(): CustomWordList[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is CustomWordList =>
        item &&
        typeof item.id === 'string' &&
        typeof item.title === 'string' &&
        Array.isArray(item.items) &&
        item.items.length > 0
    );
  } catch {
    return [];
  }
}

function persistLists(lists: CustomWordList[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
  } catch {
    // 忽略隐私模式或配额异常
  }
}

export function saveCustomWordList(input: {
  id?: string;
  title: string;
  items: CustomWordItem[];
}): CustomWordList {
  const lists = loadCustomWordLists();
  const cleanTitle = input.title.trim() || '自定义听写词表';
  if (input.id) {
    const idx = lists.findIndex((l) => l.id === input.id);
    if (idx !== -1) {
      const updated: CustomWordList = {
        ...lists[idx],
        title: cleanTitle,
        items: input.items
      };
      lists[idx] = updated;
      persistLists(lists);
      return updated;
    }
  }
  const created: CustomWordList = {
    id: `custom_en_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title: cleanTitle,
    mode: 'EN_WORDS',
    items: input.items,
    createdAt: Date.now()
  };
  persistLists([created, ...lists]);
  return created;
}

export function deleteCustomWordList(id: string): void {
  const lists = loadCustomWordLists().filter((l) => l.id !== id);
  persistLists(lists);
}

export function getCustomWordListById(id: string): CustomWordList | undefined {
  return loadCustomWordLists().find((l) => l.id === id);
}

/**
 * 智能解析家长从微信群/课本复制粘贴的英文听写文本：
 * 支持格式：
 * - apple 苹果
 * - 1. apple - 苹果 / 2、banana: 香蕉 / orange（橙子）
 * - apple, banana, orange（逗号/分号分隔）
 */
export function parseEnglishWordListInput(raw: string): CustomWordItem[] {
  if (!raw.trim()) return [];

  // 如果整段文本没有换行但有逗号/分号，按逗号/分号拆分
  const hasNewline = /\r?\n/.test(raw.trim());
  const rawEntries = hasNewline
    ? raw.split(/\r?\n/)
    : raw.split(/[,，;；]+/);

  const seen = new Set<string>();
  const result: CustomWordItem[] = [];

  for (let line of rawEntries) {
    line = line.trim();
    if (!line) continue;
    // 去掉开头常见序号，如 "1. " / "2、" / "(3) " / "① "
    line = line.replace(/^(\(?[0-9]+[.)、:\s]+|[①-⑳]\s*)/, '').trim();
    if (!line) continue;

    // 匹配开头英文单词或短语 + 可选分隔符 + 释义
    const match = line.match(/^([A-Za-z][A-Za-z\s'-]{0,36})(?:[\s\-–—:：=（(]+(.+?)[）)]?)?$/);
    if (!match) continue;

    const word = match[1].trim().replace(/\s+/g, ' ');
    const translation = match[2]?.trim().replace(/[）)]$/, '').trim() || undefined;
    if (!word) continue;

    const dedupeKey = word.toLowerCase();
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    result.push({ display: word, translation });
    if (result.length >= 60) break;
  }

  return result;
}

export function formatItemsToEditableText(items: CustomWordItem[]): string {
  return items.map((it) => (it.translation ? `${it.display} ${it.translation}` : it.display)).join('\n');
}

/** 将自定义词表转为标准 Level 结构，100% 复用现有打字练习与成长系统 */
export function customListToLevel(list: CustomWordList): Level {
  return {
    id: list.id,
    title: list.title,
    description: `${list.items.length} 个自定义听写词`,
    difficulty: 2,
    tags: ['custom-dictation'],
    challenges: list.items.map((item) => ({
      display: item.display,
      translation: item.translation
    }))
  };
}

export function isCustomLevelId(levelId?: string | null): boolean {
  return Boolean(levelId && levelId.startsWith('custom_'));
}

/** 零后端分享链接编码（UTF-8 Base64URL） */
export function buildCustomListShareUrl(list: CustomWordList): string {
  const payload = {
    t: list.title,
    i: list.items.map((it) => (it.translation ? [it.display, it.translation] : [it.display]))
  };
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  const base64Url = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}#/import/${base64Url}`;
}

/** 解析分享链接中的词表数据 */
export function decodeCustomListPayload(
  encoded: string
): { title: string; items: CustomWordItem[] } | null {
  try {
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    const data = JSON.parse(json);
    if (!data || typeof data.t !== 'string' || !Array.isArray(data.i)) return null;
    const items: CustomWordItem[] = [];
    for (const row of data.i) {
      if (Array.isArray(row) && typeof row[0] === 'string' && row[0].trim()) {
        items.push({
          display: row[0].trim(),
          translation: typeof row[1] === 'string' && row[1].trim() ? row[1].trim() : undefined
        });
      }
    }
    if (items.length === 0) return null;
    return { title: data.t.trim() || '分享的听写词表', items };
  } catch {
    return null;
  }
}
