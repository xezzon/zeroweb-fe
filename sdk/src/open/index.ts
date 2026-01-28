import axios from 'axios';
import { zerowebErrorHandler } from '@/interceptors';
import type { InstanceConfig } from '@/types';
import openapi from './openapi';
import subscription from './subscription';
import thirdPartyApp from './third_party_app';

export default (config: InstanceConfig) => {
  const instance = axios.create(config);

  const interceptors = instance.interceptors;
  interceptors.response.use(null, zerowebErrorHandler);

  return {
    /**
     * 拦截器方法
     */
    interceptors: instance.interceptors,
    /**
     * 对外接口相关接口
     */
    openapi: openapi(instance),
    /**
     * 第三方应用订阅相关接口
     */
    subscription: subscription(instance),
    /**
     * 第三方应用相关接口
     */
    thirdPartyApp: thirdPartyApp(instance),
  };
};

export { OpenapiStatus } from './openapi';
export { SubscriptionStatus } from './subscription';

export type * from './openapi';
export type * from './subscription';
export type * from './third_party_app';
