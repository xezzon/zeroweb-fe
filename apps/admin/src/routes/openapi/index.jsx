import { adminApi, openApi } from '@/api'
import { PageContainer } from '@ant-design/pro-components'
import { OpenapiStatus } from '@xezzon/zeroweb-sdk'
import { useDict } from '@zeroweb/dict'
import { Button, Popconfirm, Table } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import OpenapiEditor from './OpenapiEditor'

export default function OpenapiPage() {
  const { t } = useTranslation()
  const [record, setRecord] = useState(/** @type {import('@xezzon/zeroweb-sdk').Openapi} */(null))
  const { mapValue: mapOpenapiStatus } = useDict(adminApi.dict, 'OpenapiStatus')

  const columns = useMemo(() => /** @type {import('antd').TableProps<import('@xezzon/zeroweb-sdk').Openapi>['columns']} */([
    {
      dataIndex: 'code',
      title: t('openapi.field.code'),
    },
    {
      dataIndex: 'destination',
      title: t('openapi.field.destination'),
    },
    {
      dataIndex: 'httpMethod',
      title: t('openapi.field.httpMethod'),
    },
    {
      dataIndex: 'status',
      title: t('openapi.field.status'),
      render: mapOpenapiStatus,
    },
    {
      key: 'action',
      title: t('common.action'),
      render: (_, record) => <>
        <Button type='link' onClick={() => setRecord(record)}>
          {t('common.edit')}
        </Button>
        {record.status === OpenapiStatus.DRAFT && <>
          <Button
            type='link'
            onClick={() => {
              setLoading(true)
              openApi.openapi.publishOpenapi(record.id)
                .then(loadData)
                .finally(() => setLoading(false))
            }}
          >
            {t('openapi.publish')}
          </Button>
          <Popconfirm
            title={t('common.confirmDelete')}
            onConfirm={() => {
              setLoading(true)
              openApi.openapi.deleteOpenapi(record.id)
                .then(loadData)
                .finally(() => setLoading(false))
            }}
          >
            <Button type='link' danger>{t('common.delete')}</Button>
          </Popconfirm>
        </>}
      </>,
    },
    // oxlint-disable-next-line exhaustive-deps
  ]), [mapOpenapiStatus])
  const [data, setData] = useState(/** @type {import('@xezzon/zeroweb-sdk').Openapi[]} */([]))
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })
  const [loading, setLoading] = useState(false)

  const handleTableChange = (newPagination) => {
    if (pagination.pageSize != newPagination.pageSize) {
      newPagination.current = 1
    }
    setPagination(newPagination);
  }

  const loadData = async () => {
    setLoading(true)
    return openApi.openapi
      .getOpenapiList({ top: pagination.pageSize, skip: (pagination.current - 1) * pagination.pageSize, })
      .then(response => response.data)
      .then(({ content, page }) => {
        setData(content)
        setPagination({
          ...pagination,
          total: page.totalElements,
        })
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    loadData()
    // oxlint-disable-next-line exhaustive-deps
  }, [pagination.current, pagination.pageSize]);

  return <>
    <PageContainer
      extra={
        <Button
          type='primary'
          onClick={() => setRecord({ status: OpenapiStatus.DRAFT })}
        >
          {t('openapi.add')}
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
        search={false}
        pagination={pagination}
        onChange={handleTableChange}
      />
    </PageContainer>
    <OpenapiEditor
      record={record}
      onClose={(refresh) => {
        setRecord(null)
        if (refresh) {
          loadData()
        }
      }}
    />
  </>
}