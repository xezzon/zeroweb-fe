import { getToken } from "@/utils/token";
import { ZerowebAdminClient, ZerowebMetadataClient } from "@xezzon/zeroweb";

export const selfApi = ZerowebMetadataClient({
  baseURL: import.meta.env.BASE_URL,
})
selfApi.instance.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers[token.tokenName] = token.tokenValue
  }
  return config
})

export const adminApi = ZerowebAdminClient({
  baseURL: import.meta.env.ZEROWEB_ADMIN_API,
})
adminApi.instance.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers[token.tokenName] = token.tokenValue
  }
  return config
})
