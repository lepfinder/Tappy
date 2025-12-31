// Badge configuration for the gamification system
// 12 core badges as defined in the PRD

export interface Badge {
    id: string;
    name: string;
    nameEn: string;
    emoji: string;
    icon?: string; // Optional image path for custom badge icons
    description: string;
    descriptionEn: string;
    category: 'Starter' | 'Speed' | 'Accuracy' | 'Streak' | 'Fun' | 'Content' | 'Master';
}

export const BADGES: Badge[] = [
    {
        id: 'first_step',
        name: '初次见面',
        nameEn: 'First Step',
        emoji: '🌱',
        icon: '/images/badge/first_step.png',
        description: '完成第 1 次练习',
        descriptionEn: 'Complete your first practice',
        category: 'Starter'
    },
    {
        id: 'identity',
        name: '我有名字啦',
        nameEn: 'Identity',
        emoji: '📛',
        icon: '/images/badge/identity.png',
        description: '修改过 1 次昵称或头像',
        descriptionEn: 'Change your nickname or avatar',
        category: 'Starter'
    },
    {
        id: 'snail_run',
        name: '蜗牛起步',
        nameEn: 'Snail Run',
        emoji: '🐌',
        icon: '/images/badge/snail_run.png',
        description: '单局速度达到 5 WPM',
        descriptionEn: 'Reach 5 WPM in a session',
        category: 'Speed'
    },
    {
        id: 'sharp_shooter',
        name: '神射手',
        nameEn: 'Sharp Shooter',
        emoji: '🎯',
        icon: '/images/badge/sharp_shooter.png',
        description: '单局准确率 100%',
        descriptionEn: 'Achieve 100% accuracy in a session',
        category: 'Accuracy'
    },
    {
        id: 'turtle_race',
        name: '乌龟赛跑',
        nameEn: 'Turtle Race',
        emoji: '🐢',
        icon: '/images/badge/turtle_race.png',
        description: '单局速度达到 15 WPM',
        descriptionEn: 'Reach 15 WPM in a session',
        category: 'Speed'
    },
    {
        id: 'on_fire',
        name: '根本停不下来',
        nameEn: 'On Fire',
        emoji: '🔥',
        icon: '/images/badge/on_fire.png',
        description: '单局连击达到 20',
        descriptionEn: 'Reach 20 combo in a session',
        category: 'Fun'
    },
    {
        id: 'three_days',
        name: '三日热度',
        nameEn: 'Three Day Streak',
        emoji: '📅',
        icon: '/images/badge/three_days.png',
        description: '连续 3 天进行练习',
        descriptionEn: 'Practice for 3 consecutive days',
        category: 'Streak'
    },
    {
        id: 'abc_detective',
        name: 'ABC 侦探',
        nameEn: 'ABC Detective',
        emoji: '🔤',
        icon: '/images/badge/abc_detective.png',
        description: '完成所有字母练习关卡',
        descriptionEn: 'Complete all letter practice levels',
        category: 'Content'
    },
    {
        id: 'happy_rabbit',
        name: '快乐小兔',
        nameEn: 'Happy Rabbit',
        emoji: '🐰',
        icon: '/images/badge/happy_rabbit.png',
        description: '单局速度达到 30 WPM',
        descriptionEn: 'Reach 30 WPM in a session',
        category: 'Speed'
    },
    {
        id: 'week_star',
        name: '一周全勤',
        nameEn: 'Week Star',
        emoji: '🗓️',
        icon: '/images/badge/week_star.png',
        description: '连续 7 天进行练习',
        descriptionEn: 'Practice for 7 consecutive days',
        category: 'Streak'
    },
    {
        id: 'perfectionist',
        name: '完美主义',
        nameEn: 'Perfectionist',
        emoji: '💎',
        // No custom icon yet, will use emoji
        description: '连续 3 局准确率 100%',
        descriptionEn: 'Achieve 100% accuracy in 3 consecutive sessions',
        category: 'Accuracy'
    },
    {
        id: 'best_friend',
        name: 'Tappy的好友',
        nameEn: 'Best Friend',
        emoji: '👑',
        // No custom icon yet, will use emoji
        description: '累计练习时长达到 2 小时',
        descriptionEn: 'Practice for 2 hours total',
        category: 'Master'
    }
];

// Helper function to get badge by ID
export function getBadgeById(id: string): Badge | undefined {
    return BADGES.find(b => b.id === id);
}

