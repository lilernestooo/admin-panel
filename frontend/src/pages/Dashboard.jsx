import React, { useEffect, useState } from 'react'
import {
  Layout, Table, Button, Modal, Form, Input, Select,
  Tag, Avatar, Popconfirm, message, Statistic, Row, Col, Typography, Space
} from 'antd'
import { UserOutlined, PlusOutlined, EditOutlined, DeleteOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import UserSearchBar from '../components/UserSearchBar'
import { fetchUsers, registerUser, updateUser, deleteUser, verifyPassword } from '../api/userApi'

const { Content } = Layout
const { Text } = Typography

export default function Dashboard() {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [passwordUnlocked, setPasswordUnlocked] = useState(false)
  const [verifyModalOpen, setVerifyModalOpen] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [verifyForm] = Form.useForm()
  const [form] = Form.useForm()

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase()
    return (
      u.user_name?.toLowerCase().includes(term) ||
      u.userid?.toLowerCase().includes(term) ||
      u.user_email_address?.toLowerCase().includes(term) ||
      u.companyid?.toLowerCase().includes(term)
    )
  })

  const loadUsers = async () => {
    setLoading(true)
    try {
      const res = await fetchUsers()
      if (res.success) setUsers(res.data)
      else message.error(res.message || 'Failed to load users')
    } catch (err) {
      message.error('Could not reach the backend. Is XAMPP running?')
    }
    setLoading(false)
  }

  useEffect(() => { loadUsers() }, [])

const openAddModal = () => {
  setEditingUser(null)
  setPasswordUnlocked(false)
  form.resetFields()
  setModalOpen(true)
}

const openEditModal = (record) => {
  setEditingUser(record)
  setPasswordUnlocked(false)
  form.setFieldsValue(record)
  setModalOpen(true)
}

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

  const handleDelete = async (rec_id) => {
    const res = await deleteUser(rec_id)
    if (res.success) {
      message.success('User deleted')
      loadUsers()
    } else {
      message.error(res.message || 'Delete failed')
    }
  }

const handleSubmit = async (values) => {
  let res
  if (editingUser) {
    res = await updateUser({ ...values, rec_id: editingUser.rec_id })
  } else {
    res = await registerUser(values)
  }

  if (res.success) {
    setModalOpen(false)

    if (editingUser && res.password_changed) {
      Modal.success({
        title: 'Password Changed Successfully',
        content: 'The password has been updated. You will now be logged out — please log back in using the new password to confirm it works.',
        okText: 'Log Out Now',
        okButtonProps: { style: { background: '#111', borderColor: '#111' } },
        onOk: () => {
          localStorage.removeItem('admin_user')
          navigate('/login')
        },
      })
    }
    
    else {
      message.success(editingUser ? 'User updated' : 'User registered')
      loadUsers()
    }
  } else {
    message.error(res.message || 'Something went wrong')
  }
}

const columns = [
  // ── Identity ──────────────────────────────
  {
    title: 'User',
    dataIndex: 'user_name',
    key: 'user_name',
    fixed: 'left',
    width: 220, // Increased from 180 to give the avatar and name breathing room
    align: 'left', // Keeping identity left-aligned is standard practice for clean alignment with avatars
    render: (text, record) => (
      <Space style={{ paddingLeft: '8px' }}>
        <Avatar style={{ backgroundColor: '#0a0a0a' }} icon={<UserOutlined />} />
        <div>
          <div style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{text}</div>
          <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>{record.userid}</Text>
        </div>
      </Space>
    ),
  },
  { title: 'Rec ID', dataIndex: 'rec_id', key: 'rec_id', width: 100, align: 'center' },
  { title: 'Employee ID', dataIndex: 'user_employee_id', key: 'user_employee_id', width: 150, align: 'center' },

  // ── Contact ───────────────────────────────
  { 
    title: 'Email', 
    dataIndex: 'user_email_address', 
    key: 'user_email_address', 
    width: 240, // Increased significantly from 150 to stop emails from wrapping into two lines
    align: 'center',
    ellipsis: true // Automatically adds '...' if an exceptionally long email hits the border boundary
  },
  { title: 'Mobile', dataIndex: 'user_mobile_no', key: 'user_mobile_no', width: 150, align: 'center' },
  { title: 'TG Mobile No', dataIndex: 'tg_mobile_no', key: 'tg_mobile_no', width: 160, align: 'center' },
  { title: 'Extension ID', dataIndex: 'extn_id', key: 'extn_id', width: 150, align: 'center' },
  { title: 'Extn Dial Prefix', dataIndex: 'extn_dial_prefix', key: 'extn_dial_prefix', width: 150, align: 'center' },

  // ── Company / Organization ────────────────
  { title: 'Company', dataIndex: 'companyid', key: 'companyid', width: 160, align: 'center' },
  { title: 'Dealer Group Code', dataIndex: 'user_dealer_group_code', key: 'user_dealer_group_code', width: 160, align: 'center' },
  { title: 'Function', dataIndex: 'chFunction', key: 'chFunction', width: 150, align: 'center' },
  { title: 'Calendar Folder', dataIndex: 'calendar_folder', key: 'calendar_folder', width: 160, align: 'center' },

  // ── Access & Security ─────────────────────
  {
    title: 'Rights',
    dataIndex: 'user_rights',
    key: 'user_rights',
    width: 120,
    align: 'center',
    render: (rights) => (
      <Tag color={rights === 'admin' ? '#000000' : '#8c8c8c'} style={{ borderRadius: 0, margin: 0 }}>
        {(rights || 'user').toUpperCase()}
      </Tag>
    ),
  },
  {
    title: 'Force Change PW',
    dataIndex: 'chg_password',
    key: 'chg_password',
    width: 150,
    align: 'center',
    render: (val) => <Tag style={{ borderRadius: 0, margin: 0 }}>{val === 'Y' ? 'Yes' : 'No'}</Tag>,
  },
  {
    title: 'PW Changed At',
    dataIndex: 'chg_psswrd_datetime',
    key: 'chg_psswrd_datetime',
    width: 180,
    align: 'center',
    render: (val) => val ? new Date(val).toLocaleString() : <Text type="secondary">—</Text>,
  },
  { title: 'OTP Code', dataIndex: 'otp_code', key: 'otp_code', width: 120, align: 'center' },
  {
    title: 'OTP Expires At',
    dataIndex: 'otp_expires_at',
    key: 'otp_expires_at',
    width: 180,
    align: 'center',
    render: (val) => val ? new Date(val).toLocaleString() : <Text type="secondary">—</Text>,
  },

  // ── Activity / Timestamps ─────────────────
  {
    title: 'Last Login',
    dataIndex: 'last_loggin',
    key: 'last_loggin',
    width: 180,
    align: 'center',
    render: (val) => val ? new Date(val).toLocaleString() : <Text type="secondary">Never</Text>,
  },
  {
    title: 'Created At',
    dataIndex: 'created_at',
    key: 'created_at',
    width: 180,
    align: 'center',
    render: (val) => val ? new Date(val).toLocaleString() : '—',
  },
  {
    title: 'Updated At',
    dataIndex: 'updated_at',
    key: 'updated_at',
    width: 180,
    align: 'center',
    render: (val) => val ? new Date(val).toLocaleString() : '—',
  },

  // ── Actions ────────────────────────────────
  {
    title: 'Actions',
    key: 'actions',
    fixed: 'right',
    width: 180,
    align: 'center',
    onHeaderCell: () => ({ className: 'actions-divider' }),
    onCell: () => ({ className: 'actions-divider' }),
    render: (_, record) => (

      <Space size="middle">
        <Button size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)}>Edit</Button>
        <Popconfirm
          title="Delete this user?"
          description="This action cannot be undone."
          onConfirm={() => handleDelete(record.rec_id)}
          okText="Delete"
          okButtonProps={{ danger: true }}
        >
          <Button size="small" danger icon={<DeleteOutlined />}>Delete</Button>
        </Popconfirm>
      </Space>
    ),
  },
]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout>
        <Navbar title="USER REGISTRATION" />
        <Content style={{ margin: 24 }}>

    <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={8}>
                <div style={{ 
                  background: '#fff', 
                  border: '1px solid #a7a7a7', 
                  padding: '24px 20px', 
                  borderRadius: '8px', 
                  boxShadow: 'inset 4px 0 0 0 #0a0a0a, 0 6px 16px rgba(0, 0, 0, 0.12)' 
                }}>
                <Statistic 
                    title={<span style={{ color: '#595959', fontWeight: 500, fontSize: '14px' }}>Total Users</span>} 
                    value={users.length} 
                    valueStyle={{ color: '#0a0a0a', fontWeight: 700, fontSize: '28px' }} 
                />
                </div>
            </Col>
            <Col span={8}>
              <div style={{ 
                background: '#fff', 
                border: '1px solid #a7a7a7', 
                padding: '24px 20px', 
                borderRadius: '8px', 
                boxShadow: 'inset 4px 0 0 0 #0a0a0a, 0 6px 16px rgba(0, 0, 0, 0.12)' 
              }}>
                <Statistic
                    title={<span style={{ color: '#595959', fontWeight: 500, fontSize: '14px' }}>Admins</span>}
                    value={users.filter(u => u.user_rights === 'admin').length}
                    valueStyle={{ color: '#0a0a0a', fontWeight: 700, fontSize: '28px' }}
                />
                </div>
            </Col>
            <Col span={8}>
              <div style={{ 
                background: '#fff', 
                border: '1px solid #a7a7a7', 
                padding: '24px 20px', 
                borderRadius: '8px', 
                boxShadow: 'inset 4px 0 0 0 #0a0a0a, 0 6px 16px rgba(0, 0, 0, 0.12)' 
              }}>
                <Statistic
                    title={<span style={{ color: '#595959', fontWeight: 500, fontSize: '14px' }}>Regular Users</span>}
                    value={users.filter(u => u.user_rights !== 'admin').length}
                    valueStyle={{ color: '#0a0a0a', fontWeight: 700, fontSize: '28px' }}
                />
                </div>
            </Col>
            </Row>

          <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
              <UserSearchBar onSearch={setSearchTerm} />
              <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal} style={{ background: '#111', borderColor: '#111' }}>
                Add User
              </Button>
            </Row>

           <div style={{ background: '#fff', border: '1px solid #f0f0f0' }}>
              <Table
                rowKey="rec_id"
                columns={columns}
                dataSource={filteredUsers}
                loading={loading}
                pagination={{ pageSize: 10 }}
                scroll={{ x: 3500 }}
                bordered
                className="lgc-table"
              />
            </div>
        </Content>
          <style>{`
            .lgc-table .ant-table-thead > tr > th,
            .lgc-table .ant-table-tbody > tr > td {
              border-right: 1px solid #d9d9d9 !important;
              border-bottom: 1px solid #d9d9d9 !important;
            }
            .lgc-table .ant-table-container {
              border-left: 1px solid #d9d9d9 !important;
              border-top: 1px solid #d9d9d9 !important;
            }
            .lgc-table .ant-table-tbody > tr:last-child > td {
              border-bottom: 1px solid #d9d9d9 !important;
            }
          `}</style>
      </Layout>

        <Modal
        title={editingUser ? 'Edit User' : 'Register New User'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnClose
        width={760}
        maskClosable={false}
        keyboard={false}
        styles={{ body: { maxHeight: '70vh', overflowY: 'auto', paddingRight: 8 } }}
        >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
        {(() => {
            const fields = [
            <Form.Item key="userid" name="userid" label="User ID" rules={[{ required: true, message: 'User ID is required' }]}>
                <Input disabled={!!editingUser} placeholder="e.g. jdoe" />
            </Form.Item>,
            <Form.Item key="rights" name="user_rights" label="Access Rights" initialValue="user">
                <Select
                options={[
                    { value: 'admin', label: 'Admin' },
                    { value: 'user', label: 'User' },
                ]}
                />
            </Form.Item>,
            <Form.Item key="name" name="user_name" label="Full Name" rules={[{ required: true, message: 'Name is required' }]}>
                <Input placeholder="Juan Dela Cruz" />
            </Form.Item>,
            <Form.Item key="empid" name="user_employee_id" label="Employee ID">
                <Input maxLength={6} placeholder="EMP001" />
            </Form.Item>,
              ...(!editingUser ? [
                  <Form.Item key="password" name="user_password" label="Password" rules={[{ required: true, min: 6, message: 'At least 6 characters' }]}>
                  <Input.Password placeholder="Set a password" />
                  </Form.Item>
              ] : [
                  <Form.Item
                      key="newpassword"
                      name="new_password"
                      label={
                        <span>
                          New Password{' '}
                          <span
                            onClick={() => {
                              if (!passwordUnlocked) setVerifyModalOpen(true)
                            }}
                            style={{ cursor: passwordUnlocked ? 'default' : 'pointer', color: passwordUnlocked ? '#52c41a' : '#0a0a0a' }}
                          >
                            {passwordUnlocked ? <UnlockOutlined /> : <LockOutlined />}
                          </span>
                        </span>
                      }
                      rules={[{ min: 6, message: 'At least 6 characters' }]}
                      extra={passwordUnlocked ? 'Leave blank to keep the current password' : 'Click the lock icon beside the label to enable editing'}
                    >
                      <Input.Password
                        placeholder={passwordUnlocked ? 'Enter a new password to change it' : 'Locked — verify your password first'}
                        disabled={!passwordUnlocked}
                      />
                    </Form.Item>
              ]),
            <Form.Item key="company" name="companyid" label="Company">
                <Input placeholder="Company name or ID" />
            </Form.Item>,
            <Form.Item key="email" name="user_email_address" label="Email" rules={[{ type: 'email', message: 'Enter a valid email' }]}>
                <Input placeholder="user@example.com" />
            </Form.Item>,
            <Form.Item key="mobile" name="user_mobile_no" label="Mobile Number">
                <Input placeholder="09171234567" />
            </Form.Item>,
            <Form.Item key="calendar" name="calendar_folder" label="Calendar Folder">
                <Input placeholder="e.g. default_calendar" />
            </Form.Item>,
            <Form.Item key="function" name="chFunction" label="Function">
                <Input placeholder="e.g. System Administrator" />
            </Form.Item>,
            <Form.Item key="extnid" name="extn_id" label="Extension ID">
                <Input placeholder="Extension ID" />
            </Form.Item>,
            <Form.Item key="extndial" name="extn_dial_prefix" label="Extension Dial Prefix">
                <Input placeholder="Dial prefix" />
            </Form.Item>,
            <Form.Item key="tgmobile" name="tg_mobile_no" label="TG Mobile No">
                <Input placeholder="Alternate mobile number" />
            </Form.Item>,
            ]

            const rows = []
            for (let i = 0; i < fields.length; i += 2) {
            rows.push(
                <Row gutter={16} key={`row-${i}`}>
                <Col span={12}>{fields[i]}</Col>
                {fields[i + 1] && <Col span={12}>{fields[i + 1]}</Col>}
                </Row>
            )
            }
            return rows
        })()}

        <Form.Item style={{ marginTop: 24, marginBottom: 0, textAlign: 'right' }}>
            <Button type="primary" htmlType="submit" style={{ background: '#111', borderColor: '#111' }}>
                {editingUser ? 'Submit' : 'Submit'}
            </Button>
        </Form.Item>

        </Form>
        </Modal>

          <Modal
            title="Confirm Your Password"
            open={verifyModalOpen}
            onCancel={() => {
              setVerifyModalOpen(false)
              verifyForm.resetFields()
            }}
            footer={null}
            destroyOnClose
            maskClosable={false}
            keyboard={false}
          >
          <p style={{ color: '#595959', marginBottom: 16 }}>
            For security, enter your own account password to unlock the New Password field.
          </p>
          <Form form={verifyForm} layout="vertical" onFinish={handleVerifyPassword}>
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
    </Layout>
  )
}