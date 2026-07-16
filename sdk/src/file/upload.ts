import CryptoJS from 'crypto-js';
import { crc32 } from 'js-crc';
import type { HttpClient } from '@/types';
import type { Attachment, AttachmentAPI, UploadInfo } from './attachment';
import { FileProvider } from '.';

/**
 * 计算文件的校验和
 * @param file 文件
 * @returns 文件的SHA256值
 */
export async function checksum(file: File): Promise<File> {
  if (file.checksum && file.crc) {
    return file;
  }
  return file
    .arrayBuffer()
    .then((arrayBuffer) =>
      Promise.all([
        Promise.resolve()
          .then(() =>
            CryptoJS.SHA256(CryptoJS.lib.WordArray.create(arrayBuffer)).toString(
              CryptoJS.enc.Base64,
            ),
          )
          .then((checksum) => {
            file.checksum = checksum;
          }),
        Promise.resolve()
          .then(() => CryptoJS.enc.Base64.stringify(CryptoJS.enc.Hex.parse(crc32.hex(arrayBuffer))))
          .then((crc) => {
            file.crc = crc;
          }),
      ]),
    )
    .then(() => file);
}

declare global {
  interface File {
    checksum?: string;
    crc?: string;
  }
}

export function upload(client: HttpClient, attachmentApi: AttachmentAPI) {
  return async (file: File, uploadInfo: UploadInfo) =>
    file
      .arrayBuffer()
      .then((arrayBuffer) => {
        const partCount = uploadInfo.partCount;
        const partSize = uploadInfo.partSize;
        const parts = [];
        for (let index = 0; index < partCount - 1; index++) {
          const content = arrayBuffer.slice(index * partSize, (index + 1) * partSize);
          const crc = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Hex.parse(crc32.hex(content)));
          parts.push({ content, crc });
        }
        const content = arrayBuffer.slice((partCount - 1) * partSize, file.size);
        const crc = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Hex.parse(crc32.hex(content)));
        parts.push({ content, crc });
        return parts;
      })
      .then((parts) =>
        Promise.all(
          parts.map(async (part, index) =>
            Promise.resolve()
              .then(() => {
                if (uploadInfo.partCount > 1) {
                  return attachmentApi.getMultipartUploadEndpoint(
                    uploadInfo.id,
                    index + 1,
                    part.crc,
                  );
                } else {
                  return attachmentApi.getUploadEndpoint(uploadInfo.id);
                }
              })
              .then((response) => response.data)
              .then(async ({ endpoint }) => {
                if (!endpoint) {
                  return;
                }
                const partChecksum = CryptoJS.SHA256(
                  CryptoJS.lib.WordArray.create(part.content),
                ).toString(CryptoJS.enc.Base64);
                let headers;
                if (uploadInfo.partCount > 1) {
                  // 分片上传的请求头
                  headers = {
                    'x-amz-sdk-checksum-algorithm': 'CRC32',
                    'x-amz-checksum-crc32': part.crc,
                  };
                } else {
                  headers = {
                    'x-amz-sdk-checksum-algorithm': 'SHA256',
                    'x-amz-checksum-sha256': partChecksum,
                    'x-amz-meta-id': uploadInfo.id,
                    'x-amz-meta-filename': file.name,
                    'Content-Type': file.type,
                  };
                }
                return client.request({
                  url: endpoint,
                  method: 'PUT',
                  data: part.content,
                  headers: headers,
                });
              }),
          ),
        ),
      )
      .then(() => attachmentApi.finishUpload(uploadInfo.id));
}

export function resolveDownloadUrl(attachmentApi: AttachmentAPI, baseURL: string = '') {
  return async (attachment: Attachment) =>
    attachmentApi
      .getDownloadEndpoint(attachment.id)
      .then((response) => response.data)
      .then(({ endpoint, filename }) => {
        return {
          endpoint: attachment.provider === FileProvider.FS ? `${baseURL}${endpoint}` : endpoint,
          filename,
        };
      });
}
