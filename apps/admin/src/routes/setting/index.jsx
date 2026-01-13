
import { adminApi } from '@/api'
import { Button, Popconfirm, Table } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import SettingSchemaEditor from './SettingSchemaEditor'
import SettingValueEditor from './SettingValueEditor'
import dayjs from 'dayjs'
import { PageContainer } from '@ant-design/pro-components'

export default function SettingPage() {
  const [record, setRecord] = useState(/** @type {import('@xezzon/zeroweb-sdk').Setting} */(null))
  const [valueRecord, setValueRecord] = useState(/** @type {import('@xezzon/zeroweb-sdk').Setting} */(null))

  const columns = useMemo(() => /** @type {import('antd').TableProps<import('@xezzon/zeroweb-sdk').Setting>['columns']} */([
    {
      dataIndex: 'code',
      title: '参数标识',
    },
    {
      dataIndex: 'value',
      title: '参数值',
      render: (value) => value ? JSON.stringify(value) : '',
    },
    {
      dataIndex: 'updateTime',
      title: '更新时间',
      render: (updateTime) => updateTime ? dayjs(updateTime).format('YYYY-MM-DD HH:mm:ss') : '',
    },
    {
      key: 'action',
      title: '操作',
      render: (_, record) => <>
        <Button type='link' onClick={() => setRecord(record)}>编辑约束</Button>
        <Button type='link' onClick={() => setValueRecord(record)}>编辑值</Button>
        <Popconfirm
          title="确认删除"
          onConfirm={() => adminApi.setting.deleteSetting(record.id)
            .then(() => {
              loadData()
            })
          }
        >
          <Button type="link" danger>删除</Button>
        </Popconfirm>
      </>,
    },
    // oxlint-disable-next-line exhaustive-deps
  ]), [])
  const [data, setData] = useState(/** @type {import('@xezzon/zeroweb-sdk').Setting[]} */([]))
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })
  const [loading, setLoading] = useState(false)

  const loadData = () => {
    setLoading(true)
    adminApi.setting
      .listSetting({ top: pagination.pageSize, skip: (pagination.current - 1) * pagination.pageSize })
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

  const handleTableChange = (newPagination) => {
    if (pagination.pageSize != newPagination.pageSize) {
      newPagination.current = 1
    }
    setPagination(newPagination);
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
          onClick={() => setRecord({ value: {} })}
        >
          新增业务参数
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
    <SettingSchemaEditor
      record={record}
      onClose={(refresh) => {
        setRecord(null)
        if (refresh) {
          loadData()
        }
      }}
    />
    <SettingValueEditor
      record={valueRecord}
      onClose={(refresh) => {
        setValueRecord(null)
        if (refresh) {
          loadData()
        }
      }}
    />
  </>
}