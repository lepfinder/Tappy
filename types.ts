export type Difficulty = 'easy' | 'medium' | 'hard';

export type GameMode = 
  | 'EN_LETTERS' 
  | 'EN_WORDS' 
  | 'CN_PINYIN' 
  | 'CN_SENTENCES';

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
  challenges: ChallengeItem[];
}

export interface GameState {
  // Global Settings
  language: Language;

  // Navigation State
  view: ViewState;
  selectedMode: GameMode | null;
  
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
}