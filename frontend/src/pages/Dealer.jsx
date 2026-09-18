import React, { useEffect, useState } from 'react'
import {
  Layout, Table, Button, message, Statistic, Row, Col,
  Typography, Space, Tag, Avatar, Segmented, Descriptions, Tooltip,
} from 'antd'
import {
  ShopOutlined, PlusOutlined, EditOutlined,
  CheckCircleOutlined, StopOutlined, AppstoreOutlined,
  PlusCircleFilled, MinusCircleFilled,
} from '@ant-design/icons'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import UserSearchBar from '../components/UserSearchBar'
import { fetchDealers } from '../api/dealerApi'

const { Content } = Layout
const { Text, Title } = Typography

export default function Dealer() {
  const [dealers, setDealers] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'active' | 'inactive'

  const loadDealers = async () => {
    setLoading(true)
    try {
      const res = await fetchDealers()
      if (res.success) setDealers(res.data)
      else message.error(res.message || 'Failed to load dealers')
    } catch (err) {
      message.error('Could not reach the backend. Is XAMPP running?')
    }
    setLoading(false)
  }

  useEffect(() => { loadDealers() }, [])

  // Add/Edit Dealer happen in a separate tab -- refresh whenever this tab
  // regains focus, same pattern as the Users page.
  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === 'visible') loadDealers() }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', loadDealers)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', loadDealers)
    }
  }, [])

  const filteredDealers = dealers.filter((d) => {
    const term = searchTerm.toLowerCase()
    const matchesSearch =
      d.dealername?.toLowerCase().includes(term) ||
      d.dealerid?.toLowerCase().includes(term) ||
      d.dealercode?.toLowerCase().includes(term) ||
      d.dealergroup?.toLowerCase().includes(term)

    const isActive = (d.active_dealer || 'Y') === 'Y'
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && isActive) ||
      (statusFilter === 'inactive' && !isActive)

    return matchesSearch && matchesStatus
  })

  const dashIfEmpty = (val) => val || <Text type="secondary">-</Text>
  const yesNo = (val, fallback = 'N') => ((val || fallback) === 'Y' || (val || fallback) === 'y' ? 'Yes' : 'No')

  // -- Table columns ----------------------------------------------------
  const columns = [
    {
      title: 'Dealer',
      dataIndex: 'dealername',
      key: 'dealername',
      fixed: 'left',
      width: 240,
      align: 'left',
      render: (text, record) => (
        <Space style={{ paddingLeft: '8px' }}>
          <Avatar style={{ backgroundColor: '#b71c1c', color: '#fff' }} icon={<ShopOutlined />} />
          <div>
            <div style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{text}</div>
            <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>{record.dealerid}</Text>
          </div>
        </Space>
      ),
    },
    { title: 'Dealer Code', dataIndex: 'dealercode', key: 'dealercode', width: 130, align: 'center', render: dashIfEmpty },
    { title: 'Brand ID', dataIndex: 'brandid', key: 'brandid', width: 120, align: 'center', render: dashIfEmpty },
    { title: 'Dealer Group', dataIndex: 'dealergroup', key: 'dealergroup', width: 130, align: 'center', render: dashIfEmpty },
    { title: 'City', dataIndex: 'dealer_city', key: 'dealer_city', width: 160, align: 'center', ellipsis: true, render: dashIfEmpty },
    {
      title: 'Status', dataIndex: 'active_dealer', key: 'active_dealer', width: 110, align: 'center',
      render: (status) => (
        <Tag color={(status || 'Y') === 'Y' ? '#000000' : '#8c8c8c'} style={{ borderRadius: 0, margin: 0 }}>
          {(status || 'Y') === 'Y' ? 'ACTIVE' : 'INACTIVE'}
        </Tag>
      ),
    },
    {
      title: 'Actions', key: 'actions', fixed: 'right', width: 100, align: 'center',
      onHeaderCell: () => ({ className: 'actions-divider' }),
      onCell: () => ({ className: 'actions-divider' }),
      render: (_, record) => (
        <Tooltip title="Edit Dealer">
          <Button
            type="text"
            shape="circle"
            icon={<EditOutlined />}
            className="lgc-icon-btn"
            onClick={() => window.open(`/dealers/edit/${record.rec_id}`, '_blank', 'noopener')}
          />
        </Tooltip>
      ),
    },
  ]

  const cardStyle = {
    background: 'var(--bg-card)', border: '1px solid var(--border-strong)', padding: '24px 20px',
    borderRadius: '8px', boxShadow: 'inset 4px 0 0 0 var(--btn-dark-bg), 0 6px 16px rgba(0, 0, 0, 0.12)',
  }
  const cardTitleStyle = { color: 'var(--text-secondary)', fontWeight: 500, fontSize: '14px', textTransform: 'uppercase', letterSpacing: 0.5 }
  const cardValueStyle = { color: 'var(--text-primary)', fontWeight: 700, fontSize: '28px' }
  const activeCount = dealers.filter((d) => (d.active_dealer || 'Y') === 'Y').length

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout>
        <Navbar title="DEALERS MAINTENANCE" />
        <Content style={{ margin: 24 }}>

          {/* Stat cards */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={8}>
              <div style={cardStyle}>
                <Statistic title={<span style={cardTitleStyle}>Total Dealers</span>} value={dealers.length} valueStyle={cardValueStyle} />
              </div>
            </Col>
            <Col span={8}>
              <div style={cardStyle}>
                <Statistic title={<span style={cardTitleStyle}>Active</span>} value={activeCount} valueStyle={cardValueStyle} />
              </div>
            </Col>
            <Col span={8}>
              <div style={cardStyle}>
                <Statistic title={<span style={cardTitleStyle}>Inactive</span>} value={dealers.length - activeCount} valueStyle={cardValueStyle} />
              </div>
            </Col>
          </Row>

          {/* Search + Filter + Add */}
          <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
            <Space>
              <UserSearchBar onSearch={setSearchTerm} />
              <Segmented
                value={statusFilter}
                onChange={setStatusFilter}
                className="lgc-segmented"
                options={[
                  {
                    label: (
                      <span className="lgc-seg-option">
                        <AppstoreOutlined /> All <Tag className="lgc-seg-count">{dealers.length}</Tag>
                      </span>
                    ),
                    value: 'all',
                  },
                  {
                    label: (
                      <span className="lgc-seg-option">
                        <CheckCircleOutlined /> Active <Tag className="lgc-seg-count">{activeCount}</Tag>
                      </span>
                    ),
                    value: 'active',
                  },
                  {
                    label: (
                      <span className="lgc-seg-option">
                        <StopOutlined /> Inactive <Tag className="lgc-seg-count">{dealers.length - activeCount}</Tag>
                      </span>
                    ),
                    value: 'inactive',
                  },
                ]}
              />
            </Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => window.open('/dealers/new', '_blank', 'noopener')}
              style={{ background: 'var(--btn-dark-bg)', borderColor: 'var(--btn-dark-bg)' }}
            >
              Add Dealer
            </Button>
          </Row>

          {/* Table */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <Table
              rowKey="rec_id"
              columns={columns}
              dataSource={filteredDealers}
              loading={loading}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 900, y: 480 }}
              sticky
              bordered
              className="lgc-table"
              expandable={{
                columnTitle: '+/-',
                expandIcon: ({ expanded, onExpand, record }) => (
                  <Button
                    type="text"
                    shape="circle"
                    size="small"
                    onClick={(e) => onExpand(record, e)}
                    icon={expanded ? <MinusCircleFilled /> : <PlusCircleFilled />}
                    className={`lgc-expand-btn ${expanded ? 'lgc-expand-open' : ''}`}
                  />
                ),
                expandedRowRender: (record) => (
                  <Descriptions size="small" column={3} bordered style={{ margin: '4px 0' }}>
                    <Descriptions.Item label="Street">{dashIfEmpty(record.dealer_street)}</Descriptions.Item>
                    <Descriptions.Item label="BM Address">{dashIfEmpty(record.bm_address)}</Descriptions.Item>
                    <Descriptions.Item label="CRM Address">{dashIfEmpty(record.crm_address)}</Descriptions.Item>
                    <Descriptions.Item label="Facade">{dashIfEmpty(record.dealer_facade)}</Descriptions.Item>
                    <Descriptions.Item label="Website">{dashIfEmpty(record.websites)}</Descriptions.Item>
                    <Descriptions.Item label="Host Name">{dashIfEmpty(record.host_name)}</Descriptions.Item>
                    <Descriptions.Item label="Sales No">{dashIfEmpty(record.sales_no)}</Descriptions.Item>
                    <Descriptions.Item label="Trunk No">{dashIfEmpty(record.trunk_no)}</Descriptions.Item>
                    <Descriptions.Item label="Fax No">{dashIfEmpty(record.fax_no)}</Descriptions.Item>
                    <Descriptions.Item label="Service No">{dashIfEmpty(record.service_no)}</Descriptions.Item>
                    <Descriptions.Item label="CRM No">{dashIfEmpty(record.crm_no)}</Descriptions.Item>
                    <Descriptions.Item label="CS Appointment No">{dashIfEmpty(record.cs_appnt)}</Descriptions.Item>
                    <Descriptions.Item label="Assigned GA">{dashIfEmpty(record.assigned_ga)}</Descriptions.Item>
                    <Descriptions.Item label="Assigned SOA/MED">{dashIfEmpty(record.assigned_soamed)}</Descriptions.Item>
                    <Descriptions.Item label="CRM2 Group Lvl1">{dashIfEmpty(record.crm2_group_Lvl1)}</Descriptions.Item>
                    <Descriptions.Item label="CRM3 Group Lvl1">{dashIfEmpty(record.crm3_group_Lvl1)}</Descriptions.Item>
                    <Descriptions.Item label="LVSMS Dealer Name">{dashIfEmpty(record.lvsms_dealername)}</Descriptions.Item>
                    <Descriptions.Item label="VTiger Dealer Name">{dashIfEmpty(record.vtiger_dealername)}</Descriptions.Item>
                    <Descriptions.Item label="View Order">{dashIfEmpty(record.vieworder)}</Descriptions.Item>
                    <Descriptions.Item label="Daily SVR Appt">{yesNo(record.daily_svrappt)}</Descriptions.Item>
                    <Descriptions.Item label="Dealer Calendar">{yesNo(record.dlrCalendar)}</Descriptions.Item>
                    <Descriptions.Item label="CH Activated">{dashIfEmpty(record.ch_activated)}</Descriptions.Item>
                    <Descriptions.Item label="Response Time">{yesNo(record.responseTime)}</Descriptions.Item>
                    <Descriptions.Item label="Servis2 Code">{dashIfEmpty(record.servis2code)}</Descriptions.Item>
                    <Descriptions.Item label="CH Table Name">{dashIfEmpty(record.ch_tbl_name)}</Descriptions.Item>
                    <Descriptions.Item label="Eric6 API">{yesNo(record.eric6_api)}</Descriptions.Item>
                    <Descriptions.Item label="Fest Type">{dashIfEmpty(record.festtype)}</Descriptions.Item>
                    <Descriptions.Item label="FB Ad Dealer ID">{dashIfEmpty(record.FB_Ad_DealerID)}</Descriptions.Item>
                    <Descriptions.Item label="CC Assignment">{dashIfEmpty(record.cc_assignment)}</Descriptions.Item>
                    <Descriptions.Item label="Image File">{dashIfEmpty(record.img_file)}</Descriptions.Item>
                    <Descriptions.Item label="Date Closed">{dashIfEmpty(record.date_closed)}</Descriptions.Item>
                  </Descriptions>
                ),
              }}
            />
          </div>

        </Content>

        <style>{`
          .lgc-table .ant-table-thead > tr > th,
          .lgc-table .ant-table-tbody > tr > td {
            border-right: 1px solid var(--border-color) !important;
            border-bottom: 1px solid var(--border-color) !important;
          }
          .lgc-table .ant-table-container {
            border-left: 1px solid var(--border-color) !important;
            border-top: 1px solid var(--border-color) !important;
          }
          .lgc-table .ant-table-tbody > tr:last-child > td {
            border-bottom: 1px solid var(--border-color) !important;
          }

          .lgc-table .ant-table-thead > tr > th {
            white-space: nowrap;
          }

          .lgc-segmented {
            background: var(--bg-hover) !important;
            padding: 4px !important;
            border-radius: 999px !important;
          }
          .lgc-segmented .ant-segmented-item {
            border-radius: 999px !important;
            transition: all 0.2s ease;
          }
          .lgc-segmented .ant-segmented-item-selected {
            background: var(--btn-dark-bg) !important;
            color: var(--btn-dark-text) !important;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25) !important;
          }
          .lgc-segmented .ant-segmented-item-selected .lgc-seg-count {
            background: var(--btn-dark-text) !important;
            color: var(--btn-dark-bg) !important;
          }
          .lgc-seg-option {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 2px 4px;
            font-weight: 500;
          }
          .lgc-seg-count {
            border-radius: 999px !important;
            margin: 0 !important;
            border: none !important;
            background: var(--border-color);
            color: var(--text-secondary);
            font-size: 11px;
            line-height: 16px;
            padding: 0 7px;
          }

          .lgc-expand-btn {
            color: var(--text-primary) !important;
            font-size: 18px !important;
            transition: transform 0.25s ease, color 0.2s ease;
          }
          .lgc-expand-btn:hover {
            color: var(--text-secondary) !important;
            transform: scale(1.2);
          }
          .lgc-expand-btn.lgc-expand-open {
            color: #52c41a !important;
            transform: rotate(180deg);
          }
          .lgc-expand-btn.lgc-expand-open:hover {
            color: #389e0d !important;
            transform: rotate(180deg) scale(1.2);
          }

          .lgc-icon-btn {
            color: var(--text-secondary) !important;
            font-size: 16px !important;
            transition: color 0.2s ease, transform 0.2s ease, background-color 0.2s ease;
          }
          .lgc-icon-btn:hover {
            color: var(--text-primary) !important;
            background-color: var(--bg-hover) !important;
            transform: scale(1.1);
          }
          .lgc-icon-btn.lgc-icon-danger:hover {
            color: #fff !important;
            background-color: #ff4d4f !important;
          }

        `}</style>
      </Layout>
    </Layout>
  )
}