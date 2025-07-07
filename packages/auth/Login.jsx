/**
 * @typedef {{ username: string, password: string}} LoginForm
 */
import { LoginFormPage, ProFormText } from "@ant-design/pro-components"
import { useCallback } from "react"

/**
 * @param {Object} param0
 * @param {(basicToken: LoginForm) => void} param0.login
 */
export default ({ login }) => {

  const onFinish = useCallback(login, [login])

  return (
    <div style={{ backgroundColor: 'white', height: 'calc(100vh - 16px)' }}>
      <LoginFormPage onFinish={onFinish}>
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
