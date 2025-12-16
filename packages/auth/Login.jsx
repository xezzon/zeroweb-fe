import { LoginFormPage, ProFormText } from "@ant-design/pro-components"
import { useContext } from "react"
import { useNavigate, useSearchParams } from "react-router"
import { AuthContext } from "./AuthContext"

/**
 * 登录页。
 * @param {Object} param0
 * @param {import('@xezzon/zeroweb').AuthnAPI} param0.authnApi 认证 HTTP 接口
 * @param {string?} param0.homepageUrl 应用首页。登录成功后，如果没有指定跳转地址，则默认返回到首页。
 */
export default ({ authnApi, homepageUrl }) => {

  const { afterLogin } = useContext(AuthContext)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  /**
   * 
   * @param {import('@xezzon/zeroweb').BasicAuth} basicToken 
   * @returns 
   */
  const login = async (basicToken) => authnApi
    .basicLogin(basicToken)
    .then(response => response.data)
    .then(afterLogin)
    .then(() => {
      const redirectTo = searchParams.get('redirectUrl') || homepageUrl
      if (!redirectTo) {
        return
      }
      navigate(redirectTo, {
        replace: true,
      })
    })

  return (
    <div style={{ backgroundColor: 'white', height: 'calc(100vh - 16px)' }}>
      <LoginFormPage onFinish={login}>
        <ProFormText
          name="username"
          placeholder="用户名"
          rules={[
            {
              required: true,
              message: '请输入用户名',
            },
          ]}
        />
        <ProFormText.Password
          name="password"
          placeholder="密码"
          rules={[
            {
              required: true,
              message: '请输入密码',
            },
          ]}
        />
      </LoginFormPage>
    </div>
  )
}
