import { adminApi } from '@/api';
import { PageContainer } from '@ant-design/pro-components';
import SchemaForm from '@rjsf/antd';
import validator from '@rjsf/validator-ajv8';
import { RequirePermissions } from '@zeroweb/auth';
import { Button, Form, Input, Modal, Popconfirm, Table } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function SettingPage() {
  const { t } = useTranslation();
  const [record, setRecord] = useState(/** @type {import('@xezzon/zeroweb-sdk').Setting} */ (null));
  const [valueRecord, setValueRecord] = useState(
    /** @type {import('@xezzon/zeroweb-sdk').Setting} */ (null),
  );

  const columns = useMemo(
    () => /** @type {import('antd').TableProps<import('@xezzon/zeroweb-sdk').Setting>['columns']} */ ([
      {
        dataIndex: 'code',
        title: t('setting.field.code'),
      },
      {
        dataIndex: 'value',
        title: t('setting.field.value'),
        render: (value) => (value ? JSON.stringify(value) : ''),
      },
      {
        dataIndex: 'updateTime',
        title: t('setting.field.updateTime'),
        render: (updateTime) => (updateTime ? dayjs(updateTime).format('YYYY-MM-DD HH:mm:ss') : ''),
      },
      {
        key: 'action',
        title: t('common.action'),
        render: (_, record) => (
          <>
            <RequirePermissions required={['setting:write']}>
              <Button type="link" onClick={() => setRecord(record)}>
                {t('setting.editSchema')}
              </Button>
            </RequirePermissions>
            <RequirePermissions required={['setting:read']}>
              <Button type="link" onClick={() => setValueRecord(record)}>
                {t('setting.editValue')}
              </Button>
            </RequirePermissions>
            <Popconfirm
              title={t('common.confirmDelete')}
              onConfirm={() =>
                adminApi.setting.deleteSetting(record.id).then(() => {
                  loadData();
                })
              }
            >
              {RequirePermissions({
                required: ['setting:write'],
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
      // oxlint-disable-next-line exhaustive-deps
    ]),
    [],
  );
  const [data, setData] = useState(/** @type {import('@xezzon/zeroweb-sdk').Setting[]} */ ([]));
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [loading, setLoading] = useState(false);

  const loadData = () => {
    setLoading(true);
    adminApi.setting
      .listSetting({
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

  const handleTableChange = (newPagination) => {
    if (pagination.pageSize != newPagination.pageSize) {
      newPagination.current = 1;
    }
    setPagination(newPagination);
  };

  useEffect(() => {
    loadData();
    // oxlint-disable-next-line exhaustive-deps
  }, [pagination.current, pagination.pageSize]);

  return (
    <>
      <PageContainer
        extra={
          <RequirePermissions required={['setting:write']}>
            <Button type="primary" onClick={() => setRecord({ value: {} })}>
              {t('setting.addSetting')}
            </Button>
          </RequirePermissions>
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
      <SettingSchemaEditor
        record={record}
        onClose={(refresh) => {
          setRecord(null);
          if (refresh) {
            loadData();
          }
        }}
      />
      <SettingValueEditor
        record={valueRecord}
        onClose={(refresh) => {
          setValueRecord(null);
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
 * @param {import('@xezzon/zeroweb-sdk').Setting} param0.record
 * @param {(refresh: boolean) => void} param0.onClose
 */
function SettingSchemaEditor({ record, onClose }) {
  const { t } = useTranslation();
  const exist = !!record?.id;
  /**
   * @type {[import('antd').FormInstance<import('@xezzon/zeroweb-sdk').Setting>]}
   */
  const [form] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const handleFinish = () => {
    const submit = exist ? adminApi.setting.updateSchema : adminApi.setting.addSetting;
    setConfirmLoading(true);
    form
      .validateFields()
      .then(submit)
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
        <Form.Item name="id" hidden>
          <Input />
        </Form.Item>
        <Form.Item
          name="code"
          label={t('setting.field.code')}
          rules={[{ required: true, message: t('setting.placeholder.enterCode') }]}
        >
          <Input placeholder={t('setting.placeholder.enterCode')} disabled={exist} />
        </Form.Item>
        <Form.Item
          name="schema"
          label={t('setting.field.schema')}
          rules={[
            { required: true, message: t('setting.placeholder.enterJsonSchema') },
            {
              validator: (_, value) => {
                try {
                  const schema = JSON.parse(value);
                  const valid = validator.ajv.validateSchema(schema);
                  if (!valid) {
                    return Promise.reject(
                      new Error(
                        t('error.invalidJsonSchema') +
                          validator.ajv.errorsText(validator.ajv.errors),
                      ),
                    );
                  }
                  return Promise.resolve();
                  // oxlint-disable-next-line no-unused-vars
                } catch (e) {
                  return Promise.reject(new Error(t('error.invalidJson')));
                }
              },
            },
          ]}
          validateTrigger="onBlur"
          tooltip={t('setting.tooltip.jsonSchema')}
        >
          <Input.TextArea rows={6} placeholder={t('setting.placeholder.enterJsonSchema')} />
        </Form.Item>
        <Form.Item name="value" hidden>
          <Input />
        </Form.Item>
      </Modal>
    </>
  );
}

/**
 * @param {Object} param0
 * @param {import('@xezzon/zeroweb-sdk').Setting} param0.record
 * @param {(refresh: boolean) => void} param0.onClose
 */
function SettingValueEditor({ record, onClose }) {
  const { t } = useTranslation();
  const schema = record?.schema ? JSON.parse(record?.schema) : {};

  const [confirmLoading, setConfirmLoading] = useState(false);
  const [value, setValue] = useState(record?.value);

  useEffect(() => {
    setValue(record?.value);
  }, [record?.value]);

  const handleFinish = () => {
    setConfirmLoading(true);
    adminApi.setting
      .updateValue({
        ...record,
        value,
      })
      .then(() => {
        onClose(true);
        setValue(null);
      })
      .finally(() => setConfirmLoading(false));
  };
  const handleCancel = () => {
    onClose(false);
    setValue(null);
  };

  return (
    <>
      <Modal
        open={!!record}
        destroyOnHidden
        confirmLoading={confirmLoading}
        onOk={handleFinish}
        onCancel={handleCancel}
      >
        <Form layout="vertical" initialValues={record} clearOnDestroy>
          <Form.Item name="code" label={t('setting.field.code')}>
            <Input disabled />
          </Form.Item>
        </Form>
        <SchemaForm
          schema={schema}
          formData={value}
          validator={validator}
          uiSchema={{ 'ui:submitButtonOptions': { norender: true } }}
          onChange={(e) => setValue(e.formData)}
        />
      </Modal>
    </>
  );
}
