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
        theme_color: '#80aa51',
        background_color: '#ffffff',
        icons: [
          {
            src: 'gojuon-icon2.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'gojuon-icon3.png',
            sizes: '256x256',
            type: 'image/png',
          },
        ]
      }
    })
  ],
})
