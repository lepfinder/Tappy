import { Level } from '../types';

export const LEVELS_CN_PINYIN: Level[] = [
  {
    id: 'cn_p_1',
    title: 'Family 👨‍👩‍👧',
    description: 'Basic family members',
    difficulty: 1,
    challenges: [
      { display: '爸', pinyin: ['ba'], translation: 'Dad' },
      { display: '妈', pinyin: ['ma'], translation: 'Mom' },
      { display: '哥', pinyin: ['ge'], translation: 'Older Brother' },
      { display: '弟', pinyin: ['di'], translation: 'Younger Brother' },
      { display: '姐', pinyin: ['jie'], translation: 'Older Sister' },
      { display: '妹', pinyin: ['mei'], translation: 'Younger Sister' },
      { display: '爷', pinyin: ['ye'], translation: 'Grandpa' },
      { display: '奶', pinyin: ['nai'], translation: 'Grandma' },
      { display: '我', pinyin: ['wo'], translation: 'Me' },
      { display: '你', pinyin: ['ni'], translation: 'You' }
    ]
  },
  {
    id: 'cn_p_2',
    title: 'Nature 🌳',
    description: 'World around us',
    difficulty: 2,
    challenges: [
      { display: '天', pinyin: ['tian'], translation: 'Sky' },
      { display: '地', pinyin: ['di'], translation: 'Earth' },
      { display: '水', pinyin: ['shui'], translation: 'Water' },
      { display: '火', pinyin: ['huo'], translation: 'Fire' },
      { display: '山', pinyin: ['shan'], translation: 'Mountain' },
      { display: '风', pinyin: ['feng'], translation: 'Wind' },
      { display: '雨', pinyin: ['yu'], translation: 'Rain' },
      { display: '日', pinyin: ['ri'], translation: 'Sun' },
      { display: '月', pinyin: ['yue'], translation: 'Moon' },
      { display: '星', pinyin: ['xing'], translation: 'Star' },
      { display: '云', pinyin: ['yun'], translation: 'Cloud' }
    ]
  },
  {
    id: 'cn_p_3',
    title: 'Numbers 🔢',
    description: 'Count to ten',
    difficulty: 1,
    challenges: [
      { display: '一', pinyin: ['yi'], translation: 'One' },
      { display: '二', pinyin: ['er'], translation: 'Two' },
      { display: '三', pinyin: ['san'], translation: 'Three' },
      { display: '四', pinyin: ['si'], translation: 'Four' },
      { display: '五', pinyin: ['wu'], translation: 'Five' },
      { display: '六', pinyin: ['liu'], translation: 'Six' },
      { display: '七', pinyin: ['qi'], translation: 'Seven' },
      { display: '八', pinyin: ['ba'], translation: 'Eight' },
      { display: '九', pinyin: ['jiu'], translation: 'Nine' },
      { display: '十', pinyin: ['shi'], translation: 'Ten' }
    ]
  }
];