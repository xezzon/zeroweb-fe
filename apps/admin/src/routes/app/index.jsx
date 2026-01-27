import { adminApi } from '@/api';
import { CheckCircleTwoTone, CloseCircleTwoTone } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { ZerowebMetadataClient } from '@xezzon/zeroweb-sdk';
import { useDict } from '@zeroweb/dict';
import { Button, Popconfirm, Table, theme } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import AppEditor from './AppEditor';

export default function AppPage() {
  const { t } = useTranslation();
  const [record, setRecord] = useState(/** @type {import('@xezzon/zeroweb-sdk').App} */ (null));
  const { mapValue: mapServiceType } = useDict(adminApi.dict, 'ServiceType');
  const closeEditor = (refresh) => {
    setRecord(null);
    if (refresh) {
      fetchData();
    }
  };
  const deleteRecord = (id) =>
    adminApi.app.deleteApp(id).then(() => {
      fetchData();
    });
  const { token: designToken } = theme.useToken();
  const navigate = useNavigate();

  /**
   * @type {import('antd').TableProps<import('@xezzon/zeroweb-sdk').App>['columns']}
   */
  const columns = useMemo(
    () => /** @type {import('antd').TableProps<import('@xezzon/zeroweb-sdk').App>['columns']} */ ([
      {
        dataIndex: 'name',
        title: t('app.field.name'),
      },
      {
        dataIndex: 'baseUrl',
        title: t('app.field.baseUrl'),
      },
      {
        dataIndex: 'status',
        title: t('app.field.status'),
        render: (status) =>
          status ? (
            <CheckCircleTwoTone twoToneColor={designToken.colorSuccess} />
          ) : (
            <CloseCircleTwoTone twoToneColor={designToken.colorError} />
          ),
      },
      {
        dataIndex: 'type',
        title: t('app.field.type'),
        render: mapServiceType,
      },
      {
        dataIndex: 'version',
        title: t('app.field.version'),
      },
      {
        key: 'action',
        title: t('common.action'),
        render: (_, record) => (
          <>
            {record.status && (
              <Button
                type="link"
                onClick={() => {
                  navigate(`/app/${record.id}/menu`);
                }}
              >
                {t('app.viewMenu')}
              </Button>
            )}
            <Button type="link" onClick={() => setRecord(record)}>
              {t('common.edit')}
            </Button>
            <Popconfirm title={t('common.confirmDelete')} onConfirm={() => deleteRecord(record.id)}>
              <Button type="link" danger>
                {t('common.delete')}
              </Button>
            </Popconfirm>
          </>
        ),
      },
      // oxlint-disable-next-line eslint-plugin-react-hooks/exhaustive-deps
    ]),
    [mapServiceType],
  );
  const [data, setData] = useState(/** @type {import('@xezzon/zeroweb-sdk').App[]} */ ([]));
  const [loading, setLoading] = useState(false);

  const fetchData = () => {
    setLoading(true);
    adminApi.app
      .listApp()
      .then((response) => response.data)
      .then((apps) =>
        Promise.all(
          apps.map((app) =>
            ZerowebMetadataClient({ baseURL: app.baseUrl })
              .loadServiceInfo()
              .then((response) => ({ ...response.data, status: true }))
              .catch(() => Promise.resolve({ status: false }))
              .then((serviceInfo) => ({ ...app, ...serviceInfo })),
          ),
        ),
      )
      .then(setData)
      .finally(() => setLoading(false));
  };
  useEffect(fetchData, []);

  return (
    <>
      <PageContainer
        extra={
          <Button type="primary" onClick={() => setRecord({})}>
            {t('app.addApp')}
          </Button>
        }
      >
        <Table columns={columns} dataSource={data} loading={loading} rowKey="id" search={false} />
        <AppEditor record={record} onClose={closeEditor} />
      </PageContainer>
    </>
  );
}
