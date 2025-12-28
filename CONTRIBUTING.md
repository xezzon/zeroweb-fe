# 开发者手册

## 项目结构说明

- `sdk`: 
- `packages/*`: 
- `apps/*`: 
- `scripts/*`: 

## 常规分支说明

本项目包含以下常规分支：

- `main`: 用于维护公共配置，包括 `.github`、`pnpm-workspace.yaml`等文件，以及 `scripts` 模块。禁止任何分支向 `main` 分支合并；`main` 分支可以向 `develop`、`sdk` 分支合并。
- `sdk`: 用于维护 `sdk` 模块。允许 main 分支向 `sdk` 分支合并；允许 `sdk` 分支向 `develop` 分支合并。
- `develop`: 用于维护公共组件，即 `packages` 模块。允许 `main`、`sdk` 分支向 `develop` 分支合并；允许 `develop` 分支向 `app/*` 分支合并。
- `app/*`: 用于维护对应的应用，即 `apps/*` 模块。允许 develop 分支向 app/* 分支合并，禁止 `app/*` 向任何分支合并。

## 开发分支说明

开发分支的格式为 `${分支类型}/issue-${issue 编号}` 或 `${分支类型}/${功能标题}`。

分支类型包括 `feature`、`refactor`、`fix`、`build` 等。

开发分支可以向所有常规分支 PR，在 PR 前与合并前，需要基于目标分支进行 rebase。
