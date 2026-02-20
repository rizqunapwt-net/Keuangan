import React, { useState } from 'react';
import {
    Form,
    Input,
    Button,
    Card,
    Typography,
    message,
    Alert,
} from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
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
                content: 'Email reset password telah dikirim!',
                duration: 5,
            });
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Gagal mengirim email reset';
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
            <Card className="w-full max-w-md shadow-2xl rounded-2xl border-none">
                <div className="text-center mb-8">
                    <Button
                        type="link"
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate('/admin/login')}
                        className="mb-4"
                    >
                        Kembali
                    </Button>
                    
                    <div style={{
                        width: 64, height: 64, borderRadius: 16,
                        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 800, fontSize: 28,
                        margin: '0 auto 16px',
                    }}>
                        RE
                    </div>
                    <Title level={3} className="!mb-1">Lupa Password?</Title>
                    <Paragraph type="secondary">
                        Jangan khawatir, masukkan email Anda dan kami akan mengirimkan link reset password
                    </Paragraph>
                </div>

                {submitted ? (
                    <Alert
                        message="Email Terkirim!"
                        description={
                            <div>
                                <p>Kami telah mengirim link reset password ke:</p>
                                <p className="font-semibold mt-2">{email}</p>
                                <p className="mt-4 text-sm">
                                    Periksa folder inbox atau spam Anda. Link reset password berlaku selama 60 menit.
                                </p>
                                <Button
                                    type="link"
                                    onClick={() => {
                                        setSubmitted(false);
                                        form.resetFields();
                                    }}
                                    className="mt-4"
                                >
                                    Kirim Ulang Email
                                </Button>
                            </div>
                        }
                        type="success"
                        showIcon
                        className="mb-6"
                    />
                ) : (
                    <Form
                        form={form}
                        name="forgot_password"
                        onFinish={onFinish}
                        layout="vertical"
                        size="large"
                    >
                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[
                                { required: true, message: 'Email wajib diisi' },
                                { type: 'email', message: 'Format email tidak valid' }
                            ]}
                        >
                            <Input prefix={<MailOutlined />} placeholder="email@contoh.com" />
                        </Form.Item>

                        <Form.Item>
                            <Button 
                                type="primary" 
                                htmlType="submit" 
                                loading={loading}
                                block 
                                size="large"
                            >
                                Kirim Link Reset
                            </Button>
                        </Form.Item>
                    </Form>
                )}

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        <strong>Tips:</strong> Pastikan Anda menggunakan email yang sama dengan yang terdaftar di akun penulis Anda. 
                        Periksa folder spam jika email tidak muncul di inbox.
                    </Text>
                </div>
            </Card>
        </div>
    );
};

export default ForgotPasswordPage;
