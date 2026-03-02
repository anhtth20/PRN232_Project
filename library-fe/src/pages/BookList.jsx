import React, { useState, useEffect } from 'react';
import { Layout, Input, Button, Row, Col, Typography, Space, Divider, message, Card } from 'antd';
import { 
  SearchOutlined, 
  BookOutlined, 
  HistoryOutlined, 
  ExperimentOutlined, 
  RocketOutlined, 
  BulbOutlined,
  BookFilled,
  UserOutlined,
  LogoutOutlined,
  AppstoreOutlined,
  FireOutlined
} from '@ant-design/icons';
import axios from 'axios';
import './BookList.css';

const { Header, Content, Sider, Footer } = Layout;
const { Title, Text, Link } = Typography;

const BookList = ({ onBookClick, externalSearch }) => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([{ id: null, name: 'All Books', icon: <AppstoreOutlined />, active: true }]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const pageSize = 8;

  // Sync external search from global header
  useEffect(() => {
    if (externalSearch !== undefined) {
      setSearch(externalSearch);
      setSearchInput(externalSearch);
      setPage(1); // Reset page on external search
    }
  }, [externalSearch]);

  const fetchCategories = React.useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5237/api/Categories');
      const apiCategories = response.data.map(cat => ({
        id: cat.id,
        name: cat.name,
        icon: getCategoryIcon(cat.name)
      }));
      setCategories([{ id: null, name: 'All Books', icon: <AppstoreOutlined /> }, ...apiCategories]);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  const getCategoryIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes('fiction')) return <BookOutlined />;
    if (n.includes('science')) return <ExperimentOutlined />;
    if (n.includes('history')) return <HistoryOutlined />;
    if (n.includes('art')) return <BulbOutlined />;
    return <BookOutlined />;
  };

  const fetchBooks = React.useCallback(async (isLoadMore = false) => {
    try {
      setLoading(true);
      const currentPage = isLoadMore ? page + 1 : 1;
      let url = `http://localhost:5237/api/Books?search=${search}&pageNumber=${currentPage}&pageSize=${pageSize}`;
      if (selectedCategoryId) {
        url += `&categoryId=${selectedCategoryId}`;
      }
      const response = await axios.get(url);
      const newBooks = response.data.data || [];
      
      if (isLoadMore) {
        setBooks(prev => [...prev, ...newBooks]);
        setPage(currentPage);
      } else {
        setBooks(newBooks);
        setPage(1);
      }
      setTotalBooks(response.data.total || 0);
    } catch (error) {
      console.error('Error fetching books:', error);
      message.error('Failed to load books');
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategoryId, page]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    // Standard effect for search and category changes (resets list)
    fetchBooks(false);
  }, [search, selectedCategoryId]); // Removed fetchBooks from deps to avoid loop with setBooks/setPage

  return (
    <div className="booklist-content-only">
      <div className="hero-section">
        <Title level={1} style={{ color: '#fff', fontSize: '48px', fontWeight: 800, marginBottom: '10px' }}>
          Discover Your Next Favorite Book
        </Title>
        <Text style={{ color: '#bfdbfe', fontSize: '18px' }}>
          Browse through thousands of titles in our digital catalog.
        </Text>
        <div className="search-box-wrapper">
          <Input.Search
            placeholder="Search by title or author"
            allowClear
            enterButton="Search"
            size="large"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onSearch={(value) => setSearch(value)}
            style={{ maxWidth: 600, margin: '30px auto 0' }}
          />
        </div>
      </div>

      <div style={{ padding: '40px 50px' }}>
        <Row gutter={40}>
          <Col span={5}>
            <div className="category-sidebar">
              <Title level={5} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <FireOutlined style={{ color: '#3b82f6' }} /> Categories
              </Title>
              {categories.map((cat) => (
                <div 
                  key={cat.id || 'all'} 
                  className={`category-item ${selectedCategoryId === cat.id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedCategoryId(cat.id);
                  }}
                >
                  {cat.icon}
                  <span>{cat.name}</span>
                </div>
              ))}
              <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#eff6ff', borderRadius: '12px' }}>
                <Title level={5} style={{ color: '#1d4ed8', margin: '0 0 10px 0' }}>Quick Tip</Title>
                <Text style={{ fontSize: '13px', color: '#1e40af' }}>
                  You can borrow up to 5 books at a time. Make sure to return them within 14 days to avoid fines!
                </Text>
              </div>
            </div>
          </Col>

          <Col span={19}>
            <Title level={3} style={{ marginBottom: '30px' }}>
              {selectedCategoryId ? categories.find(c => c.id === selectedCategoryId)?.name || 'Books' : 'Recommended for You'}
            </Title>
            <Row gutter={[24, 24]}>
              {loading && books.length === 0 ? (
                Array(8).fill(0).map((_, i) => (
                  <Col xl={6} lg={8} md={12} span={24} key={i}>
                    <Card loading />
                  </Col>
                ))
              ) : books.length > 0 ? (
                books.map(book => (
                  <Col xl={6} lg={8} md={12} span={24} key={book.id}>
                    <div className="book-card" onClick={() => onBookClick(book.id)} style={{ cursor: 'pointer' }}>
                      <div className="book-cover-wrapper">
                        <img 
                          className="book-cover" 
                          src={book.imageUrl || 'https://via.placeholder.com/300x450?text=No+Cover'} 
                          alt={book.title} 
                        />
                        <div className={`status-badge ${book.availableQuantity > 0 ? 'status-available' : 'status-loan'}`}>
                          {book.availableQuantity > 0 ? 'Available' : 'On Loan'}
                        </div>
                      </div>
                      <div className="book-info">
                        <div className="book-category">{book.categoryName || 'General'}</div>
                        <div className="book-title">{book.title}</div>
                        <div className="book-author">{book.authorName}</div>
                        <div className="actions-row">
                          <Button 
                            type="primary" 
                            size="large" 
                            style={{ flex: 1, borderRadius: '10px', height: '45px', fontWeight: 600 }}
                            disabled={book.availableQuantity <= 0}
                            onClick={(e) => { e.stopPropagation(); console.log('Borrow', book.id); }}
                          >
                            {book.availableQuantity > 0 ? 'Borrow' : 'Waitlist'}
                          </Button>
    
                        </div>
                      </div>
                    </div>
                  </Col>
                ))
              ) : (
                <Col span={24}>
                  <div style={{ textAlign: 'center', padding: '100px 0' }}>
                    <Text type="secondary" style={{ fontSize: '18px' }}>No books found matches your search or category.</Text>
                  </div>
                </Col>
              )}
            </Row>
            {books.length < totalBooks && (
              <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <Button 
                  loading={loading}
                  onClick={() => fetchBooks(true)}
                  size="large" 
                  style={{ borderRadius: '10px', height: '45px', padding: '0 40px' }}
                >
                  Load More Books
                </Button>
              </div>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default BookList;
