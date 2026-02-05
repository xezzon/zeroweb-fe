import axios from 'axios';
import { zerowebErrorHandler } from '@/interceptors';
import type { InstanceConfig } from '@/types';
import attachment from './attachment';
import { checksum, resolveDownloadUrl, upload } from './upload';

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
     */
    upload: upload(instance, attachmentApi),
    /**
     * 将获取并解析下载地址
     */
    resolveDownloadUrl: resolveDownloadUrl(attachmentApi, config.baseURL),
  };
};

export { checksum } from './upload';

export enum FileProvider {
  FS = 'FS',
  S3 = 'S3',
}

export { AttachmentStatus } from './attachment';

export type * from './attachment';
