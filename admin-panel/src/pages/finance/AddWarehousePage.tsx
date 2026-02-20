import React from 'react';
import { Form, Input, Button, Card, Breadcrumb, Space, Typography, message } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, ShopOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const { Title } = Typography;

const AddWarehousePage: React.FC = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const onFinish = async (values: Record<string, unknown>) => {
        try {
            await api.post('/finance/warehouses', values);
            message.success('Gudang berhasil ditambahkan!');
            navigate('/warehouses');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            message.error(err.response?.data?.message || 'Gagal menambahkan gudang');
        }
    };

    return (
        <div>
            <Breadcrumb className="mb-4" items={[{ title: 'Beranda' }, { title: 'Gudang' }, { title: 'Tambah Gudang' }]} />

            <div className="flex justify-between items-center mb-6">
                <Space size="middle">
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
                    <Title level={3} className="!m-0">Tambah Gudang</Title>
                </Space>
                <Button type="primary" icon={<SaveOutlined />} size="large" onClick={() => form.submit()}>Simpan Gudang</Button>
            </div>

            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Card className="shadow-sm border-gray-100 rounded-xl max-w-2xl mx-auto" title="Informasi Lokasi">
                    <Form.Item name="name" label="Nama Gudang" rules={[{ required: true, message: 'Nama gudang wajib diisi' }]}>
                        <Input placeholder="Contoh: Gudang Pusat" prefix={<ShopOutlined />} />
                    </Form.Item>

                    <Form.Item name="location" label="Lokasi / Alamat" rules={[{ required: true }]}>
                        <Input placeholder="Contoh: Jakarta Selatan" />
                    </Form.Item>

                    <Form.Item name="description" label="Keterangan">
                        <Input.TextArea rows={3} placeholder="Catatan tambahan mengenai gudang ini..." />
                    </Form.Item>
                </Card>
            </Form>
        </div>
    );
};

export default AddWarehousePage;
