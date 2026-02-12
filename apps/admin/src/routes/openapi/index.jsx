import { adminApi, openApi } from '@/api';
import { fileApi } from '@/api/file';
import { CloseCircleTwoTone } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { AttachmentStatus, checksum, OpenapiStatus } from '@xezzon/zeroweb-sdk';
import { RequirePermissions } from '@zeroweb/auth';
import { useDict } from '@zeroweb/dict';
import { Button, Form, Input, Modal, Popconfirm, Select, Table, theme, Upload } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

const DOCUMENT_ATTACHMENT_KEY = 'openapi-document';

export default function OpenapiPage() {
  const { t } = useTranslation();
  const { token: designToken } = theme.useToken();
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
        key: 'document',
        title: t('openapi.field.document'),
        render: (_, record) => {
          /**
           * @type {import('@xezzon/zeroweb-sdk').Attachment[]}
           */
          const attachments = record.document;
          if (!attachments) {
            return <CloseCircleTwoTone twoToneColor={designToken.colorError} />;
          }
          return attachments.map((attachment) => (
            <Button
              type="link"
              key={attachment.id}
              onClick={() => {
                fileApi.resolveDownloadUrl(attachment).then(({ endpoint, filename }) => {
                  const link = document.createElement('a');
                  link.href = endpoint;
                  link.download = filename;
                  link.target = '_blank';
                  link.click();
                });
              }}
            >
              {attachment.name}
            </Button>
          ));
        },
      },
      {
        key: 'action',
        title: t('common.action'),
        render: (_, record, index) => (
          <>
            <RequirePermissions required={['openapi:write']}>
              <Button type="link" onClick={() => setRecord(record)}>
                {t('common.edit')}
              </Button>
            </RequirePermissions>
            <DocumentUpload
              record={record}
              afterUpload={() => {
                fileApi.attachment
                  .queryAttachmentByBiz(DOCUMENT_ATTACHMENT_KEY, record.id)
                  .then((response) => response.data)
                  .then((attachments) => {
                    const openapi = { ...record, document: attachments };
                    dataSource.splice(index, 1, openapi);
                    setDataSource(dataSource);
                  });
              }}
            />
            {record.status === OpenapiStatus.DRAFT && (
              <RequirePermissions required={['openapi:publish']}>
                <Button
                  type="link"
                  onClick={() => {
                    setLoading(true);
                    openApi.openapi
                      .publishOpenapi(record.id)
                      .then(fetchData)
                      .finally(() => setLoading(false));
                  }}
                >
                  {t('openapi.publish')}
                </Button>
              </RequirePermissions>
            )}
            {record.status === OpenapiStatus.DRAFT && (
              <Popconfirm
                title={t('common.confirmDelete')}
                onConfirm={() => {
                  setLoading(true);
                  openApi.openapi
                    .deleteOpenapi(record.id)
                    .then(fetchData)
                    .finally(() => setLoading(false));
                }}
              >
                <RequirePermissions required={['openapi:write']}>
                  <Button type="link" danger>
                    {t('common.delete')}
                  </Button>
                </RequirePermissions>
              </Popconfirm>
            )}
          </>
        ),
      },
      // oxlint-disable-next-line exhaustive-deps
    ]),
    [mapOpenapiStatus],
  );
  const [dataSource, setDataSource] = useState(
    /** @type {import('@xezzon/zeroweb-sdk').Openapi[]} */ ([]),
  );
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

  const fetchData = async () => {
    setLoading(true);
    return openApi.openapi
      .getOpenapiList({
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
      .then(async (openapiList) => {
        setDataSource(openapiList);
        return Promise.all(
          openapiList.map((openapi) =>
            fileApi.attachment
              .queryAttachmentByBiz(DOCUMENT_ATTACHMENT_KEY, openapi.id)
              .then((response) => response.data)
              .then((attachments) => ({ ...openapi, document: attachments })),
          ),
        );
      })
      .then(setDataSource)
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
    // oxlint-disable-next-line exhaustive-deps
  }, [pagination.current, pagination.pageSize]);

  return (
    <>
      <PageContainer
        extra={
          <RequirePermissions required={['openapi:write']}>
            <Button type="primary" onClick={() => setRecord({ status: OpenapiStatus.DRAFT })}>
              {t('openapi.add')}
            </Button>
          </RequirePermissions>
        }
      >
        <Table
          columns={columns}
          dataSource={dataSource}
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
            fetchData();
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
    <Modal
      open={!!record}
      destroyOnHidden
      confirmLoading={confirmLoading}
      onOk={handleFinish}
      onCancel={handleCancel}
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
    >
      <Form.Item name="id" hidden />
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
  );
}

/**
 * @param {object} param0
 * @param {import('@xezzon/zeroweb-sdk').Openapi} param0.record
 * @param {() => void} param0.afterUpload
 */
function DocumentUpload({ record, afterUpload }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  // 从 record 中获取附件信息，避免重复查询
  /**
   * @type {import('@xezzon/zeroweb-sdk').Attachment[]}
   */
  const existingAttachments = record.document || [];

  /**
   * 处理上传逻辑
   * @param {File} file
   */
  const handleUpload = (file) => {
    setLoading(true);

    // 处理多个附件的情况：保留最后一个，其他删除
    const attachmentsToDelete = existingAttachments.slice(0, -1);
    attachmentsToDelete.forEach((attachment) => {
      fileApi.attachment.deleteAttachment(attachment.id);
    });

    // 如果存在附件且状态不是上传中，则将其删除
    const lastAttachment = existingAttachments[existingAttachments.length - 1];
    if (lastAttachment && lastAttachment?.status !== AttachmentStatus.UPLOADING) {
      fileApi.attachment.deleteAttachment(lastAttachment.id);
    }

    /**
     * @type {Promise<import('@xezzon/zeroweb-sdk').UploadInfo>}
     */
    let getUploadInfo = Promise.resolve();
    if (lastAttachment?.status === AttachmentStatus.UPLOADING) {
      // 文件已在上传，断点续传
      getUploadInfo = fileApi.attachment
        .getUploadInfo(lastAttachment.id, file.checksum, file.size)
        .then((response) => response.data);
    } else {
      // 文件为空，新增附件后上传
      getUploadInfo = fileApi.attachment
        .addAttachment(file, DOCUMENT_ATTACHMENT_KEY, record.id)
        .then((response) => response.data);
    }
    setLoading(true);
    getUploadInfo
      .then((uploadInfo) => fileApi.upload(file, uploadInfo))
      .then(afterUpload)
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Upload
      showUploadList={false}
      maxCount={1}
      accept=".json,.yaml,.yml"
      beforeUpload={(file) => checksum(file)}
      customRequest={({ file }) => {
        handleUpload(file);
      }}
    >
      <RequirePermissions required={['openapi:write']}>
        <Button type="link" loading={loading}>
          {t('openapi.uploadDocument')}
        </Button>
      </RequirePermissions>
    </Upload>
  );
}
