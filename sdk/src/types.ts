import type { AxiosInstance, AxiosResponse, CreateAxiosDefaults } from 'axios';

/**
 * @see {@link https://docs.oasis-open.org/odata/odata/v4.01/cs01/abnf/odata-abnf-construction-rules.txt | OData ABNF Construction Rules Version 4.01}
 */
export interface OData {
  /**
   * 分页大小
   */
  top: number;
  /**
   * 偏移量
   * (页码 - 1) * 分页大小
   * 页码从1开始
   */
  skip: number;
}

/**
 * 分页
 */
export interface Page<T> {
  /**
   * 数据列表
   */
  content: T[];
  /**
   * 分页信息
   */
  page: {
    /**
     * 分页大小
     */
    size: number;
    /**
     * 页码
     */
    number: number;
    /**
     * 总数据量
     */
    totalElements: number;
    /**
     * 总页数
     */
    totalPages: null;
  };
}

export interface Id {
  id: string;
}

export interface ErrorResult {
  /**
   * 错误码
   */
  code: string;
  /**
   * 服务端的错误描述
   */
  message: string;
  /**
   * 用于消息插值的参数。
   */
  parameters: Record<string, any>;
  /**
   * 有关导致该报告错误的具体错误的详细信息数组。
   */
  details?: ErrorResult[];
}

export enum ErrorSource {
  NETWORK = 1,
  INFRA = 2,
  INTERNAL = 3,
  BAD_REQUEST = 4,
}

export interface StructuredError {
  /**
   * 异常原因
   */
  source: ErrorSource;
  /**
   * 错误码
   */
  errorCode?: string;
  /**
   * 提示信息。
   * 包含错误码（`C0005`例外）的 4xx 响应该字段不为 null。
   * @deprecated 该字段为临时字段。后续将采用 errorCode + 国际化的方式获取提示信息
   */
  notification?: string;
  /**
   * 错误相关的信息。可用于国际化。
   * 包含错误码的 4xx 响应该字段不为 null。
   */
  parameters?: Record<string, any>;
  /**
   * 错误详细原因
   * 错误码为 `C0005` 的响应该字段不为 null
   */
  details?: ErrorResult[];
}

export declare type HttpClient = AxiosInstance;
export declare type InstanceConfig = CreateAxiosDefaults;
export declare type PResponse<T> = Promise<AxiosResponse<T>>;
