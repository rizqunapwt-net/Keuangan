import React, { useState } from 'react';
import {
    Form,
    Input,
    Button,
    Card,
    Typography,
    message,
    Divider,
} from 'antd';
import { MailOutlined, ArrowLeftOutlined, SendOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api';

const { Title, Text, Paragraph } = Typography;

const ForgotPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [email, setEmail] = useState('');
    const [form] = Form.useForm();

    const onFinish = async (values: any) => {
        setLoading(true);
        setEmail(values.email);
        
        try {
            await api.post('/authors/forgot-password', {
                email: values.email,
            });

            setSubmitted(true);
            message.success({
                content: '📧 Email reset password telah dikirim!',
                duration: 5,
            });
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Gagal mengirim email reset';
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
                                🔐
                            </motion.div>
                            <Title level={3} className="!mb-2 !text-white text-2xl md:text-3xl">
                                Lupa Password?
                            </Title>
                            <Paragraph className="!text-white/90 text-sm md:text-base">
                                Jangan khawatir, kami akan bantu Anda
                            </Paragraph>
                        </motion.div>
                    </div>

                    {/* Content */}
                    <div className="p-6 md:p-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Button
                                type="link"
                                icon={<ArrowLeftOutlined />}
                                onClick={() => navigate('/admin/login')}
                                className="mb-6 !p-0 text-indigo-600 hover:text-indigo-800"
                            >
                                Kembali ke Login
                            </Button>

                            {submitted ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="mb-6"
                                >
                                    <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                                        <div className="text-center mb-4">
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: "spring", stiffness: 200 }}
                                                className="text-6xl mb-2"
                                            >
                                                📧
                                            </motion.div>
                                            <Title level={4} className="!mb-2 !text-green-800">
                                                Email Terkirim!
                                            </Title>
                                            <Paragraph className="!text-green-700">
                                                Kami telah mengirim link reset password ke:
                                            </Paragraph>
                                            <Text className="font-semibold text-green-900 block mt-2 text-lg">
                                                {email}
                                            </Text>
                                        </div>
                                        <Divider className="!my-4" />
                                        <div className="space-y-3 text-sm text-green-800">
                                            <p className="flex items-start">
                                                <span className="mr-2">📬</span>
                                                <span>Periksa folder inbox atau spam Anda</span>
                                            </p>
                                            <p className="flex items-start">
                                                <span className="mr-2">⏰</span>
                                                <span>Link reset berlaku selama 60 menit</span>
                                            </p>
                                            <p className="flex items-start">
                                                <span className="mr-2">🔄</span>
                                                <span>Tidak menerima email? Minta ulang di bawah</span>
                                            </p>
                                        </div>
                                        <Button
                                            type="link"
                                            onClick={() => {
                                                setSubmitted(false);
                                                form.resetFields();
                                            }}
                                            block
                                            className="mt-6 text-green-700 hover:text-green-900"
                                        >
                                            🔄 Kirim Ulang Email
                                        </Button>
                                    </div>
                                </motion.div>
                            ) : (
                                <>
                                    <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                        <Text className="text-blue-800 text-sm block">
                                            <span className="font-semibold">📝 Cara reset password:</span>
                                        </Text>
                                        <ol className="text-blue-700 text-sm mt-2 space-y-1 list-decimal list-inside">
                                            <li>Masukkan email terdaftar Anda</li>
                                            <li>Klik "Kirim Link Reset"</li>
                                            <li>Cek email dan klik link reset</li>
                                            <li>Buat password baru</li>
                                        </ol>
                                    </div>

                                    <Form
                                        form={form}
                                        name="forgot_password"
                                        onFinish={onFinish}
                                        layout="vertical"
                                        size="large"
                                        autoComplete="off"
                                    >
                                        <Form.Item
                                            name="email"
                                            label={<span className="font-medium">Email Terdaftar</span>}
                                            rules={[
                                                { required: true, message: 'Email wajib diisi' },
                                                { type: 'email', message: 'Format email tidak valid' }
                                            ]}
                                        >
                                            <Input 
                                                prefix={<MailOutlined className="text-gray-400" />} 
                                                placeholder="email@contoh.com" 
                                                className="h-12"
                                                allowClear
                                            />
                                        </Form.Item>

                                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                            <Button 
                                                type="primary" 
                                                htmlType="submit" 
                                                loading={loading}
                                                block 
                                                size="large"
                                                icon={<SendOutlined />}
                                                className="h-14 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 border-none"
                                            >
                                                {loading ? 'Mengirim...' : 'Kirim Link Reset'}
                                            </Button>
                                        </motion.div>
                                    </Form>
                                </>
                            )}
                        </motion.div>

                        <motion.div 
                            className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <Text type="secondary" className="text-xs block font-semibold">
                                💡 Tips:
                            </Text>
                            <Text type="secondary" className="text-xs block mt-1">
                                Pastikan Anda menggunakan email yang sama dengan yang terdaftar di akun penulis Anda. 
                                Periksa folder spam jika email tidak muncul di inbox dalam 5 menit.
                            </Text>
                        </motion.div>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
};

export default ForgotPasswordPage;
