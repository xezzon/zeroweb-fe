/// <reference types="vite/client" />

interface ImportMetaEnv {
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare namespace NodeJS {
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
