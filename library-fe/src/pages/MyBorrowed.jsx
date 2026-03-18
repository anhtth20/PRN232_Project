import React, { useState, useEffect } from 'react';
import {
  Typography, Table, Tabs, Card, Statistic, Tag, Button, 
  Space, Row, Col, Input, Pagination, App, Flex, Avatar, Badge, Skeleton
} from 'antd';
import {
  BookOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  QuestionCircleOutlined,
  SearchOutlined
} from '@ant-design/icons';
import api from '../api';
import dayjs from 'dayjs';
import AppImage from '../components/AppImage';

import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;

const MyBorrowed = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Current');
  const { message } = App.useApp();

  useEffect(() => {
    fetchBorrows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBorrows = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.error('You must be logged in to view your borrowed books');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await api.get('/Borrow/my');
      setData(res.data.data || []);
    } catch (error) {
      console.error('Fetch error:', error);
      const status = error.response?.status;
      
      if (status === 401) {
        message.error('Session expired. Please log in again.');
      } else {
        const errorMsg = error.response?.data?.message || error.message;
        message.error(`Failed to fetch: ${status ? `Status ${status} - ` : ''}${errorMsg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter(item => {
    if (activeTab === 'Current') return item.status === 'Approved' || item.status === 'Pending';
    if (activeTab === 'Past Borrows') return item.status === 'Returned' || item.status === 'Rejected';
    return true;
  });

  const currentlyReadingCount = data.filter(item => item.status === 'Approved').length;
  const dueThisWeekCount = data.filter(item => {
    if (item.status !== 'Approved') return false;
    const dueDate = dayjs(item.dueDate);
    return dueDate.isBefore(dayjs().add(7, 'day')) && dueDate.isAfter(dayjs());
  }).length;

  const getDaysLeft = (dueDate) => {
    const today = dayjs();
    const due = dayjs(dueDate);
    const diff = due.diff(today, 'day');
    
    if (diff < 0) return { text: 'Expired', color: '#ef4444', isOverdue: true };
    if (diff <= 3) return { text: `${diff} days`, color: '#f59e0b', isOverdue: false };
    return { text: `${diff} days`, color: '#1e293b', isOverdue: false };
  };

  const getStatusTag = (item) => {
    const today = dayjs();
    const due = dayjs(item.dueDate);
    
    if (item.status === 'Returned') return <Tag color="default">Returned</Tag>;
    if (item.status === 'Rejected') return <Tag color="error">Rejected</Tag>;
    if (item.status === 'Pending') return <Tag color="warning">Pending Approval</Tag>;
    
    if (today.isAfter(due)) return <Tag color="error">Overdue</Tag>;
    if (due.diff(today, 'day') <= 3) return <Tag color="warning">Due Soon</Tag>;
    return <Tag color="success">On Time</Tag>;
  };

  const handleRenew = async (id) => {
    try {
      await api.put(`/Borrow/${id}/renew`);
      message.success('Book renewed successfully');
      fetchBorrows();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to renew book');
    }
  };

  const columns = [
    {
      title: 'COVER',
      dataIndex: 'imageUrl',
      key: 'cover',
      render: (url) => (
        <div style={{ width: 60, height: 80, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
          <AppImage 
            src={url} 
            alt="cover" 
            fallbackText=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        </div>
      ),
    },
    {
      title: 'BOOK DETAILS',
      key: 'details',
      render: (_, record) => (
        <div>
          <Text strong style={{ display: 'block', fontSize: 15 }}>{record.bookTitle}</Text>
          <Text type="secondary" style={{ fontSize: 13 }}>{record.authorName}</Text>
        </div>
      ),
    },
    {
      title: 'BORROW DATE',
      dataIndex: 'requestDate',
      key: 'borrowDate',
      render: (date) => dayjs(date).format('MMM D, YYYY'),
    },
    {
      title: 'DUE DATE',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date) => dayjs(date).format('MMM D, YYYY'),
    },
    {
      title: 'DAYS LEFT',
      key: 'daysLeft',
      render: (_, record) => {
        if (record.status !== 'Approved') return '-';
        const { text, color } = getDaysLeft(record.dueDate);
        return <Text strong style={{ color }}>{text}</Text>;
      },
    },
    {
      title: 'STATUS',
      key: 'status',
      render: (_, record) => getStatusTag(record),
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      render: (_, record) => {
        if (record.status === 'Approved') {
          const isOverdue = dayjs().isAfter(dayjs(record.dueDate));
          const canRenew = record.renewCount < 2;
          return isOverdue ? (
            <Button type="primary" danger size="small">Pay Fine</Button>
          ) : (
            <Button 
              type="link" 
              size="small" 
              style={{ padding: 0 }}
              onClick={() => handleRenew(record.id)}
              disabled={!canRenew}
            >
              Renew {record.renewCount > 0 && `(${record.renewCount})`}
            </Button>
          );
        }
        return null;
      },
    },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
      <header style={{ marginBottom: 40 }}>
        <Title level={2} style={{ marginBottom: 8, fontWeight: 700 }}>My Borrowed Books</Title>
        <Text type="secondary" style={{ fontSize: 16 }}>
          Track your reading progress, check due dates, and renew your currently held items.
        </Text>
      </header>

      <Row gutter={24} style={{ marginBottom: 40 }}>
        <Col span={6}>
          <Card bordered={false} styles={{ body: { padding: 24 } }} style={{ borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <Skeleton loading={loading} active avatar={{ shape: 'square', size: 48 }} title={false} paragraph={{ rows: 2, width: ['100%', '50%'] }}>
              <Flex align="center" gap={16}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BookOutlined style={{ fontSize: 24, color: '#3b82f6' }} />
                </div>
                <Statistic 
                  title={<Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Currently Reading</Text>} 
                  value={currentlyReadingCount} 
                  suffix="Books"
                  valueStyle={{ fontSize: 24, fontWeight: 700 }}
                />
              </Flex>
            </Skeleton>
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} styles={{ body: { padding: 24 } }} style={{ borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <Skeleton loading={loading} active avatar={{ shape: 'square', size: 48 }} title={false} paragraph={{ rows: 2, width: ['100%', '50%'] }}>
              <Flex align="center" gap={16}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CalendarOutlined style={{ fontSize: 24, color: '#f97316' }} />
                </div>
                <Statistic 
                  title={<Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Due This Week</Text>} 
                  value={dueThisWeekCount} 
                  suffix={dueThisWeekCount === 1 ? "Book" : "Books"}
                  valueStyle={{ fontSize: 24, fontWeight: 700 }}
                />
              </Flex>
            </Skeleton>
          </Card>
        </Col>
      </Row>

      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={[
          { key: 'Current', label: 'Current' },
          { key: 'Past Borrows', label: 'Past Borrows' },
        ]}
        style={{ marginBottom: 24 }}
      />

      <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Table 
          columns={columns} 
          dataSource={filteredData} 
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 5,
            showSizeChanger: false,
            itemRender: (page, type, originalElement) => {
              if (type === 'prev') return <Button type="text" size="small">&lt;</Button>;
              if (type === 'next') return <Button type="text" size="small">&gt;</Button>;
              return originalElement;
            }
          }}
        />
      </Card>

      <Row gutter={24} style={{ marginTop: 60 }}>
        <Col span={8}>
          <Card bordered={false} style={{ height: '100%', borderRadius: 16, background: '#eff6ff' }}>
            <Flex vertical gap={12}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <InfoCircleOutlined style={{ color: '#white', fontSize: 16 }} />
              </div>
              <Title level={4} style={{ margin: 0 }}>Renewal Policy</Title>
              <Paragraph type="secondary" style={{ margin: 0 }}>
                Books can be renewed up to 2 times if no one else has reserved them. Renewals extend the date by 14 days.
              </Paragraph>
            </Flex>
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} style={{ height: '100%', borderRadius: 16, background: '#fff7ed' }}>
            <Flex vertical gap={12}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <WarningOutlined style={{ color: '#white', fontSize: 16 }} />
              </div>
              <Title level={4} style={{ margin: 0 }}>Overdue Fines</Title>
              <Paragraph type="secondary" style={{ margin: 0 }}>
                Fines accrue at $0.50 per day for general collection items. Please return books on time to avoid penalties.
              </Paragraph>
            </Flex>
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} style={{ height: '100%', borderRadius: 16, background: '#f8fafc' }}>
            <Flex vertical gap={12}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <QuestionCircleOutlined style={{ color: '#white', fontSize: 16 }} />
              </div>
              <Title level={4} style={{ margin: 0 }}>Need Help?</Title>
              <Paragraph type="secondary" style={{ margin: 0 }}>
                If you lost a book or have issues with your account, please message the librarian through the support desk.
              </Paragraph>
            </Flex>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default MyBorrowed;
