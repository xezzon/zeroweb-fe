import { adminApi } from '@/api';
import { PageContainer } from '@ant-design/pro-components';
import { Button, Popconfirm, Table } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import BindToPermission from './BindToPermission';
import BindToUser from './BindToUser';
import RoleEditor from './RoleEditor';

export default function RolePage() {
  const { t } = useTranslation();
  const [record, setRecord] = useState(/** @type {import('@xezzon/zeroweb-sdk').Role} */ (null));
  const [bindToUser, setBindToUser] = useState(
    /** @type {import('@xezzon/zeroweb-sdk').Role} */ (null),
  );
  const [bindToPermission, setBindToPermission] = useState(
    /** @type {import('@xezzon/zeroweb-sdk').Role} */ (null),
  );
  const closeEditor = (refresh) => {
    setRecord(null);
    if (refresh) {
      fetchData();
    }
  };
  const deleteRecord = (id) =>
    adminApi.role.deleteRole(id).then(() => {
      fetchData();
    });

  /**
   * @type {import('antd').TableProps<import('@xezzon/zeroweb-sdk').Role>['columns']}
   */
  const columns = useMemo(
    () => /** @type {import('antd').TableProps<import('@xezzon/zeroweb-sdk').Role>['columns']} */ ([
      {
        dataIndex: 'code',
        title: t('role.field.code'),
      },
      {
        dataIndex: 'name',
        title: t('role.field.name'),
      },
      {
        key: 'action',
        title: t('common.action'),
        render: (_, record) => (
          <>
            {record.inheritable && (
              <Button type="link" onClick={() => setRecord({ parentId: record.id })}>
                {t('role.addSubRole')}
              </Button>
            )}
            <Button type="link" onClick={() => setBindToUser(record)}>
              {t('role.bindUser')}
            </Button>
            {['3'].includes(record.id) || (
              <Button type="link" onClick={() => setBindToPermission(record)}>
                {t('role.setPermission')}
              </Button>
            )}
            {['1', '2', '3'].includes(record.id) || (
              <Popconfirm
                title={t('common.confirmDelete')}
                onConfirm={() => deleteRecord(record.id)}
              >
                <Button type="link" danger>
                  {t('common.delete')}
                </Button>
              </Popconfirm>
            )}
          </>
        ),
      },
      // oxlint-disable-next-line exhaustive-deps
    ]),
    [],
  );
  const [data, setData] = useState(/** @type {import('@xezzon/zeroweb-sdk').Role[]} */ ([]));
  const [loading, setLoading] = useState(false);

  const fetchData = () => {
    setLoading(true);
    adminApi.role
      .listAllRole()
      .then((response) => response.data)
      .then(setData)
      .finally(() => setLoading(false));
  };
  useEffect(fetchData, []);

  return (
    <>
      <PageContainer>
        <Table columns={columns} dataSource={data} loading={loading} rowKey="id" search={false} />
      </PageContainer>
      <RoleEditor record={record} onClose={closeEditor} />
      <BindToUser role={bindToUser} onClose={() => setBindToUser(null)} />
      <BindToPermission role={bindToPermission} onClose={() => setBindToPermission(null)} />
    </>
  );
}
