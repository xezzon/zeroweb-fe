import { HttpClient, PResponse } from "../types";

/**
 * 基础认证
 */
export interface BasicAuth {
  /**
   * 用户名
   */
  username: string;
  /**
   * 口令
   */
  password: string;
}

export interface SaTokenInfo {
  /**
   * token 名称
   */
  tokenName: string;
  /**
   * token 值
   */
  tokenValue: string;
}

export default (client: HttpClient) => ({
  /**
   * 基础认证
   * @param user 用户名口令
   */
  basicLogin: (user: BasicAuth): PResponse<SaTokenInfo> => client.request({
    url: '/auth/login/basic',
    method: 'POST',
    auth: {
      username: user.username,
      password: user.password,
    },
    data: user,
  })
})
