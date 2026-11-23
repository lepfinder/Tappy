import React, { useEffect, useState } from 'react';
import { PracticeAssistMode, useGameStore } from '../store/useGameStore';
import {
  RotateCcw,
  Trophy,
  ArrowLeft,
  Flame,
  Gauge,
  Crosshair,
  Eye,
  EyeOff,
  Keyboard,
  Volume2,
  VolumeX,
  Headphones
} from 'lucide-react';
import { TRANSLATIONS } from '../i18n';
import { getLocalizedLevelText } from '../utils/levelDisplay';
import { KeySoundProfile, playSound } from '../utils/sound';

const ASSIST_ORDER: PracticeAssistMode[] = ['full', 'blind', 'zen'];
const SOUND_ORDER: KeySoundProfile[] = ['wood', 'tactile', 'mute'];

export const GameControls: React.FC = () => {
  const {
    restartLevel,
    score,
    exitGame,
    currentLevel,
    combo,
    startTime,
    correctKeystrokes,
    correctHanzi,
    totalKeystrokes,
    language,
    selectedMode,
    assistMode,
    setAssistMode,
    keySoundProfile,
    setKeySoundProfile,
    dictationMode,
    setDictationMode,
    imeWarning
  } = useGameStore();

  const [wpm, setWpm] = useState(0);
  const t = TRANSLATIONS[language];

  useEffect(() => {
    if (!startTime) {
      setWpm(0);
      return;
    }
    const interval = setInterval(() => {
      const timeInMinutes = (Date.now() - startTime) / 60000;
      if (timeInMinutes > 0) {
        let metric = 0;
        if (selectedMode === 'EN_LETTERS') {
          metric = correctKeystrokes;
        } else if (selectedMode?.includes('CN')) {
          metric = correctHanzi;
        } else {
          metric = correctKeystrokes / 5;
        }
        setWpm(Math.round(metric / timeInMinutes));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, correctKeystrokes, correctHanzi, selectedMode]);

  const accuracy =
    totalKeystrokes > 0 ? Math.round((correctKeystrokes / totalKeystrokes) * 100) : 100;
  const speedUnit =
    selectedMode === 'EN_LETTERS' || selectedMode?.startsWith('CN') ? 'CPM' : 'WPM';

  const levelMeta = currentLevel
    ? getLocalizedLevelText(currentLevel, selectedMode, language)
    : null;

  const cycleAssistMode = () => {
    const next = ASSIST_ORDER[(ASSIST_ORDER.indexOf(assistMode) + 1) % ASSIST_ORDER.length];
    setAssistMode(next);
  };

  const cycleSoundProfile = () => {
    const next = SOUND_ORDER[(SOUND_ORDER.indexOf(keySoundProfile) + 1) % SOUND_ORDER.length];
    setKeySoundProfile(next);
    if (next !== 'mute') {
      playSound('click');
    }
  };

  const assistLabel =
    assistMode === 'full'
      ? language === 'cn'
        ? '全引导'
        : 'Guide'
      : assistMode === 'blind'
        ? language === 'cn'
          ? '盲打'
          : 'Blind'
        : language === 'cn'
          ? '极简'
          : 'Focus';

  const soundLabel =
    keySoundProfile === 'wood'
      ? language === 'cn'
        ? '木轴'
        : 'Wood'
      : keySoundProfile === 'tactile'
        ? language === 'cn'
          ? '茶轴'
          : 'Tactile'
        : language === 'cn'
          ? '静音'
          : 'Mute';

  return (
    <div className="flex justify-between items-center w-full max-w-5xl px-3.5 sm:px-4 py-2 bg-white/95 backdrop-blur-sm rounded-full shadow-lg border border-[#EFE5D8] z-10 select-none relative gap-2">
      {/* 左侧：返回 + 统一 3D 图标关卡名 */}
      <div className="flex items-center gap-2 md:gap-2.5 min-w-0">
        <button
          type="button"
          onClick={exitGame}
          className="p-2 hover:bg-amber-50 rounded-full text-[#7A6A5F] hover:text-[#2B211B] transition-colors cursor-pointer shrink-0"
          title={t.levels}
        >
          <ArrowLeft size={20} />
        </button>

        {levelMeta?.fluentIcon && (
          <div
            className={`hidden sm:flex w-8 h-8 rounded-xl items-center justify-center shrink-0 ${levelMeta.fluentIcon.bgClass}`}
          >
            <img
              src={levelMeta.fluentIcon.src}
              alt=""
              className="w-6 h-6 object-contain"
            />
          </div>
        )}

        <div className="flex flex-col min-w-0">
          <span className="text-[10px] text-[#9A8B7E] uppercase font-bold tracking-wider leading-none">
            {t.level}
          </span>
          <span className="font-extrabold text-sm sm:text-base text-[#2B211B] leading-tight max-w-[110px] md:max-w-[210px] truncate mt-0.5">
            {levelMeta ? levelMeta.titleNoEmoji : ''}
          </span>
        </div>
      </div>

      {/* 中间：连击徽章（仅在连击 >= 3 时柔和浮现） */}
      <div
        className={`hidden xl:flex absolute left-1/2 -translate-x-1/2 items-center gap-1 transition-all duration-200 pointer-events-none ${
          combo >= 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
        }`}
      >
        <div
          className={`font-cartoon text-2xl italic font-black flex items-center gap-1 tabular-nums ${
            combo >= 10 ? 'text-amber-500 drop-shadow-xs' : 'text-[#1E7F5C]'
          }`}
        >
          <Flame
            size={20}
            className={
              combo >= 10
                ? 'fill-amber-500 text-amber-600'
                : 'fill-emerald-500 text-emerald-600'
            }
          />
          {combo}x
        </div>
      </div>

      {/* 右侧：实时速度/准确率、盲打模式切换、轴体音效、分数与重玩 */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <div className="hidden md:flex items-center gap-3 text-xs font-extrabold text-[#5C4A3E] tabular-nums mr-1">
          <div className="flex items-center gap-1" title={`${t.wpm} (${speedUnit})`}>
            <Gauge size={14} className="text-[#1E7F5C]" />
            <span>
              {wpm} <span className="text-[11px] font-bold text-[#9A8B7E]">{speedUnit}</span>
            </span>
          </div>
          <div className="flex items-center gap-1" title={t.accuracy}>
            <Crosshair size={14} className="text-[#9A8B7E]" />
            <span className={accuracy < 90 ? 'text-rose-500' : 'text-emerald-600'}>
              {accuracy}%
            </span>
          </div>
        </div>

        <span
          className={`hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
            imeWarning ? 'bg-amber-100 text-amber-700' : 'bg-emerald-50 text-emerald-700'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${imeWarning ? 'bg-amber-500' : 'bg-emerald-500'}`}
          />
          {imeWarning ? 'IME' : 'EN'}
        </span>

        {/* 英文单词模式：🎧 听写遮字开关 */}
        {selectedMode === 'EN_WORDS' && (
          <button
            type="button"
            onClick={() => setDictationMode(!dictationMode)}
            className={`px-2.5 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1 transition-all cursor-pointer border ${
              dictationMode
                ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                : 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100'
            }`}
            title={
              language === 'cn'
                ? '听写遮字模式：隐藏未输入字母，靠朗读与中文释义拼写'
                : 'Dictation mode: hide letters and spell by audio & meaning'
            }
          >
            <Headphones size={14} />
            <span className="hidden sm:inline">
              {language === 'cn' ? '听写' : 'Dictate'}
            </span>
          </button>
        )}

        {/* 盲打 3 档切换：全引导 / 盲打 / 极简 */}
        <button
          type="button"
          onClick={cycleAssistMode}
          className={`px-2.5 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer border ${
            assistMode === 'full'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              : assistMode === 'blind'
                ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
          }`}
          title={
            language === 'cn'
              ? '切换辅助模式：全引导 → 盲打（隐藏键帽字母）→ 极简专注'
              : 'Switch Assist: Guide → Blind (Hide Keycaps) → Focus'
          }
        >
          {assistMode === 'full' ? (
            <Keyboard size={14} />
          ) : assistMode === 'blind' ? (
            <EyeOff size={14} />
          ) : (
            <Eye size={14} />
          )}
          <span className="hidden sm:inline">{assistLabel}</span>
        </button>

        {/* 拟真机械轴音效切换：木轴 / 茶轴 / 静音 */}
        <button
          type="button"
          onClick={cycleSoundProfile}
          className={`px-2.5 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1 transition-all cursor-pointer border ${
            keySoundProfile === 'mute'
              ? 'bg-stone-100 text-stone-400 border-stone-200 hover:bg-stone-200'
              : 'bg-amber-50/80 text-amber-800 border-amber-200/80 hover:bg-amber-100'
          }`}
          title={
            language === 'cn'
              ? '切换键盘轴体音效：温润木轴 / 清脆茶轴 / 静音'
              : 'Switch Key Sound: Wood / Tactile / Mute'
          }
        >
          {keySoundProfile === 'mute' ? <VolumeX size={14} /> : <Volume2 size={14} />}
          <span className="hidden md:inline">{soundLabel}</span>
        </button>

        <div
          className="hidden sm:flex bg-[#1E7F5C] text-white px-3 py-1 rounded-full font-extrabold text-xs sm:text-sm items-center gap-1 shadow-xs tabular-nums"
          title={t.score}
        >
          <Trophy size={14} /> {score}
        </div>

        <button
          type="button"
          onClick={restartLevel}
          className="p-2 hover:bg-amber-50 rounded-full text-[#7A6A5F] hover:text-[#2B211B] transition-colors cursor-pointer"
          title={t.replay}
        >
          <RotateCcw size={18} />
        </button>
      </div>
    </div>
  );
};
