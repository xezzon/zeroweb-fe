import { InstanceConfig } from "@/types"
import { createAlova } from "alova"
import adapterFetch from "alova/fetch"
import authn from "./authn"
import authz from "./authz"
import dict from "./dict"
import locale from "./locale"
import role from "./role"
import user from "./user"

export default (config: InstanceConfig) => {
  const instance = createAlova({
    ...config,
    requestAdapter: adapterFetch(),
  })

  return {
    /**
     * 认证相关接口
     */
    authn: authn(instance),
    /**
     * 授权相关接口
     */
    authz: authz(instance),
    /**
     * 字典相关接口
     */
    dict: dict(instance),
    /**
     * 国际化相关接口
     */
    locale: locale(instance),
    /**
     * 角色管理接口
     */
    role: role(instance),
    /**
     * 用户相关接口
     */
    user: user(instance),
  }
}

export type * from './authn'
export type * from './authz'
export type * from './dict'
export type * from './locale'
export type * from './user'

