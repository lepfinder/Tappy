
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { useUserStore } from '../store/useUserStore';
import { useTTS } from '../hooks/useTTS';
import { useBadgeSystem, SessionResult } from '../hooks/useBadgeSystem';
import { Badge } from '../data/badges';
import { BadgeUnlockModal } from './BadgeUnlockModal';
import { TRANSLATIONS } from '../i18n';
import { Star, RotateCcw, Menu, ArrowRight, Zap, Target, Flame, AlertCircle, Volume2, VolumeX, Keyboard, Eye, Headphones } from 'lucide-react';

// Animated counter hook
const useCountUp = (end: number, duration: number = 1000) => {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number>();

  useEffect(() => {
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      setCount(Math.round(eased * end));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [end, duration]);

  return count;
};

// Animated Stats box component
const AnimatedStatBox: React.FC<{
  label: string;
  value: number;
  suffix?: string;
  unit?: string;
  icon: React.ReactNode;
  colorClass: string;
  delay: number;
}> = ({ label, value, suffix = '', unit, icon, colorClass, delay }) => {
  const animatedValue = useCountUp(value, 1200);

  return (
    <motion.div
      className={`${colorClass} p-4 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-sm`}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.4, type: "spring", stiffness: 100 }}
    >
      <motion.div
        className="text-gray-400 mb-1"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: delay + 0.2, type: "spring", stiffness: 200 }}
      >
        {icon}
      </motion.div>
      <span className="text-xs text-gray-500">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-gray-700">{animatedValue}{suffix}</span>
        {unit && <span className="text-sm text-gray-400">{unit}</span>}
      </div>
    </motion.div>
  );
};

export const TypingArea: React.FC = () => {
  const {
    currentLevel,
    currentChallengeIndex,
    typedHistory,
    currentSyllableIndex,
    selectedMode,
    lastInputError,
    lastWrongKey,
    combo,
    mistakeKeys: rawMistakeKeys,
    view,
    restartLevel,
    exitGame,
    nextLevel,
    startWeakKeyDrill,
    availableLevels,
    language,
    calculateStats,
    practiceResult,
    ttsEnabled,
    setTtsEnabled,
    dictationMode,
    imeWarning,
    capsLockOn
  } = useGameStore();

  const { saveRecord, currentUser } = useUserStore();
  const t = TRANSLATIONS[language];
  const { speak, speakPhrase } = useTTS();

  // Refs for tracking progress to trigger TTS
  const prevChallengeRef = useRef(currentChallengeIndex);
  const prevSyllableRef = useRef(currentSyllableIndex);

  // Calculate stats when entering result view
  const [stats, setStats] = useState(practiceResult);
  const [showStars, setShowStars] = useState([false, false, false]);
  const [recordSaved, setRecordSaved] = useState(false);

  // Badge unlock state
  const [unlockedBadges, setUnlockedBadges] = useState<Badge[]>([]);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const { checkAndUnlockBadges } = useBadgeSystem();

  useEffect(() => {
    if (view === 'RESULT' && !practiceResult) {
      const result = calculateStats();
      setStats(result);
    } else if (view === 'RESULT' && practiceResult) {
      setStats(practiceResult);
    }
    // Reset recordSaved when leaving result view
    if (view !== 'RESULT') {
      setRecordSaved(false);
    }
  }, [view, practiceResult, calculateStats]);

  // Save record to database when stats are calculated
  useEffect(() => {
    if (view === 'RESULT' && stats && currentLevel && currentUser && !recordSaved) {
      saveRecord({
        levelId: currentLevel.id,
        mode: selectedMode || 'UNKNOWN',
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        stars: stats.stars,
        score: stats.score,
        maxCombo: stats.maxCombo,
        timeSpent: stats.timeSpent
      });
      setRecordSaved(true);

      // Check for badge unlocks
      if (currentUser.id) {
        const sessionResult: SessionResult = {
          wpm: stats.wpm,
          accuracy: stats.accuracy,
          maxCombo: stats.maxCombo,
          timeSpent: stats.timeSpent,
          levelId: currentLevel.id,
          mode: selectedMode || 'UNKNOWN'
        };
        checkAndUnlockBadges(currentUser.id, sessionResult).then(badges => {
          if (badges.length > 0) {
            setUnlockedBadges(badges);
            // Show badge modal after a short delay for better UX
            setTimeout(() => setShowBadgeModal(true), 1500);
          }
        });
      }
    }
  }, [view, stats, currentLevel, currentUser, selectedMode, saveRecord, recordSaved, checkAndUnlockBadges]);

  // Animate stars appearing one by one
  useEffect(() => {
    if (view === 'RESULT' && stats) {
      setShowStars([false, false, false]);
      const timers: NodeJS.Timeout[] = [];
      for (let i = 0; i < stats.stars; i++) {
        timers.push(setTimeout(() => {
          setShowStars(prev => {
            const next = [...prev];
            next[i] = true;
            return next;
          });
        }, 300 + i * 300));
      }
      return () => timers.forEach(clearTimeout);
    }
  }, [view, stats]);

  // TTS Logic - Play audio immediately when pendingTTS is set
  const { pendingTTS, clearPendingTTS } = useGameStore();

  useEffect(() => {
    if (!pendingTTS) return;

    // Play the TTS immediately
    if (pendingTTS.type === 'phrase') {
      speakPhrase(pendingTTS.text, true);
    } else {
      speak(pendingTTS.text, pendingTTS.lang, true);
    }

    // Clear the pending TTS state
    clearPendingTTS();
  }, [pendingTTS, speak, speakPhrase, clearPendingTTS]);

  // Keep refs in sync for other logic (no longer used for TTS, kept for future use)
  useEffect(() => {
    if (view === 'GAME' || view === 'RESULT') {
      prevChallengeRef.current = currentChallengeIndex;
      prevSyllableRef.current = currentSyllableIndex;
    }
  }, [currentChallengeIndex, currentSyllableIndex, view]);

  // Result page keyboard shortcuts state
  const [hotkeyEnabled, setHotkeyEnabled] = useState(false);
  const resultShownTimeRef = useRef<number>(0);

  // 听写模式「偷看 1.2 秒」状态（按 Tab 或点击按钮触发）
  const [peekVisible, setPeekVisible] = useState(false);
  const peekTimerRef = useRef<number | null>(null);
  const isDictationActive = dictationMode && selectedMode === 'EN_WORDS';

  const triggerPeek = () => {
    setPeekVisible(true);
    if (peekTimerRef.current) window.clearTimeout(peekTimerRef.current);
    peekTimerRef.current = window.setTimeout(() => setPeekVisible(false), 1200);
  };

  useEffect(() => {
    setPeekVisible(false);
    if (peekTimerRef.current) {
      window.clearTimeout(peekTimerRef.current);
      peekTimerRef.current = null;
    }
  }, [currentChallengeIndex, currentLevel?.id, dictationMode]);

  useEffect(() => {
    if (view !== 'GAME' || !isDictationActive) return;
    const onTabPeek = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        triggerPeek();
      }
    };
    window.addEventListener('keydown', onTabPeek);
    return () => window.removeEventListener('keydown', onTabPeek);
  }, [view, isDictationActive]);

  // Enable hotkeys after 1 second delay when entering result view
  useEffect(() => {
    if (view === 'RESULT') {
      resultShownTimeRef.current = Date.now();
      setHotkeyEnabled(false);
      const timer = setTimeout(() => {
        setHotkeyEnabled(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setHotkeyEnabled(false);
    }
  }, [view]);

  // Result page keyboard shortcuts
  useEffect(() => {
    if (view !== 'RESULT' || !hotkeyEnabled) return;

    const hasNext = currentLevel && availableLevels.findIndex(l => l.id === currentLevel.id) < availableLevels.length - 1;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent if still in cooldown
      if (Date.now() - resultShownTimeRef.current < 1000) return;

      const key = e.key.toLowerCase();

      // Enter or Space → Next Level (if available)
      if ((e.key === 'Enter' || e.key === ' ') && hasNext) {
        e.preventDefault();
        nextLevel();
        return;
      }

      // R → Replay
      if (key === 'r') {
        e.preventDefault();
        restartLevel();
        return;
      }

      // D → Drill Weak Keys (when mistakes exist)
      if (key === 'd' && stats && stats.mistakeKeys.length > 0) {
        e.preventDefault();
        startWeakKeyDrill(stats.mistakeKeys);
        return;
      }

      // Escape → Back to List
      if (e.key === 'Escape') {
        e.preventDefault();
        exitGame();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, hotkeyEnabled, currentLevel, availableLevels, nextLevel, restartLevel, exitGame, stats, startWeakKeyDrill]);

  if (view === 'RESULT') {
    const hasNext = currentLevel && availableLevels.findIndex(l => l.id === currentLevel.id) < availableLevels.length - 1;

    // Use calculated stats or defaults
    const displayStats = stats || {
      wpm: 0,
      accuracy: 100,
      maxCombo: 0,
      mistakeKeys: [],
      stars: 1 as const,
      score: 0,
      timeSpent: 0
    };

    const starMessage = t.starMessages[displayStats.stars as 1 | 2 | 3];

    return (
      <motion.div
        className="flex flex-col items-center justify-center py-3 sm:py-5"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, type: "spring", stiffness: 120 }}
      >
        {/* Stars Section with staggered animation */}
        <div className="flex justify-center gap-3 mb-3 h-14">
          {[1, 2, 3].map((starNum, idx) => (
            <AnimatePresence key={starNum}>
              {showStars[idx] ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0, rotate: -180 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 15,
                    duration: 0.6
                  }}
                >
                  <Star
                    size={48}
                    className="fill-yellow-400 text-yellow-400 drop-shadow-lg"
                  />
                </motion.div>
              ) : (
                <Star
                  size={48}
                  className="text-gray-200"
                />
              )}
            </AnimatePresence>
          ))}
        </div>

        {/* Title & Message */}
        <motion.h2
          className="text-3xl font-cartoon text-kid-blue mb-1"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          {t.levelComplete}
        </motion.h2>
        <motion.p
          className="text-lg text-gray-500 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          {starMessage}
        </motion.p>

        {/* Stats Grid - 桌面端紧凑一行 4 列，移动端 2x2 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl mb-7">
          <AnimatedStatBox
            label={t.speed}
            value={displayStats.wpm}
            unit={selectedMode === 'EN_LETTERS' ? 'CPM' : (selectedMode?.startsWith('CN') ? 'CPM' : 'WPM')}
            icon={<Zap size={20} />}
            colorClass="bg-blue-50"
            delay={0.6}
          />
          <AnimatedStatBox
            label={t.accuracy}
            value={displayStats.accuracy}
            suffix="%"
            icon={<Target size={20} />}
            colorClass={displayStats.accuracy >= 90 ? "bg-green-50" : displayStats.accuracy >= 70 ? "bg-yellow-50" : "bg-red-50"}
            delay={0.7}
          />
          <AnimatedStatBox
            label={t.maxCombo}
            value={displayStats.maxCombo}
            icon={<Flame size={20} />}
            colorClass="bg-orange-50"
            delay={0.8}
          />
          <motion.div
            className="bg-purple-50 p-4 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-sm"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.9, duration: 0.4, type: "spring", stiffness: 100 }}
          >
            <motion.div
              className="text-gray-400 mb-1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.1, type: "spring", stiffness: 200 }}
            >
              <AlertCircle size={20} />
            </motion.div>
            <span className="text-xs text-gray-500">{t.needPractice}</span>
            <div className="flex flex-wrap justify-center gap-1.5 mt-1">
              {displayStats.mistakeKeys.length > 0 ? (
                displayStats.mistakeKeys.map((k, idx) => {
                  const count = rawMistakeKeys[k] || rawMistakeKeys[k.toLowerCase()] || 0;
                  return (
                    <motion.span
                      key={k}
                      className="font-mono font-bold text-sm text-purple-700 uppercase bg-purple-100 px-2 py-0.5 rounded-lg inline-flex items-baseline gap-0.5"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.2 + idx * 0.1, type: "spring" }}
                    >
                      <span>{k === ' ' ? '␣' : k}</span>
                      {count > 0 && (
                        <span className="text-[10px] font-extrabold text-purple-500 lowercase">
                          ×{count}
                        </span>
                      )}
                    </motion.span>
                  );
                })
              ) : (
                <motion.span
                  className="text-green-500 font-bold text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                >
                  {t.perfect}
                </motion.span>
              )}
            </div>
          </motion.div>
        </div>

        {/* Action Buttons with staggered fade-in and hotkey hints */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.4 }}
        >
          <button
            onClick={restartLevel}
            className="px-5 py-2.5 bg-gray-100 rounded-full font-bold text-gray-600 flex items-center gap-2 hover:bg-gray-200 transition-colors hover:scale-105 active:scale-95 cursor-pointer"
          >
            <RotateCcw size={17} /> {t.replay}
            <span className="text-xs opacity-50 ml-0.5">[R]</span>
          </button>
          <button
            onClick={exitGame}
            className="px-5 py-2.5 bg-gray-100 rounded-full font-bold text-gray-600 flex items-center gap-2 hover:bg-gray-200 transition-colors hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Menu size={17} /> {t.levels}
            <span className="text-xs opacity-50 ml-0.5">[Esc]</span>
          </button>
          {displayStats.mistakeKeys.length > 0 && (
            <button
              onClick={() => startWeakKeyDrill(displayStats.mistakeKeys)}
              className="px-5 py-2.5 bg-purple-100 text-purple-700 rounded-full font-bold flex items-center gap-1.5 hover:bg-purple-200 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Zap size={17} />
              {language === 'cn' ? '特训错键' : 'Drill Weak Keys'}
              <span className="text-xs opacity-55 ml-0.5">[D]</span>
            </button>
          )}
          {hasNext && (
            <button
              onClick={nextLevel}
              className="px-6 py-2.5 bg-kid-blue text-white rounded-full font-bold flex items-center gap-2 hover:bg-blue-400 shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              {t.next} <ArrowRight size={17} />
              <span className="text-xs opacity-60 ml-0.5">⏎</span>
            </button>
          )}
        </motion.div>

        {/* Badge Unlock Modal */}
        {showBadgeModal && unlockedBadges.length > 0 && (
          <BadgeUnlockModal
            badges={unlockedBadges}
            onClose={() => {
              setShowBadgeModal(false);
              setUnlockedBadges([]);
            }}
            language={language}
          />
        )}
      </motion.div>
    );
  }

  if (!currentLevel) return null;

  // Progress Calculations
  const total = currentLevel.challenges.length;
  const current = currentChallengeIndex + 1; // 1-based for display
  const progressPercent = (currentChallengeIndex / total) * 100;

  const currentItem = currentLevel.challenges[currentChallengeIndex];

  // Helper to determine if we use English or Chinese renderer
  const isEnglishMode = selectedMode === 'EN_LETTERS' || selectedMode === 'EN_WORDS' || selectedMode === 'EN_ESSAYS';

  return (
    <>
      {/* 顶部柔和森林绿进度丝带 */}
      <div className="absolute top-0 left-0 w-full h-2.5 bg-emerald-50 overflow-hidden">
        <div
          className="h-full rounded-r-full transition-all duration-500 ease-out"
          style={{
            width: `${Math.max(4, progressPercent)}%`,
            background: 'linear-gradient(90deg, #34D399 0%, #1E7F5C 100%)'
          }}
        />
      </div>

      {/* 右上角：连击微光胶囊 + 清晰进度计数 */}
      <div className="absolute top-4 right-5 flex items-center gap-2">
        {combo >= 5 && (
          <div
            className={`px-2.5 py-0.5 rounded-full text-xs font-black flex items-center gap-1 shadow-xs animate-pop ${
              combo >= 15
                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            <Flame
              size={13}
              className={combo >= 15 ? 'fill-amber-500 text-amber-600' : 'fill-emerald-500 text-emerald-600'}
            />
            {combo}x
          </div>
        )}
        <div className="px-2.5 py-0.5 rounded-full bg-stone-100/90 text-xs sm:text-sm font-extrabold text-[#7A6A5F] tabular-nums">
          {current} / {total}
        </div>
      </div>

      {/* TTS Toggle Switch */}
      <button
        onClick={() => setTtsEnabled(!ttsEnabled)}
        className={`
          absolute top-3 left-6 p-2 rounded-full transition-all duration-200
          ${ttsEnabled ? 'text-kid-blue bg-blue-50 hover:bg-blue-100' : 'text-gray-300 hover:text-gray-400 hover:bg-gray-100'}
        `}
        title={ttsEnabled ? "Mute TTS" : "Enable TTS"}
      >
        {ttsEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
      </button>

      {/* 中文输入法 IME 与 CapsLock 实时友好提示条 */}
      {(imeWarning || capsLockOn) && (
        <div className="mt-6 mx-auto max-w-xl px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 animate-fade-in">
          <Keyboard size={16} className="shrink-0" />
          <span>
            {imeWarning
              ? language === 'cn'
                ? '检测到中文输入法开启，请按一下 Shift 切回英文键盘再打字哦！'
                : 'Chinese IME detected — press Shift to switch to English input!'
              : language === 'cn'
                ? '提示：大写锁定（Caps Lock）已开启，建议关闭。'
                : 'Caps Lock is on.'}
          </span>
        </div>
      )}

      {/* --- ENGLISH RENDERER --- */}
      {isEnglishMode && (() => {
        const chars = currentItem.display.split('');
        const isEssay = selectedMode === 'EN_ESSAYS';
        // Smaller font for essays to fit sentences better
        const fontSizeClass = isEssay ? 'text-3xl md:text-5xl' : 'text-5xl md:text-6xl';

        return (
          <div className="flex flex-col items-center justify-center min-h-64 py-8 px-4">
            {/* 听写模式轻标识 + 重听 + 偷看按钮 */}
            {isDictationActive && (
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-700 text-xs font-extrabold">
                  <Headphones size={12} />
                  {language === 'cn' ? '听写模式' : 'Dictation'}
                </span>
                <button
                  type="button"
                  onClick={() => speak(currentItem.display, 'en-US', true)}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold cursor-pointer transition-colors"
                >
                  <Volume2 size={12} />
                  {language === 'cn' ? '再读一遍' : 'Replay'}
                </button>
                <button
                  type="button"
                  onClick={triggerPeek}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold cursor-pointer transition-colors"
                >
                  <Eye size={12} />
                  {language === 'cn' ? '偷看 1 秒 [Tab]' : 'Peek [Tab]'}
                </button>
              </div>
            )}

            {/* Visual cue for meaning */}
            {currentItem.translation && (
              <div
                className={`font-cartoon mb-4 ${
                  isDictationActive
                    ? 'text-2xl md:text-3xl font-black text-[#2B211B]'
                    : `text-gray-400 animate-pulse ${isEssay ? 'text-lg md:text-xl' : 'text-2xl'}`
                }`}
              >
                {currentItem.translation}
              </div>
            )}

            <div className={`
              flex flex-wrap justify-center gap-1.5 font-mono font-bold transition-transform 
              ${fontSizeClass}
              ${lastInputError ? 'animate-shake text-red-500' : ''}
            `}>
              {chars.map((char, idx) => {
                const isTyped = idx < typedHistory.length;
                const isCursor = idx === typedHistory.length;
                const hideInDictation = isDictationActive && !isTyped && !peekVisible;

                let statusClass = 'text-gray-300'; // Untyped
                if (isTyped) {
                  statusClass = 'text-kid-green'; // Typed Correct
                } else if (isCursor) {
                  statusClass = 'text-kid-blue border-b-4 border-kid-blue'; // Current cursor
                }

                // Handle spaces specifically to ensure they have width
                if (char === ' ') {
                  return (
                    <span key={idx} className={`${statusClass} w-4 md:w-6 inline-block`}>
                      &nbsp;
                    </span>
                  );
                }

                if (hideInDictation) {
                  return (
                    <span
                      key={idx}
                      className={`inline-flex items-end justify-center w-8 md:w-10 border-b-4 transition-colors ${
                        isCursor ? 'border-violet-500 text-violet-300' : 'border-stone-300 text-transparent'
                      }`}
                    >
                      ·
                    </span>
                  );
                }

                return (
                  <span
                    key={idx}
                    className={`${statusClass} ${isDictationActive && peekVisible && !isTyped ? 'text-violet-400' : ''}`}
                  >
                    {char}
                  </span>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* --- CHINESE RENDERER --- */}
      {!isEnglishMode && (() => {
        const syllables = currentItem.pinyin || [];
        const chars = currentItem.display.split(''); // Hanzi characters

        return (
          <div className="flex flex-col items-center justify-center min-h-64 py-10">
            <div className={`
              flex flex-wrap justify-center 
              gap-x-2 md:gap-x-6 gap-y-8 
              px-2 md:px-4 w-full
              ${lastInputError ? 'animate-shake' : ''}
            `}>
              {chars.map((hanzi, charIdx) => {
                const syllable = syllables[charIdx] || ''; // Fallback for safety
                const isCompletedSyllable = charIdx < currentSyllableIndex;
                const isCurrentSyllable = charIdx === currentSyllableIndex;

                return (
                  <div key={charIdx} className="flex flex-col items-center">
                    {/* Pinyin Layer */}
                    <div className="text-3xl font-mono mb-2 h-10 tracking-wider whitespace-nowrap">
                      {syllable.split('').map((letter, letterIdx) => {
                        let letterClass = 'text-gray-300';

                        if (isCompletedSyllable) {
                          letterClass = 'text-kid-green opacity-50'; // Done words fade slightly
                        } else if (isCurrentSyllable) {
                          if (letterIdx < typedHistory.length) {
                            letterClass = 'text-kid-green font-bold'; // Typed correct part of current
                          } else if (letterIdx === typedHistory.length) {
                            letterClass = 'text-kid-blue underline decoration-4'; // Next letter to type
                          }
                        }

                        return <span key={letterIdx} className={letterClass}>{letter}</span>;
                      })}
                    </div>

                    {/* Hanzi Layer */}
                    <div className={`
                      text-5xl md:text-7xl font-cartoon transition-all duration-300
                      ${isCompletedSyllable ? 'text-kid-purple scale-110' : 'text-gray-200'}
                      ${isCurrentSyllable ? 'text-gray-400' : ''}
                    `}>
                      {hanzi}
                    </div>
                  </div>
                );
              })}
            </div>
            {currentItem.translation && (
              <div className="mt-12 text-xl text-gray-400 font-bold text-center px-4">
                {currentItem.translation}
              </div>
            )}
          </div>
        );
      })()}

      {/* 温和错键纠偏提示（预留固定高度避免页面跳动） */}
      <div className="h-7 -mt-4 mb-2 flex items-center justify-center pointer-events-none">
        {lastWrongKey && (
          <div className="px-3 py-0.5 rounded-full bg-rose-50 border border-rose-200/80 text-rose-600 text-xs font-bold flex items-center gap-1.5 animate-fade-in">
            <span>{language === 'cn' ? '刚才按成了' : 'Pressed'}</span>
            <kbd className="font-mono font-black uppercase bg-white px-1.5 py-0.2 rounded border border-rose-200 text-rose-700">
              {lastWrongKey === ' ' ? 'SPACE' : lastWrongKey}
            </kbd>
          </div>
        )}
      </div>
    </>
  );
};

// Re-export with Badge Modal wrapper
export const TypingAreaWithBadges: React.FC = () => {
  const { language } = useGameStore();
  const [unlockedBadges, setUnlockedBadges] = useState<Badge[]>([]);
  const [showBadgeModal, setShowBadgeModal] = useState(false);

  // Listen for badge unlocks via custom event
  useEffect(() => {
    const handleBadgeUnlock = (e: CustomEvent<Badge[]>) => {
      setUnlockedBadges(e.detail);
      setShowBadgeModal(true);
    };

    window.addEventListener('badgeUnlock', handleBadgeUnlock as EventListener);
    return () => window.removeEventListener('badgeUnlock', handleBadgeUnlock as EventListener);
  }, []);

  return (
    <>
      <TypingArea />
      {showBadgeModal && unlockedBadges.length > 0 && (
        <BadgeUnlockModal
          badges={unlockedBadges}
          onClose={() => {
            setShowBadgeModal(false);
            setUnlockedBadges([]);
          }}
          language={language}
        />
      )}
    </>
  );
};
