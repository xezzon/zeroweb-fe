import { Form, Input, Button, Card, Row, Col } from "antd"
import { useContext } from "react"
import { useNavigate, useSearchParams } from "react-router"
import { AuthContext } from "./AuthContext"

/**
 * 登录页。
 * @param {Object} param0
 * @param {import('@xezzon/zeroweb-sdk').AuthnAPI} param0.authnApi 认证 HTTP 接口
 * @param {string?} param0.homepageUrl 应用首页。登录成功后，如果没有指定跳转地址，则默认返回到首页。
 */
export default ({ authnApi, homepageUrl }) => {

  const { afterLogin } = useContext(AuthContext)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  /**
   * 
   * @param {import('@xezzon/zeroweb-sdk').BasicAuth} basicToken 
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
    <div style={{ backgroundColor: 'white', height: 'calc(100vh - 16px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Row justify="center" align="middle" style={{ width: '100%' }}>
        <Col xs={24} sm={16} md={12} lg={8} xl={6}>
          <Card title="登录" style={{ boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
            <Form onFinish={login} layout="vertical">
              <Form.Item
                name="username"
                label="用户名"
                rules={[
                  {
                    required: true,
                    message: '请输入用户名',
                  },
                ]}
              >
                <Input placeholder="用户名" />
              </Form.Item>
              <Form.Item
                name="password"
                label="密码"
                rules={[
                  {
                    required: true,
                    message: '请输入密码',
                  },
                ]}
              >
                <Input.Password placeholder="密码" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  登录
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
