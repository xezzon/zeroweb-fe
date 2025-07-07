import { useContext } from 'react';
import { AuthContext } from './AuthContext';

/**
 * 要求登录的组件
 * @param {Object} param0 
 * @param {import('react').ReactElement} param0.children
 * @param {import('react').ReactElement} param0.fallback 
 */
export function RequireLogin({ children, fallback = <></> }) {

  const { user } = useContext(AuthContext)

  if (!user) {
    return fallback;
  }

  return children;
}

/**
 * 要求角色验证的组件
 * 当前用户拥有要求的角色之一即验证通过
 * @param {Object} param0 
 * @param {import('react').ReactElement} param0.children
 * @param {string[]} param0.required
 * @param {import('react').ReactElement} param0.fallback
 */
export function RequireRoles({ children, required, fallback = <></> }) {

  const { roles } = useContext(AuthContext)

  if (!required.some(roles.includes)) {
    return fallback;
  }

  return children;
}

/**
 * 要求权限验证的组件
 * 当前用户拥有要求的权限之一即验证通过
 * @param {Object} param0 
 * @param {import('react').ReactElement} param0.children
 * @param {string[]} param0.required
 * @param {import('react').ReactElement} param0.fallback
 */
export function RequirePermissions({ children, required, fallback = <></> }) {

  const { permissions } = useContext(AuthContext)

  if (!required.some(permissions.includes)) {
    return fallback;
  }

  return children;
}
