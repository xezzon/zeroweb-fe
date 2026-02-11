import { adminApi } from '@/api';
import { PageContainer } from '@ant-design/pro-components';
import { Table } from 'antd';
import { useEffect } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function UserPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [dataSource, setDataSource] = useState(
    /** @type {import('@xezzon/zeroweb-sdk').User[]} */ ([]),
  );
  /**
   * @type {import('antd').TableProps<import('@xezzon/zeroweb-sdk').User>['columns']}
   */
  const columns = [
    {
      dataIndex: 'username',
      title: t('user.field.username'),
    },
    {
      dataIndex: 'nickname',
      title: t('user.field.nickname'),
    },
    {
      key: 'action',
      title: t('common.action'),
    },
  ];

  useEffect(() => {
    setLoading(true);
    adminApi.user
      .queryUserList({
        top: pagination.pageSize,
        skip: (pagination.current - 1) * pagination.pageSize,
      })
      .then((response) => response.data)
      .then(({ page, content }) => {
        setPagination({
          ...pagination,
          total: page.totalElements,
        });
        return content;
      })
      .then(setDataSource)
      .finally(() => {
        setLoading(false);
      });
  }, [pagination.current, pagination.pageSize]);

  return (
    <>
      <PageContainer>
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={pagination}
          loading={loading}
          rowKey="id"
          search={false}
          onChange={(newPagination) => {
            if (pagination.pageSize != newPagination.pageSize) {
              newPagination.current = 1;
            }
            setPagination(newPagination);
          }}
        />
      </PageContainer>
    </>
  );
}
