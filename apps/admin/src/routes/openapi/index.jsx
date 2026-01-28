import { adminApi, openApi } from '@/api';
import { PageContainer } from '@ant-design/pro-components';
import { OpenapiStatus } from '@xezzon/zeroweb-sdk';
import { useDict } from '@zeroweb/dict';
import { Button, Form, Input, Modal, Popconfirm, Select, Table } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function OpenapiPage() {
  const { t } = useTranslation();
  const [record, setRecord] = useState(/** @type {import('@xezzon/zeroweb-sdk').Openapi} */ (null));
  const { mapValue: mapOpenapiStatus } = useDict(adminApi.dict, 'OpenapiStatus');

  const columns = useMemo(
    () => /** @type {import('antd').TableProps<import('@xezzon/zeroweb-sdk').Openapi>['columns']} */ ([
      {
        dataIndex: 'code',
        title: t('openapi.field.code'),
      },
      {
        dataIndex: 'destination',
        title: t('openapi.field.destination'),
      },
      {
        dataIndex: 'httpMethod',
        title: t('openapi.field.httpMethod'),
      },
      {
        dataIndex: 'status',
        title: t('openapi.field.status'),
        render: mapOpenapiStatus,
      },
      {
        key: 'action',
        title: t('common.action'),
        render: (_, record) => (
          <>
            <Button type="link" onClick={() => setRecord(record)}>
              {t('common.edit')}
            </Button>
            {record.status === OpenapiStatus.DRAFT && (
              <>
                <Button
                  type="link"
                  onClick={() => {
                    setLoading(true);
                    openApi.openapi
                      .publishOpenapi(record.id)
                      .then(loadData)
                      .finally(() => setLoading(false));
                  }}
                >
                  {t('openapi.publish')}
                </Button>
                <Popconfirm
                  title={t('common.confirmDelete')}
                  onConfirm={() => {
                    setLoading(true);
                    openApi.openapi
                      .deleteOpenapi(record.id)
                      .then(loadData)
                      .finally(() => setLoading(false));
                  }}
                >
                  <Button type="link" danger>
                    {t('common.delete')}
                  </Button>
                </Popconfirm>
              </>
            )}
          </>
        ),
      },
      // oxlint-disable-next-line exhaustive-deps
    ]),
    [mapOpenapiStatus],
  );
  const [data, setData] = useState(/** @type {import('@xezzon/zeroweb-sdk').Openapi[]} */ ([]));
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [loading, setLoading] = useState(false);

  const handleTableChange = (newPagination) => {
    if (pagination.pageSize != newPagination.pageSize) {
      newPagination.current = 1;
    }
    setPagination(newPagination);
  };

  const loadData = async () => {
    setLoading(true);
    return openApi.openapi
      .getOpenapiList({
        top: pagination.pageSize,
        skip: (pagination.current - 1) * pagination.pageSize,
      })
      .then((response) => response.data)
      .then(({ content, page }) => {
        setData(content);
        setPagination({
          ...pagination,
          total: page.totalElements,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
    // oxlint-disable-next-line exhaustive-deps
  }, [pagination.current, pagination.pageSize]);

  return (
    <>
      <PageContainer
        extra={
          <Button type="primary" onClick={() => setRecord({ status: OpenapiStatus.DRAFT })}>
            {t('openapi.add')}
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="id"
          search={false}
          pagination={pagination}
          onChange={handleTableChange}
        />
      </PageContainer>
      <OpenapiEditor
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
 * @param {Object} param0
 * @param {import('@xezzon/zeroweb-sdk').Openapi} param0.record
 * @param {(refresh: boolean) => void} param0.onClose
 */
function OpenapiEditor({ record, onClose }) {
  /**
   * @type {[import('antd').FormInstance<import('@xezzon/zeroweb-sdk').Openapi>]}
   */
  const [form] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const { t } = useTranslation();
  const { t: tErrorCode } = useTranslation('error_code');
  const { dict: httpMethodDict } = useDict(adminApi.dict, 'HttpMethod');
  const handleFinish = () => {
    const submit = record?.id ? openApi.openapi.modifyOpenapi : openApi.openapi.addOpenapi;
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
  const handleCancel = () => onClose(false);

  return (
    <>
      <Modal
        open={!!record}
        destroyOnHidden
        confirmLoading={confirmLoading}
        onOk={handleFinish}
        onCancel={handleCancel}
        modalRender={(dom) => (
          <>
            <Form
              layout="vertical"
              initialValues={record}
              clearOnDestroy
              onFinish={handleFinish}
              form={form}
            >
              {dom}
            </Form>
          </>
        )}
      >
        <Form.Item name="code" label={t('openapi.field.code')} rules={[{ required: true }]}>
          <Input disabled={record?.status !== OpenapiStatus.DRAFT} />
        </Form.Item>
        <Form.Item
          name="destination"
          label={t('openapi.field.destination')}
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="httpMethod"
          label={t('openapi.field.httpMethod')}
          rules={[{ required: true }]}
        >
          <Select options={httpMethodDict.map(({ code, label }) => ({ value: code, label }))} />
        </Form.Item>
      </Modal>
    </>
  );
}
