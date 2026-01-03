import { AxiosError } from "axios"
import { ErrorResult, StructuredError } from "./types"

const ERROR_CODE_HEADER = 'x-error-code'
const INTERNAL_SERVER_ERROR_MESSAGE = '系统故障，请稍后重试或联系管理员。'
export const ErrorCodeEnum = {
  'ARGUMENT_INVALID': 'C0005',
}

/**
 * 错误处理链：
 * 1. 如果没有响应，则是网络问题。
 * 2. 如果响应头不包含 x-error-code，是后端基础设施问题。
 * 3. 如果响应状态为 5xx，是后端问题。
 * 4. 如果响应状态为 401 或 403，分别跳转到登录页和 404 页。
 * 5. 如果错误码不是 C0005，则用消息框提示用户。
 * 6. 如果错误码是 C0005，则将内容回显到表单。
 */
export function zerowebErrorHandler() {
  const handler = (error: AxiosError<ErrorResult>): StructuredError => {
    const response = error.response
    if (!response) {
      return {
        code: error.code,
        message: error.message,
        notification: INTERNAL_SERVER_ERROR_MESSAGE,
      }
    }
    const errorCode = response.headers[ERROR_CODE_HEADER]
    if (!errorCode) {
      return {
        httpStatus: response.status,
        code: error.code,
        message: error.message,
        notification: INTERNAL_SERVER_ERROR_MESSAGE,
      }
    }
    if (response.status >= 500) {
      return {
        httpStatus: response.status,
        code: errorCode,
        message: error.message,
        notification: INTERNAL_SERVER_ERROR_MESSAGE,
      }
    }
    const responseBody = response.data
    return {
      httpStatus: response.status,
      code: errorCode,
      message: error.message,
      notification: responseBody.message,
      parameters: responseBody.parameters,
      details: responseBody.details,
    }
  }
  return (error: any) => Promise.reject(handler(error))
}
