import React, { useEffect, useState, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import { TRANSLATIONS } from '../i18n';
import { User, Cpu, Flag, CheckCircle2, RotateCcw, Menu, ArrowRight } from 'lucide-react';

export const RaceTrack: React.FC = () => {
  const { 
    raceStatus, 
    participants, 
    startRace, 
    tickRace, 
    currentLevel, 
    currentChallengeIndex, 
    typedHistory, 
    lastInputError,
    view,
    language,
    restartLevel,
    exitGame,
    nextLevel,
    availableLevels
  } = useGameStore();

  const t = TRANSLATIONS[language];
  const [countdown, setCountdown] = useState(3);
  const requestRef = useRef<number>(0);
  const previousTimeRef = useRef<number>(0);

  // Countdown Logic
  useEffect(() => {
    if (raceStatus === 'countdown') {
      setCountdown(3);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            startRace();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [raceStatus, startRace]);

  // Game Loop for Bots
  const animate = (time: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = (time - previousTimeRef.current) / 1000; // in seconds
      if (raceStatus === 'racing') {
        tickRace(deltaTime);
      }
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [raceStatus]);

  // --- RESULT VIEW ---
  if (view === 'RESULT') {
     const hasNext = currentLevel && availableLevels.findIndex(l => l.id === currentLevel.id) < availableLevels.length - 1;
     // Sort participants by progress (all should be around 100, but logic might vary) or rank
     const sorted = [...participants].sort((a, b) => b.progress - a.progress);
     const playerRank = sorted.findIndex(p => p.type === 'player') + 1;
     
     return (
       <div className="flex flex-col items-center justify-center h-80 animate-jump-once">
         {playerRank === 1 ? (
            <>
                <CheckCircle2 size={80} className="text-kid-green mb-4" />
                <h2 className="text-4xl font-cartoon text-kid-blue">{t.levelComplete}</h2>
                <p className="text-xl text-gray-500 mt-2">Rank: 1st! 🏆</p>
            </>
         ) : (
             <>
                <div className="text-6xl mb-4">🏁</div>
                <h2 className="text-3xl font-cartoon text-gray-700">{t.rank}: {playerRank}</h2>
                <p className="text-gray-400">Keep practicing!</p>
             </>
         )}
         
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

  const currentItem = currentLevel?.challenges[currentChallengeIndex];

  return (
    <div className="w-full flex flex-col gap-4 relative h-96">
      
      {/* Full Screen Countdown Overlay */}
      {raceStatus === 'countdown' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
           <div className="flex flex-col items-center">
             <div className="text-[10rem] md:text-[14rem] font-cartoon text-kid-yellow drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] animate-bounce-short leading-none">
               {countdown > 0 ? countdown : t.raceGo}
             </div>
             <div className="text-white text-2xl font-bold mt-4 animate-pulse">
               {t.raceStart}
             </div>
           </div>
        </div>
      )}

      {/* Current Word Display (Floating at top) - Only show when racing or finished */}
      {raceStatus !== 'countdown' && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-20">
           <div className={`
             bg-white border-4 border-kid-blue rounded-2xl px-8 py-2 shadow-lg text-4xl font-mono font-bold flex gap-1
             ${lastInputError ? 'animate-shake border-red-500' : ''}
           `}>
              {currentItem?.display.split('').map((char, i) => {
                 let color = 'text-gray-300';
                 if (i < typedHistory.length) color = 'text-kid-green';
                 if (i === typedHistory.length) color = 'text-kid-blue border-b-4 border-kid-blue';
                 return <span key={i} className={color}>{char}</span>;
              })}
           </div>
        </div>
      )}

      {/* Tracks */}
      <div className="flex-1 flex flex-col justify-center gap-4 bg-gray-50 rounded-2xl p-4 border-2 border-dashed border-gray-200 overflow-hidden relative">
         
         {/* Finish Line */}
         <div className="absolute top-0 bottom-0 right-16 w-2 bg-repeating-linear-gradient-to-b from-black from-10px to-white to-20px opacity-50 z-0"></div>
         <Flag className="absolute top-2 right-12 text-gray-400" size={24} />

         {participants.map((p, idx) => (
           <div key={p.id} className="relative w-full h-16 bg-white rounded-full shadow-sm border border-gray-100 flex items-center px-2">
             {/* Name Label */}
             <div className="absolute left-2 -top-3 text-[10px] font-bold bg-gray-200 px-2 rounded-full text-gray-500 z-10">
               {p.type === 'player' ? t.you : p.name}
             </div>

             {/* Runner */}
             <div 
               className="absolute transition-all duration-300 ease-linear flex items-center justify-center w-12 h-12 rounded-full shadow-md z-10"
               style={{ 
                 left: `calc(${p.progress}% - 24px)`,
                 backgroundColor: p.type === 'player' ? '#4D96FF' : '#E5E7EB',
                 color: p.type === 'player' ? 'white' : '#9CA3AF'
               }}
             >
               {p.type === 'player' ? <User size={24} /> : <Cpu size={24} />}
             </div>

             {/* Progress Trail */}
             <div 
               className="h-2 rounded-full opacity-30"
               style={{ 
                 width: `${p.progress}%`,
                 backgroundColor: p.type === 'player' ? '#4D96FF' : '#E5E7EB'
               }}
             />
           </div>
         ))}
      </div>
    </div>
  );
};