import { HttpClient } from "@/types"
import CryptoJS from "crypto-js"
import { AttachmentAPI } from "./attachment"

/**
 * 计算文件的校验和
 * @param file 文件
 * @returns 文件的SHA256值
 */
export function checksum(file: File): Promise<string> {
  if (file.checksum) {
    return Promise.resolve(file.checksum)
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result;
      if (result && result instanceof ArrayBuffer) {
        const wordArray = CryptoJS.lib.WordArray.create(result);
        const hash = CryptoJS.SHA256(wordArray)
        const checksum = hash.toString(CryptoJS.enc.Base64)
        file.checksum = checksum
        resolve(checksum)
      } else {
        reject(new Error("Failed to read file as ArrayBuffer."));
      }
    }
    reader.onerror = () => {
      reject(reader.error)
    }
    reader.readAsArrayBuffer(file)
  })
}

declare global {
  interface File {
    checksum?: string;
  }
}

export function upload(client: HttpClient, attachmentApi: AttachmentAPI) {
  return async (file: File, bizType: string, bizId: string) => attachmentApi
    // 新增附件
    .addAttachment(file, bizType, bizId)
    .then((response) => response.data)
    // 获取附件上传地址
    .then(({ id }) => attachmentApi.getUploadAddress(id))
    .then((response) => response.data)
    // 文件上传
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
}
