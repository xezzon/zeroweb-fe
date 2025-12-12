import { ZerowebAdminClient } from "@xezzon/zeroweb";

export const adminApi = ZerowebAdminClient({
  baseURL: import.meta.env.ZEROWEB_ADMIN_API,
})
