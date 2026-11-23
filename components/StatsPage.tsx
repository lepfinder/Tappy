import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { format } from 'date-fns';
import {
    ArrowLeft, Zap, Target, Trophy, Clock, TrendingUp,
    BarChart3, Calendar, Award, Sparkles, Brain, Star
} from 'lucide-react';
import { db, PracticeRecord } from '../db';
import { useUserStore } from '../store/useUserStore';
import { useGameStore } from '../store/useGameStore';
import { TRANSLATIONS } from '../i18n';
import { UserAvatar } from './UserAvatar';

// Mode name mapping
const MODE_NAMES: Record<string, { cn: string; en: string; color: string }> = {
    'EN_LETTERS': { cn: '字母练习', en: 'Letters', color: '#F5A623' },
    'EN_WORDS': { cn: '英文单词', en: 'Words', color: '#4A90E2' },
    'EN_ESSAYS': { cn: '英文短文', en: 'Essays', color: '#6366F1' },
    'CN_PINYIN': { cn: '拼音乐趣', en: 'Pinyin', color: '#7ED321' },
    'CN_SENTENCES': { cn: '中文短句', en: 'Sentences', color: '#9B59B6' },
    'CN_ESSAYS': { cn: '小学短文', en: 'Short Essays', color: '#EC4899' },
    'CN_POEMS': { cn: '小学古诗', en: 'Poems', color: '#14B8A6' },
    'RACE_100M': { cn: '趣味游戏', en: 'Games', color: '#EC4899' },
};

// 将趣味游戏厅与自定义听写词表的 levelId 翻译为可读名称
function formatArcadeRecordName(levelId: string, language: string): string | null {
    if (levelId.startsWith('custom_')) {
        return language === 'cn' ? '听写词表' : 'Dictation';
    }
    if (!levelId.startsWith('arcade_')) return null;
    const map: Record<string, { cn: string; en: string }> = {
        'apple-catch': { cn: '摘苹果', en: 'Apples' },
        'frog-hop': { cn: '青蛙过河', en: 'Frog Hop' },
        'space-shooter': { cn: '太空战机', en: 'Space' },
        'whack-a-mole': { cn: '打地鼠', en: 'Moles' }
    };
    const parts = levelId.split('_');
    const game = map[parts[1]];
    if (!game) return null;
    return language === 'cn' ? game.cn : game.en;
}

// Stats interface
interface FullStats {
    // Summary stats
    avgWpm: number;
    maxWpm: number;
    avgAccuracy: number;
    totalSessions: number;
    totalTime: number;
    totalStars: number;
    favoriteMode: string;

    // Chart data
    trendData: { index: number; wpm: number; accuracy: number }[];
    modeDistribution: { name: string; value: number; color: string }[];
    recentRecords: PracticeRecord[];

    // Rankings (all users)
    rankings: { name: string; avatar: string; totalScore: number; sessions: number }[];

    isLoading: boolean;
}

// Custom hook for comprehensive stats
function useFullStats(userId: number | undefined): FullStats {
    const { allUsers } = useUserStore();
    const [stats, setStats] = useState<FullStats>({
        avgWpm: 0,
        maxWpm: 0,
        avgAccuracy: 0,
        totalSessions: 0,
        totalTime: 0,
        totalStars: 0,
        favoriteMode: '',
        trendData: [],
        modeDistribution: [],
        recentRecords: [],
        rankings: [],
        isLoading: true
    });

    useEffect(() => {
        if (!userId) {
            setStats(prev => ({ ...prev, isLoading: false }));
            return;
        }

        const fetchStats = async () => {
            try {
                // Fetch current user's records
                const records = await db.records
                    .where('userId')
                    .equals(userId)
                    .toArray();

                if (records.length === 0) {
                    setStats(prev => ({ ...prev, isLoading: false }));
                    return;
                }

                // Calculate summary stats
                const avgWpm = Math.round(records.reduce((sum, r) => sum + r.wpm, 0) / records.length);
                const maxWpm = Math.max(...records.map(r => r.wpm));
                const avgAccuracy = Math.round(records.reduce((sum, r) => sum + r.accuracy, 0) / records.length);
                const totalTime = records.reduce((sum, r) => sum + (r.timeSpent || 0), 0);
                const totalStars = records.reduce((sum, r) => sum + r.stars, 0);

                // Mode distribution
                const modeCounts: Record<string, number> = {};
                records.forEach(r => {
                    modeCounts[r.mode] = (modeCounts[r.mode] || 0) + 1;
                });

                const modeDistribution = Object.entries(modeCounts).map(([mode, value]) => ({
                    name: mode,
                    value,
                    color: MODE_NAMES[mode]?.color || '#888888'
                }));

                const favoriteMode = Object.entries(modeCounts)
                    .sort((a, b) => b[1] - a[1])[0]?.[0] || '';

                // Trend data - use session index instead of date (last 50 records)
                const sortedByTime = [...records].sort((a, b) => a.timestamp - b.timestamp);
                const last50 = sortedByTime.slice(-50);
                const trendData = last50.map((r, idx) => ({
                    index: idx + 1,
                    wpm: r.wpm,
                    accuracy: r.accuracy
                }));

                // Recent records (last 10)
                const sortedRecords = [...records].sort((a, b) => b.timestamp - a.timestamp);
                const recentRecords = sortedRecords.slice(0, 10);

                // Calculate rankings for all users
                const rankings: FullStats['rankings'] = [];
                for (const user of allUsers) {
                    if (!user.id) continue;
                    const userRecords = await db.records
                        .where('userId')
                        .equals(user.id)
                        .toArray();

                    const totalScore = userRecords.reduce((sum, r) => sum + r.score, 0);
                    rankings.push({
                        name: user.name,
                        avatar: user.avatar,
                        totalScore,
                        sessions: userRecords.length
                    });
                }
                rankings.sort((a, b) => b.totalScore - a.totalScore);

                setStats({
                    avgWpm,
                    maxWpm,
                    avgAccuracy,
                    totalSessions: records.length,
                    totalTime,
                    totalStars,
                    favoriteMode,
                    trendData,
                    modeDistribution,
                    recentRecords,
                    rankings,
                    isLoading: false
                });
            } catch (error) {
                console.error('Failed to fetch stats:', error);
                setStats(prev => ({ ...prev, isLoading: false }));
            }
        };

        fetchStats();
    }, [userId, allUsers]);

    return stats;
}

// Stat Card Component
const StatCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string | number;
    subValue?: string;
    gradient: string;
    delay?: number;
}> = ({ icon, label, value, subValue, gradient, delay = 0 }) => (
    <motion.div
        className={`${gradient} rounded-2xl p-4 text-white shadow-lg`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4 }}
    >
        <div className="flex items-start justify-between">
            <div>
                <div className="text-white/80 text-sm mb-1">{label}</div>
                <div className="text-2xl font-bold">{value}</div>
                {subValue && <div className="text-white/70 text-xs mt-1">{subValue}</div>}
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                {icon}
            </div>
        </div>
    </motion.div>
);

// AI Coach Component
const AICoach: React.FC<{
    stats: FullStats;
    language: 'cn' | 'en';
}> = ({ stats, language }) => {
    const tips = useMemo(() => {
        const tipsCn: string[] = [];
        const tipsEn: string[] = [];

        // Speed analysis
        if (stats.avgWpm < 20) {
            tipsCn.push('速度提升空间：你的平均速度是 ' + stats.avgWpm + ' WPM，建议每天坚持练习 15 分钟，逐步提高到 30 WPM 以上。');
            tipsEn.push('Speed tip: Your average speed is ' + stats.avgWpm + ' WPM. Try practicing 15 minutes daily to reach 30+ WPM.');
        } else if (stats.avgWpm < 40) {
            tipsCn.push('不错的进步！你的平均速度已达到 ' + stats.avgWpm + ' WPM，继续保持，目标 50 WPM！');
            tipsEn.push('Good progress! Your average ' + stats.avgWpm + ' WPM is solid. Keep going for 50 WPM!');
        } else {
            tipsCn.push('太棒了！你的速度已经很快了（' + stats.avgWpm + ' WPM），可以挑战更难的短文模式。');
            tipsEn.push('Amazing! Your ' + stats.avgWpm + ' WPM is excellent. Try harder essay challenges!');
        }

        // Accuracy analysis
        if (stats.avgAccuracy < 90) {
            tipsCn.push('准确率建议：当前准确率 ' + stats.avgAccuracy + '%，建议放慢速度，先保证准确再提速。');
            tipsEn.push('Accuracy focus: At ' + stats.avgAccuracy + '%, slow down first to build accuracy, then speed up.');
        } else {
            tipsCn.push('准确率优秀！保持 ' + stats.avgAccuracy + '% 的准确率，这是非常好的基础。');
            tipsEn.push('Great accuracy! ' + stats.avgAccuracy + '% is excellent - maintain this foundation.');
        }

        // Mode recommendation
        if (stats.favoriteMode) {
            const modeName = MODE_NAMES[stats.favoriteMode];
            if (modeName) {
                tipsCn.push('你最喜欢的模式是「' + modeName.cn + '」，建议也尝试其他模式来全面提升。');
                tipsEn.push('Your favorite mode is "' + modeName.en + '". Try other modes for well-rounded skills!');
            }
        }

        return language === 'cn' ? tipsCn : tipsEn;
    }, [stats, language]);

    return (
        <motion.div
            className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-5 border border-purple-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
        >
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white">
                    <Brain size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-800">
                        {language === 'cn' ? '智能学习建议' : 'Learning Insights'}
                    </h3>
                    <p className="text-xs text-gray-500">
                        {language === 'cn' ? '根据近期练习数据生成的贴心小贴士' : 'Personalized tips based on your recent practice'}
                    </p>
                </div>
            </div>
            <div className="space-y-3">
                {tips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-2">
                        <Sparkles size={14} className="text-purple-500 mt-1 flex-shrink-0" />
                        <p className="text-sm text-gray-600 leading-relaxed">{tip}</p>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

interface StatsPageProps {
    onBack: () => void;
}

export const StatsPage: React.FC<StatsPageProps> = ({ onBack }) => {
    const { currentUser } = useUserStore();
    const { language } = useGameStore();
    const stats = useFullStats(currentUser?.id);

    const t = language === 'cn' ? {
        title: '数据分析',
        subtitle: '全面了解你的打字能力',
        avgSpeed: '平均速度',
        maxSpeed: '最高速度',
        avgAccuracy: '平均准确率',
        favoriteMode: '常用模式',
        trendChart: '能力变化趋势',
        last30Days: '近 30 天',
        modeDistribution: '练习模式分布',
        rankings: '家族排行',
        recentRecords: '最近练习轨迹',
        noData: '还没有练习记录，快去练习吧！',
        back: '返回',
        wpm: 'WPM',
        accuracy: '准确率',
        sessions: '次练习',
        score: '得分',
        date: '日期',
        mode: '模式',
        stars: '星级',
    } : {
        title: 'Stats Analysis',
        subtitle: 'Understand your typing abilities',
        avgSpeed: 'Avg Speed',
        maxSpeed: 'Best Speed',
        avgAccuracy: 'Avg Accuracy',
        favoriteMode: 'Favorite Mode',
        trendChart: 'Performance Trend',
        last30Days: 'Last 30 days',
        modeDistribution: 'Mode Distribution',
        rankings: 'Family Rankings',
        recentRecords: 'Recent Activity',
        noData: 'No practice records yet. Start practicing!',
        back: 'Back',
        wpm: 'WPM',
        accuracy: 'Accuracy',
        sessions: 'sessions',
        score: 'Score',
        date: 'Date',
        mode: 'Mode',
        stars: 'Stars',
    };

    // Format time
    const totalMinutes = Math.round(stats.totalTime / 60);
    const timeDisplay = totalMinutes >= 60
        ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
        : `${totalMinutes}m`;

    if (stats.isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-kid-purple border-t-transparent" />
            </div>
        );
    }

    const hasData = stats.totalSessions > 0;

    return (
        <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 pt-5 sm:pt-7 space-y-6 pb-12">
            {/* Header */}
            <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-2xl font-cartoon font-bold text-gray-800 flex items-center justify-center gap-2">
                    <img src="/icons/fluent3d/trophy.webp" alt="" className="w-7 h-7 object-contain" />
                    {t.title}
                </h1>
                <p className="text-gray-500 text-sm mt-1">{t.subtitle}</p>
            </motion.div>

            {!hasData ? (
                <motion.div
                    className="text-center py-16"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <img
                        src="/icons/fluent3d/trophy.webp"
                        alt=""
                        className="w-16 h-16 mx-auto mb-4 opacity-80 object-contain"
                    />
                    <p className="text-gray-500">{t.noData}</p>
                </motion.div>
            ) : (
                <>
                    {/* Summary Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard
                            icon={<Zap size={20} />}
                            label={t.avgSpeed}
                            value={`${stats.avgWpm}`}
                            subValue={t.wpm}
                            gradient="bg-gradient-to-br from-blue-500 to-blue-600"
                            delay={0.1}
                        />
                        <StatCard
                            icon={<Trophy size={20} />}
                            label={t.maxSpeed}
                            value={`${stats.maxWpm}`}
                            subValue={t.wpm}
                            gradient="bg-gradient-to-br from-amber-500 to-orange-500"
                            delay={0.15}
                        />
                        <StatCard
                            icon={<Target size={20} />}
                            label={t.avgAccuracy}
                            value={`${stats.avgAccuracy}%`}
                            gradient="bg-gradient-to-br from-emerald-500 to-green-600"
                            delay={0.2}
                        />
                        <StatCard
                            icon={<Award size={20} />}
                            label={t.favoriteMode}
                            value={MODE_NAMES[stats.favoriteMode]?.[language === 'cn' ? 'cn' : 'en'] || '-'}
                            gradient="bg-gradient-to-br from-purple-500 to-pink-500"
                            delay={0.25}
                        />
                    </div>

                    {/* AI Coach */}
                    <AICoach stats={stats} language={language} />

                    {/* Charts Row */}
                    <div className="grid md:grid-cols-3 gap-4">
                        {/* Trend Chart */}
                        <motion.div
                            className="md:col-span-2 bg-white rounded-2xl p-5 shadow-sm"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35 }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                    <TrendingUp size={18} className="text-blue-500" />
                                    {t.trendChart}
                                </h3>
                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                                    {language === 'cn' ? '近 50 次' : 'Last 50'}
                                </span>
                            </div>
                            {stats.trendData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={200}>
                                    <AreaChart data={stats.trendData}>
                                        <defs>
                                            <linearGradient id="colorWpm" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4A90E2" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#4A90E2" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#7ED321" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#7ED321" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
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
                                            tick={{ fontSize: 11, fill: '#9CA3AF' }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: '12px',
                                                border: 'none',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                            }}
                                        />
                                        <Legend />
                                        <Area
                                            type="monotone"
                                            dataKey="wpm"
                                            name={t.wpm}
                                            stroke="#4A90E2"
                                            strokeWidth={2}
                                            fill="url(#colorWpm)"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="accuracy"
                                            name={t.accuracy}
                                            stroke="#7ED321"
                                            strokeWidth={2}
                                            fill="url(#colorAcc)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">
                                    {language === 'cn' ? '暂无趋势数据' : 'No trend data yet'}
                                </div>
                            )}
                        </motion.div>

                        {/* Mode Distribution Pie Chart */}
                        <motion.div
                            className="bg-white rounded-2xl p-5 shadow-sm"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                                <Calendar size={18} className="text-purple-500" />
                                {t.modeDistribution}
                            </h3>
                            {stats.modeDistribution.length > 0 ? (
                                <ResponsiveContainer width="100%" height={180}>
                                    <PieChart>
                                        <Pie
                                            data={stats.modeDistribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={40}
                                            outerRadius={70}
                                            dataKey="value"
                                            paddingAngle={2}
                                        >
                                            {stats.modeDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value, name) => [
                                                `${value} ${t.sessions}`,
                                                MODE_NAMES[name as string]?.[language === 'cn' ? 'cn' : 'en'] || name
                                            ]}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-[180px] flex items-center justify-center text-gray-400 text-sm">
                                    {language === 'cn' ? '暂无分布数据' : 'No data yet'}
                                </div>
                            )}
                            {/* Legend */}
                            <div className="flex flex-wrap gap-2 mt-2 justify-center">
                                {stats.modeDistribution.slice(0, 4).map((item) => (
                                    <div key={item.name} className="flex items-center gap-1 text-xs">
                                        <span
                                            className="w-2 h-2 rounded-full"
                                            style={{ backgroundColor: item.color }}
                                        />
                                        <span className="text-gray-500">
                                            {MODE_NAMES[item.name]?.[language === 'cn' ? 'cn' : 'en'] || item.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Rankings & Recent Records */}
                    <div className="grid md:grid-cols-2 gap-4">
                        {/* Family Rankings */}
                        <motion.div
                            className="bg-white rounded-2xl p-5 shadow-sm"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.45 }}
                        >
                            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                                <Trophy size={18} className="text-amber-500" />
                                {t.rankings}
                            </h3>
                            <div className="space-y-3">
                                {stats.rankings.slice(0, 5).map((user, index) => (
                                    <div
                                        key={user.name}
                                        className={`flex items-center gap-3 p-2 rounded-xl ${user.name === currentUser?.name
                                            ? 'bg-purple-50 border border-purple-100'
                                            : 'bg-gray-50'
                                            }`}
                                    >
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${index === 0 ? 'bg-amber-400 text-white' :
                                            index === 1 ? 'bg-gray-300 text-white' :
                                                index === 2 ? 'bg-amber-600 text-white' :
                                                    'bg-gray-200 text-gray-600'
                                            }`}>
                                            {index + 1}
                                        </div>
                                        <UserAvatar avatar={user.avatar} size={28} />
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-700 text-sm">{user.name}</div>
                                            <div className="text-xs text-gray-400">{user.sessions} {t.sessions}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-purple-600">{user.totalScore.toLocaleString()}</div>
                                            <div className="text-xs text-gray-400">{t.score}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Recent Records Table */}
                        <motion.div
                            className="bg-white rounded-2xl p-5 shadow-sm"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                                <Clock size={18} className="text-blue-500" />
                                {t.recentRecords}
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-gray-400 text-xs">
                                            <th className="text-left pb-2">{t.mode}</th>
                                            <th className="text-center pb-2">{t.wpm}</th>
                                            <th className="text-center pb-2">{t.accuracy}</th>
                                            <th className="text-right pb-2">{t.date}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.recentRecords.slice(0, 6).map((record, index) => (
                                            <tr key={record.id || index} className="border-t border-gray-50">
                                                <td className="py-2">
                                                    <span
                                                        className="inline-block px-2 py-0.5 rounded-full text-xs font-medium text-white"
                                                        style={{ backgroundColor: MODE_NAMES[record.mode]?.color || '#888' }}
                                                    >
                                                        {formatArcadeRecordName(record.levelId, language) ||
                                                            MODE_NAMES[record.mode]?.[language === 'cn' ? 'cn' : 'en'] ||
                                                            record.mode}
                                                    </span>
                                                </td>
                                                <td className="text-center font-medium text-gray-700">{record.wpm}</td>
                                                <td className="text-center text-gray-600">{record.accuracy}%</td>
                                                <td className="text-right text-gray-400 text-xs">
                                                    {format(new Date(record.timestamp), 'MM/dd')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </div>
    );
};
