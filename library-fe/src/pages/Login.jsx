import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Card, Typography, Flex, Layout } from 'antd';
import { useNavigate } from 'react-router-dom';
import { UserOutlined, LockOutlined, BookFilled, ProfileFilled } from '@ant-design/icons';
import { App } from 'antd';
import axios from 'axios';

const { Title, Text, Link } = Typography;
const { Header, Content, Footer } = Layout;

const Login = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();

  const onFinish = async (values) => {
    setLoading(true);
    console.log('Attempting login with:', { username: values.username });
    try {
      const response = await axios.post('http://localhost:5237/api/Auth/login', {
        username: values.username,
        password: values.password,
      });
      const { token } = response.data;
      localStorage.setItem('token', token);
      message.success('Login successful!');
      onLoginSuccess?.(token);
    } catch (error) {
      console.error('Login error full details:', error);
      
      let errorMsg = 'Invalid username or password';
      if (error.code === 'ERR_NETWORK') {
        errorMsg = 'Network Error: Cannot connect to the server. Please check if the API is running.';
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f5ff' }}>
      {/* Navbar */}
      <Header
        style={{
          background: 'transparent',
          padding: '0 50px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: 80,
        }}
      >
        <Flex align="center" gap={10}>
          <BookFilled style={{ fontSize: 28, color: '#2563eb' }} />
          <Title level={4} style={{ margin: 0 }}>LibroSync</Title>
        </Flex>
        <Flex gap={30}>
          <Link href="#" style={{ color: '#595959' }}>Home</Link>
          <Link href="#" style={{ color: '#595959' }}>About</Link>
          <Link href="#" style={{ color: '#595959' }}>Help</Link>
        </Flex>
      </Header>

      {/* Centered card */}
      <Content
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        }}
      >
        <Card
          style={{ width: '100%', maxWidth: 420, borderRadius: 16, overflow: 'hidden', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.10)' }}
          styles={{ body: { padding: 0 } }}
        >
          {/* Gradient header band */}
          <div
            style={{
              background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)',
              padding: '32px 40px 28px',
              textAlign: 'center',
            }}
          >
            <ProfileFilled style={{ color: '#fff', fontSize: 48, marginBottom: 12 }} />
            <Title level={3} style={{ margin: '0 0 4px', color: '#fff' }}>Welcome Back</Title>
            <Text style={{ color: '#bfdbfe' }}>Access your personal library collection</Text>
          </div>

          {/* Form body */}
          <div style={{ padding: '30px 40px', background: '#fff' }}>
            <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
              <Form.Item
                label="Username"
                name="username"
                rules={[{ required: true, message: 'Please input your username!' }]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                  placeholder="Enter your username"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label={
                  <Flex justify="space-between" style={{ width: '100%' }}>
                    <span>Password</span>
                    <Link href="#" style={{ fontSize: 12, fontWeight: 'normal' }}>Forgot password?</Link>
                  </Flex>
                }
                name="password"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                  placeholder="········"
                  size="large"
                />
              </Form.Item>

              <Form.Item name="remember" valuePropName="checked">
                <Checkbox>Remember me</Checkbox>
              </Form.Item>

              <Form.Item style={{ marginBottom: 12 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  style={{ height: 45, fontWeight: 'bold' }}
                  loading={loading}
                >
                  Sign In
                </Button>
              </Form.Item>

              <Text type="secondary" style={{ display: 'block', textAlign: 'center' }}>
                Don't have an account yet?{' '}
                <Link onClick={() => navigate('/signup')}>Create an account</Link>
              </Text>
            </Form>
          </div>
        </Card>
      </Content>

      <Footer style={{ background: 'transparent', textAlign: 'center', padding: 24 }}>
        <Flex justify="center" gap={24}>
          {['Privacy', 'Terms', 'Contact'].map((label) => (
            <Link
              key={label}
              href="#"
              style={{ color: '#8c8c8c', fontSize: 12, textTransform: 'uppercase', letterSpacing: '1px' }}
            >
              {label}
            </Link>
          ))}
        </Flex>
      </Footer>
    </Layout>
  );
};

export default Login;
