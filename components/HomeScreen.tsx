import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { MODES_METADATA } from '../constants';
import { TRANSLATIONS } from '../i18n';
import { GameMode } from '../types';
import { AboutModal } from './AboutModal';
import { SettingsModal } from './SettingsModal';

// Import icons
import keyboardIcon from '../images/keyboard_icon.png';
import mazeIcon from '../images/maze_icon.png';
import puzzleIcon from '../images/puzzle_icon.png';
import carIcon from '../images/car_icon.png';
import pianoIcon from '../images/piano_icon.png';
import bookIcon from '../images/book_icon.png';
import numbersIcon from '../images/numbers_icon.png';
import chineseIcon from '../images/chinese_icon.png';

// Mode icon mapping
const MODE_ICONS: Record<GameMode, string> = {
  'EN_LETTERS': keyboardIcon,
  'EN_WORDS': mazeIcon,
  'EN_ESSAYS': puzzleIcon,
  'CN_PINYIN': chineseIcon,
  'CN_SENTENCES': pianoIcon,
  'CN_ESSAYS': bookIcon,
  'CN_POEMS': numbersIcon,
  'RACE_100M': carIcon,
};

// Card background colors matching design
const CARD_COLORS: Record<GameMode, string> = {
  'EN_LETTERS': 'bg-yellow-300',
  'EN_WORDS': 'bg-blue-300',
  'EN_ESSAYS': 'bg-purple-300',
  'CN_PINYIN': 'bg-green-300',
  'CN_SENTENCES': 'bg-red-300',
  'CN_ESSAYS': 'bg-teal-300',
  'CN_POEMS': 'bg-orange-300',
  'RACE_100M': 'bg-pink-300',
};

// Decorative stars positions
const DECORATIONS = [
  { type: 'star', top: '10%', left: '5%', size: 'text-2xl', color: 'text-cyan-400', delay: '0s' },
  { type: 'star', top: '20%', right: '10%', size: 'text-xl', color: 'text-yellow-400', delay: '0.5s' },
  { type: 'star', bottom: '15%', left: '8%', size: 'text-lg', color: 'text-pink-400', delay: '1s' },
  { type: 'star', bottom: '25%', right: '5%', size: 'text-2xl', color: 'text-yellow-400', delay: '1.5s' },
  { type: 'star', top: '50%', left: '2%', size: 'text-sm', color: 'text-cyan-400', delay: '0.3s' },
  { type: 'heart', top: '30%', left: '3%', size: 'text-lg', color: 'text-pink-400', delay: '0.7s' },
  { type: 'heart', bottom: '30%', right: '8%', size: 'text-xl', color: 'text-pink-300', delay: '1.2s' },
];

export const HomeScreen: React.FC = () => {
  const { selectMode, language, setView } = useGameStore();
  const t = TRANSLATIONS[language];
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="w-full max-w-7xl animate-fade-in relative">
      {/* About Modal */}
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Floating decorations */}
      {DECORATIONS.map((dec, i) => (
        <div
          key={i}
          className={`fixed pointer-events-none ${dec.size} ${dec.color} animate-float z-0`}
          style={{
            top: dec.top,
            left: dec.left,
            right: dec.right,
            bottom: dec.bottom,
            animationDelay: dec.delay,
          }}
        >
          {dec.type === 'star' ? '★' : '♥'}
        </div>
      ))}

      {/* Cards Grid - 4 columns on desktop, 2 rows total */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6 w-full px-4 relative z-10">
        {(Object.keys(MODES_METADATA) as GameMode[]).map((m, index) => {
          const text = t.modes[m];
          const cardColor = CARD_COLORS[m];
          const icon = MODE_ICONS[m];

          return (
            <button
              key={m}
              onClick={() => selectMode(m)}
              className={`
                group relative overflow-hidden rounded-2xl text-center transition-all duration-300 
                ${cardColor} shadow-lg hover:shadow-2xl hover:-translate-y-2 hover:scale-105
                py-6 px-4 flex flex-col items-center justify-center
              `}
              style={{
                animationDelay: `${index * 0.1}s`,
              }}
            >
              {/* Sparkle decorations on card */}
              <div className="absolute top-2 right-2 text-white/40 text-sm">✦</div>
              <div className="absolute top-3 left-3 text-white/30 text-xs">✦</div>

              {/* Icon */}
              <div className="w-14 h-14 md:w-16 md:h-16 mb-3 flex items-center justify-center">
                <img
                  src={icon}
                  alt={text.title}
                  className="w-full h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300"
                />
              </div>

              {/* Title */}
              <h3 className="text-base md:text-lg font-bold text-gray-800 mb-1 font-cartoon leading-tight">
                {text.title}
              </h3>

              {/* Description */}
              <p className="text-xs md:text-sm text-gray-600/80 leading-tight">
                {text.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Bottom Navigation Bar - matching design */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg px-6 py-3 flex items-center gap-4 z-20">
        {/* Home Button (active) */}
        <button className="w-10 h-10 rounded-full bg-blue-400 text-white flex items-center justify-center shadow-md hover:bg-blue-500 transition-colors">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
        </button>

        {/* Profile Button */}
        <button
          onClick={() => setView('PROFILE')}
          className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-purple-100 hover:text-kid-purple transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>

        {/* Settings Button */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        {/* About Button */}
        <button
          onClick={() => setIsAboutOpen(true)}
          className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
};
