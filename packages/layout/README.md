# @zeroweb/layout

ZeroWeb 项目的布局组件包，提供完整的页面布局解决方案。

## 概述

本包提供了基于 Ant Design Pro Layout 的现代化布局组件，包括：

- **MixLayout**: 混合布局组件，支持顶部导航 + 侧边栏的经典后台布局
- **ResourceContextProvider**: 资源上下文提供者，管理菜单和路由
- **NotFoundPage**: 404 错误页面组件

## 特性

- 🎨 基于 Ant Design Pro Layout，界面美观专业
- 🔧 支持动态菜单和路由配置
- 📱 响应式设计，适配各种屏幕尺寸
- 🚀 支持隐藏菜单模式
- 🔗 支持外部链接和嵌入页面
- ⚡ 懒加载模块，提升性能
- 🌲 支持多级菜单结构

## 使用方法

### 1. 基本使用

```jsx
import React from 'react';
import { ResourceContextProvider } from '@zeroweb/layout';

const resources = [
  {
    id: 'dashboard',
    name: '仪表盘',
    path: '/dashboard',
    type: 'ROUTE',
    route: 'Dashboard',
    icon: 'dashboard'
  }
];

const modules = {
  './routes/Dashboard.jsx': () => import('./routes/Dashboard')
};

const rootRoutes = [
  {
    path: '/',
    layout: 'MixLayout',
    children: []
  }
];

function App() {
  return (
    <ResourceContextProvider 
      resources={resources}
      modules={modules}
      rootRoutes={rootRoutes}
    >
      {/* 应用内容 */}
    </ResourceContextProvider>
  );
}
```

### 2. 使用 MixLayout 组件

```jsx
import React from 'react';
import { MixLayout } from '@zeroweb/layout';

export default function AppLayout() {
  return (
    <MixLayout title="我的应用">
      {/* 页面内容 */}
    </MixLayout>
  );
}
```

### 3. 使用 404 页面

```jsx
import React from 'react';
import { NotFoundPage } from '@zeroweb/layout';

function NotFound() {
  return <NotFoundPage home="/" />;
}
```

## API 文档

### MixLayout

混合布局组件，提供完整的后台管理布局。

#### 属性

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| title | string | - | 布局标题 |

#### 功能特性

- **菜单隐藏**: 当 URL 包含 `?hideMenu=true` 参数时，隐藏菜单栏
- **自动路由**: 基于当前路径自动高亮对应的菜单项
- **外部链接**: 自动为外部链接设置 `target="_blank"`
- **响应式**: 自适应不同屏幕尺寸

### ResourceContextProvider

资源上下文提供者，负责管理应用的菜单和路由配置。

#### 属性

| 属性名 | 类型 | 必需 | 描述 |
|--------|------|------|------|
| children | React.ReactElement | 是 | 子组件 |
| resources | MenuInfo[] | 是 | 菜单资源配置 |
| modules | Record<string, () => Promise> | 是 | 路由模块映射 |
| rootRoutes | RouteObject[] | 是 | 根路由配置 |

#### MenuInfo 类型定义

```typescript
interface MenuInfo {
  id: string;           // 菜单唯一标识
  name: string;         // 菜单名称
  path: string;         // 菜单路径
  type: 'ROUTE' | 'EXTERNAL_LINK' | 'EMBEDDED' | 'GROUP'; // 菜单类型
  route?: string;       // 路由组件名称 (ROUTE 类型)
  icon?: string;        // 菜单图标
  parent?: string;      // 父菜单路径
  layout?: string;      // 使用的布局组件
}
```

#### 菜单类型说明

- **ROUTE**: 内部路由，会加载对应的 React 组件
- **EXTERNAL_LINK**: 外部链接，在新窗口打开
- **EMBEDDED**: 嵌入页面，使用 iframe 加载
- **GROUP**: 菜单分组，不对应具体页面

### NotFoundPage

404 错误页面组件。

#### 属性

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| home | string | '/' | 返回首页的链接地址 |

## 高级用法

### 1. 多级菜单配置

```jsx
const resources = [
  {
    id: 'system',
    name: '系统管理',
    path: '/system',
    type: 'GROUP',
    icon: 'setting'
  },
  {
    id: 'users',
    name: '用户管理',
    path: '/system/users',
    type: 'ROUTE',
    route: 'Users',
    parent: '/system',
    icon: 'user'
  },
  {
    id: 'roles',
    name: '角色管理',
    path: '/system/roles',
    type: 'ROUTE',
    route: 'Roles',
    parent: '/system',
    icon: 'team'
  }
];
```

### 2. 嵌入外部页面

```jsx
const resources = [
  {
    id: 'monitor',
    name: '系统监控',
    path: '/monitor',
    type: 'EMBEDDED',
    route: 'https://monitor.example.com',
    icon: 'monitor'
  }
];
```

### 3. 外部链接配置

```jsx
const resources = [
  {
    id: 'docs',
    name: '文档中心',
    path: 'https://docs.example.com',
    type: 'EXTERNAL_LINK',
    icon: 'book'
  }
];
```

### 4. 自定义布局

```jsx
const rootRoutes = [
  {
    path: '/',
    layout: 'MixLayout',
    children: []
  },
  {
    path: '/auth',
    layout: 'AuthLayout',
    children: []
  }
];
```

## 样式自定义

MixLayout 支持通过 CSS 变量或内联样式进行自定义：

```jsx
<MixLayout 
  title="自定义样式"
  style={{
    height: 'calc(100vh - 16px)',
    '--primary-color': '#1890ff' // 自定义主题色
  }}
/>
```

## 性能优化

1. **懒加载**: 路由组件通过 `lazy()` 实现懒加载，减少初始包大小
2. **菜单缓存**: 菜单数据通过 `useMemo` 缓存，避免重复计算
3. **条件渲染**: 支持隐藏菜单模式，减少不必要的 DOM 渲染

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 常见问题

### Q: 如何隐藏菜单栏？
A: 在 URL 中添加 `?hideMenu=true` 参数即可隐藏菜单栏。

### Q: 如何添加自定义菜单图标？
A: 在 MenuInfo 对象中设置 `icon` 属性，图标名称需要与 Ant Design 图标库对应。

### Q: 如何实现多布局？
A: 在 `rootRoutes` 中配置不同的 `layout` 属性，并在对应的路由配置中指定使用的布局。
