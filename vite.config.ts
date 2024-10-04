import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Gojuon',
        short_name: 'Gojuon',
        description: 'Gojuon exercise',
        theme_color: '#3689e6',
        background_color: '#ffffff',
        icons: [
          {
            src: '/icon/favicon.png',
            type: 'image/png', 
          },
          {
            src: '/icon/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ]
      }
    })
  ],
})
