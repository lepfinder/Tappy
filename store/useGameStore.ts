
import { create } from 'zustand';
import { ChallengeItem, GameMode, Level, ViewState, Language, Participant } from '../types';
import { MODE_DATA_MAP } from '../constants';
import { playSound, setSoundEnabled } from '../utils/sound';

interface GameStore {
  // Global Settings
  language: Language;
  setLanguage: (lang: Language) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;

  // Navigation
  view: ViewState;
  selectedMode: GameMode | null;
  selectedGrade: number;
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
  correctHanzi: number;

  // Race State
  raceStatus: 'idle' | 'countdown' | 'racing' | 'finished';
  participants: Participant[];

  // Actions
  goHome: () => void;
  selectMode: (mode: GameMode) => void;
  setGrade: (grade: number) => void;
  selectLevel: (levelId: string) => void;
  restartLevel: () => void;
  nextLevel: () => void;
  exitGame: () => void; // Back to level select

  handleInput: (key: string) => void;
  nextChallenge: () => void;

  // Race Actions
  startRace: () => void;
  tickRace: (dt: number) => void;
}

const DEFAULT_BOTS: Participant[] = [
  { id: 'bot1', name: 'Bot A', type: 'bot', progress: 0, speed: 3 }, // Slow
  { id: 'bot2', name: 'Bot B', type: 'bot', progress: 0, speed: 5 }, // Medium
  { id: 'bot3', name: 'Bot C', type: 'bot', progress: 0, speed: 7 }, // Fast
];

export const useGameStore = create<GameStore>((set, get) => ({
  language: 'cn',
  setLanguage: (lang) => set({ language: lang }),
  soundEnabled: true,
  setSoundEnabled: (enabled) => {
    setSoundEnabled(enabled);
    set({ soundEnabled: enabled });
  },

  view: 'HOME',
  selectedMode: null,
  selectedGrade: 1,
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
  correctHanzi: 0,

  raceStatus: 'idle',
  participants: [],

  goHome: () => {
    set({
      view: 'HOME',
      selectedMode: null,
      availableLevels: [],
      isPlaying: false,
      raceStatus: 'idle'
    });
  },

  selectMode: (mode) => {
    const levels = MODE_DATA_MAP[mode];

    // Default filter for poems and essays: Grade 1
    let filteredLevels = levels;
    if (mode === 'CN_POEMS' || mode === 'CN_ESSAYS') {
      filteredLevels = levels.filter(l => l.tags?.includes(`grade-1`));
    }

    set({
      view: 'LEVELS',
      selectedMode: mode,
      availableLevels: filteredLevels,
      selectedGrade: 1
    });
  },

  setGrade: (grade) => {
    const { selectedMode } = get();
    if (selectedMode !== 'CN_POEMS' && selectedMode !== 'CN_ESSAYS') return;

    const allItems = MODE_DATA_MAP[selectedMode];
    const filtered = allItems.filter(l => l.tags?.includes(`grade-${grade}`));

    set({
      selectedGrade: grade,
      availableLevels: filtered
    });
  },

  selectLevel: (levelId) => {
    const { availableLevels, selectedMode } = get();
    const level = availableLevels.find(l => l.id === levelId);
    if (!level) return;

    playSound('click');

    // Prepare Race State if mode is Race
    let raceStatePartial = {};
    if (selectedMode === 'RACE_100M') {
      raceStatePartial = {
        raceStatus: 'countdown',
        participants: [
          { id: 'player', name: 'You', type: 'player', progress: 0, speed: 0 },
          ...DEFAULT_BOTS.map(b => ({ ...b, progress: 0 }))
        ]
      };
    }

    set({
      view: 'GAME',
      currentLevel: level,
      currentChallengeIndex: 0,
      typedHistory: '',
      currentSyllableIndex: 0,
      score: 0,
      errors: 0,
      isPlaying: true, // For normal modes, immediate play. Race waits for startRace() logic or countdown effect in component
      lastInputError: false,
      combo: 0,
      maxCombo: 0,
      startTime: null,
      totalKeystrokes: 0,
      correctKeystrokes: 0,
      correctHanzi: 0,
      ...raceStatePartial
    });
  },

  startRace: () => {
    set({ raceStatus: 'racing', startTime: Date.now() });
  },

  tickRace: (dt: number) => {
    // dt in seconds
    const { raceStatus, participants } = get();
    if (raceStatus !== 'racing') return;

    let anyoneFinished = false;

    const newParticipants = participants.map(p => {
      if (p.type === 'player' || p.progress >= 100) return p;

      // Bot logic: move forward based on speed + random jitter
      const jitter = Math.random() * 2;
      const move = (p.speed + jitter) * dt;
      const newProgress = Math.min(100, p.progress + move);

      if (newProgress >= 100) anyoneFinished = true;
      return { ...p, progress: newProgress };
    });

    set({ participants: newParticipants });
  },

  exitGame: () => {
    set({ view: 'LEVELS', isPlaying: false, currentLevel: null, raceStatus: 'idle' });
  },

  restartLevel: () => {
    const { currentLevel, selectedMode } = get();
    if (!currentLevel) return;

    let raceStatePartial = {};
    if (selectedMode === 'RACE_100M') {
      raceStatePartial = {
        raceStatus: 'countdown',
        participants: [
          { id: 'player', name: 'You', type: 'player', progress: 0, speed: 0 },
          ...DEFAULT_BOTS.map(b => ({ ...b, progress: 0 }))
        ]
      };
    }

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
      correctKeystrokes: 0,
      correctHanzi: 0,
      ...raceStatePartial
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
    const { currentChallengeIndex, currentLevel, selectedMode } = get();
    if (!currentLevel) return;

    const isLast = currentChallengeIndex + 1 >= currentLevel.challenges.length;

    if (isLast) {
      playSound('win');
      if (selectedMode === 'RACE_100M') {
        set({ raceStatus: 'finished', view: 'RESULT', isPlaying: false });
        // Force player progress to 100 in case of rounding
        const { participants } = get();
        set({ participants: participants.map(p => p.type === 'player' ? { ...p, progress: 100 } : p) });
      } else {
        set({ view: 'RESULT', isPlaying: false });
      }
    } else {
      playSound('success');
      set({
        currentChallengeIndex: currentChallengeIndex + 1,
        typedHistory: '',
        currentSyllableIndex: 0,
        lastInputError: false
      });

      // For Race Mode, calculate progress purely on index advancement
      if (selectedMode === 'RACE_100M') {
        const { participants } = get();
        const total = currentLevel.challenges.length;
        const progress = ((currentChallengeIndex + 1) / total) * 100;

        set({
          participants: participants.map(p =>
            p.type === 'player' ? { ...p, progress: progress } : p
          )
        });
      }
    }
  },

  handleInput: (key: string) => {
    const { isPlaying, currentLevel, currentChallengeIndex, selectedMode, typedHistory, currentSyllableIndex, nextChallenge, startTime, raceStatus } = get();

    // In race mode, ignore input if not in 'racing' state
    if (selectedMode === 'RACE_100M' && raceStatus !== 'racing') return;
    if (!isPlaying || !currentLevel) return;

    const currentItem = currentLevel.challenges[currentChallengeIndex];
    const normalizedKey = key.toLowerCase();

    const newStartTime = startTime || Date.now();

    const handleSuccess = () => {
      playSound('click');
      const newHistory = typedHistory + normalizedKey;
      const newCombo = get().combo + 1;

      let stateUpdate: any = {
        typedHistory: newHistory,
        lastInputError: false,
        score: get().score + 10,
        combo: newCombo,
        maxCombo: Math.max(newCombo, get().maxCombo),
        totalKeystrokes: get().totalKeystrokes + 1,
        correctKeystrokes: get().correctKeystrokes + 1,
        startTime: newStartTime
      };

      set(stateUpdate);
      return newHistory;
    };

    const handleError = () => {
      playSound('error');
      set({
        errors: get().errors + 1,
        lastInputError: true,
        combo: 0,
        totalKeystrokes: get().totalKeystrokes + 1,
        startTime: newStartTime
      });
      setTimeout(() => set({ lastInputError: false }), 400);
    };

    // -- LOGIC: ENGLISH MODES, ESSAYS & RACE --
    if (selectedMode === 'EN_LETTERS' || selectedMode === 'EN_WORDS' || selectedMode === 'EN_ESSAYS' || selectedMode === 'RACE_100M') {
      const targetStr = currentItem.display.toLowerCase();
      const nextChar = targetStr[typedHistory.length];

      if (normalizedKey === nextChar) {
        const newHistory = handleSuccess();
        if (newHistory.length === targetStr.length) {
          // In race mode, instant transition
          const delay = selectedMode === 'RACE_100M' ? 50 : 200;
          setTimeout(() => nextChallenge(), delay);
        }
      } else {
        handleError();
      }
    }
    // -- LOGIC: CHINESE MODES --
    else {
      const syllables = currentItem.pinyin || [];
      const currentTargetSyllable = syllables[currentSyllableIndex];
      const expectedChar = currentTargetSyllable ? currentTargetSyllable[typedHistory.length] : undefined;

      if (expectedChar && normalizedKey === expectedChar) {
        const newHistory = handleSuccess();
        if (newHistory === currentTargetSyllable) {
          // Syllable completed! (Equivalent to 1 Hanzi)
          set({ correctHanzi: get().correctHanzi + 1 });

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
