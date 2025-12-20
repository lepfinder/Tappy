这是一个非常实用的需求！对于教育类工具，“多用户切换”是家庭场景（二胎家庭）或学校机房场景的刚需。使用 **IndexedDB** 是正确的选择，因为它比 `localStorage` 容量大得多，且适合存储结构化数据（如成千上万条练习记录）。

为了简化开发难度并确保代码的健壮性，我**强烈建议使用 `Dexie.js`**。它是 IndexedDB 的轻量级包装库，对 React 非常友好，AI 写起来也更不容易出错。

以下是专门针对 **“本地多用户管理 + IndexedDB 持久化”** 的 PRD 文档。

---

# Feature PRD: 本地多用户与数据持久化系统 (Local User & Persistence)

## 1. 需求概述 (Overview)
**目标**：在无后端环境下，实现基于浏览器的多用户管理和练习数据永久存储。
**核心约束**：
1.  **纯本地**：所有数据存储在 IndexedDB。
2.  **多档案**：支持创建多个“用户档案 (Profile)”，例如 "弟弟"、"姐姐"。
3.  **无密码**：切换用户无需验证，点击头像即可切换。
4.  **关联数据**：练习记录必须绑定到当前选中的 `userId`。

## 2. 技术选型 (Tech Stack)
*   **Database**: IndexedDB (通过 **Dexie.js** 库管理)。
*   **State Management**: Zustand (用于管理 `currentUser` 全局状态)。
*   **UI Components**: Headless UI 或 Radix UI (可选，用于下拉菜单)。

## 3. 数据库设计 (Database Schema)

请 AI 创建一个 `db.ts` 文件，定义以下 Schema。

### 3.1 Tables
使用 Dexie 的定义语法：

1.  **`users` 表**: 存储用户基本信息。
    *   `id` (主键, 自增 number 或 UUID string)
    *   `name` (string, 昵称)
    *   `avatar` (string, 存储 Emoji 字符或图片路径)
    *   `themeColor` (string, 可选，用户的主题色)
    *   `createdAt` (number)

2.  **`records` 表**: 存储练习历史。
    *   `id` (主键, 自增)
    *   `userId` (索引, 关联 users.id)
    *   `lessonId` (string, 关联课程)
    *   `score` (number)
    *   `wpm` (number)
    *   `accuracy` (number)
    *   `timestamp` (number)

```typescript
// 给 AI 的参考代码
import Dexie, { type EntityTable } from 'dexie';

interface User {
  id: number;
  name: string;
  avatar: string; // e.g., '🐼'
}

interface Record {
  id: number;
  userId: number;
  lessonId: string;
  wpm: number;
  accuracy: number;
  stars: number;
  timestamp: number;
}

const db = new Dexie('TappyDatabase') as Dexie & {
  users: EntityTable<User, 'id'>;
  records: EntityTable<Record, 'id'>;
};

// Schema definition
db.version(1).stores({
  users: '++id, name',
  records: '++id, userId, timestamp' // userId indexed for fast queries
});

export { db };
```

## 4. 关键功能流程 (User Flows)

### 4.1 初始化 (App Launch)
1.  应用加载时，读取 `localStorage` 中的 `lastActiveUserId`。
2.  **场景 A (有上次用户)**: 自动登录该用户，更新 Zustand store。
3.  **场景 B (无用户/首次使用)**: 弹出一个 **"Who are you? / 建立档案"** 的全屏模态框，强制要求创建一个用户。

### 4.2 用户切换器 (User Switcher UI)
在页面右上角（之前的“中文/English”旁边）增加用户组件：
*   **UI**: 显示当前用户头像 + 名字 + 下拉箭头。
*   **下拉菜单内容**:
    *   列出所有其他用户。
    *   [+ 添加新用户] 按钮。
    *   [⚙️ 管理用户] (用于删除)。

### 4.3 创建用户 (Create User)
*   输入框：名字 (MaxLength: 8)。
*   头像选择器：提供一组预设 Emoji (🐼, 🦊, 🦁, 🐰, 🚀, 🦄)。
*   确认后写入 IndexedDB `users` 表，并自动切换为新用户。

### 4.4 数据保存 (Save Record)
*   修改之前的 `PracticePage` 结算逻辑。
*   在“挑战完成”时，调用 `db.records.add({...})`，将当前的 `userId` 写入数据。

## 5. UI/UX 界面描述

### 5.1 用户切换下拉菜单
```text
[ 🐼 浩浩 v ]
  ----------------
  | 🐰 悦悦      |
  | 🦁 爸爸      |
  ----------------
  | + 添加用户   |
  ----------------
```

### 5.2 首次引导弹窗 (Onboarding Modal)
*   **背景**: 模糊遮罩。
*   **标题**: "欢迎来到 Tappy! 先给自己起个名字吧。"
*   **交互**: 
    1. 选头像 (Grid layout of 6 emojis).
    2. 填名字.
    3. "开始练习" 大按钮。

## 6. 给 AI 的逐步执行指令 (Step-by-Step Prompts)

**Step 1: 安装与配置数据库**
> "Install `dexie`. Create a new file `src/db.ts`. Initialize a Dexie database named 'TappyDB'. Define two stores: `users` (id, name, avatar) and `records` (id, userId, wpm, accuracy, stars, timestamp). Export the db instance."

**Step 2: 全局用户状态管理**
> "Update the Zustand store (or create `useUserStore.ts`). It should hold `currentUser` (object) and `allUsers` (array). Add actions: `refreshUsers()` (fetch from Dexie), `switchUser(id)`, and `createUser(name, avatar)` (add to Dexie then set as current). Use `localStorage` to persist the `lastActiveUserId` so the user stays logged in on refresh."

**Step 3: UI - 用户切换组件**
> "Create a `UserSwitcher` component for the top navigation bar. It should show the current user's avatar and name. Clicking it opens a dropdown (you can use a simple absolute div or a library). The dropdown lists other users and an 'Add User' button. Make it look cute with the existing pastel styling."

**Step 4: UI - 首次引导/添加用户弹窗**
> "Create a `UserOnboardingModal` component. If `useUserStore` shows `currentUser` is null, this modal should block the screen. It allows the user to pick an emoji avatar and type a name. On submit, call `createUser`."

**Step 5: 业务逻辑 - 保存练习记录**
> "Go back to the `PracticePage`. When the practice finishes and the Result Modal is shown, trigger a save function. It should insert a new row into the `records` table in Dexie with the current `userId`, WPM, accuracy, and timestamp. Log 'Record saved' to console for now."

---

### 💡 额外建议 (Pro Tips)

1.  **头像设计**：既然是给孩子用的，不要让用户上传图片（太麻烦且没必要）。直接硬编码 10-12 个可爱的 Emoji 作为头像选项，存数据库时只存 Emoji 字符串（如 "🐼"），前端显示时直接把 Emoji 当文字渲染，既省空间又清晰。
2.  **数据安全**：虽然是本地，但如果用户清空浏览器缓存，IndexedDB 会被清空。可以在“设置”里做一个简单的“导出数据”功能（导出为 JSON），但这属于后续迭代需求，现在可以先不提。
3.  **用户体验细节**：切换用户时，为了增加仪式感，可以加一个简单的过场动画（例如：当前页面淡出，新用户页面淡入，并伴随一句“欢迎回来，[名字]！”）。