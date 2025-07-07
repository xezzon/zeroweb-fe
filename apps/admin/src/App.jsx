import { adminApi, selfApi } from "@/api";
import { AuthContextProvider, LoginPage } from '@zeroweb/auth';
import { ResourceContext, ResourceContextProvider } from '@zeroweb/layout';
import { lazy, useContext, useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";

/**
 * @type {Record<string, () => Promise<{ default: React.ComponentType }>>}
 */
const modules = import.meta.glob('./routes/**/*.jsx');
const MixLayout = lazy(() => import('@zeroweb/layout/MixLayout'))
const NotFound = lazy(() => import('@zeroweb/layout/404'))
/**
 * @type {import('react-router').RouteObject[]}
 */
const rootRoutes = [
  {
    layout: 'MixLayout',
    element: <MixLayout title={import.meta.env.VITE_APP_TITLE} />,
  },
  {
    path: '/login',
    element: <LoginPage authnApi={adminApi.authn} homepageUrl={import.meta.env.BASE_URL} />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]

export default () => {

  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState(/** @type {import('@xezzon/zeroweb').MenuInfo[]} */(null));

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
      <AuthContextProvider>
        <ResourceContextProvider resources={resources} modules={modules} rootRoutes={rootRoutes}>
          <App />
        </ResourceContextProvider>
      </AuthContextProvider>
    )
  }
}

function App() {

  const { routes } = useContext(ResourceContext);

  return (
    <RouterProvider router={createBrowserRouter(routes, {
      basename: import.meta.env.BASE,
    })} />
  );
}
