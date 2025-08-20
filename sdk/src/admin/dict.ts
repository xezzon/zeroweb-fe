import { HttpClient, Id, OData, Page, PResponse } from "@/types";

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

export interface DictAPI {
  /**
   * 新增字典
   * @param dict 字典
   */
  addDict: (dict: AddDictReq) => PResponse<Id>;
  /**
   * 分页查询字典目列表
   * @param odata 分页参数
   * @returns 字典目列表
   */
  getDictTagList: (odata: OData) => PResponse<Page<Dict>>;
  /**
   * 查询指定字典目下所有字典项的列表
   * @param tag 字典目编码
   * @returns 字典项列表（树形）
   */
  getDictTreeByTag: (tag: string) => PResponse<Dict[]>;
  /**
   * 更新字典目/字典项
   * @param dict 字典
   * @returns 
   */
  modifyDict: (dict: ModifyDictReq) => PResponse<void>;
  /**
   * 批量更新字典状态
   * @param ids 字典ID集合
   * @param enabled 更新后的字典启用状态
   */
  updateDictStatus: (ids: string[], enabled: boolean) => PResponse<void>;
  /**
   * 批量删除字典目/字典项
   * @param ids 字典ID集合
   */
  removeDict: (ids: string[]) => PResponse<void>;
}

export default (client: HttpClient): DictAPI => ({
  addDict: (dict: AddDictReq) => client.request<Id>({
    url: '/dict',
    method: 'POST',
    data: dict,
  }),
  getDictTagList: (odata: OData) => client.request<Page<Dict>>({
    url: '/dict',
    method: 'GET',
    params: odata,
  }),
  getDictTreeByTag: (tag: string) => client.request<Dict[]>({
    url: `/dict/tag/${tag}`,
    method: 'GET',
  }),
  modifyDict: (dict: ModifyDictReq) => client.request<void>({
    url: '/dict',
    method: 'PUT',
    data: dict,
  }),
  updateDictStatus: (ids: string[], enabled: boolean) => client.request<void>({
    url: '/dict/update-status',
    method: 'PUT',
    params: {
      enabled,
    },
    data: ids,
  }),
  removeDict: (ids: string[]) => client.request<void>({
    url: '/dict',
    method: 'DELETE',
    data: ids,
  }),
})
