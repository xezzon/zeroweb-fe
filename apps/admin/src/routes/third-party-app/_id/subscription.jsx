import { openApi } from '@/api';
import { PageContainer } from '@ant-design/pro-components';
import { SubscriptionStatus } from '@xezzon/zeroweb-sdk';
import { Button, Table } from 'antd';
import { useEffect } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

export default function SubscriptionPage() {
  const { t } = useTranslation();
  const { id: appId } = useParams();
  /**
   * @type {import('antd').TableProps<import('@xezzon/zeroweb-sdk').Subscription>['columns']}
   */
  const columns = [
    {
      dataIndex: 'openapiCode',
      title: t('subscription.field.openapiCode'),
    },
    {
      dataIndex: 'subscriptionStatus',
      title: t('subscription.field.status'),
    },
    {
      key: 'action',
      title: t('common.action'),
      render: (_, record) => (
        <>
          {record.subscriptionStatus === SubscriptionStatus.AUDITING && (
            <Button
              type="link"
              onClick={() => {
                openApi.subscription.auditSubscription(record.id).then(fetchData);
              }}
            >
              {t('subscription.audit')}
            </Button>
          )}
        </>
      ),
    },
  ];
  const [thirdPartyApp, setThirdPartyApp] = useState(
    /** @type {import('@xezzon/zeroweb-sdk').ThirdPartyApp} */ (null),
  );
  const [dataSource, setDataSource] = useState(
    /** @type {import('@xezzon/zeroweb-sdk').Subscription[]} */ ([]),
  );
  const [loading, setLoading] = useState(false);

  const fetchData = () => {
    setLoading(true);
    openApi.subscription
      .listSubscription(appId)
      .then((response) => response.data)
      .then(setDataSource)
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    openApi.thirdPartyApp
      .queryThirdPartyAppById(appId)
      .then((response) => response.data)
      .then(setThirdPartyApp);
  }, [appId]);

  return (
    <>
      <PageContainer subTitle={thirdPartyApp?.name}>
        <Table columns={columns} dataSource={dataSource} rowKey="id" loading={loading} />
      </PageContainer>
    </>
  );
}
