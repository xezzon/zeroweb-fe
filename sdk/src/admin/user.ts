import { HttpClient, Id } from "@/types";

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

export default ({ Request }: HttpClient) => ({
  /**
   * 用户注册
   * @param user 用户
   */
  register: (user: RegisterReq) => Request<Id>({
    url: '/user/register',
    method: 'POST',
    data: user,
  }),
})
