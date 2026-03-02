import React, { useState, useEffect } from 'react';
import { Layout, Button, Row, Col, Typography, Space, Avatar, Divider, message, Breadcrumb, Input, Tag } from 'antd';
import BorrowModal from '../components/BorrowModal';
import { 
  ArrowLeftOutlined, 
  UserOutlined, 
  BookOutlined, 
  SafetyCertificateOutlined,
  LogoutOutlined,
  BookFilled,
  SearchOutlined,
  DashboardOutlined,
  AppstoreOutlined,
  ContainerOutlined,
  CheckCircleFilled,
  ExclamationCircleFilled
} from '@ant-design/icons';
import axios from 'axios';
import './BookDetails.css';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

const BookDetails = ({ bookId, onBack }) => {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [borrowModalOpen, setBorrowModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [bookId]);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5237/api/Books/${bookId}`);
        setBook(response.data);
      } catch (error) {
        console.error('Error fetching book details:', error);
        message.error('Failed to load book details');
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [bookId]);

  if (loading) {
    return (
      <div className="details-loader-container">
        <div className="lumina-loader"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="details-empty-state">
        <Title level={2}>Book not found</Title>
        <Button icon={<ArrowLeftOutlined />} onClick={onBack}>Back to Results</Button>
      </div>
    );
  }

  return (
    <div className="lumina-details-content-only">
      <div className="lumina-details-inner">
        <div className="details-top-bar">
          <Breadcrumb 
            items={[
              { title: <a onClick={onBack}>Home</a> },
              { title: 'Catalog' },
              { title: 'Book Details' }
            ]} 
          />
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            className="back-results-btn"
            onClick={onBack}
          >
            Back to Results
          </Button>
        </div>

        <Row gutter={[64, 32]} className="details-main-row">
          {/* Left Column: Image and Status */}
          <Col xl={10} lg={10} md={24} sm={24} className="details-visual">
            <div className="book-image-container">
              <img 
                src={book.imageUrl || 'https://via.placeholder.com/400x600?text=No+Cover'} 
                alt={book.title} 
                className="book-main-image"
              />
            </div>
            
            <div className={`book-status-banner ${book.availableQuantity > 0 ? 'available' : 'unavailable'}`}>
              {book.availableQuantity > 0 ? (
                <><CheckCircleFilled /> AVAILABLE NOW</>
              ) : (
                <><ExclamationCircleFilled /> ON LOAN</>
              )}
            </div>
            <div className="reference-id">Reference ID: LIB-{book.id}</div>
          </Col>

          {/* Right Column: Info and Action */}
          <Col xl={14} lg={14} md={24} sm={24} className="details-textual">
            <div className="title-group">
              <Title level={1} className="book-display-title">{book.title}</Title>
              <Text className="book-display-author">{book.authorName}</Text>
            </div>

            <div className="badges-row">
              <Space split={<Divider type="vertical" className="badge-divider" />}>
                <div className="badge-item">
                  <AppstoreOutlined /> {book.categoryName}
                </div>
                <div className="badge-item">
                  <ContainerOutlined /> {book.availableQuantity} of {book.quantity} copies
                </div>
              </Space>
            </div>

            <div className="borrow-action-card">
              <div className="action-card-content">
                <Text strong className="action-title">Ready to read this book?</Text>
                <Text className="action-desc">
                  Standard loan period is 14 days. You can renew once if no other borrowers are waiting.
                </Text>
              </div>
              <Button 
                type="primary" 
                className="request-borrow-btn"
                disabled={book.availableQuantity <= 0}
                onClick={() => setBorrowModalOpen(true)}
              >
                Request to Borrow
              </Button>
            </div>

            <BorrowModal
              open={borrowModalOpen}
              book={book}
              onClose={() => setBorrowModalOpen(false)}
              onSuccess={() => setBorrowModalOpen(false)}
            />

            {/* Description Section */}
            {book.description && (
              <div className="info-section">
                <Title level={4} className="section-title">Description</Title>
                <Text className="book-description">{book.description}</Text>
              </div>
            )}

            {/* Book Information Section */}
            <div className="info-section">
              <Title level={4} className="section-title">Book Information</Title>
              <Row gutter={[32, 24]}>
                <Col span={12}>
                  <div className="info-label">Category</div>
                  <div className="info-value">{book.categoryName}</div>
                </Col>
                <Col span={12}>
                  <div className="info-label">Author</div>
                  <div className="info-value">{book.authorName}</div>
                </Col>
                <Col span={12}>
                  <div className="info-label">Stock Status</div>
                  <div className="info-value">{book.availableQuantity} Available / {book.quantity} Total</div>
                </Col>
                <Col span={12}>
                  <div className="info-label">Added Date</div>
                  <div className="info-value">{new Date(book.createdAt).toLocaleDateString()}</div>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default BookDetails;
