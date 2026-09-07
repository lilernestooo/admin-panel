import React, { useEffect, useState } from 'react'
import {
  Layout, Card, Row, Col, Statistic, Typography, Progress,
  List, Avatar, Tag, Space, Button, message
} from 'antd'
import {
  TeamOutlined, UserOutlined, SafetyCertificateOutlined,
  ClockCircleOutlined, ArrowUpOutlined, PlusOutlined, RiseOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import { fetchUsers } from '../api/userApi'
import logo from '../assets/logo.png'

const { Content } = Layout
const { Title, Text } = Typography

export default function Overview() {
  const navigate = useNavigate()
const [users, setUsers] = useState([])
const [loading, setLoading] = useState(false)
const [hoveredCard, setHoveredCard] = useState(null)

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

  const totalUsers = users.length
  const adminCount = users.filter(u => u.user_rights === 'admin').length
  const regularCount = users.filter(u => u.user_rights !== 'admin').length
  const adminPercent = totalUsers ? Math.round((adminCount / totalUsers) * 100) : 0
  const regularPercent = totalUsers ? 100 - adminPercent : 0

  const neverLoggedIn = users.filter(u => !u.last_loggin).length
  const activePercent = totalUsers ? Math.round(((totalUsers - neverLoggedIn) / totalUsers) * 100) : 0

  const recentUsers = [...users]
    .filter(u => u.last_loggin)
    .sort((a, b) => new Date(b.last_loggin) - new Date(a.last_loggin))
    .slice(0, 5)

  const recentlyCreated = [...users]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5)

const getStatCardStyle = (key) => ({
  background: '#fff',
  border: '1px solid #eee',
  padding: '24px 20px',
  borderRadius: 8,
  boxShadow: hoveredCard === key
    ? 'inset 4px 0 0 0 #b71c1c, 0 12px 24px rgba(0, 0, 0, 0.15)'
    : 'inset 4px 0 0 0 #0a0a0a, 0 6px 16px rgba(0, 0, 0, 0.08)',
  height: '100%',
  cursor: 'pointer',
  transform: hoveredCard === key ? 'translateY(-4px)' : 'translateY(0)',
  transition: 'all 0.2s ease',
})

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout>
        <Navbar title="DASHBOARD OVERVIEW" />
        <Content style={{ margin: 24 }}>

          {/* ── Welcome banner ─────────────────────── */}
          <div
            style={{
                background: '#0a0a0a',
                borderRadius: 10,
                padding: '28px 32px',
                marginBottom: 24,
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}
            >
            <div
                style={{
                position: 'absolute',
                top: -40,
                right: -40,
                width: 200,
                height: 200,
                background: 'radial-gradient(circle, rgba(183,28,28,0.35) 0%, rgba(183,28,28,0) 70%)',
                }}
            />

            <div style={{ position: 'relative', zIndex: 1 }}>
                <Title level={3} style={{ color: '#fff', margin: 0 }}>Welcome back</Title>
                <Text style={{ color: '#8c8c8c', fontSize: 14 }}>
                Here's what's happening with your user base today.
                </Text>
            </div>

            <div
                style={{
                position: 'relative',
                zIndex: 1,
                background: '#fff',
                borderRadius: 10,
                padding: '10px 18px',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.35)',
                display: 'flex',
                alignItems: 'center',
                }}
            >
                <img src={logo} alt="LGC Logo" style={{ height: 40, width: 'auto', display: 'block' }} />
            </div>
            </div>

          {/* ── Stat cards ─────────────────────────── */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
            <div
            style={getStatCardStyle('total')}
            onMouseEnter={() => setHoveredCard('total')}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => navigate('/')}
            >
            <Statistic
                title={<span style={{ color: '#595959', fontWeight: 500, fontSize: 14 }}>Total Users</span>}
                value={totalUsers}
                prefix={<TeamOutlined style={{ color: '#0a0a0a', marginRight: 4 }} />}
                valueStyle={{ color: '#0a0a0a', fontWeight: 700, fontSize: 28 }}
            />
            </div>
        </Col>
        <Col span={6}>
            <div
            style={getStatCardStyle('admins')}
            onMouseEnter={() => setHoveredCard('admins')}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => navigate('/')}
            >
            <Statistic
                title={<span style={{ color: '#595959', fontWeight: 500, fontSize: 14 }}>Admins</span>}
                value={adminCount}
                prefix={<SafetyCertificateOutlined style={{ color: '#b71c1c', marginRight: 4 }} />}
                valueStyle={{ color: '#0a0a0a', fontWeight: 700, fontSize: 28 }}
            />
            </div>
        </Col>
        <Col span={6}>
            <div
            style={getStatCardStyle('regular')}
            onMouseEnter={() => setHoveredCard('regular')}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => navigate('/')}
            >
            <Statistic
                title={<span style={{ color: '#595959', fontWeight: 500, fontSize: 14 }}>Regular Users</span>}
                value={regularCount}
                prefix={<UserOutlined style={{ color: '#0a0a0a', marginRight: 4 }} />}
                valueStyle={{ color: '#0a0a0a', fontWeight: 700, fontSize: 28 }}
            />
            </div>
        </Col>
        <Col span={6}>
            <div
            style={getStatCardStyle('active')}
            onMouseEnter={() => setHoveredCard('active')}
            onMouseLeave={() => setHoveredCard(null)}
            >
            <Statistic
                title={<span style={{ color: '#595959', fontWeight: 500, fontSize: 14 }}>Ever Logged In</span>}
                value={activePercent}
                suffix="%"
                prefix={<RiseOutlined style={{ color: '#389e0d', marginRight: 4 }} />}
                valueStyle={{ color: '#0a0a0a', fontWeight: 700, fontSize: 28 }}
            />
            </div>
        </Col>
        </Row>

          <Row gutter={16}>
            {/* ── Role distribution ──────────────────── */}
            <Col span={8}>
              <Card
                title="Role Distribution"
                style={{ borderRadius: 8, height: '100%' }}
                headStyle={{ fontWeight: 600 }}
              >
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text>Admins</Text>
                    <Text strong>{adminCount}</Text>
                  </div>
                  <Progress percent={adminPercent} strokeColor="#0a0a0a" showInfo={false} />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text>Regular Users</Text>
                    <Text strong>{regularCount}</Text>
                  </div>
                  <Progress percent={regularPercent} strokeColor="#b71c1c" showInfo={false} />
                </div>

                <Button
                  block
                  icon={<PlusOutlined />}
                  style={{ marginTop: 24, background: '#111', borderColor: '#111', color: '#fff' }}
                  onClick={() => navigate('/')}
                >
                  Manage Users
                </Button>
              </Card>
            </Col>

            {/* ── Recently active ────────────────────── */}
            <Col span={8}>
              <Card
                title="Recently Active"
                style={{ borderRadius: 8, height: '100%' }}
                headStyle={{ fontWeight: 600 }}
              >
                {recentUsers.length === 0 ? (
                  <Text type="secondary">No login activity yet</Text>
                ) : (
                    <List
                    dataSource={recentUsers}
                    renderItem={(u) => (
                        <List.Item
                        style={{ padding: '10px 8px', borderRadius: 6, cursor: 'pointer', transition: 'background-color 0.15s ease' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        onClick={() => navigate('/')}
                        >
                        <List.Item.Meta
                          avatar={<Avatar style={{ backgroundColor: '#0a0a0a' }} icon={<UserOutlined />} />}
                          title={<Text strong style={{ fontSize: 13 }}>{u.user_name}</Text>}
                          description={
                            <Space size={4} style={{ fontSize: 12, color: '#8c8c8c' }}>
                              <ClockCircleOutlined />
                              {new Date(u.last_loggin).toLocaleString()}
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                )}
              </Card>
            </Col>

            {/* ── Recently added ─────────────────────── */}
            <Col span={8}>
              <Card
                title="Recently Added"
                style={{ borderRadius: 8, height: '100%' }}
                headStyle={{ fontWeight: 600 }}
              >
                {recentlyCreated.length === 0 ? (
                  <Text type="secondary">No users yet</Text>
                ) : (
                    <List
                    dataSource={recentlyCreated}
                    renderItem={(u) => (
                        <List.Item
                        style={{ padding: '10px 8px', borderRadius: 6, cursor: 'pointer', transition: 'background-color 0.15s ease' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        onClick={() => navigate('/')}
                        >
                        <List.Item.Meta
                          avatar={<Avatar style={{ backgroundColor: '#fff', border: '1px solid #d9d9d9', color: '#0a0a0a' }} icon={<UserOutlined />} />}
                          title={<Text strong style={{ fontSize: 13 }}>{u.user_name}</Text>}
                          description={
                            <Space size={4}>
                              <Tag color={u.user_rights === 'admin' ? '#000000' : '#8c8c8c'} style={{ borderRadius: 0, fontSize: 11 }}>
                                {(u.user_rights || 'user').toUpperCase()}
                              </Tag>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                              </Text>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                )}
              </Card>
            </Col>
          </Row>

        </Content>
      </Layout>
    </Layout>
  )
}