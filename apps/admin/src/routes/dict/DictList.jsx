import { adminApi } from "@/api";
import { ProTable } from "@ant-design/pro-components";
import { Button, Drawer, Popconfirm, Tag } from "antd";
import { useMemo, useRef, useState } from "react";
import DictEditor from "./DictEditor";

/**
 * @param {Object} param0 
 * @param {import('@xezzon/zeroweb').Dict} param0.tag
 * @param {(refresh: boolean) => void} param0.onClose
 */
export default function DictList({ tag, onClose }) {
  const [record, setRecord] = useState(/** @type {import('@xezzon/zeroweb').Dict} */(null))
  const actionRef = useRef(/** @type {import('@ant-design/pro-components').ActionType} */(null))

  const columns = useMemo(() => /** @type {import('antd').TableProps<import('@xezzon/zeroweb').Dict>['columns']} */([
    {
      dataIndex: 'code',
      title: '字典键',
    },
    {
      dataIndex: 'label',
      title: '字典值',
    },
    {
      dataIndex: 'enabled',
      title: '启用状态',
      render: (enabled) => enabled
        ? <Tag color="success">启用</Tag>
        : <Tag color="error">禁用</Tag>
    },
    {
      key: 'action',
      title: '操作',
      render: (_, record) => <>
        <Button
          type="link"
          disabled={!record.editable}
          onClick={() => setRecord(record)}
        >编辑</Button>
        <Button
          type="link"
          disabled={!record.editable}
          onClick={() => setRecord({ tag: tag?.code, parentId: record.id })}
        >新增字典</Button>
        <Popconfirm
          title="确认删除"
          onConfirm={() => adminApi.dict.removeDict(record.id)
            .then(() => {
              actionRef.current.reload()
            })
          }
        >
          <Button type="link" danger disabled={!record.editable}>删除</Button>
        </Popconfirm>
      </>,
    },
  ]), [tag])

  return <>
    <Drawer
      open={!!tag}
      destroyOnHidden
      title={tag?.code}
      width="70%"
      onClose={onClose}
    >
      <ProTable
        columns={columns}
        rowKey="id"
        search={false}
        toolBarRender={() => <>
          <Button
            type="primary"
            disabled={!tag?.editable}
            onClick={() => setRecord({ tag: tag.code, parentId: tag.id })}
          >新增字典</Button>
        </>}
        request={() => adminApi.dict
          .getDictTreeByTag(tag?.code)
          .then(response => response.data)
          .then((dicts) => ({ data: dicts }))
        }
        actionRef={actionRef}
      />
    </Drawer>
    <DictEditor
      record={record}
      onClose={(refresh) => {
        setRecord(null)
        if (refresh) {
          actionRef.current.reload()
        }
      }}
    />
  </>
}
