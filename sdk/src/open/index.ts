import axios from "axios";
import { InstanceConfig } from "../types";
import openapi from "./openapi";

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
  }
}

export type { Openapi, OpenapiStatus } from './openapi'
