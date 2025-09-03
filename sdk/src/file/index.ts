import { InstanceConfig } from "@/types"
import axios from "axios"
import attachment from "./attachment"

export default (config: InstanceConfig) => {
  const instance = axios.create(config)

  return {
    /**
     * 拦截器方法
     */
    interceptors: instance.interceptors,
    /**
     * 附件管理接口
     */
    attachment: attachment(instance),
  }
}

export enum FileProviderEnum {
  FS = 'FS',
  S3 = 'S3',
}

export { AttachmentStatusEnum } from './attachment'

export type * from './attachment'
