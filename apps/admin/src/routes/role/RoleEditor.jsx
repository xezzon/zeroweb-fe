import { adminApi } from "@/api";
import { Form, Input, Modal, Select, Switch } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

/**
 * @param {Object} param0
 * @param {import('@xezzon/zeroweb-sdk').Role} param0.record
 * @param {(refresh: boolean) => void} param0.onClose
 */
export default function RoleEditor({ record, onClose }) {
  /**
   * @type {[import('antd').FormInstance<import('@xezzon/zeroweb-sdk').AddRoleReq>]}
   */
  const [form] = Form.useForm()
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [roles, setRoles] = useState(/** @type {import('@xezzon/zeroweb-sdk').Role[]} */([]))
  const { t } = useTranslation()
  const { t: tErrorCode } = useTranslation('error_code')

  useEffect(() => {
    adminApi.role.listAllRole()
      .then(response => response.data)
      .then(setRoles)
  }, [])

  const onOk = () => {
    setConfirmLoading(true)
    form.validateFields()
      .then((values) => {
        if (record?.id) {
          // Assuming no update API, perhaps reload or something
          onClose(true)
        } else {
          return adminApi.role.addRole(values).then(() => onClose(true))
        }
      })
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
        name="code"
        label={t('role.field.code')}
        rules={[
          { required: true, },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="name"
        label={t('role.field.name')}
        rules={[
          { required: true, },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="parentId"
        label={t('role.field.parentId')}
        hidden={true}
      >
        <Select allowClear>
          {roles.map(role => <Select.Option key={role.id} value={role.id}>{role.name}</Select.Option>)}
        </Select>
      </Form.Item>
      <Form.Item
        name="inheritable"
        label={t('role.field.inheritable')}
        valuePropName="checked"
        initialValue={false}
      >
        <Switch />
      </Form.Item>
    </Modal>
  </>
}