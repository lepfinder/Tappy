import { ArcadeGameId } from '../data/arcade_games';

const BGM_PREF_KEY = 'tappy_arcade_bgm_enabled';
const TARGET_VOLUME = 0.75; // 清晰饱满的背景音乐音量

let currentAudio: HTMLAudioElement | null = null;
let currentTrackId: ArcadeGameId | null = null;
let fadeTimer: ReturnType<typeof setInterval> | null = null;

export function getBgmEnabled(): boolean {
  try {
    const raw = localStorage.getItem(BGM_PREF_KEY);
    return raw === null ? true : raw === '1';
  } catch {
    return true;
  }
}

export function setBgmEnabledPref(enabled: boolean) {
  try {
    localStorage.setItem(BGM_PREF_KEY, enabled ? '1' : '0');
  } catch {
    // 忽略隐私模式异常
  }
  if (!enabled) {
    stopBgm(true);
  }
}

function clearFade() {
  if (fadeTimer) {
    clearInterval(fadeTimer);
    fadeTimer = null;
  }
}

function fadeVolume(audio: HTMLAudioElement, to: number, durationMs: number, onDone?: () => void) {
  clearFade();
  const steps = Math.max(1, Math.round(durationMs / 30));
  const from = audio.volume;
  const delta = (to - from) / steps;
  let step = 0;

  fadeTimer = setInterval(() => {
    step++;
    if (step >= steps) {
      audio.volume = Math.max(0, Math.min(1, to));
      clearFade();
      onDone?.();
    } else {
      audio.volume = Math.max(0, Math.min(1, from + delta * step));
    }
  }, 30);
}

/** 播放指定小游戏的循环 BGM（按需加载 /audio/bgm/<gameId>.mp3） */
export function playBgm(gameId: ArcadeGameId): void {
  if (!getBgmEnabled()) return;

  // 若已在播放同一首，仅确保恢复音量
  if (currentAudio && currentTrackId === gameId) {
    if (currentAudio.paused) {
      currentAudio.play().catch(() => {});
    }
    fadeVolume(currentAudio, TARGET_VOLUME, 300);
    return;
  }

  stopBgm(true);

  const audio = new Audio(`/audio/bgm/${gameId}.mp3`);
  audio.loop = true;
  audio.preload = 'auto';
  audio.volume = 0.2;
  currentAudio = audio;
  currentTrackId = gameId;

  const tryPlay = () => {
    if (currentAudio !== audio || !getBgmEnabled()) return;
    audio
      .play()
      .then(() => {
        if (currentAudio === audio) {
          fadeVolume(audio, TARGET_VOLUME, 250);
        }
      })
      .catch(() => {
        // 若浏览器拦截首播，等玩家第一次按键或点击时自动续播
        const unlock = () => {
          window.removeEventListener('keydown', unlock);
          window.removeEventListener('pointerdown', unlock);
          if (currentAudio === audio && getBgmEnabled()) {
            audio
              .play()
              .then(() => fadeVolume(audio, TARGET_VOLUME, 350))
              .catch(() => {});
          }
        };
        window.addEventListener('keydown', unlock, { once: true });
        window.addEventListener('pointerdown', unlock, { once: true });
      });
  };

  tryPlay();
}

/** 暂停当前 BGM（保留播放进度，恢复时断点续播） */
export function pauseBgm(): void {
  clearFade();
  if (currentAudio && !currentAudio.paused) {
    currentAudio.pause();
  }
}

/** 从断点恢复当前 BGM */
export function resumeBgm(): void {
  if (!getBgmEnabled()) return;
  if (currentAudio && currentAudio.paused) {
    currentAudio
      .play()
      .then(() => {
        if (currentAudio) fadeVolume(currentAudio, TARGET_VOLUME, 200);
      })
      .catch(() => {});
  }
}

/** 停止当前 BGM（默认带柔和淡出） */
export function stopBgm(immediate = false): void {
  clearFade();
  const audio = currentAudio;
  currentAudio = null;
  currentTrackId = null;

  if (!audio) return;
  if (immediate || audio.paused) {
    audio.pause();
    audio.currentTime = 0;
    return;
  }

  fadeVolume(audio, 0, 280, () => {
    audio.pause();
    audio.currentTime = 0;
  });
}
