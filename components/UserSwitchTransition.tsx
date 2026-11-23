import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '../store/useUserStore';
import { useGameStore } from '../store/useGameStore';
import { UserAvatar } from './UserAvatar';

export const UserSwitchTransition: React.FC = () => {
    const { isSwitching, switchingToUser, clearSwitching } = useUserStore();
    const { language } = useGameStore();

    const t = language === 'cn' ? {
        welcomeBack: '欢迎回来',
    } : {
        welcomeBack: 'Welcome back',
    };

    // Auto-clear the transition after animation completes
    useEffect(() => {
        if (isSwitching) {
            const timer = setTimeout(() => {
                clearSwitching();
            }, 2000); // Total animation duration
            return () => clearTimeout(timer);
        }
    }, [isSwitching, clearSwitching]);

    return (
        <AnimatePresence>
            {isSwitching && switchingToUser && (
                <motion.div
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    {/* Avatar Animation */}
                    <motion.div
                        className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-white/95 shadow-2xl border-4 border-white flex items-center justify-center mb-6"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 15,
                            delay: 0.2
                        }}
                    >
                        <UserAvatar avatar={switchingToUser.avatar} size={84} />
                    </motion.div>

                    {/* Welcome Message */}
                    <motion.div
                        className="text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.4 }}
                    >
                        <p className="text-white/80 text-xl font-medium mb-2">
                            {t.welcomeBack}
                        </p>
                        <motion.h2
                            className="text-white text-4xl md:text-5xl font-cartoon drop-shadow-lg"
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.6, type: "spring", stiffness: 150 }}
                        >
                            {switchingToUser.name}！
                        </motion.h2>
                    </motion.div>

                    {/* Decorative Sparkles */}
                    <motion.div
                        className="absolute top-1/4 left-1/4 text-4xl"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1, rotate: 360 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                    >
                        ✨
                    </motion.div>
                    <motion.div
                        className="absolute top-1/3 right-1/4 text-3xl"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1, rotate: -360 }}
                        transition={{ delay: 0.9, duration: 0.5 }}
                    >
                        ⭐
                    </motion.div>
                    <motion.div
                        className="absolute bottom-1/3 left-1/3 text-5xl"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1, rotate: 180 }}
                        transition={{ delay: 1.0, duration: 0.5 }}
                    >
                        🎉
                    </motion.div>
                    <motion.div
                        className="absolute bottom-1/4 right-1/3 text-4xl"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1, rotate: -180 }}
                        transition={{ delay: 1.1, duration: 0.5 }}
                    >
                        🌟
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
