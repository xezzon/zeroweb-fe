import type { HttpClient, Id, OData, Page, PResponse } from "../types";

export interface User {
  id: string;
  /**
   * 用户名
   */
  username: string;
  /**
   * 昵称
   */
  nickname: string;
  /**
   * 口令
   */
  password: string;
}

/**
 * 用户注册请求
 */
declare type RegisterReq = Omit<User, 'id'>

export interface UserAPI {
  /**
   * 用户注册
   * @param user 用户
   */
  register: (user: RegisterReq) => PResponse<Id>;
  /**
   * 获取用户列表
   * @param odata 查询参数
   * @returns 包含分页信息的用户列表
   */
  queryUserList: (odata: OData) => PResponse<Page<User>>;
}

export default ({ request }: HttpClient): UserAPI => ({
  register: (user) => request({
    url: '/user/register',
    method: 'POST',
    data: user,
  }),
  queryUserList: (odata) => request({
    url: '/user',
    method: 'GET',
    params: odata,
  }),
})
