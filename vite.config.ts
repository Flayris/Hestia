import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ command }) => ({
  // In produzione il sito vive su flayris.github.io/Hestia/, quindi tutti gli
  // asset vanno prefissati. In sviluppo resta la radice.
  base: command === 'build' ? '/Hestia/' : '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.svg', 'icons/*.png'],
      manifest: {
        name: 'Hestía',
        short_name: 'Hestía',
        description: 'Grimorio e calendario ellenico',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#f5eede',
        theme_color: '#cfe0ec',
        lang: 'it',
        // I PNG per primi: iOS ignora del tutto le icone SVG del manifest.
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: 'icons/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
    }),
  ],
}));
