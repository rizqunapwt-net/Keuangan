import React from 'react';
import { Form, Input, InputNumber, Button, Switch, Card, Typography, Breadcrumb, Space, message } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const { Title } = Typography;

const AddProductPage: React.FC = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const onFinish = async (values: Record<string, unknown>) => {
        try {
            await api.post('/finance/products', values);
            message.success('Produk berhasil ditambahkan!');
            navigate('/products');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            message.error(err.response?.data?.message || 'Gagal menambahkan produk');
        }
    };

    return (
        <div>
            <Breadcrumb className="mb-4" items={[{ title: 'Beranda' }, { title: 'Produk' }, { title: 'Tambah Produk' }]} />

            <div className="flex justify-between items-center mb-6">
                <Space size="middle">
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
                    <Title level={3} className="!m-0">Tambah Produk</Title>
                </Space>
                <Button type="primary" icon={<SaveOutlined />} size="large" onClick={() => form.submit()}>Simpan Produk</Button>
            </div>

            <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ isTracked: true }}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="shadow-sm border-gray-100 rounded-xl" title="Informasi Produk">
                        <Form.Item name="name" label="Nama Produk" rules={[{ required: true }]}>
                            <Input placeholder="Contoh: Kertas A4 80gr" />
                        </Form.Item>
                        <Form.Item name="sku" label="SKU / Kode Produk" rules={[{ required: true }]}>
                            <Input placeholder="PROD-0001" />
                        </Form.Item>
                        <Form.Item name="isTracked" label="Lacak Persediaan Stok" valuePropName="checked">
                            <Switch />
                        </Form.Item>
                    </Card>

                    <Card className="shadow-sm border-gray-100 rounded-xl" title="Informasi Harga">
                        <Form.Item name="purchasePrice" label="Harga Beli Satuan" rules={[{ required: true }]}>
                            <InputNumber className="w-full" prefix="Rp" formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                        </Form.Item>
                        <Form.Item name="sellPrice" label="Harga Jual Satuan" rules={[{ required: true }]}>
                            <InputNumber className="w-full" prefix="Rp" formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                        </Form.Item>
                    </Card>
                </div>
            </Form>
        </div>
    );
};

export default AddProductPage;
