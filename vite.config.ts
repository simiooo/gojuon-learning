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
            src: '/gojuonIcon2.png',
            type: 'image/png', 
          },
          {
            src: '/gojuonIcon2.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/gojuonIcon3.png',
            sizes: '256x256',
            type: 'image/png',
          },
        ]
      }
    })
  ],
})
