/**
 * Rsbuild 插件：为代理请求添加认证头
 * @param {Object} options 插件选项
 * @param {string} options.token 认证令牌
 * @param {string} options.jwk 公钥
 * @param {string[]} [options.excludePaths]
 * @returns {import('@rsbuild/core').RsbuildPlugin} Rsbuild 插件
 */
export function authProxyPlugin(options = {}) {
  const { token: idToken, jwk, excludePaths = ['/auth/login/basic'] } = options;
  /**
   * 向请求头添加 Token
   * @param {import('http').ClientRequest} proxyReq
   */
  const authProxy = (proxyReq) => {
    if (excludePaths.includes(proxyReq.path)) {
      return;
    }
    if (idToken) {
      proxyReq.setHeader('Authorization', `Bearer ${idToken}`);
    }
    if (jwk) {
      proxyReq.setHeader('X-PUBLIC-KEY', jwk);
    }
  };
  return {
    name: 'auth-proxy-plugin',
    setup(api) {
      api.modifyRsbuildConfig((config) => {
        // 如果已有代理配置，则为其添加 onProxyReq
        const proxies = config.server?.proxy;
        if (!proxies) {
          return;
        }
        Object.keys(proxies).forEach((key) => {
          /**
           * @type {import('@rsbuild/core').ProxyOptions}
           */
          const proxyConfig = proxies[key];
          if (proxyConfig && typeof proxyConfig === 'object' && !proxyConfig.onProxyReq) {
            proxyConfig.onProxyReq = authProxy;
          }
        });
      });
    },
  };
}
