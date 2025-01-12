import axios from "axios"
import { InstanceConfig } from "../types"
import dict from "./dict"

export default (config: InstanceConfig) => {
  const instance = axios.create(config)

  return {
    /**
     * HTTP 客户端
     */
    instance,
    /**
     * 字典相关接口
     */
    dict: dict(instance),
  }
}

export type { Dict } from './dict'
