import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import api from '../../api';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
    const [loading, setLoading] = useState(false);

    const onFinish = async (values: Record<string, unknown>) => {
        setLoading(true);
        try {
            const response = await api.post('/auth/login', values);
            const token = response.data.data?.access_token || response.data.access_token;
            localStorage.setItem('token', token);
            message.success('Selamat Datang Kembali!');
            window.location.href = '/dashboard';
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Email atau Kata Sandi salah');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Background Decorative Circles */}
            <div style={{
                position: 'absolute',
                top: '-10%',
                right: '-10%',
                width: '400px',
                height: '400px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(14, 165, 233, 0.1) 0%, transparent 70%)',
            }} />
            <div style={{
                position: 'absolute',
                bottom: '-10%',
                left: '-10%',
                width: '400px',
                height: '400px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(37, 99, 235, 0.1) 0%, transparent 70%)',
            }} />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card
                    style={{
                        width: 420,
                        borderRadius: 24,
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.7)',
                        backdropFilter: 'blur(10px)',
                        background: 'rgba(255, 255, 255, 0.8)',
                    }}
                    bodyStyle={{ padding: '40px' }}
                >
                    <div style={{ textAlign: 'center', marginBottom: 40 }}>
                        <div style={{
                            width: 56,
                            height: 56,
                            borderRadius: 16,
                            background: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px',
                            boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)',
                        }}>
                            <SafetyCertificateOutlined style={{ fontSize: 28, color: '#fff' }} />
                        </div>
                        <Title level={2} style={{ margin: 0, color: '#0f172a', fontWeight: 800, fontSize: 32 }}>
                            Rizquna Kasir
                        </Title>
                        <Text style={{ color: '#64748b', fontSize: 16 }}>
                            Sistem POS & Keuangan Pintar
                        </Text>
                    </div>

                    <Form
                        name="modern_login"
                        layout="vertical"
                        size="large"
                        onFinish={onFinish}
                        autoComplete="off"
                    >
                        <Form.Item
                            name="email"
                            rules={[
                                { required: true, message: 'Harap masukkan Email Anda' },
                                { type: 'email', message: 'Harap masukkan Email yang valid' }
                            ]}
                        >
                            <Input
                                prefix={<UserOutlined style={{ color: '#94a3b8' }} />}
                                placeholder="Alamat Email"
                                style={{ borderRadius: 12, height: 48 }}
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={[{ required: true, message: 'Harap masukkan Kata Sandi' }]}
                        >
                            <Input.Password
                                prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
                                placeholder="Kata Sandi"
                                style={{ borderRadius: 12, height: 48 }}
                            />
                        </Form.Item>

                        <div style={{ marginBottom: 24, textAlign: 'right' }}>
                            <Text style={{ color: '#2563eb', cursor: 'pointer', fontSize: 14 }}>
                                Lupa Kata Sandi?
                            </Text>
                        </div>

                        <Form.Item style={{ marginBottom: 0 }}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                style={{
                                    width: '100%',
                                    height: 48,
                                    borderRadius: 12,
                                    background: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
                                    border: 'none',
                                    fontSize: 16,
                                    fontWeight: 600,
                                    boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.2)',
                                }}
                            >
                                Masuk ke Dashboard
                            </Button>
                        </Form.Item>
                    </Form>

                    <div style={{ marginTop: 40, textAlign: 'center' }}>
                        <Text style={{ color: '#64748b' }}>
                            Butuh akses akun? <strong style={{ color: '#2563eb', cursor: 'pointer' }}>Hubungi Admin</strong>
                        </Text>
                    </div>
                </Card>

                <div style={{ marginTop: 24, textAlign: 'center' }}>
                    <Text style={{ color: '#94a3b8', fontSize: 12 }}>
                        © 2026 Rizquna Kasir. v4.0.0 Refactor Premium Edition.
                    </Text>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
