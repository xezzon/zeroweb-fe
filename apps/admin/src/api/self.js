import { ZerowebMetadataClient } from "@xezzon/zeroweb";

export const selfApi = ZerowebMetadataClient({
  baseURL: import.meta.env.BASE_URL,
})
