import { ZerowebMetadataClient } from '@xezzon/zeroweb-sdk';

export const selfApi = ZerowebMetadataClient({
  baseURL: import.meta.env.BASE_URL,
});
