import React from 'react';
import { AvatarStyle } from '../db';

// Re-export for convenience
export type { AvatarStyle } from '../db';

// Available avatar styles for user selection
export const AVATAR_STYLES: { id: AvatarStyle; name: string; nameCn: string }[] = [
    { id: 'pixel-art', name: 'Pixel Art', nameCn: '像素风' },
    { id: 'pixel-art-neutral', name: 'Pixel Neutral', nameCn: '像素中性' },
    { id: 'thumbs', name: 'Thumbs', nameCn: '手指风' },
    { id: 'fun-emoji', name: 'Fun Emoji', nameCn: '趣味表情' },
    { id: 'adventurer', name: 'Adventurer', nameCn: '冒险者' },
];

// Generate DiceBear avatar URL
export const getAvatarUrl = (seed: string, style: AvatarStyle = 'pixel-art', size: number = 100): string => {
    // Encode the seed for URL safety
    const encodedSeed = encodeURIComponent(seed);
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodedSeed}&size=${size}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
};

interface AvatarProps {
    name: string;
    style?: AvatarStyle;
    size?: number;
    className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
    name,
    style = 'pixel-art' as AvatarStyle,
    size = 48,
    className = ''
}) => {
    const avatarUrl = getAvatarUrl(name, style as AvatarStyle, size);

    return (
        <img
            src={avatarUrl}
            alt={`${name}'s avatar`}
            className={`rounded-full ${className}`}
            style={{ width: size, height: size }}
            loading="lazy"
        />
    );
};

// Smaller avatar for lists and dropdowns
export const AvatarSmall: React.FC<Omit<AvatarProps, 'size'>> = (props) => (
    <Avatar {...props} size={32} />
);

// Medium avatar for headers
export const AvatarMedium: React.FC<Omit<AvatarProps, 'size'>> = (props) => (
    <Avatar {...props} size={48} />
);

// Large avatar for profiles and modals
export const AvatarLarge: React.FC<Omit<AvatarProps, 'size'>> = (props) => (
    <Avatar {...props} size={80} />
);

// Extra large avatar for transitions
export const AvatarXL: React.FC<Omit<AvatarProps, 'size'>> = (props) => (
    <Avatar {...props} size={120} />
);
