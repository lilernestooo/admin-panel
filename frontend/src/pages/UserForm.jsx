import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Layout, Form, Input, Select, Button, Modal, Divider, Spin, Popconfirm,
  Typography, Row, Col, message,
} from 'antd'
import { LockOutlined, UnlockOutlined, DeleteOutlined } from '@ant-design/icons'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import { fetchUserById, registerUser, updateUser, verifyPassword, deleteUser } from '../api/userApi'

const { Content } = Layout
const { Title, Text } = Typography

// Tries to close the tab this page was opened in (via window.open). If the
// browser won't allow that (e.g. the tab was opened by typing the URL
// directly, not by script), fall back to sending the user to the main list.
function closeOrRedirect(navigate) {
  window.close()
  setTimeout(() => {
    if (!window.closed) navigate('/')
  }, 150)
}

export default function UserForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id

  const [form] = Form.useForm()
  const [verifyForm] = Form.useForm()

  const [loadingUser, setLoadingUser] = useState(isEditing)
  const [notFound, setNotFound] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [passwordUnlocked, setPasswordUnlocked] = useState(false)
  const [verifyModalOpen, setVerifyModalOpen] = useState(false)
  const [verifying, setVerifying] = useState(false)

  // -- Set the browser/tab title -----------------------------------------
  // These forms are opened in their own new tab (via window.open), so the
  // tab title is the only thing that tells the user which form they're on
  // when they have several open at once.
  useEffect(() => {
    document.title = isEditing ? 'Admin - Edit User' : 'Admin - Register New User'
  }, [isEditing])

  // -- Load the existing user when editing ----------------------------
  useEffect(() => {
    if (!isEditing) return
    let cancelled = false

    setLoadingUser(true)
    fetchUserById(id).then((res) => {
      if (cancelled) return
      if (res.success) {
        setEditingUser(res.data)
        form.setFieldsValue(res.data)
      } else {
        setNotFound(true)
        message.error(res.message || 'User not found')
      }
      setLoadingUser(false)
    })

    return () => { cancelled = true }
  }, [id, isEditing, form])

  // -- Verify-password-to-unlock-new-password-field flow ---------------
  const handleVerifyPassword = async (values) => {
    setVerifying(true)
    const storedAdmin = JSON.parse(localStorage.getItem('admin_user') || '{}')
    const res = await verifyPassword({ userid: storedAdmin.userid, password: values.confirm_password })
    setVerifying(false)

    if (res.success) {
      setPasswordUnlocked(true)
      setVerifyModalOpen(false)
      verifyForm.resetFields()
      message.success('Password field unlocked')
    } else {
      message.error(res.message || 'Incorrect password')
    }
  }

  // -- Submit ------------------------------------------------------------
  const handleSubmit = async (values) => {
    setSubmitting(true)
    const res = isEditing
      ? await updateUser({ ...values, rec_id: editingUser.rec_id })
      : await registerUser(values)
    setSubmitting(false)

    if (!res.success) {
      message.error(res.message || 'Something went wrong')
      return
    }

    if (isEditing && res.password_changed) {
      Modal.success({
        title: 'Password Changed Successfully',
        content: 'The password has been updated. You will now be logged out -- please log back in using the new password to confirm it works.',
        okText: 'Log Out Now',
        okButtonProps: { style: { background: '#111', borderColor: '#111' } },
        onOk: () => {
          localStorage.removeItem('admin_user')
          navigate('/login')
        },
      })
      return
    }

    Modal.success({
      title: isEditing ? 'User Updated Successfully' : 'User Registered Successfully',
      content: isEditing
        ? 'The changes have been saved.'
        : 'The new user has been added to the system.',
      okText: 'Close',
      okButtonProps: { style: { background: '#111', borderColor: '#111' } },
      onOk: () => closeOrRedirect(navigate),
    })
  }

  // -- Delete -----------------------------------------------------------
  const handleDelete = async () => {
    setDeleting(true)
    const res = await deleteUser(editingUser.rec_id)
    setDeleting(false)
    if (res.success) {
      message.success('User deleted successfully')
      // Try to close the tab; if it stays open, redirect to the users list
      window.close()
      setTimeout(() => {
        if (!window.closed) navigate('/')
      }, 150)
    } else {
      message.error(res.message || 'Delete failed')
    }
  }

  if (loadingUser) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Sidebar />
        <Layout>
          <Navbar title="EDIT USER" />
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 64px)' }}>
            <Spin size="large" />
          </div>
        </Layout>
      </Layout>
    )
  }

  if (notFound) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Sidebar />
        <Layout>
          <Navbar title="EDIT USER" />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 64px)', gap: 16 }}>
            <Title level={4}>User not found</Title>
            <Button onClick={() => closeOrRedirect(navigate)}>Close</Button>
          </div>
        </Layout>
      </Layout>
    )
  }

  // -- Section header helper ---------------------------------------------
  const SectionHeader = ({ title, subtitle }) => (
    <div style={{ marginBottom: 20 }}>
      <Title level={5} style={{ margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {title}
      </Title>
      {subtitle && (
        <Text type="secondary" style={{ fontSize: 13 }}>
          {subtitle}
        </Text>
      )}
    </div>
  )

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout>
        <Navbar title={isEditing ? 'EDIT USER' : 'REGISTER NEW USER'} />
        <Content style={{ margin: '32px auto', maxWidth: 920, width: '100%', padding: '0 24px 48px' }}>
          <Spin spinning={submitting} tip={isEditing ? 'Saving changes...' : 'Registering user...'}>
            <Form form={form} layout="vertical" size="large" onFinish={handleSubmit}>

              {/* -- Account section --------------------------------------- */}
              <div className="lgc-section">
                <SectionHeader title="Account" subtitle="Login credentials and access level" />
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item name="userid" label="User ID" rules={[{ required: true, message: 'User ID is required' }]}>
                      <Input disabled={isEditing} placeholder="e.g. jdoe" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="user_rights" label="Access Rights" initialValue="user">
                      <Select
                        options={[
                          { value: 'admin', label: 'Admin' },
                          { value: 'user', label: 'User' },
                        ]}
                        getPopupContainer={(trigger) => trigger.parentNode}
                        popupClassName="lgc-select-dropdown"
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24}>
                  {/* TODO: Website Access field — commented out until the website list is finalized
                  <Col span={12}>
                    <Form.Item name="website_access" label="Website Access" rules={[{ required: true, message: 'Please select a website' }]}>
                      <Select
                        placeholder="Select a website"
                        options={[]}
                        notFoundContent="No websites configured yet"
                        getPopupContainer={(trigger) => trigger.parentNode}
                        popupClassName="lgc-select-dropdown"
                      />
                    </Form.Item>
                  </Col>
                  */}
                  <Col span={12}>
                    {!isEditing ? (
                      <Form.Item name="user_password" label="Password" rules={[{ required: true, min: 6, message: 'At least 6 characters' }]}>
                        <Input.Password placeholder="Set a password" />
                      </Form.Item>
                    ) : (
                      <Form.Item
                        name="new_password"
                        label={
                          <span>
                            New Password{' '}
                            <span
                              onClick={() => { if (!passwordUnlocked) setVerifyModalOpen(true) }}
                              className={passwordUnlocked ? 'lock-icon unlocked' : 'lock-icon'}
                              style={{ cursor: passwordUnlocked ? 'default' : 'pointer', color: passwordUnlocked ? '#52c41a' : '#0a0a0a' }}
                              title={passwordUnlocked ? 'Password field unlocked' : 'Click to verify your password and unlock'}
                            >
                              {passwordUnlocked ? <UnlockOutlined /> : <LockOutlined />}
                            </span>
                          </span>
                        }
                        rules={[{ min: 6, message: 'At least 6 characters' }]}
                        extra={passwordUnlocked ? 'Leave blank to keep the current password' : 'Click the lock icon beside the label to enable editing'}
                      >
                        <Input.Password
                          placeholder={passwordUnlocked ? 'Enter a new password to change it' : 'Locked -- verify your password first'}
                          disabled={!passwordUnlocked}
                        />
                      </Form.Item>
                    )}
                  </Col>
                </Row>
              </div>

              <Divider className="lgc-section-divider" />

              {/* -- Personal details section -------------------------------- */}
              <div className="lgc-section">
                <SectionHeader title="Personal Details" subtitle="Who this user is" />
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item name="user_name" label="Full Name" rules={[{ required: true, message: 'Name is required' }]}>
                      <Input placeholder="Juan Dela Cruz" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="user_employee_id" label="Employee ID">
                      <Input maxLength={6} placeholder="EMP001" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item name="user_email_address" label="Email" rules={[{ type: 'email', message: 'Enter a valid email' }]}>
                      <Input placeholder="user@example.com" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="user_mobile_no" label="Mobile Number">
                      <Input placeholder="09171234567" />
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              <Divider className="lgc-section-divider" />

              {/* -- Organization section -------------------------------------- */}
              <div className="lgc-section">
                <SectionHeader title="Organization" subtitle="Company and dealer information" />
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item name="companyid" label="Company">
                      <Input placeholder="Company name or ID" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="user_dealer_group_code" label="Dealer Group Code">
                      <Input placeholder="e.g. DG-001" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item name="chFunction" label="Function">
                      <Input placeholder="e.g. System Administrator" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="calendar_folder" label="Calendar Folder">
                      <Input placeholder="e.g. default_calendar" />
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              <Divider className="lgc-section-divider" />

              {/* -- Extension / system section -------------------------------- */}
              <div className="lgc-section">
                <SectionHeader title="Extension Details" subtitle="Phone and system extension settings" />
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item name="extn_id" label="Extension ID">
                      <Input placeholder="Extension ID" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="extn_dial_prefix" label="Extension Dial Prefix">
                      <Input placeholder="Dial prefix" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item name="tg_mobile_no" label="TG Mobile No">
                      <Input placeholder="Alternate mobile number" />
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              <Form.Item style={{ marginTop: 32, marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  {/* Delete button — only shown when editing an existing user */}
                  {isEditing ? (
                    <Popconfirm
                      title="Delete this user?"
                      description="This action cannot be undone."
                      onConfirm={handleDelete}
                      okText="Yes, Delete"
                      cancelText="Cancel"
                      okButtonProps={{ danger: true }}
                    >
                      <Button
                        size="large"
                        danger
                        icon={<DeleteOutlined />}
                        loading={deleting}
                        style={{ borderRadius: 6 }}
                      >
                        Delete User
                      </Button>
                    </Popconfirm>
                  ) : (
                    <span />
                  )}

                  {/* Cancel + Submit on the right */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button size="large" style={{ borderRadius: 6 }} onClick={() => closeOrRedirect(navigate)}>
                      Cancel
                    </Button>
                    <Button size="large" type="primary" htmlType="submit" loading={submitting} style={{ background: '#111', borderColor: '#111', borderRadius: 6 }}>
                      {isEditing ? 'Save Changes' : 'Register User'}
                    </Button>
                  </div>
                </div>
              </Form.Item>
            </Form>
          </Spin>
        </Content>

        {/* Confirm-your-password modal, used to unlock the New Password field */}
        <Modal
          title="Confirm Your Password"
          open={verifyModalOpen}
          onCancel={() => { setVerifyModalOpen(false); verifyForm.resetFields() }}
          footer={null}
          destroyOnClose
          maskClosable={false}
          keyboard={false}
        >
          <Divider style={{ marginTop: 0, marginBottom: 20 }} />
          <p style={{ color: '#595959', marginBottom: 16 }}>
            For security, enter your own account password to unlock the New Password field.
          </p>
          <Form form={verifyForm} layout="vertical" onFinish={handleVerifyPassword}>
            <Form.Item name="confirm_password" label="Your Account Password" rules={[{ required: true, message: 'Password is required' }]}>
              <Input.Password placeholder="Enter your password" autoFocus />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Button type="primary" htmlType="submit" loading={verifying} style={{ background: '#111', borderColor: '#111' }}>
                Verify
              </Button>
            </Form.Item>
          </Form>
        </Modal>

        <style>{`
          .lock-icon {
            display: inline-flex;
            padding: 2px 4px;
            border-radius: 4px;
            transition: background-color 0.15s ease, transform 0.15s ease;
          }
          .lock-icon:not(.unlocked):hover {
            background-color: #f0f0f0;
            transform: scale(1.15);
          }
          .lock-icon.unlocked {
            cursor: default;
          }
          .lgc-select-dropdown .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
            background-color: #b4adad !important;
            color: #0a0a0a !important;
            font-weight: 600;
          }
          .lgc-select-dropdown .ant-select-item-option-active:not(.ant-select-item-option-disabled) {
            background-color: #b4adad !important;
          }

          .ant-form-item-label > label {
            text-transform: uppercase;
            font-size: 12px;
            letter-spacing: 0.5px;
          }
          .ant-select-item-option-content,
          .ant-select-selection-item {
            text-transform: uppercase;
          }
          .ant-btn {
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .ant-modal-title {
            text-transform: uppercase;
          }

          .lgc-section {
            background: #fff;
            border: 1px solid #f0f0f0;
            border-radius: 8px;
            padding: 28px 32px;
          }
          .lgc-section-divider {
            margin: 28px 0;
            border-color: transparent;
          }
          .lgc-section .ant-form-item {
            margin-bottom: 22px;
          }
          .lgc-section .ant-input,
          .lgc-section .ant-input-password,
          .lgc-section .ant-select-selector {
            font-size: 15px;
          }
          .lgc-section .ant-select-selector,
          .lgc-section .ant-input-affix-wrapper,
          .lgc-section input.ant-input {
            min-height: 44px !important;
          }
        `}</style>
      </Layout>
    </Layout>
  )
}