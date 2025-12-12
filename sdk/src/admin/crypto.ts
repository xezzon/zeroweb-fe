import { HttpClient, Id, PResponse } from "@/types";

/**
 * 口令强度评估结果
 */
export interface PasswordStrength {
  /**
   * 口令强度得分
   */
  score: number;
  /**
   * 强度量级
   */
  guessesLog10: number;
}

export interface CryptoAPI {
  /**
   * 计算口令强度。
   * @param password 口令
   * @param username 用户名
   */
  passwordStrength: (password: string, directory: { username?: string, }) => PResponse<PasswordStrength>;
}

export default ({ request }: HttpClient): CryptoAPI => ({
  passwordStrength: (password, { username }) => request<PasswordStrength>({
    url: '/password-strength',
    method: 'GET',
    params: { password, username, },
  }),
})
