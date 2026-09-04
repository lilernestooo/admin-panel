import React, { useState } from 'react'
import { Layout, Menu, Typography } from 'antd'
import {
  DashboardOutlined, TeamOutlined, SettingOutlined,
  MenuFoldOutlined, MenuUnfoldOutlined
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'

const { Sider } = Layout
const { Title, Text } = Typography

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  const selectedKey = location.pathname === '/' ? 'users' : location.pathname.replace('/', '')

  return (
    <Sider
      theme="dark"
      width={230}
      collapsedWidth={80}
      collapsed={collapsed}
      style={{ background: '#0a0a0a' }}
    >
      <div
        style={{
          padding: collapsed ? '20px 0' : '20px 20px',
          borderBottom: '1px solid #262626',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
        }}
      >
        {!collapsed && (
          <div>
            <Title level={4} style={{ color: '#fff', margin: 0, letterSpacing: 0.5 }}>ADMIN PANEL</Title>
            <Text style={{ color: '#8c8c8c', fontSize: 12 }}>User Management</Text>
          </div>
        )}
       <div
          onClick={() => setCollapsed(!collapsed)}
          style={{
            color: '#8c8c8c',
            cursor: 'pointer',
            fontSize: 18,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </div>
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        style={{ background: '#0a0a0a', borderRight: 'none', marginTop: 12 }}
        items={[
          { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
          { key: 'users', icon: <TeamOutlined />, label: 'Users' },
          { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
        ]}
        onClick={({ key }) => {
          if (key === 'users') navigate('/')
          else navigate(`/${key}`)
        }}
      />
    </Sider>
  )
}