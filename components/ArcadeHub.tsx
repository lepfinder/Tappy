import React, { useEffect, useState } from 'react';
import { ArrowLeft, Play, Star, Trophy } from 'lucide-react';
import {
  ARCADE_GAMES,
  ArcadeDifficulty,
  ArcadeGameId,
  getArcadeLevelId
} from '../data/arcade_games';
import { useGameStore } from '../store/useGameStore';
import { useUserStore } from '../store/useUserStore';
import { db } from '../db';

interface BestRecord {
  bestScore: number;
  bestStars: number;
}

export const ArcadeHub: React.FC = () => {
  const { language, goHome, startArcadeGame } = useGameStore();
  const { currentUser } = useUserStore();

  // 每张游戏卡独立记住选中的难度
  const [selectedDiffs, setSelectedDiffs] = useState<Record<ArcadeGameId, ArcadeDifficulty>>({
    'apple-catch': 'easy',
    'space-shooter': 'easy'
  });

  const [bestMap, setBestMap] = useState<Record<string, BestRecord>>({});

  useEffect(() => {
    let active = true;
    const loadRecords = async () => {
      if (!currentUser?.id) {
        if (active) setBestMap({});
        return;
      }
      try {
        const list = await db.records.where('userId').equals(currentUser.id).toArray();
        const next: Record<string, BestRecord> = {};
        for (const r of list) {
          if (!r.levelId.startsWith('arcade_')) continue;
          const prev = next[r.levelId];
          next[r.levelId] = {
            bestScore: Math.max(prev?.bestScore || 0, r.score || 0),
            bestStars: Math.max(prev?.bestStars || 0, r.stars || 0)
          };
        }
        if (active) setBestMap(next);
      } catch {
        if (active) setBestMap({});
      }
    };
    loadRecords();
    return () => {
      active = false;
    };
  }, [currentUser?.id]);

  return (
    <div className="w-full max-w-6xl animate-fade-in px-2 sm:px-4">
      {/* 顶部返回与标题 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={goHome}
            className="w-11 h-11 rounded-full bg-white/95 shadow-md hover:shadow-lg flex items-center justify-center text-gray-600 hover:text-kid-blue transition-all hover:-translate-x-0.5 cursor-pointer"
            title={language === 'cn' ? '返回首页' : 'Back'}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl sm:text-3xl font-cartoon font-bold text-kid-blue leading-tight">
              {language === 'cn' ? '趣味游戏厅' : 'Typing Arcade'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">
              {language === 'cn'
                ? '挑一款喜欢的小游戏，边玩边把打字练成高手！'
                : 'Pick a mini-game and level up your typing skills!'}
            </p>
          </div>
        </div>
      </div>

      {/* 2×2 四大经典游戏卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {ARCADE_GAMES.map((game) => {
          const diff = selectedDiffs[game.id];
          const levelKey = getArcadeLevelId(game.id, diff);
          const best = bestMap[levelKey];

          return (
            <div
              key={game.id}
              className="group bg-white/95 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl border-2 border-white overflow-hidden transition-all duration-300 hover:-translate-y-1 flex flex-col"
            >
              {/* 顶部全出血精装绘本游戏封面 */}
              <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-100">
                <img
                  src={game.coverImage}
                  alt={language === 'cn' ? game.titleCn : game.titleEn}
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                {/* 底部柔黑渐变遮罩，保证白色标题与星标高对比可读 */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(15,23,42,0.06) 0%, rgba(15,23,42,0.12) 45%, rgba(15,23,42,0.72) 100%)'
                  }}
                />

                {/* 右上角玩法标签 */}
                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-white/90 backdrop-blur-sm text-slate-700 shadow-sm">
                  {language === 'cn' ? game.tagCn : game.tagEn}
                </span>

                {/* 左下角：标题 + 当前难度星级与最高分 */}
                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2 text-white">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-cartoon font-black tracking-wide drop-shadow-md leading-tight">
                      {language === 'cn' ? game.titleCn : game.titleEn}
                    </h3>
                    <div className="mt-1 flex items-center gap-2 text-xs font-bold text-white/95">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3].map((s) => (
                          <Star
                            key={s}
                            size={14}
                            className={
                              s <= (best?.bestStars || 0)
                                ? 'fill-amber-300 text-amber-200 drop-shadow-xs'
                                : 'text-white/45'
                            }
                          />
                        ))}
                      </div>
                      {best && best.bestScore > 0 && (
                        <span className="flex items-center gap-1 bg-black/35 backdrop-blur-xs px-2 py-0.5 rounded-full tabular-nums">
                          <Trophy size={11} className="text-amber-300" />
                          {best.bestScore}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 卡片正文：玩法简介 + 难度选择 + 开玩按钮 */}
              <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {language === 'cn' ? game.descCn : game.descEn}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  {/* 模式/难度选择胶囊（动态适配 3 档或 4 档难度） */}
                  <div className="flex flex-wrap items-center gap-1 bg-gray-100 p-1 rounded-xl">
                    {(Object.keys(game.difficultyLabels) as ArcadeDifficulty[]).map((d) => {
                      const active = diff === d;
                      const label = game.difficultyLabels[d];
                      if (!label) return null;
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() =>
                            setSelectedDiffs((prev) => ({ ...prev, [game.id]: d }))
                          }
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            active
                              ? `bg-white ${game.accentText} shadow-sm`
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          {language === 'cn' ? label.cn : label.en}
                        </button>
                      );
                    })}
                  </div>

                  {/* 开玩按钮 */}
                  <button
                    type="button"
                    onClick={() => startArcadeGame(game.id, diff)}
                    className={`px-5 py-2.5 rounded-2xl text-white font-bold text-sm shadow-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${game.buttonBg}`}
                  >
                    <Play size={15} className="fill-white" />
                    <span>{language === 'cn' ? '开始玩' : 'Play'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
