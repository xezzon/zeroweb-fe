/**
 * 判断是否拥有 required 要求的所有权限
 * @param {string[]} permissions 拥有的权限
 * @param {string[]} required 待校验的权限
 */
export function hasPermission(permissions, required) {
  if (!required) {
    return true
  }
  if (permissions.some(p => p === '*')) {
    return true
  }
  return required.every(p => permissions.includes(p))
}
