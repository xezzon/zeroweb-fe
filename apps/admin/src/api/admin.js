import { ZerowebAdminClient } from "@xezzon/zeroweb-sdk";
import { authnInterceptor as authn } from "@zeroweb/auth";

export const adminApi = ZerowebAdminClient({
  baseURL: import.meta.env.ZEROWEB_ADMIN_API,
})

adminApi.interceptors.request.use(authn({
  DEV: import.meta.env.DEV,
  ZEROWEB_TOKEN: import.meta.env.ZEROWEB_TOKEN,
  ZEROWEB_PUBLIC_KEY: import.meta.env.ZEROWEB_PUBLIC_KEY,
}))
