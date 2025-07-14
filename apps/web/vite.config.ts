import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      'ag-ui-client': path.resolve(__dirname, '../../libs/ag-ui-client/dist/index.mjs'),
      '@tetrix/rbac': path.resolve(__dirname, '../../packages/rbac/dist/index.js'),
    },
  },
  optimizeDeps: {
    include: ['ag-ui-client']
  },
  build: {
    commonjsOptions: {
      include: [/ag-ui-client/, /node_modules/]
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/llm': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/llm/, ''),
      },
    },
  },
})
