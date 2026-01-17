import { ZerowebAdminClient } from "@xezzon/zeroweb-sdk";
import { authnInterceptor as authn } from "@zeroweb/auth";
import { alert } from "./interceptors";

export const adminApi = ZerowebAdminClient({
  baseURL: import.meta.env.ZEROWEB_ADMIN_API,
})

adminApi.interceptors.request.use(authn)

adminApi.interceptors.response.use(null, alert)
