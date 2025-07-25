import { adminApi } from "@/api";
import { ProTable } from "@ant-design/pro-components";
import { Button } from "antd";
import { useCallback, useMemo, useRef, useState } from "react";
import AppEditor from "./AppEditor";
import { Popconfirm } from "antd";

export default () => {
  const [record, setRecord] = useState(/** @type {import('@xezzon/zeroweb').App} */ (null))
  const actionRef = useRef(/** @type {import('@ant-design/pro-components').ActionType} */ (null))
  const closeEditor = useCallback((refresh) => {
    setRecord(null)
    if (refresh) {
      actionRef.current.reload()
    }
  }, [])
  
  /**
   * @type {import('antd').TableProps<import('@xezzon/zeroweb').App>['columns']}
   */
  const columns = useMemo(() => [
    {
      title: '应用名称',
      dataIndex: 'name',
    },
    {
      title: '基础访问路径',
      dataIndex: 'baseUrl',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => <>
        <Button type="link" onClick={() => setRecord(record)}>编辑</Button>
        <Popconfirm title="确认删除" onConfirm={console.debug}>
          <Button type="link" danger>删除</Button>
        </Popconfirm>
      </>,
    },
  ], [])
  
  return <>
    <ProTable
      columns={columns}
      rowKey="id"
      search={false}
      toolBarRender={() => <>
        <Button type="primary" onClick={() => setRecord({})}>新增应用</Button>
      </>}
      request={() => adminApi.app.listApp()
        .then((response) => response.data)
        .then((data) => ({
          data,
          success: true,
          total: data.length,
        }))
      }
      actionRef={actionRef}
    />
    <AppEditor 
      record={record}
      onClose={closeEditor}
    />
  </>
}
