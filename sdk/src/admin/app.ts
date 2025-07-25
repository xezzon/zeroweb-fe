import { HttpClient, Id } from "@/types";

/**
 * 应用
 */
export interface App {
  /**
   * 应用ID
   */
  id: string;
  /**
   * 应用名称
   */
  name: string;
  /**
   * 应用基础访问路径
   */
  baseUrl: string;
  /**
   * 应用排序
   * 顺序越小越靠前
   */
  ordinal: string;
}

declare type AddAppReq = Omit<App, 'id'>;
declare type UpdateAppReq = App;

export default (client: HttpClient) => ({
  /**
   * 新增应用
   * @param app 应用
   * @returns 应用ID 
   */
  addApp: (app: AddAppReq) => client.request<Id>({
    url: '/app',
    method: 'POST',
    data: app,
  }),
  /**
   * 查询应用列表
   * @returns 应用列表
   */
  listApp: () => client.request<App[]>({
    url: '/app',
    method: 'GET',
  }),
  /**
   * 更新应用信息
   * @param app 应用信息
   */
  updateApp: (app: UpdateAppReq) => client.request<void>({
    url: '/app',
    method: 'PUT',
    data: app,
  }),
  /**
   * 删除应用
   * @param id 应用ID
   */
  deleteApp: (id: string) => client.request<void>({
    url: `/app/${id}`,
    method: 'DELETE',
  }),
})