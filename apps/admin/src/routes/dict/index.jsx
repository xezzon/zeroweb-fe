import { adminApi } from '@/api'
import { Button, Popconfirm, Table } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import DictEditor from './DictEditor'
import DictList from './DictList'
import { PageContainer } from '@ant-design/pro-components'

export default function DictTagPage() {
  const { t } = useTranslation('field')
  const [tag, setTag] = useState(/** @type {import('@xezzon/zeroweb-sdk').Dict} */(null))
  const [record, setRecord] = useState(/** @type {import('@xezzon/zeroweb-sdk').Dict} */(null))

  const columns = useMemo(() => /** @type {import('antd').TableProps<import('@xezzon/zeroweb-sdk').Dict>['columns']} */([
    {
      dataIndex: 'code',
      title: t('dict.code'),
    },
    {
      dataIndex: 'label',
      title: t('dict.label'),
    },
    {
      key: 'action',
      title: t('common.action'),
      render: (_, record) => <>
        <Button type='link' onClick={() => setTag(record)}>查看</Button>
        <Button
          type='link'
          disabled={!record.editable}
          onClick={() => setRecord(record)}
        >
          编辑
        </Button>
        <Popconfirm
          title="确认删除"
          onConfirm={() => adminApi.dict.removeDict([record.id])
            .then(() => {
              loadData()
            })
          }
        >
          <Button type="link" danger disabled={!record.editable}>删除</Button>
        </Popconfirm>
      </>,
    },
    // oxlint-disable-next-line exhaustive-deps
  ]), [])
  const [data, setData] = useState(/** @type {import('@xezzon/zeroweb-sdk').Dict[]} */([]))
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

  const loadData = () => {
    setLoading(true)
    adminApi.dict
      .getDictTagList({ top: pagination.pageSize, skip: (pagination.current - 1) * pagination.pageSize, })
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
          onClick={() => setRecord({ tag: 'DICT', parentId: '0' })}
        >
          新增字典
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
    <DictList
      tag={tag}
      onClose={() => setTag(null)}
    />
    <DictEditor
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
