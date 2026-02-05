import { ZerowebFileClient } from '@xezzon/zeroweb-sdk';
import { authnInterceptor as authn } from '@zeroweb/auth';
import { alert } from './interceptors';

export const fileApi = ZerowebFileClient({
  baseURL: import.meta.env.ZEROWEB_FILE_API,
});

fileApi.interceptors.request.use(authn);

fileApi.interceptors.response.use(null, alert);
