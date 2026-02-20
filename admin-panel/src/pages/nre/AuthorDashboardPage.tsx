import React, { useState, useEffect } from 'react';
import {
    Card,
    Typography,
    Table,
    Tag,
    Row,
    Col,
    Statistic,
    Tabs,
    Descriptions,
    Button,
    Alert,
    Divider,
    Spin,
} from 'antd';
import {
    BookOutlined,
    FileTextOutlined,
    DollarOutlined,
    BarChartOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    EyeOutlined,
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

// API helper
const API_BASE = '/api/v1';

const fetchWithAuth = async (url: string) => {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
    };

    const response = await fetch(`${API_BASE}${url}`, { headers });
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Request failed');
    }

    return data;
};

const AuthorDashboardPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [books, setBooks] = useState<any[]>([]);
    const [contracts, setContracts] = useState<any[]>([]);
    const [royalties, setRoyalties] = useState<any[]>([]);
    const [sales, setSales] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [selectedRoyalty, setSelectedRoyalty] = useState<any>(null);
    const [showRoyaltyDetail, setShowRoyaltyDetail] = useState(false);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        setLoading(true);
        try {
            const [dashboard, booksData, contractsData, royaltiesData, salesData] = await Promise.all([
                fetchWithAuth('/author/dashboard'),
                fetchWithAuth('/author/books?per_page=5'),
                fetchWithAuth('/author/contracts?per_page=5'),
                fetchWithAuth('/author/royalties?per_page=5'),
                fetchWithAuth('/author/sales?per_page=5'),
            ]);

            setDashboardData(dashboard.data);
            setBooks(booksData.data || []);
            setContracts(contractsData.data || []);
            setRoyalties(royaltiesData.data || []);
            setSales(salesData.data || []);
        } catch (error: any) {
            console.error('Failed to fetch dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRoyaltyReport = async (royaltyId: number) => {
        try {
            const data = await fetchWithAuth(`/author/royalties/${royaltyId}/report`);
            setSelectedRoyalty(data.data);
            setShowRoyaltyDetail(true);
        } catch (error: any) {
            console.error('Failed to fetch royalty report:', error);
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            // Contract
            pending: 'orange',
            approved: 'green',
            rejected: 'red',
            expired: 'default',
            // Book
            published: 'green',
            production: 'blue',
            draft: 'default',
            calculated: 'blue',
            paid: 'green',
        };
        return colors[status] || 'default';
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            pending: 'Pending',
            approved: 'Disetujui',
            rejected: 'Ditolak',
            expired: 'Kadaluarsa',
            published: 'Terbit',
            production: 'Dalam Produksi',
            draft: 'Draft',
            calculated: 'Dihitung',
            paid: 'Dibayar',
        };
        return labels[status] || status;
    };

    const formatCurrency = (value: number) => {
        return `Rp ${value?.toLocaleString('id-ID')}`;
    };

    const bookColumns = [
        {
            title: 'Judul Buku',
            dataIndex: 'title',
            key: 'title',
            ellipsis: true,
        },
        {
            title: 'ISBN',
            dataIndex: 'isbn',
            key: 'isbn',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={getStatusColor(status)}>{getStatusLabel(status)}</Tag>
            ),
        },
        {
            title: 'Harga',
            dataIndex: 'price',
            key: 'price',
            render: (value: number) => formatCurrency(value),
        },
        {
            title: 'Stock',
            dataIndex: 'stock',
            key: 'stock',
            align: 'right' as const,
        },
    ];

    const contractColumns = [
        {
            title: 'Judul Buku',
            dataIndex: ['book', 'title'],
            key: 'book_title',
            ellipsis: true,
        },
        {
            title: 'Marketplace',
            dataIndex: ['marketplace', 'name'],
            key: 'marketplace_name',
        },
        {
            title: 'Royalti',
            dataIndex: 'royalty_percentage',
            key: 'royalty_percentage',
            render: (value: number) => `${value}%`,
        },
        {
            title: 'Periode',
            key: 'period',
            render: (_: any, record: any) => (
                `${record.start_date?.substring(0, 10)} - ${record.end_date?.substring(0, 10)}`
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={getStatusColor(status)}>{getStatusLabel(status)}</Tag>
            ),
        },
    ];

    const royaltyColumns = [
        {
            title: 'Buku',
            dataIndex: ['book', 'title'],
            key: 'book_title',
            ellipsis: true,
        },
        {
            title: 'Periode',
            dataIndex: 'period_month',
            key: 'period_month',
        },
        {
            title: 'Total Penjualan',
            dataIndex: 'total_sales',
            key: 'total_sales',
            align: 'right' as const,
        },
        {
            title: 'Royalti',
            dataIndex: 'total_royalty',
            key: 'total_royalty',
            align: 'right' as const,
            render: (value: number) => formatCurrency(value),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={getStatusColor(status)}>{getStatusLabel(status)}</Tag>
            ),
        },
        {
            title: 'Aksi',
            key: 'actions',
            render: (_: any, record: any) => (
                <Button
                    type="link"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => fetchRoyaltyReport(record.id)}
                >
                    Detail
                </Button>
            ),
        },
    ];

    const salesColumns = [
        {
            title: 'Buku',
            dataIndex: ['book', 'title'],
            key: 'book_title',
            ellipsis: true,
        },
        {
            title: 'Marketplace',
            dataIndex: ['marketplace', 'name'],
            key: 'marketplace_name',
        },
        {
            title: 'Periode',
            dataIndex: 'period_month',
            key: 'period_month',
        },
        {
            title: 'Jumlah',
            dataIndex: 'quantity',
            key: 'quantity',
            align: 'right' as const,
        },
        {
            title: 'Harga',
            dataIndex: 'net_price',
            key: 'net_price',
            align: 'right' as const,
            render: (value: number) => formatCurrency(value),
        },
        {
            title: 'Total',
            key: 'total',
            align: 'right' as const,
            render: (_: any, record: any) =>
                formatCurrency(record.quantity * record.net_price),
        },
    ];

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Spin size="large" tip="Memuat data penulis..." />
            </div>
        );
    }

    const stats = dashboardData?.statistics || {};

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <Title level={4}>
                    <BookOutlined /> Portal Penulis
                </Title>
                <Paragraph type="secondary">
                    Dashboard transparansi untuk penulis - Pantau buku, kontrak, dan royalti Anda
                </Paragraph>
            </div>

            {/* Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Buku"
                            value={stats.total_books || 0}
                            prefix={<BookOutlined />}
                        />
                        <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                            <CheckCircleOutlined style={{ color: '#52c41a' }} />{' '}
                            {stats.published_books || 0} Terbit |{' '}
                            <ClockCircleOutlined style={{ color: '#1890ff' }} />{' '}
                            {stats.in_production_books || 0} Dalam Produksi
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Kontrak Aktif"
                            value={stats.active_contracts || 0}
                            prefix={<FileTextOutlined />}
                        />
                        <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                            Menunggu: {stats.pending_contracts || 0}
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Royalti"
                            value={stats.total_royalties || 0}
                            prefix={<DollarOutlined />}
                            precision={0}
                        />
                        <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                            Dibayar: {formatCurrency(stats.paid_royalties || 0)} |{' '}
                            Pending: {formatCurrency(stats.pending_royalties || 0)}
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Penjualan Bulan Ini"
                            value={stats.monthly_sales || 0}
                            suffix="buku"
                            prefix={<BarChartOutlined />}
                        />
                        <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                            Revenue: {formatCurrency(stats.monthly_revenue || 0)}
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Tabs */}
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
                <TabPane
                    tab={
                        <span>
                            <BookOutlined />
                            Buku Saya
                        </span>
                    }
                    key="books"
                >
                    <Card title="Daftar Buku Anda">
                        <Table
                            columns={bookColumns}
                            dataSource={books}
                            rowKey="id"
                            pagination={false}
                            scroll={{ x: 800 }}
                        />
                        {books.length === 0 && (
                            <Alert
                                message="Belum ada buku"
                                description="Anda belum memiliki buku yang terdaftar."
                                type="info"
                                showIcon
                            />
                        )}
                    </Card>
                </TabPane>

                <TabPane
                    tab={
                        <span>
                            <FileTextOutlined />
                            Kontrak
                        </span>
                    }
                    key="contracts"
                >
                    <Card title="Kontrak Penjualan">
                        <Alert
                            message="Transparansi Kontrak"
                            description="Semua kontrak yang Anda tandatangani akan terlihat di sini. Anda dapat melihat status, periode, dan persentase royalti untuk setiap buku."
                            type="info"
                            showIcon
                            style={{ marginBottom: 16 }}
                        />
                        <Table
                            columns={contractColumns}
                            dataSource={contracts}
                            rowKey="id"
                            pagination={false}
                            scroll={{ x: 1000 }}
                        />
                        {contracts.length === 0 && (
                            <Alert
                                message="Belum ada kontrak"
                                description="Anda belum memiliki kontrak yang aktif."
                                type="info"
                                showIcon
                            />
                        )}
                    </Card>
                </TabPane>

                <TabPane
                    tab={
                        <span>
                            <DollarOutlined />
                            Royalti
                        </span>
                    }
                    key="royalties"
                >
                    <Card title="Laporan Royalti">
                        <Alert
                            message="Transparansi Royalti"
                            description="Setiap perhitungan royalti dapat dilihat detailnya, termasuk breakdown penjualan per marketplace dan cara perhitungannya."
                            type="success"
                            showIcon
                            style={{ marginBottom: 16 }}
                        />
                        <Table
                            columns={royaltyColumns}
                            dataSource={royalties}
                            rowKey="id"
                            pagination={false}
                            scroll={{ x: 1000 }}
                        />
                        {royalties.length === 0 && (
                            <Alert
                                message="Belum ada royalti"
                                description="Belum ada perhitungan royalti untuk buku-buku Anda."
                                type="info"
                                showIcon
                            />
                        )}
                    </Card>
                </TabPane>

                <TabPane
                    tab={
                        <span>
                            <BarChartOutlined />
                            Penjualan (Transparansi)
                        </span>
                    }
                    key="sales"
                >
                    <Card title="Data Penjualan - Transparansi">
                        <Alert
                            message="Data Real-time"
                            description="Ini adalah data penjualan real-time dari semua marketplace untuk buku-buku Anda. Data ini digunakan untuk menghitung royalti."
                            type="success"
                            showIcon
                            style={{ marginBottom: 16 }}
                        />
                        <Table
                            columns={salesColumns}
                            dataSource={sales}
                            rowKey="id"
                            pagination={false}
                            scroll={{ x: 1000 }}
                        />
                        {sales.length === 0 && (
                            <Alert
                                message="Belum ada penjualan"
                                description="Belum ada data penjualan untuk bulan ini."
                                type="info"
                                showIcon
                            />
                        )}
                    </Card>
                </TabPane>
            </Tabs>

            {/* Royalty Detail Modal */}
            {showRoyaltyDetail && selectedRoyalty && (
                <Card
                    title="Detail Perhitungan Royalti"
                    style={{ marginTop: 24 }}
                    extra={
                        <Button onClick={() => setShowRoyaltyDetail(false)}>Tutup</Button>
                    }
                >
                    <Descriptions column={2} bordered>
                        <Descriptions.Item label="Buku">
                            {selectedRoyalty.royalty?.book?.title}
                        </Descriptions.Item>
                        <Descriptions.Item label="Periode">
                            {selectedRoyalty.royalty?.period_month}
                        </Descriptions.Item>
                        <Descriptions.Item label="Total Penjualan">
                            {selectedRoyalty.breakdown?.total_sales} buku
                        </Descriptions.Item>
                        <Descriptions.Item label="Total Revenue">
                            {formatCurrency(selectedRoyalty.breakdown?.total_revenue || 0)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Royalti Rate">
                            {selectedRoyalty.breakdown?.royalty_rate}%
                        </Descriptions.Item>
                        <Descriptions.Item label="Platform Fee">
                            {formatCurrency(selectedRoyalty.breakdown?.platform_fee || 0)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Royalti Kotor">
                            {formatCurrency(selectedRoyalty.breakdown?.calculated_royalty || 0)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Royalti Bersih" span={2}>
                            <Text strong style={{ fontSize: 16, color: '#52c41a' }}>
                                {formatCurrency(selectedRoyalty.breakdown?.net_royalty || 0)}
                            </Text>
                        </Descriptions.Item>
                    </Descriptions>

                    <Divider />

                    <Title level={5}>Breakdown per Marketplace</Title>
                    <Table
                        dataSource={selectedRoyalty.sales_breakdown}
                        rowKey={(record) => record.marketplace}
                        pagination={false}
                        size="small"
                    >
                        <Table.Column title="Marketplace" dataIndex="marketplace" />
                        <Table.Column
                            title="Quantity"
                            dataIndex="quantity"
                            align="right"
                        />
                        <Table.Column
                            title="Harga Satuan"
                            dataIndex="net_price"
                            align="right"
                            render={(value: number) => formatCurrency(value)}
                        />
                        <Table.Column
                            title="Subtotal"
                            key="subtotal"
                            align="right"
                            render={(_: any, record: any) =>
                                formatCurrency(record.subtotal)
                            }
                        />
                    </Table>
                </Card>
            )}
        </div>
    );
};

export default AuthorDashboardPage;
