export type ArcadeGameId = 'apple-catch' | 'space-shooter';
export type ArcadeDifficulty = 'easy' | 'medium' | 'hard' | 'expert' | 'endless';

export interface ArcadePrompt {
  /** 需要敲击的英文字母/单词/拼音（全小写） */
  text: string;
  /** 可选主展示文本（例如汉字“苹果”），未提供时直接展示 text */
  display?: string;
}

export interface ArcadeSessionSummary {
  score: number;
  accuracy: number;
  wpm: number;
  maxCombo: number;
  stars: number;
  cleared: number;
  timeSpent: number;
  won: boolean;
}

export interface ArcadeGameMeta {
  id: ArcadeGameId;
  emoji: string;
  coverImage: string;
  iconImage: string;
  titleCn: string;
  titleEn: string;
  descCn: string;
  descEn: string;
  tagCn: string;
  tagEn: string;
  gradient: string;
  accentBg: string;
  accentText: string;
  buttonBg: string;
  difficultyLabels: Partial<Record<ArcadeDifficulty, { cn: string; en: string }>>;
}

export const ARCADE_GAMES: ArcadeGameMeta[] = [
  {
    id: 'apple-catch',
    emoji: '🍎',
    coverImage: '/images/arcade/apple-catch.webp',
    iconImage: '/icons/fluent3d/apple.webp',
    titleCn: '快乐摘苹果',
    titleEn: 'Apple Catch',
    descCn: '苹果从果树落下，落地前敲对键盘收进小篮子，金苹果双倍加分！',
    descEn: 'Type before apples hit the ground! Golden apples give double points.',
    tagCn: '单键反应',
    tagEn: 'Reflex',
    gradient: 'from-rose-400 via-red-400 to-orange-400',
    accentBg: 'bg-rose-50',
    accentText: 'text-rose-600',
    buttonBg: 'bg-rose-500 hover:bg-rose-600',
    difficultyLabels: {
      easy: { cn: '字母入门', en: 'Letters' },
      medium: { cn: '英文短词', en: 'Words' },
      hard: { cn: '趣味拼音', en: 'Pinyin' },
      expert: { cn: '丰收风暴', en: 'Storm' },
      endless: { cn: '∞ 无尽模式', en: '∞ Endless' }
    }
  },
  {
    id: 'space-shooter',
    emoji: '🚀',
    coverImage: '/images/arcade/space-shooter.webp',
    iconImage: '/icons/fluent3d/rocket.webp',
    titleCn: '太空打字战机',
    titleEn: 'Space Shooter',
    descCn: '输入单词锁定陨石与外星飞船，发射激光精准击落，满能量按空格清屏！',
    descEn: 'Lock onto meteors & UFOs with words, fire lasers, press Space for Super Nova!',
    tagCn: '单词提速',
    tagEn: 'Speed',
    gradient: 'from-indigo-500 via-purple-500 to-fuchsia-500',
    accentBg: 'bg-indigo-50',
    accentText: 'text-indigo-600',
    buttonBg: 'bg-indigo-500 hover:bg-indigo-600',
    difficultyLabels: {
      easy: { cn: '巡航短词', en: 'Short Words' },
      medium: { cn: '陨石进阶', en: 'Long Words' },
      hard: { cn: '拼音星战', en: 'Pinyin' },
      expert: { cn: '极速挑战', en: 'Hyper' },
      endless: { cn: '∞ 无尽模式', en: '∞ Endless' }
    }
  }
];

export const getArcadeLevelId = (gameId: ArcadeGameId, difficulty: ArcadeDifficulty) =>
  `arcade_${gameId}_${difficulty}`;

// 字母池（覆盖全键盘常用键位）
const LETTERS_POOL: ArcadePrompt[] = 'asdfghjklqwertyuiopzxcvbnm'
  .split('')
  .map((ch) => ({ text: ch }));

// 2~4 字母超短词（适合低年级和太空巡航入门）
const SHORT_WORDS_POOL: ArcadePrompt[] = [
  'cat', 'dog', 'sun', 'sky', 'cup', 'hat', 'red', 'run', 'fun', 'hop',
  'bee', 'bug', 'fox', 'owl', 'pig', 'cow', 'ant', 'jam', 'pie', 'tea',
  'star', 'moon', 'bear', 'fish', 'bird', 'duck', 'frog', 'cake', 'milk', 'book',
  'tree', 'leaf', 'rain', 'wind', 'snow', 'blue', 'pink', 'gold', 'fast', 'jump',
  'play', 'love', 'home', 'hand', 'hero', 'kite', 'ship', 'king', 'ring', 'song'
].map((w) => ({ text: w }));

// 5~7 字母趣味单词（适合进阶拼写）
const MEDIUM_WORDS_POOL: ArcadePrompt[] = [
  'apple', 'panda', 'tiger', 'zebra', 'koala', 'whale', 'eagle', 'horse', 'sheep', 'mouse',
  'rocket', 'planet', 'galaxy', 'meteor', 'comet', 'orbit', 'laser', 'robot', 'magic', 'dream',
  'garden', 'flower', 'forest', 'island', 'castle', 'bridge', 'river', 'ocean', 'cloud', 'sunny',
  'rainbow', 'summer', 'winter', 'spring', 'autumn', 'school', 'pencil', 'friend', 'family', 'happy',
  'cookie', 'banana', 'orange', 'cherry', 'dragon', 'rabbit', 'turtle', 'monkey', 'music', 'smile'
].map((w) => ({ text: w }));

// 汉字 + 拼音词库（单字/双字趣味词，适合小学双语启蒙）
const PINYIN_SINGLE_POOL: ArcadePrompt[] = [
  { display: '猫', text: 'mao' },
  { display: '狗', text: 'gou' },
  { display: '鱼', text: 'yu' },
  { display: '鸟', text: 'niao' },
  { display: '熊', text: 'xiong' },
  { display: '兔', text: 'tu' },
  { display: '虎', text: 'hu' },
  { display: '龙', text: 'long' },
  { display: '花', text: 'hua' },
  { display: '树', text: 'shu' },
  { display: '草', text: 'cao' },
  { display: '云', text: 'yun' },
  { display: '风', text: 'feng' },
  { display: '雨', text: 'yu' },
  { display: '雪', text: 'xue' },
  { display: '星', text: 'xing' },
  { display: '月', text: 'yue' },
  { display: '日', text: 'ri' },
  { display: '山', text: 'shan' },
  { display: '水', text: 'shui' },
  { display: '火', text: 'huo' },
  { display: '书', text: 'shu' },
  { display: '笔', text: 'bi' },
  { display: '家', text: 'jia' },
  { display: '笑', text: 'xiao' },
  { display: '跑', text: 'pao' },
  { display: '跳', text: 'tiao' },
  { display: '飞', text: 'fei' },
  { display: '甜', text: 'tian' },
  { display: '梦', text: 'meng' }
];

const PINYIN_COMPOUND_POOL: ArcadePrompt[] = [
  { display: '苹果', text: 'pingguo' },
  { display: '青蛙', text: 'qingwa' },
  { display: '小熊', text: 'xiaoxiong' },
  { display: '星星', text: 'xingxing' },
  { display: '太阳', text: 'taiyang' },
  { display: '月亮', text: 'yueliang' },
  { display: '彩虹', text: 'caihong' },
  { display: '花朵', text: 'huaduo' },
  { display: '森林', text: 'senlin' },
  { display: '火箭', text: 'huojian' },
  { display: '飞船', text: 'feichuan' },
  { display: '熊猫', text: 'xiongmao' },
  { display: '兔子', text: 'tuzi' },
  { display: '白云', text: 'baiyun' },
  { display: '大海', text: 'dahai' },
  { display: '快乐', text: 'kuaile' },
  { display: '加油', text: 'jiayou' },
  { display: '糖果', text: 'tangguo' },
  { display: '蛋糕', text: 'dangao' },
  { display: '春天', text: 'chuntian' },
  { display: '夏天', text: 'xiatian' },
  { display: '秋天', text: 'qiutian' },
  { display: '冬天', text: 'dongtian' },
  { display: '朋友', text: 'pengyou' }
];

/** 根据游戏和难度返回对应词库 */
export function getArcadePool(gameId: ArcadeGameId, difficulty: ArcadeDifficulty): ArcadePrompt[] {
  if (difficulty === 'endless') {
    return [...SHORT_WORDS_POOL, ...MEDIUM_WORDS_POOL];
  }

  if (gameId === 'space-shooter') {
    if (difficulty === 'easy') return SHORT_WORDS_POOL;
    if (difficulty === 'medium' || difficulty === 'expert') return MEDIUM_WORDS_POOL;
    return PINYIN_COMPOUND_POOL;
  }

  if (gameId === 'apple-catch' && difficulty === 'expert') {
    return [...SHORT_WORDS_POOL, ...MEDIUM_WORDS_POOL];
  }

  if (difficulty === 'easy') return LETTERS_POOL;
  if (difficulty === 'medium') return SHORT_WORDS_POOL;
  // 摘苹果节奏较快，拼音模式用单字音节（2-5键）
  return PINYIN_SINGLE_POOL;
}

/** 从词库中随机挑选一个不与当前活跃首字母冲突的词条（避免锁敌歧义） */
export function pickNonConflictingPrompt(
  pool: ArcadePrompt[],
  usedFirstChars: Set<string>
): ArcadePrompt {
  const candidates = pool.filter((item) => !usedFirstChars.has(item.text[0]));
  const source = candidates.length > 0 ? candidates : pool;
  return source[Math.floor(Math.random() * source.length)];
}
