import { ZerowebAdminClient } from "@xezzon/zeroweb";
import { authn } from "./interceptor";

export const adminApi = ZerowebAdminClient({
  baseURL: import.meta.env.ZEROWEB_ADMIN_API,
})

adminApi.interceptors.request.use(authn)
