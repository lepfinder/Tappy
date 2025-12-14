import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { MODES_METADATA } from '../constants';
import { TRANSLATIONS } from '../i18n';
import { GameMode } from '../types';
import { Settings2, Keyboard, Flag } from 'lucide-react';

export const HomeScreen: React.FC = () => {
  const { selectMode, language } = useGameStore();
  const t = TRANSLATIONS[language];

  const getIcon = (mode: GameMode) => {
    if (mode === 'RACE_100M') return <Flag size={32} />;
    if (mode.includes('CN')) return <Settings2 size={32} />;
    return <Keyboard size={32} />;
  };

  return (
    <div className="w-full max-w-6xl animate-fade-in">
      <h2 className="text-3xl font-cartoon text-gray-500 text-center mb-8">{t.selectMode}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full px-4">
        {(Object.keys(MODES_METADATA) as GameMode[]).map((m) => {
          const meta = MODES_METADATA[m];
          const text = t.modes[m];
          
          return (
            <button
              key={m}
              onClick={() => selectMode(m)}
              className="
                group relative p-8 rounded-3xl text-left transition-all duration-200 
                bg-white border-4 border-transparent hover:border-kid-blue shadow-lg hover:shadow-xl hover:-translate-y-1
              "
            >
              <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10 ${meta.color}`}></div>
              <div className="flex items-start justify-between mb-4">
                <span className={`p-4 rounded-2xl ${meta.color} text-white shadow-sm`}>
                  {getIcon(m)}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2 font-cartoon">{text.title}</h3>
              <p className="text-gray-500">{text.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};