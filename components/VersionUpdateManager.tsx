import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, RefreshCw, X, CheckCircle2 } from 'lucide-react';
import { APP_VERSION, CHANGELOG_RELEASES } from '../data/changelog';
import { useGameStore } from '../store/useGameStore';
import { useUserStore } from '../store/useUserStore';

const SEEN_VERSION_KEY = 'tappy_last_seen_version';

export const VersionUpdateManager: React.FC = () => {
  const { view, language } = useGameStore();
  const { currentUser, isInitialized } = useUserStore();

  const [showChangelog, setShowChangelog] = useState(false);
  const [swUpdateReady, setSwUpdateReady] = useState(false);

  const isCn = language === 'cn';
  const latest = CHANGELOG_RELEASES[0];

  // 1. 监听 PWA Service Worker 后台更新，一旦有新版本就绪弹出轻量刷新提示条
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    let refreshing = false;
    const onControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      setSwUpdateReady(true);
    };

    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    navigator.serviceWorker
      .getRegistration()
      .then((reg) => {
        if (!reg) return;
        if (reg.waiting) {
          setSwUpdateReady(true);
        }
        reg.addEventListener('updatefound', () => {
          const installing = reg.installing;
          if (!installing) return;
          installing.addEventListener('statechange', () => {
            if (installing.state === 'installed' && navigator.serviceWorker.controller) {
              setSwUpdateReady(true);
            }
          });
        });
      })
      .catch(() => {});

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
    };
  }, []);

  // 2. 老用户升级后首次回到首页弹出一次「新版亮点」；全新建号用户静默记版本不打扰
  useEffect(() => {
    if (!isInitialized || !currentUser || view !== 'HOME') return;
    try {
      const seen = localStorage.getItem(SEEN_VERSION_KEY);
      if (seen === APP_VERSION) return;

      const hasLegacyPrefs = Boolean(localStorage.getItem('tappy_v1_pro_prefs'));
      if (seen !== null || hasLegacyPrefs) {
        setShowChangelog(true);
      } else {
        localStorage.setItem(SEEN_VERSION_KEY, APP_VERSION);
      }
    } catch {
      // 忽略隐私模式异常
    }
  }, [isInitialized, currentUser, view]);

  // 3. 监听「关于 Tappy」等入口手动触发打开更新日志
  useEffect(() => {
    const onOpen = () => setShowChangelog(true);
    window.addEventListener('tappy:open-changelog', onOpen);
    return () => window.removeEventListener('tappy:open-changelog', onOpen);
  }, []);

  // Esc 关闭更新亮点弹窗
  useEffect(() => {
    if (!showChangelog) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCloseChangelog();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showChangelog]);

  const handleCloseChangelog = () => {
    setShowChangelog(false);
    try {
      localStorage.setItem(SEEN_VERSION_KEY, APP_VERSION);
    } catch {
      // 忽略
    }
  };

  const handleApplySwUpdate = () => {
    navigator.serviceWorker
      ?.getRegistration()
      .then((reg) => {
        if (reg?.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      })
      .finally(() => {
        window.location.reload();
      });
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <>
      {/* 1. PWA 后台新版本轻量刷新胶囊 */}
      {swUpdateReady && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-[180] animate-slide-up">
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#1E7F5C] text-white shadow-xl border border-emerald-400/40">
            <Sparkles size={16} className="text-amber-300 shrink-0" />
            <span className="text-xs sm:text-sm font-bold">
              {isCn ? '发现 Tappy 新版本' : 'New version available'}
            </span>
            <button
              type="button"
              onClick={handleApplySwUpdate}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white text-[#1E7F5C] hover:bg-emerald-50 text-xs font-extrabold transition-colors cursor-pointer"
            >
              <RefreshCw size={12} />
              {isCn ? '立即更新' : 'Refresh'}
            </button>
            <button
              type="button"
              onClick={() => setSwUpdateReady(false)}
              aria-label="Dismiss"
              className="p-0.5 rounded-full hover:bg-white/15 text-white/80 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* 2. 新版亮点（What's New）单次轻弹窗 */}
      {showChangelog && latest && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={handleCloseChangelog}
          className="fixed inset-0 z-[210] bg-slate-950/55 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg max-h-[85vh] bg-[#FFFDF8] rounded-3xl shadow-2xl border-2 border-[#EFE5D8] overflow-hidden flex flex-col animate-pop"
          >
            {/* 头部 */}
            <div className="px-6 py-5 bg-gradient-to-r from-emerald-50 via-[#FFFBF2] to-amber-50 border-b border-[#EFE5D8] relative shrink-0">
              <button
                type="button"
                onClick={handleCloseChangelog}
                aria-label="Close"
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/90 hover:bg-stone-100 text-[#7A6A5F] flex items-center justify-center border border-[#EAE0CF] cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1E7F5C] text-white text-[11px] font-extrabold mb-2">
                <Sparkles size={12} className="text-amber-300" />
                <span>v{latest.version}</span>
                <span className="opacity-75">· {latest.date}</span>
              </div>
              <h3 className="text-xl font-black text-[#2B211B] leading-snug">
                {isCn ? latest.headlineCn : latest.headlineEn}
              </h3>
            </div>

            {/* 更新亮点列表 */}
            <div className="p-5 sm:p-6 space-y-3 overflow-y-auto flex-1">
              {latest.highlights.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-white border border-[#EFE5D8] shadow-2xs flex items-start gap-3"
                >
                  <CheckCircle2 size={18} className="text-[#1E7F5C] shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-sm text-[#2B211B]">
                        {isCn ? item.titleCn : item.titleEn}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200/70 text-[10px] font-extrabold text-amber-800">
                        {isCn ? item.badgeCn : item.badgeEn}
                      </span>
                    </div>
                    <p className="text-xs text-[#7A6A5F] mt-1 leading-relaxed">
                      {isCn ? item.descCn : item.descEn}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* 底部按钮 */}
            <div className="px-6 py-4 bg-white border-t border-[#EFE5D8] shrink-0">
              <button
                type="button"
                onClick={handleCloseChangelog}
                className="w-full py-2.5 rounded-2xl bg-[#1E7F5C] hover:bg-emerald-800 text-white font-extrabold text-sm shadow-sm transition-colors cursor-pointer"
              >
                {isCn ? '知道了，开始体验！' : 'Got it, let’s type!'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  );
};
