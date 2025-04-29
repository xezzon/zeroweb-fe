import { HttpClient, Id, OData, Page, PResponse } from "../types";

/**
 * 字典
 */
export interface Dict {
  id: string;
  /**
   * 字典目
   */
  tag: string;
  /**
   * 字典键
   */
  code: string;
  /**
   * 字典值
   */
  label: string;
  /**
   * 排序号
   * 数值越小，顺序越靠前
   */
  ordinal: number;
  /**
   * 上级字典ID
   */
  parentId: string;
  /**
   * 是否启用
   */
  enabled: boolean;
  /**
   * 是否允许修改
   */
  readonly editable: boolean;
  /**
   * 下级字典列表
   */
  children?: Dict[];
}

/**
 * 新增字典
 */
declare type AddDictReq = Omit<Dict, 'id' | 'enabled' | 'editable' | 'children'>;
/**
 * 更新字典
 */
declare type ModifyDictReq = Omit<Dict, 'tag' | 'editable' | 'children'>;

export default (client: HttpClient) => ({
  /**
   * 新增字典
   * @param dict 字典
   */
  addDict: (dict: AddDictReq): PResponse<Id> => client.request({
    url: '/dict',
    method: 'POST',
    data: dict,
  }),
  /**
   * 分页查询字典目列表
   * @param odata 分页参数
   * @returns 字典目列表
   */
  getDictTagList: (odata: OData): PResponse<Page<Dict>> => client.request({
    url: '/dict',
    method: 'GET',
    params: odata,
  }),
  /**
   * 查询指定字典目下所有字典项的列表
   * @param tag 字典目编码
   * @returns 字典项列表（树形）
   */
  getDictTreeByTag: (tag: string): PResponse<Dict[]> => client.request({
    url: `/dict/tag/${tag}`,
    method: 'GET',
  }),
  /**
   * 更新字典目/字典项
   * @param dict 字典
   * @returns 
   */
  modifyDict: (dict: ModifyDictReq): PResponse<void> => client.request({
    url: '/dict',
    method: 'PUT',
    data: dict,
  }),
  /**
   * 批量更新字典状态
   * @param ids 字典ID集合
   * @param enabled 更新后的字典启用状态
   */
  updateDictStatus: (ids: string[], enabled: boolean): PResponse<void> => client.request({
    url: '/dict/update-status',
    method: 'PUT',
    params: {
      enabled,
    },
    data: ids,
  }),
  /**
   * 批量删除字典目/字典项
   * @param ids 字典ID集合
   */
  removeDict: (ids: string[]): PResponse<void> => client.request({
    url: '/dict',
    method: 'DELETE',
    data: ids,
  }),
})
