import type { HttpClient, Id, OData, Page, PResponse } from "@/types";

/**
 * 业务参数
 */
export interface Setting {
  /**
   * 主键
   */
  id: string;
  /**
   * 业务参数标识
   */
  code: string;
  /**
   * 参数约束定义
   * @see {@link https://json-schema.org/specification|JSON Schema}
   */
  schema: string;
  /**
   * 参数值
   */
  value: object;
  /**
   * 更新时间
   */
  updateTime: Date;
}

declare type AddSettingReq = Omit<Setting, 'id' | 'updateTime'>;
declare type UpdateSettingSchemaReq = Omit<Setting, 'code' | 'updateTime'>;
declare type UpdateSettingValueReq = Omit<Setting, 'code' | 'schema' | 'updateTime'>;

export interface SettingAPI {
  /**
   * 新增业务参数
   * @param setting 业务参数
   * @returns 业务参数ID 
   */
  addSetting: (setting: AddSettingReq) => PResponse<Id>;
  /**
   * 查询业务参数列表
   * @returns 业务参数列表
   */
  listSetting: (odata: OData) => PResponse<Page<Setting>>;
  /**
   * 根据 code 查询业务参数
   * @param code 业务参数标识
   * @returns 业务参数
   */
  querySettingByCode: (code: string) => PResponse<Setting>;
  /**
   * 更新业务参数信息
   * @param setting 业务参数信息
   */
  updateSchema: (setting: UpdateSettingSchemaReq) => PResponse<void>;
  /**
   * 更新业务参数信息
   * @param setting 业务参数信息
   */
  updateValue: (setting: UpdateSettingValueReq) => PResponse<void>;
  /**
   * 删除业务参数
   * @param id 业务参数ID
   */
  deleteSetting: (id: string) => PResponse<void>;
}

export default (client: HttpClient): SettingAPI => ({
  addSetting: (setting) => client.request({
    url: '/setting',
    method: 'POST',
    data: setting,
  }),
  listSetting: () => client.request({
    url: '/setting',
    method: 'GET',
  }),
  querySettingByCode: (code) => client.request({
    url: `/setting/${code}`,
    method: 'GET',
  }),
  updateSchema: (setting) => client.request({
    url: '/setting/schema',
    method: 'PUT',
    data: setting,
  }),
  updateValue: (setting) => client.request({
    url: '/setting/value',
    method: 'PUT',
    data: setting,
  }),
  deleteSetting: (id) => client.request({
    url: `/setting/${id}`,
    method: 'DELETE',
  }),
})