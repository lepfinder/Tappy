import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, Check } from 'lucide-react';
import { useUserStore } from '../store/useUserStore';
import { useGameStore } from '../store/useGameStore';

interface UserSwitcherProps {
    onAddUser: () => void;
}

export const UserSwitcher: React.FC<UserSwitcherProps> = ({ onAddUser }) => {
    const { currentUser, allUsers, switchUser, isLoading } = useUserStore();
    const { language } = useGameStore();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

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
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in">
                    {/* Other Users */}
                    {otherUsers.length > 0 && (
                        <div className="py-2 border-b border-gray-100">
                            {otherUsers.map(user => (
                                <button
                                    key={user.id}
                                    onClick={() => handleSwitchUser(user.id!)}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-purple-50 transition-colors text-left"
                                >
                                    <span className="text-xl">{user.avatar}</span>
                                    <span className="font-medium text-gray-700 flex-1 truncate">
                                        {user.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Current User Indicator (when there are other users) */}
                    {currentUser && otherUsers.length > 0 && (
                        <div className="py-2 border-b border-gray-100">
                            <div className="flex items-center gap-3 px-4 py-2 bg-purple-50/50">
                                <span className="text-xl">{currentUser.avatar}</span>
                                <span className="font-medium text-gray-700 flex-1 truncate">
                                    {currentUser.name}
                                </span>
                                <Check size={16} className="text-kid-purple" />
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
