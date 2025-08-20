# 项目结构

## 根目录组织

```
zeroweb/
├── apps/           # 微服务应用
├── packages/       # 共享包和库
├── sdk/           # TypeScript SDK 客户端集成
├── scripts/       # 构建工具和配置
└── node_modules/  # 依赖项
```

## 主要目录

### `/apps/` - 微服务
- 包含可独立部署的应用程序
- 每个应用都有自己的 Dockerfile 用于容器化
- `docker-compose.yml` 编排服务部署
- 示例：`apps/admin/` - 管理服务

### `/packages/` - 共享库
- 可重用的组件和工具
- `packages/auth/` - 认证工具
- `packages/layout/` - UI 布局组件

### `/sdk/` - 客户端 SDK
- **结构**: `src/` → `dist/` (ESM, CJS, typings)
- **包名**: `@xezzon/zeroweb`
- **导出**: 双包格式包含 TypeScript 声明文件
- **构建输出**: 
  - `dist/esm/` - ES 模块
  - `dist/cjs/` - CommonJS 模块  
  - `dist/typings/` - TypeScript 声明文件

### `/scripts/` - 构建配置
- `scripts/oxlint-config/` - 代码检查配置
- `scripts/typescript-config/` - TypeScript 构建设置

## 文件约定

### 配置文件
- `.npmrc` - npm 注册表配置
- `pnpm-workspace.yaml` - 工作空间包定义
- `.dockerignore` - Docker 构建排除项
- `.gitignore` - Git 排除项

### TypeScript 配置
- 路径映射：`@/*` → `src/*`
- 启用严格模式
- ES6 目标配合 Node.js 解析

## 工作空间依赖

内部依赖使用 pnpm 工作空间协议：
```json
"@zeroweb/oxlint-config": "workspace:^"
```

## 命名约定

- **包名**: 使用 `@xezzon/` 或 `@zeroweb/` 作用域
- **目录**: 应用使用 kebab-case，包使用 camelCase
- **文件**: 遵循 TypeScript/JavaScript 约定