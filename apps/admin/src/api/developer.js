import { ZerowebDevClient } from '@xezzon/zeroweb-sdk';
import { authnInterceptor as authn } from '@zeroweb/auth';
import { alert } from './interceptors';

export const devApi = ZerowebDevClient({
  baseURL: import.meta.env.ZEROWEB_DEV_API,
});

devApi.interceptors.request.use(authn);

devApi.interceptors.response.use(null, alert);
