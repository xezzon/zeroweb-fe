import { adminApi } from "@/api";
import { Form, Input, Modal } from "antd";
import validator from "@rjsf/validator-ajv8";
import { useState } from "react";
import { useTranslation } from 'react-i18next'

/**
 * @param {Object} param0
 * @param {import('@xezzon/zeroweb-sdk').Setting} param0.record
 * @param {(refresh: boolean) => void} param0.onClose
 */
export default function SettingSchemaEditor({ record, onClose }) {
  const { t } = useTranslation()
  const exist = !!record?.id
  /**
   * @type {[import('antd').FormInstance<import('@xezzon/zeroweb-sdk').Setting>]}
   */
  const [form] = Form.useForm()
  const [confirmLoading, setConfirmLoading] = useState(false)
  const handleFinish = () => {
    const submit = exist ? adminApi.setting.updateSchema : adminApi.setting.addSetting
    setConfirmLoading(true)
    form.validateFields()
      .then(submit)
      .then(() => onClose(true))
      .finally(() => setConfirmLoading(false))
  }
  const handleCancel = () => onClose(false)

  return <>
    <Modal
      open={!!record}
      destroyOnHidden
      confirmLoading={confirmLoading}
      onOk={handleFinish}
      onCancel={handleCancel}
      modalRender={dom => <>
        <Form
          layout="vertical"
          initialValues={record}
          clearOnDestroy
          onFinish={handleFinish}
          form={form}
        >
          {dom}
        </Form>
      </>}
    >
      <Form.Item name="id" hidden>
        <Input />
      </Form.Item>
      <Form.Item
        name="code"
        label={t('setting.field.code')}
        rules={[
          { required: true, message: t('setting.placeholder.enterCode') },
        ]}
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
                  return Promise.reject(new Error(t('error.invalidJsonSchema') + validator.ajv.errorsText(validator.ajv.errors)));
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
        <Input.TextArea
          rows={6}
          placeholder={t('setting.placeholder.enterJsonSchema')}
        />
      </Form.Item>
      <Form.Item name="value" hidden>
        <Input />
      </Form.Item>
    </Modal>
  </>
}