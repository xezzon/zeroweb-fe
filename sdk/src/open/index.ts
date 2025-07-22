import { InstanceConfig } from "@/types";
import { createAlova } from "alova";
import adapterFetch from "alova/fetch";
import openapi from "./openapi";
import subscription from "./subscription";
import thirdPartyApp from "./third_party_app";

export default (config: InstanceConfig) => {
  const instance = createAlova({
    ...config,
    requestAdapter: adapterFetch(),
  })

  return {
    /**
     * 对外接口相关接口
     */
    openapi: openapi(instance),
    /**
     * 第三方应用相关接口
     */
    thirdPartyApp: thirdPartyApp(instance),
    /**
     * 第三方应用订阅相关接口
     */
    subscription: subscription(instance),
  }
}

export { OpenapiStatus } from './openapi';
export { SubscriptionStatus } from './subscription';

export type * from './openapi';
export type * from './subscription';
export type * from './third_party_app';
