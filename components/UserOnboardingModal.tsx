import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '../store/useUserStore';
import { useGameStore } from '../store/useGameStore';
import { AVATAR_OPTIONS } from '../db';
import { X } from 'lucide-react';

interface UserOnboardingModalProps {
    isOpen: boolean;
    onClose?: () => void;
    isFirstTime?: boolean;
}

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

    const t = language === 'cn' ? {
        welcomeTitle: '欢迎来到 Tappy!',
        welcomeSubtitle: '先给自己起个名字吧',
        addTitle: '添加新用户',
        addSubtitle: '为新玩家创建档案',
        nameLabel: '昵称',
        namePlaceholder: '输入你的名字...',
        avatarLabel: '选择头像',
        submitFirst: '开始练习 🚀',
        submitAdd: '创建用户',
        nameError: '请输入昵称',
    } : {
        welcomeTitle: 'Welcome to Tappy!',
        welcomeSubtitle: "Let's create your profile",
        addTitle: 'Add New User',
        addSubtitle: 'Create a profile for a new player',
        nameLabel: 'Nickname',
        namePlaceholder: 'Enter your name...',
        avatarLabel: 'Choose Avatar',
        submitFirst: 'Start Typing 🚀',
        submitAdd: 'Create User',
        nameError: 'Please enter a nickname',
    };

    const title = isFirstTime ? t.welcomeTitle : t.addTitle;
    const subtitle = isFirstTime ? t.welcomeSubtitle : t.addSubtitle;
    const submitText = isFirstTime ? t.submitFirst : t.submitAdd;

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
                        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 p-6 text-center relative">
                            {!isFirstTime && onClose && (
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            )}

                            <motion.div
                                className="text-6xl mb-3"
                                animate={{ rotate: [0, -10, 10, -10, 0] }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                            >
                                {selectedAvatar}
                            </motion.div>
                            <h2 className="text-2xl font-cartoon text-gray-800">{title}</h2>
                            <p className="text-gray-500 mt-1">{subtitle}</p>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Avatar Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-3">
                                    {t.avatarLabel}
                                </label>
                                <div className="grid grid-cols-6 gap-2">
                                    {AVATAR_OPTIONS.map((avatar) => (
                                        <button
                                            key={avatar}
                                            type="button"
                                            onClick={() => setSelectedAvatar(avatar)}
                                            className={`
                                                w-12 h-12 rounded-xl text-2xl flex items-center justify-center
                                                transition-all duration-200 hover:scale-110
                                                ${selectedAvatar === avatar
                                                    ? 'bg-purple-100 ring-2 ring-kid-purple scale-110 shadow-md'
                                                    : 'bg-gray-50 hover:bg-gray-100'
                                                }
                                            `}
                                        >
                                            {avatar}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Name Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                    {t.nameLabel}
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={t.namePlaceholder}
                                    maxLength={8}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-kid-purple focus:ring-2 focus:ring-purple-100 outline-none transition-all text-lg font-medium"
                                    autoFocus
                                />
                                <div className="flex justify-between mt-1">
                                    <span className="text-xs text-gray-400">
                                        {name.length}/8
                                    </span>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <motion.button
                                onClick={handleSubmit}
                                disabled={!name.trim() || isSubmitting}
                                className={`
                                    w-full py-4 rounded-2xl font-bold text-lg
                                    transition-all duration-200
                                    ${name.trim()
                                        ? 'bg-gradient-to-r from-kid-purple to-kid-blue text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
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
