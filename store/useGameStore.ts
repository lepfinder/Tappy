
import { create } from 'zustand';
import { ChallengeItem, GameMode, Level, ViewState, Language, Participant, PracticeResult } from '../types';
import { MODE_DATA_MAP } from '../constants';
import { playSound, setSoundEnabled } from '../utils/sound';

interface GameStore {
  // Global Settings
  language: Language;
  setLanguage: (lang: Language) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  ttsEnabled: boolean;
  setTtsEnabled: (enabled: boolean) => void;

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

  // TTS State - triggers immediate TTS playback
  pendingTTS: { text: string; type: 'char' | 'phrase' | 'word'; lang: 'zh-CN' | 'en-US' } | null;
  clearPendingTTS: () => void;

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

  // Mistake Tracking for Stats
  mistakeKeys: Record<string, number>; // key -> error count
  practiceResult: PracticeResult | null;

  // Race State
  raceStatus: 'idle' | 'countdown' | 'racing' | 'finished';
  participants: Participant[];

  // Actions
  goHome: () => void;
  setView: (view: ViewState) => void;
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

  // Stats
  calculateStats: () => PracticeResult;
}

// Track finish order globally within a race session
let raceFinishedRankCounter = 0;

const DEFAULT_BOTS: Participant[] = [
  { id: 'bot1', name: 'Bot A', type: 'bot', progress: 0, speed: 1.5 }, // Slow
  { id: 'bot2', name: 'Bot B', type: 'bot', progress: 0, speed: 2.5 }, // Medium
  { id: 'bot3', name: 'Bot C', type: 'bot', progress: 0, speed: 4 }, // Fast
];

export const useGameStore = create<GameStore>((set, get) => ({
  language: 'cn',
  setLanguage: (lang) => set({ language: lang }),
  soundEnabled: true,
  setSoundEnabled: (enabled) => {
    setSoundEnabled(enabled);
    set({ soundEnabled: enabled });
  },
  ttsEnabled: true,
  setTtsEnabled: (enabled) => set({ ttsEnabled: enabled }),

  view: 'HOME',
  selectedMode: null,
  selectedGrade: 1,
  availableLevels: [],
  currentLevel: null,
  currentChallengeIndex: 0,
  typedHistory: '',
  currentSyllableIndex: 0,
  lastInputError: false,

  // TTS State - triggers immediate TTS playback
  pendingTTS: null,
  clearPendingTTS: () => set({ pendingTTS: null }),

  score: 0,
  errors: 0,
  isPlaying: false,
  combo: 0,
  maxCombo: 0,
  startTime: null,
  totalKeystrokes: 0,
  correctKeystrokes: 0,
  correctHanzi: 0,

  // Mistake Tracking
  mistakeKeys: {},
  practiceResult: null,

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

  setView: (view) => set({ view }),

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
      raceFinishedRankCounter = 0; // Reset finish order for new race
      raceStatePartial = {
        raceStatus: 'countdown',
        participants: [
          { id: 'player', name: 'You', type: 'player', progress: 0, speed: 0, finishedRank: undefined },
          ...DEFAULT_BOTS.map(b => ({ ...b, progress: 0, finishedRank: undefined }))
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
      mistakeKeys: {},
      practiceResult: null,
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

    const newParticipants = participants.map(p => {
      if (p.type === 'player' || p.progress >= 100) return p;

      // Bot logic: move forward based on speed + random jitter
      const jitter = Math.random() * 1.5;
      const move = (p.speed + jitter) * dt;
      const newProgress = Math.min(100, p.progress + move);

      // Record finish order when bot crosses finish line
      if (newProgress >= 100 && p.finishedRank === undefined) {
        raceFinishedRankCounter++;
        return { ...p, progress: newProgress, finishedRank: raceFinishedRankCounter };
      }
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
      raceFinishedRankCounter = 0; // Reset finish order for restart
      raceStatePartial = {
        raceStatus: 'countdown',
        participants: [
          { id: 'player', name: 'You', type: 'player', progress: 0, speed: 0, finishedRank: undefined },
          ...DEFAULT_BOTS.map(b => ({ ...b, progress: 0, finishedRank: undefined }))
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
      mistakeKeys: {},
      practiceResult: null,
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
        // Record player's finish order
        raceFinishedRankCounter++;
        const { participants } = get();
        set({
          raceStatus: 'finished',
          view: 'RESULT',
          isPlaying: false,
          participants: participants.map(p => p.type === 'player' ? { ...p, progress: 100, finishedRank: raceFinishedRankCounter } : p)
        });
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

    const handleError = (expectedKey: string) => {
      playSound('error');
      // Track mistake key
      const mistakeKeys = { ...get().mistakeKeys };
      const keyToTrack = expectedKey.toLowerCase();
      mistakeKeys[keyToTrack] = (mistakeKeys[keyToTrack] || 0) + 1;

      set({
        errors: get().errors + 1,
        lastInputError: true,
        combo: 0,
        totalKeystrokes: get().totalKeystrokes + 1,
        startTime: newStartTime,
        mistakeKeys
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
          // Trigger TTS immediately for the completed word
          if (selectedMode !== 'RACE_100M') {
            set({ pendingTTS: { text: currentItem.display, type: 'word', lang: 'en-US' } });
          }
          // In race mode, instant transition; otherwise delay to allow TTS to finish
          const delay = selectedMode === 'RACE_100M' ? 50 : 500;
          setTimeout(() => nextChallenge(), delay);
        }
      } else {
        handleError(nextChar || normalizedKey);
      }
    }
    // -- LOGIC: CHINESE MODES --
    else {
      const syllables = currentItem.pinyin || [];
      const currentTargetSyllable = syllables[currentSyllableIndex];
      const expectedChar = currentTargetSyllable ? currentTargetSyllable[typedHistory.length] : undefined;
      const isSentenceMode = selectedMode === 'CN_SENTENCES' || selectedMode === 'CN_POEMS' || selectedMode === 'CN_ESSAYS';

      if (expectedChar && normalizedKey === expectedChar) {
        const newHistory = handleSuccess();
        if (newHistory === currentTargetSyllable) {
          // Syllable completed! (Equivalent to 1 Hanzi)
          set({ correctHanzi: get().correctHanzi + 1 });

          if (currentSyllableIndex + 1 >= syllables.length) {
            // Challenge completed - trigger TTS immediately
            if (isSentenceMode) {
              // For sentence/poem modes: play full phrase
              set({ pendingTTS: { text: currentItem.display, type: 'phrase', lang: 'zh-CN' } });
            } else {
              // For CN_PINYIN: play the last character
              const chars = currentItem.display.split('');
              const lastChar = chars[chars.length - 1];
              if (lastChar) {
                set({ pendingTTS: { text: lastChar, type: 'char', lang: 'zh-CN' } });
              }
            }
            // Delay to allow TTS to finish
            const delay = isSentenceMode ? 1000 : 500;
            setTimeout(() => nextChallenge(), delay);
          } else {
            // Syllable completed within same challenge
            // For sentence modes: no per-character TTS, no delay
            // For CN_PINYIN: play the character TTS with delay
            if (!isSentenceMode) {
              const chars = currentItem.display.split('');
              const completedChar = chars[currentSyllableIndex];
              if (completedChar) {
                set({ pendingTTS: { text: completedChar, type: 'char', lang: 'zh-CN' } });
              }
              // Moving to next syllable: 500ms delay for character TTS
              setTimeout(() => {
                set({
                  currentSyllableIndex: currentSyllableIndex + 1,
                  typedHistory: ''
                });
              }, 500);
            } else {
              // For sentence modes: immediate transition, no TTS
              set({
                currentSyllableIndex: currentSyllableIndex + 1,
                typedHistory: ''
              });
            }
          }
        }
      } else {
        handleError(expectedChar || normalizedKey);
      }
    }
  },

  calculateStats: () => {
    const {
      totalKeystrokes,
      correctKeystrokes,
      startTime,
      maxCombo,
      score,
      mistakeKeys,
      selectedMode
    } = get();

    // Calculate time spent
    const endTime = Date.now();
    const timeSpent = startTime ? Math.round((endTime - startTime) / 1000) : 0;

    // Calculate accuracy (0-100)
    const accuracy = totalKeystrokes > 0
      ? Math.round((correctKeystrokes / totalKeystrokes) * 100)
      : 100;

    // Calculate WPM (Words Per Minute) or CPM (Characters Per Minute)
    // For EN_LETTERS: Use CPM (each keystroke counts)
    // For EN_WORDS/EN_ESSAYS/RACE: 5 characters = 1 word (standard WPM)
    // For Chinese: 1 character = 1 word
    const minutesSpent = timeSpent / 60 || 1 / 60; // Avoid division by zero, minimum 1 second

    let wpm: number;
    if (selectedMode === 'EN_LETTERS') {
      // CPM for letter practice - this makes more sense for single letter exercises
      wpm = Math.round(correctKeystrokes / minutesSpent);
    } else if (selectedMode?.startsWith('EN') || selectedMode === 'RACE_100M') {
      // Standard WPM (5 chars = 1 word) for word/sentence practice
      wpm = Math.round((correctKeystrokes / 5) / minutesSpent);
    } else {
      // Chinese: Each character/hanzi counts as one
      wpm = Math.round(correctKeystrokes / minutesSpent);
    }

    // Get top 3 mistake keys
    const sortedMistakes = Object.entries(mistakeKeys)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([key]) => key);

    // Calculate stars based on accuracy and WPM
    let stars: 1 | 2 | 3 = 1;
    if (accuracy >= 90 && wpm >= 15) {
      stars = 3;
    } else if (accuracy >= 80) {
      stars = 2;
    }

    const result: PracticeResult = {
      wpm,
      accuracy,
      timeSpent,
      maxCombo,
      mistakeKeys: sortedMistakes,
      stars,
      score
    };

    // Store the result
    set({ practiceResult: result });

    return result;
  }
}));
