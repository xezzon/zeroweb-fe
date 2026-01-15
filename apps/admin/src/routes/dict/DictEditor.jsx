import { adminApi } from "@/api";
import { Form, Input, InputNumber, Modal, Switch } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";

/**
 * @param {Object} param0 
 * @param {import('@xezzon/zeroweb-sdk').Dict} param0.record
 * @param {(refresh: boolean) => void} param0.onClose
 */
export default function DictEditor({ record, onClose }) {
  /**
   * @type {[import('antd').FormInstance<import('@xezzon/zeroweb-sdk').Dict>]}
   */
  const [form] = Form.useForm()
  const [confirmLoading, setConfirmLoading] = useState(false)
  const { t } = useTranslation()
  const { t: tErrorCode } = useTranslation('error_code')
  const handleFinish = () => {
    const submit = record?.id ? adminApi.dict.modifyDict : adminApi.dict.addDict
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
      <Form.Item name="parentId" hidden>
        <Input />
      </Form.Item>
      <Form.Item name="tag" hidden>
        <Input />
      </Form.Item>
      <Form.Item
        name="code"
        label={t('dict.field.code')}
        rules={[
          { required: true, },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="label"
        label={t('dict.field.label')}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="ordinal"
        label={t('dict.field.ordinal')}
        tooltip={t('dict.tooltip.ordinal')}
        rules={[
          { required: true, },
        ]}
        initialValue={1}
      >
        <InputNumber />
      </Form.Item>
      <Form.Item
        name="enabled"
        label={t('dict.field.enabled')}
        rules={[
          { required: true, },
        ]}
        valuePropName="checked"
        initialValue={true}
      >
        <Switch
          checkedChildren={t('common.enabled')}
          unCheckedChildren={t('common.disabled')}
        />
      </Form.Item>
    </Modal>
  </>
}
