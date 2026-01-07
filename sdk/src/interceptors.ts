import type { AxiosError } from "axios"
import type { ErrorResult, StructuredError } from "./types"
import { ErrorSource } from "./types"

const ERROR_CODE_HEADER = 'x-error-code'
export const ErrorCodeEnum = {
  'ARGUMENT_INVALID': 'C0005',
}

/**
 * 错误处理链：
 * 1. 如果没有响应，则是网络问题。
 * 2. 如果响应头不包含 x-error-code，是后端基础设施问题。
 * 3. 如果响应状态为 5xx，是后端问题。
 * 4. 如果响应状态为 401 或 403。分别跳转到登录页和 404 页。
 * 5. 如果错误码不是 C0005，是内容触发了校验机制。用消息框提示用户。
 * 6. 如果错误码是 C0005，是用户输入问题。将内容回显到表单。
 */
export function zerowebErrorHandler(error: AxiosError<ErrorResult> & StructuredError) {
  const response = error.response
  if (!response) {
    error.source = ErrorSource.NETWORK
    return Promise.reject(error)
  }
  const errorCode: string = response.headers[ERROR_CODE_HEADER]
  if (!errorCode) {
    error.source = ErrorSource.INFRA
    return Promise.reject(error)
  }
  error.errorCode = errorCode
  const responseBody = response.data
  if (response.status >= 500) {
    error.source = ErrorSource.INTERNAL
    error.message = responseBody.message
    return Promise.reject(error)
  }
  error.source = ErrorSource.BAD_REQUEST
  if (errorCode !== ErrorCodeEnum.ARGUMENT_INVALID) {
    error.notification = responseBody.message
  }
  error.parameters = responseBody.parameters
  error.details = responseBody.details
  return Promise.reject(error)
}
