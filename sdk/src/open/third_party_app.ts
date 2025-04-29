import { HttpClient, OData, Page, PResponse } from "../types";

export const BASE_URL = '/third-party-app'

/**
 * 第三方应用
 */
export interface ThirdPartyApp {
  id: string;
  /**
   * 第三方应用名
   */
  name: string;
  /**
   * 第三方应用所属人
   */
  ownerId: string;
}

/**
 * 第三方应用访问凭据及密钥
 */
export interface AccessSecret {
  id: string;
  /**
   * 应用访问凭据
   */
  accessKey: string;
  /**
   * 应用密钥
   */
  secretKey: string;
}

/**
 * 新增第三方应用请求
 */
declare type AddThirdPartyAppReq = Omit<ThirdPartyApp, 'id' | 'ownerId'>;

export default (client: HttpClient) => ({
  /**
   * 新增第三方应用
   * @param thirdPartyApp 第三方应用
   */
  addThirdPartyApp: (thirdPartyApp: AddThirdPartyAppReq): PResponse<AccessSecret> => client.request({
    url: `${BASE_URL}`,
    method: 'POST',
    data: thirdPartyApp,
  }),
  /**
   * 获取当前用户的所有第三方应用列表（分页）
   * @param odata 分页参数
   * @returns 第三方应用列表
   */
  listMyThirdPartyApp: (odata: OData): PResponse<Page<ThirdPartyApp>> => client.request({
    url: `${BASE_URL}/mine`,
    method: 'GET',
    params: odata,
  }),
  /**
   * 获取所有的第三方应用列表（分页）
   * @param odata 分页参数
   * @returns 第三方应用列表
   */
  listThirdPartyApp: (odata: OData): PResponse<Page<ThirdPartyApp>> => client.request({
    url: `${BASE_URL}`,
    method: 'GET',
    params: odata,
  }),
  /**
   * 刷新应用访问凭据及密钥
   * 旧的密钥将失效
   * @param id 第三方应用ID
   * @returns 新的应用访问凭据及密钥
   */
  rollAccessSecret: (id: string): PResponse<AccessSecret> => client.request({
    url: `${BASE_URL}/${id}/roll`,
    method: 'PATCH',
  })
})
