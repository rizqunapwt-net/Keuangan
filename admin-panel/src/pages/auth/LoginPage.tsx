import React, { useState } from 'react';
import {
    Form,
    Input,
    Button,
    Card,
    Typography,
    message,
    Checkbox,
    Divider,
} from 'antd';
import {
    UserOutlined,
    LockOutlined,
    GoogleOutlined,
    FacebookOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api';

const { Title, Text, Paragraph } = Typography;

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [form] = Form.useForm();

    const fromState = location.state as any;
    const registeredEmail = fromState?.registeredEmail || '';

    const onFinish = async (values: Record<string, unknown>) => {
        setLoading(true);
        try {
            const response = await api.post('/auth/login', {
                login: values.username,
                password: values.password,
            });

            const token = response.data.access_token || response.data.token;
            localStorage.setItem('token', token);

            message.success({
                content: '🎉 Login berhasil! Selamat datang kembali.',
                duration: 3,
            });

            setTimeout(() => {
                window.location.href = '/admin/dashboard';
            }, 1000);
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Login gagal';
            message.error({
                content: errorMsg,
                duration: 5,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-2 sm:p-4 md:p-6 lg:p-8">
            {/* Animated background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                    }}
                    transition={{ duration: 20, repeat: Infinity }}
                />
                <motion.div
                    className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"
                    animate={{
                        scale: [1, 1.3, 1],
                        rotate: [0, -90, 0],
                    }}
                    transition={{ duration: 25, repeat: Infinity }}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <Card 
                    className="shadow-2xl rounded-3xl border-none overflow-hidden"
                    bodyStyle={{ padding: 0 }}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 md:p-8 text-white">
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-center"
                        >
                            <motion.div
                                className="w-20 h-20 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-4xl font-bold shadow-lg"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                RE
                            </motion.div>
                            <Title level={2} className="!mb-2 !text-white text-3xl md:text-4xl">
                                Selamat Datang
                            </Title>
                            <Paragraph className="!text-white/90 text-sm md:text-base">
                                Login untuk melanjutkan ke dashboard
                            </Paragraph>
                        </motion.div>
                    </div>

                    {/* Form */}
                    <div className="p-6 md:p-8">
                        {registeredEmail && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6"
                            >
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                    <Text className="text-green-800 text-sm block">
                                        ✅ Pendaftaran berhasil! Silakan login dengan email:
                                    </Text>
                                    <Text className="text-green-900 font-semibold block mt-1">
                                        {registeredEmail}
                                    </Text>
                                </div>
                            </motion.div>
                        )}

                        <Form
                            form={form}
                            name="login"
                            onFinish={onFinish}
                            layout="vertical"
                            size="large"
                            initialValues={{
                                remember: true,
                                username: registeredEmail,
                            }}
                            autoComplete="off"
                        >
                            <Form.Item
                                name="username"
                                label={<span className="font-medium">Username atau Email</span>}
                                rules={[{ required: true, message: 'Username atau email wajib diisi' }]}
                            >
                                <Input 
                                    prefix={<UserOutlined className="text-gray-400" />} 
                                    placeholder="Username atau email" 
                                    className="h-12"
                                    allowClear
                                />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                label={<span className="font-medium">Password</span>}
                                rules={[{ required: true, message: 'Password wajib diisi' }]}
                            >
                                <Input.Password 
                                    prefix={<LockOutlined className="text-gray-400" />} 
                                    placeholder="Password" 
                                    className="h-12"
                                    visibilityToggle={{ visible: passwordVisible, onVisibleChange: setPasswordVisible }}
                                />
                            </Form.Item>

                            <Form.Item>
                                <div className="flex justify-between items-center">
                                    <Form.Item name="remember" valuePropName="checked" noStyle>
                                        <Checkbox className="text-sm">Ingat saya</Checkbox>
                                    </Form.Item>
                                    <Button 
                                        type="link" 
                                        onClick={() => navigate('/admin/forgot-password')}
                                        className="!p-0 text-sm text-indigo-600 hover:text-indigo-800"
                                    >
                                        Lupa password?
                                    </Button>
                                </div>
                            </Form.Item>

                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button 
                                    type="primary" 
                                    htmlType="submit" 
                                    loading={loading}
                                    block 
                                    size="large"
                                    className="h-14 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 border-none"
                                >
                                    {loading ? 'Logging in...' : 'Masuk'}
                                </Button>
                            </motion.div>
                        </Form>

                        <Divider className="my-6">atau login dengan</Divider>

                        <div className="grid grid-cols-2 gap-4">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button 
                                    block 
                                    size="large"
                                    icon={<GoogleOutlined />}
                                    className="h-12"
                                >
                                    Google
                                </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button 
                                    block 
                                    size="large"
                                    icon={<FacebookOutlined />}
                                    className="h-12"
                                >
                                    Facebook
                                </Button>
                            </motion.div>
                        </div>

                        <Divider className="my-6" />

                        <div className="text-center">
                            <Text type="secondary" className="text-sm">
                                Belum punya akun?{' '}
                                <Button 
                                    type="link" 
                                    onClick={() => navigate('/authors/register')} 
                                    className="!p-0 font-semibold text-indigo-600 hover:text-indigo-800"
                                >
                                    Daftar sekarang
                                </Button>
                            </Text>
                        </div>

                        <motion.div 
                            className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <Text type="secondary" className="text-xs block mb-2 font-semibold">
                                🎁 Keuntungan Login:
                            </Text>
                            <ul className="text-xs space-y-1 text-gray-600">
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    <span>Kelola buku dan kontrak</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    <span>Track penjualan real-time</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    <span>Terima pembayaran royalti</span>
                                </li>
                            </ul>
                        </motion.div>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
};

export default LoginPage;
