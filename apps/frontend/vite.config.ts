import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'favicon.png', 'vite.svg'],
      manifest: {
        name: 'PHC Commons',
        short_name: 'PHC',
        description: 'Offline-first PHC management — installable PWA',
        theme_color: '#0f172a',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/favicon.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/favicon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        navigateFallback: '/',
        runtimeCaching: [
          {
            // Cache pharmacy-related API requests (NetworkFirst)
            urlPattern: /^https?:.*\/pharmacy\/.*$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pharmacy-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 24 * 60 * 60 // 1 day
              },
              networkTimeoutSeconds: 10
            }
          },
          {
            // Cache patients/consultations stats endpoints
            urlPattern: /^https?:.*\/(patients|consultations)\/.*$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-stats-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 }
            }
          },
          {
            // Static assets (images, fonts) - StaleWhileRevalidate
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|woff2?)$/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'asset-cache', expiration: { maxEntries: 100 } }
          }
        ]
      }
    })
  ],
})

