import { InstanceConfig } from "@/types"
import axios from "axios"
import locale from "./locale"

export default (config: InstanceConfig) => {
  const instance = axios.create(config)

  return {
    /**
     * 拦截器方法
     */
    interceptors: instance.interceptors,
    /**
     * 国际化相关接口
     */
    locale: locale(instance),
  }
}

export type * from './locale'
