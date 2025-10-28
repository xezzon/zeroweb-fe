import { HttpClient, PResponse } from "@/types"
import CryptoJS from "crypto-js"
import { AttachmentAPI } from "./attachment"
import { FileProviderEnum } from "."

/**
 * 计算文件的校验和
 * @param file 文件
 * @returns 文件的SHA256值
 */
export async function checksum(file: File): Promise<string> {
  if (file.checksum) {
    return file.checksum
  }
  return file.arrayBuffer()
    .then(arrayBuffer => {
      const checksum = CryptoJS
        .SHA256(CryptoJS.lib.WordArray.create(arrayBuffer))
        .toString(CryptoJS.enc.Base64)
      file.checksum = checksum
      return checksum
    })
}

declare global {
  interface File {
    checksum?: string;
  }
}

export function upload(client: HttpClient, attachmentApi: AttachmentAPI) {

  const uploadFile = async (attachmentId: string, file: File): Promise<string> => {
    return attachmentApi.getUploadAddress(attachmentId)
      .then(response => response.data)
      .then(async ({ endpoint }) => client.request({
        url: endpoint,
        method: 'PUT',
        data: file.slice(),
        headers: {
          'x-amz-meta-filename': file.name,
          'Content-Type': file.type,
          'x-amz-sdk-checksum-algorithm': 'SHA256',
          'x-amz-checksum-sha256': await checksum(file),
        },
      }))
      .then(() => attachmentId)
  }

  const uploadMultipartFile = async (attachmentId: string, file: File, maxPartSize: number): Promise<string> => {
    const partCount = Math.ceil(file.size / maxPartSize)
    return file.arrayBuffer()
      .then(arrayBuffer => {
        const partContents = []
        for (let index = 0; index < partCount - 1; index++) {
          partContents.push(arrayBuffer.slice(index * maxPartSize, (index + 1) * maxPartSize))
        }
        partContents.push(arrayBuffer.slice((partCount - 1) * maxPartSize, file.size))
        return partContents
      })
      .then(partContents => Promise.all(
        partContents.map((partContent, index) => attachmentApi
          .getMultipartUploadAddress(attachmentId, index + 1)
          .then(response => response.data)
          .then(async ({ endpoint, provider }) => {
            const partChecksum = CryptoJS
              .SHA256(CryptoJS.lib.WordArray.create(partContent))
              .toString(CryptoJS.enc.Base64)
            return client
              .request({
                url: endpoint,
                method: 'PUT',
                data: partContent,
                headers: {
                  'x-amz-sdk-checksum-algorithm': 'SHA256',
                  'x-amz-checksum-sha256': partChecksum,
                },
              })
              .then((response) => {
                if (provider == FileProviderEnum.S3) {
                  return attachmentApi.upsertS3Etag({
                    attachmentId,
                    etag: response.headers["etag"],
                    partNumber: index + 1,
                    checksum: partChecksum,
                  })
                }
              })
          })
        )
      ))
      .then(() => attachmentId)
  }

  return async (file: File, bizType: string, bizId: string) => attachmentApi
    // 新增附件
    .addAttachment(file, bizType, bizId)
    .then((response) => response.data)
    // 上传文件
    .then(({ id, maxPartSize }) => {
      const maxPartSizeInByte = maxPartSize * 1024 * 1024
      if (file.size > maxPartSizeInByte) {
        // 大文件需要分段上传
        return uploadMultipartFile(id, file, maxPartSizeInByte)
      } else {
        return uploadFile(id, file)
      }
    })
    // 完成上传
    .then(attachmentApi.finishUpload)
}
