import { create } from 'zustand';
import { ChallengeItem, GameMode, Level, ViewState, Language } from '../types';
import { MODE_DATA_MAP } from '../constants';
import { playSound } from '../utils/sound';

interface GameStore {
  // Global Settings
  language: Language;
  setLanguage: (lang: Language) => void;

  // Navigation
  view: ViewState;
  selectedMode: GameMode | null;
  availableLevels: Level[];
  
  // Game Session
  currentLevel: Level | null;
  currentChallengeIndex: number;
  
  // Input State
  typedHistory: string;
  currentSyllableIndex: number;
  lastInputError: boolean;
  
  // Stats
  score: number;
  errors: number;
  isPlaying: boolean;
  combo: number;
  maxCombo: number;
  startTime: number | null;
  totalKeystrokes: number;
  correctKeystrokes: number;

  // Actions
  goHome: () => void;
  selectMode: (mode: GameMode) => void;
  selectLevel: (levelId: string) => void;
  restartLevel: () => void;
  nextLevel: () => void;
  exitGame: () => void; // Back to level select
  
  handleInput: (key: string) => void;
  nextChallenge: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  language: 'en',
  setLanguage: (lang) => set({ language: lang }),

  view: 'HOME',
  selectedMode: null,
  availableLevels: [],
  currentLevel: null,
  currentChallengeIndex: 0,
  typedHistory: '',
  currentSyllableIndex: 0,
  lastInputError: false,
  score: 0,
  errors: 0,
  isPlaying: false,
  combo: 0,
  maxCombo: 0,
  startTime: null,
  totalKeystrokes: 0,
  correctKeystrokes: 0,

  goHome: () => {
    set({ 
      view: 'HOME', 
      selectedMode: null, 
      availableLevels: [], 
      isPlaying: false 
    });
  },

  selectMode: (mode) => {
    const levels = MODE_DATA_MAP[mode];
    set({
      view: 'LEVELS',
      selectedMode: mode,
      availableLevels: levels
    });
  },

  selectLevel: (levelId) => {
    const { availableLevels } = get();
    const level = availableLevels.find(l => l.id === levelId);
    if (!level) return;

    playSound('click');
    set({
      view: 'GAME',
      currentLevel: level,
      currentChallengeIndex: 0,
      typedHistory: '',
      currentSyllableIndex: 0,
      score: 0,
      errors: 0,
      isPlaying: true,
      lastInputError: false,
      combo: 0,
      maxCombo: 0,
      startTime: null,
      totalKeystrokes: 0,
      correctKeystrokes: 0
    });
  },

  exitGame: () => {
    set({ view: 'LEVELS', isPlaying: false, currentLevel: null });
  },

  restartLevel: () => {
    const { currentLevel } = get();
    if (!currentLevel) return;
    
    set({
      currentChallengeIndex: 0,
      typedHistory: '',
      currentSyllableIndex: 0,
      score: 0,
      errors: 0,
      isPlaying: true,
      view: 'GAME',
      combo: 0,
      maxCombo: 0,
      startTime: null,
      totalKeystrokes: 0,
      correctKeystrokes: 0
    });
  },

  nextLevel: () => {
    const { currentLevel, availableLevels, selectLevel, exitGame } = get();
    if (!currentLevel) return;

    const currentIndex = availableLevels.findIndex(l => l.id === currentLevel.id);
    if (currentIndex >= 0 && currentIndex < availableLevels.length - 1) {
      const nextLvl = availableLevels[currentIndex + 1];
      selectLevel(nextLvl.id);
    } else {
      exitGame();
    }
  },

  nextChallenge: () => {
    const { currentChallengeIndex, currentLevel } = get();
    if (!currentLevel) return;

    if (currentChallengeIndex + 1 >= currentLevel.challenges.length) {
      playSound('win');
      set({ view: 'RESULT', isPlaying: false });
    } else {
      playSound('success');
      set({
        currentChallengeIndex: currentChallengeIndex + 1,
        typedHistory: '',
        currentSyllableIndex: 0,
        lastInputError: false
      });
    }
  },

  handleInput: (key: string) => {
    const { isPlaying, currentLevel, currentChallengeIndex, selectedMode, typedHistory, currentSyllableIndex, nextChallenge, startTime } = get();
    
    if (!isPlaying || !currentLevel) return;

    const currentItem = currentLevel.challenges[currentChallengeIndex];
    const normalizedKey = key.toLowerCase();
    
    // Start timer on first input
    const newStartTime = startTime || Date.now();

    const handleSuccess = () => {
      playSound('click');
      const newHistory = typedHistory + normalizedKey;
      const newCombo = get().combo + 1;
      set({ 
        typedHistory: newHistory, 
        lastInputError: false, 
        score: get().score + 10,
        combo: newCombo,
        maxCombo: Math.max(newCombo, get().maxCombo),
        totalKeystrokes: get().totalKeystrokes + 1,
        correctKeystrokes: get().correctKeystrokes + 1,
        startTime: newStartTime
      });
      return newHistory;
    };

    const handleError = () => {
      playSound('error');
      set({ 
        errors: get().errors + 1, 
        lastInputError: true,
        combo: 0, // Reset combo
        totalKeystrokes: get().totalKeystrokes + 1,
        startTime: newStartTime
      });
      setTimeout(() => set({ lastInputError: false }), 400);
    };

    // -- LOGIC: ENGLISH MODES --
    if (selectedMode === 'EN_LETTERS' || selectedMode === 'EN_WORDS') {
      const targetStr = currentItem.display.toLowerCase();
      const nextChar = targetStr[typedHistory.length];

      if (normalizedKey === nextChar) {
        const newHistory = handleSuccess();
        if (newHistory.length === targetStr.length) {
          setTimeout(() => nextChallenge(), 200);
        }
      } else {
        handleError();
      }
    } 
    // -- LOGIC: CHINESE MODES --
    else {
      const syllables = currentItem.pinyin || [];
      const currentTargetSyllable = syllables[currentSyllableIndex];
      const expectedChar = currentTargetSyllable[typedHistory.length];

      if (normalizedKey === expectedChar) {
        const newHistory = handleSuccess();
        if (newHistory === currentTargetSyllable) {
          if (currentSyllableIndex + 1 >= syllables.length) {
             setTimeout(() => nextChallenge(), 200);
          } else {
            set({ 
              currentSyllableIndex: currentSyllableIndex + 1,
              typedHistory: '' 
            });
          }
        }
      } else {
        handleError();
      }
    }
  }
}));