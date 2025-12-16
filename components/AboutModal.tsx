import React from 'react';
import { X, Mail } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';

// Import bear logo
import bearLogo from '../images/bear_logo.png';
// Import WeChat QR code
import weixinQrcode from '../images/weixin_qrcode.jpg';

interface AboutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
    const { language } = useGameStore();

    if (!isOpen) return null;

    const content = language === 'cn' ? {
        title: '关于 Tappy',
        slogan: '小手哒哒，打字顶呱呱！',
        intro: 'Tappy 是一款专为儿童设计的打字启蒙应用，融合趣味游戏化元素与科学的教学设计，让孩子们在轻松愉快的氛围中掌握键盘打字技能。',
        features: [
            { icon: '🎮', title: '八大趣味模式', desc: '字母练习、英文单词、拼音乐趣、古诗词等' },
            { icon: '📚', title: '海量精选内容', desc: '75+ 首古诗词，20+ 篇小学课文' },
            { icon: '⌨️', title: '智能虚拟键盘', desc: '彩色手指分区，实时高亮提示' },
            { icon: '🌐', title: '双语界面', desc: '中英文一键切换' },
            { icon: '🏎️', title: '竞速游戏', desc: '打字越快，跑得越快！' },
            { icon: '📊', title: '实时统计', desc: '速度、准确率、连击数全记录' },
        ],
        suitable: '适合学龄前儿童、小学生、海外华裔儿童使用',
        footer: '让我们一起，用指尖敲出美好的未来！🌟',
        contactTitle: '联系我',
        contactDesc: '如果有任何问题和建议，欢迎联系我！',
        wechatLabel: '微信扫码',
    } : {
        title: 'About Tappy',
        slogan: 'Type Happy, Grow Fast!',
        intro: 'Tappy is a fun typing app designed for kids, combining gamification with scientific teaching methods to help children master keyboard typing skills in a relaxed and enjoyable environment.',
        features: [
            { icon: '🎮', title: '8 Fun Game Modes', desc: 'Letters, Words, Pinyin, Poems, and more' },
            { icon: '📚', title: 'Rich Content', desc: '75+ poems, 20+ essays from textbooks' },
            { icon: '⌨️', title: 'Smart Virtual Keyboard', desc: 'Color-coded finger zones with highlights' },
            { icon: '🌐', title: 'Bilingual Interface', desc: 'Switch between Chinese and English' },
            { icon: '🏎️', title: 'Racing Game', desc: 'Type faster to run faster!' },
            { icon: '📊', title: 'Real-time Stats', desc: 'Track WPM, accuracy, and combos' },
        ],
        suitable: 'Perfect for preschoolers, elementary students, and overseas Chinese children',
        footer: "Let's tap our way to a brighter future! 🌟",
        contactTitle: 'Contact Me',
        contactDesc: 'If you have any questions or suggestions, feel free to reach out!',
        wechatLabel: 'WeChat',
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto relative"
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
                    <img src={bearLogo} alt="Tappy Logo" className="w-16 h-16 mx-auto mb-3 animate-float" />
                    <h2 className="text-2xl font-cartoon text-kid-blue">{content.title}</h2>
                    <p className="text-gray-600 mt-1 font-medium">{content.slogan}</p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Introduction */}
                    <p className="text-gray-600 leading-relaxed text-sm">{content.intro}</p>

                    {/* Features Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {content.features.map((feature, index) => (
                            <div
                                key={index}
                                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 text-center hover:shadow-md transition-shadow"
                            >
                                <span className="text-2xl">{feature.icon}</span>
                                <h4 className="font-bold text-gray-700 text-sm mt-1">{feature.title}</h4>
                                <p className="text-xs text-gray-500 mt-0.5">{feature.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Suitable Audience */}
                    <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                        <p className="text-gray-600 text-sm text-center">
                            🎒 {content.suitable}
                        </p>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-gray-500 text-sm font-medium">{content.footer}</p>

                    {/* Contact Section */}
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                        <h3 className="text-center font-bold text-gray-700 mb-2">💬 {content.contactTitle}</h3>
                        <p className="text-gray-500 text-xs text-center mb-3">{content.contactDesc}</p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            {/* Email */}
                            <a
                                href="mailto:sdlgxxy@gmail.com"
                                className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-shadow text-sm text-gray-600 hover:text-kid-blue"
                            >
                                <Mail size={16} />
                                <span>sdlgxxy@gmail.com</span>
                            </a>

                            {/* WeChat QR Code */}
                            <div className="flex flex-col items-center">
                                <img
                                    src={weixinQrcode}
                                    alt="WeChat QR Code"
                                    className="w-28 h-auto rounded-lg shadow-md border-2 border-white object-contain"
                                />
                                <span className="text-xs text-gray-400 mt-1">{content.wechatLabel}</span>
                            </div>
                        </div>
                    </div>

                    {/* Branding */}
                    <div className="text-center pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-400">
                            Tappy — <span className="italic">Tap your way to typing mastery!</span> 🐻✨
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
