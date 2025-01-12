import axios from "axios"
import { InstanceConfig } from "../types"

export default (config: InstanceConfig) => {
  const instance = axios.create(config)

  return {
    /**
     * HTTP 客户端
     */
    instance,
  }
}
