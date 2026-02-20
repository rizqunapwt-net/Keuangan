import React, { useState, useEffect } from 'react';
import {
    Card,
    Typography,
    Button,
    Alert,
    Spin,
    Result,
} from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
                <Card className="w-full max-w-md shadow-2xl rounded-2xl border-none">
                    <div className="text-center py-12">
                        <Spin size="large" />
                        <Title level={4} className="mt-4">Memverifikasi Email...</Title>
                        <Paragraph type="secondary">Mohon tunggu sebentar</Paragraph>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
            <Card className="w-full max-w-md shadow-2xl rounded-2xl border-none">
                {success ? (
                    <Result
                        status="success"
                        title="Email Terverifikasi!"
                        subTitle={message}
                        extra={[
                            <Button
                                type="primary"
                                key="login"
                                onClick={() => navigate('/admin/login')}
                            >
                                Login Sekarang
                            </Button>,
                            <Button
                                key="dashboard"
                                onClick={() => navigate('/admin/dashboard')}
                            >
                                Buka Dashboard
                            </Button>,
                        ]}
                    />
                ) : (
                    <Result
                        status="error"
                        title="Verifikasi Gagal"
                        subTitle={message}
                        extra={[
                            <Button
                                type="primary"
                                key="resend"
                                onClick={() => navigate('/admin/forgot-password')}
                            >
                                Kirim Ulang Email
                            </Button>,
                            <Button
                                key="home"
                                onClick={() => navigate('/admin/login')}
                            >
                                Kembali ke Login
                            </Button>,
                        ]}
                    />
                )}

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        <strong>Tips:</strong> Jika Anda mengalami masalah verifikasi, 
                        pastikan link yang diklik masih berlaku (24 jam) dan belum pernah digunakan sebelumnya.
                    </Text>
                </div>
            </Card>
        </div>
    );
};

export default VerifyEmailPage;
