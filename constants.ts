import { GameMode } from './types';
import { LEVELS_EN_LETTERS } from './data/en_letters';
import { LEVELS_EN_WORDS } from './data/en_words';
import { LEVELS_EN_ESSAYS } from './data/en_essays';
import { LEVELS_CN_PINYIN } from './data/cn_pinyin';
import { LEVELS_CN_SENTENCES } from './data/cn_sentences';
import { LEVELS_RACE } from './data/race_levels';
import { LEVELS_CN_POEMS } from './data/cn_poems';
import { LEVELS_CN_ESSAYS } from './data/cn_essays';
import type { FingerKey } from './utils/fingerMapping';

// 扩展完整键盘行（补全英文短文需要的标点键 ; ' , . / 与 Shift）
export const KEYBOARD_ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"],
  ['shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/']
];

export const FINGER_MAP: Record<string, FingerKey> = {
  q: 'pinky-l', a: 'pinky-l', z: 'pinky-l', shift: 'pinky-l',
  w: 'ring-l', s: 'ring-l', x: 'ring-l',
  e: 'middle-l', d: 'middle-l', c: 'middle-l',
  r: 'index-l', f: 'index-l', v: 'index-l', t: 'index-l', g: 'index-l', b: 'index-l',
  y: 'index-r', h: 'index-r', n: 'index-r', u: 'index-r', j: 'index-r', m: 'index-r',
  i: 'middle-r', k: 'middle-r', ',': 'middle-r',
  o: 'ring-r', l: 'ring-r', '.': 'ring-r',
  p: 'pinky-r', ';': 'pinky-r', '/': 'pinky-r', "'": 'pinky-r', '?': 'pinky-r',
  ' ': 'thumb'
};

// 手指色彩标准体系（虚拟键盘与双手引导 1:1 严格同色）
export const FINGER_PALETTE: Record<
  FingerKey,
  { bg: string; border: string; lip: string; fill: string; text: string; labelCn: string; labelEn: string }
> = {
  'pinky-l': { bg: '#FEE2E2', border: '#F87171', lip: '#DC2626', fill: '#FB7185', text: '#7F1D1D', labelCn: '左小指', labelEn: 'Left Pinky' },
  'ring-l': { bg: '#FFEDD5', border: '#FB923C', lip: '#EA580C', fill: '#FB923C', text: '#7C2D12', labelCn: '左无名指', labelEn: 'Left Ring' },
  'middle-l': { bg: '#FEF9C3', border: '#EAB308', lip: '#CA8A04', fill: '#FACC15', text: '#713F12', labelCn: '左中指', labelEn: 'Left Middle' },
  'index-l': { bg: '#DCFCE7', border: '#4ADE80', lip: '#16A34A', fill: '#4ADE80', text: '#14532D', labelCn: '左食指', labelEn: 'Left Index' },
  'index-r': { bg: '#D1FAE5', border: '#34D399', lip: '#059669', fill: '#34D399', text: '#064E3B', labelCn: '右食指', labelEn: 'Right Index' },
  'middle-r': { bg: '#DBEAFE', border: '#60A5FA', lip: '#2563EB', fill: '#60A5FA', text: '#1E3A8A', labelCn: '右中指', labelEn: 'Right Middle' },
  'ring-r': { bg: '#E0E7FF', border: '#818CF8', lip: '#4F46E5', fill: '#818CF8', text: '#312E81', labelCn: '右无名指', labelEn: 'Right Ring' },
  'pinky-r': { bg: '#FCE7F3', border: '#F472B6', lip: '#DB2777', fill: '#F472B6', text: '#831843', labelCn: '右小指', labelEn: 'Right Pinky' },
  thumb: { bg: '#FEF3C7', border: '#F59E0B', lip: '#D97706', fill: '#FBBF24', text: '#78350F', labelCn: '大拇指', labelEn: 'Thumb' }
};

export const MODE_DATA_MAP = {
  EN_LETTERS: LEVELS_EN_LETTERS,
  EN_WORDS: LEVELS_EN_WORDS,
  EN_ESSAYS: LEVELS_EN_ESSAYS,
  CN_PINYIN: LEVELS_CN_PINYIN,
  CN_SENTENCES: LEVELS_CN_SENTENCES,
  CN_ESSAYS: LEVELS_CN_ESSAYS,
  CN_POEMS: LEVELS_CN_POEMS,
  RACE_100M: LEVELS_RACE
};

export const MODES_METADATA: Record<GameMode, { color: string }> = {
  EN_LETTERS: { color: 'bg-kid-yellow' },
  EN_WORDS: { color: 'bg-kid-blue' },
  EN_ESSAYS: { color: 'bg-indigo-400' },
  CN_PINYIN: { color: 'bg-kid-green' },
  CN_SENTENCES: { color: 'bg-kid-purple' },
  CN_ESSAYS: { color: 'bg-pink-400' },
  CN_POEMS: { color: 'bg-teal-400' },
  RACE_100M: { color: 'bg-orange-400' }
};
