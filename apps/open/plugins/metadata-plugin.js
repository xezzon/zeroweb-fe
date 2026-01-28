import { ServiceType } from '@xezzon/zeroweb-sdk';

const pluginName = 'MetadataPlugin';

/**
 * Rsbuild 插件：在构建输出中添加 metadata/info.json 文件
 * @returns {import('@rsbuild/core').RsbuildPlugin} Rsbuild 插件
 */
export function metadataPlugin() {
  const content = JSON.stringify(
    {
      name: process.env.npm_package_name,
      version: process.env.npm_package_version,
      type: ServiceType.CLIENT,
      hidden: true,
    },
    null,
    2,
  );
  return {
    name: 'metadata-plugin',
    setup(api) {
      api.modifyBundlerChain((chain) => {
        chain.plugin('metadata-plugin').use({
          /**
           * @param {import('@rsbuild/core').Rspack.Compiler} compiler
           */
          apply(compiler) {
            compiler.hooks.compilation.tap(pluginName, (compilation) => {
              compilation.hooks.processAssets.tap(
                {
                  name: pluginName,
                  stage: compilation.constructor.PROCESS_ASSETS_STAGE_ADDITIONAL,
                },
                (assets) => {
                  // 创建 metadata 目录和 info.json 文件
                  assets['metadata/info.json'] = {
                    source: () => content,
                    size: () => content.length,
                  };
                },
              );
            });
          },
        });
      });
    },
  };
}
