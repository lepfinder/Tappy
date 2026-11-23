import React from 'react';
import { FingerName, HandSide, FingerKey } from '../utils/fingerMapping';
import { FINGER_PALETTE } from '../constants';

interface HandGuideProps {
  side: HandSide;
  activeFinger: FingerName | null;
  className?: string;
}

/**
 * 圆润可爱的矢量双手引导图：激活手指色与键盘 FINGER_PALETTE 1:1 严格一致
 */
export const HandGuide: React.FC<HandGuideProps> = ({
  side,
  activeFinger,
  className = ''
}) => {
  const suffix = side === 'left' ? 'l' : 'r';

  const getFingerStyle = (finger: FingerName) => {
    const isActive = activeFinger === finger;
    const key: FingerKey = finger === 'thumb' ? 'thumb' : (`${finger}-${suffix}` as FingerKey);
    const palette = FINGER_PALETTE[key];
    return {
      fill: isActive ? palette.fill : '#FDE5C8',
      stroke: isActive ? palette.lip : '#7C4D2B'
    };
  };

  return (
    <svg
      width="104"
      height="132"
      viewBox="0 0 120 150"
      fill="none"
      className={`transition-transform duration-150 ${className}`}
      style={{ transform: side === 'right' ? 'scaleX(-1)' : 'none' }}
      aria-hidden="true"
    >
      <rect x="34" y="116" width="52" height="22" rx="11" fill="#FDE5C8" stroke="#7C4D2B" strokeWidth="2.4" />
      <rect x="22" y="65" width="76" height="58" rx="28" fill="#FDE5C8" stroke="#7C4D2B" strokeWidth="2.4" />
      <rect x="14" y="42" width="15" height="44" rx="7.5" fill={getFingerStyle('pinky').fill} stroke={getFingerStyle('pinky').stroke} strokeWidth="2.4" className="transition-colors duration-150" />
      <rect x="32" y="22" width="16" height="56" rx="8" fill={getFingerStyle('ring').fill} stroke={getFingerStyle('ring').stroke} strokeWidth="2.4" className="transition-colors duration-150" />
      <rect x="51" y="12" width="17" height="64" rx="8.5" fill={getFingerStyle('middle').fill} stroke={getFingerStyle('middle').stroke} strokeWidth="2.4" className="transition-colors duration-150" />
      <rect x="71" y="24" width="16" height="55" rx="8" fill={getFingerStyle('index').fill} stroke={getFingerStyle('index').stroke} strokeWidth="2.4" className="transition-colors duration-150" />
      <rect x="86" y="78" width="24" height="16" rx="8" transform="rotate(-24 86 78)" fill={getFingerStyle('thumb').fill} stroke={getFingerStyle('thumb').stroke} strokeWidth="2.4" className="transition-colors duration-150" />
    </svg>
  );
};
