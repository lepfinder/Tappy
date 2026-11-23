import React, { useEffect, useRef, useState } from 'react';
import { Shield, Zap, Flame, Crosshair } from 'lucide-react';
import {
  ArcadeDifficulty,
  ArcadePrompt,
  ArcadeSessionSummary,
  getArcadePool,
  pickNonConflictingPrompt
} from '../../data/arcade_games';
import {
  playArcadeLaser,
  playCountdownTick,
  playExplosion,
  playShieldHit,
  playSound,
  playSuperNova,
  playWaveClear
} from '../../utils/sound';

interface SpaceEnemy {
  id: number;
  prompt: ArcadePrompt;
  typed: number;
  x: number; // 12% ~ 88%
  y: number; // -6% ~ 85%
  vx: number; // 横向微漂移 %/s
  speed: number; // 下落速度 %/s
  kind: 'ufo' | 'meteor' | 'boss';
  hp: number;
  maxHp: number;
  hitFlashUntil: number;
  rot: number;
  rotSpeed: number;
}

interface FloatingScore {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  big?: boolean;
}

// Canvas 粒子与特效数据结构（纯 ref 驱动，60fps 零 React 重渲染开销）
interface StarDot {
  x: number;
  y: number;
  r: number;
  speed: number;
  alpha: number;
  twinklePhase: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
}

interface LaserFX {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  life: number;
  maxLife: number;
}

interface RingFX {
  x: number;
  y: number;
  r: number;
  maxR: number;
  color: string;
  life: number;
  maxLife: number;
  lineWidth: number;
}

interface SpaceShooterGameProps {
  difficulty: ArcadeDifficulty;
  language: 'en' | 'cn';
  paused?: boolean;
  onFinish: (summary: ArcadeSessionSummary) => void;
  onImeWarning: (active: boolean) => void;
}

const MAX_SHIELDS = 3;

function getDifficultyTuning(difficulty: ArcadeDifficulty) {
  switch (difficulty) {
    case 'endless':
      return {
        waveQuotas: [7, 9, 1],
        bossHp: 3,
        maxConcurrent: [3, 5],
        baseSpeed: 6.8,
        spawnBase: 2.0,
        energyPerKill: 9,
        energyPerBossShield: 14
      };
    case 'expert':
      return {
        waveQuotas: [8, 12, 1],
        bossHp: 5,
        maxConcurrent: [4, 5],
        baseSpeed: 9.2,
        spawnBase: 1.7,
        energyPerKill: 8,
        energyPerBossShield: 12
      };
    case 'medium':
      return {
        waveQuotas: [7, 10, 1],
        bossHp: 4,
        maxConcurrent: [3, 4],
        baseSpeed: 7.8,
        spawnBase: 2.05,
        energyPerKill: 10,
        energyPerBossShield: 15
      };
    case 'hard':
      return {
        waveQuotas: [7, 9, 1],
        bossHp: 4,
        maxConcurrent: [3, 4],
        baseSpeed: 7.2,
        spawnBase: 2.15,
        energyPerKill: 10,
        energyPerBossShield: 15
      };
    default:
      return {
        waveQuotas: [6, 8, 1],
        bossHp: 3,
        maxConcurrent: [3, 4],
        baseSpeed: 6.4,
        spawnBase: 2.25,
        energyPerKill: 10,
        energyPerBossShield: 15
      };
  }
}

const SPRITE_MAP: Record<SpaceEnemy['kind'], string> = {
  ufo: '/images/arcade/space/enemy_ufo.webp',
  meteor: '/images/arcade/space/enemy_meteor.webp',
  boss: '/images/arcade/space/enemy_boss.webp'
};

export const SpaceShooterGame: React.FC<SpaceShooterGameProps> = ({
  difficulty,
  language,
  paused = false,
  onFinish,
  onImeWarning
}) => {
  const isEndless = difficulty === 'endless';
  const [phase, setPhase] = useState<'countdown' | 'playing'>('countdown');
  const [countdownNum, setCountdownNum] = useState<number>(3);
  const [wave, setWave] = useState<number>(1);
  const [waveBanner, setWaveBanner] = useState<string | null>(null);
  const [enemies, setEnemies] = useState<SpaceEnemy[]>([]);
  const [lockedId, setLockedId] = useState<number | null>(null);
  const [floatingScores, setFloatingScores] = useState<FloatingScore[]>([]);
  const [shields, setShields] = useState(MAX_SHIELDS);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [energy, setEnergy] = useState(0); // 0 ~ 100
  const [shipAngle, setShipAngle] = useState(0);
  const [shipRecoil, setShipRecoil] = useState(false);
  const [screenShake, setScreenShake] = useState(false);
  const [shieldDamageFlash, setShieldDamageFlash] = useState(false);
  const [clearedCount, setClearedCount] = useState(0);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const poolRef = useRef<ArcadePrompt[]>(getArcadePool('space-shooter', difficulty));
  const tuningRef = useRef(getDifficultyTuning(difficulty));
  const phaseRef = useRef<'countdown' | 'playing'>('countdown');
  const pausedRef = useRef(paused);
  const waveRef = useRef(1);
  const waveSpawnedRef = useRef(0);
  const waveClearedRef = useRef(0);
  const bossSpawnedRef = useRef(false);

  const enemiesRef = useRef<SpaceEnemy[]>([]);
  const lockedIdRef = useRef<number | null>(null);
  const shieldsRef = useRef(MAX_SHIELDS);
  const killsRef = useRef(0);
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const maxComboRef = useRef(0);
  const energyRef = useRef(0);
  const totalKeysRef = useRef(0);
  const correctKeysRef = useRef(0);
  const activePlaySecRef = useRef(0);
  const finishedRef = useRef(false);
  const nextIdRef = useRef(1);
  const spawnTimerRef = useRef(0);
  const shipAngleRef = useRef(0);

  // Canvas 特效池
  const starsRef = useRef<StarDot[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const lasersRef = useRef<LaserFX[]>([]);
  const ringsRef = useRef<RingFX[]>([]);
  const exhaustAccumRef = useRef(0);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const getStageSize = () => {
    const el = stageRef.current;
    return { width: el?.clientWidth || 900, height: el?.clientHeight || 540 };
  };

  const toCanvasXY = (pctX: number, pctY: number) => {
    const { width, height } = getStageSize();
    return { x: (pctX / 100) * width, y: (pctY / 100) * height };
  };

  const triggerShake = (duration = 200) => {
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), duration);
  };

  const addFloatingScore = (x: number, y: number, text: string, color: string, big = false) => {
    const id = nextIdRef.current++;
    setFloatingScores((prev) => [...prev.slice(-9), { id, x, y, text, color, big }]);
    setTimeout(() => {
      setFloatingScores((prev) => prev.filter((item) => item.id !== id));
    }, 850);
  };

  const emitSparks = (pctX: number, pctY: number, count: number, palette: string[], speedScale = 1) => {
    const { x, y } = toCanvasXY(pctX, pctY);
    for (let i = 0; i < count; i++) {
      const ang = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const spd = (70 + Math.random() * 190) * speedScale;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        size: 2.2 + Math.random() * 3.5,
        color: palette[Math.floor(Math.random() * palette.length)],
        life: 0,
        maxLife: 0.35 + Math.random() * 0.38
      });
    }
  };

  const emitRing = (pctX: number, pctY: number, maxR: number, color: string, lineWidth = 4) => {
    const { x, y } = toCanvasXY(pctX, pctY);
    ringsRef.current.push({ x, y, r: 10, maxR, color, life: 0, maxLife: 0.45, lineWidth });
  };

  const fireLaserBeam = (targetX: number, targetY: number, isOverdrive: boolean) => {
    const start = toCanvasXY(50, 84);
    const end = toCanvasXY(targetX, targetY);
    const dx = targetX - 50;
    const dy = 86 - targetY;
    const deg = Math.max(-48, Math.min(48, (Math.atan2(dx, dy) * 180) / Math.PI));
    shipAngleRef.current = deg;
    setShipAngle(deg);
    setShipRecoil(true);
    setTimeout(() => setShipRecoil(false), 90);

    lasersRef.current.push({
      x1: start.x,
      y1: start.y,
      x2: end.x,
      y2: end.y,
      color: isOverdrive ? '#F59E0B' : '#38BDF8',
      life: 0,
      maxLife: 0.14
    });

    // 击中火花
    emitSparks(
      targetX,
      targetY,
      6,
      isOverdrive ? ['#FDE047', '#FB923C', '#FFFFFF'] : ['#38BDF8', '#A5F3FC', '#FFFFFF'],
      0.7
    );
  };

  const announceWave = (waveNum: number) => {
    if (isEndless) {
      const isBossWave = waveNum % 3 === 0;
      const bossIndex = Math.floor(waveNum / 3);
      const banner = isBossWave
        ? language === 'cn'
          ? `∞ WAVE ${waveNum} · 母舰决战 BOSS #${bossIndex}!`
          : `∞ WAVE ${waveNum} · MOTHERSHIP BOSS #${bossIndex}!`
        : language === 'cn'
          ? `∞ WAVE ${waveNum} · 无限星域进阶`
          : `∞ WAVE ${waveNum} · ENDLESS SECTOR`;
      setWaveBanner(banner);
      setTimeout(() => setWaveBanner(null), 1700);
      return;
    }

    const titlesCn: Record<number, string> = {
      1: 'WAVE 1 · 星际巡航',
      2: 'WAVE 2 · 陨石风暴',
      3: 'WAVE 3 · 母舰决战 BOSS!'
    };
    const titlesEn: Record<number, string> = {
      1: 'WAVE 1 · STAR PATROL',
      2: 'WAVE 2 · METEOR STORM',
      3: 'WAVE 3 · MOTHERSHIP BOSS!'
    };
    setWaveBanner(language === 'cn' ? titlesCn[waveNum] : titlesEn[waveNum]);
    setTimeout(() => setWaveBanner(null), 1700);
  };

  const finishGame = (won: boolean) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    // 使用扣除暂停后的实际游玩时长，确保 WPM 精准公平
    const elapsedSec = Math.max(1, Math.round(activePlaySecRef.current));
    const accuracy =
      totalKeysRef.current > 0
        ? Math.round((correctKeysRef.current / totalKeysRef.current) * 100)
        : 100;
    const wpm = Math.round((correctKeysRef.current / 5) / (elapsedSec / 60));
    const effectiveWon = isEndless ? killsRef.current >= 10 : won;
    const stars = isEndless
      ? killsRef.current >= 40
        ? 3
        : killsRef.current >= 22
          ? 2
          : killsRef.current >= 10
            ? 1
            : 0
      : won
        ? shieldsRef.current === MAX_SHIELDS && accuracy >= 90
          ? 3
          : shieldsRef.current >= 2
            ? 2
            : 1
        : killsRef.current >= 6
          ? 1
          : 0;

    setTimeout(() => {
      playSound(effectiveWon ? 'win' : 'error');
      onFinish({
        score: scoreRef.current,
        accuracy,
        wpm,
        maxCombo: maxComboRef.current,
        stars,
        cleared: killsRef.current,
        timeSpent: elapsedSec,
        won: effectiveWon
      });
    }, effectiveWon ? 650 : 250);
  };

  // 开局 3 - 2 - 1 - GO! 倒计时（支持暂停冻结）
  useEffect(() => {
    let step = 3;
    setCountdownNum(3);
    playCountdownTick(false);

    const timer = setInterval(() => {
      if (pausedRef.current || finishedRef.current) return;
      step -= 1;
      if (step > 0) {
        setCountdownNum(step);
        playCountdownTick(false);
      } else if (step === 0) {
        setCountdownNum(0); // GO!
        playCountdownTick(true);
      } else {
        clearInterval(timer);
        phaseRef.current = 'playing';
        setPhase('playing');
        announceWave(1);
      }
    }, 700);

    return () => clearInterval(timer);
  }, []);

  // 主 60fps 引擎：视差星空 + 尾焰 + 激光/爆炸粒子 + 敌机波次推进
  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // 初始化 3 层视差星尘
      if (starsRef.current.length === 0) {
        const dots: StarDot[] = [];
        for (let i = 0; i < 65; i++) {
          const layer = i % 3;
          dots.push({
            x: Math.random() * w,
            y: Math.random() * h,
            r: layer === 0 ? 1.0 : layer === 1 ? 1.6 : 2.3,
            speed: layer === 0 ? 14 : layer === 1 ? 34 : 68,
            alpha: layer === 0 ? 0.35 : layer === 1 ? 0.6 : 0.9,
            twinklePhase: Math.random() * Math.PI * 2
          });
        }
        starsRef.current = dots;
      }
    };

    resizeCanvas();
    const ro = new ResizeObserver(resizeCanvas);
    ro.observe(stage);

    const spawnEnemy = () => {
      const curWave = waveRef.current;
      const tuning = tuningRef.current;
      const isBossWave = isEndless ? curWave % 3 === 0 : curWave === 3;
      const quota = isEndless
        ? Math.min(14, 6 + curWave)
        : tuning.waveQuotas[curWave - 1];

      // Boss 波：生成多护盾星际母舰 Boss（附带护航飞碟）
      if (isBossWave) {
        if (!bossSpawnedRef.current) {
          bossSpawnedRef.current = true;
          const usedFirst = new Set<string>(enemiesRef.current.map((e) => e.prompt.text[0]));
          const bossPrompt = pickNonConflictingPrompt(poolRef.current, usedFirst);
          const dynamicBossHp = isEndless
            ? Math.min(6, 3 + Math.floor(curWave / 3) - 1)
            : tuning.bossHp;
          const boss: SpaceEnemy = {
            id: nextIdRef.current++,
            prompt: bossPrompt,
            typed: 0,
            x: 50,
            y: -6,
            vx: difficulty === 'expert' || (isEndless && curWave >= 6) ? 6.5 : 4.5,
            speed: 14, // 先入场滑行至 y=23% 后悬停巡航
            kind: 'boss',
            hp: dynamicBossHp,
            maxHp: dynamicBossHp,
            hitFlashUntil: 0,
            rot: 0,
            rotSpeed: 0
          };
          enemiesRef.current = [...enemiesRef.current, boss];
          setEnemies(enemiesRef.current);
          return;
        }
        // Boss 战期间护航上限（极速或无尽高波最多 2 架）
        const escorts = enemiesRef.current.filter((e) => e.kind !== 'boss');
        const maxEscorts = difficulty === 'expert' || (isEndless && curWave >= 6) ? 2 : 1;
        if (escorts.length >= maxEscorts) return;
      } else {
        if (waveSpawnedRef.current >= quota) return;
        const maxConcurrent = isEndless
          ? Math.min(5, 3 + Math.floor((curWave - 1) / 2))
          : curWave === 1
            ? tuning.maxConcurrent[0]
            : tuning.maxConcurrent[1];
        if (enemiesRef.current.length >= maxConcurrent) return;
        waveSpawnedRef.current += 1;
      }

      const usedFirst = new Set<string>(enemiesRef.current.map((e) => e.prompt.text[0]));
      const prompt = pickNonConflictingPrompt(poolRef.current, usedFirst);
      const kind: SpaceEnemy['kind'] = Math.random() < 0.52 ? 'ufo' : 'meteor';

      let x = 14 + Math.random() * 72;
      if (isBossWave) {
        // Boss 战护航自动生成在母舰另一侧，绝不遮挡 Boss 单词铭牌
        const boss = enemiesRef.current.find((en) => en.kind === 'boss');
        x = boss && boss.x > 50 ? 15 + Math.random() * 18 : 67 + Math.random() * 18;
      } else {
        for (let t = 0; t < 6; t++) {
          const cand = 15 + Math.random() * 70;
          if (enemiesRef.current.every((en) => Math.abs(en.x - cand) > 23 || en.y > 34)) {
            x = cand;
            break;
          }
        }
      }

      const baseSpeed = isEndless
        ? tuning.baseSpeed + Math.min(5.2, (curWave - 1) * 0.65)
        : tuning.baseSpeed + (curWave - 1) * 1.15;

      const enemy: SpaceEnemy = {
        id: nextIdRef.current++,
        prompt,
        typed: 0,
        x,
        y: 6,
        vx: curWave >= 2 ? (Math.random() - 0.5) * 3.8 : 0,
        speed: baseSpeed + (kind === 'ufo' ? 0.8 : 0),
        kind,
        hp: 1,
        maxHp: 1,
        hitFlashUntil: 0,
        rot: 0,
        rotSpeed: kind === 'meteor' ? (Math.random() < 0.5 ? 28 : -28) : 0
      };
      enemiesRef.current = [...enemiesRef.current, enemy];
      setEnemies(enemiesRef.current);
    };

    let rafId = 0;
    let lastTs = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastTs) / 1000);
      lastTs = now;

      const ctx = canvas.getContext('2d');
      const w = stage.clientWidth;
      const h = stage.clientHeight;

      if (!pausedRef.current) {
        // 1. 更新星空视差
        for (const s of starsRef.current) {
          s.y += s.speed * dt;
          s.twinklePhase += dt * 3;
          if (s.y > h + 4) {
            s.y = -4;
            s.x = Math.random() * w;
          }
        }

        // 2. 战机双引擎推进尾焰粒子
        exhaustAccumRef.current += dt;
        if (exhaustAccumRef.current >= 0.032) {
          exhaustAccumRef.current = 0;
          const isOverdrive = comboRef.current >= 10;
          const baseX = w * 0.5;
          const baseY = h * 0.905;
          const rad = (shipAngleRef.current * Math.PI) / 180;
          [-10, 10].forEach((offset) => {
            particlesRef.current.push({
              x: baseX + offset * Math.cos(rad) + (Math.random() - 0.5) * 3,
              y: baseY + offset * Math.sin(rad),
              vx: -Math.sin(rad) * 45 + (Math.random() - 0.5) * 18,
              vy: Math.cos(rad) * (95 + Math.random() * 40),
              size: 3 + Math.random() * 2.6,
              color: isOverdrive
                ? Math.random() < 0.5
                  ? '#FDE047'
                  : '#F472B6'
                : Math.random() < 0.5
                  ? '#38BDF8'
                  : '#A5F3FC',
              life: 0,
              maxLife: 0.28 + Math.random() * 0.14
            });
          });
        }

        // 3. 更新粒子/激光/扩散环
        particlesRef.current = particlesRef.current.filter((p) => {
          p.life += dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vx *= 0.96;
          p.vy *= 0.96;
          return p.life < p.maxLife;
        });

        lasersRef.current = lasersRef.current.filter((l) => {
          l.life += dt;
          return l.life < l.maxLife;
        });

        ringsRef.current = ringsRef.current.filter((r) => {
          r.life += dt;
          const t = r.life / r.maxLife;
          r.r = 10 + (r.maxR - 10) * (1 - Math.pow(1 - t, 3));
          return r.life < r.maxLife;
        });

        // 4. 推进游戏敌机（仅 playing 且未结束）
        if (phaseRef.current === 'playing' && !finishedRef.current) {
          activePlaySecRef.current += dt;
          spawnTimerRef.current += dt;
          const spawnInterval =
            waveRef.current === 3
              ? difficulty === 'expert'
                ? 3.4
                : 4.6
              : Math.max(1.05, tuningRef.current.spawnBase - (waveRef.current - 1) * 0.35);

          if (enemiesRef.current.length === 0 || spawnTimerRef.current >= spawnInterval) {
            spawnTimerRef.current = 0;
            spawnEnemy();
          }

          let hitShip = 0;
          const survivors: SpaceEnemy[] = [];
          for (const en of enemiesRef.current) {
            let nextX = en.x + en.vx * dt;
            let nextVx = en.vx;
            if (nextX < 14 || nextX > 86) {
              nextVx = -nextVx;
              nextX = Math.max(14, Math.min(86, nextX));
            }

            let nextY = en.y;
            if (en.kind === 'boss') {
              // Boss 入场悬停在 y=24%，缓慢逼近但给足打字时间
              nextY = en.y < 23 ? Math.min(23, en.y + en.speed * dt) : en.y + 1.15 * dt;
            } else {
              nextY = en.y + en.speed * dt;
            }

            if (nextY >= 81) {
              hitShip++;
              if (lockedIdRef.current === en.id) {
                lockedIdRef.current = null;
                setLockedId(null);
              }
              emitSparks(en.x, 81, 16, ['#FB7185', '#FDE047', '#FFFFFF'], 1.1);
              emitRing(en.x, 81, 60, '#FB7185', 3);
              addFloatingScore(en.x, 78, language === 'cn' ? '护盾受损!' : 'SHIELD HIT!', 'text-rose-400', true);
              if (en.kind === 'boss') {
                // Boss 撞击护盾后反弹回高空继续决战，不凭空消失
                survivors.push({ ...en, x: nextX, y: 20, vx: nextVx, typed: 0 });
              }
            } else {
              survivors.push({
                ...en,
                x: nextX,
                y: nextY,
                vx: nextVx,
                rot: (en.rot + en.rotSpeed * dt) % 360
              });
            }
          }

          if (hitShip > 0) {
            comboRef.current = 0;
            setCombo(0);
            shieldsRef.current = Math.max(0, shieldsRef.current - hitShip);
            setShields(shieldsRef.current);
            playShieldHit();
            triggerShake(260);
            setShieldDamageFlash(true);
            setTimeout(() => setShieldDamageFlash(false), 300);

            if (shieldsRef.current <= 0) {
              enemiesRef.current = survivors;
              setEnemies(survivors);
              finishGame(false);
            }
          }

          if (enemiesRef.current.length > 0 || survivors.length > 0) {
            enemiesRef.current = survivors;
            setEnemies(survivors);
          }
        }
      }

      // 5. 绘制 Canvas 图层
      if (ctx) {
        ctx.clearRect(0, 0, w, h);

        // 视差流动星尘
        for (const s of starsRef.current) {
          const twinkle = 0.65 + 0.35 * Math.sin(s.twinklePhase);
          ctx.fillStyle = `rgba(255, 255, 255, ${(s.alpha * twinkle).toFixed(2)})`;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fill();
        }

        // 锁定瞄准虚线
        if (lockedIdRef.current !== null) {
          const lockedEnemy = enemiesRef.current.find((e) => e.id === lockedIdRef.current);
          if (lockedEnemy) {
            const p1 = toCanvasXY(50, 84);
            const p2 = toCanvasXY(lockedEnemy.x, lockedEnemy.y);
            ctx.save();
            ctx.setLineDash([6, 8]);
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.32)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
            ctx.restore();
          }
        }

        // 扩散能量光环
        for (const r of ringsRef.current) {
          const alpha = Math.max(0, 1 - r.life / r.maxLife);
          ctx.save();
          ctx.strokeStyle = r.color;
          ctx.globalAlpha = alpha;
          ctx.lineWidth = r.lineWidth * alpha;
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // 双层霓虹激光束
        for (const l of lasersRef.current) {
          const alpha = Math.max(0, 1 - l.life / l.maxLife);
          ctx.save();
          ctx.lineCap = 'round';
          ctx.globalAlpha = alpha * 0.55;
          ctx.strokeStyle = l.color;
          ctx.lineWidth = 10;
          ctx.beginPath();
          ctx.moveTo(l.x1, l.y1);
          ctx.lineTo(l.x2, l.y2);
          ctx.stroke();

          ctx.globalAlpha = alpha;
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(l.x1, l.y1);
          ctx.lineTo(l.x2, l.y2);
          ctx.stroke();
          ctx.restore();
        }

        // 火焰尾焰与爆炸火花粒子
        for (const p of particlesRef.current) {
          const alpha = Math.max(0, 1 - p.life / p.maxLife);
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (0.4 + 0.6 * alpha), 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, [difficulty, language]);

  // 推进波次检查
  const checkWaveAdvance = () => {
    const curWave = waveRef.current;
    if (isEndless) {
      if (curWave % 3 !== 0) {
        const quota = Math.min(14, 6 + curWave);
        if (waveClearedRef.current >= quota) {
          const nextWave = curWave + 1;
          waveRef.current = nextWave;
          waveSpawnedRef.current = 0;
          waveClearedRef.current = 0;
          bossSpawnedRef.current = false;
          setWave(nextWave);
          playWaveClear();
          announceWave(nextWave);
        }
      }
      return;
    }

    if (curWave < 3 && waveClearedRef.current >= tuningRef.current.waveQuotas[curWave - 1]) {
      const nextWave = curWave + 1;
      waveRef.current = nextWave;
      waveSpawnedRef.current = 0;
      waveClearedRef.current = 0;
      setWave(nextWave);
      playWaveClear();
      announceWave(nextWave);
    }
  };

  // 键盘输入与专业锁敌控制
  useEffect(() => {
    const onComposition = () => onImeWarning(true);

    const onKeyDown = (e: KeyboardEvent) => {
      if (finishedRef.current || pausedRef.current || phaseRef.current !== 'playing') return;
      if (e.isComposing || e.key === 'Process' || e.keyCode === 229) {
        onImeWarning(true);
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      // Tab / Backspace 随时取消当前锁敌，方便紧急切目标
      if (e.key === 'Tab' || e.key === 'Backspace') {
        if (lockedIdRef.current !== null) {
          e.preventDefault();
          lockedIdRef.current = null;
          setLockedId(null);
        }
        return;
      }

      // 满能量按空格释放全屏「超级星云冲击波」
      if (e.code === 'Space' && energyRef.current >= 100 && enemiesRef.current.length > 0) {
        e.preventDefault();
        playSuperNova();
        triggerShake(340);
        emitRing(50, 84, 920, '#38BDF8', 10);
        emitRing(50, 84, 680, '#FDE047', 6);
        emitSparks(50, 50, 32, ['#38BDF8', '#FDE047', '#E879F9', '#FFFFFF'], 1.8);

        let gainedPts = 0;
        let bossDefeated = false;
        const remaining: SpaceEnemy[] = [];

        for (const en of enemiesRef.current) {
          emitSparks(en.x, en.y, 18, ['#FDE047', '#38BDF8', '#F472B6'], 1.2);
          if (en.kind === 'boss' && en.hp > 1) {
            // 冲击波直接炸掉 Boss 1 层护盾并刷新词条
            const nextHp = en.hp - 1;
            const nextPrompt = pickNonConflictingPrompt(poolRef.current, new Set([en.prompt.text[0]]));
            remaining.push({ ...en, hp: nextHp, prompt: nextPrompt, typed: 0, y: Math.max(18, en.y - 6) });
            gainedPts += 60;
            addFloatingScore(en.x, en.y, '⚡ 破盾 +60', 'text-cyan-300', true);
          } else {
            gainedPts += en.kind === 'boss' ? 150 : 35;
            killsRef.current += 1;
            if (en.kind === 'boss') {
              bossDefeated = true;
              addFloatingScore(en.x, en.y, '💥 BOSS +150', 'text-amber-300', true);
            } else {
              waveClearedRef.current += 1;
              addFloatingScore(en.x, en.y, '⚡ +35', 'text-cyan-300');
            }
          }
        }

        scoreRef.current += gainedPts;
        energyRef.current = 0;
        lockedIdRef.current = null;
        enemiesRef.current = remaining;
        setScore(scoreRef.current);
        setClearedCount(killsRef.current);
        setEnergy(0);
        setLockedId(null);
        setEnemies(remaining);

        if (bossDefeated) {
          if (isEndless) {
            if (shieldsRef.current < MAX_SHIELDS) {
              shieldsRef.current += 1;
              setShields(shieldsRef.current);
              addFloatingScore(
                50,
                42,
                language === 'cn' ? '🛡️ 护盾恢复 +1' : '🛡️ SHIELD +1',
                'text-cyan-300',
                true
              );
            }
            const nextWave = waveRef.current + 1;
            waveRef.current = nextWave;
            waveSpawnedRef.current = 0;
            waveClearedRef.current = 0;
            bossSpawnedRef.current = false;
            setWave(nextWave);
            playWaveClear();
            announceWave(nextWave);
          } else {
            finishGame(true);
          }
        } else {
          checkWaveAdvance();
        }
        return;
      }

      if (e.key.length !== 1 || !/^[a-zA-Z]$/.test(e.key)) return;
      e.preventDefault();
      onImeWarning(false);

      const ch = e.key.toLowerCase();
      totalKeysRef.current++;

      let target: SpaceEnemy | undefined;
      if (lockedIdRef.current !== null) {
        target = enemiesRef.current.find((en) => en.id === lockedIdRef.current);
      }

      if (!target) {
        const candidates = enemiesRef.current
          .filter((en) => en.prompt.text[en.typed] === ch)
          .sort((a, b) => b.y - a.y);
        target = candidates[0];
        if (target) {
          lockedIdRef.current = target.id;
          setLockedId(target.id);
        }
      }

      if (target && target.prompt.text[target.typed] === ch) {
        correctKeysRef.current++;
        const isOverdrive = comboRef.current >= 10;
        playArcadeLaser(comboRef.current);
        fireLaserBeam(target.x, target.y, isOverdrive);

        const nextTyped = target.typed + 1;
        const now = Date.now();

        if (nextTyped >= target.prompt.text.length) {
          const newCombo = comboRef.current + 1;
          comboRef.current = newCombo;
          maxComboRef.current = Math.max(maxComboRef.current, newCombo);
          setCombo(newCombo);

          const mult = newCombo >= 15 ? 3 : newCombo >= 10 ? 2 : newCombo >= 5 ? 1.5 : 1;

          // Boss 护盾机制：多血量破盾
          if (target.kind === 'boss' && target.hp > 1) {
            const nextHp = target.hp - 1;
            playExplosion(true);
            triggerShake(240);
            emitSparks(target.x, target.y, 26, ['#FDE047', '#38BDF8', '#E879F9', '#FFFFFF'], 1.4);
            emitRing(target.x, target.y, 120, '#38BDF8', 5);

            const pts = Math.round(60 * mult);
            scoreRef.current += pts;
            energyRef.current = Math.min(100, energyRef.current + tuningRef.current.energyPerBossShield);
            setScore(scoreRef.current);
            setEnergy(energyRef.current);
            addFloatingScore(
              target.x,
              target.y,
              language === 'cn' ? `🛡️ 护盾击破 +${pts}` : `SHIELD BREAK +${pts}`,
              'text-cyan-300',
              true
            );

            const usedFirst = new Set<string>(
              enemiesRef.current.map((e) => e.prompt.text[0])
            );
            const nextPrompt = pickNonConflictingPrompt(poolRef.current, usedFirst);
            enemiesRef.current = enemiesRef.current.map((en) =>
              en.id === target!.id
                ? { ...en, hp: nextHp, prompt: nextPrompt, typed: 0, y: Math.max(18, en.y - 4), hitFlashUntil: now + 180 }
                : en
            );
            setEnemies(enemiesRef.current);
            return;
          }

          // 彻底摧毁敌机或 Boss
          const isBoss = target.kind === 'boss';
          playExplosion(isBoss);
          triggerShake(isBoss ? 360 : 120);
          emitSparks(
            target.x,
            target.y,
            isBoss ? 42 : 20,
            isBoss
              ? ['#FDE047', '#F472B6', '#38BDF8', '#A78BFA', '#FFFFFF']
              : ['#FDE047', '#FB923C', '#38BDF8', '#FFFFFF'],
            isBoss ? 1.7 : 1.1
          );
          emitRing(target.x, target.y, isBoss ? 180 : 75, isBoss ? '#FDE047' : '#38BDF8', isBoss ? 6 : 3.5);

          const basePts = isBoss ? 180 : 25;
          const pts = Math.round(basePts * mult);
          scoreRef.current += pts;
          killsRef.current += 1;
          energyRef.current = Math.min(
            100,
            energyRef.current + (isBoss ? 100 : tuningRef.current.energyPerKill)
          );

          setScore(scoreRef.current);
          setClearedCount(killsRef.current);
          setEnergy(energyRef.current);
          addFloatingScore(
            target.x,
            target.y,
            isBoss ? `🏆 +${pts}` : `+${pts}`,
            isBoss ? 'text-amber-300' : mult >= 2 ? 'text-fuchsia-300' : 'text-amber-300',
            isBoss || mult >= 2
          );

          enemiesRef.current = enemiesRef.current.filter((en) => en.id !== target!.id);
          lockedIdRef.current = null;
          setLockedId(null);
          setEnemies(enemiesRef.current);

          if (isBoss) {
            if (isEndless) {
              // 无尽模式击破母舰：进入下一波并奖励回复 1 格护盾
              if (shieldsRef.current < MAX_SHIELDS) {
                shieldsRef.current += 1;
                setShields(shieldsRef.current);
                addFloatingScore(
                  50,
                  42,
                  language === 'cn' ? '🛡️ 护盾恢复 +1' : '🛡️ SHIELD +1',
                  'text-cyan-300',
                  true
                );
              }
              const nextWave = waveRef.current + 1;
              waveRef.current = nextWave;
              waveSpawnedRef.current = 0;
              waveClearedRef.current = 0;
              bossSpawnedRef.current = false;
              setWave(nextWave);
              playWaveClear();
              announceWave(nextWave);
            } else {
              finishGame(true);
            }
          } else {
            waveClearedRef.current += 1;
            checkWaveAdvance();
          }
        } else {
          // 击中单字：轻微击退 + 白光闪烁反馈
          enemiesRef.current = enemiesRef.current.map((en) =>
            en.id === target!.id
              ? {
                  ...en,
                  typed: nextTyped,
                  y: en.kind === 'boss' ? en.y : Math.max(6, en.y - 1.8),
                  hitFlashUntil: now + 95
                }
              : en
          );
          setEnemies(enemiesRef.current);
        }
      } else {
        playSound('error');
        comboRef.current = 0;
        setCombo(0);
        // 未攒满时按错键微扣 4% 能量，让大招更有精准连击含金量
        if (energyRef.current > 0 && energyRef.current < 100) {
          energyRef.current = Math.max(0, energyRef.current - 4);
          setEnergy(energyRef.current);
        }
      }
    };

    window.addEventListener('compositionstart', onComposition);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('compositionstart', onComposition);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [language, onImeWarning]);

  const multiplierLabel = combo >= 15 ? '3x' : combo >= 10 ? '2x' : combo >= 5 ? '1.5x' : null;
  const nowMs = Date.now();

  return (
    <div
      ref={stageRef}
      className={`relative w-full h-[520px] sm:h-[560px] rounded-3xl overflow-hidden select-none shadow-2xl border-4 border-indigo-200/80 ${
        screenShake ? 'animate-shake' : ''
      }`}
      style={{
        backgroundColor: '#0B1026',
        backgroundImage: 'url(/images/arcade/space/bg_nebula.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* 暗角层增强前景对比度 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 45%, rgba(11,16,38,0.12) 0%, rgba(11,16,38,0.52) 100%)'
        }}
      />

      {/* 护盾受损红光闪屏 */}
      {shieldDamageFlash && (
        <div className="absolute inset-0 z-30 bg-rose-500/30 border-4 border-rose-400 rounded-3xl pointer-events-none" />
      )}

      {/* 60fps HiDPI 特效画布（视差星尘 / 激光束 / 尾焰 / 物理爆炸 / 冲击波） */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />

      {/* 顶部专业星际 HUD */}
      <div className="absolute top-3 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2">
        {/* 左侧：护盾 + 波次 */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-cyan-400/30 shadow-sm">
            {Array.from({ length: MAX_SHIELDS }).map((_, i) => (
              <Shield
                key={i}
                size={16}
                className={
                  i < shields
                    ? 'fill-cyan-400 text-cyan-200 drop-shadow-[0_0_6px_rgba(56,189,248,0.8)]'
                    : 'text-slate-600'
                }
              />
            ))}
          </div>

          <div className="bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-indigo-400/30 text-xs font-extrabold text-indigo-200 tracking-wide">
            {isEndless
              ? wave % 3 === 0
                ? `∞ BOSS #${Math.floor(wave / 3)}`
                : `∞ WAVE ${wave}`
              : `WAVE ${wave}/3`}
          </div>
        </div>

        {/* 中间：超级星云冲击波能量条（全尺寸可见，满能量可直接点击或按空格释放） */}
        <button
          type="button"
          onClick={() => {
            if (energy >= 100) {
              window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', key: ' ' }));
            }
          }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border transition-all ${
            energy >= 100
              ? 'bg-amber-400/25 border-amber-300 shadow-[0_0_18px_rgba(251,191,36,0.5)] cursor-pointer hover:scale-105'
              : 'bg-slate-950/70 border-cyan-400/30 cursor-default'
          }`}
        >
          <Zap
            size={14}
            className={energy >= 100 ? 'text-amber-300 fill-amber-300 animate-bounce' : 'text-cyan-300'}
          />
          <div className="w-16 sm:w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                energy >= 100
                  ? 'bg-gradient-to-r from-amber-300 via-pink-400 to-cyan-300'
                  : 'bg-gradient-to-r from-cyan-400 to-blue-400'
              }`}
              style={{ width: `${energy}%` }}
            />
          </div>
          <span className="text-[11px] font-black text-cyan-100 whitespace-nowrap">
            {energy >= 100
              ? language === 'cn'
                ? '按空格清屏!'
                : 'SPACE NOVA!'
              : `${energy}%`}
          </span>
        </button>

        {/* 右侧：连击倍率 + 击毁数 + 分数 */}
        <div className="flex items-center gap-2">
          {combo >= 2 && (
            <div className="bg-gradient-to-r from-fuchsia-500 to-amber-500 text-white px-2.5 py-1.5 rounded-full text-xs font-black flex items-center gap-1 shadow-md">
              <Flame size={13} className="fill-yellow-200 text-yellow-200" />
              <span>{combo}</span>
              {multiplierLabel && (
                <span className="ml-0.5 px-1 rounded bg-black/25 text-[10px]">
                  {multiplierLabel}
                </span>
              )}
            </div>
          )}
          <div className="bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-indigo-400/30 text-xs font-extrabold text-cyan-200 tabular-nums">
            <Crosshair size={12} className="inline mr-1 -mt-0.5 text-cyan-400" />
            {clearedCount}
          </div>
          <div className="bg-slate-950/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-amber-400/35 text-xs sm:text-sm font-black text-amber-300 tabular-nums">
            {score}
          </div>
        </div>
      </div>

      {/* 开局 3-2-1-GO! 倒计时遮罩 */}
      {phase === 'countdown' && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/35 backdrop-blur-[2px] pointer-events-none">
          <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-cyan-300 mb-2">
            {language === 'cn' ? '双手放好键盘 · 准备起飞' : 'HANDS ON KEYBOARD · GET READY'}
          </div>
          <div
            key={countdownNum}
            className="text-7xl sm:text-8xl font-cartoon font-black text-white drop-shadow-[0_0_24px_rgba(56,189,248,0.9)] animate-pop"
          >
            {countdownNum > 0 ? countdownNum : 'GO!'}
          </div>
        </div>
      )}

      {/* 波次切换横幅 */}
      {waveBanner && phase === 'playing' && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 px-6 py-2 rounded-full bg-slate-950/85 border border-cyan-300/60 shadow-[0_0_24px_rgba(56,189,248,0.5)] text-sm sm:text-base font-black text-cyan-100 tracking-wider animate-pop pointer-events-none">
          {waveBanner}
        </div>
      )}

      {/* 敌机与 Boss 精灵层 */}
      {enemies.map((en) => {
        const isLocked = en.id === lockedId;
        const isFlashing = nowMs < en.hitFlashUntil;
        const done = en.prompt.text.slice(0, en.typed);
        const activeChar = en.prompt.text[en.typed] || '';
        const rest = en.prompt.text.slice(en.typed + 1);
        const isBoss = en.kind === 'boss';

        return (
          <div
            key={en.id}
            className="absolute z-20 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
            style={{ left: `${en.x}%`, top: `${en.y}%` }}
          >
            {/* Boss 专属 3 段护盾条 */}
            {isBoss && (
              <div className="mb-1.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/85 border border-amber-400/50 shadow-md">
                <span className="text-[10px] font-black text-amber-300">BOSS</span>
                <div className="flex gap-1">
                  {Array.from({ length: en.maxHp }).map((_, idx) => (
                    <span
                      key={idx}
                      className={`w-6 h-2 rounded-full transition-all ${
                        idx < en.hp
                          ? 'bg-gradient-to-r from-cyan-400 to-fuchsia-400 shadow-[0_0_8px_rgba(56,189,248,0.9)]'
                          : 'bg-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 敌机精灵 + 旋转锁定准星 */}
            <div className="relative flex items-center justify-center">
              {isLocked && (
                <div
                  className={`absolute rounded-full border-2 border-dashed border-cyan-300 animate-spin pointer-events-none ${
                    isBoss ? 'w-32 h-32' : 'w-16 h-16'
                  }`}
                  style={{ animationDuration: '5s' }}
                />
              )}
              <img
                src={SPRITE_MAP[en.kind]}
                alt={en.kind}
                decoding="async"
                style={{
                  transform: `rotate(${en.rot}deg) scale(${isFlashing ? 1.14 : isLocked ? 1.07 : 1})`,
                  filter: isFlashing
                    ? 'brightness(1.85) drop-shadow(0 0 14px rgba(255,255,255,0.95))'
                    : isLocked
                      ? 'drop-shadow(0 0 12px rgba(56,189,248,0.75))'
                      : 'drop-shadow(0 6px 10px rgba(0,0,0,0.45))'
                }}
                className={`object-contain transition-transform duration-75 ${
                  isBoss ? 'w-28 sm:w-32' : en.kind === 'ufo' ? 'w-14 sm:w-16' : 'w-12 sm:w-14'
                }`}
              />
            </div>

            {/* 护眼大号高对比度单词/拼音铭牌 */}
            <div
              className={`mt-1.5 px-4 py-1.5 rounded-2xl border-2 font-mono font-black tracking-wider shadow-xl backdrop-blur-md transition-transform ${
                isBoss ? 'text-2xl sm:text-[26px]' : 'text-xl sm:text-2xl'
              } ${
                isLocked
                  ? 'bg-slate-950/95 border-cyan-300 ring-2 ring-cyan-400/45 scale-105'
                  : isBoss
                    ? 'bg-purple-950/92 border-amber-300/85'
                    : 'bg-slate-950/88 border-indigo-300/50'
              }`}
            >
              {en.prompt.display && (
                <span className="mr-2 font-sans text-amber-200">{en.prompt.display}</span>
              )}
              <span className="text-emerald-400">{done}</span>
              {activeChar && (
                <span
                  className={
                    isLocked
                      ? 'text-amber-300 underline decoration-2 underline-offset-4'
                      : 'text-white'
                  }
                >
                  {activeChar}
                </span>
              )}
              <span className="text-white">{rest}</span>
            </div>
          </div>
        );
      })}

      {/* 得分与破盾飘字 */}
      {floatingScores.map((item) => (
        <div
          key={item.id}
          className={`absolute z-30 -translate-x-1/2 -translate-y-1/2 font-black pointer-events-none animate-bounce drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)] ${
            item.big ? 'text-lg sm:text-xl' : 'text-sm sm:text-base'
          } ${item.color}`}
          style={{ left: `${item.x}%`, top: `${item.y}%` }}
        >
          {item.text}
        </div>
      ))}

      {/* 底部主角定制星际战机（带平滑转向与开火后坐力） */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
        <img
          src="/images/arcade/space/ship_player.webp"
          alt="Player Starfighter"
          style={{
            transform: `rotate(${shipAngle}deg) translateY(${shipRecoil ? '4px' : '0px'})`,
            filter:
              combo >= 10
                ? 'drop-shadow(0 0 18px rgba(251,191,36,0.9))'
                : 'drop-shadow(0 0 14px rgba(56,189,248,0.75))'
          }}
          className="w-16 h-16 sm:w-18 sm:h-18 object-contain transition-transform duration-100"
        />
      </div>

      {/* 底部极简快捷操作提示 */}
      <div className="absolute bottom-2.5 left-4 right-4 z-20 flex items-center justify-between text-[11px] font-bold text-indigo-200/80 pointer-events-none">
        <span>
          {language === 'cn'
            ? '输入首字母锁定发射 · Tab 取消锁定'
            : 'Type to lock & fire · Tab to unlock'}
        </span>
        <span className="hidden sm:inline">
          {language === 'cn' ? 'Esc 暂停 · 满能量 Space 清屏' : 'Esc Pause · Space Nova'}
        </span>
      </div>
    </div>
  );
};
