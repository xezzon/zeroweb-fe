import { ProLayout } from "@ant-design/pro-components";
import { useContext } from "react";
import { Link, Outlet, useLocation } from "react-router";
import { ResourceContext } from "./ResourceContext";

/**
 * @param {Object} param0
 * @param {string} param0.title
 */
export default ({ title }) => {

  const location = useLocation();
  const { menus } = useContext(ResourceContext)

  return <>
    <ProLayout
      layout="mix"
      title={title}
      location={{ pathname: location.pathname }}
      menu={{ request: () => menus }}
      menuItemRender={(item, dom) => (
        <Link to={item.path} target={item.target}>
          {dom}
        </Link>
      )}
      style={{ height: 'calc(100vh - 16px)' }}
    >
      <Outlet />
    </ProLayout >
  </>
}
