import { MenuType } from '@xezzon/zeroweb-sdk';
import { createContext, Fragment, lazy, useMemo } from 'react';

/**
 * @param {object} param0
 * @param {import("react").ReactElement} param0.children
 * @param {import('@xezzon/zeroweb-sdk').MenuInfo[]} param0.resources
 * @param {(string) => Promise<{ default: React.ComponentType }>} param0.component
 * @param {import('react-router').RouteObject[]} param0.rootRoutes
 * @param {string} param0.defaultLayout
 */
export default function ResourceContextProvider({
  children,
  resources,
  component,
  rootRoutes,
  defaultLayout = 'MixLayout',
}) {
  const menus = useMemo(() => {
    const menus = resources
      .filter((resource) =>
        [MenuType.ROUTE, MenuType.EXTERNAL_LINK, MenuType.EMBEDDED, 'GROUP'].includes(
          resource.type,
        ),
      )
      .map((resource) => ({
        ...resource,
        target: resource.type === MenuType.EXTERNAL_LINK ? '_blank' : '_self',
      }));
    return resources2menus(menus);
  }, [resources]);
  const routes = useMemo(() => {
    const routes = resources
      .filter((resource) => [MenuType.ROUTE, MenuType.EMBEDDED].includes(resource.type))
      .filter((resource) => !!resource.route)
      .map((resource) => {
        if (resource.type === MenuType.EMBEDDED) {
          return {
            path: resource.path,
            layout: resource.layout || defaultLayout,
            element: (
              <iframe
                src={resource.route}
                seamless
                width="100%"
                height="100%"
                style={{ border: 0 }}
              />
            ),
          };
        } else {
          const module = component(resource.route);
          return {
            path: resource.path,
            layout: resource.layout || defaultLayout,
            lazy: async () => ({
              Component: module ? lazy(module) : Fragment,
            }),
          };
        }
      });
    return rootRoutes.map((rootRoute) => ({
      ...rootRoute,
      children: routes.filter((route) => route.layout === rootRoute.layout),
    }));
  }, [resources]);

  return <ResourceContext value={{ routes, menus }}>{children}</ResourceContext>;
}

export const ResourceContext = createContext({
  /**
   * @type {import('react-router').RouteObject[]}
   */
  routes: [],
  /**
   * @type {import('@ant-design/pro-components').MenuDataItem[]}
   */
  menus: [],
});

/**
 *
 * @param {import('@xezzon/zeroweb-sdk').MenuInfo[]} resources
 * @returns {import('@ant-design/pro-components').MenuDataItem[]}
 */
function resources2menus(resources, parent) {
  const menus = resources.filter((resource) => resource.parent == parent);
  return menus.map((menu) => {
    const children = resources.filter((resource) => resource.parent === menu.path);
    if (menu.type === 'GROUP' && children.length == 0) {
      // 如果分组的所有子菜单都没有权限，则不显示该分组。
      return undefined;
    }
    return {
      ...menu,
      children: resources2menus(children, menu.path),
    };
  });
}
