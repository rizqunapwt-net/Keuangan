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
    Space,
    Divider,
    Alert,
    Progress,
} from 'antd';
import {
    UserOutlined,
    LockOutlined,
    MailOutlined,
    PhoneOutlined,
    BookOutlined,
    BankOutlined,
    CheckCircleOutlined,
    ArrowRightOutlined,
    ArrowLeftOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api';

const { Title, Text, Paragraph } = Typography;

// Animation variants
const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            staggerChildren: 0.1,
        },
    },
    exit: {
        opacity: 0,
        y: -20,
        transition: { duration: 0.3 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

const AuthorRegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<any>({});
    const [form] = Form.useForm();
    const [passwordVisible, setPasswordVisible] = useState(false);

    const totalSteps = 4;
    const progress = ((currentStep + 1) / totalSteps) * 100;

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
            
            await api.post('/authors/register', {
                name: finalData.name,
                username: finalData.username,
                email: finalData.email,
                password: finalData.password,
                password_confirmation: finalData.password_confirmation,
                phone: finalData.phone,
                bio: finalData.bio,
                bank_name: finalData.bank_name,
                bank_account: finalData.bank_account,
                bank_account_name: finalData.bank_account_name,
            });

            message.success({
                content: '🎉 Pendaftaran berhasil! Silakan login dengan email dan password Anda.',
                duration: 5,
                icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
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
            message.error({
                content: errorMsg,
                duration: 5,
            });
        } finally {
            setLoading(false);
        }
    };

    const stepTitles = [
        'Informasi Akun',
        'Profil Penulis',
        'Informasi Bank',
        'Selesai',
    ];

    const stepIcons = [
        <UserOutlined key="1" />,
        <BookOutlined key="2" />,
        <BankOutlined key="3" />,
        <CheckCircleOutlined key="4" />,
    ];

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-2 sm:p-4 md:p-6 lg:p-8">
            {/* Animated background elements */}
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
                className="w-full max-w-4xl relative z-10"
            >
                <Card 
                    className="shadow-2xl rounded-3xl border-none overflow-hidden"
                    bodyStyle={{ padding: 0 }}
                >
                    {/* Header with gradient */}
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
                                RE
                            </motion.div>
                            <Title level={2} className="!mb-2 !text-white text-3xl md:text-4xl">
                                Menjadi Penulis Rizquna
                            </Title>
                            <Paragraph className="!text-white/90 text-sm md:text-base max-w-xl mx-auto">
                                Bergabunglah bersama kami dan publikasikan karya Anda untuk jutaan pembaca
                            </Paragraph>
                        </motion.div>
                    </div>

                    {/* Progress bar */}
                    <div className="px-6 md:px-8 pt-6">
                        <div className="flex justify-between items-center mb-2">
                            <Text className="text-sm font-medium">Progress Registrasi</Text>
                            <Text className="text-sm font-medium">{Math.round(progress)}%</Text>
                        </div>
                        <Progress 
                            percent={progress} 
                            showInfo={false} 
                            strokeColor={{
                                '0%': '#4f46e5',
                                '100%': '#ec4899',
                            }}
                            className="mb-6"
                        />
                    </div>

                    {/* Steps - Responsive */}
                    <div className="px-6 md:px-8 mb-6">
                        <Steps 
                            current={currentStep} 
                            className="hidden md:block"
                            items={stepTitles.map((title, idx) => ({
                                key: idx,
                                title,
                                icon: stepIcons[idx],
                            }))}
                        />
                        {/* Mobile steps indicator */}
                        <div className="md:hidden flex justify-between items-center">
                            {stepTitles.map((title, idx) => (
                                <motion.div
                                    key={idx}
                                    className={`flex flex-col items-center ${idx === currentStep ? 'text-indigo-600' : 'text-gray-400'}`}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                        idx === currentStep 
                                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' 
                                            : idx < currentStep 
                                            ? 'bg-green-500 text-white' 
                                            : 'bg-gray-200'
                                    }`}>
                                        {idx < currentStep ? <CheckCircleOutlined /> : idx + 1}
                                    </div>
                                    <Text className="text-xs mt-1 hidden lg:block">{title.split(' ')[0]}</Text>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <Divider className="!my-4" />

                    {/* Form Content */}
                    <div className="px-6 md:px-8 pb-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                            >
                                <Form
                                    form={form}
                                    name="author_register"
                                    onFinish={onFinish}
                                    layout="vertical"
                                    size="large"
                                    autoComplete="off"
                                >
                                    {currentStep === 0 && (
                                        <motion.div variants={itemVariants}>
                                            <Title level={5} className="mb-4 text-indigo-600">
                                                <UserOutlined className="mr-2" />
                                                Informasi Akun
                                            </Title>
                                            <Row gutter={[16, 16]}>
                                                <Col xs={24} sm={12}>
                                                    <Form.Item
                                                        name="name"
                                                        label={<span className="font-medium">Nama Lengkap <span className="text-red-500">*</span></span>}
                                                        rules={[
                                                            { required: true, message: 'Nama lengkap wajib diisi' },
                                                            { min: 3, message: 'Nama minimal 3 karakter' }
                                                        ]}
                                                    >
                                                        <Input 
                                                            prefix={<UserOutlined className="text-gray-400" />} 
                                                            placeholder="Nama Lengkap" 
                                                            className="h-12"
                                                            allowClear
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col xs={24} sm={12}>
                                                    <Form.Item
                                                        name="username"
                                                        label={<span className="font-medium">Username <span className="text-red-500">*</span></span>}
                                                        rules={[
                                                            { required: true, message: 'Username wajib diisi' },
                                                            { min: 3, message: 'Username minimal 3 karakter' },
                                                            { pattern: /^[a-zA-Z0-9_]+$/, message: 'Username hanya boleh mengandung huruf, angka, dan underscore' }
                                                        ]}
                                                    >
                                                        <Input 
                                                            prefix={<UserOutlined className="text-gray-400" />} 
                                                            placeholder="username" 
                                                            className="h-12"
                                                            allowClear
                                                        />
                                                    </Form.Item>
                                                </Col>
                                            </Row>

                                            <Form.Item
                                                name="email"
                                                label={<span className="font-medium">Email <span className="text-red-500">*</span></span>}
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

                                            <Row gutter={[16, 16]}>
                                                <Col xs={24} sm={12}>
                                                    <Form.Item
                                                        name="password"
                                                        label={<span className="font-medium">Password <span className="text-red-500">*</span></span>}
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
                                                </Col>
                                                <Col xs={24} sm={12}>
                                                    <Form.Item
                                                        name="password_confirmation"
                                                        label={<span className="font-medium">Konfirmasi Password <span className="text-red-500">*</span></span>}
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
                                                </Col>
                                            </Row>

                                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                                <Button 
                                                    type="primary" 
                                                    onClick={nextStep} 
                                                    block 
                                                    size="large"
                                                    className="h-14 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 border-none"
                                                >
                                                    Lanjut <ArrowRightOutlined className="ml-2" />
                                                </Button>
                                            </motion.div>
                                        </motion.div>
                                    )}

                                    {currentStep === 1 && (
                                        <motion.div variants={itemVariants}>
                                            <Title level={5} className="mb-4 text-indigo-600">
                                                <BookOutlined className="mr-2" />
                                                Profil Penulis
                                            </Title>
                                            
                                            <Form.Item
                                                name="phone"
                                                label={<span className="font-medium">Nomor Telepon/WhatsApp <span className="text-red-500">*</span></span>}
                                                rules={[
                                                    { required: true, message: 'Nomor telepon wajib diisi' },
                                                    { pattern: /^[0-9+\-\s()]+$/, message: 'Format nomor tidak valid' }
                                                ]}
                                            >
                                                <Input 
                                                    prefix={<PhoneOutlined className="text-gray-400" />} 
                                                    placeholder="08123456789" 
                                                    className="h-12"
                                                    allowClear
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                name="bio"
                                                label={<span className="font-medium">Biografi Singkat</span>}
                                                rules={[{ min: 10, message: 'Biografi minimal 10 karakter' }]}
                                            >
                                                <Input.TextArea 
                                                    rows={4} 
                                                    placeholder="Ceritakan tentang diri Anda dan karya-karya Anda..."
                                                    showCount
                                                    maxLength={500}
                                                    className="resize-none"
                                                />
                                            </Form.Item>

                                            <Space size="large" className="w-full">
                                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                    <Button 
                                                        onClick={prevStep} 
                                                        size="large"
                                                        icon={<ArrowLeftOutlined />}
                                                    >
                                                        Kembali
                                                    </Button>
                                                </motion.div>
                                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                                                    <Button 
                                                        type="primary" 
                                                        onClick={nextStep} 
                                                        block 
                                                        size="large"
                                                        className="h-14 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 border-none"
                                                    >
                                                        Lanjut <ArrowRightOutlined className="ml-2" />
                                                    </Button>
                                                </motion.div>
                                            </Space>
                                        </motion.div>
                                    )}

                                    {currentStep === 2 && (
                                        <motion.div variants={itemVariants}>
                                            <Title level={5} className="mb-4 text-indigo-600">
                                                <BankOutlined className="mr-2" />
                                                Informasi Bank (Untuk Royalti)
                                            </Title>
                                            <Alert
                                                message="Informasi ini digunakan untuk pembayaran royalti penjualan buku Anda"
                                                type="info"
                                                showIcon
                                                className="mb-6"
                                                icon={<CheckCircleOutlined />}
                                            />

                                            <Row gutter={[16, 16]}>
                                                <Col xs={24} sm={12}>
                                                    <Form.Item
                                                        name="bank_name"
                                                        label={<span className="font-medium">Nama Bank <span className="text-red-500">*</span></span>}
                                                        rules={[{ required: true, message: 'Nama bank wajib diisi' }]}
                                                    >
                                                        <Input 
                                                            placeholder="Contoh: BCA, Mandiri, BNI" 
                                                            className="h-12"
                                                            allowClear
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col xs={24} sm={12}>
                                                    <Form.Item
                                                        name="bank_account"
                                                        label={<span className="font-medium">Nomor Rekening <span className="text-red-500">*</span></span>}
                                                        rules={[
                                                            { required: true, message: 'Nomor rekening wajib diisi' },
                                                            { pattern: /^[0-9]+$/, message: 'Nomor rekening hanya boleh angka' }
                                                        ]}
                                                    >
                                                        <Input 
                                                            placeholder="Nomor rekening" 
                                                            className="h-12"
                                                            allowClear
                                                        />
                                                    </Form.Item>
                                                </Col>
                                            </Row>

                                            <Form.Item
                                                name="bank_account_name"
                                                label={<span className="font-medium">Nama Pemilik Rekening <span className="text-red-500">*</span></span>}
                                                rules={[{ required: true, message: 'Nama pemilik rekening wajib diisi' }]}
                                            >
                                                <Input 
                                                    placeholder="Nama sesuai rekening" 
                                                    className="h-12"
                                                    allowClear
                                                />
                                            </Form.Item>

                                            <Space size="large" className="w-full">
                                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                    <Button 
                                                        onClick={prevStep} 
                                                        size="large"
                                                        icon={<ArrowLeftOutlined />}
                                                    >
                                                        Kembali
                                                    </Button>
                                                </motion.div>
                                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                                                    <Button 
                                                        type="primary" 
                                                        htmlType="submit" 
                                                        loading={loading}
                                                        block 
                                                        size="large"
                                                        className="h-14 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 border-none"
                                                    >
                                                        {loading ? 'Mendaftar...' : 'Daftar Sekarang'} <CheckCircleOutlined className="ml-2" />
                                                    </Button>
                                                </motion.div>
                                            </Space>
                                        </motion.div>
                                    )}
                                </Form>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Footer */}
                    <Divider className="!my-0" />
                    <div className="p-6 md:p-8 bg-gray-50">
                        <div className="text-center">
                            <Text type="secondary">
                                Sudah punya akun?{' '}
                                <Button 
                                    type="link" 
                                    onClick={() => navigate('/admin/login')} 
                                    className="p-0 font-semibold text-indigo-600 hover:text-indigo-800"
                                >
                                    Login di sini
                                </Button>
                            </Text>
                        </div>

                        <motion.div 
                            className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <Text type="secondary" className="text-xs block mb-2 font-semibold">
                                🎁 Keuntungan Bergabung dengan New Rizquna Elfath:
                            </Text>
                            <ul className="text-xs space-y-1 text-gray-600">
                                <li className="flex items-start">
                                    <CheckCircleOutlined className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>Publikasi buku di platform New Rizquna Elfath</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircleOutlined className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>Royalti transparan hingga 10% dari penjualan</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircleOutlined className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>Tracking penjualan real-time</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircleOutlined className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>Laporan royalti detail per bulan</span>
                                </li>
                            </ul>
                        </motion.div>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
};

export default AuthorRegisterPage;
