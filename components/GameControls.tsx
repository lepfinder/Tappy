import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { RotateCcw, Trophy, ArrowLeft, Flame, Gauge, Crosshair } from 'lucide-react';
import { TRANSLATIONS } from '../i18n';

export const GameControls: React.FC = () => {
  const { restartLevel, score, errors, exitGame, currentLevel, combo, startTime, correctKeystrokes, totalKeystrokes, language } = useGameStore();
  const [wpm, setWpm] = useState(0);
  const t = TRANSLATIONS[language];

  // Update WPM every second while playing
  useEffect(() => {
    if (!startTime) return;
    const interval = setInterval(() => {
      const timeInMinutes = (Date.now() - startTime) / 60000;
      if (timeInMinutes > 0) {
        // Standard WPM formula: (Total Correct Characters / 5) / Time in Minutes
        const currentWpm = Math.round((correctKeystrokes / 5) / timeInMinutes);
        setWpm(currentWpm);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, correctKeystrokes]);

  const accuracy = totalKeystrokes > 0 
    ? Math.round((correctKeystrokes / totalKeystrokes) * 100) 
    : 100;

  return (
    <div className="flex justify-between items-center w-full max-w-5xl px-4 py-3 bg-white rounded-full shadow-lg mb-6 z-10 select-none">
      
      {/* Left: Exit & Level Info */}
      <div className="flex items-center gap-2 md:gap-4">
        <button 
          onClick={exitGame}
          className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors mr-2"
          title={t.levels}
        >
          <ArrowLeft size={24} />
        </button>
        
        <div className="flex flex-col">
          <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">{t.level}</span>
          <span className="font-bold text-gray-700 leading-tight max-w-[100px] md:max-w-xs truncate">{currentLevel?.title}</span>
        </div>
      </div>

      {/* Center: Combo Counter (Only shows when combo > 2) */}
      <div className={`
        absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2 transition-all duration-300
        ${combo > 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}
      `}>
         <div className={`
           font-cartoon text-3xl md:text-4xl italic font-black flex items-center gap-1
           ${combo > 10 ? 'text-orange-500 animate-bounce-short drop-shadow-md' : 'text-kid-blue'}
         `}>
           <Flame className={combo > 10 ? 'fill-orange-500 text-orange-600' : 'fill-kid-blue text-blue-600'} />
           {combo}x
         </div>
      </div>

      {/* Right: Stats */}
      <div className="flex items-center gap-3 md:gap-6">
        {/* Stats Group */}
        <div className="hidden md:flex items-center gap-4 text-sm font-bold text-gray-500">
           <div className="flex items-center gap-1" title={t.wpm}>
             <Gauge size={16} />
             <span>{wpm} {t.wpm}</span>
           </div>
           <div className="flex items-center gap-1" title={t.accuracy}>
             <Crosshair size={16} />
             <span className={accuracy < 90 ? 'text-kid-red' : 'text-kid-green'}>{accuracy}%</span>
           </div>
        </div>

        <div className="hidden sm:flex bg-kid-blue text-white px-4 py-1 rounded-full font-bold items-center gap-2 shadow-sm" title={t.score}>
          <Trophy size={18} /> {score}
        </div>
        
        <button 
          onClick={restartLevel}
          className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors border-l pl-4"
          title={t.replay}
        >
          <RotateCcw size={24} />
        </button>
      </div>
    </div>
  );
};