import type { HttpClient, Id, OData, Page, PResponse } from "../types";

/**
 * 语言
 */
export interface Language {
  id: string;
  /**
   * 语言标签
   */
  languageTag: string;
  /**
   * 语言描述
   */
  description: string;
  /**
   * 排序号
   * 数值越小，排序越靠前
   */
  ordinal: number;
  /**
   * 启用状态
   */
  enabled: boolean;
}

/**
 * 国际化内容
 */
export interface I18nMessage {
  id: string;
  /**
   * 命名空间
   */
  namespace: string;
  /**
   * 国际化内容
   */
  messageKey: string;
}

/**
 * 国际化文本
 */
export interface Translation {
  id: string;
  /**
   * 命名空间
   */
  namespace: string;
  /**
   * 国际化内容
   */
  messageKey: string;
  /**
   * 语言
   */
  language: string;
  /**
   * 国际化文本
   */
  content: string;
}

/**
 * 新增语言
 */
declare type AddLanguageReq = Omit<Language, 'id'>;
/**
 * 新增国际化内容
 */
declare type AddI18nMessageReq = Omit<I18nMessage, 'id'>;
/**
 * 新增/更新国际化文本
 */
declare type UpsertTranslationReq = Omit<Translation, 'id'>;

export interface LocaleAPI {
  /**
   * 新增语言
   * @param language 语言
   */
  addLanguage: (language: AddLanguageReq) => PResponse<Id>;
  /**
   * 查询语言列表
   * @returns 语言列表
   */
  queryLanguageList: () => PResponse<Language[]>;
  /**
   * 更新语言
   * @param language 语言
   */
  updateLanguage: (language: Language) => PResponse<void>;
  /**
   * 删除语言
   * @param id 语言ID
   */
  deleteLanguage: (id: string) => PResponse<void>;
  /**
   * 新增国际化内容
   * @param i18nMessage 国际化内容
   */
  addI18nMessage: (i18nMessage: AddI18nMessageReq) => PResponse<Id>;
  /**
   * 列举国际化内容命名空间
   * @returns 国际化内容命名空间
   */
  listI18nNamespace: () => PResponse<string[]>;
  /**
   * 分页查询国际化内容
   * @param namespace 命名空间
   * @param odata 分页查询参数
   * @returns 国际化内容列表
   */
  queryI18nMessageList: (namespace: string, odata: OData) => PResponse<Page<I18nMessage>>;
  /**
   * 更新国际化内容
   * @param i18nMessage 国际化内容
   */
  updateI18nMessage: (i18nMessage: I18nMessage) => PResponse<void>;
  /**
   * 删除国际化内容
   * @param id 国际化内容ID
   */
  deleteI18nMessage: (id: string) => PResponse<void>;
  /**
   * 查询国际化文本
   * @param namespace 命名空间
   * @param messageKey 国际化内容
   * @returns 语言-国际化内容
   */
  queryTranslation: (namespace: string, messageKey: string) => PResponse<Map<string, string>>;
  /**
   * 新增/更新国际化文本
   * @param translation 国际化文本
   */
  upsertTranslation: (translation: UpsertTranslationReq) => PResponse<Id>;
  /**
   * 加载国际化资源
   * @param language 语言
   * @param namespace 命名空间
   * @returns 国际化内容-国际化文本
   */
  loadTranslation: (language: string, namespace: string) => PResponse<Map<string, string>>;
}

export default (client: HttpClient): LocaleAPI => ({
  addLanguage: (language: AddLanguageReq) => client.request({
    url: '/language',
    method: 'POST',
    data: language,
  }),
  queryLanguageList: () => client.request({
    url: '/language',
    method: 'GET',
  }),
  updateLanguage: (language: Language) => client.request({
    url: '/language',
    method: 'PUT',
    data: language,
  }),
  deleteLanguage: (id: string) => client.request({
    url: `/language/${id}`,
    method: 'DELETE',
  }),
  addI18nMessage: (i18nMessage: AddI18nMessageReq) => client.request({
    url: '/i18n',
    method: 'POST',
    data: i18nMessage,
  }),
  listI18nNamespace: () => client.request({
    url: '/i18n',
    method: 'GET',
  }),
  queryI18nMessageList: (namespace: string, odata: OData) => client.request({
    url: `/i18n/${namespace}`,
    method: 'GET',
    params: odata,
  }),
  updateI18nMessage: (i18nMessage: I18nMessage) => client.request({
    url: '/i18n',
    method: 'PUT',
    data: i18nMessage,
  }),
  deleteI18nMessage: (id: string) => client.request({
    url: `/i18n/${id}`,
    method: 'DELETE',
  }),
  queryTranslation: (namespace: string, messageKey: string) => client.request({
    url: `/i18n/${namespace}/${messageKey}`,
    method: 'GET',
  }),
  upsertTranslation: (translation: UpsertTranslationReq) => client.request({
    url: '/locale',
    method: 'PUT',
    data: translation,
  }),
  loadTranslation: (language: string, namespace: string) => client.request({
    url: `/locale/${language}/${namespace}`,
    method: 'GET',
  })
})