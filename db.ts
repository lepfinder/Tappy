import Dexie, { type EntityTable } from 'dexie';

// Predefined emoji avatar options
export const AVATAR_OPTIONS = ['🐼', '🦊', '🦁', '🐰', '🚀', '🦄', '🐸', '🐱', '🐶', '🦋', '🌟', '🎮'];

// User profile interface
export interface User {
    id?: number;
    name: string;
    avatar: string; // Emoji character, e.g., '🐼'
    createdAt: number;
}

// Practice record interface
export interface PracticeRecord {
    id?: number;
    userId: number;
    levelId: string;
    mode: string;
    wpm: number;
    accuracy: number;
    stars: number;
    score: number;
    maxCombo: number;
    timeSpent: number;
    timestamp: number;
}

// User badge interface for tracking unlocked badges
export interface UserBadge {
    id?: number;
    odUserId: number;
    badgeId: string;
    unlockedAt: number;
}

// Create Dexie database instance
const db = new Dexie('TappyDB') as Dexie & {
    users: EntityTable<User, 'id'>;
    records: EntityTable<PracticeRecord, 'id'>;
    userBadges: EntityTable<UserBadge, 'id'>;
};

// Define database schema - Version 4 with badges
db.version(4).stores({
    users: '++id, name, createdAt',
    records: '++id, userId, levelId, timestamp',
    userBadges: '++id, odUserId, badgeId, unlockedAt'
});

export { db };
