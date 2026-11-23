export interface ChangelogHighlight {
  titleCn: string;
  titleEn: string;
  descCn: string;
  descEn: string;
  badgeCn: string;
  badgeEn: string;
}

export interface ChangelogRelease {
  version: string;
  date: string;
  headlineCn: string;
  headlineEn: string;
  highlights: ChangelogHighlight[];
}

export const APP_VERSION = '2.0.0';

export const CHANGELOG_RELEASES: ChangelogRelease[] = [
  {
    version: '2.0.0',
    date: '2026-11',
    headlineCn: 'Tappy v2.0 奶油森林焕新上线',
    headlineEn: 'Tappy v2.0 Cream Forest Edition',
    highlights: [
      {
        badgeCn: '全新视觉',
        badgeEn: 'New Look',
        titleCn: '奶油森林主题 & 本地 3D 图标',
        titleEn: 'Cream Forest Theme & 3D Icons',
        descCn: '护眼暖米色纸面、木质 3D 机械键盘与全套本地 3D 卡通图标头像，加载更快更柔和。',
        descEn: 'Eye-friendly warm paper palette, 3D wooden mechanical keyboard, and crisp local 3D icons.'
      },
      {
        badgeCn: '专业练字',
        badgeEn: 'Pro Practice',
        titleCn: '真·盲打模式 & 拟真木轴/茶轴音效',
        titleEn: 'Blind Typing Mode & Mechanical Key Sounds',
        descCn: '练习页支持「全引导 / 盲打 / 极简」3 档切换、错键纠偏提示与全程纯键盘结算。',
        descEn: 'Switch between Guide, Blind, and Focus modes with instant typo hints and keyboard-first flow.'
      },
      {
        badgeCn: '家长刚需',
        badgeEn: 'Dictation',
        titleCn: '家长自定义听写词表 & 遮字听写',
        titleEn: 'Custom Dictation Word Lists',
        descCn: '直接粘贴微信群/课本单词一键生成听写关，支持「偷看 1 秒」与链接分享给其他家长。',
        descEn: 'Paste custom word lists for audio dictation with 1-second peek and one-click share links.'
      },
      {
        badgeCn: '精品游戏',
        badgeEn: 'Arcade',
        titleCn: '两大精修打字游戏 + ∞ 无尽模式',
        titleEn: 'Polished Arcade Games + ∞ Endless Mode',
        descCn: '「快乐摘苹果」与「太空打字战机」全套绘本美术重制，新增无尽模式、暂停与全屏最大化。',
        descEn: 'Revamped Apple Catch & Space Shooter with bespoke art, Endless mode, pause, and fullscreen.'
      }
    ]
  }
];
