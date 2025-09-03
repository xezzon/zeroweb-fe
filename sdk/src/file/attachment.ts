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

declare type AddAttachmentReq = Omit<Attachment, 'id' | 'provider' | 'status' | 'createTime' | 'ownerId'>;

export interface AttachmentAPI {
  /**
   * 新增附件
   * @param file 文件信息
   * @param bizType 业务类型
   * @param bizId 业务ID
   * @returns 文件上传元数据
   */
  addAttachment: (file: File, bizType: string, bizId: string) => PResponse<AddAttachmentResp>;
}

export default (client: HttpClient): AttachmentAPI => ({
  addAttachment: async (file, bizType, bizId) => {
    const req : AddAttachmentReq = {
      name: file.name,
      checksum: await checksum(file),
      size: file.size,
      type: file.type,
      bizType,
      bizId,
    }
    return client.request({
      url: '/attachment',
      method: 'POST',
      data: req,
    })
  },
})
