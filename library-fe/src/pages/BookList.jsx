import React, { useState, useEffect } from 'react';
import {
  Row, Col, Typography, Space, Button, Card, Menu,
  Input, Tag, Skeleton, Empty, Pagination, Alert, App, Flex,
} from 'antd';
import {
  SearchOutlined,
  BookOutlined,
  HistoryOutlined,
  ExperimentOutlined,
  BulbOutlined,
  AppstoreOutlined,
  FireOutlined,
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

const API_BASE = 'http://localhost:5237';
const resolveImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
};

const getCategoryIcon = (name) => {
  const n = name.toLowerCase();
  if (n.includes('fiction')) return <BookOutlined />;
  if (n.includes('science')) return <ExperimentOutlined />;
  if (n.includes('history')) return <HistoryOutlined />;
  if (n.includes('art')) return <BulbOutlined />;
  return <BookOutlined />;
};

const PAGE_SIZE = 8;

const BookList = ({ onBookClick, externalSearch }) => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const { message } = App.useApp();

  // Sync global header search
  useEffect(() => {
    if (externalSearch !== undefined) {
      setSearch(externalSearch);
      setSearchInput(externalSearch);
      setPage(1);
    }
  }, [externalSearch]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://localhost:5237/api/Categories');
        setCategories(res.data.map((cat) => ({
          key: String(cat.id),
          label: cat.name,
          icon: getCategoryIcon(cat.name),
          id: cat.id,
        })));
      } catch {
        // silent — category list is cosmetic
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        let url = `http://localhost:5237/api/Books?search=${search}&pageNumber=${page}&pageSize=${PAGE_SIZE}`;
        if (selectedCategoryId) url += `&categoryId=${selectedCategoryId}`;
        const res = await axios.get(url);
        setBooks(res.data.data || []);
        setTotalBooks(res.data.total || 0);
      } catch {
        message.error('Failed to load books');
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, selectedCategoryId, page]);

  // Reset to page 1 when filter/search changes
  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const menuItems = [
    { key: 'all', label: 'All Books', icon: <AppstoreOutlined /> },
    ...categories,
  ];

  const selectedKey = selectedCategoryId ? String(selectedCategoryId) : 'all';

  const handleMenuSelect = ({ key }) => {
    setSelectedCategoryId(key === 'all' ? null : Number(key));
    setPage(1);
  };

  const currentCategoryName =
    selectedCategoryId
      ? categories.find((c) => c.id === selectedCategoryId)?.label || 'Books'
      : 'Recommended for You';

  return (
    <div>
      {/* Hero */}
      <div
        style={{
          background: 'linear-gradient(135deg,#1d4ed8 0%,#3b82f6 100%)',
          padding: '60px 24px',
          textAlign: 'center',
        }}
      >
        <Title level={1} style={{ color: '#fff', fontSize: 46, fontWeight: 800, marginBottom: 8 }}>
          Discover Your Next Favorite Book
        </Title>
        <Text style={{ color: '#bfdbfe', fontSize: 18 }}>
          Browse through thousands of titles in our digital catalog.
        </Text>
        <div style={{ maxWidth: 600, margin: '28px auto 0' }}>
          <Input.Search
            placeholder="Search by title or author"
            allowClear
            enterButton="Search"
            size="large"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onSearch={handleSearch}
            style={{ borderRadius: 12, boxShadow: '0 10px 25px rgba(0,0,0,0.12)' }}
          />
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 32px' }}>
        <Row gutter={32}>
          {/* Sidebar */}
          <Col xs={0} md={5}>
            <Card
              style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
              styles={{ body: { padding: '16px 8px' } }}
            >
              <Flex align="center" gap={8} style={{ padding: '0 12px', marginBottom: 12 }}>
                <FireOutlined style={{ color: '#2563eb' }} />
                <Text strong style={{ fontSize: 14 }}>Categories</Text>
              </Flex>
              <Menu
                mode="inline"
                items={menuItems}
                selectedKeys={[selectedKey]}
                onSelect={handleMenuSelect}
                style={{ border: 'none' }}
              />
              <div style={{ margin: '16px 12px 4px' }}>
                <Alert
                  type="info"
                  showIcon
                  message="Quick Tip"
                  description="You can borrow up to 5 books at a time. Return them within 14 days to avoid fines!"
                  style={{ borderRadius: 10 }}
                />
              </div>
            </Card>
          </Col>

          {/* Book Grid */}
          <Col xs={24} md={19}>
            <Title level={3} style={{ marginBottom: 24 }}>{currentCategoryName}</Title>
            <Row gutter={[20, 20]}>
              {loading ? (
                Array(PAGE_SIZE).fill(0).map((_, i) => (
                  <Col xl={6} lg={8} md={12} xs={24} key={i}>
                    <Card style={{ borderRadius: 14 }}>
                      <Skeleton active avatar={{ shape: 'square', size: 120 }} paragraph={{ rows: 3 }} />
                    </Card>
                  </Col>
                ))
              ) : books.length > 0 ? (
                books.map((book) => (
                  <Col xl={6} lg={8} md={12} xs={24} key={book.id}>
                    <Card
                      hoverable
                      onClick={() => onBookClick(book.id)}
                      style={{ borderRadius: 14, overflow: 'hidden', height: '100%' }}
                      styles={{ body: { padding: '16px' } }}
                      cover={
                        <div style={{ position: 'relative', paddingTop: '140%', background: '#f1f5f9' }}>
                          <img
                            src={resolveImageUrl(book.imageUrl) || 'https://placehold.co/300x450?text=No+Cover'}
                            alt={book.title}
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <Tag
                            color={book.availableQuantity > 0 ? 'success' : 'error'}
                            style={{ position: 'absolute', top: 10, left: 10, fontWeight: 600, textTransform: 'uppercase' }}
                          >
                            {book.availableQuantity > 0 ? 'Available' : 'On Loan'}
                          </Tag>
                        </div>
                      }
                    >
                      <Text type="secondary" style={{ fontSize: 12 }}>{book.categoryName || 'General'}</Text>
                      <Typography.Text
                        ellipsis={{ tooltip: book.title }}
                        strong
                        style={{ fontSize: 16, color: '#1e293b', display: 'block', margin: '4px 0', lineHeight: 1.3 }}
                      >
                        {book.title}
                      </Typography.Text>
                      <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 14 }}>
                        {book.authorName}
                      </Text>
                      <Button
                        type="primary"
                        block
                        disabled={book.availableQuantity <= 0}
                        onClick={(e) => { e.stopPropagation(); }}
                        style={{ borderRadius: 8, fontWeight: 600 }}
                      >
                        {book.availableQuantity > 0 ? 'Borrow' : 'Waitlist'}
                      </Button>
                    </Card>
                  </Col>
                ))
              ) : (
                <Col span={24}>
                  <Empty description="No books match your search or selected category." style={{ padding: '80px 0' }} />
                </Col>
              )}
            </Row>

            {/* Pagination */}
            {totalBooks > PAGE_SIZE && (
              <Flex justify="center" style={{ marginTop: 48 }}>
                <Pagination
                  current={page}
                  total={totalBooks}
                  pageSize={PAGE_SIZE}
                  onChange={(p) => setPage(p)}
                  showSizeChanger={false}
                  showQuickJumper
                />
              </Flex>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default BookList;
