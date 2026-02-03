import { adminApi } from '@/api/admin';
import { openApi } from '@/api/open';
import { PageContainer } from '@ant-design/pro-components';
import { AuthContext } from '@zeroweb/auth';
import { InputNumber } from 'antd';
import { Form } from 'antd';
import { Button, Modal, Popconfirm, Table, Typography } from 'antd';
import dayjs from 'dayjs';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

/**
 * @typedef {import('@xezzon/zeroweb-sdk').ThirdPartyAppMember} ThirdPartyAppMember
 * @typedef {import('@xezzon/zeroweb-sdk').User} User
 */

export default function MemberPage() {
  const { t } = useTranslation();
  const { thirdPartyAppId: appId } = useParams();
  const [thirdPartyApp, setThirdPartyApp] = useState(
    /** @type {import('@xezzon/zeroweb-sdk').ThirdPartyApp} */ (null),
  );
  const { user } = useContext(AuthContext);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [dataSource, setDataSource] = useState(/** @type {ThirdPartyAppMember[]} */ ([]));
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState(/** @type {string} */ (null));
  const [inviteMemberModalVisible, setInviteMemberModalVisible] = useState(false);

  const fetchData = () => {
    setLoading(true);
    openApi.thirdPartyApp
      .listThirdPartyAppMember(appId)
      .then((response) => response.data)
      .then(async (members) =>
        Promise.all(
          members.map((member) =>
            adminApi.user
              .queryUserById(member.userId)
              .then((userResponse) => userResponse.data)
              .then((user) => ({ ...member, nickname: user.nickname }))
              .catch(() => ({ ...member, nickname: member.userId })),
          ),
        ),
      )
      .then(setDataSource)
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    openApi.thirdPartyApp
      .queryThirdPartyAppById(appId)
      .then((response) => response.data)
      .then(setThirdPartyApp);
  }, [appId]);

  useEffect(() => {
    fetchData();
  }, [appId, pagination?.current, pagination?.pageSize]);

  /**
   * @type {import('antd').TableProps<ThirdPartyAppMember & {nickname?: string}>['columns']}
   */
  const columns = [
    {
      dataIndex: 'nickname',
      title: t('member.column.nickname'),
    },
    {
      dataIndex: 'roleId',
      title: t('member.column.role'),
      render: (roleId) => (roleId === '1' ? t('member.role.owner') : t('member.role.member')),
    },
    {
      dataIndex: 'createTime',
      title: t('member.column.joinTime'),
      render: (value) => dayjs(value).format('YYYY-MM-DD'),
    },
    {
      key: 'action',
      title: t('common.action'),
      render: (_, record) => (
        <>
          {thirdPartyApp?.ownerId === user?.sub && !record.owner && (
            <Popconfirm
              title={t('member.confirm.transferOwner.title')}
              description={t('member.confirm.transferOwner.description')}
              onConfirm={() => {
                setLoading(true);
                openApi.thirdPartyApp
                  .moveOwnerShip(appId, record.userId)
                  .then(() => {
                    fetchData();
                    thirdPartyApp.ownerId = record.userId;
                  })
                  .finally(() => {
                    setLoading(false);
                  });
              }}
            >
              <Button type="link">{t('member.action.transferOwner')}</Button>
            </Popconfirm>
          )}
          {thirdPartyApp?.ownerId === user?.sub && !record.owner && (
            <Popconfirm
              title={t('member.confirm.removeMember')}
              onConfirm={() => {
                setLoading(true);
                openApi.thirdPartyApp
                  .deleteMember(appId, record.id)
                  .then(fetchData)
                  .finally(() => {
                    setLoading(false);
                  });
              }}
            >
              <Button type="link" danger>
                {t('member.action.removeMember')}
              </Button>
            </Popconfirm>
          )}
        </>
      ),
    },
  ];

  return (
    <>
      <PageContainer
        subTitle={thirdPartyApp?.name}
        extra={
          <Button type="primary" onClick={() => setInviteMemberModalVisible(true)}>
            {t('member.action.inviteMember')}
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={dataSource}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={(newPagination) => {
            if (pagination.pageSize != newPagination.pageSize) {
              newPagination.current = 1;
            }
            setPagination(newPagination);
          }}
        />
      </PageContainer>
      <InviteMemberModal
        open={inviteMemberModalVisible}
        appId={appId}
        onClose={(inviteCode) => {
          setInviteCode(inviteCode);
          setInviteMemberModalVisible(false);
        }}
      />
      <InviteCodeModal inviteCode={inviteCode} onClose={() => setInviteCode(null)} />
    </>
  );
}

/**
 * @param {object} param0
 * @param {boolean} param0.open
 * @param {string} param0.appId
 * @param {(inviteCode: string) => void} param0.onClose
 */
function InviteMemberModal({ open, appId, onClose }) {
  const { t } = useTranslation();
  const [expireTime, setExpireTime] = useState();
  const [loading, setLoading] = useState(false);

  const handleInviteMember = () => {
    setLoading(true);
    openApi.thirdPartyApp
      .inviteMember(appId, expireTime)
      .then((response) => response.data)
      .then(onClose)
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      <Modal
        open={open}
        title={t('member.inviteMember.title')}
        onCancel={() => onClose()}
        onOk={handleInviteMember}
        loading={loading}
        modalRender={(dom) => (
          <>
            <Form>{dom}</Form>
          </>
        )}
      >
        <Form.Item name="timeout" label={t('member.inviteMember.timeout')} required>
          <InputNumber
            value={expireTime}
            defaultValue={24}
            precision={0}
            suffix={t('member.inviteMember.timeoutUnit')}
            controls={false}
            style={{ width: '10rem' }}
            onChange={setExpireTime}
          />
        </Form.Item>
      </Modal>
    </>
  );
}

/**
 * @param {object} param0
 * @param {string} param0.inviteCode
 * @param {() => void} param0.onClose
 */
function InviteCodeModal({ inviteCode, onClose }) {
  const { t } = useTranslation();

  return (
    <Modal
      open={!!inviteCode}
      title={t('member.inviteCode.title')}
      closable
      onCancel={onClose}
      footer={[
        <Button onClick={onClose} key="close">
          {t('app.button.close')}
        </Button>,
      ]}
    >
      <Typography.Paragraph>
        <Typography.Text code copyable>
          {inviteCode}
        </Typography.Text>
      </Typography.Paragraph>
    </Modal>
  );
}
