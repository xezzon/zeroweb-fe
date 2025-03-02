import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

const envPrefix = ['VITE_', 'ZEROWEB_']

// https://vite.dev/config/
export default defineConfig(() => ({
  envPrefix,
  define: {
    '__ENV__': 'window.__ENV__',
  },
  plugins: [react()],
}))
