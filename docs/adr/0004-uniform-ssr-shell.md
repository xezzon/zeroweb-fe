# 统一 SSR 壳替代按路由差异化渲染

## Context

SSR 的目标之一是 SEO 和 FCP 优化。理想情况下每个路由应渲染各自的 `<title>`、`<meta>` 和初始内容。但 `app/open` 的页面内容几乎全是 Ant Design 组件（全走客户端渲染），且动态路由的菜单数据来自后端 API（保持客户端加载）。

## Decision

所有路由（包括 `/login`、`/register`、`/`）共用同一个 SSR HTML 壳。差异仅体现在 `<head>` 中的 `<title>` 和 `<meta>` 标签上。页面内容在客户端 hydration 后完全接管。

## Rationale

- Ant Design 全客户端渲染意味着任何路由的 SSR 内容都几乎为空，按路由差异化渲染没有实际收益
- 动态路由（`/:_id/member` 等）的服务端数据预取列为后续 TODO，当前保持客户端加载
- `<head>` 级别的差异化通过服务端在模板中替换 `<!--app-title-->` 实现，成本极低
- 未采用"尽量 SSR 非 Ant Design 部分"方案（如包裹 `<ClientOnly>` 但保留兄弟节点 HTML），因为页面内容 99% 是 Ant Design 组件，几乎无 SSR 价值
- 未来如需要按路由 SSR 内容，只需在服务端入口扩展路由匹配逻辑，壳结构不变
