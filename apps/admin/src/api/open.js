import { ZerowebOpenClient } from "@xezzon/zeroweb-sdk";
import { authnInterceptor as authn } from "@zeroweb/auth";
import { alert } from "./interceptors";

export const openApi = ZerowebOpenClient({
  baseURL: import.meta.env.ZEROWEB_OPEN_API,
})

openApi.interceptors.request.use(authn)

openApi.interceptors.response.use(null, alert)
