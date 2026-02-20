import React, { useState, useEffect } from 'react';
import {
    Card,
    Typography,
    Button,
    Spin,
    Result,
} from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api';

const { Title, Paragraph, Text } = Typography;

const VerifyEmailPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState<boolean | null>(null);
    const [message, setMessage] = useState('');

    const token = searchParams.get('token');
    const email = searchParams.get('email');

    useEffect(() => {
        if (!token || !email) {
            setSuccess(false);
            setMessage('Link verifikasi tidak valid');
            setLoading(false);
            return;
        }

        // Verify email
        api.post('/authors/verify-email', {
            token,
            email,
        })
        .then(() => {
            setSuccess(true);
            setMessage('Email berhasil diverifikasi!');
        })
        .catch((error: any) => {
            setSuccess(false);
            setMessage(error.response?.data?.message || 'Verifikasi gagal');
        })
        .finally(() => {
            setLoading(false);
        });
    }, [token, email]);

    if (loading) {
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
                    className="w-full max-w-md relative z-10"
                >
                    <Card className="shadow-2xl rounded-3xl border-none">
                        <div className="text-center py-12">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 200,
                                    repeat: Infinity,
                                    repeatType: "reverse",
                                    duration: 1.5,
                                }}
                                className="text-8xl mb-6"
                            >
                                📧
                            </motion.div>
                            <Spin size="large" className="mb-4" />
                            <Title level={4} className="!mb-2">Memverifikasi Email...</Title>
                            <Paragraph type="secondary">Mohon tunggu sebentar</Paragraph>
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
                className="w-full max-w-md relative z-10"
            >
                <Card className="shadow-2xl rounded-3xl border-none">
                    {success ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Result
                                status="success"
                                title={<span className="text-green-600 text-4xl">✅</span>}
                                subTitle={
                                    <div className="text-center">
                                        <Title level={4} className="!mb-2">Email Terverifikasi!</Title>
                                        <Paragraph className="!text-gray-600">{message}</Paragraph>
                                    </div>
                                }
                                extra={[
                                    <motion.div key="login" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button
                                            type="primary"
                                            onClick={() => navigate('/admin/login')}
                                            size="large"
                                            className="h-12 px-8 font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 border-none"
                                        >
                                            Login Sekarang
                                        </Button>
                                    </motion.div>,
                                    <motion.div key="dashboard" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button
                                            onClick={() => navigate('/admin/dashboard')}
                                            size="large"
                                            className="h-12 px-8"
                                        >
                                            Buka Dashboard
                                        </Button>
                                    </motion.div>,
                                ]}
                                className="py-8"
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Result
                                status="error"
                                title={<span className="text-red-600 text-4xl">❌</span>}
                                subTitle={
                                    <div className="text-center">
                                        <Title level={4} className="!mb-2">Verifikasi Gagal</Title>
                                        <Paragraph className="!text-gray-600">{message}</Paragraph>
                                    </div>
                                }
                                extra={[
                                    <motion.div key="resend" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button
                                            type="primary"
                                            onClick={() => navigate('/admin/forgot-password')}
                                            size="large"
                                            className="h-12 px-8 font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 border-none"
                                        >
                                            Kirim Ulang Email
                                        </Button>
                                    </motion.div>,
                                    <motion.div key="home" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button
                                            onClick={() => navigate('/admin/login')}
                                            size="large"
                                            className="h-12 px-8"
                                        >
                                            Kembali ke Login
                                        </Button>
                                    </motion.div>,
                                ]}
                                className="py-8"
                            />
                        </motion.div>
                    )}

                    <motion.div 
                        className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-b-3xl border-t border-indigo-100"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Text type="secondary" className="text-xs block">
                            <strong>💡 Tips:</strong> Jika Anda mengalami masalah verifikasi, 
                            pastikan link yang diklik masih berlaku (24 jam) dan belum pernah digunakan sebelumnya.
                        </Text>
                    </motion.div>
                </Card>
            </motion.div>
        </div>
    );
};

export default VerifyEmailPage;
