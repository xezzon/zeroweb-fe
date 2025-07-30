import { HttpClient, Id, PResponse } from "@/types";

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

export interface AppAPI {
  /**
   * 新增应用
   * @param app 应用
   * @returns 应用ID 
   */
  addApp: (app: AddAppReq) => PResponse<Id>;
  /**
   * 查询应用列表
   * @returns 应用列表
   */
  listApp: () => PResponse<App[]>;
  /**
   * 更新应用信息
   * @param app 应用信息
   */
  updateApp: (app: UpdateAppReq) => PResponse<void>;
  /**
   * 删除应用
   * @param id 应用ID
   */
  deleteApp: (id: string) => PResponse<void>;
}

export default (client: HttpClient): AppAPI => ({
  addApp: (app: AddAppReq) => client.request<Id>({
    url: '/app',
    method: 'POST',
    data: app,
  }),
  listApp: () => client.request<App[]>({
    url: '/app',
    method: 'GET',
  }),
  updateApp: (app: UpdateAppReq) => client.request<void>({
    url: '/app',
    method: 'PUT',
    data: app,
  }),
  deleteApp: (id: string) => client.request<void>({
    url: `/app/${id}`,
    method: 'DELETE',
  }),
})