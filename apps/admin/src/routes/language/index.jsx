import { devApi } from '@/api/developer';
import { PageContainer } from '@ant-design/pro-components';
import { RequirePermissions } from '@zeroweb/auth';
import { Form } from 'antd';
import { Modal } from 'antd';
import { Popconfirm } from 'antd';
import { Button, Table } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguagePage() {
  const { t } = useTranslation();
  const [dataSource, setDataSource] = useState(
    /** @type {import('@xezzon/zeroweb-sdk').Language[]} */
    ([]),
  );
  const [record, setRecord] = useState(
    /** @type {import('@xezzon/zeroweb-sdk').Language} */
    (null),
  );
  const [loading, setLoading] = useState(false);
  /**
   * @type {import('antd').TableProps<import('@xezzon/zeroweb-sdk').Language>['columns']}
   */
  const columns = [
    {
      dataIndex: 'languageTag',
      title: t('language.field.code'),
    },
    {
      dataIndex: 'description',
      title: t('language.field.description'),
    },
    {
      dataIndex: 'enabled',
      title: t('language.field.enabled'),
      render: (enabled) => t(`language.enabled.${enabled}`),
    },
    {
      key: 'action',
      title: t('common.action'),
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => setRecord(record)}>
            {t('common.edit')}
          </Button>
          <Popconfirm
            title={t('common.confirmDelete')}
            onConfirm={() => devApi.locale.deleteLanguage(record.id).then(fetchData)}
          >
            <RequirePermissions required={['locale:write']}>
              <Button type="link" danger disabled={!record.editable}>
                {t('common.delete')}
              </Button>
            </RequirePermissions>
          </Popconfirm>
        </>
      ),
    },
  ];

  const fetchData = () => {
    setLoading(true);
    devApi.locale
      .queryLanguageList()
      .then((response) => response.data)
      .then(setDataSource)
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <PageContainer
        extra={
          <>
            <RequirePermissions required={['locale:write']}>
              <Button type="primary" onClick={() => setRecord({})}>
                {t('language.addLanguage')}
              </Button>
            </RequirePermissions>
          </>
        }
      >
        <Table columns={columns} dataSource={dataSource} loading={loading} />
      </PageContainer>
      <LanguageEditor
        record={record}
        onClose={(refresh) => {
          setRecord(null);
          if (refresh) {
            loadData();
          }
        }}
      />
    </>
  );
}

/**
 * @param {object} param0
 * @param {import('@xezzon/zeroweb-sdk').Language} param0.record
 * @param {(refresh: boolean) => void} param0.onClose
 */
function LanguageEditor({ record, onClose }) {
  /**
   * @type {[import('antd').FormInstance<import('@xezzon/zeroweb-sdk').Language>]}
   */
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const handleFinish = () => {
    const submit = record?.id ? devApi.locale.updateLanguage : devApi.locale.addLanguage;
    setLoading(true);
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
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Modal
      open={!!record}
      destroyOnHidden
      confirmLoading={loading}
      onCancel={() => onClose(false)}
      modalRender={(dom) => (
        <Form
          layout="vertical"
          initialValues={record}
          clearOnDestroy
          onFinish={handleFinish}
          form={form}
        >
          {dom}
        </Form>
      )}
    ></Modal>
  );
}
