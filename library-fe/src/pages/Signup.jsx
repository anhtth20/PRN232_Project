import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Flex, Layout, Select, App } from 'antd';
import { useNavigate } from 'react-router-dom';
import { UserOutlined, MailOutlined, LockOutlined, BookFilled, SolutionOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Link } = Typography;
const { Header, Content } = Layout;

const Signup = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await axios.post('http://localhost:5237/api/Auth/register', {
        username: values.username,
        password: values.password,
        fullName: values.fullName,
        email: values.email,
        role: values.role,
      });
      message.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      console.error('Signup error:', error);
      message.error(error.response?.data?.message || 'Registration failed. Username might already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f5ff' }}>
      <Header
        style={{
          background: '#fff',
          padding: '0 50px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: 70,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        <Flex align="center" gap={10}>
          <BookFilled style={{ fontSize: 28, color: '#2563eb' }} />
          <Title level={4} style={{ margin: 0, fontWeight: 700 }}>LibraryAdmin</Title>
        </Flex>
        <Flex align="center" gap={20}>
          <Link href="#" style={{ color: '#595959' }}>Catalog</Link>
          <Link href="#" style={{ color: '#595959' }}>About</Link>
          <Link href="#" style={{ color: '#595959' }}>Contact</Link>
          <Button type="primary" onClick={() => navigate('/login')} style={{ width: 100 }}>Login</Button>
        </Flex>
      </Header>

      <Content
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px 24px',
        }}
      >
        <Card
          style={{
            width: '100%',
            maxWidth: 480,
            borderRadius: 16,
            boxShadow: '0 10px 40px rgba(0,0,0,0.10)',
            border: 'none',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <Title level={2} style={{ margin: '0 0 8px', fontWeight: 800, fontSize: 30 }}>
              Create Account
            </Title>
            <Text type="secondary" style={{ fontSize: 16 }}>
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
              <Input prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} placeholder="Enter your username" />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Please create a password' }]}
            >
              <Input.Password prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} placeholder="Create a password" />
            </Form.Item>

            <Form.Item
              label="Full Name"
              name="fullName"
              rules={[{ required: true, message: 'Please enter your full name' }]}
            >
              <Input prefix={<SolutionOutlined style={{ color: '#bfbfbf' }} />} placeholder="Enter your full name" />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' },
              ]}
            >
              <Input prefix={<MailOutlined style={{ color: '#bfbfbf' }} />} placeholder="name@example.com" />
            </Form.Item>

            <Form.Item
              label="Role"
              name="role"
              rules={[{ required: true, message: 'Please select a role' }]}
            >
              <Select
                placeholder="Select a role"
                options={[
                  { value: 'Borrower', label: 'Borrower' },
                  { value: 'Librarian', label: 'Librarian' },
                ]}
              />
            </Form.Item>

            <Form.Item style={{ marginTop: 24 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                style={{ height: 50, fontSize: 16, fontWeight: 600 }}
                loading={loading}
              >
                Sign Up
              </Button>
            </Form.Item>

            <Flex justify="center" gap={4}>
              <Text type="secondary">Already have an account?</Text>
              <Link onClick={() => navigate('/login')} style={{ fontWeight: 600 }}>Login</Link>
            </Flex>
          </Form>
        </Card>
      </Content>
    </Layout>
  );
};

export default Signup;
