import { ProLayout } from '@ant-design/pro-components';
import { AuthContext, RequireLogin } from '@zeroweb/auth';
import { Dropdown, Space, Typography } from 'antd';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, Outlet, useNavigate } from 'react-router';

export default () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const { t } = useTranslation();

  return (
    <>
      <RequireLogin
        fallback={
          <Navigate
            to={{
              pathname: '/login',
              search: new URLSearchParams({
                redirectUrl: '/',
              }).toString(),
            }}
          />
        }
      >
        <ProLayout
          logo={false}
          title={import.meta.env.PUBLIC_APP_TITLE}
          layout="top"
          location={{ pathname: location.pathname }}
          breadcrumbProps={{
            itemRender: ({ linkPath, title }) => (
              <Typography.Link onClick={() => navigate(linkPath)}>{title}</Typography.Link>
            ),
          }}
          actionsRender={() => (
            <Space>
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'logout',
                      label: t('logout'),
                      onClick: logout,
                    },
                  ],
                }}
              >
                {user?.nickname}
              </Dropdown>
            </Space>
          )}
          menu={{ request: () => [] }}
          menuItemRender={(item, dom) => (
            <Link to={item.path} target={item.target}>
              {dom}
            </Link>
          )}
          style={{ height: 'calc(100vh - 16px)' }}
        >
          <Outlet />
        </ProLayout>
      </RequireLogin>
    </>
  );
};
