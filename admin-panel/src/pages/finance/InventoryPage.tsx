import React from 'react';
import { Table, Button, Card, Typography, Space, Breadcrumb, Input, Tabs, Row, Col, Statistic, message } from 'antd';
import { PlusOutlined, SearchOutlined, FilterOutlined, SwapOutlined, InboxOutlined, WarningOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const { Title, Text } = Typography;

interface ProductInventory {
    id: number;
    name: string;
    sku: string;
    unit: string;
    currentStock: number;
    purchasePrice: number;
}

const InventoryPage: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = React.useState<string>('all');

    const { data: products = [], isLoading } = useQuery<ProductInventory[]>({
        queryKey: ['products-inventory'],
        queryFn: async () => {
            try {
                const res = await api.get('/finance/products');
                return res.data?.data || res.data || [];
            }
            catch { return []; }
        },
    });

    const totalStock = products.reduce((s: number, p: ProductInventory) => s + (p.currentStock || 0), 0);
    const lowStock = products.filter((p: ProductInventory) => (p.currentStock || 0) > 0 && (p.currentStock || 0) <= 5).length;
    const outOfStock = products.filter((p: ProductInventory) => (p.currentStock || 0) <= 0).length;
    const totalValue = products.reduce((s: number, p: ProductInventory) => s + (p.currentStock || 0) * Number(p.purchasePrice || 0), 0);

    const filteredData = activeTab === 'all' ? products :
        activeTab === 'low' ? products.filter((p: ProductInventory) => (p.currentStock || 0) > 0 && (p.currentStock || 0) <= 5) :
            activeTab === 'out' ? products.filter((p: ProductInventory) => (p.currentStock || 0) <= 0) : products;

    const columns = [
        {
            title: 'Nama Produk', dataIndex: 'name', key: 'name', sorter: true,
            render: (t: string, r: ProductInventory) => <a onClick={() => navigate(`/products/${r.id}`)} style={{ fontWeight: 600, color: '#1890ff' }}>{t}</a>
        },
        { title: 'Kode/SKU', dataIndex: 'sku', key: 'sku' },
        { title: 'Gudang', key: 'warehouse', render: () => 'Gudang Utama' },
        { title: 'Satuan', dataIndex: 'unit', key: 'unit' },
        {
            title: 'Stok', dataIndex: 'currentStock', key: 'stock', align: 'right' as const, sorter: true,
            render: (v: number) => {
                const stock = Number(v || 0);
                return <Text strong style={{ color: stock <= 0 ? '#ff4d4f' : stock <= 5 ? '#faad14' : '#52c41a' }}>{stock}</Text>;
            },
        },
        {
            title: 'Harga Beli', dataIndex: 'purchasePrice', key: 'purchasePrice', align: 'right' as const,
            render: (v: number) => `Rp ${Number(v).toLocaleString('id-ID')}`
        },
        {
            title: 'Nilai Stok', key: 'stockValue', align: 'right' as const,
            render: (_: unknown, r: ProductInventory) => <Text strong>Rp {(Number(r.currentStock || 0) * Number(r.purchasePrice || 0)).toLocaleString('id-ID')}</Text>
        },
    ];

    return (
        <div>
            <Breadcrumb className="mb-4" items={[{ title: 'Beranda' }, { title: 'Inventori' }]} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={4} style={{ margin: 0 }}>Inventori</Title>
                <Space>
                    <Button icon={<SwapOutlined />} onClick={() => message.info('Fitur transfer gudang segera hadir')}>Transfer Gudang</Button>
                    <Button icon={<InboxOutlined />} onClick={() => message.info('Fitur penyesuaian stok segera hadir')}>Penyesuaian Stok</Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/products/add')}>Tambah Produk</Button>
                </Space>
            </div>

            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={12} sm={6}><Card bordered={false} style={{ borderRadius: 8 }}><Statistic title="Total Stok" value={totalStock} valueStyle={{ color: '#1890ff' }} suffix="unit" /></Card></Col>
                <Col xs={12} sm={6}><Card bordered={false} style={{ borderRadius: 8 }}><Statistic title="Hampir Habis" value={lowStock} valueStyle={{ color: '#faad14' }} prefix={<WarningOutlined />} /></Card></Col>
                <Col xs={12} sm={6}><Card bordered={false} style={{ borderRadius: 8 }}><Statistic title="Habis" value={outOfStock} valueStyle={{ color: '#ff4d4f' }} /></Card></Col>
                <Col xs={12} sm={6}><Card bordered={false} style={{ borderRadius: 8 }}><Statistic title="Nilai Inventori" value={totalValue} valueStyle={{ color: '#52c41a' }} prefix="Rp" /></Card></Col>
            </Row>

            <Card bordered={false} style={{ borderRadius: 8 }} bodyStyle={{ padding: 0 }}>
                <Tabs activeKey={activeTab} onChange={setActiveTab} style={{ padding: '0 16px' }}
                    items={[
                        { key: 'all', label: `Semua (${products.length})` },
                        { key: 'low', label: `Hampir Habis (${lowStock})` },
                        { key: 'out', label: `Habis (${outOfStock})` },
                    ]}
                />
                <div style={{ padding: '0 16px 12px', display: 'flex', gap: 8 }}>
                    <Input placeholder="Cari produk..." prefix={<SearchOutlined />} style={{ width: 240 }} size="small" />
                    <Button icon={<FilterOutlined />} size="small">Filter</Button>
                </div>
                <Table columns={columns} dataSource={filteredData} rowKey="id" loading={isLoading}
                    rowSelection={{ type: 'checkbox' }} pagination={{ pageSize: 10 }} size="small" />
            </Card>
        </div>
    );
};

export default InventoryPage;
