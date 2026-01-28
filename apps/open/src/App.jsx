import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import { createBrowserRouter, RouterProvider } from 'react-router';
import MemberPage from './routes/_id/member';
import SubscriptionPage from './routes/_id/subscription';
import ThirdPartyAppPage from './routes/_index';

export default () => {
  return (
    <>
      <ConfigProvider locale={zhCN}>
        <ZerowebAppOpen />
      </ConfigProvider>
    </>
  );
};

function ZerowebAppOpen() {
  /**
   * @type {import('react-router').RouteObject[]}
   */
  const routes = [
    {
      path: '/',
      Component: ThirdPartyAppPage,
    },
    {
      path: '/:id/member',
      Component: MemberPage,
    },
    {
      path: '/:id/subscription',
      Component: SubscriptionPage,
    },
  ];

  return (
    <RouterProvider
      router={createBrowserRouter(routes, {
        basename: import.meta.env.BASE_URL,
      })}
    />
  );
}
