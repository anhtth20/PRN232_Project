import React from 'react';
import { Layout, Menu, Typography, Avatar, Flex, Divider, ConfigProvider, Dropdown } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppstoreFilled,
  BookFilled,
  TagsFilled,
  IdcardFilled,
  SwapOutlined,
  DollarCircleFilled,
  SettingFilled,
  LogoutOutlined
} from '@ant-design/icons';

const { Sider, Content, Header } = Layout;
const { Text } = Typography;

const LibrarianLayout = ({ children, user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.includes('/librarian/books')) return 'books';
    if (path.includes('/librarian/authors')) return 'authors';
    if (path.includes('/librarian/borrowers')) return 'borrowers';
    if (path.includes('/librarian/fines')) return 'fines';
    if (path.includes('/librarian/categories')) return 'categories';
    if (path === '/librarian') return 'dashboard';
    return '';
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <AppstoreFilled />,
      label: 'Dashboard',
    },
    {
      key: 'books',
      icon: <BookFilled />,
      label: 'Manage Books',
    },
    {
      key: 'categories',
      icon: <TagsFilled />,
      label: 'Manage Categories',
    },
    {
      key: 'authors',
      icon: <IdcardFilled />,
      label: 'Manage Authors',
    },
    {
      key: 'borrowers',
      icon: <SwapOutlined />,
      label: 'Borrow/Return',
    },
    {
      key: 'fines',
      icon: <DollarCircleFilled />,
      label: 'Fine Management',
    },
  ];

  const handleMenuClick = ({ key }) => {
    if (key === 'dashboard') {
      navigate('/librarian');
    } else {
      navigate(`/librarian/${key}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const userMenu = {
    items: [
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: 'Logout',
        danger: true,
        onClick: handleLogout,
      },
    ],
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            itemSelectedBg: '#1b80f8', // Vibrant blue from image
            itemSelectedColor: '#ffffff',
            itemHoverBg: '#f1f5f9',
            itemHoverColor: '#0f172a',
            itemColor: '#475569',
            iconSize: 18,
            itemHeight: 44,
            itemBorderRadius: 8,
            itemMarginInline: 16,
          },
        },
      }}
    >
      <Layout style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <Sider
          width={240}
          theme="light"
          style={{
            borderRight: '1px solid #e2e8f0',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            background: '#ffffff'
          }}
        >
          <Flex vertical style={{ height: '100%' }}>
            {/* Logo Area */}
            <Flex align="center" gap={12} style={{ padding: '24px 20px', marginBottom: 8 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  backgroundColor: '#1b80f8',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18
                }}
              >
                <BookFilled />
              </div>
              <Flex vertical>
                <Text strong style={{ fontSize: 16, color: '#0f172a', lineHeight: 1.2, letterSpacing: '-0.02em', fontWeight: 800 }}>
                  LibriFlow
                </Text>
                <Text type="secondary" style={{ fontSize: 11, fontWeight: 600 }}>
                  Library Admin v2.4
                </Text>
              </Flex>
            </Flex>

            {/* Navigation Menu */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <Menu
                mode="inline"
                selectedKeys={[getSelectedKey()]}
                items={menuItems}
                onClick={handleMenuClick}
                style={{ borderRight: 'none', fontWeight: 600 }}
              />
            </div>

            {/* User Profile */}
            <div style={{ borderTop: '1px solid #e2e8f0', padding: '16px' }}>
              <Dropdown menu={userMenu} placement="topRight" trigger={['click']}>
                <Flex 
                  align="center" 
                  justify="space-between" 
                  style={{ 
                    padding: '12px', 
                    backgroundColor: '#f8fafc', 
                    borderRadius: 12, 
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer' 
                  }} 
                >
                  <Flex align="center" gap={12}>
                    <Avatar 
                      size={36}
                      src={user?.avatar}
                      style={{ backgroundColor: '#fed7aa', color: '#c2410c', fontWeight: 700 }} 
                    >
                      {user?.username?.charAt(0).toUpperCase() || 'A'}
                    </Avatar>
                    <Flex vertical>
                      <Text strong style={{ fontSize: 13, color: '#0f172a', lineHeight: 1.2 }}>
                        {user?.username || 'Alex Johnson'}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {user?.role || 'Senior Librarian'}
                      </Text>
                    </Flex>
                  </Flex>
                  <SettingFilled style={{ color: '#94a3b8', fontSize: 16 }} />
                </Flex>
              </Dropdown>
            </div>
          </Flex>
        </Sider>

        {/* Main Content Area */}
        <Layout style={{ marginLeft: 240, background: '#f8fafc' }}>
          <Header 
            style={{ 
              background: '#ffffff', 
              padding: '0 32px', 
              height: '64px', 
              borderBottom: '1px solid #e2e8f0', 
              display: 'flex', 
              alignItems: 'center',
              position: 'sticky',
              top: 0,
              zIndex: 10,
              width: '100%'
            }}
          />
          <Content style={{ padding: '32px', minHeight: 'calc(100vh - 64px)' }}>
            {children}
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default LibrarianLayout;

