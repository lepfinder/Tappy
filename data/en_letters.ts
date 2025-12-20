import { Level } from '../types';

// 键盘布局参考：
// 上排: Q W E R T Y U I O P
// 中排: A S D F G H J K L (Home Row - 基准行)
// 下排: Z X C V B N M
//
// 学习顺序：从中间基准行开始，先左手后右手，然后上排，最后下排

export const LEVELS_EN_LETTERS: Level[] = [
  // ===== 第一阶段：中排基准行 (Home Row) =====
  {
    id: 'en_l_01',
    title: 'Home Row - Left Hand',
    description: 'A S D F - 左手基准键位',
    difficulty: 1,
    challenges: [
      { display: 'a' }, { display: 'a' }, { display: 's' }, { display: 's' },
      { display: 'd' }, { display: 'd' }, { display: 'f' }, { display: 'f' },
      { display: 'as' }, { display: 'ad' }, { display: 'af' }, { display: 'sa' },
      { display: 'sd' }, { display: 'sf' }, { display: 'da' }, { display: 'ds' },
      { display: 'df' }, { display: 'fa' }, { display: 'fs' }, { display: 'fd' }
    ]
  },
  {
    id: 'en_l_02',
    title: 'Home Row - Right Hand',
    description: 'J K L - 右手基准键位',
    difficulty: 1,
    challenges: [
      { display: 'j' }, { display: 'j' }, { display: 'k' }, { display: 'k' },
      { display: 'l' }, { display: 'l' }, { display: 'jk' }, { display: 'jl' },
      { display: 'kj' }, { display: 'kl' }, { display: 'lj' }, { display: 'lk' },
      { display: 'jkl' }, { display: 'ljk' }, { display: 'klj' }, { display: 'jlk' }
    ]
  },
  {
    id: 'en_l_03',
    title: 'Home Row - G & H',
    description: 'G H - 中指延伸键位',
    difficulty: 1,
    challenges: [
      { display: 'g' }, { display: 'g' }, { display: 'h' }, { display: 'h' },
      { display: 'gh' }, { display: 'hg' }, { display: 'fg' }, { display: 'hj' },
      { display: 'fgh' }, { display: 'ghj' }, { display: 'asg' }, { display: 'hjl' },
      { display: 'dfgh' }, { display: 'ghjk' }
    ]
  },
  {
    id: 'en_l_04',
    title: 'Home Row - Complete',
    description: 'A S D F G H J K L - 完整基准行',
    difficulty: 1,
    challenges: [
      { display: 'asdf' }, { display: 'jkl' }, { display: 'fdsa' }, { display: 'lkj' },
      { display: 'fghj' }, { display: 'asd' }, { display: 'jkl' }, { display: 'fghjkl' },
      { display: 'asdfg' }, { display: 'hjkla' }, { display: 'slag' }, { display: 'half' },
      { display: 'flask' }, { display: 'shall' }, { display: 'salad' }, { display: 'glass' }
    ]
  },

  // ===== 第二阶段：上排键位 (Top Row) =====
  {
    id: 'en_l_05',
    title: 'Top Row - Left Hand',
    description: 'Q W E R T - 左手上排',
    difficulty: 2,
    challenges: [
      { display: 'q' }, { display: 'w' }, { display: 'e' }, { display: 'r' }, { display: 't' },
      { display: 'qw' }, { display: 'we' }, { display: 'er' }, { display: 'rt' },
      { display: 'qwer' }, { display: 'wert' }, { display: 'qwert' },
      { display: 'few' }, { display: 'wed' }, { display: 'red' }, { display: 'tree' }
    ]
  },
  {
    id: 'en_l_06',
    title: 'Top Row - Right Hand',
    description: 'Y U I O P - 右手上排',
    difficulty: 2,
    challenges: [
      { display: 'y' }, { display: 'u' }, { display: 'i' }, { display: 'o' }, { display: 'p' },
      { display: 'yu' }, { display: 'ui' }, { display: 'io' }, { display: 'op' },
      { display: 'yuio' }, { display: 'uiop' }, { display: 'yuiop' },
      { display: 'you' }, { display: 'pop' }, { display: 'hip' }, { display: 'oil' }
    ]
  },
  {
    id: 'en_l_07',
    title: 'Top Row - Complete',
    description: 'Q W E R T Y U I O P - 完整上排',
    difficulty: 2,
    challenges: [
      { display: 'qwerty' }, { display: 'poiuy' }, { display: 'qwert' }, { display: 'yuiop' },
      { display: 'type' }, { display: 'quite' }, { display: 'power' }, { display: 'quote' },
      { display: 'query' }, { display: 'tower' }, { display: 'write' }, { display: 'outer' },
      { display: 'route' }, { display: 'reply' }, { display: 'quiet' }, { display: 'forty' }
    ]
  },

  // ===== 第三阶段：下排键位 (Bottom Row) =====
  {
    id: 'en_l_08',
    title: 'Bottom Row - Left Hand',
    description: 'Z X C V B - 左手下排',
    difficulty: 2,
    challenges: [
      { display: 'z' }, { display: 'x' }, { display: 'c' }, { display: 'v' }, { display: 'b' },
      { display: 'zx' }, { display: 'xc' }, { display: 'cv' }, { display: 'vb' },
      { display: 'zxc' }, { display: 'xcv' }, { display: 'cvb' }, { display: 'zxcvb' },
      { display: 'cab' }, { display: 'vc' }, { display: 'bx' }, { display: 'vex' }
    ]
  },
  {
    id: 'en_l_09',
    title: 'Bottom Row - Right Hand',
    description: 'N M - 右手下排',
    difficulty: 2,
    challenges: [
      { display: 'n' }, { display: 'n' }, { display: 'm' }, { display: 'm' },
      { display: 'nm' }, { display: 'mn' }, { display: 'bnm' }, { display: 'nmk' },
      { display: 'njm' }, { display: 'mkn' }, { display: 'jnm' }, { display: 'mnb' },
      { display: 'man' }, { display: 'name' }, { display: 'jam' }, { display: 'ham' }
    ]
  },
  {
    id: 'en_l_10',
    title: 'Bottom Row - Complete',
    description: 'Z X C V B N M - 完整下排',
    difficulty: 2,
    challenges: [
      { display: 'zxcvbnm' }, { display: 'mnbvcxz' }, { display: 'zxcv' }, { display: 'bnm' },
      { display: 'comb' }, { display: 'zinc' }, { display: 'next' }, { display: 'calm' },
      { display: 'climb' }, { display: 'exact' }, { display: 'vacant' }, { display: 'common' }
    ]
  },

  // ===== 第四阶段：综合练习 =====
  {
    id: 'en_l_11',
    title: 'Mixed - Home + Top',
    description: '中排 + 上排综合练习',
    difficulty: 3,
    challenges: [
      { display: 'the' }, { display: 'that' }, { display: 'with' }, { display: 'they' },
      { display: 'this' }, { display: 'will' }, { display: 'your' }, { display: 'said' },
      { display: 'here' }, { display: 'look' }, { display: 'like' }, { display: 'just' },
      { display: 'over' }, { display: 'such' }, { display: 'good' }, { display: 'year' }
    ]
  },
  {
    id: 'en_l_12',
    title: 'Mixed - All Rows',
    description: '全键盘综合练习',
    difficulty: 3,
    challenges: [
      { display: 'quick' }, { display: 'brown' }, { display: 'jumps' }, { display: 'lazy' },
      { display: 'fox' }, { display: 'over' }, { display: 'pack' }, { display: 'exam' },
      { display: 'happy' }, { display: 'crazy' }, { display: 'mixed' }, { display: 'blaze' },
      { display: 'frozen' }, { display: 'complex' }, { display: 'jockey' }, { display: 'wizard' }
    ]
  },
  {
    id: 'en_l_13',
    title: 'Common Words',
    description: '常用单词练习',
    difficulty: 3,
    challenges: [
      { display: 'hello' }, { display: 'world' }, { display: 'apple' }, { display: 'happy' },
      { display: 'water' }, { display: 'music' }, { display: 'light' }, { display: 'dream' },
      { display: 'smile' }, { display: 'sugar' }, { display: 'magic' }, { display: 'cloud' },
      { display: 'river' }, { display: 'flower' }, { display: 'friend' }, { display: 'summer' }
    ]
  },
  {
    id: 'en_l_14',
    title: 'Full Keyboard Master',
    description: '键盘大师挑战',
    difficulty: 3,
    challenges: [
      { display: 'the quick brown fox' },
      { display: 'jumps over the lazy dog' },
      { display: 'pack my box with' },
      { display: 'five dozen liquor jugs' },
      { display: 'how vexingly quick' },
      { display: 'daft zebras jump' },
      { display: 'sphinx of black quartz' },
      { display: 'judge my vow' }
    ]
  }
];