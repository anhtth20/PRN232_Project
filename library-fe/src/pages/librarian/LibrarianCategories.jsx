import React, { useState, useEffect } from 'react';
import { 
  Typography, Button, Input, Table, Space, 
  Card, Flex, Dropdown, Modal, Form, App, Tag
} from 'antd';
import { 
  PlusOutlined, TagsFilled, SearchOutlined,
  EditOutlined, DeleteOutlined, MoreOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import api from '../../api';

const { Title, Text, Paragraph } = Typography;

const LibrarianCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const { message } = App.useApp();

  const fetchCategories = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/Categories');
      let data = res.data || [];
      if (search) {
        data = data.filter(c => 
          c.name.toLowerCase().includes(search.toLowerCase()) || 
          (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
        );
      }
      setCategories(data);
    } catch {
      message.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, [search, message]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCreate = async (values) => {
    try {
      await api.post('/Categories', values);
      message.success('Category created successfully');
      setIsCreateModalOpen(false);
      form.resetFields();
      fetchCategories();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to create category');
    }
  };

  const handleEdit = (record) => {
    setEditingCategory(record);
    editForm.setFieldsValue({
      name: record.name,
      description: record.description
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (values) => {
    try {
      await api.put(`/Categories/${editingCategory.id}`, values);
      message.success('Category updated successfully');
      setIsEditModalOpen(false);
      fetchCategories();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to update category');
    }
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this category?',
      content: 'Any books currently associated with this category will remain, but you won\'t be able to select this category for new books.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await api.delete(`/Categories/${id}`);
          message.success('Category deleted');
          fetchCategories();
        } catch (error) {
          message.error(error.response?.data?.message || 'Failed to delete category');
        }
      }
    });
  };

  const columns = [
    {
      title: 'CATEGORY NAME',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Space size={16}>
          <div style={{ width: 40, height: 40, backgroundColor: '#f1f5f9', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TagsFilled style={{ color: '#64748b', fontSize: 18 }} />
          </div>
          <Text strong style={{ color: '#1e293b', fontSize: 15 }}>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'DESCRIPTION',
      dataIndex: 'description',
      key: 'description',
      render: (text) => <Text style={{ color: '#64748b' }}>{text || <Text type="secondary" italic>No description provided</Text>}</Text>,
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
                label: 'Edit Category',
                onClick: () => handleEdit(record),
              },
              {
                key: 'delete',
                icon: <DeleteOutlined style={{ color: '#ef4444' }}/>,
                label: <span style={{ color: '#ef4444' }}>Delete Category</span>,
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
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <Flex justify="space-between" align="flex-start" style={{ marginBottom: 32 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Manage Categories
          </Title>
          <Paragraph type="secondary" style={{ fontSize: 16, marginTop: 8, color: '#64748b', maxWidth: 600 }}>
            Organize your library collections by managing book categories and genres.
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
          Add Category
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
          <Input 
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />} 
            placeholder="Filter categories by name or description..." 
            variant="filled"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ borderRadius: 8, flex: 1, padding: '8px 0px', background: '#f8fafc', border: 'none' }}
          />
          <Button 
            icon={<ReloadOutlined />} 
            onClick={() => fetchCategories()} 
            loading={loading}
            style={{ borderRadius: 8 }}
          />
        </Flex>

        <Table 
          columns={columns} 
          dataSource={categories} 
          rowKey="id"
          pagination={{ pageSize: 10, position: ['bottomRight'], style: { padding: '20px 24px' } }}
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
      </Card>

      {/* Create Modal */}
      <Modal
        title={<span style={{ fontSize: 18, fontWeight: 700 }}>Add New Category</span>}
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleCreate} style={{ marginTop: 24 }}>
          <Form.Item name="name" label="Category Name" rules={[{ required: true, message: 'Please enter category name' }]}>
            <Input size="large" placeholder="e.g. Science Fiction, Biography..." />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea size="large" rows={4} placeholder="Brief description of this category..." />
          </Form.Item>
          <Flex justify="flex-end" gap={12} style={{ marginTop: 32 }}>
            <Button onClick={() => setIsCreateModalOpen(false)} size="large">Cancel</Button>
            <Button type="primary" htmlType="submit" size="large" style={{ background: '#2563eb' }}>Create Category</Button>
          </Flex>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title={<span style={{ fontSize: 18, fontWeight: 700 }}>Edit Category</span>}
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdate} style={{ marginTop: 24 }}>
          <Form.Item name="name" label="Category Name" rules={[{ required: true, message: 'Please enter category name' }]}>
            <Input size="large" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea size="large" rows={4} />
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

export default LibrarianCategories;
