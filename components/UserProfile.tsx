import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Zap, Trophy, Calendar, Target, ArrowLeft, Star, Edit3, X, Check } from 'lucide-react';
import { db, PracticeRecord, AVATAR_OPTIONS } from '../db';
import { useUserStore } from '../store/useUserStore';
import { useGameStore } from '../store/useGameStore';

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
    const progress = xpNeededForNext > 0 ? (xpInCurrentLevel / xpNeededForNext) * 100 : 100;

    return {
        level: currentLevel.level,
        title: currentLevel.title,
        titleEn: currentLevel.titleEn,
        progress: Math.min(progress, 100),
        xpCurrent: xpInCurrentLevel,
        xpNeeded: xpNeededForNext,
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
    chartData: { date: string; wpm: number; accuracy: number }[];
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

                // Chart data (last 10 records, but show chronologically)
                const last10 = sorted.slice(0, 10).reverse();
                const chartData = last10.map((r, idx) => ({
                    // Use index + time for unique identification
                    date: format(new Date(r.timestamp), 'MM/dd HH:mm'),
                    displayDate: format(new Date(r.timestamp), 'MM/dd'),
                    wpm: r.wpm,
                    accuracy: r.accuracy,
                    idx: idx + 1 // For tooltip reference
                }));

                setStats({
                    totalTime,
                    bestWpm,
                    totalSessions: records.length,
                    avgAccuracy,
                    totalStars,
                    recentRecords,
                    chartData,
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
                    isLoading: false
                });
            }
        };

        fetchStats();
    }, [userId]);

    return stats;
}

// Stat Card Component
const StatCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string | number;
    color: string;
    delay: number;
}> = ({ icon, label, value, color, delay }) => (
    <motion.div
        className={`${color} rounded-2xl p-4 shadow-sm flex flex-col items-center justify-center`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4 }}
    >
        <div className="text-gray-500 mb-2">{icon}</div>
        <div className="text-2xl font-bold text-gray-700">{value}</div>
        <div className="text-xs text-gray-500 mt-1">{label}</div>
    </motion.div>
);

interface UserProfileProps {
    onBack: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ onBack }) => {
    const { currentUser, updateUser } = useUserStore();
    const { language } = useGameStore();
    const stats = useUserStats(currentUser?.id);

    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editAvatar, setEditAvatar] = useState('');
    const [isSaving, setIsSaving] = useState(false);

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

    if (stats.isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-kid-purple border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6">
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
                                    <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center text-5xl shadow-lg border-4 border-white">
                                        {editAvatar}
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
                                                    w-12 h-12 rounded-xl text-2xl flex items-center justify-center
                                                    transition-all duration-200 hover:scale-110
                                                    ${editAvatar === avatar
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

            {/* Back Button */}
            <motion.button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-500 hover:text-kid-purple transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
            >
                <ArrowLeft size={20} />
                <span>{t.back}</span>
            </motion.button>

            {/* Header - Identity Card */}
            <motion.div
                className="bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 rounded-3xl p-6 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center gap-5">
                    {/* Avatar */}
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-5xl shadow-lg border-4 border-white">
                        {currentUser.avatar}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        <h2 className="text-2xl font-cartoon text-gray-800">{currentUser.name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="bg-kid-purple text-white text-xs px-2 py-0.5 rounded-full font-bold">
                                Lv.{levelInfo.level}
                            </span>
                            <span className="text-gray-600 text-sm">
                                {language === 'cn' ? levelInfo.title : levelInfo.titleEn}
                            </span>
                        </div>

                        {/* XP Bar */}
                        <div className="mt-3">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>XP: {levelInfo.xpCurrent}</span>
                                <span>{levelInfo.xpNeeded > 0 ? `${levelInfo.xpNeeded} to next` : 'MAX'}</span>
                            </div>
                            <div className="h-2 bg-white/60 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-kid-purple to-kid-blue rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${levelInfo.progress}%` }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Edit Button */}
                    <button
                        onClick={handleStartEdit}
                        className="w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-gray-500 hover:text-kid-purple transition-colors shadow-sm"
                        title={t.edit}
                    >
                        <Edit3 size={18} />
                    </button>
                </div>

                {/* Subtitle */}
                <p className="text-center text-gray-500 mt-4 text-sm italic">
                    ✨ {t.subtitle}
                </p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    icon={<Clock size={24} />}
                    label={t.totalTime}
                    value={timeDisplay}
                    color="bg-blue-50"
                    delay={0.2}
                />
                <StatCard
                    icon={<Zap size={24} />}
                    label={t.bestSpeed}
                    value={`${stats.bestWpm} WPM`}
                    color="bg-yellow-50"
                    delay={0.3}
                />
                <StatCard
                    icon={<Calendar size={24} />}
                    label={t.sessions}
                    value={stats.totalSessions}
                    color="bg-green-50"
                    delay={0.4}
                />
                <StatCard
                    icon={<Target size={24} />}
                    label={t.avgAccuracy}
                    value={`${stats.avgAccuracy}%`}
                    color="bg-pink-50"
                    delay={0.5}
                />
            </div>

            {/* Progress Chart */}
            {stats.chartData.length > 0 && (
                <motion.div
                    className="bg-white rounded-3xl p-6 shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <Trophy size={20} className="text-kid-purple" />
                        {t.progressChart}
                    </h3>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats.chartData}>
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#9CA3AF' }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#9CA3AF' }}
                                    domain={['dataMin - 5', 'dataMax + 5']}
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
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            )}

            {/* Recent Activity */}
            {stats.recentRecords.length > 0 ? (
                <motion.div
                    className="bg-white rounded-3xl p-6 shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
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
                    className="bg-white rounded-3xl p-8 shadow-lg text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <div className="text-5xl mb-4">🎯</div>
                    <p className="text-gray-500">{t.noData}</p>
                </motion.div>
            )}
        </div>
    );
};
