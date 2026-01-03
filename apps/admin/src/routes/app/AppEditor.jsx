import { adminApi } from "@/api";
import { Form, Input, InputNumber, Modal } from "antd";
import { useState } from "react";

/**
 * @param {Object} param0
 * @param {import('@xezzon/zeroweb-sdk').App} param0.record
 * @param {(refresh: boolean) => void} param0.onClose
 */
export default function AppEditor({ record, onClose }) {
  /**
   * @type {[import('antd').FormInstance<import('@xezzon/zeroweb-sdk').App>]}
   */
  const [form] = Form.useForm()
  const [confirmLoading, setConfirmLoading] = useState(false)
  const onOk = () => {
    const submit = record?.id ? adminApi.app.updateApp : adminApi.app.addApp
    setConfirmLoading(true)
    form.validateFields()
      .then(submit)
      .then(() => onClose(true))
      .finally(() => setConfirmLoading(false))
  }
  const onCancel = () => onClose(false)

  return <>
    <Modal
      open={!!record}
      destroyOnHidden
      confirmLoading={confirmLoading}
      onOk={onOk}
      onCancel={onCancel}
      modalRender={dom => <>
        <Form
          layout="vertical"
          initialValues={record}
          clearOnDestroy
          onFinish={onOk}
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
        name="name"
        label="应用名称"
        rules={[
          { required: true, },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="baseUrl"
        label="基础访问路径"
        rules={[
          { required: true, },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="ordinal"
        label="应用顺序"
        rules={[
          { required: true, },
        ]}
      >
        <InputNumber />
      </Form.Item>
    </Modal>
  </>
}
