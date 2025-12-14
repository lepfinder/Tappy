import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { Star, ChevronLeft, Lock, Unlock } from 'lucide-react';
import { TRANSLATIONS } from '../i18n';

export const LevelSelectScreen: React.FC = () => {
  const { availableLevels, selectLevel, goHome, selectedMode, language } = useGameStore();
  const t = TRANSLATIONS[language];

  if (!selectedMode) return null;
  const modeText = t.modes[selectedMode];

  return (
    <div className="w-full max-w-4xl animate-slide-up px-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
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

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {availableLevels.map((level, index) => (
          <button
            key={level.id}
            onClick={() => selectLevel(level.id)}
            className="
              relative bg-white p-6 rounded-3xl shadow-md hover:shadow-lg transition-all duration-200 
              hover:scale-105 border-b-4 border-gray-200 hover:border-kid-blue text-left
            "
          >
            <div className="flex justify-between items-start mb-3">
              <span className="bg-gray-100 text-gray-400 font-bold px-3 py-1 rounded-full text-xs">
                {t.levelLabel} {index + 1}
              </span>
              <Unlock size={18} className="text-kid-green" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-800 mb-1">{level.title}</h3>
            <p className="text-sm text-gray-500 mb-4 h-10">{level.description}</p>
            
            <div className="flex gap-1">
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
    </div>
  );
};