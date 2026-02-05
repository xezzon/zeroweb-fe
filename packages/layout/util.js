/**
 * 解析路径模板，替换参数
 * @param {string} pathTemplate 路径模板，如 '/:id/subscription'
 * @param {object} params 当前路径参数
 * @returns {string} 替换后的路径
 */
export function resolveRouteParam(pathTemplate, params) {
  // 匹配 :param 或 :param(...) 格式的参数
  const paramRegex = /:([a-zA-Z_][a-zA-Z0-9_]*)(?:\([^)]*\))?/g;
  return pathTemplate.replace(paramRegex, (_, paramName) => {
    if (params && params[paramName] !== undefined) {
      return params[paramName];
    }
    // 如果参数不存在，保留原样
    return `:${paramName}`;
  });
}
