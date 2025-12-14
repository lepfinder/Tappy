
import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { Star, ChevronLeft, Lock, Unlock, GraduationCap, ChevronDown } from 'lucide-react';
import { TRANSLATIONS } from '../i18n';

export const LevelSelectScreen: React.FC = () => {
  const { availableLevels, selectLevel, goHome, selectedMode, language, selectedGrade, setGrade } = useGameStore();
  const t = TRANSLATIONS[language];

  if (!selectedMode) return null;
  const modeText = t.modes[selectedMode];
  const isGradedMode = selectedMode === 'CN_POEMS' || selectedMode === 'CN_ESSAYS';

  return (
    <div className="w-full max-w-7xl animate-slide-up px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={goHome}
            className="p-3 bg-white rounded-full shadow-md hover:bg-gray-50 text-gray-500 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h2 className="text-3xl font-cartoon text-kid-blue">{modeText.title}</h2>
            <p className="text-gray-400">{t.chooseLevel}</p>
          </div>
        </div>

        {/* Grade Selector (For Poems & Essays) */}
        {isGradedMode && (
          <div className="relative group min-w-[180px]">
             <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-kid-blue">
                <ChevronDown size={20} />
             </div>
             <select
               value={selectedGrade}
               onChange={(e) => setGrade(Number(e.target.value))}
               className="
                 w-full appearance-none bg-white pl-5 pr-10 py-3 rounded-2xl shadow-sm border-2 border-transparent 
                 text-kid-blue font-bold text-lg cursor-pointer hover:border-kid-blue transition-all outline-none
                 focus:ring-2 focus:ring-kid-blue/20
               "
             >
               {[1, 2, 3, 4, 5, 6].map((g) => (
                 <option key={g} value={g}>
                   {language === 'cn' 
                     ? `人教版${TRANSLATIONS.cn.grades[g as keyof typeof TRANSLATIONS.cn.grades]}` 
                     : `PEP ${TRANSLATIONS.en.grades[g as keyof typeof TRANSLATIONS.en.grades]}`}
                 </option>
               ))}
             </select>
          </div>
        )}
      </div>

      {/* Grid */}
      {availableLevels.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {availableLevels.map((level, index) => (
            <button
              key={level.id}
              onClick={() => selectLevel(level.id)}
              className="
                relative bg-white p-6 rounded-3xl shadow-md hover:shadow-lg transition-all duration-200 
                hover:scale-105 border-b-4 border-gray-200 hover:border-kid-blue text-left h-full flex flex-col
              "
            >
              <div className="flex justify-between items-start mb-3">
                <span className={`
                  font-bold px-3 py-1 rounded-full text-xs
                  ${isGradedMode ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 text-gray-400'}
                `}>
                  {isGradedMode 
                    ? (language === 'cn' ? `${selectedGrade}年级` : `Grade ${selectedGrade}`)
                    : `${t.levelLabel} ${index + 1}`
                  }
                </span>
                <Unlock size={18} className="text-kid-green" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-1 leading-snug">{level.title}</h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-grow">{level.description}</p>
              
              <div className="flex gap-1 mt-auto">
                {[...Array(3)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={16} 
                    className={i < level.difficulty ? "fill-kid-yellow text-kid-yellow" : "text-gray-200"} 
                  />
                ))}
              </div>
            </button>
          ))}
        </div>
      ) : (
        // Empty State
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
           <GraduationCap size={48} className="text-gray-300 mb-4" />
           <p className="text-gray-400 font-bold">{language === 'cn' ? '该年级暂无内容，敬请期待！' : 'Coming soon for this grade!'}</p>
        </div>
      )}
    </div>
  );
};
