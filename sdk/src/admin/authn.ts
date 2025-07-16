import { HttpClient, PResponse } from "@/types";

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

export interface JwtClaim {
  /**
   * 用户ID
   */
  sub: string;
  /**
   * 用户名
   */
  preferredUsername: string;
  /**
   * 用户昵称
   */
  nickname: string;
  /**
   * 角色
   */
  roles: string[];
  /**
   * 权限
   */
  entitlements: string[];
}

/**
 * @see {@link https://openid.net/specs/openid-connect-core-1_0.html|OIDC}
 */
export interface OidcToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  idToken: string;
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
  }),
  /**
   * @returns 当前用户的认证信息
   */
  self: (): PResponse<JwtClaim> => client.request({
    url: '/auth/self',
    method: 'GET',
  }),
  /**
   * @returns 用户令牌
   */
  token: (): PResponse<OidcToken> => client.request({
    url: '/auth/token',
    method: 'GET',
  }),
})
