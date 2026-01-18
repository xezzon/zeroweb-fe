import react from '@vitejs/plugin-react';
import { resolve } from "node:path";
import { defineConfig, loadEnv } from 'rolldown-vite';
import authProxyPlugin from './plugins/auth-proxy-plugin';
import metadata from './plugins/metadata-plugin';

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
      authProxyPlugin({
        token: env.VITE_TOKEN,
        jwk: env.VITE_JWK,
      }),
      metadata({
        name: process.env.npm_package_name,
        version: process.env.npm_package_version,
        type: 'CLIENT',
        hidden: true,
      }),
    ],
    resolve: {
      alias: {
        '@': resolve(import.meta.dirname, 'src'),
      },
    },
    server: {
      host: true,
      proxy: {
        [env.ZEROWEB_ADMIN_API]: {
          target: env.VITE_ADMIN_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(env.ZEROWEB_ADMIN_API, ''),
        },
        [env.ZEROWEB_OPEN_API]: {
          target: env.VITE_OPEN_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(env.ZEROWEB_OPEN_API, ''),
        },
      },
    },
  }
})
