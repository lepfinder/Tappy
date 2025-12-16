import React from 'react';
import { X, Volume2, VolumeX } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { language, soundEnabled, setSoundEnabled } = useGameStore();

    if (!isOpen) return null;

    const content = language === 'cn' ? {
        title: '设置',
        sound: '游戏音效',
        soundOn: '开启',
        soundOff: '关闭',
    } : {
        title: 'Settings',
        sound: 'Sound Effects',
        soundOn: 'On',
        soundOff: 'Off',
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-3xl shadow-2xl max-w-md w-full relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors z-10"
                >
                    <X size={18} />
                </button>

                {/* Header */}
                <div className="bg-gradient-to-r from-pink-100 via-blue-100 to-purple-100 p-6 rounded-t-3xl text-center">
                    <div className="w-12 h-12 mx-auto mb-2 bg-white rounded-full flex items-center justify-center shadow-md">
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-cartoon text-kid-blue">{content.title}</h2>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Sound Setting */}
                    <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            {soundEnabled ? (
                                <Volume2 className="w-5 h-5 text-kid-blue" />
                            ) : (
                                <VolumeX className="w-5 h-5 text-gray-400" />
                            )}
                            <span className="font-medium text-gray-700">{content.sound}</span>
                        </div>

                        {/* Toggle Switch */}
                        <button
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            className={`
                                relative w-14 h-8 rounded-full transition-colors duration-300
                                ${soundEnabled ? 'bg-kid-blue' : 'bg-gray-300'}
                            `}
                        >
                            <span
                                className={`
                                    absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300
                                    ${soundEnabled ? 'translate-x-7' : 'translate-x-1'}
                                `}
                            />
                        </button>
                    </div>

                    {/* Status Text */}
                    <p className="text-center text-sm text-gray-400">
                        {soundEnabled ? `🔊 ${content.soundOn}` : `🔇 ${content.soundOff}`}
                    </p>
                </div>
            </div>
        </div>
    );
};
