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
      { display: '弟', pinyin: ['di'], translation: 'Younger Brother' }
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
      { display: '山', pinyin: ['shan'], translation: 'Mountain' }
    ]
  }
];
