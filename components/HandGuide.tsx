import React from 'react';
import { FingerName, HandSide } from '../utils/fingerMapping';

interface HandGuideProps {
    side: HandSide;
    activeFinger: FingerName | null;
    className?: string;
}

// Colors
const INACTIVE_COLOR = '#E2E8F0';  // gray-200
const ACTIVE_COLOR = '#60A5FA';    // blue-400
const STROKE_COLOR = '#94A3B8';    // slate-400

export const HandGuide: React.FC<HandGuideProps> = ({
    side,
    activeFinger,
    className = ''
}) => {
    // Determine fill color for each finger
    const getFingerColor = (finger: FingerName): string => {
        return activeFinger === finger ? ACTIVE_COLOR : INACTIVE_COLOR;
    };

    return (
        <svg
            width="140"
            height="200"
            viewBox="0 0 140 200"
            className={`transition-all duration-150 ${className}`}
            style={{
                transform: side === 'right' ? 'scaleX(-1)' : 'none'
            }}
        >
            {/* Palm */}
            <ellipse
                cx="70"
                cy="150"
                rx="55"
                ry="45"
                fill={INACTIVE_COLOR}
                stroke={STROKE_COLOR}
                strokeWidth="2"
            />

            {/* Pinky - Leftmost */}
            <rect
                x="12"
                y="80"
                width="20"
                height="55"
                rx="10"
                fill={getFingerColor('pinky')}
                stroke={STROKE_COLOR}
                strokeWidth="2"
                className="transition-colors duration-150"
            />
            <circle
                cx="22"
                cy="80"
                r="10"
                fill={getFingerColor('pinky')}
                stroke={STROKE_COLOR}
                strokeWidth="2"
                className="transition-colors duration-150"
            />

            {/* Ring */}
            <rect
                x="36"
                y="50"
                width="22"
                height="70"
                rx="11"
                fill={getFingerColor('ring')}
                stroke={STROKE_COLOR}
                strokeWidth="2"
                className="transition-colors duration-150"
            />
            <circle
                cx="47"
                cy="50"
                r="11"
                fill={getFingerColor('ring')}
                stroke={STROKE_COLOR}
                strokeWidth="2"
                className="transition-colors duration-150"
            />

            {/* Middle - Tallest */}
            <rect
                x="60"
                y="35"
                width="24"
                height="80"
                rx="12"
                fill={getFingerColor('middle')}
                stroke={STROKE_COLOR}
                strokeWidth="2"
                className="transition-colors duration-150"
            />
            <circle
                cx="72"
                cy="35"
                r="12"
                fill={getFingerColor('middle')}
                stroke={STROKE_COLOR}
                strokeWidth="2"
                className="transition-colors duration-150"
            />

            {/* Index */}
            <rect
                x="86"
                y="55"
                width="22"
                height="65"
                rx="11"
                fill={getFingerColor('index')}
                stroke={STROKE_COLOR}
                strokeWidth="2"
                className="transition-colors duration-150"
            />
            <circle
                cx="97"
                cy="55"
                r="11"
                fill={getFingerColor('index')}
                stroke={STROKE_COLOR}
                strokeWidth="2"
                className="transition-colors duration-150"
            />

            {/* Thumb - On the side */}
            <ellipse
                cx="118"
                cy="155"
                rx="15"
                ry="35"
                fill={getFingerColor('thumb')}
                stroke={STROKE_COLOR}
                strokeWidth="2"
                className="transition-colors duration-150"
                transform="rotate(-30, 118, 155)"
            />
        </svg>
    );
};
