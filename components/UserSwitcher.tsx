import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, Check } from 'lucide-react';
import { useUserStore } from '../store/useUserStore';
import { useGameStore } from '../store/useGameStore';
import { db, User } from '../db';

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
    const { language } = useGameStore();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Get levels for all users
    const userLevels = useUserLevels(allUsers);

    const t = language === 'cn' ? {
        addUser: '添加用户',
        switchUser: '切换用户',
        noUser: '未选择',
    } : {
        addUser: 'Add User',
        switchUser: 'Switch User',
        noUser: 'No User',
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-white/90 backdrop-blur-sm py-2 px-4 rounded-full shadow-md hover:shadow-lg transition-all border border-gray-100 hover:border-kid-purple"
            >
                {currentUser ? (
                    <>
                        <span className="text-xl">{currentUser.avatar}</span>
                        <span className="font-medium text-gray-700 max-w-20 truncate">
                            {currentUser.name}
                        </span>
                    </>
                ) : (
                    <span className="text-gray-400">{t.noUser}</span>
                )}
                <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in">
                    {/* Other Users */}
                    {otherUsers.length > 0 && (
                        <div className="py-2 border-b border-gray-100">
                            {otherUsers.map(user => {
                                const levelInfo = userLevels[user.id!];
                                return (
                                    <button
                                        key={user.id}
                                        onClick={() => handleSwitchUser(user.id!)}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-purple-50 transition-colors text-left"
                                    >
                                        <span className="text-2xl">{user.avatar}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-gray-700 truncate">
                                                {user.name}
                                            </div>
                                            {levelInfo && (
                                                <div className="text-xs text-gray-400">
                                                    Lv.{levelInfo.level} {levelInfo.title}
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Current User Indicator (when there are other users) */}
                    {currentUser && otherUsers.length > 0 && (
                        <div className="py-2 border-b border-gray-100">
                            <div className="flex items-center gap-3 px-4 py-2 bg-purple-50/50">
                                <span className="text-2xl">{currentUser.avatar}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-gray-700 truncate">
                                        {currentUser.name}
                                    </div>
                                    {userLevels[currentUser.id!] && (
                                        <div className="text-xs text-kid-purple">
                                            Lv.{userLevels[currentUser.id!].level} {userLevels[currentUser.id!].title}
                                        </div>
                                    )}
                                </div>
                                <Check size={16} className="text-kid-purple flex-shrink-0" />
                            </div>
                        </div>
                    )}

                    {/* Add User Button */}
                    <div className="py-2">
                        <button
                            onClick={handleAddUser}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 transition-colors text-left text-kid-blue font-medium"
                        >
                            <Plus size={20} />
                            <span>{t.addUser}</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
