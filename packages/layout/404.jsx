import { Result } from "antd";
import { NavLink } from "react-router";

export default ({ home = '/' }) => (
  <Result
    status={404}
    title="404 - Page Not Found"
    subTitle="The page you are looking for does not exist."
    extra={<NavLink to={home}>Back to Home</NavLink>}
  />
)
