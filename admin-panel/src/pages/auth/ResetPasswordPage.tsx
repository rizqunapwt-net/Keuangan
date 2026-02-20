import React, { useState, useEffect } from 'react';
import {
    Form,
    Input,
    Button,
    Card,
    Typography,
    message,
} from 'antd';
import { LockOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api';

const { Title, Text, Paragraph } = Typography;

const ResetPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [validToken, setValidToken] = useState<boolean | null>(null);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [form] = Form.useForm();

    const token = searchParams.get('token');
    const email = searchParams.get('email');

    useEffect(() => {
        if (!token || !email) {
            setValidToken(false);
            message.error({
                content: 'Link reset password tidak valid',
                duration: 5,
            });
        } else {
            setValidToken(true);
        }
    }, [token, email]);

    const onFinish = async (values: any) => {
        setLoading(true);
        
        try {
            await api.post('/authors/reset-password', {
                token: token,
                email: email,
                password: values.password,
                password_confirmation: values.password_confirmation,
            });

            message.success({
                content: '✅ Password berhasil direset! Silakan login dengan password baru.',
                duration: 3,
            });
            
            setTimeout(() => {
                navigate('/admin/login');
            }, 2000);
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Gagal reset password';
            message.error({
                content: errorMsg,
                duration: 5,
            });
        } finally {
            setLoading(false);
        }
    };

    if (validToken === false) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-2 sm:p-4 md:p-6 lg:p-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md relative z-10"
                >
                    <Card className="shadow-2xl rounded-3xl border-none">
                        <div className="text-center py-8">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200 }}
                                className="text-8xl mb-4"
                            >
                                ❌
                            </motion.div>
                            <Title level={3} className="!mb-2 text-red-600">
                                Link Tidak Valid
                            </Title>
                            <Paragraph className="!text-gray-600 mb-6">
                                Link reset password ini tidak valid atau sudah kadaluarsa. 
                                Silakan minta link reset password yang baru.
                            </Paragraph>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                    type="primary"
                                    onClick={() => navigate('/admin/forgot-password')}
                                    block
                                    size="large"
                                    className="h-14 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 border-none"
                                >
                                    🔄 Minta Link Reset Baru
                                </Button>
                            </motion.div>
                        </div>
                    </Card>
                </motion.div>
            </div>
        );
    }

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
                                🔑
                            </motion.div>
                            <Title level={3} className="!mb-2 !text-white text-2xl md:text-3xl">
                                Reset Password
                            </Title>
                            <Paragraph className="!text-white/90 text-sm md:text-base">
                                Buat password baru untuk akun Anda
                            </Paragraph>
                        </motion.div>
                    </div>

                    {/* Form */}
                    <div className="p-6 md:p-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-100">
                                <Text className="text-green-800 text-sm block">
                                    <CheckCircleOutlined className="mr-2 text-green-600" />
                                    <span className="font-semibold">Link valid!</span> Anda dapat membuat password baru.
                                </Text>
                            </div>

                            <Form
                                form={form}
                                name="reset_password"
                                onFinish={onFinish}
                                layout="vertical"
                                size="large"
                                autoComplete="off"
                            >
                                <Form.Item
                                    name="password"
                                    label={<span className="font-medium">Password Baru</span>}
                                    rules={[
                                        { required: true, message: 'Password wajib diisi' },
                                        { min: 8, message: 'Password minimal 8 karakter' }
                                    ]}
                                >
                                    <Input.Password 
                                        prefix={<LockOutlined className="text-gray-400" />} 
                                        placeholder="Minimal 8 karakter" 
                                        className="h-12"
                                        visibilityToggle={{ visible: passwordVisible, onVisibleChange: setPasswordVisible }}
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="password_confirmation"
                                    label={<span className="font-medium">Konfirmasi Password Baru</span>}
                                    dependencies={['password']}
                                    rules={[
                                        { required: true, message: 'Konfirmasi password wajib diisi' },
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (!value || getFieldValue('password') === value) {
                                                    return Promise.resolve();
                                                }
                                                return Promise.reject(new Error('Password tidak cocok'));
                                            },
                                        }),
                                    ]}
                                >
                                    <Input.Password 
                                        prefix={<LockOutlined className="text-gray-400" />} 
                                        placeholder="Ulangi password" 
                                        className="h-12"
                                        visibilityToggle={{ visible: passwordVisible, onVisibleChange: setPasswordVisible }}
                                    />
                                </Form.Item>

                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <Button 
                                        type="primary" 
                                        htmlType="submit" 
                                        loading={loading}
                                        block 
                                        size="large"
                                        icon={<CheckCircleOutlined />}
                                        className="h-14 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 border-none"
                                    >
                                        {loading ? 'Mereset...' : 'Reset Password'}
                                    </Button>
                                </motion.div>
                            </Form>

                            <motion.div 
                                className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <Text type="secondary" className="text-xs block font-semibold mb-2">
                                    🔐 Syarat password yang kuat:
                                </Text>
                                <ul className="text-xs space-y-1 text-gray-600">
                                    <li className="flex items-start">
                                        <span className="text-green-500 mr-2">✓</span>
                                        <span>Minimal 8 karakter</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-green-500 mr-2">✓</span>
                                        <span>Gunakan kombinasi huruf, angka, dan simbol</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-green-500 mr-2">✓</span>
                                        <span>Jangan gunakan password yang mudah ditebak</span>
                                    </li>
                                </ul>
                            </motion.div>
                        </motion.div>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
};

export default ResetPasswordPage;
