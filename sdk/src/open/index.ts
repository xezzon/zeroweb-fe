import axios from "axios";
import { InstanceConfig } from "@/types";
import thirdPartyApp from "./third_party_app";

export default (config: InstanceConfig) => {
  const instance = axios.create(config)

  return {
    /**
     * 拦截器方法
     */
    interceptors: instance.interceptors,
    /**
     * 第三方应用相关接口
     */
    thirdPartyApp: thirdPartyApp(instance),
  }
}

export type * from './third_party_app'
