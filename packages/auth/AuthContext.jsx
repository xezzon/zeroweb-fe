/**
 * @typedef {Omit<import('@xezzon/zeroweb').JwtClaim, 'roles' | 'entitlements'>} User 用户
 */
import { createContext, useState } from "react";

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
 * @param {{
 * children: import('react').ReactElement,
 * }} param0 
 */
export default function AuthContextProvider({ children }) {

  const [auth, setAuth] = useState(defaultAuth)

  const afterLogin = ({ roles, entitlements: permissions, ...user }) => {
    setAuth({ user, roles, permissions })
  }

  const afterLogout = () => {
    setAuth(defaultAuth)
  }

  return <AuthContext value={{
    ...auth,
    afterLogin,
    afterLogout,
  }}>
    {children}
  </AuthContext>
}

export const AuthContext = createContext({
  ...defaultAuth,
  /**
   * @param {import("@xezzon/zeroweb").JwtClaim} _claim
   */
  afterLogin: (_claim) => { },
  afterLogout: () => { },
})
