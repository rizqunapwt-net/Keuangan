import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Alert } from 'antd';
import api from '../../api';
import './AuthPages.css';
type ApiError = { response?: { data?: { message?: string } } };

const VerifyEmailPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const id = searchParams.get('id');
    const hash = searchParams.get('hash');

    useEffect(() => {
        const verifyEmail = async () => {
            if (!id || !hash) {
                setError('Link verifikasi tidak valid.');
                setLoading(false);
                return;
            }

            try {
                await api.get(`/auth/verify-email/${id}/${encodeURIComponent(hash)}`, {
                    withCredentials: true,
                });
                setSuccess(true);
            } catch (err: unknown) {
                const apiError = err as ApiError;
                setError(apiError.response?.data?.message || 'Verifikasi email gagal. Link mungkin sudah kadaluarsa.');
            } finally {
                setLoading(false);
            }
        };

        verifyEmail();
    }, [id, hash]);

    if (loading) {
        return (
            <div className="auth-page">
                <div className="auth-form-side" style={{ flex: 1 }}>
                    <div className="auth-form-container" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
                        <h1 className="auth-title">Memverifikasi Email...</h1>
                        <p className="auth-subtitle">Mohon tunggu sebentar</p>
                    </div>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="auth-page">
                <div className="auth-form-side" style={{ flex: 1 }}>
                    <div className="auth-form-container">
                        <div className="auth-success-icon">✅</div>
                        <h1 className="auth-title">Email Terverifikasi!</h1>
                        <p className="auth-subtitle">
                            Terima kasih telah melakukan verifikasi email. Akun Anda sudah aktif.
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
            <div className="auth-form-side" style={{ flex: 1 }}>
                <div className="auth-form-container">
                    <div className="auth-success-icon">❌</div>
                    <h1 className="auth-title">Verifikasi Gagal</h1>
                    <p className="auth-subtitle">{error}</p>
                    
                    {error && (
                        <Alert
                            type="error"
                            message={error}
                            showIcon
                            style={{ marginBottom: 20 }}
                        />
                    )}

                    <Button 
                        type="primary" 
                        block 
                        size="large" 
                        className="btn-primary-blue"
                        onClick={() => navigate('/login')}
                    >
                        Kembali ke Login
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmailPage;
