import { getToken } from './token';

export const TOKEN_NAME = 'X-SESSION-ID';

/**
 * 认证拦截器。
 * 会将 AccessToken 放到 `X-SESSION-ID` 请求头上。
 * @param {import('axios').InternalAxiosRequestConfig} config
 */
export function authn(config) {
  const accessToken = getToken();
  if (accessToken) {
    config.headers[TOKEN_NAME] = accessToken.access_token;
  }
  return config;
}
