import { getToken } from "./token";

export const TOKEN_NAME = "X-SESSION-ID";

/**
 * 认证拦截器。
 * 会将 AccessToken 放到 `X-SESSION-ID` 请求头上。
 * 由于测试环境没有网关，所以需要在环境变量中设置 ZEROWEB_TOKEN（JWT）和 ZEROWEB_PUBLIC_KEY（用于验证JWT签名的公钥）的值，它们将分别放在请求头 `Authorization` 和 `X-PUBLIC-KEY` 上。
 * @param {object} env
 * @param {boolean} env.DEV
 * @param {string?} env.ZEROWEB_TOKEN
 * @param {string?} env.ZEROWEB_PUBLIC_KEY
 */
export function authn(env) {
  /**
   * @param {import('axios').InternalAxiosRequestConfig} config
   */
  return (config) => {
    const accessToken = getToken();
    if (accessToken) {
      config.headers[TOKEN_NAME] = accessToken.access_token;
    }
    if (env.DEV && config.url !== "/auth/login/basic") {
      const idToken = env.ZEROWEB_TOKEN;
      config.headers["Authorization"] = idToken ? `Bearer ${idToken}` : undefined;
      const publicKey = env.ZEROWEB_PUBLIC_KEY;
      config.headers["X-PUBLIC-KEY"] = publicKey;
    }
    return config;
  };
}
