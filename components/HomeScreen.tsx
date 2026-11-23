import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Sparkles, Star } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { useUserStore } from '../store/useUserStore';
import { MODES_METADATA, MODE_DATA_MAP } from '../constants';
import { TRANSLATIONS } from '../i18n';
import { GameMode } from '../types';
import { db, PracticeRecord } from '../db';
import { getLocalizedLevelText } from '../utils/levelDisplay';
import { HomeBackdropDecor } from './HomeBackdropDecor';

// 使用新版 8 枚高清绘本圆章 WebP 图标（体积缩小 10 倍，首屏秒开）
const MODE_ICONS: Record<GameMode, string> = {
  EN_LETTERS: '/images/woodland/badge_en_letters.webp',
  EN_WORDS: '/images/woodland/badge_en_words.webp',
  EN_ESSAYS: '/images/woodland/badge_en_essays.webp',
  CN_PINYIN: '/images/woodland/badge_cn_pinyin.webp',
  CN_SENTENCES: '/images/woodland/badge_cn_sentences.webp',
  CN_ESSAYS: '/images/woodland/badge_cn_essays.webp',
  CN_POEMS: '/images/woodland/badge_cn_poems.webp',
  RACE_100M: '/images/woodland/badge_race.webp'
};

// 严格保留原版清爽柔和的 8 色彩虹卡片底色
const CARD_COLORS: Record<GameMode, string> = {
  EN_LETTERS: 'bg-yellow-300',
  EN_WORDS: 'bg-blue-300',
  EN_ESSAYS: 'bg-purple-300',
  CN_PINYIN: 'bg-green-300',
  CN_SENTENCES: 'bg-red-300',
  CN_ESSAYS: 'bg-teal-300',
  CN_POEMS: 'bg-orange-300',
  RACE_100M: 'bg-pink-300'
};

export const HomeScreen: React.FC = () => {
  const { selectMode, quickStartLevel, language, selectedGrade } = useGameStore();
  const { currentUser } = useUserStore();
  const t = TRANSLATIONS[language];

  const [records, setRecords] = useState<PracticeRecord[]>([]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!currentUser?.id) {
        if (active) setRecords([]);
        return;
      }
      try {
        const list = await db.records.where('userId').equals(currentUser.id).toArray();
        if (active) setRecords(list);
      } catch {
        if (active) setRecords([]);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [currentUser?.id]);

  const { modeStars, continueTarget } = useMemo(() => {
    const bestByLevel = new Map<string, number>();
    for (const r of records) {
      bestByLevel.set(r.levelId, Math.max(bestByLevel.get(r.levelId) || 0, r.stars || 0));
    }

    const starsMap = {} as Record<GameMode, number>;
    (Object.keys(MODE_DATA_MAP) as GameMode[]).forEach((mode) => {
      let sum = 0;
      MODE_DATA_MAP[mode].forEach((lvl) => {
        sum += bestByLevel.get(lvl.id) || 0;
      });
      if (mode === 'RACE_100M') {
        bestByLevel.forEach((stars, lvlId) => {
          if (lvlId.startsWith('arcade_')) sum += stars;
        });
      }
      starsMap[mode] = sum;
    });

    const sorted = [...records].sort((a, b) => b.timestamp - a.timestamp);
    const latest = sorted[0];
    let resume: { mode: GameMode; levelId: string; title: string } | null = null;
    if (latest) {
      const modes = Object.keys(MODE_DATA_MAP) as GameMode[];
      for (const m of modes) {
        const list = MODE_DATA_MAP[m];
        const idx = list.findIndex((l) => l.id === latest.levelId);
        if (idx >= 0) {
          const target = latest.stars >= 3 && idx + 1 < list.length ? list[idx + 1] : list[idx];
          const localized = getLocalizedLevelText(target, m, language);
          resume = {
            mode: m,
            levelId: target.id,
            title: `${t.modes[m].title} · ${localized.title}`
          };
          break;
        }
      }
    }

    return { modeStars: starsMap, continueTarget: resume };
  }, [records, t.modes]);

  return (
    <div className="w-full max-w-7xl animate-fade-in relative flex flex-col items-center">
      {/* 童趣悬浮迷你键帽 + 交互式数字/字母涟漪背板 */}
      <HomeBackdropDecor />

      {/* 轻量续学胶囊（有历史记录时显示） */}
      {continueTarget && (
        <button
          type="button"
          onClick={() => quickStartLevel(continueTarget.mode, continueTarget.levelId)}
          className="mb-5 px-4 py-1.5 rounded-full bg-white/85 hover:bg-white shadow-sm hover:shadow-md border border-white flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-600 transition-all hover:-translate-y-0.5 cursor-pointer relative z-10"
        >
          <Sparkles size={14} className="text-amber-400 shrink-0" />
          <span className="truncate max-w-[260px] sm:max-w-md">
            {language === 'cn' ? '继续上次闯关：' : 'Continue: '}
            <strong className="text-kid-blue font-bold">{continueTarget.title}</strong>
          </span>
          <ArrowRight size={14} className="text-kid-blue shrink-0" />
        </button>
      )}

      {/* 原版 4×2 宽圆角纯色卡片网格 */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6 w-full px-4 relative z-10">
        {(Object.keys(MODES_METADATA) as GameMode[]).map((m, index) => {
          const text = t.modes[m];
          const cardColor = CARD_COLORS[m];
          const icon = MODE_ICONS[m];
          const earnedStars = modeStars[m] || 0;
          const isGraded = m === 'CN_POEMS' || m === 'CN_ESSAYS';

          return (
            <button
              key={m}
              type="button"
              data-mode={m}
              onClick={() => selectMode(m)}
              className={`
                tappy-home-card group relative overflow-hidden rounded-2xl text-center transition-all duration-300
                ${cardColor} shadow-lg hover:shadow-2xl hover:-translate-y-2 hover:scale-105
                py-6 px-4 flex flex-col items-center justify-center cursor-pointer
              `}
              style={{
                animationDelay: `${index * 0.1}s`
              }}
            >
              {/* 原版四角微弱闪星 */}
              <div className="absolute top-2 right-2 text-white/40 text-sm">✦</div>
              <div className="absolute top-3 left-3 text-white/30 text-xs">✦</div>

              {/* 右上角轻量年级/已获星标/新手第一步引导 */}
              {isGraded ? (
                <span className="absolute top-2.5 right-3 px-2 py-0.5 rounded-full text-[11px] font-bold bg-white/55 text-gray-700">
                  {t.grades[selectedGrade as keyof typeof t.grades]}
                </span>
              ) : earnedStars > 0 ? (
                <span className="absolute top-2.5 right-3 px-2 py-0.5 rounded-full text-[11px] font-bold bg-white/60 text-amber-600 flex items-center gap-0.5 tabular-nums">
                  <Star size={11} className="fill-amber-400 text-amber-500" />
                  {earnedStars}
                </span>
              ) : m === 'EN_LETTERS' && records.length === 0 ? (
                <span className="absolute top-2.5 right-3 px-2 py-0.5 rounded-full text-[11px] font-bold bg-white/75 text-amber-700 shadow-xs">
                  {language === 'cn' ? '新手第1步' : 'Start Here'}
                </span>
              ) : null}

              {/* 新版高清绘本圆章图标 */}
              <div className="w-16 h-16 md:w-[68px] md:h-[68px] mb-3 rounded-full overflow-hidden shadow-md ring-2 ring-white/80 bg-white flex items-center justify-center">
                <img
                  src={icon}
                  alt={text.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>

              {/* 原版清爽标题与副标题 */}
              <h3 className="text-base md:text-lg font-bold text-gray-800 mb-1 font-cartoon leading-tight">
                {text.title}
              </h3>

              <p className="text-xs md:text-sm text-gray-600/80 leading-tight">
                {text.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
