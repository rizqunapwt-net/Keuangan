import React from 'react';
import { Card, Typography, Breadcrumb, Row, Col, Button, Space, Tag, Tabs } from 'antd';
import {
    DesktopOutlined, AppleOutlined, AndroidOutlined,
    WindowsOutlined, StarOutlined, ShoppingCartOutlined,
    QrcodeOutlined, PrinterOutlined, BarChartOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const downloadLinks = [
    { icon: <WindowsOutlined style={{ fontSize: 32 }} />, platform: 'Windows', version: 'v2.1.0', size: '85 MB' },
    { icon: <AppleOutlined style={{ fontSize: 32 }} />, platform: 'macOS', version: 'v2.1.0', size: '92 MB' },
    { icon: <AndroidOutlined style={{ fontSize: 32 }} />, platform: 'Android', version: 'v3.0.5', size: '45 MB' },
    { icon: <AppleOutlined style={{ fontSize: 32 }} />, platform: 'iOS', version: 'v3.0.5', size: '52 MB' },
];

const posFeatures = [
    { icon: <ShoppingCartOutlined style={{ fontSize: 24, color: '#1890ff' }} />, title: 'Checkout Cepat', desc: 'Proses transaksi dalam hitungan detik' },
    { icon: <QrcodeOutlined style={{ fontSize: 24, color: '#52c41a' }} />, title: 'Barcode Scanner', desc: 'Scan barcode produk dengan kamera' },
    { icon: <PrinterOutlined style={{ fontSize: 24, color: '#722ed1' }} />, title: 'Cetak Struk', desc: 'Support thermal printer 58mm & 80mm' },
    { icon: <StarOutlined style={{ fontSize: 24, color: '#faad14' }} />, title: 'Produk Favorit', desc: 'Akses cepat ke produk yang sering dijual' },
    { icon: <BarChartOutlined style={{ fontSize: 24, color: '#eb2f96' }} />, title: 'Laporan Kasir', desc: 'Ringkasan penjualan per shift/kasir' },
    { icon: <DesktopOutlined style={{ fontSize: 24, color: '#13c2c2' }} />, title: 'Mode Offline', desc: 'Tetap bisa transaksi tanpa internet' },
];

const POSPage: React.FC = () => {
    return (
        <div>
            <Breadcrumb className="mb-4" items={[{ title: 'Beranda' }, { title: 'POS' }]} />

            <Tabs defaultActiveKey="download" items={[
                {
                    key: 'download',
                    label: 'Download Aplikasi',
                    children: (
                        <div>
                            {/* Hero */}
                            <Card bordered={false} style={{ borderRadius: 12, background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)', marginBottom: 24 }}>
                                <Row gutter={24} align="middle">
                                    <Col xs={24} md={14}>
                                        <Tag color="#fff" style={{ color: '#1890ff', fontWeight: 600, marginBottom: 12 }}>Rizquna Elfath POS</Tag>
                                        <Title level={2} style={{ color: '#fff', margin: 0 }}>Point of Sale</Title>
                                        <Paragraph style={{ color: 'rgba(255,255,255,0.85)', fontSize: 15, marginTop: 8 }}>
                                            Aplikasi kasir terintegrasi langsung dengan pembukuan Rizquna Elfath. Download gratis untuk semua platform.
                                        </Paragraph>
                                    </Col>
                                    <Col xs={24} md={10} style={{ textAlign: 'center', padding: 24 }}>
                                        <DesktopOutlined style={{ fontSize: 80, color: '#fff' }} />
                                    </Col>
                                </Row>
                            </Card>

                            {/* Download Cards */}
                            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                                {downloadLinks.map((d) => (
                                    <Col key={d.platform} xs={12} sm={6}>
                                        <Card bordered={false} hoverable style={{ borderRadius: 10, textAlign: 'center' }} bodyStyle={{ padding: 20 }}>
                                            <div style={{ color: '#1890ff', marginBottom: 12 }}>{d.icon}</div>
                                            <Text strong style={{ display: 'block', fontSize: 14 }}>{d.platform}</Text>
                                            <Text type="secondary" style={{ fontSize: 11 }}>{d.version} • {d.size}</Text>
                                            <div style={{ marginTop: 12 }}>
                                                <Button type="primary" block>Download</Button>
                                            </div>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>

                            {/* Features */}
                            <Title level={5}>Fitur POS</Title>
                            <Row gutter={[16, 16]}>
                                {posFeatures.map((f) => (
                                    <Col key={f.title} xs={24} sm={12} md={8}>
                                        <Card bordered={false} style={{ borderRadius: 8 }} bodyStyle={{ padding: 16 }}>
                                            <Space><div>{f.icon}</div><div><Text strong style={{ fontSize: 13 }}>{f.title}</Text><div><Text type="secondary" style={{ fontSize: 11 }}>{f.desc}</Text></div></div></Space>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    ),
                },
                {
                    key: 'favorites',
                    label: 'Produk Favorit',
                    children: (
                        <Card bordered={false} style={{ borderRadius: 8, textAlign: 'center', padding: 48 }}>
                            <StarOutlined style={{ fontSize: 48, color: '#faad14', marginBottom: 16 }} />
                            <Title level={4}>Produk Favorit</Title>
                            <Paragraph type="secondary">
                                Tambahkan produk favorit untuk akses cepat di checkout POS. Produk ini akan muncul di halaman utama aplikasi POS Anda.
                            </Paragraph>
                            <Button type="primary" icon={<StarOutlined />}>Kelola Produk Favorit</Button>
                        </Card>
                    ),
                },
            ]} />
        </div>
    );
};

export default POSPage;
