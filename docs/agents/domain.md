# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`CONTEXT-MAP.md`** at the repo root — it points at one `CONTEXT.md` per context. Read each one relevant to the topic.
- **`docs/adr/`** — read ADRs that touch the area you're about to work in. Also check context-scoped `docs/adr/` directories in each context.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates them lazily when terms or decisions actually get resolved.

## File structure

Multi-context repo:

```
/
├── CONTEXT-MAP.md          ← maps context names to their directories
├── docs/adr/               ← repo-wide decisions (lint, CI, workspace config)
├── apps/
│   ├── admin/
│   │   ├── CONTEXT.md      ← admin 应用领域概念
│   │   └── docs/adr/       ← admin 专属决策
│   └── open/
│       ├── CONTEXT.md      ← open 应用领域概念
│       └── docs/adr/       ← open 专属决策
├── packages/
│   └── CONTEXT.md          ← 共享组件领域概念
├── sdk/
│   ├── CONTEXT.md          ← SDK 领域概念
│   └── docs/adr/           ← SDK 专属决策
└── scripts/
```

上下文的划分：

| 上下文 | 路径 | 说明 |
|--------|------|------|
| `admin` | `apps/admin/` | 管理后台应用 |
| `open` | `apps/open/` | 开放门户应用 |
| `packages` | `packages/` | 共享 React 组件与工具（auth、dict、layout、uuid） |
| `sdk` | `sdk/` | ZeroWeb TypeScript SDK |
| `root` | `/` | 仓库级公共配置（scripts、CI、workspace） |

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal — either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0007 (event-sourced orders) — but worth reopening because…_
