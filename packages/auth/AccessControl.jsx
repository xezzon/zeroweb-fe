import { useContext } from 'react';
import { AuthContext } from './AuthContext';

/**
 * 要求登录的组件
 * @param {Object} param0
 * @param {import('react').ReactElement} param0.children
 * @param {import('react').ReactElement} param0.fallback
 * @param {import('react').ReactElement} param0.loading
 */
export function RequireLogin({ children, fallback = <></>, loading = <></> }) {
  const { user, loading: isLoading } = useContext(AuthContext);

  if (isLoading) {
    return loading;
  }

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
 * @param {import('react').ReactElement} param0.loading
 */
export function RequireRoles({ children, required, fallback = <></>, loading = <></> }) {
  const { roles, loading: isLoading } = useContext(AuthContext);

  if (isLoading) {
    return loading;
  }

  if (!required.some((r) => roles.includes(r))) {
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
 * @param {import('react').ReactElement} param0.loading
 */
export function RequirePermissions({ children, required, fallback = <></>, loading = <></> }) {
  const { permissions, loading: isLoading } = useContext(AuthContext);

  if (isLoading) {
    return loading;
  }

  if (!required.some((p) => permissions.includes(p))) {
    return fallback;
  }

  return children;
}
