## 项目概述

ZeroWeb 是一组可独立部署的微服务及其前端应用。本仓库采用 **pnpm 单仓库（monorepo）** 管理：

- 每个 `apps/*` 目录对应一个可独立构建、独立发布的前端应用。
- `sdk` 提供对 ZeroWeb 后端 HTTP 接口的 TypeScript 封装，作为独立 npm 包发布。
- `packages/*` 存放各应用共享的 React 组件与工具。
- `scripts/*` 存放共享的 lint、TypeScript 配置等工具包。

许可证：应用主体采用 [MulanPSL-2.0](LICENSE)，SDK 采用 [LGPL-3.0-or-later](sdk/LICENSE)。

## 仓库与分支模型

本项目使用**多长期分支 + git worktree** 的工作方式，而不是单一 `main` 分支承载全部代码。

### 长期分支

| 分支 | 用途 | 合并规则 |
|------|------|----------|
| `main` | 维护公共配置：`.github`、`pnpm-workspace.yaml`、`scripts/*` 等 | 禁止任何分支合并入 `main`；`main` 可向 `develop`、`sdk` 合并 |
| `sdk` | 维护 `sdk` 模块 | 允许 `main` 合并入；允许向 `develop` 合并；可触发 release workflow 发布 npm |
| `develop` | 维护公共组件 `packages/*` | 允许 `main`、`sdk` 合并入；允许向 `app/*` 合并 |
| `app/*` | 维护对应应用 `apps/*` | 允许 `develop` 合并入；禁止向任何分支合并；可触发 release workflow 发布 Docker 镜像 |

### 开发分支

格式为 `${分支类型}/issue-${issue 编号}` 或 `${分支类型}/${功能标题}`。分支类型包括 `feature`、`refactor`、`fix`、`build` 等。

开发分支可向任意长期分支提 PR；PR 前与合并前需要基于目标分支 rebase。

## 单仓库结构

```text
zeroweb-fe/
├── apps/                   # 前端应用
│   ├── admin/              # 管理后台（Vite）
│   ├── open/               # 开放门户（Rsbuild）
│   └── docker-compose.yml  # 应用级 Docker Compose（当前为空 services 占位）
├── packages/               # 共享组件/工具
│   ├── auth/               # 认证、登录、权限相关组件
│   ├── dict/               # 字典 hooks
│   ├── layout/             # 布局、菜单、资源上下文
│   └── uuid/               # 自定义 UUIDv8 生成
├── sdk/                    # ZeroWeb SDK（TypeScript，独立发布）
│   ├── src/                # 源码
│   ├── dist/               # 构建产物
│   ├── rslib.config.ts     # Rslib 配置
│   └── package.json
├── scripts/                # 共享配置
│   ├── lint/               # oxlint 配置包 @zeroweb/lint
│   └── tsconfig/           # TypeScript/jsconfig 基础配置 @zeroweb/tsconfig
├── package.json            # 根 package.json（仅引擎约束与 oxlint/oxfmt 依赖）
├── pnpm-workspace.yaml     # workspace 定义 + pnpm catalog 依赖版本
└── .oxfmtrc.json           # oxfmt 格式化配置
```

### 各包说明

| 包名 | 路径 | 类型 | 备注 |
|------|------|------|------|
| `@xezzon/zeroweb-sdk` | `sdk` | 发布包 | LGPL 许可证，发布到 npm |
| `@zeroweb/auth` | `packages/auth` | workspace 私有 | 登录/注册/权限上下文 |
| `@zeroweb/dict` | `packages/dict` | workspace 私有 | `useDict` hook |
| `@zeroweb/layout` | `packages/layout` | workspace 私有 | `MixLayout`、`ResourceContext`、404 |
| `@zeroweb/uuid` | `packages/uuid` | workspace 私有 | UUIDv8 生成器 |
| `@zeroweb/lint` | `scripts/lint` | workspace 私有 | oxlint 配置 |
| `@zeroweb/tsconfig` | `scripts/tsconfig` | workspace 私有 | jsconfig 基础配置 |

## 依赖管理

- 使用 pnpm workspace 与 `workspace:^` 引用兄弟包。
- 公共依赖版本集中在 `pnpm-workspace.yaml` 的 `catalog` 中，包内使用 `"catalog:"` 引用。
- `allowBuilds` 中禁用了 `core-js`，允许 `esbuild` 执行 postinstall 脚本。

## 代码风格与 lint

- **格式化**：使用 [oxfmt](https://oxc.rs/docs/guide/usage/linter.html)，配置位于 `.oxfmtrc.json`：
  - `singleQuote: true`
  - 忽略 `*.md`、`.github/`
- **Lint**：使用 [oxlint](https://oxc.rs/docs/guide/usage/linter.html)，共享配置在 `scripts/lint/`：
  - `.oxlintrc.json`：基础规则（eslint/import/jsdoc/node/oxc/promise/unicorn）
  - `.oxlintrc.react.json`：继承基础 + react/react-perf 插件；关闭 `react/exhaustive-deps`
  - `.oxlintrc.ts.json`：继承基础 + typescript 插件
- 各包通过 `.oxlintrc.json` 继承对应配置，例如 `apps/admin/.oxlintrc.json` 继承 `.oxlintrc.react.json`。

## TypeScript / jsconfig 约定

- 应用与包通常使用 `jsconfig.json` 继承 `@zeroweb/tsconfig/jsconfig.json`。
- 应用内使用 `@/` 路径别名指向 `src/`。
- `apps/admin/jsconfig.json` 额外配置了 `@zeroweb/*` 指向 `node_modules/@zeroweb/*`。
- SDK 使用 `tsconfig.json`，`@/` 指向 `src/`，`isolatedModules` 开启。

## 安全注意事项

- 应用使用浏览器 `localStorage`/`sessionStorage` 存储 access token，注意 XSS 防护。
- 开发时代理插件会把 token/JWK 注入到所有后端请求头，**不要把真实敏感凭证提交到仓库**。
- `.env` 与 `.env.development` 文件被版本控制忽略或视为敏感文件，不要在其中存放生产密钥。
- 后端接口返回的错误码通过 `x-error-code` 头携带，前端根据错误码决定跳转、提示或表单回显。

## 给 AI 代理的实操建议

1. **改完代码后执行对应包的 `pnpm run lint`**，确保通过 oxlint。
2. **不要修改 `pnpm-workspace.yaml` 的 `catalog` 版本** 除非明确需要升级多个包共享的依赖。
3. **新增依赖** 时优先使用 `catalog:`；如果是单个包独占依赖，再直接写版本号。
4. **不要提交 `dist/`、`.env`、IDE/AI 编辑器缓存目录**（已加入 `.gitignore`）。

## Agent skills

### Issue tracker

Issues 和 PRD 均存放在 GitHub Issues（`xezzon/zeroweb-fe`），使用 `gh` CLI 操作。详见 `docs/agents/issue-tracker.md`。

### Triage labels

Triage 使用五个标准状态标签：`needs-triage`、`needs-info`、`ready-for-agent`、`ready-for-human` 和 `wontfix`。详见 `docs/agents/triage-labels.md`。

### Domain docs

Multi-context 布局：根目录 `CONTEXT-MAP.md` 指向 `apps/admin/`、`apps/open/`、`packages/`、`sdk/`、`/` 五个上下文的 `CONTEXT.md`。详见 `docs/agents/domain.md`。
