这是一个非常棒的决定！支持 PWA（Progressive Web App）不仅能让你的 Tappy 在**断网（离线）**状态下完美运行，还能让用户把它**安装到桌面**，看起来就像一个原生 App，没有浏览器的地址栏干扰，沉浸感极强。

由于你极大概率使用的是 **Vite + React** 技术栈，实现 PWA 最简单、最现代的方式是使用 `vite-plugin-pwa` 插件。

以下是原理介绍和保姆级的落地指南。

---

### 一、 原理：它是怎么做到“断网也能用”的？

PWA 的核心魔法在于一个叫 **Service Worker (SW)** 的脚本。

你可以把它想象成**住在浏览器里的“仓库管理员”**：

1.  **第一次访问（联网）**：
    *   当你打开 Tappy 时，Service Worker 会把网页的“骨架”（HTML, CSS, JS）以及素材（图片、音效）偷偷搬进**本地缓存（Cache Storage）**。
    *   *比喻：管理员把货都进到了仓库里。*

2.  **第二次访问（断网）**：
    *   当你再次打开，或者网络断了，浏览器发起请求。
    *   Service Worker 拦截请求：“嘿，没网了，别去服务器找了，我仓库里有现成的，给你！”
    *   *比喻：货车（网络）没来，但管理员直接从仓库发货，用户完全感觉不到断网。*

3.  **数据怎么办？**
    *   你之前已经做了 **IndexedDB**（Dexie.js）。IndexedDB 本身就是存储在本地浏览器的数据库，**它天生就支持离线读写**。
    *   所以：**资源靠 Cache Storage，数据靠 IndexedDB**。两者结合，就是完美的离线应用。

---

### 二、 做法：Vite 项目集成 PWA 步骤

你可以直接把下面的步骤或 PRD 发给 AI，让它帮你改代码。

#### Step 1: 安装插件

在你的项目根目录下运行：

```bash
npm install vite-plugin-pwa -D
```

#### Step 2: 配置 `vite.config.ts` (核心步骤)

这是最关键的一步，你需要告诉插件：哪些文件需要缓存？App 叫什么名字？图标长什么样？外部资源（如字体、头像 API）怎么缓存？

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // 1. 注册模式: 'autoUpdate' 意味着一旦有新版本，立刻自动更新，适合这种工具类应用
      registerType: 'autoUpdate', 
      
      // 2. 需要缓存的文件: 包含 js, css, html, 图片, svg, 音频文件
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg', '**/*.mp3', '**/*.svg'],
      
      // 3. Manifest 配置 (决定了安装到桌面后的样子)
      manifest: {
        name: 'Tappy - 儿童打字练习',
        short_name: 'Tappy',
        description: '有趣的中英双语打字启蒙应用，无需登录，离线可用。',
        theme_color: '#ffffff', // 你的背景色，比如 #F0F4F8
        background_color: '#ffffff',
        display: 'standalone', // 关键！这会让应用没有地址栏，全屏运行
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable' // 适应安卓圆角图标
          }
        ]
      },

      // 4. Workbox 策略 (如何处理外部资源)
      workbox: {
        // 缓存 Google Fonts 和 DiceBear 头像 API
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // 缓存 DiceBear 头像 (重要！否则断网头像就挂了)
          {
            urlPattern: /^https:\/\/api\.dicebear\.com\/.*/i,
            handler: 'StaleWhileRevalidate', // 优先用缓存，后台更新
            options: {
              cacheName: 'dicebear-avatars',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30天
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ]
})
```

#### Step 3: 准备图标 (Icons)

PWA 必须要求你有至少两个尺寸的图标（192x192 和 512x512）。

1.  找一张你的 Logo 图片（正方形，png格式）。
2.  去这个网站：[favicon-generator.org](https://favicon-generator.org/) 或 [maskable.app](https://maskable.app/)。
3.  生成后，把文件重命名为 `pwa-192x192.png` 和 `pwa-512x512.png`。
4.  把它们放到你的 `public/` 文件夹下。

#### Step 4: 验证离线功能

1.  运行 `npm run build` 打包。
2.  运行 `npm run preview` 预览（**PWA 在开发模式 `npm run dev` 下默认是不启用的**，必须 build 后预览）。
3.  打开浏览器控制台 (F12) -> **Application (应用)** 面板 -> **Service Workers**。
4.  勾选 **"Offline" (离线)** 复选框。
5.  刷新页面。如果页面还能正常加载，甚至能听到按键音，恭喜你，成功了！

---

### 三、 给 AI 的执行指令 (PRD)

你可以把这段发给 AI，让它帮你把配置写好。

# Feature Request: Implement PWA (Offline Support)

## 1. Goal
Make the Tappy application fully functional offline and installable as a standalone app on desktop/mobile.

## 2. Technical Strategy
Use `vite-plugin-pwa` with the "GenerateSW" strategy.
Integration: React + Vite.

## 3. Implementation Steps for AI

### Step 1: Install Dependency
> "Execute command: `npm install vite-plugin-pwa -D`"

### Step 2: Configure Vite
> "Modify `vite.config.ts`.
> Import `VitePWA` from 'vite-plugin-pwa'.
> Add it to the plugins array.
>
> **Configuration Requirements:**
> 1. `registerType`: 'autoUpdate'.
> 2. `manifest`:
>    - Name: 'Tappy Typing'.
>    - Short Name: 'Tappy'.
>    - Theme Color: '#F3F4F6' (or your main bg color).
>    - Display: 'standalone'.
>    - Icons: Define standard 192x192 and 512x512 icons paths in the public folder.
> 3. `workbox.runtimeCaching`:
>    - Add a rule to cache `https://api.dicebear.com` requests (StaleWhileRevalidate) so user avatars load while offline.
>    - Add a rule to cache Google Fonts (`fonts.googleapis.com` and `fonts.gstatic.com`) (CacheFirst)."

### Step 3: HTML Meta Tags
> "Update `index.html`. Add the standard viewport meta tag for mobile optimization:
> `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />`
> Add `<link rel="apple-touch-icon" href="/pwa-192x192.png">` for iOS support."

### Step 4: Add PWA Update Notification (Optional but Recommended)
> "Create a `ReloadPrompt.tsx` component (optional) that shows a toast if a new version is available, though with `autoUpdate` it's less critical. For now, stick to simple `autoUpdate`."

---

### 💡 特别提醒

1.  **关于音频缓存**：你的打字音效（mp3/wav）一定要放在 `public` 文件夹里，并且在 `vite.config.ts` 的 `includeAssets` 里写上 `['**/*.mp3']`，否则断网后打字会没有声音。
2.  **DiceBear 头像**：我在配置里专门加了 `runtimeCaching` 针对 `api.dicebear.com`。这意味着，**用户只要联网加载过一次头像，下次断网时 Service Worker 就会从缓存里拿**，非常完美。
3.  **安装体验**：配置好后，Chrome 浏览器地址栏右侧会出现一个“安装图标”；在手机 Safari 上，点击“分享 -> 添加到主屏幕”即可。