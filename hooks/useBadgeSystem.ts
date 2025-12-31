import { useCallback } from 'react';
import { format } from 'date-fns';
import { db, PracticeRecord } from '../db';
import { BADGES, Badge } from '../data/badges';
import { LEVELS_EN_LETTERS } from '../data/en_letters';

// Session result interface for badge checking
export interface SessionResult {
    wpm: number;
    accuracy: number;
    maxCombo: number;
    timeSpent: number;
    levelId: string;
    mode: string;
}

// Get user's unlocked badge IDs
export async function getUnlockedBadgeIds(userId: number): Promise<string[]> {
    const badges = await db.userBadges
        .where('odUserId')
        .equals(userId)
        .toArray();
    return badges.map(b => b.badgeId);
}

// Get user's unlocked badges with details
export async function getUnlockedBadges(userId: number): Promise<Array<Badge & { unlockedAt: number }>> {
    const userBadges = await db.userBadges
        .where('odUserId')
        .equals(userId)
        .toArray();

    return userBadges.map(ub => {
        const badge = BADGES.find(b => b.id === ub.badgeId);
        if (!badge) return null;
        return { ...badge, unlockedAt: ub.unlockedAt };
    }).filter((b): b is Badge & { unlockedAt: number } => b !== null);
}

// Calculate consecutive days streak
function calculateStreak(records: PracticeRecord[]): number {
    if (records.length === 0) return 0;

    // Get unique dates (YYYY-MM-DD format)
    const uniqueDates = [...new Set(
        records.map(r => format(new Date(r.timestamp), 'yyyy-MM-dd'))
    )].sort().reverse(); // Most recent first

    if (uniqueDates.length === 0) return 0;

    // Check if today or yesterday is in the list (streak must be current)
    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');

    if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
        return 0; // Streak is broken
    }

    let streak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
        const currentDate = new Date(uniqueDates[i - 1]);
        const prevDate = new Date(uniqueDates[i]);
        const diffDays = Math.round((currentDate.getTime() - prevDate.getTime()) / 86400000);

        if (diffDays === 1) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
}

// Check if all letter levels are completed
async function hasCompletedAllLetterLevels(userId: number): Promise<boolean> {
    const letterLevelIds = LEVELS_EN_LETTERS.map(l => l.id);
    const completedLevelIds = await db.records
        .where('userId')
        .equals(userId)
        .toArray()
        .then(records => [...new Set(records.map(r => r.levelId))]);

    return letterLevelIds.every(id => completedLevelIds.includes(id));
}

// Check if last 3 records have 100% accuracy
async function hasThreePerfectRecords(userId: number): Promise<boolean> {
    const records = await db.records
        .where('userId')
        .equals(userId)
        .reverse()
        .limit(3)
        .toArray();

    return records.length >= 3 && records.every(r => r.accuracy === 100);
}

// Calculate total practice time in minutes
async function getTotalPracticeMinutes(userId: number): Promise<number> {
    const records = await db.records
        .where('userId')
        .equals(userId)
        .toArray();

    const totalSeconds = records.reduce((sum, r) => sum + (r.timeSpent || 0), 0);
    return totalSeconds / 60;
}

// Main hook for badge system
export function useBadgeSystem() {

    // Check and unlock badges after a practice session
    const checkAndUnlockBadges = useCallback(async (
        userId: number,
        sessionResult: SessionResult
    ): Promise<Badge[]> => {
        const unlockedBadgeIds = await getUnlockedBadgeIds(userId);
        const allRecords = await db.records
            .where('userId')
            .equals(userId)
            .toArray();
        const newlyUnlocked: Badge[] = [];

        for (const badge of BADGES) {
            // Skip if already unlocked
            if (unlockedBadgeIds.includes(badge.id)) continue;

            let shouldUnlock = false;

            switch (badge.id) {
                case 'first_step':
                    // First practice completed
                    shouldUnlock = allRecords.length >= 1;
                    break;

                case 'identity':
                    // This is checked separately when user updates profile
                    // Skip in session check
                    break;

                case 'snail_run':
                    // Reach 5 WPM
                    shouldUnlock = sessionResult.wpm >= 5;
                    break;

                case 'sharp_shooter':
                    // 100% accuracy
                    shouldUnlock = sessionResult.accuracy === 100;
                    break;

                case 'turtle_race':
                    // Reach 15 WPM
                    shouldUnlock = sessionResult.wpm >= 15;
                    break;

                case 'on_fire':
                    // 20 combo
                    shouldUnlock = sessionResult.maxCombo >= 20;
                    break;

                case 'three_days':
                    // 3 day streak
                    shouldUnlock = calculateStreak(allRecords) >= 3;
                    break;

                case 'abc_detective':
                    // All letter levels completed
                    shouldUnlock = await hasCompletedAllLetterLevels(userId);
                    break;

                case 'happy_rabbit':
                    // Reach 30 WPM
                    shouldUnlock = sessionResult.wpm >= 30;
                    break;

                case 'week_star':
                    // 7 day streak
                    shouldUnlock = calculateStreak(allRecords) >= 7;
                    break;

                case 'perfectionist':
                    // Last 3 records with 100% accuracy
                    shouldUnlock = await hasThreePerfectRecords(userId);
                    break;

                case 'best_friend':
                    // 2 hours (120 minutes) total practice
                    shouldUnlock = await getTotalPracticeMinutes(userId) >= 120;
                    break;
            }

            if (shouldUnlock) {
                // Save to database
                await db.userBadges.add({
                    odUserId: userId,
                    badgeId: badge.id,
                    unlockedAt: Date.now()
                });
                newlyUnlocked.push(badge);
            }
        }

        return newlyUnlocked;
    }, []);

    // Check identity badge (called when user updates profile)
    const checkIdentityBadge = useCallback(async (userId: number): Promise<Badge | null> => {
        const unlockedBadgeIds = await getUnlockedBadgeIds(userId);

        if (unlockedBadgeIds.includes('identity')) {
            return null;
        }

        const identityBadge = BADGES.find(b => b.id === 'identity');
        if (!identityBadge) return null;

        await db.userBadges.add({
            odUserId: userId,
            badgeId: 'identity',
            unlockedAt: Date.now()
        });

        return identityBadge;
    }, []);

    // Check all historical badges (retroactive unlock)
    const checkAllHistoricalBadges = useCallback(async (userId: number): Promise<Badge[]> => {
        const unlockedBadgeIds = await getUnlockedBadgeIds(userId);
        const allRecords = await db.records
            .where('userId')
            .equals(userId)
            .toArray();

        const newlyUnlocked: Badge[] = [];

        // Calculate max stats from history
        const maxWpm = allRecords.length > 0 ? Math.max(...allRecords.map(r => r.wpm)) : 0;
        const maxCombo = allRecords.length > 0 ? Math.max(...allRecords.map(r => r.maxCombo)) : 0;
        const hasPerfectRecord = allRecords.some(r => r.accuracy === 100);

        for (const badge of BADGES) {
            // Skip if already unlocked
            if (unlockedBadgeIds.includes(badge.id)) continue;

            let shouldUnlock = false;

            switch (badge.id) {
                case 'first_step':
                    shouldUnlock = allRecords.length >= 1;
                    break;
                case 'identity':
                    // Cannot check historically without extra data, skip
                    break;
                case 'snail_run':
                    shouldUnlock = maxWpm >= 5;
                    break;
                case 'sharp_shooter':
                    shouldUnlock = hasPerfectRecord;
                    break;
                case 'turtle_race':
                    shouldUnlock = maxWpm >= 15;
                    break;
                case 'on_fire':
                    shouldUnlock = maxCombo >= 20;
                    break;
                case 'three_days':
                    shouldUnlock = calculateStreak(allRecords) >= 3;
                    break;
                case 'abc_detective':
                    shouldUnlock = await hasCompletedAllLetterLevels(userId);
                    break;
                case 'happy_rabbit':
                    shouldUnlock = maxWpm >= 30;
                    break;
                case 'week_star':
                    shouldUnlock = calculateStreak(allRecords) >= 7;
                    break;
                case 'perfectionist':
                    shouldUnlock = await hasThreePerfectRecords(userId);
                    break;
                case 'best_friend':
                    shouldUnlock = await getTotalPracticeMinutes(userId) >= 120;
                    break;
            }

            if (shouldUnlock) {
                await db.userBadges.add({
                    odUserId: userId,
                    badgeId: badge.id,
                    unlockedAt: Date.now()
                });
                newlyUnlocked.push(badge);
            }
        }

        return newlyUnlocked;
    }, []);

    return {
        checkAndUnlockBadges,
        checkIdentityBadge,
        checkAllHistoricalBadges,
        getUnlockedBadges,
        getUnlockedBadgeIds
    };
}
