import react from '@vitejs/plugin-react-swc';
import { resolve } from "node:path";
import { defineConfig, loadEnv } from 'vite';

const envPrefix = ['ZEROWEB_', 'VITE_']

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const base = '/'
  const env = loadEnv(mode, process.cwd(), envPrefix)

  return {
    base: base,
    envPrefix,
    plugins: [react()],
    resolve: {
      alias: {
        '@': resolve(import.meta.dirname, 'src'),
      },
    },
    server: {
      host: true,
      proxy: {
        [env.ZEROWEB_ADMIN_API]: {
          target: env.ZEROWEB_ADMIN_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(env.ZEROWEB_ADMIN_API, ''),
        },
      },
    },
  }
})
