import { adminApi } from '@/api';
import { PageContainer } from '@ant-design/pro-components';
import { MenuType, ZerowebMetadataClient } from '@xezzon/zeroweb-sdk';
import { AuthContext, hasPermission } from '@zeroweb/auth';
import {
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Switch,
  Table,
  Transfer,
  Tree,
  message,
} from 'antd';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

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

/**
 * @param {Object} param0
 * @param {import('@xezzon/zeroweb-sdk').Role} param0.record
 * @param {(refresh: boolean) => void} param0.onClose
 */
function RoleEditor({ record, onClose }) {
  /**
   * @type {[import('antd').FormInstance<import('@xezzon/zeroweb-sdk').AddRoleReq>]}
   */
  const [form] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [roles, setRoles] = useState(/** @type {import('@xezzon/zeroweb-sdk').Role[]} */ ([]));
  const { t } = useTranslation();
  const { t: tErrorCode } = useTranslation('error_code');

  useEffect(() => {
    adminApi.role
      .listAllRole()
      .then((response) => response.data)
      .then(setRoles);
  }, []);

  const onOk = () => {
    setConfirmLoading(true);
    form
      .validateFields()
      .then((values) => {
        if (record?.id) {
          // Assuming no update API, perhaps reload or something
          onClose(true);
        } else {
          return adminApi.role.addRole(values).then(() => onClose(true));
        }
      })
      .catch((error) => {
        /**
         * @type {import('@xezzon/zeroweb-sdk').ErrorResult[]}
         */
        const details = error.details;
        if (!details) {
          return Promise.reject(error);
        }
        const fieldErrors = {};
        details.forEach(({ code, parameters }) => {
          fieldErrors[parameters.field] = [
            ...(fieldErrors[parameters.field] || []),
            tErrorCode(`detail.${code}`, parameters),
          ];
        });
        form.setFields(Object.entries(fieldErrors).map(([name, errors]) => ({ name, errors })));
        return Promise.reject(error);
      })
      .finally(() => setConfirmLoading(false));
  };
  const onCancel = () => onClose(false);

  return (
    <>
      <Modal
        open={!!record}
        destroyOnHidden
        confirmLoading={confirmLoading}
        onOk={onOk}
        onCancel={onCancel}
        modalRender={(dom) => (
          <>
            <Form
              layout="vertical"
              initialValues={record}
              clearOnDestroy
              onFinish={onOk}
              form={form}
            >
              {dom}
            </Form>
          </>
        )}
      >
        <Form.Item name="id" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="code" label={t('role.field.code')} rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="name" label={t('role.field.name')} rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="parentId" label={t('role.field.parentId')} hidden={true}>
          <Select allowClear>
            {roles.map((role) => (
              <Select.Option key={role.id} value={role.id}>
                {role.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="inheritable"
          label={t('role.field.inheritable')}
          valuePropName="checked"
          initialValue={false}
        >
          <Switch />
        </Form.Item>
      </Modal>
    </>
  );
}

/**
 * @param {object} param0
 * @param {import('@xezzon/zeroweb-sdk').Role} param0.role
 * @param {() => void} param0.onClose
 */
function BindToUser({ role, onClose }) {
  const [userList, setUserList] = useState(
    /** @type {import('@xezzon/zeroweb-sdk').User[]} */ ([]),
  );
  const [boundUsers, setBoundUsers] = useState(/** @type {string[]} */ ([]));
  const [initialBoundUsers, setInitialBoundUsers] = useState(/** @type {string[]} */ ([]));
  const [loading, setLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (!role) return;

    setLoading(true);
    const queryUserListPromise = adminApi.user
      .queryUserList({ top: 2000 })
      .then((response) => response.data)
      .then(({ content }) => {
        setUserList(
          content.map((user) => ({
            key: user.id,
            title: user.nickname || user.username,
            description: user.username,
          })),
        );
      });
    const queryUserByRolePromise = adminApi.authz
      .queryUserByRole(role.id)
      .then((response) => response.data)
      .then((data) => data.map((u) => u.id))
      .then((boundIds) => {
        setBoundUsers(boundIds);
        setInitialBoundUsers(boundIds);
      });
    Promise.all([queryUserListPromise, queryUserByRolePromise]).finally(() => setLoading(false));
  }, [role]);

  const handleOk = () => {
    const toBind = boundUsers
      .filter((id) => !initialBoundUsers.includes(id))
      .map((userId) => ({ roleId: role.id, userId }));
    const toRelease = initialBoundUsers
      .filter((id) => !boundUsers.includes(id))
      .map((userId) => ({ roleId: role.id, userId }));

    if (toBind.length === 0 && toRelease.length === 0) {
      onClose();
      return;
    }

    setConfirmLoading(true);
    Promise.all([
      toBind.length ? adminApi.authz.bindUserToRole(toBind) : Promise.resolve(),
      toRelease.length ? adminApi.authz.releaseRoleUser(toRelease) : Promise.resolve(),
    ])
      .then(() => {
        message.success(t('role.bindUserSuccess'));
        onClose();
      })
      .finally(() => setConfirmLoading(false));
  };

  return (
    <>
      <Modal
        open={!!role}
        destroyOnHidden
        title={t('role.bindUser')}
        confirmLoading={confirmLoading}
        width="61%"
        onOk={handleOk}
        onCancel={onClose}
      >
        <Transfer
          dataSource={userList}
          targetKeys={boundUsers}
          titles={[t('role.availableUsers'), t('role.boundUsers')]}
          render={(item) => item.title}
          pagination={{ pageSize: 20 }}
          loading={loading}
          onChange={setBoundUsers}
          styles={{
            section: {
              width: '100%',
              height: '61vh',
            },
          }}
        />
      </Modal>
    </>
  );
}

/**
 * @param {object} param0
 * @param {import('@xezzon/zeroweb-sdk').Role} param0.role
 * @param {() => void} param0.onClose
 */
function BindToPermission({ role, onClose }) {
  const [permissionList, setPermissionList] = useState([]);
  const [boundPermission, setBoundPermission] = useState([]);
  const [originalBoundPermission, setOriginalBoundPermission] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const { permissions } = useContext(AuthContext);
  const { t } = useTranslation();

  useEffect(() => {
    if (!role) {
      return;
    }
    setLoading(true);
    const queryPermissionListPromise = adminApi.app
      .listApp()
      .then((response) => response.data)
      .then((apps) =>
        Promise.all(
          apps.map((app) =>
            ZerowebMetadataClient({ baseURL: app.baseUrl })
              .loadResourceInfo()
              .then((response) => response.data)
              .catch(() => [])
              .then((menuInfos) => [
                { key: app.id, title: app.name, disabled: true },
                ...menuInfos
                  .filter(({ type }) => type === MenuType.PERMISSION)
                  .filter(({ permissions: required }) => hasPermission(permissions, required))
                  .map((menuInfo) => ({
                    key: menuInfo.path,
                    title: menuInfo.name || menuInfo.path,
                    parentId: app.id,
                  })),
              ]),
          ),
        ),
      )
      .then((data) => {
        setPermissionList(data.flatMap((item) => item));
      });
    const queryPermissionByRolePromise = adminApi.authz
      .queryPermissionByRole(role.id)
      .then((response) => response.data)
      .then((boundPermissions) => {
        setOriginalBoundPermission(boundPermissions);
        setBoundPermission(boundPermissions);
      });
    Promise.all([queryPermissionListPromise, queryPermissionByRolePromise]).finally(() =>
      setConfirmLoading(false),
    );
  }, [role, permissions]);

  const treeData = useMemo(() => {
    return permissionList
      .filter(({ parentId }) => !parentId)
      .map((app) => ({
        ...app,
        children: permissionList
          .filter(({ parentId }) => parentId === app.key)
          .map((permission) => ({
            ...permission,
            disabled: boundPermission.includes(permission.key),
          })),
      }))
      .filter(({ children }) => children.length);
  }, [permissionList, boundPermission]);

  const handleOk = () => {
    setConfirmLoading(true);
    const toBind = boundPermission
      .filter((p) => !originalBoundPermission.includes(p))
      .map((permission) => ({
        roleId: role.id,
        permission,
      }));
    const toRelease = originalBoundPermission
      .filter((p) => !boundPermission.includes(p))
      .map((permission) => ({
        roleId: role.id,
        permission,
      }));

    if (toBind.length === 0 && toRelease.length === 0) {
      onClose();
      return;
    }

    Promise.all([
      toBind.length ? adminApi.authz.bindPermissionToRole(toBind) : Promise.resolve(),
      toRelease.length ? adminApi.authz.releaseRolePermission(toRelease) : Promise.resolve(),
    ])
      .then(() => {
        onClose();
      })
      .finally(() => setConfirmLoading(false));
  };

  return (
    <>
      <Modal
        open={!!role}
        destroyOnHidden
        title={t('role.setPermission')}
        confirmLoading={confirmLoading}
        width="61%"
        onOk={handleOk}
        onCancel={onClose}
      >
        <Transfer
          dataSource={permissionList}
          targetKeys={boundPermission}
          titles={[t('role.availablePermissions'), t('role.currentPermissions')]}
          render={(item) => item.title}
          loading={loading}
          onChange={setBoundPermission}
          styles={{
            section: {
              width: '100%',
              height: '61vh',
            },
          }}
        >
          {({ direction, onItemSelect, selectedKeys }) => {
            if (direction === 'left') {
              const checkedKeys = [...selectedKeys, ...boundPermission];
              return (
                <Tree
                  blockNode
                  checkable
                  checkStrictly
                  defaultExpandAll
                  checkedKeys={checkedKeys}
                  treeData={treeData}
                  onCheck={(_, { node: { key } }) => {
                    console.debug(1, key, !checkedKeys.includes(key));
                    onItemSelect(key, !checkedKeys.includes(key));
                  }}
                  onSelect={(_, { node: { key } }) => {
                    onItemSelect(key, !checkedKeys.includes(key));
                  }}
                />
              );
            }
          }}
        </Transfer>
      </Modal>
    </>
  );
}
