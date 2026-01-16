import type { HttpClient, Id, OData, Page, PResponse } from "../types";
import type { Openapi } from "./openapi";
import { BASE_URL as THIRD_PARTY_APP_URL } from './third_party_app';

const BASE_URL = '/subscription'

/**
 * 订阅状态
 */
export enum SubscriptionStatus {
  /**
   * 未订阅
   */
  NONE = 'NONE',
  /**
   * 审核中
   */
  AUDITING = 'AUDITING',
  /**
   * 已订阅
   */
  SUBSCRIBED = 'SUBSCRIBED',
}

/**
 * 对外接口订阅状态
 */
export interface Subscription {
  id?: string;
  /**
   * 第三方应用标识
   */
  appId: string;
  /**
   * 对外接口编码
   */
  openapiCode?: string;
  /**
   * 订阅状态
   */
  subscriptionStatus: string;
  /**
   * 对外接口详情
   */
  openapi: Openapi,
}

/**
 * 新增订阅请求
 */
declare type AddSubscriptionReq = Omit<Subscription, 'id' | 'subscriptionStatus' | 'openapi'>

export interface SubscriptionAPI {
  /**
   * 订阅对外接口
   * @param subscription 接口订阅信息
   */
  subscribe: (subscription: AddSubscriptionReq) => PResponse<Id>;
  /**
   * 查询应用订阅列表
   * @param appId 应用ID
   * @param odata 分页查询参数
   * @returns 订阅列表
   */
  listSubscription: (appId: string, odata: OData) => PResponse<Page<Subscription>>;
  /**
   * 审核订阅
   * 审核后第三方应用即可调用该接口
   * @param id 订阅标识
   */
  auditSubscription: (id: string) => PResponse<void>;
}

export default (client: HttpClient): SubscriptionAPI => ({
  subscribe: (subscription) => client.request({
    url: `${BASE_URL}`,
    method: 'POST',
    data: subscription,
  }),
  listSubscription: (appId, odata) => client.request({
    url: `${THIRD_PARTY_APP_URL}/${appId}/subscription`,
    method: 'GET',
    params: odata,
  }),
  auditSubscription: (id) => client.request({
    url: `${BASE_URL}/${id}/audit`,
    method: 'PUT',
  }),
})