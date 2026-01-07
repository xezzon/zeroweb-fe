import type { FileProvider } from "..";
import type { HttpClient, PResponse } from "../types";
import { checksum } from "./upload";

export enum AttachmentStatus {
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
  provider: FileProvider;
  /**
   * 附件状态
   */
  status: AttachmentStatus;
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

export interface UploadInfo {
  /**
   * 附件ID
   */
  id: string;
  /**
   * 存储后端
   */
  provider: FileProvider;
  /**
   * 分片数量
   */
  partCount: number;
  /**
   * 分片大小。单位 Byte。
   */
  partSize: number;
}

/**
 * 上传地址
 */
export interface UploadAddress {
  /**
   * 分片序号
   */
  partNumber: number;
  /**
   * 上传地址
   */
  endpoint?: string;
}

/**
 * 下载地址
 */
export interface DownloadEndpoint {
  /**
   * 下载地址
   */
  endpoint: string;
}

export interface AttachmentAPI {
  /**
   * 新增附件
   * @param file 文件信息
   * @param bizType 业务类型
   * @param bizId 业务ID
   * @returns 文件上传元数据
   */
  addAttachment: (file: File, bizType: string, bizId: string) => PResponse<UploadInfo>;
  /**
   * 获取文件上传元数据
   * @param id 附件ID
   * @param checksum 文件摘要
   * @param fileSize 文件大小
   * @returns 文件上传元数据
   */
  getUploadInfo: (id: string, checksum: string, fileSize: number) => PResponse<UploadInfo>;
  /**
   * 获取上传地址
   * @param id 附件ID
   * @returns 上传地址
   */
  getUploadEndpoint: (id: string) => PResponse<UploadAddress>;
  /**
   * 获取分段上传地址
   * @param id 附件ID
   * @param partNumber 分段序号
   * @returns 上传地址
   */
  getMultipartUploadEndpoint: (id: string, partNumber: number, crc?: string) => PResponse<UploadAddress>;
  /**
   * 文件上传完成后，将其状态变更为已完成
   * @param id 附件ID
   */
  finishUpload: (id: string) => PResponse<void>;
  /**
   * 查询业务关联的附件
   * @param bizType 业务类型
   * @param bizId 业务ID
   * @returns 附件列表
   */
  queryAttachmentByBiz: (bizType: string, bizId: string) => PResponse<Attachment[]>;
  /**
   * 获取下载地址
   * @param id 附件ID
   * @returns 下载地址
   */
  getDownloadEndpoint: (id: string) => PResponse<DownloadEndpoint>;
  /**
   * 删除附件
   * @param id 附件ID
   */
  deleteAttachment: (id: string) => PResponse<void>;
}

export default (client: HttpClient): AttachmentAPI => ({
  addAttachment: async (file, bizType, bizId) => {
    await checksum(file)
    const req: AddAttachmentReq = {
      name: file.name,
      checksum: file.checksum!,
      size: file.size,
      type: file.type,
      bizType,
      bizId,
    };
    return client.request({
      url: '/attachment',
      method: 'POST',
      data: req,
      params: { crc: file.crc },
    });
  },
  getUploadInfo: (id, checksum, fileSize) => client.request({
    url: `/attachment/${id}/resume`,
    method: 'GET',
    params: { checksum, fileSize },
  }),
  getUploadEndpoint: (id) => client.request({
    url: `/attachment/${id}/endpoint/upload`,
    method: 'GET',
    params: { partNumber: 0 },
  }),
  getMultipartUploadEndpoint: (id, partNumber, crc) => client.request({
    url: `/attachment/${id}/endpoint/upload`,
    method: 'GET',
    params: { partNumber, crc },
  }),
  finishUpload: (id) => client.request({
    url: `/attachment/${id}/status/done`,
    method: 'PUT',
  }),
  queryAttachmentByBiz: (bizType, bizId) => client.request({
    url: `/attachment/list`,
    method: 'GET',
    params: { bizType, bizId, },
  }),
  getDownloadEndpoint: (id) => client.request({
    url: `/attachment/${id}/endpoint/download`,
    method: 'GET',
  }),
  deleteAttachment: (id) => client.request({
    url: `/attachment/${id}`,
    method: 'DELETE',
  }),
})
