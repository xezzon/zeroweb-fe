import { InstanceConfig } from "@/types"
import axios from "axios"
import app from "./app"

export default (config: InstanceConfig) => {
  const instance = axios.create(config)

  return {
    /**
     * 拦截器方法
     */
    interceptors: instance.interceptors,
    /**
     * 应用管理相关接口
     */
    app: app(instance),
  }
}

export type * from './app'
