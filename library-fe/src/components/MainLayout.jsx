import React from 'react';
import { Layout, Input, Button, Space, Avatar, Typography, Flex } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BookFilled,
  SearchOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';

const { Header, Content, Footer } = Layout;
const { Text } = Typography;

const MainLayout = ({ children, user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <Layout style={{ minHeight: '100vh', background: '#ffffff' }}>
      <Header
        style={{
          background: '#ffffff',
          height: 80,
          lineHeight: '80px',
          padding: '0 50px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #f1f5f9',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        {/* Left: Logo + Search */}
        <Flex align="center" gap={48} style={{ flex: 1 }}>
          <Flex align="center" gap={10} onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <BookFilled style={{ fontSize: 30, color: '#2563eb' }} />
            <Text strong style={{ fontSize: 20, color: '#1e293b', letterSpacing: '-0.02em' }}>
              HaAnh's Library
            </Text>
          </Flex>

        </Flex>

        {/* Right: Nav + User */}
        <Space size={28}>
          <Text
            onClick={() => navigate('/books')}
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: isActive('/books') ? '#2563eb' : '#64748b',
              cursor: 'pointer',
            }}
          >
            Browse Books
          </Text>

          <Text
            onClick={() => navigate('/my-borrowed')}
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: isActive('/my-borrowed') ? '#2563eb' : '#64748b',
              cursor: 'pointer',
            }}
          >
            My Borrowed
          </Text>

          <Text
            onClick={() => navigate('/my-fines')}
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: isActive('/my-fines') ? '#2563eb' : '#64748b',
              cursor: 'pointer',
            }}
          >
            Fines
          </Text>

          <Text
            onClick={() => navigate('/profile')}
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: isActive('/profile') ? '#2563eb' : '#64748b',
              cursor: 'pointer',
            }}
          >
            <Avatar
            icon={<UserOutlined />}
            style={{ backgroundColor: '#fef3c7', color: '#d97706', cursor: 'pointer' }}
            onClick={() => navigate('/profile')}
          >
            {user?.username?.charAt(0).toUpperCase()}
          </Avatar>
          </Text>

          

          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={onLogout}
            style={{ color: '#64748b' }}
          />
        </Space>
      </Header>

      <Content style={{ background: '#ffffff' }}>{children}</Content>

      <Footer style={{ background: '#f8fafc', padding: '32px 50px', borderTop: '1px solid #e2e8f0' }}>
        <Flex justify="space-between" align="center">
          <Flex align="center" gap={8}>
            <BookFilled style={{ color: '#2563eb' }} />
            <Text type="secondary">HaAnh's Library Management System</Text>
          </Flex>
          <Space size="large">
            <Text type="secondary" style={{ cursor: 'pointer' }}>Help Center</Text>
            <Text type="secondary" style={{ cursor: 'pointer' }}>Privacy Policy</Text>
            <Text type="secondary" style={{ cursor: 'pointer' }}>Terms of Service</Text>
          </Space>
        </Flex>
      </Footer>
    </Layout>
  );
};

export default MainLayout;
