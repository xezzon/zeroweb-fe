import { adminApi } from "@/api";
import { setToken } from "@/utils/token";
import { AuthContext } from "@zeroweb/auth/AuthContext";
import { lazy, useCallback, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router";

const LoginPage = lazy(() => import('@zeroweb/auth/Login'))

export default () => {

  const { afterLogin } = useContext(AuthContext)
  const navatate = useNavigate()
  const [searchParams] = useSearchParams()

  const login = useCallback(async (basicToken) => {
    return adminApi.authn.basicLogin(basicToken)
      .then((response) => response.data)
      .then((tokenInfo) => {
        setToken(tokenInfo)
        adminApi.authn.self()
          .then((response) => response.data)
          .then(afterLogin)
          .then(() => navatate(searchParams.get('redirectUrl') || '/', {
            replace: true,
          }))
      })
  }, [afterLogin, navatate, searchParams])

  return <LoginPage login={login} />
}