import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Card, Typography, Flex, Layout, message } from 'antd';
import { UserOutlined, LockOutlined, BookFilled, ProfileFilled } from '@ant-design/icons';
import axios from 'axios';
import './Login.css';

const { Title, Text, Link } = Typography;
const { Header, Content, Footer } = Layout;

const Login = ({ onNavigateToSignup, onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5237/api/Auth/login', {
        username: values.username,
        password: values.password
      });
      
      const { token } = response.data;
      localStorage.setItem('token', token);
      message.success('Login successful!');
      if (onLoginSuccess) {
        onLoginSuccess(token);
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Invalid username or password';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="login-container" style={{ minHeight: '100vh', width: '100%' }}>
      <Header style={{ background: 'transparent', padding: '0 50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '80px' }}>
        <Flex align="center" gap={10}>
          <BookFilled style={{ fontSize: '28px', color: '#1890ff' }} />
          <Title level={4} style={{ margin: 0 }}>LibroSync</Title>
        </Flex>
        <Flex gap={30}>
          <Link href="#" style={{ color: '#595959' }}>Home</Link>
          <Link href="#" style={{ color: '#595959' }}>About</Link>
          <Link href="#" style={{ color: '#595959' }}>Help</Link>
        </Flex>
      </Header>

      <Content style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', position: 'relative', overflow: 'hidden' }}>
        <Card 
          style={{ width: '100%', maxWidth: '400px', borderRadius: '12px', overflow: 'hidden', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}
          styles={{ body: { padding: 0 } }}
        >
          <div className="login-card-header">
            <div className="bookmark-icon">
              <ProfileFilled />
            </div>
            <ProfileFilled style={{ color: '#1890ff', fontSize: '48px', marginBottom: '12px' }} />
            <Title level={3} style={{ margin: '0 0 4px 0' }}>Welcome Back</Title>
            <Text type="secondary">Access your personal library collection</Text>
          </div>
          
          <div style={{ padding: '30px 40px', background: '#fff' }}>
            <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
              <Form.Item
                label="Username"
                name="username"
                rules={[{ required: true, message: 'Please input your username!' }]}
              >
                <Input prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} placeholder="Enter your username" size="large" />
              </Form.Item>

              <Form.Item
                label={
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <span>Password</span>
                    <Link href="#" style={{ fontSize: '12px', fontWeight: 'normal' }}>Forgot password?</Link>
                  </div>
                }
                name="password"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Input.Password prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} placeholder="........" size="large" />
              </Form.Item>

              <Form.Item name="remember" valuePropName="checked">
                <Checkbox>Remember me</Checkbox>
              </Form.Item>

              <Form.Item style={{ marginBottom: 12 }}>
                <Button type="primary" htmlType="submit" size="large" block style={{ height: '45px', fontWeight: 'bold' }} loading={loading}>
                  Sign In
                </Button>
              </Form.Item>

              <Text type="secondary" style={{ display: 'block', textAlign: 'center' }}>
                Don't have an account yet? <Link onClick={onNavigateToSignup}>Create an account</Link>
              </Text>
            </Form>
          </div>
        </Card>

        <div className="background-decoration">
          <BookFilled style={{ color: '#e6f7ff' }} />
        </div>
      </Content>

      <Footer style={{ background: 'transparent', textAlign: 'center', padding: '24px' }}>
        <Flex justify="center" gap={24}>
          <Link href="#" style={{ color: '#8c8c8c', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Privacy</Link>
          <Link href="#" style={{ color: '#8c8c8c', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Terms</Link>
          <Link href="#" style={{ color: '#8c8c8c', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Contact</Link>
        </Flex>
      </Footer>
    </Layout>
  );
};

export default Login;
