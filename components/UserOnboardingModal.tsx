import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '../store/useUserStore';
import { useGameStore } from '../store/useGameStore';
import { AVATAR_OPTIONS } from '../db';
import { UserAvatar } from './UserAvatar';
import { X, Dices } from 'lucide-react';

interface UserOnboardingModalProps {
    isOpen: boolean;
    onClose?: () => void;
    isFirstTime?: boolean;
}

const RANDOM_NAMES_CN = [
    '闪电小兔', '星际熊猫', '快乐小狮', '森林小狐',
    '魔法独角', '跳跳青蛙', '奶酪小猫', '阳光小狗',
    '彩虹蝴蝶', '小小火箭', '指尖达人', '超级小熊'
];

const RANDOM_NAMES_EN = [
    'Sparky', 'Sunny', 'Panda', 'Rocket',
    'Lucky', 'Pixel', 'Bouncy', 'Starry',
    'Mochi', 'Coco', 'Leo', 'Bunny'
];

export const UserOnboardingModal: React.FC<UserOnboardingModalProps> = ({
    isOpen,
    onClose,
    isFirstTime = false
}) => {
    const { createUser } = useUserStore();
    const { language } = useGameStore();
    const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
    const [name, setName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 非首次建号时支持按 Esc 快捷关闭
    useEffect(() => {
        if (!isOpen || isFirstTime || !onClose) return;
        const onEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            }
        };
        window.addEventListener('keydown', onEsc);
        return () => window.removeEventListener('keydown', onEsc);
    }, [isOpen, isFirstTime, onClose]);

    const t = language === 'cn' ? {
        welcomeTitle: '欢迎来到 Tappy!',
        welcomeSubtitle: '挑一个喜欢的 3D 头像，起个好听的名字吧',
        addTitle: '添加新用户',
        addSubtitle: '为新玩家创建专属成长档案',
        nameLabel: '昵称',
        namePlaceholder: '输入你的名字，或点右侧随机起名...',
        avatarLabel: '选择头像',
        randomBtn: '随机起名',
        submitFirst: '开始练习',
        submitAdd: '创建用户',
    } : {
        welcomeTitle: 'Welcome to Tappy!',
        welcomeSubtitle: 'Pick a 3D avatar and create your profile',
        addTitle: 'Add New User',
        addSubtitle: 'Create a profile for a new player',
        nameLabel: 'Nickname',
        namePlaceholder: 'Enter your name or roll one...',
        avatarLabel: 'Choose Avatar',
        randomBtn: 'Random',
        submitFirst: 'Start Typing',
        submitAdd: 'Create User',
    };

    const title = isFirstTime ? t.welcomeTitle : t.addTitle;
    const subtitle = isFirstTime ? t.welcomeSubtitle : t.addSubtitle;
    const submitText = isFirstTime ? t.submitFirst : t.submitAdd;

    const handleRandomName = () => {
        const pool = language === 'cn' ? RANDOM_NAMES_CN : RANDOM_NAMES_EN;
        const others = pool.filter((n) => n !== name);
        const pick = others[Math.floor(Math.random() * others.length)] || pool[0];
        setName(pick);
    };

    const handleSubmit = async () => {
        if (!name.trim()) return;

        setIsSubmitting(true);
        try {
            await createUser(name, selectedAvatar);
            setName('');
            setSelectedAvatar(AVATAR_OPTIONS[0]);
            if (onClose) onClose();
        } catch (error) {
            console.error('Failed to create user:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && name.trim()) {
            handleSubmit();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={isFirstTime ? undefined : onClose}
                >
                    <motion.div
                        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border-2 border-white"
                        initial={{ opacity: 0, scale: 0.92, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* 顶部预览头：纯白圆形托盘承载 3D 头像 */}
                        <div className="bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 p-6 text-center relative">
                            {!isFirstTime && onClose && (
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/85 hover:bg-white flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors shadow-xs cursor-pointer"
                                    title="Esc"
                                >
                                    <X size={18} />
                                </button>
                            )}

                            <motion.div
                                key={selectedAvatar}
                                className="w-20 h-20 mx-auto mb-3 rounded-full bg-white shadow-lg border-4 border-white ring-4 ring-purple-200/50 flex items-center justify-center"
                                initial={{ scale: 0.85, rotate: -8 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                            >
                                <UserAvatar avatar={selectedAvatar} size={52} />
                            </motion.div>
                            <h2 className="text-2xl font-cartoon font-bold text-gray-800">{title}</h2>
                            <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
                        </div>

                        {/* 内容表单 */}
                        <div className="p-6 space-y-5">
                            {/* 12 款 3D 头像选择器 */}
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-3">
                                    {t.avatarLabel}
                                </label>
                                <div className="grid grid-cols-6 gap-2.5">
                                    {AVATAR_OPTIONS.map((avatar) => {
                                        const active = selectedAvatar === avatar;
                                        return (
                                            <button
                                                key={avatar}
                                                type="button"
                                                onClick={() => setSelectedAvatar(avatar)}
                                                className={`
                                                    w-12 h-12 rounded-2xl flex items-center justify-center
                                                    transition-all duration-200 hover:scale-110 cursor-pointer
                                                    ${active
                                                        ? 'bg-purple-100 ring-2 ring-kid-purple scale-108 shadow-md'
                                                        : 'bg-slate-50 hover:bg-slate-100 border border-slate-100'
                                                    }
                                                `}
                                            >
                                                <UserAvatar avatar={avatar} size={32} />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* 昵称输入 + 🎲 随机起名按钮 */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-bold text-gray-600">
                                        {t.nameLabel}
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handleRandomName}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 hover:bg-purple-100 text-kid-purple text-xs font-bold transition-colors cursor-pointer"
                                    >
                                        <Dices size={13} />
                                        <span>{t.randomBtn}</span>
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={t.namePlaceholder}
                                    maxLength={8}
                                    className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-kid-purple focus:ring-2 focus:ring-purple-100 outline-none transition-all text-base font-bold text-gray-800"
                                    autoFocus
                                />
                                <div className="flex justify-end mt-1">
                                    <span className="text-xs text-gray-400 tabular-nums">
                                        {name.length}/8
                                    </span>
                                </div>
                            </div>

                            {/* 提交按钮 */}
                            <motion.button
                                type="button"
                                onClick={handleSubmit}
                                disabled={!name.trim() || isSubmitting}
                                className={`
                                    w-full py-3.5 rounded-2xl font-bold text-base
                                    transition-all duration-200
                                    ${name.trim()
                                        ? 'bg-gradient-to-r from-kid-purple to-kid-blue text-white shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.98] cursor-pointer'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }
                                `}
                                whileTap={{ scale: 0.98 }}
                            >
                                {isSubmitting ? '...' : submitText}
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
