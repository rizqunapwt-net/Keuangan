import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Steps, Row, Col, message } from 'antd';
import { UserOutlined, ShopOutlined, LockOutlined, RocketOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api';

const { Title, Text, Paragraph } = Typography;

const RegisterPage: React.FC = () => {
    const [current, setCurrent] = useState(0);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const next = async () => {
        try {
            await form.validateFields();
            setCurrent(current + 1);
        } catch (err) {
            console.log('Validation failed:', err);
        }
    };

    const prev = () => {
        setCurrent(current - 1);
    };

    const onFinish = async (values: Record<string, unknown>) => {
        message.loading({ content: 'Menyiapkan database Anda...', key: 'reg' });
        try {
            const payload = {
                email: values.email,
                password: values.password,
                tenantName: values.companyName as string,
                subdomain: (values.companyName as string).toLowerCase().replace(/\s+/g, '-'),
            };
            await api.post('/auth/register', payload);
            message.success({ content: 'Pendaftaran berhasil! Silakan masuk.', key: 'reg', duration: 2 });
            navigate('/login');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            message.error({ content: err.response?.data?.message || 'Pendaftaran gagal', key: 'reg' });
        }
    };

    const steps = [
        {
            title: 'Akun',
            icon: <UserOutlined />,
            content: (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <Title level={4}>Informasi Akun Anda</Title>
                    <Paragraph className="text-gray-500">Gunakan email yang valid untuk verifikasi akun.</Paragraph>
                    <Form.Item name="name" rules={[{ required: true, message: 'Nama lengkap harus diisi' }]}>
                        <Input prefix={<UserOutlined />} placeholder="Nama Lengkap" size="large" className="h-12" />
                    </Form.Item>
                    <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Email tidak valid' }]}>
                        <Input prefix={<RocketOutlined />} placeholder="Email Bisnis" size="large" className="h-12" />
                    </Form.Item>
                    <Form.Item name="password" rules={[{ required: true, min: 8, message: 'Password minimal 8 karakter' }]}>
                        <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" className="h-12" />
                    </Form.Item>
                </motion.div>
            ),
        },
        {
            title: 'Perusahaan',
            icon: <ShopOutlined />,
            content: (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <Title level={4}>Identitas Bisnis Anda</Title>
                    <Paragraph className="text-gray-500">Detail ini akan muncul di invoice dan laporan Anda.</Paragraph>
                    <Form.Item name="companyName" rules={[{ required: true, message: 'Nama perusahaan harus diisi' }]}>
                        <Input prefix={<ShopOutlined />} placeholder="Nama Perusahaan" size="large" className="h-12" />
                    </Form.Item>
                    <Form.Item name="industry" rules={[{ required: true, message: 'Pilih industri bisnis Anda' }]}>
                        <Input placeholder="Industri (e.g. Retail, Dagang, Jasa)" size="large" className="h-12" />
                    </Form.Item>
                    <Form.Item name="currency" initialValue="IDR">
                        <Input placeholder="Mata Uang Dasar (e.g. IDR)" size="large" className="h-12" disabled />
                    </Form.Item>
                </motion.div>
            ),
        },
        {
            title: 'Selesai',
            icon: <RocketOutlined />,
            content: (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-3xl mx-auto mb-6">
                        <RocketOutlined />
                    </div>
                    <Title level={3}>Hampir Siap!</Title>
                    <Paragraph className="text-gray-500">
                        Klik 'Daftar Sekarang' di bawah untuk memulai petualangan efisiensi bisnis Anda bersama Rizquna Elfath.
                    </Paragraph>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
                        <Text type="secondary">Dengan mendaftar, Anda menyetujui Syarat & Ketentuan kami.</Text>
                    </div>
                </motion.div>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="absolute top-0 left-0 w-full h-1/2 bg-indigo-600 -z-10" />

            <Card className="max-w-xl w-full shadow-2xl rounded-2xl overflow-hidden border-none">
                <div className="p-8">
                    <div className="flex flex-col items-center mb-10">
                        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-2xl text-white mb-4">RE</div>
                        <Title level={2} className="!m-0">Buat Akun Rizquna Elfath</Title>
                        <Text type="secondary">Bergabunglah dengan ekosistem bisnis modern</Text>
                    </div>

                    <Steps
                        current={current}
                        items={steps.map(item => ({ key: item.title, title: item.title }))}
                        className="mb-10"
                    />

                    <Form form={form} layout="vertical" onFinish={onFinish}>
                        <div className="min-h-[300px]">
                            {steps[current].content}
                        </div>

                        <Row gutter={16} className="mt-8">
                            {current > 0 && (
                                <Col span={12}>
                                    <Button style={{ width: '100%' }} size="large" onClick={prev}>
                                        Kembali
                                    </Button>
                                </Col>
                            )}
                            <Col span={current > 0 ? 12 : 24}>
                                {current < steps.length - 1 ? (
                                    <Button type="primary" style={{ width: '100%' }} size="large" onClick={next}>
                                        Lanjut
                                    </Button>
                                ) : (
                                    <Button type="primary" style={{ width: '100%' }} size="large" htmlType="submit">
                                        Daftar Sekarang
                                    </Button>
                                )}
                            </Col>
                        </Row>
                    </Form>

                    <div className="text-center mt-10">
                        <Text type="secondary">Sudah punya akun? </Text>
                        <Button type="link" className="p-0" onClick={() => navigate('/login')}>Masuk</Button>
                    </div>
                </div>
            </Card>

            <div className="fixed bottom-6 text-white/60 text-xs">
                © 2026 Rizquna Elfath. Trusted by 25,000+ businesses.
            </div>
        </div>
    );
};

export default RegisterPage;
