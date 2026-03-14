import React, { useState, useEffect } from 'react';
import { 
  Typography, Button, Input, Select, Table, Space, 
  Card, Row, Col, Flex, Dropdown, Tag, Pagination, Modal, Form, App, InputNumber,
  Upload, Image
} from 'antd';
import { 
  SearchOutlined, PlusOutlined, FilterOutlined, 
  BookOutlined, ReloadOutlined,
  EditOutlined, DeleteOutlined, MoreOutlined, UploadOutlined, PictureOutlined
} from '@ant-design/icons';
import api from '../../api';

const { Title, Text, Paragraph } = Typography;

const API_BASE = 'http://localhost:5237';

/** Prefix relative paths (uploaded images) with the API base URL */
const resolveImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
};

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

  // Image file states (hold File object, not uploaded yet)
  const [createImageFile, setCreateImageFile] = useState(null);
  const [createImagePreview, setCreateImagePreview] = useState(null);
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);

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
    } catch {
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
    } catch {
      console.error('Failed to load dependencies');
    }
  };

  useEffect(() => { fetchDependencies(); }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchBooks(); }, [page, search, categoryFilter]);

  // ── Image picker helpers ──────────────────────────────────────────────────
  const handleImageSelect = (file, setFile, setPreview) => {
    const isAllowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'].includes(file.type);
    if (!isAllowed) {
      message.error('Only JPG, PNG, GIF, and WEBP images are allowed.');
      return Upload.LIST_IGNORE;
    }
    setFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
    return false; // Prevent auto-upload
  };

  // ── Create ────────────────────────────────────────────────────────────────
  const handleCreate = async (values) => {
    try {
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('authorId', values.authorId);
      formData.append('categoryId', values.categoryId);
      formData.append('quantity', values.quantity);
      if (values.description) formData.append('description', values.description);
      if (createImageFile) formData.append('imageFile', createImageFile);

      await api.post('/Books', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      message.success('Book created successfully');
      setIsCreateModalOpen(false);
      form.resetFields();
      setCreateImageFile(null);
      setCreateImagePreview(null);
      fetchBooks();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to create book');
    }
  };

  // ── Edit ──────────────────────────────────────────────────────────────────
  const handleEdit = (record) => {
    setEditingBook(record);
    setEditImageFile(null);
    setEditImagePreview(resolveImageUrl(record.imageUrl));
    editForm.setFieldsValue({
      title: record.title,
      authorId: record.authorId,
      categoryId: record.categoryId,
      quantity: record.quantity,
      description: record.description,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (values) => {
    try {
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('authorId', values.authorId);
      formData.append('categoryId', values.categoryId);
      formData.append('quantity', values.quantity);
      if (values.description) formData.append('description', values.description);
      if (editImageFile) formData.append('imageFile', editImageFile);

      await api.put(`/Books/${editingBook.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      message.success('Book updated successfully');
      setIsEditModalOpen(false);
      setEditImageFile(null);
      setEditImagePreview(null);
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
        } catch {
          message.error('Failed to delete book');
        }
      }
    });
  };

  const getStatusTag = (available) => {
    if (available === 0) return <Tag color="red" style={{ borderRadius: 12, fontWeight: 600 }}>Borrowed</Tag>;
    if (available < 3) return <Tag color="orange" style={{ borderRadius: 12, fontWeight: 600 }}>Low Stock</Tag>;
    return <Tag color="green" style={{ borderRadius: 12, fontWeight: 600 }}>Available</Tag>;
  };

  const columns = [
    {
      title: 'BOOK',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Space size={14}>
          {/* Thumbnail */}
          <div style={{ width: 44, height: 60, borderRadius: 6, overflow: 'hidden', flexShrink: 0, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {record.imageUrl ? (
              <Image
                src={resolveImageUrl(record.imageUrl)}
                alt={text}
                width={44}
                height={60}
                style={{ objectFit: 'cover', borderRadius: 6 }}
                preview={false}
                fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='60'%3E%3Crect fill='%23f1f5f9' width='44' height='60'/%3E%3C/svg%3E"
              />
            ) : (
              <BookOutlined style={{ color: '#94a3b8', fontSize: 18 }} />
            )}
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
      render: (_, record) => getStatusTag(record.availableQuantity),
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

  // ── Image upload UI block (reused in both modals) ─────────────────────────
  const renderImageUpload = (preview, onSelect) => (
    <Form.Item label="Cover Image" style={{ marginBottom: 0 }}>
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        {preview && (
          <div style={{ textAlign: 'center' }}>
            <Image
              src={preview}
              alt="Cover preview"
              height={160}
              style={{ objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0' }}
              preview={false}
            />
          </div>
        )}
        <Upload
          beforeUpload={onSelect}
          showUploadList={false}
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        >
          <Button icon={<UploadOutlined />} style={{ width: '100%' }}>
            {preview ? 'Change Cover Image' : 'Upload Cover Image'}
          </Button>
        </Upload>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Accepted: JPG, PNG, GIF, WEBP · Max recommended: 2 MB
        </Text>
      </Space>
    </Form.Item>
  );

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
              cell: (props) => <td {...props} style={{ ...props.style, padding: '16px 24px', borderBottom: '1px solid #f1f5f9' }} />
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

      {/* ── Create Modal ─────────────────────────────────────── */}
      <Modal
        title={<Text strong style={{ fontSize: 18 }}>Add New Book</Text>}
        open={isCreateModalOpen}
        onCancel={() => { setIsCreateModalOpen(false); form.resetFields(); setCreateImageFile(null); setCreateImagePreview(null); }}
        footer={null}
        destroyOnClose
        width={560}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate} style={{ marginTop: 20 }}>
          <Form.Item name="title" label="Book Title" rules={[{ required: true, message: 'Please enter the book title' }]}>
            <Input size="large" placeholder="e.g. The Great Gatsby" />
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="authorId" label="Author" rules={[{ required: true, message: 'Select an author' }]}>
                <Select size="large" showSearch optionFilterProp="label" placeholder="Select author" options={authors.map(a => ({ value: a.id, label: a.name }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="categoryId" label="Category" rules={[{ required: true, message: 'Select a category' }]}>
                <Select size="large" placeholder="Select category" options={categories.map(c => ({ value: c.id, label: c.name }))} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="quantity" label="Total Copies" rules={[{ required: true, message: 'Enter quantity' }]}>
            <InputNumber size="large" min={1} style={{ width: '100%' }} placeholder="e.g. 5" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea
              rows={3}
              size="large"
              placeholder="Brief description of the book (optional)"
              maxLength={1000}
              showCount
            />
          </Form.Item>

          {renderImageUpload(
            createImagePreview,
            (file) => handleImageSelect(file, setCreateImageFile, setCreateImagePreview)
          )}

          <Flex justify="flex-end" gap={12} style={{ marginTop: 28 }}>
            <Button onClick={() => { setIsCreateModalOpen(false); form.resetFields(); setCreateImageFile(null); setCreateImagePreview(null); }} size="large">Cancel</Button>
            <Button type="primary" htmlType="submit" size="large" style={{ background: '#2563eb', fontWeight: 600 }}>Create Book</Button>
          </Flex>
        </Form>
      </Modal>

      {/* ── Edit Modal ───────────────────────────────────────── */}
      <Modal
        title={<Text strong style={{ fontSize: 18 }}>Edit Book</Text>}
        open={isEditModalOpen}
        onCancel={() => { setIsEditModalOpen(false); setEditImageFile(null); setEditImagePreview(null); }}
        footer={null}
        destroyOnClose
        width={560}
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdate} style={{ marginTop: 20 }}>
          <Form.Item name="title" label="Book Title" rules={[{ required: true, message: 'Please enter the book title' }]}>
            <Input size="large" />
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="authorId" label="Author" rules={[{ required: true }]}>
                <Select size="large" showSearch optionFilterProp="label" placeholder="Select author" options={authors.map(a => ({ value: a.id, label: a.name }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="categoryId" label="Category" rules={[{ required: true }]}>
                <Select size="large" placeholder="Select category" options={categories.map(c => ({ value: c.id, label: c.name }))} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="quantity" label="Total Copies" rules={[{ required: true }]}>
            <InputNumber size="large" min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea
              rows={3}
              size="large"
              placeholder="Brief description of the book (optional)"
              maxLength={1000}
              showCount
            />
          </Form.Item>

          {renderImageUpload(
            editImagePreview,
            (file) => handleImageSelect(file, setEditImageFile, setEditImagePreview)
          )}

          <Flex justify="flex-end" gap={12} style={{ marginTop: 28 }}>
            <Button onClick={() => { setIsEditModalOpen(false); setEditImageFile(null); setEditImagePreview(null); }} size="large">Cancel</Button>
            <Button type="primary" htmlType="submit" size="large" style={{ background: '#2563eb', fontWeight: 600 }}>Save Changes</Button>
          </Flex>
        </Form>
      </Modal>
    </div>
  );
};

export default LibrarianBooks;
