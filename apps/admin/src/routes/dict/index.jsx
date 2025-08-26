import { adminApi } from '@/api'
import { ProTable } from '@ant-design/pro-components'
import { Button, Popconfirm } from 'antd'
import { useMemo, useRef, useState } from 'react'
import DictEditor from './DictEditor'
import DictList from './DictList'

export default function DictTagPage() {
  const [tag, setTag] = useState(/** @type {import('@xezzon/zeroweb').Dict} */(null))
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
      key: 'action',
      title: '操作',
      render: (_, record) => <>
        <Button type='link' onClick={() => setTag(record)}>查看</Button>
        <Button
          type='link'
          disabled={!record.editable}
          onClick={() => setRecord(record)}
        >编辑</Button>
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
  ]), [])

  return <>
    <ProTable
      columns={columns}
      rowKey="id"
      search={false}
      toolBarRender={() => <>
        <Button
          type='primary'
          onClick={() => setRecord({ tag: 'DICT', parentId: '0' })}
        >新增字典</Button>
      </>}
      request={({ pageSize, current }) => adminApi.dict
        .getDictTagList({ top: pageSize, skip: (current - 1) * pageSize, })
        .then(response => response.data)
        .then(({ content, page }) => ({ data: content, total: page.totalElements, }))
      }
      actionRef={actionRef}
    />
    <DictList
      tag={tag}
      onClose={() => setTag(null)}
    />
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
