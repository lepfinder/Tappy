import React, { useEffect } from 'react';
import { FINGER_MAP, FINGER_PALETTE } from '../constants';
import { useGameStore } from '../store/useGameStore';
import { TRANSLATIONS } from '../i18n';
import { HandGuide } from './HandGuide';
import {
  getFingerForKey,
  isSpaceKey,
  resolveKeycapTarget,
  FingerName
} from '../utils/fingerMapping';

type AccentKind = 'cream' | 'green' | 'amber' | 'pink';

interface KeySpec {
  id: string;
  key?: string; // 绑定真实打字逻辑的键值；省略表示纯装饰功能键
  label: string;
  subLabel?: string;
  flex: number; // 每行总和统一 14.0，保证左右激光齐平
  accent?: AccentKind;
  isShift?: boolean;
  isSpace?: boolean;
}

const ACCENT_THEMES: Record<
  AccentKind,
  { bg: string; lip: string; text: string; border: string }
> = {
  cream: {
    bg: '#FFFDF6',
    lip: '#D6C2A3',
    text: '#4A2E1B',
    border: '#7C4D2B'
  },
  green: {
    bg: '#43A46C',
    lip: '#2C754B',
    text: '#FFFFFF',
    border: '#245E3C'
  },
  amber: {
    bg: '#F4A926',
    lip: '#BF7C12',
    text: '#5C3206',
    border: '#8F590A'
  },
  pink: {
    bg: '#EC528B',
    lip: '#B82E62',
    text: '#FFFFFF',
    border: '#8E204A'
  }
};

// 4 行完整齐平机械键盘布局（每行 flex 之和严格等于 14.0）
const FULL_KEYBOARD_ROWS: KeySpec[][] = [
  [
    { id: 'tab', label: 'TAB', flex: 1.5, accent: 'green' },
    ...'qwertyuiop'.split('').map((k) => ({ id: k, key: k, label: k.toUpperCase(), flex: 1 })),
    { id: 'lbrack', label: '[', flex: 1, accent: 'cream' },
    { id: 'bksp', label: '⌫', flex: 1.5, accent: 'pink' }
  ],
  [
    { id: 'caps', label: 'CAPS', flex: 1.55, accent: 'green' },
    ...'asdfghjkl'.split('').map((k) => ({ id: k, key: k, label: k.toUpperCase(), flex: 1 })),
    { id: ';', key: ';', label: ';', flex: 1 },
    { id: "'", key: "'", label: "'", flex: 1 },
    { id: 'enter', label: '↵', flex: 1.45, accent: 'green' }
  ],
  [
    { id: 'shift-l', key: 'shift', label: 'SHIFT ⇧', flex: 1.85, accent: 'green', isShift: true },
    ...'zxcvbnm'.split('').map((k) => ({ id: k, key: k, label: k.toUpperCase(), flex: 1 })),
    { id: ',', key: ',', label: ',', flex: 1 },
    { id: '.', key: '.', label: '.', flex: 1 },
    { id: '/', key: '/', label: '/', subLabel: '?', flex: 1 },
    { id: 'shift-r', key: 'shift', label: '⇧ SHIFT', flex: 2.15, accent: 'pink', isShift: true }
  ],
  [
    { id: 'ctrl', label: 'CTRL', flex: 1.3, accent: 'green' },
    { id: 'fn', label: 'FN', flex: 1.1, accent: 'amber' },
    { id: 'alt-l', label: 'ALT', flex: 1.25, accent: 'green' },
    { id: 'space', key: ' ', label: 'SPACE', flex: 6.3, accent: 'cream', isSpace: true },
    { id: 'alt-r', label: 'ALT', flex: 1.2, accent: 'green' },
    { id: 'left', label: '◀', flex: 0.95, accent: 'pink' },
    { id: 'down', label: '▼', flex: 0.95, accent: 'amber' },
    { id: 'right', label: '▶', flex: 0.95, accent: 'amber' }
  ]
];

export const VirtualKeyboard: React.FC = () => {
  const {
    handleInput,
    selectedMode,
    currentLevel,
    currentChallengeIndex,
    typedHistory,
    currentSyllableIndex,
    isPlaying,
    language,
    showFingerZones,
    assistMode,
    dictationMode,
    lastPressedKey,
    lastWrongKey,
    setImeWarning,
    setCapsLockOn
  } = useGameStore();

  const t = TRANSLATIONS[language];

  let rawExpectedChar = '';
  if (isPlaying && currentLevel && currentLevel.challenges[currentChallengeIndex]) {
    const currentItem = currentLevel.challenges[currentChallengeIndex];
    if (selectedMode?.startsWith('EN') || selectedMode === 'RACE_100M') {
      rawExpectedChar = currentItem.display[typedHistory.length] || '';
    } else {
      const currentSyllable = currentItem.pinyin?.[currentSyllableIndex];
      if (currentSyllable) {
        rawExpectedChar = currentSyllable[typedHistory.length] || '';
      }
    }
  }

  const isDictationMask = dictationMode && selectedMode === 'EN_WORDS';
  const { keycap: rawTargetKeycap, needsShift: rawNeedsShift } = resolveKeycapTarget(rawExpectedChar);
  // 听写模式下隐藏键盘目标提示与手指高亮，避免直接泄题
  const targetKeycap = isDictationMask ? '' : rawTargetKeycap;
  const needsShift = isDictationMask ? false : rawNeedsShift;
  const expectedNormalized = isDictationMask ? '' : rawExpectedChar.toLowerCase();

  const fingerInfo = expectedNormalized ? getFingerForKey(expectedNormalized) : null;
  const isSpace = expectedNormalized ? isSpaceKey(expectedNormalized) : false;

  const leftActiveFinger: FingerName | null = isSpace
    ? 'thumb'
    : needsShift
      ? 'pinky'
      : fingerInfo?.hand === 'left'
        ? fingerInfo.finger
        : null;

  const rightActiveFinger: FingerName | null = isSpace
    ? 'thumb'
    : fingerInfo?.hand === 'right'
      ? fingerInfo.finger
      : null;

  // 监听实体键盘（含中文输入法 IME 与 CapsLock 状态检测）
  useEffect(() => {
    const handleCompositionStart = () => {
      if (isPlaying) setImeWarning(true);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;

      if (typeof e.getModifierState === 'function') {
        setCapsLockOn(e.getModifierState('CapsLock'));
      }

      if (e.isComposing || e.key === 'Process' || e.keyCode === 229) {
        setImeWarning(true);
        return;
      }

      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (e.key === ' ') e.preventDefault();
        handleInput(e.key);
      }
    };

    window.addEventListener('compositionstart', handleCompositionStart);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('compositionstart', handleCompositionStart);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlaying, handleInput, setImeWarning, setCapsLockOn]);

  const handleVirtualKeyClick = (key?: string) => {
    if (!isPlaying || !key || key === 'shift') return;
    if (key === '/' && rawExpectedChar === '?') {
      handleInput('?');
      return;
    }
    handleInput(key);
  };

  const activePalette = fingerInfo ? FINGER_PALETTE[fingerInfo.fingerKey] : null;
  const fingerLabel = activePalette
    ? language === 'cn'
      ? activePalette.labelCn
      : activePalette.labelEn
    : '';

  // 极简专注模式：保持实体键盘监听生效，隐藏屏幕键盘与双手引导
  if (assistMode === 'zen') {
    return (
      <div className="w-full max-w-2xl mx-auto flex justify-center py-2 select-none">
        <div className="px-4 py-1.5 rounded-full bg-white/85 border border-indigo-100 text-xs font-bold text-indigo-700/80 shadow-xs">
          {language === 'cn'
            ? '极简专注模式已开启 · 直接敲击键盘，顶部可随时切回键位引导'
            : 'Focus mode active · Type directly, switch guide mode in top bar'}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center gap-2 select-none">
      {/* 实时指法文字提示胶囊 */}
      <div className="px-4 py-1 rounded-full bg-white/95 shadow-sm border border-amber-200/80 text-xs font-bold text-slate-600 flex items-center gap-2">
        {activePalette && targetKeycap ? (
          <>
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: activePalette.fill }}
            />
            <span>
              {language === 'cn' ? '请用 ' : 'Use '}
              <strong className="text-slate-800">{fingerLabel}</strong>
              {needsShift
                ? language === 'cn'
                  ? ' 按住 Shift + '
                  : ' hold Shift + '
                : language === 'cn'
                  ? ' 按下 '
                  : ' press '}
              <strong className="font-mono uppercase text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-md">
                {targetKeycap === ' ' ? 'SPACE' : targetKeycap}
              </strong>
            </span>
          </>
        ) : (
          <span>
            {language === 'cn'
              ? '敲击实体键盘，或直接点击下方键帽练习'
              : 'Type on your keyboard or tap the keys below'}
          </span>
        )}
      </div>

      <div className="flex flex-row items-end justify-center gap-3 lg:gap-5 w-full">
        {/* 左手引导 */}
        <div className="hidden lg:flex flex-col items-center shrink-0 pb-1">
          <HandGuide side="left" activeFinger={leftActiveFinger} />
          <span className="text-xs font-bold text-amber-900/60 mt-0.5">
            {language === 'cn' ? '左手' : 'Left'}
          </span>
        </div>

        {/* 暖焦糖木质 3D 机械键盘外框 + 深色内凹键槽 */}
        <div
          className="w-full max-w-[780px] p-2.5 sm:p-3 rounded-[26px] border-[2.5px] border-[#7C4D2B]"
          style={{
            background: 'linear-gradient(180deg, #D9A16B 0%, #B87B46 100%)',
            boxShadow:
              'inset 0 2px 1px rgba(255,244,225,0.65), 0 7px 0 #825027, 0 18px 30px -10px rgba(92,53,22,0.35)'
          }}
        >
          {/* 深色内凹键槽底盘 */}
          <div
            className="w-full p-2 sm:p-2.5 rounded-[18px] flex flex-col gap-1.5 sm:gap-2"
            style={{
              backgroundColor: '#5B371E',
              boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.35)'
            }}
          >
            {FULL_KEYBOARD_ROWS.map((row, rowIndex) => (
              <div key={rowIndex} className="flex items-stretch gap-1 sm:gap-1.5 w-full">
                {row.map((spec) => {
                  const keyVal = spec.key;
                  const fingerKey = keyVal ? FINGER_MAP[keyVal] : undefined;
                  const palette = fingerKey ? FINGER_PALETTE[fingerKey] : null;
                  const isTarget = spec.isShift
                    ? needsShift
                    : Boolean(keyVal && keyVal === targetKeycap);
                  const isPressed = Boolean(keyVal && keyVal === lastPressedKey);
                  const isWrong = Boolean(keyVal && keyVal === lastWrongKey);
                  const isHomeBump = keyVal === 'f' || keyVal === 'j';

                  const baseAccent = ACCENT_THEMES[spec.accent || 'cream'];
                  let bgColor = baseAccent.bg;
                  let lipColor = baseAccent.lip;
                  let borderColor = baseAccent.border;
                  let textColor = baseAccent.text;
                  let ringShadow = '';

                  if (isWrong) {
                    bgColor = '#FCA5A5';
                    lipColor = '#DC2626';
                    borderColor = '#991B1B';
                    textColor = '#7F1D1D';
                  } else if (isPressed) {
                    // 敲对瞬间的清翠森林绿 3D 按下反馈
                    bgColor = '#34D399';
                    lipColor = '#059669';
                    borderColor = '#FFFFFF';
                    textColor = '#FFFFFF';
                    ringShadow = ', 0 0 12px rgba(52,211,153,0.65)';
                  } else if (isTarget && palette) {
                    bgColor = palette.fill;
                    lipColor = palette.lip;
                    borderColor = '#FFFFFF';
                    textColor = '#FFFFFF';
                    ringShadow = ', 0 0 0 2.5px rgba(255,255,255,0.92), 0 0 14px rgba(255,255,255,0.65)';
                  } else if (isTarget && spec.isSpace) {
                    const thumb = FINGER_PALETTE.thumb;
                    bgColor = thumb.fill;
                    lipColor = thumb.lip;
                    borderColor = '#FFFFFF';
                    textColor = '#FFFFFF';
                    ringShadow = ', 0 0 0 2.5px rgba(255,255,255,0.92)';
                  }

                  const isBlindHidden =
                    assistMode === 'blind' &&
                    !spec.isShift &&
                    !spec.isSpace &&
                    (!spec.accent || spec.accent === 'cream') &&
                    !isPressed &&
                    !isWrong;

                  const boxShadow = isPressed || isWrong
                    ? `0 1px 0 ${lipColor}${ringShadow}`
                    : `inset 0 1.5px 0 rgba(255,255,255,0.55), 0 3.5px 0 ${lipColor}${ringShadow}`;

                  return (
                    <button
                      key={spec.id}
                      type="button"
                      disabled={!keyVal}
                      onClick={() => handleVirtualKeyClick(keyVal)}
                      style={{
                        flexGrow: spec.flex,
                        flexBasis: 0,
                        backgroundColor: bgColor,
                        border: `1.5px solid ${borderColor}`,
                        color: textColor,
                        boxShadow,
                        transform:
                          isPressed || isWrong
                            ? 'translateY(3.5px)'
                            : isTarget
                              ? 'translateY(-1.5px)'
                              : 'translateY(0)'
                      }}
                      className={`relative h-10 sm:h-11 md:h-12 rounded-[10px] sm:rounded-[12px] flex items-center justify-center font-mono font-extrabold transition-all duration-75 ${
                        keyVal ? 'cursor-pointer' : 'cursor-default opacity-95'
                      } ${
                        spec.isSpace
                          ? 'text-xs tracking-widest gap-1.5'
                          : spec.accent && spec.accent !== 'cream'
                            ? 'text-[10px] sm:text-xs tracking-tight'
                            : 'text-sm sm:text-base md:text-lg'
                      }`}
                      aria-label={spec.label}
                    >
                      {/* 指法分区色带（打开指法提示时显示在字母键顶部） */}
                      {showFingerZones &&
                        !spec.isShift &&
                        !spec.isSpace &&
                        !isTarget &&
                        palette && (
                          <span
                            className="absolute top-1 left-2 right-2 h-1 rounded-full opacity-85"
                            style={{ backgroundColor: palette.fill }}
                          />
                        )}

                      {spec.isSpace ? (
                        <>
                          <span>🐻</span>
                          <span>{t.space}</span>
                        </>
                      ) : spec.subLabel ? (
                        <span
                          className={`flex flex-col items-center leading-none transition-opacity duration-150 ${
                            isBlindHidden ? 'opacity-0' : 'opacity-100'
                          }`}
                        >
                          <span className="text-[10px] opacity-65">{spec.subLabel}</span>
                          <span className="text-xs sm:text-sm">{spec.label}</span>
                        </span>
                      ) : (
                        <span
                          className={`truncate px-0.5 transition-opacity duration-150 ${
                            isBlindHidden ? 'opacity-0' : 'opacity-100'
                          }`}
                        >
                          {spec.label}
                        </span>
                      )}

                      {/* F / J 盲打定位小凸点 */}
                      {isHomeBump && (
                        <span
                          className="absolute bottom-1.5 w-3.5 h-0.5 rounded-full"
                          style={{
                            backgroundColor: isTarget ? '#FFFFFF' : '#9C7A5B',
                            opacity: isTarget ? 0.95 : 0.7
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* 右手引导 */}
        <div className="hidden lg:flex flex-col items-center shrink-0 pb-1">
          <HandGuide side="right" activeFinger={rightActiveFinger} />
          <span className="text-xs font-bold text-amber-900/60 mt-0.5">
            {language === 'cn' ? '右手' : 'Right'}
          </span>
        </div>
      </div>
    </div>
  );
};
