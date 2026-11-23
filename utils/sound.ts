// 温润清脆的 Web Audio API 打字音效合成器（无外部音频依赖）
const AudioContextClass =
  typeof window !== 'undefined'
    ? window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    : null;

export type KeySoundProfile = 'wood' | 'tactile' | 'mute';

let audioCtx: AudioContext | null = null;
let soundEnabled = true;
let keySoundProfile: KeySoundProfile = 'wood';

export const setSoundEnabled = (enabled: boolean) => {
  soundEnabled = enabled;
};

export const isSoundEnabled = () => soundEnabled;

export const setKeySoundProfile = (profile: KeySoundProfile) => {
  keySoundProfile = profile;
};

export const getKeySoundProfile = () => keySoundProfile;

const initAudio = (): AudioContext | null => {
  if (!AudioContextClass) return null;
  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
};

export const playSound = (type: 'click' | 'success' | 'error' | 'win' | 'pop' | 'laser') => {
  if (!soundEnabled) return;

  try {
    const ctx = initAudio();
    if (!ctx) return;
    const now = ctx.currentTime;

    if (type === 'click') {
      if (keySoundProfile === 'mute') return;

      if (keySoundProfile === 'tactile') {
        // 清脆茶轴：前段轻脆触发 + 短促落底
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(1480, now);
        osc1.frequency.exponentialRampToValueAtTime(520, now + 0.022);
        gain1.gain.setValueAtTime(0.001, now);
        gain1.gain.linearRampToValueAtTime(0.085, now + 0.003);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.026);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.03);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(340, now + 0.012);
        osc2.frequency.exponentialRampToValueAtTime(150, now + 0.048);
        gain2.gain.setValueAtTime(0.001, now + 0.012);
        gain2.gain.linearRampToValueAtTime(0.075, now + 0.016);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.052);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.012);
        osc2.stop(now + 0.055);
      } else {
        // 温润木轴（Thock）：圆润低频木质共鸣 + 柔和瞬态
        const body = ctx.createOscillator();
        const bodyGain = ctx.createGain();
        body.type = 'sine';
        body.frequency.setValueAtTime(290 + (Math.random() - 0.5) * 26, now);
        body.frequency.exponentialRampToValueAtTime(118, now + 0.055);
        bodyGain.gain.setValueAtTime(0.001, now);
        bodyGain.gain.linearRampToValueAtTime(0.11, now + 0.005);
        bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        body.connect(bodyGain);
        bodyGain.connect(ctx.destination);
        body.start(now);
        body.stop(now + 0.064);

        const click = ctx.createOscillator();
        const clickGain = ctx.createGain();
        click.type = 'triangle';
        click.frequency.setValueAtTime(760, now);
        click.frequency.exponentialRampToValueAtTime(360, now + 0.018);
        clickGain.gain.setValueAtTime(0.001, now);
        clickGain.gain.linearRampToValueAtTime(0.045, now + 0.003);
        clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
        click.connect(clickGain);
        clickGain.connect(ctx.destination);
        click.start(now);
        click.stop(now + 0.022);
      }
    } else if (type === 'error') {
      // 柔和三角波低音轻叩（取代刺耳锯齿波）
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(210, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.14);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.09, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.17);
    } else if (type === 'success') {
      [523.25, 659.25].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startAt = now + idx * 0.065;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startAt);
        gain.gain.setValueAtTime(0.001, startAt);
        gain.gain.linearRampToValueAtTime(0.08, startAt + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.001, startAt + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startAt);
        osc.stop(startAt + 0.24);
      });
    } else if (type === 'pop') {
      // 清脆弹性泡泡/接苹果/打地鼠音效
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(340, now);
      osc.frequency.exponentialRampToValueAtTime(760, now + 0.085);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.11, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'laser') {
      // 科幻太空激光发射音效
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1040, now);
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.09);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.085, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.095);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'win') {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startAt = now + idx * 0.085;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startAt);
        gain.gain.setValueAtTime(0.001, startAt);
        gain.gain.linearRampToValueAtTime(0.09, startAt + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, startAt + 0.34);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startAt);
        osc.stop(startAt + 0.36);
      });
    }
  } catch (e) {
    console.error('Audio error', e);
  }
};

/** 太空战机专用：连击升调双频霓虹激光音效 */
export const playArcadeLaser = (combo = 0) => {
  if (!soundEnabled) return;
  try {
    const ctx = initAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    const boost = Math.min(280, combo * 16);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(920 + boost, now);
    osc.frequency.exponentialRampToValueAtTime(240 + boost * 0.25, now + 0.085);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.09, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.095);
  } catch {
    // 忽略音频上下文异常
  }
};

/** 太空战机专用：低频轰鸣 + 滤波白噪爆炸声（支持普通敌机与 Boss 大爆炸） */
export const playExplosion = (big = false) => {
  if (!soundEnabled) return;
  try {
    const ctx = initAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    const dur = big ? 0.42 : 0.22;

    // 1. 低频冲击波
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(big ? 150 : 190, now);
    sub.frequency.exponentialRampToValueAtTime(36, now + dur);
    subGain.gain.setValueAtTime(0.001, now);
    subGain.gain.linearRampToValueAtTime(big ? 0.22 : 0.14, now + 0.01);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    sub.connect(subGain);
    subGain.connect(ctx.destination);
    sub.start(now);
    sub.stop(now + dur + 0.02);

    // 2. 滤波白噪声火花
    const bufSize = Math.floor(ctx.sampleRate * dur);
    const buffer = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufSize, 1.4);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(big ? 1600 : 2400, now);
    filter.frequency.exponentialRampToValueAtTime(220, now + dur);

    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(big ? 0.16 : 0.1, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(ctx.destination);
    noise.start(now);
  } catch {
    // 忽略音频上下文异常
  }
};

/** 太空战机专用：满能量全屏超级星云冲击波音效 */
export const playSuperNova = () => {
  if (!soundEnabled) return;
  try {
    const ctx = initAudio();
    if (!ctx) return;
    const now = ctx.currentTime;

    const sweep = ctx.createOscillator();
    const gain = ctx.createGain();
    sweep.type = 'sawtooth';
    sweep.frequency.setValueAtTime(180, now);
    sweep.frequency.exponentialRampToValueAtTime(980, now + 0.16);
    sweep.frequency.exponentialRampToValueAtTime(75, now + 0.55);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2600, now);
    filter.frequency.exponentialRampToValueAtTime(320, now + 0.55);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.14, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.56);

    sweep.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    sweep.start(now);
    sweep.stop(now + 0.58);
    playExplosion(true);
  } catch {
    // 忽略音频上下文异常
  }
};

/** 太空战机专用：护盾受损警报音 */
export const playShieldHit = () => {
  if (!soundEnabled) return;
  try {
    const ctx = initAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    [280, 190].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = now + i * 0.09;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.13, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.13);
    });
  } catch {
    // 忽略音频上下文异常
  }
};

/** 街机开局 3-2-1-GO 倒计时提示音 */
export const playCountdownTick = (isGo = false) => {
  if (!soundEnabled) return;
  try {
    const ctx = initAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    const freqs = isGo ? [523.25, 659.25, 1046.5] : [440];
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const st = now + i * 0.03;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, st);
      gain.gain.setValueAtTime(0.001, st);
      gain.gain.linearRampToValueAtTime(0.09, st + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, st + (isGo ? 0.28 : 0.14));
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(st);
      osc.stop(st + (isGo ? 0.3 : 0.15));
    });
  } catch {
    // 忽略音频上下文异常
  }
};

/** 波次通关欢快合成器和弦 */
export const playWaveClear = () => {
  if (!soundEnabled) return;
  try {
    const ctx = initAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const st = now + idx * 0.065;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, st);
      gain.gain.setValueAtTime(0.001, st);
      gain.gain.linearRampToValueAtTime(0.09, st + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.26);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(st);
      osc.stop(st + 0.28);
    });
  } catch {
    // 忽略音频上下文异常
  }
};

/** 快乐摘苹果专用：清脆木琴/铃铛接果音效（连击升调，金苹果与爱心苹果带和弦闪耀） */
export const playAppleCatch = (combo = 0, variant: 'red' | 'gold' | 'heart' = 'red') => {
  if (!soundEnabled) return;
  try {
    const ctx = initAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    // 五声音阶升调，连击越顺耳
    const pentatonic = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51];
    const baseFreq = pentatonic[Math.min(pentatonic.length - 1, Math.max(0, combo % pentatonic.length))];

    if (variant === 'gold') {
      [baseFreq, baseFreq * 1.25, baseFreq * 1.5].forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const st = now + idx * 0.045;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, st);
        gain.gain.setValueAtTime(0.001, st);
        gain.gain.linearRampToValueAtTime(0.11, st + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.001, st + 0.26);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(st);
        osc.stop(st + 0.28);
      });
    } else if (variant === 'heart') {
      [587.33, 783.99, 1046.5].forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const st = now + idx * 0.06;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, st);
        gain.gain.setValueAtTime(0.001, st);
        gain.gain.linearRampToValueAtTime(0.1, st + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, st + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(st);
        osc.stop(st + 0.3);
      });
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * 0.85, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.15, now + 0.075);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.11, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    }
  } catch {
    // 忽略音频上下文异常
  }
};

/** 快乐摘苹果专用：苹果落地柔和闷响 */
export const playAppleSplat = () => {
  if (!soundEnabled) return;
  try {
    const ctx = initAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(190, now);
    osc.frequency.exponentialRampToValueAtTime(85, now + 0.16);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.14, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.19);
  } catch {
    // 忽略音频上下文异常
  }
};

/** 快乐摘苹果专用：丰收时刻满能清屏的温暖竖琴琶音 */
export const playHarvestBurst = () => {
  if (!soundEnabled) return;
  try {
    const ctx = initAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];
    notes.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const st = now + idx * 0.045;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, st);
      gain.gain.setValueAtTime(0.001, st);
      gain.gain.linearRampToValueAtTime(0.11, st + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.38);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(st);
      osc.stop(st + 0.4);
    });
  } catch {
    // 忽略音频上下文异常
  }
};
