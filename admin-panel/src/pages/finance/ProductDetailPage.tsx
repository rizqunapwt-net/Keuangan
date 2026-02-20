import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Table, Tag, Typography, Button, Space, Breadcrumb, Row, Col, Descriptions, message, Statistic } from 'antd';
import { ArrowLeftOutlined, EditOutlined, HistoryOutlined, PlusOutlined } from '@ant-design/icons';
import api from '../../api';
import AccessControl from '../../components/AccessControl';

const { Title } = Typography;

interface StockMovement {
    id: number;
    createdAt: string;
    type: string;
    ref: string;
    qty: number;
}

interface ProductDetail {
    id: number;
    name: string;
    sku: string;
    category?: string;
    purchasePrice: number;
    sellPrice: number;
    isTracked: boolean;
    stock: number;
    stockMovements: StockMovement[];
    [key: string]: unknown;
}

const ProductDetailPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState<ProductDetail | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchDetail = async () => {
        try {
            const res = await api.get(`/finance/products/${id}`);
            setProduct(res.data);
        } catch {
            message.error('Gagal mengambil detail produk');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (loading) return <div className="p-10 text-center">Loading...</div>;
    if (!product) return <div className="p-10 text-center text-red-500">Produk tidak ditemukan</div>;

    const historyColumns = [
        { title: 'Tanggal', dataIndex: 'createdAt', key: 'date', render: (d: string) => new Date(d).toLocaleDateString('id-ID') },
        { title: 'Tipe', dataIndex: 'type', key: 'type', render: (t: string) => <Tag color={t === 'in' ? 'green' : 'blue'}>{t.toUpperCase()}</Tag> },
        { title: 'Ref #', dataIndex: 'ref', key: 'ref' },
        { title: 'Qty', dataIndex: 'qty', key: 'qty', align: 'right' as const, render: (v: number) => (v > 0 ? `+${v}` : v) },
    ];

    return (
        <div>
            <Breadcrumb className="mb-4" items={[
                { title: 'Beranda' },
                { title: 'Produk', onClick: () => navigate('/products'), className: 'cursor-pointer' },
                { title: product.name }
            ]} />

            <div className="flex justify-between items-center mb-6">
                <Space>
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
                    <Title level={3} className="!m-0">{product.name}</Title>
                    <Tag color="cyan">{product.sku}</Tag>
                </Space>
                <Space>
                    <AccessControl permission="products_update">
                        <Button icon={<EditOutlined />} onClick={() => navigate(`/products/add?edit=${id}`)}>Edit Produk</Button>
                    </AccessControl>
                    <AccessControl permission="inventory_adjustment">
                        <Button icon={<PlusOutlined />}>Adjustment</Button>
                    </AccessControl>
                </Space>
            </div>

            <Row gutter={[24, 24]}>
                <Col span={8}>
                    <Card title="Informasi Produk" className="shadow-sm rounded-xl mb-6">
                        <Descriptions column={1} size="small">
                            <Descriptions.Item label="SKU">{product.sku}</Descriptions.Item>
                            <Descriptions.Item label="Kategori">{product.category || 'Umum'}</Descriptions.Item>
                            <Descriptions.Item label="Harga Beli">Rp {Number(product.purchasePrice).toLocaleString('id-ID')}</Descriptions.Item>
                            <Descriptions.Item label="Harga Jual">Rp {Number(product.sellPrice).toLocaleString('id-ID')}</Descriptions.Item>
                        </Descriptions>
                        <Descriptions column={1} size="small" className="mt-4">
                            <Descriptions.Item label="Tracked?">
                                <Tag color={product.isTracked ? 'green' : 'red'}>{product.isTracked ? 'Ya' : 'Tidak'}</Tag>
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>

                    <Card className="shadow-sm rounded-xl bg-gray-50 border-none">
                        <Statistic
                            title="Stok Saat Ini"
                            value={product.stock || 0}
                            suffix="Unit"
                            valueStyle={{ color: '#007bff', fontWeight: 'bold' }}
                        />
                    </Card>
                </Col>

                <Col span={16}>
                    <Card title={<span><HistoryOutlined /> Riwayat Stok</span>} className="shadow-sm rounded-xl">
                        <Table
                            columns={historyColumns}
                            dataSource={product.stockMovements || []}
                            rowKey="id"
                            pagination={{ pageSize: 10 }}
                            locale={{ emptyText: 'Tidak ada mutasi stok recorded' }}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ProductDetailPage;
