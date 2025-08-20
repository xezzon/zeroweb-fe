# 技术栈

## 构建系统与包管理

- **包管理器**: pnpm (>=8.7) - 使用工作空间进行 monorepo 管理
- **Node.js**: 需要 >=18.12 版本
- **Monorepo**: pnpm 工作空间，包含 `apps/*`、`sdk`、`packages/*`、`scripts/*`

## 核心技术

- **TypeScript**: 主要编程语言，采用严格配置
- **Docker**: 微服务容器化部署
- **Axios**: SDK 中使用的 HTTP 客户端库

## 开发工具

- **代码检查**: oxlint 配合自定义配置 (`@zeroweb/oxlint-config`)
- **TypeScript 编译器**: `scripts/typescript-config` 中的自定义配置
- **构建工具**: tsc-alias 用于路径映射解析

## 常用命令

### SDK 开发
```bash
# 构建 SDK (ESM 和 CJS 两种格式)
cd sdk && npm run build

# 仅构建 ESM 格式
cd sdk && npm run build:esm

# 仅构建 CommonJS 格式
cd sdk && npm run build:cjs

# 检查 SDK 代码
cd sdk && npm run lint
```

### Docker 操作
```bash
# 构建特定服务
cd apps && docker compose build <service-name>
```

### 包管理
```bash
# 安装依赖 (从根目录)
pnpm install

# 为特定工作空间添加依赖
pnpm add <package> --filter <workspace-name>
```

## 构建配置

- **SDK 导出**: 双包格式 (ESM/CJS) 包含 TypeScript 声明文件
- **路径映射**: 使用 `@/*` 别名指向 `src/*`
- **编译目标**: ES6 配合 Node.js 模块解析