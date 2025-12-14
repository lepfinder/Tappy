import { GameMode } from "./types";
import { LEVELS_EN_LETTERS } from "./data/en_letters";
import { LEVELS_EN_WORDS } from "./data/en_words";
import { LEVELS_CN_PINYIN } from "./data/cn_pinyin";
import { LEVELS_CN_SENTENCES } from "./data/cn_sentences";
import { LEVELS_RACE } from "./data/race_levels";

// Base64 sounds
export const SOUNDS = {
  click: "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU",
  success: "data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=", 
  error: "data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA="
};

export const KEYBOARD_ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm']
];

export const FINGER_MAP: Record<string, string> = {
  'q': 'pinky-l', 'a': 'pinky-l', 'z': 'pinky-l',
  'w': 'ring-l', 's': 'ring-l', 'x': 'ring-l',
  'e': 'middle-l', 'd': 'middle-l', 'c': 'middle-l',
  'r': 'index-l', 'f': 'index-l', 'v': 'index-l', 't': 'index-l', 'g': 'index-l', 'b': 'index-l',
  'y': 'index-r', 'h': 'index-r', 'n': 'index-r', 'u': 'index-r', 'j': 'index-r', 'm': 'index-r',
  'i': 'middle-r', 'k': 'middle-r',
  'o': 'ring-r', 'l': 'ring-r',
  'p': 'pinky-r'
};

export const FINGER_COLORS: Record<string, string> = {
  'pinky-l': 'bg-red-200 border-red-400',
  'ring-l': 'bg-orange-200 border-orange-400',
  'middle-l': 'bg-yellow-200 border-yellow-400',
  'index-l': 'bg-green-200 border-green-400',
  'index-r': 'bg-green-200 border-green-400',
  'middle-r': 'bg-blue-200 border-blue-400',
  'ring-r': 'bg-indigo-200 border-indigo-400',
  'pinky-r': 'bg-purple-200 border-purple-400',
};

// Map Modes to their Level Data
export const MODE_DATA_MAP = {
  'EN_LETTERS': LEVELS_EN_LETTERS,
  'EN_WORDS': LEVELS_EN_WORDS,
  'CN_PINYIN': LEVELS_CN_PINYIN,
  'CN_SENTENCES': LEVELS_CN_SENTENCES,
  'RACE_100M': LEVELS_RACE
};

// Metadata now only holds visual styling. Text is in i18n.ts
export const MODES_METADATA: Record<GameMode, { color: string }> = {
  'EN_LETTERS': { color: 'bg-kid-yellow' },
  'EN_WORDS': { color: 'bg-kid-blue' },
  'CN_PINYIN': { color: 'bg-kid-green' },
  'CN_SENTENCES': { color: 'bg-kid-purple' },
  'RACE_100M': { color: 'bg-orange-400' },
};