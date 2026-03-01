import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Alert } from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import api from '../../api';
import './AuthPages.css';
type ApiError = { response?: { data?: { message?: string; error?: string } } };

const ForgotPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [email, setEmail] = useState('');

    const handleForgotPassword = async (values: { email: string }) => {
        setLoading(true);
        setError(null);
        try {
            await api.post('/auth/forgot-password', {
                email: values.email,
            }, { withCredentials: true });

            setEmail(values.email);
            setSuccess(true);
        } catch (err: unknown) {
            const apiError = err as ApiError;
            setError(apiError.response?.data?.message || apiError.response?.data?.error || 'Gagal mengirim email reset password.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="auth-page">
                <div className="auth-form-side" style={{ flex: 1 }}>
                    <div className="auth-form-container">
                        <div className="auth-success-icon">📧</div>
                        <h1 className="auth-title">Cek Email Anda!</h1>
                        <p className="auth-subtitle">
                            Kami telah mengirim link reset password ke:<br />
                            <strong>{email}</strong>
                        </p>
                        <p className="auth-subtitle" style={{ fontSize: 13, color: '#9ca3af' }}>
                            Jika Anda tidak melihat email, cek folder spam atau coba lagi dengan email yang berbeda.
                        </p>
                        <Button
                            type="primary"
                            block
                            size="large"
                            className="btn-primary-blue"
                            onClick={() => navigate('/login')}
                            icon={<ArrowLeftOutlined />}
                        >
                            Kembali ke Login
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            {/* Kiri: Form */}
            <div className="auth-form-side">
                <div className="auth-form-container">
                    <Link to="/" className="auth-logo">
                        <span className="auth-logo-icon">📘</span>
                        <span className="auth-logo-text">E-book Sistem</span>
                    </Link>

                    <h1 className="auth-title">Lupa Password?</h1>
                    <p className="auth-subtitle">
                        Masukkan email Anda dan kami akan mengirim link reset password.
                    </p>

                    {error && (
                        <Alert
                            type="error"
                            message={error}
                            showIcon
                            closable
                            onClose={() => setError(null)}
                            style={{ marginBottom: 20 }}
                        />
                    )}

                    <Form layout="vertical" onFinish={handleForgotPassword} size="large">
                        <Form.Item
                            name="email"
                            rules={[
                                { required: true, message: 'Email wajib diisi' },
                                { type: 'email', message: 'Format email tidak valid' },
                            ]}
                        >
                            <Input prefix={<MailOutlined />} placeholder="Email" />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                block
                                loading={loading}
                                className="btn-primary-blue"
                            >
                                Kirim Link Reset
                            </Button>
                        </Form.Item>
                    </Form>

                    <p className="auth-switch">
                        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                            <ArrowLeftOutlined /> Kembali ke Login
                        </Link>
                    </p>
                </div>
            </div>

            {/* Kanan: Branding */}
            <div className="auth-brand-side">
                <div className="auth-brand-content">
                    <div className="auth-brand-badge">RESET PASSWORD</div>
                    <h2 className="auth-brand-title">Jangan khawatir!</h2>
                    <p className="auth-brand-sub">
                        Lupa password itu wajar. Kami di sini untuk membantu Anda mendapatkan kembali akses ke akun.
                    </p>
                    <ul className="auth-brand-features">
                        <li>✅ Proses cepat dan mudah</li>
                        <li>✅ Link reset dikirim via email</li>
                        <li>✅ Password baru bisa langsung digunakan</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
