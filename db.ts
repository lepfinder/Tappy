import Dexie, { type EntityTable } from 'dexie';

// Avatar style type (matches Avatar.tsx)
export type AvatarStyle = 'pixel-art' | 'pixel-art-neutral' | 'thumbs' | 'fun-emoji' | 'adventurer';

// User profile interface
export interface User {
    id?: number;
    name: string;
    avatarStyle: AvatarStyle; // DiceBear avatar style
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

// Create Dexie database instance
const db = new Dexie('TappyDB') as Dexie & {
    users: EntityTable<User, 'id'>;
    records: EntityTable<PracticeRecord, 'id'>;
};

// Define database schema - Version 2 with avatarStyle
db.version(2).stores({
    users: '++id, name, createdAt',
    records: '++id, userId, levelId, timestamp'
});

// Migration from v1 to v2: convert old emoji avatar to default style
db.version(1).stores({
    users: '++id, name, createdAt',
    records: '++id, userId, levelId, timestamp'
});

export { db };

