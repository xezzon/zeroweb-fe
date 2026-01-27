/**
 * @param {object} options
 * @param {string} options.token
 * @param {string} options.jwk
 * @param {string[]} options.excludePaths
 */
export default function authProxyPlugin(options = {}) {
  const { token: idToken, jwk, excludePaths = ['/auth/login/basic'] } = options;
  /**
   * @param {import('http').ClientRequest} proxyReq
   */
  const onProxyReq = (proxyReq) => {
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
    name: 'auth-proxy',
    /**
     *
     * @param {import('rolldown-vite').UserConfig} config
     * @returns
     */
    config(config) {
      const proxies = config?.server?.proxy;
      if (!proxies) {
        return config;
      }
      Object.keys(proxies).forEach((key) => {
        /**
         * @type {import('rolldown-vite').ProxyOptions}
         */
        const proxyConfig = proxies[key];
        if (proxyConfig.configure) {
          const originalConfigure = proxyConfig.configure;
          proxyConfig.configure = (proxy) => {
            originalConfigure(proxy);
            proxy.on('proxyReq', onProxyReq);
          };
        } else {
          proxyConfig.configure = (proxy) => {
            proxy.on('proxyReq', onProxyReq);
          };
        }
      });
    },
  };
}
