import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  RotateCcw,
  Volume2,
  VolumeX,
  Music,
  Pause,
  Play,
  Maximize2,
  Minimize2,
  X,
  Star,
  Trophy,
  Zap,
  Target,
  Flame,
  Keyboard
} from 'lucide-react';
import { getBgmEnabled, playBgm, pauseBgm, resumeBgm, setBgmEnabledPref, stopBgm } from '../../utils/bgm';
import {
  ARCADE_GAMES,
  ArcadeDifficulty,
  ArcadeGameId,
  ArcadeSessionSummary,
  getArcadeLevelId
} from '../../data/arcade_games';
import { useGameStore } from '../../store/useGameStore';
import { useUserStore } from '../../store/useUserStore';
import { useBadgeSystem, SessionResult } from '../../hooks/useBadgeSystem';
import { Badge } from '../../data/badges';
import { BadgeUnlockModal } from '../BadgeUnlockModal';
import { AppleCatchGame } from './AppleCatchGame';
import { SpaceShooterGame } from './SpaceShooterGame';

export const ArcadeStage: React.FC = () => {
  const {
    activeArcadeGame,
    arcadeDifficulty,
    startArcadeGame,
    exitArcadeGame,
    language,
    soundEnabled,
    setSoundEnabled
  } = useGameStore();
  const { saveRecord } = useUserStore();
  const { checkAndUnlockBadges } = useBadgeSystem();

  const [runKey, setRunKey] = useState(1);
  const [summary, setSummary] = useState<ArcadeSessionSummary | null>(null);
  const [imeWarning, setImeWarning] = useState(false);
  const [unlockedBadges, setUnlockedBadges] = useState<Badge[]>([]);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [bgmEnabled, setBgmEnabled] = useState<boolean>(() => getBgmEnabled());
  const [isPaused, setIsPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const meta = ARCADE_GAMES.find((g) => g.id === activeArcadeGame) || ARCADE_GAMES[0];
  const gameId: ArcadeGameId = meta.id;

  // 监听原生全屏状态同步图标
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  // 进入游戏播放对应 BGM，结算或退出时自动柔和淡出停止
  useEffect(() => {
    if (bgmEnabled && !summary) {
      playBgm(gameId);
    } else {
      stopBgm(false);
    }
  }, [gameId, bgmEnabled, summary, runKey]);

  // 暂停/恢复同步控制 BGM（断点续播）
  useEffect(() => {
    if (summary) return;
    if (isPaused) {
      pauseBgm();
    } else if (bgmEnabled) {
      resumeBgm();
    }
  }, [isPaused, bgmEnabled, summary]);

  // Esc 快捷键切换暂停，切出标签页自动暂停保护
  useEffect(() => {
    if (summary) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsPaused((p) => !p);
      }
    };
    const onVisibility = () => {
      if (document.hidden) setIsPaused(true);
    };
    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [summary]);

  useEffect(() => {
    return () => stopBgm(true);
  }, []);

  const toggleBgm = () => {
    const next = !bgmEnabled;
    setBgmEnabled(next);
    setBgmEnabledPref(next);
  };

  const handleRestart = useCallback(() => {
    setSummary(null);
    setImeWarning(false);
    setIsPaused(false);
    setRunKey((k) => k + 1);
  }, []);

  const handleChangeDifficulty = (diff: ArcadeDifficulty) => {
    startArcadeGame(gameId, diff);
    setSummary(null);
    setImeWarning(false);
    setIsPaused(false);
    setRunKey((k) => k + 1);
  };

  const handleFinish = useCallback(
    async (result: ArcadeSessionSummary) => {
      setSummary(result);
      const levelId = getArcadeLevelId(gameId, arcadeDifficulty);

      try {
        await saveRecord({
          levelId,
          mode: 'RACE_100M',
          wpm: result.wpm,
          accuracy: result.accuracy,
          stars: result.stars,
          score: result.score,
          maxCombo: result.maxCombo,
          timeSpent: result.timeSpent
        });

        const sessionResult: SessionResult = {
          wpm: result.wpm,
          accuracy: result.accuracy,
          maxCombo: result.maxCombo,
          timeSpent: result.timeSpent,
          mode: 'RACE_100M',
          levelId
        };
        const newlyUnlocked = await checkAndUnlockBadges(sessionResult);
        if (newlyUnlocked.length > 0) {
          setUnlockedBadges(newlyUnlocked);
          setShowBadgeModal(true);
        }
      } catch (err) {
        console.error('Failed to save arcade record:', err);
      }
    },
    [gameId, arcadeDifficulty, saveRecord, checkAndUnlockBadges]
  );

  return (
    <div
      ref={containerRef}
      className={`w-full flex flex-col gap-3 animate-fade-in ${
        isFullscreen ? 'arcade-fullscreen bg-[#FFFBF2] p-4 h-screen max-w-none' : 'max-w-5xl'
      }`}
    >
      <BadgeUnlockModal
        badges={unlockedBadges}
        isOpen={showBadgeModal}
        onClose={() => setShowBadgeModal(false)}
      />

      {/* 顶部简洁游戏控制条 */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white/90 backdrop-blur-sm px-4 py-2.5 rounded-2xl shadow-md border border-white">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={exitArcadeGame}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>{language === 'cn' ? '游戏厅' : 'Arcade'}</span>
          </button>

          <div className="flex items-center gap-2">
            <img src={meta.iconImage} alt="" className="w-7 h-7 object-contain drop-shadow-xs" />
            <span className="font-cartoon font-bold text-base sm:text-lg text-gray-800">
              {language === 'cn' ? meta.titleCn : meta.titleEn}
            </span>
          </div>
        </div>

        {/* 右侧：难度切换 + 音效 + 重来 */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center bg-gray-100 p-1 rounded-xl gap-1">
            {(Object.keys(meta.difficultyLabels) as ArcadeDifficulty[]).map((d) => {
              const lbl = meta.difficultyLabels[d];
              if (!lbl) return null;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleChangeDifficulty(d)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    arcadeDifficulty === d
                      ? 'bg-white text-kid-blue shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {language === 'cn' ? lbl.cn : lbl.en}
                </button>
              );
            })}
          </div>

          {!summary && (
            <button
              type="button"
              onClick={() => setIsPaused((p) => !p)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-colors cursor-pointer ${
                isPaused
                  ? 'bg-amber-400 text-amber-950 hover:bg-amber-500'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              title={language === 'cn' ? '暂停 / 继续 (Esc)' : 'Pause / Resume (Esc)'}
            >
              {isPaused ? <Play size={15} /> : <Pause size={15} />}
              <span className="hidden sm:inline">
                {isPaused
                  ? language === 'cn'
                    ? '继续'
                    : 'Resume'
                  : language === 'cn'
                    ? '暂停'
                    : 'Pause'}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={toggleBgm}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              bgmEnabled
                ? 'bg-emerald-50 text-[#1E7F5C] hover:bg-emerald-100'
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            }`}
            title={language === 'cn' ? (bgmEnabled ? '关闭背景音乐' : '开启背景音乐') : 'Toggle BGM'}
          >
            <Music size={17} />
          </button>

          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors cursor-pointer"
            title={language === 'cn' ? '开关音效' : 'Toggle Sound'}
          >
            {soundEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors cursor-pointer"
            title={
              language === 'cn'
                ? isFullscreen
                  ? '退出全屏'
                  : '全屏最大化'
                : isFullscreen
                  ? 'Exit Fullscreen'
                  : 'Fullscreen'
            }
          >
            {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
          </button>

          <button
            type="button"
            onClick={handleRestart}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-kid-blue font-bold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            <RotateCcw size={15} />
            <span>{language === 'cn' ? '重玩' : 'Restart'}</span>
          </button>
        </div>
      </div>

      {/* 中文输入法防坑提醒 */}
      {imeWarning && (
        <div className="px-4 py-2 rounded-2xl bg-amber-100 border border-amber-300 text-amber-900 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm animate-pop">
          <Keyboard size={16} />
          <span>
            {language === 'cn'
              ? '检测到中文输入法开启，请按 Shift 或切换为「英文输入法」畅快游玩！'
              : 'IME detected! Switch to English keyboard to play smoothly.'}
          </span>
        </div>
      )}

      {/* 游戏主舞台 */}
      <div className="relative w-full">
        {gameId === 'apple-catch' && (
          <AppleCatchGame
            key={`apple-${arcadeDifficulty}-${runKey}`}
            difficulty={arcadeDifficulty}
            language={language}
            paused={isPaused}
            onFinish={handleFinish}
            onImeWarning={setImeWarning}
          />
        )}
        {gameId === 'space-shooter' && (
          <SpaceShooterGame
            key={`space-${arcadeDifficulty}-${runKey}`}
            difficulty={arcadeDifficulty}
            language={language}
            paused={isPaused}
            onFinish={handleFinish}
            onImeWarning={setImeWarning}
          />
        )}

        {/* 掌机级精装暂停菜单浮层 */}
        {isPaused && !summary && (
          <div
            onClick={() => setIsPaused(false)}
            className="absolute inset-0 z-30 rounded-3xl bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-[#FFFDF8] rounded-[28px] shadow-[0_24px_60px_-15px_rgba(0,0,0,0.55)] max-w-sm w-full overflow-hidden border-2 border-white/90 animate-pop relative"
            >
              {/* 右上角快捷关闭按钮 */}
              <button
                type="button"
                onClick={() => setIsPaused(false)}
                className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/35 hover:bg-black/55 backdrop-blur-sm text-white flex items-center justify-center transition-colors cursor-pointer"
                title={language === 'cn' ? '关闭并继续 (Esc)' : 'Resume (Esc)'}
              >
                <X size={16} />
              </button>
              {/* 顶部游戏专属绘本封面头图 */}
              <div className="relative h-28 w-full overflow-hidden">
                <img
                  src={meta.coverImage}
                  alt=""
                  className="w-full h-full object-cover scale-105"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(15,23,42,0.22) 0%, rgba(15,23,42,0.75) 100%)'
                  }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center shadow-lg mb-1.5">
                    <Pause size={20} className="fill-white text-white" />
                  </div>
                  <h3 className="text-xl font-cartoon font-black tracking-wide drop-shadow">
                    {language === 'cn' ? '游戏已暂停' : 'Game Paused'}
                  </h3>
                  <span className="text-[11px] font-bold text-white/85">
                    {language === 'cn' ? meta.titleCn : meta.titleEn} ·{' '}
                    {language === 'cn'
                      ? meta.difficultyLabels[arcadeDifficulty]?.cn
                      : meta.difficultyLabels[arcadeDifficulty]?.en}
                  </span>
                </div>
              </div>

              {/* 控制主体 */}
              <div className="p-5 space-y-4">
                {/* 快捷音频开关行 */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={toggleBgm}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      bgmEnabled
                        ? 'bg-emerald-50 border-emerald-200 text-[#1E7F5C]'
                        : 'bg-slate-100 border-slate-200 text-slate-400'
                    }`}
                  >
                    <Music size={14} />
                    <span>
                      {language === 'cn'
                        ? bgmEnabled
                          ? '音乐：开'
                          : '音乐：关'
                        : bgmEnabled
                          ? 'BGM: ON'
                          : 'BGM: OFF'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      soundEnabled
                        ? 'bg-amber-50 border-amber-200 text-amber-700'
                        : 'bg-slate-100 border-slate-200 text-slate-400'
                    }`}
                  >
                    {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                    <span>
                      {language === 'cn'
                        ? soundEnabled
                          ? '音效：开'
                          : '音效：关'
                        : soundEnabled
                          ? 'SFX: ON'
                          : 'SFX: OFF'}
                    </span>
                  </button>
                </div>

                {/* 主按钮：继续游戏 */}
                <button
                  type="button"
                  onClick={() => setIsPaused(false)}
                  className="w-full py-3.5 rounded-2xl bg-[#1E7F5C] hover:bg-[#176A4C] text-white font-extrabold text-sm shadow-[0_4px_0_#13523B] active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play size={16} className="fill-white" />
                  <span>{language === 'cn' ? '继续游戏' : 'Resume'}</span>
                  <span className="text-[11px] font-mono bg-white/20 px-1.5 py-0.5 rounded-md">
                    Esc
                  </span>
                </button>

                {/* 副按钮：重新开始 / 返回游戏厅 */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={handleRestart}
                    className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/90 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw size={14} />
                    <span>{language === 'cn' ? '重新开始' : 'Restart'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={exitArcadeGame}
                    className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/90 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={14} />
                    <span>{language === 'cn' ? '返回游戏厅' : 'Arcade Hub'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 统一炫彩结算浮层 */}
        {summary && (
          <div className="absolute inset-0 z-40 rounded-3xl bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-[#FFFDF8] rounded-[28px] shadow-[0_24px_60px_-15px_rgba(0,0,0,0.55)] max-w-md w-full p-6 sm:p-7 text-center border-2 border-white/90 animate-pop">
              <div className="w-16 h-16 mx-auto mb-2 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center shadow-sm">
                <img
                  src={summary.won ? '/icons/fluent3d/trophy.webp' : '/icons/fluent3d/sparkles.webp'}
                  alt=""
                  className="w-11 h-11 object-contain drop-shadow-sm"
                />
              </div>
              <h2 className="text-2xl sm:text-3xl font-cartoon font-black text-gray-800 mb-1">
                {summary.won
                  ? language === 'cn'
                    ? '挑战成功！'
                    : 'Awesome Win!'
                  : language === 'cn'
                    ? '再试一次就过啦！'
                    : 'Nice Try!'}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 font-medium mb-4">
                {language === 'cn' ? meta.titleCn : meta.titleEn} ·{' '}
                {language === 'cn'
                  ? meta.difficultyLabels[arcadeDifficulty]?.cn
                  : meta.difficultyLabels[arcadeDifficulty]?.en}
              </p>

              {/* 星级展示 */}
              <div className="flex items-center justify-center gap-2 mb-5">
                {[1, 2, 3].map((s) => (
                  <Star
                    key={s}
                    size={36}
                    className={
                      s <= summary.stars
                        ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                        : 'text-gray-200'
                    }
                  />
                ))}
              </div>

              {/* 4 项核心成绩 */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-amber-50 rounded-2xl p-3">
                  <div className="text-xs text-amber-700/80 font-bold flex items-center justify-center gap-1">
                    <Trophy size={13} />
                    {language === 'cn' ? '总得分' : 'Score'}
                  </div>
                  <div className="text-2xl font-black text-amber-600 tabular-nums">
                    {summary.score}
                  </div>
                </div>
                <div className="bg-blue-50 rounded-2xl p-3">
                  <div className="text-xs text-blue-700/80 font-bold flex items-center justify-center gap-1">
                    <Zap size={13} />
                    {language === 'cn' ? '速度 WPM' : 'WPM'}
                  </div>
                  <div className="text-2xl font-black text-blue-600 tabular-nums">
                    {summary.wpm}
                  </div>
                </div>
                <div className="bg-emerald-50 rounded-2xl p-3">
                  <div className="text-xs text-emerald-700/80 font-bold flex items-center justify-center gap-1">
                    <Target size={13} />
                    {language === 'cn' ? '准确率' : 'Accuracy'}
                  </div>
                  <div className="text-2xl font-black text-emerald-600 tabular-nums">
                    {summary.accuracy}%
                  </div>
                </div>
                <div className="bg-rose-50 rounded-2xl p-3">
                  <div className="text-xs text-rose-700/80 font-bold flex items-center justify-center gap-1">
                    <Flame size={13} />
                    {language === 'cn' ? '最高连击' : 'Max Combo'}
                  </div>
                  <div className="text-2xl font-black text-rose-600 tabular-nums">
                    {summary.maxCombo}x
                  </div>
                </div>
              </div>

              {/* 操作按钮 */}
              {(() => {
                const diffs = Object.keys(meta.difficultyLabels) as ArcadeDifficulty[];
                const curIdx = diffs.indexOf(arcadeDifficulty);
                const nextDiff =
                  summary.won && curIdx >= 0 && curIdx < diffs.length - 1
                    ? diffs[curIdx + 1]
                    : null;
                const nextLabel = nextDiff ? meta.difficultyLabels[nextDiff] : null;
                return (
                  <div className="space-y-2.5">
                    {nextDiff && nextLabel && (
                      <button
                        type="button"
                        onClick={() => handleChangeDifficulty(nextDiff)}
                        className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-sm shadow-md transition-all cursor-pointer active:scale-[0.98]"
                      >
                        {language === 'cn'
                          ? `挑战下一难度：${nextLabel.cn} →`
                          : `Next Difficulty: ${nextLabel.en} →`}
                      </button>
                    )}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={exitArcadeGame}
                        className="flex-1 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm transition-colors cursor-pointer"
                      >
                        {language === 'cn' ? '换个游戏' : 'All Games'}
                      </button>
                      <button
                        type="button"
                        onClick={handleRestart}
                        className={`flex-1 py-3 rounded-2xl text-white font-bold text-sm shadow-md transition-colors cursor-pointer ${meta.buttonBg}`}
                      >
                        {language === 'cn' ? '再来一局' : 'Play Again'}
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
