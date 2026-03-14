import React, { useState, useEffect, useCallback } from 'react';
import {
  Button, Row, Col, Typography, Space, Divider, Breadcrumb,
  Tag, Skeleton, Result, Descriptions, Card, Flex, App,
} from 'antd';
import BorrowModal from '../components/BorrowModal';
import FineModal from '../components/FineModal';
import {
  ArrowLeftOutlined,
  AppstoreOutlined,
  ContainerOutlined,
  CheckCircleFilled,
  ExclamationCircleFilled,
  ClockCircleOutlined,
  ReloadOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

const API_BASE = 'http://localhost:5237';
const resolveImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
};

const BookDetails = ({ bookId, onBack }) => {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [borrowStatus, setBorrowStatus] = useState(null); // null = not loaded yet
  const [borrowStatusLoading, setBorrowStatusLoading] = useState(false);
  const [borrowModalOpen, setBorrowModalOpen] = useState(false);
  const [fineModalOpen, setFineModalOpen] = useState(false);
  const { message, notification } = App.useApp();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [bookId]);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5237/api/Books/${bookId}`);
        setBook(response.data);
      } catch {
        message.error('Failed to load book details');
      } finally {
        setLoading(false);
      }
    };
    fetchBookDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId]);

  const fetchBorrowStatus = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      setBorrowStatusLoading(true);
      const res = await axios.get(
        `http://localhost:5237/api/Borrow/status/${bookId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setBorrowStatus(res.data);
    } catch {
      // User might not be logged in or endpoint failed – stay null
    } finally {
      setBorrowStatusLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    fetchBorrowStatus();
  }, [fetchBorrowStatus]);

  // Called after a successful borrow request to refresh status
  const handleBorrowSuccess = () => {
    setBorrowModalOpen(false);
    fetchBorrowStatus();
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 32px 64px' }}>
        <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
          <Skeleton.Input active size="small" style={{ width: 200 }} />
          <Skeleton.Button active size="small" />
        </Flex>
        <Row gutter={[64, 32]}>
          <Col xl={10} lg={10} md={24}>
            <Skeleton.Node active style={{ width: '100%', height: 500, borderRadius: 16 }} />
            <Skeleton.Button active block style={{ marginTop: 16, height: 48, borderRadius: 10 }} />
          </Col>
          <Col xl={14} lg={14} md={24}>
            <Skeleton active paragraph={{ rows: 2 }} title={{ width: '80%' }} />
            <Space style={{ marginBottom: 28, marginTop: 16 }}>
              <Skeleton.Button active size="small" style={{ width: 100 }} />
              <Skeleton.Button active size="small" style={{ width: 140 }} />
            </Space>
            <Card style={{ marginBottom: 28, borderRadius: 12 }}>
              <Skeleton active paragraph={{ rows: 1 }} title={{ width: '40%' }} />
            </Card>
            <Skeleton active paragraph={{ rows: 4 }} title />
            <Skeleton active paragraph={{ rows: 4 }} title style={{ marginTop: 24 }} />
          </Col>
        </Row>
      </div>
    );
  }

  if (!book) {
    return (
      <Result
        status="404"
        title="Book Not Found"
        subTitle="The book you are looking for does not exist or has been removed."
        extra={
          <Button icon={<ArrowLeftOutlined />} type="primary" onClick={onBack}>
            Back to Results
          </Button>
        }
      />
    );
  }

  const isAvailable = book.availableQuantity > 0 && !book.isDeleted;
  const status = borrowStatus?.status ?? null; // null | "Pending" | "Approved" | "Overdue" | "Returned" | "Rejected"

  /** Renders the appropriate CTA inside the borrow card */
  const renderBorrowCTA = () => {
    if (borrowStatusLoading) {
      return <Button type="primary" size="large" loading style={{ minWidth: 160, fontWeight: 600 }}>Loading…</Button>;
    }

    // If book is deleted/archived
    if (book.isDeleted) {
      return (
        <Button
          type="default"
          size="large"
          disabled
          icon={<ExclamationCircleFilled style={{ color: '#ef4444' }} />}
          style={{ fontWeight: 600, minWidth: 160, cursor: 'not-allowed' }}
        >
          Out of Stock
        </Button>
      );
    }

    // Overdue – user must pay fine first
    if (status === 'Overdue') {
      return (
        <Button
          type="primary"
          danger
          size="large"
          icon={<DollarOutlined />}
          onClick={() => setFineModalOpen(true)}
          style={{ fontWeight: 600, minWidth: 160 }}
        >
          Pay Fine
        </Button>
      );
    }

    // Pending – waiting for librarian approval
    if (status === 'Pending') {
      return (
        <Flex align="center" gap={10}>
          <Button
            type="default"
            size="large"
            disabled
            icon={<ClockCircleOutlined />}
            style={{ fontWeight: 600, minWidth: 160, cursor: 'not-allowed' }}
          >
            Pending Approval
          </Button>
          <Tag color="orange" style={{ fontSize: 13, padding: '4px 10px' }}>Awaiting librarian review</Tag>
        </Flex>
      );
    }

    // Approved (currently borrowed)
    if (status === 'Approved') {
      return (
        <Flex align="center" gap={10}>
          <Button
            type="default"
            size="large"
            disabled
            icon={<CheckCircleFilled style={{ color: '#22c55e' }} />}
            style={{ fontWeight: 600, minWidth: 160, cursor: 'not-allowed' }}
          >
            Currently Borrowed
          </Button>
          <Tag color="green" style={{ fontSize: 13, padding: '4px 10px' }}>Return by {borrowStatus?.dueDate ? new Date(borrowStatus.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</Tag>
        </Flex>
      );
    }

    // Previously returned or rejected – allow borrowing again if available
    if (status === 'Returned' || status === 'Rejected') {
      if (isAvailable) {
        return (
          <Button
            type="primary"
            size="large"
            icon={<ReloadOutlined />}
            onClick={() => setBorrowModalOpen(true)}
            style={{ fontWeight: 600, minWidth: 160 }}
          >
            Borrow Again
          </Button>
        );
      }
      // Book unavailable
      return (
        <Button
          type="default"
          size="large"
          disabled
          icon={<ExclamationCircleFilled style={{ color: '#f59e0b' }} />}
          style={{ fontWeight: 600, minWidth: 160, cursor: 'not-allowed' }}
          onClick={() =>
            notification.info({
              message: 'No Copies Available',
              description: 'All copies of this book are currently on loan. Check back later.',
              placement: 'topRight',
            })
          }
        >
          Unavailable
        </Button>
      );
    }

    // No borrow history (status === null)
    if (isAvailable) {
      return (
        <Button
          type="primary"
          size="large"
          onClick={() => setBorrowModalOpen(true)}
          style={{ fontWeight: 600, minWidth: 160 }}
        >
          Request to Borrow
        </Button>
      );
    }

    // No history + book unavailable
    return (
      <Button
        type="default"
        size="large"
        disabled
        icon={<ExclamationCircleFilled style={{ color: '#f59e0b' }} />}
        style={{ fontWeight: 600, minWidth: 160, cursor: 'not-allowed' }}
      >
        Not Available
      </Button>
    );
  };

  /** Subtitle text below the CTA card description */
  const renderCTASubtext = () => {
    if (book.isDeleted) 
      return "This book has been archived and is no longer available for borrowing.";
    if (status === 'Pending')
      return "Your borrow request is under review. You'll be notified once approved.";
    if (status === 'Approved')
      return 'You currently have this book. Please return it by the due date.';
    if (status === 'Overdue')
      return 'This book is overdue. Please pay your fine before borrowing again.';
    return 'Standard loan period is 14 days. You can renew once if no one is waiting.';
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 32px 64px' }}>
      {/* Breadcrumb + back */}
      <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
        <Breadcrumb
          items={[
            { title: <a onClick={onBack}>Home</a> },
            { title: 'Catalog' },
            { title: 'Book Details' },
          ]}
        />
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={onBack}>
          Back to Results
        </Button>
      </Flex>

      <Row gutter={[64, 32]}>
        {/* Left: Image + availability */}
        <Col xl={10} lg={10} md={24}>
          <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.14)' }}>
            <img
              src={resolveImageUrl(book.imageUrl) || 'https://placehold.co/400x600?text=No+Cover'}
              alt={book.title}
              style={{ width: '100%', display: 'block', objectFit: 'cover' }}
            />
          </div>
            <Flex
              align="center"
              justify="center"
              gap={8}
              style={{
                marginTop: 16,
                padding: '12px 20px',
                borderRadius: 10,
                background: book.isDeleted ? '#fef2f2' : (isAvailable ? '#f0fdf4' : '#fcfaff'),
                border: `1px solid ${book.isDeleted ? '#fecaca' : (isAvailable ? '#bbf7d0' : '#e2e8f0')}`,
                fontWeight: 700,
                fontSize: 15,
                color: book.isDeleted ? '#ef4444' : (isAvailable ? '#15803d' : '#64748b'),
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              {book.isDeleted || !isAvailable ? <ExclamationCircleFilled /> : <CheckCircleFilled />}
              {book.isDeleted ? 'Out of Stock' : (isAvailable ? 'Available Now' : 'Currently On Loan')}
            </Flex>
          <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 8, fontSize: 13 }}>
            Reference ID: LIB-{book.id}
          </Text>
        </Col>

        {/* Right: Info */}
        <Col xl={14} lg={14} md={24}>
          <Title level={1} style={{ fontSize: 34, fontWeight: 800, marginBottom: 4, lineHeight: 1.2 }}>
            {book.title}
          </Title>
          <Text style={{ fontSize: 18, color: '#475569', display: 'block', marginBottom: 20 }}>
            {book.authorName}
          </Text>

          {/* Meta badges */}
          <Space split={<Divider type="vertical" />} style={{ marginBottom: 28 }}>
            <Space size={6}>
              <AppstoreOutlined style={{ color: '#2563eb' }} />
              <Text>{book.categoryName}</Text>
            </Space>
            <Space size={6}>
              <ContainerOutlined style={{ color: '#2563eb' }} />
              <Text>{book.availableQuantity} of {book.quantity} copies</Text>
            </Space>
          </Space>

          {/* Borrow CTA card */}
          <Card
            style={{
              marginBottom: 28,
              borderRadius: 12,
              background: status === 'Overdue' ? '#fff5f5' : '#f8faff',
              border: `1px solid ${status === 'Overdue' ? '#fecaca' : '#e0eaff'}`,
            }}
          >
            <Flex justify="space-between" align="center" wrap="wrap" gap={16}>
              <div style={{ maxWidth: 280 }}>
                <Text strong style={{ fontSize: 15 }}>
                  {status === 'Overdue'
                    ? '⚠️ Outstanding Fine'
                    : status === 'Pending'
                    ? '📋 Request Submitted'
                    : status === 'Approved'
                    ? '📖 Currently Borrowed'
                    : 'Ready to read this book?'}
                </Text>
                <Text type="secondary" style={{ display: 'block', marginTop: 4, fontSize: 13 }}>
                  {renderCTASubtext()}
                </Text>
              </div>
              {renderBorrowCTA()}
            </Flex>
          </Card>

          {/* Description */}
          {book.description && (
            <div style={{ marginBottom: 28 }}>
              <Title level={4} style={{ marginBottom: 8 }}>Description</Title>
              <Typography.Paragraph
                style={{ whiteSpace: 'pre-wrap', color: '#475569', lineHeight: 1.8, fontSize: 15, marginBottom: 0 }}
              >
                {book.description}
              </Typography.Paragraph>
            </div>
          )}

          {/* Book information table */}
          <Title level={4} style={{ marginBottom: 12 }}>Book Information</Title>
          <Descriptions
            column={{ xs: 1, sm: 2 }}
            bordered={false}
            styles={{ label: { color: '#94a3b8', fontWeight: 600, fontSize: 13 }, content: { fontWeight: 600, color: '#1e293b' } }}
            items={[
              { key: 'category', label: 'Category', children: book.categoryName },
              { key: 'author', label: 'Author', children: book.authorName },
              { key: 'stock', label: 'Stock Status', children: `${book.availableQuantity} Available / ${book.quantity} Total` },
              { key: 'added', label: 'Added Date', children: new Date(book.createdAt).toLocaleDateString() },
            ]}
          />
        </Col>
      </Row>

      <BorrowModal
        open={borrowModalOpen}
        book={book}
        onClose={() => setBorrowModalOpen(false)}
        onSuccess={handleBorrowSuccess}
      />

      <FineModal
        open={fineModalOpen}
        borrowStatus={borrowStatus}
        onClose={() => setFineModalOpen(false)}
      />
    </div>
  );
};

export default BookDetails;
