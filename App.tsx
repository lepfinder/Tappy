import React from 'react';
import { VirtualKeyboard } from './components/VirtualKeyboard';
import { TypingArea } from './components/TypingArea';
import { RaceTrack } from './components/RaceTrack';
import { GameControls } from './components/GameControls';
import { HomeScreen } from './components/HomeScreen';
import { LevelSelectScreen } from './components/LevelSelectScreen';
import { useGameStore } from './store/useGameStore';
import { TRANSLATIONS } from './i18n';
import { Languages, ChevronDown } from 'lucide-react';

// Import bear logo
import bearLogo from './images/bear_logo.png';

const App: React.FC = () => {
  const { view, language, setLanguage, selectedMode } = useGameStore();
  const t = TRANSLATIONS[language];

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'cn' : 'en');
  };

  const isRaceMode = selectedMode === 'RACE_100M';

  return (
    <div className="min-h-screen flex flex-col items-center py-6 px-4 font-sans text-gray-800 relative overflow-x-hidden transition-colors duration-500">

      {/* Language Switcher - Updated design */}
      <button
        onClick={toggleLanguage}
        className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm py-2 px-4 rounded-full shadow-md text-gray-600 hover:text-kid-blue flex items-center gap-2 border border-gray-100 hover:border-kid-blue transition-all z-20 font-medium text-sm"
      >
        <Languages size={18} />
        <span>{language === 'en' ? 'English' : '中文'}</span>
        <ChevronDown size={14} />
      </button>

      {/* Header with Bear Logo */}
      <header className="mb-6 text-center transition-all z-10 mt-4 md:mt-0 flex items-center gap-3">
        <img
          src={bearLogo}
          alt="KidType Fun Logo"
          className="w-12 h-12 md:w-14 md:h-14 object-contain animate-float"
        />
        <div>
          <h1 className="text-4xl md:text-5xl font-cartoon text-kid-blue drop-shadow-sm flex items-center gap-2">
            {t.appTitle}
            <span className="text-yellow-400 text-2xl animate-twinkle">☆</span>
          </h1>
          {view === 'HOME' && (
            <p className="text-gray-400 font-medium text-sm mt-1">{t.subtitle}</p>
          )}
        </div>
      </header>

      {/* Main Content Router */}
      <main className="w-full max-w-7xl flex flex-col items-center gap-6 flex-grow relative z-10 pb-20">

        {view === 'HOME' && <HomeScreen />}

        {view === 'LEVELS' && <LevelSelectScreen />}

        {(view === 'GAME' || view === 'RESULT') && (
          <div className="w-full flex flex-col items-center animate-slide-up">
            <GameControls />

            <div className={`
              w-full max-w-5xl bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-8 relative overflow-hidden border-4 border-white/50 transition-all duration-300
              ${isRaceMode ? 'bg-blue-50/50' : ''}
            `}>
              {/* Decorative background blobs */}
              <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-kid-green opacity-10 rounded-full blur-2xl pointer-events-none"></div>
              <div className="absolute bottom-[-50px] left-[-50px] w-40 h-40 bg-kid-red opacity-10 rounded-full blur-2xl pointer-events-none"></div>

              {isRaceMode ? <RaceTrack /> : <TypingArea />}
            </div>

            <VirtualKeyboard />
          </div>
        )}
      </main>

      {/* Footer - only show when not on home */}
      {view !== 'HOME' && (
        <footer className="mt-8 text-gray-400 text-xs text-center z-10">
          Made with ❤️ for Kids • React • Tailwind • TypeScript
        </footer>
      )}
    </div>
  );
};

export default App;