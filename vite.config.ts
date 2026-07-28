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
      includeAssets: ['icons/*.svg'],
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
        icons: [
          { src: 'icons/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icons/icon-maskable.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
    }),
  ],
}));
