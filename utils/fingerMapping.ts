// 手指类型定义
export type FingerName = 'pinky' | 'ring' | 'middle' | 'index' | 'thumb';
export type HandSide = 'left' | 'right';
export type FingerKey =
  | 'pinky-l'
  | 'ring-l'
  | 'middle-l'
  | 'index-l'
  | 'index-r'
  | 'middle-r'
  | 'ring-r'
  | 'pinky-r'
  | 'thumb';

export interface FingerInfo {
  hand: HandSide;
  finger: FingerName;
  fingerKey: FingerKey;
}

const LEFT_PINKY_KEYS = ['q', 'a', 'z', '1', '`', '~', 'tab', 'capslock', 'shift'];
const LEFT_RING_KEYS = ['w', 's', 'x', '2'];
const LEFT_MIDDLE_KEYS = ['e', 'd', 'c', '3'];
const LEFT_INDEX_KEYS = ['r', 'f', 'v', 't', 'g', 'b', '4', '5'];

const RIGHT_INDEX_KEYS = ['y', 'h', 'n', 'u', 'j', 'm', '6', '7'];
const RIGHT_MIDDLE_KEYS = ['i', 'k', ',', '8'];
const RIGHT_RING_KEYS = ['o', 'l', '.', '9'];
const RIGHT_PINKY_KEYS = ['p', ';', '/', '?', '!', '0', '-', '=', '[', ']', "'", '\\', 'enter', 'backspace'];

/**
 * 将目标字符解析为物理键帽与是否需要按 Shift（覆盖 '?' 等英文短文标点）
 */
export function resolveKeycapTarget(expectedChar: string): { keycap: string; needsShift: boolean } {
  if (!expectedChar) {
    return { keycap: '', needsShift: false };
  }
  if (expectedChar === '?') {
    return { keycap: '/', needsShift: true };
  }
  if (/^[A-Z]$/.test(expectedChar)) {
    return { keycap: expectedChar.toLowerCase(), needsShift: true };
  }
  const lower = expectedChar.toLowerCase();
  return { keycap: lower, needsShift: false };
}

export function getFingerForKey(key: string): FingerInfo | null {
  const normalizedKey = key === ' ' ? ' ' : key.toLowerCase().trim();

  if (normalizedKey === ' ' || normalizedKey === 'space') {
    return { hand: 'right', finger: 'thumb', fingerKey: 'thumb' };
  }
  if (LEFT_PINKY_KEYS.includes(normalizedKey)) {
    return { hand: 'left', finger: 'pinky', fingerKey: 'pinky-l' };
  }
  if (LEFT_RING_KEYS.includes(normalizedKey)) {
    return { hand: 'left', finger: 'ring', fingerKey: 'ring-l' };
  }
  if (LEFT_MIDDLE_KEYS.includes(normalizedKey)) {
    return { hand: 'left', finger: 'middle', fingerKey: 'middle-l' };
  }
  if (LEFT_INDEX_KEYS.includes(normalizedKey)) {
    return { hand: 'left', finger: 'index', fingerKey: 'index-l' };
  }
  if (RIGHT_INDEX_KEYS.includes(normalizedKey)) {
    return { hand: 'right', finger: 'index', fingerKey: 'index-r' };
  }
  if (RIGHT_MIDDLE_KEYS.includes(normalizedKey)) {
    return { hand: 'right', finger: 'middle', fingerKey: 'middle-r' };
  }
  if (RIGHT_RING_KEYS.includes(normalizedKey)) {
    return { hand: 'right', finger: 'ring', fingerKey: 'ring-r' };
  }
  if (RIGHT_PINKY_KEYS.includes(normalizedKey)) {
    return { hand: 'right', finger: 'pinky', fingerKey: 'pinky-r' };
  }
  return null;
}

export function isSpaceKey(key: string): boolean {
  const normalizedKey = key.toLowerCase().trim();
  return normalizedKey === ' ' || normalizedKey === 'space';
}
