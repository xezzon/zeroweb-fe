import { adminApi } from "@/api";
import { PageContainer } from "@ant-design/pro-components";
import { ZerowebMetadataClient } from "@xezzon/zeroweb-sdk";
import { Button, Table } from "antd";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useTranslation } from 'react-i18next'

export default function MenuPage() {
  const { t } = useTranslation()
  const { id: appId } = useParams()
  const [app, setApp] = useState(/** @type {import('@xezzon/zeroweb-sdk').App} */(null))
  const [dataSource, setDataSource] = useState(/** @type {import('@xezzon/zeroweb-sdk').MenuInfo[]} */([]))

  /**
   * @type {import('antd').TableProps<import('@xezzon/zeroweb-sdk').MenuInfo>['columns']}
   */
  const columns = [
    {
      dataIndex: 'path',
      title: t('menu.field.path'),
    },
    {
      dataIndex: 'name',
      title: t('menu.field.name'),
    },
    {
      key: 'action',
      title: t('common.action'),
      render: () => <>
        <Button type="link">{t('menu.internationalize')}</Button>
      </>,
    }
  ]

  useEffect(() => {
    adminApi.app.queryAppById(appId)
      .then(response => response.data)
      .then((app) => {
        setApp(app)
        return app
      })
      .then(app => ZerowebMetadataClient({ baseURL: app.baseUrl }).loadResourceInfo())
      .then(response => response.data)
      .then(setDataSource)
  }, [appId])

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
