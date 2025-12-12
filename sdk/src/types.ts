import { AxiosInstance, AxiosResponse, CreateAxiosDefaults } from "axios";

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

export declare type HttpClient = AxiosInstance;
export declare type InstanceConfig = CreateAxiosDefaults;
export declare type PResponse<T> = Promise<AxiosResponse<T>>;
