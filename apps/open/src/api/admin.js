import { ZerowebAdminClient } from '@xezzon/zeroweb-sdk';

export const adminApi = ZerowebAdminClient({
  baseURL: import.meta.env.ZEROWEB_ADMIN_API,
});
