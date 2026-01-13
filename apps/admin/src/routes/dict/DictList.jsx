import { adminApi } from "@/api";
import { Button, Drawer, Flex, Popconfirm, Table, Tag } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from 'react-i18next'
import DictEditor from "./DictEditor";

/**
 * @param {Object} param0 
 * @param {import('@xezzon/zeroweb-sdk').Dict} param0.tag
 * @param {(refresh: boolean) => void} param0.onClose
 */
export default function DictList({ tag, onClose }) {
  const { t } = useTranslation('field')
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
      dataIndex: 'enabled',
      title: t('dict.enabled'),
      render: (enabled) => enabled
        ? <Tag color="success">启用</Tag>
        : <Tag color="error">禁用</Tag>
    },
    {
      key: 'action',
      title: t('common.action'),
      render: (_, record) => <>
        <Button
          type="link"
          disabled={!record.editable}
          onClick={() => setRecord(record)}
        >
          编辑
        </Button>
        <Button
          type="link"
          disabled={!record.editable}
          onClick={() => setRecord({ tag: tag?.code, parentId: record.id })}
        >
          新增字典
        </Button>
        <Button 
          type="link"
          onClick={() => adminApi.dict
            .updateDictStatus([record.id], !record.enabled)
            .then(() => fetchData())
          }
        >
          { record.enabled ? '禁用' : '启用' }
        </Button>
        <Popconfirm
          title="确认删除"
          onConfirm={() => adminApi.dict.removeDict([record.id])
            .then(() => fetchData())
          }
        >
          <Button type="link" danger disabled={!record.editable}>删除</Button>
        </Popconfirm>
      </>,
    },
    // oxlint-disable-next-line exhaustive-deps
  ]), [tag])
  const [data, setData] = useState(/** @type {import('@xezzon/zeroweb-sdk').Dict[]} */([]))

  const fetchData = () => {
    if (!tag?.code) {
      return
    }
    adminApi.dict
      .getDictTreeByTag(tag.code)
      .then(response => response.data)
      .then(setData)
  }
  useEffect(fetchData, [tag?.code])

  return <>
    <Drawer
      open={!!tag}
      destroyOnHidden
      title={tag?.code}
      size="large"
      onClose={onClose}
    >
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        search={false}
        title={() =>
          <Flex justify="flex-end">
            <Button
              type="primary"
              disabled={!tag?.editable}
              onClick={() => setRecord({ tag: tag.code, parentId: tag.id })}
            >新增字典</Button>
          </Flex>
        }
      />
    </Drawer>
    <DictEditor
      record={record}
      onClose={(refresh) => {
        setRecord(null)
        if (refresh) {
          fetchData()
        }
      }}
    />
  </>
}
