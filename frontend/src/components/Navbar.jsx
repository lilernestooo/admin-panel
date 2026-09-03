import React from 'react'
import { Layout, Typography, Avatar, Dropdown, Space } from 'antd'
import { UserOutlined, DownOutlined, LogoutOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Header } = Layout
const { Title, Text } = Typography

export default function Navbar({ title }) {
  const navigate = useNavigate()
  const storedUser = JSON.parse(localStorage.getItem('admin_user') || '{}')

  const handleLogout = () => {
    localStorage.removeItem('admin_user')
    navigate('/login')
  }

  const menuItems = [
    { key: 'logout', label: 'Log out', icon: <LogoutOutlined />, onClick: handleLogout },
  ]

  return (
    <Header
      style={{
        background: '#fff',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
      }}
    >
      <Title level={4} style={{ margin: 0 }}>{title}</Title>

      <Dropdown menu={{ items: menuItems }} trigger={['click']}>
        <Space style={{ cursor: 'pointer' }}>
          <Avatar style={{ backgroundColor: '#0a0a0a' }} icon={<UserOutlined />} />
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{storedUser.user_name || 'Admin'}</div>
            <Text type="secondary" style={{ fontSize: 11 }}>{storedUser.user_rights || 'admin'}</Text>
          </div>
          <DownOutlined style={{ fontSize: 10, color: '#8c8c8c' }} />
        </Space>
      </Dropdown>
    </Header>
  )
}