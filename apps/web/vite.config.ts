import 'tsconfig-paths/register';
import path from 'path';
import { config as dotenvConfig } from 'dotenv';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import tsconfigPaths from 'vite-tsconfig-paths';
import { VitePWA } from 'vite-plugin-pwa';

// Load .env file into Node's process.env for server-side code
dotenvConfig();

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const isProd = mode === 'production';

  return {
    server: {
      port: 7320,
      host: '0.0.0.0',
      watch: {
        ignored: [
          '**/playwright-report/**',
          '**/test-results/**',
          '**/.docker/**',
          '**/tests/**',
          '**/node_modules/**',
        ],
      },
      allowedHosts: true,
      fs: {
        // Don't serve files from test directories
        deny: ['.env', '.env.*', '**/playwright-report/**', '**/test-results/**', '**/tests/**'],
      },
      proxy: {
        '/storage': {
          target: 'http://storage-proxy',
          changeOrigin: true,
        },
        '/api': {
          target: 'http://localhost:7321',
          changeOrigin: true,
        },
        '/trpc': {
          target: 'http://localhost:7321',
          changeOrigin: true,
        },
      },
    },
    plugins: [
      tsconfigPaths(),
      react(),
      nodePolyfills({
        include: ['buffer', 'process'],
        globals: {
          Buffer: true,
          process: true,
        },
      }),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        strategies: 'injectManifest',
        srcDir: 'src',
        filename: 'service-worker.ts',
        manifest: false,
        devOptions: {
          enabled: true
        }
      }),
      isProd && visualizer({
        filename: 'dist/stats.html',
        gzipSize: true,
        brotliSize: true,
      }),
    ].filter(Boolean),
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.DB_TYPE': JSON.stringify('postgres'),
      'global': 'window',
      __DEV__: JSON.stringify(!isProd),
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    },
    esbuild: {
      drop: ['debugger'],
    },
    optimizeDeps: {
      include: ['@trpc/react-query', '@trpc/client', '@trpc/server', '@tanstack/react-query'],
    },
    build: {
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      target: 'es2020',
      outDir: 'dist',
      assetsDir: 'assets',
      cssCodeSplit: true,
      sourcemap: !isProd,
      minify: 'esbuild',
      reportCompressedSize: false,
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-redux', '@reduxjs/toolkit', 'react-router-dom'],
            'ui-vendor': [
              '@mui/material',
              '@mui/icons-material',
              '@emotion/react',
              '@emotion/styled',
              'framer-motion',
              'lucide-react',
              '@radix-ui/react-popover',
              '@radix-ui/react-tooltip',
              'clsx',
              'tailwind-merge',
              'react-resizable-panels'
            ],
            'charts-vendor': ['recharts'],
            'editor-vendor': ['@monaco-editor/react', 'react-syntax-highlighter', 'react-markdown', 'remark-gfm', 'gray-matter'],
            'aws-vendor': ['aws-amplify', '@aws-amplify/ui-react', '@aws-amplify/core'],
            'db-vendor': ['typeorm', 'reflect-metadata', 'typeorm-zod'],
            'utils-vendor': ['date-fns', 'uuid', 'zod', 'debounce', '@hookform/resolvers', 'react-hook-form'],
          },
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]',
        },
      },
    },
    resolve: {
      alias: [
        // Removed fs, path, crypto shims to enforce browser-only code
        // { find: 'fs', replacement: path.resolve(__dirname, './src/lib/empty-module.js') },
        // { find: 'path', replacement: path.resolve(__dirname, './src/lib/empty-module.js') },
        // { find: 'crypto', replacement: path.resolve(__dirname, './src/lib/empty-module.js') },

        // Strictly match tsconfig.json paths
        { find: '@/apis', replacement: path.resolve(__dirname, './src/apis') },
        { find: '@/app', replacement: path.resolve(__dirname, './src/app') },
        { find: '@/apps', replacement: path.resolve(__dirname, './src/apps') },
        { find: '@/classes', replacement: path.resolve(__dirname, './src/lib/classes') },
        { find: '@/components', replacement: path.resolve(__dirname, './src/components') },
        { find: '@/consts', replacement: path.resolve(__dirname, './src/lib/consts') },
        { find: '@/contexts', replacement: path.resolve(__dirname, './src/contexts') },
        { find: '@/db', replacement: path.resolve(__dirname, './src/db') },
        { find: '@/enums', replacement: path.resolve(__dirname, './src/lib/enums') },
        { find: '@/hooks', replacement: path.resolve(__dirname, './src/hooks') },
        { find: '@/interfaces', replacement: path.resolve(__dirname, './src/lib/interfaces') },
        { find: '@/lib', replacement: path.resolve(__dirname, './src/lib') },
        { find: '@/os', replacement: path.resolve(__dirname, './src/os') },
        { find: '@/server', replacement: path.resolve(__dirname, './src/server') },
        { find: '@/services', replacement: path.resolve(__dirname, './src/services') },
        { find: '@/store', replacement: path.resolve(__dirname, './src/store') },
        { find: '@/system', replacement: path.resolve(__dirname, './src/system') },
        { find: '@/types', replacement: path.resolve(__dirname, './src/lib/types') },
        { find: '@/utils/api', replacement: path.resolve(__dirname, './src/utils/api.ts') },
        { find: '@/utils/trpc-client', replacement: path.resolve(__dirname, './src/utils/trpc-client.ts') },
        { find: '@/utils', replacement: path.resolve(__dirname, './src/lib/utils') },

        // Catch-all
        { find: '@', replacement: path.resolve(__dirname, './src') },

        {
          find: 'pg',
          replacement: path.resolve(__dirname, 'src/db/browser-pg-driver.ts'),
          customResolver: function (source, importer, options) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((options as any)?.ssr) {
              return null;
            }
            return path.resolve(__dirname, 'src/db/browser-pg-driver.ts');
          }
        },

      ],
    }
  };
});
