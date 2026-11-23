import React, { useEffect, useRef, useState } from 'react';
import { playSound } from '../utils/sound';

interface RippleItem {
  id: number;
  x: number; // px
  y: number; // px
  char: string;
  color: string;
}

const RIPPLE_COLORS = ['#1E7F5C', '#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6', '#10B981'];
const RANDOM_CHARS = ['1', '2', '3', 'A', 'B', 'C', '拼', '8', '9', '★', '♪'];

export const HomeBackdropDecor: React.FC = () => {
  const [ripples, setRipples] = useState<RippleItem[]>([]);
  const nextIdRef = useRef(1);

  const spawnRipple = (x: number, y: number, char: string, withSound = false) => {
    const id = nextIdRef.current++;
    const color = RIPPLE_COLORS[id % RIPPLE_COLORS.length];
    if (withSound) playSound('click');

    setRipples((prev) => [...prev.slice(-10), { id, x, y, char, color }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 1050);
  };

  // 互动彩蛋：在首页点击空白处，或随手敲击键盘字母/数字，立刻漾开彩色数字涟漪
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      // 点击按钮、弹窗或输入框时不触发背景涟漪
      if (target.closest('button, a, input, nav, [role="dialog"]')) return;
      const char = RANDOM_CHARS[Math.floor(Math.random() * RANDOM_CHARS.length)];
      spawnRipple(e.clientX, e.clientY, char, false);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName;
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key.length !== 1 || !/^[a-zA-Z0-9]$/.test(e.key)) return;

      const w = window.innerWidth;
      const h = window.innerHeight;
      const x = w * (0.12 + Math.random() * 0.76);
      const y = h * (0.15 + Math.random() * 0.65);
      spawnRipple(x, y, e.key.toUpperCase(), true);
    };

    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none" aria-hidden="true">
      {/* 数字/字母同心涟漪 + 上浮字符泡泡 */}
      {ripples.map((r) => (
        <div
          key={r.id}
          className="fixed"
          style={{ left: r.x, top: r.y, transform: 'translate(-50%, -50%)' }}
        >
          <span
            className="tappy-ripple-ring block w-16 h-16 rounded-full border-2"
            style={{ borderColor: r.color }}
          />
          <span
            className="tappy-ripple-ring-delayed block w-16 h-16 rounded-full border-2 absolute inset-0"
            style={{ borderColor: r.color }}
          />
          <span
            className="tappy-ripple-char absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-mono font-black text-base drop-shadow-xs"
            style={{ color: r.color }}
          >
            {r.char}
          </span>
        </div>
      ))}
    </div>
  );
};
