import { adminApi } from "@/api";
import { CheckCircleTwoTone, CloseCircleTwoTone } from "@ant-design/icons";
import { PageContainer } from "@ant-design/pro-components";
import { ZerowebMetadataClient } from "@xezzon/zeroweb-sdk";
import { Button, Popconfirm, Table, theme } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import AppEditor from "./AppEditor";

export default function AppPage() {
  const { t } = useTranslation('field')
  const [record, setRecord] = useState(/** @type {import('@xezzon/zeroweb-sdk').App} */(null))
  const [serviceTypeDict, setServiceTypeDict] = useState(/** @type {import('@xezzon/zeroweb-sdk').Dict[]} */([]))
  const closeEditor = (refresh) => {
    setRecord(null)
    if (refresh) {
      fetchData()
    }
  }
  const deleteRecord = (id) => adminApi.app.deleteApp(id)
    .then(() => {
      fetchData()
    })
  const { token: designToken } = theme.useToken()
  const navigate = useNavigate()

  /**
   * @type {import('antd').TableProps<import('@xezzon/zeroweb-sdk').App>['columns']}
   */
  const columns = useMemo(() => /** @type {import('antd').TableProps<import('@xezzon/zeroweb-sdk').App>['columns']} */([
    {
      dataIndex: 'name',
      title: t('app.name'),
    },
    {
      dataIndex: 'baseUrl',
      title: t('app.baseUrl'),
    },
    {
      dataIndex: 'status',
      title: t('app.status'),
      render: (status) => status
        ? <CheckCircleTwoTone twoToneColor={designToken.colorSuccess} />
        : <CloseCircleTwoTone twoToneColor={designToken.colorError} />,
    },
    {
      dataIndex: 'type',
      title: t('app.type'),
      render: (type) => serviceTypeDict.find(({ code }) => type === code)?.label ?? type
    },
    {
      dataIndex: 'version',
      title: t('app.version'),
    },
    {
      key: 'action',
      title: t('common.action'),
      render: (_, record) => <>
        {record.status &&
          <Button
            type="link"
            onClick={() => {
              navigate(`/app/${record.id}/menu`)
            }}
          >
            查看菜单
          </Button>
        }
        <Button type="link" onClick={() => setRecord(record)}>编辑</Button>
        <Popconfirm title="确认删除" onConfirm={() => deleteRecord(record.id)}>
          <Button type="link" danger>删除</Button>
        </Popconfirm>
      </>,
    },
    // oxlint-disable-next-line exhaustive-deps
  ]), [serviceTypeDict, t])
  const [data, setData] = useState(/** @type {import('@xezzon/zeroweb-sdk').App[]} */([]))
  const [loading, setLoading] = useState(false)

  const fetchData = () => {
    setLoading(true)
    adminApi.app.listApp()
      .then(response => response.data)
      .then(apps => Promise.all(
        apps.map((app) => ZerowebMetadataClient({ baseURL: app.baseUrl })
          .loadServiceInfo()
          .then(response => ({ ...response.data, status: true }))
          .catch(() => Promise.resolve({ status: false }))
          .then((serviceInfo) => ({ ...app, ...serviceInfo, }))
        )
      ))
      .then(setData)
      .finally(() => setLoading(false))
  }
  useEffect(fetchData, [])
  useEffect(() => {
    adminApi.dict.getDictTreeByTag('ServiceType')
      .then(response => response.data)
      .then(setServiceTypeDict)
  }, [])

  return <>
    <PageContainer
      extra={
        <Button type="primary" onClick={() => setRecord({})}>新增应用</Button>
      }
    >
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
        search={false}
      />
      <AppEditor
        record={record}
        onClose={closeEditor}
      />
    </PageContainer>
  </>
}
