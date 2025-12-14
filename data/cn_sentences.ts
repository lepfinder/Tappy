import { Level } from '../types';

export const LEVELS_CN_SENTENCES: Level[] = [
  {
    id: 'cn_s_1',
    title: 'Greetings 👋',
    description: 'Polite words',
    difficulty: 1,
    challenges: [
      { display: '你好', pinyin: ['ni', 'hao'], translation: 'Hello' },
      { display: '谢谢', pinyin: ['xie', 'xie'], translation: 'Thanks' },
      { display: '再见', pinyin: ['zai', 'jian'], translation: 'Goodbye' }
    ]
  },
  {
    id: 'cn_s_2',
    title: 'Daily Life 🏠',
    description: 'Common phrases',
    difficulty: 2,
    challenges: [
      { display: '我爱学习', pinyin: ['wo', 'ai', 'xue', 'xi'], translation: 'I love learning' },
      { display: '早上好', pinyin: ['zao', 'shang', 'hao'], translation: 'Good Morning' },
      { display: '晚安', pinyin: ['wan', 'an'], translation: 'Goodnight' }
    ]
  }
];
