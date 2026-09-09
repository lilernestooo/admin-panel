import React, { useEffect, useState, useRef } from 'react'
import { Modal, Form, Input, Button, Typography, Divider } from 'antd'
import { LockOutlined, UnlockOutlined } from '@ant-design/icons'
import { verifyPassword } from '../api/userApi'

const { Text } = Typography

export default function PasswordLockGate({ resetKey, persistKey, title = 'System Access', description, onUnlockChange, children }) {
  const [unlocked, setUnlocked] = useState(() => {
    if (persistKey) return sessionStorage.getItem(persistKey) === 'true'
    return false
  })
  const [modalOpen, setModalOpen] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [form] = Form.useForm()
  const isFirstRun = useRef(true)

  // Re-lock whenever the target (resetKey) changes — skip the very first run
  // so a persisted "unlocked" state isn't immediately wiped out on mount
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false
      return
    }
    setUnlocked(false)
  }, [resetKey])

// Persist the unlock state (if persistKey given) and tell the parent about it
    useEffect(() => {
    if (persistKey) {
        sessionStorage.setItem(persistKey, unlocked ? 'true' : 'false')
    }
    onUnlockChange?.(unlocked)
    }, [unlocked])

  const handleVerify = async (values) => {
    setVerifying(true)
    const storedAdmin = JSON.parse(localStorage.getItem('admin_user') || '{}')
    const res = await verifyPassword({ userid: storedAdmin.userid, password: values.confirm_password })
    setVerifying(false)

    if (res.success) {
      setUnlocked(true)
      setModalOpen(false)
      form.resetFields()
    } else {
      form.setFields([{ name: 'confirm_password', errors: [res.message || 'Incorrect password'] }])
    }
  }

  if (unlocked) {
    return <>{children}</>
  }

  return (
    <>
      <div
        style={{
          background: '#fafafa',
          border: '1px dashed #d9d9d9',
          borderRadius: 8,
          padding: '32px 24px',
          textAlign: 'center',
        }}
      >
        <LockOutlined style={{ fontSize: 22, color: '#8c8c8c', marginBottom: 8 }} />
        <div style={{ fontWeight: 600, marginBottom: 4 }}>{title} is locked</div>
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          {description || 'Confirm your account password to view this section.'}
        </Text>
        <Button
          icon={<UnlockOutlined />}
          onClick={() => setModalOpen(true)}
          style={{ background: '#111', borderColor: '#111', color: '#fff' }}
        >
          Unlock
        </Button>
      </div>

      <Modal
        title="Confirm Your Password"
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false)
          form.resetFields()
        }}
        footer={null}
        destroyOnClose
        maskClosable={false}
        keyboard={false}
      >
        <Divider style={{ marginTop: 0, marginBottom: 20 }} />
        <p style={{ color: '#595959', marginBottom: 16 }}>
          For security, enter your own account password to unlock {title.toLowerCase()}.
        </p>
        <Form form={form} layout="vertical" onFinish={handleVerify}>
          <Form.Item
            name="confirm_password"
            label="Your Account Password"
            rules={[{ required: true, message: 'Password is required' }]}
          >
            <Input.Password placeholder="Enter your password" autoFocus />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button type="primary" htmlType="submit" loading={verifying} style={{ background: '#111', borderColor: '#111' }}>
              Verify
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}