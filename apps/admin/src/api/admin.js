import { ZerowebAdminClient } from "@xezzon/zeroweb";
import { getToken } from "@zeroweb/auth";

const TOKEN_NAME = 'X-SESSION-ID'

export const adminApi = ZerowebAdminClient({
  baseURL: import.meta.env.ZEROWEB_ADMIN_API,
})

adminApi.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers[TOKEN_NAME] = token.access_token
  }
  return config
})
