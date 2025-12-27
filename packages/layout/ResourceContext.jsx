import { MenuType } from "@xezzon/zeroweb-sdk";
import { createContext, Fragment, lazy, useMemo } from "react";

/**
 * @param {object} param0
 * @param {import("react").ReactElement} param0.children
 * @param {import('@xezzon/zeroweb-sdk').MenuInfo[]} param0.resources
 * @param {Record<string, () => Promise<{ default: React.ComponentType }>>} param0.modules
 * @param {import('react-router').RouteObject[]} param0.rootRoutes
 */
export default function ResourceContextProvider({ children, resources, modules, rootRoutes }) {

  const menus = useMemo(() => {
    const menus = resources
      .filter((resource) => [MenuType.ROUTE, MenuType.EXTERNAL_LINK, MenuType.EMBEDDED, 'GROUP'].includes(resource.type))
      .map((resource) => ({
        ...resource,
        target: resource.type === MenuType.EXTERNAL_LINK ? '_blank' : '_self',
      }))
    return resources2menus(menus)
  }, [resources]);
  const routes = useMemo(() => {
    const routes = resources
      .filter((resource) => [MenuType.ROUTE, MenuType.EMBEDDED].includes(resource.type))
      .filter((resource) => !!resource.route)
      .map((resource) => {
        if (resource.type === MenuType.EMBEDDED) {
          return {
            path: resource.path,
            layout: resource.layout || 'MixLayout',
            element: (
              <iframe
                src={resource.route}
                seamless
                width="100%"
                height="100%"
                style={{ border: 0, }}
              />
            ),
          }
        } else {
          const module = modules[`./routes/${resource.route}.jsx`];
          return {
            path: resource.path,
            layout: resource.layout || 'MixLayout',
            lazy: async () => ({
              Component: module ? lazy(module) : Fragment,
            }),
          }
        }
      })
    return rootRoutes.map((rootRoute) => ({
      ...rootRoute,
      children: routes.filter((route) => route.layout === rootRoute.layout)
    }))
  }, [rootRoutes, modules, resources]);

  return (
    <ResourceContext value={{ routes, menus }}>
      {children}
    </ResourceContext>
  )
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
})

/**
 * 
 * @param {import('@xezzon/zeroweb-sdk').MenuInfo[]} resources 
 * @returns {import('@ant-design/pro-components').MenuDataItem[]}
 */
function resources2menus(resources, parent) {
  const menus = resources.filter((resource) => resource.parent == parent)
  return menus.map((menu) => {
    const children = resources.filter((resource) => resource.parent === menu.path)
    return {
      ...menu,
      children: children.length > 0 ? resources2menus(children, menu.path) : undefined,
    }
  })
}
