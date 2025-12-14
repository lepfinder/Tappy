
import { Level } from '../types';

export const LEVELS_CN_PINYIN: Level[] = [
  // ==========================================
  // PHASE 1: Basics (Concrete Nouns)
  // ==========================================
  {
    id: 'cn_p_1',
    title: 'Numbers 🔢',
    description: '基本数字',
    difficulty: 1,
    challenges: [
      { display: '一', pinyin: ['yi'], translation: 'One' },
      { display: '二', pinyin: ['er'], translation: 'Two' },
      { display: '三', pinyin: ['san'], translation: 'Three' },
      { display: '四', pinyin: ['si'], translation: 'Four' },
      { display: '五', pinyin: ['wu'], translation: 'Five' },
      { display: '六', pinyin: ['liu'], translation: 'Six' },
      { display: '七', pinyin: ['qi'], translation: 'Seven' },
      { display: '八', pinyin: ['ba'], translation: 'Eight' },
      { display: '九', pinyin: ['jiu'], translation: 'Nine' },
      { display: '十', pinyin: ['shi'], translation: 'Ten' }
    ]
  },
  {
    id: 'cn_p_2',
    title: 'Elements 🌏',
    description: '自然元素',
    difficulty: 1,
    challenges: [
      { display: '天', pinyin: ['tian'], translation: 'Sky' },
      { display: '地', pinyin: ['di'], translation: 'Earth/Ground' },
      { display: '人', pinyin: ['ren'], translation: 'Person' },
      { display: '金', pinyin: ['jin'], translation: 'Gold/Metal' },
      { display: '木', pinyin: ['mu'], translation: 'Wood' },
      { display: '水', pinyin: ['shui'], translation: 'Water' },
      { display: '火', pinyin: ['huo'], translation: 'Fire' },
      { display: '土', pinyin: ['tu'], translation: 'Earth/Soil' },
      { display: '日', pinyin: ['ri'], translation: 'Sun' },
      { display: '月', pinyin: ['yue'], translation: 'Moon' }
    ]
  },
  {
    id: 'cn_p_3',
    title: 'Family 👨‍👩‍👧',
    description: '家庭成员',
    difficulty: 1,
    challenges: [
      { display: '爸', pinyin: ['ba'], translation: 'Dad' },
      { display: '妈', pinyin: ['ma'], translation: 'Mom' },
      { display: '哥', pinyin: ['ge'], translation: 'Older Brother' },
      { display: '弟', pinyin: ['di'], translation: 'Younger Brother' },
      { display: '姐', pinyin: ['jie'], translation: 'Older Sister' },
      { display: '妹', pinyin: ['mei'], translation: 'Younger Sister' },
      { display: '爷', pinyin: ['ye'], translation: 'Grandpa' },
      { display: '奶', pinyin: ['nai'], translation: 'Grandma' },
      { display: '我', pinyin: ['wo'], translation: 'Me' },
      { display: '你', pinyin: ['ni'], translation: 'You' }
    ]
  },
  {
    id: 'cn_p_4',
    title: 'Body I 👀',
    description: '身体部位',
    difficulty: 1,
    challenges: [
      { display: '头', pinyin: ['tou'], translation: 'Head' },
      { display: '口', pinyin: ['kou'], translation: 'Mouth' },
      { display: '目', pinyin: ['mu'], translation: 'Eye' },
      { display: '耳', pinyin: ['er'], translation: 'Ear' },
      { display: '手', pinyin: ['shou'], translation: 'Hand' },
      { display: '足', pinyin: ['zu'], translation: 'Foot' },
      { display: '牙', pinyin: ['ya'], translation: 'Tooth' },
      { display: '舌', pinyin: ['she'], translation: 'Tongue' },
      { display: '心', pinyin: ['xin'], translation: 'Heart' },
      { display: '身', pinyin: ['shen'], translation: 'Body' }
    ]
  },
  {
    id: 'cn_p_5',
    title: 'Colors 🎨',
    description: '五颜六色',
    difficulty: 1,
    challenges: [
      { display: '红', pinyin: ['hong'], translation: 'Red' },
      { display: '黄', pinyin: ['huang'], translation: 'Yellow' },
      { display: '蓝', pinyin: ['lan'], translation: 'Blue' },
      { display: '绿', pinyin: ['lv'], translation: 'Green' },
      { display: '白', pinyin: ['bai'], translation: 'White' },
      { display: '黑', pinyin: ['hei'], translation: 'Black' },
      { display: '紫', pinyin: ['zi'], translation: 'Purple' },
      { display: '灰', pinyin: ['hui'], translation: 'Gray' },
      { display: '橙', pinyin: ['cheng'], translation: 'Orange' },
      { display: '色', pinyin: ['se'], translation: 'Color' }
    ]
  },
  {
    id: 'cn_p_6',
    title: 'Animals I 🐱',
    description: '常见动物',
    difficulty: 1,
    challenges: [
      { display: '猫', pinyin: ['mao'], translation: 'Cat' },
      { display: '狗', pinyin: ['gou'], translation: 'Dog' },
      { display: '鸟', pinyin: ['niao'], translation: 'Bird' },
      { display: '鱼', pinyin: ['yu'], translation: 'Fish' },
      { display: '牛', pinyin: ['niu'], translation: 'Cow' },
      { display: '羊', pinyin: ['yang'], translation: 'Sheep' },
      { display: '马', pinyin: ['ma'], translation: 'Horse' },
      { display: '虫', pinyin: ['chong'], translation: 'Insect' },
      { display: '鸡', pinyin: ['ji'], translation: 'Chicken' },
      { display: '猪', pinyin: ['zhu'], translation: 'Pig' }
    ]
  },
  {
    id: 'cn_p_7',
    title: 'Nature II 🌳',
    description: '自然景观',
    difficulty: 1,
    challenges: [
      { display: '山', pinyin: ['shan'], translation: 'Mountain' },
      { display: '石', pinyin: ['shi'], translation: 'Stone' },
      { display: '田', pinyin: ['tian'], translation: 'Field' },
      { display: '土', pinyin: ['tu'], translation: 'Soil' },
      { display: '风', pinyin: ['feng'], translation: 'Wind' },
      { display: '云', pinyin: ['yun'], translation: 'Cloud' },
      { display: '雨', pinyin: ['yu'], translation: 'Rain' },
      { display: '雪', pinyin: ['xue'], translation: 'Snow' },
      { display: '电', pinyin: ['dian'], translation: 'Lightning/Electricity' },
      { display: '河', pinyin: ['he'], translation: 'River' }
    ]
  },
  {
    id: 'cn_p_8',
    title: 'Fruit 🍎',
    description: '水果',
    difficulty: 1,
    challenges: [
      { display: '果', pinyin: ['guo'], translation: 'Fruit' },
      { display: '瓜', pinyin: ['gua'], translation: 'Melon' },
      { display: '桃', pinyin: ['tao'], translation: 'Peach' },
      { display: '李', pinyin: ['li'], translation: 'Plum' },
      { display: '杏', pinyin: ['xing'], translation: 'Apricot' },
      { display: '梨', pinyin: ['li'], translation: 'Pear' },
      { display: '枣', pinyin: ['zao'], translation: 'Jujube' },
      { display: '蕉', pinyin: ['jiao'], translation: 'Banana' },
      { display: '莓', pinyin: ['mei'], translation: 'Berry' },
      { display: '皮', pinyin: ['pi'], translation: 'Skin/Peel' }
    ]
  },
  {
    id: 'cn_p_9',
    title: 'Food 🍚',
    description: '食物',
    difficulty: 1,
    challenges: [
      { display: '米', pinyin: ['mi'], translation: 'Rice (raw)' },
      { display: '饭', pinyin: ['fan'], translation: 'Meal/Rice' },
      { display: '面', pinyin: ['mian'], translation: 'Noodles' },
      { display: '肉', pinyin: ['rou'], translation: 'Meat' },
      { display: '菜', pinyin: ['cai'], translation: 'Vegetable/Dish' },
      { display: '汤', pinyin: ['tang'], translation: 'Soup' },
      { display: '蛋', pinyin: ['dan'], translation: 'Egg' },
      { display: '奶', pinyin: ['nai'], translation: 'Milk' },
      { display: '糖', pinyin: ['tang'], translation: 'Sugar/Candy' },
      { display: '盐', pinyin: ['yan'], translation: 'Salt' }
    ]
  },
  {
    id: 'cn_p_10',
    title: 'Directions 🧭',
    description: '方向',
    difficulty: 1,
    challenges: [
      { display: '上', pinyin: ['shang'], translation: 'Up' },
      { display: '下', pinyin: ['xia'], translation: 'Down' },
      { display: '左', pinyin: ['zuo'], translation: 'Left' },
      { display: '右', pinyin: ['you'], translation: 'Right' },
      { display: '前', pinyin: ['qian'], translation: 'Front' },
      { display: '后', pinyin: ['hou'], translation: 'Back' },
      { display: '东', pinyin: ['dong'], translation: 'East' },
      { display: '西', pinyin: ['xi'], translation: 'West' },
      { display: '南', pinyin: ['nan'], translation: 'South' },
      { display: '北', pinyin: ['bei'], translation: 'North' }
    ]
  },

  // ==========================================
  // PHASE 2: Verbs & Adjectives
  // ==========================================
  {
    id: 'cn_p_11',
    title: 'Actions I 🏃',
    description: '基本动作',
    difficulty: 2,
    challenges: [
      { display: '走', pinyin: ['zou'], translation: 'Walk' },
      { display: '跑', pinyin: ['pao'], translation: 'Run' },
      { display: '跳', pinyin: ['tiao'], translation: 'Jump' },
      { display: '坐', pinyin: ['zuo'], translation: 'Sit' },
      { display: '立', pinyin: ['li'], translation: 'Stand' },
      { display: '看', pinyin: ['kan'], translation: 'Look' },
      { display: '听', pinyin: ['ting'], translation: 'Listen' },
      { display: '说', pinyin: ['shuo'], translation: 'Speak' },
      { display: '读', pinyin: ['du'], translation: 'Read' },
      { display: '写', pinyin: ['xie'], translation: 'Write' }
    ]
  },
  {
    id: 'cn_p_12',
    title: 'Opposites ↔️',
    description: '反义词',
    difficulty: 2,
    challenges: [
      { display: '大', pinyin: ['da'], translation: 'Big' },
      { display: '小', pinyin: ['xiao'], translation: 'Small' },
      { display: '多', pinyin: ['duo'], translation: 'Many' },
      { display: '少', pinyin: ['shao'], translation: 'Few' },
      { display: '快', pinyin: ['kuai'], translation: 'Fast' },
      { display: '慢', pinyin: ['man'], translation: 'Slow' },
      { display: '高', pinyin: ['gao'], translation: 'High/Tall' },
      { display: '低', pinyin: ['di'], translation: 'Low' },
      { display: '长', pinyin: ['chang'], translation: 'Long' },
      { display: '短', pinyin: ['duan'], translation: 'Short' }
    ]
  },
  {
    id: 'cn_p_13',
    title: 'Actions II 👋',
    description: '更多动作',
    difficulty: 2,
    challenges: [
      { display: '吃', pinyin: ['chi'], translation: 'Eat' },
      { display: '喝', pinyin: ['he'], translation: 'Drink' },
      { display: '来', pinyin: ['lai'], translation: 'Come' },
      { display: '去', pinyin: ['qu'], translation: 'Go' },
      { display: '进', pinyin: ['jin'], translation: 'Enter' },
      { display: '出', pinyin: ['chu'], translation: 'Exit' },
      { display: '开', pinyin: ['kai'], translation: 'Open' },
      { display: '关', pinyin: ['guan'], translation: 'Close' },
      { display: '买', pinyin: ['mai'], translation: 'Buy' },
      { display: '卖', pinyin: ['mai'], translation: 'Sell' }
    ]
  },
  {
    id: 'cn_p_14',
    title: 'Feelings 😊',
    description: '感觉',
    difficulty: 2,
    challenges: [
      { display: '爱', pinyin: ['ai'], translation: 'Love' },
      { display: '喜', pinyin: ['xi'], translation: 'Joy' },
      { display: '乐', pinyin: ['le'], translation: 'Happy' },
      { display: '好', pinyin: ['hao'], translation: 'Good' },
      { display: '坏', pinyin: ['huai'], translation: 'Bad' },
      { display: '美', pinyin: ['mei'], translation: 'Beautiful' },
      { display: '香', pinyin: ['xiang'], translation: 'Fragrant' },
      { display: '甜', pinyin: ['tian'], translation: 'Sweet' },
      { display: '苦', pinyin: ['ku'], translation: 'Bitter' },
      { display: '冷', pinyin: ['leng'], translation: 'Cold' }
    ]
  },
  {
    id: 'cn_p_15',
    title: 'School 🏫',
    description: '学校生活',
    difficulty: 2,
    challenges: [
      { display: '校', pinyin: ['xiao'], translation: 'School' },
      { display: '师', pinyin: ['shi'], translation: 'Teacher' },
      { display: '生', pinyin: ['sheng'], translation: 'Student' },
      { display: '课', pinyin: ['ke'], translation: 'Class/Lesson' },
      { display: '书', pinyin: ['shu'], translation: 'Book' },
      { display: '笔', pinyin: ['bi'], translation: 'Pen' },
      { display: '尺', pinyin: ['chi'], translation: 'Ruler' },
      { display: '字', pinyin: ['zi'], translation: 'Character' },
      { display: '文', pinyin: ['wen'], translation: 'Language/Text' },
      { display: '学', pinyin: ['xue'], translation: 'Study' }
    ]
  },
  {
    id: 'cn_p_16',
    title: 'Home 🏠',
    description: '家庭物品',
    difficulty: 2,
    challenges: [
      { display: '家', pinyin: ['jia'], translation: 'Home' },
      { display: '门', pinyin: ['men'], translation: 'Door' },
      { display: '窗', pinyin: ['chuang'], translation: 'Window' },
      { display: '床', pinyin: ['chuang'], translation: 'Bed' },
      { display: '灯', pinyin: ['deng'], translation: 'Lamp' },
      { display: '桌', pinyin: ['zhuo'], translation: 'Table' },
      { display: '椅', pinyin: ['yi'], translation: 'Chair' },
      { display: '房', pinyin: ['fang'], translation: 'Room' },
      { display: '墙', pinyin: ['qiang'], translation: 'Wall' },
      { display: '杯', pinyin: ['bei'], translation: 'Cup' }
    ]
  },
  {
    id: 'cn_p_17',
    title: 'Time ⏰',
    description: '时间',
    difficulty: 2,
    challenges: [
      { display: '年', pinyin: ['nian'], translation: 'Year' },
      { display: '季', pinyin: ['ji'], translation: 'Season' },
      { display: '春', pinyin: ['chun'], translation: 'Spring' },
      { display: '夏', pinyin: ['xia'], translation: 'Summer' },
      { display: '秋', pinyin: ['qiu'], translation: 'Autumn' },
      { display: '冬', pinyin: ['dong'], translation: 'Winter' },
      { display: '早', pinyin: ['zao'], translation: 'Early/Morning' },
      { display: '晚', pinyin: ['wan'], translation: 'Late/Night' },
      { display: '时', pinyin: ['shi'], translation: 'Time/Hour' },
      { display: '分', pinyin: ['fen'], translation: 'Minute' }
    ]
  },
  {
    id: 'cn_p_18',
    title: 'Animals II 🦁',
    description: '野生动物',
    difficulty: 2,
    challenges: [
      { display: '虎', pinyin: ['hu'], translation: 'Tiger' },
      { display: '狼', pinyin: ['lang'], translation: 'Wolf' },
      { display: '熊', pinyin: ['xiong'], translation: 'Bear' },
      { display: '象', pinyin: ['xiang'], translation: 'Elephant' },
      { display: '鹿', pinyin: ['lu'], translation: 'Deer' },
      { display: '蛇', pinyin: ['she'], translation: 'Snake' },
      { display: '鼠', pinyin: ['shu'], translation: 'Mouse' },
      { display: '兔', pinyin: ['tu'], translation: 'Rabbit' },
      { display: '猴', pinyin: ['hou'], translation: 'Monkey' },
      { display: '龙', pinyin: ['long'], translation: 'Dragon' }
    ]
  },
  {
    id: 'cn_p_19',
    title: 'Transport 🚗',
    description: '交通工具',
    difficulty: 2,
    challenges: [
      { display: '车', pinyin: ['che'], translation: 'Car/Vehicle' },
      { display: '船', pinyin: ['chuan'], translation: 'Boat' },
      { display: '飞', pinyin: ['fei'], translation: 'Fly' },
      { display: '机', pinyin: ['ji'], translation: 'Machine' },
      { display: '路', pinyin: ['lu'], translation: 'Road' },
      { display: '道', pinyin: ['dao'], translation: 'Path/Way' },
      { display: '桥', pinyin: ['qiao'], translation: 'Bridge' },
      { display: '站', pinyin: ['zhan'], translation: 'Station' },
      { display: '轮', pinyin: ['lun'], translation: 'Wheel' },
      { display: '行', pinyin: ['xing'], translation: 'Walk/Go' }
    ]
  },
  {
    id: 'cn_p_20',
    title: 'Clothes 👕',
    description: '衣物',
    difficulty: 2,
    challenges: [
      { display: '衣', pinyin: ['yi'], translation: 'Clothes' },
      { display: '裙', pinyin: ['qun'], translation: 'Skirt' },
      { display: '裤', pinyin: ['ku'], translation: 'Pants' },
      { display: '鞋', pinyin: ['xie'], translation: 'Shoe' },
      { display: '帽', pinyin: ['mao'], translation: 'Hat' },
      { display: '巾', pinyin: ['jin'], translation: 'Towel/Scarf' },
      { display: '带', pinyin: ['dai'], translation: 'Belt/Strap' },
      { display: '线', pinyin: ['xian'], translation: 'Thread' },
      { display: '布', pinyin: ['bu'], translation: 'Cloth' },
      { display: '穿', pinyin: ['chuan'], translation: 'Wear' }
    ]
  },

  // ==========================================
  // PHASE 3: Abstract & Advanced
  // ==========================================
  {
    id: 'cn_p_21',
    title: 'Plants 🌻',
    description: '植物',
    difficulty: 3,
    challenges: [
      { display: '花', pinyin: ['hua'], translation: 'Flower' },
      { display: '草', pinyin: ['cao'], translation: 'Grass' },
      { display: '树', pinyin: ['shu'], translation: 'Tree' },
      { display: '叶', pinyin: ['ye'], translation: 'Leaf' },
      { display: '根', pinyin: ['gen'], translation: 'Root' },
      { display: '苗', pinyin: ['miao'], translation: 'Seedling' },
      { display: '种', pinyin: ['zhong'], translation: 'Seed/Plant' },
      { display: '林', pinyin: ['lin'], translation: 'Woods' },
      { display: '森', pinyin: ['sen'], translation: 'Forest' },
      { display: '竹', pinyin: ['zhu'], translation: 'Bamboo' }
    ]
  },
  {
    id: 'cn_p_22',
    title: 'Space 🚀',
    description: '宇宙',
    difficulty: 3,
    challenges: [
      { display: '星', pinyin: ['xing'], translation: 'Star' },
      { display: '宇', pinyin: ['yu'], translation: 'Space' },
      { display: '宙', pinyin: ['zhou'], translation: 'Universe' },
      { display: '光', pinyin: ['guang'], translation: 'Light' },
      { display: '暗', pinyin: ['an'], translation: 'Dark' },
      { display: '空', pinyin: ['kong'], translation: 'Empty/Sky' },
      { display: '气', pinyin: ['qi'], translation: 'Air/Gas' },
      { display: '球', pinyin: ['qiu'], translation: 'Ball/Sphere' },
      { display: '阳', pinyin: ['yang'], translation: 'Sun/Yang' },
      { display: '阴', pinyin: ['yin'], translation: 'Shade/Yin' }
    ]
  },
  {
    id: 'cn_p_23',
    title: 'City 🏙️',
    description: '城市',
    difficulty: 3,
    challenges: [
      { display: '城', pinyin: ['cheng'], translation: 'City/Wall' },
      { display: '市', pinyin: ['shi'], translation: 'Market/City' },
      { display: '街', pinyin: ['jie'], translation: 'Street' },
      { display: '村', pinyin: ['cun'], translation: 'Village' },
      { display: '楼', pinyin: ['lou'], translation: 'Building' },
      { display: '店', pinyin: ['dian'], translation: 'Shop' },
      { display: '园', pinyin: ['yuan'], translation: 'Garden' },
      { display: '场', pinyin: ['chang'], translation: 'Field/Place' },
      { display: '馆', pinyin: ['guan'], translation: 'Hall' },
      { display: '所', pinyin: ['suo'], translation: 'Place' }
    ]
  },
  {
    id: 'cn_p_24',
    title: 'Music 🎵',
    description: '音乐',
    difficulty: 3,
    challenges: [
      { display: '音', pinyin: ['yin'], translation: 'Sound' },
      { display: '乐', pinyin: ['yue'], translation: 'Music' },
      { display: '歌', pinyin: ['ge'], translation: 'Song' },
      { display: '唱', pinyin: ['chang'], translation: 'Sing' },
      { display: '舞', pinyin: ['wu'], translation: 'Dance' },
      { display: '琴', pinyin: ['qin'], translation: 'Zither/Piano' },
      { display: '鼓', pinyin: ['gu'], translation: 'Drum' },
      { display: '笛', pinyin: ['di'], translation: 'Flute' },
      { display: '声', pinyin: ['sheng'], translation: 'Voice' },
      { display: '响', pinyin: ['xiang'], translation: 'Loud/Sound' }
    ]
  },
  {
    id: 'cn_p_25',
    title: 'Sports ⚽',
    description: '运动',
    difficulty: 3,
    challenges: [
      { display: '球', pinyin: ['qiu'], translation: 'Ball' },
      { display: '拍', pinyin: ['pai'], translation: 'Racket/Clap' },
      { display: '踢', pinyin: ['ti'], translation: 'Kick' },
      { display: '打', pinyin: ['da'], translation: 'Hit' },
      { display: '赢', pinyin: ['ying'], translation: 'Win' },
      { display: '输', pinyin: ['shu'], translation: 'Lose' },
      { display: '赛', pinyin: ['sai'], translation: 'Match' },
      { display: '比', pinyin: ['bi'], translation: 'Compare' },
      { display: '队', pinyin: ['dui'], translation: 'Team' },
      { display: '练', pinyin: ['lian'], translation: 'Practice' }
    ]
  },
  {
    id: 'cn_p_26',
    title: 'Tools 🛠️',
    description: '工具',
    difficulty: 3,
    challenges: [
      { display: '刀', pinyin: ['dao'], translation: 'Knife' },
      { display: '叉', pinyin: ['cha'], translation: 'Fork' },
      { display: '勺', pinyin: ['shao'], translation: 'Spoon' },
      { display: '盘', pinyin: ['pan'], translation: 'Plate' },
      { display: '碗', pinyin: ['wan'], translation: 'Bowl' },
      { display: '钟', pinyin: ['zhong'], translation: 'Clock' },
      { display: '镜', pinyin: ['jing'], translation: 'Mirror' },
      { display: '线', pinyin: ['xian'], translation: 'Line' },
      { display: '钉', pinyin: ['ding'], translation: 'Nail' },
      { display: '锤', pinyin: ['chui'], translation: 'Hammer' }
    ]
  },
  {
    id: 'cn_p_27',
    title: 'Adjectives II ✨',
    description: '更多形容词',
    difficulty: 3,
    challenges: [
      { display: '新', pinyin: ['xin'], translation: 'New' },
      { display: '旧', pinyin: ['jiu'], translation: 'Old' },
      { display: '真', pinyin: ['zhen'], translation: 'True' },
      { display: '假', pinyin: ['jia'], translation: 'False' },
      { display: '轻', pinyin: ['qing'], translation: 'Light' },
      { display: '重', pinyin: ['zhong'], translation: 'Heavy' },
      { display: '软', pinyin: ['ruan'], translation: 'Soft' },
      { display: '硬', pinyin: ['ying'], translation: 'Hard' },
      { display: '亮', pinyin: ['liang'], translation: 'Bright' },
      { display: '暗', pinyin: ['an'], translation: 'Dark' }
    ]
  },
  {
    id: 'cn_p_28',
    title: 'Fantasy 🐉',
    description: '想象',
    difficulty: 3,
    challenges: [
      { display: '仙', pinyin: ['xian'], translation: 'Fairy' },
      { display: '鬼', pinyin: ['gui'], translation: 'Ghost' },
      { display: '魔', pinyin: ['mo'], translation: 'Magic/Demon' },
      { display: '神', pinyin: ['shen'], translation: 'God' },
      { display: '妖', pinyin: ['yao'], translation: 'Monster' },
      { display: '梦', pinyin: ['meng'], translation: 'Dream' },
      { display: '想', pinyin: ['xiang'], translation: 'Think' },
      { display: '念', pinyin: ['nian'], translation: 'Read/Miss' },
      { display: '变', pinyin: ['bian'], translation: 'Change' },
      { display: '飞', pinyin: ['fei'], translation: 'Fly' }
    ]
  },
  {
    id: 'cn_p_29',
    title: 'Virtues ❤️',
    description: '品质',
    difficulty: 3,
    challenges: [
      { display: '礼', pinyin: ['li'], translation: 'Manners' },
      { display: '信', pinyin: ['xin'], translation: 'Trust' },
      { display: '仁', pinyin: ['ren'], translation: 'Benevolence' },
      { display: '义', pinyin: ['yi'], translation: 'Justice' },
      { display: '智', pinyin: ['zhi'], translation: 'Wisdom' },
      { display: '勇', pinyin: ['yong'], translation: 'Brave' },
      { display: '诚', pinyin: ['cheng'], translation: 'Honest' },
      { display: '善', pinyin: ['shan'], translation: 'Kind' },
      { display: '孝', pinyin: ['xiao'], translation: 'Filial' },
      { display: '忠', pinyin: ['zhong'], translation: 'Loyal' }
    ]
  },
  {
    id: 'cn_p_30',
    title: 'Verbs III 🧠',
    description: '抽象动词',
    difficulty: 3,
    challenges: [
      { display: '知', pinyin: ['zhi'], translation: 'Know' },
      { display: '道', pinyin: ['dao'], translation: 'Way/Say' },
      { display: '教', pinyin: ['jiao'], translation: 'Teach' },
      { display: '会', pinyin: ['hui'], translation: 'Can/Meet' },
      { display: '要', pinyin: ['yao'], translation: 'Want' },
      { display: '给', pinyin: ['gei'], translation: 'Give' },
      { display: '帮', pinyin: ['bang'], translation: 'Help' },
      { display: '问', pinyin: ['wen'], translation: 'Ask' },
      { display: '答', pinyin: ['da'], translation: 'Answer' },
      { display: '做', pinyin: ['zuo'], translation: 'Do' }
    ]
  }
];
