import React from 'react';
import { Layout, Input, Button, Space, Avatar, Typography } from 'antd';
import { 
  BookFilled, 
  SearchOutlined, 
  UserOutlined, 
  LogoutOutlined 
} from '@ant-design/icons';
import './MainLayout.css';

const { Header, Content, Footer } = Layout;
const { Text } = Typography;

const MainLayout = ({ children, user, onLogout, onSearch, currentView }) => {
  return (
    <Layout className="lumina-layout">
      <Header className="lumina-header">
        <div className="header-left">
          <div className="lumina-logo">
            <BookFilled className="logo-icon" />
            <span className="logo-text">Lumina Library</span>
          </div>
          <div className="header-search">
            <Input 
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />} 
              placeholder="Search titles, authors..." 
              className="search-input"
              onChange={(e) => onSearch && onSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="header-right">
          <Space size={32}>
            <Text className={`nav-link ${currentView === 'dashboard' ? 'active' : ''}`}>Dashboard</Text>
            <Text className={`nav-link ${currentView === 'booklist' ? 'active' : ''}`}>Browse Books</Text>
            <Text className={`nav-link ${currentView === 'requests' ? 'active' : ''}`}>My Requests</Text>
            <Avatar 
              className="user-avatar"
              icon={<UserOutlined />}
              style={{ backgroundColor: '#fef3c7', color: '#d97706', cursor: 'pointer' }}
            >
              {user?.username?.charAt(0).toUpperCase()}
            </Avatar>
            <Button type="text" icon={<LogoutOutlined />} onClick={onLogout} style={{ color: '#64748b' }} />
          </Space>
        </div>
      </Header>

      <Content className="lumina-content-wrapper">
        {children}
      </Content>

      <Footer className="lumina-footer">
        <div className="footer-content">
          <div className="footer-left">
            <BookFilled style={{ color: '#1d4ed8', marginRight: '8px' }} />
            <Text type="secondary">Lumina Library Management System</Text>
          </div>
          <div className="footer-right">
            <Space size="large">
              <Text type="secondary" className="footer-link">Help Center</Text>
              <Text type="secondary" className="footer-link">Privacy Policy</Text>
              <Text type="secondary" className="footer-link">Terms of Service</Text>
            </Space>
          </div>
        </div>
      </Footer>
    </Layout>
  );
};

export default MainLayout;
