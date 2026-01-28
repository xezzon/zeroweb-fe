import { Button, Card, Col, Form, Input, Row } from 'antd';
import { useNavigate } from 'react-router';

/**
 * 注册页。
 * @param {Object} param0
 * @param {import('@xezzon/zeroweb-sdk').UserAPI} param0.userApi 用户 HTTP 接口
 * @param {string?} param0.loginUrl 登录页面 URL。注册成功后跳转到登录页。
 */
export default ({ userApi, loginUrl = '/login' }) => {
  const navigate = useNavigate();

  /**
   *
   * @param {import('@xezzon/zeroweb-sdk').User} user
   * @returns
   */
  const register = async (user) =>
    userApi
      .register(user)
      .then((response) => response.data)
      .then(() => {
        // 注册成功，跳转到登录页
        navigate(loginUrl, {
          replace: true,
        });
      });

  return (
    <div
      style={{
        backgroundColor: 'white',
        height: 'calc(100vh - 16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Row justify="center" align="middle" style={{ width: '100%' }}>
        <Col xs={24} sm={16} md={12} lg={8} xl={6}>
          <Card title="注册" style={{ boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
            <Form onFinish={register} layout="vertical">
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
                name="nickname"
                label="昵称"
                rules={[
                  {
                    required: true,
                    message: '请输入昵称',
                  },
                ]}
              >
                <Input placeholder="昵称" />
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
                  注册
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
