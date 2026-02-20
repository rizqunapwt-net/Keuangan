import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Space, Typography, Tag, Card, Breadcrumb, message, Statistic, Popconfirm } from 'antd';
import { SearchOutlined, PlusOutlined, FilterOutlined, ExportOutlined, PrinterOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import AccessControl from '../../components/AccessControl';

const { Title, Text } = Typography;

interface Product {
    id: number;
    sku: string;
    name: string;
    purchasePrice: number;
    sellPrice: number;
    isTracked: boolean;
    stock?: number;
    unit?: string;
}

const ProductsPage: React.FC = () => {
    const [data, setData] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await api.get('/finance/products');
            setData(response.data?.data || response.data || []);
        } catch {
            message.error('Gagal mengambil data produk');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/finance/products/${id}`);
            message.success('Produk berhasil dihapus');
            fetchProducts();
        } catch {
            message.error('Gagal menghapus produk');
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Stock summary calculations
    const availableStock = data.filter(p => p.isTracked && (p.stock || 0) > 0).length;
    const lowStock = data.filter(p => p.isTracked && (p.stock || 0) > 0 && (p.stock || 0) <= 5).length;
    const outOfStock = data.filter(p => p.isTracked && (p.stock || 0) <= 0).length;
    const totalStock = data.reduce((s, p) => s + (p.stock || 0), 0);
    const totalValue = data.reduce((s, p) => s + (p.stock || 0) * Number(p.sellPrice), 0);
    const totalHPP = data.reduce((s, p) => s + (p.stock || 0) * Number(p.purchasePrice), 0);

    const summaryCards = [
        { title: 'Produk Stok Tersedia', value: availableStock, suffix: ' Produk', color: '#52c41a' },
        { title: 'Stok Hampir Habis', value: lowStock, suffix: ' Produk', color: '#faad14' },
        { title: 'Stok Habis', value: outOfStock, suffix: ' Produk', color: '#ff4d4f' },
        { title: 'Total Stok', value: totalStock, suffix: ' Unit', color: '#fa8c16' },
        { title: 'Total Nilai Produk', value: totalValue, prefix: 'Rp ', color: '#1890ff' },
        { title: 'Total HPP', value: totalHPP, prefix: 'Rp ', color: '#722ed1' },
    ];

    const columns = [
        {
            title: 'Nama',
            dataIndex: 'name',
            key: 'name',
            sorter: true,
            render: (text: string, record: Product) => (
                <a onClick={() => navigate(`/products/${record.id}`)} style={{ fontWeight: 600, color: '#1890ff' }}>
                    {text}
                </a>
            ),
        },
        {
            title: 'Kode/SKU',
            dataIndex: 'sku',
            key: 'sku',
            sorter: true,
        },
        { title: 'Kategori', key: 'category', render: () => '-' },
        {
            title: 'Satuan',
            dataIndex: 'unit',
            key: 'unit',
            render: (v: string) => v || 'Pcs',
        },
        {
            title: 'Harga Beli',
            dataIndex: 'purchasePrice',
            key: 'purchasePrice',
            align: 'right' as const,
            sorter: true,
            render: (val: number) => `Rp ${Number(val).toLocaleString('id-ID')}`,
        },
        {
            title: 'Harga Jual',
            dataIndex: 'sellPrice',
            key: 'sellPrice',
            align: 'right' as const,
            sorter: true,
            render: (val: number) => `Rp ${Number(val).toLocaleString('id-ID')}`,
        },
        {
            title: 'Qty',
            dataIndex: 'stock',
            key: 'stock',
            align: 'right' as const,
            sorter: true,
            render: (val: number, record: Product) => (
                record.isTracked ? (
                    <Tag color={(val || 0) > 0 ? 'green' : 'red'}>{val || 0}</Tag>
                ) : (
                    <Tag color="default">-</Tag>
                )
            ),
        },
        {
            title: 'HPP',
            key: 'hpp',
            align: 'right' as const,
            sorter: true,
            render: (_: unknown, record: Product) => `Rp ${Number(record.purchasePrice).toLocaleString('id-ID')}`,
        },
        {
            title: 'Aksi',
            key: 'action',
            width: 80,
            align: 'center' as const,
            render: (_: unknown, record: Product) => (
                <Popconfirm
                    title="Hapus produk ini?"
                    description="Data yang sudah dihapus tidak dapat dikembalikan."
                    onConfirm={() => handleDelete(record.id)}
                    okText="Hapus"
                    cancelText="Batal"
                    okButtonProps={{ danger: true }}
                >
                    <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                </Popconfirm>
            ),
        },
    ];

    return (
        <div>
            <Breadcrumb className="mb-4" items={[{ title: 'Beranda' }, { title: 'Produk' }]} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={4} style={{ margin: 0 }}>Produk</Title>
                <Space>
                    <Button icon={<PrinterOutlined />} size="small" onClick={() => message.info('Fitur cetak segera hadir')}>Print</Button>
                    <Button icon={<ExportOutlined />} size="small" onClick={() => message.info('Fitur export segera hadir')}>Export</Button>
                    <AccessControl permission="products_create">
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/products/add')}>
                            Tambah Produk
                        </Button>
                    </AccessControl>
                </Space>
            </div>

            {/* Stock Summary Cards (Scrollable) */}
            <div style={{ overflowX: 'auto', marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 12, minWidth: 'max-content' }}>
                    {summaryCards.map((card, idx) => (
                        <Card
                            key={idx}
                            bordered={false}
                            style={{ borderRadius: 8, minWidth: 160, flex: '0 0 auto' }}
                            bodyStyle={{ padding: 16 }}
                        >
                            <Statistic
                                title={<Text type="secondary" style={{ fontSize: 11 }}>{card.title}</Text>}
                                value={card.value}
                                prefix={card.prefix}
                                suffix={card.suffix}
                                valueStyle={{ fontSize: 18, fontWeight: 700, color: card.color }}
                            />
                        </Card>
                    ))}
                </div>
            </div>

            <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }} bodyStyle={{ padding: 0 }}>
                <div style={{ padding: '12px 16px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Input
                        placeholder="Cari SKU atau Nama Produk..."
                        prefix={<SearchOutlined />}
                        style={{ width: 280 }}
                        size="small"
                    />
                    <Button icon={<FilterOutlined />} size="small">Filter</Button>
                </div>

                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey="id"
                    loading={loading}
                    rowSelection={{ type: 'checkbox' }}
                    pagination={{ pageSize: 10, showSizeChanger: true }}
                    size="small"
                />
            </Card>
        </div>
    );
};

export default ProductsPage;
