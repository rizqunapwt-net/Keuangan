import React from 'react';
import { Card, Typography, Row, Col, Breadcrumb, Tag } from 'antd';
import {
    BarChartOutlined, PieChartOutlined, LineChartOutlined,
    FileTextOutlined, TeamOutlined,
    DollarOutlined, InboxOutlined, RightOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

interface ReportItem {
    title: string;
    description: string;
    icon: React.ReactNode;
    route: string;
    tag?: string;
    tagColor?: string;
}

const reportGroups: { title: string; items: ReportItem[] }[] = [
    {
        title: 'Laporan Keuangan',
        items: [
            {
                title: 'Laba Rugi',
                description: 'Ikhtisar pendapatan dan beban untuk periode tertentu',
                icon: <BarChartOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
                route: '/reports/profit-loss',
            },
            {
                title: 'Neraca',
                description: 'Posisi keuangan perusahaan pada tanggal tertentu',
                icon: <PieChartOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
                route: '/reports/balance-sheet',
            },
            {
                title: 'Arus Kas',
                description: 'Arus masuk dan keluar kas pada periode tertentu',
                icon: <LineChartOutlined style={{ fontSize: 24, color: '#722ed1' }} />,
                route: '/reports/cash-flow',
            },
            {
                title: 'Neraca Saldo',
                description: 'Daftar saldo semua akun pada periode tertentu',
                icon: <FileTextOutlined style={{ fontSize: 24, color: '#fa8c16' }} />,
                route: '/reports/trial-balance',
            },
        ],
    },
    {
        title: 'Laporan Buku Besar',
        items: [
            {
                title: 'Buku Besar',
                description: 'Detail transaksi untuk setiap akun',
                icon: <FileTextOutlined style={{ fontSize: 24, color: '#13c2c2' }} />,
                route: '/reports/general-ledger',
            },
            {
                title: 'Jurnal Umum',
                description: 'Seluruh entri jurnal yang telah dibuat',
                icon: <FileTextOutlined style={{ fontSize: 24, color: '#eb2f96' }} />,
                route: '/accounts/journals',
            },
        ],
    },
    {
        title: 'Laporan Penjualan',
        items: [
            {
                title: 'Penjualan per Pelanggan',
                description: 'Ringkasan penjualan berdasarkan pelanggan',
                icon: <TeamOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
                route: '/reports/sales-by-customer',
                tag: 'Segera',
                tagColor: 'orange',
            },
            {
                title: 'Penjualan per Produk',
                description: 'Ringkasan penjualan berdasarkan produk',
                icon: <InboxOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
                route: '/reports/sales-by-product',
                tag: 'Segera',
                tagColor: 'orange',
            },
        ],
    },
    {
        title: 'Laporan Pembelian',
        items: [
            {
                title: 'Pembelian per Vendor',
                description: 'Ringkasan pembelian berdasarkan vendor',
                icon: <TeamOutlined style={{ fontSize: 24, color: '#fa8c16' }} />,
                route: '/reports/purchases-by-vendor',
                tag: 'Segera',
                tagColor: 'orange',
            },
        ],
    },
    {
        title: 'Laporan Lainnya',
        items: [
            {
                title: 'Umur Piutang',
                description: 'Analisis aging piutang pelanggan',
                icon: <DollarOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />,
                route: '/reports/aging-receivable',
                tag: 'Segera',
                tagColor: 'orange',
            },
            {
                title: 'Umur Hutang',
                description: 'Analisis aging hutang ke vendor',
                icon: <DollarOutlined style={{ fontSize: 24, color: '#faad14' }} />,
                route: '/reports/aging-payable',
                tag: 'Segera',
                tagColor: 'orange',
            },
        ],
    },
];

const ReportsIndexPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div>
            <Breadcrumb className="mb-4" items={[{ title: 'Beranda' }, { title: 'Laporan' }]} />
            <Title level={4} style={{ marginBottom: 20 }}>Laporan</Title>

            {reportGroups.map((group) => (
                <div key={group.title} style={{ marginBottom: 24 }}>
                    <Text strong style={{ fontSize: 14, color: '#595959', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {group.title}
                    </Text>
                    <Row gutter={[16, 16]} style={{ marginTop: 12 }}>
                        {group.items.map((item) => (
                            <Col key={item.title} xs={24} sm={12} md={8} lg={6}>
                                <Card
                                    hoverable
                                    bordered={false}
                                    style={{ borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', height: '100%' }}
                                    bodyStyle={{ padding: '20px 16px' }}
                                    onClick={() => navigate(item.route)}
                                >
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                        <div style={{ minWidth: 40, textAlign: 'center' }}>{item.icon}</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                                <Text strong style={{ fontSize: 13 }}>{item.title}</Text>
                                                {item.tag && <Tag color={item.tagColor} style={{ fontSize: 10 }}>{item.tag}</Tag>}
                                            </div>
                                            <Text type="secondary" style={{ fontSize: 11 }}>{item.description}</Text>
                                        </div>
                                        <RightOutlined style={{ color: '#d9d9d9', fontSize: 12 }} />
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            ))}
        </div>
    );
};

export default ReportsIndexPage;
