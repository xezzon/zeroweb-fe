import { devApi } from '@/api/developer';
import { CheckOutlined, DownloadOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { RequirePermissions } from '@zeroweb/auth';
import { AutoComplete, Button, Form, Input, Modal, Popconfirm, Space, Table } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function LocalePage() {
  const { t } = useTranslation();
  const [namespaceList, setNamespaceList] = useState(
    /** @type {string[]} */
    ([]),
  );
  const [languageList, setLanguageList] = useState(
    /** @type {import('@xezzon/zeroweb-sdk').Language[]} */
    ([]),
  );
  const [messageList, setMessageList] = useState(
    /** @type {import('@xezzon/zeroweb-sdk').I18nMessage[]} */
    ([]),
  );
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [namespace, setNamespace] = useState(
    /** @type {string} */
    (null),
  );
  const [record, setRecord] = useState(
    /** @type {import('@xezzon/zeroweb-sdk').I18nMessage} */
    (null),
  );
  const [translationRecord, setTranslationRecord] = useState(
    /** @type {import('@xezzon/zeroweb-sdk').I18nMessage} */
    (null),
  );
  const [counter, setCounter] = useState(0);

  /**
   * @type {import('antd').TableProps['columns']}
   */
  const columns = [
    {
      dataIndex: 'messageKey',
      title: t('locale.field.messageKey'),
      fixed: 'start',
      ellipsis: true,
    },
    ...languageList
      .filter(({ enabled }) => enabled)
      .map((language) => ({
        dataIndex: language.languageTag,
        title: (
          <>
            {language.description}
            <Button type="link" icon={<DownloadOutlined />} onClick={() => {}} />
          </>
        ),
        width: '7rem',
        ellipsis: true,
      })),
    {
      key: 'action',
      title: t('common.action'),
      fixed: 'end',
      render: (_, record, index) => (
        <>
          <Button type="link" onClick={() => setRecord(record)}>
            {t('common.edit')}
          </Button>
          <Button type="link" onClick={() => setTranslationRecord({ ...record, index })}>
            {t('locale.translate')}
          </Button>
          <Popconfirm
            title={t('common.confirmDelete')}
            onConfirm={() =>
              devApi.locale.deleteI18nMessage(record.id).then(() => setCounter(counter + 1))
            }
          >
            {RequirePermissions({
              required: ['locale:write'],
              children: (
                <Button type="link" danger>
                  {t('common.delete')}
                </Button>
              ),
            })}
          </Popconfirm>
        </>
      ),
    },
  ];

  useEffect(() => {
    devApi.locale
      .listI18nNamespace()
      .then((response) => response.data)
      .then((namespaceList) => {
        setNamespaceList(namespaceList);
        if (!namespace && namespaceList.length) {
          setNamespace(namespaceList[0]);
        }
      });
  }, [counter]);

  useEffect(() => {
    devApi.locale
      .queryLanguageList()
      .then((response) => response.data)
      .then(setLanguageList);
  }, []);

  useEffect(() => {
    if (!namespace) {
      return;
    }
    devApi.locale
      .queryI18nMessageList(namespace, {
        top: pagination.pageSize,
        skip: (pagination.current - 1) * pagination.pageSize,
      })
      .then((response) => response.data)
      .then(({ content, page }) => {
        setPagination({
          ...pagination,
          total: page.totalElements,
        });
        return content;
      })
      .then((messageList) =>
        Promise.all(
          messageList.map((message) =>
            devApi.locale
              .queryTranslation(message.namespace, message.messageKey)
              .then((response) => response.data)
              .then((translation) => ({ ...message, ...translation })),
          ),
        ),
      )
      .then(setMessageList);
  }, [namespace, counter, pagination.current, pagination.pageSize]);

  return (
    <>
      <PageContainer
        tabList={namespaceList.map((namespace) => ({ tab: namespace, key: namespace }))}
        tabActiveKey={namespace}
        onTabChange={setNamespace}
        extra={
          <>
            <Button type="primary" onClick={() => setRecord({})}>
              {t('common.add')}
            </Button>
            <Button>{t('common.import')}</Button>
          </>
        }
      >
        <Table
          columns={columns}
          dataSource={messageList}
          rowKey="id"
          tableLayout="fixed"
          scroll={{ x: true }}
          onChange={(newPagination) => {
            if (pagination.pageSize != newPagination.pageSize) {
              newPagination.current = 1;
            }
            setPagination(newPagination);
          }}
        />
      </PageContainer>
      <I18nMessageEditor
        record={record}
        namespaceList={namespaceList}
        onClose={(refresh) => {
          if (refresh) {
            setCounter(counter + 1);
          }
          setRecord(null);
        }}
      />
      <TranslationEditor
        record={translationRecord}
        onClose={() => {
          devApi.locale
            .queryTranslation(namespace, translationRecord?.messageKey)
            .then((response) => response.data)
            .then((translation) => {
              setMessageList(
                messageList.toSpliced(translationRecord.index, 1, {
                  ...translationRecord,
                  ...translation,
                }),
              );
            });
          setTranslationRecord(null);
        }}
      />
      <TranslationImporter />
    </>
  );
}

/**
 * @param {object} param0
 * @param {import('@xezzon/zeroweb-sdk').I18nMessage} param0.record
 * @param {string[]} param0.namespaceList
 * @param {(refresh: boolean) => void} param0.onClose
 */
function I18nMessageEditor({ record, namespaceList, onClose }) {
  const { t } = useTranslation();
  const { t: tErrorCode } = useTranslation('error_code');
  /**
   * @type {[import('antd').FormInstance<import('@xezzon/zeroweb-sdk').I18nMessage>]}
   */
  const [form] = Form.useForm();

  const handleFinish = () => {
    const submit = record?.id ? devApi.locale.updateI18nMessage : devApi.locale.addI18nMessage;
    form
      .validateFields()
      .then(submit)
      .then(() => onClose(true))
      .catch((error) => {
        /**
         * @type {import('@xezzon/zeroweb-sdk').ErrorResult[]}
         */
        const details = error.details;
        if (!details) {
          return Promise.reject(error);
        }
        const fieldErrors = {};
        details.forEach(({ code, parameters }) => {
          fieldErrors[parameters.field] = [
            ...(fieldErrors[parameters.field] || []),
            tErrorCode(`detail.${code}`, parameters),
          ];
        });
        form.setFields(Object.entries(fieldErrors).map(([name, errors]) => ({ name, errors })));
        return Promise.reject(error);
      });
  };

  return (
    <Modal
      open={!!record}
      destroyOnHidden
      onOk={handleFinish}
      onCancel={() => onClose(false)}
      modalRender={(dom) => (
        <Form layout="vertical" initialValues={record} clearOnDestroy form={form}>
          {dom}
        </Form>
      )}
    >
      <Form.Item name="id" hidden>
        <Input />
      </Form.Item>
      <Form.Item name="namespace" label={t('locale.field.namespace')} rules={[{ required: true }]}>
        <AutoComplete
          options={namespaceList.map((namespace) => ({ value: namespace }))}
          showSearch={{
            filterOption: (inputValue, option) =>
              option.value.toUpperCase().includes(inputValue.toUpperCase()),
          }}
        />
      </Form.Item>
      <Form.Item
        name="messageKey"
        label={t('locale.field.messageKey')}
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>
    </Modal>
  );
}

/**
 * @param {object} param0
 * @param {import('@xezzon/zeroweb-sdk').I18nMessage} param0.record
 * @param {() => void} param0.onClose
 */
function TranslationEditor({ record, onClose }) {
  const { t } = useTranslation();
  const [languageList, setLanguageList] = useState(
    /** @type {import('@xezzon/zeroweb-sdk').Language[]} */
    ([]),
  );
  const [translation, setTranslation] = useState({});
  const [contents, setContents] = useState([]);

  useEffect(() => {
    devApi.locale
      .queryLanguageList()
      .then((response) => response.data)
      .then(setLanguageList);
  }, []);

  useEffect(() => {
    devApi.locale
      .queryTranslation(record?.namespace, record?.messageKey)
      .then((response) => response.data)
      .then(setTranslation);
  }, [record?.namespace, record?.messageKey]);

  useEffect(() => {
    const contents = languageList.map(({ languageTag }) => translation[languageTag]);
    setContents(contents);
  }, [translation, languageList]);

  return (
    <Modal
      open={!!record}
      destroyOnHidden
      closeIcon={false}
      modalRender={(dom) => (
        <Form
          initialValues={{ namespace: record?.namespace, messageKey: record?.messageKey }}
          clearOnDestroy
        >
          {dom}
        </Form>
      )}
      footer={
        <>
          <Button onClick={() => onClose()}>{t('common.close')}</Button>
        </>
      }
    >
      <Form.Item name="namespace" label={t('locale.field.namespace')}>
        <Input disabled />
      </Form.Item>
      <Form.Item name="messageKey" label={t('locale.field.messageKey')}>
        <Input disabled />
      </Form.Item>
      {languageList.map(({ languageTag, description }, index) => (
        <Form.Item key={languageTag} label={description}>
          <Space.Compact block>
            <Input.TextArea
              value={contents[index]}
              autoSize={true}
              onChange={(e) => {
                setContents(contents.toSpliced(index, 1, e.target.value));
              }}
            />
            <Button
              icon={<CheckOutlined />}
              disabled={translation[languageTag] === contents[index]}
              onClick={() => {
                devApi.locale
                  .upsertTranslation({
                    namespace: record?.namespace,
                    messageKey: record?.messageKey,
                    language: languageTag,
                    content: contents[index],
                  })
                  .then(() => {
                    setTranslation({
                      ...translation,
                      [languageTag]: contents[index],
                    });
                  });
              }}
            />
          </Space.Compact>
        </Form.Item>
      ))}
    </Modal>
  );
}

function TranslationImporter() {
  return <></>;
}
