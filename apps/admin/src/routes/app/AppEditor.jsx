import { Form, Input, InputNumber, Modal } from "antd";
import { useCallback } from "react";

/**
 * @param {Object} param0
 * @param {import('@xezzon/zeroweb').App} param0.record
 * @param {(refresh: boolean) => void} param0.onClose
 */
export default ({ record, onClose }) => {
  /**
   * @type {[import('antd').FormInstance<import('@xezzon/zeroweb').App>]}
   */
  const [form] = Form.useForm()
  const onOk = useCallback(() => {
    form.validateFields()
      .then((value) => console.debug(value))
      .then(() => onClose(true))
  }, [form, onClose])
  const onCancel = useCallback(() => {
    onClose(false)
  }, [onClose])
  
  return <>
    <Modal 
      open={!!record}
      destroyOnHidden
      onOk={onOk}
      onCancel={onCancel}
      modalRender={dom => <>
        <Form
          layout="vertical"
          initialValues={record}
          onFinish={onOk}
          form={form}
        >
          {dom}
        </Form>
      </>}
    >
      <Form.Item name="name" label="应用名称" required>
        <Input />
      </Form.Item>
      <Form.Item name="baseUrl" label="基础访问路径" required>
        <Input />
      </Form.Item>
      <Form.Item name="ordinal" label="应用顺序" required>
        <InputNumber />
      </Form.Item>
    </Modal>
  </>
}
