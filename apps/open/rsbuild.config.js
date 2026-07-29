// @ts-check
import { defineConfig, loadEnv } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { authProxyPlugin } from './plugins/auth-proxy-plugin.js';
import { metadataPlugin } from './plugins/metadata-plugin.js';

const { publicVars, parsed } = loadEnv();

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
      [parsed.PUBLIC_ADMIN_API]: {
        target: parsed.ZEROWEB_ADMIN_API,
        changeOrigin: true,
        pathRewrite: {
          [parsed.PUBLIC_ADMIN_API]: '',
        },
      },
      [parsed.PUBLIC_OPEN_API]: {
        target: parsed.ZEROWEB_OPEN_API,
        changeOrigin: true,
        pathRewrite: {
          [parsed.PUBLIC_OPEN_API]: '',
        },
      },
    },
  },
});
