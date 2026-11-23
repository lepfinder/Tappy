import React, { useEffect, useRef, useState } from 'react';
import { Heart, Flame, Sparkles } from 'lucide-react';
import {
  ArcadeDifficulty,
  ArcadePrompt,
  ArcadeSessionSummary,
  getArcadePool,
  pickNonConflictingPrompt
} from '../../data/arcade_games';
import {
  playAppleCatch,
  playAppleSplat,
  playCountdownTick,
  playHarvestBurst,
  playSound,
  playWaveClear
} from '../../utils/sound';

type AppleVariant = 'red' | 'gold' | 'heart';

interface FallingApple {
  id: number;
  prompt: ArcadePrompt;
  typed: number;
  x: number; // 11% ~ 89%
  y: number; // 0% ~ 100%
  speed: number; // % per second
  variant: AppleVariant;
  swayPhase: number;
  swayAmp: number;
  wobbleUntil: number;
}

interface FlyingApple {
  startX: number;
  startY: number;
  ctrlX: number;
  ctrlY: number;
  targetX: number;
  targetY: number;
  progress: number; // 0 -> 1
  duration: number;
  variant: AppleVariant;
  pts: number;
  healed: boolean;
}

interface OrchardParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  shape: 'dot' | 'star' | 'leaf';
  rot: number;
  vRot: number;
}

interface ShockRing {
  x: number;
  y: number;
  r: number;
  maxR: number;
  color: string;
  alpha: number;
}

interface AmbientLeaf {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
  vRot: number;
  swayPhase: number;
  color: string;
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  big?: boolean;
}

interface AppleCatchGameProps {
  difficulty: ArcadeDifficulty;
  language: 'en' | 'cn';
  paused?: boolean;
  onFinish: (summary: ArcadeSessionSummary) => void;
  onImeWarning: (active: boolean) => void;
}

interface DifficultyConfig {
  target: number;
  maxOnScreen: number;
  baseSpeed: number;
  spawnInterval: number;
  minSpawnInterval: number;
  chargeNormal: number;
  chargeGold: number;
}

const DIFFICULTY_CFG: Record<ArcadeDifficulty, DifficultyConfig> = {
  easy: {
    target: 22,
    maxOnScreen: 4,
    baseSpeed: 11.2,
    spawnInterval: 1.65,
    minSpawnInterval: 1.05,
    chargeNormal: 10,
    chargeGold: 18
  },
  medium: {
    target: 20,
    maxOnScreen: 3,
    baseSpeed: 9.4,
    spawnInterval: 1.95,
    minSpawnInterval: 1.25,
    chargeNormal: 10,
    chargeGold: 18
  },
  hard: {
    target: 20,
    maxOnScreen: 3,
    baseSpeed: 8.6,
    spawnInterval: 2.05,
    minSpawnInterval: 1.3,
    chargeNormal: 10,
    chargeGold: 18
  },
  expert: {
    target: 30,
    maxOnScreen: 5,
    baseSpeed: 11.4,
    spawnInterval: 1.32,
    minSpawnInterval: 0.88,
    chargeNormal: 8,
    chargeGold: 14
  },
  endless: {
    target: 999999,
    maxOnScreen: 5,
    baseSpeed: 9.6,
    spawnInterval: 1.75,
    minSpawnInterval: 0.78,
    chargeNormal: 9,
    chargeGold: 16
  }
};

const MAX_HEARTS = 3;
const BASKET_Y_PCT = 86;

const SPRITE_SRCS: Record<AppleVariant, string> = {
  red: '/images/arcade/apple/apple_red.webp',
  gold: '/images/arcade/apple/apple_gold.webp',
  heart: '/images/arcade/apple/apple_heart.webp'
};

// 藤编果篮敞口内部的 12 个真实堆叠槽位（由底向顶三层，越接越满成小苹果山）
const BASKET_SLOTS: Array<{ left: number; top: number; rot: number; z: number; scale: number }> = [
  // 第 1 层：稳稳落在篮心与篮底内壁
  { left: 50, top: 27, rot: -5, z: 12, scale: 1.0 },
  { left: 33, top: 26, rot: -14, z: 12, scale: 0.98 },
  { left: 67, top: 26, rot: 14, z: 12, scale: 0.98 },
  { left: 22, top: 21, rot: -20, z: 11, scale: 0.92 },
  { left: 78, top: 21, rot: 20, z: 11, scale: 0.92 },
  // 第 2 层：齐平篮口，错落堆叠
  { left: 41, top: 15, rot: -9, z: 15, scale: 1.02 },
  { left: 59, top: 15, rot: 9, z: 15, scale: 1.02 },
  { left: 28, top: 13, rot: -16, z: 14, scale: 0.96 },
  { left: 72, top: 13, rot: 16, z: 14, scale: 0.96 },
  // 第 3 层：丰收冒尖小山
  { left: 50, top: 4, rot: 3, z: 18, scale: 1.04 },
  { left: 37, top: 6, rot: -11, z: 17, scale: 0.98 },
  { left: 63, top: 6, rot: 11, z: 17, scale: 0.98 }
];

export const AppleCatchGame: React.FC<AppleCatchGameProps> = ({
  difficulty,
  language,
  paused = false,
  onFinish,
  onImeWarning
}) => {
  const cfg = DIFFICULTY_CFG[difficulty] ?? DIFFICULTY_CFG.easy;
  const isEndless = difficulty === 'endless';

  const [apples, setApples] = useState<FallingApple[]>([]);
  const [lockedId, setLockedId] = useState<number | null>(null);
  const [basketX, setBasketX] = useState<number>(50);
  const [basketTilt, setBasketTilt] = useState<number>(0);
  const [basketBounce, setBasketBounce] = useState<boolean>(false);
  const [hearts, setHearts] = useState<number>(MAX_HEARTS);
  const [score, setScore] = useState<number>(0);
  const [caught, setCaught] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [energy, setEnergy] = useState<number>(0);
  const [countdown, setCountdown] = useState<number | 'GO' | null>(3);
  const [harvestFlash, setHarvestFlash] = useState<boolean>(false);
  const [shakeBoard, setShakeBoard] = useState<boolean>(false);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [basketApples, setBasketApples] = useState<AppleVariant[]>([]);

  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const poolRef = useRef<ArcadePrompt[]>(getArcadePool('apple-catch', difficulty));
  const applesRef = useRef<FallingApple[]>([]);
  const flyingRef = useRef<FlyingApple[]>([]);
  const particlesRef = useRef<OrchardParticle[]>([]);
  const ringsRef = useRef<ShockRing[]>([]);
  const leavesRef = useRef<AmbientLeaf[]>([]);
  const spriteImgRef = useRef<Partial<Record<AppleVariant, HTMLImageElement>>>({});

  const lockedIdRef = useRef<number | null>(null);
  const basketXRef = useRef<number>(50);
  const heartsRef = useRef<number>(MAX_HEARTS);
  const scoreRef = useRef<number>(0);
  const caughtRef = useRef<number>(0);
  const comboRef = useRef<number>(0);
  const maxComboRef = useRef<number>(0);
  const energyRef = useRef<number>(0);
  const totalKeysRef = useRef<number>(0);
  const correctKeysRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());
  const pausedAtRef = useRef<number | null>(null);
  const pausedTotalMsRef = useRef<number>(0);
  const finishedRef = useRef<boolean>(false);
  const readyRef = useRef<boolean>(false);
  const nextIdRef = useRef<number>(1);
  const spawnTimerRef = useRef<number>(0);
  const pausedRef = useRef<boolean>(paused);
  const bounceTimerRef = useRef<number | null>(null);

  // 预加载三张苹果精灵图供 Canvas 飞果弧线绘制
  useEffect(() => {
    (Object.keys(SPRITE_SRCS) as AppleVariant[]).forEach((key) => {
      const img = new Image();
      img.src = SPRITE_SRCS[key];
      spriteImgRef.current[key] = img;
    });
  }, []);

  // 同步暂停状态，精准累计暂停耗时以保证 WPM 不受暂停影响
  useEffect(() => {
    pausedRef.current = paused;
    if (paused) {
      if (pausedAtRef.current === null) {
        pausedAtRef.current = Date.now();
      }
    } else if (pausedAtRef.current !== null) {
      pausedTotalMsRef.current += Date.now() - pausedAtRef.current;
      pausedAtRef.current = null;
    }
  }, [paused]);

  const addFloatingText = (x: number, y: number, text: string, color: string, big = false) => {
    const id = nextIdRef.current++;
    setFloatingTexts((prev) => [...prev.slice(-8), { id, x, y, text, color, big }]);
    window.setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((item) => item.id !== id));
    }, 880);
  };

  const triggerBasketBounce = () => {
    setBasketBounce(false);
    requestAnimationFrame(() => {
      setBasketBounce(true);
    });
    if (bounceTimerRef.current) window.clearTimeout(bounceTimerRef.current);
    bounceTimerRef.current = window.setTimeout(() => setBasketBounce(false), 280);
  };

  const spawnBurstParticles = (xPct: number, yPct: number, variant: AppleVariant, count = 16) => {
    const el = stageRef.current;
    if (!el) return;
    const w = el.clientWidth;
    const h = el.clientHeight;
    const px = (xPct / 100) * w;
    const py = (yPct / 100) * h;

    const palette =
      variant === 'gold'
        ? ['#FDE047', '#F59E0B', '#FEF08A', '#FFFFFF']
        : variant === 'heart'
          ? ['#FDA4AF', '#FB7185', '#FFE4E6', '#F43F5E']
          : ['#FB7185', '#EF4444', '#FDE047', '#86EFAC'];

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const speed = 75 + Math.random() * 175;
      particlesRef.current.push({
        x: px,
        y: py,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 65,
        size: variant === 'gold' ? 5 + Math.random() * 5 : 4 + Math.random() * 4.5,
        color: palette[i % palette.length],
        alpha: 1,
        life: 0,
        maxLife: 0.48 + Math.random() * 0.28,
        shape: variant === 'gold' || i % 3 === 0 ? 'star' : 'dot',
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 8
      });
    }

    ringsRef.current.push({
      x: px,
      y: py,
      r: 12,
      maxR: variant === 'gold' ? 76 : 58,
      color: variant === 'gold' ? '#F59E0B' : variant === 'heart' ? '#F43F5E' : '#22C55E',
      alpha: 0.72
    });
  };

  const spawnSplatParticles = (xPct: number) => {
    const el = stageRef.current;
    if (!el) return;
    const px = (xPct / 100) * el.clientWidth;
    const py = 0.87 * el.clientHeight;
    for (let i = 0; i < 12; i++) {
      const angle = -Math.PI * Math.random();
      const speed = 55 + Math.random() * 110;
      particlesRef.current.push({
        x: px,
        y: py,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 20,
        size: 3.5 + Math.random() * 3.5,
        color: i % 3 === 0 ? '#86EFAC' : '#F43F5E',
        alpha: 0.9,
        life: 0,
        maxLife: 0.42 + Math.random() * 0.2,
        shape: 'dot',
        rot: 0,
        vRot: 0
      });
    }
  };

  const finishGame = (won: boolean) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const nowPausedExtra = pausedAtRef.current ? Date.now() - pausedAtRef.current : 0;
    const activeMs = Math.max(
      1000,
      Date.now() - startTimeRef.current - pausedTotalMsRef.current - nowPausedExtra
    );
    const elapsedSec = Math.max(1, Math.round(activeMs / 1000));
    const accuracy =
      totalKeysRef.current > 0
        ? Math.round((correctKeysRef.current / totalKeysRef.current) * 100)
        : 100;
    const wpm = Math.round((correctKeysRef.current / 5) / (activeMs / 60000));
    const effectiveWon = isEndless ? caughtRef.current >= 12 : won;
    const stars = isEndless
      ? caughtRef.current >= 45
        ? 3
        : caughtRef.current >= 25
          ? 2
          : caughtRef.current >= 12
            ? 1
            : 0
      : won
        ? heartsRef.current === MAX_HEARTS && accuracy >= 90
          ? 3
          : heartsRef.current >= 2
            ? 2
            : 1
        : caughtRef.current >= Math.floor(cfg.target * 0.45)
          ? 1
          : 0;

    playSound(effectiveWon ? 'win' : 'error');
    onFinish({
      score: scoreRef.current,
      accuracy,
      wpm,
      maxCombo: maxComboRef.current,
      stars,
      cleared: caughtRef.current,
      timeSpent: elapsedSec,
      won: effectiveWon
    });
  };

  const launchAppleIntoBasket = (apple: FallingApple, pts: number, healed: boolean) => {
    const el = stageRef.current;
    if (!el) return;
    const w = el.clientWidth;
    const h = el.clientHeight;
    const sx = (apple.x / 100) * w;
    const sy = (apple.y / 100) * h;
    const tx = (basketXRef.current / 100) * w;
    const ty = (BASKET_Y_PCT / 100) * h;

    flyingRef.current.push({
      startX: sx,
      startY: sy,
      ctrlX: (sx + tx) / 2,
      ctrlY: Math.min(sy, ty) - 85,
      targetX: tx,
      targetY: ty,
      progress: 0,
      duration: 0.28,
      variant: apple.variant,
      pts,
      healed
    });
  };

  // 释放满能「丰收时刻」：一键把场上所有苹果吸入果篮
  const triggerHarvestBurst = () => {
    if (finishedRef.current || pausedRef.current || !readyRef.current) return;
    if (energyRef.current < 100) return;

    energyRef.current = 0;
    setEnergy(0);
    playHarvestBurst();
    setHarvestFlash(true);
    window.setTimeout(() => setHarvestFlash(false), 450);

    const el = stageRef.current;
    if (el) {
      ringsRef.current.push({
        x: (basketXRef.current / 100) * el.clientWidth,
        y: (BASKET_Y_PCT / 100) * el.clientHeight,
        r: 20,
        maxR: Math.max(el.clientWidth, el.clientHeight) * 0.65,
        color: '#F59E0B',
        alpha: 0.65
      });
    }

    const currentApples = [...applesRef.current];
    if (currentApples.length === 0) {
      addFloatingText(
        50,
        42,
        language === 'cn' ? '✨ 丰收微风!' : '✨ HARVEST BREEZE!',
        'text-amber-500',
        true
      );
      return;
    }

    applesRef.current = [];
    lockedIdRef.current = null;
    setLockedId(null);
    setApples([]);

    let bonusTotal = 0;
    for (const apple of currentApples) {
      const newCombo = comboRef.current + 1;
      comboRef.current = newCombo;
      maxComboRef.current = Math.max(maxComboRef.current, newCombo);
      const pts = (apple.variant === 'gold' ? 30 : 15) + Math.min(20, newCombo * 2);
      bonusTotal += pts;
      scoreRef.current += pts;
      caughtRef.current += 1;

      let healed = false;
      if (apple.variant === 'heart' && heartsRef.current < MAX_HEARTS) {
        heartsRef.current += 1;
        setHearts(heartsRef.current);
        healed = true;
      }
      launchAppleIntoBasket(apple, pts, healed);
    }

    setCombo(comboRef.current);
    setScore(scoreRef.current);
    setCaught(caughtRef.current);
    addFloatingText(
      50,
      38,
      language === 'cn' ? `🌟 丰收大满贯 +${bonusTotal}` : `🌟 HARVEST +${bonusTotal}`,
      'text-amber-500',
      true
    );

    if (!isEndless && caughtRef.current >= cfg.target) {
      window.setTimeout(() => finishGame(true), 320);
    }
  };

  // 开局 3-2-1-GO 倒计时
  useEffect(() => {
    let step = 3;
    setCountdown(3);
    playCountdownTick(false);
    const timer = window.setInterval(() => {
      if (pausedRef.current) return;
      step -= 1;
      if (step > 0) {
        setCountdown(step);
        playCountdownTick(false);
      } else if (step === 0) {
        setCountdown('GO');
        playCountdownTick(true);
        readyRef.current = true;
        startTimeRef.current = Date.now();
        pausedTotalMsRef.current = 0;
      } else {
        setCountdown(null);
        window.clearInterval(timer);
      }
    }, 620);

    return () => window.clearInterval(timer);
  }, []);

  // 主游戏循环 + 60fps HiDPI Canvas 渲染
  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let viewW = stage.clientWidth;
    let viewH = stage.clientHeight;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      viewW = stage.clientWidth;
      viewH = stage.clientHeight;
      canvas.width = Math.max(1, Math.floor(viewW * dpr));
      canvas.height = Math.max(1, Math.floor(viewH * dpr));
      canvas.style.width = `${viewW}px`;
      canvas.style.height = `${viewH}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(stage);

    // 初始化 14 片微风飘舞的小树叶
    const leafColors = ['#86EFAC', '#4ADE80', '#BEF264', '#FDE047'];
    leavesRef.current = Array.from({ length: 14 }, () => ({
      x: Math.random() * viewW,
      y: Math.random() * viewH,
      vx: 10 + Math.random() * 14,
      vy: 14 + Math.random() * 18,
      size: 5 + Math.random() * 4.5,
      rot: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 1.6,
      swayPhase: Math.random() * Math.PI * 2,
      color: leafColors[Math.floor(Math.random() * leafColors.length)]
    }));

    const spawnApple = () => {
      const curLevel = Math.floor(caughtRef.current / 10) + 1;
      const dynamicMax = isEndless
        ? Math.min(cfg.maxOnScreen, 3 + Math.floor(curLevel / 2))
        : cfg.maxOnScreen;
      if (applesRef.current.length >= dynamicMax) return;
      const usedFirst = new Set<string>(applesRef.current.map((a) => a.prompt.text[0]));
      const prompt = pickNonConflictingPrompt(poolRef.current, usedFirst);

      // 决定果实类型：掉血且场上无爱心苹果时概率出爱心苹果；否则约 20%~30% 金苹果
      const hasHeartOnScreen = applesRef.current.some((a) => a.variant === 'heart');
      const isFinalRush = isEndless ? curLevel >= 3 : caughtRef.current >= cfg.target - 6;
      let variant: AppleVariant = 'red';
      if (heartsRef.current < MAX_HEARTS && !hasHeartOnScreen && Math.random() < 0.2) {
        variant = 'heart';
      } else if (Math.random() < (isFinalRush ? 0.28 : 0.2)) {
        variant = 'gold';
      }

      const speedBoost = isEndless
        ? Math.min(7.5, (curLevel - 1) * 1.1)
        : Math.min(1, caughtRef.current / cfg.target) * (difficulty === 'expert' ? 4.8 : 3.6);

      // 横向错开已有苹果，避免词签重叠
      let x = 13 + Math.random() * 74;
      for (let tries = 0; tries < 8; tries++) {
        const candidate = 13 + Math.random() * 74;
        if (applesRef.current.every((a) => Math.abs(a.x - candidate) > 17 || a.y > 32)) {
          x = candidate;
          break;
        }
      }

      const apple: FallingApple = {
        id: nextIdRef.current++,
        prompt,
        typed: 0,
        x,
        y: 11,
        speed: cfg.baseSpeed + speedBoost + (variant === 'gold' ? 2.1 : 0),
        variant,
        swayPhase: Math.random() * Math.PI * 2,
        swayAmp: difficulty === 'expert' ? 9 : 6.5,
        wobbleUntil: 0
      };

      applesRef.current = [...applesRef.current, apple];
      setApples(applesRef.current);
    };

    let rafId = 0;
    let lastTs = performance.now();
    let initialSpawned = false;

    const drawStar = (cx: number, cy: number, r: number, rot: number, color: string, alpha: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2;
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        ctx.lineTo(Math.cos(a + Math.PI / 4) * (r * 0.38), Math.sin(a + Math.PI / 4) * (r * 0.38));
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const loop = (now: number) => {
      if (finishedRef.current) return;
      const dt = Math.min(0.05, (now - lastTs) / 1000);
      lastTs = now;

      if (!pausedRef.current) {
        // 1. 更新飘叶氛围
        for (const lf of leavesRef.current) {
          lf.swayPhase += dt * 1.8;
          lf.x += (lf.vx + Math.sin(lf.swayPhase) * 14) * dt;
          lf.y += lf.vy * dt;
          lf.rot += lf.vRot * dt;
          if (lf.y > viewH + 16) {
            lf.y = -12;
            lf.x = Math.random() * viewW;
          }
          if (lf.x > viewW + 16) lf.x = -12;
        }

        // 2. 游戏正式开始后刷果与下落
        if (readyRef.current) {
          if (!initialSpawned) {
            initialSpawned = true;
            spawnApple();
          }

          spawnTimerRef.current += dt;
          const currentInterval = Math.max(
            cfg.minSpawnInterval,
            cfg.spawnInterval - caughtRef.current * 0.025
          );
          if (spawnTimerRef.current >= currentInterval) {
            spawnTimerRef.current = 0;
            spawnApple();
          }

          let missedCount = 0;
          const survivors: FallingApple[] = [];
          for (const a of applesRef.current) {
            const nextY = a.y + a.speed * dt;
            if (nextY >= 85) {
              missedCount++;
              spawnSplatParticles(a.x);
              if (lockedIdRef.current === a.id) {
                lockedIdRef.current = null;
                setLockedId(null);
              }
              addFloatingText(
                a.x,
                82,
                language === 'cn' ? '漏掉啦!' : 'Missed!',
                'text-rose-600'
              );
            } else {
              survivors.push({ ...a, y: nextY });
            }
          }

          if (missedCount > 0) {
            comboRef.current = 0;
            setCombo(0);
            heartsRef.current = Math.max(0, heartsRef.current - missedCount);
            setHearts(heartsRef.current);
            playAppleSplat();
            setShakeBoard(true);
            window.setTimeout(() => setShakeBoard(false), 260);
            if (heartsRef.current <= 0) {
              applesRef.current = survivors;
              setApples(survivors);
              finishGame(false);
              return;
            }
          }

          applesRef.current = survivors;
          setApples(survivors);
        }

        // 3. 更新抛物线飞进果篮的苹果
        const nextFlying: FlyingApple[] = [];
        for (const fl of flyingRef.current) {
          fl.progress += dt / fl.duration;
          if (fl.progress >= 1) {
            triggerBasketBounce();
            // 苹果真正落进果篮的那一刻，按实际类型真实堆入篮中
            setBasketApples((prev) => {
              if (prev.length < BASKET_SLOTS.length) {
                return [...prev, fl.variant];
              }
              // 篮子已满 12 颗后，若接到金/爱心苹果则点缀到顶层
              if (fl.variant !== 'red') {
                const next = [...prev];
                const replaceIdx = next.findIndex((v, i) => i >= 5 && v === 'red');
                next[replaceIdx !== -1 ? replaceIdx : next.length - 1] = fl.variant;
                return next;
              }
              return prev;
            });
            spawnBurstParticles(
              (fl.targetX / Math.max(1, viewW)) * 100,
              (fl.targetY / Math.max(1, viewH)) * 100 - 3,
              fl.variant,
              fl.variant === 'gold' ? 22 : 14
            );
          } else {
            nextFlying.push(fl);
          }
        }
        flyingRef.current = nextFlying;

        // 4. 更新爆炸粒子
        const nextParticles: OrchardParticle[] = [];
        for (const p of particlesRef.current) {
          p.life += dt;
          if (p.life < p.maxLife) {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += 320 * dt; // 柔和重力
            p.rot += p.vRot * dt;
            p.alpha = Math.max(0, 1 - p.life / p.maxLife);
            nextParticles.push(p);
          }
        }
        particlesRef.current = nextParticles;

        // 5. 更新光环波纹
        const nextRings: ShockRing[] = [];
        for (const r of ringsRef.current) {
          r.r += (r.maxR - r.r) * Math.min(1, dt * 8.5);
          r.alpha -= dt * 1.9;
          if (r.alpha > 0.02) nextRings.push(r);
        }
        ringsRef.current = nextRings;
      }

      // === Canvas 绘制 ===
      ctx.clearRect(0, 0, viewW, viewH);

      // A. 微风飘叶（淡雅不抢戏）
      for (const lf of leavesRef.current) {
        ctx.save();
        ctx.translate(lf.x, lf.y);
        ctx.rotate(lf.rot);
        ctx.globalAlpha = 0.42;
        ctx.fillStyle = lf.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, lf.size, lf.size * 0.52, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // B. 光环波纹
      for (const r of ringsRef.current) {
        ctx.save();
        ctx.globalAlpha = r.alpha;
        ctx.strokeStyle = r.color;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // C. 抛物线飞进果篮的苹果（带光轨）
      for (const fl of flyingRef.current) {
        const t = fl.progress;
        const inv = 1 - t;
        const x = inv * inv * fl.startX + 2 * inv * t * fl.ctrlX + t * t * fl.targetX;
        const y = inv * inv * fl.startY + 2 * inv * t * fl.ctrlY + t * t * fl.targetY;

        // 柔金尾迹
        ctx.save();
        ctx.globalAlpha = 0.45 * (1 - t * 0.4);
        ctx.strokeStyle = fl.variant === 'gold' ? '#F59E0B' : fl.variant === 'heart' ? '#FB7185' : '#4ADE80';
        ctx.lineWidth = 6 * (1 - t * 0.5);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x, y);
        const pt = Math.max(0, t - 0.14);
        const pinv = 1 - pt;
        const px = pinv * pinv * fl.startX + 2 * pinv * pt * fl.ctrlX + pt * pt * fl.targetX;
        const py = pinv * pinv * fl.startY + 2 * pinv * pt * fl.ctrlY + pt * pt * fl.targetY;
        ctx.lineTo(px, py);
        ctx.stroke();
        ctx.restore();

        const img = spriteImgRef.current[fl.variant];
        const drawSize = 54 * (1 - t * 0.35);
        if (img && img.complete) {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(t * Math.PI * 1.2);
          ctx.drawImage(img, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
          ctx.restore();
        }
      }

      // D. 爆炸粒子
      for (const p of particlesRef.current) {
        if (p.shape === 'star') {
          drawStar(p.x, p.y, p.size, p.rot, p.color, p.alpha);
        } else {
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, [difficulty, language, cfg]);

  // 键盘输入监听
  useEffect(() => {
    const onComposition = () => onImeWarning(true);
    const onKeyDown = (e: KeyboardEvent) => {
      if (finishedRef.current || pausedRef.current || !readyRef.current) return;
      if (e.isComposing || e.key === 'Process' || e.keyCode === 229) {
        onImeWarning(true);
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      // 空格触发满能「丰收时刻」
      if (e.code === 'Space' || e.key === ' ') {
        if (energyRef.current >= 100) {
          e.preventDefault();
          triggerHarvestBurst();
        }
        return;
      }

      // Tab / Backspace 取消当前锁定目标
      if (e.key === 'Tab' || e.key === 'Backspace') {
        if (lockedIdRef.current !== null) {
          e.preventDefault();
          lockedIdRef.current = null;
          setLockedId(null);
        }
        return;
      }

      if (e.key.length !== 1 || !/^[a-zA-Z]$/.test(e.key)) return;

      e.preventDefault();
      onImeWarning(false);
      const ch = e.key.toLowerCase();
      totalKeysRef.current++;

      let target: FallingApple | undefined;
      if (lockedIdRef.current !== null) {
        target = applesRef.current.find((a) => a.id === lockedIdRef.current);
      }

      if (!target) {
        // 优先锁定最靠下且首字母匹配的苹果
        const matching = applesRef.current
          .filter((a) => a.prompt.text[a.typed] === ch)
          .sort((a, b) => b.y - a.y);
        target = matching[0];
        if (target) {
          lockedIdRef.current = target.id;
          setLockedId(target.id);
        }
      }

      if (target && target.prompt.text[target.typed] === ch) {
        correctKeysRef.current++;

        // 果篮平滑奔向目标苹果位置并附带轻度倾斜
        const deltaX = target.x - basketXRef.current;
        basketXRef.current = target.x;
        setBasketX(target.x);
        setBasketTilt(Math.max(-10, Math.min(10, deltaX * 0.28)));
        window.setTimeout(() => setBasketTilt(0), 220);

        const nextTyped = target.typed + 1;

        if (nextTyped >= target.prompt.text.length) {
          // 完整敲完一颗苹果 -> 飞入果篮！
          const newCombo = comboRef.current + 1;
          comboRef.current = newCombo;
          maxComboRef.current = Math.max(maxComboRef.current, newCombo);
          setCombo(newCombo);

          playAppleCatch(newCombo, target.variant);

          const basePts = target.variant === 'gold' ? 25 : target.variant === 'heart' ? 15 : 10;
          const pts = basePts + Math.min(20, newCombo * 2);
          scoreRef.current += pts;
          setScore(scoreRef.current);

          const prevLevel = Math.floor(caughtRef.current / 10) + 1;
          caughtRef.current += 1;
          setCaught(caughtRef.current);
          const nextLevel = Math.floor(caughtRef.current / 10) + 1;
          if (isEndless && nextLevel > prevLevel) {
            playWaveClear();
            addFloatingText(
              50,
              32,
              language === 'cn' ? `⬆️ Lv.${nextLevel} 丰收加速!` : `⬆️ LEVEL ${nextLevel}!`,
              'text-amber-500',
              true
            );
          }

          // 回复爱心
          let healed = false;
          if (target.variant === 'heart' && heartsRef.current < MAX_HEARTS) {
            heartsRef.current += 1;
            setHearts(heartsRef.current);
            healed = true;
          }

          // 丰收能量条充能
          const gain = target.variant === 'gold' ? cfg.chargeGold : cfg.chargeNormal;
          energyRef.current = Math.min(100, energyRef.current + gain);
          setEnergy(energyRef.current);

          // 发射飞果弧线与飘字
          launchAppleIntoBasket(target, pts, healed);
          addFloatingText(
            target.x,
            target.y,
            healed
              ? `❤️ +1  +${pts}`
              : target.variant === 'gold'
                ? `✨ +${pts}`
                : `+${pts}`,
            healed
              ? 'text-rose-500'
              : target.variant === 'gold'
                ? 'text-amber-500'
                : 'text-emerald-700',
            target.variant !== 'red'
          );

          applesRef.current = applesRef.current.filter((a) => a.id !== target!.id);
          lockedIdRef.current = null;
          setLockedId(null);
          setApples(applesRef.current);

          if (caughtRef.current >= cfg.target) {
            window.setTimeout(() => finishGame(true), 320);
          }
        } else {
          playSound('click');
          applesRef.current = applesRef.current.map((a) =>
            a.id === target!.id ? { ...a, typed: nextTyped } : a
          );
          setApples(applesRef.current);
        }
      } else {
        playSound('error');
        comboRef.current = 0;
        setCombo(0);
        // 未满能时按错小扣 4% 能量，满能后锁定不扣
        if (energyRef.current < 100 && energyRef.current > 0) {
          energyRef.current = Math.max(0, energyRef.current - 4);
          setEnergy(energyRef.current);
        }
        // 让当前锁定苹果轻微左右晃动提示敲错
        if (lockedIdRef.current !== null) {
          const until = Date.now() + 260;
          applesRef.current = applesRef.current.map((a) =>
            a.id === lockedIdRef.current ? { ...a, wobbleUntil: until } : a
          );
          setApples(applesRef.current);
        }
      }
    };

    window.addEventListener('compositionstart', onComposition);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('compositionstart', onComposition);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onImeWarning, cfg, language]);

  const isHarvestReady = energy >= 100;
  const endlessLevel = Math.floor(caught / 10) + 1;
  const nowTs = Date.now();

  return (
    <div
      ref={stageRef}
      className={`relative w-full h-[520px] sm:h-[560px] rounded-3xl overflow-hidden select-none shadow-xl border-4 border-white/90 ${
        shakeBoard ? 'animate-shake' : ''
      }`}
    >
      {/* 定制 AI 绘本果园全景背景 */}
      <img
        src="/images/arcade/apple/bg_orchard.webp"
        alt=""
        draggable={false}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />

      {/* 丰收时刻全屏暖金光晕闪屏 */}
      {harvestFlash && (
        <div
          className="absolute inset-0 z-30 pointer-events-none transition-opacity duration-300"
          style={{
            background:
              'radial-gradient(circle at 50% 75%, rgba(253, 224, 71, 0.55), rgba(245, 158, 11, 0.12) 70%, transparent)'
          }}
        />
      )}

      {/* 60fps HiDPI Canvas 特效层（微风落叶、飞果弧线、粒子、波纹） */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-20 pointer-events-none"
      />

      {/* 顶部清爽果园 HUD */}
      <div className="absolute top-3 left-3.5 right-3.5 z-30 flex items-center justify-between gap-2">
        {/* 左侧：生命爱心 + 进度 */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white/92 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md border border-amber-100">
            {Array.from({ length: MAX_HEARTS }).map((_, i) => (
              <Heart
                key={i}
                size={19}
                className={
                  i < hearts
                    ? 'fill-rose-500 text-rose-500 transition-transform duration-200 scale-100 drop-shadow-sm'
                    : 'text-stone-300 scale-90 transition-transform duration-200'
                }
              />
            ))}
          </div>

          <div className="bg-white/92 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-md border border-emerald-100 text-xs sm:text-sm font-black text-emerald-800 tabular-nums flex items-center gap-1.5">
            <img
              src="/images/arcade/apple/apple_red.webp"
              alt=""
              className="w-4 h-4 object-contain"
            />
            <span>
              {isEndless ? `∞ ${caught} · Lv.${endlessLevel}` : `${caught} / ${cfg.target}`}
            </span>
          </div>
        </div>

        {/* 中央：丰收时刻能量条（满能可点击或按空格一键收果） */}
        <button
          type="button"
          onClick={triggerHarvestBurst}
          disabled={!isHarvestReady}
          className={`hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border backdrop-blur-md transition-all ${
            isHarvestReady
              ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 border-yellow-100 text-amber-950 shadow-lg shadow-amber-400/40 scale-105 cursor-pointer animate-pulse'
              : 'bg-white/88 border-amber-100/90 text-stone-600 shadow-sm cursor-default'
          }`}
        >
          <Sparkles
            size={15}
            className={isHarvestReady ? 'text-amber-900 fill-amber-900' : 'text-amber-500'}
          />
          <div className="w-24 sm:w-28 h-2.5 rounded-full bg-stone-200/90 overflow-hidden shadow-inner">
            <div
              className="h-full rounded-full transition-all duration-200"
              style={{
                width: `${energy}%`,
                background: isHarvestReady
                  ? 'linear-gradient(90deg, #FFFFFF, #FEF08A)'
                  : 'linear-gradient(90deg, #4ADE80, #FACC15, #F59E0B)'
              }}
            />
          </div>
          <span className="text-xs font-black tracking-tight whitespace-nowrap">
            {isHarvestReady
              ? language === 'cn'
                ? '按空格丰收!'
                : 'SPACE HARVEST!'
              : `${energy}%`}
          </span>
        </button>

        {/* 右侧：连击 + 得分 */}
        <div className="flex items-center gap-2">
          {combo >= 2 && (
            <div className="bg-gradient-to-r from-amber-400 to-orange-400 text-amber-950 px-3 py-1.5 rounded-full shadow-md text-xs sm:text-sm font-black flex items-center gap-1 animate-pop border border-yellow-200">
              <Flame size={14} className="fill-orange-700 text-orange-700" />
              {combo}x
            </div>
          )}
          <div className="bg-white/92 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-md border border-rose-100 text-xs sm:text-sm font-black text-rose-600 tabular-nums">
            {score} {language === 'cn' ? '分' : 'pts'}
          </div>
        </div>
      </div>

      {/* 下落中的绘本苹果 + 护眼大字词签 */}
      {apples.map((apple) => {
        const isLocked = apple.id === lockedId;
        const done = apple.prompt.text.slice(0, apple.typed);
        const rest = apple.prompt.text.slice(apple.typed);
        const swayX = Math.sin(apple.y * 0.11 + apple.swayPhase) * apple.swayAmp;
        const swayRot = Math.cos(apple.y * 0.11 + apple.swayPhase) * 6;
        const isSingleChar = apple.prompt.text.length === 1 && !apple.prompt.display;
        const isWobbling = apple.wobbleUntil > nowTs;

        return (
          <div
            key={apple.id}
            className={`absolute z-10 flex flex-col items-center pointer-events-none ${
              isWobbling ? 'animate-shake' : ''
            }`}
            style={{
              left: `${apple.x}%`,
              top: `${apple.y}%`,
              transform: `translate(calc(-50% + ${swayX}px), -50%) scale(${isLocked ? 1.1 : 1})`,
              transition: 'transform 110ms ease-out'
            }}
          >
            {/* 苹果精灵主体 */}
            <div className="relative flex items-center justify-center">
              {/* 金苹果 / 爱心苹果 / 锁定状态 柔光背环 */}
              {(apple.variant !== 'red' || isLocked) && (
                <div
                  className={`absolute -inset-2 rounded-full blur-md pointer-events-none ${
                    isLocked
                      ? 'bg-amber-300/75'
                      : apple.variant === 'gold'
                        ? 'bg-yellow-300/65'
                        : 'bg-rose-300/65'
                  }`}
                />
              )}
              <img
                src={SPRITE_SRCS[apple.variant]}
                alt=""
                draggable={false}
                className="relative w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-[0_6px_8px_rgba(68,38,16,0.28)]"
                style={{ transform: `rotate(${swayRot}deg)` }}
              />
              {apple.variant === 'gold' && (
                <span className="absolute -top-1.5 -right-2 px-1.5 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black shadow border border-yellow-100">
                  2x
                </span>
              )}
              {apple.variant === 'heart' && (
                <span className="absolute -top-1.5 -right-2 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black shadow border border-rose-200">
                  +♥
                </span>
              )}
            </div>

            {/* 护眼高对比度大字词签 */}
            <div
              className={`-mt-2 relative flex flex-col items-center justify-center rounded-2xl border-2 shadow-[0_4px_12px_rgba(43,33,27,0.18)] backdrop-blur-sm transition-colors ${
                isLocked
                  ? 'bg-[#FFFDF7] border-amber-400 ring-4 ring-amber-300/55'
                  : apple.variant === 'gold'
                    ? 'bg-[#FFFBEB]/96 border-amber-300'
                    : 'bg-[#FFFDF9]/96 border-[#E6D5C3]'
              } ${isSingleChar ? 'min-w-[46px] px-3 py-0.5' : 'min-w-[72px] px-3.5 py-1'}`}
            >
              {apple.prompt.display && (
                <span className="text-[19px] sm:text-[21px] font-black text-[#2B211B] leading-tight">
                  {apple.prompt.display}
                </span>
              )}
              <span
                className={`font-mono font-black tracking-wider leading-tight ${
                  isSingleChar
                    ? 'text-[26px] sm:text-[28px]'
                    : apple.prompt.display
                      ? 'text-[17px] sm:text-[19px]'
                      : 'text-[21px] sm:text-[23px]'
                }`}
              >
                <span className="text-emerald-600">{done}</span>
                <span className="text-[#2B211B]">{rest}</span>
              </span>
            </div>
          </div>
        );
      })}

      {/* 飘字反馈 */}
      {floatingTexts.map((ef) => (
        <div
          key={ef.id}
          className={`absolute z-30 -translate-x-1/2 font-black pointer-events-none animate-bounce drop-shadow-[0_2px_4px_rgba(255,255,255,0.95)] whitespace-nowrap ${
            ef.big ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'
          } ${ef.color}`}
          style={{ left: `${ef.x}%`, top: `${ef.y}%` }}
        >
          {ef.text}
        </div>
      ))}

      {/* 底部藤编大果篮（平滑滑行 + Q 弹接果 + 篮内苹果堆叠） */}
      <div
        className="absolute z-20 pointer-events-none"
        style={{
          left: `${basketX}%`,
          top: `${BASKET_Y_PCT}%`,
          transform: `translate(-50%, -50%) rotate(${basketTilt}deg) scaleX(${
            basketBounce ? 1.14 : 1
          }) scaleY(${basketBounce ? 0.86 : 1})`,
          transition: 'left 210ms cubic-bezier(0.22, 1, 0.36, 1), transform 180ms cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      >
        {/* 篮底草地投影 */}
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-24 h-4 rounded-full bg-emerald-950/25 blur-sm" />

        {/* 藤编果篮精灵 */}
        <img
          src="/images/arcade/apple/basket_wicker.webp"
          alt="basket"
          draggable={false}
          className="relative z-10 w-28 sm:w-32 h-auto object-contain drop-shadow-[0_8px_12px_rgba(68,38,16,0.3)]"
        />

        {/* 篮内真实堆叠的收获苹果（在篮口图层上方按接到的真实品种层层堆高） */}
        {basketApples.length > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            {basketApples.map((variant, idx) => {
              const slot = BASKET_SLOTS[idx];
              if (!slot) return null;
              return (
                <img
                  key={`${idx}-${variant}`}
                  src={SPRITE_SRCS[variant]}
                  alt=""
                  draggable={false}
                  className="absolute w-7 h-7 sm:w-8 sm:h-8 object-contain drop-shadow-[0_3px_3px_rgba(68,38,16,0.45)] animate-pop"
                  style={{
                    left: `${slot.left}%`,
                    top: `${slot.top}%`,
                    zIndex: slot.z,
                    transform: `translate(-50%, -50%) rotate(${slot.rot}deg) scale(${slot.scale})`
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* 开局 3-2-1-GO 倒计时遮罩 */}
      {countdown !== null && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-amber-950/15 backdrop-blur-[2px] pointer-events-none">
          <div
            key={String(countdown)}
            className="px-8 py-4 rounded-3xl bg-white/95 border-4 border-amber-300 shadow-2xl animate-pop flex flex-col items-center"
          >
            <span
              className={`font-black tracking-tight ${
                countdown === 'GO'
                  ? 'text-5xl sm:text-6xl text-emerald-600'
                  : 'text-6xl sm:text-7xl text-amber-500'
              }`}
            >
              {countdown}
            </span>
            <span className="mt-1 text-xs sm:text-sm font-extrabold text-[#5C4A3E]">
              {language === 'cn' ? '准备接苹果！' : 'Get ready to catch!'}
            </span>
          </div>
        </div>
      )}

      {/* 底部轻提示 */}
      <div className="absolute bottom-2 left-4 right-4 z-20 flex items-center justify-between text-[11px] sm:text-xs font-extrabold text-emerald-950/80 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] pointer-events-none">
        <span>
          {language === 'cn'
            ? '直接敲击字母接苹果 · Tab 切换目标'
            : 'Type to catch apples · Tab to unlock'}
        </span>
        <span className="hidden sm:inline">
          {language === 'cn' ? 'Esc 暂停 · 满能量 Space 一键丰收' : 'Esc Pause · Space Harvest'}
        </span>
      </div>
    </div>
  );
};
