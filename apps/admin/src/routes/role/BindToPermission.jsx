import { adminApi } from '@/api';
import { MenuType, ZerowebMetadataClient } from '@xezzon/zeroweb-sdk';
import { AuthContext, hasPermission } from '@zeroweb/auth';
import { Modal, Transfer, Tree } from 'antd';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * @param {object} param0
 * @param {import('@xezzon/zeroweb-sdk').Role} param0.role
 * @param {() => void} param0.onClose
 */
export default function BindToPermission({ role, onClose }) {
  const [permissionList, setPermissionList] = useState([])
  const [boundPermission, setBoundPermission] = useState([])
  const [originalBoundPermission, setOriginalBoundPermission] = useState([])
  const [loading, setLoading] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const { permissions } = useContext(AuthContext)
  const { t } = useTranslation()

  useEffect(() => {
    if (!role) {
      return
    }
    setLoading(true)
    const queryPermissionListPromise = adminApi.app.listApp()
      .then(response => response.data)
      .then(apps => Promise.all(
        apps.map(app =>
          ZerowebMetadataClient({ baseURL: app.baseUrl })
            .loadResourceInfo()
            .then(response => response.data)
            .catch(() => [])
            .then(menuInfos => ([
              { key: app.id, title: app.name, disabled: true },
              ...menuInfos
                .filter(({ type }) => type === MenuType.PERMISSION)
                .filter(({ permissions: required }) => hasPermission(permissions, required))
                .map(menuInfo => ({
                  key: menuInfo.path,
                  title: menuInfo.name || menuInfo.path,
                  parentId: app.id,
                }))
            ]))
        )
      ))
      .then(data => {
        setPermissionList(data.flatMap(item => item))
      })
    const queryPermissionByRolePromise = adminApi.authz.queryPermissionByRole(role.id)
      .then(response => response.data)
      .then((boundPermissions) => {
        setOriginalBoundPermission(boundPermissions)
        setBoundPermission(boundPermissions)
      })
    Promise.all([queryPermissionListPromise, queryPermissionByRolePromise])
      .finally(() => setConfirmLoading(false))
  }, [role, permissions])

  const treeData = useMemo(() => {
    return permissionList.filter(({ parentId }) => !parentId)
      .map((app) => ({
        ...app,
        children: permissionList
          .filter(({ parentId }) => parentId === app.key)
          .map((permission) => ({ ...permission, disabled: boundPermission.includes(permission.key) })),
      }))
      .filter(({ children }) => children.length)
  }, [permissionList, boundPermission])

  const handleOk = () => {
    setConfirmLoading(true)
    const toBind = boundPermission
      .filter(p => !originalBoundPermission.includes(p))
      .map(permission => ({
        roleId: role.id,
        permission,
      }))
    const toRelease = originalBoundPermission
      .filter(p => !boundPermission.includes(p))
      .map(permission => ({
        roleId: role.id,
        permission,
      }))

    if (toBind.length === 0 && toRelease.length === 0) {
      onClose()
      return;
    }

    Promise.all([
      toBind.length ? adminApi.authz.bindPermissionToRole(toBind) : Promise.resolve(),
      toRelease.length ? adminApi.authz.releaseRolePermission(toRelease) : Promise.resolve(),
    ])
      .then(() => {
        onClose()
      })
      .finally(() => setConfirmLoading(false))
  }

  return <>
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
        titles={[
          t('role.availablePermissions'), 
          t('role.currentPermissions'),
        ]}
        render={item => item.title}
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
                  console.debug(1, key, !checkedKeys.includes(key))
                  onItemSelect(key, !checkedKeys.includes(key))
                }}
                onSelect={(_, { node: { key } }) => {
                  onItemSelect(key, !checkedKeys.includes(key))
                }}
              />
            );
          }
        }}
      </Transfer>
    </Modal>
  </>
}
