import react from '@vitejs/plugin-react';
import { resolve } from "node:path";
import { defineConfig, loadEnv } from 'rolldown-vite';
import metadata from '@zeroweb/vite-plugin-metadata'

const envPrefix = ['ZEROWEB_', 'VITE_']

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), envPrefix)
  const base = '/'

  /**
   * 向请求头添加 Token
   * @param {import('http').ClientRequest} proxyReq 
   */
  const authProxy = (proxyReq) => {
    if (proxyReq.path === '/auth/login/basic') {
      return;
    }
    const idToken = env.VITE_TOKEN;
    if (idToken) {
      proxyReq.setHeader('Authorization', `Bearer ${idToken}`)
    }
    const publicKey = env.VITE_PUBLIC_KEY;
    if (publicKey) {
      proxyReq.setHeader('X-PUBLIC-KEY', publicKey)
    }
  }

  return {
    base: base,
    envPrefix,
    plugins: [
      react(),
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
          configure: (proxy) => {
            proxy.on('proxyReq', authProxy)
          },
        },
        [env.ZEROWEB_OPEN_API]: {
          target: env.VITE_OPEN_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(env.ZEROWEB_OPEN_API, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', authProxy)
          },
        },
      },
    },
  }
})
