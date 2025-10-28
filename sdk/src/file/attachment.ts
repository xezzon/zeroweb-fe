import { HttpClient, PResponse } from "@/types";
import { FileProviderEnum } from "..";
import { checksum } from "./upload";

export enum AttachmentStatusEnum {
  UPLOADING = 'UPLOADING',
  DONE = 'DONE',
}

export interface Attachment {
  /**
   * 附件ID
   */
  id: string;
  /**
   * 文件名
   */
  name: string;
  /**
   * 文件摘要
   */
  checksum: string;
  /**
   * 文件大小
   * 单位：字节
   */
  size: number;
  /**
   * MIME类型
   */
  type: string;
  /**
   * 业务类型
   */
  bizType: string;
  /**
   * 业务ID
   */
  bizId: string;
  /**
   * 存储后端
   */
  provider: FileProviderEnum;
  /**
   * 附件状态
   */
  status: AttachmentStatusEnum;
  /**
   * 上传者
   */
  ownerId: string;
  /**
   * 上传时间
   */
  createTime: Date;
}

declare type AddAttachmentReq = Omit<Attachment, 'id' | 'provider' | 'status' | 'createTime' | 'ownerId'>;

export interface AddAttachmentResp {
  /**
   * 附件ID
   */
  id: string;
  /**
   * 单个文件分片的最大大小
   * 单位：MB。
   */
  maxPartSize: number;
}

export interface UploadAddress {
  /**
   * 附件ID
   */
  id: string;
  /**
   * 存储后端
   */
  provider: FileProviderEnum;
  /**
   * 上传地址
   */
  endpoint: string;
}

/**
 * S3 分段上传凭据
 */
export interface S3Etag {
  /**
   * 附件ID
   */
  attachmentId: string
  /**
   * 分段序号
   */
  partNumber: number;
  /**
   * S3 Etag
   */
  etag: string;
  /**
   * 分段校验和
   */
  checksum: string;
}

export interface AttachmentAPI {
  /**
   * 新增附件
   * @param file 文件信息
   * @param bizType 业务类型
   * @param bizId 业务ID
   * @returns 文件上传元数据
   */
  addAttachment: (file: File, bizType: string, bizId: string) => PResponse<AddAttachmentResp>;
  /**
   * 获取附件上传地址
   * @param id 附件ID
   * @returns 上传地址
   */
  getUploadAddress: (id: string) => PResponse<UploadAddress>;
  /**
   * 获取附件分段上传地址
   * @param id 附件ID
   * @param partNumber 分段序号
   * @returns 上传地址
   */
  getMultipartUploadAddress: (id: string, partNumber: number) => PResponse<UploadAddress>;
  /**
   * 文件上传完成后，将其状态变更为已完成
   * @param id 附件ID
   */
  finishUpload: (id: string) => PResponse<void>;
  /**
   * S3上传完分段后，将返回内容提交到服务器
   * @param etag S3分段上传凭据
   */
  upsertS3Etag: (etag: S3Etag) => PResponse<void>;
}

export default (client: HttpClient): AttachmentAPI => ({
  addAttachment: async (file, bizType, bizId) => {
    const req: AddAttachmentReq = {
      name: file.name,
      checksum: await checksum(file),
      size: file.size,
      type: file.type,
      bizType,
      bizId,
    };
    return client.request({
      url: '/attachment',
      method: 'POST',
      data: req,
    });
  },
  getUploadAddress: (id) => client.request({
    url: `/attachment/${id}/endpoint/upload`,
    method: 'GET',
  }),
  getMultipartUploadAddress: (id, partNumber) => client.request({
    url: `/attachment/${id}/endpoint/upload/${partNumber}`,
    method: 'GET',
  }),
  finishUpload: (id) => client.request({
    url: `/attachment/${id}/status/done`,
    method: 'PUT',
  }),
  upsertS3Etag: (etag) => client.request({
    url: `/s3/${etag.attachmentId}/etag`,
    method: 'PUT',
    data: etag,
  }),
})
