import type { HttpClient, Id, PResponse } from '@/types';

/**
 * 角色
 */
export interface Role {
  /**
   * 角色ID
   */
  id: string;
  /**
   * 角色简码
   */
  code: string;
  /**
   * 角色编码
   */
  value: string;
  /**
   * 角色名称
   */
  name: string;
  /**
   * 是否允许该角色创建下级角色
   */
  inheritable: boolean;
  /**
   * 上级角色
   */
  parentId: string;
  /**
   * 下级角色
   */
  children?: Role[];
}

declare type AddRoleReq = Omit<Role, 'id' | 'value'>;

export interface RoleAPI {
  /**
   * 新增角色
   * @param role 角色信息
   * @returns 角色ID
   */
  addRole: (role: AddRoleReq) => PResponse<Id>;
  /**
   * 查询角色列表
   * @returns 角色列表（树形）
   */
  listAllRole: () => PResponse<Role[]>;
  /**
   * 删除角色
   * @param id 角色ID
   */
  deleteRole: (id: string) => PResponse<void>;
  /**
   * 查询当前登陆人的角色及它们的下一级角色
   * @returns 角色列表
   */
  listMyRole: () => PResponse<Role[]>;
}

export default (client: HttpClient): RoleAPI => ({
  addRole: (role) =>
    client.request({
      url: '/role',
      method: 'POST',
      data: role,
    }),
  listAllRole: () =>
    client.request({
      url: '/role',
      method: 'GET',
    }),
  deleteRole: (id) =>
    client.request({
      url: `/role/${id}`,
      method: 'DELETE',
    }),
  listMyRole: () =>
    client.request({
      url: '/role/mine',
      method: 'GET',
    }),
});
