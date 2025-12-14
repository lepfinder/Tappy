import React from 'react';
import { VirtualKeyboard } from './components/VirtualKeyboard';
import { TypingArea } from './components/TypingArea';
import { RaceTrack } from './components/RaceTrack';
import { GameControls } from './components/GameControls';
import { HomeScreen } from './components/HomeScreen';
import { LevelSelectScreen } from './components/LevelSelectScreen';
import { useGameStore } from './store/useGameStore';
import { TRANSLATIONS } from './i18n';
import { Languages } from 'lucide-react';

const App: React.FC = () => {
  const { view, language, setLanguage, selectedMode } = useGameStore();
  const t = TRANSLATIONS[language];

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'cn' : 'en');
  };

  const isRaceMode = selectedMode === 'RACE_100M';

  return (
    <div className="min-h-screen bg-kid-bg flex flex-col items-center py-8 px-4 font-sans text-gray-800 relative overflow-hidden transition-colors duration-500">
      
      {/* Language Switcher */}
      <button 
        onClick={toggleLanguage}
        className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md text-gray-500 hover:text-kid-blue flex items-center gap-2 px-4 border-2 border-transparent hover:border-kid-blue transition-all z-20 font-bold"
      >
        <Languages size={20} />
        {language === 'en' ? 'English' : '中文'}
      </button>

      {/* Header */}
      <header className="mb-8 text-center transition-all z-10 mt-8 md:mt-0">
        <h1 className="text-5xl md:text-6xl font-cartoon text-kid-blue drop-shadow-sm mb-2">
          {t.appTitle}
        </h1>
        {view === 'HOME' && <p className="text-gray-400 font-bold">{t.subtitle}</p>}
      </header>

      {/* Main Content Router */}
      <main className="w-full max-w-7xl flex flex-col items-center gap-8 flex-grow relative z-10">
        
        {view === 'HOME' && <HomeScreen />}
        
        {view === 'LEVELS' && <LevelSelectScreen />}

        {(view === 'GAME' || view === 'RESULT') && (
          <div className="w-full flex flex-col items-center animate-slide-up">
            <GameControls />
            
            <div className={`
              w-full max-w-5xl bg-white rounded-3xl shadow-xl p-8 mb-8 relative overflow-hidden border-4 border-gray-100 transition-all duration-300
              ${isRaceMode ? 'bg-blue-50/30' : ''}
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

      {/* Footer */}
      <footer className="mt-8 text-gray-300 text-sm text-center z-10">
        Made with ❤️ for Kids • React • Tailwind • TypeScript
      </footer>
    </div>
  );
};

export default App;