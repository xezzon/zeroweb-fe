import axios from "axios";
import { InstanceConfig } from "@/types";
import openapi from "./openapi";
import thirdPartyApp from "./third_party_app";

export default (config: InstanceConfig) => {
  const instance = axios.create(config)

  return {
    /**
     * 拦截器方法
     */
    interceptors: instance.interceptors,
    /**
     * 对外接口相关接口
     */
    openapi: openapi(instance),
    /**
     * 第三方应用相关接口
     */
    thirdPartyApp: thirdPartyApp(instance),
  }
}

export { OpenapiStatus } from './openapi'

export type * from './openapi'
export type * from './third_party_app'
