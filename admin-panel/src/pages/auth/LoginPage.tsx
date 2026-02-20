import React from 'react';
import { Form, Input, Button, Checkbox, Card, Typography, message, Tabs } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import api from '../../api';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
    const [loginType, setLoginType] = React.useState<'username' | 'email'>('username');

    const onFinish = async (values: Record<string, unknown>) => {
        try {
            // Laravel API uses login (email or username) + password
            const response = await api.post('/auth/login', {
                login: loginType === 'username' ? values.username : values.email,
                password: values.password,
            });
            // Laravel returns { access_token: '...', token: '...', status: 'success', user: {...} }
            const token = response.data.access_token || response.data.token;
            localStorage.setItem('token', token);
            message.success('Login berhasil!');
            window.location.href = '/admin/dashboard';
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string; error?: string } } };
            message.error(err.response?.data?.error || err.response?.data?.message || 'Login gagal');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md shadow-lg rounded-2xl border-none">
                <div className="text-center mb-8">
                    <div style={{
                        width: 56, height: 56, borderRadius: 12,
                        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 800, fontSize: 22,
                        margin: '0 auto 12px',
                    }}>
                        RE
                    </div>
                    <Title level={2} className="text-primary !mb-1">NRE Enterprise</Title>
                    <Text type="secondary">Masuk ke dashboard admin untuk melanjutkan</Text>
                </div>

                <Tabs
                    activeKey={loginType}
                    onChange={(key) => setLoginType(key as 'username' | 'email')}
                    items={[
                        {
                            key: 'username',
                            label: 'Username',
                            children: (
                                <Form
                                    name="login"
                                    initialValues={{ remember: true }}
                                    onFinish={onFinish}
                                    layout="vertical"
                                    size="large"
                                >
                                    <Form.Item
                                        name="username"
                                        rules={[{ required: true, message: 'Silakan masukkan username Anda' }]}
                                    >
                                        <Input prefix={<UserOutlined />} placeholder="Username" />
                                    </Form.Item>

                                    <Form.Item
                                        name="password"
                                        rules={[{ required: true, message: 'Silakan masukkan password Anda' }]}
                                    >
                                        <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                                    </Form.Item>

                                    <Form.Item>
                                        <div className="flex justify-between items-center">
                                            <Form.Item name="remember" valuePropName="checked" noStyle>
                                                <Checkbox>Ingat saya</Checkbox>
                                            </Form.Item>
                                        </div>
                                    </Form.Item>

                                    <Form.Item>
                                        <Button type="primary" htmlType="submit" className="w-full h-12 rounded-xl text-lg font-semibold">
                                            Masuk
                                        </Button>
                                    </Form.Item>
                                </Form>
                            ),
                        },
                        {
                            key: 'email',
                            label: 'Email',
                            children: (
                                <Form
                                    name="login-email"
                                    initialValues={{ remember: true }}
                                    onFinish={onFinish}
                                    layout="vertical"
                                    size="large"
                                >
                                    <Form.Item
                                        name="email"
                                        rules={[
                                            { required: true, message: 'Silakan masukkan email Anda' },
                                            { type: 'email', message: 'Format email tidak valid' }
                                        ]}
                                    >
                                        <Input prefix={<MailOutlined />} placeholder="Email" />
                                    </Form.Item>

                                    <Form.Item
                                        name="password"
                                        rules={[{ required: true, message: 'Silakan masukkan password Anda' }]}
                                    >
                                        <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                                    </Form.Item>

                                    <Form.Item>
                                        <div className="flex justify-between items-center">
                                            <Form.Item name="remember" valuePropName="checked" noStyle>
                                                <Checkbox>Ingat saya</Checkbox>
                                            </Form.Item>
                                        </div>
                                    </Form.Item>

                                    <Form.Item>
                                        <Button type="primary" htmlType="submit" className="w-full h-12 rounded-xl text-lg font-semibold">
                                            Masuk
                                        </Button>
                                    </Form.Item>
                                </Form>
                            ),
                        },
                    ]}
                />

                <div className="mt-6 text-center">
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        Demo Author: author@example.com / password
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        Demo Admin: admin@rizquna.id / password
                    </Text>
                </div>
            </Card>
        </div>
    );
};

export default LoginPage;
