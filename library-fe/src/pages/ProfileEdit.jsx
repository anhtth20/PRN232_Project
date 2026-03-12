import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Card, Typography, Flex, App, Space, Divider, Skeleton } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

const ProfileEdit = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const { message } = App.useApp();

    const fetchProfile = React.useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5237/api/Auth/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            form.setFieldsValue({
                fullName: response.data.fullName,
                email: response.data.email,
                username: response.data.username,
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
            message.error('Failed to load profile data.');
        } finally {
            setFetching(false);
        }
    }, [form, message]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const payload = {
                fullName: values.fullName,
                email: values.email,
                oldPassword: values.oldPassword,
                newPassword: values.newPassword
            };
            
            await axios.put('http://localhost:5237/api/Auth/profile', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            message.success('Profile updated successfully!');
            form.setFieldsValue({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            console.error('Update error:', error);
            const errorMsg = error.response?.data?.message || 'Failed to update profile.';
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div style={{ padding: '40px 20px', maxWidth: 800, margin: '0 auto' }}>
                <Flex vertical gap={24}>
                    <Skeleton.Input active style={{ width: 250, height: 32 }} />
                    <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        <Skeleton active title paragraph={{ rows: 3 }} />
                        <Divider style={{ margin: '40px 0 24px' }} />
                        <Skeleton active title paragraph={{ rows: 3 }} />
                        <Divider style={{ margin: '40px 0 24px' }} />
                        <Flex justify="flex-end">
                            <Space size="middle">
                                <Skeleton.Button active size="large" style={{ width: 100, borderRadius: 8 }} />
                                <Skeleton.Button active size="large" style={{ width: 140, borderRadius: 8 }} />
                            </Space>
                        </Flex>
                    </Card>
                </Flex>
            </div>
        );
    }

    return (
        <div style={{ padding: '40px 20px', maxWidth: 800, margin: '0 auto' }}>
            <Flex vertical gap={24}>
                <Flex align="center" gap={12}>
                    <EditOutlined style={{ fontSize: 24, color: '#2563eb' }} />
                    <Title level={2} style={{ margin: 0 }}>Edit Profile</Title>
                </Flex>

                <Card 
                    bordered={false} 
                    style={{ borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
                >
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                        requiredMark={false}
                    >
                        <Title level={4}>Basic Information</Title>
                        <Divider style={{ margin: '12px 0 24px' }} />
                        
                        <Flex gap={24} wrap="wrap">
                            <Form.Item
                                label="Username"
                                name="username"
                                style={{ flex: '1 1 300px' }}
                            >
                                <Input 
                                    prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} 
                                    disabled 
                                    size="large"
                                    style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
                                />
                            </Form.Item>

                            <Form.Item
                                label="Full Name"
                                name="fullName"
                                rules={[{ required: true, message: 'Please enter your full name' }]}
                                style={{ flex: '1 1 300px' }}
                            >
                                <Input 
                                    prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} 
                                    placeholder="Enter your full name" 
                                    size="large"
                                />
                            </Form.Item>

                            <Form.Item
                                label="Email Address"
                                name="email"
                                rules={[
                                    { required: true, message: 'Please enter your email' },
                                    { type: 'email', message: 'Please enter a valid email address' }
                                ]}
                                style={{ flex: '1 1 300px' }}
                            >
                                <Input 
                                    prefix={<MailOutlined style={{ color: '#bfbfbf' }} />} 
                                    placeholder="yourname@example.com" 
                                    size="large"
                                />
                            </Form.Item>
                        </Flex>

                        <Divider style={{ margin: '40px 0 24px' }} />
                        <Title level={4}>Security</Title>
                        <Text type="secondary">Leave passwords empty if you don't want to change them.</Text>
                        
                        <Flex gap={24} wrap="wrap" style={{ marginTop: 24 }}>
                            <Form.Item
                                label="Current Password"
                                name="oldPassword"
                                style={{ flex: '1 1 100%' }}
                            >
                                <Input.Password 
                                    prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} 
                                    placeholder="Enter current password" 
                                    size="large"
                                />
                            </Form.Item>

                            <Form.Item
                                label="New Password"
                                name="newPassword"
                                dependencies={['oldPassword']}
                                rules={[
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (value && getFieldValue('oldPassword') === value) {
                                                return Promise.reject(new Error('New password must be different from current password'));
                                            }
                                            return Promise.resolve();
                                        },
                                    }),
                                ]}
                                style={{ flex: '1 1 300px' }}
                            >
                                <Input.Password 
                                    prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} 
                                    placeholder="Minimum 6 characters" 
                                    size="large"
                                />
                            </Form.Item>

                            <Form.Item
                                label="Confirm New Password"
                                name="confirmPassword"
                                dependencies={['newPassword']}
                                rules={[
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('newPassword') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('The two passwords do not match!'));
                                        },
                                    }),
                                ]}
                                style={{ flex: '1 1 300px' }}
                            >
                                <Input.Password 
                                    prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} 
                                    placeholder="Repeat new password" 
                                    size="large"
                                />
                            </Form.Item>
                        </Flex>

                        <Divider style={{ margin: '40px 0 24px' }} />
                        
                        <Flex justify="flex-end">
                            <Space size="middle">
                                <Button 
                                    size="large" 
                                    style={{ borderRadius: 8, padding: '0 32px' }}
                                    onClick={() => fetchProfile()}
                                >
                                    Reset
                                </Button>
                                <Button 
                                    type="primary" 
                                    htmlType="submit" 
                                    icon={<SaveOutlined />} 
                                    loading={loading}
                                    size="large"
                                    style={{ borderRadius: 8, padding: '0 32px', height: 44, fontWeight: 600 }}
                                >
                                    Save Changes
                                </Button>
                            </Space>
                        </Flex>
                    </Form>
                </Card>
            </Flex>
        </div>
    );
};

export default ProfileEdit;
