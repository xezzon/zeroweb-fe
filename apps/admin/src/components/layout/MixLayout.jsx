import { AuthContext, RequireLogin } from '@zeroweb/auth';
import { MixLayout } from '@zeroweb/layout';
import { Dropdown, Space, Typography } from 'antd';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router';

export default () => {
  const location = useLocation();
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
                redirectUrl: location.pathname + location.search,
              }).toString(),
            }}
          />
        }
      >
        <MixLayout
          title={import.meta.env.VITE_APP_TITLE}
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
        >
          <Outlet />
        </MixLayout>
      </RequireLogin>
    </>
  );
};
