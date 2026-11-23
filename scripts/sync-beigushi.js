import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pinyin } from 'pinyin-pro';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BEIGUSHI_DIR = path.resolve(__dirname, '../../beigushi');
const POEMS_META_PATH = path.join(BEIGUSHI_DIR, 'data/poems_meta.json');
const CONTENT_DIR = path.join(BEIGUSHI_DIR, 'content');
const OUTPUT_POEMS_PATH = path.resolve(__dirname, '../data/cn_poems.ts');
const OUTPUT_ESSAYS_PATH = path.resolve(__dirname, '../data/cn_essays.ts');

if (!fs.existsSync(POEMS_META_PATH)) {
  console.error(`Error: Cannot find beigushi at ${BEIGUSHI_DIR}`);
  process.exit(1);
}

// 常见古诗词与课文多音字校正
const SPECIAL_CHAR_PINYIN = {
  '行': {
    '一行白鹭': 'hang',
    '两行': 'hang',
    '千行': 'hang',
    '同行': 'hang'
  },
  '朝': {
    '朝辞': 'zhao',
    '朝发': 'zhao',
    '朝看': 'zhao',
    '朝闻': 'zhao',
    '朝菌': 'zhao',
    '朝朝': 'zhao'
  },
  '见': {
    '风吹草低见牛羊': 'xian'
  },
  '少': {
    '少小': 'shao',
    '少年': 'shao'
  },
  '教': {
    '不教胡马': 'jiao'
  },
  '更': {
    '更上一层楼': 'geng',
    '更著风和雨': 'geng'
  },
  '宿': {
    '宿建德江': 'su'
  },
  '重': {
    '两重山': 'chong',
    '万重山': 'chong',
    '几重': 'chong'
  },
  '数': {
    '数不清': 'shu'
  },
  '乐': {
    '音乐': 'yue',
    '奏乐': 'yue'
  }
};

// 剥离声调并将 ü 映射为键盘输入键 v
function normalizePinyin(tonePinyin) {
  const toneMap = {
    'ā': 'a', 'á': 'a', 'ǎ': 'a', 'à': 'a',
    'ō': 'o', 'ó': 'o', 'ǒ': 'o', 'ò': 'o',
    'ē': 'e', 'é': 'e', 'ě': 'e', 'è': 'e', 'ê': 'e', 'ế': 'e', 'ề': 'e',
    'ī': 'i', 'í': 'i', 'ǐ': 'i', 'ì': 'i',
    'ū': 'u', 'ú': 'u', 'ǔ': 'u', 'ù': 'u',
    'ǖ': 'v', 'ǘ': 'v', 'ǚ': 'v', 'ǜ': 'v', 'ü': 'v'
  };
  let res = tonePinyin.toLowerCase().trim();
  for (const [k, v] of Object.entries(toneMap)) {
    res = res.replaceAll(k, v);
  }
  return res;
}

// 解析 HTML 中的 ruby 标签映射
function loadRubyMapFromHtml() {
  const map = {}; // poemId -> [{ hanzi, pinyin }]
  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.html'));

  files.forEach(file => {
    const filePath = path.join(CONTENT_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const gradeName = file.replace('古诗词.html', '');

    const cardRegex = /<div class="poem-card"[^>]*id="(poem-\d+)"[\s\S]*?(?=<div class="poem-card"|<div class="section-label"|<footer|$)/g;
    let cardMatch;

    while ((cardMatch = cardRegex.exec(content)) !== null) {
      const poemId = `${gradeName}-${cardMatch[1]}`;
      const cardHtml = cardMatch[0];

      const bodyMatch = cardHtml.match(/<div class="poem-body[^"]*"[^>]*>([\s\S]*?)<\/div>/);
      if (!bodyMatch) continue;

      const pList = bodyMatch[1].match(/<p[^>]*>([\s\S]*?)<\/p>/g) || [];
      const linesData = [];

      pList.forEach(pTag => {
        const rubyMatches = [...pTag.matchAll(/<ruby>([^<]+)<rt>([^<]+)<\/rt><\/ruby>/g)];
        if (rubyMatches.length > 0) {
          const rubyChars = [];
          for (const rm of rubyMatches) {
            rubyChars.push({
              hanzi: rm[1].trim(),
              pinyin: normalizePinyin(rm[2])
            });
          }
          linesData.push(rubyChars);
        }
      });

      if (linesData.length > 0) {
        map[poemId] = linesData;
      }
    }
  });

  return map;
}

// 汉字转拼音（结合特殊多音字和 pinyin-pro）
function getPinyinForSentence(cleanSentence, fullSentenceContext = '') {
  const result = pinyin(cleanSentence, { toneType: 'none', v: true, type: 'array' });
  const chars = cleanSentence.split('');

  // 多音字补正
  chars.forEach((char, idx) => {
    if (SPECIAL_CHAR_PINYIN[char]) {
      const rules = SPECIAL_CHAR_PINYIN[char];
      for (const [pattern, targetPy] of Object.entries(rules)) {
        if (cleanSentence.includes(pattern) || fullSentenceContext.includes(pattern)) {
          result[idx] = targetPy;
          break;
        }
      }
    }
  });

  return result;
}

// 年级数字与难度映射
const GRADE_MAP = {
  '一年级上册': { grade: 1, semester: 1, diff: 1 },
  '一年级下册': { grade: 1, semester: 2, diff: 1 },
  '二年级上册': { grade: 2, semester: 1, diff: 1 },
  '二年级下册': { grade: 2, semester: 2, diff: 1 },
  '三年级上册': { grade: 3, semester: 1, diff: 2 },
  '三年级下册': { grade: 3, semester: 2, diff: 2 },
  '四年级上册': { grade: 4, semester: 1, diff: 2 },
  '四年级下册': { grade: 4, semester: 2, diff: 2 },
  '五年级上册': { grade: 5, semester: 1, diff: 3 },
  '五年级下册': { grade: 5, semester: 2, diff: 3 },
  '六年级上册': { grade: 6, semester: 1, diff: 3 },
  '六年级下册': { grade: 6, semester: 2, diff: 3 },
  '七年级上册': { grade: 7, semester: 1, diff: 3 },
  '七年级下册': { grade: 7, semester: 2, diff: 3 },
  '八年级上册': { grade: 8, semester: 1, diff: 3 },
  '八年级下册': { grade: 8, semester: 2, diff: 3 },
  '九年级上册': { grade: 9, semester: 1, diff: 3 },
  '九年级下册': { grade: 9, semester: 2, diff: 3 },
};

function syncPoems() {
  console.log('🚀 开始从 beigushi 同步古诗词数据...');
  const poemsMeta = JSON.parse(fs.readFileSync(POEMS_META_PATH, 'utf8'));
  const rubyMap = loadRubyMapFromHtml();
  console.log(`📖 读取到 ${poemsMeta.poems.length} 首古诗，其中 ${Object.keys(rubyMap).length} 首包含官方 ruby 精确注音`);

  const tappyLevels = [];

  poemsMeta.poems.forEach((poem, poemIndex) => {
    const gradeInfo = GRADE_MAP[poem.grade] || { grade: 1, semester: 1, diff: 1 };
    const levelId = `poem_g${gradeInfo.grade}_${poemIndex + 1}`;
    const rubyLines = rubyMap[poem.id] || null;

    const challenges = [];

    // 处理每行诗句
    poem.lines.forEach((rawLine, lineIdx) => {
      if (!rawLine || rawLine.trim() === '') return;

      const segments = rawLine.split(/[，,。！？、；;]/).map(s => s.trim()).filter(Boolean);

      segments.forEach((seg) => {
        let cleanText = seg.replace(/[^\u4e00-\u9fa5]/g, '');
        // 过滤掉提示字
        cleanText = cleanText.replace(/^(?:背诵|选背)/, '');
        if (!cleanText) return;

        let pyArray = [];

        // 尝试从 rubyMap 取
        if (rubyLines && rubyLines[lineIdx]) {
          const matchingRuby = rubyLines[lineIdx];
          const rubyText = matchingRuby.map(r => r.hanzi).join('');
          const startPos = rubyText.indexOf(cleanText);
          if (startPos !== -1) {
            pyArray = matchingRuby.slice(startPos, startPos + cleanText.length).map(r => r.pinyin);
          }
        }

        // 若无 ruby 或长度不符，用 pinyin-pro 并做多音字校正
        if (!pyArray.length || pyArray.length !== cleanText.length) {
          pyArray = getPinyinForSentence(cleanText, rawLine);
        }

        if (cleanText.length !== pyArray.length) {
          console.warn(`⚠️ 拼音长度不匹配: ${cleanText} vs ${pyArray.join('/')}`);
          return;
        }

        challenges.push({
          display: cleanText,
          pinyin: pyArray
        });
      });
    });

    if (challenges.length === 0) return;

    let desc = `${poem.dynasty || ''}·${poem.author || '佚名'}`;
    if (poem.source) {
      desc += ` (${poem.source})`;
    }

    tappyLevels.push({
      id: levelId,
      title: poem.title,
      description: desc,
      difficulty: gradeInfo.diff,
      tags: [
        `grade-${gradeInfo.grade}`,
        `semester-${gradeInfo.semester}`,
        poem.stage === '初中' ? 'junior-high' : 'primary-school'
      ],
      challenges
    });
  });

  console.log(`✨ 成功生成 ${tappyLevels.length} 个古诗关卡！`);

  const poemsFileContent = `import { Level } from '../types';

export const LEVELS_CN_POEMS: Level[] = ${JSON.stringify(tappyLevels, null, 2)};
`;

  fs.writeFileSync(OUTPUT_POEMS_PATH, poemsFileContent, 'utf8');
  console.log(`💾 已保存古诗词到 ${OUTPUT_POEMS_PATH}`);
}

// 提取统编教材必背课文并补充进 cn_essays.ts
function syncReciteEssays() {
  console.log('🚀 开始提取教材必背课文短文...');

  // 读取原 cn_essays.ts
  let existingEssays = [];
  if (fs.existsSync(OUTPUT_ESSAYS_PATH)) {
    try {
      const existingContent = fs.readFileSync(OUTPUT_ESSAYS_PATH, 'utf8');
      const code = existingContent
        .replace(/import\s+[^;]+;/, '')
        .replace('export const LEVELS_CN_ESSAYS: Level[] =', 'return');
      existingEssays = new Function(code)();
      console.log(`📚 已有短文 ${existingEssays.length} 篇`);
    } catch (e) {
      console.error('读取原短文失败，使用空数组:', e);
      existingEssays = [];
    }
  }

  const existingTitles = new Set(existingEssays.map(e => e.title));

  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.html'));
  const newEssays = [];

  files.forEach(file => {
    const gradeName = file.replace('古诗词.html', '');
    const gradeInfo = GRADE_MAP[gradeName];
    if (!gradeInfo) return;

    const content = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf8');
    // 精准切分每一个 recite-card
    const reciteRegex = /<div class="poem-card recite-card"[^>]*id="(recite-\d+)"[\s\S]*?(?=<div class="poem-card recite-card"|<div class="section-label"|<footer|$)/g;
    let match;

    while ((match = reciteRegex.exec(content)) !== null) {
      const cardHtml = match[0];
      const textMatch = cardHtml.match(/<div class="recite-text[^"]*"[^>]*>([\s\S]*?)<\/div>/);
      // 如果本卡片没有 recite-text 正文（例如仅是引用上方全诗），跳过
      if (!textMatch) continue;

      const titleMatch = cardHtml.match(/<div class="poem-title[^"]*"[^>]*>([\s\S]*?)<\/div>/);
      const metaMatch = cardHtml.match(/<div class="poem-meta"[^>]*>([\s\S]*?)<\/div>/);
      if (!titleMatch) continue;

      const title = titleMatch[1].replace(/<[^>]+>/g, '').trim();
      if (title.includes('古诗') || existingTitles.has(title)) {
        continue; // 跳过已存在或古诗篇目
      }

      const meta = metaMatch ? metaMatch[1].replace(/<[^>]+>/g, '').trim() : '';

      // 提取正文并彻底清除 <span class="highlight-label">背诵</span> / <span class="lesson-tag"> 等标签及其文字内容
      let textHtml = textMatch[1]
        .replace(/<span\s+class="[^"]*(?:label|tag)[^"]*"[^>]*>[\s\S]*?<\/span>/gi, '');

      const pList = textHtml.match(/<p[^>]*>([\s\S]*?)<\/p>/g) || [];
      const challenges = [];

      pList.forEach(pTag => {
        // 去除 HTML 标签
        const rawLine = pTag.replace(/<[^>]+>/g, '').trim();
        if (!rawLine) return;

        // 如果是短文内的纯标题（如居中的“陋室铭”、“爱莲说”），跳过作为打字内容
        if (['陋室铭', '爱莲说', '假如生活欺骗了你'].includes(rawLine)) return;

        const segments = rawLine.split(/[，,。！？、；;]/).map(s => s.trim()).filter(Boolean);

        segments.forEach(seg => {
          let cleanText = seg.replace(/[^\u4e00-\u9fa5]/g, '');
          // 彻底去除开头遗留的“背诵”或“选背”提示字
          cleanText = cleanText.replace(/^(?:背诵|选背)/, '');
          if (!cleanText || cleanText.length < 2) return;

          const chunks = [];
          if (cleanText.length > 10) {
            const mid = Math.ceil(cleanText.length / 2);
            chunks.push(cleanText.slice(0, mid));
            chunks.push(cleanText.slice(mid));
          } else {
            chunks.push(cleanText);
          }

          chunks.forEach(chunk => {
            const py = getPinyinForSentence(chunk, rawLine);
            if (chunk.length === py.length) {
              challenges.push({
                display: chunk,
                pinyin: py
              });
            }
          });
        });
      });

      if (challenges.length >= 2) {
        existingTitles.add(title);
        newEssays.push({
          id: `essay_recite_${gradeInfo.grade}_${title}`,
          title,
          description: meta || `${gradeName} 必背课文`,
          difficulty: gradeInfo.diff,
          tags: [`grade-${gradeInfo.grade}`, `semester-${gradeInfo.semester}`],
          challenges: challenges.slice(0, 16)
        });
      }
    }
  });

  console.log(`✨ 成功从教材补充 ${newEssays.length} 篇新必背课文！`);

  // 合并并按年级排序
  const allEssays = [...existingEssays, ...newEssays].sort((a, b) => {
    const getGrade = (item) => {
      const tag = item.tags?.find(t => t.startsWith('grade-'));
      return tag ? parseInt(tag.replace('grade-', ''), 10) : 1;
    };
    return getGrade(a) - getGrade(b);
  });

  const essayFileContent = `import { Level } from '../types';

export const LEVELS_CN_ESSAYS: Level[] = ${JSON.stringify(allEssays, null, 2)};
`;
  fs.writeFileSync(OUTPUT_ESSAYS_PATH, essayFileContent, 'utf8');
  console.log(`💾 已保存短文到 ${OUTPUT_ESSAYS_PATH}（共 ${allEssays.length} 篇）`);
}

function main() {
  syncPoems();
  syncReciteEssays();
}

main();
