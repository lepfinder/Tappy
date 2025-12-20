太棒了！你的页面还原度非常高，**视觉风格统一、干净且高级**，完全符合现代 Web 产品的标准。那个“挑战完成”的弹窗目前略显单薄，这正是我们加入统计功能的好机会。

这份 PRD 文档专门针对**“结算统计模块”**的升级，你可以直接发给 AI 工具（如 Cursor/Windsurf），让它在现有代码基础上进行改造。

---

# Feature PRD: 游戏化结算统计与数据分析模块 (Result & Stats)

## 1. 需求背景 (Context)
当前 `PracticePage` 完成后仅显示简单的“挑战完成”文本。为了增强教育反馈和激励性，我们需要改造**结算弹窗 (Result Modal)**，使其展示详细的练习数据、星级评分以及针对性的改进建议。

## 2. 视觉与交互设计 (UX/UI Design)

### 2.1 布局改造
将现有的白色卡片（Result Modal）内容扩充为以下**三段式结构**：

*   **Header (成就区)**:
    *   **星级动画**: 居中展示 1-3 颗大星星（动态弹出）。
    *   **短评**: 根据星级动态变化文案（例如：3星-"太神了！" / 2星-"做的不错！" / 1星-"继续加油"）。
*   **Body (数据区)**:
    *   采用 **Grid (2x2)** 布局展示核心指标。
    *   **指标 1**: 速度 (WPM/CPM) —— 配速度仪表盘图标。
    *   **指标 2**: 准确率 (Accuracy %) —— 配靶心图标。
    *   **指标 3**: 连击 (Max Combo) —— 配火焰图标。
    *   **指标 4**: 易错键 (Trouble Keys) —— 显示用户出错最多的 3 个字母（如 "P, Q"），如果全对则显示“无懈可击”。
*   **Footer (操作区)**:
    *   保留现有的 [重玩]、[列表]、[下一关] 按钮。

### 2.2 交互细节
1.  **入场动画**: 弹窗出现时，数字应该从 0 开始滚动增长 (Counting animation) 到最终值。
2.  **音效配合**: 星星出现时播放“叮-叮-叮”的音效。
3.  **视觉反馈**:
    *   准确率 > 90%: 数字显示为绿色。
    *   准确率 < 60%: 数字显示为橙/红色。

## 3. 核心逻辑 (Core Logic)

### 3.1 评分算法 (Star Calculation)
AI 需要实现一个 `calculateStars` 函数：
*   **3 Stars**: 准确率 ≥ 90% **且** 速度 ≥ 目标速度 (比如 15 WPM)。
*   **2 Stars**: 准确率 ≥ 80%。
*   **1 Star**: 完成练习即可。

### 3.2 易错键分析
在练习过程中，需要记录每个键的 `errorCount`。结算时，提取 `errorCount` 最高的 top 3 键位。

## 4. 数据结构 (Data Schema)

请 AI 在组件中定义以下 TypeScript 接口：

```typescript
// 练习结束时的统计结果
interface PracticeResult {
  wpm: number;          // 最终速度
  accuracy: number;     // 最终准确率 (0-100)
  timeSpent: number;    // 耗时 (秒)
  maxCombo: number;     // 最大连击数
  mistakeKeys: string[]; // 错误次数最多的键位，如 ['a', 'p']
  stars: 1 | 2 | 3;     // 计算出的星星
  score: number;        // 综合得分
}
```

## 5. 给 AI 的分步指令 (Step-by-Step Prompts)

为了防止 AI 一次改乱代码，建议分 **3 步** 提问。

### Step 1: 完善数据收集逻辑
> **Prompt:**
> "Review the `PracticePage` component. I need to track detailed statistics during gameplay to show at the end.
> 1. Create a state or ref to track `mistakeKeys` (a map of key -> error count) and `maxCombo`.
> 2. Update the `handleKeyPress` logic: if user types wrong, increment the specific key's error count and reset current combo. If right, increment current combo and update `maxCombo`.
> 3. Create a helper function `calculateStats()` that returns an object matching the `PracticeResult` interface (calculate stars based on accuracy > 90% and WPM > 10).
> Don't change the UI yet, just the logic."

### Step 2: 改造结算弹窗 UI (核心步骤)
> **Prompt:**
> "Now, let's upgrade the 'Challenge Completed' modal UI based on the `PracticeResult` data.
> 1. Replace the simple success message with a structured layout.
> 2. **Top:** Display animated Stars (1 to 3) using lucide-react 'Star' icon. Fill them yellow based on the score.
> 3. **Middle:** A 2x2 Grid showing: Speed (WPM), Accuracy (%), Max Combo, and 'Need Practice' (display the top 3 mistake keys).
> 4. Use the existing pastel styling. Make the numbers big and bold.
> 5. Keep the bottom action buttons (Replay, Next).
> Use Tailwind CSS for styling."

### Step 3: 增加动画与动效
> **Prompt:**
> "Let's add some polish to the Result Modal.
> 1. Use `framer-motion` (or CSS animations) to make the modal pop in smoothly.
> 2. Make the stars appear one by one with a slight delay.
> 3. Add a counting effect for the WPM and Accuracy numbers (count up from 0 to the final value over 1 second)."

---

## 6. 关键代码片段参考 (供你检查 AI 的输出)

当 AI 写完 **Step 2** 时，你应该能在代码里看到类似这样的结构。如果它没写好，你可以把这个发给它修正：

```tsx
{/* 结算弹窗伪代码参考 */}
<div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center animate-in fade-in zoom-in">
  
  {/* 1. 星星与标题 */}
  <div className="flex justify-center gap-2 mb-4">
    {[1, 2, 3].map((star) => (
      <Star 
        key={star} 
        size={48} 
        className={star <= stats.stars ? "fill-yellow-400 text-yellow-400" : "text-gray-200"} 
      />
    ))}
  </div>
  <h2 className="text-2xl font-bold text-gray-700 mb-6">
    {stats.stars === 3 ? "太棒了！完美发挥！" : "挑战完成！"}
  </h2>

  {/* 2. 数据网格 */}
  <div className="grid grid-cols-2 gap-4 mb-8">
    <StatBox label="速度" value={stats.wpm} unit="WPM" color="bg-blue-50 text-blue-600" />
    <StatBox label="准确率" value={`${stats.accuracy}%`} color="bg-green-50 text-green-600" />
    <StatBox label="最大连击" value={stats.maxCombo} color="bg-orange-50 text-orange-600" />
    <div className="bg-red-50 p-3 rounded-xl flex flex-col items-center justify-center">
      <span className="text-xs text-gray-500 mb-1">需练习</span>
      <div className="flex gap-1">
        {stats.mistakeKeys.length > 0 ? (
           stats.mistakeKeys.map(k => <span key={k} className="font-mono font-bold text-red-500 uppercase">{k}</span>)
        ) : (
           <span className="text-green-500 font-bold">无</span>
        )}
      </div>
    </div>
  </div>

  {/* 3. 按钮区 (保持原样) */}
  <div className="flex justify-center gap-4">
    {/* ... Buttons ... */}
  </div>
</div>
```

**建议：**
由于你的页面已经很漂亮了，在 Step 3 中引入 `framer-motion` 会让你的弹窗从“干巴巴的显示”变成“Duang的一下弹出来”，质感提升巨大，强烈建议加上。