import { adminApi } from '@/api';
import { Form, Input, InputNumber, Modal } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * @param {Object} param0
 * @param {import('@xezzon/zeroweb-sdk').App} param0.record
 * @param {(refresh: boolean) => void} param0.onClose
 */
export default function AppEditor({ record, onClose }) {
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
