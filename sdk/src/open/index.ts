import axios from "axios";
import { InstanceConfig } from "@/types";

export default (config: InstanceConfig) => {
  const instance = axios.create(config)

  return {
    /**
     * 拦截器方法
     */
    interceptors: instance.interceptors,
  }
}
