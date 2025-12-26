import { adminApi } from "@/api";
import { Form, Input, Modal } from "antd";
import { useState } from "react";

/**
 * @param {Object} param0
 * @param {import('@xezzon/zeroweb').Setting} param0.record
 * @param {(refresh: boolean) => void} param0.onClose
 */
export default function SettingValueEditor({ record, onClose }) {
  /**
   * @type {[import('antd').FormInstance<import('@xezzon/zeroweb').Setting>]}
   */
  const [form] = Form.useForm()
  const [confirmLoading, setConfirmLoading] = useState(false)
  const handleFinish = () => {
    const submit = adminApi.setting.updateSetting
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
      <Form.Item
        name="code"
        label="参数标识"
      >
        <Input disabled />
      </Form.Item>
      <Form.Item
        name="value"
        label="参数值"
        rules={[
          { required: true, message: '请输入参数值' },
        ]}
        tooltip="JSON格式的参数值"
      >
        <Input.TextArea
          rows={6}
          placeholder="请输入参数值"
        />
      </Form.Item>
      <Form.Item name="schema" hidden>
        <Input />
      </Form.Item>

    </Modal>
  </>
}