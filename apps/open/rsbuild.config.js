// @ts-check
import { defineConfig, loadEnv } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { authProxyPlugin } from './plugins/auth-proxy-plugin.js';
import { metadataPlugin } from './plugins/metadata-plugin.js';

const { publicVars, parsed } = loadEnv({
  prefixes: ['PUBLIC_', 'ZEROWEB_'],
});

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  plugins: [
    pluginReact(),
    authProxyPlugin({
      token: parsed.TOKEN,
      jwk: parsed.JWK,
    }),
    metadataPlugin(),
  ],
  resolve: {
    alias: {
      '@': './src',
    },
  },
  source: {
    define: publicVars,
  },
  html: {
    title: parsed.PUBLIC_APP_TITLE,
  },
  server: {
    proxy: {
      [parsed.ZEROWEB_ADMIN_API]: {
        target: parsed.ADMIN_URL,
        changeOrigin: true,
        pathRewrite: {
          [parsed.ZEROWEB_ADMIN_API]: '',
        },
      },
      [parsed.ZEROWEB_OPEN_API]: {
        target: parsed.OPEN_URL,
        changeOrigin: true,
        pathRewrite: {
          [parsed.ZEROWEB_OPEN_API]: '',
        },
      },
    },
  },
});
