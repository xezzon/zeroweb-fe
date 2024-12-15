import { builtinModules } from 'node:module';

/**
 * @type {import('@farmfe/core').UserConfig}
 */
export default {
  compilation: {
    input: {
      index: './src/index-server.jsx'
    },
    output: {
      path: './dist',
      targetEnv: 'node',
      format: 'cjs',
      publicPath: '/'
    },
    external: [...builtinModules.map((m) => `^${m}$`)],
    css: {
      prefixer: {
        targets: ['last 2 versions', 'Firefox ESR', '> 1%', 'ie >= 11']
      }
    },
    assets: {
      mode: 'browser'
    },
  },
  plugins: [
    [
      '@farmfe/plugin-react',
      {
        refresh: false,
        development: false
      }
    ],
  ],
};
