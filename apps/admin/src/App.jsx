import { adminApi, selfApi } from '@/api';
import { AuthContext, AuthContextProvider, hasPermission } from '@zeroweb/auth';
import { ResourceContext, ResourceContextProvider } from '@zeroweb/layout';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import { lazy } from 'react';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createBrowserRouter, RouterProvider } from 'react-router';

const MixLayout = lazy(() => import('@/components/layout/MixLayout'));
const LoginPage = lazy(() => import('@zeroweb/auth/Login'));
const RegisterPage = lazy(() => import('@zeroweb/auth/Register'));
const NotFoundPage = lazy(() => import('@zeroweb/layout/404'));
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
    element: <MixLayout />,
  },
  {
    path: '/login',
    element: <LoginPage authnApi={adminApi.authn} homepageUrl={import.meta.env.BASE_URL} />,
  },
  {
    path: '/register',
    element: <RegisterPage userApi={adminApi.user} loginUrl="/login" />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];

export default () => {
  return (
    <ConfigProvider locale={zhCN}>
      <AuthContextProvider authnApi={adminApi.authn}>
        <AppWithResource />
      </AuthContextProvider>
    </ConfigProvider>
  );
};

function AppWithResource() {
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState(
    /** @type {import('@xezzon/zeroweb-sdk').MenuInfo[]} */ (null),
  );
  const { permissions } = useContext(AuthContext);
  const { t } = useTranslation();
  const { t: tMenu } = useTranslation('menu');

  useEffect(() => {
    selfApi
      .loadResourceInfo()
      .then((response) => response.data)
      .then((menuInfos) =>
        menuInfos
          .filter((menuInfo) => hasPermission(permissions, menuInfo.permissions))
          .map((menuInfo) => ({
            ...menuInfo,
            name: tMenu(menuInfo.path, { nsSeparator: false }),
          })),
      )
      .then(setResources)
      .finally(() => {
        setLoading(false);
      });
  }, [permissions]);

  if (loading) {
    return <div>{t('loading')}</div>;
  } else if (!resources) {
    return <div>{t('error.loadingRoutes')}</div>;
  } else {
    return (
      <ResourceContextProvider
        resources={resources}
        component={(name) => modules[`./routes/${name}.jsx`]}
        rootRoutes={rootRoutes}
      >
        <ZerowebAppAdmin />
      </ResourceContextProvider>
    );
  }
}

function ZerowebAppAdmin() {
  const { routes } = useContext(ResourceContext);

  return (
    <RouterProvider
      router={createBrowserRouter(routes, {
        basename: import.meta.env.BASE_URL,
      })}
    />
  );
}
