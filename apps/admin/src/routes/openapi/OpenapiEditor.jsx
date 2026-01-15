import { adminApi, openApi } from "@/api";
import { OpenapiStatus } from "@xezzon/zeroweb-sdk";
import { useDict } from "@zeroweb/dict";
import { Form, Input, Modal, Select } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";

/**
 * @param {Object} param0
 * @param {import('@xezzon/zeroweb-sdk').Openapi} param0.record
 * @param {(refresh: boolean) => void} param0.onClose
 */
export default function OpenapiEditor({ record, onClose }) {
  /**
   * @type {[import('antd').FormInstance<import('@xezzon/zeroweb-sdk').Openapi>]}
   */
  const [form] = Form.useForm()
  const [confirmLoading, setConfirmLoading] = useState(false)
  const { t } = useTranslation()
  const { t: tErrorCode } = useTranslation('error_code')
  const { dict: httpMethodDict } = useDict(adminApi.dict, 'HttpMethod')
  const handleFinish = () => {
    const submit = record?.id ? openApi.openapi.modifyOpenapi : openApi.openapi.addOpenapi
    setConfirmLoading(true)
    form.validateFields()
      .then(submit)
      .catch(error => {
        /**
         * @type {import('@xezzon/zeroweb-sdk').ErrorResult[]}
         */
        const details = error.details
        if (!details) {
          return Promise.reject(error)
        }
        const fieldErrors = {}
        details.forEach(({ code, parameters }) => {
          fieldErrors[parameters.field] = [
            ...(fieldErrors[parameters.field] || []),
            tErrorCode(`detail.${code}`, parameters),
          ]
        })
        form.setFields(
          Object.entries(fieldErrors).map(([name, errors]) => ({ name, errors }))
        )
        return Promise.reject(error)
      })
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
        label={t('openapi.field.code')}
        rules={[
          { required: true, },
        ]}
      >
        <Input disabled={record?.status !== OpenapiStatus.DRAFT} />
      </Form.Item>
      <Form.Item
        name="destination"
        label={t('openapi.field.destination')}
        rules={[
          { required: true, },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="httpMethod"
        label={t('openapi.field.httpMethod')}
        rules={[
          { required: true, },
        ]}
      >
        <Select
          options={httpMethodDict.map(({ code, label }) => ({ value: code, label }))}
        />
      </Form.Item>
    </Modal>
  </>
}