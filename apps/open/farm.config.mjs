import path from 'path';

/**
 * @type {import('@farmfe/core').UserConfig}
 */
export default {
  compilation: {
    input: {
      index_client: './index.html'
    },
    output: {
      path: './build'
    },
  },
  server: {
    hmr: true,
    cors: true,
    middlewares: [
      // 注册一个中间件，在服务端渲染应用，
      // 然后注入到服务器渲染的标记并返回最终的index.html
      (server) => {
        server.app().use(async (ctx, next) => {
          await next();
          console.log('ctx.path outer', ctx.path);

          // 处理index.html或单页面应用路由设置
          if (!(ctx.path === '/' || ctx.status === 404)) {
            return;
          }
          // 加载服务端入口，并通过ctx.path渲染
          const moudlePath = path.join(
            path.dirname(import.meta.url),
            'dist',
            'index.js'
          );
          const render = await import(moudlePath).then((m) => m['default']);
          const renderedHtml = render(ctx.path);

          // 通过server.getCompiler()获取编译的index.html内容
          // 这里的html经过编译并注入了所有客户端bundles文件
          const template = server
            .getCompiler()
            .resource('index_client.html')
            .toString();
          const html = template.replace(
            '<!--ssr-outlet-->',
            renderedHtml
          );
          ctx.body = html;
          ctx.type = 'text/html';
          ctx.status = 200;
        });
      }
    ]
  },
  plugins: ['@farmfe/plugin-react']
};
