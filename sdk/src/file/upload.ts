import { HttpClient } from "@/types";
import CryptoJS from "crypto-js";
import { crc32 } from "js-crc";
import { AttachmentAPI, UploadInfo } from "./attachment";

/**
 * 计算文件的校验和
 * @param file 文件
 * @returns 文件的SHA256值
 */
export async function checksum(file: File): Promise<File> {
  if (file.checksum && file.crc) {
    return file
  }
  return file.arrayBuffer()
    .then(arrayBuffer => Promise.all([
      Promise.resolve()
        .then(() => CryptoJS
          .SHA256(CryptoJS.lib.WordArray.create(arrayBuffer))
          .toString(CryptoJS.enc.Base64)
        )
        .then(checksum => {
          file.checksum = checksum
        }),
      Promise.resolve()
        .then(() => CryptoJS.enc.Base64.stringify(
          CryptoJS.enc.Hex.parse(crc32.hex(arrayBuffer))
        ))
        .then(crc => {
          file.crc = crc
        }),
    ]))
    .then(() => file)
}

declare global {
  interface File {
    checksum?: string;
    crc?: string;
  }
}
