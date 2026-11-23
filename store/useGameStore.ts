import { create } from 'zustand';
import { GameMode, Level, ViewState, Language, Participant, PracticeResult } from '../types';
import { MODE_DATA_MAP } from '../constants';
import { KeySoundProfile, playSound, setKeySoundProfile, setSoundEnabled } from '../utils/sound';
import { useUserStore } from './useUserStore';
import { ArcadeDifficulty, ArcadeGameId } from '../data/arcade_games';
import { customListToLevel, loadCustomWordLists } from '../utils/customWordLists';

export type PracticeAssistMode = 'full' | 'blind' | 'zen';

const PREFS_KEY = 'tappy_v1_pro_prefs';

interface StoredPrefs {
  language: Language;
  soundEnabled: boolean;
  ttsEnabled: boolean;
  showFingerZones: boolean;
  selectedGrade: number;
  assistMode: PracticeAssistMode;
  keySoundProfile: KeySoundProfile;
}

const DEFAULT_PREFS: StoredPrefs = {
  language: 'cn',
  soundEnabled: true,
  ttsEnabled: true,
  showFingerZones: true,
  selectedGrade: 1,
  assistMode: 'full',
  keySoundProfile: 'wood'
};

function loadPrefs(): StoredPrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFS;
    const p = JSON.parse(raw);
    const assistMode: PracticeAssistMode =
      p.assistMode === 'blind' || p.assistMode === 'zen' ? p.assistMode : 'full';
    const keySoundProfile: KeySoundProfile =
      p.keySoundProfile === 'tactile' || p.keySoundProfile === 'mute' ? p.keySoundProfile : 'wood';
    return {
      language: p.language === 'en' ? 'en' : 'cn',
      soundEnabled: typeof p.soundEnabled === 'boolean' ? p.soundEnabled : true,
      ttsEnabled: typeof p.ttsEnabled === 'boolean' ? p.ttsEnabled : true,
      showFingerZones: typeof p.showFingerZones === 'boolean' ? p.showFingerZones : true,
      selectedGrade: typeof p.selectedGrade === 'number' && p.selectedGrade >= 1 && p.selectedGrade <= 9 ? p.selectedGrade : 1,
      assistMode,
      keySoundProfile
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

function savePrefs(partial: Partial<StoredPrefs>) {
  try {
    const cur = loadPrefs();
    localStorage.setItem(PREFS_KEY, JSON.stringify({ ...cur, ...partial }));
  } catch {
    // 忽略隐私模式异常
  }
}

const initPrefs = loadPrefs();
setSoundEnabled(initPrefs.soundEnabled);
setKeySoundProfile(initPrefs.keySoundProfile);

interface GameStore {
  language: Language;
  setLanguage: (lang: Language) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  ttsEnabled: boolean;
  setTtsEnabled: (enabled: boolean) => void;
  showFingerZones: boolean;
  setShowFingerZones: (show: boolean) => void;
  assistMode: PracticeAssistMode;
  setAssistMode: (mode: PracticeAssistMode) => void;
  keySoundProfile: KeySoundProfile;
  setKeySoundProfile: (profile: KeySoundProfile) => void;
  dictationMode: boolean;
  setDictationMode: (enabled: boolean) => void;
  refreshCustomLevels: () => void;

  view: ViewState;
  selectedMode: GameMode | null;
  selectedGrade: number;
  availableLevels: Level[];

  currentLevel: Level | null;
  currentChallengeIndex: number;

  typedHistory: string;
  currentSyllableIndex: number;
  lastInputError: boolean;
  isTransitioning: boolean;

  lastPressedKey: string | null;
  lastWrongKey: string | null;
  imeWarning: boolean;
  capsLockOn: boolean;
  setImeWarning: (warning: boolean) => void;
  setCapsLockOn: (capsOn: boolean) => void;

  pendingTTS: { text: string; type: 'char' | 'phrase' | 'word'; lang: 'zh-CN' | 'en-US' } | null;
  clearPendingTTS: () => void;

  score: number;
  errors: number;
  isPlaying: boolean;
  combo: number;
  maxCombo: number;
  startTime: number | null;
  totalKeystrokes: number;
  correctKeystrokes: number;
  correctHanzi: number;

  mistakeKeys: Record<string, number>;
  practiceResult: PracticeResult | null;

  raceStatus: 'idle' | 'countdown' | 'racing' | 'finished';
  participants: Participant[];

  // 趣味游戏厅状态
  activeArcadeGame: ArcadeGameId | null;
  arcadeDifficulty: ArcadeDifficulty;
  startArcadeGame: (gameId: ArcadeGameId, difficulty: ArcadeDifficulty) => void;
  exitArcadeGame: () => void;

  goHome: () => void;
  setView: (view: ViewState) => void;
  selectMode: (mode: GameMode) => void;
  setGrade: (grade: number) => void;
  selectLevel: (levelId: string) => void;
  quickStartLevel: (mode: GameMode, levelId: string) => void;
  startWeakKeyDrill: (keys: string[]) => void;
  restartLevel: () => void;
  nextLevel: () => void;
  exitGame: () => void;

  handleInput: (key: string) => void;
  nextChallenge: () => void;

  startRace: () => void;
  tickRace: (dt: number) => void;

  calculateStats: () => PracticeResult;
}

let raceFinishedRankCounter = 0;

// 可爱动物对手（提升竞速趣味）
const DEFAULT_BOTS: Array<Participant & { avatar?: string }> = [
  { id: 'bot1', name: '🐢 小乌龟', type: 'bot', progress: 0, speed: 1.5 },
  { id: 'bot2', name: '🐰 小白兔', type: 'bot', progress: 0, speed: 2.5 },
  { id: 'bot3', name: '🐆 小猎豹', type: 'bot', progress: 0, speed: 4.0 }
];

function filterLevelsForMode(mode: GameMode, grade: number): Level[] {
  const levels = MODE_DATA_MAP[mode];
  if (mode === 'EN_WORDS') {
    const customLevels = loadCustomWordLists().map(customListToLevel);
    return [...customLevels, ...levels];
  }
  if (mode === 'CN_POEMS' || mode === 'CN_ESSAYS') {
    return levels.filter((l) => l.tags?.includes(`grade-${grade}`));
  }
  return levels;
}

export const useGameStore = create<GameStore>((set, get) => ({
  language: initPrefs.language,
  setLanguage: (language) => {
    savePrefs({ language });
    set({ language });
  },
  soundEnabled: initPrefs.soundEnabled,
  setSoundEnabled: (enabled) => {
    setSoundEnabled(enabled);
    savePrefs({ soundEnabled: enabled });
    set({ soundEnabled: enabled });
  },
  ttsEnabled: initPrefs.ttsEnabled,
  setTtsEnabled: (enabled) => {
    savePrefs({ ttsEnabled: enabled });
    set({ ttsEnabled: enabled });
  },
  showFingerZones: initPrefs.showFingerZones,
  setShowFingerZones: (show) => {
    savePrefs({ showFingerZones: show });
    set({ showFingerZones: show });
  },
  assistMode: initPrefs.assistMode,
  setAssistMode: (assistMode) => {
    savePrefs({ assistMode });
    set({ assistMode });
  },
  keySoundProfile: initPrefs.keySoundProfile,
  setKeySoundProfile: (keySoundProfile) => {
    setKeySoundProfile(keySoundProfile);
    savePrefs({ keySoundProfile });
    set({ keySoundProfile });
  },
  dictationMode: false,
  setDictationMode: (dictationMode) => set({ dictationMode }),
  refreshCustomLevels: () => {
    const { selectedMode, selectedGrade } = get();
    if (selectedMode) {
      set({ availableLevels: filterLevelsForMode(selectedMode, selectedGrade) });
    }
  },

  view: 'HOME',
  selectedMode: null,
  selectedGrade: initPrefs.selectedGrade,
  availableLevels: [],
  currentLevel: null,
  currentChallengeIndex: 0,
  typedHistory: '',
  currentSyllableIndex: 0,
  lastInputError: false,
  isTransitioning: false,

  lastPressedKey: null,
  lastWrongKey: null,
  imeWarning: false,
  capsLockOn: false,
  setImeWarning: (warning) => set({ imeWarning: warning }),
  setCapsLockOn: (capsOn) => set({ capsLockOn: capsOn }),

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

  mistakeKeys: {},
  practiceResult: null,

  raceStatus: 'idle',
  participants: [],

  activeArcadeGame: null,
  arcadeDifficulty: 'easy',
  startArcadeGame: (gameId, difficulty) => {
    set({
      selectedMode: 'RACE_100M',
      activeArcadeGame: gameId,
      arcadeDifficulty: difficulty,
      view: 'GAME',
      isPlaying: true,
      imeWarning: false
    });
  },
  exitArcadeGame: () => {
    set({
      activeArcadeGame: null,
      view: 'LEVELS',
      selectedMode: 'RACE_100M',
      isPlaying: false,
      imeWarning: false
    });
  },

  goHome: () => {
    set({
      view: 'HOME',
      selectedMode: null,
      activeArcadeGame: null,
      availableLevels: [],
      isPlaying: false,
      isTransitioning: false,
      imeWarning: false,
      raceStatus: 'idle'
    });
  },

  setView: (view) => set({ view, isPlaying: false, isTransitioning: false }),

  selectMode: (mode) => {
    // 记忆上次选择的年级，不再强制重置回一年级
    const grade = get().selectedGrade;
    const filteredLevels = filterLevelsForMode(mode, grade);
    set({
      view: 'LEVELS',
      selectedMode: mode,
      availableLevels: filteredLevels
    });
  },

  setGrade: (grade) => {
    savePrefs({ selectedGrade: grade });
    const { selectedMode } = get();
    if (selectedMode === 'CN_POEMS' || selectedMode === 'CN_ESSAYS') {
      const filtered = filterLevelsForMode(selectedMode, grade);
      set({ selectedGrade: grade, availableLevels: filtered });
    } else {
      set({ selectedGrade: grade });
    }
  },

  selectLevel: (levelId) => {
    const { availableLevels, selectedMode } = get();
    const level = availableLevels.find((l) => l.id === levelId);
    if (!level) return;

    playSound('click');

    const currentUser = useUserStore.getState().currentUser;
    let raceStatePartial = {};
    if (selectedMode === 'RACE_100M') {
      raceFinishedRankCounter = 0;
      raceStatePartial = {
        raceStatus: 'countdown' as const,
        participants: [
          {
            id: 'player',
            name: currentUser ? `${currentUser.avatar} ${currentUser.name}` : '🐼 你',
            type: 'player' as const,
            progress: 0,
            speed: 0,
            finishedRank: undefined
          },
          ...DEFAULT_BOTS.map((b) => ({ ...b, progress: 0, finishedRank: undefined }))
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
      isPlaying: true,
      isTransitioning: false,
      lastInputError: false,
      lastPressedKey: null,
      lastWrongKey: null,
      imeWarning: false,
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

  startWeakKeyDrill: (rawKeys) => {
    const cleanKeys = Array.from(
      new Set(
        rawKeys
          .map((k) => k.trim().toLowerCase())
          .filter((k) => k.length === 1 && /^[a-z,.;'?]$/.test(k))
      )
    ).slice(0, 5);
    if (cleanKeys.length === 0) return;

    playSound('click');
    const anchors = ['f', 'j', 'a', 's', 'd', 'k', 'l'];
    const challenges: Array<{ display: string }> = [];

    // 阶段 1：单键反复建立定位记忆
    cleanKeys.forEach((k) => {
      challenges.push({ display: k });
      challenges.push({ display: `${k}${k}` });
    });

    // 阶段 2：与基准行键位交替敲击
    for (let i = 0; i < 6; i++) {
      const k1 = cleanKeys[i % cleanKeys.length];
      const k2 = cleanKeys[(i + 1) % cleanKeys.length];
      const anc = anchors[i % anchors.length];
      challenges.push({ display: `${anc}${k1}${anc}${k2}` });
    }

    // 阶段 3：节奏短组巩固
    for (let i = 0; i < 4; i++) {
      const seq = [0, 1, 2]
        .map((off) => cleanKeys[(i + off) % cleanKeys.length])
        .join('');
      const anc = anchors[(i + 2) % anchors.length];
      challenges.push({ display: `${seq} ${anc}${seq[0]}` });
    }

    const label = cleanKeys.map((k) => k.toUpperCase()).join(' / ');
    const lang = get().language;
    const drillLevel: Level = {
      id: `weak_drill_${cleanKeys.join('')}`,
      title: lang === 'cn' ? `薄弱键特训 · ${label}` : `Weak Key Drill · ${label}`,
      description: lang === 'cn' ? '针对本局错键的 30 秒精准强化' : 'Targeted muscle-memory drill',
      difficulty: 2,
      challenges: challenges.slice(0, 14)
    };

    set({
      selectedMode: 'EN_LETTERS',
      availableLevels: MODE_DATA_MAP.EN_LETTERS,
      view: 'GAME',
      currentLevel: drillLevel,
      currentChallengeIndex: 0,
      typedHistory: '',
      currentSyllableIndex: 0,
      score: 0,
      errors: 0,
      isPlaying: true,
      isTransitioning: false,
      lastInputError: false,
      lastPressedKey: null,
      lastWrongKey: null,
      imeWarning: false,
      combo: 0,
      maxCombo: 0,
      startTime: null,
      totalKeystrokes: 0,
      correctKeystrokes: 0,
      correctHanzi: 0,
      mistakeKeys: {},
      practiceResult: null
    });
  },

  quickStartLevel: (mode, levelId) => {
    const allLevels = filterLevelsForMode(mode, get().selectedGrade);
    const target = allLevels.find((l) => l.id === levelId) || MODE_DATA_MAP[mode].find((l) => l.id === levelId);
    let targetGrade = get().selectedGrade;
    if (target && (mode === 'CN_POEMS' || mode === 'CN_ESSAYS')) {
      const gTag = target.tags?.find((t) => t.startsWith('grade-'));
      if (gTag) {
        const parsed = parseInt(gTag.replace('grade-', ''), 10);
        if (!Number.isNaN(parsed)) {
          targetGrade = parsed;
          savePrefs({ selectedGrade: parsed });
        }
      }
    }
    const levels = filterLevelsForMode(mode, targetGrade);
    set({ selectedMode: mode, selectedGrade: targetGrade, availableLevels: levels });
    get().selectLevel(levelId);
  },

  startRace: () => {
    set({ raceStatus: 'racing', startTime: Date.now() });
  },

  tickRace: (dt: number) => {
    const { raceStatus, participants } = get();
    if (raceStatus !== 'racing') return;

    const newParticipants = participants.map((p) => {
      if (p.type === 'player' || p.progress >= 100) return p;

      const jitter = Math.random() * 1.5;
      const move = (p.speed + jitter) * dt;
      const newProgress = Math.min(100, p.progress + move);

      if (newProgress >= 100 && p.finishedRank === undefined) {
        raceFinishedRankCounter++;
        return { ...p, progress: newProgress, finishedRank: raceFinishedRankCounter };
      }
      return { ...p, progress: newProgress };
    });

    set({ participants: newParticipants });
  },

  exitGame: () => {
    set({
      view: 'LEVELS',
      isPlaying: false,
      isTransitioning: false,
      currentLevel: null,
      imeWarning: false,
      raceStatus: 'idle'
    });
  },

  restartLevel: () => {
    const { currentLevel, selectedMode } = get();
    if (!currentLevel) return;

    const currentUser = useUserStore.getState().currentUser;
    let raceStatePartial = {};
    if (selectedMode === 'RACE_100M') {
      raceFinishedRankCounter = 0;
      raceStatePartial = {
        raceStatus: 'countdown' as const,
        participants: [
          {
            id: 'player',
            name: currentUser ? `${currentUser.avatar} ${currentUser.name}` : '🐼 你',
            type: 'player' as const,
            progress: 0,
            speed: 0,
            finishedRank: undefined
          },
          ...DEFAULT_BOTS.map((b) => ({ ...b, progress: 0, finishedRank: undefined }))
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
      isTransitioning: false,
      lastInputError: false,
      lastPressedKey: null,
      lastWrongKey: null,
      imeWarning: false,
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

    const currentIndex = availableLevels.findIndex((l) => l.id === currentLevel.id);
    if (currentIndex >= 0 && currentIndex < availableLevels.length - 1) {
      selectLevel(availableLevels[currentIndex + 1].id);
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
        raceFinishedRankCounter++;
        const { participants } = get();
        set({
          raceStatus: 'finished',
          view: 'RESULT',
          isPlaying: false,
          isTransitioning: false,
          participants: participants.map((p) =>
            p.type === 'player' ? { ...p, progress: 100, finishedRank: raceFinishedRankCounter } : p
          )
        });
      } else {
        set({ view: 'RESULT', isPlaying: false, isTransitioning: false });
      }
    } else {
      playSound('success');
      set({
        currentChallengeIndex: currentChallengeIndex + 1,
        typedHistory: '',
        currentSyllableIndex: 0,
        lastInputError: false,
        isTransitioning: false
      });

      if (selectedMode === 'RACE_100M') {
        const { participants } = get();
        const total = currentLevel.challenges.length;
        const progress = ((currentChallengeIndex + 1) / total) * 100;
        set({
          participants: participants.map((p) =>
            p.type === 'player' ? { ...p, progress } : p
          )
        });
      }
    }
  },

  handleInput: (key: string) => {
    const {
      isPlaying,
      isTransitioning,
      currentLevel,
      currentChallengeIndex,
      selectedMode,
      typedHistory,
      currentSyllableIndex,
      nextChallenge,
      startTime,
      raceStatus
    } = get();

    if (selectedMode === 'RACE_100M' && raceStatus !== 'racing') return;
    if (!isPlaying || isTransitioning || !currentLevel) return;

    const currentItem = currentLevel.challenges[currentChallengeIndex];
    if (!currentItem) return;

    const normalizedKey = key.toLowerCase();
    const newStartTime = startTime || Date.now();

    set({ lastPressedKey: normalizedKey, imeWarning: false });
    setTimeout(() => {
      if (get().lastPressedKey === normalizedKey) {
        set({ lastPressedKey: null });
      }
    }, 150);

    const handleSuccess = () => {
      playSound('click');
      const newHistory = typedHistory + normalizedKey;
      const newCombo = get().combo + 1;
      set({
        typedHistory: newHistory,
        lastInputError: false,
        lastWrongKey: null,
        score: get().score + 10,
        combo: newCombo,
        maxCombo: Math.max(newCombo, get().maxCombo),
        totalKeystrokes: get().totalKeystrokes + 1,
        correctKeystrokes: get().correctKeystrokes + 1,
        startTime: newStartTime
      });
      return newHistory;
    };

    const handleError = (expectedKey: string, wrongKey: string) => {
      playSound('error');
      const mistakeKeys = { ...get().mistakeKeys };
      const keyToTrack = expectedKey.toLowerCase();
      mistakeKeys[keyToTrack] = (mistakeKeys[keyToTrack] || 0) + 1;

      set({
        errors: get().errors + 1,
        lastInputError: true,
        lastWrongKey: wrongKey.toLowerCase(),
        combo: 0,
        totalKeystrokes: get().totalKeystrokes + 1,
        startTime: newStartTime,
        mistakeKeys
      });
      setTimeout(() => set({ lastInputError: false, lastWrongKey: null }), 320);
    };

    if (
      selectedMode === 'EN_LETTERS' ||
      selectedMode === 'EN_WORDS' ||
      selectedMode === 'EN_ESSAYS' ||
      selectedMode === 'RACE_100M'
    ) {
      const targetStr = currentItem.display.toLowerCase();
      const nextChar = targetStr[typedHistory.length];

      if (normalizedKey === nextChar) {
        const newHistory = handleSuccess();
        // 字母练习模式：每敲对一个英文字母就清晰读出该字母，绝不连起来拼读整串键位组合
        if (selectedMode === 'EN_LETTERS' && /^[a-z]$/.test(normalizedKey)) {
          set({ pendingTTS: { text: normalizedKey, type: 'char', lang: 'en-US' } });
        }
        if (newHistory.length === targetStr.length) {
          if (selectedMode !== 'RACE_100M' && selectedMode !== 'EN_LETTERS') {
            set({ pendingTTS: { text: currentItem.display, type: 'word', lang: 'en-US' } });
          }
          set({ isTransitioning: true });
          const delay = selectedMode === 'RACE_100M' ? 60 : 300;
          setTimeout(() => nextChallenge(), delay);
        }
      } else {
        handleError(nextChar || normalizedKey, normalizedKey);
      }
      return;
    }

    // 中文模式：零延迟即时推进单字音节，告别 500ms 吞键误判
    const syllables = currentItem.pinyin || [];
    const currentTargetSyllable = syllables[currentSyllableIndex];
    const expectedChar = currentTargetSyllable ? currentTargetSyllable[typedHistory.length] : undefined;
    const isSentenceMode =
      selectedMode === 'CN_SENTENCES' || selectedMode === 'CN_POEMS' || selectedMode === 'CN_ESSAYS';

    if (expectedChar && normalizedKey === expectedChar) {
      const newHistory = handleSuccess();
      if (newHistory === currentTargetSyllable) {
        set({ correctHanzi: get().correctHanzi + 1 });

        if (currentSyllableIndex + 1 >= syllables.length) {
          if (isSentenceMode) {
            set({ pendingTTS: { text: currentItem.display, type: 'phrase', lang: 'zh-CN' } });
          } else {
            const chars = currentItem.display.split('');
            const lastChar = chars[chars.length - 1];
            if (lastChar) {
              set({ pendingTTS: { text: lastChar, type: 'char', lang: 'zh-CN' } });
            }
          }
          set({ isTransitioning: true });
          setTimeout(() => nextChallenge(), isSentenceMode ? 500 : 300);
        } else {
          if (!isSentenceMode) {
            const chars = currentItem.display.split('');
            const completedChar = chars[currentSyllableIndex];
            if (completedChar) {
              set({ pendingTTS: { text: completedChar, type: 'char', lang: 'zh-CN' } });
            }
          }
          set({
            currentSyllableIndex: currentSyllableIndex + 1,
            typedHistory: ''
          });
        }
      }
    } else {
      handleError(expectedChar || normalizedKey, normalizedKey);
    }
  },

  calculateStats: () => {
    const {
      totalKeystrokes,
      correctKeystrokes,
      correctHanzi,
      startTime,
      maxCombo,
      score,
      mistakeKeys,
      selectedMode,
      participants
    } = get();

    const endTime = Date.now();
    const timeSpent = startTime ? Math.max(1, Math.round((endTime - startTime) / 1000)) : 1;
    const accuracy = totalKeystrokes > 0 ? Math.round((correctKeystrokes / totalKeystrokes) * 100) : 100;
    const minutesSpent = Math.max(timeSpent / 60, 1 / 60);

    let wpm: number;
    if (selectedMode === 'EN_LETTERS') {
      wpm = Math.round(correctKeystrokes / minutesSpent);
    } else if (selectedMode?.startsWith('EN') || selectedMode === 'RACE_100M') {
      wpm = Math.round(correctKeystrokes / 5 / minutesSpent);
    } else {
      const units = correctHanzi > 0 ? correctHanzi : Math.round(correctKeystrokes / 3);
      wpm = Math.round(units / minutesSpent);
    }

    const sortedMistakes = Object.entries(mistakeKeys)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([key]) => key);

    let stars: 1 | 2 | 3 = 1;
    if (selectedMode === 'RACE_100M') {
      const player = participants.find((p) => p.type === 'player');
      const rank = player?.finishedRank || 4;
      if (rank === 1 && accuracy >= 85) stars = 3;
      else if (rank <= 2 || accuracy >= 80) stars = 2;
    } else {
      if (accuracy >= 90 && wpm >= 15) stars = 3;
      else if (accuracy >= 80) stars = 2;
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

    set({ practiceResult: result });
    return result;
  }
}));
