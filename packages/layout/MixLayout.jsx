import { ProLayout } from '@ant-design/pro-components';
import { useContext } from 'react';
import { Link, Outlet, useLocation, useParams, useSearchParams } from 'react-router';
import { ResourceContext } from './ResourceContext';
import { resolveRouteParam } from './util';

/**
 * @param {import("@ant-design/pro-components").ProLayoutProps} param0
 * @param {string} param0.title
 */
export default ({ children = <Outlet />, ...props }) => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const params = useParams();
  const { menus } = useContext(ResourceContext);

  if (searchParams.has('hideMenu')) {
    return children;
  }

  return (
    <>
      <ProLayout
        logo={false}
        layout="mix"
        location={{ pathname: location.pathname }}
        menu={{ request: () => menus }}
        menuItemRender={(item, dom) => (
          <Link to={resolveRouteParam(item.path, params)} target={item.target}>
            {cloneElement(dom, { 'data-perms': item.permissions?.toString() })}
          </Link>
        )}
        style={{ height: 'calc(100vh - 16px)' }}
        {...props}
      >
        {children}
      </ProLayout>
    </>
  );
};
