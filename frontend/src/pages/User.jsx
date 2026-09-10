import React, { useEffect, useState } from 'react'
import {
  Layout, Table, Button, Modal, Popconfirm, message, Statistic, Row, Col,
  Typography, Space, Tag, Avatar, Segmented, Descriptions,
} from 'antd'
import {
  UserOutlined, PlusOutlined, EditOutlined, DeleteOutlined,
  SafetyCertificateOutlined, InfoCircleOutlined, TeamOutlined,
  PlusCircleFilled, MinusCircleFilled,
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
  const [rightsFilter, setRightsFilter] = useState('all') // 'all' | 'admin' | 'user'

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
    const matchesSearch =
      u.user_name?.toLowerCase().includes(term) ||
      u.userid?.toLowerCase().includes(term) ||
      u.user_email_address?.toLowerCase().includes(term) ||
      u.companyid?.toLowerCase().includes(term)

    const matchesRights =
      rightsFilter === 'all' || (u.user_rights || 'user') === rightsFilter

    return matchesSearch && matchesRights
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

          {/* Search + Filter + Add */}
          <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
            <Space>
              <UserSearchBar onSearch={setSearchTerm} />
              <Segmented
                value={rightsFilter}
                onChange={setRightsFilter}
                className="lgc-segmented"
                options={[
                  {
                    label: (
                      <span className="lgc-seg-option">
                        <TeamOutlined /> All <Tag className="lgc-seg-count">{users.length}</Tag>
                      </span>
                    ),
                    value: 'all',
                  },
                  {
                    label: (
                      <span className="lgc-seg-option">
                        <SafetyCertificateOutlined /> Admins <Tag className="lgc-seg-count">{adminCount}</Tag>
                      </span>
                    ),
                    value: 'admin',
                  },
                  {
                    label: (
                      <span className="lgc-seg-option">
                        <UserOutlined /> Users <Tag className="lgc-seg-count">{users.length - adminCount}</Tag>
                      </span>
                    ),
                    value: 'user',
                  },
                ]}
              />
            </Space>
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
              scroll={{ x: 900, y: 480 }}
              sticky
              bordered
              className="lgc-table"
              expandable={{
                rowExpandable: (record) => record.user_rights === 'admin',
                expandIcon: ({ expanded, onExpand, record, expandable }) =>
                  expandable ? (
                    <Button
                      type="text"
                      shape="circle"
                      size="small"
                      onClick={(e) => onExpand(record, e)}
                      icon={expanded ? <MinusCircleFilled /> : <PlusCircleFilled />}
                      className={`lgc-expand-btn ${expanded ? 'lgc-expand-open' : ''}`}
                    />
                  ) : null,
                expandedRowRender: (record) => (
                  <Descriptions size="small" column={3} bordered style={{ margin: '4px 0' }}>
                    <Descriptions.Item label="TG Mobile No">{record.tg_mobile_no || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Extension ID">{record.extn_id || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Extn Dial Prefix">{record.extn_dial_prefix || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Company">{record.companyid || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Dealer Group Code">{record.user_dealer_group_code || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Function">{record.chFunction || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Calendar Folder">{record.calendar_folder || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Force Change PW">{record.chg_password === 'Y' ? 'Yes' : 'No'}</Descriptions.Item>
                    <Descriptions.Item label="PW Changed At">{dateOrDash(record.chg_psswrd_datetime)}</Descriptions.Item>
                    <Descriptions.Item label="OTP Code">{record.otp_code || '-'}</Descriptions.Item>
                    <Descriptions.Item label="OTP Expires At">{dateOrDash(record.otp_expires_at)}</Descriptions.Item>
                    <Descriptions.Item label="Last Login">{dateOrDash(record.last_loggin, 'Never')}</Descriptions.Item>
                    <Descriptions.Item label="Created At">{dateOrDash(record.created_at)}</Descriptions.Item>
                    <Descriptions.Item label="Updated At">{dateOrDash(record.updated_at)}</Descriptions.Item>
                  </Descriptions>
                ),
              }}
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

          .lgc-segmented {
            background: #f0f0f0 !important;
            padding: 4px !important;
            border-radius: 999px !important;
          }
          .lgc-segmented .ant-segmented-item {
            border-radius: 999px !important;
            transition: all 0.2s ease;
          }
          .lgc-segmented .ant-segmented-item-selected {
            background: #111 !important;
            color: #fff !important;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25) !important;
          }
          .lgc-segmented .ant-segmented-item-selected .lgc-seg-count {
            background: #fff !important;
            color: #111 !important;
          }
          .lgc-seg-option {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 2px 4px;
            font-weight: 500;
          }
          .lgc-seg-count {
            border-radius: 999px !important;
            margin: 0 !important;
            border: none !important;
            background: #d9d9d9;
            color: #595959;
            font-size: 11px;
            line-height: 16px;
            padding: 0 7px;
          }

          .lgc-expand-btn {
            color: #111 !important;
            font-size: 18px !important;
            transition: transform 0.25s ease, color 0.2s ease;
          }
          .lgc-expand-btn:hover {
            color: #595959 !important;
            transform: scale(1.2);
          }
          .lgc-expand-btn.lgc-expand-open {
            color: #52c41a !important;
            transform: rotate(180deg);
          }
          .lgc-expand-btn.lgc-expand-open:hover {
            color: #389e0d !important;
            transform: rotate(180deg) scale(1.2);
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
              <Text type="secondary" style={{ fontSize: 12, textAlign: 'center', display: 'block' }}>
                Expand this user's row in the table (via the <SafetyCertificateOutlined /> caret) to view system access details.
              </Text>
            )}
          </Space>
        </Modal>
      )}
    </Layout>
  )
}