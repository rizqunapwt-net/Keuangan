import React, { useState } from 'react';
import {
    Form,
    Input,
    Button,
    Card,
    Typography,
    message,
    Steps,
    Row,
    Col,
    Checkbox,
} from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, BookOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

const AuthorRegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<any>({});
    const [form] = Form.useForm();

    const nextStep = () => {
        form.validateFields().then(() => {
            const values = form.getFieldsValue();
            setFormData({ ...formData, ...values });
            setCurrentStep(currentStep + 1);
        }).catch((info) => {
            console.log('Validate Failed:', info);
        });
    };

    const prevStep = () => {
        setCurrentStep(currentStep - 1);
    };

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const finalData = { ...formData, ...values };
            
            const response = await api.post('/authors/register', {
                name: finalData.name,
                email: finalData.email,
                username: finalData.username,
                password: finalData.password,
                password_confirmation: finalData.password_confirmation,
                phone: finalData.phone,
                bio: finalData.bio,
                bank_name: finalData.bank_name,
                bank_account: finalData.bank_account,
                bank_account_name: finalData.bank_account_name,
            });

            message.success({
                content: 'Pendaftaran berhasil! Silakan login dengan email dan password Anda.',
                duration: 5,
            });
            
            setTimeout(() => {
                navigate('/admin/login', { 
                    state: { 
                        registeredEmail: finalData.email 
                    } 
                });
            }, 2000);
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Pendaftaran gagal';
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
            <Card className="w-full max-w-2xl shadow-2xl rounded-2xl border-none">
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
                    <Title level={2} className="!mb-1">Menjadi Penulis Rizquna</Title>
                    <Paragraph type="secondary">
                        Bergabunglah bersama kami dan publikasikan karya Anda
                    </Paragraph>
                </div>

                <Steps current={currentStep} className="mb-8">
                    <Step title="Akun" />
                    <Step title="Profil" />
                    <Step title="Bank" />
                    <Step title="Selesai" />
                </Steps>

                <Form
                    form={form}
                    name="author_register"
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                    initialValues={{
                        password_confirmation: form.getFieldValue('password'),
                    }}
                >
                    {currentStep === 0 && (
                        <>
                            <Title level={5} className="mb-4">Informasi Akun</Title>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="name"
                                        label="Nama Lengkap"
                                        rules={[
                                            { required: true, message: 'Nama lengkap wajib diisi' },
                                            { min: 3, message: 'Nama minimal 3 karakter' }
                                        ]}
                                    >
                                        <Input prefix={<UserOutlined />} placeholder="Nama Lengkap" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="username"
                                        label="Username"
                                        rules={[
                                            { required: true, message: 'Username wajib diisi' },
                                            { min: 3, message: 'Username minimal 3 karakter' },
                                            { pattern: /^[a-zA-Z0-9_]+$/, message: 'Username hanya boleh mengandung huruf, angka, dan underscore' }
                                        ]}
                                    >
                                        <Input prefix={<UserOutlined />} placeholder="username" />
                                    </Form.Item>
                                </Col>
                            </Row>

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

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="password"
                                        label="Password"
                                        rules={[
                                            { required: true, message: 'Password wajib diisi' },
                                            { min: 8, message: 'Password minimal 8 karakter' }
                                        ]}
                                    >
                                        <Input.Password prefix={<LockOutlined />} placeholder="Minimal 8 karakter" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="password_confirmation"
                                        label="Konfirmasi Password"
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
                                </Col>
                            </Row>

                            <Form.Item>
                                <Button type="primary" onClick={nextStep} block size="large">
                                    Lanjut
                                </Button>
                            </Form.Item>
                        </>
                    )}

                    {currentStep === 1 && (
                        <>
                            <Title level={5} className="mb-4">Profil Penulis</Title>
                            
                            <Form.Item
                                name="phone"
                                label="Nomor Telepon/WhatsApp"
                                rules={[
                                    { required: true, message: 'Nomor telepon wajib diisi' },
                                    { pattern: /^[0-9+\-\s()]+$/, message: 'Format nomor tidak valid' }
                                ]}
                            >
                                <Input prefix={<PhoneOutlined />} placeholder="08123456789" />
                            </Form.Item>

                            <Form.Item
                                name="bio"
                                label="Biografi Singkat"
                                rules={[{ min: 10, message: 'Biografi minimal 10 karakter' }]}
                            >
                                <Input.TextArea 
                                    rows={4} 
                                    placeholder="Ceritakan tentang diri Anda dan karya-karya Anda..."
                                    showCount
                                    maxLength={500}
                                />
                            </Form.Item>

                            <div style={{ display: 'flex', gap: '8px' }}>
                                <Button onClick={prevStep} size="large">
                                    Kembali
                                </Button>
                                <Button type="primary" onClick={nextStep} block size="large">
                                    Lanjut
                                </Button>
                            </div>
                        </>
                    )}

                    {currentStep === 2 && (
                        <>
                            <Title level={5} className="mb-4">Informasi Bank (Untuk Royalti)</Title>
                            <Paragraph type="secondary" className="mb-4">
                                Informasi ini digunakan untuk pembayaran royalti penjualan buku Anda
                            </Paragraph>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="bank_name"
                                        label="Nama Bank"
                                        rules={[{ required: true, message: 'Nama bank wajib diisi' }]}
                                    >
                                        <Input placeholder="Contoh: BCA, Mandiri, BNI" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="bank_account"
                                        label="Nomor Rekening"
                                        rules={[
                                            { required: true, message: 'Nomor rekening wajib diisi' },
                                            { pattern: /^[0-9]+$/, message: 'Nomor rekening hanya boleh angka' }
                                        ]}
                                    >
                                        <Input placeholder="Nomor rekening" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                name="bank_account_name"
                                label="Nama Pemilik Rekening"
                                rules={[{ required: true, message: 'Nama pemilik rekening wajib diisi' }]}
                            >
                                <Input placeholder="Nama sesuai rekening" />
                            </Form.Item>

                            <div style={{ display: 'flex', gap: '8px' }}>
                                <Button onClick={prevStep} size="large">
                                    Kembali
                                </Button>
                                <Button type="primary" htmlType="submit" loading={loading} block size="large">
                                    Daftar Sekarang
                                </Button>
                            </div>
                        </>
                    )}
                </Form>

                <div className="mt-6 text-center">
                    <Text type="secondary">
                        Sudah punya akun?{' '}
                        <Button type="link" onClick={() => navigate('/admin/login')} className="p-0">
                            Login di sini
                        </Button>
                    </Text>
                </div>

                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        <strong>Keuntungan Bergabung:</strong>
                        <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                            <li>Publikasi buku di platform Rizquna</li>
                            <li>Royalti transparan hingga 10% dari penjualan</li>
                            <li>Tracking penjualan real-time</li>
                            <li>Laporan royalti detail per bulan</li>
                            <li>Dukungan dari tim profesional</li>
                        </ul>
                    </Text>
                </div>
            </Card>
        </div>
    );
};

export default AuthorRegisterPage;
