import { ZerowebOpenClient } from "@xezzon/zeroweb-sdk";

export const openApi = ZerowebOpenClient({
  baseURL: import.meta.env.ZEROWEB_OPEN_API,
})
