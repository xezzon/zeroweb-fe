import { adminApi, selfApi } from "@/api";
import { AuthContext, AuthContextProvider, hasPermission, LoginPage, RegisterPage, RequireLogin } from '@zeroweb/auth';
import { MixLayout, NotFoundPage, ResourceContext, ResourceContextProvider } from '@zeroweb/layout';
import { ConfigProvider, Dropdown, Space, Typography } from "antd";
import zhCN from 'antd/es/locale/zh_CN';
import { useContext, useEffect, useState } from "react";
import { createBrowserRouter, Navigate, Outlet, RouterProvider, useLocation, useNavigate } from "react-router";

/**
 * @type {Record<string, () => Promise<{ default: React.ComponentType }>>}
 */
const modules = import.meta.glob('./routes/**/*.jsx');
/**
 * @type {import('react-router').RouteObject[]}
 */
const rootRoutes = [
  {
    layout: 'MixLayout',
    element: <MainPage />,
  },
  {
    path: '/login',
    element: <LoginPage authnApi={adminApi.authn} homepageUrl={import.meta.env.BASE_URL} />,
  },
  {
    path: '/register',
    element: <RegisterPage userApi={adminApi.user} loginUrl='/login' />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]

export default () => {
  return <>
    <ConfigProvider locale={zhCN}>
      <AuthContextProvider authnApi={adminApi.authn}>
        <AppWithResource />
      </AuthContextProvider>
    </ConfigProvider>
  </>
}

function AppWithResource() {

  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState(/** @type {import('@xezzon/zeroweb-sdk').MenuInfo[]} */(null));
  const { permissions } = useContext(AuthContext)

  useEffect(() => {
    selfApi.loadResourceInfo()
      .then((response) => response.data)
      .then(menuInfos => menuInfos
        .filter(menuInfo => hasPermission(permissions, menuInfo.permissions))
      )
      .then(setResources)
      .finally(() => {
        setLoading(false);
      })
  }, [permissions])

  if (loading) {
    return <div>Loading...</div>;
  } else if (!resources) {
    return <div>Error loading routes</div>;
  } else {
    return <>
      <ResourceContextProvider resources={resources} modules={modules} rootRoutes={rootRoutes}>
        <ZerowebAppAdmin />
      </ResourceContextProvider>
    </>
  }
}

function ZerowebAppAdmin() {

  const { routes } = useContext(ResourceContext);

  return (
    <RouterProvider router={createBrowserRouter(routes, {
      basename: import.meta.env.BASE_URL,
    })} />
  );
}

function MainPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useContext(AuthContext)

  return <>
    <RequireLogin fallback={
      <Navigate to={{
        pathname: '/login',
        search: new URLSearchParams({
          redirectUrl: location.pathname + location.search,
        }).toString()
      }} />
    }>
      <MixLayout
        title={import.meta.env.VITE_APP_TITLE}
        breadcrumbProps={{
          itemRender: ({ linkPath, title }) =>
            <Typography.Link onClick={() => navigate(linkPath)}>
              {title}
            </Typography.Link>
        }}
        actionsRender={() => (
          <Space>
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'logout',
                    label: '退出登录',
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
}
