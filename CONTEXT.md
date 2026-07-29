# app/open SSR 迁移

ZeroWeb 开放门户（`app/open`）从纯客户端渲染 SPA 迁移到 SSR 架构的决策记录与术语定义。

## Language

**SSR 壳（SSR Shell）**:
服务端渲染出的最小 HTML 骨架，包含 `<head>`（title、meta、CSS link）、空的 `#root` 容器和客户端 `<script>` 标签。所有路由（包括静态路由）共享同一套壳，差异仅体现在 `<head>` 级别的标签上。
_Avoid_: SSR HTML, 服务端页面, 骨架屏

**运行时配置注入（Runtime Config Injection）**:
SSR 服务端在渲染 HTML 时，将部署配置（部署路径、后端 API 地址等）序列化为 `window.__ENV__` 注入页面，客户端从 `window.__ENV__` 读取。目的是让同一份构建产物可以部署到任意路径、连接任意后端。
_Avoid_: 环境变量注入, 构建时配置

**客户端环境变量（Client Environment Variable）**:
以 `PUBLIC_` 为前缀、可暴露给浏览器的环境变量（如 `PUBLIC_ADMIN_API`、`PUBLIC_APP_TITLE`）。开发环境通过 Rsbuild `source.define` 静态替换（支持 HMR），生产环境由 SSR 服务端预先写入 `window.__ENV__`。客户端用 Rsbuild 内置的 `import.meta.env.DEV`/`PROD` 区分环境并选择读取路径。
_Avoid_: 前端环境变量, 构建时变量

**服务端环境变量（Server Environment Variable）**:
无前缀、仅在服务端使用的环境变量（如 `PORT`、`TOKEN`、`JWK`）。无论开发还是生产，都通过 `process.env.[name]` 读取，不进入客户端产物。
_Avoid_: 后端环境变量, 私有变量

**`__ENV__`**:
`window.__ENV__` 对象，直接以定义的环境变量名为键写入客户端环境变量（如 `PUBLIC_ADMIN_API`、`PUBLIC_OPEN_API`），并附带部署路径 `BASE_URL`。字段值可以是相对路径（走 SSR 代理转发）或完整 URL（浏览器直连）。
_Avoid_: CONFIG, __BASE_URL__

**客户端独占渲染（Client-Only Rendering）**:
Ant Design 组件、i18n 翻译、动态路由全部在客户端渲染，不参与服务端 SSR。服务端只渲染极简壳，客户端 hydration 后完全接管。用 `<ClientOnly>` 组件包裹敏感组件，确保服务端不触碰浏览器 API。
_Avoid_: 客户端渲染, SPA, CSR

**BFF（Backend For Frontend）**:
SSR 服务器（开发用 Rsbuild custom server，生产用 Hono）承担 API 代理转发职责。当 `__ENV__.PUBLIC_ADMIN_API`/`PUBLIC_OPEN_API` 为相对路径时，浏览器请求先到 SSR 服务器，由中间件注入 auth header 后转发到后端。
_Avoid_: 网关, API 代理, 反向代理
