import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        // Split CSS per-chunk so route-level code-split CSS isn't forced into one file.
        cssCodeSplit: true,
        // Modern target — smaller output, and all supported browsers (Vercel analytics shows
        // >99% of visitors on evergreen Chrome/Safari/Firefox) handle ES2020 natively.
        target: 'es2020',
        // Skip gzip size reporting during CI builds — saves ~3-5s on Vercel.
        reportCompressedSize: false,
        rollupOptions: {
          output: {
            manualChunks(id) {
              if (id.includes('node_modules')) {
                if (id.includes('recharts') || id.includes('d3-')) {
                  return 'vendor-charts';
                }
                if (id.includes('@supabase')) {
                  return 'vendor-supabase';
                }
                // Everything else (React, router, helmet, lucide, etc.) in one vendor chunk
                return 'vendor';
              }
              // Split admin bundle so public visitors don't download it
              if (
                id.includes('/pages/AdminDashboard') ||
                id.includes('/pages/AdminLogin') ||
                id.includes('/pages/AuthCallback') ||
                id.includes('/components/SheetFinancials') ||
                id.includes('/components/SheetOverview')
              ) {
                return 'admin';
              }
            },
          },
        },
      },
      // Hints for common image formats so Vite emits them as static assets without surprises.
      assetsInclude: ['**/*.webp', '**/*.avif'],
    };
});
