import { HttpClient, PResponse } from "@/types"
import CryptoJS from "crypto-js"
import attachment, { AttachmentAPI, UploadInfo } from "./attachment"
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

  return async (file: File, uploadInfo: UploadInfo) => file.arrayBuffer()
    .then(arrayBuffer => {
      const partCount = uploadInfo.partCount
      const partSize = uploadInfo.partSize
      const partContents = []
      for (let index = 0; index < partCount - 1; index++) {
        partContents.push(arrayBuffer.slice(index * partSize, (index + 1) * partSize))
      }
      partContents.push(arrayBuffer.slice((partCount - 1) * partSize, file.size))
      return partContents
    })
    .then(partContents => {
      const header = uploadInfo.partCount > 1
        ? {}
        : {
          'x-amz-meta-id': uploadInfo.id,
          'x-amz-meta-filename': file.name,
          'Content-Type': file.type,
        }
      return Promise.all(
        uploadInfo.addresses
          .map(async ({ partNumber, endpoint, callback }) => {
            const partContent = partContents[partNumber - 1]
            const checksum = CryptoJS
              .SHA256(CryptoJS.lib.WordArray.create(partContent))
              .toString(CryptoJS.enc.Base64)
            return client
              .request({
                url: endpoint,
                method: 'PUT',
                data: partContent,
                headers: {
                  ...header,
                  'x-amz-sdk-checksum-algorithm': 'SHA256',
                  'x-amz-checksum-sha256': checksum,
                },
              })
              .then(response => {
                if (uploadInfo.provider == FileProviderEnum.S3 && !!callback) {
                  return attachmentApi.upsertS3Etag({
                    attachmentId: uploadInfo.id,
                    etag: response.headers["etag"],
                    partNumber,
                    checksum,
                  })
                }
              })
          })
      )
    })
    .then(() => attachmentApi.finishUpload(uploadInfo.id))
}
