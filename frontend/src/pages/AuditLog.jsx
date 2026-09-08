import React, { useEffect, useState } from 'react'
import { Layout, Table, Tag, Typography, message } from 'antd'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import { fetchAuditLogs } from '../api/userApi'

const { Content } = Layout
const { Text } = Typography

const actionColors = {
  'CREATE': '#389e0d',
  'UPDATE': '#1677ff',
  'UPDATE (password changed)': '#faad14',
  'DELETE': '#b71c1c',
}

export default function AuditLog() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)

  const loadLogs = async () => {
    setLoading(true)
    try {
      const res = await fetchAuditLogs()
      if (res.success) setLogs(res.data)
      else message.error(res.message || 'Failed to load audit log')
    } catch (err) {
      message.error('Could not reach the backend. Is XAMPP running?')
    }
    setLoading(false)
  }

  useEffect(() => { loadLogs() }, [])

  const columns = [
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 180,
      render: (action) => (
        <Tag color={actionColors[action] || '#8c8c8c'} style={{ borderRadius: 0, margin: 0 }}>
          {action}
        </Tag>
      ),
    },
    { title: 'Performed By', dataIndex: 'performed_by', key: 'performed_by', width: 160 },
    { title: 'Target User ID', dataIndex: 'target_userid', key: 'target_userid', width: 160 },
    { title: 'Target Name', dataIndex: 'target_user_name', key: 'target_user_name', width: 200 },
    {
      title: 'Date & Time',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 200,
      render: (val) => val ? new Date(val).toLocaleString() : '—',
    },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout>
        <Navbar title="AUDIT LOG" />
        <Content style={{ margin: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">
              A read-only record of every user account created, updated, or deleted, and who performed the action.
            </Text>
          </div>

          <div style={{ background: '#fff', border: '1px solid #8c8c8c' }}>
            <Table
              rowKey="log_id"
              columns={columns}
              dataSource={logs}
              loading={loading}
              pagination={{ pageSize: 15 }}
              bordered
            />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}