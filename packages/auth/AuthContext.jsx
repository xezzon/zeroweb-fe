/**
 * @typedef {Omit<import('@xezzon/zeroweb').JwtClaim, 'roles' | 'entitlements'>} User 用户
 */
import { createContext, useEffect, useState } from "react";
import { useToken } from "./token";

const defaultAuth = {
  /**
   * 当前用户认证信息
   * @type {User}
   */
  user: null,
  /**
   * 当前用户角色信息
   * @type {string[]}
   */
  roles: [],
  /**
   * 当前用户权限信息
   * @type {string[]}
   */
  permissions: [],
}

/**
 * @param {object} param0
 * @param {import('@xezzon/zeroweb').AuthnAPI} param0.authnApi
 * @param {import('react').ReactElement} param0.children
 */
export default function AuthContextProvider({ children, authnApi }) {

  const { token, setToken, clearToken } = useToken()
  const [auth, setAuth] = useState(defaultAuth)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token?.access_token) {
      setLoading(false)
      return
    }
    authnApi.self()
      .then(response => response.data)
      .then(({ roles, entitlements: permissions, ...user }) => {
        setAuth({ user, roles, permissions })
      })
      .catch(() => {
        clearToken()
      })
      .finally(() => {
        setLoading(false)
      })
    // oxlint-disable-next-line exhaustive-deps
  }, [token?.access_token])

  const afterLogin = (token, remember = false) => {
    setToken(token, remember)
    setLoading(true)
  }

  const afterLogout = () => {
    clearToken()
    setAuth(defaultAuth)
  }

  const logout = () => {
    authnApi.logout()
      .finally(() => {
        afterLogout()
      })
  }

  return <AuthContext value={{
    ...auth,
    loading,
    afterLogin,
    afterLogout,
    logout,
  }}>
    {children}
  </AuthContext>
}

export const AuthContext = createContext({
  ...defaultAuth,
  loading: true,
  /**
   * @param {import("@xezzon/zeroweb").OidcToken} _claim
   * @param {boolean} _remember
   */
  afterLogin: (_claim, _remember = false) => { },
  afterLogout: () => { },
  logout: () => { },
})
