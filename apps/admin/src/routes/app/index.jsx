import { adminApi } from "@/api";
import { CheckCircleTwoTone, CloseCircleTwoTone } from "@ant-design/icons";
import { ProTable } from "@ant-design/pro-components";
import { ZerowebMetadataClient } from "@xezzon/zeroweb";
import { Button, Popconfirm, theme } from "antd";
import { useCallback, useMemo, useRef, useState } from "react";
import AppEditor from "./AppEditor";

export default function AppPage() {
  const [record, setRecord] = useState(/** @type {import('@xezzon/zeroweb').App} */(null))
  const actionRef = useRef(/** @type {import('@ant-design/pro-components').ActionType} */(null))
  const closeEditor = useCallback((refresh) => {
    setRecord(null)
    if (refresh) {
      actionRef.current.reload()
    }
  }, [])
  const deleteRecord = (id) => adminApi.app.deleteApp(id)
    .then(() => {
      actionRef.current.reload()
    })
  const { token: designToken } = theme.useToken()

  /**
   * @type {import('antd').TableProps<import('@xezzon/zeroweb').App>['columns']}
   */
  const columns = useMemo(() => /** @type {import('antd').TableProps<import('@xezzon/zeroweb').App>['columns']} */ ([
    {
      dataIndex: 'name',
      title: '应用名称',
    },
    {
      dataIndex: 'baseUrl',
      title: '基础访问路径',
    },
    {
      dataIndex: 'status',
      title: '状态',
      render: (status) => status
        ? <CheckCircleTwoTone twoToneColor={designToken.colorSuccess} />
        : <CloseCircleTwoTone twoToneColor={designToken.colorError} />,
    },
    {
      dataIndex: 'version',
      title: '版本',
    },
    {
      key: 'action',
      title: '操作',
      render: (_, record) => <>
        <Button type="link" onClick={() => setRecord(record)}>编辑</Button>
        <Popconfirm title="确认删除" onConfirm={() => deleteRecord(record.id)}>
          <Button type="link" danger>删除</Button>
        </Popconfirm>
      </>,
    },
  ]), [designToken])

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
        .then((apps) => Promise.all(
          apps.map((app) => ZerowebMetadataClient({ baseURL: app.baseUrl })
            .loadServiceInfo()
            .then(response => ({ ...response.data, status: true }))
            .catch(() => Promise.resolve({ status: false }))
            .then((serviceInfo) => ({ ...app, ...serviceInfo, }))
          )
        ))
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
