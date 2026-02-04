import axios from 'axios';
import { zerowebErrorHandler } from '@/interceptors';
import type { InstanceConfig } from '@/types';
import attachment from './attachment';
import { checksum, upload } from './upload';

export default (config: InstanceConfig) => {
  const instance = axios.create(config);

  const interceptors = instance.interceptors;
  interceptors.response.use(null, zerowebErrorHandler);

  const attachmentApi = attachment(instance);

  return {
    /**
     * 拦截器方法
     */
    interceptors,
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
  };
};

export { checksum } from './upload';

export enum FileProvider {
  FS = 'FS',
  S3 = 'S3',
}

export { AttachmentStatus } from './attachment';

export type * from './attachment';
