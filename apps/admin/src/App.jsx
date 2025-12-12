import { selfApi } from "@/api";
import { MixLayout, NotFoundPage, ResourceContext, ResourceContextProvider } from '@zeroweb/layout';
import { useContext, useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";

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
    element: <MixLayout title={import.meta.env.VITE_APP_TITLE} />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
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
        <ZerowebAppAdmin />
      </ResourceContextProvider>
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
