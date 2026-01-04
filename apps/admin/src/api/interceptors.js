import { message } from "antd"

const DEFAULT_MESSAGE = '系统故障，请稍后重试或联系管理员。'

/**
 * @param {import("@xezzon/zeroweb-sdk").StructuredError} error 
 */
export function alert(error) {
  const description = error.notification ?? DEFAULT_MESSAGE
  message.error(description)
  return Promise.reject(error)
}
