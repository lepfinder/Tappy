import React from 'react';

// 将 12 个数据库头像字符映射为本地 96x96 Fluent 3D 立体 WebP 头像（100% 兼容老数据）
export const AVATAR_3D_MAP: Record<string, string> = {
  '🐼': '/icons/fluent3d/panda.webp',
  '🦊': '/icons/fluent3d/fox.webp',
  '🦁': '/icons/fluent3d/lion.webp',
  '🐰': '/icons/fluent3d/rabbit.webp',
  '🚀': '/icons/fluent3d/rocket.webp',
  '🦄': '/icons/fluent3d/unicorn.webp',
  '🐸': '/icons/fluent3d/frog.webp',
  '🐱': '/icons/fluent3d/cat.webp',
  '🐶': '/icons/fluent3d/dog.webp',
  '🦋': '/icons/fluent3d/butterfly.webp',
  '🌟': '/icons/fluent3d/glowing_star.webp',
  '🎮': '/icons/fluent3d/gamepad.webp'
};

interface UserAvatarProps {
  avatar: string;
  size?: number;
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  avatar,
  size = 32,
  className = ''
}) => {
  const src = AVATAR_3D_MAP[avatar];
  if (src) {
    return (
      <img
        src={src}
        alt={avatar}
        width={size}
        height={size}
        decoding="async"
        style={{ width: size, height: size }}
        className={`object-contain select-none pointer-events-none drop-shadow-xs inline-block ${className}`}
      />
    );
  }
  return (
    <span
      style={{ fontSize: Math.round(size * 0.8), lineHeight: 1 }}
      className={`inline-flex items-center justify-center select-none ${className}`}
    >
      {avatar}
    </span>
  );
};
