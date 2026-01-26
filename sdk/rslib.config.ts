import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      format: 'esm',
      output: {
        distPath: './dist',
        filename: {
          js: '[name].mjs',
        },
      },
      dts: true,
    },
    {
      format: 'cjs',
      output: {
        distPath: './dist',
        filename: {
          js: '[name].cjs',
        },
      },
    },
  ],
  output: {
    minify: true,
  },
});