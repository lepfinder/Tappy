
import React, { useEffect } from 'react';
import { KEYBOARD_ROWS, FINGER_MAP, FINGER_COLORS } from '../constants';
import { useGameStore } from '../store/useGameStore';
import { TRANSLATIONS } from '../i18n';

export const VirtualKeyboard: React.FC = () => {
  const {
    handleInput,
    selectedMode,
    currentLevel,
    currentChallengeIndex,
    typedHistory,
    currentSyllableIndex,
    isPlaying,
    language
  } = useGameStore();

  const t = TRANSLATIONS[language];

  // Determine which key should be highlighted next
  let expectedKey = '';
  if (isPlaying && currentLevel && currentLevel.challenges[currentChallengeIndex]) {
    const currentItem = currentLevel.challenges[currentChallengeIndex];

    if (selectedMode?.startsWith('EN') || selectedMode === 'RACE_100M') {
      expectedKey = currentItem.display[typedHistory.length]?.toLowerCase();
    } else {
      // Chinese Mode Logic
      const currentSyllable = currentItem.pinyin?.[currentSyllableIndex];
      if (currentSyllable) {
        expectedKey = currentSyllable[typedHistory.length]?.toLowerCase();
      }
    }
  }

  // Handle physical keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;

      // Allow letters, numbers, spaces, and basic punctuation
      // We check for length 1 to avoid control keys like 'Enter', 'Backspace', etc.
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Prevent space bar from scrolling the page
        if (e.key === ' ') {
          e.preventDefault();
        }
        handleInput(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, handleInput]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-gray-100 rounded-3xl shadow-inner select-none transition-opacity duration-500">
      <div className="flex flex-col gap-2">
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-2">
            {row.map((key) => {
              const finger = FINGER_MAP[key];
              const fingerColorClass = FINGER_COLORS[finger];
              const isTarget = key === expectedKey;

              return (
                <div
                  key={key}
                  className={`
                    relative flex items-center justify-center
                    w-12 h-12 md:w-16 md:h-16 rounded-xl border-b-4 transition-all duration-100
                    uppercase font-bold text-lg md:text-2xl shadow-sm
                    ${isTarget
                      ? `${fingerColorClass} -translate-y-1 border-b-[6px] brightness-110 ring-4 ring-yellow-300 ring-opacity-50 z-10 scale-110`
                      : 'bg-white border-gray-300 text-gray-500'
                    }
                  `}
                >
                  {key}
                  {/* Finger Dot Indicator */}
                  {isTarget && (
                    <div className="absolute -bottom-6 text-xs text-gray-400 font-sans whitespace-nowrap opacity-0 md:opacity-100 animate-bounce">
                      {finger.replace('-', ' ')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Spacebar Row - Decorative and functional visual indicator for Space */}
      <div className="flex justify-center mt-2">
        <div className={`
           w-64 h-12 rounded-xl border-b-4 flex items-center justify-center text-sm font-bold tracking-widest transition-all
           ${expectedKey === ' '
            ? 'bg-yellow-200 border-yellow-400 ring-4 ring-yellow-300 ring-opacity-50 -translate-y-1 scale-105'
            : 'bg-white border-gray-300 text-gray-300'
          }
         `}>
          {t.space}
        </div>
      </div>
    </div>
  );
};
