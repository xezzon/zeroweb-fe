import CryptoJS from "crypto-js"

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
