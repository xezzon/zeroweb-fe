import { adminApi, selfApi } from "@/api";
import { AuthContextProvider, LoginPage, RequireLogin } from '@zeroweb/auth';
import { MixLayout, NotFoundPage, ResourceContext, ResourceContextProvider } from '@zeroweb/layout';
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
      <AuthContextProvider authnApi={adminApi.authn}>
        <ResourceContextProvider resources={resources} modules={modules} rootRoutes={rootRoutes}>
          <ZerowebAppAdmin />
        </ResourceContextProvider>
      </AuthContextProvider>
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

  return <>
    <RequireLogin fallback={
      <Navigate to={{
        pathname: '/login',
        search: new URLSearchParams({
          redirectUrl: location.pathname + location.search,
        }).toString()
      }} />
    }>
      <MixLayout title={import.meta.env.VITE_APP_TITLE}>
        <Outlet />
      </MixLayout>
    </RequireLogin>
  </>
}
