import { adminApi, selfApi } from "@/api";
import { AuthContext, AuthContextProvider, LoginPage, RegisterPage, RequireLogin } from '@zeroweb/auth';
import { MixLayout, NotFoundPage, ResourceContext, ResourceContextProvider } from '@zeroweb/layout';
import { ConfigProvider, Dropdown, Space } from "antd";
import zhCN from 'antd/es/locale/zh_CN';
import { useContext, useEffect, useState } from "react";
import { createBrowserRouter, Navigate, Outlet, RouterProvider, useLocation } from "react-router";

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

  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState(/** @type {import('@xezzon/zeroweb-sdk').MenuInfo[]} */(null));

  useEffect(() => {
    selfApi.loadResourceInfo()
      .then((response) => response.data)
      .then(setResources)
      .finally(() => {
        setLoading(false);
      })
  }, [])

  if (loading) {
    return <div>Loading...</div>;
  } else if (!resources) {
    return <div>Error loading routes</div>;
  } else {
    return (
      <ConfigProvider locale={zhCN}>
        <AuthContextProvider authnApi={adminApi.authn}>
          <ResourceContextProvider resources={resources} modules={modules} rootRoutes={rootRoutes}>
            <ZerowebAppAdmin />
          </ResourceContextProvider>
        </AuthContextProvider>
      </ConfigProvider>
    )
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
