import { adminApi } from '@/api';
import { Button, Drawer, Flex, Popconfirm, Table, Tag } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DictEditor from './DictEditor';

/**
 * @param {Object} param0
 * @param {import('@xezzon/zeroweb-sdk').Dict} param0.tag
 * @param {(refresh: boolean) => void} param0.onClose
 */
export default function DictList({ tag, onClose }) {
  const { t } = useTranslation();
  const [record, setRecord] = useState(/** @type {import('@xezzon/zeroweb-sdk').Dict} */ (null));

  const columns = useMemo(
    () => /** @type {import('antd').TableProps<import('@xezzon/zeroweb-sdk').Dict>['columns']} */ ([
      {
        dataIndex: 'code',
        title: t('dict.field.code'),
      },
      {
        dataIndex: 'label',
        title: t('dict.field.label'),
      },
      {
        dataIndex: 'enabled',
        title: t('dict.field.enabled'),
        render: (enabled) =>
          enabled ? (
            <Tag color="success">{t('common.enabled')}</Tag>
          ) : (
            <Tag color="error">{t('common.disabled')}</Tag>
          ),
      },
      {
        key: 'action',
        title: t('common.action'),
        render: (_, record) => (
          <>
            <Button type="link" disabled={!record.editable} onClick={() => setRecord(record)}>
              {t('common.edit')}
            </Button>
            <Button
              type="link"
              disabled={!record.editable}
              onClick={() => setRecord({ tag: tag?.code, parentId: record.id })}
            >
              {t('dict.addDict')}
            </Button>
            <Button
              type="link"
              onClick={() =>
                adminApi.dict.updateDictStatus([record.id], !record.enabled).then(() => fetchData())
              }
            >
              {record.enabled ? t('common.disable') : t('common.enable')}
            </Button>
            <Popconfirm
              title={t('common.confirmDelete')}
              onConfirm={() => adminApi.dict.removeDict([record.id]).then(() => fetchData())}
            >
              <Button type="link" danger disabled={!record.editable}>
                {t('common.delete')}
              </Button>
            </Popconfirm>
          </>
        ),
      },
      // oxlint-disable-next-line exhaustive-deps
    ]),
    [tag],
  );
  const [data, setData] = useState(/** @type {import('@xezzon/zeroweb-sdk').Dict[]} */ ([]));

  const fetchData = () => {
    if (!tag?.code) {
      return;
    }
    adminApi.dict
      .getDictTreeByTag(tag.code)
      .then((response) => response.data)
      .then(setData);
  };
  useEffect(fetchData, [tag?.code]);

  return (
    <>
      <Drawer open={!!tag} destroyOnHidden title={tag?.code} size="large" onClose={onClose}>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          search={false}
          title={() => (
            <Flex justify="flex-end">
              <Button
                type="primary"
                disabled={!tag?.editable}
                onClick={() => setRecord({ tag: tag.code, parentId: tag.id })}
              >
                {t('dict.addDict')}
              </Button>
            </Flex>
          )}
        />
      </Drawer>
      <DictEditor
        record={record}
        onClose={(refresh) => {
          setRecord(null);
          if (refresh) {
            fetchData();
          }
        }}
      />
    </>
  );
}
