import { Level } from '../types';

export const LEVELS_EN_LETTERS: Level[] = [
  {
    id: 'en_l_1',
    title: 'Home Row (Left)',
    description: 'Master the left hand home keys',
    difficulty: 1,
    challenges: [
      { display: 'a' }, { display: 's' }, { display: 'd' }, { display: 'f' },
      { display: 'sad' }, { display: 'dad' }, { display: 'fad' }
    ]
  },
  {
    id: 'en_l_2',
    title: 'Home Row (Right)',
    description: 'Master the right hand home keys',
    difficulty: 1,
    challenges: [
      { display: 'j' }, { display: 'k' }, { display: 'l' }, { display: 'h' },
      { display: 'all' }, { display: 'fall' }, { display: 'hall' }
    ]
  },
  {
    id: 'en_l_3',
    title: 'Top Row Basics',
    description: 'Reach up for QWERTY',
    difficulty: 2,
    challenges: [
      { display: 'q' }, { display: 'w' }, { display: 'e' }, { display: 'r' }, { display: 't' },
      { display: 'y' }, { display: 'u' }, { display: 'i' }, { display: 'o' }, { display: 'p' }
    ]
  }
];
