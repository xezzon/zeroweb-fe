import { adminApi } from '@/api';
import { PageContainer } from '@ant-design/pro-components';
import { RequirePermissions } from '@zeroweb/auth';
import {
  Button,
  Drawer,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Switch,
  Table,
  Tag,
} from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function DictTagPage() {
  const { t } = useTranslation();
  const [tag, setTag] = useState(/** @type {import('@xezzon/zeroweb-sdk').Dict} */ (null));
  const [record, setRecord] = useState(/** @type {import('@xezzon/zeroweb-sdk').Dict} */ (null));

  const columns = useMemo(
    () => /** @type {import('antd').TableProps<import('@xezzon/zeroweb-sdk').Dict>['columns']} */ ([
      {
        dataIndex: 'code',
        title: t('dict.field.code'),
      },
      {
        dataIndex: 'label',
        title: t('dict.field.label'),
      },
      {
        key: 'action',
        title: t('common.action'),
        render: (_, record) => (
          <>
            <RequirePermissions required={['dict:read']}>
              <Button type="link" onClick={() => setTag(record)}>
                {t('common.view')}
              </Button>
            </RequirePermissions>
            <RequirePermissions required={['dict:write']}>
              <Button type="link" disabled={!record.editable} onClick={() => setRecord(record)}>
                {t('common.edit')}
              </Button>
            </RequirePermissions>
            <Popconfirm
              title={t('common.confirmDelete')}
              onConfirm={() =>
                adminApi.dict.removeDict([record.id]).then(() => {
                  loadData();
                })
              }
            >
              <RequirePermissions required={['dict:write']}>
                <Button type="link" danger disabled={!record.editable}>
                  {t('common.delete')}
                </Button>
              </RequirePermissions>
            </Popconfirm>
          </>
        ),
      },
      // oxlint-disable-next-line exhaustive-deps
    ]),
    [],
  );
  const [data, setData] = useState(/** @type {import('@xezzon/zeroweb-sdk').Dict[]} */ ([]));
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

  const loadData = () => {
    setLoading(true);
    adminApi.dict
      .getDictTagList({
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
          <>
            <RequirePermissions required={['dict:write']}>
              <Button type="primary" onClick={() => setRecord({ tag: 'DICT', parentId: '0' })}>
                {t('dict.addDict')}
              </Button>
            </RequirePermissions>
          </>
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
      <DictList tag={tag} onClose={() => setTag(null)} />
      <DictEditor
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
 * @param {import('@xezzon/zeroweb-sdk').Dict} param0.record
 * @param {(refresh: boolean) => void} param0.onClose
 */
function DictEditor({ record, onClose }) {
  /**
   * @type {[import('antd').FormInstance<import('@xezzon/zeroweb-sdk').Dict>]}
   */
  const [form] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const { t } = useTranslation();
  const { t: tErrorCode } = useTranslation('error_code');
  const handleFinish = () => {
    const submit = record?.id ? adminApi.dict.modifyDict : adminApi.dict.addDict;
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
        <Form.Item name="parentId" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="tag" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="code" label={t('dict.field.code')} rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="label" label={t('dict.field.label')}>
          <Input />
        </Form.Item>
        <Form.Item
          name="ordinal"
          label={t('dict.field.ordinal')}
          tooltip={t('dict.tooltip.ordinal')}
          rules={[{ required: true }]}
          initialValue={1}
        >
          <InputNumber />
        </Form.Item>
        <Form.Item
          name="enabled"
          label={t('dict.field.enabled')}
          rules={[{ required: true }]}
          valuePropName="checked"
          initialValue={true}
        >
          <Switch checkedChildren={t('common.enabled')} unCheckedChildren={t('common.disabled')} />
        </Form.Item>
      </Modal>
    </>
  );
}

/**
 * @param {Object} param0
 * @param {import('@xezzon/zeroweb-sdk').Dict} param0.tag
 * @param {(refresh: boolean) => void} param0.onClose
 */
function DictList({ tag, onClose }) {
  const { t } = useTranslation();
  const [record, setRecord] = useState(/** @type {import('@xezzon/zeroweb-sdk').Dict} */ (null));

  const columns = useMemo(
    () => /** @type {import('antd').TableProps<import('@xezzon/zeroweb-sdk').Dict>['columns']} */ ([
      {
        dataIndex: 'code',
        title: t('dict.field.code'),
      },
      {
        dataIndex: 'label',
        title: t('dict.field.label'),
      },
      {
        dataIndex: 'enabled',
        title: t('dict.field.enabled'),
        render: (enabled) =>
          enabled ? (
            <Tag color="success">{t('common.enabled')}</Tag>
          ) : (
            <Tag color="error">{t('common.disabled')}</Tag>
          ),
      },
      {
        key: 'action',
        title: t('common.action'),
        render: (_, record) => (
          <>
            <RequirePermissions required={['dict:write']}>
              <Button type="link" disabled={!record.editable} onClick={() => setRecord(record)}>
                {t('common.edit')}
              </Button>
            </RequirePermissions>
            <RequirePermissions required={['dict:write']}>
              <Button
                type="link"
                disabled={!record.editable}
                onClick={() => setRecord({ tag: tag?.code, parentId: record.id })}
              >
                {t('dict.addDict')}
              </Button>
            </RequirePermissions>
            <RequirePermissions required={['dict:write']}>
              <Button
                type="link"
                onClick={() =>
                  adminApi.dict
                    .updateDictStatus([record.id], !record.enabled)
                    .then(() => fetchData())
                }
              >
                {record.enabled ? t('common.disable') : t('common.enable')}
              </Button>
            </RequirePermissions>
            <Popconfirm
              title={t('common.confirmDelete')}
              onConfirm={() => adminApi.dict.removeDict([record.id]).then(() => fetchData())}
            >
              <RequirePermissions required={['dict:write']}>
                <Button type="link" danger disabled={!record.editable}>
                  {t('common.delete')}
                </Button>
              </RequirePermissions>
            </Popconfirm>
          </>
        ),
      },
      // oxlint-disable-next-line exhaustive-deps
    ]),
    [tag],
  );
  const [data, setData] = useState(/** @type {import('@xezzon/zeroweb-sdk').Dict[]} */ ([]));

  const fetchData = () => {
    if (!tag?.code) {
      return;
    }
    adminApi.dict
      .getDictTreeByTag(tag.code)
      .then((response) => response.data)
      .then(setData);
  };
  useEffect(fetchData, [tag?.code]);

  return (
    <>
      <Drawer open={!!tag} destroyOnHidden title={tag?.code} size="large" onClose={onClose}>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          search={false}
          title={() => (
            <Flex justify="flex-end">
              <RequirePermissions required={['dict:write']}>
                <Button
                  type="primary"
                  disabled={!tag?.editable}
                  onClick={() => setRecord({ tag: tag.code, parentId: tag.id })}
                >
                  {t('dict.addDict')}
                </Button>
              </RequirePermissions>
            </Flex>
          )}
        />
      </Drawer>
      <DictEditor
        record={record}
        onClose={(refresh) => {
          setRecord(null);
          if (refresh) {
            fetchData();
          }
        }}
      />
    </>
  );
}
