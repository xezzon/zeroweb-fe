import { HttpClient, Id, PResponse } from "../types";

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

export default ({ request }: HttpClient) => ({
  /**
   * 用户注册
   * @param user 用户
   */
  register: (user: RegisterReq): PResponse<Id> => request({
    url: '/user/register',
    method: 'POST',
    data: user,
  }),
})
