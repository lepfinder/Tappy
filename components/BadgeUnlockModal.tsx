import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '../data/badges';

interface BadgeUnlockModalProps {
    badges: Badge[];
    onClose: () => void;
    language: string;
}

export const BadgeUnlockModal: React.FC<BadgeUnlockModalProps> = ({ badges, onClose, language }) => {
    if (badges.length === 0) return null;

    const t = language === 'cn' ? {
        title: '🎉 新勋章解锁！',
        button: '太棒了！'
    } : {
        title: '🎉 New Badge Unlocked!',
        button: 'Awesome!'
    };

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                {/* Confetti effect with CSS */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(30)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-3 h-3"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: '-20px',
                                backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][i % 6],
                                borderRadius: Math.random() > 0.5 ? '50%' : '0%',
                            }}
                            initial={{ y: -20, rotate: 0, opacity: 1 }}
                            animate={{
                                y: window.innerHeight + 50,
                                rotate: Math.random() * 720 - 360,
                                opacity: [1, 1, 0],
                            }}
                            transition={{
                                duration: 2 + Math.random() * 2,
                                delay: Math.random() * 0.5,
                                ease: 'easeIn',
                            }}
                        />
                    ))}
                </div>

                <motion.div
                    className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden"
                    initial={{ scale: 0.5, opacity: 0, y: 50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.5, opacity: 0, y: 50 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 via-orange-50 to-pink-100 opacity-50" />

                    <div className="relative z-10">
                        {/* Title */}
                        <motion.h2
                            className="text-2xl font-bold text-center text-gray-800 mb-6"
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            {t.title}
                        </motion.h2>

                        {/* Badge display */}
                        <div className="flex flex-wrap justify-center gap-4 mb-8">
                            {badges.map((badge, idx) => (
                                <motion.div
                                    key={badge.id}
                                    className="flex flex-col items-center"
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 260,
                                        damping: 20,
                                        delay: 0.3 + idx * 0.15
                                    }}
                                >
                                    {/* Badge icon with shine effect */}
                                    <div className="relative">
                                        <motion.div
                                            className="w-24 h-24 bg-gradient-to-br from-yellow-200 via-yellow-100 to-orange-100 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden"
                                            animate={{
                                                boxShadow: [
                                                    '0 0 20px rgba(255, 215, 0, 0.3)',
                                                    '0 0 40px rgba(255, 215, 0, 0.6)',
                                                    '0 0 20px rgba(255, 215, 0, 0.3)',
                                                ],
                                            }}
                                            transition={{
                                                duration: 1.5,
                                                repeat: Infinity,
                                                ease: 'easeInOut',
                                            }}
                                        >
                                            {badge.icon ? (
                                                <img src={badge.icon} alt={badge.nameEn} className="w-20 h-20 object-contain" />
                                            ) : (
                                                <span className="text-6xl">{badge.emoji}</span>
                                            )}
                                        </motion.div>

                                        {/* Sparkles */}
                                        {[...Array(4)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                className="absolute text-yellow-400 text-sm"
                                                style={{
                                                    top: `${['-10%', '0%', '80%', '90%'][i]}`,
                                                    left: `${['-5%', '90%', '-10%', '85%'][i]}`,
                                                }}
                                                animate={{
                                                    scale: [1, 1.5, 1],
                                                    opacity: [0.5, 1, 0.5],
                                                }}
                                                transition={{
                                                    duration: 1,
                                                    repeat: Infinity,
                                                    delay: i * 0.2,
                                                }}
                                            >
                                                ✨
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Badge name */}
                                    <motion.div
                                        className="mt-3 text-center"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 + idx * 0.15 }}
                                    >
                                        <div className="font-bold text-gray-800">
                                            {language === 'cn' ? badge.name : badge.nameEn}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {language === 'cn' ? badge.description : badge.descriptionEn}
                                        </div>
                                    </motion.div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Close button */}
                        <motion.button
                            onClick={onClose}
                            className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-bold rounded-full text-lg shadow-lg hover:shadow-xl transition-shadow"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {t.button}
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
