import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, Check } from 'lucide-react';
import { useUserStore } from '../store/useUserStore';
import { useGameStore } from '../store/useGameStore';
import { db, User } from '../db';
import { UserAvatar } from './UserAvatar';

// Level configuration (shared with UserProfile)
const LEVEL_CONFIG = [
    { level: 1, title: '键盘萌新', titleEn: 'Newbie', minXP: 0 },
    { level: 2, title: '小试牛刀', titleEn: 'Beginner', minXP: 500 },
    { level: 3, title: '初露锋芒', titleEn: 'Rising', minXP: 1500 },
    { level: 4, title: '游刃有余', titleEn: 'Skilled', minXP: 3000 },
    { level: 5, title: '打字小能手', titleEn: 'Adept', minXP: 5000 },
    { level: 6, title: '指尖飞舞', titleEn: 'Expert', minXP: 8000 },
    { level: 7, title: '键盘侠客', titleEn: 'Master', minXP: 12000 },
    { level: 8, title: '极速闪电侠', titleEn: 'Lightning', minXP: 18000 },
    { level: 9, title: '传奇打字员', titleEn: 'Legend', minXP: 25000 },
    { level: 10, title: '键盘之神', titleEn: 'God', minXP: 35000 },
];

function getLevelFromXP(totalXP: number, language: 'en' | 'cn'): { level: number; title: string } {
    let currentLevel = LEVEL_CONFIG[0];

    for (let i = LEVEL_CONFIG.length - 1; i >= 0; i--) {
        if (totalXP >= LEVEL_CONFIG[i].minXP) {
            currentLevel = LEVEL_CONFIG[i];
            break;
        }
    }

    return {
        level: currentLevel.level,
        title: language === 'cn' ? currentLevel.title : currentLevel.titleEn
    };
}

// Hook to get user levels
function useUserLevels(users: User[]): Record<number, { level: number; title: string }> {
    const { language } = useGameStore();
    const [levels, setLevels] = useState<Record<number, { level: number; title: string }>>({});

    useEffect(() => {
        if (users.length === 0) {
            setLevels({});
            return;
        }

        const fetchLevels = async () => {
            const result: Record<number, { level: number; title: string }> = {};

            for (const user of users) {
                if (!user.id) continue;

                try {
                    const records = await db.records
                        .where('userId')
                        .equals(user.id)
                        .toArray();

                    // Calculate XP: stars * 100 + sessions * 50
                    const totalStars = records.reduce((sum, r) => sum + r.stars, 0);
                    const totalXP = totalStars * 100 + records.length * 50;

                    result[user.id] = getLevelFromXP(totalXP, language);
                } catch (error) {
                    result[user.id!] = getLevelFromXP(0, language);
                }
            }

            setLevels(result);
        };

        fetchLevels();
    }, [users, language]);

    return levels;
}

interface UserSwitcherProps {
    onAddUser: () => void;
}

export const UserSwitcher: React.FC<UserSwitcherProps> = ({ onAddUser }) => {
    const { currentUser, allUsers, switchUser, isLoading } = useUserStore();
    const { language, setView } = useGameStore();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Get levels for all users
    const userLevels = useUserLevels(allUsers);

    const t = language === 'cn' ? {
        addUser: '添加新成员',
        switchUser: '切换成员',
        noUser: '未选择',
        currentLabel: '当前玩家',
        viewProfile: '成长档案',
    } : {
        addUser: 'Add Player',
        switchUser: 'Switch Player',
        noUser: 'No User',
        currentLabel: 'Active',
        viewProfile: 'Profile',
    };

    // 点击外部或按 Esc 关闭菜单
    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('keydown', handleEsc);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen]);

    const handleSwitchUser = async (userId: number) => {
        await switchUser(userId);
        setIsOpen(false);
    };

    const handleAddUser = () => {
        setIsOpen(false);
        onAddUser();
    };

    if (isLoading) {
        return (
            <div className="animate-pulse bg-gray-200 rounded-full w-24 h-10" />
        );
    }

    const otherUsers = allUsers.filter(u => u.id !== currentUser?.id);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-white/95 backdrop-blur-sm py-2 px-3.5 rounded-full shadow-sm hover:shadow-md transition-all border border-[#EAE0CF] hover:border-[#1E7F5C]/40 cursor-pointer"
            >
                {currentUser ? (
                    <>
                        <UserAvatar avatar={currentUser.avatar} size={22} />
                        <span className="font-bold text-sm text-[#2B211B] max-w-20 truncate">
                            {currentUser.name}
                        </span>
                    </>
                ) : (
                    <span className="text-gray-400 text-sm">{t.noUser}</span>
                )}
                <ChevronDown
                    size={15}
                    className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-60 bg-white/98 backdrop-blur-md rounded-2xl shadow-xl border border-[#EAE0CF] overflow-hidden z-50 animate-fade-in">
                    {/* 当前玩家迷你档案卡（无论是否单用户都展示，避免菜单空洞） */}
                    {currentUser && (
                        <div className="p-2 border-b border-slate-100">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsOpen(false);
                                    setView('PROFILE');
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-emerald-50/70 hover:bg-emerald-50 transition-colors text-left cursor-pointer"
                            >
                                <div className="w-9 h-9 rounded-full bg-white shadow-xs flex items-center justify-center shrink-0">
                                    <UserAvatar avatar={currentUser.avatar} size={26} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-slate-800 text-sm truncate">
                                        {currentUser.name}
                                    </div>
                                    {userLevels[currentUser.id!] && (
                                        <div className="text-xs font-medium text-[#1E7F5C] truncate">
                                            Lv.{userLevels[currentUser.id!].level} {userLevels[currentUser.id!].title}
                                        </div>
                                    )}
                                </div>
                                <Check size={16} className="text-[#1E7F5C] flex-shrink-0" />
                            </button>
                        </div>
                    )}

                    {/* 其他家庭成员 */}
                    {otherUsers.length > 0 && (
                        <div className="p-2 border-b border-slate-100 space-y-1">
                            <div className="px-2.5 pt-0.5 pb-1 text-[11px] font-bold text-slate-400">
                                {t.switchUser}
                            </div>
                            {otherUsers.map(user => {
                                const levelInfo = userLevels[user.id!];
                                return (
                                    <button
                                        key={user.id}
                                        type="button"
                                        onClick={() => handleSwitchUser(user.id!)}
                                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors text-left cursor-pointer"
                                    >
                                        <UserAvatar avatar={user.avatar} size={26} />
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-slate-700 text-sm truncate">
                                                {user.name}
                                            </div>
                                            {levelInfo && (
                                                <div className="text-xs text-slate-400">
                                                    Lv.{levelInfo.level} {levelInfo.title}
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* 添加新成员按钮 */}
                    <div className="p-2">
                        <button
                            type="button"
                            onClick={handleAddUser}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-emerald-50/70 transition-colors text-left text-[#1E7F5C] font-bold text-sm cursor-pointer"
                        >
                            <span className="w-7 h-7 rounded-full bg-emerald-100/80 flex items-center justify-center">
                                <Plus size={16} />
                            </span>
                            <span>{t.addUser}</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
