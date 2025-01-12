import axios from "axios"
import { InstanceConfig } from "../types"
import auth from "./auth"
import dict from "./dict"
import user from "./user"

export default (config: InstanceConfig) => {
  const instance = axios.create(config)

  return {
    /**
     * HTTP 客户端
     */
    instance,
    /**
     * 认证相关接口
     */
    auth: auth(instance),
    /**
     * 字典相关接口
     */
    dict: dict(instance),
    /**
     * 用户相关接口
     */
    user: user(instance),
  }
}

export type { Dict } from './dict'
export type { User } from './user'
