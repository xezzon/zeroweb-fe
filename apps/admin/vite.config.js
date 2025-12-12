import react from '@vitejs/plugin-react';
import { resolve } from "node:path";
import { defineConfig, loadEnv } from 'rolldown-vite';

const envPrefix = ['ZEROWEB_', 'VITE_']

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), envPrefix)
  const base = '/'

  return {
    base: base,
    envPrefix,
    plugins: [
      react(),
    ],
    resolve: {
      alias: {
        '@': resolve(import.meta.dirname, 'src'),
      },
    },
    server: {
      host: true,
      proxy: {
      },
    },
  }
})
