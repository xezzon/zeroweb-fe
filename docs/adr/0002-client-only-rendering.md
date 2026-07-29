# Ant Design 组件全部走客户端渲染

## Context

SSR 场景下 Ant Design v6 的 CSS-in-JS 需要在服务端提取样式注入 HTML（`extractStyle()`），且 `Modal`、`Dropdown` 等组件依赖浏览器 API（`document`、`window`），会导致 hydration mismatch。

## Decision

所有 Ant Design 组件不参与服务端渲染，用 `<ClientOnly>` 包裹使其只在客户端执行。服务端渲染的 HTML 壳中不包含任何 Ant Design 组件输出。

## Rationale

- 避免处理 CSS-in-JS 样式提取、水合不匹配等 SSR 兼容问题
- 实现最简单，与现有纯 SPA 代码行为一致——所有 Ant Design 代码无需改动
- SSR 的价值保留在 `<head>` 级别（title、meta、CSS link），而非组件内容
- 代价是首屏 SSR 没有实质内容——但这符合"渐进式增强"策略，后续可逐个组件放开 SSR
- 未采用 Ant Design 官方推荐的 `extractStyle()` + 延迟水合敏感组件方案，因为该方案实现复杂且首屏 SSR 收益有限
