# 使用 Rsbuild SSR 替代 React Router v7 框架模式

## Context

`app/open` 需要从纯客户端渲染 SPA 迁移到 SSR。React Router v7 框架模式（内置 loader/action + Vite 构建）和 Next.js 是生态更成熟的选项，Rsbuild 的 SSR 支持相对较新。

## Decision

选择 Rsbuild 的 SSR 能力（`environments` 配置 + `target: 'web' | 'node'`），而非 React Router v7 框架模式或 Next.js。

## Rationale

- Rsbuild 是团队现有工具链，切换到 Vite/Next.js 意味着重写构建配置、代理插件、metadata 插件等
- 项目已有的 Rsbuild 插件（`auth-proxy-plugin`、`metadata-plugin`）可直接复用或少量改造
- 参考 [Rsbuild 官方文档](https://rsbuild.rs/zh/guide/advanced/ssr)。
- React Router v7 框架模式要求用 `loader`/`action` 重写路由层，现有 `createBrowserRouter` + 动态菜单加载的代码路径改动大
- SSR 需求定位为"渐进式增强"——先出壳，后续逐步增加服务端渲染内容，Rsbuild 的灵活性适合这种演进路径
