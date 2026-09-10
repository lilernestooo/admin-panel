import React, { useEffect, useState } from 'react'
import {
  Layout, Table, Button, Modal, Popconfirm, message, Statistic, Row, Col,
  Typography, Space, Tag, Avatar,
} from 'antd'
import {
  UserOutlined, PlusOutlined, EditOutlined, DeleteOutlined,
  SafetyCertificateOutlined, InfoCircleOutlined,
} from '@ant-design/icons'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import UserSearchBar from '../components/UserSearchBar'
import { fetchUsers, deleteUser } from '../api/userApi'

const { Content } = Layout
const { Text } = Typography

export default function User() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [infoUser, setInfoUser] = useState(null)
  const [showExtraColumns, setShowExtraColumns] = useState(false)

  // -- Data loading ---------------------------------------------------
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

  // Add/Edit User now happen in a separate tab, so this page won't know
  // about changes made there unless it re-checks -- refresh whenever this
  // tab regains focus (e.g. the user finished the form and switched back).
  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === 'visible') loadUsers() }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', loadUsers)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', loadUsers)
    }
  }, [])

  const handleDelete = async (rec_id) => {
    const res = await deleteUser(rec_id)
    if (res.success) {
      message.success('User deleted')
      if (infoUser?.rec_id === rec_id) setInfoUser(null)
      loadUsers()
    } else {
      message.error(res.message || 'Delete failed')
    }
  }

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase()
    return (
      u.user_name?.toLowerCase().includes(term) ||
      u.userid?.toLowerCase().includes(term) ||
      u.user_email_address?.toLowerCase().includes(term) ||
      u.companyid?.toLowerCase().includes(term)
    )
  })

  const dateOrDash = (val, fallback = '-') => (val ? new Date(val).toLocaleString() : <Text type="secondary">{fallback}</Text>)

  // -- Table columns ----------------------------------------------------
  const columns = [
    { title: 'Employee ID', dataIndex: 'user_employee_id', key: 'user_employee_id', width: 150, align: 'center' },
    {
      title: 'User',
      dataIndex: 'user_name',
      key: 'user_name',
      fixed: 'left',
      width: 220,
      align: 'left',
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
    { title: 'Email', dataIndex: 'user_email_address', key: 'user_email_address', width: 240, align: 'center', ellipsis: true },
    { title: 'Mobile', dataIndex: 'user_mobile_no', key: 'user_mobile_no', width: 150, align: 'center' },

    // Extra fields, shown once "System Access" is toggled on for an admin row
    ...(showExtraColumns ? [
      { title: 'TG Mobile No', dataIndex: 'tg_mobile_no', key: 'tg_mobile_no', width: 160, align: 'center' },
      { title: 'Extension ID', dataIndex: 'extn_id', key: 'extn_id', width: 150, align: 'center' },
      { title: 'Extn Dial Prefix', dataIndex: 'extn_dial_prefix', key: 'extn_dial_prefix', width: 150, align: 'center' },
      { title: 'Company', dataIndex: 'companyid', key: 'companyid', width: 160, align: 'center' },
      { title: 'Dealer Group Code', dataIndex: 'user_dealer_group_code', key: 'user_dealer_group_code', width: 160, align: 'center' },
      { title: 'Function', dataIndex: 'chFunction', key: 'chFunction', width: 150, align: 'center' },
      { title: 'Calendar Folder', dataIndex: 'calendar_folder', key: 'calendar_folder', width: 160, align: 'center' },
      {
        title: 'Force Change PW', dataIndex: 'chg_password', key: 'chg_password', width: 150, align: 'center',
        render: (val) => <Tag style={{ borderRadius: 0, margin: 0 }}>{val === 'Y' ? 'Yes' : 'No'}</Tag>,
      },
      { title: 'PW Changed At', dataIndex: 'chg_psswrd_datetime', key: 'chg_psswrd_datetime', width: 180, align: 'center', render: (v) => dateOrDash(v) },
      { title: 'OTP Code', dataIndex: 'otp_code', key: 'otp_code', width: 120, align: 'center' },
      { title: 'OTP Expires At', dataIndex: 'otp_expires_at', key: 'otp_expires_at', width: 180, align: 'center', render: (v) => dateOrDash(v) },
      { title: 'Last Login', dataIndex: 'last_loggin', key: 'last_loggin', width: 180, align: 'center', render: (v) => dateOrDash(v, 'Never') },
      { title: 'Created At', dataIndex: 'created_at', key: 'created_at', width: 180, align: 'center', render: (v) => dateOrDash(v) },
      { title: 'Updated At', dataIndex: 'updated_at', key: 'updated_at', width: 180, align: 'center', render: (v) => dateOrDash(v) },
    ] : []),

    {
      title: 'Rights', dataIndex: 'user_rights', key: 'user_rights', width: 120, align: 'center',
      render: (rights) => (
        <Tag color={rights === 'admin' ? '#000000' : '#8c8c8c'} style={{ borderRadius: 0, margin: 0 }}>
          {(rights || 'user').toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions', key: 'actions', fixed: 'right', width: 100, align: 'center',
      onHeaderCell: () => ({ className: 'actions-divider' }),
      onCell: () => ({ className: 'actions-divider' }),
      render: (_, record) => (
        <Button size="small" icon={<InfoCircleOutlined />} onClick={() => setInfoUser(record)}>
          Info
        </Button>
      ),
    },
  ]

  const cardStyle = {
    background: '#fff', border: '1px solid #a7a7a7', padding: '24px 20px',
    borderRadius: '8px', boxShadow: 'inset 4px 0 0 0 #0a0a0a, 0 6px 16px rgba(0, 0, 0, 0.12)',
  }
  const cardTitleStyle = { color: '#595959', fontWeight: 500, fontSize: '14px', textTransform: 'uppercase', letterSpacing: 0.5 }
  const cardValueStyle = { color: '#0a0a0a', fontWeight: 700, fontSize: '28px' }
  const adminCount = users.filter((u) => u.user_rights === 'admin').length

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout>
        <Navbar title="USER REGISTRATION" />
        <Content style={{ margin: 24 }}>

          {/* Stat cards */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={8}>
              <div style={cardStyle}>
                <Statistic title={<span style={cardTitleStyle}>Total Users</span>} value={users.length} valueStyle={cardValueStyle} />
              </div>
            </Col>
            <Col span={8}>
              <div style={cardStyle}>
                <Statistic title={<span style={cardTitleStyle}>Admins</span>} value={adminCount} valueStyle={cardValueStyle} />
              </div>
            </Col>
            <Col span={8}>
              <div style={cardStyle}>
                <Statistic title={<span style={cardTitleStyle}>Regular Users</span>} value={users.length - adminCount} valueStyle={cardValueStyle} />
              </div>
            </Col>
          </Row>

          {/* Search + Add */}
          <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
            <UserSearchBar onSearch={setSearchTerm} />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => window.open('/users/new', '_blank', 'noopener')}
              style={{ background: '#111', borderColor: '#111' }}
            >
              Add User
            </Button>
          </Row>

          {/* Table */}
          <div style={{ background: '#fff', border: '1px solid #f0f0f0' }}>
            <Table
              rowKey="rec_id"
              columns={columns}
              dataSource={filteredUsers}
              loading={loading}
              pagination={{ pageSize: 10 }}
              scroll={{ x: showExtraColumns ? 3000 : 900, y: 480 }}
              sticky
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

      {/* User Info popup: view details, edit (new tab), delete, system access */}
      {infoUser && (
        <Modal
          open={!!infoUser}
          onCancel={() => setInfoUser(null)}
          footer={null}
          destroyOnClose
          width={420}
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: 24 }}>
              <span>{infoUser.user_name}</span>
              <Popconfirm
                title="Delete this user?"
                description="This action cannot be undone."
                onConfirm={() => handleDelete(infoUser.rec_id)}
                okText="Delete"
                okButtonProps={{ danger: true }}
              >
                <Button size="small" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </div>
          }
        >
          <Space direction="vertical" size={8} style={{ width: '100%', marginBottom: 20 }}>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>User ID</Text>
              <div style={{ fontWeight: 600 }}>{infoUser.userid}</div>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>Email</Text>
              <div>{infoUser.user_email_address || '-'}</div>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>Mobile</Text>
              <div>{infoUser.user_mobile_no || '-'}</div>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>Rights</Text>
              <div>
                <Tag color={infoUser.user_rights === 'admin' ? '#000000' : '#8c8c8c'} style={{ borderRadius: 0, margin: '4px 0 0' }}>
                  {(infoUser.user_rights || 'user').toUpperCase()}
                </Tag>
              </div>
            </div>
          </Space>

          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <Button block icon={<EditOutlined />} onClick={() => window.open(`/users/edit/${infoUser.rec_id}`, '_blank', 'noopener')}>
              Edit User
            </Button>

            {infoUser.user_rights === 'admin' && (
              <Button
                block
                icon={<SafetyCertificateOutlined />}
                onClick={() => setShowExtraColumns((v) => !v)}
                style={{ background: '#111', borderColor: '#111', color: '#fff' }}
              >
                {showExtraColumns ? 'Hide System Access' : 'System Access'}
              </Button>
            )}
          </Space>
        </Modal>
      )}
    </Layout>
  )
}