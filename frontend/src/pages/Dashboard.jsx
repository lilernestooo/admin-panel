import React, { useEffect, useState } from 'react'
import {
  Layout, Card, Row, Col, Statistic, Typography, Progress,
  List, Avatar, Tag, Space, Button, message, Badge, Tooltip as AntTooltip
} from 'antd'
import {
  TeamOutlined, UserOutlined, SafetyCertificateOutlined,
  ClockCircleOutlined, PlusOutlined, RiseOutlined, ReloadOutlined
} from '@ant-design/icons'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip
} from 'recharts'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import { fetchUsers } from '../api/userApi'
import logo from '../assets/logo.png'

const { Content } = Layout
const { Title, Text } = Typography

export default function Dashboard() {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [hoveredCard, setHoveredCard] = useState(null)
  const [, forceTick] = useState(0)
const loadUsers = async (isBackgroundRefresh = false) => {
  if (!isBackgroundRefresh) setLoading(true)
  try {
    const res = await fetchUsers()
    if (res.success) setUsers(res.data)
    else if (!isBackgroundRefresh) message.error(res.message || 'Failed to load users')
  } catch (err) {
    if (!isBackgroundRefresh) message.error('Could not reach the backend. Is XAMPP running?')
  }
  if (!isBackgroundRefresh) setLoading(false)
}

  useEffect(() => { loadUsers() }, [])

  // Auto-refresh immediately when switching back to the dashboard tab
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') loadUsers(true)
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', () => loadUsers(true))
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', () => loadUsers(true))
    }
  }, [])

// Re-evaluate "active" status every 60s so the indicator updates as time passes,
// even without new data (e.g. someone crossing the 24h threshold)
useEffect(() => {
  const tickInterval = setInterval(() => {
    forceTick(prev => prev + 1)
  }, 60 * 1000)
  return () => clearInterval(tickInterval)
}, [])

// Silently refetch user data every 10s to catch new logins and signups in real-time
useEffect(() => {
  const pollInterval = setInterval(() => {
    loadUsers(true)
  }, 10 * 1000)
  return () => clearInterval(pollInterval)
}, [])

  const totalUsers = users.length
  const adminCount = users.filter(u => u.user_rights === 'admin').length
  const regularCount = users.filter(u => u.user_rights !== 'admin').length
  const adminPercent = totalUsers ? Math.round((adminCount / totalUsers) * 100) : 0
  const regularPercent = totalUsers ? 100 - adminPercent : 0

  const neverLoggedIn = users.filter(u => !u.last_loggin).length
  const activePercent = totalUsers ? Math.round(((totalUsers - neverLoggedIn) / totalUsers) * 100) : 0

const isActive = (lastLoggin) => {
  if (!lastLoggin) return false
  const hoursSinceLogin = (Date.now() - new Date(lastLoggin).getTime()) / (1000 * 60 * 60)
  return hoursSinceLogin <= 24
}

const recentUsers = [...users]
  .filter(u => u.last_loggin)
  .sort((a, b) => new Date(b.last_loggin) - new Date(a.last_loggin))
  .slice(0, 5)

  const recentlyCreated = [...users]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5)

      // ── Build cumulative signup growth data for the chart ──────
      const growthData = (() => {
        // Helper to format a Date into local YYYY-MM-DD string
        const toLocalDateKey = (d) => {
          const year = d.getFullYear()
          const month = String(d.getMonth() + 1).padStart(2, '0')
          const day = String(d.getDate()).padStart(2, '0')
          return `${year}-${month}-${day}`
        }

        const withDates = users
          .filter(u => u.created_at)
          .map(u => {
            const dateStr = typeof u.created_at === 'string' ? u.created_at.replace(' ', 'T') : u.created_at
            return new Date(dateStr)
          })
          .filter(d => !isNaN(d.getTime()))
          .sort((a, b) => a - b)

        if (withDates.length === 0) return []

        // Count signups per calendar day using LOCAL date strings (avoids UTC offset shifts)
        const countsByDay = {}
        withDates.forEach(date => {
          const dayKey = toLocalDateKey(date)
          countsByDay[dayKey] = (countsByDay[dayKey] || 0) + 1
        })

        // Walk every calendar day in local time from first signup to today
        const firstDay = new Date(withDates[0])
        firstDay.setHours(0, 0, 0, 0)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // If all signups happened today, prepend yesterday with 0 so the AreaChart can draw an area slope
        const startDay = new Date(firstDay)
        if (firstDay.getTime() === today.getTime()) {
          startDay.setDate(startDay.getDate() - 1)
        }

        const data = []
        let running = 0
        const cursor = new Date(startDay)

        while (cursor <= today) {
          const dayKey = toLocalDateKey(cursor)
          running += countsByDay[dayKey] || 0
          data.push({
            date: cursor.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            users: running,
          })
          cursor.setDate(cursor.getDate() + 1)
        }

        return data
      })()

const getStatCardStyle = (key) => ({
  background: '#fff',
  border: '1px solid #8c8c8c',
  padding: '24px 20px',
  borderRadius: 8,
  boxShadow: hoveredCard === key
    ? 'inset 4px 0 0 0 #b71c1c, 0 12px 24px rgba(0, 0, 0, 0.18)'
    : 'inset 4px 0 0 0 #0a0a0a, 0 6px 16px rgba(0, 0, 0, 0.12)',
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
              <Title level={3} style={{ color: '#fff', margin: 0 }}>WELCOME BACK</Title>
              <Text style={{ color: '#8c8c8c', fontSize: 14 }}>
                HERE'S WHAT'S HAPPENING WITH YOUR USER BASE TODAY.
              </Text>
            </div>
              <div
                style={{
                  position: 'relative',
                  zIndex: 1,
                  width: 220,
                  height: 92,
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'flex-start',
                }}
              >
                <img
                  src={logo}
                  alt="LGC LOGO"
                  style={{
                    width: 220,
                    height: 'auto',
                    display: 'block',
                    mixBlendMode: 'screen',
                  }}
                />
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
                  title={<span style={{ color: '#595959', fontWeight: 500, fontSize: 14 }}>TOTAL USERS</span>}
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
                  title={<span style={{ color: '#595959', fontWeight: 500, fontSize: 14 }}>ADMINS</span>}
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
                  title={<span style={{ color: '#595959', fontWeight: 500, fontSize: 14 }}>REGULAR USERS</span>}
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
                  title={<span style={{ color: '#595959', fontWeight: 500, fontSize: 14 }}>EVER LOGGED IN</span>}
                  value={activePercent}
                  suffix="%"
                  prefix={<RiseOutlined style={{ color: '#389e0d', marginRight: 4 }} />}
                  valueStyle={{ color: '#0a0a0a', fontWeight: 700, fontSize: 28 }}
                />
              </div>
            </Col>
          </Row>

          {/* ── Chart + Role Distribution (grouped together as "analytics") ── */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={16}>
            <Card
              title="USER GROWTH"
              extra={
                <Space size={12}>
                  <Text type="secondary" style={{ fontSize: 12 }}>CUMULATIVE SIGNUPS OVER TIME</Text>
                  <AntTooltip title="Refresh chart">
                    <Button
                      type="text"
                      size="small"
                      icon={<ReloadOutlined spin={loading} />}
                      onClick={() => loadUsers(false)}
                      style={{ color: '#595959' }}
                    />
                  </AntTooltip>
                </Space>
              }
              style={{ borderRadius: 8, height: '100%', border: '1px solid #8c8c8c', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}
              headStyle={{ fontWeight: 600 }}
            >
               {growthData.length === 0 ? (
                    <Text type="secondary">NOT ENOUGH DATA YET TO SHOW GROWTH</Text>
                  ) : (
                    <ResponsiveContainer width="100%" height={280}>
                      <AreaChart data={growthData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#b71c1c" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#b71c1c" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" vertical={true} horizontal={true} />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 12, fill: '#595959' }}
                          axisLine={{ stroke: '#8c8c8c' }}
                          tickLine={{ stroke: '#8c8c8c' }}
                          padding={{ left: 10, right: 10 }}
                        />
                        <YAxis
                          allowDecimals={false}
                          tick={{ fontSize: 12, fill: '#595959' }}
                          axisLine={{ stroke: '#8c8c8c' }}
                          tickLine={{ stroke: '#8c8c8c' }}
                          width={35}
                        />
                        <Tooltip
                          contentStyle={{ borderRadius: 8, border: '1px solid #d9d9d9', fontSize: 13, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                          labelStyle={{ fontWeight: 600, color: '#0a0a0a', marginBottom: 4 }}
                          formatter={(value) => [`${value} users`, 'TOTAL']}
                        />
                        <Area
                          type="monotone"
                          dataKey="users"
                          name="Users"
                          stroke="#b71c1c"
                          strokeWidth={2.5}
                          fill="url(#growthFill)"
                          dot={{ r: 4, fill: '#fff', stroke: '#b71c1c', strokeWidth: 2 }}
                          activeDot={{ r: 6, fill: '#b71c1c', stroke: '#fff', strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
              </Card>
            </Col>

            <Col span={8}>
              <Card
                title="ROLE DISTRIBUTION"
                style={{ borderRadius: 8, height: '100%', border: '1px solid #8c8c8c', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}
                headStyle={{ fontWeight: 600 }}
              >
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text>ADMINS</Text>
                    <Text strong>{adminCount}</Text>
                  </div>
                  <Progress percent={adminPercent} strokeColor="#0a0a0a" showInfo={false} />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text>REGULAR USERS</Text>
                    <Text strong>{regularCount}</Text>
                  </div>
                  <Progress percent={regularPercent} strokeColor="#b71c1c" showInfo={false} />
                </div>

                <Button
                  block
                  icon={<PlusOutlined />}
                  style={{ background: '#111', borderColor: '#111', color: '#fff' }}
                  onClick={() => navigate('/')}
                >
                  MANAGE USERS
                </Button>
              </Card>
            </Col>
          </Row>

          {/* ── Recently active / added (grouped together as "activity feed") ── */}
          <Row gutter={16}>
            <Col span={12}>
              <Card
                  title="RECENTLY ACTIVE"
                    extra={
                      <Space size={10}>
                        <Space size={4}>
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              background: '#52c41a',
                              display: 'inline-block',
                              animation: 'pulse 1.5s ease-in-out infinite',
                            }}
                          />
                          <Text type="secondary" style={{ fontSize: 11 }}>LIVE</Text>
                        </Space>
                        <Space size={4}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#52c41a', display: 'inline-block' }} />
                          <Text type="secondary" style={{ fontSize: 12 }}>ACTIVE IN LAST 24H</Text>
                        </Space>
                      </Space>
                    }
                  style={{ borderRadius: 8, height: '100%', border: '1px solid #8c8c8c', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}
                  headStyle={{ fontWeight: 600 }}
                >
                  {recentUsers.length === 0 ? (
                    <Text type="secondary">NO LOGIN ACTIVITY YET</Text>
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
                            avatar={
                              <Badge
                                dot
                                color={isActive(u.last_loggin) ? '#52c41a' : 'transparent'}
                                offset={[-4, 32]}
                              >
                                <Avatar style={{ backgroundColor: '#0a0a0a' }} icon={<UserOutlined />} />
                              </Badge>
                            }
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

            <Col span={12}>
              <Card
                title="RECENTLY ADDED"
                style={{ borderRadius: 8, height: '100%', border: '1px solid #8c8c8c', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}
                headStyle={{ fontWeight: 600 }}
              >
                {recentlyCreated.length === 0 ? (
                  <Text type="secondary">NO USERS YET</Text>
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

            <style>{`
            @keyframes pulse {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.4; transform: scale(1.3); }
            }
          `}</style>

        </Content>
      </Layout>
    </Layout>
  )
}