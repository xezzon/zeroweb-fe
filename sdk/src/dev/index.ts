import axios from "axios"
import { zerowebErrorHandler } from "@/interceptors"
import type { InstanceConfig } from "@/types"
import locale from "./locale"

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
     * 国际化相关接口
     */
    locale: locale(instance),
  }
}

export type * from './locale'
