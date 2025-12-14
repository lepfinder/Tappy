import { Level } from '../types';

export const LEVELS_RACE: Level[] = [
  {
    id: 'race_1',
    title: 'Sprint Cup 🏆',
    description: 'Fast short words!',
    difficulty: 1,
    challenges: [
      { display: 'run' }, { display: 'fast' }, { display: 'go' }, { display: 'win' },
      { display: 'race' }, { display: 'dash' }, { display: 'zoom' }, { display: 'rush' },
      { display: 'fly' }, { display: 'jet' }, { display: 'car' }, { display: 'bus' },
      { display: 'top' }, { display: 'zip' }, { display: 'zap' }, { display: 'now' }
    ]
  },
  {
    id: 'race_2',
    title: 'Marathon 🏃',
    description: 'Type longer words to win',
    difficulty: 2,
    challenges: [
      { display: 'energy' }, { display: 'spirit' }, { display: 'power' }, { display: 'speed' },
      { display: 'winner' }, { display: 'record' }, { display: 'medal' }, { display: 'cheer' },
      { display: 'finish' }, { display: 'victory' }, { display: 'player' }, { display: 'sport' },
      { display: 'track' }, { display: 'field' }, { display: 'active' }, { display: 'strong' }
    ]
  },
  {
    id: 'race_3',
    title: 'Champions League 👑',
    description: 'Mixed sentences for pros',
    difficulty: 3,
    challenges: [
      { display: 'The' }, { display: 'quick' }, { display: 'brown' }, { display: 'fox' },
      { display: 'jumps' }, { display: 'over' }, { display: 'lazy' }, { display: 'dog' },
      { display: 'Ready' }, { display: 'Set' }, { display: 'Go' },
      { display: 'Type' }, { display: 'fast' }, { display: 'to' }, { display: 'win' },
      { display: 'Keep' }, { display: 'moving' }, { display: 'forward' }
    ]
  }
];