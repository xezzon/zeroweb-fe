/**
 * Vite 插件，用于在构建时生成 metadata/info.json 文件，并在开发服务器中提供该文件
 * @param {object} metadata - 要写入 JSON 文件的元数据对象
 * @returns {import('rolldown-vite').Plugin} Vite 插件对象
 */
export default function vitePluginMetadata(metadata) {
  return {
    name: 'vite-plugin-metadata',
    configureServer(server) {
      server.middlewares.use('/metadata/info.json', (_, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(metadata, null, 2));
      });
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'metadata/info.json',
        source: JSON.stringify(metadata, null, 2),
      });
    },
  };
}
