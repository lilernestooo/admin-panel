import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Layout, Form, Input, InputNumber, Select, Button, Modal, Divider, Spin,
  Popconfirm, Typography, Row, Col, message,
} from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import { fetchDealerById, createDealer, updateDealer, deleteDealer } from '../api/dealerApi'

const { Content } = Layout
const { Title, Text } = Typography

// Same close-the-tab-or-fall-back-to-list behavior as UserForm.jsx --
// these forms are opened via window.open in their own tab.
function closeOrRedirect(navigate) {
  window.close()
  setTimeout(() => {
    if (!window.closed) navigate('/dealers')
  }, 150)
}

const yesNoOptions = [
  { value: 'Y', label: 'Yes' },
  { value: 'N', label: 'No' },
]

export default function DealerForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id

  const [form] = Form.useForm()

  const [loadingDealer, setLoadingDealer] = useState(isEditing)
  const [notFound, setNotFound] = useState(false)
  const [editingDealer, setEditingDealer] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    document.title = isEditing ? 'Admin - Edit Dealer' : 'Admin - Add New Dealer'
  }, [isEditing])

  // -- Load the existing dealer when editing ----------------------------
  useEffect(() => {
    if (!isEditing) return
    let cancelled = false

    setLoadingDealer(true)
    fetchDealerById(id).then((res) => {
      if (cancelled) return
      if (res.success) {
        setEditingDealer(res.data)
        form.setFieldsValue(res.data)
      } else {
        setNotFound(true)
        message.error(res.message || 'Dealer not found')
      }
      setLoadingDealer(false)
    })

    return () => { cancelled = true }
  }, [id, isEditing, form])

  // -- Submit ------------------------------------------------------------
  const handleSubmit = async (values) => {
    setSubmitting(true)
    let res
    try {
      res = isEditing
        ? await updateDealer({ ...values, rec_id: editingDealer.rec_id })
        : await createDealer(values)
    } catch (err) {
      setSubmitting(false)
      message.error('Could not reach the backend. Please check your connection and try again.')
      return
    }
    setSubmitting(false)

    if (!res.success) {
      message.error(res.message || 'Something went wrong')
      return
    }

    Modal.success({
      title: isEditing ? 'Dealer Updated Successfully' : 'Dealer Added Successfully',
      content: isEditing
        ? 'The changes have been saved.'
        : 'The new dealer has been added to the system.',
      okText: 'Close',
      okButtonProps: { style: { background: 'var(--btn-dark-bg)', borderColor: 'var(--btn-dark-bg)' } },
      onOk: () => closeOrRedirect(navigate),
    })
  }

  // -- Delete -----------------------------------------------------------
  const handleDelete = async () => {
    setDeleting(true)
    let res
    try {
      res = await deleteDealer(editingDealer.rec_id)
    } catch (err) {
      setDeleting(false)
      message.error('Could not reach the backend. Please try again.')
      return
    }
    setDeleting(false)
    if (res.success) {
      message.success('Dealer deleted successfully')
      window.close()
      setTimeout(() => {
        if (!window.closed) navigate('/dealers')
      }, 150)
    } else {
      message.error(res.message || 'Delete failed')
    }
  }

  if (loadingDealer) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Sidebar />
        <Layout>
          <Navbar title="EDIT DEALER" />
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 64px)' }}>
            <Spin size="large" />
          </div>
        </Layout>
      </Layout>
    )
  }

  if (notFound) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Sidebar />
        <Layout>
          <Navbar title="EDIT DEALER" />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 64px)', gap: 16 }}>
            <Title level={4}>Dealer not found</Title>
            <Button onClick={() => closeOrRedirect(navigate)}>Close</Button>
          </div>
        </Layout>
      </Layout>
    )
  }

  const SectionHeader = ({ title, subtitle }) => (
    <div style={{ marginBottom: 20 }}>
      <Title level={5} style={{ margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {title}
      </Title>
      {subtitle && (
        <Text type="secondary" style={{ fontSize: 13 }}>
          {subtitle}
        </Text>
      )}
    </div>
  )

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout>
        <Navbar title={isEditing ? 'EDIT DEALER' : 'ADD NEW DEALER'} />
        <Content style={{ margin: '32px auto', maxWidth: 920, width: '100%', padding: '0 24px 48px' }}>
          <Spin spinning={submitting} tip={isEditing ? 'Saving changes...' : 'Adding dealer...'}>
            <Form
              form={form}
              layout="vertical"
              size="large"
              onFinish={handleSubmit}
              initialValues={{
                active_dealer: 'Y',
                daily_svrappt: 'N',
                dlrCalendar: 'N',
                responseTime: 'N',
                eric6_api: 'N',
                festtype: 'CarsTruck',
                cc_assignment: 'Carworld',
              }}
            >

              {/* -- Basic info section --------------------------------------- */}
              <div className="lgc-section">
                <SectionHeader title="Basic Info" subtitle="Core dealer identity" />
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item name="dealerid" label="Dealer ID" rules={[{ required: true, message: 'Dealer ID is required' }]}>
                      <Input maxLength={10} placeholder="e.g. D001" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="dealername" label="Dealer Name" rules={[{ required: true, message: 'Dealer Name is required' }]}>
                      <Input maxLength={50} placeholder="e.g. Luzon Cars Corp" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item name="dealercode" label="Dealer Code">
                      <Input maxLength={4} placeholder="e.g. LC01" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="brandid" label="Brand ID">
                      <Input maxLength={10} placeholder="e.g. TOY" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={8}>
                    <Form.Item name="dealergroup" label="Dealer Group">
                      <Input maxLength={4} placeholder="e.g. LGC" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="vieworder" label="View Order">
                      <InputNumber style={{ width: '100%' }} placeholder="Display order" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="active_dealer" label="Active">
                      <Select options={yesNoOptions} getPopupContainer={(t) => t.parentNode} popupClassName="lgc-select-dropdown" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item name="ch_activated" label="CH Activated">
                      <Input maxLength={3} placeholder="Y / N" />
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              <Divider className="lgc-section-divider" />

              {/* -- Location & web section -------------------------------- */}
              <div className="lgc-section">
                <SectionHeader title="Location & Web" subtitle="Address and online presence" />
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item name="dealer_street" label="Street">
                      <Input maxLength={200} placeholder="Street address" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="dealer_city" label="City">
                      <Input maxLength={200} placeholder="City" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item name="bm_address" label="BM Address">
                      <Input maxLength={100} placeholder="Branch manager address" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="crm_address" label="CRM Address">
                      <Input maxLength={100} placeholder="CRM system address" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item name="dealer_facade" label="Facade">
                      <Input maxLength={200} placeholder="Facade description" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="host_name" label="Host Name">
                      <Input maxLength={50} placeholder="Server / host name" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item name="websites" label="Website">
                      <Input maxLength={200} placeholder="https://..." />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="img_file" label="Image File">
                      <Input maxLength={20} placeholder="e.g. dealer01.jpg" />
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              <Divider className="lgc-section-divider" />

              {/* -- Contact numbers section -------------------------------- */}
              <div className="lgc-section">
                <SectionHeader title="Contact Numbers" subtitle="Phone and fax lines" />
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item name="sales_no" label="Sales No.">
                      <Input placeholder="Sales contact number(s)" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="trunk_no" label="Trunk No.">
                      <Input placeholder="Trunk line number(s)" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item name="fax_no" label="Fax No.">
                      <Input placeholder="Fax number(s)" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="service_no" label="Service No.">
                      <Input placeholder="Service contact number(s)" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item name="crm_no" label="CRM No.">
                      <Input placeholder="CRM contact number(s)" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="cs_appnt" label="CS Appointment No.">
                      <Input placeholder="Customer service appointment number(s)" />
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              <Divider className="lgc-section-divider" />

              {/* -- CRM & assignment section -------------------------------- */}
              <div className="lgc-section">
                <SectionHeader title="CRM & Assignment" subtitle="System mapping and personnel assignment" />
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item name="assigned_ga" label="Assigned GA">
                      <Input maxLength={200} placeholder="Assigned GA personnel" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="assigned_soamed" label="Assigned SOA/MED">
                      <Input maxLength={100} placeholder="Assigned SOA/MED personnel" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item name="crm2_group_Lvl1" label="CRM2 Group Lvl1">
                      <Input maxLength={8} placeholder="CRM2 group code" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="crm3_group_Lvl1" label="CRM3 Group Lvl1">
                      <Input maxLength={8} placeholder="CRM3 group code" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item name="lvsms_dealername" label="LVSMS Dealer Name">
                      <Input maxLength={80} placeholder="Dealer name as used in LVSMS" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="vtiger_dealername" label="VTiger Dealer Name">
                      <Input maxLength={50} placeholder="Dealer name as used in VTiger" />
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              <Divider className="lgc-section-divider" />

              {/* -- System settings section -------------------------------- */}
              <div className="lgc-section">
                <SectionHeader title="System Settings" subtitle="Feature flags and integration defaults" />
                <Row gutter={24}>
                  <Col span={8}>
                    <Form.Item name="daily_svrappt" label="Daily SVR Appt">
                      <Select options={yesNoOptions} getPopupContainer={(t) => t.parentNode} popupClassName="lgc-select-dropdown" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="dlrCalendar" label="Dealer Calendar">
                      <Select options={yesNoOptions} getPopupContainer={(t) => t.parentNode} popupClassName="lgc-select-dropdown" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="responseTime" label="Response Time">
                      <Select options={yesNoOptions} getPopupContainer={(t) => t.parentNode} popupClassName="lgc-select-dropdown" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={8}>
                    <Form.Item name="eric6_api" label="Eric6 API">
                      <Select options={yesNoOptions} getPopupContainer={(t) => t.parentNode} popupClassName="lgc-select-dropdown" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="servis2code" label="Servis2 Code">
                      <Input maxLength={6} placeholder="Servis2 code" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="ch_tbl_name" label="CH Table Name">
                      <Input maxLength={45} placeholder="Linked table name" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={8}>
                    <Form.Item name="festtype" label="Fest Type">
                      <Input maxLength={10} placeholder="e.g. CarsTruck" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="FB_Ad_DealerID" label="FB Ad Dealer ID">
                      <Input maxLength={8} placeholder="Facebook ad dealer ID" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="cc_assignment" label="CC Assignment">
                      <Input maxLength={10} placeholder="e.g. Carworld" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item name="date_closed" label="Date Closed">
                      <Input maxLength={200} placeholder="Leave blank if still operating" />
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              <Form.Item style={{ marginTop: 32, marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  {isEditing ? (
                    <Popconfirm
                      title="Delete this dealer?"
                      description="This action cannot be undone."
                      onConfirm={handleDelete}
                      okText="Yes, Delete"
                      cancelText="Cancel"
                      okButtonProps={{ danger: true }}
                    >
                      <Button
                        size="large"
                        danger
                        icon={<DeleteOutlined />}
                        loading={deleting}
                        style={{ borderRadius: 6 }}
                      >
                        Delete Dealer
                      </Button>
                    </Popconfirm>
                  ) : (
                    <span />
                  )}

                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button size="large" style={{ borderRadius: 6 }} onClick={() => closeOrRedirect(navigate)}>
                      Cancel
                    </Button>
                    <Button size="large" type="primary" htmlType="submit" loading={submitting} style={{ background: 'var(--btn-dark-bg)', borderColor: 'var(--btn-dark-bg)', borderRadius: 6 }}>
                      {isEditing ? 'Save Changes' : 'Add Dealer'}
                    </Button>
                  </div>
                </div>
              </Form.Item>
            </Form>
          </Spin>
        </Content>

        <style>{`
          .lgc-select-dropdown .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
            background-color: var(--select-highlight-bg) !important;
            color: var(--select-highlight-text) !important;
            font-weight: 600;
          }
          .lgc-select-dropdown .ant-select-item-option-active:not(.ant-select-item-option-disabled) {
            background-color: var(--select-highlight-bg) !important;
          }

          .ant-form-item-label > label {
            text-transform: uppercase;
            font-size: 12px;
            letter-spacing: 0.5px;
          }
          .ant-select-item-option-content,
          .ant-select-selection-item {
            text-transform: uppercase;
          }
          .ant-btn {
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .ant-modal-title {
            text-transform: uppercase;
          }

          .lgc-section {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 28px 32px;
          }
          .lgc-section-divider {
            margin: 28px 0;
            border-color: transparent;
          }
          .lgc-section .ant-form-item {
            margin-bottom: 22px;
          }
          .lgc-section .ant-input,
          .lgc-section .ant-input-number,
          .lgc-section .ant-select-selector {
            font-size: 15px;
          }
          .lgc-section .ant-select-selector,
          .lgc-section .ant-input-affix-wrapper,
          .lgc-section input.ant-input {
            min-height: 44px !important;
          }
        `}</style>
      </Layout>
    </Layout>
  )
}