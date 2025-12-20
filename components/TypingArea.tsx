
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { useUserStore } from '../store/useUserStore';
import { TRANSLATIONS } from '../i18n';
import { Star, RotateCcw, Menu, ArrowRight, Zap, Target, Flame, AlertCircle } from 'lucide-react';

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
    view,
    restartLevel,
    exitGame,
    nextLevel,
    availableLevels,
    language,
    calculateStats,
    practiceResult
  } = useGameStore();

  const { saveRecord, currentUser } = useUserStore();
  const t = TRANSLATIONS[language];

  // Calculate stats when entering result view
  const [stats, setStats] = useState(practiceResult);
  const [showStars, setShowStars] = useState([false, false, false]);
  const [recordSaved, setRecordSaved] = useState(false);

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
    }
  }, [view, stats, currentLevel, currentUser, selectedMode, saveRecord, recordSaved]);

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
        className="flex flex-col items-center justify-center py-6"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      >
        {/* Stars Section with staggered animation */}
        <div className="flex justify-center gap-3 mb-4 h-14">
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

        {/* Stats Grid - 2x2 with staggered animations */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-8">
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
            <div className="flex gap-1.5 mt-1">
              {displayStats.mistakeKeys.length > 0 ? (
                displayStats.mistakeKeys.map((k, idx) => (
                  <motion.span
                    key={k}
                    className="font-mono font-bold text-lg text-purple-600 uppercase bg-purple-100 px-2 py-0.5 rounded"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.2 + idx * 0.1, type: "spring" }}
                  >
                    {k}
                  </motion.span>
                ))
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

        {/* Action Buttons with staggered fade-in */}
        <motion.div
          className="flex gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.4 }}
        >
          <button
            onClick={restartLevel}
            className="px-6 py-2 bg-gray-200 rounded-full font-bold text-gray-600 flex items-center gap-2 hover:bg-gray-300 transition-colors hover:scale-105 active:scale-95"
          >
            <RotateCcw size={18} /> {t.replay}
          </button>
          <button
            onClick={exitGame}
            className="px-6 py-2 bg-gray-200 rounded-full font-bold text-gray-600 flex items-center gap-2 hover:bg-gray-300 transition-colors hover:scale-105 active:scale-95"
          >
            <Menu size={18} /> {t.levels}
          </button>
          {hasNext && (
            <button
              onClick={nextLevel}
              className="px-6 py-2 bg-kid-blue text-white rounded-full font-bold flex items-center gap-2 hover:bg-blue-400 shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              {t.next} <ArrowRight size={18} />
            </button>
          )}
        </motion.div>
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
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gray-100">
        <div
          className="h-full bg-kid-green transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Progress Text */}
      <div className="absolute top-4 right-6 text-sm font-bold text-gray-300">
        {current} / {total}
      </div>

      {/* --- ENGLISH RENDERER --- */}
      {isEnglishMode && (() => {
        const chars = currentItem.display.split('');
        const isEssay = selectedMode === 'EN_ESSAYS';
        // Smaller font for essays to fit sentences better
        const fontSizeClass = isEssay ? 'text-3xl md:text-5xl' : 'text-5xl md:text-6xl';

        return (
          <div className="flex flex-col items-center justify-center min-h-64 py-8 px-4">
            {/* Visual cue for meaning */}
            {currentItem.translation && (
              <div className={`text-gray-400 font-cartoon mb-4 animate-pulse ${isEssay ? 'text-lg md:text-xl' : 'text-2xl'}`}>
                {currentItem.translation}
              </div>
            )}

            <div className={`
              flex flex-wrap justify-center gap-1 font-mono font-bold transition-transform 
              ${fontSizeClass}
              ${lastInputError ? 'animate-shake text-red-500' : ''}
            `}>
              {chars.map((char, idx) => {
                let statusClass = 'text-gray-300'; // Untyped
                if (idx < typedHistory.length) {
                  statusClass = 'text-kid-green'; // Typed Correct
                } else if (idx === typedHistory.length) {
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

                return (
                  <span key={idx} className={statusClass}>
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
    </>
  );
};
