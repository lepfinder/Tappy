这份 PRD 文档是专门为你设计的**“左右护法（Side-Layout）实色指法提示”**方案。你可以直接将其复制给 AI 编程工具（如 Cursor/Windsurf）。

---

# Feature PRD: Side-Floating Finger Guides (侧边实色指法提示)

## 1. 需求背景 (Context)
**当前痛点**：笔记本电脑屏幕垂直高度有限，无法在虚拟键盘下方放置指法提示。
**解决方案**：采用“左右护法”布局，在虚拟键盘的**左侧**和**右侧**分别放置左手和右手的手模。
**核心变更**：从之前的“半透明覆盖”改为**“实色填充”**，从“上下布局”改为**“水平 Flex 布局”**。

## 2. 视觉设计规范 (Visual Specs)

### 2.1 布局结构
*   **容器**：Flexbox 横向排列。
*   **顺序**：`[左手组件] --间距-- [虚拟键盘] --间距-- [右手组件]`。
*   **对齐**：底部对齐 (`items-end`) 或 垂直居中 (`items-center`)，推荐底部对齐以符合人体工学视觉。

### 2.2 手模组件 (`HandGuide`)
*   **风格**：卡通、圆润、扁平化 SVG（类似 Mickey Mouse 的手套风格或简洁矢量手）。
*   **颜色状态**：
    *   **Inactive (闲置手指)**: 浅灰色 (Tailwind `bg-gray-200` / Hex `#E2E8F0`)。
    *   **Active (激活手指)**: 品牌主色 (推荐亮蓝色 `bg-blue-400` 或 亮黄色 `bg-yellow-400`，需高亮醒目)。
    *   **轮廓线 (Stroke)**: 深灰色 (Tailwind `border-gray-400` / Hex `#94A3B8`)，线宽 `2px`，增强卡通感。
*   **尺寸**：固定宽度约 `120px` - `140px`。

## 3. 技术实现方案 (Technical Implementation)

### 3.1 数据层：指法映射 (Finger Mapping)
新建工具文件 `src/utils/fingerMapping.ts`。

我们需要定义标准的指法键位：
*   **Left Pinky (左小指)**: `Q, A, Z, 1, Tab, Shift-L`
*   **Left Ring (左无名)**: `W, S, X, 2`
*   **Left Middle (左中指)**: `E, D, C, 3`
*   **Left Index (左食指)**: `R, F, V, 4, T, G, B, 5`
*   **Thumb (拇指)**: `Space`

*   **Right Index (右食指)**: `Y, H, N, 6, U, J, M, 7`
*   **Right Middle (右中指)**: `I, K, ,, 8`
*   **Right Ring (右无名)**: `O, L, ., 9`
*   **Right Pinky (右小指)**: `P, ;, /, 0, -, =, [, ], ', Enter, Backspace`

### 3.2 组件层：`HandGuide.tsx`
该组件需要渲染一个 SVG，其中 5 个手指的路径 (`<path>`) 需要独立分离，以便通过 CSS 类名单独控制颜色。

*   **Props 定义**:
    ```typescript
    type FingerName = 'pinky' | 'ring' | 'middle' | 'index' | 'thumb' | null;

    interface HandGuideProps {
      side: 'left' | 'right';      // 决定渲染左手还是右手（或者用 scaleX(-1) 翻转）
      activeFinger: FingerName;    // 当前需要高亮的手指
      className?: string;
    }
    ```

## 4. 给 AI 的逐步执行指令 (Step-by-Step Prompts)

请按顺序发送以下指令，以确保代码质量。

### Step 1: 编写指法逻辑 (Logic First)
> **Prompt:**
> "Create a utility file `src/utils/fingerMapping.ts`.
> I need a function `getFingerForKey(key: string): { hand: 'left' | 'right', finger: 'pinky' | 'ring' | 'middle' | 'index' | 'thumb' } | null`.
>
> Implement standard touch typing rules:
> - Left Pinky: q, a, z, 1
> - Left Ring: w, s, x, 2
> - Left Middle: e, d, c, 3
> - Left Index: r, f, v, t, g, b, 4, 5
> - Right Index: y, h, n, u, j, m, 6, 7
> - Right Middle: i, k, 8, comma
> - Right Ring: o, l, 9, period
> - Right Pinky: p, 0, minus, equal, brackets, semicolon, quote, slash
> - Thumbs: space
>
> Return `null` if the key is not found."

### Step 2: 创建手模组件 (The Component)
> **Prompt:**
> "Create a React component `HandGuide.tsx`.
> It should render an SVG of a hand.
>
> **Requirements:**
> 1. Props: `side` ('left' or 'right') and `activeFinger` (string).
> 2. **SVG Structure**: Draw a simple, cute, rounded hand. It must have 5 separate `<path>` elements for the 5 fingers, and one for the palm.
> 3. **Flipping**: If `side === 'right'`, apply `transform: scaleX(-1)` to mirror the left hand (so thumbs are always on the inside).
> 4. **Coloring**: Check the `activeFinger` prop.
>    - If a finger matches (e.g., 'index'), fill it with `#60A5FA` (Tailwind blue-400).
>    - If not active, fill it with `#E2E8F0` (Tailwind gray-200).
>    - Add a `#94A3B8` (slate-400) stroke/border to all paths for a cartoon look.
> 5. Size: Default width `140px`."

### Step 3: 布局整合 (Integration)
> **Prompt:**
> "Now let's update the layout in `PracticePage`.
>
> 1. Wrap the existing `VirtualKeyboard` in a flex container: `<div className="flex flex-row items-end justify-center gap-8">`.
> 2. Inside this container:
>    - First: `<HandGuide side="left" activeFinger={...} />`
>    - Middle: `<VirtualKeyboard ... />`
>    - Last: `<HandGuide side="right" activeFinger={...} />`
> 3. **Connecting Logic**: Use the `getFingerForKey` utility with the current target character to determine which hand and finger to highlight.
> 4. **Responsive**: Add `hidden lg:block` to the HandGuides, so they disappear on small screens (like tablets) where there isn't enough width."

---

### 5. 预期效果描述 (Visual Expectation)

你可以用这部分来检查 AI 做的对不对：

*   **常态**：屏幕下方中间是键盘，左右两边各有一只灰色的手，像守护神一样。
*   **打字时**：
    *   假设要打 **"F"**：中间键盘 "F" 键高亮，**左边**的手模的**食指**瞬间变成亮蓝色。
    *   假设要打 **"K"**：中间键盘 "K" 键高亮，**右边**的手模的**中指**瞬间变成亮蓝色。
    *   假设要打 **"空格"**：两只手的**大拇指**同时变成亮蓝色。

这个方案既利用了笔记本的宽屏优势，又因为是实色填充，视觉冲击力很强，非常适合儿童快速识别！