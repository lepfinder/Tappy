import { create } from 'zustand';
import { db, User, PracticeRecord, AvatarStyle } from '../db';

const LAST_USER_KEY = 'tappy_lastActiveUserId';

interface UserStore {
    // State
    currentUser: User | null;
    allUsers: User[];
    isLoading: boolean;
    isInitialized: boolean;

    // Switching animation state
    isSwitching: boolean;
    switchingToUser: User | null;

    // Actions
    initialize: () => Promise<void>;
    refreshUsers: () => Promise<void>;
    switchUser: (userId: number) => Promise<void>;
    createUser: (name: string, avatarStyle?: AvatarStyle) => Promise<User>;
    deleteUser: (userId: number) => Promise<void>;
    clearSwitching: () => void;

    // Record actions
    saveRecord: (record: Omit<PracticeRecord, 'id' | 'userId' | 'timestamp'>) => Promise<void>;
    getUserRecords: (userId?: number) => Promise<PracticeRecord[]>;
}

export const useUserStore = create<UserStore>((set, get) => ({
    currentUser: null,
    allUsers: [],
    isLoading: true,
    isInitialized: false,
    isSwitching: false,
    switchingToUser: null,

    initialize: async () => {
        try {
            set({ isLoading: true });

            // Fetch all users from database
            const users = await db.users.toArray();

            // Check if there's a last active user in localStorage
            const lastUserId = localStorage.getItem(LAST_USER_KEY);
            let currentUser: User | null = null;

            if (lastUserId) {
                const userId = parseInt(lastUserId, 10);
                currentUser = users.find(u => u.id === userId) || null;
            }

            // If no last user but users exist, pick the first one
            if (!currentUser && users.length > 0) {
                currentUser = users[0];
                if (currentUser.id) {
                    localStorage.setItem(LAST_USER_KEY, currentUser.id.toString());
                }
            }

            set({
                allUsers: users,
                currentUser,
                isLoading: false,
                isInitialized: true
            });
        } catch (error) {
            console.error('Failed to initialize user store:', error);
            set({ isLoading: false, isInitialized: true });
        }
    },

    refreshUsers: async () => {
        try {
            const users = await db.users.toArray();
            set({ allUsers: users });
        } catch (error) {
            console.error('Failed to refresh users:', error);
        }
    },

    switchUser: async (userId: number) => {
        const { allUsers, currentUser } = get();
        const user = allUsers.find(u => u.id === userId);

        // Don't switch if it's the same user
        if (user && user.id !== currentUser?.id) {
            // Start switching animation
            set({ isSwitching: true, switchingToUser: user });

            localStorage.setItem(LAST_USER_KEY, userId.toString());

            // Delay the actual switch to allow animation
            setTimeout(() => {
                set({ currentUser: user });
            }, 800);
        }
    },

    clearSwitching: () => {
        set({ isSwitching: false, switchingToUser: null });
    },

    createUser: async (name: string, avatarStyle: AvatarStyle = 'pixel-art') => {
        const newUser: User = {
            name: name.trim().slice(0, 8), // Max 8 characters
            avatarStyle,
            createdAt: Date.now()
        };

        // Add to database
        const id = await db.users.add(newUser);
        const createdUser = { ...newUser, id };

        // Update store and set as current user
        const { allUsers } = get();
        set({
            allUsers: [...allUsers, createdUser],
            currentUser: createdUser
        });

        // Persist to localStorage
        localStorage.setItem(LAST_USER_KEY, id.toString());

        return createdUser;
    },

    deleteUser: async (userId: number) => {
        const { allUsers, currentUser } = get();

        // Delete user from database
        await db.users.delete(userId);

        // Delete all records for this user
        await db.records.where('userId').equals(userId).delete();

        // Update store
        const updatedUsers = allUsers.filter(u => u.id !== userId);

        // If we deleted the current user, switch to another or set null
        let newCurrentUser = currentUser;
        if (currentUser?.id === userId) {
            newCurrentUser = updatedUsers.length > 0 ? updatedUsers[0] : null;
            if (newCurrentUser?.id) {
                localStorage.setItem(LAST_USER_KEY, newCurrentUser.id.toString());
            } else {
                localStorage.removeItem(LAST_USER_KEY);
            }
        }

        set({
            allUsers: updatedUsers,
            currentUser: newCurrentUser
        });
    },

    saveRecord: async (recordData) => {
        const { currentUser } = get();
        if (!currentUser?.id) {
            console.warn('Cannot save record: No current user');
            return;
        }

        const record: PracticeRecord = {
            ...recordData,
            userId: currentUser.id,
            timestamp: Date.now()
        };

        await db.records.add(record);
        console.log('Practice record saved:', record);
    },

    getUserRecords: async (userId?: number) => {
        const { currentUser } = get();
        const targetUserId = userId || currentUser?.id;

        if (!targetUserId) {
            return [];
        }

        return await db.records
            .where('userId')
            .equals(targetUserId)
            .reverse()
            .sortBy('timestamp');
    }
}));
