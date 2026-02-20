import React from 'react';
import { Form, Input, Button, Card, Breadcrumb, Space, Typography, DatePicker, InputNumber, message } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const { Title } = Typography;

const AddAssetPage: React.FC = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const onFinish = async (values: Record<string, unknown>) => {
        try {
            await api.post('/finance/assets', values);
            message.success('Aset tetap berhasil ditambahkan!');
            navigate('/assets');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            message.error(err.response?.data?.message || 'Gagal menambahkan aset');
        }
    };

    return (
        <div>
            <Breadcrumb className="mb-4" items={[{ title: 'Beranda' }, { title: 'Aset Tetap' }, { title: 'Tambah Aset' }]} />

            <div className="flex justify-between items-center mb-6">
                <Space size="middle">
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
                    <Title level={3} className="!m-0">Tambah Aset Tetap</Title>
                </Space>
                <Button type="primary" icon={<SaveOutlined />} size="large" onClick={() => form.submit()}>Simpan Aset</Button>
            </div>

            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Card className="shadow-sm border-gray-100 rounded-xl max-w-2xl mx-auto" title="Informasi Aset">
                    <Form.Item name="name" label="Nama Aset" rules={[{ required: true, message: 'Nama aset wajib diisi' }]}>
                        <Input placeholder="Contoh: Laptop MacBook Pro 2023" />
                    </Form.Item>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Form.Item name="purchaseDate" label="Tanggal Perolehan" rules={[{ required: true }]}>
                            <DatePicker className="w-full" />
                        </Form.Item>
                        <Form.Item name="usefulLife" label="Umur Ekonomis (Tahun)" rules={[{ required: true }]}>
                            <InputNumber className="w-full" min={1} placeholder="Contoh: 4" />
                        </Form.Item>
                    </div>

                    <Form.Item name="purchaseCost" label="Harga Perolehan" rules={[{ required: true }]}>
                        <InputNumber
                            className="w-full"
                            prefix="Rp"
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                        />
                    </Form.Item>
                </Card>
            </Form>
        </div>
    );
};

export default AddAssetPage;
