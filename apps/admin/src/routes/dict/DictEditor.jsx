import { adminApi } from "@/api";
import { Form, Input, InputNumber, Modal, Switch } from "antd";
import { useState } from "react";

/**
 * @param {Object} param0 
 * @param {import('@xezzon/zeroweb').Dict} param0.record
 * @param {(refresh: boolean) => void} param0.onClose
 */
export default function DictEditor({ record, onClose }) {
  /**
   * @type {[import('antd').FormInstance<import('@xezzon/zeroweb').Dict>]}
   */
  const [form] = Form.useForm()
  const [confirmLoading, setConfirmLoading] = useState(false)
  const handleFinish = () => {
    const submit = record?.id ? adminApi.dict.modifyDict : adminApi.dict.addDict
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
        label="字典键"
        rules={[
          { required: true, },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="label"
        label="字典值"
        rules={[
          { required: true, },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="ordinal"
        label="顺序"
        tooltip="顺序越小越靠前"
        rules={[
          { required: true, },
        ]}
      >
        <InputNumber defaultValue={1} />
      </Form.Item>
      <Form.Item
        name="enabled"
        label="启用状态"
        rules={[
          { required: true, },
        ]}
      >
        <Switch
          defaultValue={true}
          checkedChildren="启用"
          unCheckedChildren="禁用"
        />
      </Form.Item>
    </Modal>
  </>
}
