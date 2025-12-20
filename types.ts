
export type Difficulty = 'easy' | 'medium' | 'hard';

export type GameMode =
  | 'EN_LETTERS'
  | 'EN_WORDS'
  | 'EN_ESSAYS'
  | 'CN_PINYIN'
  | 'CN_SENTENCES'
  | 'CN_ESSAYS'
  | 'CN_POEMS'
  | 'RACE_100M';

export type ViewState = 'HOME' | 'LEVELS' | 'GAME' | 'RESULT';
export type Language = 'en' | 'cn';

export interface ChallengeItem {
  display: string;      // What is shown (e.g., "Apple" or "你好")
  pinyin?: string[];    // Array of pinyin syllables for CN (e.g., ["ni", "hao"])
  translation?: string; // English meaning
}

export interface Level {
  id: string;
  title: string;
  description: string;
  difficulty: number; // 1-3 stars visual
  tags?: string[]; // e.g. ['grade-1', 'semester-1']
  challenges: ChallengeItem[];
}

export interface Participant {
  id: string;
  name: string;
  type: 'player' | 'bot';
  progress: number; // 0 to 100
  speed: number;    // Arbitrary speed factor for bots
  finishedRank?: number;
}

export interface GameState {
  // Global Settings
  language: Language;

  // Navigation State
  view: ViewState;
  selectedMode: GameMode | null;
  selectedGrade: number; // New: For Poem/Essay filtering

  // Data for the current flow
  availableLevels: Level[];
  currentLevel: Level | null;

  // Gameplay State
  isPlaying: boolean;
  currentChallengeIndex: number;

  // Specific item progress
  currentItem: ChallengeItem | null;
  typedHistory: string;
  currentSyllableIndex: number;

  // Stats
  score: number;
  errors: number;
  lastInputError: boolean;

  // New Real-time Stats
  combo: number;
  maxCombo: number;
  startTime: number | null;
  totalKeystrokes: number;
  correctKeystrokes: number;
  correctHanzi: number; // New: Track completed Chinese characters

  // Race Specific
  raceStatus: 'idle' | 'countdown' | 'racing' | 'finished';
  participants: Participant[];
}

// 练习结束时的统计结果
export interface PracticeResult {
  wpm: number;           // 最终速度 (Words/Characters Per Minute)
  accuracy: number;      // 最终准确率 (0-100)
  timeSpent: number;     // 耗时 (秒)
  maxCombo: number;      // 最大连击数
  mistakeKeys: string[]; // 错误次数最多的键位，如 ['a', 'p']
  stars: 1 | 2 | 3;      // 计算出的星星
  score: number;         // 综合得分
}
