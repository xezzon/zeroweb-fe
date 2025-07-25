import { ResourceContext, default as ResourceContextProvider } from '@zeroweb/layout/ResourceContext';
import { lazy, useContext, useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import { selfApi } from "./api";

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
      <ResourceContextProvider resources={resources} modules={modules} rootRoutes={rootRoutes}>
        <App />
      </ResourceContextProvider>
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
