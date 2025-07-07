import { selfApi } from "@/api";
import LoginPage from "@/components/LoginPage";
import { default as AuthContextProvider } from '@zeroweb/auth/AuthContext';
import { ResourceContext, default as ResourceContextProvider } from '@zeroweb/layout/ResourceContext';
import { lazy, useContext, useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";

/**
 * @type {Record<string, () => Promise<{ default: React.ComponentType }>>}
 */
const modules = import.meta.glob('./routes/**/*.jsx');
const NotFound = lazy(() => import('@zeroweb/layout/404'))
/**
 * @type {import('react-router').RouteObject[]}
 */
const rootRoutes = [
  {
    layout: 'MixLayout',
    Component: lazy(() => import('@zeroweb/layout/MixLayout')),
  },
  {
    path: '/login',
    element: <LoginPage />,
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
      basename: import.meta.env.BASE_URL,
    })} />
  );
}
