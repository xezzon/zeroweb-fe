import axios from "axios"
import { InstanceConfig, PResponse } from "../types"

/**
 * 服务类型
 */
export enum ServiceType {
  /**
   * 前端
   */
  CLIENT,
  /**
   * 后端
   */
  SERVER,
}

/**
 * 服务信息
 */
export interface ServiceInfo {
  /**
   * 服务名称
   */
  name: string;
  /**
   * 服务版本号
   */
  version: string;
  /**
   * 服务类型
   */
  type: ServiceType;
  /**
   * 是否隐藏
   */
  hidden: boolean;
}

/**
 * 菜单类型
 */
export enum MenuType {
  /**
   * 路由
   * 路径格式为 `/menu/submenu`
   */
  ROUTE,
  /**
   * 外部链接。
   * 点击后会打开一个新的标签页 路径格式为 `https://domain.com/path`
   */
  EXTERNAL_LINK,
  /**
   * 嵌入页面。
   * 会在当前页面嵌入一个外部网页。 路径格式为 `https://domain.com/path`
   */
  EMBEDDED,
  /**
   * 接口权限
   * 路径格式为 `resource:operation`，operation 通常为 `read`（可省略）、`write` 等。
   */
  PERMISSION,
  /**
   * 资源权限
   * 路径格式为 `resource:#:operation`，operation 通常为 `read`（可省略）、`write` 等。
   */
  GROUP_PERMISSION,
}

/**
 * 资源信息
 */
export interface MenuInfo {
  /**
   * 资源类型
   */
  type: MenuType;
  /**
   * 资源路径
   */
  path: string;
  /**
   * 访问资源所需要的权限
   * 取并集，即资源必须满足所列出的所有权限
   */
  permissions: string[];
}

export default (config: InstanceConfig) => {
  const instance = axios.create(config)

  return {
    /**
     * HTTP 客户端
     */
    instance,
    /**
     * 获取服务信息
     * @returns 服务信息
     */
    loadServiceInfo(): PResponse<ServiceInfo> {
      return instance.request({
        url: '/metadata/info.json',
        method: 'GET',
      })
    },
    /**
     * 获取菜单信息
     * @returns 菜单信息
     */
    loadResourceInfo(): PResponse<MenuInfo[]> {
      return instance.request({
        url: '/metadata/menu.json',
        method: 'GET',
      })
    },
  }
}
