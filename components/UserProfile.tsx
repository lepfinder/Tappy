import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Zap, Trophy, Calendar, Target, ArrowLeft, Star, Edit3, X, Check, Users, Trash2, AlertTriangle } from 'lucide-react';
import { db, PracticeRecord, AVATAR_OPTIONS } from '../db';
import { useUserStore } from '../store/useUserStore';
import { useGameStore } from '../store/useGameStore';
import { BadgeUnlockModal } from './BadgeUnlockModal';
import { UserAvatar } from './UserAvatar';

// Level configuration
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

function getLevelInfo(totalXP: number) {
    let currentLevel = LEVEL_CONFIG[0];
    let nextLevel = LEVEL_CONFIG[1];

    for (let i = LEVEL_CONFIG.length - 1; i >= 0; i--) {
        if (totalXP >= LEVEL_CONFIG[i].minXP) {
            currentLevel = LEVEL_CONFIG[i];
            nextLevel = LEVEL_CONFIG[i + 1] || LEVEL_CONFIG[i];
            break;
        }
    }

    const xpInCurrentLevel = totalXP - currentLevel.minXP;
    const xpNeededForNext = nextLevel.minXP - currentLevel.minXP;
    const xpRemaining = Math.max(0, nextLevel.minXP - totalXP);
    const progress = xpNeededForNext > 0 ? (xpInCurrentLevel / xpNeededForNext) * 100 : 100;

    return {
        level: currentLevel.level,
        title: currentLevel.title,
        titleEn: currentLevel.titleEn,
        progress: Math.min(progress, 100),
        xpCurrent: xpInCurrentLevel,
        xpNeeded: xpNeededForNext,
        xpRemaining,
        totalXP
    };
}

// Stats interface
interface UserStats {
    totalTime: number; // in seconds
    bestWpm: number;
    totalSessions: number;
    avgAccuracy: number;
    totalStars: number;
    recentRecords: PracticeRecord[];
    chartData: { index: number; wpm: number; accuracy: number }[];
    heatmapData: { date: string; duration: number }[]; // Heatmap data for last 3 months
    isLoading: boolean;
}

// Custom hook for fetching user stats
function useUserStats(userId: number | undefined): UserStats {
    const [stats, setStats] = useState<UserStats>({
        totalTime: 0,
        bestWpm: 0,
        totalSessions: 0,
        avgAccuracy: 0,
        totalStars: 0,
        recentRecords: [],
        chartData: [],
        heatmapData: [],
        isLoading: true
    });

    useEffect(() => {
        // Reset to loading state whenever userId changes
        setStats({
            totalTime: 0,
            bestWpm: 0,
            totalSessions: 0,
            avgAccuracy: 0,
            totalStars: 0,
            recentRecords: [],
            chartData: [],
            heatmapData: [],
            isLoading: true
        });

        if (!userId) {
            setStats(prev => ({ ...prev, isLoading: false }));
            return;
        }

        const fetchStats = async () => {
            try {
                const records = await db.records
                    .where('userId')
                    .equals(userId)
                    .toArray();

                // If no records, reset to empty state
                if (records.length === 0) {
                    setStats({
                        totalTime: 0,
                        bestWpm: 0,
                        totalSessions: 0,
                        avgAccuracy: 0,
                        totalStars: 0,
                        recentRecords: [],
                        chartData: [],
                        heatmapData: [],
                        isLoading: false
                    });
                    return;
                }

                // Calculate stats
                const totalTime = records.reduce((sum, r) => sum + (r.timeSpent || 0), 0);
                const bestWpm = Math.max(...records.map(r => r.wpm));
                const avgAccuracy = Math.round(
                    records.reduce((sum, r) => sum + r.accuracy, 0) / records.length
                );
                const totalStars = records.reduce((sum, r) => sum + r.stars, 0);

                // Sort by timestamp descending
                const sorted = [...records].sort((a, b) => b.timestamp - a.timestamp);
                const recentRecords = sorted.slice(0, 5);

                // Chart data (last 10 records, use index for x-axis)
                const last10 = sorted.slice(0, 10).reverse();
                const chartData = last10.map((r, idx) => ({
                    index: idx + 1,
                    wpm: r.wpm,
                    accuracy: r.accuracy
                }));

                // Heatmap data - last 3 months
                const threeMonthsAgo = new Date();
                threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
                threeMonthsAgo.setHours(0, 0, 0, 0);

                // Group records by date
                const durationByDate = new Map<string, number>();
                records.forEach(r => {
                    if (r.timestamp >= threeMonthsAgo.getTime()) {
                        const date = format(new Date(r.timestamp), 'yyyy-MM-dd');
                        durationByDate.set(date, (durationByDate.get(date) || 0) + (r.timeSpent || 0));
                    }
                });

                // Convert to array
                const heatmapData = Array.from(durationByDate.entries()).map(([date, duration]) => ({
                    date,
                    duration
                }));

                setStats({
                    totalTime,
                    bestWpm,
                    totalSessions: records.length,
                    avgAccuracy,
                    totalStars,
                    recentRecords,
                    chartData,
                    heatmapData,
                    isLoading: false
                });
            } catch (error) {
                console.error('Failed to fetch user stats:', error);
                setStats({
                    totalTime: 0,
                    bestWpm: 0,
                    totalSessions: 0,
                    avgAccuracy: 0,
                    totalStars: 0,
                    recentRecords: [],
                    chartData: [],
                    heatmapData: [],
                    isLoading: false
                });
            }
        };

        fetchStats();
    }, [userId]);

    return stats;
}

// Colors for different users in chart comparison
const USER_COLORS = [
    '#8B5CF6', // purple (current user)
    '#10B981', // green
    '#F59E0B', // amber
    '#EF4444', // red
    '#3B82F6', // blue
    '#EC4899', // pink
    '#14B8A6', // teal
    '#F97316', // orange
];

// Interface for multi-user chart data
interface MultiUserChartData {
    index: number;
    [userName: string]: string | number; // dynamic user names as keys
}

interface UserChartInfo {
    name: string;
    avatar: string;
    color: string;
}

// Custom hook for fetching all users' chart data for comparison
function useAllUsersChartData(currentUserId: number | undefined) {
    const { allUsers } = useUserStore();
    const [chartData, setChartData] = useState<MultiUserChartData[]>([]);
    const [userInfos, setUserInfos] = useState<UserChartInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (allUsers.length === 0) {
            setChartData([]);
            setUserInfos([]);
            setIsLoading(false);
            return;
        }

        const fetchAllData = async () => {
            setIsLoading(true);
            try {
                // Prepare user infos with colors
                const infos: UserChartInfo[] = allUsers.map((user, idx) => ({
                    name: user.name,
                    avatar: user.avatar,
                    // Current user gets first color, others follow
                    color: user.id === currentUserId ? USER_COLORS[0] : USER_COLORS[(idx + 1) % USER_COLORS.length]
                }));
                setUserInfos(infos);

                // Fetch records for all users and organize by user
                const userRecordsMap: Map<string, { timestamp: number; wpm: number }[]> = new Map();

                for (const user of allUsers) {
                    if (!user.id) continue;
                    const records = await db.records
                        .where('userId')
                        .equals(user.id)
                        .toArray();

                    // Sort by timestamp ascending
                    const sortedRecords = records
                        .map(r => ({ timestamp: r.timestamp, wpm: r.wpm }))
                        .sort((a, b) => a.timestamp - b.timestamp);

                    userRecordsMap.set(user.name, sortedRecords);
                }

                // Collect all unique timestamps from all users
                const allTimestamps = new Set<number>();
                userRecordsMap.forEach(records => {
                    records.forEach(r => allTimestamps.add(r.timestamp));
                });

                if (allTimestamps.size === 0) {
                    setChartData([]);
                    setIsLoading(false);
                    return;
                }

                // Sort timestamps ascending
                let sortedTimestamps = [...allTimestamps].sort((a, b) => a - b);

                // If too many data points, sample evenly to keep chart readable (max 50 points)
                const MAX_DATA_POINTS = 50;
                if (sortedTimestamps.length > MAX_DATA_POINTS) {
                    const step = Math.ceil(sortedTimestamps.length / MAX_DATA_POINTS);
                    const sampled: number[] = [];
                    for (let i = 0; i < sortedTimestamps.length; i += step) {
                        sampled.push(sortedTimestamps[i]);
                    }
                    // Always include the last timestamp
                    if (sampled[sampled.length - 1] !== sortedTimestamps[sortedTimestamps.length - 1]) {
                        sampled.push(sortedTimestamps[sortedTimestamps.length - 1]);
                    }
                    sortedTimestamps = sampled;
                }

                // Build chart data using index instead of timestamps
                // Use the max record count among all users
                let maxRecords = 0;
                userRecordsMap.forEach(records => {
                    maxRecords = Math.max(maxRecords, records.length);
                });

                // Limit to last 50 records
                const displayCount = Math.min(maxRecords, 50);
                const data: MultiUserChartData[] = [];

                for (let i = 0; i < displayCount; i++) {
                    const point: MultiUserChartData = {
                        index: i + 1
                    };

                    // For each user, get their record at this index from the end
                    allUsers.forEach(user => {
                        const userRecords = userRecordsMap.get(user.name) || [];
                        const startIdx = Math.max(0, userRecords.length - displayCount);
                        const recordIdx = startIdx + i;
                        if (recordIdx < userRecords.length) {
                            point[user.name] = userRecords[recordIdx].wpm;
                        }
                    });

                    data.push(point);
                }

                setChartData(data);
            } catch (error) {
                console.error('Failed to fetch all users chart data:', error);
                setChartData([]);
            }
            setIsLoading(false);
        };

        fetchAllData();
    }, [allUsers, currentUserId]);

    return { chartData, userInfos, isLoading };
}

// Import badges from data file
import { BADGES, Badge } from '../data/badges';
import { useBadgeSystem, getUnlockedBadges } from '../hooks/useBadgeSystem';

// 4 档金属/宝石品阶材质配置（彻底告别清一色淡黄框）
type MedalTierKey = 'emerald' | 'sapphire' | 'gold' | 'mythic';

const MEDAL_TIERS: Record<
    MedalTierKey,
    {
        labelCn: string;
        labelEn: string;
        ringGradient: string;
        innerBg: string;
        cardBg: string;
        cardBorder: string;
        pillBg: string;
        pillText: string;
        glow: string;
    }
> = {
    emerald: {
        labelCn: '翡翠',
        labelEn: 'Emerald',
        ringGradient: 'linear-gradient(135deg, #34D399 0%, #10B981 55%, #059669 100%)',
        innerBg: 'radial-gradient(circle at 30% 25%, #ECFDF5 0%, #D1FAE5 100%)',
        cardBg: 'linear-gradient(180deg, #FFFFFF 0%, #F0FDF4 100%)',
        cardBorder: '#A7F3D0',
        pillBg: 'bg-emerald-100/90',
        pillText: 'text-emerald-700',
        glow: '0 8px 20px -6px rgba(16, 185, 129, 0.35)'
    },
    sapphire: {
        labelCn: '星辉',
        labelEn: 'Sapphire',
        ringGradient: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 55%, #2563EB 100%)',
        innerBg: 'radial-gradient(circle at 30% 25%, #EFF6FF 0%, #DBEAFE 100%)',
        cardBg: 'linear-gradient(180deg, #FFFFFF 0%, #EFF6FF 100%)',
        cardBorder: '#BFDBFE',
        pillBg: 'bg-blue-100/90',
        pillText: 'text-blue-700',
        glow: '0 8px 20px -6px rgba(59, 130, 246, 0.35)'
    },
    gold: {
        labelCn: '荣耀',
        labelEn: 'Gold',
        ringGradient: 'linear-gradient(135deg, #FDE047 0%, #F59E0B 55%, #D97706 100%)',
        innerBg: 'radial-gradient(circle at 30% 25%, #FFFBEB 0%, #FEF3C7 100%)',
        cardBg: 'linear-gradient(180deg, #FFFFFF 0%, #FFFBEB 100%)',
        cardBorder: '#FDE68A',
        pillBg: 'bg-amber-100/90',
        pillText: 'text-amber-800',
        glow: '0 8px 20px -6px rgba(245, 158, 11, 0.38)'
    },
    mythic: {
        labelCn: '传奇',
        labelEn: 'Mythic',
        ringGradient: 'linear-gradient(135deg, #E879F9 0%, #8B5CF6 50%, #F59E0B 100%)',
        innerBg: 'radial-gradient(circle at 30% 25%, #FAF5FF 0%, #F3E8FF 100%)',
        cardBg: 'linear-gradient(180deg, #FFFFFF 0%, #FAF5FF 100%)',
        cardBorder: '#DDD6FE',
        pillBg: 'bg-purple-100/90',
        pillText: 'text-purple-700',
        glow: '0 8px 22px -6px rgba(139, 92, 246, 0.42)'
    }
};

function getBadgeTier(badge: Badge): MedalTierKey {
    if (badge.category === 'Master' || badge.id === 'perfectionist') return 'mythic';
    if (badge.category === 'Starter') return 'emerald';
    if (badge.category === 'Speed' || badge.category === 'Content') return 'sapphire';
    return 'gold';
}

// Badge Section Component - 4 档材质立体勋章展柜
const BadgeSection: React.FC<{
    userId: number;
    language: string;
}> = ({ userId, language }) => {
    const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
    const [unlockedBadgeIds, setUnlockedBadgeIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);

    // New state for modal
    const [showBadgeModal, setShowBadgeModal] = useState(false);
    const [newlyUnlockedBadges, setNewlyUnlockedBadges] = useState<Badge[]>([]);

    const { checkAllHistoricalBadges } = useBadgeSystem();

    // Fetch unlocked badges from database and check history
    useEffect(() => {
        const fetchAndCheckBadges = async () => {
            try {
                // 1. Load currently unlocked badges
                const unlocked = await getUnlockedBadges(userId);
                const currentIds = new Set(unlocked.map(b => b.id));
                setUnlockedBadgeIds(currentIds);

                // 2. Check history for retroactive unlocking
                const newBadges = await checkAllHistoricalBadges(userId);

                if (newBadges.length > 0) {
                    setNewlyUnlockedBadges(newBadges);
                    setShowBadgeModal(true);

                    // Update unlocked set
                    const updatedIds = new Set(currentIds);
                    newBadges.forEach(b => updatedIds.add(b.id));
                    setUnlockedBadgeIds(updatedIds);
                }
            } catch (error) {
                console.error('Failed to fetch/check badges:', error);
            }
            setIsLoading(false);
        };
        fetchAndCheckBadges();
    }, [userId, checkAllHistoricalBadges]);

    const t = language === 'cn' ? {
        title: '成就墙',
    } : {
        title: 'Achievements',
    };

    if (isLoading) {
        return (
            <motion.div
                className="bg-white rounded-3xl p-6 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
            >
                <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                    🏅 {t.title}
                </h3>
                <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-kid-purple border-t-transparent" />
                </div>
            </motion.div>
        );
    }

    const progressPct = Math.round((unlockedBadgeIds.size / BADGES.length) * 100);

    // 已解锁的勋章自动排在前面，并支持全部/已解锁/待挑战筛选
    const displayBadges = [...BADGES]
        .sort((a, b) => Number(unlockedBadgeIds.has(b.id)) - Number(unlockedBadgeIds.has(a.id)))
        .filter((b) => {
            if (filter === 'unlocked') return unlockedBadgeIds.has(b.id);
            if (filter === 'locked') return !unlockedBadgeIds.has(b.id);
            return true;
        });

    const filterLabels =
        language === 'cn'
            ? { all: '全部', unlocked: '已点亮', locked: '待挑战' }
            : { all: 'All', unlocked: 'Unlocked', locked: 'Locked' };

    return (
        <motion.div
            className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 sm:p-7 shadow-lg border-2 border-white"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            {/* Celebration Modal */}
            {showBadgeModal && (
                <BadgeUnlockModal
                    badges={newlyUnlockedBadges}
                    onClose={() => setShowBadgeModal(false)}
                    language={language}
                />
            )}

            {/* 勋章陈列馆顶栏：标题 + 筛选胶囊 + 收集进度 */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center shadow-xs">
                        <img src="/icons/fluent3d/trophy.webp" alt="" className="w-6 h-6 object-contain" />
                    </div>
                    <div>
                        <h3 className="text-lg font-extrabold text-slate-800 leading-tight flex items-center gap-2">
                            <span>{language === 'cn' ? '荣誉勋章馆' : 'Trophy Showcase'}</span>
                            <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 tabular-nums">
                                {unlockedBadgeIds.size} / {BADGES.length}
                            </span>
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                            {language === 'cn'
                                ? `已解锁 ${progressPct}% 荣誉藏品，点击不同品阶查看目标`
                                : `${progressPct}% collected — unlock Emerald, Sapphire, Gold & Mythic medals`}
                        </p>
                    </div>
                </div>

                {/* 筛选胶囊 */}
                <div className="flex items-center bg-slate-100/90 p-1 rounded-full gap-1">
                    {(['all', 'unlocked', 'locked'] as const).map((key) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setFilter(key)}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                filter === key
                                    ? 'bg-white text-slate-800 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            {filterLabels[key]}
                        </button>
                    ))}
                </div>
            </div>

            {/* 竖版立体金属勋章展柜网格 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {displayBadges.map((badge) => {
                    const isUnlocked = unlockedBadgeIds.has(badge.id);
                    const tier = MEDAL_TIERS[getBadgeTier(badge)];

                    return (
                        <motion.div
                            key={badge.id}
                            whileHover={{ y: -4 }}
                            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                            style={
                                isUnlocked
                                    ? {
                                          background: tier.cardBg,
                                          borderColor: tier.cardBorder,
                                          boxShadow: '0 6px 18px -10px rgba(15,23,42,0.12)'
                                      }
                                    : undefined
                            }
                            className={`relative rounded-2xl p-4 border-2 flex flex-col items-center text-center transition-all ${
                                isUnlocked
                                    ? ''
                                    : 'bg-slate-50/75 border-dashed border-slate-200/90'
                            }`}
                        >
                            {/* 右上角品阶小标（仅已解锁展示） */}
                            {isUnlocked && (
                                <span
                                    className={`absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${tier.pillBg} ${tier.pillText}`}
                                >
                                    {language === 'cn' ? tier.labelCn : tier.labelEn}
                                </span>
                            )}

                            {/* 勋章本体：已解锁为双层立体金属光泽奖章，未解锁为内凹磨砂卡槽 */}
                            <div className="relative mt-1 mb-3">
                                {isUnlocked ? (
                                    <div
                                        className="w-[68px] h-[68px] rounded-full p-[3.5px] relative"
                                        style={{
                                            background: tier.ringGradient,
                                            boxShadow: tier.glow
                                        }}
                                    >
                                        {/* 金属内盘 + 斜向玻璃高光 */}
                                        <div
                                            className="w-full h-full rounded-full flex items-center justify-center relative overflow-hidden border border-white/80"
                                            style={{ background: tier.innerBg }}
                                        >
                                            <div
                                                className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-white/55 blur-[1px] pointer-events-none"
                                            />
                                            {badge.icon ? (
                                                <img
                                                    src={badge.icon}
                                                    alt={badge.nameEn}
                                                    loading="lazy"
                                                    className="w-9 h-9 object-contain relative z-10 drop-shadow-sm"
                                                />
                                            ) : (
                                                <span className="text-2xl relative z-10">{badge.emoji}</span>
                                            )}
                                        </div>
                                        {/* 底部小星芒缀饰 */}
                                        <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-1.5 py-0 rounded-full bg-white shadow-sm border border-amber-200 text-[9px] font-black text-amber-500 leading-4">
                                            ★
                                        </span>
                                    </div>
                                ) : (
                                    <div
                                        className="w-[68px] h-[68px] rounded-full flex items-center justify-center relative border border-slate-200/80"
                                        style={{
                                            background: '#F1F5F9',
                                            boxShadow: 'inset 0 3px 7px rgba(15, 23, 42, 0.08)'
                                        }}
                                    >
                                        {badge.icon ? (
                                            <img
                                                src={badge.icon}
                                                alt={badge.nameEn}
                                                loading="lazy"
                                                className="w-8 h-8 object-contain grayscale opacity-25"
                                            />
                                        ) : (
                                            <span className="text-2xl grayscale opacity-25">{badge.emoji}</span>
                                        )}
                                        <span className="absolute -bottom-1 right-0 w-5 h-5 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center text-[10px]">
                                            🔒
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* 勋章名称 */}
                            <h4
                                className={`text-sm font-extrabold leading-snug ${
                                    isUnlocked ? 'text-slate-800' : 'text-slate-500'
                                }`}
                            >
                                {language === 'cn' ? badge.name : badge.nameEn}
                            </h4>

                            {/* 解锁条件 */}
                            <p
                                className={`text-[11px] leading-snug mt-1 line-clamp-2 ${
                                    isUnlocked ? 'text-slate-500' : 'text-slate-400'
                                }`}
                            >
                                {language === 'cn' ? badge.description : badge.descriptionEn}
                            </p>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
};

// Stat Card Component - 横排精致 3D 数据卡（左图标右大数字，紧凑无空洞）
const StatCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string | number;
    iconBg: string;
    delay: number;
}> = ({ icon, label, value, iconBg, delay }) => (
    <motion.div
        className="bg-white/95 backdrop-blur-sm rounded-3xl p-4 sm:p-5 shadow-md border-2 border-white flex items-center gap-4 hover:shadow-lg transition-shadow"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.35 }}
    >
        <div className={`w-13 h-13 rounded-2xl ${iconBg} flex items-center justify-center shrink-0 shadow-xs border border-black/[0.03]`}>
            {icon}
        </div>
        <div className="min-w-0">
            <div className="text-xs font-bold text-slate-400">{label}</div>
            <div className="text-2xl sm:text-3xl font-black text-slate-800 tabular-nums leading-tight mt-0.5 truncate">
                {value}
            </div>
        </div>
    </motion.div>
);

// Practice Heatmap Component (GitHub-style contribution graph)
const PracticeHeatmap: React.FC<{
    heatmapData: { date: string; duration: number }[];
    language: string;
}> = ({ heatmapData, language }) => {
    const [tooltipData, setTooltipData] = useState<{ date: string; duration: number; x: number; y: number } | null>(null);

    const t = language === 'cn' ? {
        title: '我的坚持',
        noActivity: '无练习',
        minutes: '分钟',
    } : {
        title: 'My Consistency',
        noActivity: 'No activity',
        minutes: 'min',
    };

    // Generate last 3 months of dates
    const generateDates = () => {
        const dates: Date[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Go back to start of week for alignment
        const startOffset = today.getDay(); // 0 = Sunday
        const endDate = new Date(today);

        // Generate ~13 weeks (3 months worth)
        const weeksToShow = 13;
        const daysToShow = weeksToShow * 7;

        for (let i = daysToShow - 1 + startOffset; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            dates.push(date);
        }
        return dates;
    };

    const dates = generateDates();

    // Create a map for quick lookup
    const durationMap = new Map<string, number>();
    heatmapData.forEach(d => durationMap.set(d.date, d.duration));

    // Find max duration for color scaling
    const maxDuration = Math.max(...heatmapData.map(d => d.duration), 1);

    // Get color intensity based on duration
    const getColor = (duration: number) => {
        if (duration === 0) return 'bg-gray-100';
        const intensity = Math.min(duration / maxDuration, 1);
        if (intensity < 0.25) return 'bg-green-200';
        if (intensity < 0.5) return 'bg-green-300';
        if (intensity < 0.75) return 'bg-green-400';
        return 'bg-green-500';
    };

    // Group dates by week
    const weeks: Date[][] = [];
    for (let i = 0; i < dates.length; i += 7) {
        weeks.push(dates.slice(i, i + 7));
    }

    const weekDays = language === 'cn'
        ? ['日', '一', '二', '三', '四', '五', '六']
        : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    return (
        <motion.div
            className="bg-white rounded-3xl p-6 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
        >
            <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                📅 {t.title}
            </h3>

            <div className="flex gap-1 overflow-x-auto pb-2">
                {/* Week day labels */}
                <div className="flex flex-col gap-1 mr-1">
                    {weekDays.map((day, idx) => (
                        <div
                            key={idx}
                            className="w-3 h-3 text-[8px] text-gray-400 flex items-center justify-center"
                        >
                            {idx % 2 === 1 ? day : ''}
                        </div>
                    ))}
                </div>

                {/* Weeks */}
                {weeks.map((week, weekIdx) => (
                    <div key={weekIdx} className="flex flex-col gap-1">
                        {week.map((date, dayIdx) => {
                            const dateStr = format(date, 'yyyy-MM-dd');
                            const duration = durationMap.get(dateStr) || 0;
                            const colorClass = getColor(duration);
                            const isToday = format(new Date(), 'yyyy-MM-dd') === dateStr;

                            return (
                                <div
                                    key={dayIdx}
                                    className={`
                                        w-3 h-3 rounded-sm cursor-pointer transition-transform hover:scale-125
                                        ${colorClass}
                                        ${isToday ? 'ring-1 ring-kid-purple' : ''}
                                    `}
                                    onMouseEnter={(e) => {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        setTooltipData({
                                            date: dateStr,
                                            duration,
                                            x: rect.left + rect.width / 2,
                                            y: rect.top
                                        });
                                    }}
                                    onMouseLeave={() => setTooltipData(null)}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Color Legend */}
            <div className="flex items-center justify-end gap-1 mt-3 text-xs text-gray-400">
                <span>{t.noActivity}</span>
                <div className="w-3 h-3 rounded-sm bg-gray-100" />
                <div className="w-3 h-3 rounded-sm bg-green-200" />
                <div className="w-3 h-3 rounded-sm bg-green-300" />
                <div className="w-3 h-3 rounded-sm bg-green-400" />
                <div className="w-3 h-3 rounded-sm bg-green-500" />
                <span>More</span>
            </div>

            {/* Tooltip */}
            {tooltipData && (
                <div
                    className="fixed z-50 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg pointer-events-none"
                    style={{
                        left: tooltipData.x,
                        top: tooltipData.y - 30,
                        transform: 'translateX(-50%)'
                    }}
                >
                    <div>{format(new Date(tooltipData.date), 'MM/dd')}</div>
                    <div className="text-gray-300">
                        {tooltipData.duration > 0
                            ? `${Math.round(tooltipData.duration / 60)} ${t.minutes}`
                            : t.noActivity
                        }
                    </div>
                </div>
            )}
        </motion.div>
    );
};

interface UserProfileProps {
    onBack: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ onBack }) => {
    const { currentUser, updateUser, deleteUser, allUsers } = useUserStore();
    const { language } = useGameStore();
    const stats = useUserStats(currentUser?.id);

    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editAvatar, setEditAvatar] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Delete confirmation state
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Chart comparison state (default: on)
    const [showComparison, setShowComparison] = useState(true);

    // Hidden users state for toggleable legend
    const [hiddenUsers, setHiddenUsers] = useState<Set<string>>(new Set());

    // Get all users chart data for comparison
    const allUsersChart = useAllUsersChartData(currentUser?.id);

    const t = language === 'cn' ? {
        title: '我的成长',
        subtitle: '看看你已经走了多远！',
        totalTime: '练习时长',
        bestSpeed: '最高速度',
        sessions: '练习次数',
        avgAccuracy: '平均准确率',
        recentActivity: '最近练习',
        progressChart: '成长曲线',
        noData: '还没有练习记录，快去练习吧！',
        level: '等级',
        minutes: '分钟',
        back: '返回',
        edit: '编辑资料',
        editTitle: '编辑资料',
        nickname: '昵称',
        avatar: '选择头像',
        save: '保存',
        cancel: '取消',
        compareAll: '对比所有用户',
        deleteUser: '删除用户',
        deleteConfirmTitle: '确认删除',
        deleteConfirmMessage: '确定要删除这个用户吗？所有练习记录将被清除，无法恢复。',
        deleteConfirm: '确认删除',
        cannotDelete: '无法删除唯一用户',
    } : {
        title: 'My Progress',
        subtitle: 'Look how far you\'ve come!',
        totalTime: 'Total Time',
        bestSpeed: 'Best Speed',
        sessions: 'Sessions',
        avgAccuracy: 'Avg Accuracy',
        recentActivity: 'Recent Activity',
        progressChart: 'Progress Chart',
        noData: 'No practice records yet. Start practicing!',
        level: 'Level',
        minutes: 'min',
        back: 'Back',
        edit: 'Edit Profile',
        editTitle: 'Edit Profile',
        nickname: 'Nickname',
        avatar: 'Choose Avatar',
        save: 'Save',
        cancel: 'Cancel',
        compareAll: 'Compare All Users',
        deleteUser: 'Delete User',
        deleteConfirmTitle: 'Confirm Delete',
        deleteConfirmMessage: 'Are you sure you want to delete this user? All practice records will be permanently deleted.',
        deleteConfirm: 'Delete',
        cannotDelete: 'Cannot delete only user',
    };

    if (!currentUser) return null;

    // Calculate XP (total stars * 100 + sessions * 50)
    const totalXP = stats.totalStars * 100 + stats.totalSessions * 50;
    const levelInfo = getLevelInfo(totalXP);

    // Format time
    const totalMinutes = Math.round(stats.totalTime / 60);
    const timeDisplay = totalMinutes >= 60
        ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
        : `${totalMinutes} ${t.minutes}`;

    // Edit handlers
    const handleStartEdit = () => {
        setEditName(currentUser.name);
        setEditAvatar(currentUser.avatar);
        setIsEditing(true);
    };

    const handleSave = async () => {
        if (!editName.trim() || !currentUser.id) return;
        setIsSaving(true);
        try {
            await updateUser(currentUser.id, { name: editName, avatar: editAvatar });
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to update user:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditName('');
        setEditAvatar('');
    };

    // Delete user handler
    const handleDeleteUser = async () => {
        if (!currentUser?.id) return;

        // Prevent deleting the only user
        if (allUsers.length <= 1) {
            alert(t.cannotDelete);
            setShowDeleteConfirm(false);
            return;
        }

        setIsDeleting(true);
        try {
            await deleteUser(currentUser.id);
            setShowDeleteConfirm(false);
            onBack(); // Go back to home after deletion
        } catch (error) {
            console.error('Failed to delete user:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    if (stats.isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-kid-purple border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 pt-5 sm:pt-7 space-y-6 pb-10">
            {/* Edit Profile Modal */}
            <AnimatePresence>
                {isEditing && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleCancelEdit}
                    >
                        <motion.div
                            className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 p-5 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-800">{t.editTitle}</h2>
                                <button
                                    onClick={handleCancelEdit}
                                    className="w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 space-y-5">
                                {/* Current Avatar Preview */}
                                <div className="flex justify-center">
                                    <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                                        <UserAvatar avatar={editAvatar} size={52} />
                                    </div>
                                </div>

                                {/* Avatar Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-3">
                                        {t.avatar}
                                    </label>
                                    <div className="grid grid-cols-6 gap-2">
                                        {AVATAR_OPTIONS.map((avatar) => (
                                            <button
                                                key={avatar}
                                                type="button"
                                                onClick={() => setEditAvatar(avatar)}
                                                className={`
                                                    w-12 h-12 rounded-2xl flex items-center justify-center cursor-pointer
                                                    transition-all duration-200 hover:scale-110
                                                    ${editAvatar === avatar
                                                        ? 'bg-purple-100 ring-2 ring-kid-purple scale-110 shadow-md'
                                                        : 'bg-gray-50 hover:bg-gray-100'
                                                    }
                                                `}
                                            >
                                                <UserAvatar avatar={avatar} size={32} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Name Input */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">
                                        {t.nickname}
                                    </label>
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        maxLength={8}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-kid-purple focus:ring-2 focus:ring-purple-100 outline-none transition-all text-lg font-medium"
                                    />
                                    <div className="text-xs text-gray-400 mt-1">{editName.length}/8</div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleCancelEdit}
                                        className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                                    >
                                        {t.cancel}
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={!editName.trim() || isSaving}
                                        className={`
                                            flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors
                                            ${editName.trim()
                                                ? 'bg-kid-purple text-white hover:bg-purple-600'
                                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            }
                                        `}
                                    >
                                        <Check size={18} />
                                        {isSaving ? '...' : t.save}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowDeleteConfirm(false)}
                    >
                        <motion.div
                            className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-xl"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Warning Icon */}
                            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertTriangle className="w-8 h-8 text-red-500" />
                            </div>

                            {/* Title */}
                            <h3 className="text-xl font-bold text-center text-gray-800 mb-2">
                                {t.deleteConfirmTitle}
                            </h3>

                            {/* User info */}
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <UserAvatar avatar={currentUser.avatar} size={32} />
                                <span className="font-medium text-gray-700">{currentUser.name}</span>
                            </div>

                            {/* Message */}
                            <p className="text-gray-500 text-center text-sm mb-6">
                                {t.deleteConfirmMessage}
                            </p>

                            {/* Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 py-3 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                                >
                                    {t.cancel}
                                </button>
                                <button
                                    onClick={handleDeleteUser}
                                    disabled={isDeleting}
                                    className="flex-1 py-3 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Trash2 size={18} />
                                    {isDeleting ? '...' : t.deleteConfirm}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 顶部 Bento 双栏：左侧纯白档案名片 + 右侧 2×2 紧凑数据卡 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                {/* 左侧：打字员护照名片（跟随全局配色变量实时切换） */}
                <motion.div
                    className="tappy-passport lg:col-span-5 rounded-3xl p-6 border border-white/30 flex flex-col justify-between gap-5 relative overflow-hidden text-white transition-all duration-300"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    {/* 柔和星光光晕装饰 */}
                    <div
                        className="absolute -top-12 -right-12 w-44 h-44 rounded-full pointer-events-none"
                        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.28) 0%, transparent 70%)' }}
                    />
                    <div
                        className="absolute -bottom-14 -left-10 w-40 h-40 rounded-full pointer-events-none"
                        style={{ background: 'radial-gradient(circle, rgba(253,224,71,0.22) 0%, transparent 70%)' }}
                    />

                    <div className="flex items-start justify-between gap-3 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-18 h-18 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-white/90 ring-4 ring-white/20 shrink-0">
                                <UserAvatar avatar={currentUser.avatar} size={48} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-cartoon font-black text-white leading-tight drop-shadow-xs">
                                    {currentUser.name}
                                </h2>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <span className="bg-amber-300 text-amber-950 text-xs px-2.5 py-0.5 rounded-full font-black shadow-xs">
                                        Lv.{levelInfo.level}
                                    </span>
                                    <span className="text-white/90 text-sm font-bold">
                                        {language === 'cn' ? levelInfo.title : levelInfo.titleEn}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 编辑与删除 */}
                        <div className="flex gap-1.5 shrink-0">
                            <button
                                onClick={handleStartEdit}
                                className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-sm flex items-center justify-center text-white transition-colors cursor-pointer"
                                title={t.edit}
                            >
                                <Edit3 size={16} />
                            </button>
                            {allUsers.length > 1 && (
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="w-9 h-9 rounded-full bg-white/15 hover:bg-rose-400/80 backdrop-blur-sm flex items-center justify-center text-white transition-colors cursor-pointer"
                                    title={t.deleteUser}
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* 毛玻璃经验进度条 */}
                    <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3.5 border border-white/20 relative z-10">
                        <div className="flex justify-between text-xs font-bold mb-2 tabular-nums">
                            <span className="text-white">
                                {language === 'cn'
                                    ? `当前经验 ${levelInfo.totalXP} XP`
                                    : `${levelInfo.totalXP} XP`}
                            </span>
                            <span className="text-amber-200">
                                {levelInfo.xpRemaining > 0
                                    ? language === 'cn'
                                        ? `还差 ${levelInfo.xpRemaining} XP 升级`
                                        : `${levelInfo.xpRemaining} XP to next`
                                    : language === 'cn'
                                        ? '已满级 MAX'
                                        : 'MAX'}
                            </span>
                        </div>
                        <div className="h-2.5 bg-black/20 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-amber-300 via-yellow-200 to-white rounded-full shadow-xs"
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.max(5, levelInfo.progress)}%` }}
                                transition={{ duration: 0.9, delay: 0.2 }}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* 右侧：2×2 横排 3D 数据卡片 */}
                <div className="lg:col-span-7 grid grid-cols-2 gap-4">
                    <StatCard
                        icon={<img src="/icons/fluent3d/alarm_clock.webp" alt="" className="w-8 h-8 object-contain drop-shadow-xs" />}
                        label={t.totalTime}
                        value={timeDisplay}
                        iconBg="bg-sky-50"
                        delay={0.1}
                    />
                    <StatCard
                        icon={<img src="/icons/fluent3d/lightning.webp" alt="" className="w-8 h-8 object-contain drop-shadow-xs" />}
                        label={t.bestSpeed}
                        value={`${stats.bestWpm} WPM`}
                        iconBg="bg-amber-50"
                        delay={0.15}
                    />
                    <StatCard
                        icon={<img src="/icons/fluent3d/calendar.webp" alt="" className="w-8 h-8 object-contain drop-shadow-xs" />}
                        label={t.sessions}
                        value={stats.totalSessions}
                        iconBg="bg-emerald-50"
                        delay={0.2}
                    />
                    <StatCard
                        icon={<img src="/icons/fluent3d/trophy.webp" alt="" className="w-8 h-8 object-contain drop-shadow-xs" />}
                        label={t.avgAccuracy}
                        value={`${stats.avgAccuracy}%`}
                        iconBg="bg-rose-50"
                        delay={0.25}
                    />
                </div>
            </div>

            {/* Badge Section - Achievements */}
            <BadgeSection userId={currentUser.id!} language={language} />

            {/* 底部双栏：左侧进步趋势图 + 右侧最近练习记录 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Progress Chart */}
            {(stats.chartData.length > 0 || (showComparison && allUsersChart.chartData.length > 0)) && (
                <motion.div
                    className="lg:col-span-7 bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-lg border-2 border-white flex flex-col justify-between"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                >
                    {/* Header with toggle */}
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-700 flex items-center gap-2">
                            <Trophy size={20} className="text-kid-purple" />
                            {t.progressChart}
                        </h3>

                        {/* Comparison Toggle */}
                        {allUsersChart.userInfos.length > 1 && (
                            <button
                                onClick={() => setShowComparison(!showComparison)}
                                className={`
                                    flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all
                                    ${showComparison
                                        ? 'bg-kid-purple text-white'
                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                    }
                                `}
                            >
                                <Users size={16} />
                                {t.compareAll}
                            </button>
                        )}
                    </div>

                    {/* Chart */}
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            {showComparison && allUsersChart.chartData.length > 0 ? (
                                // Multi-user comparison chart
                                <LineChart data={allUsersChart.chartData}>
                                    <XAxis
                                        dataKey="index"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fill: '#9CA3AF' }}
                                        interval="preserveStartEnd"
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#9CA3AF' }}
                                        domain={[0, 'auto']}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: 'none',
                                            borderRadius: '12px',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                        }}
                                        labelFormatter={(label) => label}
                                        formatter={(value: number, name: string) => [`${value} WPM`, name]}
                                    />
                                    {/* Legend removed - using custom bottom legend */}
                                    {allUsersChart.userInfos
                                        .filter(user => !hiddenUsers.has(user.name))
                                        .map((user) => (
                                            <Line
                                                key={user.name}
                                                type="monotone"
                                                dataKey={user.name}
                                                stroke={user.color}
                                                strokeWidth={user.name === currentUser?.name ? 3 : 2}
                                                dot={{ fill: user.color, strokeWidth: 2, r: user.name === currentUser?.name ? 4 : 3 }}
                                                activeDot={{ r: 6, fill: user.color }}
                                                connectNulls
                                            />
                                        ))}
                                </LineChart>
                            ) : (
                                // Single user chart
                                <LineChart data={stats.chartData}>
                                    <XAxis
                                        dataKey="index"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#9CA3AF' }}
                                        interval="preserveStartEnd"
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#9CA3AF' }}
                                        domain={[0, 'auto']}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: 'none',
                                            borderRadius: '12px',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                        }}
                                        labelFormatter={(label) => label}
                                        formatter={(value: number) => [`${value} WPM`, 'Speed']}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="wpm"
                                        stroke="#8B5CF6"
                                        strokeWidth={3}
                                        dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 6, fill: '#7C3AED' }}
                                    />
                                </LineChart>
                            )}
                        </ResponsiveContainer>
                    </div>

                    {/* User Legend (when comparison is on) */}
                    {showComparison && allUsersChart.userInfos.length > 1 && (
                        <div className="mt-4 flex flex-wrap gap-3 justify-center">
                            {allUsersChart.userInfos.map(user => {
                                const isHidden = hiddenUsers.has(user.name);
                                return (
                                    <button
                                        key={user.name}
                                        onClick={() => {
                                            setHiddenUsers(prev => {
                                                const newSet = new Set(prev);
                                                if (newSet.has(user.name)) {
                                                    newSet.delete(user.name);
                                                } else {
                                                    newSet.add(user.name);
                                                }
                                                return newSet;
                                            });
                                        }}
                                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm transition-all cursor-pointer hover:scale-105 ${isHidden
                                            ? 'bg-gray-100 opacity-50'
                                            : user.name === currentUser?.name
                                                ? 'bg-purple-100 font-medium'
                                                : 'bg-gray-100'
                                            }`}
                                    >
                                        <div
                                            className={`w-3 h-3 rounded-full ${isHidden ? 'opacity-30' : ''}`}
                                            style={{ backgroundColor: user.color }}
                                        />
                                        <span className={isHidden ? 'line-through' : ''}>{user.avatar}</span>
                                        <span className={`text-gray-700 ${isHidden ? 'line-through' : ''}`}>{user.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </motion.div>
            )}

            {/* Recent Activity */}
            {stats.recentRecords.length > 0 ? (
                <motion.div
                    className="lg:col-span-5 bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-lg border-2 border-white"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <Star size={20} className="text-yellow-500" />
                        {t.recentActivity}
                    </h3>
                    <div className="space-y-3">
                        {stats.recentRecords.map((record, idx) => (
                            <motion.div
                                key={record.id}
                                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.8 + idx * 0.1 }}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-gray-400">
                                        {format(new Date(record.timestamp), 'MM/dd HH:mm')}
                                    </span>
                                    <span className="text-sm text-gray-600 truncate max-w-32">
                                        {record.levelId}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    {/* Time Spent */}
                                    <span className="text-xs text-gray-400">
                                        {record.timeSpent >= 60
                                            ? `${Math.floor(record.timeSpent / 60)}m${record.timeSpent % 60}s`
                                            : `${record.timeSpent}s`
                                        }
                                    </span>
                                    <span className="text-sm font-medium text-kid-purple">
                                        {record.wpm} WPM
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        {record.accuracy}%
                                    </span>
                                    <div className="flex">
                                        {[1, 2, 3].map(s => (
                                            <Star
                                                key={s}
                                                size={14}
                                                className={s <= record.stars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    className="lg:col-span-12 bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-lg border-2 border-white text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="text-5xl mb-4">🎯</div>
                    <p className="text-gray-500">{t.noData}</p>
                </motion.div>
            )}
            </div>

            {/* Practice Heatmap */}
            <PracticeHeatmap heatmapData={stats.heatmapData} language={language} />
        </div>
    );
};
