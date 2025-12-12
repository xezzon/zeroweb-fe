import { InstanceConfig } from "@/types"
import axios from "axios"
import attachment from "./attachment"

export default (config: InstanceConfig) => {
  const instance = axios.create(config)
  const attachmentApi = attachment(instance)

  return {
    /**
     * 拦截器方法
     */
    interceptors: instance.interceptors,
    /**
     * 附件管理接口
     */
    attachment: attachmentApi,
  }
}

export enum FileProvider {
  FS = 'FS',
  S3 = 'S3',
}

export { AttachmentStatus } from './attachment'

export type * from './attachment'
