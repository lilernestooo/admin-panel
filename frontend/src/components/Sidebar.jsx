import React, { useState, useEffect } from 'react'
import { Layout, Menu, Typography } from 'antd'
import {
  TeamOutlined, SettingOutlined, FileSearchOutlined, ToolOutlined,
  ShopOutlined, ApartmentOutlined,
  MenuFoldOutlined, MenuUnfoldOutlined
} from '@ant-design/icons'
import DashboardIcon from '@mui/icons-material/Dashboard'
import { useNavigate, useLocation } from 'react-router-dom'

const { Sider } = Layout
const { Title, Text } = Typography

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar_collapsed')
    return saved === 'true'
  })

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', collapsed)
  }, [collapsed])

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
            <Text style={{ color: '#8c8c8c', fontSize: 12 }}>USER MANAGEMENT</Text>
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
        defaultOpenKeys={['maintenance']}
        style={{ background: '#0a0a0a', borderRight: 'none', marginTop: 12 }}
        items={[
          {
            key: 'dashboard',
            icon: (
              <DashboardIcon
                style={{
                  fontSize: 16,
                  color: selectedKey === 'dashboard' ? '#0a0a0a' : '#fff',
                }}
              />
            ),
            label: 'Dashboard',
          },
          {
            key: 'maintenance',
            icon: <ToolOutlined />,
            label: 'Maintenance',
            children: [
              { key: 'users', icon: <TeamOutlined />, label: 'Users' },
              { key: 'dealers', icon: <ShopOutlined />, label: 'Dealers' },
              { key: 'company', icon: <ApartmentOutlined />, label: 'Company' },
            ],
          },
          { key: 'audit-log', icon: <FileSearchOutlined />, label: 'Audit Log' },
          // { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
        ]}
        onClick={({ key }) => {
          if (key === 'users') navigate('/')
          else navigate(`/${key}`)
        }}
      />
    </Sider>
  )
}