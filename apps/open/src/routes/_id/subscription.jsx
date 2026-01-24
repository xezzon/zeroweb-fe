import { openApi } from '@/api/open';
import { PageContainer } from '@ant-design/pro-components';
import { SubscriptionStatus } from '@xezzon/zeroweb-sdk';
import { Button, Table } from 'antd';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';

export default function SubscriptionPage() {
  const { id: appId } = useParams();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const [thirdPartyApp, setThirdPartyApp] = useState(
    /** @type {import('@xezzon/zeroweb-sdk').ThirdPartyApp} */ (null),
  );
  const [subscriptions, setSubscriptions] = useState(
    /** @type {import('@xezzon/zeroweb-sdk').Subscription[]} */ ([]),
  );

  useEffect(() => {
    openApi.thirdPartyApp
      .queryThirdPartyAppById(appId)
      .then((response) => response.data)
      .then(setThirdPartyApp);
  }, [appId]);
  useEffect(() => {
    openApi.subscription
      .listSubscriptionWithOpenapi(appId, {
        top: pagination.pageSize,
        skip: (pagination.current - 1) * pagination.pageSize,
      })
      .then((response) => response.data)
      .then(({ content, page }) => {
        setSubscriptions(content);
        setPagination({
          ...pagination,
          total: page.totalElements,
        });
      });
  }, [appId, pagination.pageSize, pagination.current, count]);

  const handleTableChange = (newPagination) => {
    if (pagination.pageSize != newPagination.pageSize) {
      newPagination.current = 1;
    }
    setPagination(newPagination);
  };
  const subscribe = (openapiCode) =>
    openApi.subscription
      .subscribe({ appId, openapiCode })
      .then((response) => response.data)
      .then(() => {
        setCount(count + 1);
      });

  /**
   * @type {import('antd').TableProps<import('@xezzon/zeroweb-sdk').Subscription>['columns']}
   */
  const columns = [
    {
      dataIndex: ['openapi', 'code'],
      title: '接口编码',
    },
    {
      dataIndex: 'subscriptionStatus',
      title: '订阅状态',
    },
    {
      key: 'action',
      title: '操作',
      render: (_, record) => (
        <>
          {record.subscriptionStatus === SubscriptionStatus.NONE && (
            <Button type="link" onClick={() => subscribe(record.openapi.code)}>
              订阅
            </Button>
          )}
        </>
      ),
    },
  ];

  return (
    <>
      <PageContainer title="订阅管理" subTitle={thirdPartyApp?.name}>
        <Table
          columns={columns}
          dataSource={subscriptions}
          rowKey="openapi.id"
          pagination={pagination}
          onChange={handleTableChange}
        />
      </PageContainer>
    </>
  );
}
