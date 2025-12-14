
import { Level } from '../types';

export const LEVELS_CN_SENTENCES: Level[] = [
  // ==========================================
  // PHASE 1: Words & Phrases (2-3 Characters)
  // ==========================================
  {
    id: 'cn_s_1',
    title: 'Greetings 👋',
    description: '礼貌用语',
    difficulty: 1,
    challenges: [
      { display: '你好', pinyin: ['ni', 'hao'], translation: 'Hello' },
      { display: '谢谢', pinyin: ['xie', 'xie'], translation: 'Thanks' },
      { display: '再见', pinyin: ['zai', 'jian'], translation: 'Goodbye' },
      { display: '早安', pinyin: ['zao', 'an'], translation: 'Good morning' },
      { display: '晚安', pinyin: ['wan', 'an'], translation: 'Good night' },
      { display: '抱歉', pinyin: ['bao', 'qian'], translation: 'Sorry' },
      { display: '欢迎', pinyin: ['huan', 'ying'], translation: 'Welcome' },
      { display: '请坐', pinyin: ['qing', 'zuo'], translation: 'Please sit' },
      { display: '请问', pinyin: ['qing', 'wen'], translation: 'May I ask' },
      { display: '加油', pinyin: ['jia', 'you'], translation: 'Come on!' }
    ]
  },
  {
    id: 'cn_s_2',
    title: 'Family Terms 👨‍👩‍👧',
    description: '亲人称呼',
    difficulty: 1,
    challenges: [
      { display: '爸爸', pinyin: ['ba', 'ba'], translation: 'Dad' },
      { display: '妈妈', pinyin: ['ma', 'ma'], translation: 'Mom' },
      { display: '哥哥', pinyin: ['ge', 'ge'], translation: 'Older brother' },
      { display: '姐姐', pinyin: ['jie', 'jie'], translation: 'Older sister' },
      { display: '弟弟', pinyin: ['di', 'di'], translation: 'Younger brother' },
      { display: '妹妹', pinyin: ['mei', 'mei'], translation: 'Younger sister' },
      { display: '爷爷', pinyin: ['ye', 'ye'], translation: 'Grandpa' },
      { display: '奶奶', pinyin: ['nai', 'nai'], translation: 'Grandma' },
      { display: '家人', pinyin: ['jia', 'ren'], translation: 'Family' },
      { display: '朋友', pinyin: ['peng', 'you'], translation: 'Friend' }
    ]
  },
  {
    id: 'cn_s_3',
    title: 'Daily Objects 🥛',
    description: '生活用品',
    difficulty: 1,
    challenges: [
      { display: '牛奶', pinyin: ['niu', 'nai'], translation: 'Milk' },
      { display: '面包', pinyin: ['mian', 'bao'], translation: 'Bread' },
      { display: '苹果', pinyin: ['ping', 'guo'], translation: 'Apple' },
      { display: '书包', pinyin: ['shu', 'bao'], translation: 'Schoolbag' },
      { display: '铅笔', pinyin: ['qian', 'bi'], translation: 'Pencil' },
      { display: '桌子', pinyin: ['zhuo', 'zi'], translation: 'Table' },
      { display: '椅子', pinyin: ['yi', 'zi'], translation: 'Chair' },
      { display: '衣服', pinyin: ['yi', 'fu'], translation: 'Clothes' },
      { display: '鞋子', pinyin: ['xie', 'zi'], translation: 'Shoes' },
      { display: '杯子', pinyin: ['bei', 'zi'], translation: 'Cup' }
    ]
  },
  {
    id: 'cn_s_4',
    title: 'Nature Words 🌳',
    description: '自然词汇',
    difficulty: 1,
    challenges: [
      { display: '太阳', pinyin: ['tai', 'yang'], translation: 'Sun' },
      { display: '月亮', pinyin: ['yue', 'liang'], translation: 'Moon' },
      { display: '星星', pinyin: ['xing', 'xing'], translation: 'Stars' },
      { display: '白云', pinyin: ['bai', 'yun'], translation: 'White clouds' },
      { display: '下雨', pinyin: ['xia', 'yu'], translation: 'Raining' },
      { display: '刮风', pinyin: ['gua', 'feng'], translation: 'Windy' },
      { display: '下雪', pinyin: ['xia', 'xue'], translation: 'Snowing' },
      { display: '大树', pinyin: ['da', 'shu'], translation: 'Big tree' },
      { display: '花朵', pinyin: ['hua', 'duo'], translation: 'Flower' },
      { display: '小草', pinyin: ['xiao', 'cao'], translation: 'Grass' }
    ]
  },
  {
    id: 'cn_s_5',
    title: 'Action Verbs 🏃',
    description: '简单动作',
    difficulty: 1,
    challenges: [
      { display: '吃饭', pinyin: ['chi', 'fan'], translation: 'Eat meal' },
      { display: '喝水', pinyin: ['he', 'shui'], translation: 'Drink water' },
      { display: '睡觉', pinyin: ['shui', 'jiao'], translation: 'Sleep' },
      { display: '走路', pinyin: ['zou', 'lu'], translation: 'Walk' },
      { display: '跑步', pinyin: ['pao', 'bu'], translation: 'Run' },
      { display: '看书', pinyin: ['kan', 'shu'], translation: 'Read book' },
      { display: '写字', pinyin: ['xie', 'zi'], translation: 'Write characters' },
      { display: '画画', pinyin: ['hua', 'hua'], translation: 'Draw/Paint' },
      { display: '唱歌', pinyin: ['chang', 'ge'], translation: 'Sing' },
      { display: '跳舞', pinyin: ['tiao', 'wu'], translation: 'Dance' }
    ]
  },
  {
    id: 'cn_s_6',
    title: 'Adjectives ✨',
    description: '形容词',
    difficulty: 1,
    challenges: [
      { display: '高兴', pinyin: ['gao', 'xing'], translation: 'Happy' },
      { display: '快乐', pinyin: ['kuai', 'le'], translation: 'Joyful' },
      { display: '漂亮', pinyin: ['piao', 'liang'], translation: 'Beautiful' },
      { display: '可爱', pinyin: ['ke', 'ai'], translation: 'Cute' },
      { display: '聪明', pinyin: ['cong', 'ming'], translation: 'Smart' },
      { display: '生气', pinyin: ['sheng', 'qi'], translation: 'Angry' },
      { display: '难过', pinyin: ['nan', 'guo'], translation: 'Sad' },
      { display: '干净', pinyin: ['gan', 'jing'], translation: 'Clean' },
      { display: '认真', pinyin: ['ren', 'zhen'], translation: 'Serious/Diligent' },
      { display: '努力', pinyin: ['nu', 'li'], translation: 'Hardworking' }
    ]
  },
  {
    id: 'cn_s_7',
    title: 'Animals 🐼',
    description: '动物名称',
    difficulty: 1,
    challenges: [
      { display: '熊猫', pinyin: ['xiong', 'mao'], translation: 'Panda' },
      { display: '老虎', pinyin: ['lao', 'hu'], translation: 'Tiger' },
      { display: '狮子', pinyin: ['shi', 'zi'], translation: 'Lion' },
      { display: '大象', pinyin: ['da', 'xiang'], translation: 'Elephant' },
      { display: '兔子', pinyin: ['tu', 'zi'], translation: 'Rabbit' },
      { display: '猴子', pinyin: ['hou', 'zi'], translation: 'Monkey' },
      { display: '小狗', pinyin: ['xiao', 'gou'], translation: 'Puppy' },
      { display: '小猫', pinyin: ['xiao', 'mao'], translation: 'Kitten' },
      { display: '蝴蝶', pinyin: ['hu', 'die'], translation: 'Butterfly' },
      { display: '蜜蜂', pinyin: ['mi', 'feng'], translation: 'Honeybee' }
    ]
  },
  {
    id: 'cn_s_8',
    title: 'Time Words ⏰',
    description: '时间词汇',
    difficulty: 1,
    challenges: [
      { display: '今天', pinyin: ['jin', 'tian'], translation: 'Today' },
      { display: '明天', pinyin: ['ming', 'tian'], translation: 'Tomorrow' },
      { display: '昨天', pinyin: ['zuo', 'tian'], translation: 'Yesterday' },
      { display: '早上', pinyin: ['zao', 'shang'], translation: 'Morning' },
      { display: '中午', pinyin: ['zhong', 'wu'], translation: 'Noon' },
      { display: '晚上', pinyin: ['wan', 'shang'], translation: 'Evening' },
      { display: '现在', pinyin: ['xian', 'zai'], translation: 'Now' },
      { display: '时间', pinyin: ['shi', 'jian'], translation: 'Time' },
      { display: '星期', pinyin: ['xing', 'qi'], translation: 'Week' },
      { display: '周末', pinyin: ['zhou', 'mo'], translation: 'Weekend' }
    ]
  },
  {
    id: 'cn_s_9',
    title: 'Three Words I 🔢',
    description: '三字短语',
    difficulty: 1,
    challenges: [
      { display: '对不起', pinyin: ['dui', 'bu', 'qi'], translation: 'Sorry' },
      { display: '没关系', pinyin: ['mei', 'guan', 'xi'], translation: 'It\'s okay' },
      { display: '不客气', pinyin: ['bu', 'ke', 'qi'], translation: 'You\'re welcome' },
      { display: '我爱你', pinyin: ['wo', 'ai', 'ni'], translation: 'I love you' },
      { display: '吃苹果', pinyin: ['chi', 'ping', 'guo'], translation: 'Eat apple' },
      { display: '喝牛奶', pinyin: ['he', 'niu', 'nai'], translation: 'Drink milk' },
      { display: '开汽车', pinyin: ['kai', 'qi', 'che'], translation: 'Drive car' },
      { display: '坐飞机', pinyin: ['zuo', 'fei', 'ji'], translation: 'Take plane' },
      { display: '去学校', pinyin: ['qu', 'xue', 'xiao'], translation: 'Go to school' },
      { display: '回老家', pinyin: ['hui', 'lao', 'jia'], translation: 'Go hometown' }
    ]
  },
  {
    id: 'cn_s_10',
    title: 'Three Words II 🏫',
    description: '更多三字短语',
    difficulty: 1,
    challenges: [
      { display: '小学生', pinyin: ['xiao', 'xue', 'sheng'], translation: 'Elementary student' },
      { display: '好朋友', pinyin: ['hao', 'peng', 'you'], translation: 'Good friend' },
      { display: '大老虎', pinyin: ['da', 'lao', 'hu'], translation: 'Big tiger' },
      { display: '小兔子', pinyin: ['xiao', 'tu', 'zi'], translation: 'Little rabbit' },
      { display: '红领巾', pinyin: ['hong', 'ling', 'jin'], translation: 'Red scarf' },
      { display: '图书馆', pinyin: ['tu', 'shu', 'guan'], translation: 'Library' },
      { display: '游乐园', pinyin: ['you', 'le', 'yuan'], translation: 'Amusement park' },
      { display: '动物园', pinyin: ['dong', 'wu', 'yuan'], translation: 'Zoo' },
      { display: '做游戏', pinyin: ['zuo', 'you', 'xi'], translation: 'Play games' },
      { display: '讲故事', pinyin: ['jiang', 'gu', 'shi'], translation: 'Tell stories' }
    ]
  },

  // ==========================================
  // PHASE 2: Simple Sentences (S + V + O)
  // ==========================================
  {
    id: 'cn_s_11',
    title: 'I am... 🙋',
    description: '自我介绍',
    difficulty: 2,
    challenges: [
      { display: '我是学生', pinyin: ['wo', 'shi', 'xue', 'sheng'], translation: 'I am a student' },
      { display: '我爱学习', pinyin: ['wo', 'ai', 'xue', 'xi'], translation: 'I love learning' },
      { display: '我叫小明', pinyin: ['wo', 'jiao', 'xiao', 'ming'], translation: 'My name is Xiao Ming' },
      { display: '我八岁了', pinyin: ['wo', 'ba', 'sui', 'le'], translation: 'I am 8 years old' },
      { display: '我很开心', pinyin: ['wo', 'hen', 'kai', 'xin'], translation: 'I am very happy' },
      { display: '我喜欢你', pinyin: ['wo', 'xi', 'huan', 'ni'], translation: 'I like you' },
      { display: '我会画画', pinyin: ['wo', 'hui', 'hua', 'hua'], translation: 'I can draw' },
      { display: '我要回家', pinyin: ['wo', 'yao', 'hui', 'jia'], translation: 'I want to go home' }
    ]
  },
  {
    id: 'cn_s_12',
    title: 'Daily Actions 📅',
    description: '日常活动',
    difficulty: 2,
    challenges: [
      { display: '他在看书', pinyin: ['ta', 'zai', 'kan', 'shu'], translation: 'He is reading' },
      { display: '她在跳舞', pinyin: ['ta', 'zai', 'tiao', 'wu'], translation: 'She is dancing' },
      { display: '我们在玩', pinyin: ['wo', 'men', 'zai', 'wan'], translation: 'We are playing' },
      { display: '大家在笑', pinyin: ['da', 'jia', 'zai', 'xiao'], translation: 'Everyone is laughing' },
      { display: '爸爸在做饭', pinyin: ['ba', 'ba', 'zai', 'zuo', 'fan'], translation: 'Dad is cooking' },
      { display: '妈妈在洗衣服', pinyin: ['ma', 'ma', 'zai', 'xi', 'yi', 'fu'], translation: 'Mom is washing clothes' },
      { display: '爷爷在喝茶', pinyin: ['ye', 'ye', 'zai', 'he', 'cha'], translation: 'Grandpa is drinking tea' },
      { display: '奶奶在睡觉', pinyin: ['nai', 'nai', 'zai', 'shui', 'jiao'], translation: 'Grandma is sleeping' }
    ]
  },
  {
    id: 'cn_s_13',
    title: 'Descriptions I 🎨',
    description: '简单描述',
    difficulty: 2,
    challenges: [
      { display: '苹果很红', pinyin: ['ping', 'guo', 'hen', 'hong'], translation: 'The apple is very red' },
      { display: '草地很绿', pinyin: ['cao', 'di', 'hen', 'lv'], translation: 'The grass is very green' },
      { display: '天空很蓝', pinyin: ['tian', 'kong', 'hen', 'lan'], translation: 'The sky is very blue' },
      { display: '云朵很白', pinyin: ['yun', 'duo', 'hen', 'bai'], translation: 'The clouds are very white' },
      { display: '小狗很可爱', pinyin: ['xiao', 'gou', 'hen', 'ke', 'ai'], translation: 'The puppy is very cute' },
      { display: '老虎很凶', pinyin: ['lao', 'hu', 'hen', 'xiong'], translation: 'The tiger is fierce' },
      { display: '西瓜很甜', pinyin: ['xi', 'gua', 'hen', 'tian'], translation: 'Watermelon is sweet' },
      { display: '药很苦', pinyin: ['yao', 'hen', 'ku'], translation: 'Medicine is bitter' }
    ]
  },
  {
    id: 'cn_s_14',
    title: 'Going Places 🚶',
    description: '去哪里',
    difficulty: 2,
    challenges: [
      { display: '我们去公园', pinyin: ['wo', 'men', 'qu', 'gong', 'yuan'], translation: 'We go to the park' },
      { display: '他去超市', pinyin: ['ta', 'qu', 'chao', 'shi'], translation: 'He goes to the supermarket' },
      { display: '她去医院', pinyin: ['ta', 'qu', 'yi', 'yuan'], translation: 'She goes to the hospital' },
      { display: '我想去北京', pinyin: ['wo', 'xiang', 'qu', 'bei', 'jing'], translation: 'I want to go to Beijing' },
      { display: '爸爸去上班', pinyin: ['ba', 'ba', 'qu', 'shang', 'ban'], translation: 'Dad goes to work' },
      { display: '我们去爬山', pinyin: ['wo', 'men', 'qu', 'pa', 'shan'], translation: 'We go hiking' },
      { display: '一起去海边', pinyin: ['yi', 'qi', 'qu', 'hai', 'bian'], translation: 'Go to the seaside together' },
      { display: '这是我的家', pinyin: ['zhe', 'shi', 'wo', 'de', 'jia'], translation: 'This is my home' }
    ]
  },
  {
    id: 'cn_s_15',
    title: 'Possession 🎒',
    description: '那是我的',
    difficulty: 2,
    challenges: [
      { display: '这是我的书', pinyin: ['zhe', 'shi', 'wo', 'de', 'shu'], translation: 'This is my book' },
      { display: '那是你的笔', pinyin: ['na', 'shi', 'ni', 'de', 'bi'], translation: 'That is your pen' },
      { display: '这是谁的包', pinyin: ['zhe', 'shi', 'shui', 'de', 'bao'], translation: 'Whose bag is this?' },
      { display: '它是我的狗', pinyin: ['ta', 'shi', 'wo', 'de', 'gou'], translation: 'It is my dog' },
      { display: '我有三个苹果', pinyin: ['wo', 'you', 'san', 'ge', 'ping', 'guo'], translation: 'I have three apples' },
      { display: '他有一辆新车', pinyin: ['ta', 'you', 'yi', 'liang', 'xin', 'che'], translation: 'He has a new car' },
      { display: '我们有一个家', pinyin: ['wo', 'men', 'you', 'yi', 'ge', 'jia'], translation: 'We have a home' },
      { display: '学校就在这里', pinyin: ['xue', 'xiao', 'jiu', 'zai', 'zhe', 'li'], translation: 'The school is right here' }
    ]
  },
  {
    id: 'cn_s_16',
    title: 'Weather Talk ☀️',
    description: '天气如何',
    difficulty: 2,
    challenges: [
      { display: '今天是晴天', pinyin: ['jin', 'tian', 'shi', 'qing', 'tian'], translation: 'Today is sunny' },
      { display: '明天会下雨', pinyin: ['ming', 'tian', 'hui', 'xia', 'yu'], translation: 'It will rain tomorrow' },
      { display: '外面很冷', pinyin: ['wai', 'mian', 'hen', 'leng'], translation: 'It is cold outside' },
      { display: '房间很热', pinyin: ['fang', 'jian', 'hen', 're'], translation: 'The room is hot' },
      { display: '风很大', pinyin: ['feng', 'hen', 'da'], translation: 'The wind is strong' },
      { display: '雪很白', pinyin: ['xue', 'hen', 'bai'], translation: 'The snow is white' },
      { display: '春天来了', pinyin: ['chun', 'tian', 'lai', 'le'], translation: 'Spring is here' },
      { display: '花儿开了', pinyin: ['hua', 'er', 'kai', 'le'], translation: 'Flowers are blooming' }
    ]
  },
  {
    id: 'cn_s_17',
    title: 'Likes & Dislikes ❤️',
    description: '喜好表达',
    difficulty: 2,
    challenges: [
      { display: '我喜欢吃鱼', pinyin: ['wo', 'xi', 'huan', 'chi', 'yu'], translation: 'I like eating fish' },
      { display: '我不喜欢吃肉', pinyin: ['wo', 'bu', 'xi', 'huan', 'chi', 'rou'], translation: 'I don\'t like eating meat' },
      { display: '哥哥喜欢打球', pinyin: ['ge', 'ge', 'xi', 'huan', 'da', 'qiu'], translation: 'Brother likes playing ball' },
      { display: '妹妹喜欢唱歌', pinyin: ['mei', 'mei', 'xi', 'huan', 'chang', 'ge'], translation: 'Sister likes singing' },
      { display: '你喜欢什么', pinyin: ['ni', 'xi', 'huan', 'shen', 'me'], translation: 'What do you like?' },
      { display: '我爱我的家', pinyin: ['wo', 'ai', 'wo', 'de', 'jia'], translation: 'I love my home' },
      { display: '我们都爱笑', pinyin: ['wo', 'men', 'dou', 'ai', 'xiao'], translation: 'We all love to laugh' },
      { display: '这是我最爱的书', pinyin: ['zhe', 'shi', 'wo', 'zui', 'ai', 'de', 'shu'], translation: 'This is my favorite book' }
    ]
  },
  {
    id: 'cn_s_18',
    title: 'Time & Dates 📅',
    description: '日期时间',
    difficulty: 2,
    challenges: [
      { display: '现在几点了', pinyin: ['xian', 'zai', 'ji', 'dian', 'le'], translation: 'What time is it?' },
      { display: '现在八点了', pinyin: ['xian', 'zai', 'ba', 'dian', 'le'], translation: 'It is 8 o\'clock' },
      { display: '今天是星期几', pinyin: ['jin', 'tian', 'shi', 'xing', 'qi', 'ji'], translation: 'What day is it today?' },
      { display: '今天是星期五', pinyin: ['jin', 'tian', 'shi', 'xing', 'qi', 'wu'], translation: 'Today is Friday' },
      { display: '明天是周末', pinyin: ['ming', 'tian', 'shi', 'zhou', 'mo'], translation: 'Tomorrow is the weekend' },
      { display: '我们要去玩', pinyin: ['wo', 'men', 'yao', 'qu', 'wan'], translation: 'We are going to play' },
      { display: '新年快乐', pinyin: ['xin', 'nian', 'kuai', 'le'], translation: 'Happy New Year' },
      { display: '生日快乐', pinyin: ['sheng', 'ri', 'kuai', 'le'], translation: 'Happy Birthday' }
    ]
  },
  {
    id: 'cn_s_19',
    title: 'Questions ❓',
    description: '简单提问',
    difficulty: 2,
    challenges: [
      { display: '你是谁', pinyin: ['ni', 'shi', 'shui'], translation: 'Who are you?' },
      { display: '那是谁', pinyin: ['na', 'shi', 'shui'], translation: 'Who is that?' },
      { display: '你在哪里', pinyin: ['ni', 'zai', 'na', 'li'], translation: 'Where are you?' },
      { display: '这是什么', pinyin: ['zhe', 'shi', 'shen', 'me'], translation: 'What is this?' },
      { display: '为什么', pinyin: ['wei', 'shen', 'me'], translation: 'Why?' },
      { display: '怎么了', pinyin: ['zen', 'me', 'le'], translation: 'What happened?' },
      { display: '好不好', pinyin: ['hao', 'bu', 'hao'], translation: 'Is it good?' },
      { display: '去不去', pinyin: ['qu', 'bu', 'qu'], translation: 'Are you going?' }
    ]
  },
  {
    id: 'cn_s_20',
    title: 'Colors II 🌈',
    description: '颜色描述',
    difficulty: 2,
    challenges: [
      { display: '穿着红色的衣服', pinyin: ['chuan', 'zhe', 'hong', 'se', 'de', 'yi', 'fu'], translation: 'Wearing red clothes' },
      { display: '戴着蓝色的帽子', pinyin: ['dai', 'zhe', 'lan', 'se', 'de', 'mao', 'zi'], translation: 'Wearing a blue hat' },
      { display: '绿色的树叶', pinyin: ['lv', 'se', 'de', 'shu', 'ye'], translation: 'Green leaves' },
      { display: '黄色的香蕉', pinyin: ['huang', 'se', 'de', 'xiang', 'jiao'], translation: 'Yellow bananas' },
      { display: '黑色的头发', pinyin: ['hei', 'se', 'de', 'tou', 'fa'], translation: 'Black hair' },
      { display: '白色的雪花', pinyin: ['bai', 'se', 'de', 'xue', 'hua'], translation: 'White snowflakes' },
      { display: '世界五颜六色', pinyin: ['shi', 'jie', 'wu', 'yan', 'liu', 'se'], translation: 'The world is colorful' },
      { display: '真漂亮', pinyin: ['zhen', 'piao', 'liang'], translation: 'Really beautiful' }
    ]
  },

  // ==========================================
  // PHASE 3: Longer Sentences & Stories
  // ==========================================
  {
    id: 'cn_s_21',
    title: 'At School 🏫',
    description: '在学校',
    difficulty: 3,
    challenges: [
      { display: '我是一名小学生', pinyin: ['wo', 'shi', 'yi', 'ming', 'xiao', 'xue', 'sheng'], translation: 'I am an elementary student' },
      { display: '天天背着书包上学', pinyin: ['tian', 'tian', 'bei', 'zhe', 'shu', 'bao', 'shang', 'xue'], translation: 'Carrying schoolbag to school every day' },
      { display: '老师教我们写字', pinyin: ['lao', 'shi', 'jiao', 'wo', 'men', 'xie', 'zi'], translation: 'Teacher teaches us to write' },
      { display: '同学和我一起玩', pinyin: ['tong', 'xue', 'he', 'wo', 'yi', 'qi', 'wan'], translation: 'Classmates play with me' },
      { display: '我们在操场跑步', pinyin: ['wo', 'men', 'zai', 'cao', 'chang', 'pao', 'bu'], translation: 'We run on the playground' },
      { display: '上课要认真听讲', pinyin: ['shang', 'ke', 'yao', 'ren', 'zhen', 'ting', 'jiang'], translation: 'Listen carefully in class' },
      { display: '下课要好好休息', pinyin: ['xia', 'ke', 'yao', 'hao', 'hao', 'xiu', 'xi'], translation: 'Rest well after class' },
      { display: '学校真好玩', pinyin: ['xue', 'xiao', 'zhen', 'hao', 'wan'], translation: 'School is fun' }
    ]
  },
  {
    id: 'cn_s_22',
    title: 'Seasons 🍂',
    description: '四季变化',
    difficulty: 3,
    challenges: [
      { display: '春天花儿开了', pinyin: ['chun', 'tian', 'hua', 'er', 'kai', 'le'], translation: 'Spring flowers bloom' },
      { display: '夏天天气很热', pinyin: ['xia', 'tian', 'tian', 'qi', 'hen', 're'], translation: 'Summer weather is hot' },
      { display: '秋天叶子黄了', pinyin: ['qiu', 'tian', 'ye', 'zi', 'huang', 'le'], translation: 'Autumn leaves turn yellow' },
      { display: '冬天雪花飘落', pinyin: ['dong', 'tian', 'xue', 'hua', 'piao', 'luo'], translation: 'Winter snowflakes fall' },
      { display: '一年有四个季节', pinyin: ['yi', 'nian', 'you', 'si', 'ge', 'ji', 'jie'], translation: 'A year has four seasons' },
      { display: '你最喜欢哪个', pinyin: ['ni', 'zui', 'xi', 'huan', 'na', 'ge'], translation: 'Which one do you like best?' },
      { display: '我喜欢堆雪人', pinyin: ['wo', 'xi', 'huan', 'dui', 'xue', 'ren'], translation: 'I like making snowmen' },
      { display: '也喜欢去游泳', pinyin: ['ye', 'xi', 'huan', 'qu', 'you', 'yong'], translation: 'Also like swimming' }
    ]
  },
  {
    id: 'cn_s_23',
    title: 'The Park 🌳',
    description: '公园游记',
    difficulty: 3,
    challenges: [
      { display: '公园里人很多', pinyin: ['gong', 'yuan', 'li', 'ren', 'hen', 'duo'], translation: 'Many people in the park' },
      { display: '爷爷在打太极', pinyin: ['ye', 'ye', 'zai', 'da', 'tai', 'ji'], translation: 'Grandpa is doing Tai Chi' },
      { display: '奶奶在跳广场舞', pinyin: ['nai', 'nai', 'zai', 'tiao', 'guang', 'chang', 'wu'], translation: 'Grandma is square dancing' },
      { display: '小孩在放风筝', pinyin: ['xiao', 'hai', 'zai', 'fang', 'feng', 'zheng'], translation: 'Kids are flying kites' },
      { display: '风筝飞得很高', pinyin: ['feng', 'zheng', 'fei', 'de', 'hen', 'gao'], translation: 'Kites fly very high' },
      { display: '湖里有小船', pinyin: ['hu', 'li', 'you', 'xiao', 'chuan'], translation: 'Small boats in the lake' },
      { display: '树上有小鸟', pinyin: ['shu', 'shang', 'you', 'xiao', 'niao'], translation: 'Birds in the trees' },
      { display: '我们玩得很开心', pinyin: ['wo', 'men', 'wan', 'de', 'hen', 'kai', 'xin'], translation: 'We had a great time' }
    ]
  },
  {
    id: 'cn_s_24',
    title: 'Shopping 🛒',
    description: '去超市',
    difficulty: 3,
    challenges: [
      { display: '我和妈妈去超市', pinyin: ['wo', 'he', 'ma', 'ma', 'qu', 'chao', 'shi'], translation: 'Mom and I go to supermarket' },
      { display: '我们要买东西', pinyin: ['wo', 'men', 'yao', 'mai', 'dong', 'xi'], translation: 'We want to buy things' },
      { display: '妈妈买了蔬菜', pinyin: ['ma', 'ma', 'mai', 'le', 'shu', 'cai'], translation: 'Mom bought vegetables' },
      { display: '我买了零食', pinyin: ['wo', 'mai', 'le', 'ling', 'shi'], translation: 'I bought snacks' },
      { display: '这个多少钱', pinyin: ['zhe', 'ge', 'duo', 'shao', 'qian'], translation: 'How much is this?' },
      { display: '那个很便宜', pinyin: ['na', 'ge', 'hen', 'pian', 'yi'], translation: 'That is very cheap' },
      { display: '一共一百元', pinyin: ['yi', 'gong', 'yi', 'bai', 'yuan'], translation: 'Total 100 yuan' },
      { display: '满载而归', pinyin: ['man', 'zai', 'er', 'gui'], translation: 'Return fully loaded' }
    ]
  },
  {
    id: 'cn_s_25',
    title: 'Feelings II 😭',
    description: '心情描述',
    difficulty: 3,
    challenges: [
      { display: '今天我很难过', pinyin: ['jin', 'tian', 'wo', 'hen', 'nan', 'guo'], translation: 'I am sad today' },
      { display: '因为玩具坏了', pinyin: ['yin', 'wei', 'wan', 'ju', 'huai', 'le'], translation: 'Because the toy broke' },
      { display: '妈妈安慰我', pinyin: ['ma', 'ma', 'an', 'wei', 'wo'], translation: 'Mom comforts me' },
      { display: '不要哭', pinyin: ['bu', 'yao', 'ku'], translation: 'Don\'t cry' },
      { display: '爸爸修好了玩具', pinyin: ['ba', 'ba', 'xiu', 'hao', 'le', 'wan', 'ju'], translation: 'Dad fixed the toy' },
      { display: '我又高兴了', pinyin: ['wo', 'you', 'gao', 'xing', 'le'], translation: 'I am happy again' },
      { display: '谢谢爸爸', pinyin: ['xie', 'xie', 'ba', 'ba'], translation: 'Thanks Dad' },
      { display: '你是最好的', pinyin: ['ni', 'shi', 'zui', 'hao', 'de'], translation: 'You are the best' }
    ]
  },
  {
    id: 'cn_s_26',
    title: 'Nature Trip 🏔️',
    description: '郊游',
    difficulty: 3,
    challenges: [
      { display: '周末去爬山', pinyin: ['zhou', 'mo', 'qu', 'pa', 'shan'], translation: 'Hiking on weekend' },
      { display: '山很高路很长', pinyin: ['shan', 'hen', 'gao', 'lu', 'hen', 'chang'], translation: 'Mountain high, road long' },
      { display: '我们走得很累', pinyin: ['wo', 'men', 'zou', 'de', 'hen', 'lei'], translation: 'We walked very tiredly' },
      { display: '但是风景很美', pinyin: ['dan', 'shi', 'feng', 'jing', 'hen', 'mei'], translation: 'But scenery is beautiful' },
      { display: '看见了瀑布', pinyin: ['kan', 'jian', 'le', 'pu', 'bu'], translation: 'Saw a waterfall' },
      { display: '听见了鸟叫', pinyin: ['ting', 'jian', 'le', 'niao', 'jiao'], translation: 'Heard birds singing' },
      { display: '空气很清新', pinyin: ['kong', 'qi', 'hen', 'qing', 'xin'], translation: 'Air is fresh' },
      { display: '下次还要来', pinyin: ['xia', 'ci', 'hai', 'yao', 'lai'], translation: 'Come again next time' }
    ]
  },
  {
    id: 'cn_s_27',
    title: 'Skills 💪',
    description: '才艺展示',
    difficulty: 3,
    challenges: [
      { display: '我会弹钢琴', pinyin: ['wo', 'hui', 'tan', 'gang', 'qin'], translation: 'I can play piano' },
      { display: '他会踢足球', pinyin: ['ta', 'hui', 'ti', 'zu', 'qiu'], translation: 'He can play soccer' },
      { display: '她会跳芭蕾', pinyin: ['ta', 'hui', 'tiao', 'ba', 'lei'], translation: 'She can do ballet' },
      { display: '你会做什么', pinyin: ['ni', 'hui', 'zuo', 'shen', 'me'], translation: 'What can you do?' },
      { display: '我要努力练习', pinyin: ['wo', 'yao', 'nu', 'li', 'lian', 'xi'], translation: 'I must practice hard' },
      { display: '变得更优秀', pinyin: ['bian', 'de', 'geng', 'you', 'xiu'], translation: 'Become more excellent' },
      { display: '大家都很棒', pinyin: ['da', 'jia', 'dou', 'hen', 'bang'], translation: 'Everyone is great' },
      { display: '为自己鼓掌', pinyin: ['wei', 'zi', 'ji', 'gu', 'zhang'], translation: 'Clap for yourself' }
    ]
  },
  {
    id: 'cn_s_28',
    title: 'Hygiene 🚿',
    description: '卫生习惯',
    difficulty: 3,
    challenges: [
      { display: '饭前要洗手', pinyin: ['fan', 'qian', 'yao', 'xi', 'shou'], translation: 'Wash hands before eating' },
      { display: '早晚要刷牙', pinyin: ['zao', 'wan', 'yao', 'shua', 'ya'], translation: 'Brush teeth morning/night' },
      { display: '每天要洗澡', pinyin: ['mei', 'tian', 'yao', 'xi', 'zao'], translation: 'Shower every day' },
      { display: '衣服要勤换', pinyin: ['yi', 'fu', 'yao', 'qin', 'huan'], translation: 'Change clothes often' },
      { display: '不乱扔垃圾', pinyin: ['bu', 'luan', 'reng', 'la', 'ji'], translation: 'Don\'t litter' },
      { display: '爱护环境', pinyin: ['ai', 'hu', 'huan', 'jing'], translation: 'Protect environment' },
      { display: '做一个讲卫生的好孩子', pinyin: ['zuo', 'yi', 'ge', 'jiang', 'wei', 'sheng', 'de', 'hao', 'hai', 'zi'], translation: 'Be a hygienic good child' },
      { display: '身体才健康', pinyin: ['shen', 'ti', 'cai', 'jian', 'kang'], translation: 'Body will be healthy' }
    ]
  },
  {
    id: 'cn_s_29',
    title: 'Festivals 🧧',
    description: '过节啦',
    difficulty: 3,
    challenges: [
      { display: '春节到了', pinyin: ['chun', 'jie', 'dao', 'le'], translation: 'Spring Festival is here' },
      { display: '家家户户贴对联', pinyin: ['jia', 'jia', 'hu', 'hu', 'tie', 'dui', 'lian'], translation: 'Every home pastes couplets' },
      { display: '晚上吃饺子', pinyin: ['wan', 'shang', 'chi', 'jiao', 'zi'], translation: 'Eat dumplings at night' },
      { display: '一家人团圆', pinyin: ['yi', 'jia', 'ren', 'tuan', 'yuan'], translation: 'Family reunion' },
      { display: '放鞭炮很响', pinyin: ['fang', 'bian', 'pao', 'hen', 'xiang'], translation: 'Firecrackers are loud' },
      { display: '我收到了红包', pinyin: ['wo', 'shou', 'dao', 'le', 'hong', 'bao'], translation: 'I received red envelopes' },
      { display: '祝大家新年好', pinyin: ['zhu', 'da', 'jia', 'xin', 'nian', 'hao'], translation: 'Wish everyone Happy New Year' },
      { display: '万事如意', pinyin: ['wan', 'shi', 'ru', 'yi'], translation: 'All the best' }
    ]
  },
  {
    id: 'cn_s_30',
    title: 'Dream 🌙',
    description: '我的梦想',
    difficulty: 3,
    challenges: [
      { display: '我有一个梦想', pinyin: ['wo', 'you', 'yi', 'ge', 'meng', 'xiang'], translation: 'I have a dream' },
      { display: '想当宇航员', pinyin: ['xiang', 'dang', 'yu', 'hang', 'yuan'], translation: 'Want to be an astronaut' },
      { display: '坐火箭去太空', pinyin: ['zuo', 'huo', 'jian', 'qu', 'tai', 'kong'], translation: 'Take rocket to space' },
      { display: '看看地球和月亮', pinyin: ['kan', 'kan', 'di', 'qiu', 'he', 'yue', 'liang'], translation: 'Look at Earth and Moon' },
      { display: '探索宇宙的奥秘', pinyin: ['tan', 'suo', 'yu', 'zhou', 'de', 'ao', 'mi'], translation: 'Explore universe secrets' },
      { display: '那一定很神奇', pinyin: ['na', 'yi', 'ding', 'hen', 'shen', 'qi'], translation: 'That must be magical' },
      { display: '所以我要学习', pinyin: ['suo', 'yi', 'wo', 'yao', 'xue', 'xi'], translation: 'So I must study' },
      { display: '实现我的愿望', pinyin: ['shi', 'xian', 'wo', 'de', 'yuan', 'wang'], translation: 'Realize my wish' }
    ]
  }
];
