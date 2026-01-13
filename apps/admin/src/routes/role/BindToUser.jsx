import { adminApi } from "@/api";
import { Modal, Transfer, message } from 'antd';
import { useEffect, useState } from 'react';

/**
 * @param {object} param0 
 * @param {import('@xezzon/zeroweb-sdk').Role} param0.role
 * @param {() => void} param0.onClose
 */
export default function BindToUser({ role, onClose }) {
  const [userList, setUserList] = useState(/** @type {import('@xezzon/zeroweb-sdk').User[]} */([]))
  const [boundUsers, setBoundUsers] = useState(/** @type {string[]} */([]))
  const [initialBoundUsers, setInitialBoundUsers] = useState(/** @type {string[]} */([]))
  const [loading, setLoading] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)

  useEffect(() => {
    if (!role) return;

    setLoading(true)
    const queryUserListPromise = adminApi.user.queryUserList({ top: 2000 })
      .then(response => response.data)
      .then(({ content }) => {
        setUserList(content.map(user => ({
          key: user.id,
          title: user.nickname || user.username,
          description: user.username,
        })))
      })
    const queryUserByRolePromise = adminApi.authz.queryUserByRole(role.id)
      .then(response => response.data)
      .then(data => data.map(u => u.id))
      .then(boundIds => {
        setBoundUsers(boundIds)
        setInitialBoundUsers(boundIds)
      })
    Promise.all([queryUserListPromise, queryUserByRolePromise])
      .finally(() => setLoading(false))
  }, [role])

  const handleOk = () => {
    const toBind = boundUsers
      .filter(id => !initialBoundUsers.includes(id))
      .map(userId => ({ roleId: role.id, userId }))
    const toRelease = initialBoundUsers
      .filter(id => !boundUsers.includes(id))
      .map(userId => ({ roleId: role.id, userId }))

    if (toBind.length === 0 && toRelease.length === 0) {
      onClose()
      return;
    }

    setConfirmLoading(true)
    Promise.all([
      toBind.length ? adminApi.authz.bindUserToRole(toBind) : Promise.resolve(),
      toRelease.length ? adminApi.authz.releaseRoleUser(toRelease) : Promise.resolve(),
    ])
      .then(() => {
        message.success('绑定用户成功')
        onClose()
      })
      .finally(() => setConfirmLoading(false))
  }

  return <>
    <Modal
      open={!!role}
      destroyOnHidden
      title="绑定用户"
      confirmLoading={confirmLoading}
      width="61%"
      onOk={handleOk}
      onCancel={onClose}
    >
      <Transfer
        dataSource={userList}
        targetKeys={boundUsers}
        titles={['可选用户', '已绑定用户']}
        render={item => item.title}
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
}
