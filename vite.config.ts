import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3020,
      host: '0.0.0.0',
    },
    preview: {
      allowedHosts: true as const,
    },
    plugins: [
      react(),
      VitePWA({
        // Auto-update when new version is available
        registerType: 'autoUpdate',

        // 仅预缓存核心图标与界面资源，音频走下方 CacheFirst 按需缓存，避免安装阶段狂下 2800 个 mp3
        includeAssets: [
          'favicon.ico',
          'apple-touch-icon.png',
          'pwa-192x192.png',
          'pwa-512x512.png',
          'images/bear_logo.webp',
          'images/woodland/*.webp',
          'icons/fluent3d/*.webp'
        ],

        // Manifest configuration (how the app appears when installed)
        manifest: {
          name: 'Tappy - 儿童打字练习',
          short_name: 'Tappy',
          description: '有趣的中英双语打字启蒙应用，无需登录，离线可用。',
          theme_color: '#F3F4F6',
          background_color: '#F3F4F6',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
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
              purpose: 'any maskable'
            }
          ]
        },

        // Workbox configuration for runtime caching
        workbox: {
          // Force new service worker to take control immediately
          skipWaiting: true,
          clientsClaim: true,
          cleanupOutdatedCaches: true,

          // Glob patterns to cache on install
          globPatterns: ['**/*.{js,css,html,ico,webp,svg,woff,woff2}'],

          // Runtime caching strategies for external resources
          runtimeCaching: [
            // Cache Google Fonts stylesheets
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-stylesheets',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            // Cache Google Fonts web font files
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-webfonts',
                expiration: {
                  maxEntries: 30,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            // Cache DiceBear avatars (if still used in future)
            {
              urlPattern: /^https:\/\/api\.dicebear\.com\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'dicebear-avatars',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            // Cache local audio files
            {
              urlPattern: ({ url }) => url.pathname.startsWith('/audio/'),
              handler: 'CacheFirst',
              options: {
                cacheName: 'audio-cache',
                expiration: {
                  maxEntries: 1000,
                  maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
          ]
        }
      })
    ],
    build: {
      chunkSizeWarningLimit: 700,
      rollupOptions: {
        output: {
          // 仅手动拆分无 React 依赖的纯教材数据，第三方库交由 Rollup + React.lazy 自动安全分包，避免跨 chunk 循环初始化
          manualChunks(id) {
            if (id.includes('/data/cn_poems') || id.includes('/data/cn_essays')) {
              return 'data-cn-curriculum';
            }
          }
        }
      }
    },
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
