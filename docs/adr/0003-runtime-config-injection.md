# 运行时配置注入与客户端/服务端环境变量约定

## Context

部署路径（base path）和后端 API 地址是运维参数，不应在构建时固化进产物。同时环境变量天然分为两类：能暴露给浏览器的客户端变量，和只能在服务端使用的服务端变量（含密钥）。两者必须显式区分，避免把代理认证用的 `TOKEN`、`JWK` 等泄露到客户端 bundle。

## Decision

1. **运行时配置注入**：SSR 服务端渲染 HTML 时，将部署路径 `BASE_URL` 与客户端环境变量（如 `PUBLIC_ADMIN_API`、`PUBLIC_OPEN_API`）直接序列化为 `window.__ENV__` 注入页面，键名与定义的环境变量名一致，客户端从 `window.__ENV__` 读取。
2. **客户端环境变量约定以 `PUBLIC_` 为前缀**（如 `PUBLIC_ADMIN_API`、`PUBLIC_APP_TITLE`）：
   - 开发环境：通过 Rsbuild 的 `source.define` 完成静态替换，支持 HMR。
   - 生产环境：不参与构建时替换，由 SSR 服务端预先写入 `window.__ENV__`。
   - 客户端使用 Rsbuild 内置的 `import.meta.env.DEV` / `import.meta.env.PROD` 区分开发/生产，从而选择读取 `import.meta.env.PUBLIC_*`（开发）还是 `window.__ENV__`（生产）。
3. **服务端环境变量无前缀**（如 `PORT`、`TOKEN`、`JWK`）：无论开发还是生产，一律通过 `process.env.[name]` 使用，不进入客户端产物。
4. 环境变量支持**系统环境变量**与 **dotenv 文件**两种来源，由 Rsbuild `loadEnv` 统一读取。

## Rationale

- 同一份构建产物可部署到任意路径（`/open/`、`/portal/` 等）、连接任意后端，不需要为每个环境重新构建镜像
- `Dockerfile` 中不再包含 `ARG BASE_URI` / `ARG BASE_URL`，环境变量在运行时通过 `docker-compose.yml` 注入
- `PUBLIC_` 前缀是"可暴露给客户端"的显式边界：开发时静态替换保证 HMR 体验，生产时运行时注入保证配置可变，语义一致而实现不同
- 服务端变量只经 `process.env` 读取，天然不会被打包进客户端 bundle，降低密钥泄露风险
- 代价是客户端代码需要区分读取入口：开发用静态替换，生产用 `window.__ENV__`，多一层间接
- `__ENV__` 中的 `PUBLIC_ADMIN_API`/`PUBLIC_OPEN_API` 支持相对路径（走 SSR 代理转发）和完整 URL（浏览器直连），由 SSR 中间件自动判断
