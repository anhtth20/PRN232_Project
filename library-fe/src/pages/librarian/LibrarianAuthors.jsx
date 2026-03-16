import React, { useState, useEffect } from 'react';
import { 
  Typography, Button, Input, Table, Space, Avatar, 
  Card, Row, Col, Flex, Dropdown, Pagination, Modal, Form, App 
} from 'antd';
import { 
  SearchOutlined, PlusOutlined, 
  UserAddOutlined, LineChartOutlined, ReloadOutlined,
  EditOutlined, DeleteOutlined, MoreOutlined
} from '@ant-design/icons';
import api from '../../api';

const { Title, Text, Paragraph } = Typography;

const LibrarianAuthors = () => {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalAuthors, setTotalAuthors] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(null);
  
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const { message } = App.useApp();

  const PAGE_SIZE = 5;

  const fetchAuthors = React.useCallback(async () => {
    setLoading(true);
    try {
      // Simplistic client-side pagination since API doesn't support it natively yet
      const res = await api.get('/Authors');
      let data = res.data.data || [];
      
      if (search) {
        data = data.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));
      }
      
      setTotalAuthors(data.length);
      const start = (page - 1) * PAGE_SIZE;
      setAuthors(data.slice(start, start + PAGE_SIZE));
    } catch {
      message.error('Failed to load authors');
    } finally {
      setLoading(false);
    }
  }, [page, search, message]);

  useEffect(() => {
    fetchAuthors();
  }, [fetchAuthors]);

  const handleCreate = async (values) => {
    try {
      await api.post('/Authors', values);
      message.success('Author created successfully');
      setIsCreateModalOpen(false);
      form.resetFields();
      fetchAuthors();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to create author');
    }
  };

  const handleEdit = (record) => {
    setEditingAuthor(record);
    editForm.setFieldsValue(record);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (values) => {
    try {
      await api.put(`/Authors/${editingAuthor.id}`, values);
      message.success('Author updated successfully');
      setIsEditModalOpen(false);
      fetchAuthors();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to update author');
    }
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this author?',
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await api.delete(`/Authors/${id}`);
          message.success('Author deleted');
          fetchAuthors();
        } catch (error) {
          message.error(error.response?.data?.message || 'Failed to delete author');
        }
      }
    });
  };

  const getInitials = (name) => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const columns = [
    {
      title: 'AUTHOR NAME',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Space size={16}>
          <Avatar style={{ backgroundColor: '#bae6fd', color: '#0f172a', fontWeight: 600 }}>
            {getInitials(text)}
          </Avatar>
          <Text strong style={{ color: '#1e293b' }}>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'BIOGRAPHY',
      dataIndex: 'bio',
      key: 'bio',
      render: (text) => <Text style={{ color: '#64748b' }} ellipsis={{ tooltip: text }}>{text || 'No biography available'}</Text>,
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'edit',
                icon: <EditOutlined />,
                label: 'Edit Author',
                onClick: () => handleEdit(record),
              },
              {
                key: 'delete',
                icon: <DeleteOutlined style={{ color: '#ef4444' }}/>,
                label: <span style={{ color: '#ef4444' }}>Delete Author</span>,
                onClick: () => handleDelete(record.id),
              },
            ],
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined style={{ fontSize: 18, color: '#94a3b8' }} />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Flex justify="space-between" align="flex-start" style={{ marginBottom: 32 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Manage Authors
          </Title>
          <Paragraph type="secondary" style={{ fontSize: 16, marginTop: 8, color: '#64748b', maxWidth: 600 }}>
            View, search, and manage author biographical information and their collections in the central library system.
          </Paragraph>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          size="large"
          onClick={() => setIsCreateModalOpen(true)}
          style={{ 
            borderRadius: 8, 
            background: '#2563eb', 
            fontWeight: 600, 
            padding: '0 24px',
            height: 44,
            boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.1), 0 2px 4px -1px rgba(37, 99, 235, 0.06)'
          }}
        >
          Add New Author
        </Button>
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
            placeholder="Search authors by name..." 
            variant="filled"
            onSearch={val => { setSearch(val); setPage(1); }}
            style={{ borderRadius: 8, flex: 1, padding: '8px 0px', background: '#f8fafc', border: 'none' }}
          />
        </Flex>

        <Table 
          columns={columns} 
          dataSource={authors} 
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
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, totalAuthors)} to {Math.min(page * PAGE_SIZE, totalAuthors)} of {totalAuthors} authors
          </Text>
          <Pagination 
            current={page} 
            total={totalAuthors} 
            pageSize={PAGE_SIZE} 
            onChange={p => setPage(p)}
            showSizeChanger={false} 
          />
        </Flex>
      </Card>

      <Row gutter={24}>
        <Col span={8}>
          <Card 
            bordered={false} 
            style={{ background: '#eff6ff', borderRadius: 12 }}
            bodyStyle={{ padding: '24px' }}
          >
            <Flex justify="space-between" align="flex-start">
              <Space direction="vertical" size={4}>
                <Text style={{ color: '#1d4ed8', fontWeight: 700, fontSize: 12, letterSpacing: '0.05em' }}>TOTAL AUTHORS</Text>
                <Title level={2} style={{ margin: 0, color: '#0f172a', fontWeight: 800 }}>{totalAuthors}</Title>
              </Space>
              <UserAddOutlined style={{ fontSize: 32, color: '#93c5fd' }} />
            </Flex>
          </Card>
        </Col>
      </Row>

      {/* Create Modal */}
      <Modal
        title={<span style={{ fontSize: 18, fontWeight: 700 }}>Add New Author</span>}
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleCreate} style={{ marginTop: 24 }}>
          <Form.Item name="name" label="Author Name" rules={[{ required: true, message: 'Please enter author name' }]}>
            <Input size="large" placeholder="E.g. J.K. Rowling" />
          </Form.Item>
          <Form.Item name="bio" label="Biography">
            <Input.TextArea rows={4} placeholder="Enter author biography..." />
          </Form.Item>
          <Flex justify="flex-end" gap={12} style={{ marginTop: 32 }}>
            <Button onClick={() => setIsCreateModalOpen(false)} size="large">Cancel</Button>
            <Button type="primary" htmlType="submit" size="large" style={{ background: '#2563eb' }}>Create Author</Button>
          </Flex>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title={<span style={{ fontSize: 18, fontWeight: 700 }}>Edit Author</span>}
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdate} style={{ marginTop: 24 }}>
          <Form.Item name="name" label="Author Name" rules={[{ required: true }]}>
            <Input size="large" />
          </Form.Item>
          <Form.Item name="bio" label="Biography">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Flex justify="flex-end" gap={12} style={{ marginTop: 32 }}>
            <Button onClick={() => setIsEditModalOpen(false)} size="large">Cancel</Button>
            <Button type="primary" htmlType="submit" size="large" style={{ background: '#2563eb' }}>Save Changes</Button>
          </Flex>
        </Form>
      </Modal>

    </div>
  );
};

export default LibrarianAuthors;
