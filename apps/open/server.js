const path = require('path');
const fsp = require('fs/promises');
const express = require('express');

function resolve(p) {
  return path.resolve(__dirname, p);
}

// 创建一个Node生产服务端
async function createServer() {
  let app = express();
  // 为客户端打包产物提供静态文件服务，也可以将客户端构建部署到CDN或单独的开发服务器，按照你的需求。
  app.use(express.static(resolve('build')));
  // 监听 '/' 路由, 你也可以将其替换为你需要的路由.
  app.use('/', async (req, res) => {
    let url = req.originalUrl;

    try {
      let template;
      let render;

      // 加载客户端html
      template = await fsp.readFile(resolve('build/index_client.html'), 'utf8');
      // 加载服务端渲染函数
      const serverEntry = resolve('dist/index.js');
      render = require(serverEntry);

      // 将应用渲染为标记
      const renderedHtml = render(url);
      let html = template.replace('<!--ssr-outlet-->', renderedHtml);

      // 返回包含客户端打包的rendered html
      // 客户端打包代码和服务器渲染的标记进行水和作用，
      // 并使其具有交互性
      res.setHeader('Content-Type', 'text/html');
      return res.status(200).end(html);
    } catch (error) {
      console.log(error.stack);
      res.status(500).end(error.stack);
    }
  });

  return app;
}

createServer().then((app) => {
  const port = process.env.FARM_DEFAULT_SERVER_PORT || 3000;
  app.listen(port, () => {
    console.log('HTTP server is running at http://localhost:' + port);
  });
});
