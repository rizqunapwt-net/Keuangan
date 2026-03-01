import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Form, Input, Button, Alert } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import api from '../../api';
import './AuthPages.css';
type ApiError = { response?: { data?: { message?: string; error?: string } } };

const ResetPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const token = searchParams.get('token');

    const handleResetPassword = async (values: { password: string; password_confirmation: string }) => {
        if (!token) {
            setError('Token reset tidak valid.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await api.post('/auth/reset-password', {
                token,
                email: searchParams.get('email') || '',
                password: values.password,
                password_confirmation: values.password_confirmation,
            }, { withCredentials: true });

            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err: unknown) {
            const apiError = err as ApiError;
            setError(apiError.response?.data?.message || apiError.response?.data?.error || 'Gagal mereset password.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="auth-page">
                <div className="auth-form-side" style={{ flex: 1 }}>
                    <div className="auth-form-container">
                        <div className="auth-success-icon">✅</div>
                        <h1 className="auth-title">Password Berhasil Direset!</h1>
                        <p className="auth-subtitle">
                            Password Anda telah berhasil diubah. Silakan login dengan password baru.
                        </p>
                        <Button
                            type="primary"
                            block
                            size="large"
                            className="btn-primary-blue"
                            onClick={() => navigate('/login')}
                        >
                            Login Sekarang
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

                    <h1 className="auth-title">Reset Password</h1>
                    <p className="auth-subtitle">Masukkan password baru Anda</p>

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

                    <Form layout="vertical" onFinish={handleResetPassword} size="large">
                        <Form.Item
                            name="password"
                            rules={[
                                { required: true, message: 'Password wajib diisi' },
                                { min: 8, message: 'Password minimal 8 karakter' },
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="Password Baru (min. 8 karakter)"
                            />
                        </Form.Item>

                        <Form.Item
                            name="password_confirmation"
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
                                prefix={<LockOutlined />}
                                placeholder="Konfirmasi Password Baru"
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                block
                                loading={loading}
                                className="btn-primary-blue"
                            >
                                Reset Password
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>

            {/* Kanan: Branding */}
            <div className="auth-brand-side">
                <div className="auth-brand-content">
                    <div className="auth-brand-badge">KEAMANAN AKUN</div>
                    <h2 className="auth-brand-title">Buat Password Kuat</h2>
                    <p className="auth-brand-sub">
                        Gunakan kombinasi huruf besar, huruf kecil, angka, dan simbol untuk keamanan maksimal.
                    </p>
                    <ul className="auth-brand-features">
                        <li>✅ Minimal 8 karakter</li>
                        <li>✅ Kombinasi huruf & angka</li>
                        <li>✅ Hindari password yang mudah ditebak</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
