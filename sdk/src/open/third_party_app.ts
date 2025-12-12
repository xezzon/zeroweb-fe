import { HttpClient, Id, OData, Page, PResponse } from "@/types";

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
 * 第三方应用成员
 */
export interface ThirdPartyAppMember {
  /**
   * 第三方应用成员ID
   */
  id: string;
  /**
   * 第三方应用ID
   */
  groupId: string;
  /**
   * 用户ID
   */
  userId: string;
  /**
   * 角色ID
   */
  roleId: string;
  /**
   * 成员加入第三方应用的时间
   */
  createTime: string;
}

/**
 * 新增第三方应用请求
 */
declare type AddThirdPartyAppReq = Omit<ThirdPartyApp, 'id' | 'ownerId'>;

export interface ThirdPartyAppAPI {
  /**
   * 新增第三方应用
   * @param thirdPartyApp 第三方应用
   */
  addThirdPartyApp: (thirdPartyApp: AddThirdPartyAppReq) => PResponse<AccessSecret>;
  /**
   * 获取当前用户的所有第三方应用列表（分页）
   * @param odata 分页参数
   * @returns 第三方应用列表
   */
  listMyThirdPartyApp: (odata: OData) => PResponse<Page<ThirdPartyApp>>;
  /**
   * 获取所有的第三方应用列表（分页）
   * @param odata 分页参数
   * @returns 第三方应用列表
   */
  listThirdPartyApp: (odata: OData) => PResponse<Page<ThirdPartyApp>>;
  /**
   * 刷新应用访问凭据及密钥
   * 旧的密钥将失效
   * @param id 第三方应用ID
   * @returns 新的应用访问凭据及密钥
   */
  rollAccessSecret: (id: string) => PResponse<AccessSecret>;
  /**
   * 生成邀请码，持有者可凭借邀请码在有效期内成为第三方应用成员。
   * @param appId 第三方应用ID
   * @param timeout 邀请码有效期。单位：小时。默认为 24 小时。
   * @returns 邀请码
   */
  inviteMember: (appId: string, timeout?: number) => PResponse<String>;
  /**
   * 邀请用户成为第三方应用成员
   * @param appId 第三方应用ID
   * @param userId 用户ID
   * @param timeout 邀请码有效期。单位：小时。默认为 24 小时。
   * @returns 邀请码
   */
  inviteParticularMember: (appId: string, userId: string, timeout?: number) => PResponse<String>;
  /**
   * 持邀请码成为第三方应用成员
   * @param token 邀请码
   * @returns 成员ID。注意：该 ID 不是用户的 ID。
   */
  addThirdPartyAppMember: (token: string) => PResponse<Id>;
  /**
   * 查询第三方应用的成员
   * @param appId 第三方应用
   * @returns 第三方应用成员列表
   */
  listThirdPartyAppMember: (appId: string) => PResponse<ThirdPartyAppMember[]>;
  /**
   * 第三方应用所有权转移
   * @param appId 第三方应用ID
   * @param userId 用户ID
   */
  moveOwnerShip: (appId: string, userId: string) => PResponse<void>;
}

export default (client: HttpClient): ThirdPartyAppAPI => ({
  addThirdPartyApp: (thirdPartyApp: AddThirdPartyAppReq) => client.request<AccessSecret>({
    url: `${BASE_URL}`,
    method: 'POST',
    data: thirdPartyApp,
  }),
  listMyThirdPartyApp: (odata: OData) => client.request<Page<ThirdPartyApp>>({
    url: `${BASE_URL}/mine`,
    method: 'GET',
    params: odata,
  }),
  listThirdPartyApp: (odata: OData) => client.request<Page<ThirdPartyApp>>({
    url: `${BASE_URL}`,
    method: 'GET',
    params: odata,
  }),
  rollAccessSecret: (id: string) => client.request<AccessSecret>({
    url: `${BASE_URL}/${id}/roll`,
    method: 'PATCH',
  }),
  inviteMember: (appId, timeout) => client.request({
    url: `/third-party-app/${appId}/member`,
    method: 'POST',
    params: { timeout, },
  }),
  inviteParticularMember: (appId, userId, timeout) => client.request({
    url: `/third-party-app/${appId}/member`,
    method: 'POST',
    params: { userId, timeout, },
  }),
  addThirdPartyAppMember: (token) => client.request({
    url: `/third-party-app/-/member`,
    method: 'PUT',
    params: { token, },
  }),
  listThirdPartyAppMember: (appId) => client.request({
    url: `/third-party-app/${appId}/member`,
    method: 'GET',
  }),
  moveOwnerShip: (appId, userId) => client.request({
    url: `/third-party-app/${appId}/owner`,
    method: 'PATCH',
    params: { userId, },
  }),
})
