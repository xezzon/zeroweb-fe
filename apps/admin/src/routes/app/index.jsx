import { adminApi } from '@/api';
import { CheckCircleTwoTone, CloseCircleTwoTone } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { ZerowebMetadataClient } from '@xezzon/zeroweb-sdk';
import { RequirePermissions } from '@zeroweb/auth';
import { useDict } from '@zeroweb/dict';
import { Button, Form, Input, InputNumber, Modal, Popconfirm, Table, theme } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

export default function AppPage() {
  const { t } = useTranslation();
  const [record, setRecord] = useState(/** @type {import('@xezzon/zeroweb-sdk').App} */ (null));
  const { mapValue: mapServiceType } = useDict(adminApi.dict, 'ServiceType');
  const closeEditor = (refresh) => {
    setRecord(null);
    if (refresh) {
      fetchData();
    }
  };
  const deleteRecord = (id) =>
    adminApi.app.deleteApp(id).then(() => {
      fetchData();
    });
  const { token: designToken } = theme.useToken();
  const navigate = useNavigate();

  /**
   * @type {import('antd').TableProps<import('@xezzon/zeroweb-sdk').App>['columns']}
   */
  const columns = useMemo(
    () => /** @type {import('antd').TableProps<import('@xezzon/zeroweb-sdk').App>['columns']} */ ([
      {
        dataIndex: 'name',
        title: t('app.field.name'),
      },
      {
        dataIndex: 'baseUrl',
        title: t('app.field.baseUrl'),
      },
      {
        dataIndex: 'status',
        title: t('app.field.status'),
        render: (status) =>
          status ? (
            <CheckCircleTwoTone twoToneColor={designToken.colorSuccess} />
          ) : (
            <CloseCircleTwoTone twoToneColor={designToken.colorError} />
          ),
      },
      {
        dataIndex: 'type',
        title: t('app.field.type'),
        render: mapServiceType,
      },
      {
        dataIndex: 'version',
        title: t('app.field.version'),
      },
      {
        key: 'action',
        title: t('common.action'),
        render: (_, record) => (
          <>
            {record.status && (
              <Button
                type="link"
                onClick={() => {
                  navigate(`/app/${record.id}/menu`);
                }}
              >
                {t('app.viewMenu')}
              </Button>
            )}
            <RequirePermissions required={['app:write']}>
              <Button type="link" onClick={() => setRecord(record)}>
                {t('common.edit')}
              </Button>
            </RequirePermissions>
            <Popconfirm title={t('common.confirmDelete')} onConfirm={() => deleteRecord(record.id)}>
              <RequirePermissions required={['app:write']}>
                <Button type="link" danger>
                  {t('common.delete')}
                </Button>
              </RequirePermissions>
            </Popconfirm>
          </>
        ),
      },
      // oxlint-disable-next-line eslint-plugin-react-hooks/exhaustive-deps
    ]),
    [mapServiceType],
  );
  const [data, setData] = useState(/** @type {import('@xezzon/zeroweb-sdk').App[]} */ ([]));
  const [loading, setLoading] = useState(false);

  const fetchData = () => {
    setLoading(true);
    adminApi.app
      .listApp()
      .then((response) => response.data)
      .then((apps) =>
        Promise.all(
          apps.map((app) =>
            ZerowebMetadataClient({ baseURL: app.baseUrl })
              .loadServiceInfo()
              .then((response) => ({ ...response.data, status: true }))
              .catch(() => Promise.resolve({ status: false }))
              .then((serviceInfo) => ({ ...app, ...serviceInfo })),
          ),
        ),
      )
      .then(setData)
      .finally(() => setLoading(false));
  };
  useEffect(fetchData, []);

  return (
    <>
      <PageContainer
        extra={
          <>
            <RequirePermissions required={['app:write']}>
              <Button type="primary" onClick={() => setRecord({})}>
                {t('app.addApp')}
              </Button>
            </RequirePermissions>
          </>
        }
      >
        <Table columns={columns} dataSource={data} loading={loading} rowKey="id" search={false} />
        <AppEditor record={record} onClose={closeEditor} />
      </PageContainer>
    </>
  );
}

/**
 * @param {Object} param0
 * @param {import('@xezzon/zeroweb-sdk').App} param0.record
 * @param {(refresh: boolean) => void} param0.onClose
 */
function AppEditor({ record, onClose }) {
  /**
   * @type {[import('antd').FormInstance<import('@xezzon/zeroweb-sdk').App>]}
   */
  const [form] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const { t } = useTranslation();
  const { t: tErrorCode } = useTranslation('error_code');
  const onOk = () => {
    const submit = record?.id ? adminApi.app.updateApp : adminApi.app.addApp;
    setConfirmLoading(true);
    form
      .validateFields()
      .then(submit)
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
      .then(() => onClose(true))
      .finally(() => setConfirmLoading(false));
  };
  const onCancel = () => onClose(false);

  return (
    <>
      <Modal
        open={!!record}
        destroyOnHidden
        confirmLoading={confirmLoading}
        onOk={onOk}
        onCancel={onCancel}
        modalRender={(dom) => (
          <>
            <Form
              layout="vertical"
              initialValues={record}
              clearOnDestroy
              onFinish={onOk}
              form={form}
            >
              {dom}
            </Form>
          </>
        )}
      >
        <Form.Item name="id" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="name" label={t('app.field.name')} rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="baseUrl" label={t('app.field.baseUrl')} rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="ordinal" label={t('app.field.ordinal')} rules={[{ required: true }]}>
          <InputNumber />
        </Form.Item>
      </Modal>
    </>
  );
}
