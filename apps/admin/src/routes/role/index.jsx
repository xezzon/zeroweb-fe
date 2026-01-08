import { adminApi } from "@/api";
import { PageContainer } from "@ant-design/pro-components";
import { Button, Popconfirm, Table } from "antd";
import { useEffect, useMemo, useState } from "react";
import RoleEditor from "./RoleEditor";

export default function RolePage() {
  const [record, setRecord] = useState(/** @type {import('@xezzon/zeroweb-sdk').Role} */(null))
  const closeEditor = (refresh) => {
    setRecord(null)
    if (refresh) {
      fetchData()
    }
  }
  const deleteRecord = (id) => adminApi.role.deleteRole(id)
    .then(() => {
      fetchData()
    })

  /**
   * @type {import('antd').TableProps<import('@xezzon/zeroweb-sdk').Role>['columns']}
   */
  const columns = useMemo(() => /** @type {import('antd').TableProps<import('@xezzon/zeroweb-sdk').Role>['columns']} */([
    {
      dataIndex: 'code',
      title: '角色简码',
    },
    {
      dataIndex: 'name',
      title: '角色名称',
    },
    {
      key: 'action',
      title: '操作',
      render: (_, record) => <>
        {record.inheritable &&
          <Button type="link" onClick={() => setRecord({ parentId: record.id })}>添加子角色</Button>
        }
        <Button type="link">绑定用户</Button>
        <Button type="link">设置权限</Button>
        {['1', '2', '3'].includes(record.id) ||
          <Popconfirm title="确认删除" onConfirm={() => deleteRecord(record.id)}>
            <Button type="link" danger>删除</Button>
          </Popconfirm>
        }
      </>,
    },
  ]), [])
  const [data, setData] = useState(/** @type {import('@xezzon/zeroweb-sdk').Role[]} */([]))
  const [loading, setLoading] = useState(false)

  const fetchData = () => {
    setLoading(true)
    adminApi.role.listAllRole()
      .then(response => response.data)
      .then(setData)
      .finally(() => setLoading(false))
  }
  useEffect(fetchData, [])

  return <>
    <PageContainer>
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
        search={false}
      />
    </PageContainer>
    <RoleEditor
      record={record}
      onClose={closeEditor}
    />
  </>
}