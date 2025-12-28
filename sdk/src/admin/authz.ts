import { HttpClient, PResponse } from "@/types";
import { User } from "./user";
import { Role } from "./role";

/**
 * 角色-用户
 */
export interface RoleUser {
  id: string;
  /**
   * 角色ID
   */
  roleId: string;
  /**
   * 用户ID
   */
  userId: string;
}

/**
 * 角色-接口权限
 */
export interface RolePermission {
  id: string;
  /**
   * 角色ID
   */
  roleId: string;
  /**
   * 接口权限编码
   */
  permission: string;
}

export interface AuthzAPI {
  /**
   * 查询角色绑定的用户
   * @param roleId 角色ID
   * @returns 用户信息列表
   */
  queryUserByRole: (roleId: string) => PResponse<User[]>;
  /**
   * 将用户绑定到角色
   * @param roleUsers 角色-用户绑定关系
   */
  bindUserToRole: (roleUsers: RoleUser[]) => PResponse<void>;
  /**
   * 解除用户与角色的关联
   * @param roleUsers 角色-用户关联
   */
  releaseRoleUser: (roleUsers: RoleUser[]) => PResponse<void>;
  /**
   * 查询角色的接口权限编码集合
   * @param roleId 角色ID
   * @returns 接口权限编码
   */
  queryPermissionByRole: (roleId: string) => PResponse<string[]>;
  /**
   * 解除角色与接口权限的关联
   * @param rolePermissions 角色-接口权限关系
   */
  bindPermissionToRole: (rolePermissions: RolePermission[]) => PResponse<void>;
  /**
   * 解除角色与接口权限的关联
   * @param rolePermissions 角色-接口权限关系
   */
  releaseRolePermission: (rolePermissions: RolePermission[]) => PResponse<void>;
  /**
   * 查询用户关联的角色
   * @param userId 用户ID
   * @returns 角色信息集合
   */
  queryRoleByUser: (userId: string) => PResponse<Role[]>;
  /**
   * 查询接口权限关联的角色集合
   * @param permission 接口权限编码
   * @returns 角色信息集合
   */
  queryRoleByPermission: (permission: string) => PResponse<Role[]>;
}

export default (client: HttpClient): AuthzAPI => ({
  queryUserByRole: (roleId: string) => client.request({
    url: `/auth/role/${roleId}/user`,
    method: 'GET',
  }),
  bindUserToRole: (roleUsers: RoleUser[]) => client.request({
    url: '/auth/role/-/user',
    method: 'PUT',
    data: roleUsers,
  }),
  releaseRoleUser: (roleUsers: RoleUser[]) => client.request({
    url: '/auth/role/-/user',
    method: 'DELETE',
    data: roleUsers,
  }),
  queryPermissionByRole: (roleId: string) => client.request({
    url: `/auth/role/${roleId}/permission`,
    method: 'GET',
  }),
  bindPermissionToRole: (rolePermissions: RolePermission[]) => client.request({
    url: '/auth/role/-/permission',
    method: 'PUT',
    data: rolePermissions,
  }),
  releaseRolePermission: (rolePermissions: RolePermission[]) => client.request({
    url: '/auth/role/-/permission',
    method: 'DELETE',
    data: rolePermissions,
  }),
  queryRoleByUser: (userId: string) => client.request({
    url: `/auth/user/${userId}/role`,
    method: 'GET',
  }),
  queryRoleByPermission: (permission: string) => client.request({
    url: '/auth/permission/-/role',
    method: 'GET',
    params: { permission },
  }),
})
