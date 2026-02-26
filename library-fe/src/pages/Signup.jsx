import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Flex, Layout, ConfigProvider, Select, message } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, BookFilled, SolutionOutlined } from '@ant-design/icons';
import axios from 'axios';
import './Signup.css';

const { Title, Text, Link } = Typography;
const { Header, Content } = Layout;
const { Option } = Select;

const Signup = ({ onNavigateToLogin }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await axios.post('http://localhost:5237/api/Auth/register', {
        username: values.username,
        password: values.password,
        fullName: values.fullName,
        email: values.email,
        role: values.role
      });
      
      message.success('Registration successful! Please login.');
      onNavigateToLogin();
    } catch (error) {
      console.error('Signup error:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed. Username might already exist.';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 8,
        },
      }}
    >
      <Layout className="signup-container">
        <Header className="signup-header">
          <Flex align="center" gap={10}>
            <BookFilled style={{ fontSize: '28px', color: '#1890ff' }} />
            <Title level={4} style={{ margin: 0, fontWeight: 700 }}>LibraryAdmin</Title>
          </Flex>
          <Flex align="center" gap={30}>
            <Link href="#" style={{ color: '#595959' }}>Catalog</Link>
            <Link href="#" style={{ color: '#595959' }}>About</Link>
            <Link href="#" style={{ color: '#595959' }}>Contact</Link>
            <Button type="primary" onClick={onNavigateToLogin} style={{ width: '100px' }}>Login</Button>
          </Flex>
        </Header>

        <Content className="signup-content">
          <Card className="signup-card">
            <div className="signup-card-body">
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <Title level={2} style={{ margin: '0 0 12px 0', fontWeight: 800, fontSize: '32px' }}>
                  Create Account
                </Title>
                <Text type="secondary" style={{ fontSize: '16px' }}>
                  Please enter your details to register
                </Text>
              </div>

              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                requiredMark={false}
                size="large"
                initialValues={{ role: 'Borrower' }}
              >
                <Form.Item
                  label="Username"
                  name="username"
                  rules={[{ required: true, message: 'Please enter your username' }]}
                >
                  <Input 
                    prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} 
                    placeholder="Enter your username" 
                  />
                </Form.Item>

                <Form.Item
                  label="Password"
                  name="password"
                  rules={[{ required: true, message: 'Please create a password' }]}
                >
                  <Input.Password 
                    prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} 
                    placeholder="Create a password" 
                  />
                </Form.Item>

                <Form.Item
                  label="Full Name"
                  name="fullName"
                  rules={[{ required: true, message: 'Please enter your full name' }]}
                >
                  <Input 
                    prefix={<SolutionOutlined style={{ color: '#bfbfbf' }} />} 
                    placeholder="Enter your full name" 
                  />
                </Form.Item>

                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: 'Please enter your email' },
                    { type: 'email', message: 'Please enter a valid email' }
                  ]}
                >
                  <Input 
                    prefix={<MailOutlined style={{ color: '#bfbfbf' }} />} 
                    placeholder="name@example.com" 
                  />
                </Form.Item>

                <Form.Item
                  label="Role"
                  name="role"
                  rules={[{ required: true, message: 'Please select a role' }]}
                >
                  <Select placeholder="Select a role">
                    <Option value="Borrower">Borrower</Option>
                    <Option value="Librarian">Librarian</Option>
                  </Select>
                </Form.Item>

                <Form.Item style={{ marginTop: '24px' }}>
                  <Button type="primary" htmlType="submit" block style={{ height: '50px', fontSize: '16px', fontWeight: 600 }} loading={loading}>
                    Sign Up
                  </Button>
                </Form.Item>

                <div style={{ textAlign: 'center', marginTop: '24px' }}>
                  <Text type="secondary">Already have an account? </Text>
                  <Link onClick={onNavigateToLogin} style={{ fontWeight: 600 }}>Login</Link>
                </div>
              </Form>
            </div>
          </Card>
        </Content>
      </Layout>
    </ConfigProvider>
  );
};

export default Signup;
