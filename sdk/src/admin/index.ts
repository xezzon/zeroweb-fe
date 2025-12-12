import { InstanceConfig } from "@/types"
import axios from "axios"
import app from "./app"
import authn from "./authn"
import user from "./user"

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
    /**
     * 认证相关接口
     */
    authn: authn(instance),
    /**
     * 用户相关接口
     */
    user: user(instance),
  }
}

export type * from './app'
export type * from './authn'
export type * from './user'
