import React, { useState } from 'react'
import { Form, Input, Button, Typography, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { loginUser } from '../api/userApi'
import heroBg from '../assets/ONELGC2019_Final2.jpg'

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
          position: 'relative',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 60px',
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: '25% center',
        }}
      >
        {/* Dark gradient overlay for text legibility and a more premium feel */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(160deg, rgba(10,10,10,0.3) 10%, rgba(10,10,10,0.2) 55%, rgba(10,10,10,0.05) 100%)',
            }}
          />
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

            <div
              style={{
                marginTop: 32,
                padding: '12px 16px',
                background: '#f5f5f5',
                border: '1px solid #e8e8e8',
                borderRadius: 8,
                textAlign: 'center',
              }}
            >
              <Text strong style={{ display: 'block', fontSize: 13, color: '#111' }}>
                Admin Panel
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Manage user registrations, access rights, and accounts from one dashboard.
              </Text>
            </div>
          </div>
        </div>
    </div>
  )
}