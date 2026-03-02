import React, { useState } from 'react';
import { Modal, Button, Typography, Row, Col, Progress, message, Calendar, Tag } from 'antd';
import { CheckCircleFilled, CalendarOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import './BorrowModal.css';

const { Title, Text } = Typography;

const DEFAULT_LOAN_DAYS = 7;

const BorrowModal = ({ open, book, onClose, onSuccess }) => {
  const today = dayjs();
  const defaultDue = today.add(DEFAULT_LOAN_DAYS, 'day');
  const [dueDate, setDueDate] = useState(defaultDue);
  const [loading, setLoading] = useState(false);

  if (!book) return null;

  const handleDateSelect = (date) => {
    if (date.isAfter(today)) {
      setDueDate(date);
    }
  };

  const disabledDate = (current) => current && current <= today.startOf('day');

  const handleConfirm = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5237/api/Borrow',
        { bookId: book.id, dueDate: dueDate.toISOString() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success('Borrow request submitted successfully!');
      onSuccess?.();
      onClose();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to submit borrow request.';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={720}
      className="borrow-modal"
      title={
        <div className="borrow-modal-header">
          <Title level={4} className="borrow-modal-title">Borrow Book</Title>
          <Text className="borrow-modal-subtitle">Confirm your request details below.</Text>
        </div>
      }
    >
      {/* Book Selection Banner */}
      <div className="borrow-book-banner">
        <img
          src={book.imageUrl || 'https://via.placeholder.com/64x90?text=No+Cover'}
          alt={book.title}
          className="borrow-book-thumb"
        />
        <div className="borrow-book-info">
          <Text className="borrow-book-selection-label">BOOK SELECTION</Text>
          <div className="borrow-book-title">{book.title}</div>
          <div className="borrow-book-author">{book.authorName}</div>
          <div className="borrow-book-meta">
            <Tag color="blue">{book.categoryName}</Tag>
            <Text className="borrow-copies-text">
              {book.availableQuantity} of {book.quantity} copies available
            </Text>
          </div>
        </div>
      </div>

      <Row gutter={24} className="borrow-modal-body">
        {/* Calendar */}
        <Col span={13}>
          <Text strong className="borrow-section-label">Select Return Date</Text>
          <div className="borrow-calendar-wrapper">
            <Calendar
              fullscreen={false}
              value={dueDate}
              onSelect={handleDateSelect}
              disabledDate={disabledDate}
              headerRender={({ value, onChange }) => {
                const monthStr = value.format('MMMM YYYY');
                return (
                  <div className="borrow-calendar-nav">
                    <button className="cal-nav-btn" onClick={() => onChange(value.subtract(1, 'month'))}>‹</button>
                    <span className="cal-month-label">{monthStr}</span>
                    <button className="cal-nav-btn" onClick={() => onChange(value.add(1, 'month'))}>›</button>
                  </div>
                );
              }}
              dateFullCellRender={(date) => {
                const isToday = date.isSame(today, 'day');
                const isDue = date.isSame(dueDate, 'day');
                const isDisabled = date <= today.startOf('day');
                return (
                  <div
                    className={`cal-cell ${isToday ? 'cal-today' : ''} ${isDue ? 'cal-due' : ''} ${isDisabled ? 'cal-disabled' : ''}`}
                    onClick={() => !isDisabled && handleDateSelect(date)}
                  >
                    {date.date()}
                  </div>
                );
              }}
            />
            <div className="borrow-cal-legend">
              <span className="legend-dot today-dot" /> Today
              <span className="legend-dot due-dot" /> Due Date
            </div>
          </div>
        </Col>

        {/* Right Panel */}
        <Col span={11}>
          <div className="borrow-right-panel">
            {/* Request Date */}
            <div className="borrow-date-field">
              <Text className="borrow-date-label">Request Date</Text>
              <div className="borrow-date-value">
                <CalendarOutlined className="date-icon" />
                {today.format('MMM DD, YYYY')}
              </div>
            </div>

            {/* Due Date */}
            <div className="borrow-date-field highlighted">
              <Text className="borrow-date-label">Due Date</Text>
              <div className="borrow-date-value due">
                <CalendarOutlined className="date-icon" />
                {dueDate.format('MMM DD, YYYY')}
              </div>
            </div>

            {/* Limit Summary */}
            <div className="borrow-limit-card">
              <div className="limit-header">
                <Text className="limit-title">LIMIT SUMMARY</Text>
                <Text className="limit-count">
                  {book.quantity - book.availableQuantity} / 5 Books
                </Text>
              </div>
              <Progress
                percent={((book.quantity - book.availableQuantity) / 5) * 100}
                showInfo={false}
                strokeColor="#2563eb"
                trailColor="#e2e8f0"
                size={['100%', 6]}
              />
              <Text className="limit-desc">
                Borrowers are limited to 5 active books. Return books on time to maintain your limit.
              </Text>
            </div>
          </div>
        </Col>
      </Row>

      {/* Footer */}
      <div className="borrow-modal-footer">
        <Button className="borrow-cancel-btn" onClick={onClose} size="large">
          Cancel
        </Button>
        <Button
          type="primary"
          icon={<CheckCircleFilled />}
          onClick={handleConfirm}
          loading={loading}
          size="large"
          className="borrow-confirm-btn"
        >
          Confirm Request
        </Button>
      </div>
    </Modal>
  );
};

export default BorrowModal;
