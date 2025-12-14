import { GameMode } from "./types";

export const TRANSLATIONS = {
  en: {
    appTitle: "KidType Fun",
    subtitle: "Learn to type",
    selectMode: "Select a Game Mode",
    chooseLevel: "Choose a level",
    level: "Level",
    levelLabel: "LEVEL",
    wpm: "WPM",
    accuracy: "Accuracy",
    combo: "Combo",
    errors: "Errors",
    score: "Score",
    replay: "Replay",
    levels: "Levels",
    next: "Next",
    levelComplete: "Level Complete!",
    greatJob: "You did great!",
    space: "SPACE",
    modes: {
      EN_LETTERS: { title: 'ABC Practice', desc: 'Learn where the keys are' },
      EN_WORDS: { title: 'English Words', desc: 'Type fun words' },
      CN_PINYIN: { title: 'Pinyin Fun', desc: 'Pinyin & Characters' },
      CN_SENTENCES: { title: 'Chinese Phrases', desc: 'Type full sentences' },
    } as Record<GameMode, { title: string; desc: string }>
  },
  cn: {
    appTitle: "快乐打字",
    subtitle: "打字启蒙",
    selectMode: "选择游戏模式",
    chooseLevel: "选择关卡",
    level: "关卡",
    levelLabel: "关卡",
    wpm: "速度",
    accuracy: "准确率",
    combo: "连击",
    errors: "错误",
    score: "分数",
    replay: "重玩",
    levels: "列表",
    next: "下一关",
    levelComplete: "关卡完成！",
    greatJob: "做得太棒了！",
    space: "空格",
    modes: {
      EN_LETTERS: { title: '字母练习', desc: '熟悉键盘位置' },
      EN_WORDS: { title: '英文单词', desc: '练习有趣的单词' },
      CN_PINYIN: { title: '拼音乐趣', desc: '拼音和汉字' },
      CN_SENTENCES: { title: '中文短句', desc: '练习输入完整句子' },
    } as Record<GameMode, { title: string; desc: string }>
  }
};