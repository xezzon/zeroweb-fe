import { InstanceConfig } from "@/types"
import axios from "axios"

export default (config: InstanceConfig) => {
  const instance = axios.create(config)

  return {
    /**
     * 拦截器方法
     */
    interceptors: instance.interceptors,
  }
}
