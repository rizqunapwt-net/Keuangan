import React from 'react';
import { Form, Input, Button, Card, Breadcrumb, Space, Typography, message } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const { Title } = Typography;

const AddEmployeePage: React.FC = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const onFinish = async (values: Record<string, unknown>) => {
        try {
            await api.post('/finance/payroll/employees', values);
            message.success('Karyawan berhasil ditambahkan!');
            navigate('/payroll/employees');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            message.error(err.response?.data?.message || 'Gagal menambahkan karyawan');
        }
    };

    return (
        <div>
            <Breadcrumb className="mb-4" items={[{ title: 'Beranda' }, { title: 'Payroll' }, { title: 'Tambah Karyawan' }]} />

            <div className="flex justify-between items-center mb-6">
                <Space size="middle">
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
                    <Title level={3} className="!m-0">Tambah Karyawan</Title>
                </Space>
                <Button type="primary" icon={<SaveOutlined />} size="large" onClick={() => form.submit()}>Simpan Data</Button>
            </div>

            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Card className="shadow-sm border-gray-100 rounded-xl max-w-2xl mx-auto" title="Informasi Personal">
                    <Form.Item name="name" label="Nama Lengkap" rules={[{ required: true, message: 'Nama karyawan wajib diisi' }]}>
                        <Input placeholder="Contoh: Budi Santoso" prefix={<UserOutlined />} />
                    </Form.Item>

                    <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Format email tidak valid' }]}>
                        <Input placeholder="budis@example.com" />
                    </Form.Item>

                    <Form.Item name="phone" label="No. Telepon">
                        <Input placeholder="08XXXXXXXXXX" />
                    </Form.Item>

                    <Form.Item name="address" label="Alamat Tinggal">
                        <Input.TextArea rows={3} placeholder="Alamat lengkap karyawan..." />
                    </Form.Item>
                </Card>
            </Form>
        </div>
    );
};

export default AddEmployeePage;
