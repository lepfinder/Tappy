import { Level } from '../types';

export const LEVELS_EN_LETTERS: Level[] = [
  {
    id: 'en_l_1',
    title: 'Home Row (Left)',
    description: 'Master the left hand keys: A S D F G',
    difficulty: 1,
    challenges: [
      { display: 'a' }, { display: 's' }, { display: 'd' }, { display: 'f' }, { display: 'g' },
      { display: 'sad' }, { display: 'dad' }, { display: 'fad' }, { display: 'gas' },
      { display: 'gag' }, { display: 'sag' }, { display: 'fads' }, { display: 'dads' },
      { display: 'as' }, { display: 'ad' }
    ]
  },
  {
    id: 'en_l_2',
    title: 'Home Row (Right)',
    description: 'Master the right hand keys: H J K L',
    difficulty: 1,
    challenges: [
      { display: 'h' }, { display: 'j' }, { display: 'k' }, { display: 'l' },
      { display: 'all' }, { display: 'fall' }, { display: 'hall' }, { display: 'half' },
      { display: 'ask' }, { display: 'has' }, { display: 'ash' }, { display: 'lash' },
      { display: 'flask' }, { display: 'shall' }, { display: 'salad' }
    ]
  },
  {
    id: 'en_l_3',
    title: 'Top Row Basics',
    description: 'Reach up for QWERTY',
    difficulty: 2,
    challenges: [
      { display: 'q' }, { display: 'w' }, { display: 'e' }, { display: 'r' }, { display: 't' },
      { display: 'y' }, { display: 'u' }, { display: 'i' }, { display: 'o' }, { display: 'p' },
      { display: 'top' }, { display: 'pot' }, { display: 'toy' }, { display: 'tree' },
      { display: 'quiet' }, { display: 'power' }, { display: 'type' }, { display: 'route' }
    ]
  }
];