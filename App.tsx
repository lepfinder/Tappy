import React, { useState, useEffect, lazy, Suspense } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { UserSwitcher } from './components/UserSwitcher';
import { UserOnboardingModal } from './components/UserOnboardingModal';
import { UserSwitchTransition } from './components/UserSwitchTransition';
import { useGameStore } from './store/useGameStore';
import { useUserStore } from './store/useUserStore';
import { TRANSLATIONS } from './i18n';
import { buildHashFromState, restoreStateFromHash } from './utils/urlSync';
import { Languages, Home, User, BarChart3, Settings, HelpCircle } from 'lucide-react';

// 非首屏页面与重型组件全部路由级懒加载，大幅削减首屏 JS 体积
const VirtualKeyboard = lazy(() =>
  import('./components/VirtualKeyboard').then((m) => ({ default: m.VirtualKeyboard }))
);
const TypingArea = lazy(() =>
  import('./components/TypingArea').then((m) => ({ default: m.TypingArea }))
);
const RaceTrack = lazy(() =>
  import('./components/RaceTrack').then((m) => ({ default: m.RaceTrack }))
);
const GameControls = lazy(() =>
  import('./components/GameControls').then((m) => ({ default: m.GameControls }))
);
const LevelSelectScreen = lazy(() =>
  import('./components/LevelSelectScreen').then((m) => ({ default: m.LevelSelectScreen }))
);
const UserProfile = lazy(() =>
  import('./components/UserProfile').then((m) => ({ default: m.UserProfile }))
);
const StatsPage = lazy(() =>
  import('./components/StatsPage').then((m) => ({ default: m.StatsPage }))
);
const SettingsModal = lazy(() =>
  import('./components/SettingsModal').then((m) => ({ default: m.SettingsModal }))
);
const AboutModal = lazy(() =>
  import('./components/AboutModal').then((m) => ({ default: m.AboutModal }))
);
const ArcadeStage = lazy(() =>
  import('./components/arcade/ArcadeStage').then((m) => ({ default: m.ArcadeStage }))
);

// 轻量 WebP 小熊 Logo（5.7KB）
const bearLogo = '/images/bear_logo.webp';

const App: React.FC = () => {
  const {
    view,
    language,
    setLanguage,
    selectedMode,
    currentLevel,
    activeArcadeGame,
    arcadeDifficulty,
    setView,
    goHome
  } = useGameStore();
  const { initialize, isInitialized, isLoading, currentUser } = useUserStore();
  const t = TRANSLATIONS[language];

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [hashReady, setHashReady] = useState(false);

  // 保留原版 Slogan 循环打字机动画
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // 首次加载与浏览器前进/后退时，从 URL Hash 恢复当前页面
  useEffect(() => {
    restoreStateFromHash(window.location.hash);
    setHashReady(true);

    const onHashChange = () => {
      restoreStateFromHash(window.location.hash);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // 应用视图/关卡/小游戏切换时，自动同步到地址栏 Hash，确保 Ctrl+R 刷新留在当前页
  useEffect(() => {
    if (!hashReady) return;
    const nextHash = buildHashFromState();
    if (window.location.hash !== nextHash) {
      window.history.pushState(null, '', nextHash);
    }
  }, [hashReady, view, selectedMode, currentLevel?.id, activeArcadeGame, arcadeDifficulty]);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'cn' : 'en');
  };

  const isRaceMode = selectedMode === 'RACE_100M';
  const isPracticeView = view === 'GAME' || view === 'RESULT';

  useEffect(() => {
    const slogan = t.slogan;
    let currentIndex = 0;
    let isDeleting = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const tick = () => {
      if (!isDeleting) {
        if (currentIndex < slogan.length) {
          setDisplayedText(slogan.slice(0, currentIndex + 1));
          currentIndex++;
          setIsTypingComplete(false);
          timeoutId = setTimeout(tick, 100);
        } else {
          setIsTypingComplete(true);
          timeoutId = setTimeout(() => {
            isDeleting = true;
            tick();
          }, 2000);
        }
      } else {
        if (currentIndex > 0) {
          currentIndex--;
          setDisplayedText(slogan.slice(0, currentIndex));
          setIsTypingComplete(false);
          timeoutId = setTimeout(tick, 50);
        } else {
          isDeleting = false;
          timeoutId = setTimeout(tick, 500);
        }
      }
    };

    tick();

    return () => clearTimeout(timeoutId);
  }, [language, t.slogan]);

  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 via-white to-blue-50">
        <img
          src={bearLogo}
          alt="Tappy Logo"
          className="w-20 h-20 object-contain animate-bounce"
        />
        <p className="mt-4 text-gray-400 font-medium">Loading...</p>
      </div>
    );
  }

  const showFirstTimeModal = isInitialized && !currentUser;

  const navLabels =
    language === 'cn'
      ? { home: '首页', profile: '成长', stats: '数据', settings: '设置', about: '关于' }
      : { home: 'Home', profile: 'Growth', stats: 'Stats', settings: 'Settings', about: 'About' };

  return (
    <div className="min-h-screen flex flex-col items-center py-6 px-4 font-sans text-gray-800 relative overflow-x-hidden transition-colors duration-500">
      {/* 首次建号与添加成员弹窗 */}
      <UserOnboardingModal isOpen={showFirstTimeModal} isFirstTime={true} />
      <UserOnboardingModal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        isFirstTime={false}
      />

      {/* 全局设置与关于弹窗（按需懒加载） */}
      <Suspense fallback={null}>
        {isSettingsOpen && (
          <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        )}
        {isAboutOpen && <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />}
      </Suspense>

      {/* 用户切换过场 */}
      <UserSwitchTransition />

      {/* 右上角全局工具栏：用户切换 · 语言 · 设置 · 关于 */}
      {!isPracticeView && (
        <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
          <UserSwitcher onAddUser={() => setShowAddUserModal(true)} />

          <button
            type="button"
            onClick={toggleLanguage}
            title={language === 'cn' ? 'Switch to English' : '切换为中文'}
            className="bg-white/95 backdrop-blur-sm py-2 px-3.5 rounded-full shadow-sm hover:shadow-md text-[#2B211B] hover:text-[#1E7F5C] flex items-center gap-1.5 border border-[#EAE0CF] hover:border-[#1E7F5C]/40 transition-all font-bold text-sm cursor-pointer"
          >
            <Languages size={16} className="text-[#1E7F5C]" />
            <span>{language === 'en' ? 'EN' : '中文'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            title={navLabels.settings}
            aria-label={navLabels.settings}
            className="bg-white/95 backdrop-blur-sm w-9 h-9 rounded-full shadow-sm hover:shadow-md text-[#5C4A3E] hover:text-[#1E7F5C] flex items-center justify-center border border-[#EAE0CF] hover:border-[#1E7F5C]/40 transition-all cursor-pointer"
          >
            <Settings size={17} />
          </button>

          <button
            type="button"
            onClick={() => setIsAboutOpen(true)}
            title={navLabels.about}
            aria-label={navLabels.about}
            className="bg-white/95 backdrop-blur-sm w-9 h-9 rounded-full shadow-sm hover:shadow-md text-[#5C4A3E] hover:text-[#1E7F5C] flex items-center justify-center border border-[#EAE0CF] hover:border-[#1E7F5C]/40 transition-all cursor-pointer"
          >
            <HelpCircle size={17} />
          </button>
        </div>
      )}

      {/* 原版居中可爱小熊 Logo 与标题（打字练习态自动隐藏以留足一屏操作空间） */}
      {!isPracticeView && (
        <>
          <header
            className="mb-2 text-center transition-all z-10 mt-4 md:mt-0 flex items-center gap-3 cursor-pointer hover:opacity-80"
            onClick={goHome}
            title={language === 'cn' ? '返回首页' : 'Back to Home'}
          >
            <img
              src={bearLogo}
              alt="Tappy Logo"
              className="w-12 h-12 md:w-14 md:h-14 object-contain animate-float"
            />
            <div>
              <h1
                className="text-4xl md:text-5xl font-cartoon drop-shadow-sm flex items-center gap-2 transition-colors duration-300"
                style={{ color: 'var(--brand-title)' }}
              >
                {t.appTitle}
                <span className="text-amber-400 text-2xl animate-twinkle">☆</span>
              </h1>
            </div>
          </header>

          {view === 'HOME' && (
            <p className="text-gray-500 font-medium text-base md:text-lg mb-4 z-10 h-7">
              <span>{displayedText}</span>
              <span
                className={`inline-block w-0.5 h-5 bg-kid-blue ml-0.5 align-middle ${
                  isTypingComplete ? 'animate-blink' : ''
                }`}
              />
            </p>
          )}
        </>
      )}

      {/* 主内容路由 */}
      <main
        className={`w-full flex flex-col items-center gap-6 flex-grow relative z-10 ${
          isPracticeView ? 'max-w-5xl justify-between py-1' : 'max-w-7xl pb-24'
        } ${view === 'HOME' ? 'justify-center' : ''}`}
      >
        {view === 'HOME' && <HomeScreen />}

        <Suspense
          fallback={
            <div className="flex items-center justify-center py-24">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-kid-blue border-t-transparent" />
            </div>
          }
        >
          {view === 'LEVELS' && <LevelSelectScreen />}

          {view === 'PROFILE' && <UserProfile onBack={goHome} />}

          {view === 'STATS' && <StatsPage onBack={goHome} />}

          {isPracticeView && (
            isRaceMode && activeArcadeGame ? (
              <ArcadeStage />
            ) : (
              <div
                className={`w-full flex-1 flex flex-col items-center gap-3 animate-slide-up ${
                  view === 'RESULT' ? 'justify-start' : 'justify-between'
                }`}
              >
                <GameControls />

                <div
                  className={`w-full bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-6 sm:p-7 relative overflow-hidden border-2 border-white/80 transition-all duration-300 ${
                    view === 'RESULT' ? 'max-w-3xl my-auto' : 'max-w-5xl'
                  } ${isRaceMode ? 'bg-blue-50/70' : ''}`}
                >
                  {isRaceMode ? <RaceTrack /> : <TypingArea />}
                </div>

                {/* 仅在打字练习态显示键盘，结算页隐藏避免把键盘挤出屏幕 */}
                {view === 'GAME' && <VirtualKeyboard />}
              </div>
            )
          )}
        </Suspense>
      </main>

      {/* 全局悬浮底部胶囊导航栏 */}
      {!isPracticeView && (
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg px-4 py-2.5 flex items-center gap-1.5 sm:gap-2 z-30">
          <button
            type="button"
            onClick={goHome}
            style={view === 'HOME' || view === 'LEVELS' ? { backgroundColor: 'var(--brand-primary)' } : undefined}
            className={`px-3.5 py-2 rounded-full flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
              view === 'HOME' || view === 'LEVELS'
                ? 'text-white shadow-md'
                : 'text-gray-500 hover:bg-slate-100 hover:text-gray-800'
            }`}
          >
            <Home size={16} />
            <span>{navLabels.home}</span>
          </button>

          <button
            type="button"
            onClick={() => setView('PROFILE')}
            style={view === 'PROFILE' ? { backgroundColor: 'var(--brand-primary)' } : undefined}
            className={`px-3.5 py-2 rounded-full flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
              view === 'PROFILE'
                ? 'text-white shadow-md'
                : 'text-gray-500 hover:bg-slate-100 hover:text-gray-800'
            }`}
          >
            <User size={16} />
            <span>{navLabels.profile}</span>
          </button>

          <button
            type="button"
            onClick={() => setView('STATS')}
            style={view === 'STATS' ? { backgroundColor: 'var(--brand-primary)' } : undefined}
            className={`px-3.5 py-2 rounded-full flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
              view === 'STATS'
                ? 'text-white shadow-md'
                : 'text-gray-500 hover:bg-slate-100 hover:text-gray-800'
            }`}
          >
            <BarChart3 size={16} />
            <span>{navLabels.stats}</span>
          </button>

        </nav>
      )}
    </div>
  );
};

export default App;
