import React, { useState, useEffect } from 'react';
import {
  Typography, Table, Card, Statistic, Tag, Row, Col, 
  App, Flex, Avatar, Alert, Space, Divider, Breadcrumb, Skeleton
} from 'antd';
import {
  DollarOutlined,
  InfoCircleOutlined,
  HourglassOutlined,
  HistoryOutlined,
  CreditCardOutlined,
  CheckCircleFilled,
  ExclamationCircleFilled,
  ClockCircleOutlined,
  BookOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import api from '../api';
import dayjs from 'dayjs';
import { formatCurrency } from '../utils/format';

const { Title, Text, Paragraph } = Typography;

const MyFines = () => {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const { message } = App.useApp();

  useEffect(() => {
    fetchFines();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchFines = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.error('Session expired. Please log in again.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.get('/Fines/my');
      setFines(res.data.data || []);
    } catch (error) {
      console.error('Fetch fines error:', error);
      const status = error.response?.status;
      if (status === 401) {
        message.error('Session expired. Please log in again.');
      } else {
        const errorMsg = error.response?.data?.message || error.message;
        message.error(`Failed to load fines: ${status ? `Status ${status} - ` : ''}${errorMsg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const pendingFines = fines.filter(f => f.status === 'Unpaid');
  const totalPendingAmount = pendingFines.reduce((sum, f) => sum + f.amount, 0);
  const pendingCount = pendingFines.length;

  const columns = [
    {
      title: 'Book Title',
      key: 'book',
      render: (_, record) => (
        <Flex gap={12} align="center">
          <Avatar 
            shape="square" 
            size={40} 
            icon={<BookOutlined />} 
            style={{ backgroundColor: '#f1f5f9', color: '#64748b' }}
          />
          <div>
            <Text strong style={{ display: 'block', fontSize: 14 }}>{record.bookTitle}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Overdue Assessment
            </Text>
          </div>
        </Flex>
      ),
    },
    {
      title: 'Fine Date',
      dataIndex: 'createdAt',
      key: 'date',
      render: (date) => (
        <div>
          <Text style={{ display: 'block' }}>{dayjs(date).format('MMM DD, YYYY')}</Text>
          <Text type="secondary" style={{ fontSize: 10, textTransform: 'uppercase' }}>Assessment Date</Text>
        </div>
      ),
    },
    {
      title: 'Fine Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => (
        <Text strong style={{ color: '#f97316', fontSize: 16 }}>
          {formatCurrency(amount)}
        </Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag 
          color={status === 'Unpaid' ? 'orange' : 'green'} 
          style={{ 
            borderRadius: 12, 
            padding: '0 12px', 
            fontWeight: 600,
            fontSize: 11,
            textTransform: 'uppercase'
          }}
        >
          {status === 'Unpaid' ? '• UNPAID' : '• PAID'}
        </Tag>
      ),
    },
    {
      title: 'Instruction',
      key: 'instruction',
      render: (_, record) => (
        <Text type="secondary" style={{ fontSize: 13, fontStyle: 'italic' }}>
          {record.status === 'Unpaid' ? 'Pay at Library Desk' : 'Cleared by Librarian'}
        </Text>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 32px' }}>
      {/* Header */}
      <header style={{ marginBottom: 32 }}>
        <Title level={1} style={{ fontSize: 36, fontWeight: 900, marginBottom: 4, letterSpacing: '-0.03em' }}>
          My Fines
        </Title>
        <Text type="secondary" style={{ fontSize: 16 }}>
          Track your outstanding balances. Please visit the library front desk to clear pending fines.
        </Text>
      </header>

      {/* Summary Cards */}
      <Row gutter={24} style={{ marginBottom: 32 }}>
        <Col span={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', height: '100%' }}>
            <Skeleton loading={loading} active avatar={{ shape: 'circle' }} title={false} paragraph={{ rows: 2, width: ['60%', '40%'] }}>
              <Flex gap={16} align="flex-start">
                <Avatar icon={<DollarOutlined />} style={{ backgroundColor: '#f8fafc', color: '#64748b' }} />
                <div>
                  <Text type="secondary" style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Total Unpaid</Text>
                  <Title level={2} style={{ margin: '4px 0 0', fontWeight: 800, color: '#f97316' }}>
                    {formatCurrency(totalPendingAmount)}
                  </Title>
                </div>
              </Flex>
            </Skeleton>
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', height: '100%' }}>
            <Skeleton loading={loading} active avatar={{ shape: 'circle' }} title={false} paragraph={{ rows: 3, width: ['60%', '80%', '90%'] }}>
              <Flex gap={16} align="flex-start">
                <Avatar icon={<InfoCircleOutlined />} style={{ backgroundColor: '#f8fafc', color: '#64748b' }} />
                <div>
                  <Text type="secondary" style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Payment Method</Text>
                  <Title level={4} style={{ margin: '4px 0 2px', fontWeight: 700 }}> Library Desk Only </Title>
                  <Text type="secondary" style={{ fontSize: 12 }}>Fines must be cleared manually by a Librarian.</Text>
                </div>
              </Flex>
            </Skeleton>
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} style={{ 
            borderRadius: 12, 
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)', 
            height: '100%',
            borderLeft: '4px solid #f97316' 
          }}>
            <Skeleton loading={loading} active avatar={{ shape: 'circle' }} title={false} paragraph={{ rows: 3, width: ['60%', '40%', '70%'] }}>
              <Flex gap={16} align="flex-start">
                <Avatar icon={<HourglassOutlined />} style={{ backgroundColor: '#f8fafc', color: '#64748b' }} />
                <div>
                  <Text type="secondary" style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Unpaid Records</Text>
                  <Title level={2} style={{ margin: '4px 0 0', fontWeight: 800 }}> {pendingCount} Items </Title>
                  <Text style={{ fontSize: 11, fontWeight: 700, color: '#f97316', textTransform: 'uppercase' }}>Awaiting Desk Payment</Text>
                </div>
              </Flex>
            </Skeleton>
          </Card>
        </Col>
      </Row>

      {/* Alert */}
      <Alert
        message={<Text strong style={{ color: '#92400e' }}>Important Information</Text>}
        description={<Text style={{ color: '#b45309' }}>Fines stay in 'Unpaid' status until you pay at the library desk. Once paid, a Librarian will manually clear the record from your account.</Text>}
        type="warning"
        showIcon
        icon={<InfoCircleOutlined style={{ color: '#f97316' }} />}
        style={{ 
          marginBottom: 32, 
          borderRadius: 10, 
          backgroundColor: '#fffbeb', 
          border: '1px solid #fef3c7' 
        }}
      />

      {/* Table Card */}
      <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.04)', overflow: 'hidden' }} styles={{ body: { padding: 0 } }}>
        <Table
          dataSource={fines}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={false}
          style={{ width: '100%' }}
        />
      </Card>
    </div>
  );
};

export default MyFines;
