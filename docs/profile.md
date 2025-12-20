这是一个非常好的功能扩展！“我的（Profile）”模块不仅是查看数据的地方，更是建立用户**归属感**和**成就感**的核心。

考虑到 `Tappy` 的设计风格是清爽、卡片式、马卡龙配色，我建议将“我的”模块设计成一个**游戏化的成就中心**，而不仅仅是枯燥的数据报表。

以下是详细的设计方案和 PRD，你可以直接用来指导 AI 开发。

---

### 1. 交互与入口设计

*   **入口位置**：底部的白色 Dock 栏。
*   **图标建议**：在“主页（房子）”图标右侧，增加一个“用户（User）”或“奖杯（Trophy）”图标。
*   **交互方式**：点击图标，中间的卡片区域整体切换为“个人中心”视图（或者弹出一个全屏的模态框/抽屉）。

### 2. 页面布局设计 (Bento Grid 风格)

为了保持风格统一，我们继续使用**圆角卡片（Bento Grid）**布局。将页面分为上、中、下三层：

#### **A. 头部：身份卡片 (Identity Card)**
*   **展示**：左侧是大头像（DiceBear 像素风），右侧是昵称和“等级/称号”。
*   **亮点**：**经验条 (XP Bar)**。
    *   *逻辑*：打字越多，经验条越满。
    *   *称号示例*：Lv.1 键盘萌新 -> Lv.5 打字小能手 -> Lv.10 极速闪电侠。
*   **背景**：使用渐变色（例如浅蓝到浅紫），突出主角光环。

#### **B. 中部：核心成就 (Stats & Badges)**
*   **数据概览 (3个小方块)**：
    1.  **打卡天数**：🔥 5 天（强调坚持）
    2.  **最高速度**：⚡️ 35 WPM（强调突破）
    3.  **累计练习**：⏰ 120 分钟（强调积累）
*   **勋章墙 (Trophy Case)**：
    *   横向滚动的区域，展示已获得的勋章（如“初次体验”、“全对达成”、“百词斩”）。未获得的显示灰色锁头。

#### **C. 底部：成长曲线 (Progress Chart)**
*   **图表**：使用平滑的折线图（Line Chart），展示最近 10 次练习的速度（WPM）变化。
*   **历史列表**：一个简化的列表，显示最近的 5 条记录（时间 - 课程 - 成绩）。

---

### 3. 给 AI 的 PRD 文档 (可直接复制)

你可以把下面这段内容发给 AI 编程工具，让它帮你生成代码。

# Feature PRD: User Profile & Statistics Module

## 1. 目标 (Objective)
在底部导航栏增加“我的”模块，展示当前用户的个人信息、累计数据、成长曲线和练习历史。

## 2. 技术依赖 (Tech Stack)
*   **Database**: Dexie.js (Query `db.records` by `userId`)
*   **Charts**: `recharts` (轻量级 React 图表库，需安装)
*   **Icons**: `lucide-react`
*   **Styling**: Tailwind CSS (保持与主页一致的 pastel 风格)

## 3. 页面结构 (UI Layout)

请创建一个新组件 `UserProfile`，布局如下：

### 3.1 Header Section (Identity)
*   **Layout**: Flexbox row.
*   **Avatar**: Display current user's avatar (large size).
*   **Info**: User Name + Level Badge (e.g., "Level 3").
*   **XP Bar**: A progress bar showing total words typed modulo 1000 (e.g., 250/1000 to next level).

### 3.2 Stats Grid (Summary)
*   Create a 3-column grid for key metrics:
    1.  **Total Time**: Sum of `duration` from all records (convert to minutes/hours).
    2.  **Best Speed**: Max `wpm` from all records.
    3.  **Total Sessions**: Count of records.
*   Style: White cards with soft shadows and colorful icons.

### 3.3 Progress Chart (Growth)
*   **Library**: Use `recharts` (`LineChart`, `ResponsiveContainer`).
*   **Data**: Fetch the last 10 records for this user, sorted by timestamp.
*   **X-Axis**: Date (formatted MM-DD).
*   **Y-Axis**: WPM.
*   **Style**: Use a smooth curve (`type="monotone"`), stroke color `#8884d8` (purple), hide grid lines for a clean look.

### 3.4 History List (Recent Activity)
*   A simple list showing the last 5 records.
*   **Format**: `[Date] - [Lesson Name] - [WPM] - [Accuracy]`
*   **Visual**: Simple rows with light border separators.

## 4. 数据库逻辑 (Database Logic)

需要编写一个 hook `useUserStats(userId)`：
1.  **Input**: `userId`.
2.  **Query**:
    *   `records = await db.records.where('userId').equals(userId).toArray()`
3.  **Calculation**:
    *   `totalTime` = sum of `record.duration`
    *   `bestWpm` = max of `record.wpm`
    *   `recentRecords` = records sorted by timestamp desc (take 10).
4.  **Return**: An object with all stats ready for UI.

## 5. 逐步实现指令 (Step-by-Step Prompts for AI)

**Step 1: 准备环境**
> "Install `recharts` and `date-fns` (for formatting dates). Create a new component file `src/components/UserProfile.tsx`."

**Step 2: 数据层 Hook**
> "Create a custom hook `useUserStats(userId)` inside `UserProfile.tsx`. It should use `useEffect` to fetch data from Dexie.
> Calculate:
> 1. Total practice duration (minutes).
> 2. Highest WPM.
> 3. Total sessions count.
> 4. An array of the last 10 records for the chart.
> Return these stats. Handle the loading state."

**Step 3: UI 实现 - 头部与卡片**
> "Implement the UI. Use the existing pastel aesthetic.
> 1. **Header**: Show Avatar, Name, and a 'Level' progress bar (Total Keystrokes / 1000).
> 2. **Stats Grid**: 3 cards (Time, Best WPM, Sessions) with Icons.
> Use Tailwind for styling (rounded-xl, shadow-sm, bg-white)."

**Step 4: UI 实现 - 图表**
> "Add the `LineChart` from `recharts`.
> Data: The last 10 records.
> X-Axis: Date (short format).
> Y-Axis: WPM.
> Tooltip: Show WPM and Accuracy.
> Make the chart responsive and colored soft blue/purple."

**Step 5: 集成到主页**
> "Update the bottom navigation bar. Add a 'User' icon. When clicked, toggle the main view to show `<UserProfile />` instead of the card grid."

---

### 4. 视觉参考 (Visual Concept)

为了让你心里有底，做出来大概是这个感觉：

*   **卡片颜色**：可以复用你主页那几个大卡片的颜色（黄、蓝、紫、绿）。
*   **图表风格**：去掉网格线，只留曲线，看起来更干净。

**Slogan 建议**：
在“我的”页面顶部，也可以加一句鼓励的话：
> **"Look how far you've come!" (看你已经走了多远啦！)**