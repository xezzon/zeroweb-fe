import axios from "axios";
import { InstanceConfig } from "../types";
import openapi from "./openapi";
import thirdPartyApp from "./third_party_app";

export default (config: InstanceConfig) => {
  const instance = axios.create(config)

  return {
    /**
     * HTTP 客户端
     */
    instance,
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

export type { Openapi, OpenapiStatus } from './openapi'
export type { ThirdPartyApp, AccessSecret } from './third_party_app'
