import React, { useEffect, useState, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import { useUserStore } from '../store/useUserStore';
import { useBadgeSystem, SessionResult } from '../hooks/useBadgeSystem';
import { Badge } from '../data/badges';
import { BadgeUnlockModal } from './BadgeUnlockModal';
import { TRANSLATIONS } from '../i18n';
import { Flag, RotateCcw, Menu, ArrowRight, Star, Zap, Target, Trophy, Keyboard } from 'lucide-react';

export const RaceTrack: React.FC = () => {
  const {
    raceStatus,
    participants,
    startRace,
    tickRace,
    currentLevel,
    currentChallengeIndex,
    typedHistory,
    lastInputError,
    view,
    language,
    restartLevel,
    exitGame,
    nextLevel,
    availableLevels,
    calculateStats,
    practiceResult,
    imeWarning,
    capsLockOn
  } = useGameStore();

  const { saveRecord, currentUser } = useUserStore();
  const { checkAndUnlockBadges } = useBadgeSystem();
  const t = TRANSLATIONS[language];

  const [countdown, setCountdown] = useState(3);
  const requestRef = useRef<number>(0);
  const previousTimeRef = useRef<number>(0);

  const [stats, setStats] = useState(practiceResult);
  const [recordSaved, setRecordSaved] = useState(false);
  const [unlockedBadges, setUnlockedBadges] = useState<Badge[]>([]);
  const [showBadgeModal, setShowBadgeModal] = useState(false);

  useEffect(() => {
    if (raceStatus === 'countdown') {
      setCountdown(3);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            startRace();
            return 0;
          }
          return prev - 1;
        });
      }, 900);
      return () => clearInterval(timer);
    }
  }, [raceStatus, startRace]);

  useEffect(() => {
    const animate = (time: number) => {
      if (previousTimeRef.current !== 0 && raceStatus === 'racing') {
        const deltaTime = (time - previousTimeRef.current) / 1000;
        tickRace(deltaTime);
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(requestRef.current);
      previousTimeRef.current = 0;
    };
  }, [raceStatus, tickRace]);

  // 竞速结算：保存练习记录并触发勋章检查
  useEffect(() => {
    if (view === 'RESULT' && !practiceResult) {
      setStats(calculateStats());
    } else if (view === 'RESULT' && practiceResult) {
      setStats(practiceResult);
    }
    if (view !== 'RESULT') {
      setRecordSaved(false);
    }
  }, [view, practiceResult, calculateStats]);

  useEffect(() => {
    if (view === 'RESULT' && stats && currentLevel && currentUser && !recordSaved) {
      saveRecord({
        levelId: currentLevel.id,
        mode: 'RACE_100M',
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        stars: stats.stars,
        score: stats.score,
        maxCombo: stats.maxCombo,
        timeSpent: stats.timeSpent
      });
      setRecordSaved(true);

      if (currentUser.id) {
        const sessionResult: SessionResult = {
          wpm: stats.wpm,
          accuracy: stats.accuracy,
          maxCombo: stats.maxCombo,
          timeSpent: stats.timeSpent,
          levelId: currentLevel.id,
          mode: 'RACE_100M'
        };
        checkAndUnlockBadges(currentUser.id, sessionResult).then((badges) => {
          if (badges.length > 0) {
            setUnlockedBadges(badges);
            setTimeout(() => setShowBadgeModal(true), 900);
          }
        });
      }
    }
  }, [view, stats, currentLevel, currentUser, saveRecord, recordSaved, checkAndUnlockBadges]);

  // 结算快捷键支持
  useEffect(() => {
    if (view !== 'RESULT') return;
    const hasNext =
      currentLevel &&
      availableLevels.findIndex((l) => l.id === currentLevel.id) < availableLevels.length - 1;

    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if ((e.key === 'Enter' || e.key === ' ') && hasNext) {
        e.preventDefault();
        nextLevel();
      } else if (k === 'r') {
        e.preventDefault();
        restartLevel();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        exitGame();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [view, currentLevel, availableLevels, nextLevel, restartLevel, exitGame]);

  if (view === 'RESULT') {
    const hasNext =
      currentLevel &&
      availableLevels.findIndex((l) => l.id === currentLevel.id) < availableLevels.length - 1;
    const sorted = [...participants].sort((a, b) => {
      if (a.finishedRank !== undefined && b.finishedRank !== undefined) {
        return a.finishedRank - b.finishedRank;
      }
      if (a.finishedRank !== undefined) return -1;
      if (b.finishedRank !== undefined) return 1;
      return b.progress - a.progress;
    });
    const playerRank = sorted.findIndex((p) => p.type === 'player') + 1;
    const displayStats = stats || { wpm: 0, accuracy: 100, stars: 1 as const };

    return (
      <div className="flex flex-col items-center justify-center py-4 animate-jump-once">
        <div className="flex gap-2 mb-3">
          {[1, 2, 3].map((s) => (
            <Star
              key={s}
              size={40}
              className={s <= displayStats.stars ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
            />
          ))}
        </div>

        <div className="flex items-center gap-2 mb-1">
          {playerRank === 1 ? (
            <Trophy size={30} className="text-amber-500" />
          ) : (
            <Flag size={26} className="text-kid-blue" />
          )}
          <h2 className="text-3xl font-cartoon font-black text-kid-blue">
            {t.rank}: {language === 'cn' ? `第 ${playerRank} 名` : `#${playerRank}`}
          </h2>
        </div>
        <p className="text-slate-500 text-sm mb-5">
          {playerRank === 1
            ? language === 'cn'
              ? '第一名冲线，太棒啦！'
              : 'First place! Amazing speed!'
            : language === 'cn'
              ? '顺利冲线，再练一局超越小猎豹！'
              : 'Great sprint! Try again to beat the cheetah!'}
        </p>

        <div className="grid grid-cols-2 gap-3 w-full max-w-xs mb-6 tabular-nums">
          <div className="bg-blue-50 rounded-2xl p-3 flex items-center justify-center gap-1.5 font-bold text-slate-700">
            <Zap size={16} className="text-kid-blue" />
            <span>{displayStats.wpm}</span>
            <span className="text-xs text-slate-400">{t.wpm}</span>
          </div>
          <div className="bg-emerald-50 rounded-2xl p-3 flex items-center justify-center gap-1.5 font-bold text-slate-700">
            <Target size={16} className="text-emerald-500" />
            <span>{displayStats.accuracy}%</span>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={restartLevel}
            className="px-5 py-2 bg-slate-200 rounded-full font-bold text-slate-700 flex items-center gap-2 hover:bg-slate-300 cursor-pointer"
          >
            <RotateCcw size={16} /> {t.replay}
            <span className="text-xs opacity-50">[R]</span>
          </button>
          <button
            type="button"
            onClick={exitGame}
            className="px-5 py-2 bg-slate-200 rounded-full font-bold text-slate-700 flex items-center gap-2 hover:bg-slate-300 cursor-pointer"
          >
            <Menu size={16} /> {t.levels}
            <span className="text-xs opacity-50">[Esc]</span>
          </button>
          {hasNext && (
            <button
              type="button"
              onClick={nextLevel}
              className="px-6 py-2 bg-kid-blue text-white rounded-full font-bold flex items-center gap-2 hover:bg-blue-500 shadow-lg cursor-pointer"
            >
              {t.next} <ArrowRight size={16} />
              <span className="text-xs opacity-70">⏎</span>
            </button>
          )}
        </div>

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
      </div>
    );
  }

  const currentItem = currentLevel?.challenges[currentChallengeIndex];

  return (
    <div className="w-full flex flex-col gap-3 relative">
      {raceStatus === 'countdown' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm animate-fade-in">
          <div className="flex flex-col items-center">
            <div className="text-8xl md:text-[10rem] font-cartoon font-black text-kid-yellow drop-shadow-lg leading-none">
              {countdown > 0 ? countdown : t.raceGo}
            </div>
            <div className="text-white text-2xl font-bold mt-4">{t.raceStart}</div>
          </div>
        </div>
      )}

      {(imeWarning || capsLockOn) && (
        <div className="px-4 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center justify-center gap-2">
          <Keyboard size={15} />
          <span>
            {imeWarning
              ? language === 'cn'
                ? '检测到中文输入法，请按 Shift 切回英文键盘！'
                : 'Press Shift to switch to English input!'
              : 'Caps Lock ON'}
          </span>
        </div>
      )}

      {raceStatus !== 'countdown' && currentItem && (
        <div className="flex justify-center">
          <div
            className={`bg-white border-4 border-kid-blue rounded-2xl px-7 py-2 shadow-md text-3xl sm:text-4xl font-mono font-bold flex gap-1 ${
              lastInputError ? 'animate-shake border-red-500' : ''
            }`}
          >
            {currentItem.display.split('').map((char, i) => {
              let color = 'text-slate-300';
              if (i < typedHistory.length) color = 'text-kid-green';
              if (i === typedHistory.length) color = 'text-kid-blue border-b-4 border-kid-blue';
              return (
                <span key={i} className={color}>
                  {char}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* 动物赛跑赛道 */}
      <div className="flex flex-col justify-center gap-3 bg-slate-50/90 rounded-2xl p-4 border-2 border-dashed border-slate-200 overflow-hidden relative">
        <Flag className="absolute top-3 right-5 text-slate-400" size={20} />

        {participants.map((p) => {
          const isPlayer = p.type === 'player';
          const emojiMatch = p.name.match(/^(\S+)\s+(.*)$/);
          const badgeIcon = emojiMatch ? emojiMatch[1] : isPlayer ? '🐼' : '🐢';
          const shortName = emojiMatch ? emojiMatch[2] : p.name;

          return (
            <div
              key={p.id}
              className="relative w-full h-12 bg-white rounded-full shadow-sm border border-slate-100 flex items-center px-3"
            >
              <div
                className="h-2.5 rounded-full transition-all duration-200"
                style={{
                  width: `${p.progress}%`,
                  backgroundColor: isPlayer ? '#4D96FF' : '#E2E8F0'
                }}
              />
              <span
                className={`ml-2 text-xs font-bold z-10 ${
                  isPlayer ? 'text-kid-blue' : 'text-slate-400'
                }`}
              >
                {shortName}
              </span>
              <div
                className="absolute top-1/2 -translate-y-1/2 transition-all duration-200 flex items-center justify-center w-9 h-9 rounded-full shadow-md text-lg z-10"
                style={{
                  left: `calc(${Math.min(p.progress, 92)}% + 4px)`,
                  backgroundColor: isPlayer ? '#4D96FF' : '#F1F5F9',
                  border: '2px solid #FFFFFF'
                }}
              >
                <span>{badgeIcon}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
