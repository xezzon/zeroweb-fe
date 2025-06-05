import { defineConfig } from '@farmfe/core';

export default defineConfig({
  envPrefix: ['ZEROWEB_', 'FARM_', 'VITE_'],
  plugins: ['@farmfe/plugin-react'],
});
