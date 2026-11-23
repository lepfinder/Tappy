import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useGameStore } from '../store/useGameStore';
import { useUserStore } from '../store/useUserStore';
import { Star, ChevronLeft, GraduationCap, Check, Zap, Plus, Pencil, Headphones, Trash2 } from 'lucide-react';
import { TRANSLATIONS } from '../i18n';
import { db } from '../db';
import { ArcadeHub } from './ArcadeHub';
import { getLocalizedLevelText } from '../utils/levelDisplay';
import { CustomWordListModal } from './CustomWordListModal';
import {
  CustomWordList,
  deleteCustomWordList,
  getCustomWordListById,
  isCustomLevelId,
  saveCustomWordList
} from '../utils/customWordLists';

interface LevelProgress {
  count: number;
  bestStars: number;
  bestWpm: number;
}

function useLevelProgress(userId: number | undefined): Record<string, LevelProgress> {
  const [map, setMap] = useState<Record<string, LevelProgress>>({});

  useEffect(() => {
    if (!userId) {
      setMap({});
      return;
    }

    const fetchProgress = async () => {
      try {
        const records = await db.records.where('userId').equals(userId).toArray();
        const next: Record<string, LevelProgress> = {};
        records.forEach((r) => {
          const prev = next[r.levelId] || { count: 0, bestStars: 0, bestWpm: 0 };
          next[r.levelId] = {
            count: prev.count + 1,
            bestStars: Math.max(prev.bestStars, r.stars || 0),
            bestWpm: Math.max(prev.bestWpm, r.wpm || 0)
          };
        });
        setMap(next);
      } catch (error) {
        console.error('Failed to fetch level progress:', error);
      }
    };

    fetchProgress();
  }, [userId]);

  return map;
}

export const LevelSelectScreen: React.FC = () => {
  const {
    availableLevels,
    selectLevel,
    goHome,
    selectedMode,
    language,
    selectedGrade,
    setGrade,
    refreshCustomLevels,
    setDictationMode
  } = useGameStore();
  const { currentUser } = useUserStore();
  const t = TRANSLATIONS[language];

  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [editingList, setEditingList] = useState<CustomWordList | null>(null);
  const [deletingTarget, setDeletingTarget] = useState<{ id: string; title: string } | null>(null);
  const [importToast, setImportToast] = useState<string | null>(null);

  useEffect(() => {
    if (!deletingTarget) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDeletingTarget(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [deletingTarget]);

  useEffect(() => {
    const onImported = (e: Event) => {
      const detail = (e as CustomEvent<{ title: string; count: number }>).detail;
      if (!detail) return;
      setImportToast(
        language === 'cn'
          ? `已导入听写词表「${detail.title}」（共 ${detail.count} 词）！`
          : `Imported "${detail.title}" (${detail.count} words)!`
      );
      window.setTimeout(() => setImportToast(null), 4000);
    };
    window.addEventListener('tappy:custom-list-imported', onImported);
    return () => window.removeEventListener('tappy:custom-list-imported', onImported);
  }, [language]);

  const progressMap = useLevelProgress(currentUser?.id);

  if (!selectedMode) return null;
  // 趣味游戏厅入口：展示 4 大经典打字小游戏大厅
  if (selectedMode === 'RACE_100M') {
    return <ArcadeHub />;
  }
  const modeText = t.modes[selectedMode];
  const isGradedMode = selectedMode === 'CN_POEMS' || selectedMode === 'CN_ESSAYS';

  const diffLabels =
    language === 'cn'
      ? { 1: '入门', 2: '进阶', 3: '挑战' }
      : { 1: 'Easy', 2: 'Medium', 3: 'Hard' };

  return (
    <div className="w-full max-w-6xl animate-slide-up px-2 sm:px-4">
      {/* 顶部返回与模式标题 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={goHome}
            className="p-3 bg-white rounded-full shadow-md hover:bg-blue-50 text-slate-600 hover:text-kid-blue transition-colors cursor-pointer"
          >
            <ChevronLeft size={22} />
          </button>
          <div>
            <h2 className="text-3xl font-cartoon font-black text-kid-blue">{modeText.title}</h2>
            <p className="text-slate-500 text-sm font-medium">{t.chooseLevel}</p>
          </div>
        </div>
      </div>

      {/* 古诗与课文模式：平铺年级胶囊（自动记忆上次选的年级） */}
      {isGradedMode && (
        <div className="flex flex-wrap gap-2 mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((g) => {
            const active = g === selectedGrade;
            return (
              <button
                key={g}
                type="button"
                onClick={() => setGrade(g)}
                className={`px-3.5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  active
                    ? 'bg-kid-blue text-white shadow-md'
                    : 'bg-white/90 text-slate-600 hover:bg-white shadow-sm'
                }`}
              >
                {t.grades[g as keyof typeof t.grades]}
              </button>
            );
          })}
        </div>
      )}

      {/* 分享导入成功轻提示 */}
      {importToast && (
        <div className="mb-4 px-4 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold flex items-center gap-2 shadow-xs animate-fade-in">
          <Check size={16} className="text-emerald-600 shrink-0" />
          <span>{importToast}</span>
        </div>
      )}

      {/* 关卡列表网格 */}
      {availableLevels.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {/* 英文单词模式：家长新建自定义听写词表入口卡 */}
          {selectedMode === 'EN_WORDS' && (
            <button
              type="button"
              onClick={() => {
                setEditingList(null);
                setIsCustomModalOpen(true);
              }}
              className="group relative bg-gradient-to-br from-emerald-50/90 via-[#FFFDF8] to-amber-50/80 p-5 rounded-3xl border-2 border-dashed border-[#1E7F5C]/45 hover:border-[#1E7F5C] hover:shadow-lg transition-all duration-200 hover:-translate-y-1 text-left h-full flex flex-col justify-center items-center gap-2.5 cursor-pointer min-h-[172px]"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#1E7F5C]/10 group-hover:bg-[#1E7F5C] text-[#1E7F5C] group-hover:text-white flex items-center justify-center transition-colors">
                <Plus size={26} />
              </div>
              <div className="text-center">
                <h3 className="text-base font-black text-[#1E7F5C]">
                  {language === 'cn' ? '新建听写词表' : 'New Dictation List'}
                </h3>
                <p className="text-xs text-[#7A6A5F] mt-1 font-medium">
                  {language === 'cn'
                    ? '粘贴课本/微信群单词，一键听写'
                    : 'Paste custom words & practice'}
                </p>
              </div>
            </button>
          )}

          {availableLevels.map((level, index) => {
            const prog = progressMap[level.id];
            const practiceCount = prog?.count || 0;
            const bestStars = prog?.bestStars || 0;
            const hasPracticed = practiceCount > 0;
            const isCustom = isCustomLevelId(level.id);

            const semesterTag = level.tags?.find((tag) => tag.startsWith('semester-'));
            const semesterLabel =
              semesterTag === 'semester-1' ? '上' : semesterTag === 'semester-2' ? '下' : '';

            return (
              <div
                key={level.id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  setDictationMode(isCustom);
                  selectLevel(level.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setDictationMode(isCustom);
                    selectLevel(level.id);
                  }
                }}
                className="relative bg-white/95 p-5 rounded-3xl shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1 text-left h-full flex flex-col border-2 cursor-pointer"
                style={{
                  borderColor: isCustom ? '#FDE68A' : hasPracticed ? '#86EFAC' : '#FFFFFF'
                }}
              >
                <div className="flex justify-between items-start mb-3 gap-2">
                  <span
                    className={`font-bold px-2.5 py-1 rounded-full text-xs inline-flex items-center gap-1 ${
                      isCustom
                        ? 'bg-amber-100 text-amber-800'
                        : isGradedMode
                          ? selectedGrade <= 6
                            ? 'bg-teal-50 text-teal-600'
                            : 'bg-indigo-50 text-indigo-600'
                          : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isCustom ? (
                      <>
                        <Headphones size={12} />
                        {language === 'cn' ? '听写词表' : 'Dictation'}
                      </>
                    ) : isGradedMode ? (
                      language === 'cn'
                        ? `${selectedGrade <= 6 ? `${selectedGrade}年级` : `初${selectedGrade - 6}`}${semesterLabel ? `${semesterLabel}册` : ''}`
                        : `G${selectedGrade}${semesterLabel ? `·S${semesterLabel === '上' ? 1 : 2}` : ''}`
                    ) : (
                      `${t.levelLabel} ${index + 1}`
                    )}
                  </span>

                  {isCustom ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const found = getCustomWordListById(level.id);
                          if (found) {
                            setEditingList(found);
                            setIsCustomModalOpen(true);
                          }
                        }}
                        className="text-xs font-bold px-2.5 py-1 rounded-full bg-stone-100 hover:bg-amber-100 text-[#5C4A3E] hover:text-amber-900 inline-flex items-center gap-1 transition-colors cursor-pointer"
                        title={language === 'cn' ? '编辑或分享词表' : 'Edit or share list'}
                      >
                        <Pencil size={11} />
                        {language === 'cn' ? '编辑' : 'Edit'}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingTarget({ id: level.id, title: level.title });
                        }}
                        className="p-1.5 rounded-full bg-stone-100 hover:bg-rose-100 text-[#7A6A5F] hover:text-rose-600 transition-colors cursor-pointer"
                        title={language === 'cn' ? '删除词表' : 'Delete list'}
                        aria-label={language === 'cn' ? '删除词表' : 'Delete list'}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">
                      {diffLabels[level.difficulty as 1 | 2 | 3] || diffLabels[1]}
                    </span>
                  )}
                </div>

                {(() => {
                  const localized = getLocalizedLevelText(level, selectedMode, language);
                  if (localized.fluentIcon) {
                    return (
                      <div className="flex items-center gap-3 mb-4 flex-grow">
                        <div
                          className={`w-12 h-12 rounded-2xl ${localized.fluentIcon.bgClass} flex items-center justify-center shrink-0 shadow-xs border border-black/[0.04] group-hover:scale-105 transition-transform duration-200`}
                        >
                          <img
                            src={localized.fluentIcon.src}
                            alt={localized.titleNoEmoji}
                            loading="lazy"
                            decoding="async"
                            className="w-8 h-8 object-contain drop-shadow-sm"
                          />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-lg font-extrabold text-slate-800 leading-snug truncate">
                            {localized.titleNoEmoji}
                          </h3>
                          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                            {localized.subtitle}
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <>
                      <h3 className="text-lg font-extrabold text-slate-800 mb-1 leading-snug">
                        {localized.title}
                      </h3>
                      <p className="text-xs text-slate-500 mb-4 line-clamp-2 flex-grow">
                        {localized.subtitle}
                      </p>
                    </>
                  );
                })()}

                {/* 底部展示玩家真实历史最高通关星级 + 练习次数 */}
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100 w-full">
                  <div className="flex gap-1" title={language === 'cn' ? '历史最高通关星级' : 'Best Stars'}>
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        size={17}
                        className={
                          s <= bestStars ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                        }
                      />
                    ))}
                  </div>

                  {hasPracticed && (
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 tabular-nums">
                      <span className="flex items-center gap-0.5">
                        <Zap size={12} />
                        {prog.bestWpm}
                      </span>
                      <span className="flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                        <Check size={11} />
                        {practiceCount}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white/90 rounded-3xl border-2 border-dashed border-slate-200">
          <GraduationCap size={48} className="text-slate-300 mb-4" />
          <p className="text-slate-400 font-bold">
            {language === 'cn' ? '该年级暂无内容，敬请期待！' : 'Coming soon for this grade!'}
          </p>
        </div>
      )}

      {/* 家长自定义听写词表弹窗 */}
      <CustomWordListModal
        isOpen={isCustomModalOpen}
        editingList={editingList}
        language={language}
        onClose={() => {
          setIsCustomModalOpen(false);
          setEditingList(null);
        }}
        onSave={(payload) => {
          saveCustomWordList(payload);
          refreshCustomLevels();
        }}
        onDelete={(id) => {
          deleteCustomWordList(id);
          refreshCustomLevels();
        }}
      />

      {/* 自定义奶油森林删除确认弹窗（替代浏览器原生 confirm） */}
      {deletingTarget &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            onClick={() => setDeletingTarget(null)}
            className="fixed inset-0 z-[200] bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-[#FFFDF8] rounded-3xl p-6 shadow-2xl border-2 border-[#EFE5D8] text-center animate-pop"
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center">
                <Trash2 size={22} />
              </div>
              <h3 className="text-lg font-black text-[#2B211B]">
                {language === 'cn' ? '删除听写词表？' : 'Delete Word List?'}
              </h3>
              <p className="text-sm font-medium text-[#7A6A5F] mt-2 leading-relaxed">
                {language === 'cn'
                  ? `确定要删除「${deletingTarget.title}」吗？删除后无法恢复。`
                  : `Are you sure you want to delete "${deletingTarget.title}"? This cannot be undone.`}
              </p>
              <div className="mt-6 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingTarget(null)}
                  className="flex-1 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-[#5C4A3E] font-bold text-sm transition-colors cursor-pointer"
                >
                  {language === 'cn' ? '取消' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteCustomWordList(deletingTarget.id);
                    refreshCustomLevels();
                    setDeletingTarget(null);
                  }}
                  className="flex-1 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-sm shadow-sm transition-colors cursor-pointer"
                >
                  {language === 'cn' ? '确认删除' : 'Delete'}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
