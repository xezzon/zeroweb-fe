# ZeroWeb SDK

ZeroWeb SDK 是一个用于与 ZeroWeb 微服务进行交互的 TypeScript 客户端库，提供了完整的 API 封装和类型支持。

## 功能特性

- **🔧 模块化设计**: 支持按需使用不同功能模块
- **📝 完整类型支持**: 基于 TypeScript 的强类型定义
- **🔄 拦截器支持**: 提供请求/响应拦截器功能
- **📦 多种模块格式**: 支持 CommonJS 和 ES Module
- **🛡️ 类型安全**: 完整的类型定义和接口约束

## 安装

### npm

```bash
npm install @xezzon/zeroweb-sdk
```

### pnpm

```bash
pnpm add @xezzon/zeroweb-sdk
```

### yarn

```bash
yarn add @xezzon/zeroweb-sdk
```

## 快速开始

### 基础配置

```typescript
import { 
  ZerowebAdminClient,
  ZerowebMetadataClient,
  ZerowebOpenClient,
  ZerowebFileClient,
  ZerowebDevClient
} from '@xezzon/zeroweb-sdk';

// 基础配置
const config = {
  baseURL: 'https://your-api-domain.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
};

// 创建客户端实例
const adminClient = ZerowebAdminClient(config);
const metadataClient = ZerowebMetadataClient(config);
const openClient = ZerowebOpenClient(config);
const fileClient = ZerowebFileClient(config);
const devClient = ZerowebDevClient(config);
```

### 添加请求拦截器

```typescript
// 添加请求拦截器
adminClient.interceptors.request.use((config) => {
  // 添加认证 token
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 添加响应拦截器
adminClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 处理未授权错误
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## 许可证

SDK 部分采用 [LGPL-3.0 license](https://www.gnu.org/licenses/lgpl-3.0.html)。
