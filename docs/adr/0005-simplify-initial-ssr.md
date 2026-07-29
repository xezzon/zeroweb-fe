# 简化 SSR 初期实现：同步渲染且不生成 manifest

## Context

SSR 迁移的第一阶段目标是尽快跑通"壳渲染 + 运行时配置注入 + 双端构建 + Node 部署"的完整链路。Rsbuild 官方 SSR 示例默认通过 manifest 注入带 content hash 的资源引用，React 18+ 官方推荐 `renderToPipeableStream` 流式输出；两者都会增加初期实现与调试成本。

## Decision

1. 不生成 `dist/manifest.json`。客户端资源在 HTML 模板中以固定路径引用，SSR 服务端不再运行时解析 manifest。
2. 使用 `renderToString` 同步渲染 SSR 壳，替代 `renderToPipeableStream` 流式渲染。

## Rationale

- 初期 SSR 壳几乎没有实质内容，流式渲染的 TTFB 收益微乎其微；`renderToString` 更简单，失败时抛错路径也更直接
- manifest 的价值在于自动注入带 content hash 的文件名，初期关闭 content hash、改用固定文件名即可，省掉一个解析与拼接环节
- 两者都是"渐进式增强"下的可逆取舍：当壳中内容变多、需要按 hash 注入资源或提前流式输出时，再单独升级
