import React from 'react';
import { Form, Input, Button, Card, Typography, Select, message, Space, Breadcrumb } from 'antd';
import { SaveOutlined, ArrowLeftOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const { Title } = Typography;
const { Option } = Select;

const AddContactPage: React.FC = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const onFinish = async (values: Record<string, unknown>) => {
        try {
            await api.post('/finance/contacts', values);
            message.success('Kontak berhasil ditambahkan!');
            navigate('/contacts');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            message.error(err.response?.data?.message || 'Gagal menambahkan kontak');
        }
    };

    return (
        <div>
            <Breadcrumb className="mb-4" items={[{ title: 'Beranda' }, { title: 'Kontak' }, { title: 'Tambah' }]} />

            <div className="flex justify-between items-center mb-6">
                <Space size="middle">
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
                    <Title level={3} className="!m-0">Tambah Kontak Baru</Title>
                </Space>
                <Button type="primary" icon={<SaveOutlined />} size="large" onClick={() => form.submit()}>Simpan Kontak</Button>
            </div>

            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Card className="shadow-sm border-gray-100 rounded-xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Form.Item name="name" label="Nama Lengkap" rules={[{ required: true }]}>
                            <Input prefix={<UserOutlined />} placeholder="e.g. Budi Santoso" size="large" />
                        </Form.Item>

                        <Form.Item name="type" label="Tipe Kontak" rules={[{ required: true }]} initialValue="customer">
                            <Select size="large">
                                <Option value="customer">Pelanggan</Option>
                                <Option value="vendor">Pemasok</Option>
                                <Option value="employee">Karyawan</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item name="email" label="Email" rules={[{ type: 'email' }]}>
                            <Input placeholder="e.g. budi@email.com" size="large" />
                        </Form.Item>

                        <Form.Item name="phone" label="Nomor Telepon">
                            <Input placeholder="e.g. 08123456789" size="large" />
                        </Form.Item>

                        <Form.Item name="address" label="Alamat" className="md:col-span-2">
                            <Input.TextArea placeholder="Alamat lengkap..." rows={3} />
                        </Form.Item>
                    </div>
                </Card>
            </Form>
        </div>
    );
};

export default AddContactPage;
