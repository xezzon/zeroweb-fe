/// <reference types="vite/client" />

/**
 * 运行时客户端环境变量
 */
interface RuntimeEnvironmentVariable {
  /**
   * 后台管理服务API地址
   */
  readonly ZEROWEB_SERVICE_ADMIN: string;
  /**
   * 开放平台服务API地址
   */
  readonly ZEROWEB_SERVICE_OPEN: string;
}
declare const __ENV__: RuntimeEnvironmentVariable;

/**
 * 构建时环境变量
 */
interface ImportMetaEnv {
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare namespace NodeJS {
  /**
   * 运行时服务器环境变量
   */
  interface ProcessEnv {
    /**
     * 当前运行环境
     */
    readonly NODE_ENV: string;
    /**
     * 网站标题
     */
    readonly TITLE: string;
    /**
     * 访问网站的基础路径
     */
    readonly BASE: string;
    /**
     * 端口号
     */
    readonly PORT: number;
  }
}
