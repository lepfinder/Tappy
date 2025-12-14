import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { TRANSLATIONS } from '../i18n';
import { CheckCircle2, RotateCcw, Menu, ArrowRight } from 'lucide-react';

export const TypingArea: React.FC = () => {
  const { 
    currentLevel,
    currentChallengeIndex, 
    typedHistory, 
    currentSyllableIndex, 
    selectedMode, 
    lastInputError,
    view,
    restartLevel,
    exitGame,
    nextLevel,
    availableLevels,
    language
  } = useGameStore();

  const t = TRANSLATIONS[language];

  if (view === 'RESULT') {
    const hasNext = currentLevel && availableLevels.findIndex(l => l.id === currentLevel.id) < availableLevels.length - 1;

    return (
      <div className="flex flex-col items-center justify-center h-64 animate-jump-once">
        <CheckCircle2 size={80} className="text-kid-green mb-4" />
        <h2 className="text-4xl font-cartoon text-kid-blue">{t.levelComplete}</h2>
        <p className="text-xl text-gray-500 mt-2">{t.greatJob}</p>
        
        <div className="flex gap-4 mt-8">
           <button 
             onClick={restartLevel}
             className="px-6 py-2 bg-gray-200 rounded-full font-bold text-gray-600 flex items-center gap-2 hover:bg-gray-300"
           >
             <RotateCcw size={18}/> {t.replay}
           </button>
           <button 
             onClick={exitGame}
             className="px-6 py-2 bg-gray-200 rounded-full font-bold text-gray-600 flex items-center gap-2 hover:bg-gray-300"
           >
             <Menu size={18}/> {t.levels}
           </button>
           {hasNext && (
             <button 
               onClick={nextLevel}
               className="px-6 py-2 bg-kid-blue text-white rounded-full font-bold flex items-center gap-2 hover:bg-blue-400 shadow-lg"
             >
               {t.next} <ArrowRight size={18}/>
             </button>
           )}
        </div>
      </div>
    );
  }

  if (!currentLevel) return null;

  // Progress Calculations
  const total = currentLevel.challenges.length;
  const current = currentChallengeIndex + 1; // 1-based for display
  const progressPercent = (currentChallengeIndex / total) * 100;

  const currentItem = currentLevel.challenges[currentChallengeIndex];

  return (
    <>
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gray-100">
        <div 
          className="h-full bg-kid-green transition-all duration-500 ease-out" 
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      
      {/* Progress Text */}
      <div className="absolute top-4 right-6 text-sm font-bold text-gray-300">
        {current} / {total}
      </div>

      {/* --- ENGLISH RENDERER --- */}
      {(selectedMode === 'EN_LETTERS' || selectedMode === 'EN_WORDS') && (() => {
        const chars = currentItem.display.split('');
        return (
          <div className="flex flex-col items-center justify-center h-64">
            {/* Visual cue for meaning */}
            {currentItem.translation && (
              <div className="text-2xl text-gray-400 font-cartoon mb-4 animate-pulse">
                {currentItem.translation}
              </div>
            )}
            
            <div className={`flex gap-1 text-6xl font-mono font-bold transition-transform ${lastInputError ? 'animate-shake text-red-500' : ''}`}>
              {chars.map((char, idx) => {
                let statusClass = 'text-gray-300'; // Untyped
                if (idx < typedHistory.length) {
                  statusClass = 'text-kid-green'; // Typed Correct
                } else if (idx === typedHistory.length) {
                  statusClass = 'text-kid-blue border-b-4 border-kid-blue'; // Current cursor
                }
                return (
                  <span key={idx} className={statusClass}>
                    {char}
                  </span>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* --- CHINESE RENDERER --- */}
      {!(selectedMode === 'EN_LETTERS' || selectedMode === 'EN_WORDS') && (() => {
        const syllables = currentItem.pinyin || [];
        const chars = currentItem.display.split(''); // Hanzi characters

        return (
          <div className="flex flex-col items-center justify-center h-64">
            <div className={`flex gap-6 ${lastInputError ? 'animate-shake' : ''}`}>
              {chars.map((hanzi, charIdx) => {
                const syllable = syllables[charIdx];
                const isCompletedSyllable = charIdx < currentSyllableIndex;
                const isCurrentSyllable = charIdx === currentSyllableIndex;
                
                return (
                  <div key={charIdx} className="flex flex-col items-center">
                    {/* Pinyin Layer */}
                    <div className="text-3xl font-mono mb-2 h-10 tracking-wider">
                      {syllable.split('').map((letter, letterIdx) => {
                        let letterClass = 'text-gray-300';
                        
                        if (isCompletedSyllable) {
                          letterClass = 'text-kid-green opacity-50'; // Done words fade slightly
                        } else if (isCurrentSyllable) {
                          if (letterIdx < typedHistory.length) {
                            letterClass = 'text-kid-green font-bold'; // Typed correct part of current
                          } else if (letterIdx === typedHistory.length) {
                            letterClass = 'text-kid-blue underline decoration-4'; // Next letter to type
                          }
                        }
                        
                        return <span key={letterIdx} className={letterClass}>{letter}</span>;
                      })}
                    </div>

                    {/* Hanzi Layer */}
                    <div className={`
                      text-7xl font-cartoon transition-all duration-300
                      ${isCompletedSyllable ? 'text-kid-purple scale-110' : 'text-gray-200'}
                      ${isCurrentSyllable ? 'text-gray-400' : ''}
                    `}>
                      {hanzi}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-8 text-xl text-gray-400 font-bold">
              {currentItem.translation}
            </div>
          </div>
        );
      })()}
    </>
  );
};