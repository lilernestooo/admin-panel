import React from 'react'
import { Layout, Typography, Avatar, Dropdown, Space, Switch, Badge } from 'antd'
import { UserOutlined, DownOutlined, LogoutOutlined, SunOutlined, MoonOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'
import { useTheme } from '../context/ThemeContext'

const { Header } = Layout
const { Title, Text } = Typography

// Tweak these two to adjust the icon colors on the toggle
const MOON_COLOR = '#a855f7' // dark purple
const SUN_COLOR = '#facc15'  // soft yellow

export default function Navbar({ title }) {
  const navigate = useNavigate()
  const { isDark, toggleTheme } = useTheme()
  const storedUser = JSON.parse(localStorage.getItem('admin_user') || '{}')

  const handleLogout = () => {
    // REMOVED: await logoutUser() because it was causing an undefined reference error

    // Clear credentials
    localStorage.removeItem('admin_user')
    sessionStorage.removeItem('system_access_user')

    // Clear all dynamic session unlocked tokens
    Object.keys(sessionStorage)
      .filter((key) => key.startsWith('system_access_unlocked_'))
      .forEach((key) => sessionStorage.removeItem(key))

    // Redirect to login page
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
      <Space size={16} align="center">
        <img src={logo} alt="LGC Logo" style={{ height: 32, width: 'auto' }} />
        <Title level={4} style={{ margin: 0, color: '#fff' }}>{title}</Title>
      </Space>

      <Space size={20} align="center">
        {/* Theme toggle wrapped in a small pill "badge" */}
        <Badge
          count={isDark ? 'DARK' : 'LIGHT'}
          color={isDark ? MOON_COLOR : SUN_COLOR}
          style={{
            color: isDark ? '#fff' : '#111',
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: 0.5,
            boxShadow: 'none',
            padding: '0 6px',
            height: 14,
            lineHeight: '14px',
            borderRadius: 7,
          }}
          offset={[-6, -2]}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: '#1a1a1a',
              border: '1px solid #262626',
              borderRadius: 999,
              padding: '4px 8px',
            }}
          >
            <Switch
              checked={isDark}
              onChange={toggleTheme}
              checkedChildren={<MoonOutlined style={{ color: MOON_COLOR }} />}
              unCheckedChildren={<SunOutlined style={{ color: SUN_COLOR }} />}
              aria-label="Toggle dark mode"
            />
          </div>
        </Badge>

        <Dropdown menu={{ items: menuItems }} trigger={['click']}>
          <Space style={{ cursor: 'pointer' }}>
            <Avatar style={{ backgroundColor: '#fff', color: '#0a0a0a' }} icon={<UserOutlined />} />
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: '#fff' }}>{storedUser.user_name || 'Admin'}</div>
              {/* Added uppercase transformation helper just in case you want to stay uniform with the user panel */}
              <Text style={{ fontSize: 11, color: '#8c8c8c' }}>
                {storedUser.user_rights ? storedUser.user_rights.toUpperCase() : 'ADMIN'}
              </Text>
            </div>
            <DownOutlined style={{ fontSize: 10, color: '#fff' }} />
          </Space>
        </Dropdown>
      </Space>
    </Header>
  )
}