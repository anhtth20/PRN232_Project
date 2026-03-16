import React, { useState, useEffect } from 'react';
import { 
  Typography, Button, Input, Select, Table, Space, InputNumber,
  Card, Row, Col, Flex, Dropdown, Tag, Pagination, App, Modal
} from 'antd';
import { 
  SearchOutlined, FilterOutlined, 
  TeamOutlined, LineChartOutlined, ReloadOutlined,
  MoreOutlined, CheckCircleOutlined, CloseCircleOutlined, EnterOutlined,
  DollarOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../api';


const { Title, Text, Paragraph } = Typography;

const LibrarianBorrowers = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [fineModalVisible, setFineModalVisible] = useState(false);
  const [selectedBorrowId, setSelectedBorrowId] = useState(null);
  const [fineAmount, setFineAmount] = useState(5000);
  const [fineReason, setFineReason] = useState('');
  const { message } = App.useApp();

  const PAGE_SIZE = 5;

  const fetchBorrows = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/Borrow');
      let borrows = res.data.data || [];
      
      if (statusFilter !== 'all') {
        borrows = borrows.filter(b => b.status.toLowerCase() === statusFilter.toLowerCase());
      }
      
      if (search) {
        borrows = borrows.filter(b => 
          b.bookTitle?.toLowerCase().includes(search.toLowerCase()) || 
          b.authorName?.toLowerCase().includes(search.toLowerCase()) ||
          b.userId.toString().includes(search) ||
          b.id.toString().includes(search)
        );
      }
      
      setData(borrows);
    } catch {
      message.error('Failed to load borrow requests');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, message]);

  useEffect(() => {
    fetchBorrows();
  }, [fetchBorrows]);

  const handleAction = async (id, actionStr) => {
    try {
      await api.put(`/Borrow/${id}/${actionStr}`);
      message.success(`Request ${actionStr}ed successfully`);
      fetchBorrows();
    } catch (error) {
      message.error(error.response?.data?.message || `Failed to ${actionStr} request`);
    }
  };

  const handleCreateFine = async () => {
    if (!fineReason) {
      message.warning('Please provide a reason for the fine');
      return;
    }
    try {
      await api.post('/Fines', {
        borrowRequestId: selectedBorrowId,
        amount: fineAmount,
        reason: fineReason
      });
      message.success('Fine created successfully');
      setFineModalVisible(false);
      setFineReason('');
      setFineAmount(5000);
    } catch (error) {
      console.error('Error creating fine:', error);
      message.error('Failed to create fine');
    }
  };

  const getStatusTag = (status) => {
    switch (status) {
      case 'Approved':
        return <Tag color="green" style={{ borderRadius: 12, fontWeight: 600 }}>Approved</Tag>;
      case 'Pending':
        return <Tag color="orange" style={{ borderRadius: 12, fontWeight: 600 }}>Pending</Tag>;
      case 'Rejected':
        return <Tag color="red" style={{ borderRadius: 12, fontWeight: 600 }}>Rejected</Tag>;
      case 'Returned':
        return <Tag color="default" style={{ borderRadius: 12, fontWeight: 600 }}>Returned</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns = [
    {
      title: 'REQ ID',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <Text strong style={{ color: '#64748b' }}>#{text}</Text>,
    },
    {
      title: 'USER ID',
      dataIndex: 'userId',
      key: 'userId',
      render: (text) => <Text strong style={{ color: '#1e293b' }}>User #{text}</Text>,
    },
    {
      title: 'BOOK',
      key: 'book',
      render: (_, record) => (
        <div>
          <Text strong style={{ display: 'block' }}>{record.bookTitle}</Text>
          <Text type="secondary" style={{ fontSize: 13 }}>{record.authorName}</Text>
        </div>
      ),
    },
    {
      title: 'DATES',
      key: 'dates',
      render: (_, record) => (
        <div>
          <Text style={{ display: 'block', fontSize: 13 }}>Req: {dayjs(record.requestDate).format('MMM D, YYYY')}</Text>
          <Text type="secondary" style={{ fontSize: 13 }}>Due: {dayjs(record.dueDate).format('MMM D, YYYY')}</Text>
        </div>
      ),
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      align: 'right',
      render: (_, record) => {
        if (record.status === 'Pending') {
          return (
            <Space size="small">
              <Button 
                type="text" 
                size="small"
                icon={<CheckCircleOutlined style={{ color: '#10b981' }} />} 
                onClick={() => handleAction(record.id, 'approve')}
                style={{ fontWeight: 600, color: '#10b981' }}
              >
                Approve
              </Button>
              <Button 
                type="text" 
                size="small"
                icon={<CloseCircleOutlined style={{ color: '#ef4444' }} />} 
                onClick={() => handleAction(record.id, 'reject')}
                style={{ fontWeight: 600, color: '#ef4444' }}
              >
                Reject
              </Button>
            </Space>
          );
        }
        
        if (record.status === 'Approved') {
          return (
            <Space size="small">
              <Button 
                type="text" 
                size="small"
                icon={<EnterOutlined style={{ color: '#3b82f6' }} />} 
                onClick={() => handleAction(record.id, 'return')}
                style={{ fontWeight: 600, color: '#3b82f6' }}
              >
                Return Book
              </Button>
              <Button 
                type="text" 
                size="small"
                icon={<DollarOutlined style={{ color: '#f59e0b' }} />} 
                onClick={() => {
                  setSelectedBorrowId(record.id);
                  setFineModalVisible(true);
                }}
                style={{ fontWeight: 600, color: '#f59e0b' }}
              >
                Fine
              </Button>
            </Space>
          );
        }

        if (record.status === 'Returned' || record.status === 'Rejected') {
           return (
            <Button 
              type="text" 
              size="small"
              icon={<DollarOutlined style={{ color: '#f59e0b' }} />} 
              onClick={() => {
                setSelectedBorrowId(record.id);
                setFineModalVisible(true);
              }}
              style={{ fontWeight: 600, color: '#f59e0b' }}
            >
              Fine
            </Button>
          );
        }

        return <Text type="secondary">-</Text>;
      },
    },
  ];

  const paginatedData = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Flex justify="space-between" align="flex-start" style={{ marginBottom: 32 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Manage Borrow Requests
          </Title>
          <Paragraph type="secondary" style={{ fontSize: 16, marginTop: 8, color: '#64748b', maxWidth: 600 }}>
            View, approve, reject, and return active borrow requests from library members.
          </Paragraph>
        </div>
      </Flex>

      <Card 
        bordered={false} 
        style={{ 
          borderRadius: 16, 
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          background: '#ffffff',
          marginBottom: 32
        }}
        bodyStyle={{ padding: 0 }}
      >
        <Flex gap={16} align="center" style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
          <Input.Search 
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />} 
            placeholder="Search by User ID or Book Title..." 
            variant="filled"
            onSearch={v => { setSearch(v); setPage(1); }}
            style={{ borderRadius: 8, flex: 1, padding: '8px 0px', background: '#f8fafc', border: 'none' }}
          />
          <Select 
            defaultValue="all" 
            style={{ width: 160 }} 
            variant="filled"
            onChange={v => { setStatusFilter(v); setPage(1); }}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'approved', label: 'Approved' },
              { value: 'pending', label: 'Pending' },
              { value: 'rejected', label: 'Rejected' },
              { value: 'returned', label: 'Returned' },
            ]}
          />
          <Button 
            icon={<FilterOutlined />} 
            variant="filled"
            style={{ background: '#f8fafc', border: 'none', color: '#64748b' }} 
            onClick={() => fetchBorrows()}
          />
        </Flex>

        <Table 
          columns={columns} 
          dataSource={paginatedData} 
          rowKey="id"
          pagination={false}
          loading={loading}
          style={{ width: '100%' }}
          components={{
            header: {
              cell: (props) => <th {...props} style={{ ...props.style, background: '#ffffff', color: '#94a3b8', fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', padding: '16px 24px' }} />
            },
            body: {
              cell: (props) => <td {...props} style={{ ...props.style, padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }} />
            }
          }}
        />

        <Flex justify="space-between" align="center" style={{ padding: '20px 24px', borderTop: '1px solid #f1f5f9' }}>
          <Text style={{ color: '#64748b', fontSize: 13 }}>
            Showing {data.length > 0 ? (page - 1) * PAGE_SIZE + 1 : 0} to {Math.min(page * PAGE_SIZE, data.length)} of {data.length} requests
          </Text>
          <Pagination 
            current={page} 
            total={data.length} 
            pageSize={PAGE_SIZE} 
            onChange={p => setPage(p)}
            showSizeChanger={false} 
          />
        </Flex>
      </Card>

      <Row gutter={24}>
        <Col span={8}>
          <Card bordered={false} style={{ background: '#eff6ff', borderRadius: 12 }} bodyStyle={{ padding: '24px' }}>
            <Flex justify="space-between" align="flex-start">
              <Space direction="vertical" size={4}>
                <Text style={{ color: '#1d4ed8', fontWeight: 700, fontSize: 12, letterSpacing: '0.05em' }}>TOTAL REQUESTS</Text>
                <Title level={2} style={{ margin: 0, color: '#0f172a', fontWeight: 800 }}>{data.length}</Title>
              </Space>
              <TeamOutlined style={{ fontSize: 32, color: '#93c5fd' }} />
            </Flex>
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} style={{ background: '#fef2f2', borderRadius: 12 }} bodyStyle={{ padding: '24px' }}>
            <Flex justify="space-between" align="flex-start">
              <Space direction="vertical" size={4}>
                <Text style={{ color: '#b91c1c', fontWeight: 700, fontSize: 12, letterSpacing: '0.05em' }}>PENDING REVIEWS</Text>
                <Title level={4} style={{ margin: 0, color: '#0f172a', fontWeight: 600, marginTop: 4 }}>
                  {data.filter(d => d.status === 'Pending').length}
                </Title>
              </Space>
              <LineChartOutlined style={{ fontSize: 28, color: '#fca5a5' }} />
            </Flex>
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} style={{ background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }} bodyStyle={{ padding: '24px' }}>
            <Flex justify="space-between" align="flex-start">
              <Space direction="vertical" size={4}>
                <Text style={{ color: '#475569', fontWeight: 700, fontSize: 12, letterSpacing: '0.05em' }}>LAST SYNC</Text>
                <Title level={4} style={{ margin: 0, color: '#0f172a', fontWeight: 600, marginTop: 4 }}>{dayjs().format('h:mm A')}</Title>
              </Space>
              <ReloadOutlined style={{ fontSize: 28, color: '#cbd5e1' }} />
            </Flex>
          </Card>
        </Col>
      </Row>

      <Modal
        title={<Title level={4} style={{ margin: 0 }}>Issue Manual Fine</Title>}
        open={fineModalVisible}
        onOk={handleCreateFine}
        onCancel={() => setFineModalVisible(false)}
        okText="Create Fine"
        cancelText="Cancel"
        style={{ top: 100 }}
        bodyStyle={{ padding: '24px 0' }}
      >
        <Flex vertical gap={20}>
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8, color: '#475569' }}>FINE AMOUNT (VND)</Text>
            <InputNumber 
              suffix="đ"
              value={fineAmount} 
              onChange={val => setFineAmount(val)} 
              style={{ width: '100%' }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
              parser={value => value.replace(/đ\s?|(\.*)/g, '')}
            />
          </div>
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8, color: '#475569' }}>REASON FOR FINE</Text>
            <Input.TextArea 
              rows={4} 
              placeholder="e.g., Book returned with water damage, torn pages, etc."
              value={fineReason}
              onChange={e => setFineReason(e.target.value)}
              style={{ borderRadius: 8 }}
            />
          </div>
        </Flex>
      </Modal>
    </div>
  );
};

export default LibrarianBorrowers;
