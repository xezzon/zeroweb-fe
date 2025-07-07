const TOKEN_NAME = 'tokenName'
const TOKEN_VALUE = 'tokenValue'

/**
 * @param {import('@xezzon/zeroweb').SaTokenInfo} token 
 * @param {boolean} remember 
 */
export function setToken({ tokenName, tokenValue }, remember) {
  if (remember) {
    localStorage.setItem(TOKEN_NAME, tokenName)
    localStorage.setItem(TOKEN_VALUE, tokenValue)
  } else {
    sessionStorage.setItem(TOKEN_NAME, tokenName)
    sessionStorage.setItem(TOKEN_VALUE, tokenValue)
  }
}

export function clearToken() {
  localStorage.removeItem(TOKEN_NAME)
  localStorage.removeItem(TOKEN_VALUE)
  sessionStorage.removeItem(TOKEN_NAME)
  sessionStorage.removeItem(TOKEN_VALUE)
}

/**
 * @returns {import('@xezzon/zeroweb').SaTokenInfo?} 
 */
export function getToken() {
  let tokenName = sessionStorage.getItem(TOKEN_NAME)
  if (tokenName) {
    const tokenValue = sessionStorage.getItem(TOKEN_VALUE)
    return { tokenName, tokenValue }
  }
  tokenName = localStorage.getItem(TOKEN_NAME)
  if (tokenName) {
    const tokenValue = localStorage.getItem(TOKEN_VALUE)
    return { tokenName, tokenValue }
  }
  return null
}