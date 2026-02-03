import { openApi } from '@/api';
import { PageContainer } from '@ant-design/pro-components';
import { Button, Table } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

export default function ThirdPartyAppPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  /**
   * @type {import('antd').TableProps<import('@xezzon/zeroweb-sdk').ThirdPartyApp>['columns']}
   */
  const columns = [
    {
      dataIndex: 'name',
      title: t('third-party-app.field.name'),
    },
    {
      key: 'action',
      title: t('common.action'),
      render: (_, record) => (
        <>
          <Button
            type="link"
            onClick={() => {
              navigate(`/third-party-app/${record.id}/subscription`);
            }}
          >
            {t('third-party-app.subscription')}
          </Button>
        </>
      ),
    },
  ];
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [dataSource, setDataSource] = useState(
    /** @type {import('@xezzon/zeroweb-sdk').ThirdPartyApp[]} */ ([]),
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    openApi.thirdPartyApp
      .listThirdPartyApp({
        top: pagination.pageSize,
        skip: (pagination.current - 1) * pagination.pageSize,
      })
      .then((response) => response.data)
      .then(({ content, page }) => {
        setDataSource(content);
        setPagination({
          ...pagination,
          total: page.totalElements,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [pagination?.current, pagination?.pageSize]);

  return (
    <>
      <PageContainer>
        <Table
          columns={columns}
          dataSource={dataSource}
          rowKey="id"
          pagination={pagination}
          loading={loading}
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
