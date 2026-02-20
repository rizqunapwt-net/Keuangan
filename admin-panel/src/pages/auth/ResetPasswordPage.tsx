import React, { useState, useEffect } from 'react';
import {
    Form,
    Input,
    Button,
    Card,
    Typography,
    message,
    Alert,
} from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api';

const { Title, Paragraph } = Typography;

const ResetPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [validToken, setValidToken] = useState<boolean | null>(null);
    const [form] = Form.useForm();

    const token = searchParams.get('token');
    const email = searchParams.get('email');

    useEffect(() => {
        // Verify token exists
        if (!token || !email) {
            setValidToken(false);
            message.error('Link reset password tidak valid');
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
                content: 'Password berhasil direset! Silakan login dengan password baru.',
                duration: 3,
            });
            
            setTimeout(() => {
                navigate('/admin/login');
            }, 2000);
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Gagal reset password';
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (validToken === false) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
                <Card className="w-full max-w-md shadow-2xl rounded-2xl border-none">
                    <Alert
                        message="Link Tidak Valid"
                        description="Link reset password ini tidak valid atau sudah kadaluarsa. Silakan minta link reset password yang baru."
                        type="error"
                        showIcon
                        className="mb-6"
                    />
                    <Button
                        type="primary"
                        onClick={() => navigate('/admin/forgot-password')}
                        block
                        size="large"
                    >
                        Minta Link Reset Baru
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
            <Card className="w-full max-w-md shadow-2xl rounded-2xl border-none">
                <div className="text-center mb-8">
                    <div style={{
                        width: 64, height: 64, borderRadius: 16,
                        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 800, fontSize: 28,
                        margin: '0 auto 16px',
                    }}>
                        RE
                    </div>
                    <Title level={3} className="!mb-1">Reset Password</Title>
                    <Paragraph type="secondary">
                        Masukkan password baru Anda
                    </Paragraph>
                </div>

                <Form
                    form={form}
                    name="reset_password"
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                    initialValues={{
                        password_confirmation: form.getFieldValue('password'),
                    }}
                >
                    <Form.Item
                        name="password"
                        label="Password Baru"
                        rules={[
                            { required: true, message: 'Password wajib diisi' },
                            { min: 8, message: 'Password minimal 8 karakter' }
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Minimal 8 karakter" />
                    </Form.Item>

                    <Form.Item
                        name="password_confirmation"
                        label="Konfirmasi Password Baru"
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
                        <Input.Password prefix={<LockOutlined />} placeholder="Ulangi password" />
                    </Form.Item>

                    <Form.Item>
                        <Button 
                            type="primary" 
                            htmlType="submit" 
                            loading={loading}
                            block 
                            size="large"
                        >
                            Reset Password
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default ResetPasswordPage;
