import React, { useState } from 'react'
import { Form, Input, Button, Typography, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { loginUser } from '../api/userApi'

const { Title, Text } = Typography

export default function Login() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (values) => {
    setLoading(true)
    try {
      const res = await loginUser(values)
      if (res.success) {
        localStorage.setItem('admin_user', JSON.stringify(res.user))
        message.success('Welcome back')
        navigate('/')
      } else {
        message.error(res.message || 'Invalid credentials')
      }
    } catch (err) {
      message.error('Could not reach the backend. Is XAMPP running?')
    }
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left branding panel */}
      <div
        style={{
          flex: 1,
          background: '#0a0a0a',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 60px',
        }}
      >
        <Title style={{ color: '#fff', marginBottom: 8, fontSize: 40 }}>Admin Panel</Title>
        <Text style={{ color: '#8c8c8c', fontSize: 16, maxWidth: 360 }}>
          Manage user registrations, access rights, and accounts from one dashboard.
        </Text>
      </div>

      {/* Right login form panel */}
      <div
        style={{
          flex: 1,
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ width: 340 }}>
          <Title level={3} style={{ marginBottom: 4 }}>Sign in</Title>
          <Text type="secondary">Enter your credentials to continue</Text>

          <Form layout="vertical" onFinish={handleSubmit} style={{ marginTop: 32 }}>
            <Form.Item
              name="userid"
              label="User ID"
              rules={[{ required: true, message: 'User ID is required' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="e.g. jdoe" size="large" />
            </Form.Item>

            <Form.Item
              name="user_password"
              label="Password"
              rules={[{ required: true, message: 'Password is required' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
            </Form.Item>

            <Form.Item style={{ marginTop: 24 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={loading}
                style={{ background: '#111', borderColor: '#111' }}
              >
                Sign in
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  )
}