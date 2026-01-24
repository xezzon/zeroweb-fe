import { openApi } from '@/api/open';
import { PageContainer } from '@ant-design/pro-components';
import { Alert, Button, Form, Input, Modal, Popconfirm, Table, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

export default function ThirdPartyAppPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  /**
   * @type {import('antd').TableProps<import('@xezzon/zeroweb-sdk').ThirdPartyApp>['columns']}
   */
  const columns = [
    {
      dataIndex: 'name',
      title: t('app.column.name'),
    },
    {
      key: 'action',
      title: t('app.column.action'),
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => navigate(`/${record.id}/member`)}>
            {t('app.action.manageMember')}
          </Button>
          <Button type="link" onClick={() => navigate(`/${record.id}/subscription`)}>
            {t('app.action.subscribeApi')}
          </Button>
          <Popconfirm
            title={t('app.confirm.resetSecret')}
            onConfirm={() => {
              setLoading(true);
              openApi.thirdPartyApp
                .rollAccessSecret(record.id)
                .then((response) => response.data)
                .then(setAccessSecret)
                .finally(() => {
                  setLoading(false);
                });
            }}
          >
            <Button type="link">{t('app.action.resetSecret')}</Button>
          </Popconfirm>
        </>
      ),
    },
  ];
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [dataSource, setDataSource] = useState(
    /** @type {import('@xezzon/zeroweb-sdk').ThirdPartyApp[]} */ ([]),
  );
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const [record, setRecord] = useState(
    /** @type {import('@xezzon/zeroweb-sdk').ThirdPartyApp} */ (null),
  );
  const [accessSecret, setAccessSecret] = useState(
    /** @type {import('@xezzon/zeroweb-sdk').AccessSecret} */ (null),
  );

  const handleTableChange = (newPagination) => {
    if (pagination.pageSize != newPagination.pageSize) {
      newPagination.current = 1;
    }
    setPagination(newPagination);
  };

  useEffect(() => {
    setLoading(true);
    openApi.thirdPartyApp
      .listMyThirdPartyApp({
        top: pagination.pageSize,
        skip: (pagination.current - 1) * pagination.pageSize,
      })
      .then((response) => response.data)
      .then(({ content, page }) => {
        setDataSource(content);
        setPagination({
          ...pagination,
          total: page.totalElements,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [count, pagination.current, pagination.pageSize]);

  return (
    <>
      <PageContainer
        extra={
          <Button type="primary" onClick={() => setRecord({})}>
            {t('app.action.addApp')}
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={dataSource}
          rowKey="id"
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
        />
      </PageContainer>
      <ThirdPartyAppEditor
        record={record}
        onClose={(refresh, accessSecret) => {
          setRecord(null);
          if (accessSecret) {
            setAccessSecret(accessSecret);
          }
          if (refresh) {
            setCount(count + 1);
          }
        }}
      />
      <AccessSecretModal accessSecret={accessSecret} onClose={() => setAccessSecret(null)} />
    </>
  );
}

/**
 * @param {object} param0
 * @param {import('@xezzon/zeroweb-sdk').ThirdPartyApp} param0.record
 * @param {(refresh: boolean, accessSecret: import('@xezzon/zeroweb-sdk').AccessSecret) => void} param0.onClose
 */
function ThirdPartyAppEditor({ record, onClose }) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = useState(false);

  const handleFinish = () => {
    const submit = openApi.thirdPartyApp.addThirdPartyApp;
    setConfirmLoading(true);
    form
      .validateFields()
      .then(submit)
      .then((response) => response.data)
      .then((accessSecret) => onClose(true, accessSecret))
      .finally(() => {
        setConfirmLoading(false);
      });
  };

  return (
    <>
      <Modal
        open={!!record}
        destroyOnHidden
        confirmLoading={confirmLoading}
        onOk={handleFinish}
        onCancel={() => onClose(false)}
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
        <Form.Item name="name" label={t('app.column.name')} rules={[{ required: true }]}>
          <Input />
        </Form.Item>
      </Modal>
    </>
  );
}

/**
 * @param {object} param0
 * @param {object} param0.accessSecret
 * @param {string} param0.accessSecret.accessKey
 * @param {string} param0.accessSecret.secretKey
 * @param {() => void} onClose
 */
function AccessSecretModal({ accessSecret, onClose }) {
  const [countdown, setCountdown] = useState(0);
  const { t } = useTranslation();

  useEffect(() => {
    if (accessSecret) {
      setCountdown(60);
    }
  }, [accessSecret]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      onClose();
    }
  }, [countdown]);

  return (
    <>
      <Modal
        open={!!accessSecret}
        title={t('app.modal.newSecret')}
        closable={false}
        destroyOnHidden
        footer={[
          <Button onClick={onClose} key="close">
            {t('app.button.closeWithCount', { count: countdown })}
          </Button>,
        ]}
      >
        <Typography.Paragraph>
          <Typography.Text>Access Key: </Typography.Text>
          <Typography.Text code copyable>
            {accessSecret?.accessKey}
          </Typography.Text>
        </Typography.Paragraph>
        <Typography.Paragraph>
          <Typography.Text>Secret Key: </Typography.Text>
          <Typography.Text code copyable>
            {accessSecret?.secretKey}
          </Typography.Text>
        </Typography.Paragraph>
        <Alert type="info" title={t('app.alert.secretWarning')} />
      </Modal>
    </>
  );
}
