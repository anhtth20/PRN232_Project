import React, { useState } from 'react';
import { Modal, Button, Typography, Row, Col, Progress, App, Calendar, Tag, Flex, Card } from 'antd';
import { CheckCircleFilled, CalendarOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const DEFAULT_LOAN_DAYS = 7;
const MAX_LOAN_DAYS = 10;

const BorrowModal = ({ open, book, onClose, onSuccess }) => {
  const today = dayjs();
  const defaultDue = today.add(DEFAULT_LOAN_DAYS, 'day');
  const [dueDate, setDueDate] = useState(defaultDue);
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();

  if (!book) return null;

  const maxDue = today.add(MAX_LOAN_DAYS, 'day');

  const handleDateSelect = (date) => {
    if (date.isAfter(today) && !date.isAfter(maxDue)) setDueDate(date);
  };

  const disabledDate = (current) =>
    current && (current <= today.startOf('day') || current > maxDue.endOf('day'));

  const handleConfirm = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5237/api/Borrow',
        { bookId: book.id, dueDate: dueDate.toISOString() },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      message.success('Borrow request submitted successfully!');
      onSuccess?.();
      onClose();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to submit borrow request.');
    } finally {
      setLoading(false);
    }
  };

  // const borrowed = book.quantity - book.availableQuantity;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      centered
      width={720}
      title={
        <div>
          <Title level={4} style={{ margin: '0 0 2px', fontSize: 22, fontWeight: 800, color: '#0f172a' }}>
            Borrow Book
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>Confirm your request details below.</Text>
        </div>
      }
      footer={[
        <Button key="cancel" size="large" onClick={onClose} style={{ minWidth: 110 }}>
          Cancel
        </Button>,
        <Button
          key="confirm"
          type="primary"
          size="large"
          icon={<CheckCircleFilled />}
          loading={loading}
          onClick={handleConfirm}
          style={{ minWidth: 160, fontWeight: 700 }}
        >
          Confirm Request
        </Button>,
      ]}
    >
      {/* Book banner */}
      <Flex
        align="center"
        gap={20}
        style={{
          background: '#f8faff',
          border: '1px solid #e0eaff',
          borderRadius: 14,
          padding: '16px 20px',
          margin: '16px 0',
        }}
      >
        <img
          src={book.imageUrl || 'https://via.placeholder.com/64x90?text=No+Cover'}
          alt={book.title}
          style={{ width: 64, height: 90, objectFit: 'cover', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.12)', flexShrink: 0 }}
        />
        <div>
          <Text
            style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', color: '#2563eb', textTransform: 'uppercase', display: 'block' }}
          >
            Book Selection
          </Text>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', lineHeight: 1.2, margin: '3px 0' }}>
            {book.title}
          </div>
          <Text style={{ fontSize: 14, color: '#475569', fontWeight: 500 }}>{book.authorName}</Text>
          <Flex align="center" gap={10} style={{ marginTop: 6 }}>
            <Tag color="blue">{book.categoryName}</Tag>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {book.availableQuantity} of {book.quantity} copies available
            </Text>
          </Flex>
        </div>
      </Flex>

      <Row gutter={24} style={{ marginTop: 8 }}>
        {/* Calendar column */}
        <Col span={13}>
          <Text strong style={{ display: 'block', marginBottom: 12, color: '#1e293b' }}>
            Select Return Date
          </Text>
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 14,
              overflow: 'hidden',
              padding: '8px 4px 12px',
            }}
          >
            <Calendar
              fullscreen={false}
              value={dueDate}
              onSelect={handleDateSelect}
              disabledDate={disabledDate}
              headerRender={({ value, onChange }) => (
                <Flex align="center" justify="space-between" style={{ padding: '4px 12px 8px' }}>
                  <button
                    onClick={() => onChange(value.subtract(1, 'month'))}
                    style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 8, width: 28, height: 28, cursor: 'pointer', fontSize: 16, color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    ‹
                  </button>
                  <Text strong style={{ fontSize: 15, color: '#0f172a' }}>{value.format('MMMM YYYY')}</Text>
                  <button
                    onClick={() => onChange(value.add(1, 'month'))}
                    style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 8, width: 28, height: 28, cursor: 'pointer', fontSize: 16, color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    ›
                  </button>
                </Flex>
              )}
              dateFullCellRender={(date) => {
                const isToday = date.isSame(today, 'day');
                const isDue = date.isSame(dueDate, 'day');
                const isDisabled = date <= today.startOf('day');
                return (
                  <div
                    onClick={() => !isDisabled && handleDateSelect(date)}
                    style={{
                      width: 32,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      margin: '0 auto',
                      fontSize: 13,
                      fontWeight: isDue || isToday ? 700 : 500,
                      cursor: isDisabled ? 'default' : 'pointer',
                      background: isDue ? '#2563eb' : 'transparent',
                      color: isDue ? '#fff' : isDisabled ? '#cbd5e1' : isToday ? '#2563eb' : '#334155',
                      transition: 'background 0.15s',
                    }}
                  >
                    {date.date()}
                  </div>
                );
              }}
            />
            {/* Legend */}
            <Flex gap={16} style={{ padding: '8px 16px 0', fontSize: 12, color: '#64748b', fontWeight: 500 }}>
              <Flex align="center" gap={4}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#2563eb', display: 'inline-block' }} />
                Today
              </Flex>
              <Flex align="center" gap={4}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#93c5fd', display: 'inline-block' }} />
                Due Date
              </Flex>
            </Flex>
          </div>
        </Col>

        {/* Right panel */}
        <Col span={11}>
          <Flex vertical gap={14} style={{ paddingTop: 32 }}>
            {/* Request Date */}
            <Card
              size="small"
              style={{ borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}
              styles={{ body: { padding: '12px 16px' } }}
            >
              <Text type="secondary" style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                Request Date
              </Text>
              <Flex align="center" gap={8} style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>
                <CalendarOutlined style={{ color: '#94a3b8' }} />
                {today.format('MMM DD, YYYY')}
              </Flex>
            </Card>

            {/* Due Date */}
            <Card
              size="small"
              style={{ borderRadius: 12, background: '#eff6ff', border: '1px solid #bfdbfe' }}
              styles={{ body: { padding: '12px 16px' } }}
            >
              <Text type="secondary" style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                Due Date
              </Text>
              <Flex align="center" gap={8} style={{ fontSize: 15, fontWeight: 700, color: '#1d4ed8' }}>
                <CalendarOutlined style={{ color: '#94a3b8' }} />
                {dueDate.format('MMM DD, YYYY')}
              </Flex>
            </Card>

            {/* Limit Card */}
            {/* <Card
              size="small"
              style={{ borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}
              styles={{ body: { padding: '12px 16px' } }}
            >
              <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', color: '#64748b', textTransform: 'uppercase' }}>
                  Limit Summary
                </Text>
                <Text style={{ fontSize: 13, fontWeight: 800, color: '#2563eb' }}>
                  {borrowed} / 5 Books
                </Text>
              </Flex>
              <Progress
                percent={(borrowed / 5) * 100}
                showInfo={false}
                strokeColor="#2563eb"
                trailColor="#e2e8f0"
                size={['100%', 6]}
              />
              <Text type="secondary" style={{ fontSize: 12, marginTop: 8, display: 'block', lineHeight: 1.5, fontStyle: 'italic' }}>
                Borrowers are limited to 5 active books. Return books on time to maintain your limit.
              </Text>
            </Card> */}
          </Flex>
        </Col>
      </Row>
    </Modal>
  );
};

export default BorrowModal;
