import { adminApi } from "@/api";
import { PageContainer } from "@ant-design/pro-components";
import { ZerowebMetadataClient } from "@xezzon/zeroweb-sdk";
import { Button, Table } from "antd";
import { useEffect, useState } from "react";
import { useParams } from "react-router";

export default function MenuPage() {
  const { id: appId } = useParams()
  const [app, setApp] = useState(/** @type {import('@xezzon/zeroweb-sdk').App} */(null))
  const [dataSource, setDataSource] = useState(/** @type {import('@xezzon/zeroweb-sdk').MenuInfo[]} */([]))

  /**
   * @type {import('antd').TableProps<import('@xezzon/zeroweb-sdk').MenuInfo>['columns']}
   */
  const columns = [
    {
      dataIndex: 'path',
      title: '资源编码',
    },
    {
      dataIndex: 'name',
      title: '资源名称',
    },
    {
      key: 'action',
      title: '操作',
      render: () => <>
        <Button type="link">国际化</Button>
      </>,
    }
  ]

  const fetchData = () => {
    adminApi.app.queryAppById(appId)
      .then(response => response.data)
      .then((app) => {
        setApp(app)
        return app
      })
      .then(app => ZerowebMetadataClient({ baseURL: app.baseUrl }).loadResourceInfo())
      .then(response => response.data)
      .then(setDataSource)
  }

  useEffect(() => {
    fetchData()
  }, [])

  return <>
    <PageContainer subTitle={app?.name}>
      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey="path"
      />
    </PageContainer>
  </>
}
