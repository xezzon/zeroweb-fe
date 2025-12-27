import { adminApi } from "@/api";
import SchemaForm from '@rjsf/antd';
import validator from '@rjsf/validator-ajv8';
import { Form, Input, Modal } from "antd";
import { useEffect, useState } from "react";

/**
 * @param {Object} param0
 * @param {import('@xezzon/zeroweb-sdk').Setting} param0.record
 * @param {(refresh: boolean) => void} param0.onClose
 */
export default function SettingValueEditor({ record, onClose }) {
  const schema = record?.schema ? JSON.parse(record?.schema) : {}

  const [confirmLoading, setConfirmLoading] = useState(false)
  const [value, setValue] = useState(record?.value)

  useEffect(() => {
    setValue(record?.value)
  }, [record?.value])

  const handleFinish = () => {
    setConfirmLoading(true)
    adminApi.setting.updateValue({
      ...record,
      value,
    })
      .then(() => {
        onClose(true)
        setValue(null)
      })
      .finally(() => setConfirmLoading(false))
  }
  const handleCancel = () => {
    onClose(false)
    setValue(null)
  }

  return <>
    <Modal
      open={!!record}
      destroyOnHidden
      confirmLoading={confirmLoading}
      onOk={handleFinish}
      onCancel={handleCancel}
    >
      <Form
        layout="vertical"
        initialValues={record}
        clearOnDestroy
      >
        <Form.Item
          name="code"
          label="参数标识"
        >
          <Input disabled />
        </Form.Item>
      </Form>
      <SchemaForm
        schema={schema}
        formData={value}
        validator={validator}
        uiSchema={{ "ui:submitButtonOptions": { "norender": true } }}
        onChange={(e) => setValue(e.formData)}
      />
    </Modal>
  </>
}