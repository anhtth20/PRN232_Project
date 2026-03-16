import React, { useState, useEffect } from 'react';
import { Typography, Row, Col, Card, Statistic, Flex, App, Button, Table, Tag } from 'antd';
import { 
  BookFilled, 
  CalendarOutlined, 
  DownloadOutlined,
  ReadFilled,
  WarningFilled,
  MoneyCollectFilled,
  PlusSquareFilled,
  UserAddOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { formatCurrency } from '../../utils/format';

const { Title, Text } = Typography;

const LibrarianDashboard = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    totalBooks: 0,
    activeBorrows: 0,
    overdueBooks: 0,
    pendingFines: 0,
    trends: [],
    recentActivity: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/Dashboard/stats');
        setData(res.data);
      } catch (error) {
        console.error('Error loading dashboard statistics:', error);
        message.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [message]);

  const columns = [
    {
      title: <Text type="secondary" style={{ fontSize: 12, fontWeight: 600 }}>ACTION</Text>,
      dataIndex: 'action',
      key: 'action',
      render: (text) => (
        <Flex align="center" gap={8}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: text.includes('Return') || text.includes('Approve') ? '#10b981' : '#3b82f6' }} />
          <Text strong style={{ color: text.includes('Return') || text.includes('Approve') ? '#10b981' : '#3b82f6' }}>{text}</Text>
        </Flex>
      )
    },
    {
      title: <Text type="secondary" style={{ fontSize: 12, fontWeight: 600 }}>BOOK TITLE / DETAILS</Text>,
      dataIndex: 'details',
      key: 'details',
      render: (text) => <Text strong style={{ color: '#0f172a' }}>{text || '-'}</Text>
    },
    {
      title: <Text type="secondary" style={{ fontSize: 12, fontWeight: 600 }}>MEMBER</Text>,
      dataIndex: 'memberName',
      key: 'memberName',
      render: (text) => <Text style={{ color: '#475569' }}>{text || 'System'}</Text>
    },
    {
      title: <Text type="secondary" style={{ fontSize: 12, fontWeight: 600 }}>DATE & TIME</Text>,
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (val) => <Text style={{ color: '#64748b' }}>{new Date(val).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}</Text>
    },
    {
      title: <Text type="secondary" style={{ fontSize: 12, fontWeight: 600 }}>STATUS</Text>,
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Completed' ? 'success' : 'processing'} style={{ borderRadius: 12, padding: '2px 8px', fontWeight: 600 }}>
          {status}
        </Tag>
      )
    }
  ];

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      
      {/* Header Section */}
      <Flex justify="space-between" align="flex-start" style={{ marginBottom: 32 }}>
        <Flex vertical>
          <Title level={2} style={{ margin: 0, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Librarian Dashboard
          </Title>
          <Text type="secondary" style={{ fontSize: 15, color: '#64748b' }}>
            Status report for Central Library Branch - {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'})}
          </Text>
        </Flex>
      </Flex>

      {/* Stat Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} loading={loading} style={{ borderRadius: 16, boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' }}>
            <Flex vertical>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <BookFilled style={{ fontSize: 20, color: '#3b82f6' }} />
              </div>
              <Text type="secondary" style={{ fontWeight: 600, fontSize: 13, color: '#64748b', marginBottom: 4 }}>Total Books</Text>
              <Text style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{data.totalBooks?.toLocaleString()}</Text>
            </Flex>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} loading={loading} style={{ borderRadius: 16, boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' }}>
            <Flex vertical>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <ReadFilled style={{ fontSize: 20, color: '#22c55e' }} />
              </div>
              <Text type="secondary" style={{ fontWeight: 600, fontSize: 13, color: '#64748b', marginBottom: 4 }}>Active Borrows</Text>
              <Text style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{data.activeBorrows?.toLocaleString()}</Text>
            </Flex>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} loading={loading} style={{ borderRadius: 16, boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' }}>
            <Flex vertical>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <WarningFilled style={{ fontSize: 20, color: '#ef4444' }} />
              </div>
              <Text type="secondary" style={{ fontWeight: 600, fontSize: 13, color: '#64748b', marginBottom: 4 }}>Overdue Books</Text>
              <Text style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{data.overdueBooks?.toLocaleString()}</Text>
            </Flex>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} loading={loading} style={{ borderRadius: 16, boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' }}>
            <Flex vertical>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <MoneyCollectFilled style={{ fontSize: 20, color: '#f59e0b' }} />
              </div>
              <Text type="secondary" style={{ fontWeight: 600, fontSize: 13, color: '#64748b', marginBottom: 4 }}>Pending Fines</Text>
              <Text style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{formatCurrency(data.pendingFines)}</Text>
            </Flex>
          </Card>
        </Col>
      </Row>

      {/* Charts and Actions Row */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)', height: '100%' }}>
            <Flex justify="space-between" align="flex-start" style={{ marginBottom: 32 }}>
              <Flex vertical>
                <Title level={4} style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>Borrowing Trends</Title>
                <Text type="secondary" style={{ fontSize: 13, color: '#64748b' }}>Past 7 days volume</Text>
              </Flex>
            </Flex>
            <div style={{ height: 280, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.trends} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barSize={32}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} dy={10} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Legend verticalAlign="top" align="right" wrapperStyle={{ top: -50 }} iconType="circle" />
                  <Bar dataKey="borrows" name="Borrows" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="returns" name="Returns" stackId="a" fill="#bfdbfe" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)', height: '100%' }}>
            <Title level={4} style={{ margin: 0, fontWeight: 700, color: '#0f172a', marginBottom: 24 }}>Quick Actions</Title>
            <Flex vertical gap={12}>
              <Card 
                hoverable 
                style={{ borderRadius: 12, borderColor: '#e2e8f0' }} 
                bodyStyle={{ padding: '16px 20px' }}
                onClick={() => navigate('/librarian/borrowers')}
              >
                <Flex align="center" gap={16}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PlusSquareFilled style={{ fontSize: 18, color: '#22c55e' }} />
                  </div>
                  <Flex vertical>
                    <Text strong style={{ fontSize: 14, color: '#0f172a' }}>Issue Book</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>Create a new borrow record</Text>
                  </Flex>
                </Flex>
              </Card>

              <Card 
                hoverable 
                style={{ borderRadius: 12, borderColor: '#e2e8f0' }} 
                bodyStyle={{ padding: '16px 20px' }}
                onClick={() => navigate('/librarian/borrowers')}
              >
                <Flex align="center" gap={16}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UserAddOutlined style={{ fontSize: 18, color: '#64748b' }} />
                  </div>
                  <Flex vertical>
                    <Text strong style={{ fontSize: 14, color: '#0f172a' }}>Register Member</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>Add new library member</Text>
                  </Flex>
                </Flex>
              </Card>

              <Card 
                hoverable 
                style={{ borderRadius: 12, borderColor: '#e2e8f0' }} 
                bodyStyle={{ padding: '16px 20px' }}
                onClick={() => navigate('/librarian/fines')}
              >
                <Flex align="center" gap={16}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileTextOutlined style={{ fontSize: 18, color: '#f59e0b' }} />
                  </div>
                  <Flex vertical>
                    <Text strong style={{ fontSize: 14, color: '#0f172a' }}>Collect Fine</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>Process pending payments</Text>
                  </Flex>
                </Flex>
              </Card>
            </Flex>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity Section */}
      <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' }}>
        <Flex justify="space-between" align="center" style={{ marginBottom: 20 }}>
          <Title level={4} style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>Recent Activity</Title>
          <Button type="link" style={{ fontWeight: 600, color: '#1b80f8', padding: 0 }}>View All</Button>
        </Flex>
        
        <Table 
          columns={columns} 
          dataSource={data.recentActivity} 
          rowKey="id"
          pagination={false}
          loading={loading}
          className="recent-activity-table"
        />
        <style dangerouslySetInnerHTML={{__html: `
          .recent-activity-table .ant-table-thead > tr > th {
            background-color: transparent;
            border-bottom: 1px solid #e2e8f0;
            padding: 16px;
          }
          .recent-activity-table .ant-table-tbody > tr > td {
            border-bottom: 1px solid #f1f5f9;
            padding: 16px;
          }
          .recent-activity-table .ant-table-tbody > tr:last-child > td {
            border-bottom: none;
          }
        `}} />
      </Card>
    </div>
  );
};

export default LibrarianDashboard;
