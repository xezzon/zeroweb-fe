import { Button, Drawer, Descriptions } from "antd";

/**
 * @param {Object} param0
 * @param {import('@xezzon/zeroweb').Setting} param0.setting
 * @param {(refresh: boolean) => void} param0.onClose
 */
export default function SettingList({ setting, onClose }) {
  return <>
    <Drawer
      open={!!setting}
      destroyOnHidden
      title={`业务参数详情 - ${setting?.code}`}
      size="large"
      onClose={onClose}
      extra={
        <Button onClick={onClose}>
          关闭
        </Button>
      }
    >
      <Descriptions bordered column={1}>
        <Descriptions.Item label="参数标识">
          {setting?.code}
        </Descriptions.Item>
        <Descriptions.Item label="参数约束定义">
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {setting?.schema ? JSON.stringify(JSON.parse(setting.schema), null, 2) : ''}
          </pre>
        </Descriptions.Item>
        <Descriptions.Item label="参数值">
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {setting?.value ? JSON.stringify(setting.value, null, 2) : ''}
          </pre>
        </Descriptions.Item>
        <Descriptions.Item label="更新时间">
          {setting?.updateTime ? new Date(setting.updateTime).toLocaleString() : ''}
        </Descriptions.Item>
      </Descriptions>
    </Drawer>
  </>
}