import type { HttpClient, Id, OData, Page, PResponse } from "@/types";

/**
 * 对外接口状态
 */
export enum OpenapiStatus {
  /**
   * 草稿
   */
  DRAFT = 'DRAFT',
  /**
   * 已发布
   */
  PUBLISHED = 'PUBLISHED',
}

export interface Openapi {
  id: string;
  /**
   * 接口编码
   * 即第三方接口调用的路径
   */
  code: string;
  /**
   * 后端地址
   * 即该接口转发到的后端接口
   */
  destination: string;
  /**
   * 接口请求的HTTP方法
   * 与后端接口的HTTP方法一致
   */
  httpMethod: string;
  /**
   * 对外接口状态
   */
  status: OpenapiStatus,
}

/**
 * 新增开放接口请求
 */
declare type AddOpenapiReq = Omit<Openapi, 'id' | 'status'>;
declare type ModifyOpenapiReq = Omit<Openapi, 'status'>;

export interface OpenapiAPI {
  /**
   * 新增对外接口
   * @param openapi 
   * @returns 
   */
  addOpenapi: (Openapi: AddOpenapiReq) => PResponse<Id>;
  /**
   * 查询对外接口列表（分页）
   * @param odata 分页参数
   * @returns 对外接口列表
   */
  getOpenapiList: (odata: OData) => PResponse<Page<Openapi>>;
  /**
   * 更新对外接口
   * @param openapi 对外接口
   */
  modifyOpenapi: (openapi: ModifyOpenapiReq) => PResponse<void>;
  /**
   * 发布对外接口
   * @param id 对外接口ID
   */
  publishOpenapi: (id: string) => PResponse<void>;
  /**
   * 删除对外接口
   * @param id 对外接口 ID
   */
  deleteOpenapi: (id: string) => PResponse<void>;
}

export default (client: HttpClient): OpenapiAPI => ({
  addOpenapi: (openapi) => client.request({
    url: '/openapi',
    method: 'POST',
    data: openapi,
  }),
  getOpenapiList: (odata) => client.request({
    url: '/openapi',
    method: 'GET',
    params: odata,
  }),
  modifyOpenapi: (openapi) => client.request({
    url: '/openapi',
    method: 'PUT',
    data: openapi,
  }),
  publishOpenapi: (id) => client.request({
    url: `/openapi/${id}/publish`,
    method: 'PUT',
  }),
  deleteOpenapi: (id) => client.request({
    url: `/openapi/${id}`,
    method: 'DELETE',
  }),
})
