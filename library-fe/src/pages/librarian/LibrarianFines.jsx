import React, { useState, useEffect } from 'react';
import { 
  Typography, Input, Select, Table, Space, 
  Card, Row, Col, Flex, Tag, Pagination, App, Button
} from 'antd';
import { 
  SearchOutlined, FilterOutlined, 
  DollarOutlined, LineChartOutlined, ReloadOutlined
} from '@ant-design/icons';
import api from '../../api';
import { formatCurrency } from '../../utils/format';

const { Title, Text, Paragraph } = Typography;

const LibrarianFines = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { message } = App.useApp();

  const PAGE_SIZE = 5;

  const fetchFines = async () => {
    setLoading(true);
    try {
      const res = await api.get('/Fines');
      let fines = res.data.data || [];
      
      if (statusFilter !== 'all') {
        fines = fines.filter(f => f.status?.toLowerCase() === statusFilter.toLowerCase());
      }
      
      if (search) {
        fines = fines.filter(f => 
          f.bookTitle?.toLowerCase().includes(search.toLowerCase()) || 
          f.borrowRequestId?.toString().includes(search) ||
          f.id?.toString().includes(search)
        );
      }
      
      setData(fines);
    } catch (error) {
      console.error('Error fetching fines:', error);
      message.error('Failed to load fines');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/Fines/${id}/status`, newStatus, {
        headers: { 'Content-Type': 'application/json' }
      });
      message.success(`Status updated to ${newStatus}`);
      fetchFines();
    } catch (error) {
      console.error('Error updating status:', error);
      message.error('Failed to update status');
    }
  };

  useEffect(() => {
    fetchFines();
  }, [search, statusFilter]);

  const getStatusTag = (status) => {
    switch (status) {
      case 'Paid':
        return <Tag color="green" style={{ borderRadius: 12, fontWeight: 600 }}>Paid</Tag>;
      case 'Unpaid':
        return <Tag color="red" style={{ borderRadius: 12, fontWeight: 600 }}>Unpaid</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns = [
    {
      title: 'FINE ID',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <Text strong style={{ color: '#64748b' }}>#{text}</Text>,
    },
    {
      title: 'BORROW REQ ID',
      dataIndex: 'borrowRequestId',
      key: 'borrowRequestId',
      render: (text) => <Text strong style={{ color: '#1e293b' }}>Req #{text}</Text>,
    },
    {
      title: 'BOOK',
      key: 'book',
      render: (_, record) => (
        <div>
          <Text strong style={{ display: 'block', color: '#334155' }}>{record.bookTitle}</Text>
          <Text type="secondary" style={{ fontSize: 13 }}>{record.authorName}</Text>
        </div>
      ),
    },
    {
      title: 'AMOUNT',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => (
        <Text strong style={{ color: '#0f172a' }}>{formatCurrency(amount)}</Text>
      ),
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: 'REASON',
      dataIndex: 'reason',
      key: 'reason',
      render: (text) => <Text style={{ color: '#64748b', fontSize: 13 }}>{text || '-'}</Text>,
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Button 
          type="primary" 
          size="small"
          onClick={() => handleStatusChange(record.id, record.status === 'Paid' ? 'Unpaid' : 'Paid')}
          style={{ 
            borderRadius: 6, 
            fontSize: 12, 
            fontWeight: 600,
            background: record.status === 'Paid' ? '#f1f5f9' : '#1b80f8',
            color: record.status === 'Paid' ? '#475569' : '#ffffff',
            border: 'none'
          }}
        >
          {record.status === 'Paid' ? 'Mark as Unpaid' : 'Mark as Paid'}
        </Button>
      ),
    }
  ];

  const paginatedData = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalUnpaid = data.filter(d => d.status === 'Unpaid').reduce((sum, item) => sum + (item.amount || 0), 0);
  const totalPaid = data.filter(d => d.status === 'Paid').reduce((sum, item) => sum + (item.amount || 0), 0);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Flex justify="space-between" align="flex-start" style={{ marginBottom: 32 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Manage Fines
          </Title>
          <Paragraph type="secondary" style={{ fontSize: 16, marginTop: 8, color: '#64748b', maxWidth: 600 }}>
            View and search library fines, track unpaid balances, and monitor payments.
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
            placeholder="Search by Book Title or Request ID..." 
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
              { value: 'unpaid', label: 'Unpaid' },
              { value: 'paid', label: 'Paid' },
            ]}
          />
          <Button 
            icon={<FilterOutlined />} 
            variant="filled"
            style={{ background: '#f8fafc', border: 'none', color: '#64748b' }} 
            onClick={() => fetchFines()}
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
            Showing {data.length > 0 ? (page - 1) * PAGE_SIZE + 1 : 0} to {Math.min(page * PAGE_SIZE, data.length)} of {data.length} fines
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
          <Card bordered={false} style={{ background: '#fef2f2', borderRadius: 12 }} bodyStyle={{ padding: '24px' }}>
            <Flex justify="space-between" align="flex-start">
              <Space direction="vertical" size={4}>
                <Text style={{ color: '#b91c1c', fontWeight: 700, fontSize: 12, letterSpacing: '0.05em' }}>TOTAL UNPAID FINES</Text>
                <Title level={2} style={{ margin: 0, color: '#0f172a', fontWeight: 800 }}>{formatCurrency(totalUnpaid)}</Title>
              </Space>
              <DollarOutlined style={{ fontSize: 32, color: '#fca5a5' }} />
            </Flex>
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} style={{ background: '#f0fdf4', borderRadius: 12 }} bodyStyle={{ padding: '24px' }}>
            <Flex justify="space-between" align="flex-start">
              <Space direction="vertical" size={4}>
                <Text style={{ color: '#15803d', fontWeight: 700, fontSize: 12, letterSpacing: '0.05em' }}>TOTAL PAID</Text>
                <Title level={2} style={{ margin: 0, color: '#0f172a', fontWeight: 800 }}>{formatCurrency(totalPaid)}</Title>
              </Space>
              <LineChartOutlined style={{ fontSize: 32, color: '#86efac' }} />
            </Flex>
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} style={{ background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }} bodyStyle={{ padding: '24px' }}>
            <Flex justify="space-between" align="flex-start">
              <Space direction="vertical" size={4}>
                <Text style={{ color: '#475569', fontWeight: 700, fontSize: 12, letterSpacing: '0.05em' }}>TOTAL FINES ISSUED</Text>
                <Title level={4} style={{ margin: 0, color: '#0f172a', fontWeight: 600, marginTop: 4 }}>{data.length}</Title>
              </Space>
              <ReloadOutlined style={{ fontSize: 28, color: '#cbd5e1' }} />
            </Flex>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default LibrarianFines;
