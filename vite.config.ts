import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Base path matches the GitHub repo name, since GitHub Pages serves
// project sites from https://<user>.github.io/<repo>/
export default defineConfig({
  base: '/motorhome-itinerary/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Motorhome Itinerary',
        short_name: 'Itinerary',
        description: 'Trip itinerary planner for motorhome travel',
        start_url: '.',
        display: 'standalone',
        background_color: '#faf9fb',
        theme_color: '#2f7a4f',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
})
