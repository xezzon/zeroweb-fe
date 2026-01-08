import { adminApi } from "@/api";
import { Form, Input, Modal } from "antd";
import validator from "@rjsf/validator-ajv8";
import { useState } from "react";

/**
 * @param {Object} param0
 * @param {import('@xezzon/zeroweb-sdk').Setting} param0.record
 * @param {(refresh: boolean) => void} param0.onClose
 */
export default function SettingSchemaEditor({ record, onClose }) {
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
        label="参数标识"
        rules={[
          { required: true, message: '请输入参数标识' },
        ]}
      >
        <Input placeholder="请输入参数标识" disabled={exist} />
      </Form.Item>
      <Form.Item
        name="schema"
        label="参数约束定义"
        rules={[
          { required: true, message: '请输入JSON Schema' },
          {
            validator: (_, value) => {
              try {
                const schema = JSON.parse(value);
                const valid = validator.ajv.validateSchema(schema);
                if (!valid) {
                  return Promise.reject(new Error('无效的 JSON Schema: ' + validator.ajv.errorsText(validator.ajv.errors)));
                }
                return Promise.resolve();
              } catch (e) {
                return Promise.reject(new Error('无效的 JSON'));
              }
            },
          },
        ]}
        validateTrigger="onBlur"
        tooltip="JSON Schema格式的参数约束定义"
      >
        <Input.TextArea
          rows={6}
          placeholder="请输入JSON Schema"
        />
      </Form.Item>
      <Form.Item name="value" hidden>
        <Input />
      </Form.Item>
    </Modal>
  </>
}