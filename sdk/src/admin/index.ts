import axios from "axios"
import { zerowebErrorHandler } from "../interceptors"
import type { InstanceConfig } from "../types"
import app from "./app"
import authn from "./authn"
import authz from "./authz"
import crypto from "./crypto"
import dict from "./dict"
import role from "./role"
import setting from "./setting"
import user from "./user"

export default (config: InstanceConfig) => {
  const instance = axios.create(config)

  const interceptors = instance.interceptors
  interceptors.response.use(null, zerowebErrorHandler)

  return {
    /**
     * 拦截器方法
     */
    interceptors,
    /**
     * 应用管理相关接口
     */
    app: app(instance),
    /**
     * 认证相关接口
     */
    authn: authn(instance),
    /**
     * 授权相关接口
     */
    authz: authz(instance),
    /**
     * 加密相关接口
     */
    crypto: crypto(instance),
    /**
     * 字典相关接口
     */
    dict: dict(instance),
    /**
     * 角色管理接口
     */
    role: role(instance),
    /**
     * 业务参数管理接口
     */
    setting: setting(instance),
    /**
     * 用户相关接口
     */
    user: user(instance),
  }
}

export type * from './app'
export type * from './authn'
export type * from './authz'
export type * from './crypto'
export type * from './dict'
export type * from './role'
export type * from './setting'
export type * from './user'

