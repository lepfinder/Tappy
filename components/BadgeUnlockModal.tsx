import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Badge } from '../data/badges';

interface BadgeUnlockModalProps {
    badges: Badge[];
    onClose: () => void;
    language: string;
}

export const BadgeUnlockModal: React.FC<BadgeUnlockModalProps> = ({ badges, onClose, language }) => {
    useEffect(() => {
        if (badges.length === 0) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' || e.key === 'Enter') {
                onClose();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [badges.length, onClose]);

    if (badges.length === 0 || typeof document === 'undefined') return null;

    const t = language === 'cn' ? {
        title: '🎉 新勋章解锁！',
        subtitle: badges.length > 1 ? `太厉害了，一口气点亮 ${badges.length} 枚新勋章！` : '继续加油，收集更多荣耀勋章吧！',
        button: '太棒了！'
    } : {
        title: '🎉 New Badge Unlocked!',
        subtitle: badges.length > 1 ? `Amazing! You unlocked ${badges.length} new badges!` : 'Keep typing to collect more trophies!',
        button: 'Awesome!'
    };

    const isMulti = badges.length > 2;

    const modalContent = (
        <AnimatePresence>
            <motion.div
                role="dialog"
                aria-modal="true"
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                {/* 彩带粒子 */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(28)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-3 h-3"
                            style={{
                                left: `${(i * 37) % 100}%`,
                                top: '-20px',
                                backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][i % 6],
                                borderRadius: i % 2 === 0 ? '50%' : '2px',
                            }}
                            initial={{ y: -20, rotate: 0, opacity: 1 }}
                            animate={{
                                y: window.innerHeight + 50,
                                rotate: ((i % 2 === 0 ? 1 : -1) * (280 + (i * 23) % 360)),
                                opacity: [1, 1, 0],
                            }}
                            transition={{
                                duration: 2.2 + (i % 5) * 0.35,
                                delay: (i % 6) * 0.08,
                                ease: 'easeIn',
                            }}
                        />
                    ))}
                </div>

                <motion.div
                    className={`bg-white rounded-3xl shadow-2xl relative overflow-hidden w-full max-h-[85vh] flex flex-col border-2 border-amber-100 ${
                        isMulti ? 'max-w-lg' : 'max-w-sm'
                    }`}
                    initial={{ scale: 0.75, opacity: 0, y: 36 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.85, opacity: 0, y: 24 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* 柔和暖金背景光晕 */}
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-50/90 via-white to-orange-50/80 pointer-events-none" />

                    {/* 右上角关闭按钮 */}
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-amber-100/80 hover:bg-amber-200 text-amber-900 flex items-center justify-center transition-colors cursor-pointer"
                    >
                        <X size={16} />
                    </button>

                    {/* 顶部固定标题 */}
                    <div className="relative z-10 px-6 pt-6 pb-3 text-center shrink-0">
                        <motion.h2
                            className="text-2xl font-black text-[#2B211B]"
                            initial={{ y: -14, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.12 }}
                        >
                            {t.title}
                        </motion.h2>
                        <p className="text-xs sm:text-sm font-semibold text-[#7A6A5F] mt-1">
                            {t.subtitle}
                        </p>
                    </div>

                    {/* 中间可滚动勋章网格（彻底避免多枚勋章溢出裁切） */}
                    <div className="relative z-10 px-6 py-3 overflow-y-auto flex-1">
                        <div
                            className={`grid gap-4 justify-items-center ${
                                badges.length === 1
                                    ? 'grid-cols-1'
                                    : badges.length === 2
                                      ? 'grid-cols-2'
                                      : 'grid-cols-2 sm:grid-cols-3'
                            }`}
                        >
                            {badges.map((badge, idx) => (
                                <motion.div
                                    key={badge.id}
                                    className="flex flex-col items-center w-full max-w-[140px] bg-white/80 rounded-2xl p-3 border border-amber-100/90 shadow-xs"
                                    initial={{ scale: 0.6, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 280,
                                        damping: 22,
                                        delay: 0.18 + idx * 0.08
                                    }}
                                >
                                    <div className="relative">
                                        <motion.div
                                            className="w-20 h-20 bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-100 rounded-2xl flex items-center justify-center shadow-md overflow-hidden border border-amber-200/70"
                                            animate={{
                                                boxShadow: [
                                                    '0 0 12px rgba(245, 158, 11, 0.22)',
                                                    '0 0 24px rgba(245, 158, 11, 0.45)',
                                                    '0 0 12px rgba(245, 158, 11, 0.22)',
                                                ],
                                            }}
                                            transition={{
                                                duration: 1.8,
                                                repeat: Infinity,
                                                ease: 'easeInOut',
                                            }}
                                        >
                                            {badge.icon ? (
                                                <img
                                                    src={badge.icon}
                                                    alt={badge.nameEn}
                                                    className="w-16 h-16 object-contain"
                                                />
                                            ) : (
                                                <span className="text-5xl">{badge.emoji}</span>
                                            )}
                                        </motion.div>
                                    </div>

                                    <div className="mt-2.5 text-center">
                                        <div className="font-extrabold text-sm text-[#2B211B] leading-snug">
                                            {language === 'cn' ? badge.name : badge.nameEn}
                                        </div>
                                        <div className="text-[11px] text-[#7A6A5F] mt-0.5 leading-tight">
                                            {language === 'cn' ? badge.description : badge.descriptionEn}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* 底部固定确认按钮（永远可见、不被导航栏遮挡） */}
                    <div className="relative z-10 px-6 pt-3 pb-6 shrink-0">
                        <motion.button
                            type="button"
                            onClick={onClose}
                            className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white font-black rounded-2xl text-base shadow-lg hover:shadow-xl transition-all cursor-pointer"
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

    return createPortal(modalContent, document.body);
};
