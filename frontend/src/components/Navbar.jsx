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
    { key: 'logout', label: 'Log out', icon: <LogoutOutlined />, onClick: handleLogout, danger: true },
  ]

  return (
    <Header
      style={{
        background: '#0a0a0a',
        borderBottom: '1px solid #262626',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
      }}
    >
      <Title level={4} style={{ margin: 0, color: '#fff' }}>{title}</Title>

      <Dropdown menu={{ items: menuItems }} trigger={['click']}>
        <Space style={{ cursor: 'pointer' }}>
          <Avatar style={{ backgroundColor: '#fff', color: '#0a0a0a' }} icon={<UserOutlined />} />
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: '#fff' }}>{storedUser.user_name || 'Admin'}</div>
            <Text style={{ fontSize: 11, color: '#8c8c8c' }}>{storedUser.user_rights || 'admin'}</Text>
          </div>
          <DownOutlined style={{ fontSize: 10, color: '#fff' }} />
        </Space>
      </Dropdown>
    </Header>
  )
}