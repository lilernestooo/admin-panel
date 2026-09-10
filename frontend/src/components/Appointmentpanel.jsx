import React, { useEffect, useState } from 'react'
import {
  Table, Button, Modal, Form, Input, Select, DatePicker, TimePicker,
  Tag, Popconfirm, message, Typography, Space, Avatar,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { fetchAppointments, saveAppointment, deleteAppointment } from '../api/appointmentApi'

const { Text } = Typography

const STATUS_COLORS = {
  scheduled: '#0a0a0a',
  completed: '#52c41a',
  cancelled: '#8c8c8c',
}

export default function AppointmentPanel({ user }) {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState(null)
  const [form] = Form.useForm()

  const loadAppointments = async () => {
    if (!user?.rec_id) return
    setLoading(true)
    try {
      const res = await fetchAppointments(user.rec_id)
      if (res.success) setAppointments(res.data)
      else message.error(res.message || 'Failed to load appointments')
    } catch (err) {
      message.error('Could not reach the backend. Is XAMPP running?')
    }
    setLoading(false)
  }

  useEffect(() => {
    loadAppointments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.rec_id])

  const openAddModal = () => {
    setEditingAppointment(null)
    form.resetFields()
    setModalOpen(true)
  }

  const openEditModal = (record) => {
    setEditingAppointment(record)
    form.setFieldsValue({
      ...record,
      appointment_date: record.appointment_date ? dayjs(record.appointment_date) : null,
      appointment_time: record.appointment_time ? dayjs(record.appointment_time, 'HH:mm:ss') : null,
    })
    setModalOpen(true)
  }

  const handleDelete = async (appointment_id) => {
    const res = await deleteAppointment(appointment_id)
    if (res.success) {
      message.success('Appointment deleted')
      loadAppointments()
    } else {
      message.error(res.message || 'Delete failed')
    }
  }

  const handleSubmit = async (values) => {
    const payload = {
      ...values,
      user_rec_id: user.rec_id,
      appointment_date: values.appointment_date?.format('YYYY-MM-DD'),
      appointment_time: values.appointment_time?.format('HH:mm:ss') || null,
      ...(editingAppointment ? { appointment_id: editingAppointment.appointment_id } : {}),
    }

    const res = await saveAppointment(payload)
    if (res.success) {
      message.success(editingAppointment ? 'Appointment updated' : 'Appointment created')
      setModalOpen(false)
      loadAppointments()
    } else {
      message.error(res.message || 'Something went wrong')
    }
  }

  // Centered columns schema configuration
  const columns = [
    {
      title: 'DATE',
      dataIndex: 'appointment_date',
      key: 'appointment_date',
      width: 140,
      align: 'center',
      render: (val) => (val ? dayjs(val).format('MMM D, YYYY') : '—'),
    },
    {
      title: 'TIME',
      dataIndex: 'appointment_time',
      key: 'appointment_time',
      width: 130,
      align: 'center',
      render: (val) => (val ? dayjs(val, 'HH:mm:ss').format('h:mm A') : <Text type="secondary">—</Text>),
    },
    { 
      title: 'TITLE', 
      dataIndex: 'title', 
      key: 'title',
      align: 'center',
      render: (val) => <div style={{ textAlign: 'center', width: '100%' }}>{val || '—'}</div>
    },
    {
      title: 'NOTES',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
      align: 'center',
      render: (val) => <div style={{ textAlign: 'center', width: '100%' }}>{val || <Text type="secondary">—</Text>}</div>,
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      align: 'center',
      render: (status) => (
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <Tag color={STATUS_COLORS[status] || '#8c8c8c'} style={{ borderRadius: 0, margin: 0 }}>
            {(status || 'scheduled').toUpperCase()}
          </Tag>
        </div>
      ),
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      width: 140,
      align: 'center',
      render: (_, record) => (
        <Space size="small" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)} />
          <Popconfirm
            title="Delete this appointment?"
            onConfirm={() => handleDelete(record.appointment_id)}
            okText="Delete"
            okButtonProps={{ danger: true }}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 8, padding: 20, marginTop: 20 }}>
      {/* Dynamic inline styles to completely force absolute header center layout */}
      <style>{`
        .centered-table .ant-table-thead > tr > th {
          text-align: center !important;
        }
        .centered-table .ant-table-tbody > tr > td {
          text-align: center !important;
        }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Space>
          <Avatar style={{ backgroundColor: '#0a0a0a' }} icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 600 }}>
              <CalendarOutlined style={{ marginRight: 6 }} />
              Appointments — {user?.user_name || 'Guest'}
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>{user?.userid || ''}</Text>
          </div>
        </Space>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openAddModal}
          style={{ background: '#111', borderColor: '#111' }}
        >
          Add Appointment
        </Button>
      </div>

      <Table
        className="centered-table"
        rowKey="appointment_id"
        columns={columns}
        dataSource={appointments}
        loading={loading}
        pagination={{ pageSize: 5 }}
        bordered
        size="small"
        locale={{ emptyText: 'No appointments yet for this user' }}
      />

      <Modal
        title={editingAppointment ? 'Edit Appointment' : 'New Appointment'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnClose
        maskClosable={false}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Title is required' }]}>
            <Input placeholder="e.g. Client meeting" />
          </Form.Item>
          <Space.Compact block>
            <Form.Item
              name="appointment_date"
              label="Date"
              rules={[{ required: true, message: 'Date is required' }]}
              style={{ width: '60%' }}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="appointment_time" label="Time" style={{ width: '40%' }}>
              <TimePicker style={{ width: '100%' }} format="h:mm A" />
            </Form.Item>
          </Space.Compact>
          <Form.Item name="status" label="Status" initialValue="scheduled">
            <Select
              options={[
                { value: 'scheduled', label: 'Scheduled' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
            />
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={3} placeholder="Optional details" />
          </Form.Item>
          <Form.Item style={{ marginTop: 8, marginBottom: 0, textAlign: 'right' }}>
            <Button type="primary" htmlType="submit" style={{ background: '#111', borderColor: '#111' }}>
              Save
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
