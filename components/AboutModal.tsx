import React, { useEffect, useState } from 'react';
import { X, Mail, Coffee, Heart, ChevronDown, ChevronUp } from 'lucide-react';
import {
  GameController,
  BookOpenText,
  Keyboard,
  Translate,
  Trophy,
  ChartBar,
  Backpack,
  ChatCircleDots,
  Sparkle,
} from '@phosphor-icons/react';
import { useGameStore } from '../store/useGameStore';

// 使用轻量 WebP 小熊 Logo
const bearLogo = '/images/bear_logo.webp';
// Import WeChat QR code
const weixinQrcode = '/images/weixin_qrcode.jpg';
// 微信赞赏码
const wxpayQrcode = '/wxpayjpg.jpg';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const { language } = useGameStore();
  const [showSponsor, setShowSponsor] = useState(false);

  // 关闭弹窗时自动收起赞赏码，保持每次打开简洁克制
  useEffect(() => {
    if (!isOpen) setShowSponsor(false);
  }, [isOpen]);

  // 支持按 Esc 键快捷关闭弹窗
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const features = language === 'cn' ? [
    {
      icon: GameController,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100/90',
      borderColor: 'border-purple-200/60',
      title: '八大趣味模式',
      desc: '字母练习、英文单词、拼音乐趣、古诗词等',
    },
    {
      icon: BookOpenText,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100/90',
      borderColor: 'border-blue-200/60',
      title: '海量精选内容',
      desc: '75+ 首古诗词，20+ 篇小学课文',
    },
    {
      icon: Keyboard,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-100/90',
      borderColor: 'border-emerald-200/60',
      title: '智能虚拟键盘',
      desc: '彩色手指分区，实时高亮提示',
    },
    {
      icon: Translate,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-100/90',
      borderColor: 'border-cyan-200/60',
      title: '双语界面',
      desc: '中英文一键切换',
    },
    {
      icon: Trophy,
      color: 'text-amber-500',
      bgColor: 'bg-amber-100/90',
      borderColor: 'border-amber-200/60',
      title: '趣味打字游戏',
      desc: '快乐摘苹果、太空打字战机',
    },
    {
      icon: ChartBar,
      color: 'text-rose-500',
      bgColor: 'bg-rose-100/90',
      borderColor: 'border-rose-200/60',
      title: '实时统计',
      desc: '速度、准确率、连击数全记录',
    },
  ] : [
    {
      icon: GameController,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100/90',
      borderColor: 'border-purple-200/60',
      title: '8 Fun Game Modes',
      desc: 'Letters, Words, Pinyin, Poems, and more',
    },
    {
      icon: BookOpenText,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100/90',
      borderColor: 'border-blue-200/60',
      title: 'Rich Content',
      desc: '75+ poems, 20+ essays from textbooks',
    },
    {
      icon: Keyboard,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-100/90',
      borderColor: 'border-emerald-200/60',
      title: 'Smart Virtual Keyboard',
      desc: 'Color-coded finger zones with highlights',
    },
    {
      icon: Translate,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-100/90',
      borderColor: 'border-cyan-200/60',
      title: 'Bilingual Interface',
      desc: 'Switch between Chinese and English',
    },
    {
      icon: Trophy,
      color: 'text-amber-500',
      bgColor: 'bg-amber-100/90',
      borderColor: 'border-amber-200/60',
      title: 'Typing Arcade Games',
      desc: 'Apple Catch & Space Shooter',
    },
    {
      icon: ChartBar,
      color: 'text-rose-500',
      bgColor: 'bg-rose-100/90',
      borderColor: 'border-rose-200/60',
      title: 'Real-time Stats',
      desc: 'Track WPM, accuracy, and combos',
    },
  ];

  const content = language === 'cn' ? {
    title: '关于 Tappy',
    slogan: '小手哒哒，打字顶呱呱！',
    intro: 'Tappy 是一款专为儿童设计的打字启蒙应用，融合趣味游戏化元素与科学的教学设计，让孩子们在轻松愉快的氛围中掌握键盘打字技能。',
    suitable: '适合学龄前儿童、小学生、海外华裔儿童使用',
    footer: '让我们一起，用指尖敲出美好的未来！',
    contactTitle: '联系我',
    contactDesc: '如果有任何问题和建议，欢迎联系我！',
    wechatLabel: '微信扫码',
    sponsorTitle: '请作者喝杯咖啡',
    sponsorDesc: 'Tappy 永久免费、无广告。如果它帮到了你和孩子，欢迎请作者喝杯咖啡，支持持续打磨更多有趣内容。',
    sponsorBtnOpen: '请作者喝杯咖啡',
    sponsorBtnClose: '收起赞赏码',
    sponsorHint: '微信扫一扫 · 金额随意，感谢支持 ❤️',
  } : {
    title: 'About Tappy',
    slogan: 'Type Happy, Grow Fast!',
    intro: 'Tappy is a fun typing app designed for kids, combining gamification with scientific teaching methods to help children master keyboard typing skills in a relaxed and enjoyable environment.',
    suitable: 'Perfect for preschoolers, elementary students, and overseas Chinese children',
    footer: "Let's tap our way to a brighter future!",
    contactTitle: 'Contact Me',
    contactDesc: 'If you have any questions or suggestions, feel free to reach out!',
    wechatLabel: 'WeChat',
    sponsorTitle: 'Buy Me a Coffee',
    sponsorDesc: 'Tappy is 100% free and ad-free. If it helps your family, consider buying the author a coffee to support future updates!',
    sponsorBtnOpen: 'Buy Me a Coffee',
    sponsorBtnClose: 'Hide QR Code',
    sponsorHint: 'Scan with WeChat · Thank you for your support ❤️',
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto relative border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors z-10"
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
          <p className="text-gray-600 leading-relaxed text-sm text-center md:text-left">{content.intro}</p>

          {/* Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={index}
                  className={`group bg-white rounded-2xl p-3.5 text-center border ${feature.borderColor} hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col items-center justify-center`}
                >
                  {/* Phosphor Icon with colorful duotone background badge */}
                  <div className={`w-11 h-11 rounded-2xl ${feature.bgColor} flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent weight="duotone" className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h4 className="font-bold text-gray-800 text-sm leading-tight mb-1">{feature.title}</h4>
                  <p className="text-xs text-gray-500 leading-tight">{feature.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Suitable Audience */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-3.5 border border-amber-200/60 flex items-center justify-center gap-2.5 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Backpack weight="duotone" className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-gray-700 text-sm font-medium text-center">
              {content.suitable}
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-center gap-1.5 text-center text-gray-600 text-sm font-semibold">
            <span>{content.footer}</span>
            <Sparkle weight="duotone" className="w-4 h-4 text-amber-400 animate-twinkle" />
          </div>

          {/* Sponsor / 请作者喝咖啡（默认收起，克制得体） */}
          <div className="bg-gradient-to-br from-amber-50/90 via-[#FFFBF2] to-orange-50/80 rounded-2xl p-4 sm:p-5 border border-amber-200/70 text-center">
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                <Coffee size={15} />
              </div>
              <h3 className="font-extrabold text-[#2B211B] text-base">{content.sponsorTitle}</h3>
            </div>
            <p className="text-[#7A6A5F] text-xs leading-relaxed max-w-md mx-auto mb-3.5">
              {content.sponsorDesc}
            </p>

            <button
              type="button"
              onClick={() => setShowSponsor((prev) => !prev)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white font-extrabold text-sm shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-95"
            >
              <Heart size={15} className="fill-white/90 text-white" />
              <span>{showSponsor ? content.sponsorBtnClose : content.sponsorBtnOpen}</span>
              {showSponsor ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>

            {showSponsor && (
              <div className="mt-4 pt-4 border-t border-amber-200/60 flex flex-col items-center animate-fade-in">
                <div className="p-2.5 bg-white rounded-2xl shadow-md border border-amber-100">
                  <img
                    src={wxpayQrcode}
                    alt="WeChat Reward QR Code"
                    className="w-44 sm:w-48 h-auto rounded-xl object-contain"
                  />
                </div>
                <span className="text-xs font-bold text-amber-800/80 mt-2.5">
                  {content.sponsorHint}
                </span>
              </div>
            )}
          </div>

          {/* Contact Section */}
          <div className="bg-gradient-to-br from-blue-50/80 via-indigo-50/50 to-purple-50/80 rounded-2xl p-4 border border-blue-100">
            <div className="flex items-center justify-center gap-2 mb-1">
              <ChatCircleDots weight="duotone" className="w-5 h-5 text-indigo-500" />
              <h3 className="font-bold text-gray-800">{content.contactTitle}</h3>
            </div>
            <p className="text-gray-500 text-xs text-center mb-3.5">{content.contactDesc}</p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {/* Email */}
              <a
                href="mailto:sdlgxxy@gmail.com"
                className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all text-sm text-gray-700 hover:text-kid-blue border border-gray-100"
              >
                <Mail size={16} className="text-blue-500" />
                <span>sdlgxxy@gmail.com</span>
              </a>

              {/* WeChat QR Code */}
              <div className="flex flex-col items-center">
                <img
                  src={weixinQrcode}
                  alt="WeChat QR Code"
                  className="w-28 h-auto rounded-xl shadow-md border-2 border-white object-contain"
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
