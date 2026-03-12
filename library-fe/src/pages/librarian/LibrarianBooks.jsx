import React, { useState, useEffect } from 'react';
import { 
  Typography, Button, Input, Select, Table, Space, 
  Card, Row, Col, Flex, Dropdown, Tag, Pagination, Modal, Form, App, InputNumber
} from 'antd';
import { 
  SearchOutlined, PlusOutlined, FilterOutlined, 
  BookOutlined, LineChartOutlined, ReloadOutlined,
  EditOutlined, DeleteOutlined, MoreOutlined
} from '@ant-design/icons';
import api from '../../api';

const { Title, Text, Paragraph } = Typography;

const LibrarianBooks = () => {
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalBooks, setTotalBooks] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const { message } = App.useApp();

  const PAGE_SIZE = 5;

  const fetchBooks = async () => {
    setLoading(true);
    try {
      let url = `/Books?pageNumber=${page}&pageSize=${PAGE_SIZE}`;
      if (search) url += `&search=${search}`;
      if (categoryFilter && categoryFilter !== 'all') url += `&categoryId=${categoryFilter}`;
      
      const res = await api.get(url);
      setBooks(res.data.data || []);
      setTotalBooks(res.data.total || 0);
    } catch (error) {
      message.error('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [authorRes, catRes] = await Promise.all([
        api.get('/Authors?pageSize=1000'),
        api.get('/Categories')
      ]);
      setAuthors(authorRes.data.data || []);
      setCategories(catRes.data || []);
    } catch (error) {
      console.error('Failed to load dependencies', error);
    }
  };

  useEffect(() => {
    fetchDependencies();
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [page, search, categoryFilter]);

  const handleCreate = async (values) => {
    try {
      await api.post('/Books', values);
      message.success('Book created successfully');
      setIsCreateModalOpen(false);
      form.resetFields();
      fetchBooks();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to create book');
    }
  };

  const handleEdit = (record) => {
    setEditingBook(record);
    editForm.setFieldsValue({
      title: record.title,
      authorId: record.authorId,
      categoryId: record.categoryId,
      quantity: record.quantity
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (values) => {
    try {
      await api.put(`/Books/${editingBook.id}`, values);
      message.success('Book updated successfully');
      setIsEditModalOpen(false);
      fetchBooks();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to update book');
    }
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this book?',
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await api.delete(`/Books/${id}`);
          message.success('Book deleted');
          fetchBooks();
        } catch (error) {
          message.error('Failed to delete book');
        }
      }
    });
  };

  const getStatusTag = (available, total) => {
    if (available === 0) return <Tag color="red" style={{ borderRadius: 12, fontWeight: 600 }}>Borrowed</Tag>;
    if (available < 3) return <Tag color="orange" style={{ borderRadius: 12, fontWeight: 600 }}>Low Stock</Tag>;
    return <Tag color="green" style={{ borderRadius: 12, fontWeight: 600 }}>Available</Tag>;
  };

  const columns = [
    {
      title: 'BOOK TITLE',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Space size={16}>
          <div style={{ width: 40, height: 56, backgroundColor: '#f1f5f9', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOutlined style={{ color: '#64748b', fontSize: 16 }} />
          </div>
          <div>
            <Text strong style={{ color: '#1e293b', display: 'block' }}>{text}</Text>
            <Text type="secondary" style={{ fontSize: 13 }}>{record.authorName}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'CATEGORY',
      dataIndex: 'categoryName',
      key: 'category',
      render: (text) => <Text style={{ color: '#64748b' }}>{text}</Text>,
    },
    {
      title: 'STATUS',
      key: 'status',
      render: (_, record) => getStatusTag(record.availableQuantity, record.quantity),
    },
    {
      title: 'AVAILABLE / TOTAL',
      key: 'copies',
      render: (_, record) => (
        <Tag style={{ borderRadius: 12, padding: '2px 12px', background: '#f1f5f9', border: 'none', color: '#0f172a', fontWeight: 600 }}>
          {record.availableQuantity} / {record.quantity}
        </Tag>
      ),
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
                label: 'Edit Book',
                onClick: () => handleEdit(record),
              },
              {
                key: 'delete',
                icon: <DeleteOutlined style={{ color: '#ef4444' }}/>,
                label: <span style={{ color: '#ef4444' }}>Delete Book</span>,
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
            Manage Books
          </Title>
          <Paragraph type="secondary" style={{ fontSize: 16, marginTop: 8, color: '#64748b', maxWidth: 600 }}>
            View, search, and manage books in the collection including their availability and metadata.
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
          Add New Book
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
            placeholder="Search books by title or author..." 
            variant="filled"
            onSearch={val => { setSearch(val); setPage(1); }}
            style={{ borderRadius: 8, flex: 1, padding: '8px 0px', background: '#f8fafc', border: 'none' }}
          />
          <Select 
            defaultValue="all" 
            style={{ width: 160 }} 
            variant="filled"
            onChange={val => { setCategoryFilter(val); setPage(1); }}
            options={[
              { value: 'all', label: 'All Categories' },
              ...categories.map(c => ({ value: c.id, label: c.name }))
            ]}
          />
        </Flex>

        <Table 
          columns={columns} 
          dataSource={books} 
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
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, totalBooks)} to {Math.min(page * PAGE_SIZE, totalBooks)} of {totalBooks} books
          </Text>
          <Pagination 
            current={page} 
            total={totalBooks} 
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
                <Text style={{ color: '#1d4ed8', fontWeight: 700, fontSize: 12, letterSpacing: '0.05em' }}>TOTAL BOOKS</Text>
                <Title level={2} style={{ margin: 0, color: '#0f172a', fontWeight: 800 }}>{totalBooks}</Title>
              </Space>
              <BookOutlined style={{ fontSize: 32, color: '#93c5fd' }} />
            </Flex>
          </Card>
        </Col>
      </Row>

      {/* Create Modal */}
      <Modal
        title={<span style={{ fontSize: 18, fontWeight: 700 }}>Add New Book</span>}
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleCreate} style={{ marginTop: 24 }}>
          <Form.Item name="title" label="Book Title" rules={[{ required: true, message: 'Please enter book title' }]}>
            <Input size="large" />
          </Form.Item>
          <Form.Item name="authorId" label="Author" rules={[{ required: true }]}>
             <Select size="large" showSearch optionFilterProp="label" options={authors.map(a => ({ value: a.id, label: a.name }))} />
          </Form.Item>
          <Form.Item name="categoryId" label="Category" rules={[{ required: true }]}>
            <Select size="large" options={categories.map(c => ({ value: c.id, label: c.name }))} />
          </Form.Item>
          <Form.Item name="quantity" label="Total Copies" rules={[{ required: true }]}>
            <InputNumber size="large" min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Flex justify="flex-end" gap={12} style={{ marginTop: 32 }}>
            <Button onClick={() => setIsCreateModalOpen(false)} size="large">Cancel</Button>
            <Button type="primary" htmlType="submit" size="large" style={{ background: '#2563eb' }}>Create Book</Button>
          </Flex>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title={<span style={{ fontSize: 18, fontWeight: 700 }}>Edit Book</span>}
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdate} style={{ marginTop: 24 }}>
          <Form.Item name="title" label="Book Title" rules={[{ required: true }]}>
            <Input size="large" />
          </Form.Item>
          <Form.Item name="authorId" label="Author" rules={[{ required: true }]}>
            <Select size="large" showSearch optionFilterProp="label" options={authors.map(a => ({ value: a.id, label: a.name }))} />
          </Form.Item>
          <Form.Item name="categoryId" label="Category" rules={[{ required: true }]}>
            <Select size="large" options={categories.map(c => ({ value: c.id, label: c.name }))} />
          </Form.Item>
          <Form.Item name="quantity" label="Total Copies" rules={[{ required: true }]}>
            <InputNumber size="large" min={1} style={{ width: '100%' }} />
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

export default LibrarianBooks;
