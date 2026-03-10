import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { motion } from 'framer-motion';
import logoNre from '../../assets/logo-nre.png';
import api from '../../api';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
    const [loading, setLoading] = useState(false);

    const onFinish = async (values: Record<string, unknown>) => {
        setLoading(true);
        try {
            const response = await api.post('/auth/login', values);
            const token = response.data?.data?.access_token || response.data?.access_token;
            if (token) {
                localStorage.setItem('access_token', token);
            }
            message.success('Selamat Datang Kembali!');
            window.location.href = '/admin/dashboard';
        } catch (error: any) {
            message.error(error.response?.data?.error?.message || error.response?.data?.message || 'Email atau Kata Sandi salah');
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
            background: '#f8fafc',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: "'Poppins', sans-serif"
        }}>
            {/* Fillow-style Background Blobs */}
            <div style={{
                position: 'absolute',
                top: '-15%',
                right: '-10%',
                width: '600px',
                height: '600px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(15, 185, 177, 0.08) 0%, transparent 70%)',
                filter: 'blur(60px)',
            }} />
            <div style={{
                position: 'absolute',
                bottom: '-15%',
                left: '-10%',
                width: '500px',
                height: '500px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(32, 191, 107, 0.05) 0%, transparent 70%)',
                filter: 'blur(60px)',
            }} />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{ zIndex: 1, width: '100%', maxWidth: 450, padding: '0 20px' }}
            >
                <Card
                    style={{
                        borderRadius: 28,
                        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.05)',
                        border: '1px solid #eee',
                        background: '#ffffff',
                    }}
                    bodyStyle={{ padding: '48px 40px' }}
                >
                    <div style={{ textAlign: 'center', marginBottom: 40 }}>
                        <img
                            src={logoNre}
                            alt="Rizquna Logo"
                            style={{ width: 72, height: 72, objectFit: 'contain', marginBottom: 16 }}
                        />
                        <Title level={2} style={{ margin: 0, color: '#333', fontWeight: 800, fontSize: 26, letterSpacing: '1px' }}>
                            RIZQUNA.ID
                        </Title>
                    </div>

                    <Form
                        name="fillow_login"
                        layout="vertical"
                        size="large"
                        onFinish={onFinish}
                        autoComplete="off"
                        requiredMark={false}
                    >
                        <Form.Item
                            label={<span style={{ fontWeight: 600, fontSize: 13, color: '#666' }}>EMAIL</span>}
                            name="email"
                            rules={[
                                { required: true, message: 'Harap masukkan Email Anda' },
                                { type: 'email', message: 'Harap masukkan Email yang valid' }
                            ]}
                        >
                            <Input
                                placeholder="nama@email.com"
                                style={{ borderRadius: 14, height: 52, background: '#fcfcfc', border: '1px solid #eee' }}
                            />
                        </Form.Item>

                        <Form.Item
                            label={<span style={{ fontWeight: 600, fontSize: 13, color: '#666' }}>KATA SANDI</span>}
                            name="password"
                            rules={[{ required: true, message: 'Harap masukkan Kata Sandi' }]}
                            style={{ marginBottom: 8 }}
                        >
                            <Input.Password
                                placeholder="••••••••"
                                style={{ borderRadius: 14, height: 52, background: '#fcfcfc', border: '1px solid #eee' }}
                            />
                        </Form.Item>

                        <div style={{ marginBottom: 24, textAlign: 'right' }}>
                            <Text style={{ color: '#0fb9b1', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
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
                                    height: 52,
                                    borderRadius: 14,
                                    background: 'linear-gradient(135deg, #0fb9b1, #20bf6b)',
                                    border: 'none',
                                    fontSize: 16,
                                    fontWeight: 700,
                                    boxShadow: '0 10px 20px rgba(15, 185, 177, 0.3)',
                                    marginTop: 8
                                }}
                            >
                                MASUK SEKARANG
                            </Button>
                        </Form.Item>
                    </Form>

                    <div style={{ marginTop: 32, textAlign: 'center' }}>
                        <Text style={{ color: '#aaa', fontSize: 13 }}>
                            Butuh bantuan akses? <span style={{ color: '#0fb9b1', fontWeight: 600, cursor: 'pointer' }}>Hubungi Admin</span>
                        </Text>
                    </div>
                </Card>

                <div style={{ marginTop: 32, textAlign: 'center' }}>
                    <Text style={{ color: '#ccc', fontSize: 12, fontWeight: 500, letterSpacing: '0.5px' }}>
                        © 2026 RIZQUNA.ID
                    </Text>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
