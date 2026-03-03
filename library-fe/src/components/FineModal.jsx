import React, { useEffect } from 'react';
import { Modal, Button, Typography, Flex, Card, App } from 'antd';
import {
  WarningFilled,
  CalendarOutlined,
  DollarOutlined,
  IdcardOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

const FineModal = ({ open, onClose, borrowStatus }) => {
  const { notification } = App.useApp();

  useEffect(() => {
    if (open && borrowStatus?.fineAmount != null) {
      notification.warning({
        message: 'Overdue Fine',
        description: `You have an outstanding fine of ${Number(borrowStatus.fineAmount).toLocaleString('vi-VN')} VND for this book. Please settle it as soon as possible.`,
        duration: 6,
        placement: 'topRight',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!borrowStatus) return null;

  const formatted = (amount) =>
    `${Number(amount).toLocaleString('vi-VN')} VND`;

  const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <Modal
      open={open}
      onCancel={onClose}
      centered
      width={460}
      title={
        <Flex align="center" gap={10}>
          <WarningFilled style={{ color: '#ef4444', fontSize: 22 }} />
          <div>
            <Title level={4} style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
              Overdue Fine
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>Please review your outstanding fine below.</Text>
          </div>
        </Flex>
      }
      footer={[
        <Button key="close" size="large" onClick={onClose} style={{ minWidth: 120 }}>
          Close
        </Button>,
      ]}
    >
      {/* Alert banner */}
      <div
        style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 12,
          padding: '14px 18px',
          marginBottom: 20,
          marginTop: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <WarningFilled style={{ color: '#ef4444', fontSize: 18, flexShrink: 0 }} />
        <Text style={{ color: '#b91c1c', fontWeight: 600, fontSize: 14 }}>
          This book is overdue. A fine has been applied to your account.
        </Text>
      </div>

      {/* Detail cards */}
      <Flex vertical gap={12}>
        <Card
          size="small"
          style={{ borderRadius: 12, background: '#fff7ed', border: '1px solid #fed7aa' }}
          styles={{ body: { padding: '14px 18px' } }}
        >
          <Flex align="center" gap={10}>
            <DollarOutlined style={{ color: '#f97316', fontSize: 20 }} />
            <div>
              <Text type="secondary" style={{ fontSize: 12, fontWeight: 600, display: 'block' }}>
                Fine Amount
              </Text>
              <Text style={{ fontSize: 22, fontWeight: 800, color: '#c2410c' }}>
                {borrowStatus.fineAmount != null ? formatted(borrowStatus.fineAmount) : 'Not yet calculated'}
              </Text>
            </div>
          </Flex>
        </Card>

        <Card
          size="small"
          style={{ borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}
          styles={{ body: { padding: '14px 18px' } }}
        >
          <Flex align="center" gap={10}>
            <CalendarOutlined style={{ color: '#64748b', fontSize: 18 }} />
            <div>
              <Text type="secondary" style={{ fontSize: 12, fontWeight: 600, display: 'block' }}>
                Original Due Date
              </Text>
              <Text style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>
                {formatDate(borrowStatus.dueDate)}
              </Text>
            </div>
          </Flex>
        </Card>

        {borrowStatus.borrowId && (
          <Card
            size="small"
            style={{ borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}
            styles={{ body: { padding: '14px 18px' } }}
          >
            <Flex align="center" gap={10}>
              <IdcardOutlined style={{ color: '#64748b', fontSize: 18 }} />
              <div>
                <Text type="secondary" style={{ fontSize: 12, fontWeight: 600, display: 'block' }}>
                  Borrow Reference
                </Text>
                <Text style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>
                  BRW-{borrowStatus.borrowId}
                </Text>
              </div>
            </Flex>
          </Card>
        )}
      </Flex>

      <Text type="secondary" style={{ display: 'block', marginTop: 18, fontSize: 12, lineHeight: 1.6 }}>
        Please contact the librarian to settle your fine. Fine rate: <strong>5,000 VND / day late</strong>.
      </Text>
    </Modal>
  );
};

export default FineModal;
