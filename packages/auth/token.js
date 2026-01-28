import { useState } from 'react';

const TOKEN_VALUE = 'AccessToken';

/**
 * @param {import('@xezzon/zeroweb-sdk').OidcToken} token
 * @param {boolean} remember
 */
export function setToken({ access_token }, remember) {
  if (remember) {
    localStorage.setItem(TOKEN_VALUE, access_token);
    sessionStorage.removeItem(TOKEN_VALUE);
  } else {
    sessionStorage.setItem(TOKEN_VALUE, access_token);
    localStorage.removeItem(TOKEN_VALUE);
  }
}

export function clearToken() {
  localStorage.removeItem(TOKEN_VALUE);
  sessionStorage.removeItem(TOKEN_VALUE);
}

/**
 * @returns {import('@xezzon/zeroweb-sdk').OidcToken?}
 */
export function getToken() {
  let access_token = sessionStorage.getItem(TOKEN_VALUE);
  if (access_token) {
    return { access_token };
  }
  access_token = localStorage.getItem(TOKEN_VALUE);
  if (access_token) {
    return { access_token };
  }
  return null;
}

/**
 * Custom React Hook for managing token state
 * @returns {{
 * token: import('@xezzon/zeroweb-sdk').OidcToken?,
 * setToken: (tokenInfo: import('@xezzon/zeroweb-sdk').OidcToken, remember: boolean) => void,
 * clearToken: () => void
 * }}
 */
export function useToken() {
  const [token, setTokenState] = useState(() => getToken());

  const setTokenHook = (tokenInfo, remember = false) => {
    setToken(tokenInfo, remember);
    setTokenState(tokenInfo);
  };

  const clearTokenHook = () => {
    clearToken();
    setTokenState(null);
  };

  return { token, setToken: setTokenHook, clearToken: clearTokenHook };
}
