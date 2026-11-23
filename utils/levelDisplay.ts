import { GameMode, Language, Level } from '../types';

const HAS_CJK = /[\u4e00-\u9fff]/;

export interface FluentIconMeta {
  src: string;
  bgClass: string;
}

// 全量 Fluent 3D 立体图标映射（本地 96x96 WebP 离线资源，全站总计 ~204KB）
const FLUENT_3D_MAP: Record<string, FluentIconMeta> = {
  '↔️': { src: '/icons/fluent3d/arrows_lr.webp', bgClass: 'bg-violet-50' },
  '↔': { src: '/icons/fluent3d/arrows_lr.webp', bgClass: 'bg-violet-50' },
  '⏰': { src: '/icons/fluent3d/alarm_clock.webp', bgClass: 'bg-rose-50' },
  '☀️': { src: '/icons/fluent3d/sun.webp', bgClass: 'bg-amber-50' },
  '☀': { src: '/icons/fluent3d/sun.webp', bgClass: 'bg-amber-50' },
  '⚡': { src: '/icons/fluent3d/lightning.webp', bgClass: 'bg-yellow-50' },
  '⚽': { src: '/icons/fluent3d/soccer.webp', bgClass: 'bg-emerald-50' },
  '✨': { src: '/icons/fluent3d/sparkles.webp', bgClass: 'bg-amber-50' },
  '❓': { src: '/icons/fluent3d/question.webp', bgClass: 'bg-rose-50' },
  '❤️': { src: '/icons/fluent3d/heart.webp', bgClass: 'bg-rose-50' },
  '❤': { src: '/icons/fluent3d/heart.webp', bgClass: 'bg-rose-50' },
  '🌈': { src: '/icons/fluent3d/rainbow.webp', bgClass: 'bg-sky-50' },
  '🌍': { src: '/icons/fluent3d/globe_eu.webp', bgClass: 'bg-cyan-50' },
  '🌏': { src: '/icons/fluent3d/globe_asia.webp', bgClass: 'bg-cyan-50' },
  '🌙': { src: '/icons/fluent3d/moon.webp', bgClass: 'bg-indigo-50' },
  '🌳': { src: '/icons/fluent3d/tree.webp', bgClass: 'bg-emerald-50' },
  '🌻': { src: '/icons/fluent3d/sunflower.webp', bgClass: 'bg-yellow-50' },
  '🍂': { src: '/icons/fluent3d/fallen_leaf.webp', bgClass: 'bg-orange-50' },
  '🍎': { src: '/icons/fluent3d/apple.webp', bgClass: 'bg-rose-50' },
  '🍔': { src: '/icons/fluent3d/burger.webp', bgClass: 'bg-amber-50' },
  '🍚': { src: '/icons/fluent3d/rice.webp', bgClass: 'bg-orange-50' },
  '🍳': { src: '/icons/fluent3d/cooking.webp', bgClass: 'bg-amber-50' },
  '🎉': { src: '/icons/fluent3d/party.webp', bgClass: 'bg-pink-50' },
  '🎒': { src: '/icons/fluent3d/backpack.webp', bgClass: 'bg-rose-50' },
  '🎓': { src: '/icons/fluent3d/grad_cap.webp', bgClass: 'bg-indigo-50' },
  '🎨': { src: '/icons/fluent3d/palette.webp', bgClass: 'bg-fuchsia-50' },
  '🎵': { src: '/icons/fluent3d/music.webp', bgClass: 'bg-purple-50' },
  '🏃': { src: '/icons/fluent3d/running.webp', bgClass: 'bg-emerald-50' },
  '🏆': { src: '/icons/fluent3d/trophy.webp', bgClass: 'bg-amber-50' },
  '🏔️': { src: '/icons/fluent3d/mountain.webp', bgClass: 'bg-sky-50' },
  '🏔': { src: '/icons/fluent3d/mountain.webp', bgClass: 'bg-sky-50' },
  '🏙️': { src: '/icons/fluent3d/city.webp', bgClass: 'bg-slate-100' },
  '🏙': { src: '/icons/fluent3d/city.webp', bgClass: 'bg-slate-100' },
  '🏠': { src: '/icons/fluent3d/house.webp', bgClass: 'bg-teal-50' },
  '🏫': { src: '/icons/fluent3d/school.webp', bgClass: 'bg-indigo-50' },
  '🏰': { src: '/icons/fluent3d/castle.webp', bgClass: 'bg-purple-50' },
  '🐉': { src: '/icons/fluent3d/dragon.webp', bgClass: 'bg-emerald-50' },
  '🐬': { src: '/icons/fluent3d/dolphin.webp', bgClass: 'bg-sky-50' },
  '🐱': { src: '/icons/fluent3d/cat.webp', bgClass: 'bg-orange-50' },
  '🐼': { src: '/icons/fluent3d/panda.webp', bgClass: 'bg-emerald-50' },
  '👀': { src: '/icons/fluent3d/eyes.webp', bgClass: 'bg-indigo-50' },
  '👋': { src: '/icons/fluent3d/wave.webp', bgClass: 'bg-amber-50' },
  '👑': { src: '/icons/fluent3d/crown.webp', bgClass: 'bg-amber-50' },
  '👕': { src: '/icons/fluent3d/tshirt.webp', bgClass: 'bg-sky-50' },
  '👪': { src: '/icons/fluent3d/family.webp', bgClass: 'bg-amber-50' },
  '👨‍👩‍👧': { src: '/icons/fluent3d/family.webp', bgClass: 'bg-amber-50' },
  '👮': { src: '/icons/fluent3d/police.webp', bgClass: 'bg-blue-50' },
  '💪': { src: '/icons/fluent3d/muscle.webp', bgClass: 'bg-amber-50' },
  '💭': { src: '/icons/fluent3d/thought.webp', bgClass: 'bg-sky-50' },
  '💻': { src: '/icons/fluent3d/laptop.webp', bgClass: 'bg-slate-100' },
  '📅': { src: '/icons/fluent3d/calendar.webp', bgClass: 'bg-blue-50' },
  '📍': { src: '/icons/fluent3d/pin.webp', bgClass: 'bg-rose-50' },
  '📐': { src: '/icons/fluent3d/ruler.webp', bgClass: 'bg-amber-50' },
  '📚': { src: '/icons/fluent3d/books.webp', bgClass: 'bg-indigo-50' },
  '🔗': { src: '/icons/fluent3d/link.webp', bgClass: 'bg-slate-100' },
  '🔢': { src: '/icons/fluent3d/numbers.webp', bgClass: 'bg-sky-50' },
  '🗓️': { src: '/icons/fluent3d/spiral_cal.webp', bgClass: 'bg-blue-50' },
  '🗓': { src: '/icons/fluent3d/spiral_cal.webp', bgClass: 'bg-blue-50' },
  '🗣️': { src: '/icons/fluent3d/speaking.webp', bgClass: 'bg-sky-50' },
  '🗣': { src: '/icons/fluent3d/speaking.webp', bgClass: 'bg-sky-50' },
  '😊': { src: '/icons/fluent3d/smile.webp', bgClass: 'bg-pink-50' },
  '😭': { src: '/icons/fluent3d/cry.webp', bgClass: 'bg-sky-50' },
  '🙋': { src: '/icons/fluent3d/raising_hand.webp', bgClass: 'bg-amber-50' },
  '🚀': { src: '/icons/fluent3d/rocket.webp', bgClass: 'bg-indigo-50' },
  '🚗': { src: '/icons/fluent3d/car.webp', bgClass: 'bg-rose-50' },
  '🚶': { src: '/icons/fluent3d/walking.webp', bgClass: 'bg-teal-50' },
  '🚿': { src: '/icons/fluent3d/shower.webp', bgClass: 'bg-cyan-50' },
  '🛁': { src: '/icons/fluent3d/bathtub.webp', bgClass: 'bg-cyan-50' },
  '🛏️': { src: '/icons/fluent3d/bed.webp', bgClass: 'bg-purple-50' },
  '🛏': { src: '/icons/fluent3d/bed.webp', bgClass: 'bg-purple-50' },
  '🛒': { src: '/icons/fluent3d/cart.webp', bgClass: 'bg-emerald-50' },
  '🛠️': { src: '/icons/fluent3d/tools.webp', bgClass: 'bg-slate-100' },
  '🛠': { src: '/icons/fluent3d/tools.webp', bgClass: 'bg-slate-100' },
  '🤝': { src: '/icons/fluent3d/handshake.webp', bgClass: 'bg-amber-50' },
  '🥛': { src: '/icons/fluent3d/milk.webp', bgClass: 'bg-sky-50' },
  '🦁': { src: '/icons/fluent3d/lion.webp', bgClass: 'bg-amber-50' },
  '🧠': { src: '/icons/fluent3d/brain.webp', bgClass: 'bg-pink-50' },
  '🧧': { src: '/icons/fluent3d/red_envelope.webp', bgClass: 'bg-rose-50' },
  '🧭': { src: '/icons/fluent3d/compass.webp', bgClass: 'bg-sky-50' },
  '🧱': { src: '/icons/fluent3d/brick.webp', bgClass: 'bg-orange-50' }
};

// 英文短文 30 篇精准主题 3D 图标映射
const EN_ESSAY_ICON_MAP: Record<string, FluentIconMeta> = {
  'My Cat': { src: '/icons/fluent3d/cat.webp', bgClass: 'bg-orange-50' },
  'The Apple': { src: '/icons/fluent3d/apple.webp', bgClass: 'bg-rose-50' },
  'My Dog': { src: '/icons/fluent3d/dog.webp', bgClass: 'bg-amber-50' },
  'The Sun': { src: '/icons/fluent3d/sun.webp', bgClass: 'bg-yellow-50' },
  'My Family': { src: '/icons/fluent3d/family.webp', bgClass: 'bg-amber-50' },
  'My Bike': { src: '/icons/fluent3d/bike.webp', bgClass: 'bg-sky-50' },
  'School Day': { src: '/icons/fluent3d/school.webp', bgClass: 'bg-indigo-50' },
  'The Bird': { src: '/icons/fluent3d/bird.webp', bgClass: 'bg-rose-50' },
  'Ice Cream': { src: '/icons/fluent3d/ice_cream.webp', bgClass: 'bg-pink-50' },
  'The Rain': { src: '/icons/fluent3d/rain.webp', bgClass: 'bg-cyan-50' },
  Morning: { src: '/icons/fluent3d/alarm_clock.webp', bgClass: 'bg-rose-50' },
  Yesterday: { src: '/icons/fluent3d/calendar.webp', bgClass: 'bg-blue-50' },
  'My Room': { src: '/icons/fluent3d/bed.webp', bgClass: 'bg-purple-50' },
  'Soccer Game': { src: '/icons/fluent3d/soccer.webp', bgClass: 'bg-emerald-50' },
  Cooking: { src: '/icons/fluent3d/cooking.webp', bgClass: 'bg-amber-50' },
  'The Park': { src: '/icons/fluent3d/tree.webp', bgClass: 'bg-emerald-50' },
  Seasons: { src: '/icons/fluent3d/fallen_leaf.webp', bgClass: 'bg-orange-50' },
  'A Picnic': { src: '/icons/fluent3d/burger.webp', bgClass: 'bg-amber-50' },
  'The Library': { src: '/icons/fluent3d/books.webp', bgClass: 'bg-indigo-50' },
  'My Birthday': { src: '/icons/fluent3d/party.webp', bgClass: 'bg-pink-50' },
  'The Moon': { src: '/icons/fluent3d/moon.webp', bgClass: 'bg-indigo-50' },
  'The Ocean': { src: '/icons/fluent3d/ocean.webp', bgClass: 'bg-sky-50' },
  'A Dream': { src: '/icons/fluent3d/thought.webp', bgClass: 'bg-sky-50' },
  Camping: { src: '/icons/fluent3d/camping.webp', bgClass: 'bg-emerald-50' },
  'The Farm': { src: '/icons/fluent3d/farm.webp', bgClass: 'bg-amber-50' },
  'Be Helpful': { src: '/icons/fluent3d/handshake.webp', bgClass: 'bg-amber-50' },
  'The Forest': { src: '/icons/fluent3d/forest.webp', bgClass: 'bg-emerald-50' },
  'Snow Day': { src: '/icons/fluent3d/snow.webp', bgClass: 'bg-sky-50' },
  'My Hobby': { src: '/icons/fluent3d/palette.webp', bgClass: 'bg-fuchsia-50' },
  Future: { src: '/icons/fluent3d/rocket.webp', bgClass: 'bg-indigo-50' }
};

// 古诗/课文按标题意象关键词匹配 3D 图标
const CN_THEME_KEYWORDS: Array<[RegExp, FluentIconMeta]> = [
  [/[月夜宵]/, { src: '/icons/fluent3d/moon.webp', bgClass: 'bg-indigo-50' }],
  [/[山峰岭岳崖]/, { src: '/icons/fluent3d/mountain.webp', bgClass: 'bg-sky-50' }],
  [/[雪冬冰寒梅]/, { src: '/icons/fluent3d/snow.webp', bgClass: 'bg-sky-50' }],
  [/[江河海湖水泉池溪瀑浪]/, { src: '/icons/fluent3d/ocean.webp', bgClass: 'bg-cyan-50' }],
  [/[鸟鹅燕鹤雀莺鸡鸭鸥]/, { src: '/icons/fluent3d/bird.webp', bgClass: 'bg-rose-50' }],
  [/[花春荷桃草菊莲兰]/, { src: '/icons/fluent3d/sunflower.webp', bgClass: 'bg-yellow-50' }],
  [/[秋叶风霜枫]/, { src: '/icons/fluent3d/fallen_leaf.webp', bgClass: 'bg-orange-50' }],
  [/[雨云雾雷]/, { src: '/icons/fluent3d/rain.webp', bgClass: 'bg-cyan-50' }],
  [/[日阳朝早光晴]/, { src: '/icons/fluent3d/sun.webp', bgClass: 'bg-amber-50' }],
  [/[树林松竹柳木森]/, { src: '/icons/fluent3d/forest.webp', bgClass: 'bg-emerald-50' }],
  [/[家村居楼乡园亭城]/, { src: '/icons/fluent3d/house.webp', bgClass: 'bg-teal-50' }],
  [/[星天霄]/, { src: '/icons/fluent3d/sparkles.webp', bgClass: 'bg-amber-50' }],
  [/[猫]/, { src: '/icons/fluent3d/cat.webp', bgClass: 'bg-orange-50' }],
  [/[狗犬]/, { src: '/icons/fluent3d/dog.webp', bgClass: 'bg-amber-50' }],
  [/[牛羊牧]/, { src: '/icons/fluent3d/farm.webp', bgClass: 'bg-amber-50' }],
  [/[龙]/, { src: '/icons/fluent3d/dragon.webp', bgClass: 'bg-emerald-50' }],
  [/[书学读课师]/, { src: '/icons/fluent3d/books.webp', bgClass: 'bg-indigo-50' }]
];

// 无尾部 Emoji 模块的默认 3D 主题图标（保证全站选关视觉 100% 统一）
const MODE_FALLBACK_ICON: Partial<Record<GameMode, FluentIconMeta>> = {
  EN_LETTERS: { src: '/icons/fluent3d/keyboard.webp', bgClass: 'bg-amber-50' },
  EN_ESSAYS: { src: '/icons/fluent3d/open_book.webp', bgClass: 'bg-purple-50' },
  CN_POEMS: { src: '/icons/fluent3d/scroll.webp', bgClass: 'bg-orange-50' },
  CN_ESSAYS: { src: '/icons/fluent3d/open_book.webp', bgClass: 'bg-teal-50' }
};

/**
 * 从形如 "Numbers 🔢" 或 "Family Terms 👨‍👩‍👧" 的标题中拆出英文文本与尾部 Emoji
 */
function splitTrailingEmoji(text: string): { clean: string; emoji: string } {
  const trimmed = text.trim();
  const lastSpace = trimmed.lastIndexOf(' ');
  if (lastSpace === -1) return { clean: trimmed, emoji: '' };

  const head = trimmed.slice(0, lastSpace).trim();
  const tail = trimmed.slice(lastSpace + 1).trim();
  if (tail && !/[a-zA-Z0-9\u4e00-\u9fff]/.test(tail)) {
    return { clean: head, emoji: tail };
  }
  return { clean: trimmed, emoji: '' };
}

/**
 * 根据界面语言与模块类型返回最适合儿童阅读的关卡主/副标题及 Fluent 3D 图标
 */
export function getLocalizedLevelText(
  level: Level,
  mode: GameMode | null,
  language: Language
): {
  title: string;
  titleNoEmoji: string;
  subtitle: string;
  fluentIcon?: FluentIconMeta;
} {
  const { clean, emoji } = splitTrailingEmoji(level.title);
  let fluentIcon: FluentIconMeta | undefined = emoji ? FLUENT_3D_MAP[emoji] : undefined;

  if (!fluentIcon && level.tags?.includes('custom-dictation')) {
    fluentIcon = { src: '/icons/fluent3d/open_book.webp', bgClass: 'bg-amber-50' };
  }

  if (!fluentIcon && mode === 'EN_ESSAYS') {
    fluentIcon = EN_ESSAY_ICON_MAP[clean];
  }
  if (!fluentIcon && (mode === 'CN_POEMS' || mode === 'CN_ESSAYS')) {
    for (const [pattern, meta] of CN_THEME_KEYWORDS) {
      if (pattern.test(clean)) {
        fluentIcon = meta;
        break;
      }
    }
  }
  if (!fluentIcon && mode) {
    fluentIcon = MODE_FALLBACK_ICON[mode];
  }

  if (
    language === 'cn' &&
    (mode === 'CN_PINYIN' || mode === 'CN_SENTENCES' || mode === 'EN_LETTERS') &&
    !HAS_CJK.test(level.title) &&
    HAS_CJK.test(level.description)
  ) {
    return {
      title: emoji ? `${level.description} ${emoji}` : level.description,
      titleNoEmoji: level.description,
      subtitle: clean,
      fluentIcon
    };
  }

  return {
    title: level.title,
    titleNoEmoji: clean,
    subtitle: level.description,
    fluentIcon
  };
}
