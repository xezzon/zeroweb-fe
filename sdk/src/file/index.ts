import { InstanceConfig } from "@/types"
import axios from "axios"
import attachment from "./attachment"
import { upload } from "./upload"

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
    /**
     * 文件上传
     * @param file 文件
     * @param bizType 业务类型
     * @param bizId 业务编码
     */
    upload: upload(instance, attachmentApi),
  }
}

export enum FileProviderEnum {
  FS = 'FS',
  S3 = 'S3',
}

export { AttachmentStatusEnum } from './attachment'

export type * from './attachment'
